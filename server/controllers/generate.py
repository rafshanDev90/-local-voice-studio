from __future__ import annotations

import logging

from fastapi import HTTPException, UploadFile

from server.models.voice import VOICE_LANG_MAP
from server.services.tts import TTSService

logger = logging.getLogger("voice-agent.controllers")

ttsservice: TTSService | None = None


def init(service: TTSService) -> None:
    global ttsservice
    ttsservice = service


async def generate_from_text(
    text: str,
    voice: str = "af_bella",
    speed: float = 1.0,
    stability: float = 0.5,
    style_exaggeration: float = 0.0,
    use_orchestrator: bool = False,
    language_code: str | None = None,
    user_id: str | None = None,
    service: str = "styletts2",
    format: str = "wav",
) -> dict:
    if not text.strip():
        raise HTTPException(400, "Text is empty")
    if len(text) > 5000:
        raise HTTPException(400, "Text exceeds maximum length of 5000 characters")
    if ttsservice is None:
        raise HTTPException(503, "TTS service not initialized")

    try:
        return await ttsservice.generate(
            text=text, voice=voice, speed=speed, stability=stability,
            style_exaggeration=style_exaggeration, use_orchestrator=use_orchestrator,
            language_code=language_code, user_id=user_id, service=service, format=format,
        )
    except ValueError as e:
        raise HTTPException(422, str(e))
    except Exception as e:
        logger.error("Generate failed: %s", e, exc_info=True)
        raise HTTPException(500, "Speech generation failed")


async def generate_from_file(
    file: UploadFile,
    voice_preset: str = "af_bella",
    speed: float = 1.0,
    stability: float = 0.5,
    style_exaggeration: float = 0.0,
    use_orchestrator: bool = False,
    language_code: str | None = None,
    format: str = "wav",
) -> dict:
    if not file.filename or not file.filename.endswith(".txt"):
        raise HTTPException(422, "Only .txt files accepted")
    content = await file.read()
    text = content.decode("utf-8").strip()
    if not text:
        raise HTTPException(400, "Script is empty")
    if len(text) > 5000:
        raise HTTPException(400, "Script exceeds maximum length of 5000 characters")
    if ttsservice is None:
        raise HTTPException(503, "TTS service not initialized")

    try:
        return await ttsservice.generate_from_file(
            text=text, voice_preset=voice_preset, speed=speed, stability=stability,
            style_exaggeration=style_exaggeration, use_orchestrator=use_orchestrator,
            language_code=language_code, format=format,
        )
    except ValueError as e:
        raise HTTPException(422, str(e))
    except Exception as e:
        logger.error("Generate from file failed: %s", e, exc_info=True)
        raise HTTPException(500, "Speech generation failed")
