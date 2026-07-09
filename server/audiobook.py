from __future__ import annotations

import asyncio
import re
from typing import Any

import numpy as np

from server.pronunciation import normalize_technical_text, enhance_prosody, contains_bangla
from server.optimizer import split_into_sentences
from server.tts_engine import is_edge_tts_voice, generate_edge_tts

# Chapter detection patterns — English
CHAPTER_PATTERNS = [
    re.compile(r"^#\s+(.+)$", re.MULTILINE),
    re.compile(r"^##\s+(.+)$", re.MULTILINE),
    re.compile(r"^Chapter\s+(\d+|[IVXLCDM]+)\b", re.MULTILINE | re.IGNORECASE),
    re.compile(r"^CHAPTER\s+(\d+|[IVXLCDM]+)\b", re.MULTILINE),
    re.compile(r"^(Part|Section|Act)\s+(\d+|[IVXLCDM]+)\b", re.MULTILINE | re.IGNORECASE),
]

# Chapter detection patterns — Bangla
BANGLA_CHAPTER_PATTERNS = [
    re.compile(r"^অধ্যায়\s+\d+", re.MULTILINE),
    re.compile(r"^পরিচ্ছেদ\s+\d+", re.MULTILINE),
    re.compile(r"^পর্ব\s+\d+", re.MULTILINE),
    re.compile(r"^সূরা\s+\w+", re.MULTILINE),
]


def detect_chapters(text: str) -> list[tuple[str, str]]:
    """Split text into (chapter_title, body) pairs. Handles English and Bangla."""
    patterns = BANGLA_CHAPTER_PATTERNS if contains_bangla(text) else CHAPTER_PATTERNS

    headings: list[tuple[int, str]] = []
    for pat in patterns:
        for m in pat.finditer(text):
            heading = m.group(0).strip()
            headings.append((m.start(), heading))

    if not headings:
        return [("", text)]

    headings.sort(key=lambda x: x[0])

    chapters: list[tuple[str, str]] = []
    for i, (pos, heading) in enumerate(headings):
        start = pos + len(heading)
        end = headings[i + 1][0] if i + 1 < len(headings) else len(text)
        body = text[start:end].strip()
        clean = re.sub(r"^#+\s*", "", heading).strip()
        chapters.append((clean, body))

    return chapters


PROSODY_BREAKS: dict[str, int] = {
    ",": 120,
    ";": 200,
    ":": 200,
    ".": 350,
    "!": 450,
    "?": 450,
    "...": 700,
}

PARA_BREAK_MS = 600
SECTION_BREAK_MS = 1500


def crossesfade(a: np.ndarray, b: np.ndarray, sr: int, fade_ms: int = 30) -> np.ndarray:
    """Crossfade two audio arrays with a short overlap to mask seam artifacts."""
    fade_len = int(sr * fade_ms / 1000)
    fade_len = min(fade_len, len(a), len(b))
    if fade_len <= 0:
        return np.concatenate([a, b])

    fade_out = np.linspace(1, 0, fade_len)
    fade_in = np.linspace(0, 1, fade_len)

    a_tail = a[-fade_len:].copy()
    b_head = b[:fade_len].copy()

    a[-fade_len:] = a[-fade_len:] * fade_out
    b[:fade_len] = b[:fade_len] * fade_in

    blended = a_tail * fade_out + b_head * fade_in
    return np.concatenate([a[:-fade_len], blended, b[fade_len:]])


async def process_audiobook(
    text: str,
    voice: str,
    speed: float,
    engine: Any,
) -> tuple[np.ndarray, int, list[dict[str, int | str]]]:
    """
    Process full text into an audiobook with chapter timestamps.

    Returns: (audio_array, sample_rate, chapters)
    chapters = [{title, start_ms, end_ms}, ...]
    """
    if not text.strip():
        raise ValueError("Text is empty")

    is_bangla = contains_bangla(text)
    chapters = detect_chapters(text)
    audio_parts: list[np.ndarray] = []
    sample_rate: int | None = None
    chapter_metadata: list[dict[str, int | str]] = []
    current_ms = 0
    prev_was_chapter = False
    use_edge = is_edge_tts_voice(voice)

    for title, body in chapters:
        if not body.strip():
            continue

        sentences = split_into_sentences(body)
        if not sentences or (len(sentences) == 1 and not sentences[0].strip()):
            continue

        # Normalize text — skip normalization for Bangla
        if not is_bangla:
            normalized = []
            for s in sentences:
                s = normalize_technical_text(s)
                s = enhance_prosody(s)
                normalized.append(s)
        else:
            normalized = sentences

        try:
            if use_edge:
                full_text = " ".join(normalized)
                audio, sr = await generate_edge_tts(full_text, voice, speed)
            else:
                audio, sr = engine.generate_long(
                    normalized, voice=voice, speed=speed
                )
            if len(audio) == 0:
                continue
        except Exception:
            continue

        if sample_rate is None:
            sample_rate = sr

        duration_ms = int(len(audio) / sr * 1000)

        if prev_was_chapter and audio_parts:
            silence_len = int(sr * SECTION_BREAK_MS / 1000)
            audio_parts.append(np.zeros(silence_len, dtype=np.float32))
            current_ms += SECTION_BREAK_MS

        chapter_metadata.append({
            "title": title if title else f"Chapter {len(chapter_metadata) + 1}",
            "start_ms": current_ms,
            "end_ms": current_ms + duration_ms,
        })

        audio_parts.append(audio)
        current_ms += duration_ms
        prev_was_chapter = True

    if not audio_parts:
        raise ValueError("No audio generated")

    full_audio = audio_parts[0]
    for part in audio_parts[1:]:
        full_audio = crossesfade(full_audio, part, sample_rate or 24000, 30)

    return full_audio, sample_rate or 24000, chapter_metadata
