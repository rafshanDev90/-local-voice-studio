from __future__ import annotations

import logging
import time

logger = logging.getLogger("voice-agent.optimizer_bn")

SEGMENTATION_PROMPT_BN = (
    "নিচের লেখাটিকে প্রাকৃতিক বক্তৃতার অংশে ভাগ করুন "
    "যা টেক্সট-টু-স্পীচের জন্য উপযুক্ত। "
    "শুধুমাত্র অংশগুলো '---' দিয়ে আলাদা করে দিন। "
    "কোনো অতিরিক্ত মন্তব্য বা ব্যাখ্যা যোগ করবেন না।\n\n"
)


def optimize_bangla(
    text: str,
    call_llm: callable,
    split_fallback: callable,
) -> list[str]:
    start = time.monotonic()
    raw_response = call_llm(text, prompt=SEGMENTATION_PROMPT_BN)

    if raw_response:
        from server.optimizer import validate_segments
        raw_segments = [s.strip() for s in raw_response.split("---") if s.strip()]
        validated = validate_segments(raw_segments)
        if validated:
            elapsed = int((time.monotonic() - start) * 1000)
            logger.info(
                "optimize_bangla | %dms | %d segments | llm",
                elapsed, len(validated),
            )
            return validated

    elapsed = int((time.monotonic() - start) * 1000)
    fallback = split_fallback(text)
    logger.info(
        "optimize_bangla | %dms | %d segments | regex fallback",
        elapsed, len(fallback),
    )
    return fallback
