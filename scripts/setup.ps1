param(
    [switch]$SkipFrontend
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $root

Write-Host '============================================' -ForegroundColor Cyan
Write-Host ' local-voice-studio portable setup' -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan
Write-Host ''

# 1) Python venv
Write-Host '[1/3] Ensuring Python virtual environment...' -ForegroundColor Green
$py = Get-Command python -ErrorAction SilentlyContinue
if (-not $py) {
    $py = Get-Command py -ErrorAction SilentlyContinue
}
if (-not $py) {
    Write-Error "No Python installation found. Install Python 3.12+ and retry."
}

if (-not (Test-Path server/venv)) {
    if (& python -V) {
        python -m venv server/venv
    } else {
        py -m venv server/venv
    }
} else {
    Write-Host '        Reusing existing venv at server/venv'
}

# 2) Backend deps
Write-Host '[2/3] Installing backend dependencies...' -ForegroundColor Green
$activate = Join-Path $PWD 'server/venv/Scripts/Activate.ps1'
. $activate
python -m pip install --upgrade pip | Out-Null
pip install -r server/requirements.txt

# 3) Client deps
if (-not $SkipFrontend) {
    Write-Host '[3/3] Installing client dependencies...' -ForegroundColor Green
    Push-Location client
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Warning 'npm not found. Skipping client dependency install.'
    } else {
        npm ci
    }
    Pop-Location
} else {
    Write-Host '[3/3] Skipping client dependency install.' -ForegroundColor Yellow
}

Write-Host ''
Write-Host 'Setup complete.' -ForegroundColor Green
Write-Host 'Then run: .\run.ps1' -ForegroundColor Green
