---
title: Deployment Specification
version: "0.1.0"
status: draft
date: 2026-03-17
authors:
  - Software Architect
reviewers:
  - Product Owner
  - Senior Backend Engineer
changelog:
  - version: "0.1.0"
    date: 2026-03-17
    description: Initial draft
---

# Deployment Specification

Operational runbook for deploying B1ngo to staging and production. For architectural rationale, see [ADR-0010](adrs/0010-deployment-architecture.md).

## 1. Prerequisites

### Accounts

| Service | URL | What to Create | Tier |
|---|---|---|---|
| **GitHub** | github.com | Repository with Actions enabled | Free |
| **Cloudflare** | dash.cloudflare.com | Account + Pages project | Free |
| **Railway** | railway.app | Account + two services | Free trial → Hobby ($5/month) |
| **Neon** | console.neon.tech | Account + two projects | Free |

### CLI Tools

| Tool | Install | Purpose |
|---|---|---|
| `dotnet` SDK 10 | [dot.net](https://dot.net/download) | Build and publish the API, run EF migrations |
| `node` 22+ / `npm` | [nodejs.org](https://nodejs.org) | Build the Angular SPA |
| `railway` CLI | `npm install -g @railway/cli` | Deploy to Railway from CI |
| `wrangler` CLI | `npm install -g wrangler` | Deploy to Cloudflare Pages from CI |
| `dotnet-ef` tool | `dotnet tool install --global dotnet-ef` | Run EF Core migrations in CI |
| `docker` | [docker.com](https://www.docker.com) | Local development (PostgreSQL via Docker Compose) |

### Domain

Register `b1ngo.dev` (or chosen domain) and add it to Cloudflare for DNS management.

## 2. Initial Setup

### 2.1 Neon — Database

1. Log in to [console.neon.tech](https://console.neon.tech).
2. Create project **`b1ngo-staging`**:
   - Region: `us-east-2` (or closest to Railway region).
   - PostgreSQL version: 17.
   - Database name: `b1ngo`.
   - Role: `b1ngo_owner` (auto-created).
3. Create project **`b1ngo-prod`** with the same settings.
4. For each project, copy the **pooled connection string** from the dashboard (Connection Details → Pooled connection). It looks like:
   ```
   Host=ep-xxxx-xxxx-123456.us-east-2.aws.neon.tech;Port=5432;Database=b1ngo;Username=b1ngo_owner;Password=<password>;SSL Mode=Require
   ```
   > Use the pooled endpoint (PgBouncer, port 5432). Do **not** use the direct endpoint — it bypasses connection pooling and will exhaust the free tier's 20-connection limit.

### 2.2 Railway — API

1. Log in to [railway.app](https://railway.app).
2. Create a new project. Inside it, create two services:

**Service: `b1ngo-api-staging`**
1. Connect to the GitHub repo → set the root directory to `server/`.
2. Railway auto-detects the `Dockerfile` at `server/src/B1ngo.Web/Dockerfile`.
3. Set the deploy branch to `main`.
4. Add environment variables (Settings → Variables):

   | Variable | Value |
   |---|---|
   | `ASPNETCORE_ENVIRONMENT` | `Staging` |
   | `ConnectionStrings__Database` | *(Neon b1ngo-staging pooled connection string)* |
   | `AllowedOrigins` | `https://staging.b1ngo.dev` |

5. Under Settings → Networking, generate a public domain (e.g., `b1ngo-api-staging.up.railway.app`).
6. Add custom domain `api-staging.b1ngo.dev` (see section 2.4).

**Service: `b1ngo-api-prod`**
1. Same GitHub repo, root directory `server/`.
2. **Disable automatic deploys** — production is deployed manually via GitHub Actions.
3. Add environment variables:

   | Variable | Value |
   |---|---|
   | `ASPNETCORE_ENVIRONMENT` | `Production` |
   | `ConnectionStrings__Database` | *(Neon b1ngo-prod pooled connection string)* |
   | `AllowedOrigins` | `https://b1ngo.dev` |

4. Generate public domain and add custom domain `api.b1ngo.dev`.

### 2.3 Cloudflare Pages — SPA

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com).
2. Go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Select the GitHub repo.
4. Configure the build:

   | Setting | Value |
   |---|---|
   | Production branch | `main` |
   | Build command | `cd client/ui && npm ci && npx ng build --configuration production` |
   | Build output directory | `client/ui/dist/ui/browser` |
   | Root directory | `/` |

5. Add environment variables for the build:

   | Variable | Value (Production) | Value (Preview) |
   |---|---|---|
   | `API_BASE_URL` | `https://api.b1ngo.dev` | `https://api-staging.b1ngo.dev` |

   > The Angular build should read `API_BASE_URL` from the environment to configure the API endpoint in `environment.ts` / `environment.staging.ts`. This requires a build-time substitution (e.g., using `fileReplacements` in `angular.json`).

6. Cloudflare Pages automatically deploys:
   - **Production deployment**: when `main` branch builds succeed (matches production branch setting).
   - **Preview deployment**: for pull request commits (used as staging preview).

   > **Note**: Since trunk-based development pushes directly to `main`, the Cloudflare Pages production deployment triggers on every push to `main`. To separate staging from production, either: (a) use the GitHub Actions workflow to deploy via Wrangler CLI with explicit environment targeting, or (b) use Cloudflare Pages' "preview" deployments for staging and the auto-production deployment for production. Option (a) is recommended for consistency with the API deployment model.

### 2.4 Custom Domains — DNS Configuration

In Cloudflare DNS for `b1ngo.dev`:

| Type | Name | Target | Proxy |
|---|---|---|---|
| CNAME | `@` (root) | Cloudflare Pages (auto-configured) | Proxied (orange cloud) |
| CNAME | `staging` | Cloudflare Pages (auto-configured) | Proxied (orange cloud) |
| CNAME | `api` | `b1ngo-api-prod.up.railway.app` | **DNS only** (gray cloud) |
| CNAME | `api-staging` | `b1ngo-api-staging.up.railway.app` | **DNS only** (gray cloud) |

**Critical**: API subdomains (`api.*`) must use **DNS only** mode (gray cloud icon). Enabling Cloudflare proxy on these would interfere with Railway's TLS termination and WebSocket upgrade handling.

To add custom domains in Cloudflare Pages:
1. Go to the Pages project → Custom domains → Add domain.
2. Add `b1ngo.dev` and `staging.b1ngo.dev`.
3. Cloudflare automatically creates the CNAME records and provisions SSL.

To add custom domains in Railway:
1. Go to each service → Settings → Networking → Custom Domain.
2. Add `api.b1ngo.dev` and `api-staging.b1ngo.dev` respectively.
3. Railway provides the CNAME target and auto-provisions a Let's Encrypt certificate once DNS propagates.

## 3. GitHub Actions Workflows

### 3.1 Staging Deployment (`.github/workflows/deploy-staging.yml`)

**Trigger**: `push` to `main`

**Jobs**:

1. **`test`** — Run all tests
   - Checkout code
   - Set up .NET 10 SDK
   - Restore, build, and run tests: `dotnet test server/B1ngo.sln`
   - Integration tests use Testcontainers (requires Docker in the runner — use `ubuntu-latest`)
   - Fail the workflow if any test fails

2. **`migrate-staging`** — Run EF migrations against staging database
   - Depends on: `test`
   - Set up .NET 10 SDK
   - Install `dotnet-ef` tool
   - Run: `dotnet ef database update --project server/src/B1ngo.Infrastructure.Postgresql --startup-project server/src/B1ngo.Web`
   - Connection string from secret: `${{ secrets.NEON_STAGING_CONNECTION_STRING }}`
   - Inject via environment variable: `ConnectionStrings__Database`

3. **`deploy-api-staging`** — Deploy API to Railway
   - Depends on: `migrate-staging`
   - Install Railway CLI
   - Authenticate: `railway login --token ${{ secrets.RAILWAY_TOKEN }}`
   - Link to staging service and deploy: `railway up --service b1ngo-api-staging`

4. **`deploy-spa-staging`** — Deploy SPA to Cloudflare Pages
   - Depends on: `test` (runs in parallel with migration + API deploy)
   - Set up Node.js 22
   - Install dependencies: `cd client/ui && npm ci`
   - Build: `npx ng build --configuration staging`
   - Deploy: `wrangler pages deploy client/ui/dist/ui/browser --project-name b1ngo --branch staging`
   - Authenticate via: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets

### 3.2 Production Deployment (`.github/workflows/deploy-production.yml`)

**Trigger**: `workflow_dispatch` (manual, from GitHub Actions UI)

**Inputs**: Optional commit SHA (defaults to latest `main`).

**Jobs**:

1. **`migrate-prod`** — Run EF migrations against production database
   - Set up .NET 10 SDK, install `dotnet-ef`
   - Run: `dotnet ef database update --project server/src/B1ngo.Infrastructure.Postgresql --startup-project server/src/B1ngo.Web`
   - Connection string from secret: `${{ secrets.NEON_PROD_CONNECTION_STRING }}`

2. **`deploy-api-prod`** — Deploy API to Railway
   - Depends on: `migrate-prod`
   - Same steps as staging, targeting `b1ngo-api-prod` service

3. **`deploy-spa-prod`** — Deploy SPA to Cloudflare Pages production
   - Runs in parallel with migration + API deploy
   - Build: `npx ng build --configuration production`
   - Deploy: `wrangler pages deploy client/ui/dist/ui/browser --project-name b1ngo --branch main`
   - Deploying to the `main` branch in Cloudflare Pages triggers a production deployment

## 4. Environment Variables Reference

### Railway — API Services

| Variable | Service | Example Value | Description |
|---|---|---|---|
| `ASPNETCORE_ENVIRONMENT` | Both | `Staging` / `Production` | Controls .NET environment behavior |
| `ConnectionStrings__Database` | Both | `Host=ep-xxxx.us-east-2.aws.neon.tech;Port=5432;Database=b1ngo;Username=b1ngo_owner;Password=secret;SSL Mode=Require` | Neon pooled connection string |
| `AllowedOrigins` | Both | `https://staging.b1ngo.dev` / `https://b1ngo.dev` | CORS allowed origins (semicolon-separated) |
| `PORT` | Both | `8080` | Railway injects this automatically; Kestrel must listen on this port |

### Cloudflare Pages — SPA Build

| Variable | Environment | Example Value | Description |
|---|---|---|---|
| `API_BASE_URL` | Preview | `https://api-staging.b1ngo.dev` | API base URL for staging builds |
| `API_BASE_URL` | Production | `https://api.b1ngo.dev` | API base URL for production builds |

### GitHub Actions — Secrets

| Secret Name | Description |
|---|---|
| `NEON_STAGING_CONNECTION_STRING` | Full Neon pooled connection string for staging |
| `NEON_PROD_CONNECTION_STRING` | Full Neon pooled connection string for production |
| `RAILWAY_TOKEN` | Railway API token (from railway.app → Account → Tokens) |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages edit permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID (from dashboard URL or API) |

## 5. How to Deploy to Staging

Staging deploys are **automatic**. The flow:

1. Developer pushes to `main` (direct push or merged PR).
2. GitHub Actions `deploy-staging.yml` triggers.
3. Tests run (unit + integration with Testcontainers).
4. If tests pass:
   - EF migrations run against `b1ngo-staging` Neon database.
   - API deploys to Railway `b1ngo-api-staging`.
   - SPA deploys to Cloudflare Pages (preview/staging deployment).
5. Staging is live at:
   - SPA: `https://staging.b1ngo.dev`
   - API: `https://api-staging.b1ngo.dev`
   - API docs: `https://api-staging.b1ngo.dev/scalar/v1` (if enabled for Staging environment)

**Verify staging deployment**:
- Check GitHub Actions run for green status.
- Open `https://staging.b1ngo.dev` — SPA loads.
- Open `https://api-staging.b1ngo.dev/openapi/v1.json` — OpenAPI spec returns.
- Create a room via API to verify database connectivity.

## 6. How to Promote to Production

Production deploys are **manual**. The flow:

1. Verify staging is working correctly (smoke test).
2. Go to GitHub → Actions → **Deploy to Production** workflow.
3. Click **Run workflow**.
4. Optionally specify a commit SHA (defaults to `HEAD` of `main`).
5. The workflow runs:
   - EF migrations against `b1ngo-prod` Neon database.
   - API deploys to Railway `b1ngo-api-prod`.
   - SPA deploys to Cloudflare Pages production.
6. Production is live at:
   - SPA: `https://b1ngo.dev`
   - API: `https://api.b1ngo.dev`

**Post-deployment verification**:
- Open `https://b1ngo.dev` — SPA loads.
- Open `https://api.b1ngo.dev/openapi/v1.json` — OpenAPI spec returns.
- Create a room and join with a second browser to verify full flow including SignalR.

## 7. How to Run Migrations

### Local (Development)

Migrations run automatically on startup (`MigrateAsync()` in `WebApplicationExtensions.cs:30-33`, guarded by `IsDevelopment()`). No manual action needed.

To apply manually:
```bash
cd server
dotnet ef database update \
  --project src/B1ngo.Infrastructure.Postgresql \
  --startup-project src/B1ngo.Web
```

### Staging and Production

Migrations run as a CI step in the GitHub Actions workflow (see section 3). To run manually against a remote database:

```bash
ConnectionStrings__Database="<neon-connection-string>" \
dotnet ef database update \
  --project server/src/B1ngo.Infrastructure.Postgresql \
  --startup-project server/src/B1ngo.Web
```

> **Warning**: Only run manual migrations as a last resort. Prefer the CI pipeline for auditability.

### Creating a New Migration

```bash
cd server
dotnet ef migrations add <MigrationName> \
  --project src/B1ngo.Infrastructure.Postgresql \
  --startup-project src/B1ngo.Web
```

Review the generated migration file. Commit it to `main`. The staging pipeline will apply it automatically.

## 8. How to Rollback

### API Rollback (Railway)

Railway keeps a history of deployments for each service.

1. Go to [railway.app](https://railway.app) → Project → Service (`b1ngo-api-staging` or `b1ngo-api-prod`).
2. Click **Deployments**.
3. Find the last known-good deployment.
4. Click **Redeploy** to roll back to that version.

Alternative via CLI:
```bash
railway login --token <RAILWAY_TOKEN>
railway service b1ngo-api-prod
railway rollback
```

### SPA Rollback (Cloudflare Pages)

Cloudflare Pages keeps a history of all deployments.

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Workers & Pages → `b1ngo` project.
2. Click **Deployments**.
3. Find the last known-good deployment.
4. Click the three-dot menu → **Rollback to this deployment**.

The rollback is instant (Cloudflare serves the previous build from CDN).

### Database Rollback

EF Core migrations do not auto-generate "down" migrations. Rollback strategies:

**Option A — Reverse migration (preferred for schema-only changes)**:
```bash
# Roll back to a specific migration
ConnectionStrings__Database="<connection-string>" \
dotnet ef database update <PreviousMigrationName> \
  --project server/src/B1ngo.Infrastructure.Postgresql \
  --startup-project server/src/B1ngo.Web
```
This runs the `Down()` methods of migrations after the specified target. Only works if the `Down()` methods are correctly implemented.

**Option B — Neon point-in-time restore (for data loss scenarios)**:
1. Go to [console.neon.tech](https://console.neon.tech) → Project → Branches.
2. Create a new branch from a point in time before the bad migration.
3. Update the connection string to point to the new branch.

**Option C — Manual SQL (for targeted fixes)**:
Connect to Neon via `psql` or a database client and manually reverse the schema change. Update the `__EFMigrationsHistory` table to remove the bad migration record.

> **Rule**: Every migration PR should document its rollback strategy in the PR description. "How do we undo this?" must have an answer before merging.

## 9. Monitoring and Logs

### API Logs (Railway)

- **Dashboard**: railway.app → Project → Service → **Observability** tab.
- **CLI**: `railway logs --service b1ngo-api-staging` (or `b1ngo-api-prod`).
- Railway streams stdout/stderr from the container. ASP.NET Core's default console logger writes here.
- Filter by deployment to isolate logs from a specific release.

### SPA Logs (Cloudflare Pages)

- **Build logs**: dash.cloudflare.com → Workers & Pages → `b1ngo` → Deployments → click a deployment.
- **Runtime**: Cloudflare Pages serves static files; there are no server-side runtime logs. Client-side errors must be captured by the SPA (e.g., via a future error reporting service).

### Database Logs (Neon)

- **Dashboard**: console.neon.tech → Project → Monitoring.
- Neon shows: active connections, query volume, storage usage, compute usage.
- **Query insights**: console.neon.tech → Project → SQL Editor → run diagnostic queries.
- **Alerts**: Neon free tier does not include alerting. Monitor storage usage manually (0.5 GB limit).

### Health Checks

| Service | Endpoint | Expected |
|---|---|---|
| API (staging) | `GET https://api-staging.b1ngo.dev/openapi/v1.json` | 200 OK with JSON |
| API (prod) | `GET https://api.b1ngo.dev/openapi/v1.json` | 200 OK with JSON |
| SPA (staging) | `GET https://staging.b1ngo.dev` | 200 OK with HTML |
| SPA (prod) | `GET https://b1ngo.dev` | 200 OK with HTML |

> **Recommendation**: Add a dedicated `/health` endpoint to the API that checks database connectivity. Use it for Railway health checks and external uptime monitoring.

## 10. Troubleshooting

### Railway Cold Starts

**Symptom**: First request after inactivity takes 5-15 seconds.
**Cause**: Railway hobby tier may spin down inactive services.
**Fix**:
- Upgrade to Railway Pro ($20/month) for always-on instances.
- Or set up an external health check ping (e.g., UptimeRobot, free tier) hitting the API every 5 minutes to keep the service warm.

### Neon Connection Limits

**Symptom**: `too many clients already` or `connection refused` errors in API logs.
**Cause**: Neon free tier allows 20 concurrent connections. If the app opens connections without pooling, limits are hit quickly.
**Fix**:
- Ensure the connection string uses the **pooled** endpoint (PgBouncer). Check that the host starts with `ep-` and uses port `5432`.
- Reduce EF Core's connection pool size in the connection string: `Maximum Pool Size=10`.
- If still hitting limits, check for connection leaks (disposable `DbContext` not disposed).

### CORS Errors

**Symptom**: Browser console shows `Access-Control-Allow-Origin` errors. API requests fail from the SPA.
**Cause**: API's CORS policy doesn't include the SPA's origin.
**Fix**:
- Verify `AllowedOrigins` environment variable on Railway matches the SPA's exact origin (including `https://` and no trailing slash).
- Staging: `https://staging.b1ngo.dev` (not `http://`, not `staging.b1ngo.dev`).
- Production: `https://b1ngo.dev`.
- After updating the variable, redeploy the API service on Railway.

### WebSocket / SignalR Connection Failures

**Symptom**: SignalR falls back to long-polling, or the `/hubs/game` connection fails entirely.
**Cause**: Cloudflare proxy (orange cloud) is enabled on the API subdomain, intercepting WebSocket upgrade headers.
**Fix**:
- In Cloudflare DNS, ensure `api.b1ngo.dev` and `api-staging.b1ngo.dev` are set to **DNS only** (gray cloud). Railway handles TLS and WebSocket proxying directly.
- Verify the SPA connects to SignalR using the correct API base URL (`wss://api.b1ngo.dev/hubs/game`, not the SPA domain).

### Migrations Fail in CI

**Symptom**: `deploy-staging` workflow fails at the `migrate-staging` job.
**Cause**: Various — connection string wrong, Neon project suspended, migration has breaking changes.
**Fix**:
1. Check the GitHub Actions log for the exact error message.
2. Verify the `NEON_STAGING_CONNECTION_STRING` secret is correct (Neon rotates passwords on project reset).
3. Check that the Neon project is active (free-tier projects auto-suspend after 5 days of inactivity — log in to the Neon console to reactivate).
4. If the migration itself is broken, fix it locally, push, and let CI retry.

### SPA Shows Stale Content

**Symptom**: After deployment, the SPA still shows old content.
**Cause**: Cloudflare CDN cache serving the previous build.
**Fix**:
- Cloudflare Pages automatically purges the cache on new deployments. If stale, hard-refresh the browser (`Ctrl+Shift+R`).
- If persists, go to Cloudflare dashboard → Caching → Purge Everything.

### Neon Project Auto-Suspends

**Symptom**: API returns database connection errors after several days of inactivity.
**Cause**: Neon free tier auto-suspends compute after 5 minutes of inactivity (compute restarts on next connection, but there's a ~1 second cold start).
**Fix**:
- This is expected behavior. Neon compute scales to zero and wakes on demand. The first query after suspension takes ~1-2 seconds.
- If combined with Railway cold starts, the first request may take 10+ seconds. An external health check ping mitigates both.
- Neon's auto-suspend timeout can be increased on paid tiers.
