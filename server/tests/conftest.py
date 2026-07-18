from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import numpy as np
import pytest
from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def mock_tts_backend():
    fake_audio = (np.zeros(24000, dtype=np.float32), 24000)

    with patch("server.services.tts_engine.Kokoro") as mock_kokoro:
        instance = mock_kokoro.return_value
        instance.create.return_value = fake_audio

        with patch("server.services.tts.generate_edge_tts", new_callable=AsyncMock) as mock_edge:
            mock_edge.return_value = fake_audio
            yield


@pytest.fixture(autouse=True)
def mock_db():
    with patch("server.repositories.voice_history.connect", new_callable=AsyncMock):
        with patch("server.repositories.voice_history.disconnect", new_callable=AsyncMock):
            mock_client = MagicMock()
            mock_db_instance = MagicMock()

            mock_collection = MagicMock()
            mock_cursor = MagicMock()
            mock_cursor.sort.return_value = mock_cursor
            mock_cursor.skip.return_value = mock_cursor
            mock_cursor.limit.return_value = mock_cursor

            async def mock_aiter():
                return iter([])

            mock_cursor.__aiter__ = lambda self: iter([])
            mock_collection.find.return_value = mock_cursor
            mock_collection.find_one = AsyncMock(return_value=None)
            mock_collection.insert_one = AsyncMock(return_value=MagicMock(inserted_id="507f1f77bcf86cd799439011"))
            mock_collection.update_one = AsyncMock()
            mock_collection.delete_one = AsyncMock(return_value=MagicMock(deleted_count=0))
            mock_collection.command = AsyncMock()

            mock_db_instance.voice_history = mock_collection
            mock_db_instance.command = AsyncMock()
            mock_client.__getitem__ = lambda self, key: mock_db_instance

            with patch("server.repositories.voice_history.client", mock_client):
                yield


@pytest.fixture
def client():
    from server.app import app

    with TestClient(app) as c:
        yield c
