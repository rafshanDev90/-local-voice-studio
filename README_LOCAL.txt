LOCAL VOICE STUDIO - USER GUIDE
===============================

WHAT THIS IS
------------
This is a portable local version of the voice generation tool.
Everything runs on your machine. No API keys, no cloud uploads.

QUICK START
-----------
Option 1: Full local run without installer
  1. Extract this zip to a folder without spaces in the path.
  2. Double-click `scripts\run.bat`.
  3. Your browser should open to http://localhost:3000

If setup files are missing or dependencies are not installed yet, run:
  -> `scripts\setup.bat` first
  -> If models are missing, also run `scripts\download_models.bat`

Option 2: PowerShell
  -> Open PowerShell in this folder
  -> Set execution policy for current user if needed:
       Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
  -> Run:
       .\scripts\run.ps1

REQUIREMENTS
------------
- Windows 10/11
- Python 3.12 or newer
- Node.js 18+ and npm
- Stable internet for first-time model download

WHAT TO EXPECT
--------------
- After starting, use the browser UI to generate voice audio.
- The backend API runs at http://localhost:8000
- The frontend UI runs at http://localhost:3000
- Optional local tools:
    Ollama for smarter script segmentation:
        https://ollama.com
    OpenFugu for multi-voice routing:
        https://github.com/opencode-ai/OpenFugu

If you see model-related errors, run:
  -> scripts\download_models.bat

TROUBLESHOOTING
---------------
1. "Python was not found"
   -> Install Python 3.12+ from https://www.python.org/downloads/windows/

2. "npm is not recognized"
   -> Install Node.js 18+ from https://nodejs.org/

3. App opens but no voices load
   -> Open http://localhost:8000/health
   -> If it does not show ok, check backend logs in the terminal window.

4. "TTS model unavailable"
   -> Run `scripts\download_models.bat`
   -> Make sure server/models/kokoro-v0_19.onnx exists.

UNINSTALL
---------
Delete the extracted folder. No registry entries or global services are created.

LICENSE
-------
See LICENSE in this folder.
