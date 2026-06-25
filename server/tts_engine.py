import numpy as np
from kokoro_onnx import Kokoro

DEFAULT_SAMPLE_RATE = 24000
SILENCE_GAP = 0.3

VOICE_PRESETS = [
    "af_bella",
    "af_heart",
    "af_nicole",
    "am_adam",
    "am_michael",
    "af_bella",
    "af_heart",
]

class TTSEngine:
    def __init__(self, model_path: str = "models/kokoro-v0_19.onnx", voices_path: str = "models/voices.bin"):
        self.kokoro = Kokoro(model_path, voices_path)
        self.model_path = model_path

    def generate(self, text: str, voice: str = "af_bella", speed: float = 1.0) -> tuple[np.ndarray, int]:
        samples, sample_rate = self.kokoro.create(text, voice=voice, speed=speed)
        return samples, sample_rate

    def generate_long(self, segments: list[str], voice: str = "af_bella", speed: float = 1.0) -> tuple[np.ndarray, int]:
        audio_parts = []
        sample_rate = DEFAULT_SAMPLE_RATE
        silence = np.zeros(int(DEFAULT_SAMPLE_RATE * SILENCE_GAP), dtype=np.float32)

        for segment in segments:
            if not segment.strip():
                continue
            samples, sr = self.kokoro.create(segment, voice=voice, speed=speed)
            sample_rate = sr
            if len(audio_parts) > 0:
                audio_parts.append(silence)
            audio_parts.append(samples)

        if not audio_parts:
            return np.array([], dtype=np.float32), sample_rate

        return np.concatenate(audio_parts), sample_rate
