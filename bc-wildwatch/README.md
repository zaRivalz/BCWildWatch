# 🌿 BC WildWatch — Web Portal

**Azure Static Web Apps** front-end for the Belgium Campus Animal Safety Reporting System.

---

## Architecture Overview

```
Browser (belgiumcampus.ac.za users only)
  │
  │  SWA built-in Entra ID auth (/.auth/login/aad)
  │  — Tenant-locked to belgiumcampus.ac.za via openIdIssuer
  │
  ├─ GET  /api/get-animals   → Node Function → Dataverse bcw_animal
  ├─ POST /api/submit-report → Node Function:
  │      1. Parse user claims (x-ms-client-principal)
  │      2. Lazy-upsert bcw_user (email → GUID)
  │      3. Create bcw_report (lat/lng, address, description, lookups)
  │      4. [if file] POST to Power Automate HTTP trigger
  │                   → SharePoint upload + bcw_media row
  └─ Map view: plain <iframe> → Power BI Publish-to-Web URL
```

**Cost: $0** — SWA Free tier + built-in auth + Dataverse service principal.

---

## Prerequisites

| What | Where to get it |
|---|---|
| Azure subscription (free tier OK) | portal.azure.com |
| GitHub account | github.com |
| **System Admin** role on your Dataverse environment | Power Platform Admin Center |
| Permission to create App Registrations in Entra ID | Your BC tenant (students can do this by default) |

---

## Step 1 — Create the App Registration

> This single App Registration is used for **both** SWA login AND Dataverse API access.

1. Go to [Entra ID → App Registrations → New registration](https://entra.microsoft.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Name: `BCWildWatch-Portal`
3. Supported account types: **Accounts in this organizational directory only (Belgium Campus only — Single tenant)**
4. Redirect URI: **Web** → leave blank for now (you will add it after SWA is created)
5. Click **Register**
6. Copy the **Application (client) ID** and **Directory (tenant) ID** — you will need them.
7. Go to **Certificates & secrets → New client secret**
   - Description: `SWA Production`
   - Expires: 24 months
   - Copy the **secret Value** immediately (it is only shown once).
8. Go to **API permissions → Add permission**
   - Select **Microsoft APIs → Microsoft Graph → Delegated**
   - Add: `openid`, `profile`, `email`
   - Click **Grant admin consent** ← *This only needs consent for basic profile scopes, which any user with the right role can do. If you cannot, the app will still work; users will just be prompted once on first login.*

> **No Dynamics CRM permission is needed on the App Registration.**
> Dataverse access is granted via the Application User in Power Platform (Step 3).

---

## Step 2 — Create the Azure Static Web App

### Via Azure Portal

1. Search for **Static Web Apps** → **Create**
2. Settings:
   - Resource Group: `rg-bcwildwatch`
   - Name: `bcwildwatch-portal`
   - Plan type: **Free**
   - Region: West Europe (or closest to you)
   - Source: **GitHub**
   - Connect your GitHub account → select this repository
   - Branch: `main`
   - Build presets: **Custom**
   - App location: `bc-wildwatch/public`
   - Api location: `bc-wildwatch/api`
   - Output location: *(leave empty)*
3. Click **Review + Create → Create**
4. After creation, go to the resource → copy your **SWA URL** (e.g. `https://bcwildwatch-abc123.azurestaticapps.net`)

### Add the Redirect URI to your App Registration

1. Back in Entra ID → App Registrations → `BCWildWatch-Portal`
2. **Authentication → Add a platform → Web**
3. Redirect URI: `https://YOUR_SWA_URL/.auth/login/aad/callback`
4. Save.

### Copy the Deployment Token to GitHub

1. Azure Portal → your SWA → **Manage deployment token** → copy it
2. GitHub → your repo → **Settings → Secrets and variables → Actions → New secret**
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: paste the deployment token

---

## Step 3 — Register the App as a Dataverse Application User

> **You need System Admin or Environment Admin role in your Dataverse environment to do this — not Global Admin.**

1. Go to [Power Platform Admin Center](https://admin.powerplatform.microsoft.com)
2. **Environments → [your BC WildWatch environment] → Settings → Users + permissions → Application users**
3. Click **+ New app user**
4. Select your `BCWildWatch-Portal` App Registration (search by name or client ID)
5. Select your environment's **Business unit**
6. Assign a security role — create a custom role or use an existing one that allows:
   - **Read/Write** on `bcw_user`, `bcw_report`, `bcw_animal`, `bcw_media`
   - Suggested name: `BCWildWatch Service Account`
7. Save.

---

## Step 4 — Update `staticwebapp.config.json`

Open `bc-wildwatch/staticwebapp.config.json` and replace:

```json
"openIdIssuer": "https://login.microsoftonline.com/YOUR_TENANT_ID/v2.0"
```

Replace `YOUR_TENANT_ID` with your **Directory (tenant) ID** GUID from Step 1.

---

## Step 5 — Configure Application Settings in SWA

In Azure Portal → your SWA → **Configuration → Application settings**, add:

| Setting name | Value |
|---|---|
| `AAD_CLIENT_ID` | App Registration client ID (from Step 1) |
| `AAD_CLIENT_SECRET` | Client secret value (from Step 1) |
| `AAD_TENANT_ID` | Directory (tenant) ID GUID (from Step 1) |
| `DATAVERSE_URL` | `https://orgXXXXXXXX.crm4.dynamics.com` ← your org URL |
| `POWER_AUTOMATE_MEDIA_URL` | Your Power Automate HTTP trigger URL (add after Step 6) |

**Save** — SWA will restart automatically.

> To find your Dataverse org URL: Power Platform Admin Center → Environments → your env → copy the **Environment URL**.

---

## Step 6 — Update Your Power Automate Flow

In your existing Power Automate flow for media handling:

1. **Delete the Power Apps trigger**
2. Add a new trigger: **"When an HTTP request is received"** (premium-free if you have M365 A3)
3. Set the **Request Body JSON Schema** to:

```json
{
  "type": "object",
  "properties": {
    "fileName":     { "type": "string" },
    "fileContent":  { "type": "string", "description": "Base64-encoded file bytes" },
    "reportId":     { "type": "string", "description": "Dataverse bcw_report GUID" },
    "fileMimeType": { "type": "string" },
    "submittedBy":  { "type": "string", "description": "User email" }
  },
  "required": ["fileName", "fileContent", "reportId"]
}
```

4. **Save the flow** → copy the generated **HTTP POST URL**
5. Paste that URL into the `POWER_AUTOMATE_MEDIA_URL` SWA app setting (Step 5)

**Inside your flow**, after the trigger, your existing actions should:
- Decode the base64 `fileContent` and upload it to the SharePoint Document Library (`BCWildWatchTeam2`)
- Create a sharing link
- Create a `bcw_media` row in Dataverse and bind it to the `reportId` via the relationship `bcw_Report_LinkedReport_bcw_Media`

---

## Step 7 — Embed the Power BI Map

1. In Power BI → open your campus incident map report
2. **File → Embed report → Publish to web (public)**
3. Copy the generated `<iframe>` src URL
4. Open `bc-wildwatch/public/index.html`
5. Find the line:

```html
src="REPLACE_WITH_POWER_BI_PUBLISH_TO_WEB_URL"
```

Replace the value with your actual Power BI URL and commit.

---

## Step 8 — Verify Dataverse Field Names

The API functions use the following logical names — verify these match your actual Dataverse schema:

| Table | Logical name | Purpose |
|---|---|---|
| `bcw_users` | `bcw_email` | Email address |
| `bcw_users` | `bcw_name` | Display name |
| `bcw_users` | `bcw_userid` | Primary key |
| `bcw_animals` | `bcw_animalid` | Primary key |
| `bcw_animals` | `bcw_name` | Animal display name |
| `bcw_reports` | `bcw_reportid` | Primary key |
| `bcw_reports` | `bcw_addressdescription` | Address text |
| `bcw_reports` | `bcw_description` | ⚠️ Confirm this field exists on bcw_report |
| `bcw_reports` | `bcw_latitude` | Decimal latitude |
| `bcw_reports` | `bcw_longitude` | Decimal longitude |
| `bcw_reports` | `bcw_reporter` | Lookup → bcw_user |
| `bcw_reports` | `bcw_animal` | Lookup → bcw_animal |

To check: In Power Apps / make.powerapps.com → Dataverse → Tables → select table → Columns → look at the **Logical name** column (not the display name).

---

## Local Development

```bash
# 1. Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# 2. Install API dependencies
cd bc-wildwatch/api && npm install && cd ../..

# 3. Copy and fill in local settings
cp bc-wildwatch/api/local.settings.json.example bc-wildwatch/api/local.settings.json
# Edit local.settings.json with your real values

# 4. Start the local dev server (emulates SWA auth + functions)
swa start bc-wildwatch/public --api-location bc-wildwatch/api

# App runs at http://localhost:4280
# Auth is mocked in local mode — use /.auth/login/aad to simulate login
```

---

## Project Structure

```
bc-wildwatch/
├── .github/workflows/
│   └── azure-static-web-apps.yml   ← CI/CD pipeline
├── api/
│   ├── host.json                   ← Azure Functions host config
│   ├── package.json
│   └── src/functions/
│       ├── dataverseClient.js      ← Shared Dataverse + token logic
│       ├── getAnimals.js           ← GET /api/get-animals
│       ├── getMe.js                ← GET /api/me  (+ parsePrincipal util)
│       └── submitReport.js         ← POST /api/submit-report
├── public/
│   ├── index.html                  ← SPA shell (login + all views)
│   ├── css/styles.css              ← Wildlife-themed responsive CSS
│   └── js/
│       ├── main.js                 ← Auth check, routing, animal grid
│       └── report.js               ← Geolocation, file upload, form submit
├── .gitignore
├── staticwebapp.config.json        ← Auth, routing, security headers
└── README.md
```

---

## Security Checklist

- [x] Auth restricted to single Entra tenant (`belgiumcampus.ac.za`) via `openIdIssuer`
- [x] `domain_hint` parameter accelerates login to correct tenant
- [x] All `/api/*` routes require `authenticated` role (in `staticwebapp.config.json`)
- [x] Server-side tenant check (belt-and-suspenders) in `submitReport.js`
- [x] Power Automate webhook URL stored server-side only (never in browser code)
- [x] Client credentials secret stored in SWA app settings (encrypted at rest)
- [x] No `AAD_CLIENT_SECRET` or `POWER_AUTOMATE_MEDIA_URL` in source code
- [x] `X-Frame-Options: SAMEORIGIN` — iframes only from same origin
- [x] CSP allows `frame-src` only to `app.powerbi.com`
- [x] File size capped at 10 MB client-side and 12 MB server-side
- [x] OData injection prevented via `encodeURIComponent` + quote-escaping on email filter

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Login loop / 401 on every page | `openIdIssuer` tenant ID wrong | Double-check the GUID in `staticwebapp.config.json` |
| "Failed to load animals" | Dataverse env URL wrong or app not added as Application User | Check `DATAVERSE_URL` setting; re-do Step 3 |
| Report submits but no row in Dataverse | Field logical names wrong | Cross-check table column names in make.powerapps.com |
| File uploaded but no `bcw_media` row | Power Automate flow trigger not updated | Re-do Step 6 and ensure flow is turned on |
| Map shows blank iframe | Power BI URL not replaced | Edit `index.html` → replace the placeholder src |
| CORS error on API call | Running locally without SWA CLI | Use `swa start` instead of a plain HTTP server |
