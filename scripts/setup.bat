@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   local-voice-studio portable setup
echo ============================================
echo.

set "PYTHON="
where python >nul 2>&1
if %errorlevel%==0 (
    set "PYTHON=python"
) else (
    where py >nul 2>&1
    if %errorlevel%==0 (
        set "PYTHON=py"
    )
)

if "%PYTHON%"=="" (
    echo [ERROR] No Python found.
    echo Install Python 3.12+ from https://www.python.org/downloads/windows/
    echo and rerun this script.
    pause
    exit /b 1
)

echo [1/3] Creating Python virtual environment...
if exist server\venv (
    echo         Reusing existing venv at server\venv
) else (
    "%PYTHON%" -m venv server\venv
)

echo [2/3] Installing backend dependencies...
call server\venv\Scripts\activate.bat
pip install --upgrade pip >nul 2>&1
pip install -r server\requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Backend dependency installation failed.
    pause
    exit /b 1
)

echo [3/3] Verifying models...
if not exist server\models\kokoro-v0_19.onnx (
    echo         Kokoro ONNX model missing.
    echo         Run scripts\download_models.bat before continuing.
)

if not exist server\models\voices.bin (
    echo         voices.bin missing.
    echo         Run scripts\download_models.bat before continuing.
)

echo.
echo Setup complete.
echo Next: run scripts\run.bat to start the app.
pause
