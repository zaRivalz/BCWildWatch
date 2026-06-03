import { describe, it, expect } from 'vitest';
import { isAllowedEmail, extractEmail } from '@/lib/authPolicy';

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

describe('extractEmail', () => {
  it('returns email when present', () => {
    expect(extractEmail({ email: 'a@b.com' })).toBe('a@b.com');
  });
  it('falls back to preferred_username when email is absent', () => {
    expect(extractEmail({ preferred_username: 'u@b.com' })).toBe('u@b.com');
  });
  it('returns undefined for null', () => {
    expect(extractEmail(null)).toBeUndefined();
  });
  it('returns undefined for a non-object', () => {
    expect(extractEmail('string')).toBeUndefined();
    expect(extractEmail(42)).toBeUndefined();
  });
  it('returns undefined when neither field is a string', () => {
    expect(extractEmail({ email: 123 })).toBeUndefined();
    expect(extractEmail({})).toBeUndefined();
  });
});
