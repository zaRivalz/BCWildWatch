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
  it('rejects non-number coordinates (GPS required)', () => {
    const r = validateReport({ ...base, latitude: 'x' as unknown as number });
    expect(r.ok).toBe(false);
  });
  it('rejects missing coordinates (GPS required)', () => {
    const r = validateReport({ ...base, latitude: null, longitude: null });
    expect(r.ok).toBe(false);
  });
  it('rejects out-of-range coordinates', () => {
    const r = validateReport({ ...base, latitude: 200, longitude: 400 });
    expect(r.ok).toBe(false);
  });
  it('keeps coordinates on a valid payload', () => {
    const r = validateReport(base);
    expect(r.ok && r.value.latitude).toBe(-25.7);
  });
});
