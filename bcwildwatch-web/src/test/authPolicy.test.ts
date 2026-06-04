import { describe, it, expect, vi, afterEach } from 'vitest';
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

describe('isAdmin', () => {
  const ORIGINAL = process.env.ADMIN_EMAILS;
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.ADMIN_EMAILS;
    else process.env.ADMIN_EMAILS = ORIGINAL;
    vi.resetModules();
  });

  async function loadWith(adminEmails: string): Promise<(e?: string | null) => boolean> {
    process.env.ADMIN_EMAILS = adminEmails;
    vi.resetModules();
    return (await import('@/lib/authPolicy')).isAdmin;
  }

  it('returns true for an allow-listed email (case-insensitive)', async () => {
    const isAdmin = await loadWith('admin@belgiumcampus.ac.za');
    expect(isAdmin('Admin@belgiumcampus.ac.za')).toBe(true);
  });
  it('returns false for a non-listed campus email', async () => {
    const isAdmin = await loadWith('admin@belgiumcampus.ac.za');
    expect(isAdmin('someone.else@belgiumcampus.ac.za')).toBe(false);
  });
  it('returns false for empty/undefined', async () => {
    const isAdmin = await loadWith('admin@belgiumcampus.ac.za');
    expect(isAdmin(undefined)).toBe(false);
    expect(isAdmin('')).toBe(false);
  });
});
