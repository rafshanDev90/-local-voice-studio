from __future__ import annotations

import asyncio
import io
import logging
import re
from typing import Any

import edge_tts
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro
from server.exceptions import TTSModelError, TTSGenerationError, TTSAudioError

logger = logging.getLogger("voice-agent")

DEFAULT_SAMPLE_RATE = 24000
TARGET_RMS = 0.14

BANGLA_VOICE_MAP: dict[str, str] = {
    "bn-bd-nabanita": "bn-BD-NabanitaNeural",
    "bn-bd-pradeep": "bn-BD-PradeepNeural",
    "bn-in-bashkar": "bn-IN-BashkarNeural",
    "bn-in-tanishaa": "bn-IN-TanishaaNeural",
}

EDGE_TTS_ENGLISH_MALE_VOICES: dict[str, str] = {
    "em_guy": "en-US-GuyNeural",
    "em_andrew": "en-US-AndrewNeural",
    "em_brian": "en-US-BrianNeural",
    "em_ryan": "en-GB-RyanNeural",
    "em_thomas": "en-GB-ThomasNeural",
    "em_william": "en-AU-WilliamMultilingualNeural",
}

EDGE_TTS_VOICE_MAP: dict[str, str] = {**BANGLA_VOICE_MAP, **EDGE_TTS_ENGLISH_MALE_VOICES}



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


def is_edge_tts_voice(voice: str) -> bool:
    return voice in EDGE_TTS_VOICE_MAP


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


def apply_stability(samples: np.ndarray, stability: float, sample_rate: int = DEFAULT_SAMPLE_RATE) -> np.ndarray:
    if stability >= 1.0:
        return samples
    frame_ms = 50
    frame_len = max(1, int(sample_rate * frame_ms / 1000))
    num_frames = max(2, len(samples) // frame_len)
    variation = 1.0 - stability
    gains = np.random.uniform(1.0 - variation * 0.3, 1.0 + variation * 0.3, num_frames)
    gains = np.interp(
        np.linspace(0, 1, len(samples)),
        np.linspace(0, 1, num_frames),
        gains,
    )
    return samples * gains.astype(samples.dtype)


def apply_style_exaggeration(samples: np.ndarray, style_exaggeration: float) -> np.ndarray:
    if style_exaggeration <= 0.0:
        return samples
    abs_s = np.abs(samples)
    peak = abs_s.max()
    if peak < 1e-6:
        return samples
    norm = abs_s / peak
    threshold = 0.5
    expand = 1.0 + style_exaggeration * 0.5
    compress = 1.0 - style_exaggeration * 0.3
    mapped = np.where(
        norm > threshold,
        threshold + (norm - threshold) * expand,
        norm * compress,
    )
    mapped = np.clip(mapped, 0.0, 1.0)
    gain = mapped / np.clip(norm, 1e-6, None)
    return samples * gain.astype(samples.dtype)


def _parse_edge_emotion(text: str) -> tuple[str, str]:
    tags = re.findall(r'\[(\w+)\]', text)
    clean = re.sub(r'\s*\[\/?\w+\]\s*', ' ', text).strip()
    clean = re.sub(r'\s+', ' ', clean)
    rate_mult = 1.0
    for tag in tags:
        tl = tag.lower()
        if tl in EMOTION_PROFILES:
            rate_mult *= EMOTION_PROFILES[tl]["speed"]
    pct = int((rate_mult - 1) * 100)
    rate_str = f"{pct:+d}%" if pct != 0 else "+0%"
    return clean, rate_str


async def generate_edge_tts(
    text: str, voice: str, speed: float = 1.0,
    stability: float = 0.5, style_exaggeration: float = 0.0,
    volume: float = 1.0,
) -> tuple[np.ndarray, int]:
    voice_id = EDGE_TTS_VOICE_MAP.get(voice, voice)

    clean_text, emotion_rate = _parse_edge_emotion(text)
    base_rate = int((speed - 1) * 100)
    rate_parts = []
    if base_rate != 0:
        rate_parts.append(f"{base_rate:+d}%")
    rate_parts.append(emotion_rate)
    final_rate = " ".join(rate_parts) if rate_parts else "+0%"

    communicate = edge_tts.Communicate(clean_text, voice_id, rate=final_rate)
    audio_bytes = b""
    try:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_bytes += chunk["data"]
    except Exception as e:
        logger.error("Edge-TTS stream failed: %s", e, exc_info=True)
        raise TTSGenerationError(f"Failed to stream audio from edge-tts voice={voice}") from e
    if not audio_bytes:
        logger.error("Edge-TTS returned empty audio for voice=%s", voice)
        raise TTSGenerationError(f"Edge-TTS returned empty audio for voice={voice}")
    try:
        data, sr = sf.read(io.BytesIO(audio_bytes))
    except Exception as e:
        logger.error("Failed to read edge-tts audio bytes: %s", e, exc_info=True)
        raise TTSAudioError("Failed to decode edge-tts audio") from e
    if data.ndim > 1:
        data = data.mean(axis=1)
    data = data.astype(np.float32)
    try:
        if volume != 1.0:
            peak = np.abs(data).max()
            if peak > 0:
                limit = min(volume, 0.95 / peak) if volume > 1.0 else volume
                data = data * limit
        data = apply_stability(data, stability, int(sr))
        data = apply_style_exaggeration(data, style_exaggeration)
        data = normalize_volume(data)
    except Exception as e:
        logger.error("Edge-TTS audio post-processing failed: %s", e, exc_info=True)
        raise TTSAudioError("Failed to post-process edge-tts audio") from e
    return data, int(sr)


class TTSEngine:
    def __init__(self, model_path: str = "server/models/kokoro-v0_19.onnx", voices_path: str = "server/models/voices.bin"):
        try:
            self.kokoro = Kokoro(model_path, voices_path)
        except Exception as e:
            logger.error("Kokoro model init failed: %s", e, exc_info=True)
            raise TTSModelError(f"Failed to load Kokoro model from {model_path}") from e

    def generate(
        self, text: str, voice: str = "af_bella",
        speed: float = 1.0, volume: float = 1.0,
        stability: float = 0.5, style_exaggeration: float = 0.0,
    ) -> tuple[np.ndarray, int]:
        clean, emotion = self._apply_emotion(text)
        sp = emotion.get("speed", 1.0) * speed
        vol = emotion.get("volume", 1.0) * volume
        if sp < 0.5:
            sp = 0.5
        try:
            samples, sr = self.kokoro.create(clean, voice=voice, speed=sp)
        except Exception as e:
            logger.error("Kokoro generate failed: %s", e, exc_info=True)
            raise TTSGenerationError(f"Failed to generate speech for voice={voice}") from e
        if vol != 1.0:
            samples = self._scale_volume(samples, vol)
        try:
            samples = apply_stability(samples, stability, sr)
            samples = apply_style_exaggeration(samples, style_exaggeration)
            samples = normalize_volume(samples)
        except Exception as e:
            logger.error("Audio post-processing failed: %s", e, exc_info=True)
            raise TTSAudioError("Failed to post-process audio") from e
        return samples, sr

    def generate_long(
        self, segments: list[str], voice: str = "af_bella",
        speed: float = 1.0, volume: float = 1.0,
        stability: float = 0.5, style_exaggeration: float = 0.0,
    ) -> tuple[np.ndarray, int]:
        profiles = [(s, voice, speed, volume, stability, style_exaggeration) for s in segments]
        return self._generate_profiles(profiles)

    def generate_routed(self, segments: list[str], routes: list[tuple[str, float, float]]) -> tuple[np.ndarray, int]:
        profiles = [(seg, v, s, vol, 0.5, 0.0) for (seg, (v, s, vol)) in zip(segments, routes)]
        return self._generate_profiles(profiles)

    def _generate_profiles(self, profiles: list[tuple[str, str, float, float, float, float]]) -> tuple[np.ndarray, int]:
        audio_parts = []
        sample_rate = DEFAULT_SAMPLE_RATE
        prev = None

        for text, voice, speed, volume, stability, style_exaggeration in profiles:
            if not text.strip():
                continue

            clean, emotion = self._apply_emotion(text)
            sp = emotion.get("speed", 1.0) * speed
            vol = emotion.get("volume", 1.0) * volume
            if sp < 0.5:
                sp = 0.5

            try:
                samples, sr = self.kokoro.create(clean, voice=voice, speed=sp)
            except Exception as e:
                logger.error("Kokoro segment failed for voice=%s: %s", voice, e, exc_info=True)
                raise TTSGenerationError(f"Failed to generate segment for voice={voice}") from e
            sample_rate = sr

            if vol != 1.0:
                samples = self._scale_volume(samples, vol)
            try:
                samples = apply_stability(samples, stability, sr)
                samples = apply_style_exaggeration(samples, style_exaggeration)
                samples = normalize_volume(samples)
            except Exception as e:
                logger.error("Segment audio post-processing failed: %s", e, exc_info=True)
                raise TTSAudioError("Failed to post-process segment audio") from e

            gap = self._silence_gap(prev, text)
            if prev is not None and gap > 0:
                audio_parts.append(np.zeros(int(sample_rate * gap), dtype=np.float32))
            audio_parts.append(samples)
            prev = text

        if not audio_parts:
            return np.array([], dtype=np.float32), sample_rate
        try:
            return np.concatenate(audio_parts), sample_rate
        except Exception as e:
            logger.error("Failed to concatenate audio parts: %s", e, exc_info=True)
            raise TTSAudioError("Failed to concatenate audio segments") from e

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
