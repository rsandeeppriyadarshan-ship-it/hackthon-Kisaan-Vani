/**
 * Central App URL & APK Configuration for Krushak Bani Odisha
 * - APP_URL defaults to window.location.origin in the browser.
 * - If APK_URL is set (non-empty string), the "Get the App" QR code and share link
 *   will automatically use APK_URL instead of APP_URL.
 */

export const APK_URL: string =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APK_URL) || '';

export const APP_URL: string =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_URL) ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://krushakbani.odisha.gov.in');

/**
 * Returns APK_URL if configured, otherwise APP_URL (window.location.origin by default).
 */
export function getPublicAppOrApkUrl(): string {
  const trimmedApk = APK_URL.trim();
  if (trimmedApk.length > 0) {
    return trimmedApk;
  }
  return APP_URL;
}
