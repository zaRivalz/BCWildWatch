import { describe, it, expect } from 'vitest';
import { validateReport } from '@/lib/reportValidation';

const base = { animalId: '1', campus: 'Pretoria', addressDescription: 'Block A', description: 'A snake', latitude: -25.7, longitude: 28.2 };

describe('validateReport', () => {
  it('accepts a valid payload', () => {
    expect(validateReport(base).ok).toBe(true);
  });
  it('rejects an unknown campus', () => {
    const r = validateReport({ ...base, campus: 'Atlantis' });
    expect(r.ok).toBe(false);
  });
  it('rejects a missing campus', () => {
    const r = validateReport({ ...base, campus: '' });
    expect(r.ok).toBe(false);
  });
  it('rejects missing address', () => {
    const r = validateReport({ ...base, addressDescription: '   ' });
    expect(r.ok).toBe(false);
  });
  it('rejects missing description', () => {
    const r = validateReport({ ...base, description: '' });
    expect(r.ok).toBe(false);
  });
  it('coerces non-number coordinates to null', () => {
    const r = validateReport({ ...base, latitude: 'x' as unknown as number });
    expect(r.ok && r.value.latitude).toBe(null);
  });
});
