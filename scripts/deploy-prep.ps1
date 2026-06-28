# ShariEstate — pre-deploy validation (run from repo root)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "`n=== ShariEstate deploy prep ===`n" -ForegroundColor Cyan

# 1. Node version
$nodeVersion = node -v
Write-Host "Node: $nodeVersion"
if ($nodeVersion -notmatch "v(20|22|24)") {
  Write-Warning "Node 20+ recommended (see .nvmrc)"
}

# 2. Production build
Write-Host "`nRunning production build..." -ForegroundColor Yellow
pnpm build
if ($LASTEXITCODE -ne 0) {
  Write-Error "Build failed — fix errors before deploying."
}

# 3. Git check
Write-Host "`nGit status:" -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
  Write-Host "  No git repo yet. Run:" -ForegroundColor Yellow
  Write-Host "    git init"
  Write-Host "    git add ."
  Write-Host '    git commit -m "Initial commit — ShariEstate"'
  Write-Host "    git remote add origin https://github.com/YOUR_USER/shari-estate.git"
  Write-Host "    git push -u origin main"
} else {
  git status -sb
}

# 4. Secrets check — ensure .env files are not staged
$stagedEnv = git diff --cached --name-only 2>$null | Where-Object { $_ -match "\.env" }
if ($stagedEnv) {
  Write-Error "Do not commit .env files! Remove from staging: git reset HEAD *.env*"
}

Write-Host "`n=== Build OK ===" -ForegroundColor Green
Write-Host @"

Next steps (see docs/DEPLOY.md):

  1. Push to GitHub
  2. Create Neon database  →  DATABASE_URL
  3. Render Blueprint      →  render.yaml (API)
  4. Vercel import         →  root: apps/web
  5. Set NEXT_PUBLIC_API_URL on Vercel
  6. Set CORS_ORIGIN + WEB_URL on Render
  7. RUN_SEED=true once on Render, then false

"@ -ForegroundColor White
