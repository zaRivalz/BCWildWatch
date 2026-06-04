import type { ReportRow } from '@/lib/dataverse.helpers';

/** A linked-photo record flattened from Dataverse (bcw_medias). */
export interface MediaRow {
  mediaId: string;
  reportId: string;
  filename?: string;
}

/**
 * Encodes a SharePoint file webUrl into the unpadded base64url sharing token
 * Microsoft Graph accepts at `/shares/{token}/driveItem`. This lets us fetch a
 * file's bytes app-only from just its stored webUrl, without tracking drive/item
 * ids. See: https://learn.microsoft.com/graph/api/shares-get
 */
export function encodeSharingUrl(url: string): string {
  const b64 = Buffer.from(url, 'utf-8').toString('base64');
  return 'u!' + b64.replace(/=+$/, '').replace(/\//g, '_').replace(/\+/g, '-');
}

const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  heic: 'image/heic',
  heif: 'image/heif',
};

/** Best-effort image content-type from a filename extension. */
export function contentTypeForFilename(name: string | null | undefined): string {
  const parts = (name ?? '').toLowerCase().split('.');
  const ext = parts.length > 1 ? parts[parts.length - 1] : '';
  return CONTENT_TYPES[ext] ?? 'application/octet-stream';
}

/**
 * Returns a copy of `reports` with the first matching photo (by report id)
 * attached as mediaId/mediaFilename. Pure — never mutates its inputs.
 */
export function attachMediaToReports(reports: ReportRow[], media: MediaRow[]): ReportRow[] {
  const firstByReport = new Map<string, MediaRow>();
  for (const m of media) {
    if (!firstByReport.has(m.reportId)) firstByReport.set(m.reportId, m);
  }
  return reports.map((r) => {
    const m = firstByReport.get(r.id);
    return m ? { ...r, mediaId: m.mediaId, mediaFilename: m.filename } : { ...r };
  });
}
