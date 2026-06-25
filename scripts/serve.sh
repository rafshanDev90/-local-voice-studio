#!/usr/bin/env bash
set -euo pipefail

if [ ! -f "models/kokoro-v0_19.onnx" ]; then
    echo "Model files not found. Run scripts/download_models.sh first."
    exit 1
fi

python -m server
