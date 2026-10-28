import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import intentsData from '../data/intents.json';
import { SUPPORTED_LANGUAGES, t } from '../services/translations';
import {
  APP_LANG_TO_BCP47,
  getAllLanguageVoiceCapabilities,
  LanguageVoiceCapability,
  recordSpeechClip,
  transcribe,
  speakInCurrentLanguage,
  finishActiveRecordingNow,
  abortActiveRecording,
  matchVoiceCommandIntent,
  askFarmingQuestionInLanguage,
} from '../services/SpeechService';
import {
  Mic,
  Square,
  Download,
  CheckCircle2,
  XCircle,
  Volume2,
  Globe,
  Clock,
  Cpu,
  ChevronLeft,
  RefreshCw,
} from 'lucide-react';

interface VoiceTestPageProps {
  lang: Language;
  onLanguageChange: (newLang: Language) => void;
  onBackToHome: () => void;
}

interface TestRunRecord {
  id: string;
  timestamp: string;
  appLanguage: Language;
  languageCode: string;
  itemType: 'command' | 'question' | 'free';
  expectedPrompt: string;
  transcript: string;
  matchedIntentId: string;
  aiReplyPreview: string;
  engineUsed: string;
  ttsVoiceUsed: string;
  confidence: string;
  timeTakenMs: number;
  grade: 'Correct' | 'Incorrect' | 'Ungraded';
}

export const VoiceTestPage: React.FC<VoiceTestPageProps> = ({
  lang,
  onLanguageChange,
  onBackToHome,
}) => {
  const [capabilities, setCapabilities] = useState<LanguageVoiceCapability[]>([]);
  const [activePromptText, setActivePromptText] = useState<string>('');
  const [activePromptType, setActivePromptType] = useState<'command' | 'question' | 'free'>('command');
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking'>('idle');
  const [volume, setVolume] = useState<number>(0);
  const [waveBars, setWaveBars] = useState<number[]>([15, 22, 35, 18, 40, 28, 20, 45, 30, 18, 12, 10]);
  const [latestRun, setLatestRun] = useState<TestRunRecord | null>(null);
  const [testHistory, setTestHistory] = useState<TestRunRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshVoices = () => {
    setCapabilities(getAllLanguageVoiceCapabilities());
  };

  useEffect(() => {
    refreshVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    }
    return () => {
      abortActiveRecording('aborted_user');
    };
  }, []);

  const suiteForLang =
    (intentsData.voiceTestSuite as Record<string, { commands: string[]; questions: string[] }>)[
      lang
    ] || intentsData.voiceTestSuite.or;

  const runVoiceEvaluation = async (
    promptText: string,
    itemType: 'command' | 'question' | 'free'
  ) => {
    setActivePromptText(promptText);
    setActivePromptType(itemType);
    setErrorMessage(null);
    setStatus('listening');

    const totalStart = Date.now();
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
      setStatus('idle');
      if (recResult.errorType === 'no_speech_5s') {
        setErrorMessage(t('voice_no_speech_5s', lang));
      } else if (recResult.errorType === 'quality_unclear') {
        setErrorMessage(t('voice_quality_unclear', lang));
      } else if (recResult.errorType === 'permission_denied') {
        setErrorMessage(t('voice_mic_denied_title', lang));
      } else if (recResult.errorType !== 'aborted_language_change') {
        setErrorMessage(t('voice_all_engines_failed', lang));
      }
      return;
    }

    setStatus('thinking');
    const sttStart = Date.now();
    const stt = await transcribe(recResult.audioBlob, APP_LANG_TO_BCP47[lang], {
      screenTopic: `voice_test_${itemType}`,
      webSpeechInterimTranscript: recResult.webSpeechTranscript,
    });
    const sttDurationMs = stt.durationMs || Date.now() - sttStart;

    let matchedIntentId = '-';
    let aiReplyPreview = '-';
    let textToSpeak = stt.text || '';

    if (stt.text) {
      if (itemType === 'command') {
        const cmdMatch = matchVoiceCommandIntent(stt.text, lang);
        if (cmdMatch) {
          matchedIntentId = `${cmdMatch.intentId} (${cmdMatch.label})`;
          textToSpeak = cmdMatch.label;
        }
      } else if (itemType === 'question') {
        const qa = await askFarmingQuestionInLanguage({
          question: stt.text,
          lang,
          contextTopic: 'voice_test_question',
        });
        aiReplyPreview = qa.answer;
        textToSpeak = qa.answer;
      }
    }

    const ttsOutcome = textToSpeak
      ? speakInCurrentLanguage(textToSpeak, lang)
      : { spoken: false, voiceUsed: null, unavailableMessage: t('voice_tts_not_available', lang) };

    const record: TestRunRecord = {
      id: `test-${Date.now()}`,
      timestamp: new Date().toISOString(),
      appLanguage: lang,
      languageCode: stt.language || APP_LANG_TO_BCP47[lang],
      itemType,
      expectedPrompt: promptText || '(Free Speech)',
      transcript: stt.text || '(Empty)',
      matchedIntentId,
      aiReplyPreview,
      engineUsed: stt.engine,
      ttsVoiceUsed: ttsOutcome.voiceUsed || 'None (Text Only - No Native Voice on Device)',
      confidence: stt.confidence,
      timeTakenMs: sttDurationMs || Date.now() - totalStart,
      grade: 'Ungraded',
    };

    setLatestRun(record);
    setTestHistory((prev) => [record, ...prev]);
    setStatus('idle');
  };

  const handleGradeRun = (id: string, grade: 'Correct' | 'Incorrect') => {
    setTestHistory((prev) => prev.map((r) => (r.id === id ? { ...r, grade } : r)));
    if (latestRun?.id === id) {
      setLatestRun({ ...latestRun, grade });
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Timestamp',
      'App_Language',
      'Language_Code',
      'Type',
      'Expected_Prompt',
      'Heard_Transcript',
      'Matched_Command',
      'Engine_Used',
      'TTS_Voice_Used',
      'Confidence',
      'Time_Taken_Ms',
      'Grade',
    ];
    const escapeCsv = (val: string | number) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const rows = testHistory.map((r) =>
      [
        r.timestamp,
        r.appLanguage,
        r.languageCode,
        r.itemType,
        r.expectedPrompt,
        r.transcript,
        r.matchedIntentId,
        r.engineUsed,
        r.ttsVoiceUsed,
        r.confidence,
        r.timeTakenMs,
        r.grade,
      ]
        .map(escapeCsv)
        .join(',')
    );

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `krushak_bani_voice_test_${lang}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="bg-emerald-900 text-white rounded-3xl p-5 shadow-xl border border-emerald-800 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-black">
            <Mic className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>/voice-test • Multilingual Speech Evaluation Suite</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            Krushak Bani Voice & Language Diagnostic
          </h2>
          <p className="text-xs text-emerald-200">
            Test all 6 languages (20 commands + 10 farming questions per language), verify STT/TTS engines, grade accuracy, and export CSV.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={testHistory.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-stone-950 font-black text-xs shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Export CSV ({testHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t('back_to_home', lang)}</span>
          </button>
        </div>
      </div>

      {/* 1) 6-Language Selector (Changes App Language Globally) */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-700" />
            <span>1. Active App Language Selector (Single Source of Truth)</span>
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            Active Code: {APP_LANG_TO_BCP47[lang]}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {SUPPORTED_LANGUAGES.map((l) => {
            const active = l.code === lang;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => onLanguageChange(l.code)}
                className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-900 text-white border-amber-400 shadow-md'
                    : 'bg-stone-50 hover:bg-emerald-50 text-stone-900 border-stone-200'
                }`}
              >
                <div className="text-base font-black">{l.nativeName}</div>
                <div className={`text-[11px] font-bold ${active ? 'text-amber-300' : 'text-stone-500'}`}>
                  {l.name} ({l.voiceLang})
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2) Device Capability Matrix for All 6 Languages */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-700" />
            <span>2. Device Capability Check (Speech-to-Text, Native TTS & Pre-recorded Audio)</span>
          </h3>
          <button
            type="button"
            onClick={refreshVoices}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Voices</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-600 font-black">
                <th className="py-2 pr-3">Language</th>
                <th className="py-2 px-3">Code</th>
                <th className="py-2 px-3">STT (Gemini + Fallback)</th>
                <th className="py-2 px-3">Browser Web Speech</th>
                <th className="py-2 px-3">Native TTS Voice on This Phone</th>
                <th className="py-2 pl-3">Pre-recorded Audio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {capabilities.map((cap) => (
                <tr
                  key={cap.code}
                  className={cap.code === lang ? 'bg-emerald-50/70 font-bold' : ''}
                >
                  <td className="py-2.5 pr-3 font-black text-stone-900">
                    {cap.nativeName} ({cap.name})
                  </td>
                  <td className="py-2.5 px-3 font-mono text-emerald-800">{cap.bcp47}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      ✓ Available
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {cap.sttBrowserWebSpeech ? (
                      <span className="text-emerald-700 font-bold">✓ Supported</span>
                    ) : (
                      <span className="text-stone-400">Not in Browser</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {cap.ttsNativeVoiceAvailable ? (
                      <span className="text-emerald-800 font-bold">{cap.ttsVoiceName}</span>
                    ) : (
                      <span className="text-amber-700 font-semibold">
                        ✗ {t('voice_tts_not_available', cap.code)}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 pl-3 text-emerald-700 font-bold">✓ Ready</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3) Live Speech Runner & Latest Result Card */}
      <div className="bg-emerald-950 text-white rounded-3xl p-5 border-2 border-amber-400 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              Live Speech Test Runner ({APP_LANG_TO_BCP47[lang]})
            </div>
            <div className="text-base font-black mt-0.5">
              {activePromptText
                ? `Target Phrase: “${activePromptText}”`
                : 'Tap any Command or Question below (or tap Free Mic Test) and speak'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status === 'listening' ? (
              <button
                type="button"
                onClick={() => finishActiveRecordingNow()}
                className="px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-2 animate-pulse cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>{t('voice_i_am_listening', lang)} (Tap to Stop)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => runVoiceEvaluation(activePromptText || 'Free Test', activePromptType)}
                disabled={status === 'thinking'}
                className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Mic className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {status === 'thinking' ? t('voice_thinking', lang) : 'Speak Now'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Waveform & Volume when listening */}
        {status === 'listening' && (
          <div className="space-y-2 bg-emerald-900/70 rounded-2xl p-4">
            <div className="h-14 flex items-end justify-center gap-2">
              {waveBars.map((b, i) => (
                <div
                  key={i}
                  className="w-2.5 rounded-full bg-gradient-to-t from-emerald-400 to-amber-400 transition-all duration-75"
                  style={{ height: `${Math.max(15, b)}%` }}
                />
              ))}
            </div>
            <div className="text-center text-xs text-amber-300 font-bold">
              {t('voice_i_am_listening', lang)} • Volume: {volume}%
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-900/70 border border-red-400 text-xs font-bold text-red-100">
            {errorMessage}
          </div>
        )}

        {/* Latest Run Telemetry & Correct / Incorrect Grading Buttons */}
        {latestRun && (
          <div className="bg-white text-stone-900 rounded-2xl p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-stone-500">
                  Target ({latestRun.itemType}): {latestRun.expectedPrompt}
                </div>
                <div className="text-lg font-black text-emerald-950">
                  Heard Transcript: “{latestRun.transcript}”
                </div>
                {latestRun.matchedIntentId !== '-' && (
                  <div className="text-xs font-bold text-emerald-700">
                    Matched Command Intent: {latestRun.matchedIntentId}
                  </div>
                )}
                {latestRun.aiReplyPreview !== '-' && (
                  <div className="text-xs font-semibold text-stone-700 bg-stone-100 p-2.5 rounded-xl mt-1">
                    AI Answer ({latestRun.languageCode}): {latestRun.aiReplyPreview}
                  </div>
                )}
              </div>

              {/* Correct / Incorrect Grading Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleGradeRun(latestRun.id, 'Correct')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs cursor-pointer transition-all ${
                    latestRun.grade === 'Correct'
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                      : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Correct</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleGradeRun(latestRun.id, 'Incorrect')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs cursor-pointer transition-all ${
                    latestRun.grade === 'Incorrect'
                      ? 'bg-red-600 text-white ring-2 ring-red-300'
                      : 'bg-red-100 hover:bg-red-200 text-red-900'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>Incorrect</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-stone-200 text-[11px]">
              <div className="bg-stone-50 p-2 rounded-xl">
                <span className="text-stone-500 block">Language Code</span>
                <span className="font-mono font-black text-stone-900">{latestRun.languageCode}</span>
              </div>
              <div className="bg-stone-50 p-2 rounded-xl">
                <span className="text-stone-500 block">STT Engine Used</span>
                <span className="font-black text-emerald-800 uppercase">{latestRun.engineUsed}</span>
              </div>
              <div className="bg-stone-50 p-2 rounded-xl">
                <span className="text-stone-500 block">Confidence</span>
                <span className="font-black text-stone-900 uppercase">{latestRun.confidence}</span>
              </div>
              <div className="bg-stone-50 p-2 rounded-xl">
                <span className="text-stone-500 block flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Time Taken
                </span>
                <span className="font-mono font-black text-stone-900">{latestRun.timeTakenMs} ms</span>
              </div>
              <div className="bg-stone-50 p-2 rounded-xl col-span-2 sm:col-span-1">
                <span className="text-stone-500 block flex items-center gap-1">
                  <Volume2 className="w-3 h-3" /> TTS Voice Used
                </span>
                <span className="font-bold text-stone-800 truncate block" title={latestRun.ttsVoiceUsed}>
                  {latestRun.ttsVoiceUsed}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4) 20 Voice Commands + 10 Sample Farming Questions for Active Language */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 20 Commands */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
          <h3 className="text-sm font-black text-stone-900">
            20 Voice Commands ({APP_LANG_TO_BCP47[lang]}) — Tap Mic to Speak & Test
          </h3>
          <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
            {suiteForLang.commands.map((cmd, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-stone-50 hover:bg-emerald-50 border border-stone-200 transition-colors"
              >
                <div className="text-xs font-bold text-stone-900">
                  <span className="text-stone-400 font-mono mr-2">#{index + 1}</span>
                  <span>{cmd}</span>
                </div>
                <button
                  type="button"
                  onClick={() => runVoiceEvaluation(cmd, 'command')}
                  disabled={status !== 'idle'}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs inline-flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Test</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 10 Sample Farming Questions */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
          <h3 className="text-sm font-black text-stone-900">
            10 Sample Farming Questions ({APP_LANG_TO_BCP47[lang]}) — Tap Mic to Speak & Test
          </h3>
          <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
            {suiteForLang.questions.map((q, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-stone-50 hover:bg-emerald-50 border border-stone-200 transition-colors"
              >
                <div className="text-xs font-bold text-stone-900 leading-relaxed">
                  <span className="text-emerald-700 font-mono mr-2">Q{index + 1}.</span>
                  <span>{q}</span>
                </div>
                <button
                  type="button"
                  onClick={() => runVoiceEvaluation(q, 'question')}
                  disabled={status !== 'idle'}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs inline-flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
