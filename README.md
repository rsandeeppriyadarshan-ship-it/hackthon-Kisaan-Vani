# କୃଷକ ବାଣୀ ଓଡ଼ିଶା (Krushak Bani Odisha)

**Krushak Bani Odisha** is an offline-first, multilingual agricultural advisory and farm management Progressive Web Application (PWA) built for farmers across all 30 districts and 10 agro-climatic zones of Odisha.

---

## Key Features

### 1. Crop Doctor & Symptom Checker
- **33 Crops & 154 Disease/Pest Reference Cards:** Covers Cereals, Pulses, Oilseeds, Vegetables, Spices, Fruits, Plantation, Cash Crops, and Agroforestry across Odisha.
- **Real Reference Photographs:** Every disease, pest, nematode, weed, and nutrient deficiency card includes a lightweight (`~20–50 KB`) openly licensed (`CC0` / `CC BY 4.0`) reference photograph stored in `public/disease-photos/` with bilingual (`Odia` + `English`) alt text, licence badge, and tap-to-enlarge symptom inspection modal.
- **Graceful Fallback:** Automatically falls back to text-only disease names if a photo is missing or offline, never showing a blank box.
- **Safety & Dose Verification:** Displays OUAT/ICAR dosages from `src/data/rules.json`, pre-harvest intervals (PHI), "Follow the product label" reminders, and a visible `SAMPLE: verify with the label or OUAT/ICAR` warning on any dose awaiting expert verification (`verified_by` / `verified_date`).

### 2. District Soil Health & Crop Growth Tracker
- **Soil Health Advisory:** District-specific soil profile (pH, soil type, organic carbon status, and key micronutrient priorities) with actionable fertility recommendations for the farmer's selected district.
- **Crop Growth Tracker:** Log planting dates for specific crops and track current growth stage, progress percentage, days elapsed/remaining, and estimated harvest windows adjusted for local temperature and rainfall conditions.

### 3. Hyperlocal Weather & Spray Safety Window
- **30-District Forecast:** Powered by Open-Meteo across all 30 Odisha districts (`Angul` to `Sundargarh`).
- **Spray Window Calculator:** Evaluates wind speed, precipitation probability, and temperature to advise whether pesticide/fertiliser spraying is safe or should be delayed to prevent wash-off.

### 4. Fertilizer, Pesticide & Water Management
- **Pesticide Dose Calculator:** Per-litre and per-acre dosage calculations with 15L knapsack tank equivalents, safety gear checklists, and waiting period (PHI) alerts.
- **Fertiliser Calculator (NPK):** Basal and top-dressing schedules (Urea, DAP, SSP, MOP, Zinc) tailored to landholding size in acres.
- **Crop Rotation & Intercropping Planner:** Soil-restoring seasonal sequences (`Kharif` → `Rabi` → `Summer`) based on Odisha agro-climatic zones.

### 5. Offline-First Sync & Local-First Storage
- **IndexedDB + Service Worker (`vite-plugin-pwa`):** Works offline in low-connectivity rural areas; caches core rules, translations, weather responses, and reference photos (`krushak-saved-crops-disease-photos-v1`) for the farmer's saved crops.
- **Firestore & Central Server Sync:** Synchronizes farmer profiles, spray logs, and advice history when connectivity resumes, with strict locked-field protection (`mobile`, `state`, `district`, `block`, `village`, `gpsLocation`).

### 6. Multilingual & Voice Support
- Full interface and advisory support in **Odia (ଓଡ଼ିଆ)**, **English**, **Hindi (हिन्दी)**, **Telugu (తెలుగు)**, **Bengali (বাংলা)**, and **Tamil (தமிழ்)**.
- Built-in Text-to-Speech (TTS) audio playback (`src/services/ttsService.ts`) and automated voice advisory call integration.

---

## Project Structure

```text
├── backend/
│   ├── telephony_config.json     # Telephony & automated voice call configuration
│   └── voice_advisory.py         # Standalone Python telephony reference script (unused by web runtime)
├── public/
│   ├── disease-photos/           # 154 openly licensed (CC0 / CC BY 4.0) crop disease & pest photos
│   ├── icon.svg                  # App vector icon
│   ├── pwa-192x192.png           # PWA install icon (192x192)
│   ├── pwa-512x512.png           # PWA install icon (512x512)
│   └── manifest.webmanifest      # Web App Manifest
├── src/
│   ├── components/
│   │   ├── common/               # Header, BottomNav, OfflineBanner, FarmerIdCardModal, VoiceInputField
│   │   └── features/             # Dashboard, CropDoctor, CropDiseaseModal, CropStressCheck,
│   │                             # SoilHealthSection, CropGrowthTracker, PesticideAdvice,
│   │                             # FertiliserAdvice, WeatherSpray, CropRotationPlanner, AdminPortal
│   ├── config/
│   │   └── admin.ts              # Centralized bootstrapped admin email configuration
│   ├── data/
│   │   ├── crops/                # 33-crop agronomy & remedies database
│   │   ├── diseases.json         # 154 disease/pest entries with photo metadata, licence & credits
│   │   ├── rules.json            # Doses, PHI days, verification metadata & agro-climatic zones
│   │   ├── crops.json            # Crop stage & water/fertiliser baseline rules
│   │   ├── faq.json              # Offline agricultural FAQ dataset
│   │   ├── labour.json           # Sample farm labour & custom hiring directory (marked SAMPLE)
│   │   └── odishaAddresses.json  # Canonical Odisha districts, blocks & villages
│   ├── services/                 # Weather, Soil, Crop Doctor, Local-First Sync & TTS services
│   └── translations/             # Multilingual UI dictionaries (or, en, hi, te, bn, ta)
├── firestore.rules               # Firebase Firestore RBAC & locked-field security rules
├── server.ts                     # Express + Vite full-stack server (API routes, voice call & DB sync)
└── vite.config.ts                # Vite + Tailwind CSS + Workbox PWA configuration
```

---

## Getting Started

### Prerequisites
- **Node.js** `>= 20.x`
- **npm** `>= 10.x`

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in the required keys:
```bash
cp .env.example .env
```

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | API key for server-side Crop Doctor & agronomy assistant endpoints |
| `APP_URL` | Public base URL of the deployed application |
| `VITE_GOOGLE_MAPS_API_KEY` | Optional Google Maps JavaScript & Geocoding API key |
| `VITE_APK_URL` | Optional direct APK download URL for the "Get the App" QR modal |

### 3. Run in Development Mode
Starts the Express backend and Vite middleware on `http://localhost:3000`:
```bash
npm run dev
```

### 4. Build & Run for Production
```bash
npm run build
npm start
```

### 5. Type-Check / Lint
```bash
npm run lint
```

---

## Security & Admin Configuration

- **Centralized Admin Config:** The primary admin email is configured in `src/config/admin.ts` (`BOOTSTRAPPED_ADMIN_EMAIL`) and enforced in `src/firebase.ts`, `server.ts`, and `firestore.rules`.
- **Admin-Only Diagnostic Routes:** `/admin`, `/status`, `/voice-test`, `/i18n-check`, `/sync-test`, and `/reset` are restricted to authenticated admin accounts.
- **Farmer Data Privacy:** Each authenticated farmer can read and update only their own profile and logs. Locked identity/location fields (`mobile`, `state`, `district`, `block`, `village`, `gpsLocation`) cannot be overwritten by the client after initial registration except via an admin-approved correction request.

---

## Data Credits & Attribution

- **Agronomy & Crop Protection Guidelines:** Adapted from Odisha University of Agriculture and Technology (**OUAT**) and **ICAR** Package of Practices. Unverified sample dosages are explicitly marked `SAMPLE: verify with the label or OUAT/ICAR`.
- **Disease & Pest Reference Photos:** Openly licensed photographs (`CC0 1.0 Universal` and `CC BY 4.0`) with individual photographer credits and licences recorded in `src/data/diseases.json`.
- **Weather Data:** Provided by [Open-Meteo](https://open-meteo.com/).
- **Maps & Imagery:** © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors and Esri World Imagery.
