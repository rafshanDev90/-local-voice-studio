@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   local-voice-studio portable
echo ============================================
echo.

set "PORT=3000"
set "API_PORT=8000"

call server\venv\Scripts\activate.bat

echo [server] Starting FastAPI backend on :%API_PORT% ...
start "Voice Agent API" cmd /c "uvicorn server.app:app --host 0.0.0.0 --port %API_PORT%"

echo [client] Starting Next.js client on :%PORT% ...
cd client
start "Voice Agent UI" cmd /c "npm run dev -- --port %PORT%"
cd ..

echo.
echo Opening browser...
timeout /t 3 /nobreak >nul
start http://localhost:%PORT%

echo.
echo ============================================
echo   App started
echo   UI  : http://localhost:%PORT%
echo   API : http://localhost:%API_PORT%
echo ============================================
echo.
echo Close this window to stop both servers.

pause
