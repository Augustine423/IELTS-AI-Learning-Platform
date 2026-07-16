# Start IELTS AI stack (LiveKit-first by default — no big Ollama).
param(
    [switch]$Full,
    [switch]$Ollama,
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$ComposeArgs
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$EnvFile = Join-Path $Root ".env"
$EnvExample = Join-Path $Root ".env.example"

if (-not (Test-Path $EnvFile) -and (Test-Path $EnvExample)) {
    Copy-Item $EnvExample $EnvFile
    Write-Host "==> Created .env from .env.example — fill LIVEKIT_* and GROQ_API_KEY"
}

Set-Location $Root

$rest = @()
foreach ($a in $ComposeArgs) {
    if ($a -eq "--full" -or $a -eq "full") { $Full = $true }
    elseif ($a -eq "--ollama" -or $a -eq "ollama") { $Ollama = $true }
    else { $rest += $a }
}

if ($Full) {
    Write-Host "==> Pulling Hub images (full Ollama + app)…"
    docker compose --profile full pull
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host "==> Starting full stack (all Ollama models + LiveKit agent)…"
    docker compose --profile full up --build @rest
} elseif ($Ollama) {
    Write-Host "==> Pulling Hub images (llama3.2 + app)…"
    docker compose --profile ollama pull
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host "==> Starting LiveKit + llama3.2…"
    docker compose --profile ollama up --build @rest
} else {
    Write-Host "==> Pulling app images (LiveKit-first, no Ollama)…"
    docker compose pull backend frontend
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host "==> Starting frontend + backend + livekit-agent…"
    Write-Host "    Tip: add --ollama or --full if you need local models."
    docker compose up --build @rest
}
