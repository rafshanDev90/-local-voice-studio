from __future__ import annotations

from server.models.voice import VOICES_CATALOG


async def list_voices(language: str | None = None):
    if language:
        return [v for v in VOICES_CATALOG if v.language == language]
    return VOICES_CATALOG
