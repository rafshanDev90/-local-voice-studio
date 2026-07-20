import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from server.models.exceptions import TTSModelError, TTSGenerationError, TTSAudioError

logger = logging.getLogger("voice-agent")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

load_dotenv()

app = FastAPI(title="Voice Agent")
origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Language-Detected", "X-History-Id"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    if isinstance(exc, TTSModelError):
        return JSONResponse(status_code=503, content={"detail": "TTS model unavailable"})
    if isinstance(exc, TTSGenerationError):
        return JSONResponse(status_code=500, content={"detail": "Speech generation failed"})
    if isinstance(exc, TTSAudioError):
        return JSONResponse(status_code=500, content={"detail": "Audio processing failed"})
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.on_event("startup")
async def startup():
    from server.repositories.voice_history import connect as db_connect
    from server.services.tts_engine import TTSEngine
    from server.services.tts import TTSService
    from server.services.audiobook import AudiobookService
    from server.controllers import generate as generate_ctrl
    from server.controllers import audiobook as audiobook_ctrl
    from server.routes.api import api_router

    mongo_url = os.environ.get("MONGO_URL")
    if mongo_url:
        try:
            await db_connect(mongo_url)
            logger.info("MongoDB connected")
        except Exception as e:
            logger.warning("Database connection failed: %s", e)
    else:
        logger.warning("MONGO_URL not set — history disabled")

    try:
        engine = TTSEngine()
        voice_router = None
        try:
            from server.services.orchestrator import VoiceRouter
            voice_router = VoiceRouter()
        except Exception as e:
            logger.warning("VoiceRouter init failed: %s", e)

        tts_service = TTSService(engine, voice_router)
        audiobook_service = AudiobookService(engine)

        generate_ctrl.init(tts_service)
        audiobook_ctrl.init(audiobook_service)
    except Exception as e:
        logger.warning("TTS engine init failed: %s", e)

    app.include_router(api_router)


@app.on_event("shutdown")
async def shutdown():
    from server.repositories.voice_history import disconnect
    await disconnect()
