# Voice Agent for YouTube Videos

A production-grade open-source voice agent that reads YouTube scripts and generates natural audio using local TTS, with optional OpenFugu-powered LLM orchestration.

## Architecture

```
                          ┌─────────────────────────────────────┐
Script (.txt) ───────────►│  server/  (FastAPI + uvicorn)      │
                          │                                     │
                          │  ┌─────────────┐   ┌─────────────┐  │
                          │  │ optimizer.py │──►│ tts_engine  │──► .wav
                          │  │ (Ollama LLM) │   │ (Kokoro)    │  │
                          │  └─────────────┘   └─────────────┘  │
                          │         │                            │
                          │  ┌──────▼───────┐                  │
                          │  │ orchestrator  │   ← OpenFugu     │
                          │  │ (FuguRouter)  │     (optional)   │
                          │  └──────────────┘                  │
                          └─────────────────────────────────────┘
```

## Development Phases

### Phase 0 — Foundation (current)
- [x] Project structure established
- [x] `plan.md` with architecture
- [x] OpenFugu repo cloned and audited
- [x] Kokoro TTS model files downloaded

### Phase 1 — Base Voice Agent
- [x] `tts_engine.py` — Kokoro TTS wrapper with chunked long-form generation
- [x] `optimizer.py` — Ollama LLM script refinement (optional, fallback to sentence split)
- [x] `server/` — FastAPI server with file upload, voice selection, speed control
- [x] `requirements.txt` — pinned dependencies
- [x] `scripts/download_models.sh` — download Kokoro ONNX models
- [ ] Verify: upload a script, get `.wav` back at correct sample rate

### Phase 2 — OpenFugu Classifier Integration
- [x] `orchestrator.py` — wraps `FuguRouter` as a text segment classifier
- [ ] Download Qwen3-0.6B + `model_iter_60.npy` via OpenFugu's fetch script
- [x] Define `agent_id → voice_preset` mapping (validated by listening)
- [x] Integrate into `server/app.py`: per-segment voice selection based on routing
- [ ] Verify: same script gets varied voice presets across segment types

### Phase 3 — OpenFugu Coordinator Mode
- [ ] Replace classifier with full `Coordinator` loop
- [ ] Register Ollama models as 7 worker slots
- [ ] TRINITY routes each segment to best LLM for refinement before TTS
- [ ] Fallback: if OpenFugu not available, use direct Ollama call

### Phase 4 — YouTube Integration
- [ ] `youtube.py` — fetch auto-captions via `yt-dlp`
- [ ] Support YouTube URL as input (in addition to file upload)
- [ ] Optional: transcript cleanup/diarization

## File Structure

```
voice-agent/
├── server/                   # FastAPI server package (`python -m server`)
│   ├── __init__.py
│   ├── __main__.py           # Entry point (uvicorn.run)
│   ├── app.py                # FastAPI app, routes
│   ├── tts_engine.py         # Kokoro TTS wrapper
│   ├── optimizer.py          # Script optimization (Ollama / sentence split)
│   ├── orchestrator.py       # Voice routing (keyword-based)
│   ├── models/               # Kokoro ONNX model files (gitignored)
│   │   ├── kokoro-v0_19.onnx
│   │   └── voices.bin
│   ├── scripts/
│   │   ├── download_models.sh
│   │   └── serve.sh
│   ├── requirements.txt
│   └── .gitignore
├── client/                   # Next.js frontend
├── doc/
├── .antigravity/
│   ├── plan.md
│   └── rules.md
├── .gitignore
└── README.md
```

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| TTS Engine | Kokoro ONNX | Fast, CPU-friendly, high quality, Apache 2.0 |
| LLM Integration | Optional (Ollama → OpenFugu) | No forced dependency; progressive enhancement |
| API Framework | FastAPI | Async, file upload support, auto-docs |
| Orchestration | FuguRouter (classify) → Coordinator (route) | Start minimal, evolve if routing shows value |
| Voice Presets | 7 Kokoro voices mapped to 7 agent slots | Leverages OpenFugu's learned text-type clustering |

## Dependencies

```
# Core
fastapi, uvicorn, soundfile, numpy, kokoro-onnx

# LLM script optimization
httpx (for Ollama API calls)

# YouTube (Phase 4)
yt-dlp
```

## Verification

```bash
# Phase 1 test
curl -X POST 'http://localhost:8000/generate-voice/?voice_preset=af_bella' \
  -F 'file=@test_script.txt;type=text/plain'

# Phase 2 test
curl -X POST 'http://localhost:8000/generate-voice/?voice_preset=af_bella&use_orchestrator=true' \
  -F 'file=@test_script.txt;type=text/plain'

# Phase 3 test
curl -X POST 'http://localhost:8000/generate-voice/?use_llm=true&use_orchestrator=true' \
  -F 'file=@test_script.txt;type=text/plain'

# Phase 4 test
curl -X POST 'http://localhost:8000/generate-voice/?youtube_url=https://youtube.com/watch?v=...'
```
