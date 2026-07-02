#!/usr/bin/env bash
set -euo pipefail

echo '[download_models] Starting Kokoro ONNX model download...'

MODELS_DIR="${MODELS_DIR:-server/models}"
BASE_URL='https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files'

mkdir -p "${MODELS_DIR}"

echo '        downloading kokoro-v0_19.onnx ...'
curl -fL -o "${MODELS_DIR}/kokoro-v0_19.onnx" "${BASE_URL}/kokoro-v0_19.onnx"

echo '        downloading voices.bin ...'
curl -fL -o "${MODELS_DIR}/voices.bin" "${BASE_URL}/voices.bin"

echo ''
echo '[download_models] Done. Models saved to '"${MODELS_DIR}/"
echo '        file: kokoro-v0_19.onnx'
echo '        file: voices.bin'
