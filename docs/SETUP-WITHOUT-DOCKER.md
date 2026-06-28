# Local setup without Docker (Windows)

Use this if `docker` is not installed. PostgreSQL 17 is already on your machine.

Redis and Meilisearch are **optional** — the app runs without them (caching/search fall back gracefully).

## 1. Create the database

Open **SQL Shell (psql)** from the Start menu, or run in PowerShell:

```powershell
psql -U postgres
```

Then in the `postgres=#` prompt:

```sql
CREATE USER realestate WITH PASSWORD 'realestate' CREATEDB;
CREATE DATABASE realestate OWNER realestate;
GRANT ALL PRIVILEGES ON DATABASE realestate TO realestate;
\q
```

If you already created the user without `CREATEDB`, run this once as `postgres`:

```sql
ALTER USER realestate CREATEDB;
```

If you prefer using the `postgres` superuser only, edit `apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/realestate?schema=public"
```

And create only the database:

```sql
CREATE DATABASE realestate;
```

## 2. Install dependencies & migrate

From the project root (`D:\Projects\realEstate`):

```powershell
pnpm install
pnpm db:push
pnpm db:seed
```

Use `pnpm db:push` for local setup (no shadow database needed). Use `pnpm db:migrate` only if the DB user has `CREATEDB` permission.

## 3. Start the app

```powershell
pnpm dev
```

| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| API | http://localhost:3001/api/v1 |
| Swagger | http://localhost:3001/api/docs |

## Demo login

Password for all accounts: `Password123!`

- **Admin:** admin@realestate.com
- **Agent:** sarah.johnson@realestate.com
- **Buyer:** buyer@example.com

---

## Optional: Install Docker later

If you want Redis + Meilisearch via containers:

1. Install [Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
2. Restart PowerShell
3. Run: `docker compose up -d`

---

## Troubleshooting

**`docker` not recognized** — Use this guide instead of `docker compose`.

**`psql` asks for password** — Use the password you set when installing PostgreSQL 17.

**Migration fails (connection refused)** — Start the PostgreSQL service:

```powershell
Get-Service postgresql*
# If stopped:
Start-Service postgresql-x64-17   # name may vary
```

**Port 5432 in use** — Another Postgres instance may be running; check `DATABASE_URL` port.
