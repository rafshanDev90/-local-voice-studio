# Development Phases

## Phase 0 — Foundation

- [x] Project structure established
- [x] `plan.md` with architecture diagram
- [x] `rules.md` with conventions
- [x] OpenFugu repo cloned and audited
- [x] Kokoro TTS model files downloaded (`kokoro-v0_19.onnx`, `voices.bin`)
- [x] Python virtual environment with all dependencies
- [x] Server starts cleanly with `python -m server`

## Phase 1 — Base Voice Agent

- [x] `tts_engine.py` — Kokoro wrapper with single + long-form generation
- [x] `optimizer.py` — Ollama LLM segmentation with regex fallback
- [x] `app.py` — FastAPI with file upload (`/generate-voice/`) and JSON (`/api/generate`) endpoints
- [x] `requirements.txt` — pinned deps (fastapi, uvicorn, soundfile, numpy, kokoro-onnx, httpx)
- [x] `scripts/download_models.sh` — downloads Kokoro ONNX models
- [x] `scripts/serve.sh` — model check + server start
- [x] Verified: `curl` → valid WAV output (`RIFF, WAVE, PCM, 16-bit, mono 24000 Hz`)

## Phase 2 — OpenFugu Classifier Integration

- [x] `orchestrator.py` — wraps `FuguRouter` with graceful fallback
- [x] 7 `agent_id → voice_preset` mappings defined
- [x] Keyword-based fallback routing (questions → af_bella, urgency → am_adam, narrative → af_sarah)
- [x] Integrated into `app.py`: `use_orchestrator=true` enables per-segment voice selection
- [x] Qwen3-0.6B backbone downloaded
- [x] `model_iter_60.npy` built from `router_head.safetensors`
- [x] Verified: `use_orchestrator=true` returns valid WAV with varied voice presets
- [~] Full FuguRouter ML routing — blocked on torch installation (CUDA libs missing)

## Phase 3 — OpenFugu Coordinator Mode

- [ ] Replace classifier with `Coordinator` loop
- [ ] Register Ollama models as worker slots
- [ ] TRINITY routes each segment to best LLM for refinement before TTS
- [ ] Fallback: if OpenFugu unavailable, use direct Ollama call

## Phase 4 — YouTube Integration

- [ ] `youtube.py` — download auto-captions via `yt-dlp`
- [ ] Support YouTube URL as input (in addition to file upload)
- [ ] Optional: transcript cleanup / diarization

## Done

- Kokoro ONNX models downloaded
- All Python dependencies installed in `.venv`
- Server confirmed running and serving WAV audio
- Both endpoints tested and returning valid WAV files
- Client rewired to call `/api/generate` for TTS
- S3 dependency made optional in client
