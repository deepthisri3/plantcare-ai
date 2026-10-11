import logging
from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile, status
from app.config import settings
from app.schemas.analysis import AnalysisResponse
from app.services.gemma_service import GemmaServiceError, gemma_service

logger = logging.getLogger("touch_grass.routes.analyze")
router = APIRouter(prefix="/api", tags=["Analysis"])

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}


@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    summary="Analyze outdoor plant photo using Gemma open-weight AI",
)
async def analyze_plant(
    image: UploadFile = File(...),
    demo_mode: bool = Form(default=False),
    demo: Optional[bool] = Query(default=None),
):
    """Accepts an uploaded outdoor plant image and performs vision analysis

    using the configured open-weight Gemma model through Ollama.
    """
    if not image:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided. Please choose a plant photo.",
        )

    # Validate content type
    content_type = (image.content_type or "").lower()
    if content_type not in ALLOWED_MIME_TYPES:
        return AnalysisResponse(
            success=False,
            model_used=settings.gemma_model,
            disclaimer=settings.disclaimer,
            error=f"Unsupported file format '{content_type or 'unknown'}'. Please upload a JPG, PNG, or WEBP image.",
            error_code="INVALID_FILE_TYPE",
            troubleshooting=[
                "Supported formats are JPEG, PNG, and WebP.",
                "If on mobile, use the native camera capture or photo picker.",
            ],
        )

    # Read image bytes with size limit guard
    try:
        max_bytes = settings.max_image_size_mb * 1024 * 1024
        contents = await image.read()
        if len(contents) == 0:
            return AnalysisResponse(
                success=False,
                model_used=settings.gemma_model,
                disclaimer=settings.disclaimer,
                error="The uploaded image is empty.",
                error_code="EMPTY_IMAGE",
                troubleshooting=["Please select an actual photo file with image content."],
            )
        if len(contents) > max_bytes:
            return AnalysisResponse(
                success=False,
                model_used=settings.gemma_model,
                disclaimer=settings.disclaimer,
                error=f"Image size exceeds the maximum limit of {settings.max_image_size_mb}MB.",
                error_code="IMAGE_TOO_LARGE",
                troubleshooting=[
                    f"Compress or downscale your photo to under {settings.max_image_size_mb}MB.",
                    "Most phone camera photos work directly, but ultra-RAW files should be compressed.",
                ],
            )
    except Exception as e:
        logger.error("Failed to read uploaded image bytes: %s", e)
        return AnalysisResponse(
            success=False,
            model_used=settings.gemma_model,
            disclaimer=settings.disclaimer,
            error="Could not read the uploaded image stream.",
            error_code="READ_ERROR",
        )

    # Check for Demo Mode (skips Ollama, returns clear simulated observation)
    is_demo = bool(demo_mode) or (demo is True)
    if is_demo:
        demo_analysis = gemma_service.get_demo_analysis(filename=image.filename or "plant.jpg")
        return AnalysisResponse(
            success=True,
            analysis=demo_analysis,
            model_used="Offline Demo Simulation (Gemma 3 Emulated)",
            disclaimer=(
                "[DEMO SIMULATION] This observation was generated in Offline Demo Mode for testing purposes. "
                "It is not an actual prediction from the live Gemma model."
            ),
            is_demo=True,
        )

    # Invoke Gemma Service
    try:
        analysis = await gemma_service.analyze_plant_image(
            image_bytes=contents,
            filename=image.filename or "plant.jpg",
        )
        return AnalysisResponse(
            success=True,
            analysis=analysis,
            model_used=settings.gemma_model,
            disclaimer=settings.disclaimer,
        )
    except GemmaServiceError as exc:
        logger.warning("Gemma service error: %s (%s)", exc.message, exc.error_code)
        return AnalysisResponse(
            success=False,
            model_used=settings.gemma_model,
            disclaimer=settings.disclaimer,
            error=exc.message,
            error_code=exc.error_code,
            troubleshooting=exc.troubleshooting,
        )
    except Exception as exc:
        logger.exception("Unexpected error in plant analysis: %s", exc)
        return AnalysisResponse(
            success=False,
            model_used=settings.gemma_model,
            disclaimer=settings.disclaimer,
            error="An unexpected server error occurred during AI observation.",
            error_code="INTERNAL_SERVER_ERROR",
            troubleshooting=[
                "Check server logs for traceback.",
                "Ensure Ollama is running and responsive.",
            ],
        )
