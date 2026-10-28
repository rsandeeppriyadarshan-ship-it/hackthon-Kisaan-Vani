import { CategoryMeta, CropItem, CropProblem } from './types';
import { DiseaseReferenceImage } from '../../types';
import { CEREALS_AND_MILLETS, PULSES } from './cerealsAndPulses';
import { OILSEEDS, VEGETABLES } from './oilseedsAndVegetables';
import { FRUITS, SPICES } from './fruitsAndSpices';
import { CASH_CROPS, FLOWERS, ORNAMENTAL_PLANTS } from './cashFlowersOrnamental';
import { MEDICINAL_PLANTS, FODDER_CROPS, FORESTRY_TREES } from './medicinalFodderForestry';
import diseasesDataRaw from '../diseases.json';
import rulesDataRaw from '../rules.json';

export * from './types';

function resolveBaseUrlPath(relPath: string): string {
  if (!relPath) return '';
  if (relPath.startsWith('http://') || relPath.startsWith('https://') || relPath.startsWith('data:')) {
    return relPath;
  }
  const base = (import.meta as any).env?.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const cleanRel = relPath.startsWith('/') ? relPath.slice(1) : relPath;
  return `${normalizedBase}${cleanRel}`;
}

function normalizeReferenceImage(rawImg: any, entry?: any): DiseaseReferenceImage | null {
  if (!rawImg) return null;
  const rawPath = rawImg.file || rawImg.url;
  if (!rawPath) return null;

  const combinedAlt =
    rawImg.alt ||
    `${entry?.name_en || ''}: ${entry?.symptoms_en || ''} | ${entry?.name_or || ''}: ${entry?.symptoms_or || ''}`;
  const rawLicence = rawImg.licence || rawImg.license || 'CC0';
  const displayLicense =
    rawLicence === 'CC0'
      ? 'CC0 1.0 Universal (Public Domain Dedication)'
      : rawLicence;
  const credit = rawImg.credit || 'Public domain';

  return {
    file: rawPath,
    url: resolveBaseUrlPath(rawPath),
    alt: combinedAlt,
    alt_en: rawImg.alt_en || combinedAlt,
    alt_or: rawImg.alt_or || combinedAlt,
    licence: rawLicence,
    license: displayLicense,
    credit,
    source: rawImg.source || credit,
    size_kb: rawImg.size_kb || 65,
    verified_by: rawImg.verified_by ?? entry?.verified_by ?? null,
    verified_date: rawImg.verified_date ?? entry?.verified_date ?? null,
  };
}

export function getDiseaseReferenceImage(diseaseId?: string, diseaseNameEn?: string, _cropId?: string): DiseaseReferenceImage | null {
  if (!diseaseId && !diseaseNameEn) return null;
  const list = (diseasesDataRaw as any).diseases || [];
  const normId = (diseaseId || '').trim().toLowerCase();
  const normName = (diseaseNameEn || '').trim().toLowerCase();

  const found = list.find((entry: any) => {
    if (normId && entry.id.toLowerCase() === normId) return true;
    if (normId && Array.isArray(entry.aliases) && entry.aliases.some((a: string) => a.toLowerCase() === normId)) {
      return true;
    }
    if (normName && entry.name_en && entry.name_en.toLowerCase() === normName) return true;
    if (normName && entry.name_en && (normName.includes(entry.id.replace(/_/g, ' ')) || entry.name_en.toLowerCase().includes(normName.split('(')[0].trim()))) {
      return true;
    }
    return false;
  });

  if (!found || !Array.isArray(found.reference_images) || found.reference_images.length === 0) {
    return null;
  }

  return normalizeReferenceImage(found.reference_images[0], found);
}

export function getDoseVerificationInfo(cropId?: string, diseaseId?: string, _diseaseNameEn?: string): {
  isVerified: boolean;
  verified_by: string | null;
  verified_date: string | null;
  source: string;
  dose_per_litre?: string;
  dose_per_acre?: string;
} {
  const cropsMap = (rulesDataRaw as any).crops || {};
  const normCrop = (cropId || '').toLowerCase();
  const normDisease = (diseaseId || '').toLowerCase();

  for (const [cKey, cVal] of Object.entries<any>(cropsMap)) {
    const diseases = cVal?.diseases_pests || [];
    for (const d of diseases) {
      if (
        d.id?.toLowerCase() === normDisease ||
        (normDisease && normDisease.includes(d.id?.toLowerCase())) ||
        (d.id && normDisease && d.id.toLowerCase().includes(normDisease.replace(/^paddy_/, '')))
      ) {
        if (!normCrop || cKey === normCrop || (normCrop === 'pulses' && cKey === 'pulses')) {
          const isVerified = Boolean(d.verified_by && d.verified_date);
          return {
            isVerified,
            verified_by: d.verified_by || null,
            verified_date: d.verified_date || null,
            source: d.source || 'OUAT / ICAR Package of Practices',
            dose_per_litre: d.dose_per_litre,
            dose_per_acre: d.dose_per_acre,
          };
        }
      }
    }
  }

  return {
    isVerified: false,
    verified_by: null,
    verified_date: null,
    source: 'OUAT / ICAR Package of Practices',
  };
}

export function getSavedCropsReferenceImages(savedCropIds?: string[]): DiseaseReferenceImage[] {
  const list = (diseasesDataRaw as any).diseases || [];
  const normalizedCrops = (savedCropIds || ['paddy', 'brinjal', 'tomato', 'groundnut', 'pulses']).map((c) =>
    c.toLowerCase().trim()
  );

  const images: DiseaseReferenceImage[] = [];
  for (const entry of list) {
    const entryCrop = (entry.crop_id || '').toLowerCase();
    const matchesCrop =
      entryCrop === 'all' ||
      normalizedCrops.length === 0 ||
      normalizedCrops.some((sc) => sc.includes(entryCrop) || entryCrop.includes(sc));

    if (matchesCrop && Array.isArray(entry.reference_images)) {
      for (const img of entry.reference_images) {
        const norm = normalizeReferenceImage(img, entry);
        if (norm) {
          images.push(norm);
        }
      }
    }
  }
  return images;
}

export const CROP_CATEGORIES: CategoryMeta[] = [
  { id: 'all', name_en: 'All Crops', name_or: 'ସମସ୍ତ ଫସଲ', name_hi: 'सभी फसलें', icon: '🌱' },
  { id: 'cereals', name_en: 'Cereals & Millets', name_or: 'ଦାନା ଶସ୍ୟ ଓ ମିଲେଟ', name_hi: 'अनाज और बाजरा', icon: '🌾' },
  { id: 'pulses', name_en: 'Pulses', name_or: 'ଡାଲି ଜାତୀୟ ଫସଲ', name_hi: 'दालें', icon: '🫘' },
  { id: 'oilseeds', name_en: 'Oilseeds', name_or: 'ତୈଳବୀଜ ଫସଲ', name_hi: 'तिलहन', icon: '🌻' },
  { id: 'vegetables', name_en: 'Vegetables', name_or: 'ପନିପରିବା', name_hi: 'सब्जियां', icon: '🥦' },
  { id: 'fruits', name_en: 'Fruits', name_or: 'ଫଳ ଚାଷ', name_hi: 'फल', icon: '🥭' },
  { id: 'spices', name_en: 'Spices & Condiments', name_or: 'ମସଲା ଫସଲ', name_hi: 'मसाले', icon: '🫚' },
  { id: 'cash_crops', name_en: 'Cash & Plantation', name_or: 'ଅର୍ଥକାରୀ ଓ ବଗିଚା ଫସଲ', name_hi: 'नकदी फसलें', icon: '🎋' },
  { id: 'flowers', name_en: 'Commercial Flowers', name_or: 'ବାଣିଜ୍ୟିକ ଫୁଲ ଚାଷ', name_hi: 'व्यावसायिक फूल', icon: '🌺' },
  { id: 'ornamental', name_en: 'Ornamental & Indoor', name_or: 'ଶୋଭାବର୍ଦ୍ଧକ ଓ ଘରୋଇ ଉଦ୍ଭିଦ', name_hi: 'सजावटी पौधे', icon: '🪴' },
  { id: 'medicinal', name_en: 'Medicinal & Aromatic', name_or: 'ଔଷଧୀୟ ଓ ସୁଗନ୍ଧିତ ଉଦ୍ଭିଦ', name_hi: 'औषधीय पौधे', icon: '🌿' },
  { id: 'fodder', name_en: 'Fodder & Green Manure', name_or: 'ଘାସ ଓ ସବୁଜ ଖତ', name_hi: 'चारा फसलें', icon: '🌾' },
  { id: 'forestry', name_en: 'Forestry & Timber', name_or: 'ଜଙ୍ଗଲ ଓ କାଠ ଗଛ', name_hi: 'वानिकी और लकड़ी', icon: '🪵' }
];

const RAW_CROPS_DATABASE: CropItem[] = [
  ...CEREALS_AND_MILLETS,
  ...PULSES,
  ...OILSEEDS,
  ...VEGETABLES,
  ...FRUITS,
  ...SPICES,
  ...CASH_CROPS,
  ...FLOWERS,
  ...ORNAMENTAL_PLANTS,
  ...MEDICINAL_PLANTS,
  ...FODDER_CROPS,
  ...FORESTRY_TREES
];

export const ALL_CROPS_DATABASE: CropItem[] = RAW_CROPS_DATABASE.map((crop) => ({
  ...crop,
  problems: crop.problems.map((prob) => {
    const refImg = getDiseaseReferenceImage(prob.id, prob.name_en);
    const doseMeta = getDoseVerificationInfo(crop.id, prob.id);
    return {
      ...prob,
      image: refImg ? refImg.url : prob.image,
      reference_images: refImg ? [refImg] : [],
      treatments: prob.treatments.map((t) => ({
        ...t,
        dose_per_litre: doseMeta.dose_per_litre || t.dose_per_litre,
        dose_per_200L: doseMeta.dose_per_acre || t.dose_per_200L,
        source: t.source || doseMeta.source || 'OUAT / ICAR Package of Practices',
        verified_by: t.verified_by ?? doseMeta.verified_by,
        verified_date: t.verified_date ?? doseMeta.verified_date,
      })),
    };
  }),
}));

export function getCropById(id: string): CropItem | undefined {
  return ALL_CROPS_DATABASE.find((c) => c.id === id);
}

export function searchCrops(query: string, category: string = 'all'): CropItem[] {
  let list = ALL_CROPS_DATABASE;
  if (category && category !== 'all') {
    list = list.filter((c) => c.category === category);
  }
  if (!query || !query.trim()) return list;

  const q = query.trim().toLowerCase();
  return list.filter((c) => {
    return (
      c.name_en.toLowerCase().includes(q) ||
      c.name_or.toLowerCase().includes(q) ||
      (c.name_hi && c.name_hi.toLowerCase().includes(q)) ||
      c.scientific_name.toLowerCase().includes(q) ||
      c.problems.some(
        (p) =>
          p.name_en.toLowerCase().includes(q) ||
          p.name_or.toLowerCase().includes(q) ||
          p.symptoms_en.toLowerCase().includes(q) ||
          p.symptoms_or.toLowerCase().includes(q)
      )
    );
  });
}

// Local base64 image persistence for user-uploaded/replaced sample photos
const USER_PHOTOS_KEY = 'krushak_crop_problem_photos';

export function getCustomProblemPhoto(problemId: string): string | null {
  try {
    const raw = localStorage.getItem(USER_PHOTOS_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    return map[problemId] || null;
  } catch {
    return null;
  }
}

export function saveCustomProblemPhoto(problemId: string, base64Data: string): void {
  try {
    const raw = localStorage.getItem(USER_PHOTOS_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[problemId] = base64Data;
    localStorage.setItem(USER_PHOTOS_KEY, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to save problem photo in localStorage', err);
  }
}
