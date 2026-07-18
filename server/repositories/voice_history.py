from __future__ import annotations

import logging
from datetime import datetime

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger("voice-agent.repositories")

client: AsyncIOMotorClient | None = None
DB_NAME: str = "voice_agent"


async def connect(url: str) -> None:
    global client, DB_NAME
    client = AsyncIOMotorClient(url, serverSelectionTimeoutMS=5000)
    await client.admin.command("ping")


async def disconnect() -> None:
    global client
    if client:
        client.close()
        client = None


def get_db():
    if client is None:
        raise RuntimeError("MongoDB not connected")
    return client[DB_NAME]


class VoiceHistoryRepository:
    """Data access layer for voice_history collection."""

    @staticmethod
    async def save(
        user_id: str | None,
        text: str,
        voice_id: str,
        voice_name: str,
        audio_path: str,
        service: str,
        language: str,
    ) -> str:
        db = get_db()
        doc = {
            "userId": user_id or "anonymous",
            "text": text,
            "title": text[:80] + ("..." if len(text) > 80 else ""),
            "voice": voice_id,
            "voiceName": voice_name,
            "audioPath": audio_path,
            "audioUrl": "/api/audio/{id}",
            "service": service,
            "language": language,
            "duration": "0:30",
            "createdAt": datetime.utcnow(),
        }
        result = await db.voice_history.insert_one(doc)
        doc_id = str(result.inserted_id)
        await db.voice_history.update_one(
            {"_id": result.inserted_id},
            {"$set": {"audioUrl": f"/api/audio/{doc_id}"}},
        )
        return doc_id

    @staticmethod
    async def update(
        history_id: str,
        data: dict,
    ) -> None:
        db = get_db()
        await db.voice_history.update_one(
            {"_id": ObjectId(history_id)},
            {"$set": data},
        )

    @staticmethod
    async def list(
        user_id: str | None = None,
        service: str | None = None,
        limit: int = 50,
        skip: int = 0,
    ) -> list[dict]:
        db = get_db()
        query: dict = {}
        if user_id:
            query["userId"] = user_id
        if service:
            query["service"] = service
        cursor = (
            db.voice_history.find(query)
            .sort("createdAt", -1)
            .skip(skip)
            .limit(limit)
        )
        items = []
        async for doc in cursor:
            doc["id"] = str(doc.pop("_id"))
            doc["date"] = doc["createdAt"].strftime("%B %d, %Y") if doc.get("createdAt") else ""
            doc["time"] = doc["createdAt"].strftime("%I:%M %p") if doc.get("createdAt") else ""
            doc["createdAt"] = doc["createdAt"].isoformat() if doc.get("createdAt") else ""
            items.append(doc)
        return items

    @staticmethod
    async def get(history_id: str) -> dict | None:
        db = get_db()
        try:
            doc = await db.voice_history.find_one({"_id": ObjectId(history_id)})
        except Exception:
            return None
        if not doc:
            return None
        doc["id"] = str(doc.pop("_id"))
        return doc

    @staticmethod
    async def delete(history_id: str) -> bool:
        db = get_db()
        try:
            result = await db.voice_history.delete_one({"_id": ObjectId(history_id)})
            return result.deleted_count > 0
        except Exception:
            return False
