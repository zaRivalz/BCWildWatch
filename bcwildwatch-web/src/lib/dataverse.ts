// src/lib/dataverse.ts
import 'server-only';
import { cache } from 'react';
import { requireEnv, ADMIN_EMAILS } from '@/lib/env';
import { emailFilter, mapAnimal, mapReportRow, dataverseOrigin, isGuid, type Animal, type ReportRow } from '@/lib/dataverse.helpers';
import { DEFAULT_STATUS_VALUE, type ReportStatusValue } from '@/lib/reportStatus';
import { DEFAULT_ROLE_VALUE, USER_ROLES, isValidRoleValue, type RoleValue } from '@/lib/roles';
import { attachMediaToReports, type MediaRow } from '@/lib/media';

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) return tokenCache.token;
  const tenant = requireEnv('AAD_TENANT_ID');
  const dv = dataverseOrigin(requireEnv('DATAVERSE_URL'));
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: requireEnv('AAD_CLIENT_ID'),
    client_secret: requireEnv('AAD_CLIENT_SECRET'),
    scope: `${dv}/.default`,
  });
  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString(),
  });
  if (!res.ok) throw new Error(`Dataverse token failed (${res.status}): ${await res.text()}`);
  const json = await res.json();
  tokenCache = { token: json.access_token, expiresAt: now + (json.expires_in ?? 3600) * 1000 };
  return tokenCache.token;
}

async function dv(method: string, path: string, body?: unknown, extraHeaders?: Record<string, string>) {
  const base = dataverseOrigin(requireEnv('DATAVERSE_URL'));
  const token = await getToken();
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'OData-MaxVersion': '4.0', 'OData-Version': '4.0', Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...extraHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`Dataverse ${method} ${path} -> ${res.status}: ${json?.error?.message ?? text}`);
  return json;
}

export async function getAnimals(): Promise<Animal[]> {
  const r = await dv('GET', '/api/data/v9.2/bcw_animals?$select=bcw_animalid,bcw_name&$orderby=bcw_name asc');
  return (r?.value ?? []).map(mapAnimal);
}

export async function upsertUser(email: string, name: string): Promise<string> {
  const filter = encodeURIComponent(emailFilter(email));
  const found = await dv('GET', `/api/data/v9.2/bcw_users?$filter=${filter}&$select=bcw_userid&$top=1`);
  const existing = found?.value?.[0]?.bcw_userid;
  if (existing) return existing; // never overwrite an existing user's role
  const created = await dv('POST', '/api/data/v9.2/bcw_users',
    { bcw_email: email, bcw_name: name, bcw_role: DEFAULT_ROLE_VALUE },
    { Prefer: 'return=representation' });
  return created.bcw_userid;
}

/** Reads the user's `bcw_role` Choice value, defaulting to Student if absent. */
export const getUserRole = cache(async (email: string): Promise<RoleValue> => {
  const filter = encodeURIComponent(emailFilter(email));
  const found = await dv('GET',
    `/api/data/v9.2/bcw_users?$filter=${filter}&$select=bcw_role&$top=1`);
  const role = found?.value?.[0]?.bcw_role;
  return isValidRoleValue(role) ? role : DEFAULT_ROLE_VALUE;
});

/**
 * Effective role for access checks. Emails in ADMIN_EMAILS are always treated as
 * Admin (a bootstrap so the team can't be locked out of the admin panel before
 * any role is assigned in Dataverse).
 */
export const getEffectiveRole = cache(async (email: string | null | undefined): Promise<RoleValue> => {
  if (!email) return DEFAULT_ROLE_VALUE;
  if (ADMIN_EMAILS.includes(email.toLowerCase())) return USER_ROLES.Admin;
  try {
    return await getUserRole(email);
  } catch {
    return DEFAULT_ROLE_VALUE;
  }
});

export interface NewReport {
  userId: string; animalId: string | null;
  campus: string;
  addressDescription: string; description: string;
  latitude: number | null; longitude: number | null;
}
export async function createReport(r: NewReport): Promise<string> {
  const body: Record<string, unknown> = {
    bcw_location: r.campus,
    bcw_addressdescription: r.addressDescription,
    bcw_description: r.description,
    bcw_status: DEFAULT_STATUS_VALUE,
    'bcw_Reporter@odata.bind': `/bcw_users(${r.userId})`,
  };
  if (r.animalId) body['bcw_Animal@odata.bind'] = `/bcw_animals(${r.animalId})`;
  if (r.latitude != null) body.bcw_latitude = String(r.latitude);
  if (r.longitude != null) body.bcw_longitude = String(r.longitude);
  const created = await dv('POST', '/api/data/v9.2/bcw_reports', body, { Prefer: 'return=representation' });
  return created.bcw_reportid;
}

export async function linkMedia(reportId: string, url: string, filename?: string): Promise<void> {
  await dv('POST', '/api/data/v9.2/bcw_medias', {
    bcw_fileurl: url,
    ...(filename ? { bcw_filename: filename } : {}),
    'bcw_LinkedReport@odata.bind': `/bcw_reports(${reportId})`,
  });
}

export async function getRecentReports(top = 10) {
  const r = await dv('GET',
    `/api/data/v9.2/bcw_reports?$select=bcw_reportid,bcw_addressdescription,createdon&$orderby=createdon desc&$top=${top}&$expand=bcw_Animal($select=bcw_name)`);
  return (r?.value ?? []).map((row: { bcw_reportid: string; bcw_addressdescription: string; createdon: string; bcw_Animal?: { bcw_name: string } }) => ({
    id: row.bcw_reportid,
    address: row.bcw_addressdescription,
    createdOn: row.createdon,
    animal: row.bcw_Animal?.bcw_name ?? 'Unknown',
  }));
}

export async function getMyReports(email: string): Promise<ReportRow[]> {
  const filter = encodeURIComponent(emailFilter(email));
  const found = await dv('GET', `/api/data/v9.2/bcw_users?$filter=${filter}&$select=bcw_userid&$top=1`);
  const userId = found?.value?.[0]?.bcw_userid;
  if (!isGuid(userId)) return [];
  const r = await dv('GET',
    `/api/data/v9.2/bcw_reports?$filter=_bcw_reporter_value eq ${userId}` +
    `&$select=bcw_reportid,bcw_location,bcw_addressdescription,bcw_description,bcw_status,createdon` +
    `&$orderby=createdon desc&$expand=bcw_Animal($select=bcw_name)`);
  const reports = (r?.value ?? []).map(mapReportRow);
  return withMedia(reports);
}

export async function getAllReports(top = 100): Promise<ReportRow[]> {
  const r = await dv('GET',
    `/api/data/v9.2/bcw_reports?$select=bcw_reportid,bcw_location,bcw_addressdescription,bcw_description,bcw_status,createdon` +
    `&$orderby=createdon desc&$top=${top}` +
    `&$expand=bcw_Animal($select=bcw_name),bcw_Reporter($select=bcw_email)`);
  const reports = (r?.value ?? []).map(mapReportRow);
  return withMedia(reports);
}

/** Attaches the first linked photo (if any) to each report. */
async function withMedia(reports: ReportRow[]): Promise<ReportRow[]> {
  if (reports.length === 0) return reports;
  try {
    const media = await getMediaForReports(reports.map((r) => r.id));
    return attachMediaToReports(reports, media);
  } catch {
    return reports; // a media lookup failure must not break the report list
  }
}

/** Fetches photo records (bcw_medias) linked to the given report ids. */
export async function getMediaForReports(reportIds: string[]): Promise<MediaRow[]> {
  const ids = reportIds.filter(isGuid);
  if (ids.length === 0) return [];
  const filter = ids.map((id) => `_bcw_linkedreport_value eq ${id}`).join(' or ');
  const r = await dv('GET',
    `/api/data/v9.2/bcw_medias?$select=bcw_mediaid,bcw_filename,_bcw_linkedreport_value` +
    `&$filter=${encodeURIComponent(filter)}`);
  return (r?.value ?? []).map((row: {
    bcw_mediaid: string; bcw_filename?: string | null; _bcw_linkedreport_value: string;
  }): MediaRow => ({
    mediaId: row.bcw_mediaid,
    reportId: row._bcw_linkedreport_value,
    filename: row.bcw_filename ?? undefined,
  }));
}

/** Returns a single photo's SharePoint URL + filename, or null if not found. */
export async function getMediaFileUrl(mediaId: string): Promise<{ fileUrl: string; filename?: string } | null> {
  if (!isGuid(mediaId)) return null;
  const r = await dv('GET',
    `/api/data/v9.2/bcw_medias(${mediaId})?$select=bcw_fileurl,bcw_filename`);
  const fileUrl = r?.bcw_fileurl;
  if (typeof fileUrl !== 'string' || !fileUrl) return null;
  return { fileUrl, filename: r?.bcw_filename ?? undefined };
}

export async function updateReportStatus(reportId: string, status: ReportStatusValue): Promise<void> {
  await dv('PATCH', `/api/data/v9.2/bcw_reports(${reportId})`, { bcw_status: status });
}

/**
 * Deletes a report and its linked media records. The underlying SharePoint files
 * are left in place (we only remove the Dataverse rows that reference them).
 */
export async function deleteReport(reportId: string): Promise<void> {
  if (!isGuid(reportId)) throw new Error('Invalid report id');
  // Remove linked media rows first so they don't dangle after the report is gone.
  try {
    const media = await getMediaForReports([reportId]);
    await Promise.all(
      media
        .filter((m) => isGuid(m.mediaId))
        .map((m) => dv('DELETE', `/api/data/v9.2/bcw_medias(${m.mediaId})`)),
    );
  } catch {
    // A media cleanup failure must not block deleting the report itself.
  }
  await dv('DELETE', `/api/data/v9.2/bcw_reports(${reportId})`);
}
