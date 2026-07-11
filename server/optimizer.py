from __future__ import annotations

import logging
import os
import re
import time
from typing import Any

import httpx

logger = logging.getLogger("voice-agent.optimizer")

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5-coder:1.5b")
OLLAMA_TIMEOUT = int(os.environ.get("OLLAMA_TIMEOUT", "15"))

MISTRAL_API_KEY = os.environ.get("MISTRAL_API_KEY", "")
MISTRAL_MODEL = os.environ.get("MISTRAL_MODEL", "mistral-small-latest")
MISTRAL_TIMEOUT = int(os.environ.get("MISTRAL_TIMEOUT", "30"))

MAX_RETRIES = 3

REFUSAL_PATTERNS = [
    re.compile(r"(?i)i'?m sorry"),
    re.compile(r"(?i)cannot assist"),
    re.compile(r"(?i)can't assist"),
    re.compile(r"(?i)illegal"),
    re.compile(r"(?i)cannot provide"),
    re.compile(r"(?i)can't provide"),
    re.compile(r"(?i)here's the text"),
    re.compile(r"Sure! Here"),
    re.compile(r"Here's the"),
]


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


def validate_segments(segments: list[str]) -> list[str] | None:
    if not segments:
        logger.warning("Validation failed: 0 segments returned")
        return None

    if len(segments) == 1 and len(segments[0]) > 200:
        logger.warning(
            "Validation of seg: single segment of %d chars",
            len(segments[0]),
        )
        return None

    for pat in REFUSAL_PATTERNS:
        for s in segments:
            if pat.search(s):
                logger.warning(
                    "Validation failed: refusal detected in segment (pattern=%s)",
                    pat.pattern,
                )
                return None

    avg_len = sum(len(s) for s in segments) / len(segments)
    logger.info(
        "%d segments | avg %d chars/segment | validated",
        len(segments), int(avg_len),
    )
    return segments


def call_ollama(full_prompt: str) -> str | None:
    for attempt in range(1, MAX_RETRIES + 1):
        timeout = OLLAMA_TIMEOUT * attempt
        try:
            start = time.monotonic()
            response = httpx.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": full_prompt,
                    "stream": False,
                },
                timeout=timeout,
            )
            elapsed = int((time.monotonic() - start) * 1000)

            if response.status_code == 200:
                content = response.json().get("response", "")
                logger.info(
                    "Ollama %s | %dms | attempt %d/%d | success",
                    OLLAMA_MODEL, elapsed, attempt, MAX_RETRIES,
                )
                return content

            logger.warning(
                "Ollama returned %d on attempt %d/%d | %dms",
                response.status_code, attempt, MAX_RETRIES, elapsed,
            )

        except httpx.TimeoutException:
            elapsed = OLLAMA_TIMEOUT * attempt * 1000
            logger.warning(
                "Ollama timeout on attempt %d/%d | %ds timeout",
                attempt, MAX_RETRIES, OLLAMA_TIMEOUT * attempt,
            )
        except httpx.ConnectError:
            logger.error(
                "Ollama unreachable at %s on attempt %d/%d",
                OLLAMA_BASE_URL, attempt, MAX_RETRIES,
            )
            break
        except Exception as e:
            logger.error(
                "Ollama error on attempt %d/%d: %s",
                attempt, MAX_RETRIES, e,
            )

    logger.error(
        "Ollama %s exhausted %d retries, trying Mistral fallback",
        OLLAMA_MODEL, MAX_RETRIES,
    )
    return None


def call_mistral(full_prompt: str) -> str | None:
    if not MISTRAL_API_KEY:
        logger.warning("MISTRAL_API_KEY not set, skipping Mistral fallback")
        return None

    try:
        start = time.monotonic()
        response = httpx.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {MISTRAL_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": MISTRAL_MODEL,
                "messages": [{"role": "user", "content": full_prompt}],
                "max_tokens": 4096,
            },
            timeout=MISTRAL_TIMEOUT,
        )
        elapsed = int((time.monotonic() - start) * 1000)

        if response.status_code == 200:
            content = response.json()["choices"][0]["message"]["content"]
            logger.info(
                "Mistral %s | %dms | success",
                MISTRAL_MODEL, elapsed,
            )
            return content

        logger.warning(
            "Mistral returned %d | %dms",
            response.status_code, elapsed,
        )
    except Exception as e:
        logger.error("Mistral API error: %s", e)

    return None


def call_llm_with_fallback(text: str, prompt: str = "") -> str | None:
    full_prompt = (prompt or "") + text
    result = call_ollama(full_prompt)
    if result:
        return result
    return call_mistral(full_prompt)


def optimize_script(text: str) -> list[str]:
    from server.optimizer_en import optimize_english
    from server.optimizer_bn import optimize_bangla

    if contains_bangla(text):
        return optimize_bangla(text, call_llm_with_fallback, split_into_sentences)
    return optimize_english(text, call_llm_with_fallback, split_into_sentences)
