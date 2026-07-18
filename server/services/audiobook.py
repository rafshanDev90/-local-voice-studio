from __future__ import annotations

import json
import logging
import os
import uuid

from server.services.audio_formats import FORMATS, write_audio
from server.services.audiobook_core import process_audiobook
from server.repositories.voice_history import VoiceHistoryRepository
from server.models.voice import VOICE_LANG_MAP, get_voice_name
from server.services.tts_engine import TTSEngine

logger = logging.getLogger("voice-agent.services")

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output")
COVERS_DIR = os.path.join(os.path.dirname(__file__), "..", "covers")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(COVERS_DIR, exist_ok=True)


class AudiobookService:
    """Business logic layer for audiobook generation."""

    def __init__(self, engine: TTSEngine):
        self.engine = engine

    async def generate(
        self,
        text: str,
        voice: str = "af_bella",
        speed: float = 1.0,
        format: str = "mp3",
    ) -> dict:
        audio, sr, chapters = await process_audiobook(text, voice, speed, self.engine)

        out_stem = uuid.uuid4().hex
        out_path = write_audio(OUTPUT_DIR, out_stem, audio, sr, format)
        out_name = os.path.basename(out_path)

        history_id = None
        chapters_json = json.dumps(chapters)
        try:
            voice_name = get_voice_name(voice)
            detected = VOICE_LANG_MAP.get(voice, "en-us")
            history_id = await VoiceHistoryRepository.save(
                user_id=None,
                text=text,
                voice_id=voice,
                voice_name=voice_name,
                audio_path=out_name,
                service="audiobook",
                language=detected,
            )
            if history_id:
                await VoiceHistoryRepository.update(
                    history_id,
                    {"chapters": chapters_json, "isAudiobook": True, "coverImage": None},
                )
        except Exception as e:
            logger.warning("Audiobook history save failed, using file fallback: %s", e)

        return {
            "audioUrl": f"/api/audio/{history_id or out_stem}",
            "historyId": history_id,
            "chapters": chapters,
        }

    async def upload_cover(self, history_id: str, filename: str, content_type: str, content: bytes) -> str:
        ext = filename.rsplit(".", 1)[-1] if "." in filename else "webp"
        cover_path = os.path.join(COVERS_DIR, f"{history_id}.{ext}")
        with open(cover_path, "wb") as f:
            f.write(content)
        cover_url = f"/api/audiobook/{history_id}/cover"
        await VoiceHistoryRepository.update(history_id, {"coverImage": cover_url})
        return cover_url

    @staticmethod
    def get_cover_path(history_id: str) -> str | None:
        for ext in ("jpg", "jpeg", "png", "webp"):
            path = os.path.join(COVERS_DIR, f"{history_id}.{ext}")
            if os.path.exists(path):
                return path
        return None
