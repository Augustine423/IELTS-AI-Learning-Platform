# Run the LiveKit Cloud IELTS agent (all 4 skills).
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$AgentDir = Join-Path $Root "agents\ielts_voice"
$EnvFile = Join-Path $Root ".env"

Set-Location $AgentDir
if (-not (Test-Path ".venv")) {
    python -m venv .venv
    & .\.venv\Scripts\Activate.ps1
    pip install -r requirements.txt
} else {
    & .\.venv\Scripts\Activate.ps1
}

Get-Content $EnvFile | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
    $pair = $_.Split('=', 2)
    if ($pair.Length -eq 2) {
        [Environment]::SetEnvironmentVariable($pair[0].Trim(), $pair[1].Trim(), "Process")
    }
}

python agent.py start
