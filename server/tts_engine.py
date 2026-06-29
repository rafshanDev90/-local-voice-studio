from __future__ import annotations

import asyncio
import io
import re
from typing import Any

import edge_tts
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

DEFAULT_SAMPLE_RATE = 24000
TARGET_RMS = 0.14

BANGLA_VOICE_MAP: dict[str, str] = {
    "bn-bd-nabanita": "bn-BD-NabanitaNeural",
    "bn-bd-pradeep": "bn-BD-PradeepNeural",
    "bn-in-bashkar": "bn-IN-BashkarNeural",
    "bn-in-tanishaa": "bn-IN-TanishaaNeural",
}

EMOTION_PROFILES = {
    "excited": {"speed": 1.15, "volume": 1.3},
    "whisper": {"speed": 0.8, "volume": 0.35},
    "slow": {"speed": 0.75, "volume": 1.0},
    "fast": {"speed": 1.25, "volume": 1.0},
    "loud": {"speed": 1.0, "volume": 1.5},
    "soft": {"speed": 0.9, "volume": 0.6},
    "serious": {"speed": 0.85, "volume": 1.1},
    "happy": {"speed": 1.1, "volume": 1.15},
    "sad": {"speed": 0.8, "volume": 0.7},
}

_BANGLA_UNICODE_RANGE = range(0x0980, 0x0A00)


def is_bangla_voice(voice: str) -> bool:
    return voice in BANGLA_VOICE_MAP


def detect_language(text: str) -> str:
    bn = 0
    ascii_letter = 0
    for c in text:
        if ord(c) in _BANGLA_UNICODE_RANGE:
            bn += 1
        elif c.isascii() and c.isalpha():
            ascii_letter += 1
    if bn == 0 and ascii_letter == 0:
        return "en"
    if ascii_letter == 0 and bn > 0:
        return "bn"
    if bn >= ascii_letter:
        return "bn"
    if bn > 0:
        return "mixed"
    return "en"


def normalize_volume(samples: np.ndarray, target_rms: float = TARGET_RMS) -> np.ndarray:
    current_rms = np.sqrt(np.mean(samples ** 2))
    if current_rms < 1e-6:
        return samples
    gain = target_rms / current_rms
    peak = np.abs(samples).max()
    max_gain = 0.95 / peak if peak > 0 else 1.0
    gain = min(gain, max_gain)
    return samples * gain


async def generate_bangla(
    text: str, voice: str, speed: float = 1.0,
) -> tuple[np.ndarray, int]:
    voice_id = BANGLA_VOICE_MAP.get(voice, voice)
    rate = f"{int((speed - 1) * 100):+d}%"
    communicate = edge_tts.Communicate(text, voice_id, rate=rate)
    audio_bytes = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_bytes += chunk["data"]
    data, sr = sf.read(io.BytesIO(audio_bytes))
    if data.ndim > 1:
        data = data.mean(axis=1)
    data = data.astype(np.float32)
    data = normalize_volume(data)
    return data, int(sr)


class TTSEngine:
    def __init__(self, model_path: str = "server/models/kokoro-v0_19.onnx", voices_path: str = "server/models/voices.bin"):
        self.kokoro = Kokoro(model_path, voices_path)

    def generate(self, text: str, voice: str = "af_bella", speed: float = 1.0, volume: float = 1.0) -> tuple[np.ndarray, int]:
        clean, emotion = self._apply_emotion(text)
        sp = emotion.get("speed", 1.0) * speed
        vol = emotion.get("volume", 1.0) * volume
        if sp < 0.5:
            sp = 0.5
        samples, sr = self.kokoro.create(clean, voice=voice, speed=sp)
        if vol != 1.0:
            samples = self._scale_volume(samples, vol)
        samples = normalize_volume(samples)
        return samples, sr

    def generate_long(self, segments: list[str], voice: str = "af_bella", speed: float = 1.0, volume: float = 1.0) -> tuple[np.ndarray, int]:
        profiles = [(s, voice, speed, volume) for s in segments]
        return self._generate_profiles(profiles)

    def generate_routed(self, segments: list[str], routes: list[tuple[str, float, float]]) -> tuple[np.ndarray, int]:
        profiles = [(seg, v, s, vol) for (seg, (v, s, vol)) in zip(segments, routes)]
        return self._generate_profiles(profiles)

    def _generate_profiles(self, profiles: list[tuple[str, str, float, float]]) -> tuple[np.ndarray, int]:
        audio_parts = []
        sample_rate = DEFAULT_SAMPLE_RATE
        prev = None

        for text, voice, speed, volume in profiles:
            if not text.strip():
                continue

            clean, emotion = self._apply_emotion(text)
            sp = emotion.get("speed", 1.0) * speed
            vol = emotion.get("volume", 1.0) * volume
            if sp < 0.5:
                sp = 0.5

            samples, sr = self.kokoro.create(clean, voice=voice, speed=sp)
            sample_rate = sr

            if vol != 1.0:
                samples = self._scale_volume(samples, vol)
            samples = normalize_volume(samples)

            gap = self._silence_gap(prev, text)
            if prev is not None and gap > 0:
                audio_parts.append(np.zeros(int(sample_rate * gap), dtype=np.float32))
            audio_parts.append(samples)
            prev = text

        if not audio_parts:
            return np.array([], dtype=np.float32), sample_rate
        return np.concatenate(audio_parts), sample_rate

    @staticmethod
    def _apply_emotion(text: str) -> tuple[str, dict]:
        tags = re.findall(r'\[(\w+)\]', text)
        clean = re.sub(r'\[\w+\]\s*', '', text).strip()
        params = {}
        for tag in tags:
            tl = tag.lower()
            if tl in EMOTION_PROFILES:
                p = EMOTION_PROFILES[tl]
                params["speed"] = params.get("speed", 1.0) * p["speed"]
                params["volume"] = params.get("volume", 1.0) * p["volume"]
        return clean, params

    @staticmethod
    def _scale_volume(samples: np.ndarray, factor: float) -> np.ndarray:
        peak = np.abs(samples).max()
        if peak > 0:
            limit = min(factor, 0.95 / peak) if factor > 1.0 else factor
            return samples * limit
        return samples

    @staticmethod
    def _silence_gap(prev: str | None, curr: str | None) -> float:
        if prev is None:
            return 0.0
        end = prev.rstrip()
        if end.endswith("..."):
            return 0.7
        if end.endswith(("!", "?")):
            return 0.5
        if end.endswith("."):
            return 0.35
        if curr and curr.lstrip()[:4].lower() in ("and", "but ", "so ", "then"):
            return 0.2
        return 0.3
