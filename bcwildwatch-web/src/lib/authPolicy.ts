import { ALLOWED_EMAIL_SUFFIXES, ADMIN_EMAILS } from '@/lib/env';

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  return ALLOWED_EMAIL_SUFFIXES.some((suffix) => lower.endsWith(suffix));
}

export function extractEmail(profile: unknown): string | undefined {
  if (!profile || typeof profile !== 'object') return undefined;
  const p = profile as { email?: unknown; preferred_username?: unknown };
  const value = p.email ?? p.preferred_username;
  return typeof value === 'string' ? value : undefined;
}

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
