# Run from project root: .\scripts\setup-local.ps1
# Creates DB/user and runs migrations + seed (requires psql and postgres password)

param(
    [string]$PostgresUser = "postgres",
    [string]$PostgresPassword = "",
    [string]$DbName = "realestate",
    [string]$DbUser = "realestate",
    [string]$DbPassword = "realestate"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "ShariEstate local setup (no Docker)" -ForegroundColor Cyan

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    Write-Error "psql not found. Install PostgreSQL or add it to PATH."
}

if (-not $PostgresPassword) {
    $secure = Read-Host "Enter PostgreSQL password for user '$PostgresUser'" -AsSecureString
    $PostgresPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    )
}

$env:PGPASSWORD = $PostgresPassword

Write-Host "Creating database and user..." -ForegroundColor Yellow
$sql = @"
DO `$`$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DbUser') THEN
    CREATE USER $DbUser WITH PASSWORD '$DbPassword';
  END IF;
END
`$`$;
SELECT 'CREATE DATABASE $DbName OWNER $DbUser'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DbName')\gexec
"@

$sql | psql -U $PostgresUser -h localhost -d postgres -v ON_ERROR_STOP=1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Database setup failed. See docs/SETUP-WITHOUT-DOCKER.md"
}

$envUrl = "postgresql://${DbUser}:${DbPassword}@localhost:5432/${DbName}?schema=public"
$envFile = Join-Path $Root "apps\api\.env"
(Get-Content $envFile) -replace 'DATABASE_URL=.*', "DATABASE_URL=`"$envUrl`"" | Set-Content $envFile
Write-Host "Updated apps/api/.env DATABASE_URL" -ForegroundColor Green

Write-Host "Installing dependencies..." -ForegroundColor Yellow
pnpm install

Write-Host "Running migrations..." -ForegroundColor Yellow
Push-Location (Join-Path $Root "apps\api")
npx prisma migrate dev --name init
if ($LASTEXITCODE -ne 0) {
    npx prisma db push
}
npx prisma db seed
Pop-Location

Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Setup complete. Start the app with: pnpm dev" -ForegroundColor Green
