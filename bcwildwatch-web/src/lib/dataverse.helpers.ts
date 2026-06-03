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
