import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../../types';
import {
  APP_LANG_TO_BCP47,
  recordSpeechClip,
  transcribe,
  abortActiveRecording,
  finishActiveRecordingNow,
  saveOfflineVoiceClipForLater,
} from '../../services/SpeechService';
import { SUPPORTED_LANGUAGES, t } from '../../services/translations';
import {
  Mic,
  Square,
  Check,
  RotateCcw,
  Keyboard,
  AlertTriangle,
  WifiOff,
  ShieldAlert,
  Volume2,
  X,
  Globe,
} from 'lucide-react';

interface VoiceMicButtonProps {
  lang: Language;
  onTranscript: (text: string) => void;
  onLanguageSwitchRequest?: (newLang: Language) => void;
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
  screenTopic?: string;
  fieldLabel?: string;
  expectNumber?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  lang,
  onTranscript,
  onLanguageSwitchRequest,
  inputRef,
  screenTopic = 'farming input',
  fieldLabel = 'input',
  expectNumber = false,
  className = '',
  size = 'md',
}) => {
  const [status, setStatus] = useState<
    'idle' | 'listening' | 'thinking' | 'confirm' | 'error' | 'offline_prompt'
  >('idle');
  const [volume, setVolume] = useState<number>(0);
  const [waveBars, setWaveBars] = useState<number[]>([15, 25, 40, 20, 35, 50, 30, 20, 45, 25, 18, 12]);
  const [heardText, setHeardText] = useState<string>('');
  const [errorCategory, setErrorCategory] = useState<
    | 'permission_denied'
    | 'no_mic'
    | 'mic_in_use'
    | 'insecure_or_iframe'
    | 'no_speech_5s'
    | 'quality_unclear'
    | 'all_failed'
    | null
  >(null);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [detectedOtherLang, setDetectedOtherLang] = useState<Language | null>(null);
  const [offlineSavedBanner, setOfflineSavedBanner] = useState<boolean>(false);

  const prevLangRef = useRef<Language>(lang);

  // Requirement 8: When the farmer changes the language while the mic is listening,
  // stop the recording, discard the audio, clear any half-finished transcript
  useEffect(() => {
    if (prevLangRef.current !== lang) {
      prevLangRef.current = lang;
      if (status === 'listening' || status === 'thinking' || status === 'confirm') {
        abortActiveRecording('aborted_language_change');
        setStatus('idle');
        setHeardText('');
        setDetectedOtherLang(null);
        setErrorCategory(null);
      }
    }
  }, [lang, status]);

  const focusInputKeyboard = () => {
    setStatus('idle');
    setErrorCategory(null);
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  };

  const handleStartListening = async (saveForOfflineLater = false) => {
    setOfflineSavedBanner(false);
    setDetectedOtherLang(null);

    if (typeof navigator !== 'undefined' && !navigator.onLine && !saveForOfflineLater) {
      setStatus('offline_prompt');
      return;
    }

    setStatus('listening');
    setErrorCategory(null);
    setHeardText('');

    const recResult = await recordSpeechClip({
      language: lang,
      maxDurationMs: 12000,
      silenceDurationMs: 1500,
      initialNoSpeechTimeoutMs: 5000,
      onVolumeChange: (vol, bars) => {
        setVolume(vol);
        setWaveBars(bars);
      },
    });

    if (!recResult.ok || !recResult.audioBlob) {
      if (recResult.errorType === 'aborted_language_change' || recResult.errorType === 'aborted_user') {
        setStatus('idle');
        return;
      }
      setFailedAttempts((prev) => prev + 1);
      setErrorCategory((recResult.errorType as any) || 'quality_unclear');
      setStatus('error');
      return;
    }

    // If offline and farmer opted to save short clip to transcribe when online
    if (saveForOfflineLater || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      await saveOfflineVoiceClipForLater({
        audioBlob: recResult.audioBlob,
        language: lang,
        contextTopic: `${screenTopic}:${fieldLabel}`,
      });
      setOfflineSavedBanner(true);
      setStatus('idle');
      return;
    }

    setStatus('thinking');

    const sttResult = await transcribe(recResult.audioBlob, APP_LANG_TO_BCP47[lang], {
      screenTopic,
      fieldLabel,
      expectNumber,
      webSpeechInterimTranscript: recResult.webSpeechTranscript,
      durationMs: recResult.durationMs,
    });

    // Privacy rule: audioBlob goes out of scope immediately and is never stored

    if (!sttResult.text || sttResult.confidence === 'low') {
      setFailedAttempts((prev) => prev + 1);
      setErrorCategory('all_failed');
      setStatus('error');
      return;
    }

    setFailedAttempts(0);
    setHeardText(sttResult.text);
    onTranscript(sttResult.text);
    if (sttResult.detectedDifferentLanguage) {
      setDetectedOtherLang(sttResult.detectedDifferentLanguage);
    }
    setStatus('confirm');
  };

  const detectedLangMeta = detectedOtherLang
    ? SUPPORTED_LANGUAGES.find((l) => l.code === detectedOtherLang)
    : null;

  return (
    <div className={`inline-flex flex-col ${className}`}>
      {/* Trigger Mic Button */}
      <div className="flex items-center gap-1.5">
        {status === 'listening' ? (
          <button
            type="button"
            onClick={() => finishActiveRecordingNow()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md animate-pulse cursor-pointer"
            title="Stop listening"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>{t('voice_i_am_listening', lang)}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleStartListening(false)}
            disabled={status === 'thinking'}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black border border-amber-500/60 shadow-xs transition-all active:scale-95 cursor-pointer ${
              size === 'sm' ? 'p-2 text-xs' : 'px-3 py-2 text-xs'
            }`}
            title={t('voice_privacy_note', lang)}
          >
            <Mic className={size === 'sm' ? 'w-4 h-4 stroke-[2.5]' : 'w-4 h-4 stroke-[2.5]'} />
            {size !== 'sm' && <span className="hidden sm:inline">🎤</span>}
          </button>
        )}
      </div>

      {/* Active Listening Sound Wave & Volume Meter Card */}
      {status === 'listening' && (
        <div className="mt-2 p-3 rounded-2xl bg-emerald-950 text-white border-2 border-amber-400 shadow-xl space-y-2.5 z-30">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-sm font-black text-amber-300">
                {t('voice_i_am_listening', lang)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => finishActiveRecordingNow()}
              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
            >
              Done
            </button>
          </div>

          {/* Animated 12-Bar Sound Wave */}
          <div className="h-12 flex items-end justify-center gap-1.5 bg-emerald-900/70 rounded-xl px-3 py-2">
            {waveBars.map((barHeight, idx) => (
              <div
                key={idx}
                className="w-2 rounded-full bg-gradient-to-t from-emerald-400 to-amber-400 transition-all duration-75"
                style={{ height: `${Math.max(15, barHeight)}%` }}
              />
            ))}
          </div>

          {/* Volume Meter Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-emerald-200 font-bold">
              <span className="flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-amber-400" /> Volume
              </span>
              <span>{volume}%</span>
            </div>
            <div className="w-full h-1.5 bg-emerald-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-75"
                style={{ width: `${Math.min(100, volume)}%` }}
              />
            </div>
          </div>

          <p className="text-[10px] text-emerald-200/90 text-center">
            {t('voice_privacy_note', lang)}
          </p>
        </div>
      )}

      {/* Thinking State */}
      {status === 'thinking' && (
        <div className="mt-2 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-stone-900 flex items-center gap-2.5 text-xs font-black shadow-sm">
          <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin shrink-0" />
          <span>{t('voice_thinking', lang)}</span>
        </div>
      )}

      {/* "Did I hear you correctly?" Confirmation Row (Tick, Mic Retry, Keyboard Edit) */}
      {status === 'confirm' && heardText && (
        <div className="mt-2 p-2.5 rounded-2xl bg-emerald-50 border-2 border-emerald-500/70 text-stone-900 space-y-2 shadow-sm">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-xs font-bold text-emerald-950">
              <span className="text-emerald-700 block text-[11px]">
                {t('voice_did_i_hear_correctly', lang)}
              </span>
              <span className="font-black text-sm">“{heardText}”</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Green Tick to Accept */}
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs cursor-pointer"
                title="Accept"
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </button>

              {/* Mic to Try Again */}
              <button
                type="button"
                onClick={() => handleStartListening(false)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black shadow-xs cursor-pointer"
                title={t('try_again', lang)}
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              {/* Keyboard to Edit */}
              <button
                type="button"
                onClick={focusInputKeyboard}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-bold shadow-xs cursor-pointer"
                title={t('edit_btn', lang)}
              >
                <Keyboard className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Cross-language detection prompt: "You spoke <language>. Switch the app to <language>?" */}
          {detectedLangMeta && (
            <div className="pt-2 border-t border-emerald-200 flex items-center justify-between gap-2 flex-wrap text-xs">
              <span className="font-bold text-stone-800 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-700" />
                {t('voice_spoke_other_lang_prompt', lang, {
                  language: `${detectedLangMeta.nativeName} (${detectedLangMeta.name})`,
                })}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (onLanguageSwitchRequest) {
                      onLanguageSwitchRequest(detectedLangMeta.code);
                    } else if (typeof window !== 'undefined') {
                      window.dispatchEvent(
                        new CustomEvent('krushak:switch-language', { detail: detectedLangMeta.code })
                      );
                    }
                    setDetectedOtherLang(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-black cursor-pointer"
                >
                  {t('voice_yes_btn', lang)}
                </button>
                <button
                  type="button"
                  onClick={() => setDetectedOtherLang(null)}
                  className="px-2.5 py-1 rounded-lg bg-stone-200 text-stone-800 font-bold cursor-pointer"
                >
                  {t('voice_no_btn', lang)}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Offline Prompt with Optional "Save voice clip to transcribe when online" */}
      {status === 'offline_prompt' && (
        <div className="mt-2 p-3 rounded-2xl bg-amber-50 border-2 border-amber-400 text-stone-900 space-y-2 text-xs">
          <div className="flex items-start gap-2">
            <WifiOff className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="font-bold">{t('voice_offline_msg', lang)}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={focusInputKeyboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 text-white font-black cursor-pointer"
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Type with Keyboard</span>
            </button>
            <button
              type="button"
              onClick={() => handleStartListening(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{t('voice_save_offline_clip_btn', lang)}</span>
            </button>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="p-1 text-stone-500 hover:text-stone-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {offlineSavedBanner && (
        <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center justify-between gap-2">
          <span>{t('voice_offline_clip_saved', lang)}</span>
          <button
            type="button"
            onClick={() => setOfflineSavedBanner(false)}
            className="text-emerald-800 font-black cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Plain-Language Error Card with Picture/Icon & 2-Strike Keyboard Highlight */}
      {status === 'error' && errorCategory && (
        <div className="mt-2 p-3 rounded-2xl bg-red-50 border-2 border-red-300 text-stone-900 space-y-2 text-xs">
          <div className="flex items-start gap-2">
            {errorCategory === 'permission_denied' || errorCategory === 'insecure_or_iframe' ? (
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}

            <div className="space-y-1.5 flex-1">
              {errorCategory === 'permission_denied' && (
                <>
                  <div className="font-black text-red-900">{t('voice_mic_denied_title', lang)}</div>
                  <ul className="space-y-1 text-[11px] text-stone-700 list-disc pl-4">
                    <li>{t('voice_mic_steps_android', lang)}</li>
                    <li>{t('voice_mic_steps_iphone', lang)}</li>
                    <li>{t('voice_mic_steps_desktop', lang)}</li>
                  </ul>
                </>
              )}

              {(errorCategory === 'no_mic' || errorCategory === 'mic_in_use') && (
                <div className="font-bold text-red-900">{t('voice_mic_not_found', lang)}</div>
              )}

              {errorCategory === 'insecure_or_iframe' && (
                <div className="font-bold text-red-900">{t('voice_mic_insecure_frame', lang)}</div>
              )}

              {errorCategory === 'no_speech_5s' && (
                <div className="font-bold text-stone-900">{t('voice_no_speech_5s', lang)}</div>
              )}

              {errorCategory === 'quality_unclear' && (
                <div className="font-bold text-stone-900">{t('voice_quality_unclear', lang)}</div>
              )}

              {errorCategory === 'all_failed' && (
                <div className="font-bold text-stone-900">{t('voice_all_engines_failed', lang)}</div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleStartListening(false)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('try_again', lang)}</span>
            </button>

            <button
              type="button"
              onClick={focusInputKeyboard}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-black cursor-pointer ${
                failedAttempts >= 2
                  ? 'bg-emerald-700 text-white ring-4 ring-emerald-300 animate-bounce'
                  : 'bg-white border border-stone-300 text-stone-800'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>{t('edit_btn', lang)}</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="ml-auto text-stone-500 hover:text-stone-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
