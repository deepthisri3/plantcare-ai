from typing import List, Optional
from pydantic import BaseModel, Field


class PlantAnalysis(BaseModel):
    plant_name: str = Field(
        ...,
        description="Common plant name, e.g. 'Monstera Deliciosa' or 'Dandelion' or 'Unknown'",
    )
    scientific_name: str = Field(
        default="Unknown",
        description="Botanical Latin name, e.g. 'Monstera deliciosa' or 'Taraxacum officinale'",
    )
    confidence: float = Field(
        default=0.85,
        ge=0.0,
        le=1.0,
        description="Confidence score between 0.0 and 1.0",
    )
    health_status: str = Field(
        default="Healthy",
        description="Overall status: 'Healthy', 'Needs Attention', 'Unhealthy', or 'Uncertain'",
    )
    possible_disease: str = Field(
        default="No obvious disease detected from this image.",
        description="Suspected condition, pathogen, or 'No obvious disease detected from this image.'",
    )
    severity: str = Field(
        default="None",
        description="Condition severity: 'None', 'Low', 'Moderate', 'High', or 'Uncertain'",
    )
    visible_symptoms: List[str] = Field(
        default_factory=list,
        description="List of observed symptoms (spots, yellowing, wilting, insect damage, etc.)",
    )
    possible_causes: List[str] = Field(
        default_factory=list,
        description="Possible environmental, pathogen, or watering causes",
    )
    recommendations: List[str] = Field(
        default_factory=list,
        description="Practical, safe steps to improve or care for the plant",
    )
    environmental_observations: List[str] = Field(
        default_factory=list,
        description="Observations regarding sunlight, soil, background foliage, or seasonal state",
    )
    needs_expert_attention: bool = Field(
        default=False,
        description="True if severe symptoms or quarantine risks warrant consulting an agronomist/botanist",
    )
    summary: str = Field(
        default="",
        description="Brief natural language overview of the observation",
    )


class AnalysisResponse(BaseModel):
    success: bool
    analysis: Optional[PlantAnalysis] = None
    model_used: str
    disclaimer: str
    is_demo: bool = False
    error: Optional[str] = None
    error_code: Optional[str] = None
    troubleshooting: Optional[List[str]] = None


class ModelStatusResponse(BaseModel):
    ollama_connected: bool
    configured_model: str
    model_available: bool
    available_models: List[str]
    base_url: str
    message: str


class OutdoorChallenge(BaseModel):
    id: str
    title: str
    mission: str
    outdoor_tip: str
    difficulty: str
    category: str
