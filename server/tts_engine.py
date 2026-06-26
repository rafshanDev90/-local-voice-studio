import re
import numpy as np
from kokoro_onnx import Kokoro

DEFAULT_SAMPLE_RATE = 24000
SILENCE_GAP = 0.3

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

        for i, (text, voice, speed, volume) in enumerate(profiles):
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

            gap = self._silence_gap(prev, text)
            if i > 0 and gap > 0:
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
