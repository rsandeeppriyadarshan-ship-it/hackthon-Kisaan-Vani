import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Language } from '../../types';
import { findMatchingBrowserVoice, APP_LANG_TO_BCP47 } from '../../services/SpeechService';
import { t } from '../../services/translations';

interface AudioPlayerCardProps {
  title: string;
  subtitle?: string;
  textToSpeak: string;
  lang: Language;
  onAudioEnd?: () => void;
  accentColor?: 'emerald' | 'amber' | 'red' | 'blue';
  autoPlay?: boolean;
}

export const AudioPlayerCard: React.FC<AudioPlayerCardProps> = ({
  title,
  subtitle,
  textToSpeak,
  lang,
  onAudioEnd,
  accentColor = 'emerald',
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [estimatedDurationSec, setEstimatedDurationSec] = useState(30);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.95);
  const [ttsUnavailableNote, setTtsUnavailableNote] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Estimate duration based on text length (~12-14 chars per second in spoken Indian language)
  useEffect(() => {
    const wordCount = textToSpeak.trim().split(/\s+/).length;
    // Average 2.2 words per second at 0.95 rate
    const estSec = Math.max(8, Math.round(wordCount / 2.2));
    setEstimatedDurationSec(estSec);
  }, [textToSpeak]);

  useEffect(() => {
    setTtsUnavailableNote(null);
    stopPlayback();
  }, [lang]);

  useEffect(() => {
    if (autoPlay) {
      handlePlay();
    }
    return () => {
      stopPlayback();
    };
  }, []);

  const stopPlayback = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handlePlay = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTtsUnavailableNote(t('voice_tts_not_available', lang));
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      startTimer(pausedTimeRef.current);
      return;
    }

    stopPlayback();

    // STRICT RULE: Pick a voice that matches the current language code.
    // Never read Odia (or any language) text with an English or Hindi voice.
    const matchedVoice = findMatchingBrowserVoice(lang);
    if (!matchedVoice) {
      setTtsUnavailableNote(t('voice_tts_not_available', lang));
      if (onAudioEnd) onAudioEnd();
      return;
    }

    setTtsUnavailableNote(null);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;
    utterance.voice = matchedVoice;
    utterance.lang = matchedVoice.lang || APP_LANG_TO_BCP47[lang];

    utterance.onboundary = (e) => {
      if (textToSpeak.length > 0) {
        const pct = Math.min(100, Math.round((e.charIndex / textToSpeak.length) * 100));
        setProgress(pct);
      }
    };

    utterance.onend = () => {
      stopPlayback();
      setProgress(100);
      setCurrentTimeSec(estimatedDurationSec);
      if (onAudioEnd) onAudioEnd();
    };

    utterance.onerror = () => {
      stopPlayback();
      if (onAudioEnd) onAudioEnd();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
    setProgress(0);
    setCurrentTimeSec(0);
    startTimer(0);
  };

  const startTimer = (startSec: number) => {
    startTimeRef.current = Date.now() - startSec * 1000;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = window.setInterval(() => {
      const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
      setCurrentTimeSec(elapsed);

      // Estimate progress if boundary event is delayed
      const pct = Math.min(98, Math.round((elapsed / estimatedDurationSec) * 100));
      setProgress((prev) => Math.max(prev, pct));

      if (elapsed >= estimatedDurationSec + 3) {
        // safety fallback
        stopPlayback();
        setProgress(100);
      }
    }, 250);
  };

  const handlePause = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isPlaying) {
      window.speechSynthesis.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      pausedTimeRef.current = currentTimeSec;
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    stopPlayback();
    setProgress(0);
    setCurrentTimeSec(0);
    handlePlay();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-50/70 border-emerald-300',
      bar: 'bg-emerald-600',
      btn: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      accent: 'text-emerald-800',
      pulse: 'bg-emerald-400',
    },
    amber: {
      bg: 'bg-amber-50/80 border-amber-300',
      bar: 'bg-amber-500',
      btn: 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-black',
      accent: 'text-amber-900',
      pulse: 'bg-amber-400',
    },
    red: {
      bg: 'bg-red-50/80 border-red-300',
      bar: 'bg-red-600',
      btn: 'bg-red-600 hover:bg-red-700 text-white',
      accent: 'text-red-900',
      pulse: 'bg-red-400',
    },
    blue: {
      bg: 'bg-sky-50/80 border-sky-300',
      bar: 'bg-sky-600',
      btn: 'bg-sky-600 hover:bg-sky-700 text-white',
      accent: 'text-sky-900',
      pulse: 'bg-sky-400',
    },
  }[accentColor];

  return (
    <div className={`rounded-3xl p-4 sm:p-5 border shadow-xs text-left ${colorStyles.bg} space-y-3.5 transition-all`}>
      {/* Title & Sound Indicator */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            {isPlaying && (
              <span className={`animate-ping absolute inline-flex h-8 w-8 rounded-full ${colorStyles.pulse} opacity-40`} />
            )}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isPlaying ? 'bg-white shadow-xs' : 'bg-stone-200/80'}`}>
              <Volume2 className={`w-4 h-4 ${isPlaying ? colorStyles.accent : 'text-stone-500'}`} />
            </div>
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 leading-tight">
              {title}
            </h4>
            {subtitle && (
              <p className="text-[11px] text-stone-500 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 text-[10px] font-bold bg-white/80 px-2 py-1 rounded-xl border border-stone-200">
          <span className="text-stone-400 uppercase">Speed:</span>
          <button
            onClick={() => setPlaybackSpeed(0.85)}
            className={`px-1 rounded ${playbackSpeed === 0.85 ? 'text-stone-900 font-black underline' : 'text-stone-500'}`}
          >
            0.85x
          </button>
          <span>•</span>
          <button
            onClick={() => setPlaybackSpeed(0.95)}
            className={`px-1 rounded ${playbackSpeed === 0.95 ? 'text-stone-900 font-black underline' : 'text-stone-500'}`}
          >
            1x
          </button>
        </div>
      </div>

      {/* Interactive Progress Bar */}
      <div className="space-y-1.5">
        <div className="relative w-full bg-stone-200/90 h-3 rounded-full overflow-hidden shadow-inner cursor-pointer">
          <div
            className={`h-full ${colorStyles.bar} transition-all duration-200 rounded-full flex items-center justify-end pr-1`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          >
            {isPlaying && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 font-bold px-0.5">
          <span>{formatTime(currentTimeSec)}</span>
          <span className="text-stone-400">
            {lang === 'or' ? `${progress}% ଶୁଣିସାରିଲେ` : `${progress}% complete`}
          </span>
          <span>{formatTime(estimatedDurationSec)}</span>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold shadow-md transition-all active:scale-95 ${colorStyles.btn}`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isPaused ? (lang === 'or' ? 'ପୁଣି ଚଲାନ୍ତୁ' : 'Resume') : (lang === 'or' ? 'ଅଡିଓ ଚଲାନ୍ତୁ' : 'Play Audio')}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold bg-stone-800 hover:bg-stone-900 text-white shadow-md transition-all active:scale-95"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>{lang === 'or' ? 'ରଖନ୍ତୁ (Pause)' : 'Pause'}</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-2 rounded-2xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-2xs transition-colors"
            title="Restart from beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Small live visual equalizer */}
        {isPlaying && (
          <div className="flex items-end gap-1 h-4">
            <span className="w-1 bg-emerald-600 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-2" />
            <span className="w-1 bg-emerald-600 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-4" />
            <span className="w-1 bg-emerald-600 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-3" />
            <span className="w-1 bg-emerald-600 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-4" />
          </div>
        )}
      </div>

      {ttsUnavailableNote && (
        <div className="mt-2 rounded-2xl bg-amber-100/90 border border-amber-300 px-3 py-2 text-xs text-amber-950 space-y-1">
          <p className="font-bold">{ttsUnavailableNote}</p>
          <p className="text-stone-800 font-medium leading-relaxed">{textToSpeak}</p>
        </div>
      )}
    </div>
  );
};
