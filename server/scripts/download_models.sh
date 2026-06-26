#!/usr/bin/env bash
set -euo pipefail

MODELS_DIR="server/models"
BASE_URL="https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files"

mkdir -p "$MODELS_DIR"

echo "Downloading Kokoro ONNX model..."
curl -L -o "$MODELS_DIR/kokoro-v0_19.onnx" "$BASE_URL/kokoro-v0_19.onnx"

echo "Downloading voices pack..."
curl -L -o "$MODELS_DIR/voices.bin" "$BASE_URL/voices.bin"

echo "Done. Models saved to $MODELS_DIR/"
