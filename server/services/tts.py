from __future__ import annotations

import logging
import os
import uuid

import numpy as np

from server.services.audio_formats import FORMATS, write_audio
from server.services.orchestrator import VoiceRouter
from server.services.optimizer import optimize_script
from server.repositories.voice_history import VoiceHistoryRepository
from server.services.tts_engine import (
    TTSEngine,
    detect_language,
    generate_edge_tts,
    is_bangla_voice,
    is_edge_tts_voice,
)
from server.models.voice import VOICE_LANG_MAP, get_voice_name

logger = logging.getLogger("voice-agent.services")

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)


class TTSService:
    """Business logic layer for TTS generation."""

    def __init__(self, engine: TTSEngine, voice_router: VoiceRouter | None = None):
        self.engine = engine
        self.voice_router = voice_router

    def _resolve_voice(self, text: str, voice: str, language_code: str | None) -> str:
        lang = detect_language(text)
        if lang == "bn" and not is_bangla_voice(voice):
            voice = "bn-bd-nabanita"
        elif lang == "en" and is_bangla_voice(voice):
            voice = "af_bella"
        if language_code:
            voice_lang = VOICE_LANG_MAP.get(voice)
            if voice_lang and voice_lang != language_code:
                raise ValueError(
                    f"Voice '{voice}' supports '{voice_lang}', not '{language_code}'."
                )
        return voice

    async def generate(
        self,
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
        voice = self._resolve_voice(text, voice, language_code)
        segments = optimize_script(text)
        detected = VOICE_LANG_MAP.get(voice, "en-us")

        if is_edge_tts_voice(voice):
            audio, sample_rate = await generate_edge_tts(
                text, voice, speed, stability, style_exaggeration
            )
        elif use_orchestrator and self.voice_router:
            routes = self.voice_router.route_segments(segments)
            audio, sample_rate = self.engine.generate_routed(segments, routes)
        else:
            audio, sample_rate = self.engine.generate_long(
                segments,
                voice=voice,
                speed=speed,
                stability=stability,
                style_exaggeration=style_exaggeration,
            )

        out_stem = uuid.uuid4().hex
        out_path = write_audio(OUTPUT_DIR, out_stem, audio, sample_rate, format)
        out_name = os.path.basename(out_path)

        history_id = None
        try:
            voice_name = get_voice_name(voice)
            history_id = await VoiceHistoryRepository.save(
                user_id=user_id,
                text=text,
                voice_id=voice,
                voice_name=voice_name,
                audio_path=out_name,
                service=service,
                language=detected,
            )
        except Exception as e:
            logger.warning("History save failed, using file fallback: %s", e)

        return {
            "audioUrl": f"/api/audio/{history_id or out_stem}",
            "historyId": str(history_id) if history_id else None,
            "languageDetected": detected,
        }

    async def generate_from_file(
        self,
        text: str,
        voice_preset: str = "af_bella",
        speed: float = 1.0,
        stability: float = 0.5,
        style_exaggeration: float = 0.0,
        use_orchestrator: bool = False,
        language_code: str | None = None,
        format: str = "wav",
    ) -> dict:
        if language_code:
            voice_lang = VOICE_LANG_MAP.get(voice_preset)
            if voice_lang and voice_lang != language_code:
                raise ValueError(
                    f"Voice '{voice_preset}' supports '{voice_lang}', not '{language_code}'."
                )

        segments = optimize_script(text)

        if is_edge_tts_voice(voice_preset):
            audio, sample_rate = await generate_edge_tts(
                text, voice_preset, speed, stability, style_exaggeration
            )
        elif use_orchestrator and self.voice_router:
            routes = self.voice_router.route_segments(segments)
            audio, sample_rate = self.engine.generate_routed(segments, routes)
        else:
            audio, sample_rate = self.engine.generate_long(
                segments,
                voice=voice_preset,
                speed=speed,
                stability=stability,
                style_exaggeration=style_exaggeration,
            )

        out_stem = uuid.uuid4().hex
        out_path = write_audio(OUTPUT_DIR, out_stem, audio, sample_rate, format)
        out_name = os.path.basename(out_path)

        history_id = None
        try:
            voice_name = get_voice_name(voice_preset)
            detected = VOICE_LANG_MAP.get(voice_preset, "en-us")
            history_id = await VoiceHistoryRepository.save(
                user_id=None,
                text=text,
                voice_id=voice_preset,
                voice_name=voice_name,
                audio_path=out_name,
                service="styletts2",
                language=detected,
            )
        except Exception as e:
            logger.warning("History save failed, using file fallback: %s", e)

        return {
            "audioUrl": f"/api/audio/{history_id or out_stem}",
            "historyId": str(history_id) if history_id else None,
        }
