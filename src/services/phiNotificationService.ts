import { Language, SprayRecord } from '../types';

/**
 * Standard Pre-Harvest Interval (PHI in days) lookup for common agricultural chemicals/pesticides
 */
export const CHEMICAL_PHI_DATABASE: Record<string, { phiDays: number; category: string }> = {
  tricyclazole: { phiDays: 14, category: 'Fungicide' },
  coragen: { phiDays: 7, category: 'Insecticide' },
  chlorantraniliprole: { phiDays: 7, category: 'Insecticide' },
  mancozeb: { phiDays: 10, category: 'Fungicide' },
  carbendazim: { phiDays: 14, category: 'Fungicide' },
  monocrotophos: { phiDays: 21, category: 'Insecticide' },
  imidacloprid: { phiDays: 14, category: 'Insecticide' },
  chlorpyrifos: { phiDays: 15, category: 'Insecticide' },
  profenofos: { phiDays: 14, category: 'Insecticide' },
  emamectin: { phiDays: 7, category: 'Insecticide' },
  thiamethoxam: { phiDays: 14, category: 'Insecticide' },
  cypermethrin: { phiDays: 7, category: 'Insecticide' },
  hexaconazole: { phiDays: 14, category: 'Fungicide' },
  neem: { phiDays: 1, category: 'Organic' },
  bio: { phiDays: 1, category: 'Bio-pesticide' },
  copper: { phiDays: 3, category: 'Fungicide' },
};

/**
 * Look up or estimate PHI days for a chemical product name
 */
export function getEstimatedPHIDays(productName: string): number {
  if (!productName) return 10;
  const lower = productName.toLowerCase();
  for (const [key, info] of Object.entries(CHEMICAL_PHI_DATABASE)) {
    if (lower.includes(key)) {
      return info.phiDays;
    }
  }
  return 10; // default safe 10-day PHI
}

export interface PHIStatusResult {
  record: SprayRecord;
  phiDays: number;
  sprayDate: Date;
  safeHarvestDate: Date;
  safeHarvestDateStr: string;
  daysRemaining: number;
  status: 'SAFE' | 'HARVEST_TODAY' | 'WAITING';
  statusLabelEn: string;
  statusLabelOr: string;
}

/**
 * Calculates PHI safe harvest details for a single spray record
 */
export function calculatePHIStatus(record: SprayRecord): PHIStatusResult {
  const phiDays = record.phi_days || getEstimatedPHIDays(record.product_name);
  const sprayDate = new Date(record.spray_date || Date.now());
  
  const safeHarvestDate = new Date(sprayDate);
  safeHarvestDate.setDate(safeHarvestDate.getDate() + phiDays);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(safeHarvestDate);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const safeHarvestDateStr = safeHarvestDate.toISOString().split('T')[0];

  let status: 'SAFE' | 'HARVEST_TODAY' | 'WAITING';
  let statusLabelEn: string;
  let statusLabelOr: string;

  if (daysRemaining <= 0) {
    if (daysRemaining === 0) {
      status = 'HARVEST_TODAY';
      statusLabelEn = 'Safe to Harvest Starting Today!';
      statusLabelOr = 'ଆଜିଠାରୁ ସୁରକ୍ଷିତ ଅମଳ ଯୋଗ୍ୟ!';
    } else {
      status = 'SAFE';
      statusLabelEn = `Safe to Harvest (${Math.abs(daysRemaining)} days past PHI)`;
      statusLabelOr = `ଅମଳ ପାଇଁ ସମ୍ପୂର୍ଣ୍ଣ ସୁରକ୍ଷିତ (${Math.abs(daysRemaining)} ଦିନ ପୂର୍ବରୁ ସୁରକ୍ଷିତ)`;
    }
  } else {
    status = 'WAITING';
    statusLabelEn = `PHI Waiting Period: ${daysRemaining} day(s) remaining`;
    statusLabelOr = `କୀଟନାଶକ ଅବଶିଷ୍ଟ କାଳ: ଆଉ ${daysRemaining} ଦିନ ବାକି`;
  }

  return {
    record,
    phiDays,
    sprayDate,
    safeHarvestDate,
    safeHarvestDateStr,
    daysRemaining,
    status,
    statusLabelEn,
    statusLabelOr,
  };
}

/**
 * Audit list of spray records and find crops that are safe to harvest or in PHI waiting
 */
export function auditAllSprayLogsPHI(logs: SprayRecord[]): PHIStatusResult[] {
  return logs.map(calculatePHIStatus).sort((a, b) => b.sprayDate.getTime() - a.sprayDate.getTime());
}

/**
 * Request Browser Push Notification permission with user interaction
 */
export async function requestPushNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

/**
 * Triggers Browser Push Notifications for crops reaching Safe Harvest Date
 */
export function checkAndTriggerPHIPushNotifications(logs: SprayRecord[], lang: Language): number {
  if (typeof window === 'undefined' || !('Notification' in window)) return 0;
  if (Notification.permission !== 'granted') return 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const results = auditAllSprayLogsPHI(logs);
  let triggeredCount = 0;

  for (const item of results) {
    // Notify if safe today or safe within 1 day, and not yet notified today
    const storageKey = `phi_notified_${item.record.id}_${todayStr}`;
    const alreadyNotified = localStorage.getItem(storageKey);

    if (!alreadyNotified && (item.status === 'HARVEST_TODAY' || (item.daysRemaining <= 0 && item.daysRemaining >= -3))) {
      const title = lang === 'or' 
        ? `🌾 ସୁରକ୍ଷିତ ଅମଳ ସତର୍କତା: ${item.record.crop_name}` 
        : `🌾 Safe Harvest Alert: ${item.record.crop_name}`;
      
      const body = lang === 'or'
        ? `${item.record.crop_name} ରେ ${item.record.product_name} ସ୍ପ୍ରେ କରିବାର ${item.phiDays} ଦିନିଆ PHI ସମୟ ପୂରଣ ହୋଇଛି! ଆପଣଙ୍କ ଫସଲ ଏବେ ରସାୟନମୁକ୍ତ ଓ ସୁରକ୍ଷିତ।`
        : `${item.record.crop_name} sprayed with ${item.record.product_name} has completed its ${item.phiDays}-day PHI waiting period. Your crop is now safe to harvest!`;

      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `phi-${item.record.id}`,
        });
        localStorage.setItem(storageKey, 'true');
        triggeredCount++;
      } catch (err) {
        console.warn('Failed to send browser notification:', err);
      }
    }
  }

  return triggeredCount;
}
