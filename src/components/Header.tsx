import React, { useState, useEffect, useMemo } from 'react';
import { Language, WeatherData, FarmerProfile } from '../types';
import { NavigationDrawer } from './NavigationDrawer';
import { SUPPORTED_LANGUAGES } from '../services/languageService';
import {
  MoreVertical,
  Mic,
  CloudSun,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  QrCode,
  Globe,
  Play,
  LogOut,
  RefreshCw,
  Cloud,
  Smartphone,
  Lock,
} from 'lucide-react';
import { UserLocation, getMergedOdishaState } from '../services/locationService';
import {
  subscribeSyncStatus,
  SyncEngineSnapshot,
} from '../services/localFirstSyncEngine';
import { t, translatePlaceName, formatLocalizedUnit } from '../services/translations';

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  selectedDistrict: string;
  selectedBlock?: string;
  selectedVillage?: string;
  onDistrictChange: (districtName: string) => void;
  weather: WeatherData | null;
  onOpenVoiceModal: () => void;
  onNavigateTo: (featureId: string) => void;
  onOpenLocationModal?: () => void;
  onOpenFarmerIdModal?: () => void;
  onOpenTraining?: () => void;
  onOpenCorrectionModal?: () => void;
  onOpenAdminModal?: () => void;
  onOpenMicTest?: () => void;
  onOpenDownloadModal?: () => void;
  onSignOut?: () => void;
  profile?: FarmerProfile | null;
  userLocation?: UserLocation | null;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  setLang,
  selectedDistrict,
  selectedBlock,
  selectedVillage,
  weather,
  onOpenVoiceModal,
  onNavigateTo,
  onOpenLocationModal,
  onOpenFarmerIdModal,
  onOpenTraining,
  onOpenCorrectionModal,
  onOpenAdminModal,
  onOpenMicTest,
  onOpenDownloadModal,
  onSignOut,
  profile,
  userLocation,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [syncSnap, setSyncSnap] = useState<SyncEngineSnapshot>({
    status: 'saved_on_phone',
    pendingCount: 0,
    lastSyncedAt: null,
    isOnline: true,
    lastError: null,
  });

  useEffect(() => {
    return subscribeSyncStatus((snap) => {
      setSyncSnap(snap);
    });
  }, []);

  const [addressVersion, setAddressVersion] = useState<number>(0);
  useEffect(() => {
    const onUpdated = () => setAddressVersion((v) => v + 1);
    window.addEventListener('krushak:addresses-updated', onUpdated);
    return () => window.removeEventListener('krushak:addresses-updated', onUpdated);
  }, []);

  // Resolve localized display names for Village, Block, and District
  const placeDisplay = useMemo(() => {
    const state = getMergedOdishaState();
    const dObj =
      state.districts.find((d) => d.name_en === selectedDistrict) ||
      state.districts[0];
    const bObj = selectedBlock
      ? dObj.blocks.find((b) => b.name_en.toLowerCase() === selectedBlock.toLowerCase())
      : dObj.blocks[0];
    const vObj =
      selectedVillage && bObj
        ? bObj.villages.find((v) => v.name_en.toLowerCase() === selectedVillage.toLowerCase())
        : undefined;

    const distText =
      lang === 'or'
        ? dObj.name_or || translatePlaceName(dObj.name_en, 'or')
        : translatePlaceName(dObj.name_en, lang);
    const blockText =
      lang === 'or'
        ? bObj?.name_or || translatePlaceName(selectedBlock || dObj.blocks[0]?.name_en || '', 'or')
        : translatePlaceName(selectedBlock || bObj?.name_en || '', lang);
    const villageText =
      lang === 'or'
        ? vObj?.name_or || translatePlaceName(selectedVillage || '', 'or')
        : translatePlaceName(selectedVillage || vObj?.name_en || '', lang);

    return {
      district: distText,
      block: blockText,
      village: villageText,
      fullLabel: [villageText, blockText, distText].filter(Boolean).join(', '),
      shortLabel: [villageText || blockText, distText].filter(Boolean).join(', '),
    };
  }, [lang, selectedDistrict, selectedBlock, selectedVillage, addressVersion]);

  const formatLastSyncedTime = (iso: string | null): string => {
    if (!iso) return t('last_synced_never', lang);
    try {
      const date = new Date(iso);
      const timeStr = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      return t('last_synced_label', lang, { time: timeStr });
    } catch {
      return t('last_synced_never', lang);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-emerald-900 text-white shadow-lg border-b border-emerald-800">
        {/* Main Navigation Bar */}
        <div className="header-container max-w-7xl mx-auto px-3 sm:px-6 min-h-14 sm:min-h-16 py-2 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Three-Dot Menu Button + Brand Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsDrawerOpen((prev) => !prev)}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-emerald-950/80 hover:bg-emerald-800 text-amber-300 border border-emerald-700/80 transition-colors cursor-pointer shrink-0 shadow-2xs"
              aria-label={t('account_menu', lang)}
              title={t('account_menu', lang)}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            <div
              onClick={() => onNavigateTo('dashboard')}
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none min-w-0"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md p-1 group-hover:scale-105 transition-transform shrink-0">
                <img
                  src="/icon.svg"
                  alt="Krushak Bani Odisha Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <h1 className="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight text-white leading-tight truncate">
                  {t('app_title', lang)}
                </h1>
                <p className="hidden sm:block text-[11px] sm:text-xs text-emerald-200/90 font-medium leading-tight truncate">
                  {t('app_subtitle', lang)}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Desktop & Tablet Live Weather & Accurate Place (Village, Block, District) Selector */}
          <div className="hidden md:flex items-center justify-center gap-2 h-10 bg-emerald-950/60 rounded-xl px-3.5 border border-emerald-800/80 text-xs shrink-0">
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="flex items-center gap-1.5 text-emerald-100 hover:text-amber-300 font-bold transition-colors cursor-pointer"
              title="Select District, Block & Village"
            >
              {userLocation ? (
                <span
                  className="flex h-2.5 w-2.5 relative shrink-0"
                  title="Live GPS Position Active"
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                </span>
              ) : (
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span className="max-w-[240px] lg:max-w-[320px] truncate">
                {placeDisplay.fullLabel}
              </span>
              {userLocation && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200 font-semibold">
                  ±{formatLocalizedUnit(userLocation.accuracy, 'meters', lang)}
                </span>
              )}
            </button>

            {weather && (
              <div className="flex items-center gap-2 pl-2 border-l border-emerald-800 text-emerald-200">
                <CloudSun className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold">
                  {formatLocalizedUnit(weather.temp_c, 'temp_c', lang)}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-800/80 text-amber-300 font-semibold whitespace-nowrap">
                  {weather.max_rain_probability_12h}% {t('rain_chance', lang)}
                </span>

                {weather.active_alerts &&
                  weather.active_alerts.some((a) => a.severity !== 'GREEN') && (
                    <button
                      type="button"
                      onClick={() => onNavigateTo('weather_alerts')}
                      className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse hover:bg-red-500 shadow-xs ml-1 cursor-pointer"
                      title="Active Severe Weather Alert"
                    >
                      <ShieldAlert className="w-3 h-3 shrink-0" />
                      <span>{t('weather_alerts', lang)}</span>
                    </button>
                  )}
              </div>
            )}
          </div>

          {/* Right: Balanced Action Controls */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Quick Place (Village, Block, District) Selector */}
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="flex md:hidden items-center justify-center gap-1 h-9 bg-emerald-950/80 hover:bg-emerald-950 border border-emerald-700/70 px-2.5 rounded-xl text-[11px] font-bold text-amber-300 transition-colors shrink-0 shadow-2xs cursor-pointer"
              title="Select District, Block & Village"
            >
              {userLocation ? (
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              ) : (
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              )}
              <span className="max-w-[115px] truncate">
                {placeDisplay.shortLabel}
              </span>
            </button>

            {/* Indian Languages Voice Command Button */}
            <button
              type="button"
              onClick={onOpenVoiceModal}
              className="relative flex items-center justify-center gap-1.5 h-9 sm:h-10 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-900 font-bold px-2.5 sm:px-3.5 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 group cursor-pointer shrink-0"
              title={t('voice_command', lang)}
            >
              <Mic className="w-4 h-4 text-stone-900 stroke-[2.5] group-hover:scale-110 transition-transform shrink-0" />
              <span className="hidden lg:inline whitespace-nowrap">
                {t('voice_command', lang)}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Left-Sliding NavigationDrawer containing all menu items and the language switcher */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={profile ? profile.name : t('app_title', lang)}
        subtitle={
          profile
            ? `${profile.id} • +91 ${profile.mobile}`
            : t('app_subtitle', lang)
        }
      >
        {/* Sync Status & Accurate Place Summary */}
        <div className="px-4 py-3 bg-stone-50/80 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-emerald-900 truncate">
              📍 {placeDisplay.fullLabel}
            </span>
            {onOpenLocationModal && (
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenLocationModal();
                }}
                className="text-[11px] font-black text-emerald-700 underline shrink-0 cursor-pointer"
              >
                {t('edit_btn', lang)}
              </button>
            )}
          </div>

          {profile && (
            <>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-lg ${
                    syncSnap.status === 'saved_to_server' &&
                    syncSnap.pendingCount === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : syncSnap.status === 'syncing'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-200 text-stone-800'
                  }`}
                >
                  {syncSnap.status === 'saved_to_server' &&
                  syncSnap.pendingCount === 0 ? (
                    <>
                      <Cloud className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t('sync_saved_to_server', lang)}</span>
                    </>
                  ) : syncSnap.status === 'syncing' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
                      <span>{t('sync_syncing', lang)}</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-3.5 h-3.5 text-amber-700" />
                      <span>{t('sync_saved_on_phone', lang)}</span>
                    </>
                  )}
                </span>

                {syncSnap.pendingCount > 0 && (
                  <span className="text-[10px] font-black text-amber-700">
                    {t('sync_queue_pending', lang, {
                      count: syncSnap.pendingCount,
                    })}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-stone-500 font-medium">
                {formatLastSyncedTime(
                  syncSnap.lastSyncedAt || profile.lastSyncedAt || null
                )}
              </div>
            </>
          )}
        </div>

        {/* Account & Diagnostic Menu Links */}
        <div className="py-1.5">
          {onOpenDownloadModal && (
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                onOpenDownloadModal();
              }}
              className="w-full px-4 py-2.5 text-xs font-black text-amber-950 bg-amber-50 hover:bg-amber-100 border-y border-amber-200 flex items-center gap-2.5 cursor-pointer transition-colors"
            >
              <Smartphone className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>
                {lang === 'or'
                  ? '📱 ଆପ୍ ଡାଉନଲୋଡ୍ / ଇନ୍‌ଷ୍ଟଲ୍ (Get App)'
                  : '📱 Get App / Install to Home Screen'}
              </span>
            </button>
          )}

          {onOpenLocationModal && (
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                onOpenLocationModal();
              }}
              className="w-full px-4 py-2.5 text-xs font-bold text-stone-800 hover:bg-emerald-50 flex items-center gap-2.5 cursor-pointer transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                {lang === 'or'
                  ? 'ସ୍ଥାନ ବଦଳାନ୍ତୁ (ଜିଲ୍ଲା, ବ୍ଲକ ଓ ଗାଁ)'
                  : 'Select Place (District, Block & Village)'}
              </span>
            </button>
          )}

          {onOpenFarmerIdModal && profile && (
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                onOpenFarmerIdModal();
              }}
              className="w-full px-4 py-2.5 text-xs font-bold text-stone-800 hover:bg-emerald-50 flex items-center gap-2.5 cursor-pointer transition-colors"
            >
              <QrCode className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{t('farmer_id_card', lang)}</span>
            </button>
          )}

          {onOpenCorrectionModal && profile && (
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                onOpenCorrectionModal();
              }}
              className="w-full px-4 py-2.5 text-xs font-bold text-stone-800 hover:bg-emerald-50 flex items-center gap-2.5 cursor-pointer transition-colors"
            >
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t('locked_fields_btn', lang)}</span>
            </button>
          )}

          {onOpenTraining && (
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                onOpenTraining();
              }}
              className="w-full px-4 py-2.5 text-xs font-bold text-stone-800 hover:bg-emerald-50 flex items-center gap-2.5 cursor-pointer transition-colors"
            >
              <Play className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t('replay_training', lang)}</span>
            </button>
          )}

          {onOpenMicTest && (
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                onOpenMicTest();
              }}
              className="w-full px-4 py-2.5 text-xs font-bold text-stone-800 hover:bg-emerald-50 flex items-center gap-2.5 cursor-pointer transition-colors"
            >
              <Mic className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{t('mic_test_menu', lang)}</span>
            </button>
          )}

            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                onNavigateTo('voice_test');
              }}
              className="w-full px-4 py-2.5 text-xs font-bold text-stone-800 hover:bg-emerald-50 flex items-center gap-2.5 cursor-pointer transition-colors"
            >
              <Mic className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t('voice_command', lang)}</span>
            </button>

          {onOpenAdminModal && (
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                onNavigateTo('dashboard');
                onOpenAdminModal();
              }}
              className="w-full px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 flex items-center gap-2.5 cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{t('admin_portal_btn', lang)}</span>
            </button>
          )}
        </div>

        {/* Language Switcher inside Left NavigationDrawer */}
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-stone-500">
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <span>{t('language_menu_label', lang)}</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {SUPPORTED_LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code as Language)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  lang === l.code
                    ? 'bg-emerald-900 text-white border-emerald-900'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                }`}
              >
                <span>{l.flag}</span>
                <span className="truncate">{l.nativeName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sign Out Action */}
        {onSignOut && profile && (
          <div className="py-1.5">
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                onSignOut();
              }}
              className="w-full px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4 text-red-600 shrink-0" />
              <span>{t('sign_out', lang)}</span>
            </button>
          </div>
        )}
      </NavigationDrawer>
    </>
  );
};
