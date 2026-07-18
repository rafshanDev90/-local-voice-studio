from __future__ import annotations

import logging

from fastapi import HTTPException, UploadFile

from server.services.audiobook import AudiobookService

logger = logging.getLogger("voice-agent.controllers")

audiobook_service: AudiobookService | None = None


def init(service: AudiobookService) -> None:
    global audiobook_service
    audiobook_service = service


ALLOWED_COVER_TYPES = {"image/jpeg", "image/png", "image/webp"}


async def generate(
    text: str,
    voice: str = "af_bella",
    speed: float = 1.0,
    format: str = "mp3",
) -> dict:
    if not text.strip():
        raise HTTPException(400, "Text is empty")
    if audiobook_service is None:
        raise HTTPException(503, "Audiobook service not initialized")

    try:
        return await audiobook_service.generate(text=text, voice=voice, speed=speed, format=format)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        logger.error("Audiobook generation failed: %s", e, exc_info=True)
        raise HTTPException(500, "Audiobook generation failed")


async def upload_cover(history_id: str, file: UploadFile) -> dict:
    if file.content_type not in ALLOWED_COVER_TYPES:
        raise HTTPException(422, "Only JPEG, PNG, and WebP images are accepted")
    if audiobook_service is None:
        raise HTTPException(503, "Audiobook service not initialized")
    content = await file.read()
    cover_url = await audiobook_service.upload_cover(history_id, file.filename or "", file.content_type, content)
    return {"coverUrl": cover_url}
