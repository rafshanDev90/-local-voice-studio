@echo off
setlocal enabledelayedexpansion

echo [download_models] Starting Kokoro ONNX model download...

set "MODELS_DIR=server\models"
set "BASE_URL=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files"

if not exist "%MODELS_DIR%" mkdir "%MODELS_DIR%"

echo         downloading kokoro-v0_19.onnx ...
curl -L -o "%MODELS_DIR%\kokoro-v0_19.onnx" "%BASE_URL%/kokoro-v0_19.onnx"
if errorlevel 1 (
    echo [ERROR] Failed to download kokoro-v0_19.onnx
    pause
    exit /b 1
)

echo         downloading voices.bin ...
curl -L -o "%MODELS_DIR%\voices.bin" "%BASE_URL%/voices.bin"
if errorlevel 1 (
    echo [ERROR] Failed to download voices.bin
    pause
    exit /b 1
)

echo.
echo [download_models] Done. Models saved to %MODELS_DIR%\
echo         file: kokoro-v0_19.onnx
echo         file: voices.bin
echo.
pause
