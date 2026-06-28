# Deploy ShariEstate (free tier)

Stack: **Vercel** (web) + **Render** (API) + **Neon** (PostgreSQL)

Estimated time: ~20 minutes

---

## Before you start

- [ ] GitHub account
- [ ] [neon.tech](https://neon.tech) account (free Postgres)
- [ ] [render.com](https://render.com) account (free API)
- [ ] [vercel.com](https://vercel.com) account (free Next.js)

Run locally to verify the build:

```powershell
cd D:\Projects\realEstate
pnpm install
pnpm build
```

---

## Step 1 — Push code to GitHub

```powershell
cd D:\Projects\realEstate
git init
git add .
git commit -m "Initial commit — ShariEstate"
```

1. Go to [github.com/new](https://github.com/new)
2. Create a repo (e.g. `shari-estate`) — **no** README/license (repo already has files)
3. Run:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/shari-estate.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Create PostgreSQL on Neon

1. [Neon Console](https://console.neon.tech) → **New Project**
2. Name: `shari-estate`, region: closest to you
3. Copy the **connection string** (must include `?sslmode=require`)

Example:

```
postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

Save this as `DATABASE_URL` — you will need it in Step 3.

---

## Step 3 — Deploy API on Render

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect your GitHub account and select the `shari-estate` repo
3. Render reads `render.yaml` and creates **shari-estate-api**
4. When prompted, set these **secret** env vars:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon connection string from Step 2 |
| `CORS_ORIGIN` | `https://YOUR-APP.vercel.app` (update after Step 4) |
| `WEB_URL` | same as CORS_ORIGIN |
| `PUBLIC_URL` | `https://shari-estate-api.onrender.com` (your Render URL) |

5. Click **Apply** and wait for the first deploy (~5–10 min)

**First deploy only — seed demo data:**

1. Render → **shari-estate-api** → **Environment**
2. Set `RUN_SEED` = `true`
3. **Manual Deploy** → Deploy latest commit
4. After deploy succeeds, set `RUN_SEED` back to `false` and redeploy

**Check API:** open `https://YOUR-API.onrender.com/api/v1/geo/states` — should return JSON.

Swagger: `https://YOUR-API.onrender.com/api/docs`

> Free Render services sleep after ~15 min idle. First request after sleep may take 30–60 seconds.

---

## Step 4 — Deploy web on Vercel

1. [vercel.com/new](https://vercel.com/new) → Import Git Repository → select `shari-estate`
2. Configure project:

| Setting | Value |
|---------|--------|
| **Root Directory** | `apps/web` |
| **Framework** | Next.js (auto-detected) |
| **Build Command** | (leave default — uses `apps/web/vercel.json`) |

3. **Environment Variables:**

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-API.onrender.com/api/v1` |

4. Click **Deploy**

Your site URL will be like `https://shari-estate-xxx.vercel.app`

---

## Step 5 — Link frontend and API

Go back to **Render** → **shari-estate-api** → **Environment** and update:

```
CORS_ORIGIN=https://YOUR-APP.vercel.app
WEB_URL=https://YOUR-APP.vercel.app
```

Save → Render will redeploy automatically.

---

## Step 6 — Test

1. Open your Vercel URL
2. Browse **California → Search**
3. Log in: `buyer@example.com` / `Password123!`
4. Test favorites, saved searches, property detail

---

## Optional services (skip on free tier)

| Service | Env var | Notes |
|---------|---------|--------|
| Redis | `REDIS_URL` | Upstash free tier — caching only |
| Meilisearch | `MEILISEARCH_HOST` | Search uses PostgreSQL without it |
| Email | `RESEND_API_KEY` | Alerts skipped if empty |
| Stripe | `STRIPE_*` | Featured payments optional |

---

## Troubleshooting

### API returns 502 / timeout
- Render free tier is waking up — wait 60s and retry
- Check Render **Logs** for Prisma / DATABASE_URL errors

### CORS errors in browser
- `CORS_ORIGIN` on Render must exactly match your Vercel URL (no trailing slash)
- For preview deploys, add comma-separated origins: `https://app.vercel.app,https://app-git-main.vercel.app`

### Search shows 0 results / API offline banner
- Confirm `NEXT_PUBLIC_API_URL` on Vercel points to live Render API
- Confirm `RUN_SEED=true` was run once

### Build fails on Vercel
- Root Directory must be `apps/web`
- Node 20+ (set in Vercel → Settings → Node.js Version)

### Build fails on Render
- Check `DATABASE_URL` includes `sslmode=require`
- View build logs for `prisma generate` errors

---

## Redeploy after code changes

```powershell
git add .
git commit -m "Your change"
git push
```

Vercel and Render auto-deploy on push to `main`.
