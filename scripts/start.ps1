# Pull Docker Hub images and start the LiveKit-only stack (no local builds).
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ComposeArgs
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$EnvFile = Join-Path $Root ".env"
$EnvExample = Join-Path $Root ".env.example"

if (-not (Test-Path $EnvFile) -and (Test-Path $EnvExample)) {
    Copy-Item $EnvExample $EnvFile
    Write-Host "==> Created .env — fill LIVEKIT_* and GROQ_API_KEY"
}

Set-Location $Root
Write-Host "==> Pulling kyawzayarsoe/ielts-ai-* images from Docker Hub…"
docker compose pull
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "==> Starting frontend + backend + livekit-agent…"
docker compose up @ComposeArgs
