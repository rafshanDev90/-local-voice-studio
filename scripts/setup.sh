#!/usr/bin/env bash
set -euo pipefail

echo '============================================'
echo ' local-voice-studio portable setup'
echo '============================================'
echo ''

if ! command -v python3 >/dev/null 2>&1; then
    echo '[ERROR] python3 not found. Install Python 3.12+ and rerun.'
    exit 1
fi

if ! command -v node >/dev/null 2>&1; then
    echo '[WARNING] Node.js not found. Frontend dev will be skipped.'
    SKIP_NODE=1
else
    SKIP_NODE=0
fi

echo '[1/3] Creating Python virtual environment...'
if [ -d server/venv ]; then
    echo '        Reusing existing venv at server/venv'
else
    python3 -m venv server/venv
fi

echo '[2/3] Installing backend dependencies...'
source server/venv/bin/activate
python -m pip install --upgrade pip >/dev/null 2>&1 || true
pip install -r server/requirements.txt

if [ "$SKIP_NODE" -eq 1 ]; then
    echo '[3/3] Skipping client dependencies, Node.js not found.'
else
    echo '[3/3] Installing client dependencies...'
    (cd client && npm ci)
fi

echo ''
echo 'Setup complete.'
echo 'Next: ./scripts/run.sh to start the app.'
