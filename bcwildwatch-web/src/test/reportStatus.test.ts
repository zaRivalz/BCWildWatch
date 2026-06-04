import { describe, it, expect } from 'vitest';
import {
  REPORT_STATUS_OPTIONS, DEFAULT_STATUS_VALUE, isValidStatusValue, statusLabel, statusBadgeClass,
} from '@/lib/reportStatus';

describe('reportStatus', () => {
  it('mirrors the bcw_status Choice options with Submitted as default', () => {
    expect(REPORT_STATUS_OPTIONS.map((o) => o.label)).toEqual([
      'Submitted', 'Reviewed', 'In Progress', 'Resolved', 'Closed',
    ]);
    expect(DEFAULT_STATUS_VALUE).toBe(755900000);
    expect(statusLabel(DEFAULT_STATUS_VALUE)).toBe('Submitted');
  });
  it('validates known option values only', () => {
    expect(isValidStatusValue(755900002)).toBe(true);
    expect(isValidStatusValue(999)).toBe(false);
    expect(isValidStatusValue('755900002')).toBe(false);
    expect(isValidStatusValue(null)).toBe(false);
  });
  it('labels unknown/empty values as the default', () => {
    expect(statusLabel(755900003)).toBe('Resolved');
    expect(statusLabel(null)).toBe('Submitted');
    expect(statusLabel(123)).toBe('Submitted');
  });
  it('returns a non-empty badge class for each option', () => {
    for (const o of REPORT_STATUS_OPTIONS) {
      expect(typeof statusBadgeClass(o.value)).toBe('string');
      expect(statusBadgeClass(o.value).length).toBeGreaterThan(0);
    }
  });
});
