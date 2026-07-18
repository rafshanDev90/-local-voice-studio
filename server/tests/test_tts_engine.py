from __future__ import annotations

import numpy as np
import pytest

from server.services.tts_engine import (
    BANGLA_VOICE_MAP,
    DEFAULT_SAMPLE_RATE,
    TARGET_RMS,
    apply_stability,
    apply_style_exaggeration,
    detect_language,
    is_bangla_voice,
    normalize_volume,
)


class TestDetectLanguage:
    def test_pure_bangla(self):
        result = detect_language("আমার সোনার বাংলা")
        assert result == "bn"

    def test_pure_english(self):
        result = detect_language("Hello world")
        assert result == "en"

    def test_bangla_with_ascii_punctuation(self):
        result = detect_language("হ্যালো, আমি বাংলায় কথা বলি।")
        assert result == "bn"

    def test_bangla_with_digits_and_punctuation(self):
        result = detect_language("ধাপ 1: শুরু করুন")
        assert result == "bn"

    def test_english_with_digits(self):
        result = detect_language("Step 1: start here")
        assert result == "en"

    def test_mixed_bangla_english_bangla_dominant(self):
        result = detect_language("আমার নাম John এবং আমি")
        assert result == "bn"

    def test_mixed_bangla_english_english_dominant(self):
        result = detect_language("My name is John এবং")
        assert result == "mixed"

    def test_only_punctuation_and_spaces(self):
        result = detect_language("  , . ! ?  ")
        assert result == "en"

    def test_empty_string(self):
        result = detect_language("")
        assert result == "en"

    def test_only_digits(self):
        result = detect_language("123 456 789")
        assert result == "en"

    def test_newlines_and_tabs(self):
        result = detect_language("Hello\nWorld\t!")
        assert result == "en"

    def test_bangla_digits_are_bangla(self):
        text = "".join(chr(c) for c in range(0x09E6, 0x09F0))
        result = detect_language(text)
        assert result == "bn"


class TestIsBanglaVoice:
    def test_known_voices(self):
        for voice_id in BANGLA_VOICE_MAP:
            assert is_bangla_voice(voice_id)

    def test_unknown_voice(self):
        assert not is_bangla_voice("af_bella")

    def test_empty_string(self):
        assert not is_bangla_voice("")

    def test_partial_match(self):
        assert not is_bangla_voice("bn-bd")


class TestNormalizeVolume:
    def test_raises_silent_to_target_rms(self):
        samples = np.ones(1000, dtype=np.float32) * 0.01
        result = normalize_volume(samples)
        actual_rms = np.sqrt(np.mean(result ** 2))
        assert actual_rms == pytest.approx(TARGET_RMS, rel=0.1)

    def test_silent_input_returns_unchanged(self):
        samples = np.zeros(1000, dtype=np.float32)
        result = normalize_volume(samples)
        assert np.all(result == 0)

    def test_does_not_clip_beyond_0_95(self):
        samples = np.ones(1000, dtype=np.float32) * 0.5
        result = normalize_volume(samples)
        assert np.abs(result).max() <= 0.96

    def test_returns_same_shape(self):
        samples = np.random.randn(5000).astype(np.float32)
        result = normalize_volume(samples)
        assert result.shape == samples.shape

    def test_target_rms_constant(self):
        samples1 = np.random.randn(5000).astype(np.float32) * 0.01
        samples2 = np.random.randn(5000).astype(np.float32) * 0.5
        rms1 = np.sqrt(np.mean(normalize_volume(samples1) ** 2))
        rms2 = np.sqrt(np.mean(normalize_volume(samples2) ** 2))
        assert rms1 == pytest.approx(rms2, rel=0.1)

    def test_dtype_preserved(self):
        samples = np.random.randn(1000).astype(np.float32)
        result = normalize_volume(samples)
        assert result.dtype == np.float32


class TestApplyStability:
    def test_max_stability_returns_identical(self):
        samples = np.random.randn(1000).astype(np.float32)
        result = apply_stability(samples.copy(), 1.0)
        assert np.array_equal(result, samples)

    def test_zero_stability_changes_audio(self):
        samples = np.random.randn(5000).astype(np.float32)
        result = apply_stability(samples.copy(), 0.0)
        assert not np.array_equal(result, samples)

    def test_zero_stability_preserves_shape(self):
        samples = np.random.randn(5000).astype(np.float32)
        result = apply_stability(samples.copy(), 0.0)
        assert result.shape == samples.shape

    def test_stability_0_5_changes_less_than_0_0(self):
        sr = DEFAULT_SAMPLE_RATE
        samples = np.random.randn(sr * 2).astype(np.float32)
        r0 = apply_stability(samples.copy(), 0.0)
        r5 = apply_stability(samples.copy(), 0.5)
        diff0 = np.abs(r0 - samples).mean()
        diff5 = np.abs(r5 - samples).mean()
        assert diff0 > diff5

    def test_silent_input_unchanged(self):
        samples = np.zeros(1000, dtype=np.float32)
        result = apply_stability(samples.copy(), 0.0)
        assert np.all(result == 0)

    def test_dtype_preserved(self):
        samples = np.random.randn(1000).astype(np.float32)
        result = apply_stability(samples.copy(), 0.5)
        assert result.dtype == np.float32


class TestApplyStyleExaggeration:
    def test_zero_exaggeration_returns_identical(self):
        samples = np.random.randn(1000).astype(np.float32)
        result = apply_style_exaggeration(samples.copy(), 0.0)
        assert np.array_equal(result, samples)

    def test_max_exaggeration_changes_audio(self):
        samples = np.random.randn(5000).astype(np.float32)
        result = apply_style_exaggeration(samples.copy(), 1.0)
        assert not np.array_equal(result, samples)

    def test_preserves_shape(self):
        samples = np.random.randn(5000).astype(np.float32)
        result = apply_style_exaggeration(samples.copy(), 1.0)
        assert result.shape == samples.shape

    def test_expands_dynamic_range(self):
        samples = np.concatenate([
            np.random.randn(2000).astype(np.float32) * 0.05,
            np.random.randn(2000).astype(np.float32) * 0.8,
        ])
        original_ratio = np.std(samples[:2000]) / np.std(samples[2000:])
        result = apply_style_exaggeration(samples.copy(), 1.0)
        result_ratio = np.std(result[:2000]) / np.std(result[2000:])
        assert result_ratio < original_ratio

    def test_silent_input_unchanged(self):
        samples = np.zeros(1000, dtype=np.float32)
        result = apply_style_exaggeration(samples.copy(), 1.0)
        assert np.all(result == 0)

    def test_no_nan_output(self):
        samples = np.random.randn(5000).astype(np.float32)
        result = apply_style_exaggeration(samples.copy(), 0.5)
        assert not np.any(np.isnan(result))
        assert not np.any(np.isinf(result))

    def test_dtype_preserved(self):
        samples = np.random.randn(1000).astype(np.float32)
        result = apply_style_exaggeration(samples.copy(), 0.5)
        assert result.dtype == np.float32
