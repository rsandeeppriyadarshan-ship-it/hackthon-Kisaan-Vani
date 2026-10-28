/**
 * Permission Service for Krushak Bani
 * Coordinates Browser / Google permissions for:
 * 1. Geolocation (GPS): For real-time farm district detection, weather forecast, spray windows, and nearest ASV hospital
 * 2. Microphone (Audio): For hands-free Odia voice commands & spoken agricultural advice
 */

import { requestUserLocation, UserLocation } from './locationService';

export interface PermissionStatusResult {
  gps: 'granted' | 'denied' | 'prompt' | 'unsupported';
  mic: 'granted' | 'denied' | 'prompt' | 'unsupported';
  userLocation?: UserLocation | null;
  errorMessage?: string;
}

const STORAGE_KEY_AGREED = 'krushak_permissions_agreed';
const STORAGE_KEY_GPS_GRANTED = 'krushak_gps_granted';
const STORAGE_KEY_MIC_GRANTED = 'krushak_mic_granted';

/**
 * Check if the user has previously clicked Agree on the permissions prompt
 */
export function hasUserAgreedOnce(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY_AGREED) === 'true';
}

/**
 * Set user agreement preference in localStorage
 */
export function setUserAgreed(agreed: boolean): void {
  if (typeof window === 'undefined') return;
  if (agreed) {
    localStorage.setItem(STORAGE_KEY_AGREED, 'true');
  } else {
    localStorage.removeItem(STORAGE_KEY_AGREED);
  }
}

/**
 * Check current browser permission states using the Permissions API if available
 */
export async function queryPermissionStates(): Promise<{
  gps: 'granted' | 'denied' | 'prompt' | 'unsupported';
  mic: 'granted' | 'denied' | 'prompt' | 'unsupported';
}> {
  let gpsState: 'granted' | 'denied' | 'prompt' | 'unsupported' = 'prompt';
  let micState: 'granted' | 'denied' | 'prompt' | 'unsupported' = 'prompt';

  if (typeof window === 'undefined') {
    return { gps: 'unsupported', mic: 'unsupported' };
  }

  // Check Geolocation API support
  if (!navigator.geolocation) {
    gpsState = 'unsupported';
  } else if (navigator.permissions && navigator.permissions.query) {
    try {
      const geoStatus = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      gpsState = geoStatus.state as any;
    } catch {
      gpsState = 'prompt';
    }
  }

  // Check MediaDevices / Microphone support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    micState = 'unsupported';
  } else if (navigator.permissions && navigator.permissions.query) {
    try {
      const micStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      micState = micStatus.state as any;
    } catch {
      micState = 'prompt';
    }
  }

  return { gps: gpsState, mic: micState };
}

/**
 * Primary "Agree & Allow All" trigger:
 * Solicits both GPS and Microphone permissions sequentially or in parallel.
 * Once microphone is granted, immediately stops the media stream tracks
 * so the hardware microphone is not held open.
 */
export async function requestAllPermissions(): Promise<PermissionStatusResult> {
  const result: PermissionStatusResult = {
    gps: 'prompt',
    mic: 'prompt',
    userLocation: null,
  };

  // 1. Request GPS Geolocation
  let locationResult: UserLocation | null = null;
  let gpsErrorMsg: string | undefined;

  try {
    locationResult = await requestUserLocation();
    result.gps = 'granted';
    result.userLocation = locationResult;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_GPS_GRANTED, 'true');
    }
  } catch (err: any) {
    if (err.message === 'PERMISSION_DENIED') {
      result.gps = 'denied';
      gpsErrorMsg = 'GPS location permission was denied by the browser.';
    } else if (err.message === 'TIMEOUT') {
      result.gps = 'prompt';
      gpsErrorMsg = 'GPS acquisition timed out.';
    } else {
      result.gps = 'unsupported';
      gpsErrorMsg = err.message || 'GPS is unsupported.';
    }
  }

  // 2. Request Microphone MediaStream
  let micErrorMsg: string | undefined;
  if (typeof window !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      result.mic = 'granted';
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_MIC_GRANTED, 'true');
      }
      // Immediately stop all audio tracks to release microphone hardware
      stream.getTracks().forEach((track) => track.stop());
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        result.mic = 'denied';
        micErrorMsg = 'Microphone permission was denied by the browser.';
      } else {
        result.mic = 'unsupported';
        micErrorMsg = err.message || 'Microphone access failed.';
      }
    }
  } else {
    result.mic = 'unsupported';
  }

  // Save overall agreement status if at least one was granted or user went through flow
  setUserAgreed(true);

  if (gpsErrorMsg || micErrorMsg) {
    result.errorMessage = [gpsErrorMsg, micErrorMsg].filter(Boolean).join(' | ');
  }

  return result;
}
