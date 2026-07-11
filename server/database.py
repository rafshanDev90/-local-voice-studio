import os
import uuid
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.environ.get(
    "MONGO_URL",
    "mongodb://AmzAdmin:SuperAdmin123@5.189.147.108:27017/test?authSource=admin&retryWrites=true&w=majority&directConnection=true",
)
DB_NAME = os.environ.get("MONGO_DB_NAME", "voice_agent")

client: AsyncIOMotorClient | None = None


async def connect():
    global client
    client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
    await client.admin.command("ping")


async def disconnect():
    global client
    if client:
        client.close()
        client = None


def get_db():
    if client is None:
        raise RuntimeError("MongoDB not connected")
    return client[DB_NAME]


async def save_voice_history(
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
        "audioUrl": f"/api/audio/{{id}}",
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


async def list_voice_history(
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


async def get_voice_history_item(history_id: str) -> dict | None:
    db = get_db()
    try:
        doc = await db.voice_history.find_one({"_id": ObjectId(history_id)})
    except Exception:
        return None
    if not doc:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc


async def delete_voice_history(history_id: str) -> bool:
    db = get_db()
    try:
        result = await db.voice_history.delete_one({"_id": ObjectId(history_id)})
        return result.deleted_count > 0
    except Exception:
        return False
