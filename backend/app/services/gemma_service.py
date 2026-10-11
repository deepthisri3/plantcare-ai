import base64
import json
import logging
import re
from io import BytesIO
from typing import Any, Dict, List, Optional, Tuple
import httpx
from PIL import Image

from app.config import settings
from app.schemas.analysis import PlantAnalysis

logger = logging.getLogger("touch_grass.gemma")


class GemmaServiceError(Exception):
    def __init__(self, message: str, error_code: str, troubleshooting: Optional[List[str]] = None):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.troubleshooting = troubleshooting or []


class GemmaService:
    def __init__(self):
        self.base_url = settings.ollama_base_url.rstrip("/")
        self.model_name = settings.gemma_model
        self.timeout = settings.analysis_timeout_seconds

    async def get_ollama_status(self) -> Dict[str, Any]:
        """Check connection to Ollama and check if the configured Gemma model is pulled."""
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models_list = [m.get("name", "") for m in data.get("models", [])]
                    # Check exact match or prefix match (e.g., 'gemma3:4b' vs 'gemma3:4b-latest' or 'gemma3:latest')
                    is_present = any(
                        self.model_name == m or m.startswith(f"{self.model_name}:") or self.model_name in m
                        for m in models_list
                    )
                    return {
                        "connected": True,
                        "configured_model": self.model_name,
                        "model_available": is_present,
                        "available_models": models_list,
                        "base_url": self.base_url,
                        "error": None,
                    }
                else:
                    return {
                        "connected": False,
                        "configured_model": self.model_name,
                        "model_available": False,
                        "available_models": [],
                        "base_url": self.base_url,
                        "error": f"Ollama returned HTTP status {res.status_code}",
                    }
        except httpx.ConnectError:
            return {
                "connected": False,
                "configured_model": self.model_name,
                "model_available": False,
                "available_models": [],
                "base_url": self.base_url,
                "error": f"Cannot connect to Ollama at {self.base_url}. Ensure Ollama is running (`ollama serve`).",
            }
        except Exception as e:
            return {
                "connected": False,
                "configured_model": self.model_name,
                "model_available": False,
                "available_models": [],
                "base_url": self.base_url,
                "error": str(e),
            }

    def prepare_and_validate_image(self, image_bytes: bytes) -> Tuple[str, str]:
        """Validates image data, optimizes resolution if oversized, and encodes to base64."""
        try:
            img = Image.open(BytesIO(image_bytes))
            img.verify()
        except Exception as e:
            raise GemmaServiceError(
                message="The uploaded file is not a valid or readable image.",
                error_code="INVALID_IMAGE_FILE",
                troubleshooting=[
                    "Ensure the file is a JPG, PNG, or WEBP image.",
                    "Verify the image is not corrupted or truncated.",
                ],
            )

        # Re-open after verify() to process
        img = Image.open(BytesIO(image_bytes))
        format_name = img.format or "JPEG"

        # Convert palette/RGBA to RGB if saving to JPEG
        if img.mode in ("RGBA", "P") and format_name.upper() not in ("PNG", "WEBP"):
            img = img.convert("RGB")

        # Resize large outdoor photos down to max 1600px width/height while preserving aspect ratio for faster inference
        max_dim = 768
        if max(img.size) > max_dim:
            img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

        buffered = BytesIO()
        save_format = "JPEG" if format_name.upper() in ("JPG", "JPEG") else format_name
        if save_format.upper() not in ("JPEG", "PNG", "WEBP"):
            save_format = "JPEG"
            if img.mode != "RGB":
                img = img.convert("RGB")

        img.save(buffered, format=save_format, quality=90)
        encoded = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return encoded, save_format.lower()

    async def analyze_plant_image(self, image_bytes: bytes, filename: str = "leaf.jpg") -> PlantAnalysis:
        """Sends the plant image to Gemma open-weight model through Ollama and returns structured analysis."""
        # 1. Image preparation
        base64_image, img_format = self.prepare_and_validate_image(image_bytes)

        # 2. Check Ollama connectivity
        status = await self.get_ollama_status()
        if not status["connected"]:
            raise GemmaServiceError(
                message=f"Gemma is unreachable because Ollama is not running at {self.base_url}.",
                error_code="OLLAMA_OFFLINE",
                troubleshooting=[
                    "Start Ollama service in your terminal: `ollama serve`",
                    f"Confirm Ollama is reachable at {self.base_url}",
                    "If using Docker, ensure port 11434 is mapped and host.docker.internal is configured.",
                ],
            )

        if not status["model_available"]:
            raise GemmaServiceError(
                message=f"Configured model '{self.model_name}' was not found in your Ollama installation.",
                error_code="MODEL_NOT_FOUND",
                troubleshooting=[
                    f"Download the Gemma model by running: `ollama pull {self.model_name}`",
                    f"Alternatively, choose an installed model: {', '.join(status['available_models']) or 'No models downloaded yet'}",
                    "Set the GEMMA_MODEL environment variable in .env to change models.",
                ],
            )

        # 3. Formulate Ollama request
        user_prompt = (
                "Analyze this plant image. Identify the likely plant, "
                "visible symptoms, possible disease, and practical care advice. "
                "Do not guess when evidence is unclear. Return valid JSON "
                "matching the required schema."
           )

        payload = {
            "model": self.model_name,
            "system": settings.gemma_system_prompt,
            "prompt": user_prompt,
            "images": [base64_image],
            "stream": False,
            "format": "json",
            "options": {
                   "temperature": 0.2,
                   "top_p": 0.9,
                   "num_predict": 300,
                    },
                  "keep_alive": "5m",
                }

        raw_response_text = ""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(f"{self.base_url}/api/generate", json=payload)
                if res.status_code != 200:
                    raise GemmaServiceError(
                        message=f"Ollama returned HTTP error {res.status_code}: {res.text}",
                        error_code="OLLAMA_API_ERROR",
                        troubleshooting=[
                            f"Check Ollama server logs: `ollama logs` or the terminal running `ollama serve`",
                            "Verify your system has sufficient VRAM/RAM for the Gemma model.",
                        ],
                    )
                data = res.json()
                raw_response_text = data.get("response", "")
        except httpx.TimeoutException:
            raise GemmaServiceError(
                message=f"Inference timed out after {self.timeout} seconds.",
                error_code="INFERENCE_TIMEOUT",
                troubleshooting=[
                    f"Gemma model '{self.model_name}' took longer than {self.timeout}s to process the image.",
                    "If running on CPU, consider a lighter quant or model, or increase ANALYSIS_TIMEOUT_SECONDS in .env.",
                ],
            )
        except httpx.RequestError as exc:
            raise GemmaServiceError(
                message=f"Network error while communicating with Ollama: {str(exc)}",
                error_code="NETWORK_ERROR",
                troubleshooting=[
                    "Verify Ollama is still running.",
                    "Check network and firewall settings.",
                ],
            )

        # 4. Extract and validate JSON from response
        analysis = self._parse_and_validate_json(raw_response_text)
        return analysis

    def _parse_and_validate_json(self, raw_text: str) -> PlantAnalysis:
        """Robustly extracts JSON from LLM response text and validates against PlantAnalysis schema."""
        if not raw_text or not raw_text.strip():
            raise GemmaServiceError(
                message="Gemma model returned an empty response.",
                error_code="EMPTY_AI_RESPONSE",
                troubleshooting=["Try uploading another clear photo of the plant leaves."],
            )

        # Remove markdown fences if present
        text = raw_text.strip()
        fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if fence_match:
            text = fence_match.group(1).strip()

        # Find first '{' and last '}'
        start_idx = text.find("{")
        end_idx = text.rfind("}")
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            text = text[start_idx : end_idx + 1]

        try:
            parsed = json.loads(text)
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse JSON from Gemma response: %s\nRaw: %s", exc, raw_text)
            raise GemmaServiceError(
                message="Gemma produced a response that could not be parsed as structured JSON.",
                error_code="INVALID_JSON_RESPONSE",
                troubleshooting=[
                    "Retrying the analysis usually resolves minor formatting hiccups.",
                    "Ensure the photo shows a clear plant or leaf subject.",
                ],
            )

        # Normalize fields
        cleaned = self._normalize_analysis_data(parsed)
        try:
            return PlantAnalysis(**cleaned)
        except Exception as exc:
            logger.error("Validation error converting to PlantAnalysis: %s\nData: %s", exc, cleaned)
            raise GemmaServiceError(
                message=f"Gemma response was missing required fields: {str(exc)}",
                error_code="SCHEMA_VALIDATION_ERROR",
                troubleshooting=["Try again with a well-lit, centered photo of the plant."],
            )

    def _normalize_analysis_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Cleans and standardizes raw dictionary data to ensure strict schema adherence."""
        plant_name = str(data.get("plant_name") or "Unknown plant").strip()
        scientific_name = str(data.get("scientific_name") or "Unknown").strip()

        # Confidence: handle float 0..1 or integer percentage 0..100
        raw_conf = data.get("confidence", 0.85)
        try:
            confidence = float(raw_conf)
            if confidence > 1.0:
                confidence = round(confidence / 100.0, 2)
            confidence = max(0.0, min(1.0, confidence))
        except (ValueError, TypeError):
            confidence = 0.80

        # Health status normalization
        raw_health = str(data.get("health_status") or "Healthy").strip()
        health_lower = raw_health.lower()
        if "healthy" in health_lower and "unhealthy" not in health_lower:
            health_status = "Healthy"
        elif "attention" in health_lower or "moderate" in health_lower:
            health_status = "Needs Attention"
        elif "unhealthy" in health_lower or "sick" in health_lower or "diseased" in health_lower:
            health_status = "Unhealthy"
        else:
            health_status = "Uncertain"

        possible_disease = str(
            data.get("possible_disease") or "No obvious disease detected from this image."
        ).strip()

        # Severity
        raw_sev = str(data.get("severity") or "None").strip().title()
        if raw_sev not in ("None", "Low", "Moderate", "High", "Uncertain"):
            raw_sev = "Uncertain" if health_status == "Uncertain" else ("Low" if health_status == "Needs Attention" else "None")

        def ensure_str_list(val: Any) -> List[str]:
            if isinstance(val, list):
                return [str(item).strip() for item in val if str(item).strip()]
            if isinstance(val, str) and val.strip():
                return [val.strip()]
            return []

        visible_symptoms = ensure_str_list(data.get("visible_symptoms"))
        possible_causes = ensure_str_list(data.get("possible_causes"))
        recommendations = ensure_str_list(data.get("recommendations"))
        environmental_obs = ensure_str_list(data.get("environmental_observations"))

        needs_expert = bool(data.get("needs_expert_attention", False))
        summary = str(data.get("summary") or "").strip()
        if not summary:
            summary = f"{plant_name} ({scientific_name}) observed with health status: {health_status}."

        return {
            "plant_name": plant_name,
            "scientific_name": scientific_name,
            "confidence": confidence,
            "health_status": health_status,
            "possible_disease": possible_disease,
            "severity": raw_sev,
            "visible_symptoms": visible_symptoms,
            "possible_causes": possible_causes,
            "recommendations": recommendations,
            "environmental_observations": environmental_obs,
            "needs_expert_attention": needs_expert,
            "summary": summary,
        }

    def get_demo_analysis(self, filename: str = "") -> PlantAnalysis:
        """Returns an educational, clearly simulated plant observation for offline Demo Mode."""
        lower_name = (filename or "").lower()
        if "mint" in lower_name:
            return PlantAnalysis(
                plant_name="Spearmint / Wild Mint (Demo Sample)",
                scientific_name="Mentha spicata",
                confidence=0.96,
                health_status="Healthy",
                possible_disease="No obvious disease detected from this image.",
                severity="None",
                visible_symptoms=[],
                possible_causes=[],
                recommendations=[
                    "Maintain consistently moist, well-draining soil",
                    "Harvest stem tips regularly to encourage dense bushy foliage",
                    "Enjoy fresh aromatic mint foliage outdoors",
                ],
                environmental_observations=[
                    "Outdoor garden bed, partial shade with rich loamy soil",
                    "Vigorous green leaf formation with no pest damage",
                ],
                needs_expert_attention=False,
                summary="[DEMO SIMULATION] Vigorous, healthy Spearmint foliage with vibrant leaves and no signs of distress.",
            )
        elif "tomato" in lower_name:
            return PlantAnalysis(
                plant_name="Patio Tomato (Demo Sample)",
                scientific_name="Solanum lycopersicum",
                confidence=0.91,
                health_status="Needs Attention",
                possible_disease="Early Blight (Alternaria solani)",
                severity="Moderate",
                visible_symptoms=[
                    "Concentric ring target patterns on older lower leaves",
                    "Leaf margin yellowing and localized brown crisping",
                ],
                possible_causes=[
                    "Fungal pathogen Alternaria solani spread via soil splash",
                    "High humidity microclimate near the pot base",
                ],
                recommendations=[
                    "Remove and discard lower infected foliage touching the soil",
                    "Apply organic straw mulch to prevent soil splashing onto leaves",
                    "Water strictly at the soil base in early morning",
                ],
                environmental_observations=[
                    "Container patio planting, warm ambient daytime conditions",
                ],
                needs_expert_attention=False,
                summary="[DEMO SIMULATION] Tomato foliage displaying concentric target lesions consistent with early blight.",
            )
        else:
            return PlantAnalysis(
                plant_name="Garden Rose (Demo Sample)",
                scientific_name="Rosa chinensis",
                confidence=0.93,
                health_status="Needs Attention",
                possible_disease="Black Spot (Diplocarpon rosae)",
                severity="Moderate",
                visible_symptoms=[
                    "Circular dark brown/black lesions on upper leaf surfaces",
                    "Chlorotic yellow halos surrounding spots",
                    "Minor premature lower leaf drop",
                ],
                possible_causes=[
                    "Fungal pathogen Diplocarpon rosae",
                    "Foliage wetness from overhead watering or morning dew",
                    "Limited airflow around dense inner stems",
                ],
                recommendations=[
                    "Prune and dispose of affected spotted leaves (do not compost)",
                    "Water strictly at ground level without wetting leaves",
                    "Ensure good spacing and morning sun exposure for rapid leaf drying",
                ],
                environmental_observations=[
                    "Outdoor ornamental bed, open air with morning sunlight exposure",
                ],
                needs_expert_attention=False,
                summary="[DEMO SIMULATION] Rose foliage displaying circular black spot lesions with yellow halos. Fungal issue manageable with sanitation and ground watering.",
            )


gemma_service = GemmaService()
