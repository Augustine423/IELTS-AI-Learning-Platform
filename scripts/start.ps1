$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

& "$Root\scripts\setup-model.ps1"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Set-Location $Root
docker compose up @args
