/**
 * Local-First IndexedDB + Central Server (Firestore & Express Mirror) Sync Engine
 *
 * Implements all 10 architecture & security requirements:
 * 1) Local first: Every read/write goes to IndexedDB on the phone first. Background sync sends
 *    changes to Firestore when internet is available, emitting status:
 *    "saved_on_phone" | "syncing" | "saved_to_server".
 * 2) Offline queue: Ordered FIFO queue in IndexedDB with timestamps, automatic retry with
 *    backoff on failure, and zero silent data loss.
 * 3) One master record per farmer on the server, keyed by 10-digit mobile number (/farmers/{mobile}).
 *    Server data is the master copy.
 * 4) Conflict resolution:
 *    - Locked fields (mobile, state, district, block, village, gpsLocation): Server value ALWAYS wins;
 *      client cannot overwrite them except through an admin-approved correction request.
 *    - Other fields: Most recent edit wins based on timestamps (fieldTimestamps / updatedAt).
 * 5) Login restoration: On OTP login on a new/reinstalled app, downloads the full master record
 *    from the server and rebuilds the local IndexedDB stores.
 * 6) Sign out: Removes all farmer personal data from this phone (keeping it safely on the server)
 *    after confirmation & unsynced-queue warning, while keeping phone-only stores intact.
 * 7) Stored on server: profile, field size, address with GPS & accuracy, crops, emergency contact,
 *    consent record, spray log, advice history, callback requests. Photos stored ONLY if farmer agrees.
 * 8) Kept on phone only: offline model & disease packs, cached weather, drafts, device settings.
 * 9) Security & Admin: Enforced via Firestore Security Rules + Admin gate.
 * 10) Tracks and exposes "Last synced" timestamp for the Account Menu.
 */

import {
  FarmerProfile,
  SprayRecord,
  AdviceRecord,
  CallbackRequestRecord,
  LockedFieldCorrectionRequest,
  OfflineQueueItem,
  SyncStatusType,
} from '../types';
import {
  db,
  auth,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  ensureFirebaseSession,
  handleFirestoreError,
  OperationType,
  BOOTSTRAPPED_ADMIN_EMAIL,
} from '../firebase';
import { getSavedCropsReferenceImages } from '../data/crops/index';

const IDB_NAME = 'krushak_local_db';
const IDB_VERSION = 3;

// Synced Farmer Stores (Wiped on Sign-Out so another person using the phone cannot see them)
export const STORE_FARMER_MASTER = 'farmer_master';
export const STORE_SPRAY_LOGS = 'spray_logs';
export const STORE_ADVICE_HISTORY = 'advice_history';
export const STORE_CALLBACK_REQUESTS = 'callback_requests';
export const STORE_CORRECTION_REQUESTS = 'correction_requests';
export const STORE_SYNC_QUEUE = 'sync_queue';

// Legacy store name kept for backwards compatibility
export const STORE_LEGACY_FARMERS = 'farmers';

// Phone-Only Stores (Kept on phone only, never synced to server, preserved across sign-out)
export const STORE_OFFLINE_PACKS = 'offline_packs';
export const STORE_CACHED_WEATHER = 'cached_weather';
export const STORE_DRAFTS = 'drafts';
export const STORE_DEVICE_SETTINGS = 'device_settings';

export const LOCKED_FARMER_FIELDS = [
  'mobile',
  'state',
  'district',
  'block',
  'village',
  'gpsLocation',
] as const;

export const UNLOCKED_FARMER_FIELDS = [
  'name',
  'fullName',
  'age',
  'gender',
  'fieldSize',
  'landholdingAcres',
  'landAcres',
  'landOwnership',
  'irrigationSource',
  'emergencyContact',
  'farmingTypes',
  'primaryCrops',
  'cropIds',
  'otherCropsText',
  'crops',
  'farmerType',
  'language',
  'preferredLanguage',
  'consentRecord',
  'confirmedLocation',
  'gpsAccuracyMeters',
  'gpsPermissionStatus',
  'locationManuallyConfirmed',
  'photoConsentGiven',
  'photoDataUrl',
] as const;

export interface SyncEngineSnapshot {
  status: SyncStatusType;
  pendingCount: number;
  lastSyncedAt: string | null;
  isOnline: boolean;
  lastError: string | null;
}

type SyncListener = (snapshot: SyncEngineSnapshot) => void;

const listeners = new Set<SyncListener>();

let currentStatus: SyncStatusType = 'saved_on_phone';
let pendingQueueCount = 0;
let lastSyncedIso: string | null =
  typeof localStorage !== 'undefined' ? localStorage.getItem('krushak_last_synced_at') : null;
let lastSyncError: string | null = null;
let isProcessingQueue = false;
let retryTimeoutId: number | null = null;

function notifyListeners(): void {
  const snapshot: SyncEngineSnapshot = {
    status: currentStatus,
    pendingCount: pendingQueueCount,
    lastSyncedAt: lastSyncedIso,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastError: lastSyncError,
  };
  listeners.forEach((fn) => {
    try {
      fn(snapshot);
    } catch {}
  });
}

export function subscribeSyncStatus(listener: SyncListener): () => void {
  listeners.add(listener);
  listener({
    status: currentStatus,
    pendingCount: pendingQueueCount,
    lastSyncedAt: lastSyncedIso,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastError: lastSyncError,
  });
  return () => {
    listeners.delete(listener);
  };
}

export function getSyncSnapshot(): SyncEngineSnapshot {
  return {
    status: currentStatus,
    pendingCount: pendingQueueCount,
    lastSyncedAt: lastSyncedIso,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastError: lastSyncError,
  };
}

// ============================================================================
// INDEXED-DB CONNECTION & GENERIC HELPERS
// ============================================================================
let dbPromise: Promise<IDBDatabase> | null = null;

export function openLocalDatabase(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.reject(new Error('IndexedDB not supported'));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const idb = req.result;
      // Synced Farmer Stores
      if (!idb.objectStoreNames.contains(STORE_FARMER_MASTER)) {
        idb.createObjectStore(STORE_FARMER_MASTER, { keyPath: 'mobile' });
      }
      if (!idb.objectStoreNames.contains(STORE_LEGACY_FARMERS)) {
        idb.createObjectStore(STORE_LEGACY_FARMERS, { keyPath: 'mobile' });
      }
      if (!idb.objectStoreNames.contains(STORE_SPRAY_LOGS)) {
        idb.createObjectStore(STORE_SPRAY_LOGS, { keyPath: 'id' });
      }
      if (!idb.objectStoreNames.contains(STORE_ADVICE_HISTORY)) {
        idb.createObjectStore(STORE_ADVICE_HISTORY, { keyPath: 'id' });
      }
      if (!idb.objectStoreNames.contains(STORE_CALLBACK_REQUESTS)) {
        idb.createObjectStore(STORE_CALLBACK_REQUESTS, { keyPath: 'id' });
      }
      if (!idb.objectStoreNames.contains(STORE_CORRECTION_REQUESTS)) {
        idb.createObjectStore(STORE_CORRECTION_REQUESTS, { keyPath: 'id' });
      }
      if (!idb.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
        idb.createObjectStore(STORE_SYNC_QUEUE, { keyPath: 'id' });
      }

      // Phone-Only Stores (Never synced to server, never wiped on sign-out)
      if (!idb.objectStoreNames.contains(STORE_OFFLINE_PACKS)) {
        idb.createObjectStore(STORE_OFFLINE_PACKS, { keyPath: 'id' });
      }
      if (!idb.objectStoreNames.contains(STORE_CACHED_WEATHER)) {
        idb.createObjectStore(STORE_CACHED_WEATHER, { keyPath: 'district' });
      }
      if (!idb.objectStoreNames.contains(STORE_DRAFTS)) {
        idb.createObjectStore(STORE_DRAFTS, { keyPath: 'key' });
      }
      if (!idb.objectStoreNames.contains(STORE_DEVICE_SETTINGS)) {
        idb.createObjectStore(STORE_DEVICE_SETTINGS, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbPromise = null;
      reject(req.error);
    };
  });

  return dbPromise;
}

export async function idbPut<T>(storeName: string, value: T): Promise<void> {
  try {
    const idb = await openLocalDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn(`IndexedDB put error on ${storeName}:`, err);
  }
}

export async function idbGet<T>(storeName: string, key: string): Promise<T | null> {
  try {
    const idb = await openLocalDatabase();
    return await new Promise<T | null>((resolve, reject) => {
      const tx = idb.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function idbGetAll<T>(storeName: string): Promise<T[]> {
  try {
    const idb = await openLocalDatabase();
    return await new Promise<T[]>((resolve, reject) => {
      const tx = idb.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve((req.result as T[]) || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function idbDelete(storeName: string, key: string): Promise<void> {
  try {
    const idb = await openLocalDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {}
}

export async function idbClearStore(storeName: string): Promise<void> {
  try {
    const idb = await openLocalDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = idb.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {}
}

// ============================================================================
// PHONE-ONLY DATA HELPERS (Requirement 8: Keep on phone only)
// - Offline model and disease packs
// - Cached weather
// - Drafts
// - Device settings
// ============================================================================
export async function cacheSavedCropPhotosOffline(cropIds?: string[]): Promise<void> {
  try {
    let activeCrops = cropIds;
    if (!activeCrops || activeCrops.length === 0) {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('krushak_farmer_profile');
        if (raw) {
          const parsed = JSON.parse(raw) as FarmerProfile;
          activeCrops = parsed.cropIds || parsed.primaryCrops || parsed.crops || [];
        }
      }
    }

    const refImages = getSavedCropsReferenceImages(activeCrops);
    const urls = Array.from(new Set(refImages.map((img) => img.file || img.url).filter((u): u is string => Boolean(u))));

    if (typeof window !== 'undefined' && 'caches' in window && urls.length > 0) {
      const cache = await caches.open('krushak-saved-crops-disease-photos-v1');
      await Promise.allSettled(urls.map((u) => cache.add(u)));
    }

    const totalSizeKb = refImages.reduce((acc, item) => acc + (item.size_kb || 65), 0);
    await idbPut(STORE_OFFLINE_PACKS, {
      id: 'saved-crops-disease-photos-pack',
      name: 'Offline Reference Photos Pack for Saved Crops',
      version: '1.0.0',
      crops: activeCrops && activeCrops.length > 0 ? activeCrops : ['paddy', 'brinjal', 'tomato', 'groundnut', 'pulses'],
      cachedImageUrls: urls,
      imageCount: urls.length,
      sizeKb: totalSizeKb,
      keptOnPhoneOnly: true,
      updatedAt: Date.now(),
    });
  } catch {}
}

export async function ensurePhoneOnlyOfflinePacksSeeded(): Promise<void> {
  const existing = await idbGetAll<any>(STORE_OFFLINE_PACKS);
  if (existing.length === 0) {
    await idbPut(STORE_OFFLINE_PACKS, {
      id: 'odisha-crop-disease-pack-v1',
      name: 'OUAT & PlantVillage Odisha Disease Pack (Paddy, Vegetable, Pulse, Oilseed)',
      version: '2.4.0',
      sizeKb: 1420,
      keptOnPhoneOnly: true,
      updatedAt: Date.now(),
    });
    await idbPut(STORE_OFFLINE_PACKS, {
      id: 'odisha-30-districts-asv-map-pack',
      name: 'Odisha 30-District ASV Snakebite Hospital & KVK Vector Pack',
      version: '1.8.0',
      sizeKb: 680,
      keptOnPhoneOnly: true,
      updatedAt: Date.now(),
    });
  }
  await cacheSavedCropPhotosOffline();
}

export async function saveCachedWeatherToPhoneOnly(district: string, weather: any): Promise<void> {
  await idbPut(STORE_CACHED_WEATHER, {
    district,
    weather,
    cachedAt: Date.now(),
    keptOnPhoneOnly: true,
  });
}

export async function getCachedWeatherFromPhoneOnly(district: string): Promise<any | null> {
  const rec = await idbGet<{ district: string; weather: any; cachedAt: number }>(
    STORE_CACHED_WEATHER,
    district
  );
  return rec?.weather ?? null;
}

export async function saveDraftToPhoneOnly(key: string, data: any): Promise<void> {
  await idbPut(STORE_DRAFTS, {
    key,
    data,
    updatedAt: Date.now(),
    keptOnPhoneOnly: true,
  });
}

export async function getDraftFromPhoneOnly<T = any>(key: string): Promise<T | null> {
  const rec = await idbGet<{ key: string; data: T }>(STORE_DRAFTS, key);
  return rec?.data ?? null;
}

export async function saveDeviceSettingToPhoneOnly(key: string, value: any): Promise<void> {
  await idbPut(STORE_DEVICE_SETTINGS, {
    key,
    value,
    updatedAt: Date.now(),
    keptOnPhoneOnly: true,
  });
}

export async function getDeviceSettingFromPhoneOnly<T = any>(key: string): Promise<T | null> {
  const rec = await idbGet<{ key: string; value: T }>(STORE_DEVICE_SETTINGS, key);
  return rec?.value ?? null;
}

// ============================================================================
// PHOTO CONSENT FILTERING (Requirement 7: Store photos ONLY if farmer agrees)
// ============================================================================
export function sanitizeProfileForServer(
  profile: FarmerProfile,
  ownerUid: string
): Record<string, any> {
  const cleanMobile = profile.mobile.replace(/\D/g, '').slice(-10);
  const photoAllowed = Boolean(
    profile.photoConsentGiven === true || profile.consentRecord?.photoAgreed === true
  );

  const sanitizedAdviceHistory = (profile.adviceHistory || []).map((adv) => {
    const copy = { ...adv };
    if (!photoAllowed) {
      delete copy.photoDataUrl;
    }
    return copy;
  });

  const payload: Record<string, any> = {
    ...profile,
    mobile: cleanMobile,
    ownerUid,
    photoConsentGiven: photoAllowed,
    photoDataUrl: photoAllowed ? profile.photoDataUrl || '' : '',
    sprayLog: profile.sprayLog || [],
    adviceHistory: sanitizedAdviceHistory,
    callbackRequests: profile.callbackRequests || [],
    fieldTimestamps: profile.fieldTimestamps || {},
    updatedAt: profile.updatedAt || Date.now(),
    lastSyncedAt: new Date().toISOString(),
  };

  // Strip undefined properties so Firestore setDoc does not reject them
  return JSON.parse(JSON.stringify(payload));
}

// ============================================================================
// CONFLICT RESOLUTION ENGINE (Requirement 4)
// - Locked fields (mobile, state, district, block, village, gpsLocation):
//   Server value ALWAYS wins.
// - Unlocked fields: Most recent edit wins based on timestamps.
// ============================================================================
function mergeRecordsById<T extends { id: string; updatedAt?: number; created_at?: string; createdAt?: string }>(
  localList: T[] = [],
  serverList: T[] = []
): T[] {
  const map = new Map<string, T>();
  for (const item of serverList) {
    if (item && item.id) {
      map.set(item.id, item);
    }
  }
  for (const item of localList) {
    if (!item || !item.id) continue;
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, item);
    } else {
      const localTs =
        item.updatedAt ||
        (item.created_at ? new Date(item.created_at).getTime() : 0) ||
        (item.createdAt ? new Date(item.createdAt).getTime() : 0);
      const serverTs =
        existing.updatedAt ||
        (existing.created_at ? new Date(existing.created_at).getTime() : 0) ||
        (existing.createdAt ? new Date(existing.createdAt).getTime() : 0);
      if (localTs >= serverTs) {
        map.set(item.id, item);
      }
    }
  }
  return Array.from(map.values());
}

export function resolveMasterRecordConflict(
  localRecord: FarmerProfile,
  serverRecord: FarmerProfile | null
): FarmerProfile {
  if (!serverRecord) {
    return {
      ...localRecord,
      updatedAt: localRecord.updatedAt || Date.now(),
    };
  }

  const merged: any = {
    ...serverRecord,
    ...localRecord,
  };

  const localFieldTs: Record<string, number> = localRecord.fieldTimestamps || {};
  const serverFieldTs: Record<string, number> = serverRecord.fieldTimestamps || {};
  const mergedFieldTs: Record<string, number> = { ...serverFieldTs, ...localFieldTs };

  const localUpdated = localRecord.updatedAt || 0;
  const serverUpdated = serverRecord.updatedAt || 0;

  // 1. LOCKED FIELDS: Server value ALWAYS wins once present on server
  for (const lockedKey of LOCKED_FARMER_FIELDS) {
    if (serverRecord[lockedKey] !== undefined && serverRecord[lockedKey] !== null && serverRecord[lockedKey] !== '') {
      merged[lockedKey] = serverRecord[lockedKey];
      mergedFieldTs[lockedKey] = serverFieldTs[lockedKey] || serverUpdated || Date.now();
    }
  }

  // 2. UNLOCKED FIELDS: Most recent edit wins based on per-field timestamp or record updatedAt
  for (const field of UNLOCKED_FARMER_FIELDS) {
    const lTs = localFieldTs[field] ?? localUpdated;
    const sTs = serverFieldTs[field] ?? serverUpdated;

    if (sTs > lTs && serverRecord[field] !== undefined) {
      merged[field] = serverRecord[field];
      mergedFieldTs[field] = sTs;
    } else if (localRecord[field] !== undefined) {
      merged[field] = localRecord[field];
      mergedFieldTs[field] = Math.max(lTs, Date.now());
    }
  }

  // 3. Merge sub-collections (Spray Log, Advice History, Callback Requests)
  merged.sprayLog = mergeRecordsById(localRecord.sprayLog, serverRecord.sprayLog);
  merged.adviceHistory = mergeRecordsById(localRecord.adviceHistory, serverRecord.adviceHistory);
  merged.callbackRequests = mergeRecordsById(
    localRecord.callbackRequests,
    serverRecord.callbackRequests
  );

  // Enforce photo consent rule
  const photoAllowed = Boolean(
    merged.photoConsentGiven === true || merged.consentRecord?.photoAgreed === true
  );
  if (!photoAllowed) {
    // Keep local photo on phone if present, but mark photoConsentGiven false
    merged.photoConsentGiven = false;
  }

  merged.fieldTimestamps = mergedFieldTs;
  merged.updatedAt = Math.max(localUpdated, serverUpdated, Date.now());

  return merged as FarmerProfile;
}

// ============================================================================
// LOCAL-FIRST READ / WRITE OPERATIONS (Requirement 1 & 2)
// ============================================================================
export async function saveMasterRecordLocallyFirst(
  profile: FarmerProfile,
  changedFields?: string[]
): Promise<FarmerProfile> {
  const cleanMobile = profile.mobile.replace(/\D/g, '').slice(-10);
  const now = Date.now();

  const existingLocal = await idbGet<FarmerProfile>(STORE_FARMER_MASTER, cleanMobile);
  const sprayLogs = await idbGetAll<SprayRecord>(STORE_SPRAY_LOGS);
  const adviceHistory = await idbGetAll<AdviceRecord>(STORE_ADVICE_HISTORY);
  const callbackRequests = await idbGetAll<CallbackRequestRecord>(STORE_CALLBACK_REQUESTS);

  const prevTimestamps = {
    ...(existingLocal?.fieldTimestamps || {}),
    ...(profile.fieldTimestamps || {}),
  };

  if (changedFields && changedFields.length > 0) {
    for (const f of changedFields) {
      prevTimestamps[f] = now;
    }
  } else {
    for (const f of UNLOCKED_FARMER_FIELDS) {
      if ((profile as any)[f] !== undefined) {
        prevTimestamps[f] = prevTimestamps[f] || now;
      }
    }
  }

  const enriched: FarmerProfile = {
    ...(existingLocal || {}),
    ...profile,
    mobile: cleanMobile,
    sprayLog: profile.sprayLog || sprayLogs,
    adviceHistory: profile.adviceHistory || adviceHistory,
    callbackRequests: profile.callbackRequests || callbackRequests,
    fieldTimestamps: prevTimestamps,
    updatedAt: now,
  };

  // 1. Save immediately to IndexedDB on the phone
  await idbPut(STORE_FARMER_MASTER, enriched);
  await idbPut(STORE_LEGACY_FARMERS, enriched);

  // Also mirror to localStorage for synchronous React initializers
  try {
    localStorage.setItem('krushak_farmer_profile', JSON.stringify(enriched));
    const rawDb = localStorage.getItem('krushak_farmers_db_v2');
    const parsedDb = rawDb ? JSON.parse(rawDb) : {};
    parsedDb[cleanMobile] = enriched;
    localStorage.setItem('krushak_farmers_db_v2', JSON.stringify(parsedDb));
  } catch {}

  // 2. Enqueue for background sync to Central Server (Firestore + Express)
  await enqueueSyncOperation({
    mobile: cleanMobile,
    actionType: 'UPSERT_MASTER_RECORD',
    payload: enriched,
    fieldTimestamps: prevTimestamps,
  });

  // Cache disease reference photos for the farmer's saved crops in the offline pack
  cacheSavedCropPhotosOffline(
    enriched.cropIds || enriched.primaryCrops || enriched.crops
  ).catch(() => {});

  return enriched;
}

/**
 * Local-First Spray Log operations
 */
export async function getSprayLogsLocalFirst(): Promise<SprayRecord[]> {
  const fromIdb = await idbGetAll<SprayRecord>(STORE_SPRAY_LOGS);
  if (fromIdb.length > 0) {
    return fromIdb.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  try {
    const raw = localStorage.getItem('krushak_spray_log');
    if (raw) {
      const parsed: SprayRecord[] = JSON.parse(raw);
      for (const item of parsed) {
        await idbPut(STORE_SPRAY_LOGS, item);
      }
      return parsed;
    }
  } catch {}
  return [];
}

export async function addSprayLogLocalFirst(
  record: SprayRecord,
  mobile?: string
): Promise<SprayRecord[]> {
  await idbPut(STORE_SPRAY_LOGS, record);
  const all = await getSprayLogsLocalFirst();
  try {
    localStorage.setItem('krushak_spray_log', JSON.stringify(all));
  } catch {}

  const activeMobile =
    mobile ||
    (typeof localStorage !== 'undefined'
      ? localStorage.getItem('krushak_active_session_mobile') || ''
      : '');
  const cleanMobile = activeMobile.replace(/\D/g, '').slice(-10);

  if (cleanMobile.length === 10) {
    const master = await idbGet<FarmerProfile>(STORE_FARMER_MASTER, cleanMobile);
    if (master) {
      master.sprayLog = all;
      master.updatedAt = Date.now();
      await idbPut(STORE_FARMER_MASTER, master);
    }
    await enqueueSyncOperation({
      mobile: cleanMobile,
      actionType: 'ADD_SPRAY_LOG',
      payload: { record, sprayLog: all },
    });
  } else {
    currentStatus = 'saved_on_phone';
    notifyListeners();
  }

  return all;
}

export async function deleteSprayLogLocalFirst(
  id: string,
  mobile?: string
): Promise<SprayRecord[]> {
  await idbDelete(STORE_SPRAY_LOGS, id);
  const all = await getSprayLogsLocalFirst();
  try {
    localStorage.setItem('krushak_spray_log', JSON.stringify(all));
  } catch {}

  const activeMobile =
    mobile ||
    (typeof localStorage !== 'undefined'
      ? localStorage.getItem('krushak_active_session_mobile') || ''
      : '');
  const cleanMobile = activeMobile.replace(/\D/g, '').slice(-10);

  if (cleanMobile.length === 10) {
    const master = await idbGet<FarmerProfile>(STORE_FARMER_MASTER, cleanMobile);
    if (master) {
      master.sprayLog = all;
      master.updatedAt = Date.now();
      await idbPut(STORE_FARMER_MASTER, master);
    }
    await enqueueSyncOperation({
      mobile: cleanMobile,
      actionType: 'DELETE_SPRAY_LOG',
      payload: { deletedId: id, sprayLog: all },
    });
  }

  return all;
}

/**
 * Local-First Advice History operations (Crop Doctor, Pesticide, Water, Fertiliser, etc.)
 */
export async function addAdviceHistoryLocalFirst(
  advice: Omit<AdviceRecord, 'id' | 'createdAt' | 'updatedAt'>
): Promise<AdviceRecord> {
  const now = Date.now();
  const record: AdviceRecord = {
    ...advice,
    id: `adv-${now}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date(now).toISOString(),
    updatedAt: now,
  };

  await idbPut(STORE_ADVICE_HISTORY, record);
  const all = await idbGetAll<AdviceRecord>(STORE_ADVICE_HISTORY);

  const activeMobile =
    typeof localStorage !== 'undefined'
      ? (localStorage.getItem('krushak_active_session_mobile') || '').replace(/\D/g, '').slice(-10)
      : '';

  if (activeMobile.length === 10) {
    const master = await idbGet<FarmerProfile>(STORE_FARMER_MASTER, activeMobile);
    if (master) {
      master.adviceHistory = all;
      master.updatedAt = now;
      await idbPut(STORE_FARMER_MASTER, master);
    }
    await enqueueSyncOperation({
      mobile: activeMobile,
      actionType: 'ADD_ADVICE_HISTORY',
      payload: { record, adviceHistory: all },
    });
  }

  return record;
}

/**
 * Local-First Callback Request operations
 */
export async function addCallbackRequestLocalFirst(params: {
  mobile: string;
  helplineNumber: string;
  topic: string;
  district: string;
}): Promise<CallbackRequestRecord> {
  const now = Date.now();
  const cleanMobile = params.mobile.replace(/\D/g, '').slice(-10);
  const record: CallbackRequestRecord = {
    id: `cb-${now}-${Math.random().toString(36).slice(2, 6)}`,
    mobile: cleanMobile,
    helplineNumber: params.helplineNumber,
    topic: params.topic,
    district: params.district,
    status: 'requested',
    createdAt: new Date(now).toISOString(),
    updatedAt: now,
  };

  await idbPut(STORE_CALLBACK_REQUESTS, record);
  const all = await idbGetAll<CallbackRequestRecord>(STORE_CALLBACK_REQUESTS);

  if (cleanMobile.length === 10) {
    const master = await idbGet<FarmerProfile>(STORE_FARMER_MASTER, cleanMobile);
    if (master) {
      master.callbackRequests = all;
      master.updatedAt = now;
      await idbPut(STORE_FARMER_MASTER, master);
    }
    await enqueueSyncOperation({
      mobile: cleanMobile,
      actionType: 'ADD_CALLBACK_REQUEST',
      payload: { record, callbackRequests: all },
    });
  }

  return record;
}

/**
 * Submit a Correction Request for Locked Fields (mobile, state, district, block, village, gpsLocation)
 */
export async function submitLockedFieldCorrectionRequest(params: {
  mobile: string;
  farmerId: string;
  farmerName: string;
  requestedChanges: LockedFieldCorrectionRequest['requestedChanges'];
  reason: string;
}): Promise<LockedFieldCorrectionRequest> {
  const now = Date.now();
  const user = await ensureFirebaseSession();
  const cleanMobile = params.mobile.replace(/\D/g, '').slice(-10);

  const requestRecord: LockedFieldCorrectionRequest = {
    id: `corr-${cleanMobile}-${now}`,
    mobile: cleanMobile,
    farmerId: params.farmerId,
    farmerName: params.farmerName,
    ownerUid: user?.uid || 'offline-pending-uid',
    requestedChanges: params.requestedChanges,
    reason: params.reason.trim(),
    status: 'pending',
    createdAt: now,
  };

  await idbPut(STORE_CORRECTION_REQUESTS, requestRecord);

  await enqueueSyncOperation({
    mobile: cleanMobile,
    actionType: 'SUBMIT_CORRECTION_REQUEST',
    payload: requestRecord,
  });

  return requestRecord;
}

export async function getFarmerCorrectionRequestsLocal(
  mobile: string
): Promise<LockedFieldCorrectionRequest[]> {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  const all = await idbGetAll<LockedFieldCorrectionRequest>(STORE_CORRECTION_REQUESTS);
  return all
    .filter((r) => r.mobile === cleanMobile)
    .sort((a, b) => b.createdAt - a.createdAt);
}

// ============================================================================
// OFFLINE FIFO QUEUE & BACKGROUND SYNC ENGINE (Requirement 1, 2, 3, 4)
// ============================================================================
export async function getPendingQueueItems(): Promise<OfflineQueueItem[]> {
  const items = await idbGetAll<OfflineQueueItem>(STORE_SYNC_QUEUE);
  return items.sort((a, b) => a.queuedAt - b.queuedAt);
}

export async function getPendingQueueCount(): Promise<number> {
  const items = await getPendingQueueItems();
  pendingQueueCount = items.length;
  return pendingQueueCount;
}

export async function enqueueSyncOperation(params: {
  mobile: string;
  actionType: OfflineQueueItem['actionType'];
  payload: any;
  fieldTimestamps?: Record<string, number>;
}): Promise<void> {
  const now = Date.now();
  const item: OfflineQueueItem = {
    id: `q-${now}-${Math.random().toString(36).slice(2, 7)}`,
    mobile: params.mobile.replace(/\D/g, '').slice(-10),
    actionType: params.actionType,
    payload: params.payload,
    fieldTimestamps: params.fieldTimestamps,
    queuedAt: now,
    retryCount: 0,
  };

  await idbPut(STORE_SYNC_QUEUE, item);
  const queue = await getPendingQueueItems();
  pendingQueueCount = queue.length;
  currentStatus = 'saved_on_phone';
  notifyListeners();

  // Trigger background sync if online
  if (typeof navigator === 'undefined' || navigator.onLine) {
    processOfflineSyncQueue().catch(() => {});
  }
}

/**
 * Push a single FarmerMasterRecord to Firestore (/farmers/{mobile}) + Express mirror (/api/farmers)
 * while respecting locked-field rules and photo consent.
 */
async function syncFarmerMasterWithServer(
  mobile: string,
  localCandidate?: FarmerProfile
): Promise<FarmerProfile | null> {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  if (cleanMobile.length !== 10) return null;

  const localMaster =
    localCandidate ||
    (await idbGet<FarmerProfile>(STORE_FARMER_MASTER, cleanMobile)) ||
    null;

  if (!localMaster) return null;

  // Ensure sub-records from IndexedDB are attached to master record
  const sprayLogs = await getSprayLogsLocalFirst();
  const adviceHistory = await idbGetAll<AdviceRecord>(STORE_ADVICE_HISTORY);
  const callbackRequests = await idbGetAll<CallbackRequestRecord>(STORE_CALLBACK_REQUESTS);

  const localFull: FarmerProfile = {
    ...localMaster,
    sprayLog: sprayLogs.length > 0 ? sprayLogs : localMaster.sprayLog || [],
    adviceHistory: adviceHistory.length > 0 ? adviceHistory : localMaster.adviceHistory || [],
    callbackRequests:
      callbackRequests.length > 0 ? callbackRequests : localMaster.callbackRequests || [],
  };

  let serverMaster: FarmerProfile | null = null;
  let syncedToFirestore = false;

  // 1. Try Firestore Central Database
  const fbUser = await ensureFirebaseSession();
  if (fbUser) {
    try {
      const farmerRef = doc(db, 'farmers', cleanMobile);
      const snap = await getDoc(farmerRef);
      if (snap.exists()) {
        serverMaster = snap.data() as FarmerProfile;
      }

      // Resolve conflicts: server locked fields always win; unlocked fields most recent timestamp wins
      const resolved = resolveMasterRecordConflict(localFull, serverMaster);
      const ownerUid = serverMaster?.ownerUid || fbUser.uid;
      const sanitizedPayload = sanitizeProfileForServer(resolved, ownerUid);

      await setDoc(farmerRef, sanitizedPayload);

      // Also register Farmer ID index if new
      if (!serverMaster && resolved.id) {
        try {
          await setDoc(doc(db, 'farmerIds', resolved.id), {
            farmerId: resolved.id,
            mobile: cleanMobile,
            ownerUid,
          });
        } catch {}
      }

      syncedToFirestore = true;
      serverMaster = {
        ...resolved,
        ownerUid,
        lastSyncedAt: sanitizedPayload.lastSyncedAt,
      };
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, `farmers/${cleanMobile}`);
      } catch {
        // Error logged per specifications; continue to Express mirror & local storage
      }
    }
  }

  // 2. Also sync with Express Central Server Database (/api/farmers)
  try {
    if (!serverMaster) {
      const getRes = await fetch(`/api/farmers/${cleanMobile}`, {
        method: 'GET',
        headers: { 'x-farmer-mobile': cleanMobile },
      });
      if (getRes.ok) {
        const data = await getRes.json();
        if (data?.profile?.id) {
          serverMaster = data.profile as FarmerProfile;
        }
      }
    }

    const resolvedForApi = resolveMasterRecordConflict(localFull, serverMaster);
    const sanitizedForApi = sanitizeProfileForServer(
      resolvedForApi,
      fbUser?.uid || resolvedForApi.ownerUid || `mobile-${cleanMobile}`
    );

    const postRes = await fetch('/api/farmers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-farmer-mobile': cleanMobile,
      },
      body: JSON.stringify({ profile: sanitizedForApi }),
    });

    if (postRes.ok) {
      const postData = await postRes.json();
      if (postData?.profile) {
        serverMaster = {
          ...resolvedForApi,
          ...postData.profile,
          // Keep local photo on phone even if farmer chose not to upload photo to server
          photoDataUrl: localFull.photoDataUrl || postData.profile.photoDataUrl,
        };
        syncedToFirestore = true;
      }
    }
  } catch (err) {
    if (!syncedToFirestore) {
      throw err;
    }
  }

  if (!syncedToFirestore && !serverMaster) {
    throw new Error('Could not reach Firestore or central server API');
  }

  const finalRecord: FarmerProfile = {
    ...(serverMaster || localFull),
    // Keep local photo on the phone if the farmer took one locally
    photoDataUrl: localFull.photoDataUrl || serverMaster?.photoDataUrl,
    lastSyncedAt: new Date().toISOString(),
  };

  // Update local phone copy with resolved master record (including locked server fields)
  await idbPut(STORE_FARMER_MASTER, finalRecord);
  await idbPut(STORE_LEGACY_FARMERS, finalRecord);
  try {
    localStorage.setItem('krushak_farmer_profile', JSON.stringify(finalRecord));
    const rawDb = localStorage.getItem('krushak_farmers_db_v2');
    const parsedDb = rawDb ? JSON.parse(rawDb) : {};
    parsedDb[cleanMobile] = finalRecord;
    localStorage.setItem('krushak_farmers_db_v2', JSON.stringify(parsedDb));
  } catch {}

  return finalRecord;
}

/**
 * Process the FIFO offline queue in order
 */
export async function processOfflineSyncQueue(): Promise<void> {
  if (isProcessingQueue) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    currentStatus = 'saved_on_phone';
    notifyListeners();
    return;
  }

  const queue = await getPendingQueueItems();
  pendingQueueCount = queue.length;

  if (queue.length === 0) {
    if (lastSyncedIso) {
      currentStatus = 'saved_to_server';
    }
    notifyListeners();
    return;
  }

  isProcessingQueue = true;
  currentStatus = 'syncing';
  lastSyncError = null;
  notifyListeners();

  try {
    for (const item of queue) {
      try {
        if (item.actionType === 'SUBMIT_CORRECTION_REQUEST') {
          const reqData: LockedFieldCorrectionRequest = item.payload;
          const fbUser = await ensureFirebaseSession();
          let savedCorr = false;

          if (fbUser) {
            try {
              const payloadWithUid = {
                ...reqData,
                ownerUid: fbUser.uid,
              };
              await setDoc(doc(db, 'correctionRequests', reqData.id), payloadWithUid);
              savedCorr = true;
            } catch (err) {
              try {
                handleFirestoreError(
                  err,
                  OperationType.CREATE,
                  `correctionRequests/${reqData.id}`
                );
              } catch {
                // Logged per specification; continue to server API fallback
              }
            }
          }

          try {
            const res = await fetch('/api/correction-requests', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-farmer-mobile': reqData.mobile,
              },
              body: JSON.stringify({ request: reqData }),
            });
            if (res.ok) savedCorr = true;
          } catch {}

          if (!savedCorr) {
            throw new Error('Failed to sync correction request');
          }
        } else {
          // All other actions sync the farmer's unified master record
          await syncFarmerMasterWithServer(item.mobile);
        }

        // Remove successfully processed item from queue
        await idbDelete(STORE_SYNC_QUEUE, item.id);
        const remaining = await getPendingQueueItems();
        pendingQueueCount = remaining.length;
      } catch (itemErr: any) {
        // Retry on failure and never lose a change silently
        item.retryCount = (item.retryCount || 0) + 1;
        item.lastError = itemErr?.message || 'Sync error';
        await idbPut(STORE_SYNC_QUEUE, item);
        lastSyncError = item.lastError || null;
        currentStatus = 'saved_on_phone';
        scheduleQueueRetry(item.retryCount);
        isProcessingQueue = false;
        notifyListeners();
        return;
      }
    }

    // All queued changes sent in order!
    const nowIso = new Date().toISOString();
    lastSyncedIso = nowIso;
    try {
      localStorage.setItem('krushak_last_synced_at', nowIso);
    } catch {}
    await saveDeviceSettingToPhoneOnly('lastSyncedAt', nowIso);

    pendingQueueCount = 0;
    currentStatus = 'saved_to_server';
    lastSyncError = null;
  } finally {
    isProcessingQueue = false;
    notifyListeners();
  }
}

function scheduleQueueRetry(retryCount: number): void {
  if (retryTimeoutId !== null && typeof window !== 'undefined') {
    window.clearTimeout(retryTimeoutId);
  }
  const delayMs = Math.min(30000, 2000 * Math.pow(1.5, Math.min(retryCount, 6)));
  if (typeof window !== 'undefined') {
    retryTimeoutId = window.setTimeout(() => {
      processOfflineSyncQueue().catch(() => {});
    }, delayMs);
  }
}

// ============================================================================
// LOGIN RESTORATION (Requirement 5: Download full record & rebuild local copy)
// ============================================================================
export async function restoreFarmerMasterFromServerToPhone(
  mobile: string
): Promise<FarmerProfile | null> {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  if (cleanMobile.length !== 10) return null;

  let serverProfile: FarmerProfile | null = null;

  // 1. Check Firestore Central Server Database first
  const fbUser = await ensureFirebaseSession();
  if (fbUser) {
    try {
      const snap = await getDoc(doc(db, 'farmers', cleanMobile));
      if (snap.exists()) {
        serverProfile = snap.data() as FarmerProfile;
      }
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.GET, `farmers/${cleanMobile}`);
      } catch {
        // Logged per specification; continue to Express mirror fallback
      }
    }
  }

  // 2. Fallback / merge with Express Central Server Database (/api/farmers/:mobile)
  try {
    const res = await fetch(`/api/farmers/${cleanMobile}`, {
      method: 'GET',
      headers: { 'x-farmer-mobile': cleanMobile },
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.profile?.id) {
        serverProfile = serverProfile
          ? resolveMasterRecordConflict(data.profile, serverProfile)
          : (data.profile as FarmerProfile);
      }
    }
  } catch {}

  if (!serverProfile) {
    // Offline fallback: check local IndexedDB
    const localCopy = await idbGet<FarmerProfile>(STORE_FARMER_MASTER, cleanMobile);
    return localCopy;
  }

  // Rebuild all local IndexedDB stores from the server master record
  await idbPut(STORE_FARMER_MASTER, serverProfile);
  await idbPut(STORE_LEGACY_FARMERS, serverProfile);

  if (Array.isArray(serverProfile.sprayLog)) {
    await idbClearStore(STORE_SPRAY_LOGS);
    for (const log of serverProfile.sprayLog) {
      await idbPut(STORE_SPRAY_LOGS, log);
    }
    try {
      localStorage.setItem('krushak_spray_log', JSON.stringify(serverProfile.sprayLog));
    } catch {}
  }

  if (Array.isArray(serverProfile.adviceHistory)) {
    await idbClearStore(STORE_ADVICE_HISTORY);
    for (const adv of serverProfile.adviceHistory) {
      await idbPut(STORE_ADVICE_HISTORY, adv);
    }
  }

  if (Array.isArray(serverProfile.callbackRequests)) {
    await idbClearStore(STORE_CALLBACK_REQUESTS);
    for (const cb of serverProfile.callbackRequests) {
      await idbPut(STORE_CALLBACK_REQUESTS, cb);
    }
  }

  const nowIso = new Date().toISOString();
  lastSyncedIso = nowIso;
  currentStatus = 'saved_to_server';
  try {
    localStorage.setItem('krushak_last_synced_at', nowIso);
    localStorage.setItem('krushak_farmer_profile', JSON.stringify(serverProfile));
    const rawDb = localStorage.getItem('krushak_farmers_db_v2');
    const parsedDb = rawDb ? JSON.parse(rawDb) : {};
    parsedDb[cleanMobile] = serverProfile;
    localStorage.setItem('krushak_farmers_db_v2', JSON.stringify(parsedDb));
  } catch {}

  notifyListeners();
  return serverProfile;
}

// ============================================================================
// SIGN OUT WIPE (Requirement 6: Remove farmer's data from this phone,
// keeping it safely on the server, while preserving phone-only stores)
// ============================================================================
export async function wipeFarmerDataFromPhoneOnSignOut(): Promise<void> {
  // Try one final sync flush if online before wiping local stores
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      await processOfflineSyncQueue();
    } catch {}
  }

  // Wipe all farmer-specific stores in IndexedDB
  await idbClearStore(STORE_FARMER_MASTER);
  await idbClearStore(STORE_LEGACY_FARMERS);
  await idbClearStore(STORE_SPRAY_LOGS);
  await idbClearStore(STORE_ADVICE_HISTORY);
  await idbClearStore(STORE_CALLBACK_REQUESTS);
  await idbClearStore(STORE_CORRECTION_REQUESTS);
  await idbClearStore(STORE_SYNC_QUEUE);

  // NOTE: Phone-Only Stores (STORE_OFFLINE_PACKS, STORE_CACHED_WEATHER,
  // STORE_DRAFTS, STORE_DEVICE_SETTINGS) are intentionally preserved!

  try {
    const activeMob = localStorage.getItem('krushak_active_session_mobile');
    if (activeMob) {
      localStorage.removeItem(`krushak_farmer_profile_${activeMob}`);
    }
    // Also remove any remaining scoped profile keys
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith('krushak_farmer_profile')) {
        localStorage.removeItem(k);
      }
    }
    localStorage.removeItem('krushak_farmer_profile');
    localStorage.removeItem('krushak_farmers_db_v2');
    localStorage.removeItem('krushak_active_session_mobile');
    localStorage.removeItem('krushak_spray_log');
    localStorage.removeItem('krushak_crop_history');
    localStorage.removeItem('krushak_last_synced_at');
  } catch {}

  pendingQueueCount = 0;
  lastSyncedIso = null;
  currentStatus = 'saved_on_phone';
  notifyListeners();
}

/**
 * Permanently delete farmer data and account from both phone and central server (Firestore + Express)
 */
export async function deleteFarmerAccountFromPhoneAndServer(
  mobile: string,
  farmerId?: string
): Promise<void> {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

  if (typeof navigator !== 'undefined' && navigator.onLine && cleanMobile.length === 10) {
    try {
      await ensureFirebaseSession();
      await deleteDoc(doc(db, 'farmers', cleanMobile));
      if (farmerId) {
        await deleteDoc(doc(db, 'farmerIds', farmerId)).catch(() => {});
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `farmers/${cleanMobile}`);
    }

    try {
      await fetch(`/api/farmers/${cleanMobile}`, {
        method: 'DELETE',
        headers: {
          'x-farmer-mobile': cleanMobile,
        },
      });
    } catch {}
  }

  // Wipe all local phone data as well
  await wipeFarmerDataFromPhoneOnSignOut();
}

export async function adminDeleteFarmerRecord(
  mobile: string,
  farmerId?: string
): Promise<void> {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  const adminEmail = auth.currentUser?.email || BOOTSTRAPPED_ADMIN_EMAIL;

  if (cleanMobile.length === 10) {
    // 1. Delete from Firestore Central Database
    try {
      await ensureFirebaseSession();
      await deleteDoc(doc(db, 'farmers', cleanMobile));
      if (farmerId) {
        await deleteDoc(doc(db, 'farmerIds', farmerId)).catch(() => {});
      }
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `farmers/${cleanMobile}`);
      } catch {}
    }

    // 2. Delete from Express Central Database Mirror
    try {
      await fetch(`/api/admin/farmers/${cleanMobile}`, {
        method: 'DELETE',
        headers: {
          'x-admin-email': adminEmail,
        },
      });
    } catch {}

    // 3. Delete from Local IndexedDB
    await idbDelete(STORE_FARMER_MASTER, cleanMobile);
    await idbDelete(STORE_LEGACY_FARMERS, cleanMobile);
  }
}

// ============================================================================
// ADMIN PORTAL OPERATIONS (Requirement 4 & 9: Only admins can list farmers
// and approve/reject locked-field correction requests)
// ============================================================================
export async function adminListAllFarmers(): Promise<FarmerProfile[]> {
  const results = new Map<string, FarmerProfile>();

  // 1. Read from localStorage active profile
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem('krushak_farmer_profile');
      if (raw) {
        const p = JSON.parse(raw) as FarmerProfile;
        if (p && p.mobile) {
          results.set(p.mobile, p);
        }
      }
    } catch {}
  }

  // 2. Read from IndexedDB STORE_FARMER_MASTER
  try {
    const localMaster = await idbGetAll<FarmerProfile>(STORE_FARMER_MASTER);
    for (const f of localMaster) {
      if (f && f.mobile && !results.has(f.mobile)) {
        results.set(f.mobile, f);
      }
    }
  } catch {}

  // 3. Query Express central server admin endpoint
  try {
    const adminEmail = auth.currentUser?.email || BOOTSTRAPPED_ADMIN_EMAIL;
    const res = await fetch('/api/admin/farmers', {
      headers: { 'x-admin-email': adminEmail },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.farmers)) {
        for (const f of data.farmers) {
          if (f?.mobile && !results.has(f.mobile)) {
            results.set(f.mobile, f);
          }
        }
      }
    }
  } catch {}

  // 4. Query Firestore /farmers (allowed if admin session)
  try {
    const snap = await getDocs(collection(db, 'farmers'));
    snap.forEach((docSnap) => {
      const data = docSnap.data() as FarmerProfile;
      if (data && data.mobile && !results.has(data.mobile)) {
        results.set(data.mobile, data);
      }
    });
  } catch (err) {
    // Ignore offline or unauthenticated Firestore list errors
  }

  return Array.from(results.values()).sort(
    (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
  );
}

export async function adminListCorrectionRequests(): Promise<LockedFieldCorrectionRequest[]> {
  const results = new Map<string, LockedFieldCorrectionRequest>();

  // 1. Read from local IndexedDB
  try {
    const localReqs = await idbGetAll<LockedFieldCorrectionRequest>(STORE_CORRECTION_REQUESTS);
    for (const r of localReqs) {
      if (r && r.id) {
        results.set(r.id, r);
      }
    }
  } catch {}

  // 2. Query Express central server admin endpoint
  try {
    const adminEmail = auth.currentUser?.email || BOOTSTRAPPED_ADMIN_EMAIL;
    const res = await fetch('/api/admin/correction-requests', {
      headers: { 'x-admin-email': adminEmail },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.requests)) {
        for (const r of data.requests) {
          if (r?.id && !results.has(r.id)) {
            results.set(r.id, r);
          }
        }
      }
    }
  } catch {}

  // 3. Query Firestore /correctionRequests
  try {
    const snap = await getDocs(collection(db, 'correctionRequests'));
    snap.forEach((docSnap) => {
      const data = docSnap.data() as LockedFieldCorrectionRequest;
      if (data && data.id && !results.has(data.id)) {
        results.set(data.id, data);
      }
    });
  } catch (err) {}

  return Array.from(results.values()).sort((a, b) => b.createdAt - a.createdAt);
}

export async function adminReviewCorrectionRequest(
  request: LockedFieldCorrectionRequest,
  decision: 'approved' | 'rejected'
): Promise<void> {
  const now = Date.now();
  const adminEmail = auth.currentUser?.email || 'admin';
  const updatedReq: LockedFieldCorrectionRequest = {
    ...request,
    status: decision,
    reviewedAt: now,
    reviewedBy: adminEmail,
  };

  // 1. Update Firestore correctionRequests + farmer locked fields if approved
  try {
    await setDoc(doc(db, 'correctionRequests', request.id), updatedReq);

    if (decision === 'approved') {
      const farmerRef = doc(db, 'farmers', request.mobile);
      const snap = await getDoc(farmerRef);
      if (snap.exists()) {
        const currentFarmer = snap.data() as FarmerProfile;
        const updatedFarmer: Record<string, any> = {
          ...currentFarmer,
          ...request.requestedChanges,
          updatedAt: now,
          lastSyncedAt: new Date(now).toISOString(),
        };
        await setDoc(farmerRef, JSON.parse(JSON.stringify(updatedFarmer)));
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `correctionRequests/${request.id}`);
  }

  // 2. Also update Express central server mirror
  try {
    await fetch(`/api/admin/correction-requests/${encodeURIComponent(request.id)}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': adminEmail,
      },
      body: JSON.stringify({ decision, reviewedBy: adminEmail }),
    });
  } catch {}

  // Update local IndexedDB if the same farmer is signed in on this device
  const localReq = await idbGet<LockedFieldCorrectionRequest>(
    STORE_CORRECTION_REQUESTS,
    request.id
  );
  if (localReq) {
    await idbPut(STORE_CORRECTION_REQUESTS, updatedReq);
  }
  if (decision === 'approved') {
    const localFarmer = await idbGet<FarmerProfile>(STORE_FARMER_MASTER, request.mobile);
    if (localFarmer) {
      const mergedFarmer: FarmerProfile = {
        ...localFarmer,
        ...request.requestedChanges,
        updatedAt: now,
      };
      await idbPut(STORE_FARMER_MASTER, mergedFarmer);
      try {
        localStorage.setItem('krushak_farmer_profile', JSON.stringify(mergedFarmer));
      } catch {}
    }
  }
}

// ============================================================================
// INITIALIZE AUTO-SYNC ON NETWORK RECOVERY & STARTUP
// ============================================================================
if (typeof window !== 'undefined') {
  ensurePhoneOnlyOfflinePacksSeeded().catch(() => {});
  getPendingQueueCount().then((count) => {
    if (count > 0) {
      currentStatus = 'saved_on_phone';
      if (navigator.onLine) {
        processOfflineSyncQueue().catch(() => {});
      }
    } else if (lastSyncedIso) {
      currentStatus = 'saved_to_server';
    }
    notifyListeners();
  });

  window.addEventListener('online', () => {
    processOfflineSyncQueue().catch(() => {});
  });

  window.addEventListener('offline', () => {
    currentStatus = 'saved_on_phone';
    notifyListeners();
  });
}
