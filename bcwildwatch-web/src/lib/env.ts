export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS ?? '')
  .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

// Accept staff (user@belgiumcampus.ac.za) and any sub-domain such as
// students (user@student.belgiumcampus.ac.za), while rejecting look-alike
// domains like "evilbelgiumcampus.ac.za".
export const ALLOWED_EMAIL_SUFFIXES = [
  '@belgiumcampus.ac.za',
  '.belgiumcampus.ac.za',
] as const;
