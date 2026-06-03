import { ALLOWED_DOMAIN } from '@/lib/env';

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith(ALLOWED_DOMAIN);
}
