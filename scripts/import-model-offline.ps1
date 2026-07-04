# Import a locally downloaded GGUF file into Ollama (no internet needed).
param(
    [Parameter(Mandatory = $true)]
    [string]$GgufPath,
    [string]$Model = "",
    [string]$OllamaHost = "http://127.0.0.1:11434"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Config = Join-Path $Root "docker\config.yaml"

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
if ($resolved -notmatch '\.gguf$') {
    Write-Host "ERROR: Expected a .gguf file, got: $resolved"
    exit 1
}

try {
    Invoke-RestMethod -Uri "$OllamaHost/api/tags" -TimeoutSec 5 | Out-Null
} catch {
    Write-Host "ERROR: Ollama is not running. Install and start Ollama first."
    exit 1
}

$ggufDir = Split-Path -Parent $resolved
$ggufName = Split-Path -Leaf $resolved
$modelfile = Join-Path $ggufDir "Modelfile"
$fromLine = "FROM ./$ggufName"

Set-Content -Path $modelfile -Value $fromLine -Encoding utf8

Write-Host "==> Importing offline model"
Write-Host "    GGUF:     $resolved"
Write-Host "    Name:     $Model"
Write-Host "    Modelfile: $modelfile"
Write-Host ""

Push-Location $ggufDir
try {
    ollama create $Model -f Modelfile
} finally {
    Pop-Location
}

$rows = ollama list 2>$null
$ok = $false
foreach ($row in $rows | Select-Object -Skip 1) {
    if ($row -match "^$([regex]::Escape($Model))(\s|:)") {
        $parts = ($row -split '\s+', 4)
        if ($parts.Count -ge 3 -and $parts[2] -ne "-") {
            Write-Host ""
            Write-Host "==> Success! Local model $Model is ready ($($parts[2]))."
            Write-Host "    Run: .\scripts\start.ps1"
            $ok = $true
            break
        }
    }
}

if (-not $ok) {
    Write-Host "ERROR: Import finished but model not found in ollama list."
    exit 1
}
