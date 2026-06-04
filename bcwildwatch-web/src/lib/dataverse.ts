// src/lib/dataverse.ts
import 'server-only';
import { requireEnv } from '@/lib/env';
import { emailFilter, mapAnimal, mapReportRow, dataverseOrigin, isGuid, type Animal, type ReportRow } from '@/lib/dataverse.helpers';
import { DEFAULT_STATUS, type ReportStatus } from '@/lib/reportStatus';

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
  if (existing) return existing;
  const created = await dv('POST', '/api/data/v9.2/bcw_users',
    { bcw_email: email, bcw_name: name }, { Prefer: 'return=representation' });
  return created.bcw_userid;
}

export interface NewReport {
  userId: string; animalId: string | null;
  addressDescription: string; description: string;
  latitude: number | null; longitude: number | null;
}
export async function createReport(r: NewReport): Promise<string> {
  const body: Record<string, unknown> = {
    bcw_addressdescription: r.addressDescription,
    bcw_description: r.description,
    bcw_status: DEFAULT_STATUS,
    'bcw_reporter@odata.bind': `/bcw_users(${r.userId})`,
  };
  if (r.animalId && r.animalId !== 'OTHER') body['bcw_animal@odata.bind'] = `/bcw_animals(${r.animalId})`;
  if (r.latitude != null) body.bcw_latitude = r.latitude;
  if (r.longitude != null) body.bcw_longitude = r.longitude;
  const created = await dv('POST', '/api/data/v9.2/bcw_reports', body, { Prefer: 'return=representation' });
  return created.bcw_reportid;
}

export async function linkMedia(reportId: string, url: string): Promise<void> {
  await dv('POST', '/api/data/v9.2/bcw_medias', {
    bcw_url: url,
    'bcw_report@odata.bind': `/bcw_reports(${reportId})`,
  });
}

export async function getRecentReports(top = 10) {
  const r = await dv('GET',
    `/api/data/v9.2/bcw_reports?$select=bcw_reportid,bcw_addressdescription,createdon&$orderby=createdon desc&$top=${top}&$expand=bcw_animal($select=bcw_name)`);
  return (r?.value ?? []).map((row: { bcw_reportid: string; bcw_addressdescription: string; createdon: string; bcw_animal?: { bcw_name: string } }) => ({
    id: row.bcw_reportid,
    address: row.bcw_addressdescription,
    createdOn: row.createdon,
    animal: row.bcw_animal?.bcw_name ?? 'Unknown',
  }));
}

export async function getMyReports(email: string): Promise<ReportRow[]> {
  const filter = encodeURIComponent(emailFilter(email));
  const found = await dv('GET', `/api/data/v9.2/bcw_users?$filter=${filter}&$select=bcw_userid&$top=1`);
  const userId = found?.value?.[0]?.bcw_userid;
  if (!isGuid(userId)) return [];
  const r = await dv('GET',
    `/api/data/v9.2/bcw_reports?$filter=_bcw_reporter_value eq ${userId}` +
    `&$select=bcw_reportid,bcw_addressdescription,bcw_description,bcw_status,createdon` +
    `&$orderby=createdon desc&$expand=bcw_animal($select=bcw_name)`);
  return (r?.value ?? []).map(mapReportRow);
}

export async function getAllReports(top = 100): Promise<ReportRow[]> {
  const r = await dv('GET',
    `/api/data/v9.2/bcw_reports?$select=bcw_reportid,bcw_addressdescription,bcw_description,bcw_status,createdon` +
    `&$orderby=createdon desc&$top=${top}` +
    `&$expand=bcw_animal($select=bcw_name),bcw_reporter($select=bcw_email)`);
  return (r?.value ?? []).map(mapReportRow);
}

export async function updateReportStatus(reportId: string, status: ReportStatus): Promise<void> {
  await dv('PATCH', `/api/data/v9.2/bcw_reports(${reportId})`, { bcw_status: status });
}
