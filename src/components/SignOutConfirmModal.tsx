import React, { useState, useEffect } from 'react';
import { Language, FarmerProfile } from '../types';
import {
  subscribeSyncStatus,
  processOfflineSyncQueue,
  SyncEngineSnapshot,
} from '../services/localFirstSyncEngine';
import { t } from '../services/translations';
import {
  LogOut,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  X,
  Smartphone,
  Cloud,
} from 'lucide-react';

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSignOut: () => Promise<void>;
  lang: Language;
  profile: FarmerProfile | null;
}

export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmSignOut,
  lang,
  profile,
}) => {
  const [syncSnap, setSyncSnap] = useState<SyncEngineSnapshot>({
    status: 'saved_on_phone',
    pendingCount: 0,
    lastSyncedAt: null,
    isOnline: true,
    lastError: null,
  });
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    return subscribeSyncStatus((snap) => {
      setSyncSnap(snap);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSyncBeforeSignOut = async () => {
    setIsSyncingNow(true);
    try {
      await processOfflineSyncQueue();
    } finally {
      setIsSyncingNow(false);
    }
  };

  const handleConfirm = async () => {
    setIsWiping(true);
    try {
      await onConfirmSignOut();
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in">
      <div
        className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden text-left"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-rose-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center">
              <LogOut className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg leading-snug">
                {t('sign_out_confirm_title', lang)}
              </h3>
              {profile && (
                <p className="text-xs text-red-100 font-mono">
                  {profile.name} • +91 {profile.mobile}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          {/* Unsynced Queue Warning */}
          {syncSnap.pendingCount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs font-extrabold leading-relaxed">
                  {t('sign_out_unsynced_warning', lang, { count: syncSnap.pendingCount })}
                </p>
              </div>
              {syncSnap.isOnline && (
                <button
                  onClick={handleSyncBeforeSignOut}
                  disabled={isSyncingNow}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingNow ? 'animate-spin' : ''}`} />
                  <span>
                    {isSyncingNow ? t('sync_syncing', lang) : 'Sync Pending Changes to Server Now'}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Explanation of Phone Wipe vs Server Master Copy */}
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium">
            {t('sign_out_confirm_desc', lang)}
          </p>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-red-800">
                <Smartphone className="w-4 h-4" />
                <span>Removed from Phone</span>
              </div>
              <p className="text-[11px] text-red-700">
                Profile, ID card, crops, spray log, advice history & callback requests wiped from this phone.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-emerald-800">
                <Cloud className="w-4 h-4" />
                <span>Safe on Server</span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Master record stays safe on Firestore. Offline disease packs & cached weather stay on phone.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={onClose}
              disabled={isWiping}
              className="flex-1 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              {t('cancel_btn', lang)}
            </button>

            <button
              onClick={handleConfirm}
              disabled={isWiping}
              className="flex-1 py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{isWiping ? '...' : t('sign_out_confirm_btn', lang)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
