# BC WildWatch Phase 1 (Core) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a deployable Next.js portal on Vercel where a Belgium Campus user logs in with Entra ID and submits an animal sighting that is written directly to Dataverse, with the photo uploaded to SharePoint via Microsoft Graph; plus Home and Live Map pages with a light/dark theme.

**Architecture:** Next.js App Router (TypeScript). All backend access runs in server-side route handlers / server actions so secrets never reach the browser. Auth.js (Entra ID provider) gates the app and enforces the `@belgiumcampus.ac.za` domain. A Dataverse client uses the client-credentials flow (service principal); a Graph client uploads media app-only. Pure logic modules are unit-tested with Vitest; UI/auth/embeds are verified manually against the running dev server.

**Tech Stack:** Next.js (App Router) + TypeScript, Tailwind CSS, shadcn/ui, 21st.dev components, Framer Motion, Auth.js (next-auth), Vitest, Vercel.

**Project location:** A fresh app in `bcwildwatch-web/` at the repo root. The legacy `bc-wildwatch/` (Azure SWA reference) is left untouched and removed in a later phase. Vercel "Root Directory" will be set to `bcwildwatch-web`.

**Prerequisite values needed before Tasks 4–7 (from spec §12):**
- `DATAVERSE_URL` (e.g. `https://orgXXXX.crm4.dynamics.com`), confirmed table/column logical names.
- App registration `AAD_CLIENT_ID`, `AAD_CLIENT_SECRET`, `AAD_TENANT_ID` (Belgium Campus tenant GUID).
- SharePoint site host + site path + document library/drive name.
- Power BI publish-to-web **map** iframe URL.

If a value is unknown when a task is reached, stub it via env and verify later — but do NOT invent logical names; confirm in make.powerapps.com.

---

## File Structure

```
bcwildwatch-web/
├── package.json, tsconfig.json, next.config.ts, tailwind/postcss config
├── .env.local.example                 # documents every env var (no secrets)
├── vitest.config.ts
├── middleware.ts                       # route protection
├── src/
│   ├── auth.ts                         # Auth.js config (Entra provider + domain lock)
│   ├── lib/
│   │   ├── env.ts                      # typed env access + validation
│   │   ├── dataverse.ts                # token + dvRequest + table helpers
│   │   ├── dataverse.helpers.ts        # pure helpers (odata filter escaping, mappers)
│   │   ├── graph.ts                    # Graph app-only token + SharePoint upload
│   │   ├── reportValidation.ts         # pure request-body validation
│   │   └── dangerousAnimals.ts         # pure: is an animal "dangerous"
│   ├── app/
│   │   ├── layout.tsx                  # root layout + ThemeProvider
│   │   ├── globals.css
│   │   ├── page.tsx                    # Home (hero + recent sightings)
│   │   ├── login/page.tsx              # sign-in
│   │   ├── report/page.tsx             # report form (client component)
│   │   ├── map/page.tsx                # Power BI map embed
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── animals/route.ts        # GET animals
│   │       └── reports/route.ts        # POST submit-report, GET recent
│   ├── components/
│   │   ├── theme-provider.tsx, theme-toggle.tsx
│   │   ├── nav.tsx
│   │   └── ui/                         # shadcn + 21st.dev components
│   └── test/                           # Vitest unit tests
└── ...
```

Files split by responsibility: pure logic (`*.helpers.ts`, `reportValidation.ts`, `dangerousAnimals.ts`) is isolated from I/O (`dataverse.ts`, `graph.ts`) so it is unit-testable without network.

---

## Task 1: Scaffold the Next.js app

**Files:**
- Create: `bcwildwatch-web/` (via create-next-app)

- [ ] **Step 1: Scaffold**

Run from repo root:
```bash
npx create-next-app@latest bcwildwatch-web --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```
Accept defaults for any remaining prompts.

- [ ] **Step 2: Verify dev server boots**

```bash
cd bcwildwatch-web && npm run dev
```
Expected: server on http://localhost:3000 showing the Next.js starter. Stop it with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add bcwildwatch-web
git commit -m "feat: scaffold Next.js app for BC WildWatch web portal"
```

---

## Task 2: Add tooling (Vitest, shadcn, Framer Motion)

**Files:**
- Create: `bcwildwatch-web/vitest.config.ts`
- Modify: `bcwildwatch-web/package.json` (scripts)

- [ ] **Step 1: Install deps**

```bash
cd bcwildwatch-web
npm i framer-motion next-auth@beta
npm i -D vitest @vitejs/plugin-react vite-tsconfig-paths
npx shadcn@latest init -d
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: { environment: 'node', include: ['src/test/**/*.test.ts'] },
});
```

- [ ] **Step 3: Add test script to `package.json`**

Add under `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Sanity test**

Create `src/test/sanity.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
describe('sanity', () => { it('runs', () => { expect(1 + 1).toBe(2); }); });
```
Run: `npm test`
Expected: 1 passing test.

- [ ] **Step 5: Add shadcn components used in Phase 1**

```bash
npx shadcn@latest add button card input textarea select label sonner skeleton
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: add vitest, shadcn/ui, framer-motion"
```

---

## Task 3: Typed env access (pure, tested)

**Files:**
- Create: `bcwildwatch-web/src/lib/env.ts`
- Create: `bcwildwatch-web/.env.local.example`
- Test: `bcwildwatch-web/src/test/env.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/test/env.test.ts
import { describe, it, expect } from 'vitest';
import { requireEnv } from '@/lib/env';

describe('requireEnv', () => {
  it('returns the value when set', () => {
    process.env.FOO_TEST = 'bar';
    expect(requireEnv('FOO_TEST')).toBe('bar');
  });
  it('throws a named error when missing', () => {
    delete process.env.MISSING_TEST;
    expect(() => requireEnv('MISSING_TEST')).toThrow(/MISSING_TEST/);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- env`
Expected: FAIL (cannot find module `@/lib/env`).

- [ ] **Step 3: Implement**

```ts
// src/lib/env.ts
export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '')
  .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

export const ALLOWED_DOMAIN = '@belgiumcampus.ac.za';
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- env`
Expected: PASS.

- [ ] **Step 5: Document env in `.env.local.example`**

```bash
# Auth.js
AUTH_SECRET=                 # generate: npx auth secret
AUTH_MICROSOFT_ENTRA_ID_ID=          # app registration client id
AUTH_MICROSOFT_ENTRA_ID_SECRET=      # client secret value
AUTH_MICROSOFT_ENTRA_ID_ISSUER=https://login.microsoftonline.com/<TENANT_ID>/v2.0
# Dataverse service principal (same app reg)
AAD_CLIENT_ID=
AAD_CLIENT_SECRET=
AAD_TENANT_ID=
DATAVERSE_URL=https://orgXXXX.crm4.dynamics.com
# Microsoft Graph / SharePoint
SHAREPOINT_HOSTNAME=belgiumcampus.sharepoint.com
SHAREPOINT_SITE_PATH=/sites/YOURSITE
SHAREPOINT_DRIVE_NAME=Documents
# App
ADMIN_EMAILS=you@belgiumcampus.ac.za
POWERBI_MAP_URL=
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: typed env access + env example"
```

---

## Task 4: Auth.js Entra login with domain lock

**Files:**
- Create: `bcwildwatch-web/src/auth.ts`
- Create: `bcwildwatch-web/src/app/api/auth/[...nextauth]/route.ts`
- Create: `bcwildwatch-web/middleware.ts`
- Create: `bcwildwatch-web/src/lib/authPolicy.ts`
- Test: `bcwildwatch-web/src/test/authPolicy.test.ts`

- [ ] **Step 1: Write the failing test for the pure policy**

```ts
// src/test/authPolicy.test.ts
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- authPolicy`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement the pure policy**

```ts
// src/lib/authPolicy.ts
import { ALLOWED_DOMAIN } from '@/lib/env';

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith(ALLOWED_DOMAIN);
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- authPolicy`
Expected: PASS.

- [ ] **Step 5: Implement Auth.js config**

```ts
// src/auth.ts
import NextAuth from 'next-auth';
import MicrosoftEntraID from 'next-auth/providers/microsoft-entra-id';
import { isAllowedEmail } from '@/lib/authPolicy';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER!,
      authorization: { params: { domain_hint: 'belgiumcampus.ac.za' } },
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const email = (profile?.email ?? (profile as { preferred_username?: string })?.preferred_username) as string | undefined;
      return isAllowedEmail(email);
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.email = (profile.email ?? (profile as { preferred_username?: string }).preferred_username) as string;
        token.name = profile.name as string;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
});
```

- [ ] **Step 6: Wire the route handler**

```ts
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth';
export const { GET, POST } = handlers;
```

- [ ] **Step 7: Protect routes with middleware**

```ts
// middleware.ts
import { auth } from '@/src/auth';
export default auth((req) => {
  const isAuthed = !!req.auth;
  const { pathname } = req.nextUrl;
  const isPublic = pathname.startsWith('/login') || pathname.startsWith('/api/auth');
  if (!isAuthed && !isPublic) {
    const url = new URL('/login', req.nextUrl.origin);
    return Response.redirect(url);
  }
});
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
```
> Note: if the `@/src/auth` import path errors, use the alias that matches `tsconfig.json` (`@/auth`). Confirm `paths` in tsconfig maps `@/*` → `src/*`.

- [ ] **Step 8: Generate AUTH_SECRET and fill `.env.local`**

```bash
npx auth secret   # writes AUTH_SECRET into .env.local
```
Then add the Entra + Dataverse + SharePoint values to `.env.local` (copy from `.env.local.example`).

- [ ] **Step 9: Add redirect URIs to the app registration**

In Entra → App registration → Authentication → Add platform → Web, add:
`http://localhost:3000/api/auth/callback/microsoft-entra-id`
`https://<vercel-domain>/api/auth/callback/microsoft-entra-id`

- [ ] **Step 10: Manual verification**

Run `npm run dev`. Visit http://localhost:3000 → should redirect to `/login`. Sign in with a campus account → lands on Home. Sign in with a non-campus account → access denied. (Login UI itself is built in Task 9; for now `/login` can be the placeholder page from scaffolding plus a temporary `signIn` button — replaced in Task 9.)

- [ ] **Step 11: Commit**

```bash
git add -A && git commit -m "feat: Entra ID auth with campus domain lock + route protection"
```

---

## Task 5: Dataverse pure helpers (tested)

**Files:**
- Create: `bcwildwatch-web/src/lib/dataverse.helpers.ts`
- Test: `bcwildwatch-web/src/test/dataverse.helpers.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/test/dataverse.helpers.test.ts
import { describe, it, expect } from 'vitest';
import { escapeODataString, emailFilter, mapAnimal } from '@/lib/dataverse.helpers';

describe('dataverse helpers', () => {
  it('escapes single quotes for OData', () => {
    expect(escapeODataString("O'Brien")).toBe("O''Brien");
  });
  it('builds an encoded email filter', () => {
    const f = emailFilter("a'b@x.com");
    expect(f).toContain("bcw_email eq 'a''b@x.com'");
  });
  it('maps a raw animal row to {id,name}', () => {
    expect(mapAnimal({ bcw_animalid: '1', bcw_name: 'Snake' })).toEqual({ id: '1', name: 'Snake' });
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- dataverse.helpers`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement**

```ts
// src/lib/dataverse.helpers.ts
export function escapeODataString(s: string): string {
  return s.replace(/'/g, "''");
}
export function emailFilter(email: string): string {
  return `bcw_email eq '${escapeODataString(email)}'`;
}
export interface Animal { id: string; name: string; }
export function mapAnimal(row: { bcw_animalid: string; bcw_name: string }): Animal {
  return { id: row.bcw_animalid, name: row.bcw_name };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- dataverse.helpers`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: pure Dataverse OData helpers + animal mapper"
```

---

## Task 6: Dataverse client (token + requests + table ops)

**Files:**
- Create: `bcwildwatch-web/src/lib/dataverse.ts`

> I/O-bound; verified via the API routes in Task 8, not unit tests. Logical names mirror the legacy reference and MUST be confirmed against the live environment before running.

- [ ] **Step 1: Implement the client**

```ts
// src/lib/dataverse.ts
import 'server-only';
import { requireEnv } from '@/lib/env';
import { emailFilter, mapAnimal, type Animal } from '@/lib/dataverse.helpers';

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) return tokenCache.token;
  const tenant = requireEnv('AAD_TENANT_ID');
  const dv = requireEnv('DATAVERSE_URL').replace(/\/$/, '');
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: requireEnv('AAD_CLIENT_ID'),
    client_secret: requireEnv('AAD_CLIENT_SECRET'),
    scope: `${dv}/.default`,
  });
  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString(),
  });
  if (!res.ok) throw new Error(`Dataverse token failed (${res.status}): ${await res.text()}`);
  const json = await res.json();
  tokenCache = { token: json.access_token, expiresAt: now + (json.expires_in ?? 3600) * 1000 };
  return tokenCache.token;
}

async function dv(method: string, path: string, body?: unknown, extraHeaders?: Record<string, string>) {
  const base = requireEnv('DATAVERSE_URL').replace(/\/$/, '');
  const token = await getToken();
  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'OData-MaxVersion': '4.0', 'OData-Version': '4.0', Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...extraHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`Dataverse ${method} ${path} -> ${res.status}: ${json?.error?.message ?? text}`);
  return json;
}

export async function getAnimals(): Promise<Animal[]> {
  const r = await dv('GET', '/api/data/v9.2/bcw_animals?$select=bcw_animalid,bcw_name&$orderby=bcw_name asc');
  return (r?.value ?? []).map(mapAnimal);
}

export async function upsertUser(email: string, name: string): Promise<string> {
  const filter = encodeURIComponent(emailFilter(email));
  const found = await dv('GET', `/api/data/v9.2/bcw_users?$filter=${filter}&$select=bcw_userid&$top=1`);
  const existing = found?.value?.[0]?.bcw_userid;
  if (existing) return existing;
  const created = await dv('POST', '/api/data/v9.2/bcw_users',
    { bcw_email: email, bcw_name: name }, { Prefer: 'return=representation' });
  return created.bcw_userid;
}

export interface NewReport {
  userId: string; animalId: string | null;
  addressDescription: string; description: string;
  latitude: number | null; longitude: number | null;
}
export async function createReport(r: NewReport): Promise<string> {
  const body: Record<string, unknown> = {
    bcw_addressdescription: r.addressDescription,
    bcw_description: r.description,
    'bcw_reporter@odata.bind': `/bcw_users(${r.userId})`,
  };
  if (r.animalId && r.animalId !== 'OTHER') body['bcw_animal@odata.bind'] = `/bcw_animals(${r.animalId})`;
  if (r.latitude != null) body.bcw_latitude = r.latitude;
  if (r.longitude != null) body.bcw_longitude = r.longitude;
  const created = await dv('POST', '/api/data/v9.2/bcw_reports', body, { Prefer: 'return=representation' });
  return created.bcw_reportid;
}

export async function linkMedia(reportId: string, url: string): Promise<void> {
  await dv('POST', '/api/data/v9.2/bcw_medias', {
    bcw_url: url,
    'bcw_report@odata.bind': `/bcw_reports(${reportId})`,
  });
}

export async function getRecentReports(top = 10) {
  const r = await dv('GET',
    `/api/data/v9.2/bcw_reports?$select=bcw_reportid,bcw_addressdescription,createdon&$orderby=createdon desc&$top=${top}&$expand=bcw_animal($select=bcw_name)`);
  return (r?.value ?? []).map((row: { bcw_reportid: string; bcw_addressdescription: string; createdon: string; bcw_animal?: { bcw_name: string } }) => ({
    id: row.bcw_reportid,
    address: row.bcw_addressdescription,
    createdOn: row.createdon,
    animal: row.bcw_animal?.bcw_name ?? 'Unknown',
  }));
}
```
> **Confirm before running:** entity set names (`bcw_animals`, `bcw_users`, `bcw_reports`, `bcw_medias`), column logical names, the media URL field (`bcw_url`), and the media→report relationship name. Adjust to match the live environment.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: Dataverse service-principal client"
```

---

## Task 7: Graph SharePoint upload + report validation + dangerous-animal logic

**Files:**
- Create: `bcwildwatch-web/src/lib/graph.ts`
- Create: `bcwildwatch-web/src/lib/reportValidation.ts`
- Create: `bcwildwatch-web/src/lib/dangerousAnimals.ts`
- Test: `bcwildwatch-web/src/test/reportValidation.test.ts`
- Test: `bcwildwatch-web/src/test/dangerousAnimals.test.ts`

- [ ] **Step 1: Write failing tests (validation)**

```ts
// src/test/reportValidation.test.ts
import { describe, it, expect } from 'vitest';
import { validateReport } from '@/lib/reportValidation';

const base = { animalId: '1', addressDescription: 'Block A', description: 'A snake', latitude: -25.7, longitude: 28.2 };

describe('validateReport', () => {
  it('accepts a valid payload', () => {
    expect(validateReport(base).ok).toBe(true);
  });
  it('rejects missing address', () => {
    const r = validateReport({ ...base, addressDescription: '   ' });
    expect(r.ok).toBe(false);
  });
  it('rejects missing description', () => {
    const r = validateReport({ ...base, description: '' });
    expect(r.ok).toBe(false);
  });
  it('coerces non-number coordinates to null', () => {
    const r = validateReport({ ...base, latitude: 'x' as unknown as number });
    expect(r.ok && r.value.latitude).toBe(null);
  });
});
```

- [ ] **Step 2: Write failing tests (dangerous animals)**

```ts
// src/test/dangerousAnimals.test.ts
import { describe, it, expect } from 'vitest';
import { isDangerous } from '@/lib/dangerousAnimals';

describe('isDangerous', () => {
  it('flags snakes', () => { expect(isDangerous('Cape Cobra (Snake)')).toBe(true); });
  it('flags bees', () => { expect(isDangerous('Bee swarm')).toBe(true); });
  it('does not flag a cat', () => { expect(isDangerous('Cat')).toBe(false); });
});
```

- [ ] **Step 3: Run to verify both fail**

Run: `npm test -- reportValidation dangerousAnimals`
Expected: FAIL (modules not found).

- [ ] **Step 4: Implement validation**

```ts
// src/lib/reportValidation.ts
export interface ReportInput {
  animalId: string | null;
  addressDescription: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
}
type Result = { ok: true; value: ReportInput } | { ok: false; error: string };

export function validateReport(raw: Partial<ReportInput>): Result {
  const addressDescription = (raw.addressDescription ?? '').toString().trim();
  const description = (raw.description ?? '').toString().trim();
  if (!addressDescription) return { ok: false, error: 'addressDescription is required.' };
  if (!description) return { ok: false, error: 'description is required.' };
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  return {
    ok: true,
    value: {
      animalId: raw.animalId ? String(raw.animalId) : null,
      addressDescription, description,
      latitude: num(raw.latitude), longitude: num(raw.longitude),
    },
  };
}
```

- [ ] **Step 5: Implement dangerous-animal logic**

```ts
// src/lib/dangerousAnimals.ts
const DANGEROUS = ['snake', 'cobra', 'adder', 'bee', 'wasp', 'hornet', 'stray dog', 'dog', 'scorpion', 'spider'];
export function isDangerous(animalName: string | null | undefined): boolean {
  if (!animalName) return false;
  const n = animalName.toLowerCase();
  return DANGEROUS.some((d) => n.includes(d));
}
```
> Tune this list to the final agreed dangerous-animal set (spec §12) when known.

- [ ] **Step 6: Run to verify both pass**

Run: `npm test -- reportValidation dangerousAnimals`
Expected: PASS.

- [ ] **Step 7: Implement the Graph upload client**

```ts
// src/lib/graph.ts
import 'server-only';
import { requireEnv } from '@/lib/env';

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getGraphToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) return tokenCache.token;
  const tenant = requireEnv('AAD_TENANT_ID');
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: requireEnv('AAD_CLIENT_ID'),
    client_secret: requireEnv('AAD_CLIENT_SECRET'),
    scope: 'https://graph.microsoft.com/.default',
  });
  const res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString(),
  });
  if (!res.ok) throw new Error(`Graph token failed (${res.status}): ${await res.text()}`);
  const json = await res.json();
  tokenCache = { token: json.access_token, expiresAt: now + (json.expires_in ?? 3600) * 1000 };
  return tokenCache.token;
}

async function getDriveId(token: string): Promise<string> {
  const host = requireEnv('SHAREPOINT_HOSTNAME');
  const sitePath = requireEnv('SHAREPOINT_SITE_PATH');
  const driveName = requireEnv('SHAREPOINT_DRIVE_NAME');
  const siteRes = await fetch(`https://graph.microsoft.com/v1.0/sites/${host}:${sitePath}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!siteRes.ok) throw new Error(`Graph site lookup failed: ${await siteRes.text()}`);
  const siteId = (await siteRes.json()).id;
  const drivesRes = await fetch(`https://graph.microsoft.com/v1.0/sites/${siteId}/drives`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const drives = (await drivesRes.json()).value as { id: string; name: string }[];
  const drive = drives.find((d) => d.name === driveName) ?? drives[0];
  return drive.id;
}

/** Uploads bytes to SharePoint and returns the webUrl. */
export async function uploadMedia(fileName: string, bytes: Buffer): Promise<string> {
  const token = await getGraphToken();
  const driveId = await getDriveId(token);
  const safeName = encodeURIComponent(`${Date.now()}-${fileName}`);
  const res = await fetch(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/root:/BCWildWatch/${safeName}:/content`,
    { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/octet-stream' }, body: bytes },
  );
  if (!res.ok) throw new Error(`Graph upload failed (${res.status}): ${await res.text()}`);
  return (await res.json()).webUrl as string;
}
```
> Requires `Sites.ReadWrite.All` (application) granted admin consent. Files land in a `BCWildWatch/` folder in the document library.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: Graph SharePoint upload + report validation + dangerous-animal logic"
```

---

## Task 8: API routes (animals + reports)

**Files:**
- Create: `bcwildwatch-web/src/app/api/animals/route.ts`
- Create: `bcwildwatch-web/src/app/api/reports/route.ts`

- [ ] **Step 1: Implement GET /api/animals**

```ts
// src/app/api/animals/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAnimals } from '@/lib/dataverse';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ animals: await getAnimals() });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load animals.' }, { status: 502 });
  }
}
```

- [ ] **Step 2: Implement POST /api/reports and GET recent**

```ts
// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { isAllowedEmail } from '@/lib/authPolicy';
import { validateReport } from '@/lib/reportValidation';
import { upsertUser, createReport, linkMedia, getRecentReports } from '@/lib/dataverse';
import { uploadMedia } from '@/lib/graph';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json({ reports: await getRecentReports(10) });
  } catch {
    return NextResponse.json({ error: 'Failed to load reports.' }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email || !isAllowedEmail(email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const form = await req.formData();
  const v = validateReport({
    animalId: (form.get('animalId') as string) || null,
    addressDescription: (form.get('addressDescription') as string) ?? '',
    description: (form.get('description') as string) ?? '',
    latitude: form.get('latitude') ? Number(form.get('latitude')) : null,
    longitude: form.get('longitude') ? Number(form.get('longitude')) : null,
  });
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  try {
    const userId = await upsertUser(email, session.user?.name ?? email);
    const reportId = await createReport({ userId, ...v.value });

    const file = form.get('photo') as File | null;
    if (file && file.size > 0) {
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json({ error: 'File too large (max 10MB).' }, { status: 413 });
      }
      const bytes = Buffer.from(await file.arrayBuffer());
      const url = await uploadMedia(file.name, bytes);
      await linkMedia(reportId, url);
    }
    return NextResponse.json({ success: true, reportId });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to submit the report.' }, { status: 502 });
  }
}
```

- [ ] **Step 3: Manual verification (after env values are real)**

Run `npm run dev`, sign in, then:
```bash
curl -i http://localhost:3000/api/animals   # expect 401 without a session cookie; in browser (logged in) expect {animals:[...]}
```
Confirm `getAnimals` returns rows in the browser (visit `/api/animals` while logged in).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: animals + reports API routes"
```

---

## Task 9: Theme, nav, and Login page

**Files:**
- Create: `bcwildwatch-web/src/components/theme-provider.tsx`
- Create: `bcwildwatch-web/src/components/theme-toggle.tsx`
- Create: `bcwildwatch-web/src/components/nav.tsx`
- Modify: `bcwildwatch-web/src/app/layout.tsx`
- Create: `bcwildwatch-web/src/app/login/page.tsx`

- [ ] **Step 1: Install next-themes**

```bash
cd bcwildwatch-web && npm i next-themes
```

- [ ] **Step 2: Theme provider**

```tsx
// src/components/theme-provider.tsx
'use client';
import { ThemeProvider as NextThemes } from 'next-themes';
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <NextThemes attribute="class" defaultTheme="system" enableSystem>{children}</NextThemes>;
}
```

- [ ] **Step 3: Theme toggle**

```tsx
// src/components/theme-toggle.tsx
'use client';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button variant="ghost" size="sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '☀' : '☾'}
    </Button>
  );
}
```

- [ ] **Step 4: Nav with sign-in/out**

```tsx
// src/components/nav.tsx
import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export async function Nav() {
  const session = await auth();
  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <Link href="/" className="font-bold text-green-700 dark:text-green-400">BC WildWatch</Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/report">Report</Link>
        <Link href="/map">Live Map</Link>
        <ThemeToggle />
        {session?.user && (
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }); }}>
            <Button variant="outline" size="sm">Sign out</Button>
          </form>
        )}
      </nav>
    </header>
  );
}
```

- [ ] **Step 5: Root layout**

```tsx
// src/app/layout.tsx  (replace the body wrapper)
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Nav } from '@/components/nav';

export const metadata: Metadata = { title: 'BC WildWatch', description: 'Campus animal safety reporting' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Nav />
          <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Login page**

```tsx
// src/app/login/page.tsx
import { signIn, auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect('/');
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Card className="p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-green-700 dark:text-green-400">BC WildWatch</h1>
        <p className="text-sm text-muted-foreground">Sign in with your Belgium Campus account.</p>
        <form action={async () => { 'use server'; await signIn('microsoft-entra-id', { redirectTo: '/' }); }}>
          <Button type="submit" className="w-full">Sign in with Microsoft</Button>
        </form>
      </Card>
    </div>
  );
}
```

- [ ] **Step 7: Manual verification**

`npm run dev` → `/login` shows the card; toggling theme switches light/dark; sign-in/out works.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: theme toggle, nav, and login page"
```

---

## Task 10: Home page (hero + recent sightings)

**Files:**
- Modify: `bcwildwatch-web/src/app/page.tsx`
- Create: `bcwildwatch-web/src/components/recent-sightings.tsx`

- [ ] **Step 1: Recent sightings (server component reading the API helper directly)**

```tsx
// src/components/recent-sightings.tsx
import { getRecentReports } from '@/lib/dataverse';
import { Card } from '@/components/ui/card';

export async function RecentSightings() {
  let reports: Awaited<ReturnType<typeof getRecentReports>> = [];
  try { reports = await getRecentReports(6); } catch { reports = []; }
  if (reports.length === 0) return <p className="text-sm text-muted-foreground">No recent sightings yet.</p>;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {reports.map((r) => (
        <Card key={r.id} className="p-4">
          <div className="font-semibold">{r.animal} · {r.address}</div>
          <div className="text-xs text-muted-foreground">{new Date(r.createdOn).toLocaleString()}</div>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Home page with animated hero (Framer Motion)**

```tsx
// src/app/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RecentSightings } from '@/components/recent-sightings';
import { Hero } from '@/components/hero';

export default function Home() {
  return (
    <div className="space-y-10">
      <Hero />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recent sightings</h2>
        <RecentSightings />
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Animated hero (client component)**

```tsx
// src/components/hero.tsx
'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="rounded-2xl bg-green-50 dark:bg-green-950/30 p-10 text-center"
    >
      <h1 className="text-3xl font-bold text-green-800 dark:text-green-300">Keep campus safe & wild</h1>
      <p className="mt-2 text-muted-foreground">Spotted a dangerous or nuisance animal? Let us know.</p>
      <Button asChild className="mt-6"><Link href="/report">Report a Sighting</Link></Button>
    </motion.section>
  );
}
```

- [ ] **Step 4: Manual verification**

`npm run dev` → Home shows animated hero + recent sightings (or empty-state). CTA navigates to `/report`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: home page with animated hero and recent sightings"
```

---

## Task 11: Report page (form + geolocation + upload)

**Files:**
- Create: `bcwildwatch-web/src/app/report/page.tsx`
- Create: `bcwildwatch-web/src/components/report-form.tsx`

- [ ] **Step 1: Report page (server wrapper)**

```tsx
// src/app/report/page.tsx
import { ReportForm } from '@/components/report-form';
export default function ReportPage() {
  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">Report a Sighting</h1>
      <ReportForm />
    </div>
  );
}
```

- [ ] **Step 2: Report form (client)**

```tsx
// src/components/report-form.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Animal { id: string; name: string; }

export function ReportForm() {
  const router = useRouter();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/animals').then((r) => r.json()).then((d) => setAnimals(d.animals ?? [])).catch(() => {});
  }, []);

  function captureLocation() {
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => toast.error('Could not get your location.'),
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    if (coords) { form.set('latitude', String(coords.lat)); form.set('longitude', String(coords.lng)); }
    const res = await fetch('/api/reports', { method: 'POST', body: form });
    setSubmitting(false);
    if (res.ok) { toast.success('Report submitted. Thank you!'); router.push('/'); }
    else { const d = await res.json().catch(() => ({})); toast.error(d.error ?? 'Submission failed.'); }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="animalId">Animal</Label>
        <select id="animalId" name="animalId" className="w-full rounded-md border bg-background p-2">
          <option value="">Select an animal…</option>
          {animals.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          <option value="OTHER">Other / not listed</option>
        </select>
      </div>
      <div>
        <Label htmlFor="addressDescription">Location / nearest building</Label>
        <Input id="addressDescription" name="addressDescription" required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required />
      </div>
      <div>
        <Label htmlFor="photo">Photo (optional, max 10MB)</Label>
        <Input id="photo" name="photo" type="file" accept="image/*" />
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" onClick={captureLocation}>
          {coords ? '📍 Location captured' : 'Use my location'}
        </Button>
      </div>
      <Button type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit report'}</Button>
    </form>
  );
}
```
> Add `<Toaster />` from `sonner` to the root layout if not already present (shadcn's `sonner` add may have done this — verify and add `import { Toaster } from '@/components/ui/sonner'` + `<Toaster />` inside `ThemeProvider`).

- [ ] **Step 3: Manual verification (end-to-end)**

`npm run dev`, sign in, open `/report`: animal dropdown populates from Dataverse, "Use my location" captures coords, submit with and without a photo. Confirm a new `bcw_report` row appears in Dataverse and (with photo) a file in SharePoint `BCWildWatch/` + a linked `bcw_media` row.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: report form with geolocation and photo upload"
```

---

## Task 12: Live Map page (Power BI embed)

**Files:**
- Create: `bcwildwatch-web/src/app/map/page.tsx`
- Modify: `bcwildwatch-web/next.config.ts` (CSP for Power BI)

- [ ] **Step 1: Map page**

```tsx
// src/app/map/page.tsx
export default function MapPage() {
  const url = process.env.POWERBI_MAP_URL;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Live Sightings Map</h1>
      {url
        ? <iframe title="BC WildWatch Map" src={url} className="h-[70vh] w-full rounded-lg border" allowFullScreen />
        : <p className="text-muted-foreground">Map URL not configured.</p>}
    </div>
  );
}
```

- [ ] **Step 2: CSP header in `next.config.ts`**

```ts
import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [{
        key: 'Content-Security-Policy',
        value: "frame-src 'self' https://app.powerbi.com; frame-ancestors 'self';",
      }],
    }];
  },
};
export default nextConfig;
```

- [ ] **Step 3: Manual verification**

Set `POWERBI_MAP_URL` in `.env.local`, run dev, open `/map` → the Power BI map renders inside the iframe.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: live map page with Power BI embed + CSP"
```

---

## Task 13: Deploy to Vercel

**Files:** none (platform config)

- [ ] **Step 1: Push branch and import to Vercel**

Push the repo. In Vercel → New Project → import the repo → set **Root Directory** to `bcwildwatch-web`. Framework auto-detects Next.js.

- [ ] **Step 2: Add environment variables in Vercel**

Add every variable from `.env.local.example` (Auth.js, Dataverse, Graph/SharePoint, `ADMIN_EMAILS`, `POWERBI_MAP_URL`). Set `AUTH_MICROSOFT_ENTRA_ID_ISSUER` to the tenant issuer. Add `AUTH_URL=https://<vercel-domain>` if Auth.js requires it.

- [ ] **Step 3: Add the production redirect URI**

In the Entra app registration add `https://<vercel-domain>/api/auth/callback/microsoft-entra-id`.

- [ ] **Step 4: Verify production**

Visit the Vercel URL → redirected to `/login` → sign in with a campus account → submit a test report → confirm Dataverse row + SharePoint file. Confirm a non-campus account is rejected.

- [ ] **Step 5: Commit any config changes**

```bash
git add -A && git commit -m "chore: vercel deployment config notes"
```

---

## Self-Review

**Spec coverage (Phase 1 items):**
- Stack/hosting → Tasks 1–2, 13. ✓
- Entra auth + domain lock + roles bootstrap (env allow-list defined in `env.ts`; role *lookup* is Phase 2) → Task 4. ✓ (role enforcement UI deferred to Phase 2 per phasing.)
- Report → Dataverse → Tasks 6, 8, 11. ✓
- Media → SharePoint via Graph → Tasks 7, 8, 11. ✓
- Home + Live Map → Tasks 10, 12. ✓
- Light/dark theme → Task 9. ✓
- Recent sightings → Tasks 6, 10. ✓

**Placeholder scan:** No "TBD/TODO" left as implementation gaps; the only flagged confirmations are *live-environment logical names* and *agreed dangerous-animal list*, which are genuine external inputs (spec §12), not code placeholders.

**Type consistency:** `Animal {id,name}` shared via `dataverse.helpers.ts`. `ReportInput` from `reportValidation.ts` is spread into `createReport`'s `NewReport` (matching `addressDescription/description/latitude/longitude/animalId` + `userId`). `getRecentReports` shape `{id,address,createdOn,animal}` matches `recent-sightings.tsx` usage. Provider id `microsoft-entra-id` used consistently in `auth.ts`, login, nav, and redirect URIs.

**Known deferrals (correct per phasing, not gaps):** My Reports, Admin view + dashboard, role lookup/enforcement, alert/confirmation flows (Phase 2); chatbot, safety info, QR code, deeper Framer Motion polish (Phase 3).
