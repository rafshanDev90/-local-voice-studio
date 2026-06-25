# Project Rules & Conventions

## Code Style

- **Python 3.12+** — use modern type hints (`list[str]` not `List[str]`, `|` for unions)
- **No docstrings or comments** in implementation code — the code should be self-explanatory. Comments only for architectural decisions or non-obvious workarounds.
- **80 char line limit** — but relax for strings/URLs (up to 100)
- **Imports**: stdlib → third-party → local, one blank line between groups
- **Classes** for stateful objects (TTS engine, OpenFugu router); **functions** for stateless logic (optimizer, utilities)

## Architecture Rules

- **`server/`** is the only entry point (`python -m server`). All other modules are imported, never run directly.
- **`tts_engine.py`** owns Kokoro. No other module imports `kokoro_onnx`.
- **`optimizer.py`** owns LLM calls. `orchestrator.py` may call it as fallback.
- **`orchestrator.py`** wraps OpenFugu. If OpenFugu/GPU unavailable, it raises `ImportError` or `RuntimeError` — callers handle the fallback.
- **No circular imports** — `server/app.py` → `server/tts_engine`, `server/optimizer`. Nothing imports `server/app` from outside except the entry point.
- **Temporary files** go to system temp dir via `tempfile`, not project root.

## OpenFugu Integration Rules

- **Phase 2** (classifier): Use only `FuguRouter.route()`. No `Coordinator`, no worker pool.
- **Phase 3** (coordinator): Use `Coordinator.run()` with Ollama-backed workers.
- **Always wrap** OpenFugu imports in try/except with graceful fallback.
- **Do NOT** copy or duplicate OpenFugu source files — import from the cloned repo directly.
- **Do NOT** modify files inside `OpenFugu/` — treat it as a vendored dependency.
- **GPU is optional** — OpenFugu falls back to CPU (slower but functional).

## Kokoro TTS Conventions

- Default sample rate: 24000 Hz
- Voice presets: `af_bella`, `af_heart`, `af_nicole`, `am_adam`, `am_michael`
- Model files: `kokoro-v0_19.onnx` + `voices.bin` in `models/`
- Long-form generation: split text into segments, generate each, concatenate with silence gap if needed

## Error Handling

- **File uploads**: validate Content-Type and file extension; raise 422 for invalid input
- **LLM unavailable**: if Ollama/OpenFugu doesn't respond, fall back to sentence-split (no crash)
- **Empty segments**: return 400 if script is empty or produces no audio
- **Model not found**: clear error at startup, not at request time

## Testing

- No test framework yet — manual verification via `curl` against the running server
- Keep `test_script.txt` in project root for quick smoke tests
- When adding OpenFugu: run `FuguRouter.self_test()` to verify checkpoint loads correctly

## Git

- No `.npy`, `.onnx`, `.bin`, `.safetensors` in version control (see `.gitignore`)
- No `.env` or API keys
- Commit messages: imperative mood, 50-char subject, body if needed
