import 'server-only';
import { requireEnv } from '@/lib/env';
import { encodeSharingUrl, contentTypeForFilename } from '@/lib/media';

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getGraphToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) return tokenCache.token;
  const tenant = requireEnv('AAD_TENANT_ID');
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: requireEnv('AAD_CLIENT_ID'),
    client_secret: requireEnv('AAD_CLIENT_SECRET'),
    scope: 'https://graph.microsoft.com/.default',
  });
  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString(),
  });
  if (!res.ok) throw new Error(`Graph token failed (${res.status}): ${await res.text()}`);
  const json = await res.json();
  tokenCache = { token: json.access_token, expiresAt: now + (json.expires_in ?? 3600) * 1000 };
  return tokenCache.token;
}

async function getDriveId(token: string): Promise<string> {
  const host = requireEnv('SHAREPOINT_HOSTNAME');
  const sitePath = requireEnv('SHAREPOINT_SITE_PATH');
  const driveName = requireEnv('SHAREPOINT_DRIVE_NAME');
  const siteRes = await fetch(`https://graph.microsoft.com/v1.0/sites/${host}:${sitePath}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!siteRes.ok) throw new Error(`Graph site lookup failed: ${await siteRes.text()}`);
  const siteId = (await siteRes.json()).id;
  const drivesRes = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/drives`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!drivesRes.ok) throw new Error(`Graph drives lookup failed: ${await drivesRes.text()}`);
  const drives = ((await drivesRes.json()).value ?? []) as { id: string; name: string }[];
  const drive = drives.find((d) => d.name === driveName) ?? drives[0];
  if (!drive) throw new Error(`No SharePoint drive found (looked for "${driveName}").`);
  return drive.id;
}

/** Uploads bytes to SharePoint and returns the webUrl. */
export async function uploadMedia(fileName: string, bytes: Buffer): Promise<string> {
  const token = await getGraphToken();
  const driveId = await getDriveId(token);
  // Folder within the document library to store uploads (e.g. "Media"). Path
  // segments are encoded individually so nested folders ("a/b") still work.
  const folder = (process.env.SHAREPOINT_FOLDER ?? 'Media')
    .split('/').filter(Boolean).map(encodeURIComponent).join('/');
  const safeName = encodeURIComponent(`${Date.now()}-${fileName}`);
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/root:/${folder}/${safeName}:/content`,
    { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/octet-stream' }, body: bytes as unknown as BodyInit },
  );
  if (!res.ok) throw new Error(`Graph upload failed (${res.status}): ${await res.text()}`);
  return (await res.json()).webUrl as string;
}

export interface DownloadedMedia {
  bytes: Buffer;
  contentType: string;
}

/**
 * Downloads a SharePoint file's bytes app-only, given its stored webUrl. Uses
 * the Graph `/shares/{token}/driveItem/content` endpoint so we don't need to
 * track drive/item ids. Falls back to inferring the content-type from the
 * filename when SharePoint returns a generic type.
 */
export async function downloadMedia(webUrl: string, filename?: string): Promise<DownloadedMedia> {
  const token = await getGraphToken();
  const share = encodeSharingUrl(webUrl);
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/shares/${share}/driveItem/content`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`Graph download failed (${res.status}): ${await res.text()}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  const headerType = res.headers.get('content-type') ?? '';
  const contentType = headerType.startsWith('image/')
    ? headerType
    : contentTypeForFilename(filename);
  return { bytes, contentType };
}
