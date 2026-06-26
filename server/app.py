import tempfile
import soundfile as sf
from fastapi import FastAPI, UploadFile, File, Query, Body, HTTPException
from fastapi.responses import FileResponse

from server.tts_engine import TTSEngine
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
        routes = router.route_segments(segments)
        audio, sample_rate = engine.generate_routed(segments, routes)
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
        routes = router.route_segments(segments)
        audio, sample_rate = engine.generate_routed(segments, routes)
    else:
        audio, sample_rate = engine.generate_long(segments, voice=voice, speed=speed)

    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    sf.write(tmp.name, audio, sample_rate)
    return FileResponse(tmp.name, media_type="audio/wav", filename="output.wav")

