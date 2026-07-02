#!/usr/bin/env bash
set -euo pipefail

echo '============================================'
echo ' local-voice-studio portable'
echo '============================================'
echo ''

source server/venv/bin/activate

if [ ! -f server/models/kokoro-v0_19.onnx ] || [ ! -f server/models/voices.bin ]; then
    echo 'Models missing, running download_models.sh ...'
    ./scripts/download_models.sh
fi

API_PORT=${API_PORT:-8000}
PORT=${PORT:-3000}

echo "[backend] Starting FastAPI on http://localhost:${API_PORT}"
uvicorn server.app:app --host 0.0.0.0 --port "${API_PORT}" &
API_PID=$!

echo "[frontend] Starting Next.js on http://localhost:${PORT}"
( cd client && npm run dev -- --port "${PORT}" ) &
NEXT_PID=$!

cleanup() {
    echo ''
    echo 'Shutting down...'
    kill "${API_PID}" "${NEXT_PID}" >/dev/null 2>&1 || true
    wait || true
}
trap cleanup INT TERM EXIT

sleep 3
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:${PORT}" >/dev/null 2>&1 || true
elif command -v open >/dev/null 2>&1; then
    open "http://localhost:${PORT}" >/dev/null 2>&1 || true
fi

echo ''
echo '============================================'
echo " UI  : http://localhost:${PORT}"
echo " API : http://localhost:${API_PORT}"
echo '============================================'
echo 'Press Ctrl+C to stop both servers.'

wait
