# Voice Agent API Reference

Base URL: `http://localhost:8000`

## Endpoints

### `GET /health`

Returns server status.

**Response** `200 OK`
```json
{ "status": "ok" }
```

---

### `POST /generate-voice/`

Generate TTS audio from a `.txt` file upload. Returns a `.wav` file.

**Request** `multipart/form-data`

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `file` | `.txt` file | required | Plain text script |
| `voice_preset` | string | `af_bella` | Kokoro voice preset |
| `speed` | float | `1.0` | Playback speed (0.5–2.0) |
| `use_orchestrator` | bool | `false` | Enable OpenFugu per-segment voice routing |

**Response** `200 OK` — `audio/wav` binary stream

**Errors**
- `422` — file is not `.txt`
- `400` — script is empty

**Example**
```bash
curl -X POST 'http://localhost:8000/generate-voice/?voice_preset=af_bella' \
  -F 'file=@test_script.txt;type=text/plain' -o output.wav
```

---

### `POST /api/generate`

Generate TTS audio from JSON body. Returns a `.wav` file. Designed for programmatic clients (e.g., Inngest).

**Request** `application/json`

Query parameters:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `voice` | string | `af_bella` | Kokoro voice preset |
| `speed` | float | `1.0` | Playback speed (0.5–2.0) |
| `use_orchestrator` | bool | `false` | Enable OpenFugu per-segment voice routing |

Body:

```json
{ "text": "Hello world. This is a test." }
```

**Response** `200 OK` — `audio/wav` binary stream

**Errors**
- `400` — text is empty
- `422` — invalid body format

**Example**
```bash
curl -X POST 'http://localhost:8000/api/generate?voice=af_bella' \
  -H 'Content-Type: application/json' \
  -d '{"text":"Hello world. This is a test."}' -o output.wav
```

---

## Voice Presets

| Preset | Gender | Description |
|--------|--------|-------------|
| `af_bella` | female | default, neutral |
| `af_heart` | female | warm, expressive |
| `af_nicole` | female | calm, clear |
| `am_adam` | male | authoritative |
| `am_michael` | male | friendly |

## Audio Format

- Format: WAV (Microsoft PCM)
- Sample rate: 24000 Hz
- Bit depth: 16-bit
- Channels: mono

## Processing Pipeline

```
Input text
    │
    ▼
optimizer.py ──── tries Ollama (llama3.2:3b) for smart segmentation
    │                  falls back to regex sentence-split
    ▼
orchestrator.py ── (optional) routes each segment to a voice preset
    │                  via OpenFugu FuguRouter or keyword fallback
    ▼
tts_engine.py ──── generates audio for each segment via Kokoro ONNX
    │                   concatenates with 300ms silence gaps
    ▼
Output .wav
```
