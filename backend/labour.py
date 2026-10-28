"""
Krushak Bani - Labour Connect Router (labour.py)
Implements:
- Feature 8: Labour Connect (JSON file & district filtering with direct call support)
"""

import json
import os
from typing import Optional, List
from fastapi import APIRouter, Query

router = APIRouter(prefix="/labour", tags=["Labour Connect"])

LABOUR_PATH = os.path.join(os.path.dirname(__file__), "labour.json")
if not os.path.exists(LABOUR_PATH):
    LABOUR_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "src", "data", "labour.json")

try:
    with open(LABOUR_PATH, "r", encoding="utf-8") as f:
        LABOUR_DATA = json.load(f)
except Exception:
    LABOUR_DATA = {"districts": [], "providers": []}

@router.get("/districts")
def get_districts():
    return LABOUR_DATA.get("districts", [])

@router.get("/providers")
def get_providers(
    district: Optional[str] = Query(None, description="Filter by Odisha district"),
    category: Optional[str] = Query(None, description="Filter by service category (drone_sprayer, machinery, sprayer_labour, farm_labour)")
):
    providers = LABOUR_DATA.get("providers", [])
    if district and district.lower() != "all":
        providers = [p for p in providers if p.get("district", "").lower() == district.lower()]
    if category and category.lower() != "all":
        providers = [p for p in providers if p.get("category", "").lower() == category.lower()]
    
    return {
        "total": len(providers),
        "district_filter": district,
        "category_filter": category,
        "is_sample_demo_data": True,
        "providers": providers
    }
