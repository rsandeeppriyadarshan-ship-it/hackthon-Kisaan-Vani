import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { SUPPORTED_LANGUAGES, t } from '../services/translations';
import {
  APP_LANG_TO_BCP47,
  recordSpeechClip,
  transcribe,
  matchVoiceCommandIntent,
  parseOfflineVoiceCommand,
  VoiceCommandMatch,
  speakInCurrentLanguage,
  askFarmingQuestionInLanguage,
  abortActiveRecording,
  finishActiveRecordingNow,
  saveOfflineVoiceClipForLater,
  flushOfflineVoiceClipQueue,
} from '../services/SpeechService';
import {
  Mic,
  X,
  Volume2,
  Check,
  RotateCcw,
  Keyboard,
  ShieldAlert,
  AlertTriangle,
  WifiOff,
  PhoneCall,
  Globe,
  Camera,
  ShieldCheck,
  Droplets,
  Sprout,
  Calendar,
  Users,
  MapPin,
  Send,
  Square,
  Settings,
} from 'lucide-react';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLanguageChange?: (newLang: Language) => void;
  onNavigateTo: (featureId: string) => void;
  onTriggerSafetyAlert?: () => void;
  onOpenMicTest?: () => void;
}

interface VoiceChatTurn {
  id: string;
  question: string;
  answer: string;
  lang: Language;
  languageCode: string;
  timestamp: string;
}

const CHAT_HISTORY_STORAGE_KEY = 'krushak_voice_chat_history';

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  lang,
  onLanguageChange,
  onNavigateTo,
  onTriggerSafetyAlert,
  onOpenMicTest,
}) => {
  const [activeMode, setActiveMode] = useState<'commands' | 'ask'>('commands');
  const [status, setStatus] = useState<
    'idle' | 'listening' | 'thinking' | 'confirm_command' | 'confirm_field' | 'error' | 'offline_prompt'
  >('idle');
  const [volume, setVolume] = useState<number>(0);
  const [waveBars, setWaveBars] = useState<number[]>([15, 25, 40, 20, 35, 50, 30, 20, 45, 25, 18, 12]);
  const [heardText, setHeardText] = useState<string>('');
  const [matchedCommand, setMatchedCommand] = useState<VoiceCommandMatch | null>(null);
  const [questionText, setQuestionText] = useState<string>('');
  const [aiAnswer, setAiAnswer] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<VoiceChatTurn[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [lastSpokenAdvice, setLastSpokenAdvice] = useState<string>('');
  const [ttsNotice, setTtsNotice] = useState<string | null>(null);
  const [detectedOtherLang, setDetectedOtherLang] = useState<Language | null>(null);
  const [failedTries, setFailedTries] = useState<number>(0);
  const [offlineSavedBanner, setOfflineSavedBanner] = useState<boolean>(false);
  const [errorType, setErrorType] = useState<
    | 'permission_denied'
    | 'no_mic'
    | 'mic_in_use'
    | 'insecure_or_iframe'
    | 'no_speech_5s'
    | 'quality_unclear'
    | 'all_failed'
    | null
  >(null);

  const questionInputRef = useRef<HTMLTextAreaElement | null>(null);
  const prevLangRef = useRef<Language>(lang);

  // Requirement 3: When the farmer changes the language while listening,
  // stop the recording, discard the audio, clear any pending transcript or "Did you mean?",
  // and keep crops, answers already shown, and chat history as they are.
  useEffect(() => {
    if (prevLangRef.current !== lang) {
      prevLangRef.current = lang;
      abortActiveRecording('aborted_language_change');
      if (status === 'confirm_field') {
        setQuestionText('');
      }
      setStatus('idle');
      setHeardText('');
      setMatchedCommand(null);
      setDetectedOtherLang(null);
      setErrorType(null);
      setTtsNotice(null);
    }
  }, [lang, status]);

  useEffect(() => {
    if (!isOpen) {
      abortActiveRecording('aborted_user');
      setStatus('idle');
      setHeardText('');
      setMatchedCommand(null);
      setErrorType(null);
      setTtsNotice(null);
    } else {
      // Flush any offline voice clips if now online
      flushOfflineVoiceClipQueue()
        .then((flushed) => {
          if (flushed.length > 0) {
            const latest = flushed[flushed.length - 1];
            setQuestionText(latest.question);
            setAiAnswer(latest.answer);
            setLastSpokenAdvice(latest.answer);
            setChatHistory((prev) => {
              const newTurns: VoiceChatTurn[] = flushed.map((f) => ({
                id: f.id,
                question: f.question,
                answer: f.answer,
                lang: f.language,
                languageCode: APP_LANG_TO_BCP47[f.language],
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }));
              const next = [...newTurns, ...prev].slice(0, 25);
              try {
                window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(next));
              } catch {}
              return next;
            });
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const speakAndCheckAvailability = (textToRead: string, targetLang: Language = lang) => {
    setLastSpokenAdvice(textToRead);
    const outcome = speakInCurrentLanguage(textToRead, targetLang);
    if (!outcome.spoken && outcome.unavailableMessage) {
      setTtsNotice(outcome.unavailableMessage);
    } else {
      setTtsNotice(null);
    }
  };

  const executeConfirmedCommand = (cmd: VoiceCommandMatch) => {
    if (cmd.intentId === 'repeat') {
      if (lastSpokenAdvice) {
        speakAndCheckAvailability(lastSpokenAdvice);
      }
      setStatus('idle');
      setMatchedCommand(null);
      return;
    }

    if (cmd.actionType === 'safety_modal' && onTriggerSafetyAlert) {
      onClose();
      onTriggerSafetyAlert();
      return;
    }

    onClose();
    onNavigateTo(cmd.targetFeature);
  };

  const handleStartRecording = async (saveOfflineLater = false) => {
    setOfflineSavedBanner(false);
    setDetectedOtherLang(null);
    setTtsNotice(null);
    setErrorType(null);

    if (typeof navigator !== 'undefined' && !navigator.onLine && !saveOfflineLater) {
      setStatus('offline_prompt');
      return;
    }

    setStatus('listening');
    setHeardText('');
    setMatchedCommand(null);

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
      setFailedTries((prev) => prev + 1);
      setErrorType((recResult.errorType as any) || 'quality_unclear');
      setStatus('error');
      return;
    }

    if (saveOfflineLater || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      await saveOfflineVoiceClipForLater({
        audioBlob: recResult.audioBlob,
        language: lang,
        contextTopic: activeMode === 'ask' ? 'ask_farming_question' : 'voice_command',
      });
      setOfflineSavedBanner(true);
      setStatus('idle');
      return;
    }

    setStatus('thinking');

    const sttResult = await transcribe(recResult.audioBlob, APP_LANG_TO_BCP47[lang], {
      screenTopic: activeMode === 'ask' ? 'ask farming question' : 'voice navigation command',
      webSpeechInterimTranscript: recResult.webSpeechTranscript,
      durationMs: recResult.durationMs,
    });

    if (!sttResult.text || sttResult.confidence === 'low') {
      setFailedTries((prev) => prev + 1);
      setErrorType('all_failed');
      setStatus('error');
      return;
    }

    setFailedTries(0);
    setHeardText(sttResult.text);
    if (sttResult.detectedDifferentLanguage) {
      setDetectedOtherLang(sttResult.detectedDifferentLanguage);
    }

    if (activeMode === 'ask') {
      // Fill transcript into the Ask a Question box and show "Did I hear you correctly?"
      setQuestionText(sttResult.text);
      setStatus('confirm_field');
      return;
    }

    // Voice Commands mode: match using offline parser and intents.json
    const cmdMatch = parseOfflineVoiceCommand(sttResult.text, lang) || matchVoiceCommandIntent(sttResult.text, lang);
    if (cmdMatch) {
      // Requirement 6: After matching a command, show the heard text and ask "Did you mean <command>?"
      // with big Yes and No buttons before acting.
      setMatchedCommand(cmdMatch);
      setStatus('confirm_command');
    } else {
      // If it's a farming question spoken in command mode, switch to Ask mode and show transcript
      setActiveMode('ask');
      setQuestionText(sttResult.text);
      setStatus('confirm_field');
    }
  };

  const handleSubmitFarmingQuestion = async () => {
    const trimmedQ = questionText.trim();
    if (!trimmedQ) return;
    setStatus('thinking');
    setTtsNotice(null);

    const qa = await askFarmingQuestionInLanguage({
      question: trimmedQ,
      lang,
      contextTopic: 'voice_modal_ask',
      history: chatHistory
        .slice(0, 6)
        .reverse()
        .map((h) => ({ question: h.question, answer: h.answer, langCode: h.languageCode })),
    });

    setAiAnswer(qa.answer);
    const newTurn: VoiceChatTurn = {
      id: `chat-${Date.now()}`,
      question: trimmedQ,
      answer: qa.answer,
      lang,
      languageCode: APP_LANG_TO_BCP47[lang],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatHistory((prev) => {
      const next = [newTurn, ...prev].slice(0, 25);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
    setStatus('idle');
    speakAndCheckAvailability(qa.answer, lang);
  };

  const detectedLangMeta = detectedOtherLang
    ? SUPPORTED_LANGUAGES.find((l) => l.code === detectedOtherLang)
    : null;

  const quickPictureCommands = [
    { id: 'crop_doctor', icon: Camera, labelKey: 'nav_doctor', fallback: 'Crop Doctor' },
    { id: 'pesticide', icon: ShieldCheck, labelKey: 'nav_spray', fallback: 'Advice' },
    { id: 'spray_log', icon: ShieldCheck, labelKey: 'going_to_spray', fallback: 'Spray Log' },
    { id: 'water', icon: Droplets, labelKey: 'water_title', fallback: 'Water' },
    { id: 'fertiliser', icon: Sprout, labelKey: 'fert_title', fallback: 'Fertiliser' },
    { id: 'farm_calendar', icon: Calendar, labelKey: 'calendar_title', fallback: 'Calendar' },
    { id: 'labour_connect', icon: Users, labelKey: 'labour_title', fallback: 'Labour' },
    { id: 'offline_map', icon: MapPin, labelKey: 'nav_map', fallback: 'Map' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-emerald-700 shadow-2xl overflow-hidden my-auto">
        {/* Top Green Header */}
        <div className="bg-emerald-900 text-white px-5 py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-400 text-stone-950">
              <Mic className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight">
                {t('voice_command', lang)} ({APP_LANG_TO_BCP47[lang]})
              </h2>
              <p className="text-[11px] text-emerald-200">{t('voice_privacy_note', lang)}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onLanguageChange && (
              <div className="flex items-center bg-emerald-950/90 rounded-xl border border-emerald-700 px-2 py-1 text-xs">
                <Globe className="w-3.5 h-3.5 text-amber-400 mr-1 shrink-0" />
                <select
                  value={lang}
                  onChange={(e) => onLanguageChange(e.target.value as Language)}
                  className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                  title="Change App Language"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-emerald-950 text-white font-bold">
                      {l.nativeName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {onOpenMicTest && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMicTest();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                title={t('mic_test_menu_btn', lang)}
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">3s Test</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Switcher: Voice Commands vs Ask a Farming Question */}
        <div className="grid grid-cols-2 bg-stone-100 p-1.5 gap-1.5 border-b border-stone-200">
          <button
            type="button"
            onClick={() => {
              setActiveMode('commands');
              setStatus('idle');
            }}
            className={`py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeMode === 'commands'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            🎤 {t('voice_commands_tab', lang)}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('ask');
              setStatus('idle');
            }}
            className={`py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              activeMode === 'ask'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-700 hover:bg-stone-200'
            }`}
          >
            💬 {t('voice_ask_question_tab', lang)}
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Cross-language detection banner: "You spoke <language>. Switch the app to <language>?" */}
          {detectedLangMeta && onLanguageChange && (
            <div className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-400 flex items-center justify-between gap-2 flex-wrap text-xs">
              <span className="font-black text-stone-900 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-700 shrink-0" />
                {t('voice_spoke_other_lang_prompt', lang, {
                  language: `${detectedLangMeta.nativeName} (${detectedLangMeta.name})`,
                })}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onLanguageChange(detectedLangMeta.code);
                    setDetectedOtherLang(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-black cursor-pointer"
                >
                  {t('voice_yes_btn', lang)}
                </button>
                <button
                  type="button"
                  onClick={() => setDetectedOtherLang(null)}
                  className="px-3 py-1.5 rounded-xl bg-stone-200 text-stone-800 font-bold cursor-pointer"
                >
                  {t('voice_no_btn', lang)}
                </button>
              </div>
            </div>
          )}

          {/* Big Microphone Recording / Sound Wave Centerpiece */}
          <div className="bg-emerald-950 text-white rounded-3xl p-5 text-center space-y-3 border-2 border-emerald-800 shadow-inner">
            {status === 'listening' ? (
              <>
                <div className="text-base font-black text-amber-300 animate-pulse">
                  {t('voice_i_am_listening', lang)}
                </div>

                {/* Big Animated Sound Wave */}
                <div className="h-20 flex items-end justify-center gap-2 bg-emerald-900/70 rounded-2xl px-4 py-3">
                  {waveBars.map((bar, idx) => (
                    <div
                      key={idx}
                      className="w-3 rounded-full bg-gradient-to-t from-emerald-400 to-amber-400 transition-all duration-75"
                      style={{ height: `${Math.max(15, bar)}%` }}
                    />
                  ))}
                </div>

                {/* Volume Meter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-emerald-200 font-bold">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" />{' '}
                      {lang === 'or' ? 'ସ୍ୱର ତীব্রତା' : lang === 'hi' ? 'आवाज़ मीटर' : 'Volume Meter'}
                    </span>
                    <span>{volume}%</span>
                  </div>
                  <div className="w-full h-2 bg-emerald-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-75"
                      style={{ width: `${Math.min(100, volume)}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => finishActiveRecordingNow()}
                  className="mx-auto px-6 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs inline-flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>
                    {lang === 'or' ? 'କହିବା ଶେଷ ହେଲା' : lang === 'hi' ? 'बोलना पूरा हुआ' : 'Done Speaking'}
                  </span>
                </button>
              </>
            ) : status === 'thinking' ? (
              <div className="py-6 space-y-3">
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="text-base font-black text-amber-300">
                  {t('voice_thinking', lang)}
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleStartRecording(false)}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 flex items-center justify-center mx-auto shadow-2xl border-4 border-amber-200 transition-transform active:scale-95 cursor-pointer"
                >
                  <Mic className="w-9 h-9 stroke-[2.5]" />
                </button>
                <div className="text-xs font-bold text-emerald-200">
                  {t('voice_privacy_note', lang)}
                </div>
              </>
            )}
          </div>

          {/* Requirement 6: "Did you mean <command>?" with big Yes and No buttons before acting */}
          {status === 'confirm_command' && matchedCommand && (
            <div className="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-600 text-stone-900 space-y-3 shadow-md">
              <div className="text-xs font-bold text-emerald-800">
                {lang === 'or' ? 'ଶୁଣାଗଲା:' : lang === 'hi' ? 'सुना गया:' : 'Heard:'}{' '}
                <span className="font-black text-stone-950">“{heardText}”</span>
              </div>
              <div className="text-base font-black text-emerald-950">
                {t('voice_did_you_mean', lang, { command: matchedCommand.label })}
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => executeConfirmedCommand(matchedCommand)}
                  className="py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-base flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>{t('voice_yes_btn', lang)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMatchedCommand(null);
                    setStatus('idle');
                  }}
                  className="py-3.5 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-900 font-black text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                  <span>{t('voice_no_btn', lang)}</span>
                </button>
              </div>
            </div>
          )}

          {/* Ask a Farming Question Box + "Did I hear you correctly?" Confirmation */}
          {activeMode === 'ask' && (
            <div className="space-y-3 bg-stone-50 p-4 rounded-3xl border border-stone-200">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-stone-800">
                  {t('voice_ask_question_tab', lang)}
                </label>
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  ⚡ OUAT AI Agent Active
                </span>
              </div>

              {/* Instant AI Agent Prompt Chips */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">
                  {lang === 'or' ? 'ତୁରନ୍ତ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ (Quick AI Agent Ask):' : 'Instant AI Agent Questions:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    {
                      or: 'ଧାନ କାଣ୍ଡବିନ୍ଧା ପୋକ ପାଇଁ କଣ ସ୍ପ୍ରେ କରିବି?',
                      en: 'What to spray for Paddy Stem Borer?'
                    },
                    {
                      or: 'ଟମାଟୋ ପତ୍ର ହଳଦିଆ ପଡ଼ୁଛି କଣ ସାର ଦେବି?',
                      en: 'Tomato leaves turning yellow, which fertilizer to give?'
                    },
                    {
                      or: 'ଧାନ ବିଲରେ ପାଣି କେବେ ମଡ଼ାଇବି?',
                      en: 'When should I irrigate my paddy field?'
                    },
                    {
                      or: 'ଆଜି ବର୍ଷା ହେବାର ସମ୍ଭାବନା ଅଛି କି?',
                      en: 'Is there a chance of rain today?'
                    },
                    {
                      or: 'ସର୍ପାଘାତ ପ୍ରାଥମିକ ଚିକିତ୍ସା କଣ?',
                      en: 'What is snakebite first aid protocol?'
                    }
                  ].map((chip, idx) => {
                    const txt = lang === 'or' ? chip.or : chip.en;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setQuestionText(txt);
                          setTimeout(() => {
                            setQuestionText(txt);
                            setStatus('thinking');
                            setTtsNotice(null);
                            askFarmingQuestionInLanguage({
                              question: txt,
                              lang,
                              contextTopic: 'voice_modal_ask'
                            }).then((qa) => {
                              setAiAnswer(qa.answer);
                              const newTurn: VoiceChatTurn = {
                                id: `chat-${Date.now()}`,
                                question: txt,
                                answer: qa.answer,
                                lang,
                                languageCode: APP_LANG_TO_BCP47[lang],
                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              };
                              setChatHistory((prev) => [newTurn, ...prev].slice(0, 25));
                              setStatus('idle');
                              speakAndCheckAvailability(qa.answer, lang);
                            });
                          }, 50);
                        }}
                        className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-100 text-stone-900 font-bold text-[11px] border border-stone-200 hover:border-emerald-500 transition-all cursor-pointer shadow-2xs"
                      >
                        ⚡ {txt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <textarea
                  ref={questionInputRef}
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder={t('voice_ask_placeholder', lang)}
                  className="flex-1 rounded-2xl border-2 border-stone-300 focus:border-emerald-600 bg-white px-3.5 py-2.5 text-sm font-semibold text-stone-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleStartRecording(false)}
                  className="p-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black shadow-xs cursor-pointer shrink-0"
                  title="Speak Question"
                >
                  <Mic className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* "Did I hear you correctly?" confirmation with Tick, Mic retry, Keyboard edit */}
              {status === 'confirm_field' && heardText && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-400 flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-xs font-black text-emerald-950">
                    {t('voice_did_i_hear_correctly', lang)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleSubmitFarmingQuestion}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-black flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{t('voice_ask_send_btn', lang)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartRecording(false)}
                      className="p-1.5 rounded-xl bg-amber-400 text-stone-950 cursor-pointer"
                      title={t('try_again', lang)}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStatus('idle');
                        questionInputRef.current?.focus();
                      }}
                      className="p-1.5 rounded-xl bg-white border border-stone-300 text-stone-800 cursor-pointer"
                      title={t('edit_btn', lang)}
                    >
                      <Keyboard className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmitFarmingQuestion}
                disabled={!questionText.trim() || status === 'thinking'}
                className="w-full py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{t('voice_ask_send_btn', lang)}</span>
              </button>

              {ttsNotice && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-[11px] font-bold text-amber-900">
                  {ttsNotice}
                </div>
              )}

              {/* Scrollable Chat History Thread (Saved history stays in its original language; new answers use new language) */}
              {chatHistory.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-stone-200 max-h-60 overflow-y-auto pr-1">
                  {chatHistory.map((turn) => (
                    <div
                      key={turn.id}
                      className="p-3.5 rounded-2xl bg-white border-2 border-emerald-600/80 space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-stone-500">
                        <span className="font-black text-emerald-800">
                          OUAT / Krushak Bani ({turn.languageCode}) • {turn.timestamp}
                        </span>
                        <button
                          type="button"
                          onClick={() => speakAndCheckAvailability(turn.answer, turn.lang)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{t('listen', lang)}</span>
                        </button>
                      </div>
                      <div className="text-xs font-bold text-stone-700 bg-stone-100 px-2.5 py-1.5 rounded-xl">
                        Q: “{turn.question}”
                      </div>
                      <p className="text-sm font-semibold text-stone-900 leading-relaxed whitespace-pre-line">
                        {turn.answer}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Offline Notice & Fallback Offline Voice Command Parser */}
          {status === 'offline_prompt' && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-stone-900 space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <WifiOff className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">{t('voice_offline_msg', lang)}</div>
                  <p className="text-[11px] text-stone-700 font-semibold">
                    {lang === 'or'
                      ? 'ଅଫଲାଇନ୍ ମୋଡ୍: ଆପଣ ଅଫଲାଇନ୍ କମାଣ୍ଡ ଚୟନ କରିପାରିବେ କିମ୍ବା ଲେଖିପାରିବେ।'
                      : lang === 'hi'
                      ? 'ऑफ़लाइन मोड: आप ऑफ़लाइन कमांड चुन सकते हैं या टाइप कर सकते हैं।'
                      : 'Offline Mode: You can select or type common offline commands like "check weather" or "open logs".'}
                  </p>
                </div>
              </div>

              {/* Quick Offline Command Chips */}
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-amber-900 tracking-wider">
                  {lang === 'or' ? 'ଅଫଲାଇନ୍ କମାଣ୍ଡ (Quick Offline Commands):' : 'Instant Offline Voice Commands:'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { phrase: 'check weather', label: lang === 'or' ? 'ପାଣିପାଗ (Weather)' : 'Check Weather' },
                    { phrase: 'open logs', label: lang === 'or' ? 'ସ୍ପ୍ରେ ଡାଏରୀ (Spray Logs)' : 'Open Spray Logs' },
                    { phrase: 'crop doctor', label: lang === 'or' ? 'ଶସ୍ୟ ଡାକ୍ତର (Crop Doctor)' : 'Crop Doctor' },
                    { phrase: 'water advice', label: lang === 'or' ? 'ଜଳସେଚନ (Water Advice)' : 'Water Advice' },
                    { phrase: 'fertiliser calculator', label: lang === 'or' ? 'ସାର ହିସାବ (Fertiliser)' : 'Fertiliser' },
                    { phrase: 'offline map', label: lang === 'or' ? 'ଅଫଲାଇନ୍ ମ୍ୟାପ୍ (Offline Map)' : 'Offline Map' },
                    { phrase: 'safety alert', label: lang === 'or' ? 'ସୁରକ୍ଷା (Safety Alert)' : 'Safety Alert' },
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const parsed = parseOfflineVoiceCommand(chip.phrase, lang);
                        if (parsed) {
                          setHeardText(chip.phrase);
                          setMatchedCommand(parsed);
                          setStatus('confirm_command');
                        }
                      }}
                      className="px-2.5 py-1 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-stone-900 font-bold text-[11px] border border-amber-400 cursor-pointer shadow-2xs"
                    >
                      ⚡ {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleStartRecording(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black cursor-pointer flex items-center gap-1.5"
                >
                  <Mic className="w-4 h-4" />
                  <span>{t('voice_save_offline_clip_btn', lang)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('ask');
                    setStatus('idle');
                    setTimeout(() => questionInputRef.current?.focus(), 50);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-stone-900 text-white font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <Keyboard className="w-4 h-4" />
                  <span>{lang === 'or' ? 'ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ' : lang === 'hi' ? 'प्रश्न लिखें' : 'Type Question'}</span>
                </button>
              </div>
            </div>
          )}

          {offlineSavedBanner && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-400 text-emerald-950 text-xs font-bold">
              {t('voice_offline_clip_saved', lang)}
            </div>
          )}

          {/* Plain-Language Error Card with Platform Steps */}
          {status === 'error' && errorType && (
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-stone-900 space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                {errorType === 'permission_denied' || errorType === 'insecure_or_iframe' ? (
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1.5 flex-1">
                  {errorType === 'permission_denied' && (
                    <>
                      <div className="font-black text-red-900">{t('voice_mic_denied_title', lang)}</div>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-stone-700">
                        <li>{t('voice_mic_steps_android', lang)}</li>
                        <li>{t('voice_mic_steps_iphone', lang)}</li>
                        <li>{t('voice_mic_steps_desktop', lang)}</li>
                      </ul>
                    </>
                  )}
                  {(errorType === 'no_mic' || errorType === 'mic_in_use') && (
                    <div className="font-bold text-red-900">{t('voice_mic_not_found', lang)}</div>
                  )}
                  {errorType === 'insecure_or_iframe' && (
                    <div className="font-bold text-red-900">{t('voice_mic_insecure_frame', lang)}</div>
                  )}
                  {errorType === 'no_speech_5s' && (
                    <div className="font-bold text-stone-900">{t('voice_no_speech_5s', lang)}</div>
                  )}
                  {errorType === 'quality_unclear' && (
                    <div className="font-bold text-stone-900">{t('voice_quality_unclear', lang)}</div>
                  )}
                  {errorType === 'all_failed' && (
                    <div className="font-bold text-stone-900">{t('voice_all_engines_failed', lang)}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleStartRecording(false)}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('try_again', lang)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('ask');
                    setStatus('idle');
                    setTimeout(() => questionInputRef.current?.focus(), 50);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-stone-800 font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>{lang === 'or' ? 'ଏହା ବଦଳରେ ଟାଇପ୍ କରନ୍ତୁ' : lang === 'hi' ? 'इसके बजाय लिखें' : 'Type Instead'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Picture Buttons Grid (Highlighted after 2 failed voice tries per Requirement 7) */}
          <div
            className={`space-y-2 p-3 rounded-2xl transition-all ${
              failedTries >= 2
                ? 'bg-amber-50 border-2 border-amber-500 ring-4 ring-amber-200'
                : 'bg-stone-50 border border-stone-200'
            }`}
          >
            <div className="text-[11px] font-black text-stone-600 uppercase tracking-wider">
              {lang === 'or'
                ? 'ସିଧାସଳଖ ଚିତ୍ର ବଟନ୍ ଦବାନ୍ତୁ'
                : lang === 'hi'
                  ? 'सीधे चित्र बटन दबाएं'
                  : 'Tap Picture Buttons Directly'}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {quickPictureCommands.map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateTo(item.id);
                    }}
                    className="p-2.5 rounded-2xl bg-white hover:bg-emerald-50 border border-stone-200 flex flex-col items-center gap-1 text-center shadow-2xs cursor-pointer"
                  >
                    <IconComp className="w-5 h-5 text-emerald-700" />
                    <span className="text-[10px] font-bold text-stone-800 line-clamp-1">
                      {t(item.labelKey, lang) !== item.labelKey
                        ? t(item.labelKey, lang)
                        : item.fallback}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Direct Tap Snakebite & 108 Emergency Button (NEVER depends on voice recognition) */}
          <div className="pt-1 border-t border-stone-200 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateTo('snakebite');
              }}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 stroke-[2.5]" />
              <span>{t('snakebite_emergency', lang)} (108)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
