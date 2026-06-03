# BC WildWatch™ — Web Portal Design

**Date:** 2026-06-03
**Module:** INL37(8)1 Project (50 marks)
**Goal:** Replace the retired Power Apps canvas app with a deployed, Entra-authenticated web portal on Vercel, fronting the existing Power Platform backend (Dataverse, SharePoint, Power BI).

---

## 1. Context & constraints

- A second-year canvas-app prototype exists; it is being **retired**. The website becomes the sole front end; Power Platform remains the backend.
- The prior repo (`bc-wildwatch/`) was built for **Azure Static Web Apps** (built-in Entra auth, Azure Functions). That hosting model is abandoned in favour of **Vercel**, so auth and the API layer are rebuilt. The old code is reference only.
- **No campus admin support** except a one-time Graph admin-consent approval the user can request via the admin-consent URL.
- The user owns:
  - An **app registration** on the Belgium Campus Entra tenant (created with a personal account). Multi-tenant, but restricted to `@belgiumcampus.ac.za`. User can edit redirect URIs and client secrets.
  - A **dedicated Dataverse environment** with full (System Admin) rights → can register an Application User / service principal.
  - A working **SharePoint** media store, **Power BI** dashboard (off Dataverse) and **Power BI** live sightings map.
- **Free-tier only.** Must integrate Power Apps backend, Power Automate, Power BI, and M365 A3 (Entra) auth.

---

## 2. Tech stack

- **Next.js (App Router) + TypeScript**
- **Tailwind CSS + shadcn/ui**, components sourced from **21st.dev**
- **Framer Motion** for animation/polish
- **Auth.js (NextAuth)** — Microsoft Entra ID provider
- Hosted on **Vercel**; all secrets in Vercel environment variables
- All backend access via Next.js **server-side route handlers** (`app/api/*`) — secrets never reach the browser

---

## 3. Authentication & authorisation

- **Login:** Auth.js Entra ID provider. Authority pinned to the **Belgium Campus tenant ID** (so login is tenant-locked despite the app being multi-tenant). The `signIn` callback **rejects any email not ending in `@belgiumcampus.ac.za`** (belt-and-suspenders).
- **Redirect URI:** `https://<vercel-domain>/api/auth/callback/azure-ad` (and a localhost equivalent for dev). User adds these to the app registration.
- **Roles:** `Student` (default) and `Admin`, stored as a flag/choice on the Dataverse `bcw_user` row. After login the server looks up the user's role.
  - **Bootstrap admins:** an env allow-list (`ADMIN_EMAILS`) so the team is not locked out before any role flag exists. Allow-listed users are treated as Admin and can promote others from the Admin view.
- **Route protection:** middleware guards all authenticated routes; the Admin view additionally checks role server-side.

---

## 4. Data & media architecture

**Report submission has no Power Automate in the path** — the Next.js server writes directly.

### 4.1 Reports → Dataverse (service principal)
- A **client-credentials (app-only)** flow acquires a Dataverse token. The same app registration is added as an **Application User** in the Dataverse environment with a security role granting read/write on `bcw_user`, `bcw_report`, `bcw_animal`, `bcw_media`.
- Server writes the `bcw_report` row and lazy-upserts the `bcw_user` (by email).
- Env vars: `AAD_CLIENT_ID`, `AAD_CLIENT_SECRET`, `AAD_TENANT_ID`, `DATAVERSE_URL`.

### 4.2 Photos → SharePoint (Microsoft Graph, app-only)
- Server uploads the file to the SharePoint document library via **Microsoft Graph** using **`Sites.ReadWrite.All`** (application permission). Requires **one-time tenant admin consent**, which the user obtains via the admin-consent URL.
  - (`Sites.Selected` would be more secure but adds a per-site grant step; rejected for ease of admin approval. Noted in the data-security report as a future hardening step.)
- After upload, the server creates a `bcw_media` row in Dataverse, links it to the report, and stores the file's accessible URL.
- The website renders photos from that stored URL.

### 4.3 Reads
Animals list, My Reports, recent-sightings feed, and the Admin all-reports list are read from Dataverse via the service principal.

### 4.4 Dataverse contract (verify logical names against the live environment)
| Table | Logical name(s) | Purpose |
|---|---|---|
| `bcw_users` | `bcw_userid`, `bcw_email`, `bcw_name`, role flag | User identity + role |
| `bcw_animals` | `bcw_animalid`, `bcw_name` | Animal catalogue |
| `bcw_reports` | `bcw_reportid`, `bcw_addressdescription`, `bcw_description`, `bcw_latitude`, `bcw_longitude`, `bcw_reporter` (→user), `bcw_animal` (→animal), status | Sighting reports |
| `bcw_media` | `bcw_mediaid`, link/url field, report lookup | Uploaded media |

> Field logical names must be confirmed in make.powerapps.com before implementation; the report status and `bcw_user` role fields may need to be **created** if absent.

---

## 5. Power Automate flows (built fresh — none currently exist)

1. **New-report alert** — triggers on creation of a `bcw_report` row → sends email to an admin/security address (env/config-driven). **High-priority subject** when the reported animal is dangerous (e.g. snake, bee swarm, stray dog).
2. **Reporter confirmation** — emails the reporter "report received."

Both run under the user's own M365 connection (no admin consent needed).

---

## 6. Chatbot

A **Copilot Studio** agent embedded in the site (custom-website channel snippet/iframe). Scope: how to report, "what do I do if I see X animal," safety FAQ. May call a flow if needed. Built in the Copilot Studio portal; the website only embeds it.

---

## 7. Pages & navigation

| Page | Access | Contents |
|---|---|---|
| Login | public | Entra sign-in (domain-locked) |
| Home | authenticated | Hero, "Report a Sighting" CTA, recent-sightings feed |
| Report | authenticated | Animal picker, geolocation + map pin/address, description, photo upload → submit |
| Live Map | authenticated | Power BI publish-to-web **map** iframe |
| My Reports | authenticated | User's own reports + status |
| Safety Info | authenticated | Static safety tips + embedded chatbot |
| Admin | Admin role only | Power BI **dashboard** iframe, all reports, status management, promote users |

**Embeds:** Power BI map + dashboard via publish-to-web iframes; CSP `frame-src` locked to `app.powerbi.com`.

---

## 8. Visual design

- **Direction A (Calm Nature)** base identity: earthy greens, soft rounded cards, reassuring tone — merged with **Direction B's** crisp, data-forward card treatment for report/list/admin views.
- **Light + dark** themes with a toggle.
- Built with shadcn/ui + 21st.dev components; Framer Motion for entrance/transition polish.
- Clean drop-in slot for the user's real **BC WildWatch logo** and brand colours (supplied later).

---

## 9. Security checklist (for the data-security report)

- Login tenant-locked + server-side `@belgiumcampus.ac.za` domain enforcement.
- All `/api/*` handlers require an authenticated session; Admin routes re-check role server-side.
- Service-principal secret + Graph permissions stored only in Vercel env vars (encrypted at rest).
- OData injection prevented via encoding/escaping on email filters.
- File size cap (client + server).
- CSP restricts iframes to `app.powerbi.com`.
- Documented future hardening: migrate `Sites.ReadWrite.All` → `Sites.Selected`.

---

## 10. Delivery phasing

- **Phase 1 (core):** scaffold (Next.js + Tailwind + shadcn + Auth.js), Entra login + domain lock, report → Dataverse, media → SharePoint, Home + Live Map, light/dark theme.
- **Phase 2:** My Reports, Admin view + dashboard embed, role model, alert + confirmation flows.
- **Phase 3:** Copilot Studio chatbot, Safety Info, QR code, Framer Motion polish.

---

## 11. Project deliverables (graded by the brief — in scope)

- **Architecture diagram** (system components + data flow).
- **QR code** resolving to the public HTTPS Vercel URL (free generator; optional logo branding).
- **5-page report:** technology-selection justification, deployment strategy, risk assessment, data-security plan, RACI matrix.
- Submission package: hosted URL / GitHub link, technical report, video presentation (video produced by the team).

---

## 12. Open items to confirm during implementation

- Exact Dataverse logical names; create `bcw_report` **status** field and `bcw_user` **role** field if missing.
- Power BI publish-to-web URLs for map and dashboard.
- Admin/security recipient email for alerts.
- SharePoint site/library IDs (drive path) for Graph upload.
- Final dangerous-animal list driving high-priority alerts.
