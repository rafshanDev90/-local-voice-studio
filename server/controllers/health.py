from __future__ import annotations

from server.models.schemas import HealthResponse, DBHealthResponse
from server.repositories.voice_history import get_db


async def health() -> HealthResponse:
    return HealthResponse()


async def db_health() -> DBHealthResponse:
    try:
        db = get_db()
        await db.command("ping")
        from server.repositories.voice_history import DB_NAME
        return DBHealthResponse(status="connected", database=DB_NAME)
    except Exception as e:
        return DBHealthResponse(status="disconnected", error=str(e))
