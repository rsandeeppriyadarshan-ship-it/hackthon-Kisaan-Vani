"""
Krushak Bani - Main FastAPI Backend Application (main.py)
Technology: Python + FastAPI + PyTorch + Open-Meteo + JSON + SQLite

Includes all routers:
- advisor.py (Crop Stress, Pesticide Advice, Water Advice, Fertiliser Advice)
- crop_doctor.py (MobileNetV2 PlantVillage vision diagnosis)
- labour.py (Odisha Labour & Machinery directory)
- rotation.py (Crop Rotation recommendations)
- spray_log.py (SQLite spray history & safety alert triggers)
- ivr_webhook.py (Telephony provider missed-call callback & DTMF webhooks)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# Import all routers
from advisor import router as advisor_router
from crop_doctor import router as crop_doctor_router
from labour import router as labour_router
from rotation import router as rotation_router
from spray_log import router as spray_log_router
from ivr_webhook import router as ivr_router
from crop_history import router as crop_history_router

app = FastAPI(
    title="Krushak Bani API (କୃଷକ ବାଣୀ)",
    description="Comprehensive agricultural advisory, Crop Doctor AI, weather, pesticide dosing & emergency safety backend for Odisha farmers.",
    version="1.0.0"
)

# Enable CORS for Progressive Web App frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all feature routers
app.include_router(advisor_router)
app.include_router(crop_doctor_router)
app.include_router(labour_router)
app.include_router(rotation_router)
app.include_router(spray_log_router)
app.include_router(ivr_router)
app.include_router(crop_history_router)

@app.get("/")
def root():
    return {
        "app": "Krushak Bani API (କୃଷକ ବାଣୀ)",
        "status": "ONLINE",
        "description": "Backend services for Odisha farmers with OUAT rules, Open-Meteo, Crop Doctor, and IVR.",
        "documentation": "/docs",
        "endpoints": [
            "/advisor/pesticide",
            "/advisor/water",
            "/advisor/fertiliser",
            "/advisor/crop-stress",
            "/crop-doctor/diagnose",
            "/spray-log/entries",
            "/labour/providers",
            "/rotation/suggest",
            "/ivr/webhook/missed-call",
            "/ivr/webhook/dtmf-response"
        ]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "krushak-bani-backend"}

if __name__ == "__main__":
    import uvicorn
    # Standard development server port
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
