#!/usr/bin/env bash
# Packaging helper: creates a relocatable portable snapshot of the project
# into a sibling folder with venv and node modules preinstalled.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORTABLE_DIR="${ROOT}-portable"
MODELS_DIR="${ROOT}/server/models"

echo '============================================'
echo ' local-voice-studio portable packager'
echo '============================================'
echo ''

if [ ! -d "${ROOT}/server/venv" ]; then
    echo '[packager] server/venv missing. Run scripts/setup.sh first.'
    exit 1
fi

if [ ! -f "${MODELS_DIR}/kokoro-v0_19.onnx" ] || [ ! -f "${MODELS_DIR}/voices.bin" ]; then
    echo '[packager] Models missing. Run scripts/download_models.sh first.'
    exit 1
fi

rm -rf "${PORTABLE_DIR}"
mkdir -p "${PORTABLE_DIR}"

echo '[1/4] Copying project files...'
tar -C "${ROOT}" \
    --exclude='.git' \
    --exclude='.venv' \
    --exclude='server/venv' \
    --exclude='client/node_modules' \
    --exclude='client/.next' \
    --exclude='__pycache__' \
    --exclude='.pytest_cache' \
    --exclude='*.pyc' \
    -cf - . | tar -C "${PORTABLE_DIR}" -xf -

echo '[2/4] Copying Python venv...'
cp -a "${ROOT}/server/venv" "${PORTABLE_DIR}/server/venv"

echo '[3/4] Copying client dependencies...'
if [ -d "${ROOT}/client/node_modules" ]; then
    cp -a "${ROOT}/client/node_modules" "${PORTABLE_DIR}/client/node_modules"
fi

echo '[4/4] Setting executable bits...'
chmod +x "${PORTABLE_DIR}/scripts/setup.sh" \
         "${PORTABLE_DIR}/scripts/run.sh" \
         "${PORTABLE_DIR}/scripts/download_models.sh" || true
if [ -f "${PORTABLE_DIR}/scripts/setup.bat" ]; then
    :
fi

echo ''
echo 'Packaging complete:'
echo "  ${PORTABLE_DIR}"
echo ''
echo 'Ship this folder as a zip to others.'

