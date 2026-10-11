from io import BytesIO
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.services.gemma_service import GemmaService, gemma_service

client = TestClient(app)


def create_test_image(format="JPEG", size=(100, 100), color=(34, 139, 34)):
    buf = BytesIO()
    img = Image.new("RGB", size, color=color)
    img.save(buf, format=format)
    buf.seek(0)
    return buf.getvalue()


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "gemma_model" in data
    assert "disclaimer" in data


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "Touch Grass" in data["name"]


def test_get_model_status():
    response = client.get("/api/model")
    assert response.status_code == 200
    data = response.json()
    assert "configured_model" in data
    assert "ollama_connected" in data
    assert "message" in data


def test_get_challenge():
    response = client.get("/api/challenge")
    assert response.status_code == 200
    data = response.json()
    assert "title" in data
    assert "mission" in data
    assert "outdoor_tip" in data


def test_analyze_rejects_invalid_file_type():
    response = client.post(
        "/api/analyze",
        files={"image": ("test.txt", b"plain text is not an image", "text/plain")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["error_code"] == "INVALID_FILE_TYPE"


def test_analyze_rejects_empty_file():
    response = client.post(
        "/api/analyze",
        files={"image": ("empty.jpg", b"", "image/jpeg")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["error_code"] == "EMPTY_IMAGE"


def test_gemma_service_json_parsing_clean():
    service = GemmaService()
    sample_json = """
    {
      "plant_name": "Fiddle Leaf Fig",
      "scientific_name": "Ficus lyrata",
      "confidence": 0.92,
      "health_status": "Healthy",
      "possible_disease": "No obvious disease detected from this image.",
      "severity": "None",
      "visible_symptoms": [],
      "possible_causes": [],
      "recommendations": ["Ensure bright, indirect sunlight", "Allow soil to dry slightly between waterings"],
      "environmental_observations": ["Indoor potting with healthy glossy foliage"],
      "needs_expert_attention": false,
      "summary": "Healthy Ficus lyrata with vibrant green foliage."
    }
    """
    result = service._parse_and_validate_json(sample_json)
    assert result.plant_name == "Fiddle Leaf Fig"
    assert result.scientific_name == "Ficus lyrata"
    assert result.confidence == 0.92
    assert result.health_status == "Healthy"
    assert len(result.recommendations) == 2


def test_gemma_service_json_parsing_with_markdown_fences():
    service = GemmaService()
    sample_fenced = """
    Here is the analysis of the leaf:
    ```json
    {
      "plant_name": "Tomato",
      "scientific_name": "Solanum lycopersicum",
      "confidence": 88,
      "health_status": "Needs Attention",
      "possible_disease": "Early Blight",
      "severity": "Moderate",
      "visible_symptoms": ["Concentric dark brown rings", "Yellowing leaf margins"],
      "possible_causes": ["Fungal pathogen Alternaria solani", "High humidity and splash watering"],
      "recommendations": ["Remove infected bottom leaves", "Water at soil level without wetting foliage"],
      "environmental_observations": ["Outdoor garden bed, damp soil"],
      "needs_expert_attention": false,
      "summary": "Tomato foliage showing symptoms consistent with early blight."
    }
    ```
    """
    result = service._parse_and_validate_json(sample_fenced)
    assert result.plant_name == "Tomato"
    assert result.confidence == 0.88  # Normalized from 88 to 0.88
    assert result.health_status == "Needs Attention"
    assert result.severity == "Moderate"
    assert len(result.visible_symptoms) == 2


def test_gemma_service_image_preparation():
    service = GemmaService()
    raw_img = create_test_image(format="JPEG", size=(50, 50))
    encoded, fmt = service.prepare_and_validate_image(raw_img)
    assert isinstance(encoded, str)
    assert len(encoded) > 0
    assert fmt in ("jpeg", "jpg")
