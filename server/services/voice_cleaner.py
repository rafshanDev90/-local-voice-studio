from __future__ import annotations

import logging
import os
import tempfile
import uuid

import numpy as np
import soundfile as sf

from server.services.audio_formats import convert_audio, FORMATS

logger = logging.getLogger("voice-agent.services")

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

SUPPORTED_EXTENSIONS = {".wav", ".mp3", ".ogg", ".flac", ".m4a", ".wma", ".aac"}
MAX_FILE_SIZE_MB = 100


def _validate_file(filename: str | None, size: int) -> None:
    """Validate uploaded file extension and size."""
    if not filename:
        raise ValueError("No filename provided")

    ext = os.path.splitext(filename)[1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported format '{ext}'. "
            f"Supported: {', '.join(sorted(SUPPORTED_EXTENSIONS))}"
        )

    size_mb = size / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise ValueError(f"File too large ({size_mb:.1f}MB). Max: {MAX_FILE_SIZE_MB}MB")


async def clean_audio(
    file_content: bytes,
    filename: str,
    output_format: str = "wav",
    prop_decrease: float = 0.8,
) -> dict:
    """
    Clean speech audio by removing background noise using noisereduce.

    Args:
        file_content: Raw bytes of the uploaded audio file.
        filename: Original filename (used for validation).
        output_format: Output format (wav, mp3, ogg, flac).
        prop_decrease: Noise reduction strength (0.0-1.0). Higher = more aggressive.

    Returns:
        dict with audioUrl, originalName, outputFormat.
    """
    _validate_file(filename, len(file_content))

    if output_format not in FORMATS:
        raise ValueError(f"Unsupported output format: {output_format}")

    if not 0.0 <= prop_decrease <= 1.0:
        raise ValueError("prop_decrease must be between 0.0 and 1.0")

    import noisereduce as nr

    with tempfile.NamedTemporaryFile(
        suffix=os.path.splitext(filename)[1], delete=False
    ) as tmp_in:
        tmp_in.write(file_content)
        tmp_in_path = tmp_in.name

    try:
        audio_data, sample_rate = sf.read(tmp_in_path)

        if audio_data.ndim == 2:
            audio_data = audio_data.T

        reduced = nr.reduce_noise(
            y=audio_data,
            sr=sample_rate,
            stationary=False,
            prop_decrease=prop_decrease,
        )

        out_stem = uuid.uuid4().hex
        wav_path = os.path.join(OUTPUT_DIR, f"{out_stem}.wav")

        if reduced.ndim == 1:
            sf.write(wav_path, reduced, sample_rate)
        else:
            sf.write(wav_path, reduced.T, sample_rate)

        if output_format != "wav":
            final_path = os.path.join(
                OUTPUT_DIR, f"{out_stem}{FORMATS[output_format]['ext']}"
            )
            convert_audio(wav_path, final_path, output_format)
            os.remove(wav_path)
        else:
            final_path = wav_path

        return {
            "audioUrl": f"/api/audio/{out_stem}",
            "originalName": filename,
            "outputFormat": output_format,
        }

    finally:
        if os.path.exists(tmp_in_path):
            os.unlink(tmp_in_path)
