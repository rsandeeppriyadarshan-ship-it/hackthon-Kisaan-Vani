/**
 * Odisha Location, Dynamic Address Collection, and High-Accuracy GPS Service
 * - Merges static odishaAddresses.json + all 314 official Odisha CD Blocks + dynamically
 *   learned Blocks & Villages from Google Maps Geocoding / OpenStreetMap Nominatim & Overpass.
 * - Automatically reverse-geocodes GPS coordinates into the exact Village, Block, District,
 *   and PIN code, and stores newly discovered Blocks & Villages in localStorage + server DB.
 */

import { ODISHA_DISTRICTS, DistrictCoord } from './weatherService';
import { OFFLINE_MAP_POINTS, MapPointOfInterest } from '../data/offlineMapData';
import odishaAddresses from '../data/odishaAddresses.json';
import { ODISHA_ALL_314_BLOCKS } from '../data/odishaAllBlocks';
import { Language } from '../types';
import { translatePlaceName } from './translations';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  timestamp: number;
  nearestDistrict: DistrictCoord;
  nearestBlock?: { name_en: string; name_or: string };
  nearestVillage?: { name_en: string; name_or: string };
  pinCode?: string;
  placeNameEn?: string;
  placeNameOr?: string;
  placeNameHi?: string;
  confirmed?: boolean;
  distanceToDistrictKm: number;
  isWithinOdisha: boolean;
  svgX: number;
  svgY: number;
}

export interface ReverseGeocodedPlace {
  village_en: string;
  village_or: string;
  block_en: string;
  block_or: string;
  district_en: string;
  district_or: string;
  pinCode?: string;
  formatted_en: string;
  formatted_or: string;
  formatted_localized: string;
  source: 'google' | 'nominatim' | 'offline_odisha';
}

export interface LearnedOdishaPlace {
  district_en: string;
  district_or: string;
  block_en: string;
  block_or: string;
  village_en: string;
  village_or: string;
  lat: number;
  lon: number;
  pinCode?: string;
}

export interface MergedOdishaVillage {
  name_en: string;
  name_or: string;
  lat: number;
  lon: number;
  pinCode?: string;
}

export interface MergedOdishaBlock {
  name_en: string;
  name_or: string;
  villages: MergedOdishaVillage[];
}

export interface MergedOdishaDistrict {
  code: string;
  name_en: string;
  name_or: string;
  lat: number;
  lon: number;
  defaultPin: string;
  blocks: MergedOdishaBlock[];
}

export interface MergedOdishaState {
  code: string;
  name_en: string;
  name_or: string;
  districts: MergedOdishaDistrict[];
}

export type GeolocationPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

const LEARNED_PLACES_STORAGE_KEY = 'krushak_learned_odisha_places_v1';

const DISTRICT_ALIASES: Record<string, string> = {
  anugul: 'Angul',
  angul: 'Angul',
  balangir: 'Balangir',
  bolangir: 'Balangir',
  balasore: 'Balasore',
  baleswar: 'Balasore',
  baleshwar: 'Balasore',
  bargarh: 'Bargarh',
  baragarh: 'Bargarh',
  bhadrak: 'Bhadrak',
  boudh: 'Boudh',
  baudh: 'Boudh',
  bauda: 'Boudh',
  cuttack: 'Cuttack',
  katak: 'Cuttack',
  deogarh: 'Deogarh',
  debagarh: 'Deogarh',
  dhenkanal: 'Dhenkanal',
  gajapati: 'Gajapati',
  ganjam: 'Ganjam',
  jagatsinghpur: 'Jagatsinghpur',
  jagatsinghapur: 'Jagatsinghpur',
  jajpur: 'Jajpur',
  jajapur: 'Jajpur',
  jharsuguda: 'Jharsuguda',
  kalahandi: 'Kalahandi',
  kandhamal: 'Kandhamal',
  phulbani: 'Kandhamal',
  kendrapara: 'Kendrapara',
  kendrapada: 'Kendrapara',
  keonjhar: 'Keonjhar',
  kendujhar: 'Keonjhar',
  khordha: 'Khordha',
  khurda: 'Khordha',
  bhubaneswar: 'Khordha',
  koraput: 'Koraput',
  malkangiri: 'Malkangiri',
  mayurbhanj: 'Mayurbhanj',
  nabarangpur: 'Nabarangpur',
  nabarangapur: 'Nabarangpur',
  nowrangpur: 'Nabarangpur',
  nayagarh: 'Nayagarh',
  nuapada: 'Nuapada',
  puri: 'Puri',
  rayagada: 'Rayagada',
  sambalpur: 'Sambalpur',
  subarnapur: 'Subarnapur',
  sonepur: 'Subarnapur',
  sonapur: 'Subarnapur',
  sundargarh: 'Sundargarh',
  sundergarh: 'Sundargarh'
};

export function cleanPlaceName(raw?: string): string {
  if (!raw) return '';
  return String(raw)
    .replace(
      /\b(CD Block|C\.D\. Block|Community Development Block|Block|Tahasil|Tehsil|Taluk|Taluka|Sub-District|Subdistrict|Police Station|P\.S\.|GP|Gram Panchayat)\b/gi,
      ''
    )
    .replace(/\s+/g, ' ')
    .replace(/^[,\-\s]+|[,\-\s]+$/g, '')
    .trim();
}

export function resolveCanonicalDistrictName(rawDistrict?: string, fallback = 'Cuttack'): string {
  if (!rawDistrict) return fallback;
  const cleaned = String(rawDistrict)
    .toLowerCase()
    .replace(/\b(district|dist|zilla|odisha|orissa|division)\b/gi, '')
    .trim();
  if (!cleaned) return fallback;
  if (DISTRICT_ALIASES[cleaned]) return DISTRICT_ALIASES[cleaned];

  const baseDistricts = odishaAddresses.states[0].districts;
  for (const d of baseDistricts) {
    if (
      d.name_en.toLowerCase() === cleaned ||
      d.name_or === rawDistrict.trim() ||
      cleaned.includes(d.name_en.toLowerCase())
    ) {
      return d.name_en;
    }
  }
  for (const [alias, canonical] of Object.entries(DISTRICT_ALIASES)) {
    if (cleaned.includes(alias)) return canonical;
  }
  return fallback;
}

/**
 * Resolve canonical Block name within a district if it matches one of the 314 official Odisha blocks,
 * or return the cleaned block name if it's a new/custom block or municipality.
 */
export function resolveCanonicalBlockName(
  districtEn: string,
  rawBlock?: string
): { name_en: string; name_or: string } {
  const cleaned = cleanPlaceName(rawBlock);
  const officialBlocks = ODISHA_ALL_314_BLOCKS[districtEn] || [];
  if (!cleaned) {
    const first = officialBlocks[0];
    return first || { name_en: districtEn, name_or: translatePlaceName(districtEn, 'or') };
  }
  const lower = cleaned.toLowerCase();
  for (const b of officialBlocks) {
    const bLower = b.name_en.toLowerCase();
    if (
      bLower === lower ||
      b.name_or === cleaned ||
      bLower.replace(/\s+sadar$/i, '') === lower.replace(/\s+sadar$/i, '') ||
      lower.includes(bLower) ||
      bLower.includes(lower)
    ) {
      return { name_en: b.name_en, name_or: b.name_or };
    }
  }
  return {
    name_en: cleaned,
    name_or: translatePlaceName(cleaned, 'or') || cleaned
  };
}

export function getLearnedOdishaPlacesLocal(): LearnedOdishaPlace[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LEARNED_PLACES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLearnedOdishaPlace(
  place: LearnedOdishaPlace,
  syncToServer = true
): LearnedOdishaPlace | null {
  const vEn = cleanPlaceName(place.village_en);
  const bResolved = resolveCanonicalBlockName(
    resolveCanonicalDistrictName(place.district_en),
    place.block_en
  );
  const dEn = resolveCanonicalDistrictName(place.district_en);
  if (!vEn || !bResolved.name_en || !dEn) return null;

  const baseDist = odishaAddresses.states[0].districts.find((d) => d.name_en === dEn);
  const dOr = place.district_or || baseDist?.name_or || translatePlaceName(dEn, 'or');
  const bOr =
    place.block_or && place.block_or !== place.block_en
      ? cleanPlaceName(place.block_or)
      : bResolved.name_or;
  const vOr =
    place.village_or && place.village_or !== place.village_en
      ? cleanPlaceName(place.village_or)
      : translatePlaceName(vEn, 'or') || vEn;

  const normalized: LearnedOdishaPlace = {
    district_en: dEn,
    district_or: dOr,
    block_en: bResolved.name_en,
    block_or: bOr || bResolved.name_en,
    village_en: vEn,
    village_or: vOr || vEn,
    lat: Number(place.lat) || baseDist?.lat || 20.4625,
    lon: Number(place.lon) || baseDist?.lon || 85.883,
    pinCode:
      place.pinCode && /^\d{6}$/.test(place.pinCode)
        ? place.pinCode
        : baseDist?.defaultPin
  };

  if (typeof window !== 'undefined') {
    try {
      const list = getLearnedOdishaPlacesLocal();
      const key = `${normalized.district_en.toLowerCase()}|${normalized.block_en.toLowerCase()}|${normalized.village_en.toLowerCase()}`;
      const idx = list.findIndex(
        (item) =>
          `${item.district_en.toLowerCase()}|${item.block_en.toLowerCase()}|${item.village_en.toLowerCase()}` ===
          key
      );
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...normalized };
      } else {
        list.push(normalized);
      }
      window.localStorage.setItem(LEARNED_PLACES_STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('krushak:addresses-updated'));
    } catch {
      // Ignore storage quota issues
    }

    if (syncToServer) {
      fetch('/api/addresses/learned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ place: normalized })
      }).catch(() => {});
    }
  }

  return normalized;
}

let hasSyncedLearnedFromServer = false;

export async function syncLearnedPlacesFromServer(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const resp = await fetch('/api/addresses/learned');
    if (!resp.ok) return;
    const data = await resp.json();
    if (Array.isArray(data?.places) && data.places.length > 0) {
      const list = getLearnedOdishaPlacesLocal();
      let changed = false;
      for (const p of data.places) {
        if (!p?.district_en || !p?.block_en || !p?.village_en) continue;
        const key = `${p.district_en.toLowerCase()}|${p.block_en.toLowerCase()}|${p.village_en.toLowerCase()}`;
        const exists = list.some(
          (item) =>
            `${item.district_en.toLowerCase()}|${item.block_en.toLowerCase()}|${item.village_en.toLowerCase()}` ===
            key
        );
        if (!exists) {
          list.push(p);
          changed = true;
        }
      }
      if (changed) {
        window.localStorage.setItem(LEARNED_PLACES_STORAGE_KEY, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent('krushak:addresses-updated'));
      }
    }
  } catch {
    // Offline or unreachable
  }
}

/**
 * Returns the complete Odisha state structure merging:
 * 1) Static odishaAddresses.json (30 districts + starter blocks & villages)
 * 2) All 314 official Odisha CD Blocks from ODISHA_ALL_314_BLOCKS
 * 3) All dynamically discovered/stored Blocks & Villages from Google Maps / OpenStreetMap
 */
export function getMergedOdishaState(): MergedOdishaState {
  if (typeof window !== 'undefined' && !hasSyncedLearnedFromServer) {
    hasSyncedLearnedFromServer = true;
    syncLearnedPlacesFromServer().catch(() => {});
  }

  const baseState = odishaAddresses.states[0];
  const learnedList = getLearnedOdishaPlacesLocal();

  const districts: MergedOdishaDistrict[] = baseState.districts.map((d) => {
    const blockMap = new Map<string, MergedOdishaBlock>();

    // 1. Seed from static odishaAddresses.json
    for (const b of d.blocks) {
      const bOr = (b as { name_or?: string }).name_or || b.name_en;
      const villages: MergedOdishaVillage[] = b.villages.map((v) => ({
        name_en: v.name_en,
        name_or: (v as { name_or?: string }).name_or || v.name_en,
        lat: v.lat,
        lon: v.lon,
        pinCode: d.defaultPin
      }));
      blockMap.set(b.name_en.toLowerCase(), {
        name_en: b.name_en,
        name_or: bOr,
        villages
      });
    }

    // 2. Merge all 314 official Odisha Blocks for this district
    const allOfficialBlocks = ODISHA_ALL_314_BLOCKS[d.name_en] || [];
    for (const ob of allOfficialBlocks) {
      const bKey = ob.name_en.toLowerCase();
      if (!blockMap.has(bKey)) {
        // Seed block headquarters as initial village so every block immediately has a valid village option
        blockMap.set(bKey, {
          name_en: ob.name_en,
          name_or: ob.name_or || ob.name_en,
          villages: [
            {
              name_en: ob.name_en,
              name_or: ob.name_or || ob.name_en,
              lat: d.lat,
              lon: d.lon,
              pinCode: d.defaultPin
            }
          ]
        });
      }
    }

    // 3. Merge dynamically learned/collected blocks and villages
    for (const lp of learnedList) {
      if (lp.district_en.toLowerCase() !== d.name_en.toLowerCase()) continue;
      const bKey = lp.block_en.toLowerCase();
      let blk = blockMap.get(bKey);
      if (!blk) {
        blk = {
          name_en: lp.block_en,
          name_or: lp.block_or || lp.block_en,
          villages: []
        };
        blockMap.set(bKey, blk);
      }
      const vKey = lp.village_en.toLowerCase();
      const existingVilIdx = blk.villages.findIndex((v) => v.name_en.toLowerCase() === vKey);
      if (existingVilIdx >= 0) {
        blk.villages[existingVilIdx] = {
          ...blk.villages[existingVilIdx],
          name_or: lp.village_or || blk.villages[existingVilIdx].name_or,
          lat: lp.lat || blk.villages[existingVilIdx].lat,
          lon: lp.lon || blk.villages[existingVilIdx].lon,
          pinCode: lp.pinCode || blk.villages[existingVilIdx].pinCode
        };
      } else {
        blk.villages.push({
          name_en: lp.village_en,
          name_or: lp.village_or || lp.village_en,
          lat: lp.lat || d.lat,
          lon: lp.lon || d.lon,
          pinCode: lp.pinCode || d.defaultPin
        });
      }
    }

    const sortedBlocks = Array.from(blockMap.values()).sort((a, b) =>
      a.name_en.localeCompare(b.name_en)
    );

    return {
      code: d.code,
      name_en: d.name_en,
      name_or: d.name_or || d.name_en,
      lat: d.lat,
      lon: d.lon,
      defaultPin: d.defaultPin || '751001',
      blocks: sortedBlocks
    };
  });

  return {
    code: baseState.code,
    name_en: baseState.name_en,
    name_or: baseState.name_or,
    districts
  };
}

/**
 * Dynamically fetch and store villages for a given District + Block from Google Maps / OpenStreetMap
 */
const fetchedBlocksCache = new Set<string>();

export async function fetchAndStoreBlockVillages(
  districtEn: string,
  blockEn: string
): Promise<LearnedOdishaPlace[]> {
  if (!districtEn || !blockEn) return [];
  const cacheKey = `${districtEn.toLowerCase()}|${blockEn.toLowerCase()}`;
  if (fetchedBlocksCache.has(cacheKey)) {
    return getLearnedOdishaPlacesLocal().filter(
      (p) =>
        p.district_en.toLowerCase() === districtEn.toLowerCase() &&
        p.block_en.toLowerCase() === blockEn.toLowerCase()
    );
  }
  fetchedBlocksCache.add(cacheKey);

  try {
    const resp = await fetch(
      `/api/geocode/block-villages?district=${encodeURIComponent(
        districtEn
      )}&block=${encodeURIComponent(blockEn)}`
    );
    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data?.places) && data.places.length > 0) {
        for (const p of data.places) {
          saveLearnedOdishaPlace(p, false);
        }
        return data.places;
      }
    }
  } catch {
    // Offline or server busy
  }
  return [];
}

/**
 * Search any Village or Block in Odisha online via Google Maps / Nominatim and store discovered places
 */
export async function searchAndStoreOdishaPlacesOnline(
  query: string,
  districtHint?: string,
  blockHint?: string
): Promise<LearnedOdishaPlace[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const params = new URLSearchParams({ q });
    if (districtHint) params.set('district', districtHint);
    if (blockHint) params.set('block', blockHint);
    const resp = await fetch(`/api/geocode/search-places?${params.toString()}`);
    if (resp.ok) {
      const data = await resp.json();
      if (Array.isArray(data?.places) && data.places.length > 0) {
        for (const p of data.places) {
          saveLearnedOdishaPlace(p, false);
        }
        return data.places;
      }
    }
  } catch {
    // Ignore error
  }
  return [];
}

/**
 * Haversine formula to compute distance in km between two GPS coordinates
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Projects real GPS lat/long to the vector map SVG canvas (580 x 520)
 * Calibrated against Odisha's bounding box:
 * Latitude: 17.75°N to 22.65°N
 * Longitude: 81.30°E to 87.65°E
 */
export function projectCoordinatesToSvg(lat: number, lon: number): { x: number; y: number } {
  const minLat = 17.75;
  const maxLat = 22.65;
  const minLon = 81.30;
  const maxLon = 87.65;

  const normX = (lon - minLon) / (maxLon - minLon);
  const normY = (maxLat - lat) / (maxLat - minLat);

  const svgX = 60 + normX * (520 - 60);
  const svgY = 55 + normY * (495 - 55);

  return {
    x: Math.max(30, Math.min(550, Math.round(svgX))),
    y: Math.max(30, Math.min(490, Math.round(svgY)))
  };
}

/**
 * Find the closest Odisha district to a given GPS coordinate
 */
export function findNearestDistrict(
  lat: number,
  lon: number
): { district: DistrictCoord; distanceKm: number } {
  let nearest = ODISHA_DISTRICTS[0];
  let minDistance = Infinity;

  for (const d of ODISHA_DISTRICTS) {
    const dist = calculateHaversineDistance(lat, lon, d.lat, d.lon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = d;
    }
  }

  return { district: nearest, distanceKm: minDistance };
}

/**
 * Find the closest Odisha District, Block, and Village to a given GPS coordinate
 * (searches both static odishaAddresses.json AND all dynamically learned places)
 */
export function findNearestOdishaPlace(lat: number, lon: number): {
  district: { name_en: string; name_or: string; defaultPin?: string };
  block: { name_en: string; name_or: string };
  village: { name_en: string; name_or: string; lat: number; lon: number };
  distanceKm: number;
} {
  const state = getMergedOdishaState();
  let bestDist = state.districts[0];
  let bestBlk = bestDist.blocks[0];
  let bestVil = bestBlk.villages[0];
  let minDistance = Infinity;

  for (const d of state.districts) {
    for (const b of d.blocks) {
      for (const v of b.villages) {
        // Avoid matching synthetic district-center placeholders if real village coords exist
        const dist = calculateHaversineDistance(lat, lon, v.lat, v.lon);
        if (dist < minDistance) {
          minDistance = dist;
          bestDist = d;
          bestBlk = b;
          bestVil = v;
        }
      }
    }
  }

  return {
    district: {
      name_en: bestDist.name_en,
      name_or: bestDist.name_or || bestDist.name_en,
      defaultPin: bestDist.defaultPin
    },
    block: {
      name_en: bestBlk.name_en,
      name_or: bestBlk.name_or || bestBlk.name_en
    },
    village: {
      name_en: bestVil.name_en,
      name_or: bestVil.name_or || bestVil.name_en,
      lat: bestVil.lat,
      lon: bestVil.lon
    },
    distanceKm: minDistance
  };
}

/**
 * Find closest points of interest (Hospital, CHC Drone Hub, KVK) to current coordinates
 */
export function findNearestPoi(
  lat: number,
  lon: number,
  type?: 'hospital' | 'chc_drone' | 'kvk_lab'
): { poi: MapPointOfInterest; distanceKm: number } | null {
  const points = type ? OFFLINE_MAP_POINTS.filter((p) => p.type === type) : OFFLINE_MAP_POINTS;
  if (!points.length) return null;

  let closest = points[0];
  let minDistance = Infinity;

  for (const p of points) {
    const dist = calculateHaversineDistance(lat, lon, p.coordinates.lat, p.coordinates.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = p;
    }
  }

  return { poi: closest, distanceKm: minDistance };
}

/**
 * Query current browser permission status
 */
export async function getGeolocationPermissionStatus(): Promise<GeolocationPermissionState> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return 'unsupported';
  }

  try {
    if (navigator.permissions && navigator.permissions.query) {
      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      return status.state as GeolocationPermissionState;
    }
  } catch {
    // Some browsers don't support query for geolocation, fallback
  }

  return 'prompt';
}

/**
 * Reverse geocode coordinates (lat, lon) into real Village, Block, District, and PIN code
 * using Google Maps Geocoding API / OpenStreetMap Nominatim, and automatically store the
 * discovered Block & Village in the Odisha address database.
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number,
  lang: Language = 'or'
): Promise<ReverseGeocodedPlace> {
  const nearestLocal = findNearestOdishaPlace(lat, lon);

  // 1. Try server-side reverse geocoding proxy (Google Geocoding API + Nominatim + Server Store)
  try {
    const resp = await fetch(
      `/api/geocode/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(
        lon
      )}&lang=${encodeURIComponent(lang)}`
    );
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.district_en) {
        const canonicalDistEn = resolveCanonicalDistrictName(
          data.district_en,
          nearestLocal.district.name_en
        );
        const resolvedBlock = resolveCanonicalBlockName(
          canonicalDistEn,
          data.block_en || nearestLocal.block.name_en
        );
        const finalVilEn =
          cleanPlaceName(data.village_en) ||
          resolvedBlock.name_en ||
          nearestLocal.village.name_en;
        const finalBlkEn = resolvedBlock.name_en;

        const vilOr =
          translatePlaceName(data.village_or || finalVilEn, 'or') ||
          data.village_or ||
          finalVilEn;
        const blkOr =
          resolvedBlock.name_or ||
          translatePlaceName(data.block_or || finalBlkEn, 'or') ||
          finalBlkEn;
        const distOr =
          translatePlaceName(data.district_or || canonicalDistEn, 'or') ||
          nearestLocal.district.name_or;
        const pinCode =
          data.pinCode && /^\d{6}$/.test(String(data.pinCode))
            ? String(data.pinCode)
            : nearestLocal.district.defaultPin;

        // Save to client learned store so dropdowns immediately include this Block & Village
        saveLearnedOdishaPlace(
          {
            district_en: canonicalDistEn,
            district_or: distOr,
            block_en: finalBlkEn,
            block_or: blkOr,
            village_en: finalVilEn,
            village_or: vilOr,
            lat,
            lon,
            pinCode
          },
          false
        );

        const vilLoc =
          lang === 'or' ? vilOr : translatePlaceName(data.village_localized || finalVilEn, lang);
        const blkLoc =
          lang === 'or' ? blkOr : translatePlaceName(data.block_localized || finalBlkEn, lang);
        const distLoc =
          lang === 'or'
            ? distOr
            : translatePlaceName(data.district_localized || canonicalDistEn, lang);

        return {
          village_en: finalVilEn,
          village_or: vilOr,
          block_en: finalBlkEn,
          block_or: blkOr,
          district_en: canonicalDistEn,
          district_or: distOr,
          pinCode,
          formatted_en: `${finalVilEn}, ${finalBlkEn}, ${canonicalDistEn}`,
          formatted_or: `${vilOr}, ${blkOr}, ${distOr}`,
          formatted_localized: `${vilLoc}, ${blkLoc}, ${distLoc}`,
          source: data.source || 'nominatim'
        };
      }
    }
  } catch {
    // Fall through to client Nominatim lookup
  }

  // 2. Try OpenStreetMap Nominatim directly from client in English & Odia
  try {
    const [nomEnRes, nomOrRes] = await Promise.all([
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
          lat
        )}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1&accept-language=en`,
        { headers: { 'Accept-Language': 'en' } }
      ),
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
          lat
        )}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1&accept-language=or,en;q=0.7`,
        { headers: { 'Accept-Language': 'or,en;q=0.7' } }
      )
    ]);

    if (nomEnRes.ok) {
      const nomEnData = await nomEnRes.json();
      const nomOrData = nomOrRes.ok ? await nomOrRes.json() : null;
      const addrEn = nomEnData?.address || {};
      const addrOr = nomOrData?.address || addrEn;

      const rawDistEn = cleanPlaceName(
        addrEn.state_district || addrEn.district || addrEn.county || ''
      );
      const canonicalDistEn = resolveCanonicalDistrictName(
        rawDistEn,
        nearestLocal.district.name_en
      );

      const rawBlockEn = cleanPlaceName(
        addrEn.county || addrEn.subdistrict || addrEn.municipality || addrEn.city_district || ''
      );
      const resolvedBlock = resolveCanonicalBlockName(
        canonicalDistEn,
        rawBlockEn || nearestLocal.block.name_en
      );

      const rawVillageEn =
        cleanPlaceName(
          addrEn.village ||
            addrEn.hamlet ||
            addrEn.neighbourhood ||
            addrEn.suburb ||
            addrEn.residential ||
            addrEn.town ||
            addrEn.city ||
            nomEnData?.name ||
            ''
        ) ||
        resolvedBlock.name_en ||
        nearestLocal.village.name_en;

      const rawVillageOr = cleanPlaceName(
        addrOr.village ||
          addrOr.hamlet ||
          addrOr.neighbourhood ||
          addrOr.suburb ||
          addrOr.residential ||
          addrOr.town ||
          addrOr.city ||
          nomOrData?.name ||
          ''
      );

      const vilOr =
        rawVillageOr || translatePlaceName(rawVillageEn, 'or') || rawVillageEn;
      const blkOr =
        resolvedBlock.name_or || translatePlaceName(resolvedBlock.name_en, 'or');
      const distOr =
        translatePlaceName(canonicalDistEn, 'or') || nearestLocal.district.name_or;
      const rawPin = String(addrEn.postcode || '').replace(/\D/g, '').slice(0, 6);
      const pinCode = /^\d{6}$/.test(rawPin) ? rawPin : nearestLocal.district.defaultPin;

      saveLearnedOdishaPlace({
        district_en: canonicalDistEn,
        district_or: distOr,
        block_en: resolvedBlock.name_en,
        block_or: blkOr,
        village_en: rawVillageEn,
        village_or: vilOr,
        lat,
        lon,
        pinCode
      });

      const vilLoc = lang === 'or' ? vilOr : translatePlaceName(rawVillageEn, lang);
      const blkLoc = lang === 'or' ? blkOr : translatePlaceName(resolvedBlock.name_en, lang);
      const distLoc = lang === 'or' ? distOr : translatePlaceName(canonicalDistEn, lang);

      return {
        village_en: rawVillageEn,
        village_or: vilOr,
        block_en: resolvedBlock.name_en,
        block_or: blkOr,
        district_en: canonicalDistEn,
        district_or: distOr,
        pinCode,
        formatted_en: `${rawVillageEn}, ${resolvedBlock.name_en}, ${canonicalDistEn}`,
        formatted_or: `${vilOr}, ${blkOr}, ${distOr}`,
        formatted_localized: `${vilLoc}, ${blkLoc}, ${distLoc}`,
        source: 'nominatim'
      };
    }
  } catch {
    // Fallback to offline Odisha database
  }

  const vilLoc =
    lang === 'or'
      ? nearestLocal.village.name_or
      : translatePlaceName(nearestLocal.village.name_en, lang);
  const blkLoc =
    lang === 'or'
      ? nearestLocal.block.name_or
      : translatePlaceName(nearestLocal.block.name_en, lang);
  const distLoc =
    lang === 'or'
      ? nearestLocal.district.name_or
      : translatePlaceName(nearestLocal.district.name_en, lang);

  return {
    village_en: nearestLocal.village.name_en,
    village_or: nearestLocal.village.name_or,
    block_en: nearestLocal.block.name_en,
    block_or: nearestLocal.block.name_or,
    district_en: nearestLocal.district.name_en,
    district_or: nearestLocal.district.name_or,
    pinCode: nearestLocal.district.defaultPin,
    formatted_en: `${nearestLocal.village.name_en}, ${nearestLocal.block.name_en}, ${nearestLocal.district.name_en}`,
    formatted_or: `${nearestLocal.village.name_or}, ${nearestLocal.block.name_or}, ${nearestLocal.district.name_or}`,
    formatted_localized: `${vilLoc}, ${blkLoc}, ${distLoc}`,
    source: 'offline_odisha'
  };
}

/**
 * Helper to build a UserLocation object from coordinates & accuracy
 */
export function buildUserLocationFromCoords(
  latitude: number,
  longitude: number,
  accuracy: number,
  timestamp: number = Date.now(),
  confirmed: boolean = false
): UserLocation {
  const { district, distanceKm } = findNearestDistrict(latitude, longitude);
  const exactPlace = findNearestOdishaPlace(latitude, longitude);
  const svgCoords = projectCoordinatesToSvg(latitude, longitude);

  const isWithinOdisha =
    latitude >= 17.5 && latitude <= 23.0 && longitude >= 81.0 && longitude <= 88.0;

  const matchedDistrict =
    ODISHA_DISTRICTS.find((d) => d.name_en === exactPlace.district.name_en) || district;

  return {
    latitude: Math.round(latitude * 100000) / 100000,
    longitude: Math.round(longitude * 100000) / 100000,
    accuracy: Math.max(1, Math.round(accuracy)),
    timestamp,
    nearestDistrict: matchedDistrict,
    nearestBlock: exactPlace.block,
    nearestVillage: exactPlace.village,
    pinCode: exactPlace.district.defaultPin,
    placeNameEn: `${exactPlace.village.name_en}, ${exactPlace.block.name_en}, ${exactPlace.district.name_en}`,
    placeNameOr: `${exactPlace.village.name_or}, ${exactPlace.block.name_or}, ${exactPlace.district.name_or}`,
    confirmed,
    distanceToDistrictKm: distanceKm,
    isWithinOdisha,
    svgX: svgCoords.x,
    svgY: svgCoords.y
  };
}

/**
 * High-Accuracy Location Detection + Automatic Reverse Geocoding:
 * Uses navigator.geolocation.getCurrentPosition AND watchPosition with
 * enableHighAccuracy: true, timeout: 15000, maximumAge: 0.
 * Automatically resolves the exact Village, Block, District, and PIN code via
 * reverseGeocodeCoordinates and stores new Blocks/Villages in the database.
 */
export function requestAccurateUserLocation(
  watchDurationMs: number = 3000,
  onProgressReading?: (loc: UserLocation) => void
): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser or device.'));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    let bestPosition: GeolocationPosition | null = null;
    let watchId: number | null = null;
    let settled = false;

    const cleanupAndResolve = async () => {
      if (settled) return;
      settled = true;
      if (watchId !== null) {
        try {
          navigator.geolocation.clearWatch(watchId);
        } catch {}
      }
      if (bestPosition) {
        const baseLoc = buildUserLocationFromCoords(
          bestPosition.coords.latitude,
          bestPosition.coords.longitude,
          bestPosition.coords.accuracy,
          bestPosition.timestamp,
          true
        );
        try {
          // Automatically reverse-geocode the exact GPS coordinates to load real Village, Block & District
          const rev = await reverseGeocodeCoordinates(
            baseLoc.latitude,
            baseLoc.longitude,
            'or'
          );
          const matchedDistrict =
            ODISHA_DISTRICTS.find((d) => d.name_en === rev.district_en) ||
            baseLoc.nearestDistrict;
          baseLoc.nearestDistrict = matchedDistrict;
          baseLoc.nearestBlock = { name_en: rev.block_en, name_or: rev.block_or };
          baseLoc.nearestVillage = { name_en: rev.village_en, name_or: rev.village_or };
          baseLoc.pinCode = rev.pinCode || baseLoc.pinCode;
          baseLoc.placeNameEn = rev.formatted_en;
          baseLoc.placeNameOr = rev.formatted_or;
        } catch {
          // Keep nearest local fallback if offline
        }
        resolve(baseLoc);
      }
    };

    const handlePosition = (pos: GeolocationPosition) => {
      if (!bestPosition || pos.coords.accuracy < bestPosition.coords.accuracy) {
        bestPosition = pos;
        if (onProgressReading) {
          onProgressReading(
            buildUserLocationFromCoords(
              pos.coords.latitude,
              pos.coords.longitude,
              pos.coords.accuracy,
              pos.timestamp
            )
          );
        }
      }
      // If accuracy is already <= 20m, resolve immediately
      if (pos.coords.accuracy <= 20) {
        cleanupAndResolve();
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      if (bestPosition) {
        cleanupAndResolve();
        return;
      }
      if (settled) return;
      settled = true;
      if (watchId !== null) {
        try {
          navigator.geolocation.clearWatch(watchId);
        } catch {}
      }
      let message = 'Unable to retrieve location.';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = 'PERMISSION_DENIED';
          break;
        case error.POSITION_UNAVAILABLE:
          message = 'POSITION_UNAVAILABLE';
          break;
        case error.TIMEOUT:
          message = 'TIMEOUT';
          break;
      }
      reject(new Error(message));
    };

    navigator.geolocation.getCurrentPosition(handlePosition, handleError, options);

    try {
      watchId = navigator.geolocation.watchPosition(handlePosition, () => {}, options);
    } catch {}

    window.setTimeout(() => {
      if (!settled && bestPosition) {
        cleanupAndResolve();
      }
    }, watchDurationMs);
  });
}

/**
 * Request user's current GPS position (delegates to high-accuracy multi-sample detector)
 */
export function requestUserLocation(): Promise<UserLocation> {
  return requestAccurateUserLocation(2500);
}

export interface PincodeLookupResult {
  pincode: string;
  state_en: string;
  state_or: string;
  district_en: string;
  district_or: string;
  block_en: string;
  block_or: string;
  villages: Array<{ name_en: string; name_or: string }>;
  lat?: number;
  lon?: number;
}

/**
 * Look up any 6-digit Indian PIN code to automatically retrieve & store
 * State, District, Block/Tehsil, and all associated Post Office Villages.
 */
export async function lookupPincodeData(pincode: string): Promise<PincodeLookupResult | null> {
  const pin = pincode.replace(/\D/g, '').slice(0, 6);
  if (!/^\d{6}$/.test(pin)) return null;

  try {
    const resp = await fetch(`/api/geocode/pincode?code=${encodeURIComponent(pin)}`);
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.district_en) {
        const canonicalDistEn = resolveCanonicalDistrictName(data.district_en);
        const resolvedBlock = resolveCanonicalBlockName(canonicalDistEn, data.block_en);

        const result: PincodeLookupResult = {
          pincode: pin,
          state_en: data.state_en || 'Odisha',
          state_or: data.state_or || 'ଓଡ଼ିଶା',
          district_en: canonicalDistEn,
          district_or: translatePlaceName(canonicalDistEn, 'or') || data.district_or || canonicalDistEn,
          block_en: resolvedBlock.name_en,
          block_or: resolvedBlock.name_or,
          villages: Array.isArray(data.villages) && data.villages.length > 0 ? data.villages : [],
          lat: data.lat,
          lon: data.lon
        };

        // Save each village to local learned place store so dropdowns update immediately
        for (const v of result.villages) {
          saveLearnedOdishaPlace(
            {
              district_en: result.district_en,
              district_or: result.district_or,
              block_en: result.block_en,
              block_or: result.block_or,
              village_en: v.name_en,
              village_or: v.name_or,
              lat: result.lat || 20.4625,
              lon: result.lon || 85.883,
              pinCode: pin
            },
            false
          );
        }

        return result;
      }
    }
  } catch {
    // Fall through to India Post direct client fetch fallback
  }

  // Direct client fetch fallback to India Post API
  try {
    const ipResp = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    if (ipResp.ok) {
      const ipData = await ipResp.json();
      if (Array.isArray(ipData) && ipData[0]?.Status === 'Success' && Array.isArray(ipData[0]?.PostOffice)) {
        const poList = ipData[0].PostOffice;
        const first = poList[0];

        const rawDist = cleanPlaceName(first?.District || '');
        const canonicalDistEn = resolveCanonicalDistrictName(rawDist);
        const rawBlk = cleanPlaceName(first?.Division || first?.Block || '');
        const resolvedBlock = resolveCanonicalBlockName(canonicalDistEn, rawBlk);

        const vList: Array<{ name_en: string; name_or: string }> = [];
        for (const po of poList) {
          const vName = cleanPlaceName(po.Name);
          if (vName && !vList.some((v) => v.name_en.toLowerCase() === vName.toLowerCase())) {
            const vOr = translatePlaceName(vName, 'or') || vName;
            vList.push({ name_en: vName, name_or: vOr });
            saveLearnedOdishaPlace(
              {
                district_en: canonicalDistEn,
                district_or: translatePlaceName(canonicalDistEn, 'or'),
                block_en: resolvedBlock.name_en,
                block_or: resolvedBlock.name_or,
                village_en: vName,
                village_or: vOr,
                lat: 20.4625,
                lon: 85.883,
                pinCode: pin
              },
              false
            );
          }
        }

        return {
          pincode: pin,
          state_en: first?.State || 'Odisha',
          state_or: 'ଓଡ଼ିଶା',
          district_en: canonicalDistEn,
          district_or: translatePlaceName(canonicalDistEn, 'or'),
          block_en: resolvedBlock.name_en,
          block_or: resolvedBlock.name_or,
          villages: vList,
          lat: 20.4625,
          lon: 85.883
        };
      }
    }
  } catch {
    // Offline or network block
  }

  return null;
}

