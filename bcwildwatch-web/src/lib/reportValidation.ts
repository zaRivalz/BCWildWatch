export interface ReportInput {
  animalId: string | null;
  addressDescription: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
}
type Result = { ok: true; value: ReportInput } | { ok: false; error: string };

export function validateReport(raw: Partial<ReportInput>): Result {
  const addressDescription = (raw.addressDescription ?? '').toString().trim();
  const description = (raw.description ?? '').toString().trim();
  if (!addressDescription) return { ok: false, error: 'addressDescription is required.' };
  if (!description) return { ok: false, error: 'description is required.' };
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  return {
    ok: true,
    value: {
      animalId: raw.animalId ? String(raw.animalId) : null,
      addressDescription, description,
      latitude: num(raw.latitude), longitude: num(raw.longitude),
    },
  };
}
