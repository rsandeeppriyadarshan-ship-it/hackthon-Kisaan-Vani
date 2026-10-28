import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, CheckCircle, Trash2, X } from 'lucide-react';
import { Language } from '../types';

interface ResetAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export function ResetAppModal({ isOpen, onClose, lang = 'or' }: ResetAppModalProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  if (!isOpen) return null;

  const handleExecuteReset = async () => {
    setIsResetting(true);
    try {
      // 1. Clear localStorage & sessionStorage
      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }

      // 2. Clear IndexedDB
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        try {
          window.indexedDB.deleteDatabase('krushak_local_db');
        } catch {}
      }

      // 3. Clear Service Worker Caches
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cacheKeys = await caches.keys();
          await Promise.all(cacheKeys.map((key) => caches.delete(key)));
        } catch {}
      }

      // 4. Unregister Service Workers
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((reg) => reg.unregister()));
        } catch {}
      }

      setResetDone(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 1200);
    } catch (err) {
      console.error('Reset error:', err);
      window.location.href = '/';
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative text-stone-900 space-y-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 transition-colors text-stone-500"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-red-600">
          <div className="p-3 bg-red-100 rounded-2xl">
            <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black leading-tight">
              {lang === 'or' ? 'ଆପ୍ ଡାଟା ରିସେଟ୍ କରନ୍ତୁ' : 'Reset Device App Data'}
            </h2>
            <p className="text-xs text-stone-500">
              {lang === 'or' ? 'ଗୁପ୍ତ ପରୀକ୍ଷଣ ପୃଷ୍ଠା (/reset)' : 'Hidden Reset Diagnostic Page (/reset)'}
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs space-y-2 text-stone-800">
          <p className="font-bold">
            {lang === 'or'
              ? 'ଏହା ଆପଣଙ୍କ ଫୋନ୍‌ରେ ଥିବା ସମସ୍ତ ଲୋକାଲ୍ ସେସନ୍, ଆପ୍ କ୍ୟାଚ୍, IndexedDB ଏବଂ Storage ଖାଲି କରିଦେବ।'
              : 'This will clear all device local storage, IndexedDB, active sessions, and Service Worker caches.'}
          </p>
          <p className="text-stone-600">
            {lang === 'or'
              ? 'କ୍ଲାଉଡ୍ ଫାୟାରଷ୍ଟୋର୍ରେ ଥିବା ଡାଟା ସୁରକ୍ଷିତ ରହିବ। ରିସେଟ୍ ପରେ ନୂତନ ସେଟ୍ଅପ୍ ସ୍କ୍ରିନ୍ ଖୋଲିବ।'
              : 'Server records in Firestore remain completely untouched. You can log back in with your mobile number.'}
          </p>
        </div>

        {resetDone ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center text-emerald-800 font-black text-sm flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>
              {lang === 'or'
                ? 'ଡାଟା ସଫଳତାର ସହ ରିସେଟ୍ ହୋଇଛି! ପୁନଃ ଚାଲୁ ହେଉଛି...'
                : 'Device data cleared successfully! Reloading setup...'}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isResetting}
              className="px-4 py-2.5 rounded-xl border border-stone-300 font-bold text-xs text-stone-700 hover:bg-stone-100 transition-all cursor-pointer"
            >
              {lang === 'or' ? 'ବାତିଲ୍ କରନ୍ତୁ' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleExecuteReset}
              disabled={isResetting}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              {isResetting ? (
                <RotateCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>
                {isResetting
                  ? lang === 'or'
                    ? 'ରିସେଟ୍ ହେଉଛି...'
                    : 'Clearing Data...'
                  : lang === 'or'
                  ? 'ହଁ, ରିସେଟ୍ କରନ୍ତୁ'
                  : 'Yes, Clear Local Data'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
