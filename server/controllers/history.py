from __future__ import annotations

from fastapi import HTTPException

from server.repositories.voice_history import VoiceHistoryRepository


async def list_history(
    user_id: str | None = None,
    service: str | None = None,
    limit: int = 50,
    skip: int = 0,
) -> dict:
    try:
        items = await VoiceHistoryRepository.list(user_id, service, limit, skip)
        return {"items": items, "total": len(items)}
    except Exception as e:
        return {"items": [], "total": 0, "error": str(e)}


async def get_history(history_id: str) -> dict:
    item = await VoiceHistoryRepository.get(history_id)
    if not item:
        raise HTTPException(404, "History item not found")
    return item


async def delete_history(history_id: str) -> dict:
    deleted = await VoiceHistoryRepository.delete(history_id)
    if not deleted:
        raise HTTPException(404, "History item not found")
    return {"deleted": True}
