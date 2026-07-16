# Build Ollama (llama3.2 by default) and start the stack.
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

# Also accept --full in remaining args
$rest = @()
foreach ($a in $ComposeArgs) {
    if ($a -eq "--full" -or $a -eq "full") { $Full = $true }
    else { $rest += $a }
}

Write-Host "==> Building Ollama image(s)…"
if ($Full) {
    docker compose --profile full build ollama-llama32 ollama-llama31 ollama-qwen25 ollama-gemma2
} else {
    docker compose build ollama-llama32
}
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "==> Starting IELTS AI stack…"
if ($Full) {
    docker compose --profile full up @rest
} else {
    docker compose up @rest
}
