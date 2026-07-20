from __future__ import annotations

import logging

from fastapi import HTTPException, UploadFile

from server.services import voice_cleaner

logger = logging.getLogger("voice-agent.controllers")


async def clean(
    file: UploadFile,
    output_format: str = "wav",
    prop_decrease: float = 0.8,
) -> dict:
    if not file.filename:
        raise HTTPException(400, "No file provided")

    content = await file.read()
    if not content:
        raise HTTPException(400, "Uploaded file is empty")

    try:
        return await voice_cleaner.clean_audio(
            file_content=content,
            filename=file.filename,
            output_format=output_format,
            prop_decrease=prop_decrease,
        )
    except ValueError as e:
        raise HTTPException(422, str(e))
    except Exception as e:
        logger.error("Voice cleaning failed: %s", e, exc_info=True)
        raise HTTPException(500, "Voice cleaning failed")
