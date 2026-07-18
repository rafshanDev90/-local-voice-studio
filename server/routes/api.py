from __future__ import annotations

import os

from fastapi import APIRouter, Body, File, Query, UploadFile
from fastapi.responses import FileResponse

from server.services.audio_formats import FORMATS
from server.controllers import audiobook as audiobook_ctrl
from server.controllers import generate as generate_ctrl
from server.controllers import health as health_ctrl
from server.controllers import history as history_ctrl
from server.controllers import voice as voice_ctrl
from server.repositories.voice_history import VoiceHistoryRepository

api_router = APIRouter()

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output")

COVERS_DIR = os.path.join(os.path.dirname(__file__), "..", "covers")
os.makedirs(COVERS_DIR, exist_ok=True)


# ── Health ────────────────────────────────────────────────────────────────────


@api_router.get("/health")
async def health():
    return await health_ctrl.health()


@api_router.get("/api/db/health")
async def db_health():
    return await health_ctrl.db_health()


# ── Voices ────────────────────────────────────────────────────────────────────


@api_router.get("/api/voices")
async def list_voices(language: str | None = None):
    return await voice_ctrl.list_voices(language)


# ── Generate (JSON body) ──────────────────────────────────────────────────────


@api_router.post("/api/generate")
async def generate_json(
    text: str = Body(..., embed=True),
    voice: str = Query("af_bella"),
    speed: float = Query(1.0, ge=0.5, le=2.0),
    stability: float = Query(0.5, ge=0.0, le=1.0),
    style_exaggeration: float = Query(0.0, ge=0.0, le=1.0),
    use_orchestrator: bool = Query(False),
    language_code: str | None = Query(None, pattern="^[a-z]{2}(-[a-z]{2,4})?$"),
    user_id: str | None = Query(None),
    service: str = Query("styletts2"),
    format: str = Query("wav", pattern="^(wav|mp3|ogg|flac)$"),
):
    return await generate_ctrl.generate_from_text(
        text=text, voice=voice, speed=speed, stability=stability,
        style_exaggeration=style_exaggeration, use_orchestrator=use_orchestrator,
        language_code=language_code, user_id=user_id, service=service, format=format,
    )


# ── Generate (file upload) ────────────────────────────────────────────────────


@api_router.post("/generate-voice/")
async def generate_voice(
    file: UploadFile = File(...),
    voice_preset: str = Query("af_bella"),
    speed: float = Query(1.0, ge=0.5, le=2.0),
    stability: float = Query(0.5, ge=0.0, le=1.0),
    style_exaggeration: float = Query(0.0, ge=0.0, le=1.0),
    use_orchestrator: bool = Query(False),
    language_code: str | None = Query(None, pattern="^[a-z]{2}(-[a-z]{2,4})?$"),
    format: str = Query("wav", pattern="^(wav|mp3|ogg|flac)$"),
):
    return await generate_ctrl.generate_from_file(
        file=file, voice_preset=voice_preset, speed=speed, stability=stability,
        style_exaggeration=style_exaggeration, use_orchestrator=use_orchestrator,
        language_code=language_code, format=format,
    )


# ── Audiobook ─────────────────────────────────────────────────────────────────


@api_router.post("/api/audiobook")
async def generate_audiobook(
    text: str = Body(..., embed=True),
    voice: str = Query("af_bella"),
    speed: float = Query(1.0, ge=0.5, le=2.0),
    format: str = Query("mp3", pattern="^(wav|mp3|ogg|flac)$"),
):
    return await audiobook_ctrl.generate(text=text, voice=voice, speed=speed, format=format)


@api_router.post("/api/audiobook/{history_id}/cover")
async def upload_audiobook_cover(history_id: str, file: UploadFile = File(...)):
    return await audiobook_ctrl.upload_cover(history_id, file)


@api_router.get("/api/audiobook/{history_id}/cover")
async def serve_audiobook_cover(history_id: str):
    path = audiobook_ctrl.audiobook_service.get_cover_path(history_id) if audiobook_ctrl.audiobook_service else None
    if not path:
        from fastapi import HTTPException
        raise HTTPException(404, "Cover not found")
    ext = os.path.splitext(path)[1].lower().lstrip(".")
    media = f"image/{'jpeg' if ext in ('jpg', 'jpeg') else ext}"
    return FileResponse(path, media_type=media)


# ── Audio ─────────────────────────────────────────────────────────────────────


@api_router.get("/api/audio/{history_id}")
async def serve_audio(history_id: str):
    from fastapi import HTTPException
    try:
        item = await VoiceHistoryRepository.get(history_id)
    except Exception:
        item = None

    if item:
        audio_path = os.path.join(OUTPUT_DIR, item["audioPath"])
    else:
        for ext in ("wav", "mp3", "ogg", "flac"):
            candidate = os.path.join(OUTPUT_DIR, f"{history_id}.{ext}")
            if os.path.exists(candidate):
                audio_path = candidate
                break
        else:
            raise HTTPException(404, "Audio not found")

    if not os.path.exists(audio_path):
        raise HTTPException(404, "Audio file not found")
    ext = os.path.splitext(audio_path)[1].lower().lstrip(".")
    mime = FORMATS.get(ext, {}).get("mime", "application/octet-stream")
    return FileResponse(audio_path, media_type=mime)


# ── History ───────────────────────────────────────────────────────────────────


@api_router.get("/api/history")
async def history_list(
    user_id: str | None = Query(None),
    service: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
):
    return await history_ctrl.list_history(user_id=user_id, service=service, limit=limit, skip=skip)


@api_router.get("/api/history/{history_id}")
async def history_get(history_id: str):
    return await history_ctrl.get_history(history_id)


@api_router.delete("/api/history/{history_id}")
async def history_delete(history_id: str):
    return await history_ctrl.delete_history(history_id)
