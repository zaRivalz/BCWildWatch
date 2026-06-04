import { DEFAULT_STATUS_VALUE } from '@/lib/reportStatus';

const GUID_RE = /^\{?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}?$/;

export function isGuid(value: unknown): value is string {
  return typeof value === 'string' && GUID_RE.test(value);
}

export function escapeODataString(s: string): string {
  return s.replace(/'/g, "''");
}

/**
 * Returns the scheme+host origin of a Dataverse URL, tolerating a value that
 * already includes an `/api/data/vX.Y` path (which the maker portal copies).
 * The origin is what both the OAuth scope and the request base require.
 */
export function dataverseOrigin(raw: string): string {
  return new URL(raw).origin;
}

export function emailFilter(email: string): string {
  return `bcw_email eq '${escapeODataString(email)}'`;
}

export interface Animal { id: string; name: string; }

export function mapAnimal(row: { bcw_animalid: string; bcw_name: string }): Animal {
  return { id: row.bcw_animalid, name: row.bcw_name };
}

export interface ReportRow {
  id: string;
  address: string;
  description: string;
  createdOn: string;
  status: number; // bcw_status option-set value
  animal: string;
  reporter: string;
  mediaId?: string; // bcw_mediaid of the first linked photo, if any
  mediaFilename?: string; // original filename of that photo
}

export function mapReportRow(row: {
  bcw_reportid: string;
  bcw_addressdescription?: string | null;
  bcw_description?: string | null;
  createdon: string;
  bcw_status?: number | null;
  bcw_Animal?: { bcw_name?: string } | null;
  bcw_Reporter?: { bcw_email?: string } | null;
}): ReportRow {
  return {
    id: row.bcw_reportid,
    address: row.bcw_addressdescription ?? '',
    description: row.bcw_description ?? '',
    createdOn: row.createdon,
    status: row.bcw_status ?? DEFAULT_STATUS_VALUE,
    animal: row.bcw_Animal?.bcw_name ?? 'Unknown',
    reporter: row.bcw_Reporter?.bcw_email ?? '',
  };
}
