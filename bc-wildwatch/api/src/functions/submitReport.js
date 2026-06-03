/**
 * POST /api/submit-report
 *
 * Execution order (per specification):
 *   1. Parse user identity from x-ms-client-principal (SWA auth header)
 *   2. Acquire Dataverse token (client credentials / service principal)
 *   3. Lazy-upsert bcw_user: query by email → create if not found
 *   4. Create bcw_report row with all incident fields + lookup bindings
 *   5. If a file was attached → POST to Power Automate HTTP trigger
 *   6. Return { success: true, reportId }
 *
 * Expected request body (JSON):
 * {
 *   animalId:           string   (Dataverse GUID or 'OTHER')
 *   animalName:         string
 *   addressDescription: string   (required)
 *   description:        string   (required)
 *   latitude:           number | null
 *   longitude:          number | null
 *   fileName:           string | null
 *   fileContent:        string | null  (base64-encoded file bytes)
 *   fileMimeType:       string | null
 * }
 *
 * Required SWA app settings:
 *   AAD_CLIENT_ID            — App Registration client ID
 *   AAD_CLIENT_SECRET        — App Registration client secret
 *   AAD_TENANT_ID            — Entra tenant GUID
 *   DATAVERSE_URL            — https://orgXXXXXXXX.crm4.dynamics.com
 *   POWER_AUTOMATE_MEDIA_URL — Power Automate HTTP trigger URL (keep secret!)
 */

'use strict';

const { app }                         = require('@azure/functions');
const { upsertUser, createReport }    = require('./dataverseClient');
const { parsePrincipal }              = require('./getMe');

const MAX_BODY_BYTES = 12 * 1024 * 1024; // 12 MB guard

app.http('submit-report', {
  methods:   ['POST'],
  authLevel: 'anonymous', // Auth enforced by staticwebapp.config.json routing rules
  route:     'submit-report',
  handler:   async (req, ctx) => {
    ctx.log('submit-report invoked');

    // ── 1. Parse authenticated user from SWA header ───────────────────────────
    const principal = parsePrincipal(req.headers.get('x-ms-client-principal'));
    if (!principal?.email) {
      return jsonResponse(401, { error: 'Authentication required.' });
    }

    // Tenant guard: belt-and-suspenders beyond staticwebapp.config.json
    if (!principal.email.toLowerCase().endsWith('@belgiumcampus.ac.za')) {
      ctx.log.warn(`Blocked non-campus user: ${principal.email}`);
      return jsonResponse(403, { error: 'Access restricted to Belgium Campus accounts.' });
    }

    // ── 2. Parse and validate request body ────────────────────────────────────
    let payload;
    try {
      const raw = await req.text();
      if (raw.length > MAX_BODY_BYTES) {
        return jsonResponse(413, { error: 'Request body too large.' });
      }
      payload = JSON.parse(raw);
    } catch {
      return jsonResponse(400, { error: 'Invalid JSON body.' });
    }

    const {
      animalId,
      animalName,
      addressDescription,
      description,
      latitude,
      longitude,
      fileName,
      fileContent,
      fileMimeType,
    } = payload;

    if (!addressDescription?.trim()) {
      return jsonResponse(400, { error: 'addressDescription is required.' });
    }
    if (!description?.trim()) {
      return jsonResponse(400, { error: 'description is required.' });
    }

    // ── 3. Lazy-upsert bcw_user ───────────────────────────────────────────────
    let userId;
    try {
      ctx.log(`Upserting user: ${principal.email}`);
      userId = await upsertUser(principal.email, principal.name ?? principal.email);
      ctx.log(`User GUID: ${userId}`);
    } catch (err) {
      ctx.log.error('upsertUser failed:', err.message);
      return jsonResponse(502, { error: 'Failed to register user in the system. Please try again.' });
    }

    // ── 4. Create bcw_report row ──────────────────────────────────────────────
    let reportId;
    try {
      ctx.log('Creating bcw_report…');
      reportId = await createReport({
        userId,
        animalId:           animalId ?? null,
        addressDescription: addressDescription.trim(),
        description:        description.trim(),
        latitude:           typeof latitude  === 'number' ? latitude  : null,
        longitude:          typeof longitude === 'number' ? longitude : null,
      });
      ctx.log(`Report created: ${reportId}`);
    } catch (err) {
      ctx.log.error('createReport failed:', err.message);
      return jsonResponse(502, { error: 'Failed to create the incident report. Please try again.' });
    }

    // ── 5. Optional: trigger Power Automate media flow ────────────────────────
    if (fileName && fileContent) {
      const webhookUrl = process.env.POWER_AUTOMATE_MEDIA_URL;
      if (!webhookUrl) {
        ctx.log.warn('POWER_AUTOMATE_MEDIA_URL not set — skipping file upload.');
      } else {
        try {
          ctx.log(`Triggering media flow for file: ${fileName}`);
          const mediaRes = await fetch(webhookUrl, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
              fileName,
              fileContent,      // base64-encoded bytes
              reportId,
              fileMimeType: fileMimeType ?? 'application/octet-stream',
              submittedBy:  principal.email,
            }),
          });

          if (!mediaRes.ok) {
            const errText = await mediaRes.text();
            ctx.log.warn(`Media flow responded ${mediaRes.status}: ${errText}`);
            // Non-fatal: report was already saved; log the failure and continue.
          } else {
            ctx.log('Media flow triggered successfully.');
          }
        } catch (err) {
          // Also non-fatal — the report is committed; media can be retried.
          ctx.log.warn('Media flow fetch threw:', err.message);
        }
      }
    }

    // ── 6. Return success ─────────────────────────────────────────────────────
    return jsonResponse(200, { success: true, reportId });
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function jsonResponse(status, body) {
  return {
    status,
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  };
}
