# Pull Docker Hub images and start the stack (no local builds).
param(
    [switch]$Full,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ComposeArgs
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$EnvFile = Join-Path $Root ".env"
$EnvExample = Join-Path $Root ".env.example"

if (-not (Test-Path $EnvFile) -and (Test-Path $EnvExample)) {
    Copy-Item $EnvExample $EnvFile
}

Set-Location $Root

$rest = @()
foreach ($a in $ComposeArgs) {
    if ($a -eq "--full" -or $a -eq "full") { $Full = $true }
    else { $rest += $a }
}

Write-Host "==> Pulling images from Docker Hub…"
if ($Full) {
    docker compose --profile full pull
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host "==> Starting full stack…"
    docker compose --profile full up @rest
} else {
    docker compose pull
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host "==> Starting stack (llama3.2). Use --full for all models."
    docker compose up @rest
}
