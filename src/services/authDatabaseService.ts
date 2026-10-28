/**
 * Dual-Layer Local-First IndexedDB + Central Server (Firestore & Express) Authentication & Data Service
 *
 * Architecture:
 * 1) LOCAL FIRST: Every read and write goes to IndexedDB on the phone first (krushak_local_db)
 *    so the app works 100% offline.
 * 2) BACKGROUND SYNC & OFFLINE QUEUE: Changes are queued with timestamps in IndexedDB (sync_queue)
 *    and synced in FIFO order to Firestore (/farmers/{mobile}) + Express (/api/farmers).
 * 3) CONFLICT RESOLUTION:
 *    - Locked fields (mobile, state, district, block, village, gpsLocation): Server value ALWAYS wins.
 *    - Other fields: Most recent edit wins based on timestamps.
 * 4) LOGIN RESTORATION: On login with mobile number + OTP on a new or reinstalled app, downloads
 *    the farmer's full master record from the server and rebuilds the local IndexedDB copy.
 * 5) SIGN OUT WIPE: Removes all farmer personal data from this phone (keeping it safely on the server)
 *    while preserving phone-only stores (offline packs, cached weather, drafts, device settings).
 */

import { FarmerProfile, FieldSizeUnit } from '../types';
import odishaAddresses from '../data/odishaAddresses.json';
import {
  saveMasterRecordLocallyFirst,
  restoreFarmerMasterFromServerToPhone,
  wipeFarmerDataFromPhoneOnSignOut,
  saveDeviceSettingToPhoneOnly,
  idbGet,
  STORE_FARMER_MASTER,
} from './localFirstSyncEngine';
import { db, doc, getDoc, ensureFirebaseSession } from '../firebase';

const DB_STORAGE_KEY = 'krushak_farmers_db_v2';
const ACTIVE_PROFILE_KEY = 'krushak_farmer_profile';
const ACTIVE_SESSION_MOBILE_KEY = 'krushak_active_session_mobile';
const PERMISSIONS_ASKED_KEY = 'krushak_permissions_asked_once';

export const OTP_RESEND_SECONDS = 30;
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export interface OtpSession {
  mobile: string;
  codeHash: string;
  simulatedCode?: string; // Only populated when isDemoMode === true
  sentAt: number;
  expiresAt: number;
  attemptsUsed: number;
  maxAttempts: number;
}

// Check if live SMS carrier gateway is explicitly enabled via env var;
// otherwise OTP SMS delivery runs in transparent DEMO MODE while Firestore is live.
export const isLiveSmsConfigured = Boolean(
  (import.meta as any).env?.VITE_FIREBASE_LIVE_SMS === 'true'
);

export const isDemoMode = !isLiveSmsConfigured;

// Active OTP challenge in memory
let activeOtpSession: OtpSession | null = null;

function simpleHash(str: string): string {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

/**
 * Generates a cryptographically random 6-digit OTP (100000 - 999999)
 */
function generateRandomSixDigitOtp(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    const num = 100000 + (arr[0] % 900000);
    return String(num);
  }
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ============================================================================
// CENTRAL SERVER DATABASE SYNC HELPERS
// ============================================================================
export async function syncProfileToCentralServer(
  profile: FarmerProfile,
  changedFields?: string[]
): Promise<FarmerProfile> {
  return await saveMasterRecordLocallyFirst(profile, changedFields);
}

export async function fetchProfileFromCentralServer(
  mobile: string
): Promise<FarmerProfile | null> {
  return await restoreFarmerMasterFromServerToPhone(mobile);
}

/**
 * Load all farmer profiles from local database copy
 */
export function loadFarmersDatabase(): Record<string, FarmerProfile> {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    const dbMap: Record<string, FarmerProfile> = raw ? JSON.parse(raw) : {};

    const legacyRaw = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (legacyRaw) {
      try {
        const legacy: FarmerProfile = JSON.parse(legacyRaw);
        if (legacy && legacy.mobile && !dbMap[legacy.mobile]) {
          dbMap[legacy.mobile] = legacy;
          localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(dbMap));
        }
      } catch {}
    }

    return dbMap;
  } catch {
    return {};
  }
}

/**
 * Check if a 10-digit mobile number already has a registered farmer account locally
 */
export function findFarmerByMobile(mobile: string): FarmerProfile | null {
  const clean = mobile.replace(/\D/g, '').slice(-10);
  if (clean.length !== 10) return null;
  const dbMap = loadFarmersDatabase();
  return dbMap[clean] || null;
}

/**
 * Send 6-digit OTP to a 10-digit Indian mobile number
 */
export async function sendMobileOtp(mobile: string): Promise<{
  success: boolean;
  errorKey?: string;
  error?: string;
  simulatedOtp?: string;
  expiresAt?: number;
  resendAvailableAt?: number;
}> {
  const clean = mobile.replace(/\D/g, '');
  if (!/^[6-9]\d{9}$/.test(clean)) {
    return {
      success: false,
      errorKey: 'otp_err_invalid_mobile',
      error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
    };
  }

  // Enforce 30s resend cooldown if requesting for the same mobile
  const now = Date.now();
  if (activeOtpSession && activeOtpSession.mobile === clean) {
    const elapsedSec = Math.floor((now - activeOtpSession.sentAt) / 1000);
    if (elapsedSec < OTP_RESEND_SECONDS) {
      return {
        success: false,
        errorKey: 'otp_err_wait_resend',
        error: `Please wait ${OTP_RESEND_SECONDS - elapsedSec} seconds before requesting a new OTP.`,
      };
    }
  }

  if (!isDemoMode) {
    return {
      success: false,
      errorKey: 'otp_err_live_sms',
      error: 'Live SMS gateway requires Firebase Phone Auth configuration.',
    };
  }

  const otpCode = generateRandomSixDigitOtp();
  const expiresAt = now + OTP_EXPIRY_MS;

  activeOtpSession = {
    mobile: clean,
    codeHash: simpleHash(`${clean}:${otpCode}`),
    simulatedCode: isDemoMode ? otpCode : undefined,
    sentAt: now,
    expiresAt,
    attemptsUsed: 0,
    maxAttempts: OTP_MAX_ATTEMPTS,
  };

  return {
    success: true,
    simulatedOtp: isDemoMode ? otpCode : undefined,
    expiresAt,
    resendAvailableAt: now + OTP_RESEND_SECONDS * 1000,
  };
}

/**
 * Verify 6-digit OTP entered by the farmer.
 * Requirement 5: On login with mobile number and OTP on a new or reinstalled app,
 * download the farmer's full record from the server and rebuild the local copy.
 */
export async function verifyMobileOtp(
  mobile: string,
  enteredOtp: string
): Promise<{
  success: boolean;
  errorKey?: string;
  error?: string;
  attemptsRemaining?: number;
  existingProfile?: FarmerProfile | null;
}> {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  const cleanOtp = enteredOtp.replace(/\D/g, '');

  if (!activeOtpSession || activeOtpSession.mobile !== cleanMobile) {
    return {
      success: false,
      errorKey: 'otp_err_no_session',
      error: 'No active OTP found for this mobile number. Please request a new OTP.',
    };
  }

  const now = Date.now();
  if (now > activeOtpSession.expiresAt) {
    activeOtpSession = null;
    return {
      success: false,
      errorKey: 'otp_err_expired',
      error: 'OTP has expired (valid for 5 minutes). Please tap Resend OTP.',
    };
  }

  if (activeOtpSession.attemptsUsed >= activeOtpSession.maxAttempts) {
    return {
      success: false,
      errorKey: 'otp_err_max_attempts',
      error: 'Maximum wrong attempts (3) reached. Please request a new OTP.',
      attemptsRemaining: 0,
    };
  }

  if (cleanOtp.length !== 6) {
    return {
      success: false,
      errorKey: 'otp_err_six_digits',
      error: 'Please enter all 6 digits of the OTP.',
      attemptsRemaining: activeOtpSession.maxAttempts - activeOtpSession.attemptsUsed,
    };
  }

  const expectedHash = simpleHash(`${cleanMobile}:${cleanOtp}`);
  if (expectedHash !== activeOtpSession.codeHash) {
    activeOtpSession.attemptsUsed += 1;
    const remaining = Math.max(0, activeOtpSession.maxAttempts - activeOtpSession.attemptsUsed);
    return {
      success: false,
      errorKey: remaining > 0 ? 'otp_err_wrong_code' : 'otp_err_max_attempts',
      error:
        remaining > 0
          ? `Incorrect OTP. You have ${remaining} attempt(s) remaining.`
          : 'Maximum wrong attempts reached. Please resend a new OTP.',
      attemptsRemaining: remaining,
    };
  }

  // OTP verified! Clear challenge
  activeOtpSession = null;

  // Ensure Firebase Auth session is active
  await ensureFirebaseSession();

  // Requirement 5: Download full master record from server (Firestore / Central DB) and rebuild local copy
  let existingProfile = await restoreFarmerMasterFromServerToPhone(cleanMobile);

  if (!existingProfile) {
    // Check local IndexedDB / localStorage fallback if offline
    existingProfile =
      (await idbGet<FarmerProfile>(STORE_FARMER_MASTER, cleanMobile)) ||
      findFarmerByMobile(cleanMobile);
    if (existingProfile) {
      await saveMasterRecordLocallyFirst(existingProfile);
    }
  }

  if (existingProfile) {
    setActiveSignedInFarmer(existingProfile);
  }

  return {
    success: true,
    existingProfile,
  };
}

/**
 * Get district 3-letter code for Farmer ID generation
 */
export function getDistrictCode(districtName: string): string {
  for (const state of odishaAddresses.states) {
    const found = state.districts.find(
      (d) => d.name_en.toLowerCase() === districtName.toLowerCase()
    );
    if (found && found.code) {
      return found.code.toUpperCase();
    }
  }
  const letters = districtName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  return (letters.slice(0, 3) || 'ODI').padEnd(3, 'X');
}

/**
 * Generate a unique Farmer ID: KB-<DISTRICT_CODE>-<6 random digits>
 */
export function generateUniqueFarmerId(districtName: string): string {
  const distCode = getDistrictCode(districtName);
  const dbMap = loadFarmersDatabase();
  const existingIds = new Set(Object.values(dbMap).map((p) => p.id));

  for (let attempt = 0; attempt < 50; attempt++) {
    const sixDigits = generateRandomSixDigitOtp();
    const candidate = `KB-${distCode}-${sixDigits}`;
    if (!existingIds.has(candidate)) {
      return candidate;
    }
  }
  return `KB-${distCode}-${Date.now().toString().slice(-6)}`;
}

/**
 * Async version that checks uniqueness against Local Copy, Firestore (/farmerIds), and Express (/api/farmers/check-id)
 */
export async function generateVerifiedUniqueFarmerId(districtName: string): Promise<string> {
  await ensureFirebaseSession();
  for (let i = 0; i < 10; i++) {
    const candidate = generateUniqueFarmerId(districtName);
    let collision = false;

    try {
      const snap = await getDoc(doc(db, 'farmerIds', candidate));
      if (snap.exists()) {
        collision = true;
      }
    } catch {}

    if (!collision) {
      try {
        const res = await fetch(`/api/farmers/check-id/${encodeURIComponent(candidate)}`);
        if (res.ok) {
          const data = await res.json();
          if (!data.isUnique) {
            collision = true;
          }
        }
      } catch {}
    }

    if (!collision) {
      return candidate;
    }
  }
  return generateUniqueFarmerId(districtName);
}

/**
 * Exact Field Size Conversion to Acres:
 * - 1 acre = 100 decimal = 100 cent = 40 guntha = 43,560 sq ft
 * - 1 hectare = 2.471 acre
 * - 1 sq m = 10.7639 sq ft
 * - For Bigha and Katha: do NOT guess a conversion; use manualApproxAcres entered by farmer
 */
export function convertFieldSizeToAcres(
  value: number,
  unit: FieldSizeUnit,
  manualApproxAcres?: number
): number {
  const num = Number(value) || 0;
  if (num <= 0) return 0;

  switch (unit) {
    case 'Acre':
      return Number(num.toFixed(3));
    case 'Hectare':
      return Number((num * 2.471).toFixed(3));
    case 'Decimal':
      return Number((num / 100).toFixed(3));
    case 'Cent':
      return Number((num / 100).toFixed(3));
    case 'Guntha':
      return Number((num / 40).toFixed(3));
    case 'Square feet':
      return Number((num / 43560).toFixed(4));
    case 'Square metre':
      return Number(((num * 10.7639) / 43560).toFixed(4));
    case 'Bigha':
    case 'Katha':
      return Number((Number(manualApproxAcres) || 0).toFixed(3));
    default:
      return Number(num.toFixed(3));
  }
}

/**
 * Save and sign in a newly registered or updated FarmerProfile.
 * Writes to local IndexedDB first and queues background sync to Firestore & central server.
 */
export function registerAndSignInFarmer(
  profile: FarmerProfile,
  changedFields?: string[]
): FarmerProfile {
  const cleanMobile = profile.mobile.replace(/\D/g, '').slice(-10);
  const now = Date.now();
  const normalized: FarmerProfile = {
    ...profile,
    mobile: cleanMobile,
    updatedAt: now,
  };

  setActiveSignedInFarmer(normalized);

  // Local-first write to IndexedDB + background queue sync to Firestore
  saveMasterRecordLocallyFirst(normalized, changedFields).catch((err) => {
    console.warn('Local-first save error:', err);
  });

  return normalized;
}

/**
 * Persist active signed-in session on this device (user-scoped by mobile number)
 */
export function setActiveSignedInFarmer(profile: FarmerProfile): void {
  try {
    const cleanMobile = profile.mobile.replace(/\D/g, '').slice(-10);
    localStorage.setItem(ACTIVE_SESSION_MOBILE_KEY, cleanMobile);
    localStorage.setItem(`${ACTIVE_PROFILE_KEY}_${cleanMobile}`, JSON.stringify(profile));
    localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(PERMISSIONS_ASKED_KEY, 'true');
    localStorage.setItem('krushak_permissions_agreed', 'true');
  } catch (e) {
    console.error('Failed to persist active farmer session:', e);
  }
}

/**
 * Get currently signed-in farmer on this device (strictly scoped to active session mobile)
 */
export function getCurrentSignedInFarmer(): FarmerProfile | null {
  try {
    const sessionMobile = localStorage.getItem(ACTIVE_SESSION_MOBILE_KEY);
    if (!sessionMobile || sessionMobile.trim().length !== 10) {
      return null;
    }
    const cleanMobile = sessionMobile.replace(/\D/g, '').slice(-10);

    // Read user-scoped storage key first
    const scopedSaved = localStorage.getItem(`${ACTIVE_PROFILE_KEY}_${cleanMobile}`);
    if (scopedSaved) {
      const parsed: FarmerProfile = JSON.parse(scopedSaved);
      if (parsed && parsed.id && parsed.mobile === cleanMobile) {
        return parsed;
      }
    }

    // Fallback to legacy key only if mobile matches active session
    const legacySaved = localStorage.getItem(ACTIVE_PROFILE_KEY);
    if (legacySaved) {
      const parsed: FarmerProfile = JSON.parse(legacySaved);
      if (parsed && parsed.id && parsed.mobile === cleanMobile) {
        return parsed;
      }
    }

    return findFarmerByMobile(cleanMobile);
  } catch {
    return null;
  }
}

/**
 * Sign out current farmer and wipe all personal data from this phone
 * (while keeping it safely on the server and preserving phone-only stores).
 */
export async function signOutFarmer(): Promise<void> {
  const currentMobile = localStorage.getItem(ACTIVE_SESSION_MOBILE_KEY);
  if (currentMobile) {
    localStorage.removeItem(`${ACTIVE_PROFILE_KEY}_${currentMobile}`);
  }
  await wipeFarmerDataFromPhoneOnSignOut();
}

export async function deleteFarmerAccountAndData(
  mobile: string,
  farmerId?: string
): Promise<void> {
  const { deleteFarmerAccountFromPhoneAndServer } = await import('./localFirstSyncEngine');
  await deleteFarmerAccountFromPhoneAndServer(mobile, farmerId);
}

/**
 * Check if permissions screen was already shown/completed once
 */
export function hasAskedPermissionsOnce(): boolean {
  try {
    return (
      localStorage.getItem(PERMISSIONS_ASKED_KEY) === 'true' ||
      localStorage.getItem('krushak_permissions_agreed') === 'true'
    );
  } catch {
    return false;
  }
}

export function markPermissionsAskedOnce(): void {
  try {
    localStorage.setItem(PERMISSIONS_ASKED_KEY, 'true');
    localStorage.setItem('krushak_permissions_agreed', 'true');
    saveDeviceSettingToPhoneOnly('permissionsAskedOnce', true).catch(() => {});
  } catch {}
}
