"""
Krushak Bani - Agricultural Advisor Router (advisor.py)
Implements:
- Feature 2: Crop Stress Check
- Feature 3: Pesticide Advice with OUAT dosage & Open-Meteo weather
- Feature 4: Water Advice with irrigation frequency & rain check
- Feature 5: Fertiliser Advice with stage doses & Soil Health Card adjustments
"""

import json
import os
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import requests

router = APIRouter(prefix="/advisor", tags=["Advisor"])

# Load rules.json
RULES_PATH = os.path.join(os.path.dirname(__file__), "rules.json")
if not os.path.exists(RULES_PATH):
    RULES_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "src", "data", "rules.json")

try:
    with open(RULES_PATH, "r", encoding="utf-8") as f:
        RULES_DATA = json.load(f)
except Exception as e:
    RULES_DATA = {"crops": {}, "weather_thresholds": {}}

# Helper to fetch Open-Meteo weather for coordinates
def get_live_weather(lat: float = 20.4625, lon: float = 85.8830) -> Dict[str, Any]:
    """
    Fetch current and 24h precipitation probability + wind speed from Open-Meteo.
    Default coords: Cuttack/Bhubaneswar (20.4625, 85.8830).
    """
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&hourly=precipitation_probability,wind_speed_10m&forecast_days=2&timezone=Asia%2FKolkata"
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            curr = data.get("current", {})
            hourly = data.get("hourly", {})
            rain_probs = hourly.get("precipitation_probability", [0])[:12]
            max_rain_next_12h = max(rain_probs) if rain_probs else 0
            return {
                "temp_c": curr.get("temperature_2m", 28),
                "humidity_pct": curr.get("relative_humidity_2m", 70),
                "wind_speed_kmh": curr.get("wind_speed_10m", 8),
                "max_rain_probability_12h": max_rain_next_12h,
                "current_precip_mm": curr.get("precipitation", 0)
            }
    except Exception:
        pass
    # Fallback default safe weather
    return {
        "temp_c": 28.0,
        "humidity_pct": 72,
        "wind_speed_kmh": 9.5,
        "max_rain_probability_12h": 15,
        "current_precip_mm": 0.0
    }

# -------------------------------------------------------------
# 1. Pesticide Advice Request & Endpoint (Feature 3)
# -------------------------------------------------------------
class PesticideAdviceRequest(BaseModel):
    crop_id: str
    disease_or_pest_id: str
    disease_confirmed: bool = True
    lat: Optional[float] = 20.4625
    lon: Optional[float] = 85.8830
    acres: Optional[float] = 1.0

@router.post("/pesticide")
def get_pesticide_advice(req: PesticideAdviceRequest):
    if not req.disease_confirmed:
        return {
            "status": "NOT_RECOMMENDED",
            "decision": "DO_NOT_SPRAY",
            "decision_en": "Do Not Spray (Unconfirmed diagnosis)",
            "decision_or": "ସ୍ପ୍ରେ କରନ୍ତୁ ନାହିଁ (ରୋଗ ଚିହ୍ନଟ ହୋଇନାହିଁ)",
            "reason_en": "Disease or pest is not confirmed. Avoid indiscriminate chemical spraying to protect beneficial predatory insects.",
            "reason_or": "ରୋଗ ନିଶ୍ଚିତ ହୋଇନଥିବାରୁ କୀଟନାଶକ ପ୍ରୟୋଗ କରନ୍ତୁ ନାହିଁ।"
        }

    crop_data = RULES_DATA.get("crops", {}).get(req.crop_id)
    if not crop_data:
        raise HTTPException(status_code=404, detail="Crop not found in rules.json")

    disease_info = next(
        (d for d in crop_data.get("diseases_pests", []) if d["id"] == req.disease_or_pest_id),
        None
    )
    if not disease_info:
        raise HTTPException(status_code=404, detail="Disease or pest not found for this crop")

    # Fetch live weather
    weather = get_live_weather(req.lat, req.lon)
    rain_prob = weather["max_rain_probability_12h"]
    wind_kmh = weather["wind_speed_kmh"]

    # Rules check
    if rain_prob > 35:
        return {
            "status": "WAIT",
            "decision": "WAIT_RAIN_EXPECTED",
            "decision_en": f"WAIT - High Rain Probability ({rain_prob}%)",
            "decision_or": f"ସ୍ପ୍ରେ କରନ୍ତୁ ନାହିଁ - ବର୍ଷା ସମ୍ଭାବନା ({rain_prob}%)",
            "reason_en": "Spraying now will result in chemical wash-off by rain, wasting investment and polluting groundwater.",
            "reason_or": "ବର୍ଷା ହେଲେ କୀଟନାଶକ ଧୋଇ ହୋଇ ନଷ୍ଟ ହେବ। ବର୍ଷା ଥମିବା ପର୍ଯ୍ୟନ୍ତ ଅପେକ୍ଷା କରନ୍ତୁ।",
            "weather": weather,
            "disease": disease_info
        }

    if wind_kmh > 15:
        return {
            "status": "WAIT",
            "decision": "WAIT_HIGH_WIND",
            "decision_en": f"WAIT - High Wind ({wind_kmh} km/h)",
            "decision_or": f"ସ୍ପ୍ରେ କରନ୍ତୁ ନାହିଁ - ପ୍ରବଳ ପବନ ({wind_kmh} କିମି/ଘଣ୍ଟା)",
            "reason_en": "High wind causes spray drift, endangering the applicator and failing to coat target leaves.",
            "reason_or": "ଅତ୍ୟଧିକ ପବନ ଯୋଗୁଁ କୀଟନାଶକ ଉଡ଼ିଯାଇ ମୁହଁରେ ପଡ଼ିପାରେ। ସକାଳେ କିମ୍ବା ପବନ କମିଲେ ସ୍ପ୍ରେ କରନ୍ତୁ।",
            "weather": weather,
            "disease": disease_info
        }

    # Spray approved
    water_volume_litres = int(req.acres * 200)
    return {
        "status": "SPRAY_APPROVED",
        "decision": "SPRAY_NOW",
        "decision_en": "SPRAY APPROVED - Weather is Favourable",
        "decision_or": "ସ୍ପ୍ରେ ପାଇଁ ଅନୁମୋଦିତ - ପାଣିପାଗ ଅନୁକୂଳ ଅଛି",
        "crop_name_en": crop_data.get("name_en"),
        "crop_name_or": crop_data.get("name_or"),
        "disease_name_en": disease_info.get("name_en"),
        "disease_name_or": disease_info.get("name_or"),
        "recommended_chemical": disease_info.get("chemical"),
        "recommended_chemical_or": disease_info.get("chemical_or"),
        "dose_per_litre": disease_info.get("dose_per_litre"),
        "dose_per_acre": disease_info.get("dose_per_acre"),
        "water_volume_needed": f"{water_volume_litres} Litres for {req.acres} Acre(s)",
        "phi_days": disease_info.get("phi_days"),
        "safety_class": disease_info.get("safety_class"),
        "alternative_option": disease_info.get("alternative"),
        "weather": weather,
        "safety_reminder_or": "ସ୍ପ୍ରେ କରିବା ସମୟରେ ମୁହଁରେ ମାସ୍କ ଏବଂ ହାତରେ ମୋଜା ପିନ୍ଧନ୍ତୁ। ଖାଲି ପେଟରେ କିମ୍ବା ପବନ ମୁହଁରେ ସ୍ପ୍ରେ କରନ୍ତୁ ନାହିଁ।"
    }

# -------------------------------------------------------------
# 2. Water Advice Request & Endpoint (Feature 4)
# -------------------------------------------------------------
class WaterAdviceRequest(BaseModel):
    crop_id: str
    growth_stage: str
    days_since_last_irrigation: int
    lat: Optional[float] = 20.4625
    lon: Optional[float] = 85.8830

@router.post("/water")
def get_water_advice(req: WaterAdviceRequest):
    crop_data = RULES_DATA.get("crops", {}).get(req.crop_id)
    if not crop_data:
        raise HTTPException(status_code=404, detail="Crop not found in rules.json")

    intervals = crop_data.get("irrigate_every_days", {})
    recommended_interval = intervals.get(req.growth_stage, 5)

    weather = get_live_weather(req.lat, req.lon)
    rain_prob = weather["max_rain_probability_12h"]

    if rain_prob >= 45:
        return {
            "status": "SKIP",
            "decision": "SKIP_RAIN_PREDICTED",
            "decision_en": f"Skip Irrigation - Rain Expected ({rain_prob}%)",
            "decision_or": f"ଜଳସେଚନ କରନ୍ତୁ ନାହିଁ - ବର୍ଷା ସମ୍ଭାବନା ({rain_prob}%)",
            "reason_en": "Significant rainfall forecast within the next 12-24 hours. Natural rainwater will fulfill crop moisture needs and prevent waterlogging.",
            "reason_or": "ଆଗାମୀ ୧୨ ଘଣ୍ଟା ମଧ୍ୟରେ ବର୍ଷା ହେବାର ସମ୍ଭାବନା ଅଛି। ପାଣି ମଡ଼ାଇଲେ ଜମିରେ ଅତିରିକ୍ତ ପାଣି ଜମି ଚେର ନଷ୍ଟ ହୋଇପାରେ।",
            "recommended_interval_days": recommended_interval,
            "days_since_last": req.days_since_last_irrigation,
            "weather": weather
        }

    if req.days_since_last_irrigation >= recommended_interval:
        return {
            "status": "IRRIGATE_NOW",
            "decision": "IRRIGATE_IMMEDIATELY",
            "decision_en": "Irrigate Immediately",
            "decision_or": "ତୁରନ୍ତ ଜଳସେଚନ କରନ୍ତୁ",
            "reason_en": f"It has been {req.days_since_last_irrigation} days since last irrigation (standard cycle for this stage is every {recommended_interval} days).",
            "reason_or": f"ଗତ ଜଳସେଚନକୁ {req.days_since_last_irrigation} ଦିନ ବିତିଗଲାଣି। ଏହି ଅବସ୍ଥାରେ ପ୍ରତି {recommended_interval} ଦିନରେ ହାଲୁକା ପାଣି ଆବଶ୍ୟକ।",
            "recommended_interval_days": recommended_interval,
            "days_since_last": req.days_since_last_irrigation,
            "weather": weather
        }
    else:
        days_remaining = recommended_interval - req.days_since_last_irrigation
        return {
            "status": "NOT_YET",
            "decision": "NOT_YET_NEEDED",
            "decision_en": f"Not Yet Needed (Wait {days_remaining} more day(s))",
            "decision_or": f"ବର୍ତ୍ତମାନ ଆବଶ୍ୟକ ନାହିଁ (ଆଉ {days_remaining} ଦିନ ପରେ ପାଣି ଦିଅନ୍ତୁ)",
            "reason_en": f"Soil retains sufficient moisture for current stage. Next irrigation due in ~{days_remaining} day(s).",
            "reason_or": f"ଜମିରେ ବର୍ତ୍ତମାନ ଯଥେଷ୍ଟ ବତର ଅଛି। ଆଉ {days_remaining} ଦିନ ପରେ ଜଳସେଚନ ଯୋଜନା କରନ୍ତୁ।",
            "recommended_interval_days": recommended_interval,
            "days_since_last": req.days_since_last_irrigation,
            "weather": weather
        }

# -------------------------------------------------------------
# 3. Fertiliser Advice Request & Endpoint (Feature 5)
# -------------------------------------------------------------
class FertiliserAdviceRequest(BaseModel):
    crop_id: str
    growth_stage: str
    acres: float = 1.0
    soil_n_status: Optional[str] = "Medium"  # Low, Medium, High
    soil_p_status: Optional[str] = "Medium"
    soil_k_status: Optional[str] = "Medium"
    lat: Optional[float] = 20.4625
    lon: Optional[float] = 85.8830

@router.post("/fertiliser")
def get_fertiliser_advice(req: FertiliserAdviceRequest):
    crop_data = RULES_DATA.get("crops", {}).get(req.crop_id)
    if not crop_data:
        raise HTTPException(status_code=404, detail="Crop not found in rules.json")

    stage_doses = crop_data.get("fertiliser_doses", {}).get(req.growth_stage)
    if not stage_doses:
        # Pick first stage if specific stage missing
        stage_doses = list(crop_data.get("fertiliser_doses", {}).values())[0]

    # Soil Health Card adjustment multipliers
    n_multiplier = 1.25 if req.soil_n_status == "Low" else (0.75 if req.soil_n_status == "High" else 1.0)
    p_multiplier = 1.25 if req.soil_p_status == "Low" else (0.75 if req.soil_p_status == "High" else 1.0)
    k_multiplier = 1.25 if req.soil_k_status == "Low" else (0.75 if req.soil_k_status == "High" else 1.0)

    urea_calculated = round(stage_doses.get("urea_kg_per_acre", 0) * req.acres * n_multiplier, 1)
    dap_calculated = round(stage_doses.get("dap_kg_per_acre", 0) * req.acres * p_multiplier, 1)
    mop_calculated = round(stage_doses.get("mop_kg_per_acre", 0) * req.acres * k_multiplier, 1)
    zinc_calculated = round(stage_doses.get("zinc_kg_per_acre", 0) * req.acres, 1)

    weather = get_live_weather(req.lat, req.lon)
    rain_prob = weather["max_rain_probability_12h"]

    warning_en = None
    warning_or = None
    if rain_prob > 40:
        warning_en = f"DELAY APPLICATION: High rain probability ({rain_prob}%). Applying Urea now will cause nitrogen leaching and fertilizer loss."
        warning_or = f"ସାର ପ୍ରୟୋଗ ସ୍ଥଗିତ ରଖନ୍ତୁ: ପ୍ରବଳ ବର୍ଷା ସମ୍ଭାବନା ({rain_prob}%) ଅଛି। ୟୁରିଆ ଧୋଇ ହୋଇ ନଷ୍ଟ ହୋଇଯିବ।"

    return {
        "crop_name_en": crop_data.get("name_en"),
        "crop_name_or": crop_data.get("name_or"),
        "stage_en": stage_doses.get("stage_en"),
        "stage_or": stage_doses.get("stage_or"),
        "acres": req.acres,
        "soil_health_adjustments": {
            "nitrogen_status": req.soil_n_status,
            "phosphorus_status": req.soil_p_status,
            "potassium_status": req.soil_k_status
        },
        "recommended_dose": {
            "urea_kg": urea_calculated,
            "dap_kg": dap_calculated,
            "mop_potash_kg": mop_calculated,
            "zinc_sulphate_kg": zinc_calculated
        },
        "application_notes_en": stage_doses.get("notes_en"),
        "application_notes_or": stage_doses.get("notes_or"),
        "weather_delay_warning_en": warning_en,
        "weather_delay_warning_or": warning_or,
        "rain_probability": rain_prob
    }

# -------------------------------------------------------------
# 4. Crop Stress Check Request & Endpoint (Feature 2)
# -------------------------------------------------------------
class CropStressCheckRequest(BaseModel):
    crop_id: str
    leaf_colour: str          # 'pale_yellow', 'dark_green', 'purple_red', 'brown_burnt_tips', 'normal_green'
    wilting_status: str       # 'severe_drooping', 'mild_daytime_wilting', 'crisp_brittle', 'none'
    days_since_irrigation: int
    soil_moisture_feel: str   # 'bone_dry', 'slightly_moist', 'waterlogged_slushy'

@router.post("/crop-stress")
def check_crop_stress(req: CropStressCheckRequest):
    diagnoses = []
    recommended_actions = []
    link_to = {}

    # Rule 1: Drought / Water stress
    if req.wilting_status in ["severe_drooping", "mild_daytime_wilting"] and req.days_since_irrigation > 5 and req.soil_moisture_feel == "bone_dry":
        diagnoses.append({
            "cause_en": "Severe Moisture Stress / Drought",
            "cause_or": "ଗମ୍ଭୀର ଜଳାଭାବ / ମରୁଡ଼ି ଚାପ",
            "severity": "CRITICAL",
            "advice_en": "Immediate light irrigation is critical. Do not apply chemical fertilizers while plants are wilting.",
            "advice_or": "ତୁରନ୍ତ ହାଲୁକା ଜଳସେଚନ କରନ୍ତୁ। ଗଛ ଶୁଖିଲା ଥିବାବେଳେ ରାସାୟନିକ ସାର ଦିଅନ୍ତୁ ନାହିଁ।"
        })
        link_to["water_advice"] = True

    # Rule 2: Waterlogging / Root Suffocation
    if req.soil_moisture_feel == "waterlogged_slushy" and req.leaf_colour in ["pale_yellow", "brown_burnt_tips"]:
        diagnoses.append({
            "cause_en": "Waterlogging & Root Rot Risk",
            "cause_or": "ଜଳବନ୍ଦୀ ଓ ଚେର ପଚା ସମସ୍ୟା",
            "severity": "HIGH",
            "advice_en": "Drain standing excess water immediately by opening drainage trenches. Spray 19:19:19 foliar spray @ 5g/L once drained.",
            "advice_or": "ବିଲରୁ ଜମି ରହିଥିବା ଅତିରିକ୍ତ ପାଣି କାଢ଼ି ଦିଅନ୍ତୁ। ପାଣି ଶୁଖିବା ପରେ ୧୯:୧୯:୧୯ ସ୍ପ୍ରେ କରନ୍ତୁ।"
        })

    # Rule 3: Nitrogen Deficiency
    if req.leaf_colour == "pale_yellow" and req.wilting_status == "none":
        diagnoses.append({
            "cause_en": "Nitrogen (N) Deficiency",
            "cause_or": "ଯବକ୍ଷାରଜାନ (ୟୁରିଆ) ଅଭାବ",
            "severity": "MEDIUM",
            "advice_en": "Apply top dressing of Urea or 2% Urea foliar spray (20g Urea per litre water) for quick greening.",
            "advice_or": "ୟୁରିଆ ଉପର ପ୍ରୟୋଗ କରନ୍ତୁ କିମ୍ବା ୨% ୟୁରିଆ ପତ୍ର ସ୍ପ୍ରେ (ଲିଟର ପିଛା ୨୦ ଗ୍ରାମ) କରନ୍ତୁ।"
        })
        link_to["fertiliser_advice"] = True

    # Rule 4: Potassium Deficiency (Burnt tips)
    if req.leaf_colour == "brown_burnt_tips":
        diagnoses.append({
            "cause_en": "Potassium (K) Deficiency / Salinity Scorch",
            "cause_or": "ପଟାସ (Potash) ଅଭାବ ବା ଲୁଣିଆ ଦାଗ",
            "severity": "MEDIUM",
            "advice_en": "Apply MOP (Muriate of Potash) or spray Potassium Nitrate (13:0:45) @ 5g/L to strengthen stem against lodging.",
            "advice_or": "ପଟାସ ସାର ଦିଅନ୍ତୁ କିମ୍ବା ୧୩:୦:୪୫ ପୋଟାସିୟମ୍ ନାଇଟ୍ରେଟ୍ ସ୍ପ୍ରେ କରନ୍ତୁ।"
        })
        link_to["fertiliser_advice"] = True

    # Rule 5: Phosphorus Deficiency (Purple leaves)
    if req.leaf_colour == "purple_red":
        diagnoses.append({
            "cause_en": "Phosphorus (P) Deficiency",
            "cause_or": "ଫସଫରସ୍ (ଡି.ଏ.ପି.) ଅଭାବ",
            "severity": "MEDIUM",
            "advice_en": "Root growth is suppressed. Apply Single Super Phosphate (SSP) or DAP with light irrigation.",
            "advice_or": "ଚେର ବୃଦ୍ଧି ବାଧାପ୍ରାପ୍ତ ହୋଇଛି। ଡିଏପି କିମ୍ବା ଏସ୍.ଏସ୍.ପି. ପ୍ରୟୋଗ କରନ୍ତୁ।"
        })
        link_to["fertiliser_advice"] = True

    if not diagnoses:
        diagnoses.append({
            "cause_en": "Optimal Plant Vigor / Healthy Foliage",
            "cause_or": "ଫସଲ ସୁସ୍ଥ ଓ ନିରୋଗ ଅଛି",
            "severity": "LOW",
            "advice_en": "Maintain regular scheduled irrigation and monitor for early signs of pest emergence.",
            "advice_or": "ନିୟମିତ ପାଣି ଦିଅନ୍ତୁ ଏବଂ କୀଟପତଙ୍ଗ ଉପରେ ନଜର ରଖନ୍ତୁ।"
        })

    return {
        "crop_id": req.crop_id,
        "diagnoses": diagnoses,
        "quick_links": link_to
    }
