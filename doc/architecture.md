# Architecture Overview

```
                           ┌──────────────────────────────────────────┐
                           │          server/  (FastAPI)              │
                           │                                          │
Script (.txt) ───────────►│  ┌──────────────┐    ┌────────────────┐   │
                           │  │ optimizer.py │───►│  tts_engine.py  │──► .wav
JSON body ────────────────►│  │ (Ollama LLM) │    │ (Kokoro ONNX)  │   │
                           │  └──────┬───────┘    └────────────────┘   │
                           │         │                                 │
                           │  ┌──────▼────────┐                       │
                           │  │ orchestrator   │  ← OpenFugu (opt.)    │
                           │  │ FuguRouter     │  ← keyword fallback   │
                           │  └───────────────┘                       │
                           └──────────────────────────────────────────┘
```

## Modules

### `server.app` — FastAPI application

Entry point for the server. Defines 3 routes (`/health`, `/generate-voice/`, `/api/generate`). Initializes `TTSEngine` and `VoiceRouter` on startup. Orchestrates the pipeline: optimize → route → generate → return WAV.

### `server.tts_engine` — Kokoro TTS wrapper

Single class `TTSEngine` wrapping `kokoro_onnx.Kokoro`. Two methods:
- `generate(text, voice, speed)` — single segment, returns `(samples, sample_rate)`
- `generate_long(segments, voice, speed)` — multiple segments with 300ms silence gaps, returns concatenated `(samples, sample_rate)`

Default sample rate: 24000 Hz.

### `server.optimizer` — Script segmentation

Function `optimize_script(text) → list[str]`. Tries Ollama (`llama3.2:3b`) to split text into natural speech segments. If Ollama is unavailable or times out, falls back to regex sentence splitting.

### `server.orchestrator` — Voice routing

Class `VoiceRouter`. Attempts to load `OpenFugu.fugu_router.FuguRouter`. If available, uses `FuguRouter.route(text)` to classify each segment into one of 7 agents, then maps agent IDs to voice presets. Falls back to keyword-based routing if OpenFugu is not installed.

Agent-to-voice mapping:
- agent_0, agent_5 → af_bella
- agent_1, agent_6 → af_heart
- agent_2 → af_nicole
- agent_3 → am_adam
- agent_4 → am_michael

### `server.__main__` — Entry point

Runs `uvicorn.run("server.app:app", host="0.0.0.0", port=8000, reload=True)`.

## Data Flow

1. Text arrives via file upload (`/generate-voice/`) or JSON body (`/api/generate`)
2. `optimize_script()` splits text into segments
3. If `use_orchestrator=true`, each segment is routed through `VoiceRouter.route()` to pick a voice preset
4. For each segment, `TTSEngine.generate()` produces audio samples
5. Segments are concatenated with 300ms silence gaps
6. Audio is written to a temp `.wav` file and returned as `FileResponse`
7. Temp file is cleaned up by the OS

## Dependency Graph

```
__main__.py
    └── app.py
            ├── tts_engine.py
            ├── optimizer.py
            └── orchestrator.py (optional, try/except)
```

No circular imports. `app.py` is the only module that imports from other server modules.
