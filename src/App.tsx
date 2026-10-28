/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, WeatherData, FarmerProfile } from './types';
import { BOOTSTRAPPED_ADMIN_EMAIL } from './config/admin';
import { fetchDistrictWeather, ODISHA_DISTRICTS } from './services/weatherService';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CropDoctor } from './components/features/CropDoctor';
import { CropStressCheck } from './components/features/CropStressCheck';
import { PesticideAdvice } from './components/features/PesticideAdvice';
import { WaterAdvice } from './components/features/WaterAdvice';
import { FertiliserAdvice } from './components/features/FertiliserAdvice';
import { SprayLog } from './components/features/SprayLog';
import { FarmCalendar } from './components/features/FarmCalendar';
import { LabourConnect } from './components/features/LabourConnect';
import { SnakebiteSafety } from './components/features/SnakebiteSafety';
import { PoisoningGuide } from './components/features/PoisoningGuide';
import { CropRotationAdvice } from './components/features/CropRotationAdvice';
import { WeatherAlerts } from './components/features/WeatherAlerts';
import { CropHistory } from './components/features/CropHistory';
import { OfflineMap } from './components/features/OfflineMap';
import { VoiceModal } from './components/VoiceModal';
import { SafetyAlertModal } from './components/features/SafetyAlertModal';
import { MobileDownloadModal } from './components/MobileDownloadModal';
import { LocationModal } from './components/LocationModal';
import { OnboardingFlow } from './components/OnboardingFlow';
import { FarmerIdCardModal } from './components/FarmerIdCardModal';
import { InteractiveAppTraining } from './components/InteractiveAppTraining';
import { SignOutConfirmModal } from './components/SignOutConfirmModal';
import { LockedFieldsCorrectionModal } from './components/LockedFieldsCorrectionModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { MicTestModal } from './components/MicTestModal';
import { VoiceTestPage } from './components/VoiceTestPage';
import { ResetAppModal } from './components/ResetAppModal';
import { SplashScreen } from './components/SplashScreen';
import {
  UserLocation,
  requestAccurateUserLocation,
  buildUserLocationFromCoords
} from './services/locationService';
import {
  getCurrentSignedInFarmer,
  signOutFarmer,
  registerAndSignInFarmer
} from './services/authDatabaseService';
import {
  processOfflineSyncQueue,
  saveDeviceSettingToPhoneOnly
} from './services/localFirstSyncEngine';
import {
  abortActiveRecording,
  flushOfflineVoiceClipQueue
} from './services/SpeechService';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SUPPORTED_LANGUAGES, t, translatePlaceName } from './services/translations';
import { checkAndTriggerDueReminders } from './utils/farmScheduler';
import {
  Home,
  Camera,
  ShieldCheck,
  PhoneCall,
  ChevronLeft,
  MapPin,
  Mic,
  QrCode,
  ArrowDownCircle,
  X
} from 'lucide-react';

export default function App() {
  // Farmer Profile State (persisted in local-first IndexedDB + localStorage)
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(() => {
    return getCurrentSignedInFarmer();
  });

  const [lang, setLang] = useState<Language>(() => {
    const saved = getCurrentSignedInFarmer();
    if (saved?.language || saved?.preferredLanguage) {
      return saved.language || saved.preferredLanguage || 'or';
    }
    if (typeof window !== 'undefined') {
      const localLang = window.localStorage.getItem('krushak_preferred_language') as Language | null;
      if (localLang && ['or', 'en', 'hi', 'te', 'bn', 'ta'].includes(localLang)) {
        return localLang;
      }
    }
    return 'or'; // Odia by default
  });

  const isAdmin = Boolean(
    farmerProfile?.isAdmin ||
      farmerProfile?.role === 'admin' ||
      (farmerProfile?.email &&
        farmerProfile.email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase())
  );

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (['/voice-test', '/status', '/i18n-check', '/sync-test'].includes(path)) {
        return 'test_page';
      }
    }
    return 'dashboard';
  });

  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => {
    const saved = getCurrentSignedInFarmer();
    return saved?.gpsLocation?.district || saved?.district || 'Cuttack';
  });
  const [selectedBlock, setSelectedBlock] = useState<string>(() => {
    const saved = getCurrentSignedInFarmer();
    return saved?.gpsLocation?.block || saved?.block || 'Cuttack Sadar';
  });
  const [selectedVillage, setSelectedVillage] = useState<string>(() => {
    const saved = getCurrentSignedInFarmer();
    const rawVil = saved?.gpsLocation?.village || saved?.village;
    return rawVil ? rawVil.replace(/\s*\(SAMPLE\)/gi, '') : 'Kandarpur';
  });
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Modals — Setup runs ONLY on the very first open when no farmer is signed in
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !getCurrentSignedInFarmer();
  });
  const [isFarmerIdModalOpen, setIsFarmerIdModalOpen] = useState(false);
  const [isPostRegistrationIdCard, setIsPostRegistrationIdCard] = useState(false);
  const [isAppTrainingOpen, setIsAppTrainingOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isMicTestModalOpen, setIsMicTestModalOpen] = useState(false);
  const [isSafetyAlertOpen, setIsSafetyAlertOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.pathname === '/reset' ||
        window.location.search.includes('reset=true')
      );
    }
    return false;
  });
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [langToastMessage, setLangToastMessage] = useState<string | null>(null);
  const [reminderToast, setReminderToast] = useState<{ title: string; body: string } | null>(null);

  // Native PWA Deferred Prompt & Banner State
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);
  const [isPwaBannerDismissed, setIsPwaBannerDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone mode (already installed on Home Screen)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
    setIsAppInstalled(isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleNativePromptInstall = async () => {
    if (!deferredInstallPrompt) {
      setIsDownloadModalOpen(true);
      return;
    }
    try {
      await deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsAppInstalled(true);
        setDeferredInstallPrompt(null);
        setIsPwaBannerDismissed(true);
      }
    } catch (err) {
      console.warn('PWA install prompt error:', err);
    }
  };

  // Initialize UserLocation from saved confirmed gpsLocation in farmer's profile if available
  const [userLocation, setUserLocation] = useState<UserLocation | null>(() => {
    const saved = getCurrentSignedInFarmer();
    if (saved?.gpsLocation?.lat && saved?.gpsLocation?.lon) {
      return buildUserLocationFromCoords(
        saved.gpsLocation.lat,
        saved.gpsLocation.lon,
        saved.gpsLocation.accuracyMeters || 25,
        Date.now(),
        saved.gpsLocation.confirmed ?? true
      );
    }
    return null;
  });

  const handleLanguageChange = (newLang: Language) => {
    abortActiveRecording('aborted_language_change');
    setLang(newLang);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('krushak_preferred_language', newLang);
      } catch {}
    }
    saveDeviceSettingToPhoneOnly('preferredLanguage', newLang).catch(() => {});

    // Persist in farmer profile & sync to server
    const currentFarmer = getCurrentSignedInFarmer();
    if (currentFarmer) {
      const updated = registerAndSignInFarmer(
        {
          ...currentFarmer,
          language: newLang,
          preferredLanguage: newLang
        },
        ['language', 'preferredLanguage']
      );
      setFarmerProfile(updated);
      processOfflineSyncQueue().catch(() => {});
    }

    const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === newLang);
    const langName = langMeta ? `${langMeta.nativeName} (${langMeta.name})` : newLang;
    setLangToastMessage(t('lang_changed_toast', newLang, { langName }));
    window.setTimeout(() => {
      setLangToastMessage(null);
    }, 3500);
  };

  const handleLocationDetected = (loc: UserLocation) => {
    setUserLocation(loc);
    if (loc.nearestDistrict) {
      setSelectedDistrict(loc.nearestDistrict.name_en);
    }
    if (loc.nearestBlock) {
      setSelectedBlock(loc.nearestBlock.name_en);
    }
    if (loc.nearestVillage) {
      setSelectedVillage(loc.nearestVillage.name_en);
    }
  };

  const handleSaveConfirmedPlace = (place: {
    district: string;
    block: string;
    village: string;
    lat?: number;
    lon?: number;
    accuracyMeters?: number;
    placeName?: string;
    placeNameOr?: string;
    confirmed?: boolean;
  }) => {
    setSelectedDistrict(place.district);
    setSelectedBlock(place.block);
    setSelectedVillage(place.village);

    const currentFarmer = getCurrentSignedInFarmer();
    if (currentFarmer) {
      const dObj =
        ODISHA_DISTRICTS.find((d) => d.name_en === place.district) || ODISHA_DISTRICTS[0];
      const lat = place.lat ?? userLocation?.latitude ?? dObj.lat;
      const lon = place.lon ?? userLocation?.longitude ?? dObj.lon;
      const acc = place.accuracyMeters ?? userLocation?.accuracy ?? 25;

      const updated = registerAndSignInFarmer(
        {
          ...currentFarmer,
          district: place.district,
          block: place.block,
          village: place.village,
          gpsLocation: {
            lat,
            lon,
            accuracyMeters: acc,
            poorAccuracyFlag: acc > 500,
            placeName: place.placeName || `${place.village}, ${place.block}, ${place.district}`,
            placeNameOr: place.placeNameOr,
            village: place.village,
            block: place.block,
            district: place.district,
            confirmed: true
          }
        },
        ['gpsLocation']
      );
      setFarmerProfile(updated);
      processOfflineSyncQueue().catch(() => {});
    }
  };

  const handleFarmerRegistered = (
    profile: FarmerProfile,
    loc?: UserLocation | null,
    meta?: { isNewRegistration: boolean }
  ) => {
    setFarmerProfile(profile);
    if (profile.district) {
      setSelectedDistrict(profile.district);
    }
    if (profile.block) {
      setSelectedBlock(profile.block);
    }
    if (profile.village) {
      setSelectedVillage(profile.village.replace(/\s*\(SAMPLE\)/gi, ''));
    }
    const restoredLang = profile.language || profile.preferredLanguage || 'or';
    setLang(restoredLang);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('krushak_preferred_language', restoredLang);
      } catch {}
    }
    saveDeviceSettingToPhoneOnly('preferredLanguage', restoredLang).catch(() => {});
    if (loc) {
      handleLocationDetected(loc);
    } else if (profile.gpsLocation?.lat && profile.gpsLocation?.lon) {
      setUserLocation(
        buildUserLocationFromCoords(
          profile.gpsLocation.lat,
          profile.gpsLocation.lon,
          profile.gpsLocation.accuracyMeters || 25,
          Date.now(),
          true
        )
      );
    }
    setIsOnboardingOpen(false);

    processOfflineSyncQueue().catch(() => {});

    if (meta?.isNewRegistration) {
      setIsPostRegistrationIdCard(true);
      setIsFarmerIdModalOpen(true);
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleRequestSignOut = () => {
    setIsSignOutConfirmOpen(true);
  };

  const handleConfirmedSignOut = async () => {
    await signOutFarmer();
    setIsSignOutConfirmOpen(false);
    setFarmerProfile(null);
    setIsFarmerIdModalOpen(false);
    setIsOnboardingOpen(true);
  };

  // Requirement 5: Reuse saved confirmed location in farmer's profile for weather & advice;
  // only auto-detect GPS on startup if no confirmed location is saved yet.
  useEffect(() => {
    const onOnlineFlushVoice = () => {
      flushOfflineVoiceClipQueue().catch(() => {});
      processOfflineSyncQueue().catch(() => {});
    };
    window.addEventListener('online', onOnlineFlushVoice);

    if (!isOnboardingOpen) {
      if (farmerProfile) {
        processOfflineSyncQueue().catch(() => {});
        flushOfflineVoiceClipQueue().catch(() => {});
      }

      const hasConfirmedSavedGps = Boolean(
        farmerProfile?.gpsLocation?.lat &&
          farmerProfile?.gpsLocation?.lon &&
          farmerProfile?.gpsLocation?.confirmed !== false
      );

      if (!hasConfirmedSavedGps && !userLocation) {
        requestAccurateUserLocation(3000)
          .then((loc) => {
            handleLocationDetected(loc);
          })
          .catch(() => {
            // Fall back to saved location or manual selection of district/block
          });
      }
    }

    const onSwitchLangEvent = (e: Event) => {
      const custom = e as CustomEvent<Language>;
      if (custom.detail) {
        handleLanguageChange(custom.detail);
      }
    };
    window.addEventListener('krushak:switch-language', onSwitchLangEvent);

    return () => {
      window.removeEventListener('online', onOnlineFlushVoice);
      window.removeEventListener('krushak:switch-language', onSwitchLangEvent);
    };
  }, [farmerProfile, isOnboardingOpen, lang]);

  // Background Task Scheduler: Periodically check due farming tasks every 60s
  useEffect(() => {
    if (isOnboardingOpen) return;

    const triggerToast = (title: string, body: string) => {
      setReminderToast({ title, body });
      window.setTimeout(() => setReminderToast(null), 6000);
    };

    // Initial check on load
    checkAndTriggerDueReminders(farmerProfile, weather, lang, triggerToast);

    // Periodic check every 60 seconds
    const interval = window.setInterval(() => {
      checkAndTriggerDueReminders(farmerProfile, weather, lang, triggerToast);
    }, 60000);

    return () => window.clearInterval(interval);
  }, [farmerProfile, weather, lang, isOnboardingOpen]);

  // Cross-feature pre-filled data
  const [prefillCropId, setPrefillCropId] = useState<string>('paddy');
  const [prefillDiseaseId, setPrefillDiseaseId] = useState<string>('rice_blast');
  const [prefillLogData, setPrefillLogData] = useState<{
    product: string;
    crop: string;
    dose: string;
    phi?: number;
  } | null>(null);

  // Requirement 6: Fetch Open-Meteo weather using the confirmed latitude and longitude, not just the district center
  useEffect(() => {
    const dObj =
      ODISHA_DISTRICTS.find((d) => d.name_en === selectedDistrict) || ODISHA_DISTRICTS[0];
    const targetLat =
      userLocation?.latitude ?? farmerProfile?.gpsLocation?.lat ?? dObj.lat;
    const targetLon =
      userLocation?.longitude ?? farmerProfile?.gpsLocation?.lon ?? dObj.lon;

    fetchDistrictWeather(targetLat, targetLon, dObj.name_en).then((w) => {
      setWeather(w);
    });
  }, [
    selectedDistrict,
    userLocation?.latitude,
    userLocation?.longitude,
    farmerProfile?.gpsLocation?.lat,
    farmerProfile?.gpsLocation?.lon
  ]);

  const handleNavigateTo = (featureId: string) => {
    setActiveTab(featureId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDoctorToAdvice = (cropId: string, diseaseId: string) => {
    setPrefillCropId(cropId);
    setPrefillDiseaseId(diseaseId);
    handleNavigateTo('pesticide');
  };

  const handleAdviceToLog = (product: string, crop: string, dose: string, phi?: number) => {
    setPrefillLogData({ product, crop, dose, phi });
    handleNavigateTo('spray_log');
  };

  const localizedBreadcrumbPlace = [
    selectedVillage ? translatePlaceName(selectedVillage, lang) : '',
    selectedBlock ? translatePlaceName(selectedBlock, lang) : '',
    translatePlaceName(selectedDistrict, lang)
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      {/* Initial Branding Splash Screen with Prominent HD Logo & Golden Border */}
      {showSplash && (
        <SplashScreen onFinished={() => setShowSplash(false)} lang={lang} />
      )}

      {/* Top Header */}
      <Header
        lang={lang}
        setLang={handleLanguageChange}
        selectedDistrict={selectedDistrict}
        selectedBlock={selectedBlock}
        selectedVillage={selectedVillage}
        onDistrictChange={setSelectedDistrict}
        weather={weather}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onNavigateTo={handleNavigateTo}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenFarmerIdModal={() => {
          setIsPostRegistrationIdCard(false);
          setIsFarmerIdModalOpen(true);
        }}
        onOpenTraining={() => setIsAppTrainingOpen(true)}
        onOpenCorrectionModal={() => setIsCorrectionModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenMicTest={() => setIsMicTestModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onSignOut={handleRequestSignOut}
        profile={farmerProfile}
        userLocation={userLocation}
      />

      {/* Native-Looking PWA Install App Banner when beforeinstallprompt is captured */}
      {deferredInstallPrompt && !isAppInstalled && !isPwaBannerDismissed && !isOnboardingOpen && (
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white border-b-2 border-amber-400 px-3 sm:px-6 py-2.5 shadow-lg flex items-center justify-between gap-3 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/pwa-192x192.png"
              alt="KrushakBani Icon"
              className="w-10 h-10 rounded-2xl border border-amber-300/80 shadow-xs shrink-0 object-cover"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-white truncate">
                  {lang === 'or' ? 'କୃଷକ ବାଣୀ ଓଡ଼ିଶା' : 'Krushak Bani Odisha'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black text-[10px] uppercase shrink-0">
                  {lang === 'or' ? 'ଫ୍ରି ଆପ୍' : 'PWA App'}
                </span>
              </div>
              <p className="text-[11px] text-amber-200 font-bold truncate">
                {lang === 'or'
                  ? 'ହୋମ୍ ସ୍କ୍ରିନ୍‌ରେ ଆପ୍ ଯୋଡ଼ି ୧-ଟ୍ୟାପ୍‌ରେ ବିନା ନେଟୱାର୍କରେ ଚଲାନ୍ତୁ'
                  : 'Install to Home Screen for 1-tap instant offline access'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleNativePromptInstall}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ArrowDownCircle className="w-4 h-4 stroke-[2.5]" />
              <span>{lang === 'or' ? 'ଆପ୍ ଇନ୍‌ଷ୍ଟଲ୍ କରନ୍ତୁ' : 'Install App'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPwaBannerDismissed(true)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              title={t('close_btn', lang)}
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Short Notification Toast when Language Changes */}
      {langToastMessage && (
        <div className="bg-emerald-950 text-amber-300 px-4 py-2 text-xs font-black text-center border-b border-emerald-700 shadow-sm animate-in fade-in">
          🌐 {langToastMessage}
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-12">
        {/* Breadcrumb if inside a sub-module */}
        {activeTab !== 'dashboard' && (
          <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
            <button
              onClick={() => handleNavigateTo('dashboard')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-100 shadow-xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t('back_to_home', lang)}</span>
            </button>

            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
              title={t('update_location_btn', lang)}
            >
              {userLocation ? (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-600"></span>
                </span>
              ) : (
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              )}
              <span>{localizedBreadcrumbPlace}</span>
              <span className="text-[10px] text-emerald-600 underline font-normal">
                {t('edit_btn', lang)}
              </span>
            </button>
          </div>
        )}

        {/* Feature Component Switcher */}
        {activeTab === 'dashboard' && (
          <Dashboard
            lang={lang}
            weather={weather}
            selectedDistrict={selectedDistrict}
            selectedBlock={selectedBlock}
            selectedVillage={selectedVillage}
            onNavigateTo={handleNavigateTo}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onTriggerSafetyAlert={() => setIsSafetyAlertOpen(true)}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
            userLocation={userLocation}
            profile={farmerProfile}
            onProfileUpdated={(updated) => {
              const saved = registerAndSignInFarmer(updated);
              setFarmerProfile(saved);
            }}
          />
        )}

        {activeTab === 'crop_doctor' && (
          <CropDoctor
            lang={lang}
            onNavigateToAdvice={handleDoctorToAdvice}
            onNavigateToLog={handleAdviceToLog}
          />
        )}

        {activeTab === 'crop_stress' && (
          <CropStressCheck
            lang={lang}
            onNavigateToWater={() => handleNavigateTo('water')}
            onNavigateToFertiliser={() => handleNavigateTo('fertiliser')}
          />
        )}

        {activeTab === 'pesticide' && (
          <PesticideAdvice
            lang={lang}
            weather={weather}
            initialCropId={prefillCropId}
            initialDiseaseId={prefillDiseaseId}
            onTriggerSafetyAlert={() => setIsSafetyAlertOpen(true)}
            onProceedToLog={handleAdviceToLog}
          />
        )}

        {activeTab === 'water' && <WaterAdvice lang={lang} weather={weather} />}

        {activeTab === 'fertiliser' && <FertiliserAdvice lang={lang} weather={weather} />}

        {activeTab === 'spray_log' && (
          <SprayLog
            lang={lang}
            onTriggerSafetyAlert={() => setIsSafetyAlertOpen(true)}
            onNavigateToPoisoning={() => handleNavigateTo('poisoning')}
            prefillData={prefillLogData}
          />
        )}

        {activeTab === 'farm_calendar' && (
          <FarmCalendar
            lang={lang}
            weather={weather}
            selectedDistrict={selectedDistrict}
            farmerProfile={farmerProfile}
            onTriggerToast={(title, body) => {
              setReminderToast({ title, body });
              window.setTimeout(() => setReminderToast(null), 6000);
            }}
          />
        )}

        {activeTab === 'labour_connect' && (
          <LabourConnect lang={lang} currentDistrict={selectedDistrict} />
        )}

        {(activeTab === 'snakebite' || activeTab === 'poisoning') && (
          <div className="space-y-5">
            {/* Unified 108 Emergency Two-Tab Switcher & Direct 108 Call Action */}
            <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-sm border border-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="grid grid-cols-2 gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => handleNavigateTo('snakebite')}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'snakebite'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  <span>🐍</span>
                  <span>
                    {lang === 'or'
                      ? 'ସାପ କାମୁଡ଼ା ଜରୁରୀକାଳୀନ (୧୦୮)'
                      : lang === 'hi'
                      ? 'सांप काटने की आपातकालीन सेवा (108)'
                      : 'Snakebite Emergency (108)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigateTo('poisoning')}
                  className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'poisoning'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-stone-100 text-stone-700 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  <span>🧪</span>
                  <span>
                    {lang === 'or'
                      ? 'ବିଷକ୍ରିୟା ପ୍ରାଥମିକ ଚିକିତ୍ସା'
                      : lang === 'hi'
                      ? 'कीटनाशक विषाक्तता प्राथमिक उपचार'
                      : 'Poisoning First Aid'}
                  </span>
                </button>
              </div>

              <a
                href="tel:108"
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black px-5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all shrink-0"
              >
                <PhoneCall className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {lang === 'or'
                    ? '108 କଲ୍ କରନ୍ତୁ'
                    : lang === 'hi'
                    ? '108 कॉल करें'
                    : 'Call 108'}
                </span>
              </a>
            </div>

            {activeTab === 'snakebite' ? (
              <SnakebiteSafety lang={lang} />
            ) : (
              <PoisoningGuide lang={lang} />
            )}
          </div>
        )}

        {activeTab === 'rotation' && <CropRotationAdvice lang={lang} />}

        {activeTab === 'weather_alerts' && (
          <WeatherAlerts
            lang={lang}
            alerts={weather?.active_alerts || []}
            currentDistrict={selectedDistrict}
            onDistrictChange={setSelectedDistrict}
          />
        )}

        {activeTab === 'crop_history' && (
          <CropHistory
            lang={lang}
            onNavigateToRotation={() => handleNavigateTo('rotation')}
          />
        )}

        {activeTab === 'offline_map' && (
          <OfflineMap
            lang={lang}
            currentDistrict={selectedDistrict}
            onDistrictSelect={setSelectedDistrict}
            userLocation={userLocation}
            onLocationUpdate={handleLocationDetected}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
          />
        )}

        {(activeTab === 'test_page' || activeTab === 'voice_test') && (
          isAdmin ? (
            <VoiceTestPage
              lang={lang}
              onLanguageChange={handleLanguageChange}
              onBackToHome={() => {
                if (typeof window !== 'undefined') {
                  window.history.pushState({}, '', '/');
                }
                handleNavigateTo('dashboard');
              }}
            />
          ) : (
            <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-red-500 text-center max-w-lg mx-auto space-y-4 my-8">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 font-black flex items-center justify-center mx-auto text-xl">
                🔒
              </div>
              <h2 className="text-lg font-black text-stone-900">
                {lang === 'or' ? 'ପ୍ରଶାସକ ଅନୁମତି ଆବଶ୍ୟକ (Admin Access Only)' : 'Administrator Access Required'}
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                {lang === 'or'
                  ? 'ଏହି ଟେଷ୍ଟ ପୃଷ୍ଠାଗୁଡ଼ିକ (/status, /voice-test, /i18n-check, /sync-test) କେବଳ ପ୍ରଶାସକ (Admin) ଆକାଉଣ୍ଟ ପାଇଁ ସୁରକ୍ଷିତ।'
                  : 'Test pages (/status, /voice-test, /i18n-check, /sync-test) are open only for registered Administrator accounts.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => setIsAdminModalOpen(true)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md cursor-pointer"
                >
                  {lang === 'or' ? 'ପ୍ରଶାସକ ପୋର୍ଟାଲ୍ ଖୋଲନ୍ତୁ' : 'Open Admin Portal'}
                </button>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') window.history.pushState({}, '', '/');
                    handleNavigateTo('dashboard');
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs cursor-pointer"
                >
                  {lang === 'or' ? 'ମୁଖ୍ୟ ପୃଷ୍ଠାକୁ ଫେରନ୍ତୁ' : 'Back to Home'}
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Small round "Get the App" ("ଆପ୍ ପାଆନ୍ତୁ") floating button on the LEFT side near the bottom */}
      {!isOnboardingOpen && (
        <div className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40 flex items-center">
          <button
            type="button"
            onClick={() => setIsDownloadModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-black p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 border-2 border-amber-400 cursor-pointer"
            title={t('get_app_btn', lang)}
            aria-label={t('get_app_btn', lang)}
          >
            <QrCode className="w-5 h-5 text-amber-300 stroke-[2.4]" />
            <span className="text-xs font-black hidden sm:inline">
              {t('get_app_btn', lang)}
            </span>
          </button>
        </div>
      )}

      {/* Floating Voice Assistant Quick Mic Button on the RIGHT side near the bottom */}
      {!isOnboardingOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 group">
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="relative flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 border-2 border-amber-200 cursor-pointer"
            title={t('voice_command', lang)}
          >
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-700 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-900"></span>
            </span>
            <Mic className="w-5 h-5 text-stone-950 stroke-[2.5]" />
            <span className="text-xs font-black hidden sm:inline">
              {t('voice_command', lang)}
            </span>
          </button>
        </div>
      )}

      {/* Floating Bottom Quick Navigation Bar for Mobile */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-3 py-2 flex items-center justify-around sm:hidden shadow-lg">
        <button
          onClick={() => handleNavigateTo('dashboard')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === 'dashboard' ? 'text-emerald-800' : 'text-stone-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>{t('home', lang)}</span>
        </button>

        <button
          onClick={() => handleNavigateTo('crop_doctor')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === 'crop_doctor' ? 'text-emerald-800' : 'text-stone-400'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span>{t('nav_doctor', lang)}</span>
        </button>

        <button
          onClick={() => handleNavigateTo('pesticide')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === 'pesticide' ? 'text-emerald-800' : 'text-stone-400'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span>{t('nav_spray', lang)}</span>
        </button>

        <button
          onClick={() => handleNavigateTo('offline_map')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold ${
            activeTab === 'offline_map' ? 'text-blue-800' : 'text-stone-400'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span>{t('nav_map', lang)}</span>
        </button>

        <button
          onClick={() => handleNavigateTo('snakebite')}
          className="flex flex-col items-center gap-0.5 text-[10px] font-black text-red-600 animate-pulse"
        >
          <PhoneCall className="w-5 h-5 stroke-[2.5]" />
          <span>108</span>
        </button>
      </div>

      {/* Voice Command Modal (Feature 12) */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        lang={lang}
        onLanguageChange={handleLanguageChange}
        onNavigateTo={handleNavigateTo}
        onTriggerSafetyAlert={() => setIsSafetyAlertOpen(true)}
        onOpenMicTest={() => setIsMicTestModalOpen(true)}
      />

      {/* 3-Second Microphone Test Screen Modal */}
      <MicTestModal
        isOpen={isMicTestModalOpen}
        onClose={() => setIsMicTestModalOpen(false)}
        lang={lang}
      />

      {/* Spray Safety Alert Modal (Feature 9) */}
      <SafetyAlertModal
        isOpen={isSafetyAlertOpen}
        onClose={() => setIsSafetyAlertOpen(false)}
        lang={lang}
        onProceedToLog={() => handleNavigateTo('spray_log')}
      />

      {/* Clean "Get the App" Modal (QR Code + Copy Link + Share + Install) */}
      <MobileDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        lang={lang}
      />

      {/* Location Picker, Interactive Map & GPS Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        lang={lang}
        currentDistrict={selectedDistrict}
        currentBlock={selectedBlock}
        currentVillage={selectedVillage}
        onSelectDistrict={(d) => setSelectedDistrict(d)}
        onSelectPlace={handleSaveConfirmedPlace}
        onLocationDetected={handleLocationDetected}
        savedLocation={farmerProfile?.gpsLocation || null}
      />

      {/* 7-Step First-Time Setup, Registration & Login Flow */}
      <OnboardingFlow
        isOpen={isOnboardingOpen}
        onClose={farmerProfile ? () => setIsOnboardingOpen(false) : undefined}
        onComplete={handleFarmerRegistered}
        initialLang={lang}
        onLanguageChange={handleLanguageChange}
        onNavigateTo={handleNavigateTo}
      />

      {/* Official Farmer ID Card Modal (With QR containing only Farmer ID & Recent AI Calls) */}
      <FarmerIdCardModal
        isOpen={isFarmerIdModalOpen}
        onClose={() => {
          const shouldLaunchTraining = isPostRegistrationIdCard;
          setIsFarmerIdModalOpen(false);
          setIsPostRegistrationIdCard(false);
          if (shouldLaunchTraining) {
            setIsAppTrainingOpen(true);
          }
        }}
        profile={farmerProfile}
        lang={lang}
        isPostRegistration={isPostRegistrationIdCard}
        onStartTraining={() => {
          setIsFarmerIdModalOpen(false);
          setIsPostRegistrationIdCard(false);
          setIsAppTrainingOpen(true);
        }}
        onSignOut={handleRequestSignOut}
      />

      {/* Live Interactive App Training */}
      <InteractiveAppTraining
        isOpen={isAppTrainingOpen}
        lang={lang}
        onClose={() => setIsAppTrainingOpen(false)}
        onNavigateTo={handleNavigateTo}
      />

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={isSignOutConfirmOpen}
        onClose={() => setIsSignOutConfirmOpen(false)}
        onConfirmSignOut={handleConfirmedSignOut}
        lang={lang}
        profile={farmerProfile}
      />

      {/* Locked Fields Correction Request Modal */}
      <LockedFieldsCorrectionModal
        isOpen={isCorrectionModalOpen}
        onClose={() => setIsCorrectionModalOpen(false)}
        profile={farmerProfile}
        lang={lang}
      />

      {/* Admin Portal Modal */}
      <AdminPortalModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        lang={lang}
        onFarmerRecordUpdated={() => {
          const refreshed = getCurrentSignedInFarmer();
          if (refreshed) {
            setFarmerProfile(refreshed);
          }
        }}
      />

      {/* Hidden Diagnostic Reset Modal (/reset or ?reset=true) - Admin Only */}
      <ResetAppModal
        isOpen={isResetModalOpen && isAdmin}
        onClose={() => {
          setIsResetModalOpen(false);
          if (typeof window !== 'undefined' && window.location.pathname === '/reset') {
            window.history.pushState({}, '', '/');
          }
        }}
        lang={lang}
      />

      {/* In-App Floating Farm Task Reminder Toast Notification */}
      {reminderToast && (
        <div className="fixed top-16 inset-x-4 max-w-md mx-auto z-50 bg-stone-900/95 text-white p-4 rounded-3xl border-2 border-amber-400 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shrink-0 text-lg shadow-sm">
            🔔
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black text-amber-300 leading-tight">
              {reminderToast.title}
            </h4>
            <p className="text-xs text-stone-200 mt-1 leading-snug">
              {reminderToast.body}
            </p>
          </div>
          <button
            onClick={() => setReminderToast(null)}
            className="p-1 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Offline Mode Indicator */}
      <OfflineIndicator lang={lang} />
    </div>
  );
}
