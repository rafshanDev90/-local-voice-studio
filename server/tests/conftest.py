from __future__ import annotations

from unittest.mock import AsyncMock, patch

import numpy as np
import pytest
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def mock_tts_backend():
    fake_audio = (np.zeros(24000, dtype=np.float32), 24000)

    with patch("server.tts_engine.Kokoro") as mock_kokoro:
        instance = mock_kokoro.return_value
        instance.create.return_value = fake_audio

        with patch("server.app.generate_bangla", new_callable=AsyncMock) as mock_bangla:
            mock_bangla.return_value = fake_audio
            yield


@pytest.fixture
def client():
    from server.app import app

    with TestClient(app) as c:
        yield c
