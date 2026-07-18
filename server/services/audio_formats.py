from __future__ import annotations

import os
import subprocess
from typing import Any

import soundfile as sf

FORMATS: dict[str, dict[str, Any]] = {
    "wav": {"mime": "audio/wav", "ext": ".wav"},
    "mp3": {"mime": "audio/mpeg", "ext": ".mp3"},
    "ogg": {"mime": "audio/ogg", "ext": ".ogg"},
    "flac": {"mime": "audio/flac", "ext": ".flac"},
}


def convert_audio(input_path: str, output_path: str, fmt: str) -> str:
    fmt = fmt.lower()
    if fmt not in FORMATS:
        raise ValueError(f"Unsupported format: {fmt}")
    if fmt == "wav":
        return input_path

    if fmt == "mp3":
        subprocess.run(
            [
                "ffmpeg", "-y", "-i", input_path,
                "-codec:a", "libmp3lame", "-qscale:a", "2",
                output_path,
            ],
            check=True, capture_output=True,
        )
    elif fmt == "ogg":
        data, sr = sf.read(input_path)
        sf.write(output_path, data, int(sr), format="OGG")
    elif fmt == "flac":
        data, sr = sf.read(input_path)
        sf.write(output_path, data, int(sr), format="FLAC")

    return output_path


def write_audio(
    output_dir: str, stem: str, audio_data, sample_rate: int, fmt: str,
) -> str:
    wav_path = os.path.join(output_dir, f"{stem}.wav")
    sf.write(wav_path, audio_data, sample_rate)
    if fmt == "wav":
        return wav_path
    final_path = os.path.join(output_dir, f"{stem}{FORMATS[fmt]['ext']}")
    convert_audio(wav_path, final_path, fmt)
    os.remove(wav_path)
    return final_path
