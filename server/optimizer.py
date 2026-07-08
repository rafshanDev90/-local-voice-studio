from __future__ import annotations

import re
from typing import Any

import httpx

from server.pronunciation import normalize_technical_text, enhance_prosody

OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "llama3.2:3b"


def contains_bangla(text: str) -> bool:
    return any(ord(c) in range(0x0980, 0x0A00) for c in text)


def split_into_sentences(text: str) -> list[str]:
    if not text.strip():
        return [""]

    text = re.sub(r'\s+', ' ', text).strip()

    if contains_bangla(text):
        parts = re.split(r'(?<=[।!?])\s*', text)
    else:
        parts = re.split(r'(?<=[.!?])\s+', text)

    result = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        if len(p) > 300:
            sub = re.split(r'(?<=[;,])\s*', p)
            result.extend(s.strip() for s in sub if s.strip())
        else:
            result.append(p)

    return result if result else [text]


def split_content_by_language(text: str) -> list[tuple[str, str]]:
    segments: list[tuple[str, str]] = []
    current = ""
    current_lang = ""

    i = 0
    while i < len(text):
        char = text[i]
        is_bn = ord(char) in range(0x0980, 0x0A00)

        chunk_lang = "bn" if is_bn else "en"

        if not current_lang:
            current_lang = chunk_lang

        if chunk_lang != current_lang and current.strip():
            segments.append((current.strip(), current_lang))
            current = ""
            current_lang = chunk_lang

        current += char
        i += 1

    if current.strip():
        segments.append((current.strip(), current_lang))

    return segments if segments else [(text, "en")]


def optimize_script(text: str) -> list[str]:
    if contains_bangla(text):
        return split_into_sentences(text)

    text = normalize_technical_text(text)
    text = enhance_prosody(text)

    try:
        response = httpx.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": (
                    "Split the following text into natural speech segments "
                    "suitable for text-to-speech. "
                    "Return only the segments separated by '---':\n\n" + text
                ),
                "stream": False,
            },
            timeout=30,
        )
        if response.status_code == 200:
            content = response.json()["response"]
            segments = [s.strip() for s in content.split("---") if s.strip()]
            if segments:
                return segments
    except Exception:
        pass
    return split_into_sentences(text)
