import { ALLOWED_DOMAIN } from '@/lib/env';

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith(ALLOWED_DOMAIN);
}

export function extractEmail(profile: unknown): string | undefined {
  if (!profile || typeof profile !== 'object') return undefined;
  const p = profile as { email?: unknown; preferred_username?: unknown };
  const value = p.email ?? p.preferred_username;
  return typeof value === 'string' ? value : undefined;
}
