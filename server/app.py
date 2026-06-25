import tempfile
import numpy as np
import soundfile as sf
from fastapi import FastAPI, UploadFile, File, Query, Body, HTTPException
from fastapi.responses import FileResponse

from server.tts_engine import TTSEngine, DEFAULT_SAMPLE_RATE
from server.optimizer import optimize_script

app = FastAPI(title="Voice Agent")

engine: TTSEngine | None = None
router = None

@app.on_event("startup")
async def startup():
    global engine, router
    engine = TTSEngine()
    try:
        from server.orchestrator import VoiceRouter
        router = VoiceRouter()
    except Exception:
        pass

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/generate-voice/")
async def generate_voice(
    file: UploadFile = File(...),
    voice_preset: str = Query("af_bella"),
    speed: float = Query(1.0, ge=0.5, le=2.0),
    use_orchestrator: bool = Query(False),
):
    if not file.filename or not file.filename.endswith(".txt"):
        raise HTTPException(422, "Only .txt files accepted")

    content = await file.read()
    text = content.decode("utf-8").strip()

    if not text:
        raise HTTPException(400, "Script is empty")

    segments = optimize_script(text)

    if use_orchestrator and router:
        routed = router.route_segments(segments)
        audio_parts = []
        sample_rate = DEFAULT_SAMPLE_RATE
        silence = None
        for seg, voice in routed:
            samples, sr = engine.generate_long([seg], voice=voice, speed=speed)
            sample_rate = sr
            if len(audio_parts) > 0:
                if silence is None:
                    silence = _build_silence(sample_rate)
                audio_parts.append(silence)
            audio_parts.append(samples)
        audio = np.concatenate(audio_parts) if len(audio_parts) > 1 else audio_parts[0]
    else:
        audio, sample_rate = engine.generate_long(segments, voice=voice_preset, speed=speed)

    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    sf.write(tmp.name, audio, sample_rate)
    return FileResponse(tmp.name, media_type="audio/wav", filename="output.wav")

@app.post("/api/generate")
async def generate_json(
    text: str = Body(..., embed=True),
    voice: str = Query("af_bella"),
    speed: float = Query(1.0, ge=0.5, le=2.0),
    use_orchestrator: bool = Query(False),
):
    if not text.strip():
        raise HTTPException(400, "Text is empty")

    segments = optimize_script(text)

    if use_orchestrator and router:
        routed = router.route_segments(segments)
        audio_parts = []
        sample_rate = DEFAULT_SAMPLE_RATE
        silence = None
        for seg, v in routed:
            samples, sr = engine.generate_long([seg], voice=v, speed=speed)
            sample_rate = sr
            if len(audio_parts) > 0:
                if silence is None:
                    silence = _build_silence(sample_rate)
                audio_parts.append(silence)
            audio_parts.append(samples)
        audio = np.concatenate(audio_parts) if len(audio_parts) > 1 else audio_parts[0]
    else:
        audio, sample_rate = engine.generate_long(segments, voice=voice, speed=speed)

    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    sf.write(tmp.name, audio, sample_rate)
    return FileResponse(tmp.name, media_type="audio/wav", filename="output.wav")

def _build_silence(sr: int, duration: float = 0.3) -> np.ndarray:
    return np.zeros(int(sr * duration), dtype=np.float32)
