import os
import tempfile
import uuid
import soundfile as sf
from fastapi import FastAPI, UploadFile, File, Query, Body, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from server.tts_engine import TTSEngine, is_bangla_voice, generate_bangla, detect_language
from server.optimizer import optimize_script
from server.database import connect, disconnect, save_voice_history, list_voice_history, get_voice_history_item, delete_voice_history

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

app = FastAPI(title="Voice Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Language-Detected"],
)

engine: TTSEngine | None = None
router = None

VOICES_CATALOG = [
    {"id": "af_bella",       "name": "Bella",      "language": "en-us", "gender": "female"},
    {"id": "af_nicole",      "name": "Nicole",     "language": "en-us", "gender": "female"},
    {"id": "af_sarah",       "name": "Sarah",      "language": "en-us", "gender": "female"},
    {"id": "af_sky",         "name": "Sky",        "language": "en-us", "gender": "female"},
    {"id": "am_adam",        "name": "Adam",       "language": "en-us", "gender": "male"},
    {"id": "am_michael",     "name": "Michael",    "language": "en-us", "gender": "male"},
    {"id": "bf_emma",        "name": "Emma",       "language": "en-gb", "gender": "female"},
    {"id": "bf_isabella",    "name": "Isabella",   "language": "en-gb", "gender": "female"},
    {"id": "bm_george",      "name": "George",     "language": "en-gb", "gender": "male"},
    {"id": "bm_lewis",       "name": "Lewis",      "language": "en-gb", "gender": "male"},
    {"id": "bn-bd-nabanita", "name": "Nabanita",   "language": "bn-bd", "gender": "female"},
    {"id": "bn-bd-pradeep",  "name": "Pradeep",    "language": "bn-bd", "gender": "male"},
    {"id": "bn-in-bashkar",  "name": "Bashkar",    "language": "bn-in", "gender": "male"},
    {"id": "bn-in-tanishaa", "name": "Tanishaa",   "language": "bn-in", "gender": "female"},
]

VOICE_LANG_MAP: dict[str, str] = {v["id"]: v["language"] for v in VOICES_CATALOG}


@app.on_event("startup")
async def startup():
    global engine, router
    engine = TTSEngine()
    try:
        await connect()
    except Exception:
        pass
    try:
        from server.orchestrator import VoiceRouter
        router = VoiceRouter()
    except Exception:
        pass


@app.on_event("shutdown")
async def shutdown():
    await disconnect()


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/voices")
async def list_voices(language: str | None = None):
    if language:
        return [v for v in VOICES_CATALOG if v["language"] == language]
    return VOICES_CATALOG


@app.post("/generate-voice/")
async def generate_voice(
    file: UploadFile = File(...),
    voice_preset: str = Query("af_bella"),
    speed: float = Query(1.0, ge=0.5, le=2.0),
    use_orchestrator: bool = Query(False),
    language_code: str | None = Query(None, pattern="^[a-z]{2}(-[a-z]{2,4})?$"),
):
    if not file.filename or not file.filename.endswith(".txt"):
        raise HTTPException(422, "Only .txt files accepted")
    content = await file.read()
    text = content.decode("utf-8").strip()
    if not text:
        raise HTTPException(400, "Script is empty")
    _validate_language(voice_preset, language_code)
    segments = optimize_script(text)
    if is_bangla_voice(voice_preset):
        audio, sample_rate = await generate_bangla(text, voice_preset, speed)
    elif use_orchestrator and router:
        routes = router.route_segments(segments)
        audio, sample_rate = engine.generate_routed(segments, routes)
    else:
        audio, sample_rate = engine.generate_long(segments, voice=voice_preset, speed=speed)
    out = os.path.join(OUTPUT_DIR, f"{uuid.uuid4().hex}.wav")
    sf.write(out, audio, sample_rate)
    return FileResponse(out, media_type="audio/wav", filename="output.wav")


@app.post("/api/generate")
async def generate_json(
    text: str = Body(..., embed=True),
    voice: str = Query("af_bella"),
    speed: float = Query(1.0, ge=0.5, le=2.0),
    use_orchestrator: bool = Query(False),
    language_code: str | None = Query(None, pattern="^[a-z]{2}(-[a-z]{2,4})?$"),
    user_id: str | None = Query(None),
    service: str = Query("styletts2"),
):
    if not text.strip():
        raise HTTPException(400, "Text is empty")

    lang = detect_language(text)

    if lang == "bn" and not is_bangla_voice(voice):
        voice = "bn-bd-nabanita"
    elif lang == "en" and is_bangla_voice(voice):
        voice = "af_bella"

    _validate_language(voice, language_code)
    segments = optimize_script(text)
    detected = VOICE_LANG_MAP.get(voice, "en-us")
    if is_bangla_voice(voice):
        audio, sample_rate = await generate_bangla(text, voice, speed)
    elif use_orchestrator and router:
        routes = router.route_segments(segments)
        audio, sample_rate = engine.generate_routed(segments, routes)
    else:
        audio, sample_rate = engine.generate_long(segments, voice=voice, speed=speed)
    out_name = f"{uuid.uuid4().hex}.wav"
    out_path = os.path.join(OUTPUT_DIR, out_name)
    sf.write(out_path, audio, sample_rate)
    try:
        voice_name = next((v["name"] for v in VOICES_CATALOG if v["id"] == voice), voice)
        history_id = await save_voice_history(
            user_id=user_id,
            text=text,
            voice_id=voice,
            voice_name=voice_name,
            audio_path=out_name,
            service=service,
            language=detected,
        )
    except Exception:
        history_id = None
    return FileResponse(
        out_path,
        media_type="audio/wav",
        filename="output.wav",
        headers={
            "X-Language-Detected": detected,
            "X-History-Id": str(history_id) if history_id else "",
        },
    )


@app.get("/api/history")
async def history_list(
    user_id: str | None = Query(None),
    service: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
):
    try:
        items = await list_voice_history(user_id, service, limit, skip)
        return {"items": items, "total": len(items)}
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})


@app.get("/api/history/{history_id}")
async def history_get(history_id: str):
    item = await get_voice_history_item(history_id)
    if not item:
        raise HTTPException(404, "History item not found")
    return item


@app.delete("/api/history/{history_id}")
async def history_delete(history_id: str):
    deleted = await delete_voice_history(history_id)
    if not deleted:
        raise HTTPException(404, "History item not found")
    return {"deleted": True}


@app.get("/api/audio/{history_id}")
async def serve_audio(history_id: str):
    item = await get_voice_history_item(history_id)
    if not item:
        raise HTTPException(404, "Audio not found")
    audio_path = os.path.join(OUTPUT_DIR, item["audioPath"])
    if not os.path.exists(audio_path):
        raise HTTPException(404, "Audio file not found")
    return FileResponse(audio_path, media_type="audio/wav", filename="output.wav")


def language_code_to_voice(language_code: str | None) -> str | None:
    if language_code is None:
        return None
    for v in VOICES_CATALOG:
        if v["language"] == language_code:
            return v["id"]
    return None


def _validate_language(voice: str, language_code: str | None) -> None:
    if language_code is None:
        return
    voice_lang = VOICE_LANG_MAP.get(voice)
    if voice_lang is None:
        raise HTTPException(422, f"Unknown voice: {voice}")
    if voice_lang != language_code:
        raise HTTPException(
            422,
            f"Voice '{voice}' supports '{voice_lang}', not '{language_code}'.",
        )
