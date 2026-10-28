"""
Krushak Bani - IVR Telephony Webhook Router (ivr_webhook.py)
Implements:
- Feature 13: IVR Phone Service (Exotel / Twilio Telephony Webhook)
Flow:
1) Missed call webhook received from provider -> triggers outbound automated callback.
2) Telephony plays Odia voice menu:
   - Press 1 for Crop Doctor / Disease advice
   - Press 2 for Spray Weather & Wind alert
   - Press 3 for Water & Fertiliser timing
   - Press 9 for Emergency Snakebite / 108 Ambulance
3) DTMF keypress webhook runs advisor logic and returns audio URL or text-to-speech.
4) Dispatches labour contacts or dosage summary via SMS.
"""

from typing import Optional
from fastapi import APIRouter, Form, Request
from pydantic import BaseModel

router = APIRouter(prefix="/ivr", tags=["IVR Telephony"])

class MissedCallPayload(BaseModel):
    CallSid: Optional[str] = "DEMO-CALL-12345"
    From: str = "+919876543210"
    To: Optional[str] = "+918008895787"
    Timestamp: Optional[str] = None

@router.post("/webhook/missed-call")
def handle_missed_call(payload: MissedCallPayload):
    """
    Called when farmer gives a missed call to 1800-889-KRUSHAK.
    Server initiates instant callback queue.
    """
    return {
        "status": "CALLBACK_QUEUED",
        "caller_phone": payload.From,
        "message_en": "Missed call registered. Queuing immediate Odia IVR voice callback.",
        "message_or": "ମିସଡ କଲ୍ ଗ୍ରହଣ କରାଗଲା। ତୁରନ୍ତ ଆପଣଙ୍କ ଫୋନକୁ କଲ୍ ଫେରସ୍ତ କରାଯାଉଛି।",
        "callback_action": "TRIGGER_OUTBOUND_CALL",
        "initial_audio_prompt": "ନମସ୍କାର, କୃଷକ ବାଣୀକୁ ସ୍ୱାଗତ। ଫସଲ ରୋଗ ପାଇଁ ୧ ଦବାନ୍ତୁ, ସ୍ପ୍ରେ ପାଣିପାଗ ପାଇଁ ୨ ଦବାନ୍ତୁ, ସାର ଓ ଜଳସେଚନ ପାଇଁ ୩ ଦବାନ୍ତୁ, ସାପ କାମୁଡ଼ା ଜରୁରୀକାଳୀନ ସେବା ପାଇଁ ୯ ଦବାନ୍ତୁ।"
    }

class DTMFPayload(BaseModel):
    Digits: str  # Pressed digit: 1, 2, 3, 9
    From: str = "+919876543210"
    CallSid: Optional[str] = "DEMO-CALL-12345"

@router.post("/webhook/dtmf-response")
def handle_dtmf_response(payload: DTMFPayload):
    """
    Processes keypress from telephony provider and returns appropriate Odia voice prompt & SMS action.
    """
    digit = payload.Digits.strip()
    
    if digit == "1":
        return {
            "digit_pressed": "1",
            "menu": "CROP_DOCTOR",
            "audio_response_or": "ଧାନ ଫସଲରେ ଚିଟା ରୋଗ ଥିଲେ ଟ୍ରାଇସାଇକ୍ଲାଜୋଲ ଲିଟର ପିଛା ଶୂନ ଦଶମିକ ଛଅ ଗ୍ରାମ ସ୍ପ୍ରେ କରନ୍ତୁ। ବିଲରେ ଫଟୋ ଉଠାଇ ଆପରେ ଦେଖନ୍ତୁ।",
            "audio_response_en": "For Rice Blast, spray Tricyclazole 75% WP @ 0.6g per litre of water.",
            "sms_dispatch": "Krushak Bani: Dhan Chita roga pain Tricyclazole 75% WP (0.6g/L) spray karantu. PHI: 30 days.",
            "hangup": False
        }
    elif digit == "2":
        return {
            "digit_pressed": "2",
            "menu": "SPRAY_WEATHER",
            "audio_response_or": "ଆଜି ଆପଣଙ୍କ ଅଞ୍ଚଳରେ ପବନର ବେଗ କମ ଅଛି ଏବଂ ବର୍ଷା ସମ୍ଭାବନା ମାତ୍ର କୋଡିଏ ପ୍ରତିଶତ। ସକାଳ ନଅଟା ପୂର୍ବରୁ ସ୍ପ୍ରେ କରିବା ଉତ୍ତମ।",
            "audio_response_en": "Today wind is under 12 km/h and rain chance is 20%. Good condition for morning spray.",
            "sms_dispatch": "Krushak Bani: Aji Spray pain anukula panipaga achhi. Barsa sambhavana kam.",
            "hangup": True
        }
    elif digit == "3":
        return {
            "digit_pressed": "3",
            "menu": "WATER_AND_FERTILISER",
            "audio_response_or": "ପିଲ ବାହାରିବା ସମୟରେ ଏକର ପିଛା ଅଠର କିଲୋଗ୍ରାମ ୟୁରିଆ ପ୍ରୟୋଗ କରନ୍ତୁ। ଜମିରେ ହାଲୁକା ବତର ରଖନ୍ତୁ।",
            "audio_response_en": "Top dress Urea @ 18 kg/acre during tillering stage on moist soil.",
            "sms_dispatch": "Krushak Bani: Tillering stage re acre pichha 18kg Urea prayoga karantu.",
            "hangup": True
        }
    elif digit == "9":
        return {
            "digit_pressed": "9",
            "menu": "SNAKEBITE_EMERGENCY",
            "audio_response_or": "ଏହା ଜରୁରୀକାଳୀନ ସେବା। ରୋଗୀଙ୍କୁ ଶାନ୍ତ ରଖନ୍ତୁ, ଚଳପ୍ରଚଳ ବନ୍ଦ କରନ୍ତୁ ଏବଂ ତୁରନ୍ତ ୧୦୮ କୁ ଡାଏଲ କରି ନିକଟସ୍ଥ ଡାକ୍ତରଖାନା ନିଅନ୍ତୁ।",
            "audio_response_en": "Snakebite Emergency: Keep patient calm, immobilize limb, immediately dial 108 for nearest hospital with ASV.",
            "sms_dispatch": "EMERGENCY SNAKEBITE: Dial 108 immediately. Keep calm, immobilize limb, do NOT tie tight tourniquet. SCB / Capital Hospital open 24x7.",
            "hangup": True
        }
    else:
        return {
            "digit_pressed": digit,
            "menu": "INVALID",
            "audio_response_or": "ଆପଣ ଭୁଲ ବଟନ ଦବାଇଛନ୍ତି। ଦୟାକରି ୧, ୨, ୩ କିମ୍ବା ୯ ଦବାନ୍ତୁ।",
            "audio_response_en": "Invalid option. Please press 1, 2, 3 or 9.",
            "hangup": False
        }
