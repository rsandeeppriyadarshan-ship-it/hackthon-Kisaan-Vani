import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { recordSpeechClip, abortActiveRecording } from '../services/SpeechService';
import { t } from '../services/translations';
import {
  Mic,
  Volume2,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  X,
} from 'lucide-react';

interface MicTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const MicTestModal: React.FC<MicTestModalProps> = ({ isOpen, onClose, lang }) => {
  const [phase, setPhase] = useState<'idle' | 'recording' | 'done' | 'error'>('idle');
  const [secondsLeft, setSecondsLeft] = useState<number>(3);
  const [volume, setVolume] = useState<number>(0);
  const [peakVolume, setPeakVolume] = useState<number>(0);
  const [waveBars, setWaveBars] = useState<number[]>([12, 18, 25, 15, 30, 40, 22, 18, 35, 20, 15, 10]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micWorksClearly, setMicWorksClearly] = useState<boolean>(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      abortActiveRecording('aborted_user');
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      setPhase('idle');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startThreeSecondTest = async () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setPhase('recording');
    setSecondsLeft(3);
    setVolume(0);
    setPeakVolume(0);
    setErrorKey(null);

    const countdownInterval = window.setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    let maxObservedVol = 0;
    const result = await recordSpeechClip({
      language: lang,
      maxDurationMs: 3000,
      skipSilenceAutoStop: true,
      onVolumeChange: (vol, bars) => {
        setVolume(vol);
        setWaveBars(bars);
        if (vol > maxObservedVol) {
          maxObservedVol = vol;
          setPeakVolume(vol);
        }
      },
    });

    window.clearInterval(countdownInterval);

    if (!result.ok || !result.audioBlob) {
      if (result.errorType === 'permission_denied') {
        setErrorKey('permission_denied');
      } else if (result.errorType === 'no_mic' || result.errorType === 'mic_in_use') {
        setErrorKey('no_mic');
      } else if (result.errorType === 'insecure_or_iframe') {
        setErrorKey('insecure');
      } else {
        setErrorKey('permission_denied');
      }
      setPhase('error');
      return;
    }

    const url = URL.createObjectURL(result.audioBlob);
    setAudioUrl(url);
    const works = result.peakRms >= 0.015 || maxObservedVol >= 8;
    setMicWorksClearly(works);
    setPhase('done');

    // Automatically play back the recorded 3-second clip
    setTimeout(() => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.play().catch(() => {});
      }
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border-2 border-emerald-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-emerald-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-400 text-stone-950">
              <Mic className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black leading-tight">{t('mic_test_title', lang)}</h2>
              <p className="text-[11px] text-emerald-200">{t('voice_privacy_note', lang)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-stone-700 font-semibold leading-relaxed">
            {t('mic_test_desc', lang)}
          </p>

          {/* Sound Wave & Volume Level Meter */}
          <div className="bg-emerald-950 text-white rounded-2xl p-4 space-y-3 border border-emerald-800">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-amber-300 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4" />
                {phase === 'recording'
                  ? `${t('voice_i_am_listening', lang)} (${secondsLeft}s)`
                  : 'Sound Wave & Volume Level'}
              </span>
              <span className="font-mono text-emerald-300">
                Peak: {peakVolume}%
              </span>
            </div>

            <div className="h-16 flex items-end justify-center gap-2 bg-emerald-900/60 rounded-xl px-4 py-2">
              {waveBars.map((h, i) => (
                <div
                  key={i}
                  className={`w-2.5 rounded-full transition-all duration-75 ${
                    phase === 'recording'
                      ? 'bg-gradient-to-t from-emerald-400 to-amber-400'
                      : 'bg-emerald-700'
                  }`}
                  style={{ height: `${phase === 'recording' ? Math.max(15, h) : 20}%` }}
                />
              ))}
            </div>

            <div className="w-full h-2.5 bg-emerald-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-75"
                style={{ width: `${phase === 'recording' ? volume : peakVolume}%` }}
              />
            </div>
          </div>

          {/* Result Status & Audio Playback */}
          {phase === 'done' && (
            <div
              className={`p-4 rounded-2xl border-2 space-y-3 ${
                micWorksClearly
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                  : 'bg-amber-50 border-amber-400 text-stone-900'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {micWorksClearly ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                )}
                <div className="text-sm font-black">
                  {micWorksClearly ? t('mic_test_pass', lang) : t('mic_test_fail_quiet', lang)}
                </div>
              </div>

              {audioUrl && (
                <div className="space-y-2 pt-1">
                  <audio ref={audioPlayerRef} src={audioUrl} controls className="w-full h-10" />
                  <button
                    type="button"
                    onClick={() => audioPlayerRef.current?.play()}
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Play Recording Back</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {phase === 'error' && (
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-stone-900 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  {errorKey === 'permission_denied' && (
                    <>
                      <div className="font-black text-red-900">
                        {t('voice_mic_denied_title', lang)}
                      </div>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-stone-700">
                        <li>{t('voice_mic_steps_android', lang)}</li>
                        <li>{t('voice_mic_steps_iphone', lang)}</li>
                        <li>{t('voice_mic_steps_desktop', lang)}</li>
                      </ul>
                    </>
                  )}
                  {errorKey === 'no_mic' && (
                    <div className="font-bold text-red-900">{t('voice_mic_not_found', lang)}</div>
                  )}
                  {errorKey === 'insecure' && (
                    <div className="font-bold text-red-900">
                      {t('voice_mic_insecure_frame', lang)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={startThreeSecondTest}
              disabled={phase === 'recording'}
              className="flex-1 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              {phase === 'done' || phase === 'error' ? (
                <>
                  <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('try_again', lang)} (3s)</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 stroke-[2.5]" />
                  <span>{phase === 'recording' ? `${secondsLeft}s...` : 'Start 3s Mic Test'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-sm cursor-pointer"
            >
              {t('close_btn', lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
