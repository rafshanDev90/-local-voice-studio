param(
    [int]$Port = 3000,
    [int]$ApiPort = 8000
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $root

Write-Host '============================================' -ForegroundColor Cyan
Write-Host ' local-voice-studio portable' -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan
Write-Host ''

$activate = Join-Path $PWD 'server/venv/Scripts/Activate.ps1'
if (-not (Test-Path $activate)) {
    Write-Error "Virtual environment missing. Run .\scripts\setup.ps1 first."
}
. $activate

if (-not (Test-Path 'server/models/kokoro-v0_19.onnx') -or -not (Test-Path 'server/models/voices.bin')) {
    Write-Host 'Models missing, running download_models.bat ...' -ForegroundColor Yellow
    & cmd /c 'scripts\download_models.bat'
}

Write-Host "[backend] Starting FastAPI on http://localhost:$ApiPort" -ForegroundColor Green
$api = Start-Process -FilePath 'uvicorn' -ArgumentList @('server.app:app', '--host', '0.0.0.0', '--port', "$ApiPort") -PassThru -WindowStyle Normal

Write-Host "[frontend] Starting Next.js on http://localhost:$Port" -ForegroundColor Green
Push-Location client
$next = Start-Process -FilePath 'cmd' -ArgumentList @('/c', 'npm.cmd', 'run', 'dev', '--', '--port', "$Port") -PassThru -WindowStyle Normal
Pop-Location

Start-Sleep -Seconds 3
Start-Process "http://localhost:$Port"

Write-Host ''
Write-Host '============================================' -ForegroundColor Cyan
Write-Host " UI  : http://localhost:$Port" -ForegroundColor Cyan
Write-Host " API : http://localhost:$ApiPort" -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor Cyan
Write-Host 'Close the app windows or press Ctrl+C here to stop both servers.' -ForegroundColor Gray

try {
    while ($true) {
        if ($api.HasExited -or $next.HasExited) {
            Write-Host 'A server process exited. Shutting down.' -ForegroundColor Yellow
            break
        }
        Start-Sleep -Seconds 2
    }
} finally {
    if (-not $api.HasExited) {
        Stop-Process -Id $api.Id -Force -ErrorAction SilentlyContinue
    }
    if (-not $next.HasExited) {
        Stop-Process -Id $next.Id -Force -ErrorAction SilentlyContinue
    }
}
