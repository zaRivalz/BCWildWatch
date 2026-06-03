import { describe, it, expect } from 'vitest';
import { isAllowedEmail } from '@/lib/authPolicy';

describe('isAllowedEmail', () => {
  it('allows campus emails (case-insensitive)', () => {
    expect(isAllowedEmail('Jane.Doe@belgiumcampus.ac.za')).toBe(true);
  });
  it('rejects non-campus emails', () => {
    expect(isAllowedEmail('person@gmail.com')).toBe(false);
  });
  it('rejects empty/undefined', () => {
    expect(isAllowedEmail(undefined)).toBe(false);
    expect(isAllowedEmail('')).toBe(false);
  });
});
