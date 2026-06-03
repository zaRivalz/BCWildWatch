export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

export const ALLOWED_DOMAIN = '@belgiumcampus.ac.za';
