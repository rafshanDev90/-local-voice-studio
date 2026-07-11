from __future__ import annotations

import logging
import time

from server.pronunciation import normalize_technical_text, enhance_prosody

logger = logging.getLogger("voice-agent.optimizer_en")

SEGMENTATION_PROMPT_EN = (
    "Split the following text into natural speech segments "
    "for text-to-speech. "
    "Output only the segments, one per line, separated by '---'. "
    "Do not add any commentary or explanation.\n\n"
)


def optimize_english(
    text: str,
    call_llm: callable,
    split_fallback: callable,
) -> list[str]:
    text = normalize_technical_text(text)
    text = enhance_prosody(text)

    start = time.monotonic()
    raw_response = call_llm(text, prompt=SEGMENTATION_PROMPT_EN)

    if raw_response:
        from server.optimizer import validate_segments
        raw_segments = [s.strip() for s in raw_response.split("---") if s.strip()]
        validated = validate_segments(raw_segments)
        if validated:
            elapsed = int((time.monotonic() - start) * 1000)
            logger.info(
                "optimize_english | %dms | %d segments | llm",
                elapsed, len(validated),
            )
            return validated

    elapsed = int((time.monotonic() - start) * 1000)
    fallback = split_fallback(text)
    logger.info(
        "optimize_english | %dms | %d segments | regex fallback",
        elapsed, len(fallback),
    )
    return fallback
