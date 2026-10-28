import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Language, FarmerProfile, FieldSizeUnit } from '../types';
import { SUPPORTED_LANGUAGES, t } from '../services/translations';
import {
  isDemoMode,
  sendMobileOtp,
  verifyMobileOtp,
  convertFieldSizeToAcres,
  generateVerifiedUniqueFarmerId,
  registerAndSignInFarmer,
  markPermissionsAskedOnce,
  OTP_RESEND_SECONDS
} from '../services/authDatabaseService';
import { getInitials } from './FarmerIdCardModal';
import {
  UserLocation,
  getMergedOdishaState,
  reverseGeocodeCoordinates,
  saveLearnedOdishaPlace,
  fetchAndStoreBlockVillages,
  searchAndStoreOdishaPlacesOnline,
  buildUserLocationFromCoords,
  lookupPincodeData
} from '../services/locationService';
import cropsData from '../data/crops.json';
import odishaAddresses from '../data/odishaAddresses.json';
import {
  Camera,
  Mic,
  MapPin,
  HardDrive,
  Image as ImageIcon,
  Bell,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Phone,
  Lock,
  Upload,
  Search,
  Navigation,
  AlertTriangle,
  Edit3,
  CheckCircle2,
  Sprout,
  Info
} from 'lucide-react';

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: (
    profile: FarmerProfile,
    location?: UserLocation | null,
    meta?: { isNewRegistration: boolean }
  ) => void;
  onClose?: () => void;
  initialLang?: Language;
  onLanguageChange?: (lang: Language) => void;
  onNavigateTo?: (featureId: string) => void;
}

type PermItemState = 'pending' | 'granted' | 'denied' | 'skipped_ios';

interface PermChecklist {
  camera: PermItemState;
  microphone: PermItemState;
  location: PermItemState;
  photos: PermItemState;
  storage: PermItemState;
  notifications: PermItemState;
}

const FIELD_UNITS: { unit: FieldSizeUnit; labelKey: string }[] = [
  { unit: 'Acre', labelKey: 'unit_acre' },
  { unit: 'Hectare', labelKey: 'unit_hectare' },
  { unit: 'Decimal', labelKey: 'unit_decimal' },
  { unit: 'Cent', labelKey: 'unit_cent' },
  { unit: 'Guntha', labelKey: 'unit_guntha' },
  { unit: 'Bigha', labelKey: 'unit_bigha' },
  { unit: 'Katha', labelKey: 'unit_katha' },
  { unit: 'Square feet', labelKey: 'unit_sqft' },
  { unit: 'Square metre', labelKey: 'unit_sqm' }
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  isOpen,
  onComplete,
  onClose,
  initialLang = 'or',
  onLanguageChange
}) => {
  // Step 1 to 7 (1-indexed)
  const [step, setStep] = useState<number>(1);
  const [returnToReview, setReturnToReview] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<Language>(initialLang || 'or');
  const [isLoginShortcut, setIsLoginShortcut] = useState<boolean>(false);

  // Sync language prop when changed from top bar
  useEffect(() => {
    if (initialLang) {
      setSelectedLang(initialLang);
    }
  }, [initialLang]);

  // ============================================================================
  // STEP 1: PERMISSIONS STATE (No background mic or voice assistant!)
  // ============================================================================
  const [permState, setPermState] = useState<PermChecklist>({
    camera: 'pending',
    microphone: 'pending',
    location: 'pending',
    photos: 'granted', // File input needs no upfront browser permission
    storage: 'pending',
    notifications: 'pending'
  });
  const [isRequestingPerms, setIsRequestingPerms] = useState<boolean>(false);
  const [permsAttemptedOnce, setPermsAttemptedOnce] = useState<boolean>(false);

  const isIOS = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  }, []);

  const isStandalonePWA = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }, []);

  // ============================================================================
  // STEP 3: MOBILE & OTP STATE
  // ============================================================================
  const [mobile, setMobile] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>('');
  const [simulatedOtpCode, setSimulatedOtpCode] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [otpRemainingSec, setOtpRemainingSec] = useState<number>(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number>(3);
  const [otpErrorKey, setOtpErrorKey] = useState<string>('');
  const [otpErrorFallback, setOtpErrorFallback] = useState<string>('');
  const [otpVerifiedMobile, setOtpVerifiedMobile] = useState<string>('');

  // ============================================================================
  // STEP 4: FARMER DETAILS & FIELD SIZE STATE
  // ============================================================================
  const [fullName, setFullName] = useState<string>('');
  const [age, setAge] = useState<string>('38');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [photoSkipped, setPhotoSkipped] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [dontKnowFieldSize, setDontKnowFieldSize] = useState<boolean>(false);
  const [unknownSizeChoice, setUnknownSizeChoice] = useState<'small' | 'medium' | 'large'>('medium');
  const [fieldValue, setFieldValue] = useState<string>('2');
  const [fieldUnit, setFieldUnit] = useState<FieldSizeUnit>('Acre');
  const [manualApproxAcres, setManualApproxAcres] = useState<string>('1.0');
  const [step4ErrorKey, setStep4ErrorKey] = useState<string>('');

  // ============================================================================
  // STEP 5: ADDRESS & GPS STATE
  // ============================================================================
  const [stateName, setStateName] = useState<string>('Odisha');
  const [districtName, setDistrictName] = useState<string>('Cuttack');
  const [blockName, setBlockName] = useState<string>('Cuttack Sadar');
  const [villageName, setVillageName] = useState<string>('Kandarpur');
  const [isCustomVillage, setIsCustomVillage] = useState<boolean>(false);
  const [customVillageText, setCustomVillageText] = useState<string>('');
  const [pinCode, setPinCode] = useState<string>('753001');

  // Search filters for cascading dropdowns + unified quick place search
  const [globalPlaceSearch, setGlobalPlaceSearch] = useState<string>('');
  const [districtSearch, setDistrictSearch] = useState<string>('');
  const [blockSearch, setBlockSearch] = useState<string>('');
  const [villageSearch, setVillageSearch] = useState<string>('');

  // GPS state
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsResult, setGpsResult] = useState<{
    lat: number;
    lon: number;
    accuracyMeters: number;
    suggestedDistrict: string;
    suggestedBlock: string;
    suggestedVillage: string;
    poorAccuracy: boolean;
    confirmed: boolean;
  } | null>(null);
  const [gpsError, setGpsError] = useState<string>('');

  // Optional Address & Farm Context Fields (No Aadhaar, bank details, caste, or religion!)
  const [landOwnership, setLandOwnership] = useState<'own' | 'tenant' | 'sharecropper'>('own');
  const [irrigationSource, setIrrigationSource] = useState<
    'rain_fed' | 'canal' | 'tubewell_borewell' | 'pond_river' | 'drip_sprinkler'
  >('rain_fed');
  const [emergencyContactName, setEmergencyContactName] = useState<string>('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState<string>('');
  const [step5Error, setStep5Error] = useState<string>('');

  // ============================================================================
  // STEP 6: WHAT DO YOU FARM STATE
  // ============================================================================
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'cereals_millets',
    'vegetables'
  ]);
  const [activeCategoryModal, setActiveCategoryModal] = useState<string | null>(null);
  const [cropSearchQuery, setCropSearchQuery] = useState<string>('');
  // Canonical deduplicated crop IDs (e.g. 'chilli', 'ginger', 'garlic', 'coriander', 'cowpea' saved once)
  const [selectedCropIds, setSelectedCropIds] = useState<string[]>(['paddy', 'tomato', 'brinjal']);
  const [otherCropCustomText, setOtherCropCustomText] = useState<string>('');
  const [step6Error, setStep6Error] = useState<string>('');

  // ============================================================================
  // STEP 7: REVIEW & CONSENT STATE
  // ============================================================================
  const [photoConsentAgreed, setPhotoConsentAgreed] = useState<boolean>(true);
  const [privacyConsentAgreed] = useState<boolean>(true);
  const [isSavingAccount, setIsSavingAccount] = useState<boolean>(false);

  // Stop any camera stream on unmount or step change
  const stopLiveCamera = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((tr) => tr.stop());
      activeStreamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      stopLiveCamera();
    };
  }, []);

  // Resend & Expiry countdown timers for Step 3 OTP
  useEffect(() => {
    if (!otpSent) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      if (otpExpiresAt) {
        const rem = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
        setOtpRemainingSec(rem);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [otpSent, otpExpiresAt]);

  // ============================================================================
  // STEP 5 HELPERS: CASCADING ADDRESS (314 BLOCKS + LEARNED VILLAGES) & GPS
  // ============================================================================
  const [addressVersion, setAddressVersion] = useState<number>(0);
  const [isSearchingOnlinePlaces, setIsSearchingOnlinePlaces] = useState<boolean>(false);

  useEffect(() => {
    const onUpdated = () => setAddressVersion((v) => v + 1);
    window.addEventListener('krushak:addresses-updated', onUpdated);
    return () => window.removeEventListener('krushak:addresses-updated', onUpdated);
  }, []);

  const currentStateObj = useMemo(() => {
    return getMergedOdishaState();
  }, [stateName, addressVersion]);

  // Whenever District or Block changes in Step 5, dynamically fetch & store villages for that Block from Map APIs
  useEffect(() => {
    if (districtName && blockName) {
      fetchAndStoreBlockVillages(districtName, blockName).catch(() => {});
    }
  }, [districtName, blockName]);

  // Whenever user searches a Village or Block name (2+ chars), query Google Maps / OpenStreetMap and store results
  useEffect(() => {
    const q = (globalPlaceSearch || villageSearch || blockSearch).trim();
    if (q.length < 2) return;
    let cancelled = false;
    setIsSearchingOnlinePlaces(true);
    const timer = window.setTimeout(() => {
      searchAndStoreOdishaPlacesOnline(q, districtName, blockName)
        .finally(() => {
          if (!cancelled) setIsSearchingOnlinePlaces(false);
        });
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [globalPlaceSearch, villageSearch, blockSearch, districtName, blockName]);

  // Auto-detect GPS when Step 5 opens if location permission was granted and GPS hasn't loaded yet
  const [isLookingUpPin, setIsLookingUpPin] = useState<boolean>(false);
  const [pinAutoBanner, setPinAutoBanner] = useState<string>('');

  // Automatically lookup PIN Code when user types or changes a 6-digit PIN Code
  useEffect(() => {
    const cleanPin = pinCode.replace(/\D/g, '').slice(0, 6);
    if (!/^\d{6}$/.test(cleanPin)) {
      setPinAutoBanner('');
      return;
    }
    let active = true;
    setIsLookingUpPin(true);
    const timer = window.setTimeout(() => {
      lookupPincodeData(cleanPin)
        .then((res) => {
          if (!active || !res) return;
          setStateName(res.state_en || 'Odisha');
          setDistrictName(res.district_en);
          setBlockName(res.block_en);
          if (res.villages && res.villages.length > 0 && res.villages[0].name_en) {
            setVillageName(res.villages[0].name_en);
            setIsCustomVillage(false);
          }
          const bannerMsg =
            selectedLang === 'or'
              ? `✓ ପିନ୍ କୋଡ୍ ${cleanPin}: ଜିଲ୍ଲା ${res.district_or || res.district_en}, ବ୍ଲକ ${res.block_or || res.block_en} ସ୍ୱୟଂଚାଳିତ ଭାବେ ରୋଡ୍ ହେଲା!`
              : `✓ PIN Code ${cleanPin} Verified: District ${res.district_en}, Block ${res.block_en} auto-filled!`;
          setPinAutoBanner(bannerMsg);
        })
        .finally(() => {
          if (active) setIsLookingUpPin(false);
        });
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [pinCode]);

  useEffect(() => {
    if (step === 5 && !gpsResult && !isDetectingGps && permState.location === 'granted') {
      handleUseGpsAddress();
    }
  }, [step]);

  const filteredDistricts = useMemo(() => {
    const list = currentStateObj?.districts || [];
    if (!districtSearch.trim()) return list;
    const q = districtSearch.toLowerCase();
    return list.filter(
      (d) =>
        d.name_en.toLowerCase().includes(q) ||
        (d.name_or && d.name_or.toLowerCase().includes(q))
    );
  }, [currentStateObj, districtSearch]);

  const currentDistrictObj = useMemo(() => {
    return (
      currentStateObj?.districts.find((d) => d.name_en === districtName) ||
      currentStateObj?.districts[0]
    );
  }, [currentStateObj, districtName]);

  const filteredBlocks = useMemo(() => {
    const list = currentDistrictObj?.blocks || [];
    if (!blockSearch.trim()) return list;
    const q = blockSearch.toLowerCase();
    return list.filter((b) => {
      const bOr = b.name_or || '';
      return b.name_en.toLowerCase().includes(q) || bOr.toLowerCase().includes(q);
    });
  }, [currentDistrictObj, blockSearch]);

  const currentBlockObj = useMemo(() => {
    return (
      currentDistrictObj?.blocks.find((b) => b.name_en === blockName) ||
      currentDistrictObj?.blocks[0]
    );
  }, [currentDistrictObj, blockName]);

  const filteredVillages = useMemo(() => {
    const list = currentBlockObj?.villages || [];
    if (!villageSearch.trim()) return list;
    const q = villageSearch.toLowerCase();
    return list.filter((v) => {
      const vOr = v.name_or || '';
      return v.name_en.toLowerCase().includes(q) || vOr.toLowerCase().includes(q);
    });
  }, [currentBlockObj, villageSearch]);

  const globalPlaceMatches = useMemo(() => {
    const q = globalPlaceSearch.trim().toLowerCase();
    if (!q) return [];
    const results: Array<{
      districtEn: string;
      districtOr: string;
      defaultPin?: string;
      blockEn: string;
      blockOr: string;
      villageEn: string;
      villageOr: string;
    }> = [];
    for (const d of currentStateObj?.districts || []) {
      for (const b of d.blocks) {
        const bOr = b.name_or || b.name_en;
        for (const v of b.villages) {
          const vOr = v.name_or || v.name_en;
          if (
            v.name_en.toLowerCase().includes(q) ||
            vOr.toLowerCase().includes(q) ||
            b.name_en.toLowerCase().includes(q) ||
            bOr.toLowerCase().includes(q) ||
            d.name_en.toLowerCase().includes(q) ||
            (d.name_or && d.name_or.toLowerCase().includes(q))
          ) {
            results.push({
              districtEn: d.name_en,
              districtOr: d.name_or || d.name_en,
              defaultPin: v.pinCode || d.defaultPin,
              blockEn: b.name_en,
              blockOr: bOr,
              villageEn: v.name_en,
              villageOr: vOr
            });
            if (results.length >= 25) return results;
          }
        }
      }
    }
    return results;
  }, [globalPlaceSearch, currentStateObj]);

  // ============================================================================
  // STEP 6 HELPERS: FARMING TYPES & DEDUPLICATED CROPS
  // ============================================================================
  const cropCatalogMap = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        icon: string;
        name_en: string;
        name_or?: string;
        name_hi?: string;
        name_te?: string;
        name_bn?: string;
        name_ta?: string;
      }
    >();
    for (const cat of cropsData.categories) {
      for (const item of cat.items) {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      }
    }
    return map;
  }, []);

  const computedAcres = useMemo(() => {
    if (dontKnowFieldSize) {
      if (unknownSizeChoice === 'small') return 0.5;
      if (unknownSizeChoice === 'medium') return 2.0;
      return 5.0;
    }
    return convertFieldSizeToAcres(
      parseFloat(fieldValue) || 0,
      fieldUnit,
      parseFloat(manualApproxAcres) || 0
    );
  }, [dontKnowFieldSize, unknownSizeChoice, fieldValue, fieldUnit, manualApproxAcres]);

  const activeCategoryObj = useMemo(() => {
    if (!activeCategoryModal) return null;
    return cropsData.categories.find((c) => c.id === activeCategoryModal) || null;
  }, [activeCategoryModal]);

  if (!isOpen) return null;

  // ============================================================================
  // STEP 1 & STEP 5 HANDLERS: AUTO-LOAD ADDRESS WHEN GPS TRACKS COORDINATES
  // ============================================================================
  const suggestAddressFromCoords = async (
    lat: number,
    lon: number,
    accuracyMeters: number
  ) => {
    try {
      const rev = await reverseGeocodeCoordinates(lat, lon, selectedLang);
      const mergedState = getMergedOdishaState();
      const distObj =
        mergedState.districts.find((d) => d.name_en === rev.district_en) ||
        mergedState.districts[0];

      // Automatically load & populate the detected District, Block, Village, and PIN code
      setStateName('Odisha');
      setDistrictName(rev.district_en);
      setBlockName(rev.block_en);
      setVillageName(rev.village_en);
      setIsCustomVillage(false);
      if (rev.pinCode && /^\d{6}$/.test(rev.pinCode)) {
        setPinCode(rev.pinCode);
      } else if (distObj?.defaultPin) {
        setPinCode(distObj.defaultPin);
      }

      setGpsResult({
        lat,
        lon,
        accuracyMeters,
        suggestedDistrict: rev.district_en,
        suggestedBlock: rev.block_en,
        suggestedVillage: rev.village_en,
        poorAccuracy: accuracyMeters > 100,
        confirmed: true
      });
    } catch {
      const mergedState = getMergedOdishaState();
      let bestDistrict = mergedState.districts[0];
      let bestBlock = bestDistrict.blocks[0];
      let bestVillage = bestBlock.villages[0];
      let minDist = Infinity;

      for (const dist of mergedState.districts) {
        for (const blk of dist.blocks) {
          for (const vil of blk.villages) {
            const vDist = Math.hypot(vil.lat - lat, vil.lon - lon);
            if (vDist < minDist) {
              minDist = vDist;
              bestDistrict = dist;
              bestBlock = blk;
              bestVillage = vil;
            }
          }
        }
      }

      setStateName('Odisha');
      setDistrictName(bestDistrict.name_en);
      setBlockName(bestBlock.name_en);
      setVillageName(bestVillage.name_en);
      setIsCustomVillage(false);
      if (bestDistrict.defaultPin) {
        setPinCode(bestDistrict.defaultPin);
      }

      setGpsResult({
        lat,
        lon,
        accuracyMeters,
        suggestedDistrict: bestDistrict.name_en,
        suggestedBlock: bestBlock.name_en,
        suggestedVillage: bestVillage.name_en,
        poorAccuracy: accuracyMeters > 100,
        confirmed: true
      });
    }
  };

  const requestSinglePermission = async (
    key: keyof PermChecklist
  ): Promise<PermItemState> => {
    try {
      if (key === 'camera') {
        const s = await navigator.mediaDevices.getUserMedia({ video: true });
        s.getTracks().forEach((tr) => tr.stop());
        return 'granted';
      }
      if (key === 'microphone') {
        const s = await navigator.mediaDevices.getUserMedia({ audio: true });
        s.getTracks().forEach((tr) => tr.stop());
        return 'granted';
      }
      if (key === 'location') {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) return reject(new Error('Unsupported'));
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 60000
          });
        });
        await suggestAddressFromCoords(
          pos.coords.latitude,
          pos.coords.longitude,
          Math.round(pos.coords.accuracy || 25)
        );
        return 'granted';
      }
      if (key === 'notifications') {
        if (isIOS && !isStandalonePWA) {
          return 'skipped_ios';
        }
        if (typeof Notification === 'undefined' || !Notification.requestPermission) {
          return 'skipped_ios';
        }
        const res = await Notification.requestPermission();
        return res === 'granted' ? 'granted' : 'denied';
      }
      if (key === 'storage') {
        if (navigator.storage && navigator.storage.persist) {
          await navigator.storage.persist();
          return 'granted';
        }
        return 'granted';
      }
      if (key === 'photos') {
        return 'granted';
      }
    } catch {
      return 'denied';
    }
    return 'denied';
  };

  const handleAllowAllAndContinue = async () => {
    setIsRequestingPerms(true);
    setPermsAttemptedOnce(true);

    const nextState: PermChecklist = {
      ...permState,
      photos: 'granted'
    };

    // 1) Camera and microphone: try combined getUserMedia({video:true, audio:true}); if it fails, request each separately. Stop all tracks immediately.
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const combinedStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        combinedStream.getTracks().forEach((tr) => tr.stop());
        nextState.camera = 'granted';
        nextState.microphone = 'granted';
      } else {
        nextState.camera = 'denied';
        nextState.microphone = 'denied';
      }
    } catch {
      try {
        const vStream = await navigator.mediaDevices.getUserMedia({ video: true });
        vStream.getTracks().forEach((tr) => tr.stop());
        nextState.camera = 'granted';
      } catch {
        nextState.camera = 'denied';
      }

      try {
        const aStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        aStream.getTracks().forEach((tr) => tr.stop());
        nextState.microphone = 'granted';
      } catch {
        nextState.microphone = 'denied';
      }
    }
    setPermState({ ...nextState });

    // 2) Location: navigator.geolocation.getCurrentPosition
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('No geolocation'));
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 7000,
          maximumAge: 60000
        });
      });
      nextState.location = 'granted';
      suggestAddressFromCoords(
        pos.coords.latitude,
        pos.coords.longitude,
        Math.round(pos.coords.accuracy || 25)
      );
    } catch {
      nextState.location = 'denied';
    }
    setPermState({ ...nextState });

    // 3) Notifications: Notification.requestPermission (graceful skip on iPhone browser)
    try {
      if (isIOS && !isStandalonePWA) {
        nextState.notifications = 'skipped_ios';
      } else if (typeof Notification !== 'undefined' && Notification.requestPermission) {
        const nPerm = await Notification.requestPermission();
        nextState.notifications = nPerm === 'granted' ? 'granted' : 'denied';
      } else {
        nextState.notifications = 'skipped_ios';
      }
    } catch {
      nextState.notifications = 'denied';
    }
    setPermState({ ...nextState });

    // 4) Storage: navigator.storage.persist()
    try {
      if (navigator.storage && navigator.storage.persist) {
        await navigator.storage.persist();
      }
      nextState.storage = 'granted';
    } catch {
      nextState.storage = 'granted';
    }

    // 5) Photos and files: no permission needed
    nextState.photos = 'granted';

    setPermState({ ...nextState });
    markPermissionsAskedOnce();
    setIsRequestingPerms(false);

    const allGranted =
      nextState.camera === 'granted' &&
      nextState.microphone === 'granted' &&
      nextState.location === 'granted';
    if (allGranted) {
      setStep(2);
    }
  };

  const handleTapIndividualPermission = async (key: keyof PermChecklist) => {
    const res = await requestSinglePermission(key);
    setPermState((prev) => ({ ...prev, [key]: res }));
    markPermissionsAskedOnce();
  };

  // ============================================================================
  // STEP 2 HANDLERS: LANGUAGE SELECTION
  // ============================================================================
  const handleSelectLanguage = (code: Language) => {
    setSelectedLang(code);
    if (onLanguageChange) {
      onLanguageChange(code);
    }
  };

  // ============================================================================
  // STEP 3 HANDLERS: MOBILE NUMBER & OTP
  // ============================================================================
  const handleSendOtp = async () => {
    setOtpErrorKey('');
    setOtpErrorFallback('');
    const res = await sendMobileOtp(mobile);
    if (!res.success) {
      setOtpErrorKey(res.errorKey || '');
      setOtpErrorFallback(res.error || 'Could not send OTP.');
      return;
    }
    setOtpSent(true);
    setOtpInput('');
    setSimulatedOtpCode(res.simulatedOtp || '');
    setResendCooldown(OTP_RESEND_SECONDS);
    setOtpExpiresAt(res.expiresAt || Date.now() + 300000);
    setOtpRemainingSec(300);
    setAttemptsRemaining(3);
  };

  const handleVerifyOtp = async () => {
    setOtpErrorKey('');
    setOtpErrorFallback('');
    const res = await verifyMobileOtp(mobile, otpInput);
    if (!res.success) {
      setOtpErrorKey(res.errorKey || '');
      setOtpErrorFallback(res.error || 'Invalid OTP.');
      if (typeof res.attemptsRemaining === 'number') {
        setAttemptsRemaining(res.attemptsRemaining);
      }
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    setOtpVerifiedMobile(cleanMobile);

    // If the mobile number already has an account, restore profile & go straight to Home Screen!
    if (res.existingProfile) {
      if (onLanguageChange && res.existingProfile.language) {
        onLanguageChange(res.existingProfile.language);
      }
      onComplete(res.existingProfile, null, { isNewRegistration: false });
      return;
    }

    // New mobile number -> proceed to Step 4 (Farmer Details)
    setStep(4);
  };

  // ============================================================================
  // STEP 4 HANDLERS: LIVE PHOTO, UPLOAD & FIELD SIZE
  // ============================================================================
  const handleOpenLiveCamera = async () => {
    setStep4ErrorKey('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStep4ErrorKey('Camera is not supported in this browser. Please use Upload Photo.');
        return;
      }
      // Strictly video only — never turn on microphone!
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
        audio: false
      });
      activeStreamRef.current = stream;
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch {
      setStep4ErrorKey('Could not access camera. Please use Upload Photo or Skip.');
    }
  };

  const handleCaptureLivePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const vw = videoRef.current.videoWidth || 320;
      const vh = videoRef.current.videoHeight || 320;
      const size = Math.min(vw, vh);
      const sx = (vw - size) / 2;
      const sy = (vh - size) / 2;
      ctx.drawImage(videoRef.current, sx, sy, size, size, 0, 0, 320, 320);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      setPhotoDataUrl(dataUrl);
      setPhotoSkipped(false);
    }
    stopLiveCamera();
  };

  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoDataUrl(reader.result);
        setPhotoSkipped(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const validateAndFinishStep4 = () => {
    setStep4ErrorKey('');
    if (!fullName.trim() || fullName.trim().length < 2) {
      setStep4ErrorKey('err_enter_full_name');
      return;
    }
    const ageNum = Number(age);
    if (!ageNum || ageNum < 10 || ageNum > 100) {
      setStep4ErrorKey('err_valid_age');
      return;
    }
    if (!dontKnowFieldSize) {
      const val = parseFloat(fieldValue);
      if (isNaN(val) || val <= 0) {
        setStep4ErrorKey('err_valid_field_size');
        return;
      }
      if (
        (fieldUnit === 'Bigha' || fieldUnit === 'Katha') &&
        (!parseFloat(manualApproxAcres) || parseFloat(manualApproxAcres) <= 0)
      ) {
        setStep4ErrorKey('err_valid_field_size');
        return;
      }
    }
    stopLiveCamera();
    if (returnToReview) {
      setReturnToReview(false);
      setStep(7);
    } else {
      setStep(5);
    }
  };

  const handleUseGpsAddress = () => {
    setIsDetectingGps(true);
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser.');
      setIsDetectingGps(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const acc = Math.round(pos.coords.accuracy || 30);
        await suggestAddressFromCoords(pos.coords.latitude, pos.coords.longitude, acc);
        setIsDetectingGps(false);
      },
      () => {
        setGpsError(t('gps_poor_accuracy_warn', selectedLang));
        setIsDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleConfirmSuggestedGpsAddress = () => {
    if (!gpsResult) return;
    setStateName('Odisha');
    setDistrictName(gpsResult.suggestedDistrict);
    setBlockName(gpsResult.suggestedBlock);
    setVillageName(gpsResult.suggestedVillage);
    setIsCustomVillage(false);
    const distObj = currentStateObj.districts.find(
      (d) => d.name_en === gpsResult.suggestedDistrict
    );
    if (distObj?.defaultPin) {
      setPinCode(distObj.defaultPin);
    }
    setGpsResult({ ...gpsResult, confirmed: true });
  };

  const validateAndFinishStep5 = () => {
    setStep5Error('');
    const finalVillage = isCustomVillage ? customVillageText.trim() : villageName;
    if (!finalVillage) {
      setStep5Error(t('type_village_placeholder', selectedLang));
      return;
    }
    if (pinCode && !/^\d{6}$/.test(pinCode.trim())) {
      setStep5Error(t('pin_code_label', selectedLang));
      return;
    }
    // Persist any newly entered or selected village/block in the learned Odisha address database
    saveLearnedOdishaPlace({
      district_en: districtName,
      district_or: currentDistrictObj?.name_or || districtName,
      block_en: blockName,
      block_or: currentBlockObj?.name_or || blockName,
      village_en: finalVillage,
      village_or: finalVillage,
      lat: gpsResult?.lat || currentDistrictObj?.lat || 20.4625,
      lon: gpsResult?.lon || currentDistrictObj?.lon || 85.883,
      pinCode: pinCode.trim()
    });
    if (returnToReview) {
      setReturnToReview(false);
      setStep(7);
    } else {
      setStep(6);
    }
  };

  const getLocalizedCropName = (cropId: string): string => {
    const item = cropCatalogMap.get(cropId);
    if (!item) return cropId;
    const key = `name_${selectedLang}` as keyof typeof item;
    return (item[key] as string) || item.name_en;
  };

  const toggleCropId = (cropId: string) => {
    setSelectedCropIds((prev) =>
      prev.includes(cropId) ? prev.filter((id) => id !== cropId) : [...prev, cropId]
    );
  };

  const handleOpenCategoryItems = (catId: string) => {
    if (!selectedCategories.includes(catId)) {
      setSelectedCategories((prev) => [...prev, catId]);
    }
    setCropSearchQuery('');
    setActiveCategoryModal(catId);
  };

  const validateAndFinishStep6 = () => {
    setStep6Error('');
    if (selectedCropIds.length === 0 && !otherCropCustomText.trim()) {
      setStep6Error(t('crops_step_subtitle', selectedLang));
      return;
    }
    setStep(7);
  };

  // ============================================================================
  // STEP 7 HANDLER: CREATE ACCOUNT & SAVE TO LOCAL COPY + CENTRAL SERVER DB
  // ============================================================================
  const handleCreateAccount = async () => {
    if (isSavingAccount) return;
    setIsSavingAccount(true);
    try {
      const finalMobile = otpVerifiedMobile || mobile.replace(/\D/g, '').slice(-10);
      const uniqueFarmerId = await generateVerifiedUniqueFarmerId(districtName);
      const finalVillage = isCustomVillage ? customVillageText.trim() : villageName;

      // Resolve human-readable crop names (saved once per canonical ID)
      const primaryCropsList = selectedCropIds.map((id) => {
        const meta = cropCatalogMap.get(id);
        return meta ? meta.name_en : id;
      });
      if (otherCropCustomText.trim()) {
        primaryCropsList.push(otherCropCustomText.trim());
      }

      const acres = computedAcres;
      const farmerType: 'Small & Marginal' | 'Medium' | 'Commercial' =
        acres <= 2.5 ? 'Small & Marginal' : acres <= 5 ? 'Medium' : 'Commercial';

      const newProfile: FarmerProfile = {
        id: uniqueFarmerId,
        kisanId: uniqueFarmerId,
        name: fullName.trim(),
        fullName: fullName.trim(),
        age: Number(age),
        gender,
        photoDataUrl:
          photoConsentAgreed && !photoSkipped && photoDataUrl ? photoDataUrl : undefined,
        photoConsentGiven: photoConsentAgreed && !photoSkipped,
        mobile: finalMobile,
        phone: finalMobile,
        state: stateName,
        district: districtName,
        block: blockName,
        village: finalVillage,
        villageVerified: !isCustomVillage,
        pinCode: pinCode.trim(),
        gpsLocation: gpsResult
          ? {
              lat: gpsResult.lat,
              lon: gpsResult.lon,
              accuracyMeters: gpsResult.accuracyMeters,
              poorAccuracyFlag: gpsResult.poorAccuracy,
              placeName: `${finalVillage}, ${blockName}, ${districtName}`,
              village: finalVillage,
              block: blockName,
              district: districtName,
              confirmed: true
            }
          : undefined,
        landOwnership,
        irrigationSource,
        emergencyContact:
          emergencyContactName.trim() || emergencyContactPhone.trim()
            ? {
                name: emergencyContactName.trim(),
                phone: emergencyContactPhone.trim()
              }
            : undefined,
        fieldSize: dontKnowFieldSize
          ? {
              enteredValue: acres,
              unit: 'Acre',
              acres,
              unknownSizeChoice
            }
          : {
              enteredValue: parseFloat(fieldValue) || acres,
              unit: fieldUnit,
              acres
            },
        landholdingAcres: acres,
        landAcres: acres,
        farmingTypes: selectedCategories,
        primaryCrops: primaryCropsList,
        cropIds: selectedCropIds,
        otherCropsText: otherCropCustomText.trim() || undefined,
        crops: primaryCropsList,
        farmerType,
        language: selectedLang,
        preferredLanguage: selectedLang,
        avatarSeed: fullName.trim(),
        registrationDate: new Date().toISOString().split('T')[0],
        consentRecord: {
          agreed: privacyConsentAgreed,
          date: new Date().toISOString(),
          photoAgreed: photoConsentAgreed
        },
        isVerified: !isCustomVillage
      };

      const saved = registerAndSignInFarmer(newProfile);
      const userLocObj = gpsResult
        ? buildUserLocationFromCoords(
            gpsResult.lat,
            gpsResult.lon,
            gpsResult.accuracyMeters,
            Date.now(),
            true
          )
        : null;
      if (userLocObj) {
        userLocObj.nearestBlock = {
          name_en: blockName,
          name_or: currentBlockObj?.name_or || blockName
        };
        userLocObj.nearestVillage = {
          name_en: finalVillage,
          name_or: finalVillage
        };
        userLocObj.placeNameEn = `${finalVillage}, ${blockName}, ${districtName}`;
      }
      onComplete(saved, userLocObj, { isNewRegistration: true });
    } finally {
      setIsSavingAccount(false);
    }
  };

  // Back button handler for every step
  const handleBackStep = () => {
    stopLiveCamera();
    if (returnToReview && step !== 7) {
      setReturnToReview(false);
      setStep(7);
      return;
    }
    if (step > 1) {
      setStep(step - 1);
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        className="w-full max-w-2xl rounded-3xl bg-white text-stone-900 shadow-2xl border-2 border-emerald-700 overflow-hidden flex flex-col my-auto max-h-[96vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* ================================================================== */}
        {/* TOP HEADER WITH BACK BUTTON & PROGRESS BAR ON EVERY STEP          */}
        {/* ================================================================== */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-4 py-3.5 sm:px-6 sm:py-4 border-b border-emerald-700">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <button
              onClick={handleBackStep}
              disabled={step === 1 && !onClose}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
                step === 1 && !onClose
                  ? 'opacity-40 cursor-not-allowed bg-emerald-950/40 text-emerald-300'
                  : 'bg-emerald-950/80 hover:bg-emerald-950 text-amber-300 border border-emerald-600 cursor-pointer active:scale-95'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('back', selectedLang)}</span>
            </button>

            <div className="text-center">
              <span className="text-xs sm:text-sm font-black text-amber-300 tracking-wide">
                {t('step_of', selectedLang, { current: step, total: 7 })}
              </span>
            </div>

            {/* Quick Language Switcher in Top Bar */}
            <select
              value={selectedLang}
              onChange={(e) => handleSelectLanguage(e.target.value as Language)}
              className="text-xs font-extrabold text-amber-300 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700 cursor-pointer focus:outline-none"
              aria-label="Language"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-emerald-950 text-white">
                  {l.nativeName}
                </option>
              ))}
            </select>
          </div>

          {/* 7-Step Progress Bar */}
          <div className="w-full bg-emerald-950 rounded-full h-2.5 overflow-hidden p-0.5 border border-emerald-700">
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* ================================================================== */}
        {/* STEP BODY CONTAINER                                                */}
        {/* ================================================================== */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-left">
          {/* ---------------------------------------------------------------- */}
          {/* STEP 1: PERMISSIONS (One Big Button + Checklist + Tap to Allow)  */}
          {/* ---------------------------------------------------------------- */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
                  {t('perm_title', selectedLang)}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 font-medium">
                  {t('perm_subtitle', selectedLang)}
                </p>
              </div>

              {/* 6 Permission Items Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    key: 'camera' as const,
                    icon: Camera,
                    title: t('perm_camera_title', selectedLang),
                    desc: t('perm_camera_desc', selectedLang)
                  },
                  {
                    key: 'microphone' as const,
                    icon: Mic,
                    title: t('perm_mic_title', selectedLang),
                    desc: t('perm_mic_desc', selectedLang)
                  },
                  {
                    key: 'location' as const,
                    icon: MapPin,
                    title: t('perm_loc_title', selectedLang),
                    desc: t('perm_loc_desc', selectedLang)
                  },
                  {
                    key: 'photos' as const,
                    icon: ImageIcon,
                    title: t('perm_photos_title', selectedLang),
                    desc: t('perm_photos_desc', selectedLang)
                  },
                  {
                    key: 'storage' as const,
                    icon: HardDrive,
                    title: t('perm_storage_title', selectedLang),
                    desc: t('perm_storage_desc', selectedLang)
                  },
                  {
                    key: 'notifications' as const,
                    icon: Bell,
                    title: t('perm_notif_title', selectedLang),
                    desc: t('perm_notif_desc', selectedLang)
                  }
                ].map((item) => {
                  const status = permState[item.key];
                  const IconComp = item.icon;
                  const isGranted = status === 'granted';
                  const isDenied = status === 'denied';

                  return (
                    <div
                      key={item.key}
                      className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 transition-all ${
                        isGranted
                          ? 'bg-emerald-50/90 border-emerald-400'
                          : isDenied
                          ? 'bg-stone-100 border-stone-300'
                          : 'bg-white border-stone-200'
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-black ${
                          isGranted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        <IconComp className="w-6 h-6" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-black text-sm text-stone-900">{item.title}</h4>
                          {/* Green tick or Gray cross */}
                          {isGranted ? (
                            <span
                              className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0"
                              title="Granted"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </span>
                          ) : (
                            <span
                              className="w-6 h-6 rounded-full bg-stone-300 text-stone-700 flex items-center justify-center shrink-0"
                              title="Not granted yet"
                            >
                              <X className="w-3.5 h-3.5 stroke-[2.5]" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5 leading-snug">{item.desc}</p>

                        {/* Individual direct-tap button if blocked or not yet granted */}
                        {!isGranted && item.key !== 'photos' && (
                          <button
                            type="button"
                            onClick={() => handleTapIndividualPermission(item.key)}
                            className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-[11px] font-black shadow-2xs cursor-pointer"
                          >
                            <span>{t('tap_to_allow', selectedLang)}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* iPhone Home Screen Notification Note */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-semibold flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>{t('perm_ios_note', selectedLang)}</span>
              </div>

              {/* One Big Button: "Allow all and continue" */}
              <button
                type="button"
                onClick={handleAllowAllAndContinue}
                disabled={isRequestingPerms}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-base sm:text-lg shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-6 h-6 text-amber-300" />
                <span>
                  {isRequestingPerms
                    ? t('requesting_perms', selectedLang)
                    : t('allow_all_and_continue', selectedLang)}
                </span>
              </button>

              {/* Try Again Link & Always-Allowed Continue Button */}
              <div className="flex items-center justify-between pt-1">
                {permsAttemptedOnce ? (
                  <button
                    type="button"
                    onClick={handleAllowAllAndContinue}
                    className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 underline cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('try_again', selectedLang)}</span>
                  </button>
                ) : (
                  <span className="text-xs text-stone-500">
                    {t('asked_once_note', selectedLang)}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    markPermissionsAskedOnce();
                    setStep(2);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm shadow-sm cursor-pointer"
                >
                  <span>{t('continue_btn', selectedLang)}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 2: LANGUAGE (6 Large Native-Script Buttons + Login Link)    */}
          {/* ---------------------------------------------------------------- */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
                  {t('lang_step_title', selectedLang)}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 font-medium">
                  {t('lang_step_subtitle', selectedLang)}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUPPORTED_LANGUAGES.map((l) => {
                  const isSelected = selectedLang === l.code;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => handleSelectLanguage(l.code)}
                      className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-900 text-white border-amber-400 shadow-lg scale-[1.01]'
                          : 'bg-stone-50 hover:bg-emerald-50 text-stone-900 border-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{l.flag}</span>
                        <div>
                          <div className="text-xl sm:text-2xl font-black leading-tight">
                            {l.nativeName}
                          </div>
                          <div
                            className={`text-xs font-bold ${
                              isSelected ? 'text-amber-300' : 'text-stone-500'
                            }`}
                          >
                            {l.name} {l.code === 'or' ? t('default_badge', selectedLang) : ''}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="w-7 h-7 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-black">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsLoginShortcut(false);
                  setStep(3);
                }}
                className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-base sm:text-lg shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('continue_btn', selectedLang)}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Small "Already registered? Log in" link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginShortcut(true);
                    setStep(3);
                  }}
                  className="text-xs sm:text-sm font-black text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                >
                  {t('already_registered_login', selectedLang)}
                </button>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 3: MOBILE NUMBER AND OTP (Mandatory)                        */}
          {/* ---------------------------------------------------------------- */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Visible DEMO MODE Label when Firebase Phone Auth is not active */}
              {isDemoMode && (
                <div className="p-3 rounded-2xl bg-amber-100 border-2 border-amber-400 text-stone-950 flex items-center gap-2.5 shadow-2xs">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                  <span className="text-xs sm:text-sm font-black">
                    {t('demo_mode_banner', selectedLang)}
                  </span>
                </div>
              )}

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
                  {isLoginShortcut
                    ? t('login_step_title', selectedLang)
                    : t('mobile_step_title', selectedLang)}
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 font-medium">
                  {t('mobile_step_subtitle', selectedLang)}
                </p>
              </div>

              {/* +91 10-Digit Mobile Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase text-stone-700">
                  {t('indian_mobile_label', selectedLang)}
                </label>
                <div className="flex items-center gap-2">
                  <div className="px-4 py-3.5 rounded-2xl bg-stone-100 border-2 border-stone-300 font-black text-base text-stone-800 select-none">
                    🇮🇳 +91
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setMobile(val);
                    }}
                    placeholder="98610XXXXX"
                    className="flex-1 px-4 py-3.5 rounded-2xl border-2 border-stone-300 focus:border-emerald-600 focus:outline-none text-lg font-mono font-black tracking-wider"
                  />
                </div>
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={mobile.length !== 10}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
                    mobile.length === 10
                      ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer'
                      : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                  }`}
                >
                  <Phone className="w-5 h-5" />
                  <span>{t('send_otp_btn', selectedLang)}</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 space-y-4">
                  {/* Show simulated OTP clearly in DEMO MODE */}
                  {isDemoMode && simulatedOtpCode && (
                    <div className="p-3 rounded-xl bg-emerald-900 text-white flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-amber-300 block">
                          {t('simulated_otp_for', selectedLang, { mobile })}
                        </span>
                        <span className="text-xl font-mono font-black tracking-widest text-amber-300">
                          {simulatedOtpCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpInput(simulatedOtpCode)}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black cursor-pointer"
                      >
                        {t('auto_fill_otp', selectedLang)}
                      </button>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                      <span>{t('enter_6_digit_otp', selectedLang)}</span>
                      <span>
                        {t('otp_expires_attempts', selectedLang, {
                          time: `${Math.floor(otpRemainingSec / 60)}:${String(
                            otpRemainingSec % 60
                          ).padStart(2, '0')}`,
                          attempts: attemptsRemaining
                        })}
                      </span>
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="••••••"
                      className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-emerald-500 focus:outline-none text-center text-2xl font-mono font-black tracking-[0.4em]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpInput.length !== 6 || attemptsRemaining <= 0}
                    className={`w-full py-4 px-6 rounded-2xl font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 ${
                      otpInput.length === 6 && attemptsRemaining > 0
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 cursor-pointer'
                        : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                    <span>{t('verify_otp_btn', selectedLang)}</span>
                  </button>

                  {/* 30s Resend Timer & Change Number */}
                  <div className="flex items-center justify-between text-xs font-bold pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpErrorKey('');
                        setOtpErrorFallback('');
                      }}
                      className="text-stone-600 hover:text-stone-900 underline cursor-pointer"
                    >
                      {t('change_mobile_number', selectedLang)}
                    </button>

                    {resendCooldown > 0 ? (
                      <span className="text-stone-500">
                        {t('resend_otp_in', selectedLang, { seconds: resendCooldown })}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-emerald-800 hover:text-emerald-950 font-black underline cursor-pointer"
                      >
                        {t('resend_otp_now', selectedLang)}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {(otpErrorKey || otpErrorFallback) && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-300 text-red-800 text-xs font-bold">
                  ⚠️ {otpErrorKey ? t(otpErrorKey, selectedLang) : otpErrorFallback}
                </div>
              )}
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 4: FARMER DETAILS & FIELD SIZE                              */}
          {/* ---------------------------------------------------------------- */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
                  {t('details_step_title', selectedLang)}
                </h2>
              </div>

              {/* Photo Section: Round Frame or Round Initials Placeholder */}
              <div className="p-4 rounded-2xl bg-stone-50 border-2 border-stone-200 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative shrink-0">
                  {photoDataUrl && !photoSkipped ? (
                    <img
                      src={photoDataUrl}
                      alt="Farmer preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-emerald-600 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-stone-950 flex items-center justify-center font-black text-3xl border-4 border-white shadow-md">
                      {getInitials(fullName || 'KB')}
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="text-xs font-bold text-stone-600">
                    {t('profile_photo_label', selectedLang)}
                  </div>

                  {isCameraOpen ? (
                    <div className="space-y-2">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-40 h-40 rounded-full object-cover mx-auto sm:mx-0 border-4 border-amber-400 bg-black"
                      />
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <button
                          type="button"
                          onClick={handleCaptureLivePhoto}
                          className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-black cursor-pointer"
                        >
                          📸 {t('capture_photo_btn', selectedLang)}
                        </button>
                        <button
                          type="button"
                          onClick={stopLiveCamera}
                          className="px-3 py-2 rounded-xl bg-stone-200 text-stone-800 text-xs font-bold cursor-pointer"
                        >
                          {t('cancel_btn', selectedLang)}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={handleOpenLiveCamera}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-xs cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{t('take_live_photo', selectedLang)}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black shadow-xs cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{t('upload_photo', selectedLang)}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPhotoDataUrl('');
                          setPhotoSkipped(true);
                          stopLiveCamera();
                        }}
                        className="px-3 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold cursor-pointer"
                      >
                        {t('skip_btn', selectedLang)}
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Full Name & Age */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-black uppercase text-stone-700">
                    {t('full_name_label', selectedLang)} *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('full_name_placeholder', selectedLang)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-stone-300 focus:border-emerald-600 focus:outline-none text-base font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase text-stone-700">
                    {t('age_label', selectedLang)} *
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-stone-300 focus:border-emerald-600 focus:outline-none text-base font-bold"
                  />
                </div>
              </div>

              {/* Gender Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black uppercase text-stone-700">
                  {t('gender_label', selectedLang)}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(['Male', 'Female', 'Other'] as const).map((g) => {
                    const labelKey =
                      g === 'Male'
                        ? 'gender_male'
                        : g === 'Female'
                        ? 'gender_female'
                        : 'gender_other';
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`py-3 px-3 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all cursor-pointer ${
                          gender === g
                            ? 'bg-emerald-800 text-white border-amber-400 shadow-sm'
                            : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {t(labelKey, selectedLang)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field Size Section */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <label className="text-xs sm:text-sm font-black text-emerald-950 uppercase">
                    {t('field_size_label', selectedLang)}
                  </label>

                  <button
                    type="button"
                    onClick={() => setDontKnowFieldSize(!dontKnowFieldSize)}
                    className={`px-3 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                      dontKnowFieldSize
                        ? 'bg-amber-400 text-stone-950 border-stone-900'
                        : 'bg-white text-emerald-900 border-emerald-300'
                    }`}
                  >
                    {dontKnowFieldSize ? '✓ ' : ''}
                    {t('dont_know_field_size', selectedLang)}
                  </button>
                </div>

                {!dontKnowFieldSize ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-stone-600 block mb-1">
                          {t('enter_value_label', selectedLang)}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={fieldValue}
                          onChange={(e) => setFieldValue(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-stone-300 focus:border-emerald-600 focus:outline-none text-base font-black"
                        />
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-stone-600 block mb-1">
                          {t('select_unit_label', selectedLang)}
                        </span>
                        <select
                          value={fieldUnit}
                          onChange={(e) => setFieldUnit(e.target.value as FieldSizeUnit)}
                          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-stone-300 focus:border-emerald-600 focus:outline-none text-base font-black cursor-pointer"
                        >
                          {FIELD_UNITS.map((u) => (
                            <option key={u.unit} value={u.unit}>
                              {t(u.labelKey, selectedLang)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Special handling for Bigha and Katha: Do NOT guess a conversion! Ask once "about how many acres?" */}
                    {(fieldUnit === 'Bigha' || fieldUnit === 'Katha') && (
                      <div className="p-3.5 rounded-xl bg-amber-100 border-2 border-amber-400 space-y-1.5">
                        <label className="block text-xs font-black text-stone-900">
                          {t('about_how_many_acres', selectedLang, { unit: fieldUnit })}
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.05"
                          value={manualApproxAcres}
                          onChange={(e) => setManualApproxAcres(e.target.value)}
                          placeholder="1.5"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-stone-800 text-sm font-black"
                        />
                      </div>
                    )}

                    <div className="text-xs font-bold text-emerald-900 bg-white/80 px-3 py-2 rounded-xl border border-emerald-200">
                      {t('internal_calc_acres', selectedLang, { acres: computedAcres })}
                    </div>
                  </div>
                ) : (
                  /* 3 Picture Choices when farmer selects "I don't know my field size" */
                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    {[
                      {
                        id: 'small' as const,
                        emoji: '🌱',
                        title: t('size_small_title', selectedLang),
                        sub: t('size_small_sub', selectedLang)
                      },
                      {
                        id: 'medium' as const,
                        emoji: '🌾',
                        title: t('size_medium_title', selectedLang),
                        sub: t('size_medium_sub', selectedLang)
                      },
                      {
                        id: 'large' as const,
                        emoji: '🚜',
                        title: t('size_large_title', selectedLang),
                        sub: t('size_large_sub', selectedLang)
                      }
                    ].map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setUnknownSizeChoice(card.id)}
                        className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                          unknownSizeChoice === card.id
                            ? 'bg-emerald-900 text-white border-amber-400 shadow-md'
                            : 'bg-white text-stone-900 border-stone-200 hover:bg-emerald-50'
                        }`}
                      >
                        <div className="text-3xl mb-1">{card.emoji}</div>
                        <div className="font-black text-xs sm:text-sm">{card.title}</div>
                        <div
                          className={`text-[10px] font-bold ${
                            unknownSizeChoice === card.id ? 'text-amber-300' : 'text-stone-500'
                          }`}
                        >
                          {card.sub}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {step4ErrorKey && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-300 text-red-800 text-xs font-bold">
                  ⚠️ {t(step4ErrorKey, selectedLang)}
                </div>
              )}

              <button
                type="button"
                onClick={validateAndFinishStep4}
                className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {returnToReview
                    ? t('save_return_review', selectedLang)
                    : t('continue_btn', selectedLang)}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 5: ADDRESS (Cascading Searchable Dropdowns + GPS)           */}
          {/* ---------------------------------------------------------------- */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
                    {t('address_step_title', selectedLang)}
                  </h2>
                  <p className="text-xs text-stone-600 font-medium">
                    {selectedLang === 'or'
                      ? 'ଆପଣଙ୍କ ସଠିକ୍ ଜିଲ୍ଲା, ବ୍ଲକ ଏବଂ ଗାଁ ନାମ ବାଛନ୍ତୁ'
                      : 'Select your accurate District, Block, and Village name'}
                  </p>
                </div>

                {/* "Find My Current Location" Button */}
                <button
                  type="button"
                  onClick={handleUseGpsAddress}
                  disabled={isDetectingGps}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-black shadow-md cursor-pointer"
                >
                  <Navigation className={`w-4 h-4 text-amber-300 ${isDetectingGps ? 'animate-spin' : ''}`} />
                  <span>
                    {isDetectingGps
                      ? t('detecting_gps', selectedLang)
                      : selectedLang === 'or'
                      ? 'ମୋର ବର୍ତ୍ତମାନର ସ୍ଥାନ ଖୋଜନ୍ତୁ (GPS)'
                      : 'Find My Current Location (GPS)'}
                  </span>
                </button>
              </div>

              {/* Quick Accurate Place Banner + Instant Search across all Villages, Blocks & Districts */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border-2 border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase text-emerald-900">
                    📍 {isCustomVillage ? customVillageText || villageName : villageName} • {blockName} • {districtName}
                  </span>
                  {isSearchingOnlinePlaces && (
                    <span className="text-[10px] font-bold text-emerald-700 animate-pulse">
                      🗺️ {selectedLang === 'or' ? 'ମାନଚିତ୍ରରୁ ଗାଁ ଓ ବ୍ଲକ ଖୋଜାଯାଉଛି...' : 'Collecting villages & blocks from Map...'}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={globalPlaceSearch}
                    onChange={(e) => setGlobalPlaceSearch(e.target.value)}
                    placeholder={
                      selectedLang === 'or'
                        ? 'ସଠିକ୍ ଗାଁ, ବ୍ଲକ କିମ୍ବା ଜିଲ୍ଲା ନାମ ଏଠାରେ ଖୋଜନ୍ତୁ...'
                        : 'Quick search any Village, Block, or District name...'
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-emerald-300 bg-white text-xs sm:text-sm font-bold text-stone-900 focus:outline-none focus:border-emerald-700"
                  />
                </div>

                {globalPlaceMatches.length > 0 && (
                  <div className="max-h-40 overflow-y-auto bg-white rounded-xl border-2 border-emerald-600 divide-y divide-stone-100 shadow-md">
                    {globalPlaceMatches.map((m, idx) => (
                      <button
                        key={`${m.districtEn}-${m.blockEn}-${m.villageEn}-${idx}`}
                        type="button"
                        onClick={() => {
                          setDistrictName(m.districtEn);
                          setBlockName(m.blockEn);
                          setVillageName(m.villageEn);
                          setIsCustomVillage(false);
                          if (m.defaultPin) setPinCode(m.defaultPin);
                          setGlobalPlaceSearch('');
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center justify-between gap-2 text-xs cursor-pointer"
                      >
                        <div>
                          <span className="font-black text-emerald-950">
                            {m.villageEn} ({m.villageOr})
                          </span>
                          <span className="text-stone-600 font-semibold ml-1.5">
                            • {m.blockEn} ({m.blockOr}) • {m.districtEn} ({m.districtOr})
                          </span>
                        </div>
                        <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* GPS Suggestion & Accuracy Box */}
              {gpsResult && (
                <div
                  className={`p-3.5 rounded-2xl border-2 space-y-2 ${
                    gpsResult.poorAccuracy
                      ? 'bg-amber-50 border-amber-400 text-stone-900'
                      : 'bg-emerald-50 border-emerald-400 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase">
                      📍{' '}
                      {t('gps_accuracy_label', selectedLang, {
                        meters: gpsResult.accuracyMeters
                      })}
                    </span>
                    {gpsResult.poorAccuracy && (
                      <span className="text-[11px] font-black px-2 py-0.5 rounded bg-amber-300 text-stone-950">
                        {t('gps_poor_accuracy_warn', selectedLang)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-bold">
                    {t('gps_suggested_nearest', selectedLang, {
                      village: gpsResult.suggestedVillage,
                      block: gpsResult.suggestedBlock,
                      district: gpsResult.suggestedDistrict
                    })}
                  </p>
                  {!gpsResult.confirmed ? (
                    <button
                      type="button"
                      onClick={handleConfirmSuggestedGpsAddress}
                      className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-amber-300 text-xs font-black cursor-pointer"
                    >
                      ✓ {t('confirm_suggested_address', selectedLang)}
                    </button>
                  ) : (
                    <span className="text-xs font-black text-emerald-800 block">
                      ✓ {t('confirmed_gps_address', selectedLang)}
                    </span>
                  )}
                </div>
              )}

              {gpsError && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
                  {gpsError}
                </div>
              )}

              {/* Cascading Searchable Dropdowns: State, District, Block, Village */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. State */}
                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase text-stone-700">
                    {t('state_label', selectedLang)}
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => {
                      const nextState = e.target.value;
                      setStateName(nextState);
                      const stObj = odishaAddresses.states.find((s) => s.name_en === nextState);
                      if (stObj && stObj.districts[0]) {
                        const d0 = stObj.districts[0];
                        setDistrictName(d0.name_en);
                        setPinCode(d0.defaultPin || '');
                        if (d0.blocks[0]) {
                          setBlockName(d0.blocks[0].name_en);
                          if (d0.blocks[0].villages[0]) {
                            setVillageName(d0.blocks[0].villages[0].name_en);
                          }
                        }
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-300 font-bold text-sm bg-white"
                  >
                    {odishaAddresses.states.map((s) => (
                      <option key={s.code} value={s.name_en}>
                        {s.name_en} ({s.name_or})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. District (Searchable) */}
                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase text-stone-700">
                    {t('district_label', selectedLang)}
                  </label>
                  <input
                    type="text"
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                    placeholder={`🔍 ${t('search_placeholder', selectedLang)}`}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs mb-1"
                  />
                  <select
                    value={districtName}
                    onChange={(e) => {
                      const nextDist = e.target.value;
                      setDistrictName(nextDist);
                      const dObj = currentStateObj?.districts.find(
                        (d) => d.name_en === nextDist
                      );
                      if (dObj) {
                        if (dObj.defaultPin) setPinCode(dObj.defaultPin);
                        if (dObj.blocks[0]) {
                          setBlockName(dObj.blocks[0].name_en);
                          if (dObj.blocks[0].villages[0]) {
                            setVillageName(dObj.blocks[0].villages[0].name_en);
                          }
                        }
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-300 font-bold text-sm bg-white"
                  >
                    {filteredDistricts.map((d) => (
                      <option key={d.code} value={d.name_en}>
                        {d.name_en} — {d.name_or}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Block (Searchable) */}
                <div className="space-y-1">
                  <label className="block text-xs font-black uppercase text-stone-700">
                    {t('block_label', selectedLang)}
                  </label>
                  <input
                    type="text"
                    value={blockSearch}
                    onChange={(e) => setBlockSearch(e.target.value)}
                    placeholder={`🔍 ${t('search_placeholder', selectedLang)}`}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs mb-1"
                  />
                  <select
                    value={blockName}
                    onChange={(e) => {
                      const nextBlk = e.target.value;
                      setBlockName(nextBlk);
                      const bObj = currentDistrictObj?.blocks.find(
                        (b) => b.name_en === nextBlk
                      );
                      if (bObj && bObj.villages[0]) {
                        setVillageName(bObj.villages[0].name_en);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-300 font-bold text-sm bg-white"
                  >
                    {filteredBlocks.map((b) => {
                      const bOr = (b as { name_or?: string }).name_or;
                      return (
                        <option key={b.name_en} value={b.name_en}>
                          {b.name_en} {bOr ? `— ${bOr}` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 4. Village (Searchable + "My village is not listed") */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black uppercase text-stone-700">
                      {t('village_label', selectedLang)}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomVillage(!isCustomVillage)}
                      className="text-[11px] font-black text-emerald-800 underline cursor-pointer"
                    >
                      {isCustomVillage
                        ? t('choose_from_list', selectedLang)
                        : t('village_not_listed', selectedLang)}
                    </button>
                  </div>

                  {!isCustomVillage ? (
                    <>
                      <input
                        type="text"
                        value={villageSearch}
                        onChange={(e) => setVillageSearch(e.target.value)}
                        placeholder={`🔍 ${t('search_placeholder', selectedLang)}`}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs mb-1"
                      />
                      <select
                        value={villageName}
                        onChange={(e) => {
                          if (e.target.value === '__NOT_LISTED__') {
                            setIsCustomVillage(true);
                          } else {
                            setVillageName(e.target.value);
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-300 font-bold text-sm bg-white"
                      >
                        {filteredVillages.map((v) => {
                          const vOr = (v as { name_or?: string }).name_or;
                          return (
                            <option key={v.name_en} value={v.name_en}>
                              {v.name_en} {vOr ? `— ${vOr}` : ''}
                            </option>
                          );
                        })}
                        <option value="__NOT_LISTED__">
                          + {t('village_not_listed', selectedLang)}
                        </option>
                      </select>
                    </>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={customVillageText}
                        onChange={(e) => setCustomVillageText(e.target.value)}
                        placeholder={t('type_village_placeholder', selectedLang)}
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-500 font-bold text-sm bg-amber-50/40"
                      />
                      <span className="text-[10px] font-bold text-amber-800 block">
                        {t('unverified_village_note', selectedLang)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* All Villages in Selected Block Quick Tap Chips */}
              {currentBlockObj && currentBlockObj.villages.length > 0 && (
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-stone-500 block">
                    {selectedLang === 'or'
                      ? `${blockName} ବ୍ଲକର ଗାଁ ତାଲିକା:`
                      : `Villages in ${blockName} Block:`}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentBlockObj.villages.map((v) => {
                      const vOr = (v as { name_or?: string }).name_or;
                      const isActive = !isCustomVillage && villageName === v.name_en;
                      return (
                        <button
                          key={v.name_en}
                          type="button"
                          onClick={() => {
                            setIsCustomVillage(false);
                            setVillageName(v.name_en);
                          }}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                              : 'bg-white text-stone-800 border-stone-200 hover:border-emerald-400'
                          }`}
                        >
                          {v.name_en} {vOr ? `(${vOr})` : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PIN Code, Land Ownership & Irrigation Source */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase text-stone-700 mb-1 flex items-center justify-between">
                    <span>{t('pin_code_label', selectedLang)}</span>
                    {isLookingUpPin && (
                      <span className="text-[10px] text-emerald-700 font-bold animate-pulse">
                        {selectedLang === 'or' ? 'ଖୋଜାଯାଉଛି...' : 'Verifying...'}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="753001"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-emerald-500 font-mono font-black text-sm text-emerald-950 bg-emerald-50/50"
                  />
                  {pinAutoBanner && (
                    <div className="mt-1 text-[11px] font-black text-emerald-800 bg-emerald-100/80 px-2 py-1 rounded-lg border border-emerald-300">
                      {pinAutoBanner}
                    </div>
                  )}
                </div>

                {/* Optional: Land Ownership */}
                <div>
                  <label className="block text-xs font-black uppercase text-stone-700 mb-1">
                    {t('land_ownership_label', selectedLang)}
                  </label>
                  <select
                    value={landOwnership}
                    onChange={(e) => setLandOwnership(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-300 font-bold text-sm bg-white"
                  >
                    <option value="own">{t('ownership_own', selectedLang)}</option>
                    <option value="tenant">{t('ownership_tenant', selectedLang)}</option>
                    <option value="sharecropper">
                      {t('ownership_sharecropper', selectedLang)}
                    </option>
                  </select>
                </div>

                {/* Optional: Irrigation Source */}
                <div>
                  <label className="block text-xs font-black uppercase text-stone-700 mb-1">
                    {t('irrigation_source_label', selectedLang)}
                  </label>
                  <select
                    value={irrigationSource}
                    onChange={(e) => setIrrigationSource(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-300 font-bold text-sm bg-white"
                  >
                    <option value="rain_fed">{t('irr_rain_fed', selectedLang)}</option>
                    <option value="canal">{t('irr_canal', selectedLang)}</option>
                    <option value="tubewell_borewell">{t('irr_tubewell', selectedLang)}</option>
                    <option value="pond_river">{t('irr_pond_river', selectedLang)}</option>
                    <option value="drip_sprinkler">{t('irr_drip_sprinkler', selectedLang)}</option>
                  </select>
                </div>
              </div>

              {/* Optional: Emergency Contact Name & Phone */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-black uppercase text-stone-700 mb-1">
                    {t('emergency_contact_name_label', selectedLang)}
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="—"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-stone-700 mb-1">
                    {t('emergency_contact_phone_label', selectedLang)}
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={emergencyContactPhone}
                    onChange={(e) =>
                      setEmergencyContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    placeholder="98610XXXXX"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm font-mono font-bold bg-white"
                  />
                </div>
              </div>

              {step5Error && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-300 text-red-800 text-xs font-bold">
                  ⚠️ {step5Error}
                </div>
              )}

              <button
                type="button"
                onClick={validateAndFinishStep5}
                className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>
                  {returnToReview
                    ? t('save_return_review', selectedLang)
                    : t('continue_btn', selectedLang)}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 6: WHAT DO YOU FARM (14 Picture Categories + Crop Chips)    */}
          {/* ---------------------------------------------------------------- */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
                  {t('crops_step_title', selectedLang)}
                </h2>
                <p className="text-xs text-stone-600 font-medium">
                  {t('crops_step_subtitle', selectedLang)}
                </p>
              </div>

              {/* Selected Crop Chips */}
              {selectedCropIds.length > 0 && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                  <span className="text-[11px] font-black uppercase text-emerald-900 block">
                    {t('selected_crops_label', selectedLang, {
                      count: selectedCropIds.length
                    })}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCropIds.map((cid) => {
                      const item = cropCatalogMap.get(cid);
                      return (
                        <span
                          key={cid}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 text-white text-xs font-bold shadow-2xs"
                        >
                          <span>{item?.icon || '🌱'}</span>
                          <span>{getLocalizedCropName(cid)}</span>
                          <button
                            type="button"
                            onClick={() => toggleCropId(cid)}
                            className="hover:text-amber-300 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 14 Large Picture Cards for Farming Types */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[340px] overflow-y-auto pr-1">
                {cropsData.categories.map((cat) => {
                  const catName =
                    (cat.name as Record<string, string>)[selectedLang] || cat.name.en;
                  const selectedInCatCount = cat.items.filter((i) =>
                    selectedCropIds.includes(i.id)
                  ).length;
                  const isActive =
                    selectedCategories.includes(cat.id) || selectedInCatCount > 0;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleOpenCategoryItems(cat.id)}
                      className={`group rounded-2xl border-2 overflow-hidden text-left transition-all flex flex-col cursor-pointer ${
                        isActive
                          ? 'border-emerald-700 bg-emerald-50/70 shadow-md'
                          : 'border-stone-200 bg-white hover:border-emerald-400'
                      }`}
                    >
                      <div className="h-20 w-full relative overflow-hidden bg-stone-200">
                        <img
                          src={cat.image}
                          alt={cat.name.en}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        <span className="absolute bottom-1.5 left-2 text-xl">
                          {cat.icon}
                        </span>
                        {selectedInCatCount > 0 && (
                          <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-black text-[10px] shadow-xs">
                            ✓ {selectedInCatCount}
                          </span>
                        )}
                      </div>
                      <div className="p-2.5">
                        <div className="font-black text-xs sm:text-sm text-stone-900 line-clamp-2 leading-snug">
                          {catName}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Other Custom Text Box */}
              <div className="space-y-1">
                <label className="block text-xs font-black uppercase text-stone-700">
                  {t('other_crops_label', selectedLang)}
                </label>
                <input
                  type="text"
                  value={otherCropCustomText}
                  onChange={(e) => setOtherCropCustomText(e.target.value)}
                  placeholder={t('other_crops_placeholder', selectedLang)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-300 text-sm font-bold"
                />
              </div>

              {/* Mandatory Note under the list */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs font-bold flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{t('crops_advice_note', selectedLang)}</span>
              </div>

              {step6Error && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-300 text-red-800 text-xs font-bold">
                  ⚠️ {step6Error}
                </div>
              )}

              <button
                type="button"
                onClick={validateAndFinishStep6}
                className="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('continue_btn', selectedLang)}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* STEP 7: REVIEW AND CREATE ACCOUNT                                */}
          {/* ---------------------------------------------------------------- */}
          {step === 7 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
                  {t('review_step_title', selectedLang)}
                </h2>
                <p className="text-xs text-stone-600 font-medium">
                  {t('review_step_subtitle', selectedLang)}
                </p>
              </div>

              {/* Section 1: Farmer Details & Field Size */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {photoDataUrl && !photoSkipped && photoConsentAgreed ? (
                    <img
                      src={photoDataUrl}
                      alt={fullName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-emerald-600"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-black text-lg">
                      {getInitials(fullName)}
                    </div>
                  )}
                  <div className="text-xs space-y-0.5">
                    <div className="font-black text-sm text-stone-900">{fullName}</div>
                    <div className="text-stone-600">
                      {t('age_label', selectedLang)}: {age} • {t('gender_label', selectedLang)}:{' '}
                      {t(
                        gender === 'Male'
                          ? 'gender_male'
                          : gender === 'Female'
                          ? 'gender_female'
                          : 'gender_other',
                        selectedLang
                      )}{' '}
                      • +91 {otpVerifiedMobile || mobile}
                    </div>
                    <div className="font-bold text-emerald-800">
                      {t('field_size_label', selectedLang)}:{' '}
                      {dontKnowFieldSize
                        ? `${unknownSizeChoice.toUpperCase()} (~${computedAcres} Acres)`
                        : `${fieldValue} ${fieldUnit} (${computedAcres} Acres)`}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setReturnToReview(true);
                    setStep(4);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-black text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{t('edit_btn', selectedLang)}</span>
                </button>
              </div>

              {/* Section 2: Address */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start justify-between gap-3">
                <div className="text-xs space-y-1">
                  <div className="font-black text-sm text-stone-900">
                    {t('address_step_title', selectedLang)}
                  </div>
                  <div className="text-stone-700 font-semibold">
                    {isCustomVillage ? `${customVillageText} (Unverified)` : villageName} •{' '}
                    {blockName}
                  </div>
                  <div className="text-stone-700 font-semibold">
                    {districtName}, {stateName} — PIN: {pinCode || 'N/A'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setReturnToReview(true);
                    setStep(5);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-black text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{t('edit_btn', selectedLang)}</span>
                </button>
              </div>

              {/* Section 3: Selected Crops */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start justify-between gap-3">
                <div className="text-xs space-y-1.5">
                  <div className="font-black text-sm text-stone-900">
                    {t('selected_crops_label', selectedLang, {
                      count: selectedCropIds.length
                    })}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedCropIds.map((cid) => (
                      <span
                        key={cid}
                        className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold"
                      >
                        {getLocalizedCropName(cid)}
                      </span>
                    ))}
                    {otherCropCustomText && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                        {otherCropCustomText}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setReturnToReview(true);
                    setStep(6);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs font-black text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{t('edit_btn', selectedLang)}</span>
                </button>
              </div>

              {/* Photo, AI Assistant Call & Privacy Consent Checkboxes */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5 text-xs">
                {photoDataUrl && !photoSkipped && (
                  <label className="flex items-start gap-2.5 cursor-pointer font-bold text-stone-800">
                    <input
                      type="checkbox"
                      checked={photoConsentAgreed}
                      onChange={(e) => setPhotoConsentAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-emerald-700"
                    />
                    <span>{t('photo_consent_label', selectedLang)}</span>
                  </label>
                )}


                <div className="flex items-start gap-2 text-emerald-950 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{t('privacy_security_note', selectedLang)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateAccount}
                disabled={isSavingAccount}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-base sm:text-lg shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-6 h-6 text-amber-300" />
                <span>{t('create_account_btn', selectedLang)}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SEARCHABLE PICTURE LIST SUB-MODAL FOR STEP 6 CROPS                   */}
      {/* ==================================================================== */}
      {activeCategoryObj && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3">
          <div className="w-full max-w-lg rounded-3xl bg-white text-stone-900 shadow-2xl border-2 border-emerald-700 overflow-hidden flex flex-col max-h-[88vh]">
            <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{activeCategoryObj.icon}</span>
                <h3 className="font-black text-base">
                  {(activeCategoryObj.name as Record<string, string>)[selectedLang] ||
                    activeCategoryObj.name.en}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveCategoryModal(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b border-stone-200 bg-stone-50">
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={cropSearchQuery}
                  onChange={(e) => setCropSearchQuery(e.target.value)}
                  placeholder={t('search_placeholder', selectedLang)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 bg-white text-sm font-bold"
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 flex-1">
              {activeCategoryObj.items
                .filter((item) => {
                  if (!cropSearchQuery.trim()) return true;
                  const q = cropSearchQuery.toLowerCase();
                  return (
                    item.name_en.toLowerCase().includes(q) ||
                    (item.name_or && item.name_or.toLowerCase().includes(q)) ||
                    (item.name_hi && item.name_hi.toLowerCase().includes(q))
                  );
                })
                .map((item) => {
                  const isSelected = selectedCropIds.includes(item.id);
                  const localName = getLocalizedCropName(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleCropId(item.id)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-900 text-white border-amber-400 shadow-sm'
                          : 'bg-stone-50 hover:bg-emerald-50 text-stone-900 border-stone-200'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-2xl">{item.icon}</span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <div className="font-black text-xs leading-snug">{localName}</div>
                      <div
                        className={`text-[10px] ${
                          isSelected ? 'text-emerald-200' : 'text-stone-500'
                        }`}
                      >
                        {item.name_en}
                      </div>
                    </button>
                  );
                })}
            </div>

            <div className="p-3.5 bg-stone-50 border-t border-stone-200 space-y-2">
              <input
                type="text"
                value={otherCropCustomText}
                onChange={(e) => setOtherCropCustomText(e.target.value)}
                placeholder={t('other_crops_placeholder', selectedLang)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold"
              />
              <button
                type="button"
                onClick={() => setActiveCategoryModal(null)}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm cursor-pointer"
              >
                {t('done_selected_btn', selectedLang, {
                  count: selectedCropIds.length
                })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
