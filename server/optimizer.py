import re
import httpx
from typing import Optional

OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "llama3.2:3b"

def optimize_script(text: str) -> list[str]:
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

def split_into_sentences(text: str) -> list[str]:
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if s.strip()]
