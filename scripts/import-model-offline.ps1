# Stage a GGUF for offline Ollama image bake, then rebuild the ollama service.
param(
    [Parameter(Mandatory = $true)]
    [string]$GgufPath,
    [string]$Model = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Config = Join-Path $Root "docker\config.yaml"
$EnvFile = Join-Path $Root ".env"
$EnvExample = Join-Path $Root ".env.example"

if (-not $Model -and (Test-Path $Config)) {
    $line = Get-Content $Config | Where-Object { $_ -match '^\s*model:\s*' } | Select-Object -First 1
    if ($line -match 'model:\s*(.+)') { $Model = $Matches[1].Trim() }
}
if (-not $Model) { $Model = "llama3.2" }

$resolved = Resolve-Path -LiteralPath $GgufPath
if (-not (Test-Path -LiteralPath $resolved)) {
    Write-Host "ERROR: File not found: $GgufPath"
    exit 1
}
if ("$resolved" -notmatch '\.gguf$') {
    Write-Host "ERROR: Expected a .gguf file, got: $resolved"
    exit 1
}

$modelsDir = Join-Path $Root "models"
New-Item -ItemType Directory -Force -Path $modelsDir | Out-Null
$dest = Join-Path $modelsDir (Split-Path -Leaf $resolved)
Copy-Item -LiteralPath $resolved -Destination $dest -Force

if (-not (Test-Path $EnvFile)) {
    Copy-Item $EnvExample $EnvFile
}

$envLines = @(Get-Content $EnvFile)
$hasModel = $false
$hasOffline = $false
$newLines = foreach ($line in $envLines) {
    if ($line -match '^\s*OLLAMA_MODEL\s*=') {
        $hasModel = $true
        "OLLAMA_MODEL=$Model"
    } elseif ($line -match '^\s*OFFLINE_BUILD\s*=') {
        $hasOffline = $true
        "OFFLINE_BUILD=1"
    } else {
        $line
    }
}
if (-not $hasModel) { $newLines += "OLLAMA_MODEL=$Model" }
if (-not $hasOffline) { $newLines += "OFFLINE_BUILD=1" }
Set-Content -Path $EnvFile -Value $newLines -Encoding utf8

Write-Host "==> Staged GGUF for offline bake"
Write-Host "    Source: $resolved"
Write-Host "    Dest:   $dest"
Write-Host "    Name:   $Model"
Write-Host ""

& "$Root\scripts\build-ollama.ps1" -Model $Model -Offline
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
