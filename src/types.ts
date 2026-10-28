/**
 * Krushak Bani Types Definition
 */

export type Language = 'or' | 'hi' | 'en' | 'te' | 'bn' | 'ta' | 'ur';

export interface VoiceIntent {
  intent: string;
  confidence: number;
  action_label_en: string;
  action_label_or: string;
  target_feature: string;
}

export type FieldSizeUnit =
  | 'Acre'
  | 'Hectare'
  | 'Decimal'
  | 'Cent'
  | 'Guntha'
  | 'Bigha'
  | 'Katha'
  | 'Square feet'
  | 'Square metre';

export interface FieldSizeValue {
  enteredValue: number;
  unit: FieldSizeUnit;
  acres: number;
  unknownSizeChoice?: 'small' | 'medium' | 'large';
}

export interface FarmerProfile {
  id: string; // e.g. "KB-CTC-482910"
  kisanId?: string; // alias
  isAdmin?: boolean;
  role?: string;
  email?: string;
  name: string;
  fullName?: string; // alias
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  photoDataUrl?: string;
  photoConsentGiven?: boolean;
  mobile: string;
  phone?: string; // alias
  state: string;
  district: string;
  block?: string;
  village?: string;
  villageVerified?: boolean;
  pinCode?: string;
  gpsLocation?: {
    lat: number;
    lon: number;
    accuracyMeters: number;
    poorAccuracyFlag?: boolean;
    placeName?: string;
    placeNameOr?: string;
    placeNameHi?: string;
    village?: string;
    block?: string;
    district?: string;
    confirmed?: boolean;
  };
  confirmedLocation?: {
    lat: number;
    lon: number;
    accuracyMeters?: number;
    placeName?: string;
    placeNameOr?: string;
    placeNameHi?: string;
    village?: string;
    block?: string;
    district?: string;
    confirmed?: boolean;
    confirmedAt?: number;
  };
  gpsAccuracyMeters?: number;
  gpsPermissionStatus?: 'granted' | 'denied' | 'prompt' | 'unsupported';
  locationManuallyConfirmed?: boolean;
  landOwnership?: 'own' | 'tenant' | 'sharecropper';
  irrigationSource?: 'rain_fed' | 'canal' | 'tubewell_borewell' | 'pond_river' | 'drip_sprinkler';
  emergencyContact?: {
    name: string;
    phone: string;
  };
  fieldSize?: FieldSizeValue;
  landholdingAcres: number;
  landAcres?: number; // alias
  farmingTypes?: string[];
  primaryCrops: string[];
  cropIds?: string[];
  otherCropsText?: string;
  crops?: string[]; // alias
  farmerType: 'Small & Marginal' | 'Medium' | 'Commercial';
  language: Language;
  preferredLanguage?: Language; // alias
  avatarSeed: string;
  registrationDate: string;
  consentRecord?: {
    agreed: boolean;
    date: string;
    photoAgreed: boolean;
    aiCallAgreed?: boolean;
  };
  aiCallConsent?: boolean;
  isVerified: boolean;
  ownerUid?: string;
  sprayLog?: SprayRecord[];
  adviceHistory?: AdviceRecord[];
  callbackRequests?: CallbackRequestRecord[];
  fieldTimestamps?: Record<string, number>;
  updatedAt?: number;
  lastSyncedAt?: string;
}

export type SyncStatusType = 'saved_on_phone' | 'syncing' | 'saved_to_server';

export interface AdviceRecord {
  id: string;
  type: 'crop_doctor' | 'crop_stress' | 'pesticide' | 'water' | 'fertiliser' | 'rotation';
  cropName: string;
  summary: string;
  recommendation: string;
  photoDataUrl?: string;
  createdAt: string;
  updatedAt: number;
}

export interface CallbackRequestRecord {
  id: string;
  mobile: string;
  helplineNumber: string;
  topic: string;
  district: string;
  status: 'requested' | 'completed';
  createdAt: string;
  updatedAt: number;
}

export interface LockedFieldCorrectionRequest {
  id: string;
  mobile: string;
  farmerId: string;
  farmerName: string;
  ownerUid: string;
  requestedChanges: {
    mobile?: string;
    state?: string;
    district?: string;
    block?: string;
    village?: string;
    gpsLocation?: {
      lat: number;
      lon: number;
      accuracyMeters: number;
      poorAccuracyFlag?: boolean;
    };
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
}

export interface OfflineQueueItem {
  id: string;
  mobile: string;
  actionType:
    | 'UPSERT_MASTER_RECORD'
    | 'ADD_SPRAY_LOG'
    | 'DELETE_SPRAY_LOG'
    | 'ADD_ADVICE_HISTORY'
    | 'ADD_CALLBACK_REQUEST'
    | 'SUBMIT_CORRECTION_REQUEST';
  payload: any;
  fieldTimestamps?: Record<string, number>;
  queuedAt: number;
  retryCount: number;
  lastError?: string;
}

export interface PlantItem {
  id: string;
  category: 'vegetable' | 'cereal' | 'pulse' | 'oilseed' | 'fruit' | 'cash_crop' | 'spice';
  name_en: string;
  name_or: string;
  name_hi: string;
  name_bn?: string;
  name_ta?: string;
  name_ur?: string;
  scientific_name: string;
  icon: string;
  season: string;
  growth_duration_days: string;
  water_requirement: 'Low' | 'Medium' | 'High';
  common_diseases: string[];
}

export interface WeatherData {
  temp_c: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  max_rain_probability_12h: number;
  current_precip_mm: number;
  weather_code?: number;
  is_cached?: boolean;
  cached_at?: string;
  forecast_days?: DayForecast[];
  location_name?: string;
  active_alerts?: WeatherAlert[];
}

export interface DayForecast {
  date: string;
  day_name_en: string;
  day_name_or: string;
  max_temp: number;
  min_temp: number;
  rain_probability: number;
  wind_speed_max: number;
  is_good_for_spraying: boolean;
  spray_status_en: string;
  spray_status_or: string;
  notes_or: string;
  notes_en: string;
}

export interface DiseaseReferenceImage {
  file?: string;
  url: string;
  alt?: string;
  alt_en: string;
  alt_or: string;
  licence?: string;
  license: string;
  credit?: string;
  source: string;
  size_kb?: number;
  verified_by?: string | null;
  verified_date?: string | null;
}

export interface CropDisease {
  id: string;
  name_en: string;
  name_or: string;
  symptoms_en: string;
  symptoms_or: string;
  chemical: string;
  chemical_or: string;
  dose_per_litre: string;
  dose_per_acre: string;
  phi_days: number;
  safety_class: string;
  alternative: string;
  reference_images?: DiseaseReferenceImage[];
  source?: string;
  verified_by?: string | null;
  verified_date?: string | null;
}

export interface FertiliserStage {
  stage_en: string;
  stage_or: string;
  urea_kg_per_acre: number;
  dap_kg_per_acre: number;
  mop_kg_per_acre: number;
  zinc_kg_per_acre: number;
  notes_en: string;
  notes_or: string;
  source?: string;
  verified_by?: string | null;
  verified_date?: string | null;
}

export interface CropRule {
  name_en: string;
  name_or: string;
  irrigate_every_days: Record<string, number>;
  fertiliser_doses: Record<string, FertiliserStage>;
  diseases_pests: CropDisease[];
}

export interface SprayRecord {
  id: string;
  product_name: string;
  crop_name: string;
  crop_category?: string;
  spray_date: string;
  dosage: string;
  field_area_acres: number;
  field_size?: FieldSizeValue;
  plot_name?: string;
  growth_stage?: string;
  problem_type?: string;
  product_type?: string;
  target_pest_disease: string;
  applicator_notes?: string;
  phi_days?: number;
  safe_harvest_date?: string;
  harvest_reminder_set?: boolean;
  cost_inr?: number;
  created_at: string;
}

export interface LabourProvider {
  id: string;
  name_en: string;
  name_or: string;
  service_type_en: string;
  service_type_or: string;
  category: 'drone_sprayer' | 'machinery' | 'sprayer_labour' | 'farm_labour';
  district: string;
  block: string;
  phone: string;
  rate: string;
  verified: boolean;
}

export interface HospitalRecord {
  id: string;
  district: string;
  name_en: string;
  name_or: string;
  location: string;
  phone: string;
  direct_call: string;
  asv_available: boolean;
  icu_ventilator: boolean;
  distance_note: string;
}

export interface CropRotationItem {
  id: string;
  previous_crop_en: string;
  previous_crop_id: string;
  season: string;
  recommended_crop_en: string;
  recommended_crop_or: string;
  agro_zone: string;
  soil_type: string;
  nitrogen_fixed_kg_ha: string;
  water_need: string;
  disease_break_benefits_en: string;
  disease_break_benefits_or: string;
  profit_multiplier: string;
}

export type AlertSeverity = 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN';

export interface WeatherAlert {
  id: string;
  district: string;
  severity: AlertSeverity;
  headline_en: string;
  headline_or: string;
  phenomenon: 'thunderstorm_lightning' | 'heavy_rain' | 'cyclone_wind' | 'heatwave' | 'normal';
  valid_until: string;
  instructions_en: string[];
  instructions_or: string[];
  issued_by: string;
}

export interface GrowthTimelineStage {
  id: string;
  stage_name_en: string;
  stage_name_or: string;
  stage_name_hi?: string;
  day_range: string;
  status: 'completed' | 'current' | 'upcoming';
  estimated_date: string;
  key_management_en: string;
  key_management_or: string;
}

export interface CropProgressPhoto {
  id: string;
  captured_at: string;
  image_url: string; // base64 or blob URL
  growth_score: number; // 0 to 100
  growth_status: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'NEEDS_ATTENTION';
  growth_stage_en: string;
  growth_stage_or: string;
  days_since_sowing: number;
  estimated_days_to_harvest: number;
  estimated_harvest_date: string;
  canopy_cover_percentage: number;
  biomass_index: number; // 0 to 10
  chlorophyll_greenness: number; // 0 to 100
  ai_observations_en: string[];
  ai_observations_or: string[];
  recommended_actions_en: string[];
  recommended_actions_or: string[];
  timeline_stages: GrowthTimelineStage[];
  provider: 'Gemini 3.8 Flash Vision' | 'CropBio Computer Vision ML';
}

export interface CropHistoryRecord {
  id: string;
  year: number;
  season: 'Kharif' | 'Rabi' | 'Summer';
  plot_name: string;
  crop_name_en: string;
  crop_name_or: string;
  variety: string;
  area_acres: number;
  field_size?: FieldSizeValue;
  sowing_date: string;
  harvest_date?: string;
  yield_quintals?: number;
  yield_per_acre?: number;
  total_expenses_inr?: number;
  net_revenue_inr?: number;
  notes?: string;
  progress_photos?: CropProgressPhoto[];
  latest_growth_score?: number;
  latest_growth_stage?: string;
  estimated_harvest_date?: string;
  created_at: string;
}

