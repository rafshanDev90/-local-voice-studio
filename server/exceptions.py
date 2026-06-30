from __future__ import annotations


class TTSModelError(Exception):
    """Model loading or initialization failed."""


class TTSGenerationError(Exception):
    """Speech generation inference failed."""


class TTSAudioError(Exception):
    """Audio processing or post-processing failed."""


class TTSConfigError(Exception):
    """Invalid configuration or parameters."""
