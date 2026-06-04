import { describe, it, expect } from 'vitest';
import {
  REPORT_STATUSES, DEFAULT_STATUS, isValidStatus, normalizeStatus, statusBadgeClass,
} from '@/lib/reportStatus';

describe('reportStatus', () => {
  it('exposes the three statuses with New as default', () => {
    expect(REPORT_STATUSES).toEqual(['New', 'Investigating', 'Resolved']);
    expect(DEFAULT_STATUS).toBe('New');
  });
  it('validates known statuses only', () => {
    expect(isValidStatus('Investigating')).toBe(true);
    expect(isValidStatus('Closed')).toBe(false);
    expect(isValidStatus(null)).toBe(false);
    expect(isValidStatus(42)).toBe(false);
  });
  it('normalizes unknown/empty values to the default', () => {
    expect(normalizeStatus('Resolved')).toBe('Resolved');
    expect(normalizeStatus(null)).toBe('New');
    expect(normalizeStatus('garbage')).toBe('New');
  });
  it('returns a non-empty badge class for each status', () => {
    for (const s of REPORT_STATUSES) {
      expect(typeof statusBadgeClass(s)).toBe('string');
      expect(statusBadgeClass(s).length).toBeGreaterThan(0);
    }
  });
});
