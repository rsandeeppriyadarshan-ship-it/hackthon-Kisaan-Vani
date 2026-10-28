"""
Krushak Bani - Crop Rotation Router (rotation.py)
Implements:
- Feature 14: Crop Rotation Advice (rotation.json mapping last crop & season to suggestions)
"""

import json
import os
from typing import Optional
from fastapi import APIRouter, Query

router = APIRouter(prefix="/rotation", tags=["Crop Rotation"])

ROTATION_PATH = os.path.join(os.path.dirname(__file__), "rotation.json")
if not os.path.exists(ROTATION_PATH):
    ROTATION_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "src", "data", "rotation.json")

try:
    with open(ROTATION_PATH, "r", encoding="utf-8") as f:
        ROTATION_DATA = json.load(f)
except Exception:
    ROTATION_DATA = {"rotations": []}

@router.get("/suggest")
def suggest_rotation(
    previous_crop_id: Optional[str] = Query("paddy", description="Previous harvested crop (e.g., paddy, maize, brinjal)"),
    season: Optional[str] = Query(None, description="Upcoming season (Rabi, Summer, Kharif)")
):
    rotations = ROTATION_DATA.get("rotations", [])
    matches = [r for r in rotations if r.get("previous_crop_id") == previous_crop_id]
    
    if season and season.lower() != "all":
        filtered = [r for r in matches if season.lower() in r.get("season", "").lower()]
        if filtered:
            matches = filtered

    if not matches and rotations:
        # Fallback to general rotation
        matches = [rotations[0]]

    return {
        "previous_crop_id": previous_crop_id,
        "season_target": season or "Upcoming Season",
        "suggestions": matches
    }
