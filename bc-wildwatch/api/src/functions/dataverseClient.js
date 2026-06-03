/**
 * dataverseClient.js — Shared Dataverse utility
 *
 * Uses the Client Credentials (app-only) flow.
 * Requires these SWA app settings:
 *   AAD_CLIENT_ID      — App Registration client ID
 *   AAD_CLIENT_SECRET  — App Registration client secret
 *   AAD_TENANT_ID      — Your Entra tenant ID (GUID)
 *   DATAVERSE_URL      — e.g. https://orgXXXXXXXX.crm4.dynamics.com
 *
 * The App Registration must be added as an Application User in
 * Power Platform Admin → Environments → [your env] → S2S users,
 * with an appropriate security role (e.g. BCWildWatch Service Account).
 */

'use strict';

let _tokenCache = null; // { token, expiresAt }

/**
 * Acquire (or return cached) Dataverse access token using client credentials.
 * @returns {Promise<string>} Bearer token
 */
async function getDataverseToken() {
  const now = Date.now();
  if (_tokenCache && _tokenCache.expiresAt > now + 60_000) {
    return _tokenCache.token; // reuse if more than 60 s remaining
  }

  const tenantId  = process.env.AAD_TENANT_ID;
  const clientId  = process.env.AAD_CLIENT_ID;
  const secret    = process.env.AAD_CLIENT_SECRET;
  const dvUrl     = process.env.DATAVERSE_URL?.replace(/\/$/, '');

  if (!tenantId || !clientId || !secret || !dvUrl) {
    throw new Error(
      'Missing required env vars: AAD_TENANT_ID, AAD_CLIENT_ID, AAD_CLIENT_SECRET, DATAVERSE_URL'
    );
  }

  const body = new URLSearchParams({
    grant_type:    'client_credentials',
    client_id:     clientId,
    client_secret: secret,
    scope:         `${dvUrl}/.default`,
  });

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    body.toString(),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Token request failed (${res.status}): ${errText}`);
  }

  const json = await res.json();
  _tokenCache = {
    token:     json.access_token,
    expiresAt: now + (json.expires_in ?? 3600) * 1000,
  };
  return _tokenCache.token;
}

/**
 * Make an authenticated request to the Dataverse Web API.
 * @param {string} method     HTTP method
 * @param {string} path       Relative path, e.g. '/api/data/v9.2/bcw_users'
 * @param {object} [body]     JSON body (for POST/PATCH)
 * @param {object} [extra]    Extra fetch options / headers
 * @returns {Promise<object>} Parsed JSON response (or null for 204 No Content)
 */
async function dvRequest(method, path, body = null, extra = {}) {
  const dvUrl = process.env.DATAVERSE_URL?.replace(/\/$/, '');
  const token = await getDataverseToken();

  const headers = {
    'Authorization':   `Bearer ${token}`,
    'OData-MaxVersion': '4.0',
    'OData-Version':    '4.0',
    'Accept':           'application/json',
    ...extra.headers,
  };

  if (body !== null) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${dvUrl}${path}`, {
    method,
    headers,
    body: body !== null ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null; // No Content — typical for POST without Prefer

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { _raw: text }; }

  if (!res.ok) {
    const errDetail = json?.error?.message ?? text;
    throw new Error(`Dataverse ${method} ${path} → ${res.status}: ${errDetail}`);
  }

  return json;
}

// ── bcw_user helpers ──────────────────────────────────────────────────────────

/**
 * Find a bcw_user row by email address.
 * TODO: Verify that the email column logical name is correct for your environment.
 * @returns {string|null} Dataverse GUID of the user, or null if not found
 */
async function findUserByEmail(email) {
  const encoded = encodeURIComponent(`bcw_email eq '${email.replace(/'/g, "''")}'`);
  const result  = await dvRequest(
    'GET',
    `/api/data/v9.2/bcw_users?$filter=${encoded}&$select=bcw_userid&$top=1`
  );
  return result?.value?.[0]?.bcw_userid ?? null;
}

/**
 * Create a new bcw_user row.
 * TODO: Verify column logical names (bcw_email, bcw_name) for your table.
 * @returns {string} New user GUID
 */
async function createUser(email, displayName) {
  const result = await dvRequest(
    'POST',
    '/api/data/v9.2/bcw_users',
    { bcw_email: email, bcw_name: displayName },
    { headers: { Prefer: 'return=representation' } }
  );
  return result.bcw_userid;
}

/**
 * Lazy-upsert: return existing user GUID or create and return new one.
 * @returns {Promise<string>} User GUID
 */
async function upsertUser(email, displayName) {
  const existing = await findUserByEmail(email);
  if (existing) return existing;
  return createUser(email, displayName);
}

// ── bcw_animal helpers ────────────────────────────────────────────────────────

/**
 * Fetch all animals from bcw_animal table.
 * Returns array of { id, name }.
 */
async function getAnimals() {
  const result = await dvRequest(
    'GET',
    '/api/data/v9.2/bcw_animals?$select=bcw_animalid,bcw_name&$orderby=bcw_name asc'
  );
  return (result?.value ?? []).map(a => ({
    id:   a.bcw_animalid,
    name: a.bcw_name,
  }));
}

// ── bcw_report helpers ────────────────────────────────────────────────────────

/**
 * Create a new bcw_report row.
 *
 * Field name notes (verify against your actual Dataverse schema):
 *   bcw_addressdescription  — Address / location text
 *   bcw_description         — Incident description text (TODO: confirm if field exists on bcw_report)
 *   bcw_latitude            — Decimal latitude
 *   bcw_longitude           — Decimal longitude
 *   bcw_animal@odata.bind   — Lookup to bcw_animal
 *   bcw_reporter@odata.bind — Lookup to bcw_user
 *
 * @returns {string} New report GUID
 */
async function createReport({ userId, animalId, addressDescription, description, latitude, longitude }) {
  const body = {
    bcw_addressdescription: addressDescription,
    // TODO: confirm the logical name of the incident description field on bcw_report.
    //       If it is different from 'bcw_description', update the key below.
    bcw_description:        description,
    'bcw_reporter@odata.bind': `/bcw_users(${userId})`,
  };

  // Only include animal lookup if a real Dataverse ID was selected (not 'OTHER')
  if (animalId && animalId !== 'OTHER') {
    body['bcw_animal@odata.bind'] = `/bcw_animals(${animalId})`;
  }

  // Only include coordinates if captured
  if (latitude  !== null && latitude  !== undefined) body.bcw_latitude  = latitude;
  if (longitude !== null && longitude !== undefined) body.bcw_longitude = longitude;

  const result = await dvRequest(
    'POST',
    '/api/data/v9.2/bcw_reports',
    body,
    { headers: { Prefer: 'return=representation' } }
  );
  return result.bcw_reportid;
}

module.exports = { upsertUser, getAnimals, createReport };
