# Verify Ollama is running and a LOCAL model is installed before starting the app.
param(
    [string]$Model = "",
    [string]$OllamaHost = "http://127.0.0.1:11434",
    [switch]$Offline
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Config = Join-Path $Root "docker\config.yaml"
$EnvFile = Join-Path $Root "docker\.env"

if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^\s*OFFLINE\s*=\s*1') { $Offline = $true }
        if (-not $Model -and $_ -match '^\s*OLLAMA_MODEL\s*=\s*(.+)') { $Model = $Matches[1].Trim() }
    }
}
if ($env:OFFLINE -eq "1") { $Offline = $true }

if (-not $Model -and (Test-Path $Config)) {
    $line = Get-Content $Config | Where-Object { $_ -match '^\s*model:\s*' } | Select-Object -First 1
    if ($line -match 'model:\s*(.+)') { $Model = $Matches[1].Trim() }
}
if (-not $Model) { $Model = "llama3.2" }

Write-Host "==> IELTS AI - local model setup"
Write-Host "    Required model: $Model"
Write-Host "    Ollama host:    $OllamaHost"
if ($Offline) { Write-Host "    Mode:           OFFLINE (skip ollama pull)" }

if ($Model -like "*:cloud") {
    Write-Host ""
    Write-Host "ERROR: Cloud models (e.g. *:cloud) are not supported."
    Write-Host "       Set a local model in docker/config.yaml (default: llama3.2)."
    exit 1
}

try {
    Invoke-RestMethod -Uri "$OllamaHost/api/tags" -TimeoutSec 5 | Out-Null
} catch {
    Write-Host ""
    Write-Host "ERROR: Ollama is not reachable at $OllamaHost"
    Write-Host "       Install Ollama and start it: https://ollama.com/download"
    exit 1
}

function Get-LocalModelSize([string]$Name) {
    $rows = ollama list 2>$null
    if (-not $rows) { return $null }
    foreach ($row in $rows | Select-Object -Skip 1) {
        if ($row -match "^$([regex]::Escape($Name))(\s|:)") {
            $parts = ($row -split '\s+', 4)
            if ($parts.Count -ge 3) { return $parts[2] }
        }
    }
    return $null
}

function Show-OfflineHelp([string]$Name) {
    Write-Host ""
    Write-Host "Local model $Name is not installed."
    Write-Host ""
    Write-Host "OFFLINE SETUP (no ollama pull needed):"
    Write-Host ""
    Write-Host "  Step 1 - Download a GGUF file (use a mirror if Hugging Face is blocked):"
    Write-Host "    https://hf-mirror.com/bartowski/Llama-3.2-3B-Instruct-GGUF"
    Write-Host "    File:   Llama-3.2-3B-Instruct-Q4_K_M.gguf  (~2 GB)"
    Write-Host ""
    Write-Host "  Step 2 - Import into Ollama:"
    Write-Host "    .\scripts\import-model-offline.ps1 -GgufPath `"C:\path\to\Llama-3.2-3B-Instruct-Q4_K_M.gguf`""
    Write-Host ""
    Write-Host "  Step 3 - Verify (SIZE must NOT be -):"
    Write-Host "    ollama list"
    Write-Host ""
    Write-Host "  Step 4 - Start the app:"
    Write-Host "    .\scripts\start.ps1"
    Write-Host ""
    Write-Host "  Alternative: copy folder from another PC:"
    Write-Host "    %USERPROFILE%\.ollama\models"
    Write-Host ""
}

$size = Get-LocalModelSize $Model
if ($size -and $size -ne "-") {
    Write-Host "==> Local model $Model is ready ($size)."
    exit 0
}

if ($Offline) {
    Show-OfflineHelp $Model
    exit 1
}

Write-Host ""
Write-Host "Local model $Model not found. Attempting download..."
Write-Host "(Use -Offline or set OFFLINE=1 in docker/.env if pull is blocked.)"
Write-Host ""

try {
    ollama pull $Model
    $size = Get-LocalModelSize $Model
    if ($size -and $size -ne "-") {
        Write-Host "==> Local model $Model is ready ($size)."
        exit 0
    }
} catch {
    Write-Host "Download failed: $_"
}

Show-OfflineHelp $Model
exit 1
