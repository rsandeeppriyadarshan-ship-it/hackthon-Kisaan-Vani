import React, { useEffect, useState } from 'react';
import { Language } from '../types';

interface SplashScreenProps {
  onFinished?: () => void;
  lang?: Language;
  message?: string;
}

export function SplashScreen({ onFinished, lang = 'or', message }: SplashScreenProps) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!onFinished) return;
    const timer = setTimeout(() => {
      setFadingOut(true);
      const finishTimer = setTimeout(() => {
        onFinished();
      }, 500); // 500ms fade transition
      return () => clearTimeout(finishTimer);
    }, 1200); // 1.2s display time

    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <div
      className={`fixed inset-0 z-100 flex flex-col items-center justify-between bg-gradient-to-b from-emerald-950 via-emerald-900 to-teal-950 text-white p-6 transition-opacity duration-500 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Spacer */}
      <div className="w-full pt-4 flex justify-center">
        <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-extrabold text-[10px] tracking-wider uppercase backdrop-blur-md">
          {lang === 'or' ? 'ଓଡ଼ିଶା ସରକାରୀ ସ୍ଵୀକୃତ କୃଷି ସେବା' : 'OUAT & ICAR Verified PWA'}
        </span>
      </div>

      {/* Main Centered Logo & Branding Container */}
      <div className="flex flex-col items-center justify-center text-center space-y-6 my-auto max-w-sm px-4">
        {/* Prominent HD Logo with Golden Border & Glow Animation */}
        <div className="relative group">
          <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 opacity-80 blur-md group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
          
          <img
            src="/pwa-512x512.png"
            alt="Krushak Bani Odisha Logo"
            className="relative w-36 h-36 sm:w-44 sm:h-44 object-contain rounded-[2.2rem] border-4 border-amber-400 shadow-2xl bg-amber-50 shadow-amber-500/30 transform hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
            {lang === 'or' ? 'କୃଷକ ବାଣୀ ଓଡ଼ିଶା' : 'Krushak Bani Odisha'}
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/90 font-bold leading-relaxed">
            {lang === 'or'
              ? 'ସରଳ, ସୁରକ୍ଷିତ ଓ ଅଫଲାଇନ୍ କୃଷି ପରାମର୍ଶ ସେବା'
              : 'Smart, Safe & Offline Agricultural Advisory'}
          </p>
        </div>

        {/* Loading Indicator */}
        <div className="w-full space-y-3 pt-2">
          <div className="w-48 h-1.5 mx-auto bg-emerald-950/80 rounded-full overflow-hidden border border-amber-400/30">
            <div className="h-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 rounded-full animate-pulse w-3/4 transition-all duration-700" />
          </div>
          <p className="text-[11px] text-emerald-200/80 font-medium">
            {message ||
              (lang === 'or'
                ? 'ଲୋକାଲ୍ ମଡେଲ୍ ଓ ପାଣିପାଗ ତଥ୍ୟ ଯାଞ୍ଚ ହେଉଛି...'
                : 'Loading offline packs & local weather data...')}
          </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="pb-4 text-center space-y-1 text-emerald-300/60 font-semibold text-[10px]">
        <p>100% Offline Capable • PWA Web Application</p>
        <p className="text-amber-400/80 font-bold">Odisha Agricultural Advisory Platform</p>
      </div>
    </div>
  );
}
