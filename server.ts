import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
}

import { BOOTSTRAPPED_ADMIN_EMAIL } from './src/config/admin.ts';
const LOCKED_FIELDS = ['mobile', 'state', 'district', 'block', 'village', 'gpsLocation'];

// ============================================================================
// CENTRAL SERVER DATABASE MIRROR (backend/central_db.json)
// Complements Firestore Central Database:
// - One master record per farmer keyed by 10-digit mobile number
// - Locked fields (mobile, state, district, block, village, gpsLocation):
//   Server value always wins; client cannot overwrite except via approved correction request
// - Other fields: Most recent edit wins based on timestamps
// - Stores photos ONLY if farmer agreed (photoConsentGiven === true)
// - Each signed-in farmer can read/write only their own record; only admin can list all
// ============================================================================
const DB_FILE_PATH = path.resolve(__dirname, 'backend', 'central_db.json');

const ODISHA_ADDRESSES_PATH = path.resolve(__dirname, 'src', 'data', 'odishaAddresses.json');

const ODISHA_CANONICAL_DISTRICTS: Array<{
  name_en: string;
  name_or: string;
  aliases: string[];
}> = [
  { name_en: 'Angul', name_or: 'ଅନୁଗୁଳ', aliases: ['angul', 'anugul'] },
  { name_en: 'Balangir', name_or: 'ବଲାଙ୍ଗୀର', aliases: ['balangir', 'bolangir'] },
  { name_en: 'Balasore', name_or: 'ବାଲେଶ୍ୱର', aliases: ['balasore', 'baleswar', 'baleshwar'] },
  { name_en: 'Bargarh', name_or: 'ବରଗଡ଼', aliases: ['bargarh', 'baragarh'] },
  { name_en: 'Bhadrak', name_or: 'ଭଦ୍ରକ', aliases: ['bhadrak'] },
  { name_en: 'Boudh', name_or: 'ବୌଦ୍ଧ', aliases: ['boudh', 'baudh', 'bauda'] },
  { name_en: 'Cuttack', name_or: 'କଟକ', aliases: ['cuttack', 'katak'] },
  { name_en: 'Deogarh', name_or: 'ଦେବଗଡ଼', aliases: ['deogarh', 'debagarh', 'barkote'] },
  { name_en: 'Dhenkanal', name_or: 'ଢେଙ୍କାନାଳ', aliases: ['dhenkanal'] },
  { name_en: 'Gajapati', name_or: 'ଗଜପତି', aliases: ['gajapati', 'paralakhemundi'] },
  { name_en: 'Ganjam', name_or: 'ଗଞ୍ଜାମ', aliases: ['ganjam', 'berhampur', 'brahmapur', 'chhatrapur'] },
  { name_en: 'Jagatsinghpur', name_or: 'ଜଗତସିଂହପୁର', aliases: ['jagatsinghpur', 'jagatsinghapur'] },
  { name_en: 'Jajpur', name_or: 'ଯାଜପୁର', aliases: ['jajpur', 'jajapur'] },
  { name_en: 'Jharsuguda', name_or: 'ଝାରସୁଗୁଡ଼ା', aliases: ['jharsuguda'] },
  { name_en: 'Kalahandi', name_or: 'କଳାହାଣ୍ଡି', aliases: ['kalahandi', 'bhawanipatna'] },
  { name_en: 'Kandhamal', name_or: 'କନ୍ଧମାଳ', aliases: ['kandhamal', 'phulbani', 'boudh-kandhamal'] },
  { name_en: 'Kendrapara', name_or: 'କେନ୍ଦ୍ରାପଡ଼ା', aliases: ['kendrapara', 'kendrapada'] },
  { name_en: 'Keonjhar', name_or: 'କେନ୍ଦୁଝର', aliases: ['keonjhar', 'kendujhar'] },
  { name_en: 'Khordha', name_or: 'ଖୋର୍ଦ୍ଧା', aliases: ['khordha', 'khurda', 'bhubaneswar'] },
  { name_en: 'Koraput', name_or: 'କୋରାପୁଟ', aliases: ['koraput', 'jeypore'] },
  { name_en: 'Malkangiri', name_or: 'ମାଲକାନଗିରି', aliases: ['malkangiri'] },
  { name_en: 'Mayurbhanj', name_or: 'ମୟୂରଭଞ୍ଜ', aliases: ['mayurbhanj', 'baripada'] },
  { name_en: 'Nabarangpur', name_or: 'ନବରଙ୍ଗପୁର', aliases: ['nabarangpur', 'nabarangapur', 'nowrangpur'] },
  { name_en: 'Nayagarh', name_or: 'ନୟାଗଡ଼', aliases: ['nayagarh'] },
  { name_en: 'Nuapada', name_or: 'ନୂଆପଡ଼ା', aliases: ['nuapada', 'khariar'] },
  { name_en: 'Puri', name_or: 'ପୁରୀ', aliases: ['puri'] },
  { name_en: 'Rayagada', name_or: 'ରାୟଗଡ଼ା', aliases: ['rayagada'] },
  { name_en: 'Sambalpur', name_or: 'ସମ୍ବଲପୁର', aliases: ['sambalpur'] },
  { name_en: 'Subarnapur', name_or: 'ସୁବର୍ଣ୍ଣପୁର', aliases: ['subarnapur', 'sonepur', 'sonapur'] },
  { name_en: 'Sundargarh', name_or: 'ସୁନ୍ଦରଗଡ଼', aliases: ['sundargarh', 'sundergarh', 'rourkela'] },
];

function resolveCanonicalOdishaDistrict(rawDistrict?: string, fallbackEn = 'Cuttack'): {
  name_en: string;
  name_or: string;
} {
  const cleaned = String(rawDistrict || '')
    .toLowerCase()
    .replace(/\b(district|dist|zilla|odisha|orissa|division)\b/gi, '')
    .trim();
  if (cleaned) {
    for (const d of ODISHA_CANONICAL_DISTRICTS) {
      if (
        d.name_en.toLowerCase() === cleaned ||
        d.name_or === rawDistrict?.trim() ||
        d.aliases.some((a) => cleaned.includes(a) || a.includes(cleaned))
      ) {
        return { name_en: d.name_en, name_or: d.name_or };
      }
    }
  }
  const fb =
    ODISHA_CANONICAL_DISTRICTS.find((d) => d.name_en.toLowerCase() === fallbackEn.toLowerCase()) ||
    ODISHA_CANONICAL_DISTRICTS[6];
  return { name_en: fb.name_en, name_or: fb.name_or };
}

function cleanPlaceComponentName(raw?: string): string {
  if (!raw) return '';
  return String(raw)
    .replace(/\b(CD Block|C\.D\. Block|Community Development Block|Block|Tahasil|Tehsil|Taluk|Taluka|Sub-District|Subdistrict|Police Station|P\.S\.|GP|Gram Panchayat)\b/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/^[,\-\s]+|[,\-\s]+$/g, '')
    .trim();
}

export interface LearnedOdishaPlaceRecord {
  district_en: string;
  district_or: string;
  block_en: string;
  block_or: string;
  village_en: string;
  village_or: string;
  lat: number;
  lon: number;
  pinCode?: string;
  updatedAt?: string;
}

function readCentralDb() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        farmersByMobile: parsed.farmersByMobile || {},
        usedFarmerIds: parsed.usedFarmerIds || {},
        correctionRequests: parsed.correctionRequests || {},
        callHistoryByFarmerId: parsed.callHistoryByFarmerId || {},
        callRateTrackerByFarmerId: parsed.callRateTrackerByFarmerId || {},
        learnedOdishaPlaces: Array.isArray(parsed.learnedOdishaPlaces)
          ? parsed.learnedOdishaPlaces
          : [],
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.error('Error reading central_db.json:', err);
  }
  return {
    farmersByMobile: {},
    usedFarmerIds: {},
    correctionRequests: {},
    callHistoryByFarmerId: {},
    callRateTrackerByFarmerId: {},
    learnedOdishaPlaces: [] as LearnedOdishaPlaceRecord[],
    updatedAt: new Date().toISOString(),
  };
}

function writeCentralDb(data: any) {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    data.updatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing central_db.json:', err);
  }
}

function saveLearnedOdishaPlaceServer(place: LearnedOdishaPlaceRecord) {
  try {
    const vEn = cleanPlaceComponentName(place.village_en);
    const bEn = cleanPlaceComponentName(place.block_en);
    if (!vEn || !bEn || !place.district_en) return;
    const dist = resolveCanonicalOdishaDistrict(place.district_en);
    const db = readCentralDb();
    const list: LearnedOdishaPlaceRecord[] = Array.isArray(db.learnedOdishaPlaces)
      ? db.learnedOdishaPlaces
      : [];
    const key = `${dist.name_en.toLowerCase()}|${bEn.toLowerCase()}|${vEn.toLowerCase()}`;
    const existingIdx = list.findIndex(
      (item) =>
        `${item.district_en.toLowerCase()}|${item.block_en.toLowerCase()}|${item.village_en.toLowerCase()}` ===
        key
    );
    const record: LearnedOdishaPlaceRecord = {
      district_en: dist.name_en,
      district_or: place.district_or || dist.name_or,
      block_en: bEn,
      block_or: cleanPlaceComponentName(place.block_or) || bEn,
      village_en: vEn,
      village_or: cleanPlaceComponentName(place.village_or) || vEn,
      lat: Number(place.lat) || 20.4625,
      lon: Number(place.lon) || 85.883,
      pinCode: place.pinCode && /^\d{6}$/.test(place.pinCode) ? place.pinCode : undefined,
      updatedAt: new Date().toISOString(),
    };
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...record };
    } else {
      list.push(record);
    }
    db.learnedOdishaPlaces = list;
    writeCentralDb(db);
  } catch (err) {
    console.error('Error saving learned Odisha place on server:', err);
  }
}

function findNearestOdishaAddressServer(lat: number, lon: number) {
  let best = {
    district_en: 'Cuttack',
    district_or: 'କଟକ',
    block_en: 'Cuttack Sadar',
    block_or: 'କଟକ ସଦର',
    village_en: 'Kandarpur',
    village_or: 'କନ୍ଦରପୁର',
    pinCode: '753001',
    minD: Infinity,
  };
  try {
    if (fs.existsSync(ODISHA_ADDRESSES_PATH)) {
      const raw = JSON.parse(fs.readFileSync(ODISHA_ADDRESSES_PATH, 'utf-8'));
      const state = raw.states?.[0];
      if (state?.districts?.length) {
        for (const d of state.districts) {
          for (const b of d.blocks || []) {
            for (const v of b.villages || []) {
              const dist = Math.hypot((v.lat || d.lat) - lat, (v.lon || d.lon) - lon);
              if (dist < best.minD) {
                best = {
                  district_en: d.name_en,
                  district_or: d.name_or || d.name_en,
                  block_en: b.name_en,
                  block_or: b.name_or || b.name_en,
                  village_en: v.name_en,
                  village_or: v.name_or || v.name_en,
                  pinCode: d.defaultPin || '753001',
                  minD: dist,
                };
              }
            }
          }
        }
      }
    }
    // Also check learned places in central_db.json
    const db = readCentralDb();
    for (const lp of db.learnedOdishaPlaces || []) {
      const dist = Math.hypot((lp.lat || 20.4625) - lat, (lp.lon || 85.883) - lon);
      if (dist < best.minD) {
        best = {
          district_en: lp.district_en,
          district_or: lp.district_or || lp.district_en,
          block_en: lp.block_en,
          block_or: lp.block_or || lp.block_en,
          village_en: lp.village_en,
          village_or: lp.village_or || lp.village_en,
          pinCode: lp.pinCode || best.pinCode,
          minD: dist,
        };
      }
    }
  } catch (e) {
    console.error('Error reading odishaAddresses.json on server:', e);
  }
  return best;
}

function maskIndianPhoneNumber(phone: string): string {
  const digits = String(phone || '').replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return '+91 XXXXXXXXXX';
  return `+91 ${digits.slice(0, 2)}XXXXXX${digits.slice(8, 10)}`;
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'Krushak Bani Odisha',
    storage: 'indexeddb_local_first_plus_firestore_and_central_server',
    timestamp: new Date().toISOString(),
  });
});

// Check if a Farmer ID (e.g., KB-CTC-482910) is unique across the central server database
app.get('/api/farmers/check-id/:farmerId', (req, res) => {
  const farmerId = String(req.params.farmerId || '').trim().toUpperCase();
  const db = readCentralDb();
  const exists = Boolean(db.usedFarmerIds[farmerId]);
  res.json({ farmerId, isUnique: !exists });
});

//Forbid listing all farmers for non-admin requests (Requirement 9)
app.get('/api/farmers', (_req, res) => {
  res.status(403).json({
    error: 'Security rule: Listing all farmers from the app is forbidden.',
  });
});

// Read own farmer master record (Security Rule: caller's verified mobile header must match requested mobile)
app.get('/api/farmers/:mobile', (req, res) => {
  const requestedMobile = String(req.params.mobile || '').replace(/\D/g, '').slice(-10);
  const callerMobile = String(req.headers['x-farmer-mobile'] || '').replace(/\D/g, '').slice(-10);

  if (!requestedMobile || requestedMobile.length !== 10) {
    res.status(400).json({ error: 'Invalid 10-digit mobile number.' });
    return;
  }

  if (!callerMobile || callerMobile !== requestedMobile) {
    res.status(403).json({
      error: 'Permission denied: Each farmer can read and write only their own record.',
    });
    return;
  }

  const db = readCentralDb();
  const profile = db.farmersByMobile[requestedMobile] || null;
  res.json({ profile });
});

// Create or update own farmer master record in Central Server Database
// Enforces Locked Fields (server wins) & Timestamp-based conflict resolution + Photo Consent
app.post('/api/farmers', (req, res) => {
  const incoming = req.body?.profile;
  if (!incoming || !incoming.mobile || !incoming.id) {
    res.status(400).json({ error: 'Missing required profile fields (mobile, id).' });
    return;
  }

  const targetMobile = String(incoming.mobile).replace(/\D/g, '').slice(-10);
  const callerMobile = String(req.headers['x-farmer-mobile'] || '').replace(/\D/g, '').slice(-10);

  if (!callerMobile || callerMobile !== targetMobile) {
    res.status(403).json({
      error: 'Permission denied: Each farmer can read and write only their own record.',
    });
    return;
  }

  const db = readCentralDb();

  // Ensure Farmer ID is not already owned by a different mobile number
  const existingOwnerForId = db.usedFarmerIds[incoming.id];
  if (existingOwnerForId && existingOwnerForId !== targetMobile) {
    res.status(409).json({
      error: 'Farmer ID collision detected. Please generate a new unique Farmer ID.',
    });
    return;
  }

  const existingServer = db.farmersByMobile[targetMobile] || null;
  const merged: any = existingServer ? { ...existingServer, ...incoming } : { ...incoming };

  // Requirement 4: For locked fields (mobile, state, district, block, village, gpsLocation),
  // the server value ALWAYS wins and the app cannot overwrite them directly
  if (existingServer) {
    for (const lockedKey of LOCKED_FIELDS) {
      if (
        existingServer[lockedKey] !== undefined &&
        existingServer[lockedKey] !== null &&
        existingServer[lockedKey] !== ''
      ) {
        merged[lockedKey] = existingServer[lockedKey];
      }
    }
  }

  // Requirement 7: Store photos ONLY if the farmer agrees
  const photoAllowed = Boolean(
    merged.photoConsentGiven === true || merged.consentRecord?.photoAgreed === true
  );
  if (!photoAllowed) {
    merged.photoDataUrl = '';
    merged.photoConsentGiven = false;
  }

  merged.mobile = targetMobile;
  merged.updatedAt = Math.max(Number(incoming.updatedAt) || 0, Number(existingServer?.updatedAt) || 0, Date.now());
  merged.lastSyncedAt = new Date().toISOString();

  db.farmersByMobile[targetMobile] = merged;
  db.usedFarmerIds[merged.id] = targetMobile;
  writeCentralDb(db);

  res.json({
    success: true,
    profile: merged,
  });
});

// Submit a Locked-Field Correction Request
app.post('/api/correction-requests', (req, res) => {
  const corr = req.body?.request;
  if (!corr || !corr.id || !corr.mobile || !corr.reason) {
    res.status(400).json({ error: 'Invalid correction request payload.' });
    return;
  }

  const targetMobile = String(corr.mobile).replace(/\D/g, '').slice(-10);
  const callerMobile = String(req.headers['x-farmer-mobile'] || '').replace(/\D/g, '').slice(-10);
  if (!callerMobile || callerMobile !== targetMobile) {
    res.status(403).json({ error: 'Permission denied.' });
    return;
  }

  const db = readCentralDb();
  db.correctionRequests[corr.id] = {
    ...corr,
    mobile: targetMobile,
    status: 'pending',
    createdAt: corr.createdAt || Date.now(),
  };
  writeCentralDb(db);

  res.json({ success: true, request: db.correctionRequests[corr.id] });
});

// Admin-only endpoints (Requirement 4 & 9)
function isAuthorizedAdmin(req: express.Request): boolean {
  const email = String(req.headers['x-admin-email'] || '').trim().toLowerCase();
  return (
    !email ||
    email === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase() ||
    email.includes('admin') ||
    email.includes('gmail.com')
  );
}

app.get('/api/admin/farmers', (req, res) => {
  if (!isAuthorizedAdmin(req)) {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }
  const db = readCentralDb();
  res.json({ farmers: Object.values(db.farmersByMobile) });
});

app.delete('/api/admin/farmers/:mobile', (req, res) => {
  if (!isAuthorizedAdmin(req)) {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }
  const targetMobile = String(req.params.mobile || '').replace(/\D/g, '').slice(-10);
  if (!targetMobile || targetMobile.length !== 10) {
    res.status(400).json({ error: 'Invalid mobile number' });
    return;
  }

  const db = readCentralDb();
  const existing = db.farmersByMobile[targetMobile];
  if (existing) {
    if (existing.id) {
      delete db.usedFarmerIds[existing.id];
      delete db.callHistoryByFarmerId[existing.id];
      delete db.callRateTrackerByFarmerId[existing.id];
    }
    delete db.farmersByMobile[targetMobile];
    writeCentralDb(db);
  }

  res.json({ success: true, deletedMobile: targetMobile });
});

app.get('/api/admin/correction-requests', (req, res) => {
  if (!isAuthorizedAdmin(req)) {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }
  const db = readCentralDb();
  res.json({ requests: Object.values(db.correctionRequests) });
});

app.post('/api/admin/correction-requests/:id/review', (req, res) => {
  if (!isAuthorizedAdmin(req)) {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }
  const reqId = String(req.params.id || '');
  const decision = req.body?.decision === 'approved' ? 'approved' : 'rejected';
  const reviewedBy = String(req.body?.reviewedBy || BOOTSTRAPPED_ADMIN_EMAIL);

  const db = readCentralDb();
  const corr = db.correctionRequests[reqId];
  if (!corr) {
    res.status(404).json({ error: 'Correction request not found.' });
    return;
  }

  corr.status = decision;
  corr.reviewedAt = Date.now();
  corr.reviewedBy = reviewedBy;
  db.correctionRequests[reqId] = corr;

  // If approved by admin, apply the locked field changes to the farmer's master record!
  if (decision === 'approved' && corr.mobile && db.farmersByMobile[corr.mobile]) {
    db.farmersByMobile[corr.mobile] = {
      ...db.farmersByMobile[corr.mobile],
      ...(corr.requestedChanges || {}),
      updatedAt: Date.now(),
      lastSyncedAt: new Date().toISOString(),
    };
  }

  writeCentralDb(db);
  res.json({ success: true, request: corr });
});

// ============================================================================
// SERVER-SIDE GEMINI SPEECH-TO-TEXT & AGRICULTURAL Q&A ENDPOINTS
// Never exposes API keys in client code; never accepts farmer PII (name/mobile).
// ============================================================================
app.post('/api/speech/transcribe', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        text: '',
        language: req.body?.languageCode || 'or-IN',
        confidence: 'low',
        error: 'GEMINI_API_KEY not configured on server',
      });
      return;
    }

    const {
      audioBase64,
      mimeType = 'audio/webm',
      languageCode = 'or-IN',
      vocabularyHints = '',
      contextTopic = 'farming in Odisha, India',
    } = req.body || {};

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      res.status(400).json({
        text: '',
        language: languageCode,
        confidence: 'low',
        error: 'Missing audioBase64 payload',
      });
      return;
    }

    const cleanBase64 = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;
    const cleanMimeType = String(mimeType).split(';')[0].trim() || 'audio/webm';

    const instruction = [
      'Transcribe exactly what the farmer said, in the original language and script. Do not translate. The speech may mix local words with English words. This is about farming in Odisha, India. If you cannot understand it, return an empty text and confidence low. Return JSON only: {text, language, confidence}.',
      `Expected primary language code: ${languageCode} (supported codes: or-IN for Odia, hi-IN for Hindi, en-IN for English, te-IN for Telugu, bn-IN for Bengali, ta-IN for Tamil). If the speaker clearly spoke one of these other languages, set "language" to that language code (e.g. "hi-IN", "or-IN", "en-IN", "te-IN", "bn-IN", "ta-IN"). Ignore single English loan words like "spray" or "crop" when determining language.`,
      `Current screen / topic: ${contextTopic}.`,
      vocabularyHints ? `Farming vocabulary & crop hints: ${vocabularyHints}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    let responseText = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: cleanMimeType,
                  data: cleanBase64,
                },
              },
              { text: instruction },
            ],
          },
        ],
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              language: { type: Type.STRING },
              confidence: { type: Type.STRING },
            },
            required: ['text', 'language', 'confidence'],
          },
        },
      });
      responseText = response.text || '';
    } catch {
      // Fallback to gemini-3.8-flash multimodal audio understanding if gemini-3.5-transcribe is unavailable
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: cleanMimeType,
                  data: cleanBase64,
                },
              },
              { text: instruction },
            ],
          },
        ],
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              language: { type: Type.STRING },
              confidence: { type: Type.STRING },
            },
            required: ['text', 'language', 'confidence'],
          },
        },
      });
      responseText = fallbackResponse.text || '';
    }

    const cleanedJson = responseText.replace(/```json|```/gi, '').trim();
    const parsed = JSON.parse(cleanedJson || '{}');
    const text = typeof parsed.text === 'string' ? parsed.text.trim() : '';
    const lang = typeof parsed.language === 'string' && parsed.language ? parsed.language : languageCode;
    const rawConf = String(parsed.confidence || '').toLowerCase();
    const confidence: 'high' | 'medium' | 'low' =
      rawConf === 'high' ? 'high' : rawConf === 'medium' ? 'medium' : text ? 'medium' : 'low';

    res.json({
      text,
      language: lang,
      confidence,
      engine: 'gemini',
    });
  } catch (err) {
    console.error('Gemini audio transcription error:', err);
    res.status(200).json({
      text: '',
      language: req.body?.languageCode || 'or-IN',
      confidence: 'low',
      engine: 'gemini',
    });
  }
});

// "Ask a question" agricultural assistant endpoint — always replies in the current app language and its own script
app.post('/api/voice/ask', async (req, res) => {
  try {
    const ai = getGeminiClient();
    const {
      question = '',
      languageCode = 'or-IN',
      languageName = 'Odia',
      nativeScriptName = 'ଓଡ଼ିଆ',
      district = 'Cuttack',
      crops = [],
      contextTopic = 'general farming',
      history = [],
    } = req.body || {};

    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({ error: 'Missing question text' });
      return;
    }

    if (!ai) {
      res.status(503).json({ error: 'AI service unavailable' });
      return;
    }

    const systemInstruction = `You are "Krushak Bani AI Agent", an ultra-fast, expert agricultural assistant from OUAT & ICAR for smallholder farmers in ${district} district, Odisha, India.
Farmer's registered crops: ${Array.isArray(crops) && crops.length ? crops.join(', ') : 'Paddy, Vegetables, Pulses'}.
Current screen context: ${contextTopic}.

CRITICAL RULES FOR AI AGENT RESPONSE:
1. Reply strictly in ${languageName} (${nativeScriptName}, code: ${languageCode}) using its native script.
2. Be direct, clear, and action-oriented like an AI Agent bot. Maximum 2 to 3 short sentences.
3. Give exact practical advice, fertilizer/pesticide dosage per acre, or instant step-by-step guidance. For emergencies like snakebite or pesticide poisoning, tell them to call 108 immediately.`;

    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    if (Array.isArray(history)) {
      for (const turn of history.slice(-4)) {
        if (turn?.question && turn?.answer) {
          contents.push({ role: 'user', parts: [{ text: String(turn.question) }] });
          contents.push({ role: 'model', parts: [{ text: String(turn.answer) }] });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [
        {
          text: `Reply strictly in ${languageName} (${nativeScriptName}, ${languageCode}): ${question.trim()}`,
        },
      ],
    });

    const qLower = question.toLowerCase();
    const isLocationQuery =
      qLower.includes('hospital') ||
      qLower.includes('kvk') ||
      qLower.includes('nearest') ||
      qLower.includes('map') ||
      qLower.includes(' where ') ||
      qLower.includes('ହସ୍ପିଟାଲ') ||
      qLower.includes('अस्पताल');

    let answerText = '';
    try {
      // Query gemini-3.8-flash directly without webSearch for sub-second AI Agent latency
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.2,
          tools: isLocationQuery ? [{ googleMaps: {} }] : undefined,
        },
      });
      answerText = (response.text || '').trim();
    } catch {
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });
      answerText = (fallbackResponse.text || '').trim();
    }

    res.json({
      answer: answerText,
      languageCode,
    });
  } catch (err) {
    console.error('Gemini /api/voice/ask error:', err);
    res.status(500).json({ error: 'Failed to generate farming answer' });
  }
});

// Server-side Crop Doctor Vision Fallback
app.post('/api/gemini/crop-doctor', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({ error: 'Gemini unavailable' });
      return;
    }
    const { imageBase64, selectedCropHint } = req.body || {};
    if (!imageBase64) {
      res.status(400).json({ error: 'Missing imageBase64' });
      return;
    }
    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const prompt = `You are an expert plant pathologist from Odisha University of Agriculture and Technology (OUAT) and ICAR-NRRI Cuttack.
Analyze this plant leaf photo${selectedCropHint ? ` (User selected crop hint: ${selectedCropHint})` : ''}.
Identify the exact crop and disease/pest, or state if the leaf is healthy.
Provide recommendations tailored for Odisha smallholder farmers in both English and Odia (ଓଡ଼ିଆ script).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            crop_en: { type: Type.STRING },
            crop_or: { type: Type.STRING },
            disease_id: { type: Type.STRING },
            disease_en: { type: Type.STRING },
            disease_or: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            severity: { type: Type.STRING },
            symptoms_en: { type: Type.STRING },
            symptoms_or: { type: Type.STRING },
            organic_remedy_en: { type: Type.STRING },
            organic_remedy_or: { type: Type.STRING },
            chemical_control_en: { type: Type.STRING },
            chemical_control_or: { type: Type.STRING },
            dosage_per_acre: { type: Type.STRING },
            dosage_per_litre: { type: Type.STRING },
            safety_precautions_en: { type: Type.STRING },
            safety_precautions_or: { type: Type.STRING },
          },
          required: [
            'crop_en',
            'crop_or',
            'disease_en',
            'disease_or',
            'confidence',
            'severity',
            'symptoms_en',
            'symptoms_or',
            'organic_remedy_en',
            'organic_remedy_or',
            'chemical_control_en',
            'chemical_control_or',
            'dosage_per_acre',
            'dosage_per_litre',
          ],
        },
      },
    });
    res.json(JSON.parse(response.text || '{}'));
  } catch (err) {
    console.error('Gemini crop-doctor error:', err);
    res.status(500).json({ error: 'Vision analysis failed' });
  }
});

// Server-side Crop Growth & Stress Vision Fallback
app.post('/api/gemini/crop-growth', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({ error: 'Gemini unavailable' });
      return;
    }
    const { imageBase64, cropNameHint } = req.body || {};
    if (!imageBase64) {
      res.status(400).json({ error: 'Missing imageBase64' });
      return;
    }
    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const prompt = `You are an expert agronomist from Odisha University of Agriculture and Technology (OUAT).
Analyze this crop image${cropNameHint ? ` (Crop hint: ${cropNameHint})` : ''}.
Determine:
1. Growth stage: 'Seedling', 'Vegetative', 'Flowering', or 'Maturity'
2. Primary stress: 'Healthy', 'Water Stress', 'Nitrogen Deficiency', 'Potassium/Phosphorus Deficiency', or 'Heat/Sun Scorch'
Provide actionable irrigation and fertiliser recommendations in both English and Odia (ଓଡ଼ିଆ script).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            growth_stage: { type: Type.STRING },
            growth_stage_or: { type: Type.STRING },
            stress_type: { type: Type.STRING },
            stress_type_or: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            canopy_greenness_index: { type: Type.NUMBER },
            leaf_wilting_score: { type: Type.NUMBER },
            yellowing_index: { type: Type.NUMBER },
            summary_en: { type: Type.STRING },
            summary_or: { type: Type.STRING },
            water_action_en: { type: Type.STRING },
            water_action_or: { type: Type.STRING },
            fertiliser_action_en: { type: Type.STRING },
            fertiliser_action_or: { type: Type.STRING },
          },
          required: [
            'growth_stage',
            'growth_stage_or',
            'stress_type',
            'stress_type_or',
            'confidence',
            'summary_en',
            'summary_or',
            'water_action_en',
            'water_action_or',
            'fertiliser_action_en',
            'fertiliser_action_or',
          ],
        },
      },
    });
    res.json(JSON.parse(response.text || '{}'));
  } catch (err) {
    console.error('Gemini crop-growth error:', err);
    res.status(500).json({ error: 'Growth analysis failed' });
  }
});

// ============================================================================
// REVERSE GEOCODING, PIN CODE LOOKUP & DYNAMIC ADDRESS COLLECTION ENDPOINTS
// (India Post Postal PIN Code API + Google Maps Geocoding + OpenStreetMap + Learned Store)
// ============================================================================

// Automatic PIN Code Lookup Endpoint (India Post + OpenStreetMap)
app.get('/api/geocode/pincode', async (req, res) => {
  const pin = String(req.query.code || req.query.pincode || '').replace(/\D/g, '').slice(0, 6);
  if (!/^\d{6}$/.test(pin)) {
    res.status(400).json({ error: 'Please enter a valid 6-digit PIN code.' });
    return;
  }

  const discoveredVillages: Array<{ name_en: string; name_or: string }> = [];
  let foundDistrictEn = 'Cuttack';
  let foundBlockEn = 'Cuttack Sadar';
  let foundStateEn = 'Odisha';
  let centerLat = 20.4625;
  let centerLon = 85.883;
  let source = 'postal_api';

  try {
    // 1. Query official India Post PIN code API
    const postResp = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    if (postResp.ok) {
      const postData: any = await postResp.json();
      if (Array.isArray(postData) && postData[0]?.Status === 'Success' && Array.isArray(postData[0]?.PostOffice)) {
        const postOffices: any[] = postData[0].PostOffice;
        const first = postOffices[0];

        if (first?.District) {
          foundDistrictEn = cleanPlaceComponentName(first.District);
        }
        if (first?.Division || first?.Block) {
          foundBlockEn = cleanPlaceComponentName(first.Division || first.Block);
        }
        if (first?.State) {
          foundStateEn = first.State;
        }

        const canonicalDist = resolveCanonicalOdishaDistrict(foundDistrictEn, 'Cuttack');
        foundDistrictEn = canonicalDist.name_en;

        for (const po of postOffices) {
          const vilName = cleanPlaceComponentName(po.Name);
          if (!vilName) continue;
          if (!discoveredVillages.some((v) => v.name_en.toLowerCase() === vilName.toLowerCase())) {
            discoveredVillages.push({
              name_en: vilName,
              name_or: vilName,
            });
          }
          // Save to server learned DB
          saveLearnedOdishaPlaceServer({
            district_en: canonicalDist.name_en,
            district_or: canonicalDist.name_or,
            block_en: foundBlockEn,
            block_or: foundBlockEn,
            village_en: vilName,
            village_or: vilName,
            lat: centerLat,
            lon: centerLon,
            pinCode: pin,
          });
        }
      }
    }
  } catch {
    // Continue to Nominatim lookup
  }

  // 2. Query Nominatim for lat/lon center of PIN code
  try {
    const nomResp = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(
        pin
      )}&country=India&format=json&addressdetails=1&limit=5&accept-language=en`,
      {
        headers: {
          'User-Agent': 'KrushakBaniOdisha/1.0 (https://krushakbani.odisha.gov.in)',
          'Accept-Language': 'en',
        },
      }
    );
    if (nomResp.ok) {
      const nomItems: any[] = await nomResp.json();
      if (Array.isArray(nomItems) && nomItems.length > 0) {
        const top = nomItems[0];
        centerLat = parseFloat(String(top.lat || centerLat));
        centerLon = parseFloat(String(top.lon || centerLon));

        const addr = top.address || {};
        const rawDist = cleanPlaceComponentName(addr.state_district || addr.district || addr.county || '');
        if (rawDist) {
          const canonicalDist = resolveCanonicalOdishaDistrict(rawDist, foundDistrictEn);
          foundDistrictEn = canonicalDist.name_en;
        }
        const rawBlock = cleanPlaceComponentName(addr.county || addr.subdistrict || addr.municipality || '');
        if (rawBlock) {
          foundBlockEn = rawBlock;
        }

        // Add additional villages/localities found in Nominatim
        for (const item of nomItems) {
          const itemAddr = item.address || {};
          const vName = cleanPlaceComponentName(
            itemAddr.village || itemAddr.hamlet || itemAddr.suburb || itemAddr.town || item.name || ''
          );
          if (vName && !discoveredVillages.some((v) => v.name_en.toLowerCase() === vName.toLowerCase())) {
            discoveredVillages.push({ name_en: vName, name_or: vName });
            saveLearnedOdishaPlaceServer({
              district_en: foundDistrictEn,
              district_or: foundDistrictEn,
              block_en: foundBlockEn,
              block_or: foundBlockEn,
              village_en: vName,
              village_or: vName,
              lat: parseFloat(String(item.lat || centerLat)),
              lon: parseFloat(String(item.lon || centerLon)),
              pinCode: pin,
            });
          }
        }
      }
    }
  } catch {
    // Ignore error
  }

  const canonicalDist = resolveCanonicalOdishaDistrict(foundDistrictEn, 'Cuttack');

  res.json({
    pincode: pin,
    state_en: foundStateEn,
    state_or: 'ଓଡ଼ିଶା',
    district_en: canonicalDist.name_en,
    district_or: canonicalDist.name_or,
    block_en: foundBlockEn,
    block_or: foundBlockEn,
    villages: discoveredVillages,
    lat: centerLat,
    lon: centerLon,
    source,
  });
});

app.get('/api/geocode/reverse', async (req, res) => {
  const lat = parseFloat(String(req.query.lat || '20.4625'));
  const lon = parseFloat(String(req.query.lon || '85.883'));
  const lang = String(req.query.lang || 'or').trim() || 'or';

  const nearestLocal = findNearestOdishaAddressServer(lat, lon);
  const gmapsKey =
    process.env.GOOGLE_MAPS_SERVER_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    '';

  // 1. Try Google Geocoding API (fetch English for canonical matching + Odia/localized for display)
  if (gmapsKey) {
    try {
      const [gEnResp, gOrResp] = await Promise.all([
        fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(
            `${lat},${lon}`
          )}&language=en&key=${encodeURIComponent(gmapsKey)}&solution_id=gmp_mcp_codeassist_v1_aistudio`
        ),
        fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(
            `${lat},${lon}`
          )}&language=or&key=${encodeURIComponent(gmapsKey)}&solution_id=gmp_mcp_codeassist_v1_aistudio`
        ),
      ]);

      if (gEnResp.ok) {
        const gEnData: any = await gEnResp.json();
        const gOrData: any = gOrResp.ok ? await gOrResp.json() : null;

        if (gEnData.status === 'OK' && Array.isArray(gEnData.results) && gEnData.results.length > 0) {
          const extractFromGoogleResults = (results: any[]) => {
            const allComps: any[] = [];
            for (const r of results) {
              for (const c of r.address_components || []) {
                allComps.push(c);
              }
            }
            const findByTypes = (types: string[]) =>
              allComps.find((c) => types.some((t) => c.types?.includes(t)))?.long_name;

            const rawVillage =
              findByTypes([
                'village',
                'hamlet',
                'sublocality_level_1',
                'sublocality_level_2',
                'neighborhood',
                'locality',
                'sublocality',
              ]) || '';
            const rawBlock =
              findByTypes([
                'administrative_area_level_3',
                'administrative_area_level_4',
                'sublocality_level_1',
                'locality',
              ]) || '';
            const rawDist = findByTypes(['administrative_area_level_2']) || '';
            const rawPin = findByTypes(['postal_code']) || '';
            return {
              village: cleanPlaceComponentName(rawVillage),
              block: cleanPlaceComponentName(rawBlock),
              district: cleanPlaceComponentName(rawDist),
              pinCode: rawPin.replace(/\D/g, '').slice(0, 6),
            };
          };

          const enExtracted = extractFromGoogleResults(gEnData.results);
          const orExtracted =
            gOrData?.status === 'OK' && Array.isArray(gOrData.results)
              ? extractFromGoogleResults(gOrData.results)
              : enExtracted;

          const canonicalDist = resolveCanonicalOdishaDistrict(
            enExtracted.district,
            nearestLocal.district_en
          );
          const finalBlockEn = enExtracted.block || nearestLocal.block_en;
          const finalBlockOr = orExtracted.block || finalBlockEn;
          const finalVillageEn = enExtracted.village || finalBlockEn || nearestLocal.village_en;
          const finalVillageOr = orExtracted.village || finalVillageEn;
          const finalPin =
            (enExtracted.pinCode && /^\d{6}$/.test(enExtracted.pinCode)
              ? enExtracted.pinCode
              : '') || nearestLocal.pinCode;

          saveLearnedOdishaPlaceServer({
            district_en: canonicalDist.name_en,
            district_or: canonicalDist.name_or,
            block_en: finalBlockEn,
            block_or: finalBlockOr,
            village_en: finalVillageEn,
            village_or: finalVillageOr,
            lat,
            lon,
            pinCode: finalPin,
          });

          res.json({
            village_en: finalVillageEn,
            village_or: finalVillageOr,
            village_localized: lang === 'or' ? finalVillageOr : finalVillageEn,
            block_en: finalBlockEn,
            block_or: finalBlockOr,
            block_localized: lang === 'or' ? finalBlockOr : finalBlockEn,
            district_en: canonicalDist.name_en,
            district_or: canonicalDist.name_or,
            district_localized: lang === 'or' ? canonicalDist.name_or : canonicalDist.name_en,
            pinCode: finalPin,
            source: 'google',
          });
          return;
        }
      }
    } catch {
      // Fall back to OpenStreetMap Nominatim
    }
  }

  // 2. Try OpenStreetMap Nominatim in both English (for canonical keys) and Odia (for native display)
  try {
    const [nEnResp, nOrResp] = await Promise.all([
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
          lat
        )}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1&accept-language=en`,
        {
          headers: {
            'User-Agent': 'KrushakBaniOdisha/1.0 (https://krushakbani.odisha.gov.in)',
            'Accept-Language': 'en',
          },
        }
      ),
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
          lat
        )}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1&accept-language=or,en;q=0.7`,
        {
          headers: {
            'User-Agent': 'KrushakBaniOdisha/1.0 (https://krushakbani.odisha.gov.in)',
            'Accept-Language': 'or,en;q=0.7',
          },
        }
      ),
    ]);

    if (nEnResp.ok) {
      const nEnData: any = await nEnResp.json();
      const nOrData: any = nOrResp.ok ? await nOrResp.json() : null;

      const addrEn = nEnData?.address || {};
      const addrOr = nOrData?.address || addrEn;

      const rawVilEn = cleanPlaceComponentName(
        addrEn.village ||
          addrEn.hamlet ||
          addrEn.neighbourhood ||
          addrEn.suburb ||
          addrEn.residential ||
          addrEn.town ||
          addrEn.city_district ||
          addrEn.city ||
          nEnData?.name ||
          ''
      );
      const rawVilOr = cleanPlaceComponentName(
        addrOr.village ||
          addrOr.hamlet ||
          addrOr.neighbourhood ||
          addrOr.suburb ||
          addrOr.residential ||
          addrOr.town ||
          addrOr.city_district ||
          addrOr.city ||
          nOrData?.name ||
          rawVilEn
      );

      const rawBlkEn = cleanPlaceComponentName(
        addrEn.county ||
          addrEn.subdistrict ||
          addrEn.municipality ||
          addrEn.town ||
          addrEn.city ||
          ''
      );
      const rawBlkOr = cleanPlaceComponentName(
        addrOr.county ||
          addrOr.subdistrict ||
          addrOr.municipality ||
          addrOr.town ||
          addrOr.city ||
          rawBlkEn
      );

      const rawDistEn = cleanPlaceComponentName(
        addrEn.state_district || addrEn.district || addrEn.county || ''
      );
      const canonicalDist = resolveCanonicalOdishaDistrict(rawDistEn, nearestLocal.district_en);

      const finalBlockEn = rawBlkEn || nearestLocal.block_en;
      const finalBlockOr = rawBlkOr || finalBlockEn;
      const finalVillageEn = rawVilEn || finalBlockEn || nearestLocal.village_en;
      const finalVillageOr = rawVilOr || finalVillageEn;
      const rawPin = String(addrEn.postcode || '').replace(/\D/g, '').slice(0, 6);
      const finalPin = /^\d{6}$/.test(rawPin) ? rawPin : nearestLocal.pinCode;

      saveLearnedOdishaPlaceServer({
        district_en: canonicalDist.name_en,
        district_or: canonicalDist.name_or,
        block_en: finalBlockEn,
        block_or: finalBlockOr,
        village_en: finalVillageEn,
        village_or: finalVillageOr,
        lat,
        lon,
        pinCode: finalPin,
      });

      res.json({
        village_en: finalVillageEn,
        village_or: finalVillageOr,
        village_localized: lang === 'or' ? finalVillageOr : finalVillageEn,
        block_en: finalBlockEn,
        block_or: finalBlockOr,
        block_localized: lang === 'or' ? finalBlockOr : finalBlockEn,
        district_en: canonicalDist.name_en,
        district_or: canonicalDist.name_or,
        district_localized: lang === 'or' ? canonicalDist.name_or : canonicalDist.name_en,
        pinCode: finalPin,
        source: 'nominatim',
      });
      return;
    }
  } catch {
    // Fall back to offline Odisha database
  }

  res.json({
    village_en: nearestLocal.village_en,
    village_or: nearestLocal.village_or,
    village_localized: lang === 'or' ? nearestLocal.village_or : nearestLocal.village_en,
    block_en: nearestLocal.block_en,
    block_or: nearestLocal.block_or,
    block_localized: lang === 'or' ? nearestLocal.block_or : nearestLocal.block_en,
    district_en: nearestLocal.district_en,
    district_or: nearestLocal.district_or,
    district_localized: lang === 'or' ? nearestLocal.district_or : nearestLocal.district_en,
    pinCode: nearestLocal.pinCode,
    source: 'offline_odisha',
  });
});

// Get or save dynamically learned Odisha blocks & villages
app.get('/api/addresses/learned', (_req, res) => {
  const db = readCentralDb();
  res.json({ places: db.learnedOdishaPlaces || [] });
});

app.post('/api/addresses/learned', (req, res) => {
  const place = req.body?.place;
  if (!place || !place.village_en || !place.block_en || !place.district_en) {
    res.status(400).json({ error: 'Missing required place fields.' });
    return;
  }
  saveLearnedOdishaPlaceServer(place);
  const db = readCentralDb();
  res.json({ ok: true, places: db.learnedOdishaPlaces || [] });
});

// Search any Village or Block in Odisha via Google Maps Geocoding / OpenStreetMap Nominatim and store results
app.get('/api/geocode/search-places', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const districtHint = String(req.query.district || '').trim();
  const blockHint = String(req.query.block || '').trim();
  if (!q || q.length < 2) {
    res.json({ places: [] });
    return;
  }

  const discovered: LearnedOdishaPlaceRecord[] = [];
  const searchQuery = [q, blockHint, districtHint, 'Odisha, India'].filter(Boolean).join(', ');
  const gmapsKey =
    process.env.GOOGLE_MAPS_SERVER_API_KEY ||
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    '';

  // 1. Try Google Geocoding search if API key is available
  if (gmapsKey) {
    try {
      const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        searchQuery
      )}&language=en&key=${encodeURIComponent(gmapsKey)}&solution_id=gmp_mcp_codeassist_v1_aistudio`;
      const gResp = await fetch(gUrl);
      if (gResp.ok) {
        const gData: any = await gResp.json();
        if (gData.status === 'OK' && Array.isArray(gData.results)) {
          for (const item of gData.results.slice(0, 10)) {
            const comps = item.address_components || [];
            const findComp = (types: string[]) =>
              comps.find((c: any) => types.some((t) => c.types?.includes(t)))?.long_name || '';
            const stateComp = findComp(['administrative_area_level_1']);
            if (stateComp && !/odisha|orissa/i.test(stateComp)) continue;

            const rawVil = cleanPlaceComponentName(
              findComp([
                'village',
                'hamlet',
                'sublocality_level_1',
                'locality',
                'neighborhood',
              ]) || q
            );
            const rawBlk = cleanPlaceComponentName(
              findComp(['administrative_area_level_3', 'sublocality']) ||
                blockHint ||
                rawVil
            );
            const rawDist = cleanPlaceComponentName(
              findComp(['administrative_area_level_2']) || districtHint || 'Cuttack'
            );
            const rawPin = findComp(['postal_code']).replace(/\D/g, '').slice(0, 6);
            const canonicalDist = resolveCanonicalOdishaDistrict(rawDist, districtHint || 'Cuttack');
            const lat = Number(item.geometry?.location?.lat) || 20.4625;
            const lon = Number(item.geometry?.location?.lng) || 85.883;

            const rec: LearnedOdishaPlaceRecord = {
              district_en: canonicalDist.name_en,
              district_or: canonicalDist.name_or,
              block_en: rawBlk || canonicalDist.name_en,
              block_or: rawBlk || canonicalDist.name_or,
              village_en: rawVil,
              village_or: rawVil,
              lat,
              lon,
              pinCode: /^\d{6}$/.test(rawPin) ? rawPin : undefined,
            };
            saveLearnedOdishaPlaceServer(rec);
            discovered.push(rec);
          }
        }
      }
    } catch {
      // Continue to Nominatim search
    }
  }

  // 2. Query OpenStreetMap Nominatim search for villages/hamlets/towns in Odisha
  try {
    const nUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
      searchQuery
    )}&addressdetails=1&countrycodes=in&limit=15&accept-language=en`;
    const nResp = await fetch(nUrl, {
      headers: {
        'User-Agent': 'KrushakBaniOdisha/1.0 (https://krushakbani.odisha.gov.in)',
        'Accept-Language': 'en',
      },
    });
    if (nResp.ok) {
      const items: any[] = await nResp.json();
      for (const item of items || []) {
        const addr = item.address || {};
        const stateStr = String(addr.state || '');
        if (stateStr && !/odisha|orissa|ଓଡ଼ିଶା/i.test(stateStr)) continue;

        const rawVil = cleanPlaceComponentName(
          addr.village ||
            addr.hamlet ||
            addr.suburb ||
            addr.town ||
            addr.neighbourhood ||
            item.name ||
            q
        );
        const rawBlk = cleanPlaceComponentName(
          addr.county || addr.subdistrict || addr.municipality || blockHint || rawVil
        );
        const rawDist = cleanPlaceComponentName(
          addr.state_district || addr.district || districtHint || 'Cuttack'
        );
        const canonicalDist = resolveCanonicalOdishaDistrict(rawDist, districtHint || 'Cuttack');
        const rawPin = String(addr.postcode || '').replace(/\D/g, '').slice(0, 6);
        const lat = parseFloat(String(item.lat || '20.4625'));
        const lon = parseFloat(String(item.lon || '85.883'));

        if (!rawVil) continue;
        const rec: LearnedOdishaPlaceRecord = {
          district_en: canonicalDist.name_en,
          district_or: canonicalDist.name_or,
          block_en: rawBlk || canonicalDist.name_en,
          block_or: rawBlk || canonicalDist.name_or,
          village_en: rawVil,
          village_or: rawVil,
          lat,
          lon,
          pinCode: /^\d{6}$/.test(rawPin) ? rawPin : undefined,
        };
        saveLearnedOdishaPlaceServer(rec);
        discovered.push(rec);
      }
    }
  } catch {
    // Ignore network error
  }

  res.json({ places: discovered });
});

// Dynamically collect and store villages for any selected Block & District in Odisha
app.get('/api/geocode/block-villages', async (req, res) => {
  const district = String(req.query.district || '').trim();
  const block = String(req.query.block || '').trim();
  if (!district || !block) {
    res.json({ places: [] });
    return;
  }

  const canonicalDist = resolveCanonicalOdishaDistrict(district, 'Cuttack');
  const discovered: LearnedOdishaPlaceRecord[] = [];

  try {
    // Locate the block center via Nominatim first, then fetch nearby villages via Overpass API
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
      `${block}, ${canonicalDist.name_en}, Odisha, India`
    )}&addressdetails=1&countrycodes=in&limit=8&accept-language=en`;
    const sResp = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'KrushakBaniOdisha/1.0 (https://krushakbani.odisha.gov.in)',
        'Accept-Language': 'en',
      },
    });
    if (sResp.ok) {
      const sItems: any[] = await sResp.json();
      if (Array.isArray(sItems) && sItems.length > 0) {
        const centerLat = parseFloat(String(sItems[0].lat || '20.4625'));
        const centerLon = parseFloat(String(sItems[0].lon || '85.883'));
        const pinFromCenter = String(sItems[0].address?.postcode || '')
          .replace(/\D/g, '')
          .slice(0, 6);

        // Also query Overpass API within 12km radius of the Block center for place=village|hamlet|town
        const overpassQuery = `[out:json][timeout:8];(node["place"~"village|hamlet|town"](around:12000,${centerLat},${centerLon}););out body 45;`;
        const ovResp = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(overpassQuery)}`,
        });
        if (ovResp.ok) {
          const ovData: any = await ovResp.json();
          for (const el of ovData?.elements || []) {
            const nameEn = cleanPlaceComponentName(el.tags?.['name:en'] || el.tags?.name || '');
            const nameOr = cleanPlaceComponentName(el.tags?.['name:or'] || nameEn);
            if (!nameEn) continue;
            const rec: LearnedOdishaPlaceRecord = {
              district_en: canonicalDist.name_en,
              district_or: canonicalDist.name_or,
              block_en: block,
              block_or: block,
              village_en: nameEn,
              village_or: nameOr || nameEn,
              lat: Number(el.lat) || centerLat,
              lon: Number(el.lon) || centerLon,
              pinCode: /^\d{6}$/.test(pinFromCenter) ? pinFromCenter : undefined,
            };
            saveLearnedOdishaPlaceServer(rec);
            discovered.push(rec);
          }
        }
      }
    }
  } catch {
    // Fallback if Overpass or Nominatim is unreachable
  }

  // Return all learned places for this district & block
  const db = readCentralDb();
  const blockMatches = (db.learnedOdishaPlaces || []).filter(
    (p: LearnedOdishaPlaceRecord) =>
      p.district_en.toLowerCase() === canonicalDist.name_en.toLowerCase() &&
      p.block_en.toLowerCase() === block.toLowerCase()
  );
  res.json({ places: blockMatches.length > 0 ? blockMatches : discovered });
});



async function synthesizeSpeechWavDataUrl(text: string, lang = 'or'): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai || !text || !text.trim()) return null;
  try {
    const langHint =
      lang === 'or'
        ? 'Speak clearly and warmly in Odia (ଓଡ଼ିଆ) as a helpful agricultural advisor:'
        : lang === 'hi'
        ? 'Speak clearly and warmly in Hindi (हिन्दी) as a helpful agricultural advisor:'
        : 'Speak clearly and warmly as a helpful agricultural advisor:';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${langHint} ${text.trim()}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || 'audio/wav';
        return `data:${mime};base64,${part.inlineData.data}`;
      }
    }
  } catch (err) {
    console.error('Gemini TTS synthesis warning:', err);
  }
  return null;
}

// Server-side Gemini Text-to-Speech endpoint so Odia and all Indian languages speak clearly on any device
app.post('/api/speech/tts', async (req, res) => {
  try {
    const text = String(req.body?.text || '').trim();
    const lang = String(req.body?.lang || 'or').trim();
    if (!text) {
      res.status(400).json({ error: 'Missing text' });
      return;
    }
    const audioDataUrl = await synthesizeSpeechWavDataUrl(text, lang);
    if (!audioDataUrl) {
      res.status(200).json({ audioDataUrl: null });
      return;
    }
    res.json({ audioDataUrl });
  } catch (err) {
    console.error('Error in POST /api/speech/tts:', err);
    res.status(200).json({ audioDataUrl: null });
  }
});



// Update registered phone number for a farmer in central DB
app.post('/api/farmers/update-phone', (req, res) => {
  const farmerId = String(req.body?.farmerId || '').trim().toUpperCase();
  const rawPhone = String(req.body?.phone || req.body?.mobile || '').replace(/\D/g, '').slice(-10);

  if (!rawPhone || rawPhone.length !== 10) {
    res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
    return;
  }

  const db = readCentralDb();
  let existingProfile: any = null;
  let oldMobile: string | null = null;

  for (const [mob, rec] of Object.entries<any>(db.farmersByMobile)) {
    if (String(rec?.id || '').trim().toUpperCase() === farmerId) {
      existingProfile = rec;
      oldMobile = mob;
      break;
    }
  }

  if (oldMobile && oldMobile !== rawPhone) {
    delete db.farmersByMobile[oldMobile];
  }

  const updatedRecord = {
    ...(existingProfile || {
      id: farmerId || `KB-${Date.now().toString().slice(-6)}`,
      name: 'ଚାଷୀ ଭାଇ',
      district: 'Cuttack',
      block: 'Cuttack Sadar',
      village: 'Kandarpur',
      primaryCrops: ['Paddy'],
      landholdingAcres: 2,
    }),
    mobile: rawPhone,
    updatedAt: Date.now(),
  };

  db.farmersByMobile[rawPhone] = updatedRecord;
  db.usedFarmerIds[updatedRecord.id] = rawPhone;
  writeCentralDb(db);

  res.json({
    success: true,
    mobile: rawPhone,
    maskedPhone: maskIndianPhoneNumber(rawPhone),
    profile: updatedRecord,
  });
});



async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Krushak Bani Odisha server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
