import React, { useState, useEffect, useRef } from 'react';
import { Language, FarmerProfile, FieldSizeUnit } from '../types';
import { SUPPORTED_LANGUAGES, t } from '../services/translations';
import {
  convertFieldSizeToAcres,
  registerAndSignInFarmer,
} from '../services/authDatabaseService';
import {
  subscribeSyncStatus,
  processOfflineSyncQueue,
  saveDraftToPhoneOnly,
  SyncEngineSnapshot,
} from '../services/localFirstSyncEngine';
import { getInitials } from './FarmerIdCardModal';
import {
  getAllCropsCatalog,
  getLocalizedCropName,
} from './CropSelector';
import {
  X,
  QrCode,
  User,
  Lock,
  Sprout,
  Globe,
  Play,
  Bell,
  PhoneCall,
  HelpCircle,
  ShieldAlert,
  Info,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Camera,
  Upload,
  Check,
  RefreshCw,
  Cloud,
  Smartphone,
  Trash2,
  Send,
  ShieldCheck,
} from 'lucide-react';

interface ThreeDotMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  profile: FarmerProfile | null;
  onProfileUpdated: (updated: FarmerProfile) => void;
  onOpenFarmerIdModal: () => void;
  onOpenCorrectionModal: () => void;
  onOpenTraining: () => void;
  onOpenAdminModal: () => void;
  onRequestSignOut: () => void;
  onDeleteAccount: () => Promise<void>;
  initialSubView?: MenuSubView;
}

export type MenuSubView =
  | 'root'
  | 'account'
  | 'crops_field'
  | 'language'
  | 'permissions'
  | 'emergency'
  | 'help_report'
  | 'privacy_delete'
  | 'about';

const FIELD_UNITS: { unit: FieldSizeUnit; labelKey: string }[] = [
  { unit: 'Acre', labelKey: 'unit_acre' },
  { unit: 'Hectare', labelKey: 'unit_hectare' },
  { unit: 'Decimal', labelKey: 'unit_decimal' },
  { unit: 'Cent', labelKey: 'unit_cent' },
  { unit: 'Guntha', labelKey: 'unit_guntha' },
  { unit: 'Bigha', labelKey: 'unit_bigha' },
  { unit: 'Katha', labelKey: 'unit_katha' },
  { unit: 'Square feet', labelKey: 'unit_sqft' },
  { unit: 'Square metre', labelKey: 'unit_sqm' },
];

export const ThreeDotMenuDrawer: React.FC<ThreeDotMenuDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  setLang,
  profile,
  onProfileUpdated,
  onOpenFarmerIdModal,
  onOpenCorrectionModal,
  onOpenTraining,
  onOpenAdminModal,
  onRequestSignOut,
  onDeleteAccount,
  initialSubView = 'root',
}) => {
  const [subView, setSubView] = useState<MenuSubView>(initialSubView);
  const [syncSnap, setSyncSnap] = useState<SyncEngineSnapshot>({
    status: 'saved_on_phone',
    pendingCount: 0,
    lastSyncedAt: null,
    isOnline: true,
    lastError: null,
  });

  // Editable Account & Field State
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('38');
  const [editGender, setEditGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [editPhoto, setEditPhoto] = useState('');
  const [editPhotoConsent, setEditPhotoConsent] = useState(true);
  const [editFieldVal, setEditFieldVal] = useState('2');
  const [editFieldUnit, setEditFieldUnit] = useState<FieldSizeUnit>('Acre');
  const [editManualAcres, setEditManualAcres] = useState('1.0');
  const [editLandOwnership, setEditLandOwnership] = useState<'own' | 'tenant' | 'sharecropper'>('own');
  const [editIrrigation, setEditIrrigation] = useState<
    'rain_fed' | 'canal' | 'tubewell_borewell' | 'pond_river' | 'drip_sprinkler'
  >('rain_fed');
  const [editEmergName, setEditEmergName] = useState('');
  const [editEmergPhone, setEditEmergPhone] = useState('');
  const [editCropIds, setEditCropIds] = useState<string[]>([]);
  const [cropSearch, setCropSearch] = useState('');
  const [savedNotice, setSavedNotice] = useState('');

  // Live Camera inside Account Editor
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Permissions Status Check
  const [permStatus, setPermStatus] = useState<{
    camera: string;
    microphone: string;
    location: string;
    notifications: string;
    storage: string;
  }>({
    camera: 'prompt',
    microphone: 'prompt',
    location: 'prompt',
    notifications:
      typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
    storage: 'granted',
  });

  // Report a Problem State
  const [problemText, setProblemText] = useState('');
  const [problemSubmitted, setProblemSubmitted] = useState(false);

  // Delete Account Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const { categories, byId, byNameLower } = getAllCropsCatalog();

  useEffect(() => {
    return subscribeSyncStatus((snap) => {
      setSyncSnap(snap);
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSubView(initialSubView);
      setSavedNotice('');
      setProblemSubmitted(false);
      setShowDeleteConfirm(false);
      if (profile) {
        setEditName(profile.fullName || profile.name || '');
        setEditAge(String(profile.age || 38));
        setEditGender(profile.gender || 'Male');
        setEditPhoto(profile.photoDataUrl || '');
        setEditPhotoConsent(profile.photoConsentGiven ?? true);
        setEditFieldVal(String(profile.fieldSize?.enteredValue ?? profile.landholdingAcres ?? 2));
        setEditFieldUnit(profile.fieldSize?.unit || 'Acre');
        setEditManualAcres(String(profile.fieldSize?.acres ?? profile.landholdingAcres ?? 1));
        setEditLandOwnership(profile.landOwnership || 'own');
        setEditIrrigation(profile.irrigationSource || 'rain_fed');
        setEditEmergName(profile.emergencyContact?.name || '');
        setEditEmergPhone(profile.emergencyContact?.phone || '');

        const rawCrops = profile.cropIds || profile.primaryCrops || profile.crops || [];
        const resolvedIds: string[] = [];
        for (const c of rawCrops) {
          const item = byId.get(c) || byNameLower.get(String(c).toLowerCase());
          if (item && !resolvedIds.includes(item.id)) {
            resolvedIds.push(item.id);
          }
        }
        setEditCropIds(resolvedIds.length > 0 ? resolvedIds : ['paddy']);
      }
      checkBrowserPermissionStatuses();
    } else {
      stopCameraStream();
    }
  }, [isOpen, profile, initialSubView]);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const startLiveCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 400 }, height: { ideal: 400 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch {
      fileInputRef.current?.click();
    }
  };

  const capturePhotoFromVideo = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 240, 240);
      setEditPhoto(canvas.toDataURL('image/jpeg', 0.82));
    }
    stopCameraStream();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditPhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const checkBrowserPermissionStatuses = async () => {
    const next = { ...permStatus };
    if (typeof Notification !== 'undefined') {
      next.notifications = Notification.permission;
    }
    if (navigator.permissions && navigator.permissions.query) {
      for (const name of ['camera', 'microphone', 'geolocation'] as const) {
        try {
          const res = await navigator.permissions.query({ name: name as PermissionName });
          if (name === 'geolocation') next.location = res.state;
          else next[name] = res.state;
        } catch {}
      }
    }
    if (navigator.storage && navigator.storage.persisted) {
      try {
        const persisted = await navigator.storage.persisted();
        next.storage = persisted ? 'granted' : 'prompt';
      } catch {}
    }
    setPermStatus(next);
  };

  if (!isOpen) return null;

  const formatLastSynced = (iso: string | null): string => {
    if (!iso) return t('last_synced_never', lang);
    try {
      const d = new Date(iso);
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return t('last_synced_label', lang, { time: timeStr });
    } catch {
      return t('last_synced_never', lang);
    }
  };

  const handleSaveProfileChanges = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profile) return;

    const cleanName = editName.trim() || profile.name;
    const numAge = Math.min(100, Math.max(10, Number(editAge) || 38));
    const numVal = Math.max(0.01, Number(editFieldVal) || 1);
    const computedAcres = convertFieldSizeToAcres(
      numVal,
      editFieldUnit,
      Number(editManualAcres) || 1
    );

    const cropNamesEn = editCropIds.map((id) => byId.get(id)?.name_en || id);

    const updated: FarmerProfile = {
      ...profile,
      name: cleanName,
      fullName: cleanName,
      age: numAge,
      gender: editGender,
      photoDataUrl: editPhotoConsent ? editPhoto : '',
      photoConsentGiven: editPhotoConsent,
      fieldSize: {
        enteredValue: numVal,
        unit: editFieldUnit,
        acres: computedAcres,
      },
      landholdingAcres: computedAcres,
      landAcres: computedAcres,
      landOwnership: editLandOwnership,
      irrigationSource: editIrrigation,
      emergencyContact: {
        name: editEmergName.trim(),
        phone: editEmergPhone.replace(/\D/g, '').slice(-10),
      },
      cropIds: editCropIds,
      primaryCrops: cropNamesEn,
      crops: cropNamesEn,
      consentRecord: {
        agreed: true,
        date: profile.consentRecord?.date || new Date().toISOString(),
        photoAgreed: editPhotoConsent,
      },
      updatedAt: Date.now(),
    };

    const saved = registerAndSignInFarmer(updated, [
      'name',
      'fullName',
      'age',
      'gender',
      'photoDataUrl',
      'photoConsentGiven',
      'fieldSize',
      'landholdingAcres',
      'landAcres',
      'landOwnership',
      'irrigationSource',
      'emergencyContact',
      'cropIds',
      'primaryCrops',
      'crops',
      'consentRecord',
    ]);
    onProfileUpdated(saved);
    setSavedNotice('✓ Saved on phone & queued for server sync');
    setTimeout(() => setSavedNotice(''), 3500);
  };

  const toggleCropInProfile = (cropId: string) => {
    setEditCropIds((prev) =>
      prev.includes(cropId)
        ? prev.length > 1
          ? prev.filter((c) => c !== cropId)
          : prev
        : [...prev, cropId]
    );
  };

  const handleProblemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemText.trim()) return;
    await saveDraftToPhoneOnly(`problem_report_${Date.now()}`, {
      mobile: profile?.mobile || 'guest',
      farmerId: profile?.id || 'guest',
      message: problemText.trim(),
      createdAt: new Date().toISOString(),
    });
    setProblemText('');
    setProblemSubmitted(true);
  };

  const handleConfirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await onDeleteAccount();
      onClose();
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const allCropsList = categories.flatMap((c) => c.items);
  const filteredCropsForEditor = cropSearch.trim()
    ? allCropsList.filter((item) => {
        const q = cropSearch.trim().toLowerCase();
        return (
          item.name_en.toLowerCase().includes(q) ||
          item.name_or.toLowerCase().includes(q) ||
          item.name_hi.toLowerCase().includes(q)
        );
      })
    : allCropsList.slice(0, 24);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-start bg-stone-950/75 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      {/* Left Slide-Over Menu Drawer */}
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden text-left">
        {/* MENU HEADER: Round Photo, Name, Farmer ID & Last Synced */}
        <div className="bg-emerald-900 text-white p-4 sm:p-5 border-b border-emerald-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {subView !== 'root' && (
                <button
                  onClick={() => {
                    stopCameraStream();
                    setSubView('root');
                  }}
                  className="p-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white cursor-pointer shrink-0"
                  title={t('back_btn', lang)}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              {/* Round Photo or Initials Placeholder */}
              <div className="w-12 h-12 rounded-full bg-amber-400 text-stone-950 font-black flex items-center justify-center overflow-hidden border-2 border-amber-300 shrink-0 shadow-sm">
                {profile?.photoDataUrl ? (
                  <img
                    src={profile.photoDataUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-base">{getInitials(profile?.name || 'KB')}</span>
                )}
              </div>

              <div className="min-w-0">
                <div className="font-black text-base text-white truncate">
                  {profile?.fullName || profile?.name || t('home_greeting_default_farmer', lang)}
                </div>
                <div className="font-mono text-xs text-amber-300 font-bold truncate">
                  {profile?.id || 'KB-ODI-000000'}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                stopCameraStream();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-white/10 text-white/90 cursor-pointer shrink-0"
              aria-label={t('close_btn', lang)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sync Status & Small "Last synced" Time (Requirement 1 & 10) */}
          <div className="mt-3 pt-2.5 border-t border-emerald-800/80 flex items-center justify-between gap-2 text-[11px]">
            <button
              onClick={() => processOfflineSyncQueue().catch(() => {})}
              className="inline-flex items-center gap-1.5 font-bold text-emerald-200 hover:text-white cursor-pointer"
            >
              {syncSnap.status === 'saved_to_server' && syncSnap.pendingCount === 0 ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t('sync_saved_to_server', lang)}</span>
                </>
              ) : syncSnap.status === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  <span>{t('sync_syncing', lang)}</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t('sync_saved_on_phone', lang)}</span>
                </>
              )}
            </button>

            <span className="text-emerald-200/90 tabular-nums">
              {formatLastSynced(syncSnap.lastSyncedAt || profile?.lastSyncedAt || null)}
            </span>
          </div>
        </div>

        {/* Saved Feedback Banner */}
        {savedNotice && (
          <div className="bg-emerald-100 border-b border-emerald-300 px-4 py-2 text-xs font-black text-emerald-900 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>{savedNotice}</span>
          </div>
        )}

        {/* MENU BODY */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
          {subView === 'root' && (
            <div className="py-1">
              {/* 1. My ID card (QR) */}
              <button
                onClick={() => {
                  onClose();
                  onOpenFarmerIdModal();
                }}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors cursor-pointer min-h-[56px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-extrabold text-stone-900">
                    {t('menu_my_id_card', lang)}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* 2. My account and Change details */}
              <button
                onClick={() => setSubView('account')}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors cursor-pointer min-h-[56px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-extrabold text-stone-900">
                    {t('menu_my_account', lang)}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* 3. Request a correction (for locked fields) */}
              <button
                onClick={() => {
                  onClose();
                  onOpenCorrectionModal();
                }}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors cursor-pointer min-h-[56px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-extrabold text-stone-900">
                    {t('menu_request_correction', lang)}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* 4. My crops and field */}
              <button
                onClick={() => setSubView('crops_field')}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors cursor-pointer min-h-[56px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-extrabold text-stone-900">
                    {t('menu_my_crops_field', lang)}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* 5. Language */}
              <button
                onClick={() => setSubView('language')}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors cursor-pointer min-h-[56px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-extrabold text-stone-900">
                    {t('menu_language', lang)}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* 6. Replay app training */}
              <button
                onClick={() => {
                  onClose();
                  onOpenTraining();
                }}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors cursor-pointer min-h-[56px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Play className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-extrabold text-stone-900">
                    {t('menu_replay_training', lang)}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* 7. Notifications and permissions */}
              <button
                onClick={() => setSubView('permissions')}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors cursor-pointer min-h-[56px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-extrabold text-stone-900">
                    {t('menu_notifications_permissions', lang)}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* 8. Emergency contact */}
              <button
                onClick={() => setSubView('emergency')}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors cursor-pointer min-h-[56px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-extrabold text-stone-900">
                    {t('menu_emergency_contact', lang)}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* 9. Help and Report a problem */}
              <button
                onClick={() => setSubView('help_report')}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors cursor-pointer min-h-[56px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-extrabold text-stone-900">
                    {t('menu_help_report', lang)}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* 10. Privacy and Delete my data and account */}
              <button
                onClick={() => setSubView('privacy_delete')}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors cursor-pointer min-h-[56px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-extrabold text-stone-900">
                    {t('menu_privacy_delete', lang)}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* 11. About */}
              <button
                onClick={() => setSubView('about')}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors cursor-pointer min-h-[56px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-extrabold text-stone-900">
                    {t('menu_about', lang)}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>

              {/* 12. Sign out */}
              <button
                onClick={() => {
                  onClose();
                  onRequestSignOut();
                }}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-red-50 transition-colors cursor-pointer min-h-[56px] border-t border-stone-200 mt-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-black text-red-700">
                    {t('menu_sign_out', lang)}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400" />
              </button>
            </div>
          )}

          {/* SUB-VIEW: MY ACCOUNT AND CHANGE DETAILS */}
          {subView === 'account' && (
            <form onSubmit={handleSaveProfileChanges} className="p-4 space-y-4">
              <h3 className="text-base font-black text-stone-900">
                {t('menu_my_account', lang)}
              </h3>

              {/* LOCKED FIELDS SECTION (With Lock Icon) */}
              <div className="p-3.5 rounded-2xl bg-stone-100 border border-stone-300 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-stone-800">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Locked Server Master Fields</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCorrectionModal();
                    }}
                    className="text-[11px] font-black text-emerald-800 underline cursor-pointer"
                  >
                    {t('menu_request_correction', lang)}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-stone-700">
                  <div className="p-2 rounded-xl bg-white border border-stone-200 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-stone-400 shrink-0" />
                    <span className="truncate font-mono font-bold">
                      +91 {profile?.mobile || '—'}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-stone-200 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-stone-400 shrink-0" />
                    <span className="truncate font-bold">{profile?.state || 'Odisha'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-stone-200 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-stone-400 shrink-0" />
                    <span className="truncate font-bold">{profile?.district || '—'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-stone-200 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-stone-400 shrink-0" />
                    <span className="truncate font-bold">{profile?.block || '—'}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-stone-200 flex items-center gap-1.5 col-span-2">
                    <Lock className="w-3 h-3 text-stone-400 shrink-0" />
                    <span className="truncate font-bold">
                      Village: {profile?.village || '—'}
                      {profile?.gpsLocation
                        ? ` • GPS: ${profile.gpsLocation.lat.toFixed(4)}, ${profile.gpsLocation.lon.toFixed(4)}`
                        : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* EDITABLE PHOTO */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2.5">
                <label className="block text-xs font-black text-stone-800">
                  {t('photo_label', lang)}
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-800 text-white font-black flex items-center justify-center overflow-hidden border-2 border-emerald-600 shrink-0">
                    {editPhoto ? (
                      <img
                        src={editPhoto}
                        alt="Farmer"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span>{getInitials(editName || 'KB')}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={startLiveCamera}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{t('take_live_photo', lang)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t('upload_photo', lang)}</span>
                    </button>
                    {editPhoto && (
                      <button
                        type="button"
                        onClick={() => setEditPhoto('')}
                        className="px-2.5 py-1.5 rounded-xl bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {isCameraOpen && (
                  <div className="space-y-2 pt-2">
                    <video
                      ref={videoRef}
                      className="w-40 h-40 rounded-full object-cover mx-auto border-2 border-emerald-600"
                      playsInline
                      muted
                    />
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={capturePhotoFromVideo}
                        className="px-4 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-black cursor-pointer"
                      >
                        {t('capture_photo_btn', lang)}
                      </button>
                      <button
                        type="button"
                        onClick={stopCameraStream}
                        className="px-3 py-1.5 rounded-xl bg-stone-200 text-stone-800 text-xs font-bold cursor-pointer"
                      >
                        {t('cancel_btn', lang)}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* EDITABLE NAME, AGE, GENDER */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('full_name_label', lang)}
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm font-bold text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('age_label', lang)} (10–100)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={editAge}
                      onChange={(e) => setEditAge(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm font-bold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('gender_label', lang)}
                    </label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value as any)}
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm font-bold text-stone-900 bg-white"
                    >
                      <option value="Male">{t('gender_male', lang)}</option>
                      <option value="Female">{t('gender_female', lang)}</option>
                      <option value="Other">{t('gender_other', lang)}</option>
                    </select>
                  </div>
                </div>

                {/* FIELD SIZE */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('field_size_value_label', lang)}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={editFieldVal}
                      onChange={(e) => setEditFieldVal(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm font-bold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('field_size_unit_label', lang)}
                    </label>
                    <select
                      value={editFieldUnit}
                      onChange={(e) => setEditFieldUnit(e.target.value as FieldSizeUnit)}
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm font-bold text-stone-900 bg-white"
                    >
                      {FIELD_UNITS.map((u) => (
                        <option key={u.unit} value={u.unit}>
                          {t(u.labelKey, lang)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {(editFieldUnit === 'Bigha' || editFieldUnit === 'Katha') && (
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      {t('bigha_katha_prompt', lang)}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={editManualAcres}
                      onChange={(e) => setEditManualAcres(e.target.value)}
                      className="w-full rounded-xl border border-amber-400 bg-amber-50 px-3 py-2 text-sm font-bold text-stone-900"
                    />
                  </div>
                )}

                {/* LAND & IRRIGATION */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('land_ownership_label', lang)}
                    </label>
                    <select
                      value={editLandOwnership}
                      onChange={(e) => setEditLandOwnership(e.target.value as any)}
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold text-stone-900 bg-white"
                    >
                      <option value="own">{t('land_own', lang)}</option>
                      <option value="tenant">{t('land_tenant', lang)}</option>
                      <option value="sharecropper">{t('land_sharecropper', lang)}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('irrigation_source_label', lang)}
                    </label>
                    <select
                      value={editIrrigation}
                      onChange={(e) => setEditIrrigation(e.target.value as any)}
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold text-stone-900 bg-white"
                    >
                      <option value="rain_fed">{t('irr_rain_fed', lang)}</option>
                      <option value="canal">{t('irr_canal', lang)}</option>
                      <option value="tubewell_borewell">{t('irr_tubewell', lang)}</option>
                      <option value="pond_river">{t('irr_pond_river', lang)}</option>
                      <option value="drip_sprinkler">{t('irr_drip_sprinkler', lang)}</option>
                    </select>
                  </div>
                </div>

                {/* EMERGENCY CONTACT */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('emergency_contact_name', lang)}
                    </label>
                    <input
                      type="text"
                      value={editEmergName}
                      onChange={(e) => setEditEmergName(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {t('emergency_contact_phone', lang)}
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={editEmergPhone}
                      onChange={(e) =>
                        setEditEmergPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                      }
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold text-stone-900"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-black text-sm shadow-md cursor-pointer"
              >
                Save Changes
              </button>
            </form>
          )}

          {/* SUB-VIEW: MY CROPS AND FIELD */}
          {subView === 'crops_field' && (
            <div className="p-4 space-y-4">
              <h3 className="text-base font-black text-stone-900">
                {t('menu_my_crops_field', lang)}
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('field_size_value_label', lang)}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={editFieldVal}
                    onChange={(e) => setEditFieldVal(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('field_size_unit_label', lang)}
                  </label>
                  <select
                    value={editFieldUnit}
                    onChange={(e) => setEditFieldUnit(e.target.value as FieldSizeUnit)}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm font-bold text-stone-900 bg-white"
                  >
                    {FIELD_UNITS.map((u) => (
                      <option key={u.unit} value={u.unit}>
                        {t(u.labelKey, lang)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  {t('search_crops_placeholder', lang)}
                </label>
                <input
                  type="text"
                  value={cropSearch}
                  onChange={(e) => setCropSearch(e.target.value)}
                  placeholder={t('search_crops_placeholder', lang)}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold text-stone-900 mb-2.5"
                />

                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-1">
                  {filteredCropsForEditor.map((crop) => {
                    const selected = editCropIds.includes(crop.id);
                    return (
                      <button
                        key={crop.id}
                        type="button"
                        onClick={() => toggleCropInProfile(crop.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 text-left cursor-pointer ${
                          selected
                            ? 'bg-emerald-800 text-white border-emerald-900'
                            : 'bg-stone-50 text-stone-800 border-stone-200'
                        }`}
                      >
                        <span>{crop.icon}</span>
                        <span className="truncate flex-1">{getLocalizedCropName(crop, lang)}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveProfileChanges()}
                className="w-full py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-black text-sm shadow-md cursor-pointer"
              >
                Save Crops & Field Size
              </button>
            </div>
          )}

          {/* SUB-VIEW: LANGUAGE */}
          {subView === 'language' && (
            <div className="p-4 space-y-3">
              <h3 className="text-base font-black text-stone-900">{t('menu_language', lang)}</h3>
              <div className="grid grid-cols-1 gap-2.5">
                {SUPPORTED_LANGUAGES.map((l) => {
                  const active = l.code === lang;
                  return (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        if (profile) {
                          const updated = registerAndSignInFarmer(
                            { ...profile, language: l.code, preferredLanguage: l.code },
                            ['language', 'preferredLanguage']
                          );
                          onProfileUpdated(updated);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border-2 flex items-center justify-between cursor-pointer ${
                        active
                          ? 'bg-emerald-900 text-white border-emerald-950'
                          : 'bg-stone-50 hover:bg-emerald-50 text-stone-900 border-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{l.flag}</span>
                        <div>
                          <div className="text-base font-black">{l.nativeName}</div>
                          <div
                            className={`text-xs ${
                              active ? 'text-emerald-200' : 'text-stone-500'
                            }`}
                          >
                            {l.name}
                          </div>
                        </div>
                      </div>
                      {active && <Check className="w-5 h-5 text-amber-400 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUB-VIEW: NOTIFICATIONS AND PERMISSIONS */}
          {subView === 'permissions' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-stone-900">
                  {t('menu_notifications_permissions', lang)}
                </h3>
                <button
                  onClick={checkBrowserPermissionStatuses}
                  className="text-xs font-bold text-emerald-800 underline cursor-pointer"
                >
                  Refresh
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { label: t('perm_camera_title', lang), state: permStatus.camera },
                  { label: t('perm_mic_title', lang), state: permStatus.microphone },
                  { label: t('perm_location_title', lang), state: permStatus.location },
                  { label: t('perm_notif_title', lang), state: permStatus.notifications },
                  { label: t('perm_storage_title', lang), state: permStatus.storage },
                  { label: t('perm_photos_title', lang), state: 'granted' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between"
                  >
                    <span className="font-bold text-stone-900">{item.label}</span>
                    <span
                      className={`font-black uppercase text-[11px] ${
                        item.state === 'granted'
                          ? 'text-emerald-700'
                          : item.state === 'denied'
                          ? 'text-red-600'
                          : 'text-amber-700'
                      }`}
                    >
                      {item.state}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-stone-800 space-y-1.5">
                <div className="font-black text-stone-950">How to change permissions:</div>
                <p>
                  <strong>Android / Chrome:</strong> Tap the tune/lock icon next to the address bar → Permissions → toggle Camera, Location, or Notifications.
                </p>
                <p>
                  <strong>iPhone / Safari:</strong> Open iPhone Settings → Safari (or Home Screen Web App) → allow Location / Camera / Notifications.
                </p>
              </div>
            </div>
          )}

          {/* SUB-VIEW: EMERGENCY CONTACT */}
          {subView === 'emergency' && (
            <div className="p-4 space-y-4">
              <h3 className="text-base font-black text-stone-900">
                {t('menu_emergency_contact', lang)}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('emergency_contact_name', lang)}
                  </label>
                  <input
                    type="text"
                    value={editEmergName}
                    onChange={(e) => setEditEmergName(e.target.value)}
                    placeholder="Family member or neighbour name"
                    className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm font-bold text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t('emergency_contact_phone', lang)}
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={editEmergPhone}
                    onChange={(e) =>
                      setEditEmergPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm font-bold text-stone-900"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveProfileChanges()}
                  className="w-full py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-black text-sm shadow-md cursor-pointer"
                >
                  Save Emergency Contact
                </button>

                {editEmergPhone.length === 10 && (
                  <a
                    href={`tel:+91${editEmergPhone}`}
                    className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-sm"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>
                      Call {editEmergName || 'Emergency Contact'} (+91 {editEmergPhone})
                    </span>
                  </a>
                )}

                <a
                  href="tel:108"
                  className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{t('snakebite_108_btn', lang)}</span>
                </a>
              </div>
            </div>
          )}

          {/* SUB-VIEW: HELP AND REPORT A PROBLEM */}
          {subView === 'help_report' && (
            <div className="p-4 space-y-4">
              <h3 className="text-base font-black text-stone-900">
                {t('menu_help_report', lang)}
              </h3>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1.5">
                <p className="font-bold text-stone-900">How Krushak Bani Odisha works:</p>
                <p>
                  • Select your crop under "What are you growing?" on the home screen.
                </p>
                <p>
                  • Every change is saved on your phone first (IndexedDB) so the app works offline, and syncs to the server when online.
                </p>
              </div>

              <form onSubmit={handleProblemSubmit} className="space-y-3">
                <label className="block text-xs font-black text-stone-800">
                  Report a problem
                </label>
                <textarea
                  rows={3}
                  required
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  placeholder="Describe the issue you faced..."
                  className="w-full rounded-2xl border border-stone-300 p-3 text-xs font-semibold text-stone-900"
                />
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Problem Report</span>
                </button>
              </form>

              {problemSubmitted && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900">
                  ✓ Thank you! Your report has been saved on your phone and queued for support.
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW: PRIVACY AND DELETE MY DATA AND ACCOUNT */}
          {subView === 'privacy_delete' && (
            <div className="p-4 space-y-4">
              <h3 className="text-base font-black text-stone-900">
                {t('menu_privacy_delete', lang)}
              </h3>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-2">
                <p>
                  <strong>Data Privacy:</strong> Your profile, field size, address, crops, spray logs, advice history, and callback requests are stored in your personal record keyed by your mobile number.
                </p>
                <label className="flex items-center gap-2 pt-1 font-bold text-stone-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editPhotoConsent}
                    onChange={(e) => setEditPhotoConsent(e.target.checked)}
                    className="w-4 h-4 accent-emerald-700"
                  />
                  <span>{t('consent_photo_checkbox', lang)}</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleSaveProfileChanges()}
                  className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                >
                  Update Photo Consent
                </button>
              </div>

              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t('delete_account_confirm_title', lang)}</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-500 space-y-3">
                  <h4 className="text-sm font-black text-red-900">
                    {t('delete_account_confirm_title', lang)}
                  </h4>
                  <p className="text-xs text-red-800 leading-relaxed">
                    {t('delete_account_confirm_desc', lang)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2.5 rounded-xl bg-white border border-stone-300 text-xs font-bold text-stone-800 cursor-pointer"
                    >
                      {t('cancel_btn', lang)}
                    </button>
                    <button
                      type="button"
                      disabled={isDeletingAccount}
                      onClick={handleConfirmDeleteAccount}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black cursor-pointer"
                    >
                      {isDeletingAccount ? '...' : t('delete_account_confirm_btn', lang)}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW: ABOUT */}
          {subView === 'about' && (
            <div className="p-4 space-y-4">
              <h3 className="text-base font-black text-stone-900">{t('menu_about', lang)}</h3>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-2">
                <div className="font-black text-sm text-emerald-950">
                  Krushak Bani Odisha — କୃଷକ ବାଣୀ ଓଡ଼ିଶା
                </div>
                <p>
                  Mobile-first Progressive Web App for small farmers in Odisha. Built with Local-First IndexedDB storage + Cloud Firestore synchronization.
                </p>
                <p className="text-[11px] text-stone-500">
                  Supports 6 languages: Odia, Hindi, English, Telugu, Bengali, and Tamil.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminModal();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-black text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t('admin_portal_btn', lang)}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Clickable backdrop area to close */}
      <div
        className="flex-1 h-full"
        onClick={() => {
          stopCameraStream();
          onClose();
        }}
      />
    </div>
  );
};
