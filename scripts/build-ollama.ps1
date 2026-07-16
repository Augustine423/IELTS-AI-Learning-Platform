# Build separate per-model Ollama images (shared multi-stage base).
param(
    [ValidateSet("llama32", "llama31", "qwen25", "gemma2", "all")]
    [string]$Target = "all",
    [switch]$Offline
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$env:OFFLINE_BUILD = if ($Offline) { "1" } else { "0" }

$services = switch ($Target) {
    "llama32" { @("ollama-llama32") }
    "llama31" { @("ollama-llama31") }
    "qwen25"  { @("ollama-qwen25") }
    "gemma2"  { @("ollama-gemma2") }
    default   { @("ollama-llama32", "ollama-llama31", "ollama-qwen25", "ollama-gemma2") }
}

Write-Host "==> Building separate Ollama images: $($services -join ', ')"
Write-Host "    Offline: $($env:OFFLINE_BUILD)"

if ($Target -eq "all" -or $Target -ne "llama32") {
    docker compose --profile full build @services
} else {
    docker compose build @services
}

if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "==> Done. Quick: docker compose up"
Write-Host "    Full:  docker compose --profile full up"
