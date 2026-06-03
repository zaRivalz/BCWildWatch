export function escapeODataString(s: string): string {
  return s.replace(/'/g, "''");
}

export function emailFilter(email: string): string {
  return `bcw_email eq '${escapeODataString(email)}'`;
}

export interface Animal { id: string; name: string; }

export function mapAnimal(row: { bcw_animalid: string; bcw_name: string }): Animal {
  return { id: row.bcw_animalid, name: row.bcw_name };
}
