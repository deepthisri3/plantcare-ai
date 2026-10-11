import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routes.analyze import router as analyze_router
from app.routes.challenge import router as challenge_router
from app.routes.model import router as model_router
from app.services.gemma_service import gemma_service

# Logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("touch_grass.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Touch Grass API backend...")
    logger.info("Configured Gemma Model: %s", settings.gemma_model)
    logger.info("Ollama Base URL: %s", settings.ollama_base_url)
    status = await gemma_service.get_ollama_status()
    if status["connected"]:
        logger.info(
            "Connected to Ollama! Available models: %s",
            status.get("available_models", []),
        )
    else:
        logger.warning(
            "Ollama is not currently reachable at %s. Start with `ollama serve`.",
            settings.ollama_base_url,
        )
    yield
    logger.info("Shutting down Touch Grass API backend...")


app = FastAPI(
    title="Touch Grass — AI Plant Health Companion",
    description=(
        "Open-weight AI plant identification and health analysis backend. "
        "Powered by Gemma 3 through Ollama for Hacktoberfest 2026."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze_router)
app.include_router(model_router)
app.include_router(challenge_router)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for container orchestrators and monitoring."""
    ollama_info = await gemma_service.get_ollama_status()
    return {
        "status": "ok",
        "service": "Touch Grass — AI Plant Health Companion",
        "version": "1.0.0",
        "gemma_model": settings.gemma_model,
        "ollama_connected": ollama_info["connected"],
        "model_available": ollama_info["model_available"],
        "disclaimer": settings.disclaimer,
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "name": "Touch Grass — AI Plant Health Companion API",
        "tagline": "Go outside. Find a plant. Let AI help you understand it.",
        "docs_url": "/docs",
        "hacktoberfest": "Hacktoberfest 2026 — Open-Source AI Challenge — Week 1",
        "open_weight_model": settings.gemma_model,
    }
