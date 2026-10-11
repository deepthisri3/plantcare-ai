from fastapi import APIRouter
from app.config import settings
from app.schemas.analysis import ModelStatusResponse
from app.services.gemma_service import gemma_service

router = APIRouter(prefix="/api", tags=["Model"])


@router.get(
    "/model",
    response_model=ModelStatusResponse,
    summary="Get Ollama and Gemma open-weight model status",
)
async def get_model_status():
    """Returns Ollama connection health and status of the configured Gemma model."""
    status = await gemma_service.get_ollama_status()

    if not status["connected"]:
        message = (
            f"Ollama is unreachable at {status['base_url']}. "
            "Start Ollama with `ollama serve` to enable local Gemma inference."
        )
    elif not status["model_available"]:
        message = (
            f"Ollama is online, but model '{status['configured_model']}' is not yet downloaded. "
            f"Run `ollama pull {status['configured_model']}` in your terminal."
        )
    else:
        message = f"Ollama is online and open-weight model '{status['configured_model']}' is ready for plant vision analysis."

    return ModelStatusResponse(
        ollama_connected=status["connected"],
        configured_model=status["configured_model"],
        model_available=status["model_available"],
        available_models=status["available_models"],
        base_url=status["base_url"],
        message=message,
    )
