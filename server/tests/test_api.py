from __future__ import annotations

from unittest.mock import ANY, patch, AsyncMock

import pytest
from fastapi import status


class TestHealth:
    def test_health_check(self, client):
        resp = client.get("/health")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == {"status": "ok"}


class TestVoices:
    def test_list_all_voices(self, client):
        resp = client.get("/api/voices")
        assert resp.status_code == status.HTTP_200_OK
        voices = resp.json()
        assert len(voices) == 20
        assert voices[0]["id"] == "af_bella"
        assert voices[0]["language"] == "en-us"

    def test_list_voices_filter_bn_bd(self, client):
        resp = client.get("/api/voices?language=bn-bd")
        assert resp.status_code == status.HTTP_200_OK
        voices = resp.json()
        assert len(voices) == 2
        assert all(v["language"] == "bn-bd" for v in voices)

    def test_list_voices_filter_en_us(self, client):
        resp = client.get("/api/voices?language=en-us")
        assert resp.status_code == status.HTTP_200_OK
        voices = resp.json()
        assert len(voices) == 9
        assert all(v["language"] == "en-us" for v in voices)

    def test_list_voices_filter_unknown(self, client):
        resp = client.get("/api/voices?language=xx-xx")
        assert resp.status_code == status.HTTP_200_OK
        assert resp.json() == []


class TestGenerate:
    def test_generate_english(self, client):
        resp = client.post("/api/generate?voice=af_bella", json={"text": "Hello world"})
        assert resp.status_code == status.HTTP_200_OK
        body = resp.json()
        assert "audioUrl" in body
        assert "historyId" in body

    def test_generate_with_speed_param(self, client):
        resp = client.post(
            "/api/generate?voice=af_bella&speed=1.5",
            json={"text": "Fast speech"},
        )
        assert resp.status_code == status.HTTP_200_OK

    def test_generate_with_stability_param(self, client):
        resp = client.post(
            "/api/generate?voice=af_bella&stability=0.2",
            json={"text": "Less stable speech"},
        )
        assert resp.status_code == status.HTTP_200_OK

    def test_generate_with_style_exaggeration_param(self, client):
        resp = client.post(
            "/api/generate?voice=af_bella&style_exaggeration=0.8",
            json={"text": "Exaggerated speech"},
        )
        assert resp.status_code == status.HTTP_200_OK

    def test_generate_with_all_params(self, client):
        resp = client.post(
            "/api/generate?voice=af_bella&speed=0.8&stability=0.7&style_exaggeration=0.3",
            json={"text": "All params"},
        )
        assert resp.status_code == status.HTTP_200_OK

    def test_generate_bangla_text_auto_routes_to_bangla_voice(self, client):
        resp = client.post(
            "/api/generate?voice=af_bella",
            json={"text": "আমার সোনার বাংলা"},
        )
        assert resp.status_code == status.HTTP_200_OK
        body = resp.json()
        assert body.get("languageDetected") is not None

    def test_generate_english_text_on_bangla_voice_routes_to_english(self, client):
        resp = client.post(
            "/api/generate?voice=bn-bd-nabanita",
            json={"text": "Hello world"},
        )
        assert resp.status_code == status.HTTP_200_OK
        body = resp.json()
        assert body.get("languageDetected") is not None

    def test_generate_bangla_on_bangla_voice_stays(self, client):
        resp = client.post(
            "/api/generate?voice=bn-bd-nabanita",
            json={"text": "আমার সোনার বাংলা"},
        )
        assert resp.status_code == status.HTTP_200_OK

    def test_generate_empty_text_returns_400(self, client):
        resp = client.post(
            "/api/generate?voice=af_bella",
            json={"text": ""},
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_generate_whitespace_text_returns_400(self, client):
        resp = client.post(
            "/api/generate?voice=af_bella",
            json={"text": "   "},
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_generate_language_mismatch_returns_422(self, client):
        resp = client.post(
            "/api/generate?voice=af_bella&language_code=bn-bd",
            json={"text": "Hello world"},
        )
        assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_generate_invalid_voice_returns_200(self, client):
        resp = client.post(
            "/api/generate?voice=nonexistent",
            json={"text": "Hello"},
        )
        assert resp.status_code == status.HTTP_200_OK

    def test_generate_speed_out_of_range_returns_422(self, client):
        resp = client.post(
            "/api/generate?voice=af_bella&speed=3.0",
            json={"text": "Hello"},
        )
        assert resp.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_generate_returns_json_response(self, client):
        resp = client.post(
            "/api/generate?voice=af_bella",
            json={"text": "Hello world"},
        )
        assert resp.status_code == status.HTTP_200_OK
        assert "application/json" in resp.headers["content-type"]
        body = resp.json()
        assert "audioUrl" in body
        assert "historyId" in body


class TestHistory:
    def test_history_list_returns_valid_structure(self, client):
        resp = client.get("/api/history")
        assert resp.status_code == status.HTTP_200_OK
        body = resp.json()
        assert "items" in body
        assert "total" in body

    def test_history_get_not_found_returns_404(self, client):
        resp = client.get("/api/history/nonexistent-id")
        assert resp.status_code == status.HTTP_404_NOT_FOUND

    def test_history_delete_not_found_returns_404(self, client):
        resp = client.delete("/api/history/nonexistent-id")
        assert resp.status_code == status.HTTP_404_NOT_FOUND
