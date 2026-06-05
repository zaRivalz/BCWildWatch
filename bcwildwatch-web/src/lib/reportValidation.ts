import { isCampusName } from '@/lib/campus';

export interface ReportInput {
  animalId: string | null;
  campus: string;
  addressDescription: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
}
type Result = { ok: true; value: ReportInput } | { ok: false; error: string };

export function validateReport(raw: Partial<ReportInput>): Result {
  const campus = (raw.campus ?? '').toString().trim();
  const addressDescription = (raw.addressDescription ?? '').toString().trim();
  const description = (raw.description ?? '').toString().trim();
  if (!isCampusName(campus)) return { ok: false, error: 'A valid campus is required.' };
  if (!addressDescription) return { ok: false, error: 'addressDescription is required.' };
  if (!description) return { ok: false, error: 'description is required.' };
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  return {
    ok: true,
    value: {
      animalId: raw.animalId ? String(raw.animalId) : null,
      campus,
      addressDescription, description,
      latitude: num(raw.latitude), longitude: num(raw.longitude),
    },
  };
}
