import { normalizeStatus, type ReportStatus } from '@/lib/reportStatus';

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
  status: ReportStatus;
  animal: string;
  reporter: string;
}

export function mapReportRow(row: {
  bcw_reportid: string;
  bcw_addressdescription?: string | null;
  bcw_description?: string | null;
  createdon: string;
  bcw_status?: string | null;
  bcw_animal?: { bcw_name?: string } | null;
  bcw_reporter?: { bcw_email?: string } | null;
}): ReportRow {
  return {
    id: row.bcw_reportid,
    address: row.bcw_addressdescription ?? '',
    description: row.bcw_description ?? '',
    createdOn: row.createdon,
    status: normalizeStatus(row.bcw_status),
    animal: row.bcw_animal?.bcw_name ?? 'Unknown',
    reporter: row.bcw_reporter?.bcw_email ?? '',
  };
}
