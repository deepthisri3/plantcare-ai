import random
from typing import List
from fastapi import APIRouter
from app.schemas.analysis import OutdoorChallenge

router = APIRouter(prefix="/api", tags=["Outdoor Challenge"])

CHALLENGES: List[OutdoorChallenge] = [
    OutdoorChallenge(
        id="challenge-unnoticed",
        title="The Hidden Neighbor",
        mission="Find a plant you pass by every day but have never actually stopped to notice.",
        outdoor_tip="Look closely at the leaf edges, bark texture, or how it faces the sunlight.",
        difficulty="Easy",
        category="Mindfulness",
    ),
    OutdoorChallenge(
        id="challenge-leaf-shapes",
        title="Geometry in Nature",
        mission="Find and compare three distinctly different leaf shapes (e.g. palmate, serrated, linear).",
        outdoor_tip="Notice how each leaf design balances light capture and wind resistance.",
        difficulty="Moderate",
        category="Botany",
    ),
    OutdoorChallenge(
        id="challenge-flowering",
        title="Blossom Hunter",
        mission="Find something in bloom right now—even a tiny roadside wildflower or tree flower.",
        outdoor_tip="Check for subtle scents and note which pollinators visit it.",
        difficulty="Easy",
        category="Seasonal",
    ),
    OutdoorChallenge(
        id="challenge-insects",
        title="Insect Footprints",
        mission="Look for gentle signs of ecosystem interaction: leaf bites, insect tracks, or pollinator visits.",
        outdoor_tip="A few nibbled leaves often means a healthy, living outdoor habitat.",
        difficulty="Moderate",
        category="Ecology",
    ),
    OutdoorChallenge(
        id="challenge-ten-minutes",
        title="Ten Minutes of Stillness",
        mission="Spend 10 full minutes sitting or standing quietly next to a single tree or bush without looking at your screen.",
        outdoor_tip="Feel the breeze, listen to the leaves rustle, and give your mind space to breathe.",
        difficulty="Reflective",
        category="Mindfulness",
    ),
    OutdoorChallenge(
        id="challenge-sidewalk-crack",
        title="Sidewalk Pioneer",
        mission="Find a resilient wild plant flourishing through a sidewalk crack, rock crevice, or wall.",
        outdoor_tip="Pioneer plants specialize in tough spots and help create fertile soil over decades.",
        difficulty="Easy",
        category="Resilience",
    ),
    OutdoorChallenge(
        id="challenge-leaf-veins",
        title="Vein Architecture",
        mission="Turn over a fallen or attached leaf and examine its vein architecture up close.",
        outdoor_tip="Net veins distribute water with microscopic hydraulic precision.",
        difficulty="Easy",
        category="Botany",
    ),
    OutdoorChallenge(
        id="challenge-barefoot-grass",
        title="Literal Touch Grass",
        mission="Take off your shoes if safe, feel real grass or soil beneath your feet, and take five slow, deep breaths.",
        outdoor_tip="Grounding physically connects you to the earth and lowers sensory stress.",
        difficulty="Easy",
        category="Grounding",
    ),
]


@router.get(
    "/challenge",
    response_model=OutdoorChallenge,
    summary="Get a random outdoor Touch Grass challenge",
)
@router.post(
    "/challenge",
    response_model=OutdoorChallenge,
    summary="Draw a new outdoor Touch Grass challenge",
)
async def get_challenge():
    """Returns a randomly selected outdoor observation mission to encourage

    physical interaction with nature.
    """
    return random.choice(CHALLENGES)
