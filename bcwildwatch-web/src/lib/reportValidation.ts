import { isCampusName } from '@/lib/campus';

export interface ReportInput {
  animalId: string | null;
  campus: string;
  addressDescription: string;
  description: string;
  latitude: number;
  longitude: number;
}
type Result = { ok: true; value: ReportInput } | { ok: false; error: string };

/** Raw, untrusted input as it arrives from the request (coords may be null). */
export type RawReportInput = {
  animalId?: string | null;
  campus?: string | null;
  addressDescription?: string | null;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export function validateReport(raw: RawReportInput): Result {
  const campus = (raw.campus ?? '').toString().trim();
  const addressDescription = (raw.addressDescription ?? '').toString().trim();
  const description = (raw.description ?? '').toString().trim();
  if (!isCampusName(campus)) return { ok: false, error: 'A valid campus is required.' };
  if (!addressDescription) return { ok: false, error: 'addressDescription is required.' };
  if (!description) return { ok: false, error: 'description is required.' };
  // GPS is mandatory — the campus is derived from these coordinates, so a report
  // without finite, in-range coordinates is rejected.
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  const latitude = num(raw.latitude);
  const longitude = num(raw.longitude);
  if (latitude === null || longitude === null) {
    return { ok: false, error: 'GPS location is required.' };
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return { ok: false, error: 'GPS location is out of range.' };
  }
  return {
    ok: true,
    value: {
      animalId: raw.animalId ? String(raw.animalId) : null,
      campus,
      addressDescription, description,
      latitude, longitude,
    },
  };
}
