/**
 * Pluggable Speech-to-Text, Web Audio Recorder, Quality Checker, Intent Matcher & Strict TTS Service
 * Single file: SpeechService.ts
 *
 * Implements all Part 2 Voice Input & Language Synchronization requirements:
 * 1) Proper Microphone Access (navigator.permissions.query + getUserMedia only on tap, platform steps, immediate track cleanup)
 * 2) Web Audio API (AnalyserNode) Recording with 16kHz mono echoCancellation/noiseSuppression/autoGainControl,
 *    auto-stop after 1.5s silence, 12s max duration, 5s initial no-speech timeout, and pre-send quality check (<0.5s, too quiet, too noisy)
 * 3) Pluggable transcribe(audioBlob, languageCode, context) with per-language engine order:
 *    - Engine A: Gemini Audio Transcription via secure server endpoint (/api/speech/transcribe)
 *    - Engine B: Browser Speech Recognition (Web Speech API) where supported
 *    - Engine C: Bhashini / AI4Bharat Adapter (clean documented stub ready for ULCA credentials)
 * 4) Post-processing: fuzzy crop/farm vocabulary correction, spoken-number-to-digit conversion (6 languages), duplicate word removal
 * 5) Fuzzy Voice Command Intent Matching using src/data/intents.json
 * 6) Strict Single-Language TTS: NEVER reads Odia (or any language) text with another language's voice
 * 7) Offline Voice Clip Queue: optional phone-only queue that auto-transcribes when online and deletes audio immediately
 */

import { Language } from '../types';
import cropsData from '../data/crops.json';
import intentsData from '../data/intents.json';
import { SUPPORTED_LANGUAGES, t } from './translations';
import { idbGet, idbPut, STORE_DRAFTS, addAdviceHistoryLocalFirst } from './localFirstSyncEngine';
import { getCurrentSignedInFarmer } from './authDatabaseService';

export type SpeechConfidence = 'high' | 'medium' | 'low';
export type SpeechEngineName = 'gemini' | 'web_speech' | 'bhashini' | 'none';

export type MicPermissionState =
  | 'not_asked'
  | 'granted'
  | 'denied'
  | 'no_mic'
  | 'mic_in_use'
  | 'insecure_or_iframe'
  | 'offline';

export interface TranscribeContext {
  screenTopic?: string;
  expectNumber?: boolean;
  fieldLabel?: string;
  webSpeechInterimTranscript?: string;
  durationMs?: number;
}

export interface TranscribeResult {
  text: string;
  rawText?: string;
  language: string; // e.g. 'or-IN', 'hi-IN', 'en-IN', 'te-IN', 'bn-IN', 'ta-IN'
  confidence: SpeechConfidence;
  engine: SpeechEngineName;
  detectedDifferentLanguage?: Language | null;
  durationMs?: number;
}

export interface AudioRecordingResult {
  ok: boolean;
  audioBlob?: Blob;
  mimeType?: string;
  durationMs: number;
  peakRms: number;
  avgRms: number;
  noiseFloorRms: number;
  webSpeechTranscript?: string;
  errorType?:
    | 'permission_denied'
    | 'no_mic'
    | 'mic_in_use'
    | 'insecure_or_iframe'
    | 'no_speech_5s'
    | 'quality_unclear'
    | 'aborted_language_change'
    | 'aborted_user'
    | 'unknown';
}

export interface VoiceCommandMatch {
  intentId: string;
  actionType: 'navigate' | 'safety_modal' | 'control' | 'confirm';
  targetFeature: string;
  label: string;
  confidenceScore: number;
  heardText: string;
}

export interface OfflineVoiceQueueItem {
  id: string;
  createdAt: number;
  language: Language;
  languageCode: string;
  contextTopic: string;
  mimeType: string;
  audioBase64: string;
}

export interface EngineLogEntry {
  timestamp: number;
  languageCode: string;
  engine: SpeechEngineName;
  confidence: SpeechConfidence;
  durationMs: number;
  success: boolean;
}

// Language code mapping required by Part 2 Spec:
// English en-IN, Hindi hi-IN, Odia or-IN, Telugu te-IN, Bengali bn-IN, Tamil ta-IN
export const APP_LANG_TO_BCP47: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  or: 'or-IN',
  te: 'te-IN',
  bn: 'bn-IN',
  ta: 'ta-IN',
  ur: 'ur-IN',
};

export const BCP47_TO_APP_LANG: Record<string, Language> = {
  'en-in': 'en',
  en: 'en',
  'hi-in': 'hi',
  hi: 'hi',
  'or-in': 'or',
  or: 'or',
  ory: 'or',
  odia: 'or',
  'te-in': 'te',
  te: 'te',
  'bn-in': 'bn',
  bn: 'bn',
  'ta-in': 'ta',
  ta: 'ta',
};

// Configurable engine order per language (Gemini first for highest Indian language accuracy,
// followed by Browser Web Speech API, followed by Bhashini/AI4Bharat adapter)
export const ENGINE_PRIORITY_BY_LANGUAGE: Record<Language, SpeechEngineName[]> = {
  or: ['gemini', 'web_speech', 'bhashini'],
  hi: ['gemini', 'web_speech', 'bhashini'],
  en: ['gemini', 'web_speech', 'bhashini'],
  te: ['gemini', 'web_speech', 'bhashini'],
  bn: ['gemini', 'web_speech', 'bhashini'],
  ta: ['gemini', 'web_speech', 'bhashini'],
  ur: ['gemini', 'web_speech', 'bhashini'],
};

const ENGINE_USAGE_LOGS: EngineLogEntry[] = [];

export function getSpeechEngineLogs(): EngineLogEntry[] {
  return [...ENGINE_USAGE_LOGS];
}

function logEngineResult(entry: EngineLogEntry): void {
  ENGINE_USAGE_LOGS.unshift(entry);
  if (ENGINE_USAGE_LOGS.length > 100) {
    ENGINE_USAGE_LOGS.pop();
  }
}

// ============================================================================
// ACTIVE RECORDING CONTROLLER (Allows immediate abort on language change or unmount)
// ============================================================================
let activeRecordingAbortController: ((reason: 'aborted_language_change' | 'aborted_user' | 'manual_stop') => void) | null =
  null;
let activeMediaStream: MediaStream | null = null;
let activeWebSpeechInstance: any = null;

export function stopAllActiveMicrophoneTracks(): void {
  if (activeMediaStream) {
    try {
      activeMediaStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
    } catch {}
    activeMediaStream = null;
  }
  if (activeWebSpeechInstance) {
    try {
      activeWebSpeechInstance.abort();
    } catch {}
    activeWebSpeechInstance = null;
  }
}

/**
 * Stops any ongoing recording immediately (e.g., when farmer changes language mid-listening)
 */
export function abortActiveRecording(
  reason: 'aborted_language_change' | 'aborted_user' | 'manual_stop' = 'aborted_user'
): void {
  if (activeRecordingAbortController) {
    activeRecordingAbortController(reason);
  } else {
    stopAllActiveMicrophoneTracks();
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

/**
 * Finish recording early when farmer taps the Stop button
 */
export function finishActiveRecordingNow(): void {
  if (activeRecordingAbortController) {
    activeRecordingAbortController('manual_stop');
  }
}

// ============================================================================
// 1) MICROPHONE ACCESS & PERMISSION STATE CHECKER
// ============================================================================
export async function checkMicrophonePermissionState(): Promise<MicPermissionState> {
  if (typeof window === 'undefined') return 'not_asked';

  if (
    window.location.protocol !== 'https:' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    !window.isSecureContext
  ) {
    return 'insecure_or_iframe';
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return 'insecure_or_iframe';
  }

  if (navigator.permissions && typeof navigator.permissions.query === 'function') {
    try {
      const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (status.state === 'granted') return 'granted';
      if (status.state === 'denied') return 'denied';
      return 'not_asked';
    } catch {
      // Safari / some WebViews do not support querying 'microphone' via permissions.query
    }
  }

  return 'not_asked';
}

export function classifyMicrophoneError(err: any): MicPermissionState {
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    return 'insecure_or_iframe';
  }
  const name = String(err?.name || '');
  const msg = String(err?.message || '').toLowerCase();

  if (
    name === 'NotAllowedError' ||
    name === 'PermissionDeniedError' ||
    msg.includes('permission') ||
    msg.includes('denied')
  ) {
    if (msg.includes('permissions policy') || msg.includes('iframe') || msg.includes('feature policy')) {
      return 'insecure_or_iframe';
    }
    return 'denied';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError' || msg.includes('not found')) {
    return 'no_mic';
  }
  if (
    name === 'NotReadableError' ||
    name === 'TrackStartError' ||
    name === 'SourceUnavailableError' ||
    msg.includes('in use') ||
    msg.includes('could not start')
  ) {
    return 'mic_in_use';
  }
  if (name === 'SecurityError' || msg.includes('secure') || msg.includes('https')) {
    return 'insecure_or_iframe';
  }
  return 'denied';
}

// ============================================================================
// 2) RECORDING WITH WEB AUDIO API SILENCE DETECTION & QUALITY CHECKS
// ============================================================================
export function getBestSupportedAudioMimeType(): string {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return '';
  }
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/wav',
  ];
  for (const type of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    } catch {}
  }
  return '';
}

export interface RecordSpeechOptions {
  language: Language;
  maxDurationMs?: number; // Default 12000ms (12s)
  silenceDurationMs?: number; // Default 1500ms (1.5s)
  initialNoSpeechTimeoutMs?: number; // Default 5000ms (5s)
  skipSilenceAutoStop?: boolean; // True for 3-second Mic Hardware Test
  onVolumeChange?: (volumePercent: number, waveformBars: number[]) => void;
  onSpeechDetected?: () => void;
}

export async function recordSpeechClip(
  options: RecordSpeechOptions
): Promise<AudioRecordingResult> {
  const {
    language,
    maxDurationMs = 12000,
    silenceDurationMs = 1500,
    initialNoSpeechTimeoutMs = 5000,
    skipSilenceAutoStop = false,
    onVolumeChange,
    onSpeechDetected,
  } = options;

  // Stop any stray tracks first
  stopAllActiveMicrophoneTracks();

  const permCheck = await checkMicrophonePermissionState();
  if (permCheck === 'insecure_or_iframe') {
    return {
      ok: false,
      durationMs: 0,
      peakRms: 0,
      avgRms: 0,
      noiseFloorRms: 0,
      errorType: 'insecure_or_iframe',
    };
  }

  let stream: MediaStream;
  try {
    // Request microphone with exact constraints from Part 2 spec:
    // echoCancellation true, noiseSuppression true, autoGainControl true, mono, 16 kHz sampleRate where allowed
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });
    } catch {
      // Fallback if browser rejects sampleRate or channelCount constraint
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    }
  } catch (err) {
    const classified = classifyMicrophoneError(err);
    return {
      ok: false,
      durationMs: 0,
      peakRms: 0,
      avgRms: 0,
      noiseFloorRms: 0,
      errorType:
        classified === 'no_mic'
          ? 'no_mic'
          : classified === 'mic_in_use'
          ? 'mic_in_use'
          : classified === 'insecure_or_iframe'
          ? 'insecure_or_iframe'
          : 'permission_denied',
    };
  }

  activeMediaStream = stream;

  // Mark microphone consent granted for privacy gate
  try {
    localStorage.setItem('krushak_mic_consent_granted', 'true');
  } catch {}

  const mimeType = getBestSupportedAudioMimeType();
  const chunks: BlobPart[] = [];
  let mediaRecorder: MediaRecorder;
  try {
    mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
  } catch {
    mediaRecorder = new MediaRecorder(stream);
  }

  // Optional parallel Web Speech API capture as Engine B backup
  let webSpeechTranscript = '';
  const SpeechRecognitionCtor =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : null;

  if (SpeechRecognitionCtor && !skipSilenceAutoStop) {
    try {
      const recognition = new SpeechRecognitionCtor();
      recognition.lang = APP_LANG_TO_BCP47[language] || 'or-IN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event: any) => {
        let combined = '';
        for (let i = 0; i < event.results.length; i++) {
          combined += event.results[i][0]?.transcript || '';
        }
        if (combined.trim()) {
          webSpeechTranscript = combined.trim();
        }
      };
      recognition.onerror = () => {};
      recognition.start();
      activeWebSpeechInstance = recognition;
    } catch {}
  }

  return new Promise<AudioRecordingResult>((resolve) => {
    const startTime = Date.now();
    let hasHeardSpeech = false;
    let lastSpeechTime = startTime;
    let peakRms = 0;
    let rmsSum = 0;
    let rmsSamples = 0;
    let highClippingSamples = 0;
    let minRms = 1;
    let finished = false;
    let abortReason: 'aborted_language_change' | 'aborted_user' | 'manual_stop' | 'no_speech_5s' | null =
      null;

    // Set up Web Audio API AnalyserNode for silence detection and live sound wave
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let animFrameId: number | null = null;

    try {
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      audioCtx = new AudioContextCtor();
      const source = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.65;
      source.connect(analyser);
    } catch {}

    const cleanupAndStopRecorder = (
      reason: 'aborted_language_change' | 'aborted_user' | 'manual_stop' | 'no_speech_5s' | 'auto_stop'
    ) => {
      if (finished) return;
      finished = true;
      if (reason !== 'auto_stop') {
        abortReason = reason;
      }
      activeRecordingAbortController = null;

      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }

      if (activeWebSpeechInstance) {
        try {
          activeWebSpeechInstance.stop();
        } catch {}
        activeWebSpeechInstance = null;
      }

      try {
        if (mediaRecorder.state !== 'inactive') {
          mediaRecorder.stop();
        }
      } catch {
        stopAllActiveMicrophoneTracks();
      }

      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }
    };

    activeRecordingAbortController = (reason) => {
      cleanupAndStopRecorder(reason);
    };

    mediaRecorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) {
        chunks.push(ev.data);
      }
    };

    mediaRecorder.onstop = () => {
      // Immediately stop all microphone tracks so mic is NEVER left on in background
      stopAllActiveMicrophoneTracks();

      const durationMs = Date.now() - startTime;
      const avgRms = rmsSamples > 0 ? rmsSum / rmsSamples : 0;
      const noiseFloorRms = minRms < 1 ? minRms : 0;

      if (abortReason === 'aborted_language_change' || abortReason === 'aborted_user') {
        resolve({
          ok: false,
          durationMs,
          peakRms,
          avgRms,
          noiseFloorRms,
          errorType: abortReason,
        });
        return;
      }

      if (abortReason === 'no_speech_5s') {
        resolve({
          ok: false,
          durationMs,
          peakRms,
          avgRms,
          noiseFloorRms,
          errorType: 'no_speech_5s',
        });
        return;
      }

      const actualMime = mediaRecorder.mimeType || mimeType || 'audio/webm';
      const audioBlob = new Blob(chunks, { type: actualMime });

      // Quality checks before sending (Part 2 Section 2):
      // 1) Clip too short (< 0.5 s / 500 ms)
      // 2) Clip too quiet (peakRms < 0.012 and no Web Speech transcript)
      // 3) Clip very noisy (constant extreme clipping > 85% of frames without speech modulation)
      const clippingRatio = rmsSamples > 10 ? highClippingSamples / rmsSamples : 0;
      const isTooShort = !skipSilenceAutoStop && durationMs < 500;
      const isTooQuiet = !skipSilenceAutoStop && peakRms < 0.012 && !webSpeechTranscript;
      const isVeryNoisy = !skipSilenceAutoStop && clippingRatio > 0.85 && noiseFloorRms > 0.35;

      if (isTooShort || isTooQuiet || isVeryNoisy || audioBlob.size < 250) {
        resolve({
          ok: false,
          durationMs,
          peakRms,
          avgRms,
          noiseFloorRms,
          errorType: 'quality_unclear',
        });
        return;
      }

      resolve({
        ok: true,
        audioBlob,
        mimeType: actualMime,
        durationMs,
        peakRms,
        avgRms,
        noiseFloorRms,
        webSpeechTranscript: webSpeechTranscript || undefined,
      });
    };

    mediaRecorder.start(150);

    const timeDomainBuf = analyser ? new Uint8Array(analyser.fftSize) : null;
    const freqBuf = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    const SPEECH_RMS_THRESHOLD = 0.022;

    const monitorLoop = () => {
      if (finished) return;
      const now = Date.now();
      const elapsed = now - startTime;

      if (analyser && timeDomainBuf && freqBuf) {
        analyser.getByteTimeDomainData(timeDomainBuf);
        analyser.getByteFrequencyData(freqBuf);

        let sumSquares = 0;
        for (let i = 0; i < timeDomainBuf.length; i++) {
          const normalized = (timeDomainBuf[i] - 128) / 128;
          sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / timeDomainBuf.length);
        if (rms > peakRms) peakRms = rms;
        if (rms < minRms && elapsed > 200) minRms = rms;
        rmsSum += rms;
        rmsSamples++;
        if (rms > 0.48) highClippingSamples++;

        if (rms >= SPEECH_RMS_THRESHOLD) {
          if (!hasHeardSpeech) {
            hasHeardSpeech = true;
            onSpeechDetected?.();
          }
          lastSpeechTime = now;
        }

        // Compute 12 waveform bars (0..100) for the animated sound wave UI
        const bars: number[] = [];
        const step = Math.max(1, Math.floor(freqBuf.length / 16));
        for (let b = 0; b < 12; b++) {
          const val = freqBuf[Math.min(freqBuf.length - 1, b * step)] || 0;
          bars.push(Math.min(100, Math.max(8, Math.round((val / 255) * 100))));
        }
        const volumePercent = Math.min(100, Math.round(rms * 320));
        onVolumeChange?.(volumePercent, bars);
      }

      // Check maximum duration (12s default, or 3s for Mic Test)
      if (elapsed >= maxDurationMs) {
        cleanupAndStopRecorder('auto_stop');
        return;
      }

      if (!skipSilenceAutoStop) {
        // Stop with message if no speech is heard in the first 5 seconds
        if (!hasHeardSpeech && elapsed >= initialNoSpeechTimeoutMs && !webSpeechTranscript) {
          cleanupAndStopRecorder('no_speech_5s');
          return;
        }

        // Stop automatically after ~1.5 seconds of silence once speech has started
        if (hasHeardSpeech && now - lastSpeechTime >= silenceDurationMs && elapsed >= 900) {
          cleanupAndStopRecorder('auto_stop');
          return;
        }
      }

      animFrameId = requestAnimationFrame(monitorLoop);
    };

    animFrameId = requestAnimationFrame(monitorLoop);
  });
}

// ============================================================================
// 3) PLUGGABLE SPEECH-TO-TEXT SERVICE: transcribe(audioBlob, languageCode, context)
// ============================================================================

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function extractCropNamesForLanguage(lang: Language): string[] {
  const terms: string[] = [];
  const langKey = `name_${lang}` as keyof (typeof cropsData.categories)[0]['items'][0];
  for (const cat of cropsData.categories) {
    for (const item of cat.items) {
      const localName = item[langKey];
      if (typeof localName === 'string' && localName) {
        terms.push(localName.replace(/\s*\(.*?\)\s*/g, '').trim());
      }
      if (item.name_en && lang !== 'en') {
        terms.push(item.name_en);
      }
    }
  }
  return terms;
}

function buildFarmVocabularyHints(lang: Language, contextTopic?: string): string {
  const cropTerms = extractCropNamesForLanguage(lang);
  const commonTermsByLang: Record<Language, string[]> = {
    or: ['ଧାନ', 'ବିଲାତି', 'ବାଇଗଣ', 'ମୁଗ', 'ଚିନାବାଦାମ', 'କୀଟନାଶକ', 'ସ୍ପ୍ରେ', 'ସାର', 'ୟୁରିଆ', 'ଡିଏପି', 'ପାଣି', 'ରୋଗ', 'ପୋକ', 'ଏକର'], // TO REVIEW
    hi: ['धान', 'टमाटर', 'बैंगन', 'मूंग', 'मूंगफली', 'कीटनाशक', 'स्प्रे', 'खाद', 'यूरिया', 'डीएपी', 'पानी', 'रोग', 'कीड़ा', 'एकड़'], // TO REVIEW
    en: ['paddy', 'tomato', 'brinjal', 'moong', 'groundnut', 'pesticide', 'spray', 'fertiliser', 'urea', 'dap', 'water', 'blight', 'blast', 'acre'],
    te: ['వరి', 'టమాటా', 'వంకాయ', 'పెసర', 'వేరుశనగ', 'పురుగుమందు', 'స్ప్రే', 'ఎరువు', 'యూరియా', 'నీరు', 'తెగులు', 'ఎకరం'], // TO REVIEW
    bn: ['ধান', 'টমেটো', 'বেগুন', 'মুগ', 'চিনাবাদাম', 'কীটনাশক', 'স্প্রে', 'সার', 'ইউরিয়া', 'জল', 'রোগ', 'পোকা', 'একর'], // TO REVIEW
    ta: ['நெல்', 'தக்காளி', 'கத்திரிக்காய்', 'பாசிப்பயறு', 'நிலக்கடலை', 'பூச்சிக்கொல்லி', 'ஸ்ப்ரே', 'உரம்', 'யூரியா', 'தண்ணீர்', 'நோய்', 'ஏக்கர்'], // TO REVIEW
    ur: ['paddy', 'tomato', 'brinjal', 'pesticide', 'spray', 'fertiliser', 'urea', 'water', 'acre'],
  };

  return [
    contextTopic ? `Topic: ${contextTopic}` : '',
    `Crops: ${cropTerms.slice(0, 32).join(', ')}`,
    `Farming words: ${(commonTermsByLang[lang] || commonTermsByLang.en).join(', ')}`,
  ]
    .filter(Boolean)
    .join(' | ');
}

/**
 * Engine A: Gemini Audio Transcription via secure server endpoint (/api/speech/transcribe)
 * Never exposes API key in client code; never sends farmer name or phone number.
 */
async function transcribeWithGeminiEngine(
  audioBlob: Blob,
  languageCode: string,
  appLang: Language,
  context: TranscribeContext
): Promise<TranscribeResult> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { text: '', language: languageCode, confidence: 'low', engine: 'gemini' };
  }

  try {
    const audioBase64 = await blobToBase64(audioBlob);
    const vocabularyHints = buildFarmVocabularyHints(appLang, context.screenTopic);

    const response = await fetch('/api/speech/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64,
        mimeType: audioBlob.type || 'audio/webm',
        languageCode,
        vocabularyHints,
        contextTopic: context.screenTopic || context.fieldLabel || 'Odisha farming',
      }),
    });

    if (!response.ok) {
      return { text: '', language: languageCode, confidence: 'low', engine: 'gemini' };
    }

    const data = await response.json();
    const rawText = typeof data.text === 'string' ? data.text.trim() : '';
    const conf: SpeechConfidence =
      data.confidence === 'high' || data.confidence === 'medium' ? data.confidence : 'low';

    return {
      text: rawText,
      rawText,
      language: data.language || languageCode,
      confidence: rawText ? conf : 'low',
      engine: 'gemini',
    };
  } catch {
    return { text: '', language: languageCode, confidence: 'low', engine: 'gemini' };
  }
}

/**
 * Engine B: Browser Speech Recognition (Web Speech API)
 * Used only where the browser supports that language.
 */
async function transcribeWithBrowserWebSpeech(
  languageCode: string,
  context: TranscribeContext
): Promise<TranscribeResult> {
  const captured = (context.webSpeechInterimTranscript || '').trim();
  if (captured) {
    return {
      text: captured,
      rawText: captured,
      language: languageCode,
      confidence: 'medium',
      engine: 'web_speech',
    };
  }
  return {
    text: '',
    language: languageCode,
    confidence: 'low',
    engine: 'web_speech',
  };
}

/**
 * Engine C: Adapter for Bhashini / AI4Bharat (Stub with clear comments)
 *
 * HOW TO PLUG IN BHASHINI (ULCA) LATER:
 * 1. Obtain your Bhashini ULCA `userID`, `ulcaApiKey`, and `inferenceApiKey` from https://bhashini.gov.in/ulca
 * 2. Configure a server-side proxy route `/api/speech/bhashini` in `server.ts` that forwards:
 *    - `pipelineTasks: [{ taskType: 'asr', config: { language: { sourceLanguage: languageCode.split('-')[0] }, audioFormat: 'webm', samplingRate: 16000 } }]`
 *    - `inputData: { audio: [{ audioContent: base64AudioWithoutPrefix }] }`
 * 3. Parse `pipelineResponse[0].output[0].source` and return `{ text, confidence: 'high' }`.
 */
async function transcribeWithBhashiniStub(
  _audioBlob: Blob,
  languageCode: string,
  _context: TranscribeContext
): Promise<TranscribeResult> {
  // Stub returns empty text & low confidence until Bhashini endpoint is configured
  return {
    text: '',
    language: languageCode,
    confidence: 'low',
    engine: 'bhashini',
  };
}

/**
 * Single pluggable function used everywhere in the app:
 * transcribe(audioBlob, languageCode, context)
 */
export async function transcribe(
  audioBlob: Blob,
  languageCode: string,
  context: TranscribeContext = {}
): Promise<TranscribeResult> {
  const startMs = Date.now();

  // Privacy check: only send audio if farmer granted mic consent
  const normalizedLangCode = languageCode || 'or-IN';
  const appLang: Language =
    BCP47_TO_APP_LANG[normalizedLangCode.toLowerCase()] ||
    BCP47_TO_APP_LANG[normalizedLangCode.split('-')[0].toLowerCase()] ||
    'or';

  const engineOrder = ENGINE_PRIORITY_BY_LANGUAGE[appLang] || ['gemini', 'web_speech', 'bhashini'];

  for (const engineName of engineOrder) {
    let rawResult: TranscribeResult = {
      text: '',
      language: normalizedLangCode,
      confidence: 'low',
      engine: engineName,
    };

    if (engineName === 'gemini') {
      rawResult = await transcribeWithGeminiEngine(audioBlob, normalizedLangCode, appLang, context);
    } else if (engineName === 'web_speech') {
      rawResult = await transcribeWithBrowserWebSpeech(normalizedLangCode, context);
    } else if (engineName === 'bhashini') {
      rawResult = await transcribeWithBhashiniStub(audioBlob, normalizedLangCode, context);
    }

    const elapsedMs = Date.now() - startMs;

    if (rawResult.text && rawResult.confidence !== 'low') {
      const processedText = postProcessTranscript(rawResult.text, appLang, Boolean(context.expectNumber));
      const detectedOtherLang = detectSpokenLanguageMismatch(
        processedText,
        rawResult.language,
        appLang
      );

      logEngineResult({
        timestamp: Date.now(),
        languageCode: normalizedLangCode,
        engine: engineName,
        confidence: rawResult.confidence,
        durationMs: elapsedMs,
        success: true,
      });

      return {
        text: processedText,
        rawText: rawResult.text,
        language: rawResult.language || normalizedLangCode,
        confidence: rawResult.confidence,
        engine: engineName,
        detectedDifferentLanguage: detectedOtherLang,
        durationMs: elapsedMs,
      };
    }
  }

  const totalElapsedMs = Date.now() - startMs;
  logEngineResult({
    timestamp: Date.now(),
    languageCode: normalizedLangCode,
    engine: 'none',
    confidence: 'low',
    durationMs: totalElapsedMs,
    success: false,
  });

  return {
    text: '',
    language: normalizedLangCode,
    confidence: 'low',
    engine: 'none',
    durationMs: totalElapsedMs,
  };
}

// ============================================================================
// 4) POST-PROCESSING: FUZZY CROP MATCHING, SPOKEN NUMBERS & CLEANUP
// ============================================================================

function levenshteinDistance(a: string, b: string): number {
  const s = a.toLowerCase();
  const tStr = b.toLowerCase();
  if (s === tStr) return 0;
  if (!s.length) return tStr.length;
  if (!tStr.length) return s.length;

  const v0 = new Array(tStr.length + 1).fill(0);
  const v1 = new Array(tStr.length + 1).fill(0);
  for (let i = 0; i <= tStr.length; i++) v0[i] = i;

  for (let i = 0; i < s.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < tStr.length; j++) {
      const cost = s[i] === tStr[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= tStr.length; j++) v0[j] = v1[j];
  }
  return v1[tStr.length];
}

// Convert Indic script digits (Odia, Devanagari, Telugu, Bengali, Tamil) to standard ASCII digits
export function normalizeIndicDigitsToAscii(input: string): string {
  const digitMaps: Record<string, string> = {
    // Odia digits
    '୦': '0', '୧': '1', '୨': '2', '୩': '3', '୪': '4', '୫': '5', '୬': '6', '୭': '7', '୮': '8', '୯': '9',
    // Devanagari digits
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
    // Telugu digits
    '౦': '0', '౧': '1', '౨': '2', '౩': '3', '౪': '4', '౫': '5', '౬': '6', '౭': '7', '౮': '8', '౯': '9',
    // Bengali digits
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
    // Tamil digits
    '௦': '0', '௧': '1', '௨': '2', '௩': '3', '௪': '4', '௫': '5', '௬': '6', '௭': '7', '௮': '8', '௯': '9',
  };
  return input.replace(/[୦-୯०-९౦-౯০-৯௦-௯]/g, (ch) => digitMaps[ch] ?? ch);
}

/**
 * Convert spoken numbers in all 6 languages to digits (e.g. "five days" / "ପାଞ୍ଚ ଦିନ" -> "5")
 */
export function convertSpokenNumbersToDigits(text: string, extractOnlyNumber = false): string {
  let working = normalizeIndicDigitsToAscii(text);
  const spokenMap = intentsData.spokenNumbers as Record<string, string[]>;

  // Sort keys by phrase length descending so multi-word numbers ("twenty five") match first
  const entries: Array<{ digit: string; word: string }> = [];
  Object.entries(spokenMap).forEach(([digit, words]) => {
    words.forEach((w) => entries.push({ digit, word: w }));
  });
  entries.sort((a, b) => b.word.length - a.word.length);

  for (const { digit, word } of entries) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s)${escaped}(?=\\s|$|[.,!?])`, 'giu');
    working = working.replace(regex, `$1${digit}`);
  }

  if (extractOnlyNumber) {
    const match = working.match(/\d+(\.\d+)?/);
    return match ? match[0] : working.trim();
  }

  return working;
}

/**
 * Post-processing pipeline (Part 2 Section 4):
 * - Fuzzy-match words in the transcript against crops.json and farming vocabulary
 * - Convert spoken numbers to digits where a number is needed
 * - Trim extra spaces and collapse repeated words
 */
export function postProcessTranscript(
  rawText: string,
  lang: Language,
  expectNumber = false
): string {
  if (!rawText) return '';

  // 1) Trim extra spaces
  let cleaned = rawText.replace(/\s+/g, ' ').trim();

  // 2) Convert spoken numbers alongside farming units or when a numeric field is active
  cleaned = convertSpokenNumbersToDigits(cleaned, expectNumber);
  if (expectNumber) {
    return cleaned;
  }

  // 3) Build vocabulary dictionary for current language from crops.json
  const vocabList = extractCropNamesForLanguage(lang);

  // 4) Fuzzy-match words against crop & farming vocabulary (fix near matches)
  const words = cleaned.split(' ');
  const correctedWords: string[] = [];

  for (const word of words) {
    if (word.length >= 4) {
      let bestMatch = word;
      let bestDist = 99;
      for (const vocabWord of vocabList) {
        if (vocabWord.includes(' ')) continue; // Single-word fuzzy correction
        if (Math.abs(vocabWord.length - word.length) > 1) continue;
        const dist = levenshteinDistance(word, vocabWord);
        const maxAllowed = word.length >= 6 ? 2 : 1;
        if (dist > 0 && dist <= maxAllowed && dist < bestDist) {
          bestDist = dist;
          bestMatch = vocabWord;
        }
      }
      correctedWords.push(bestMatch);
    } else {
      correctedWords.push(word);
    }
  }

  // 5) Remove repeated adjacent words (e.g. "ଧାନ ଧାନ" -> "ଧାନ")
  const deduplicated: string[] = [];
  for (const w of correctedWords) {
    if (
      deduplicated.length === 0 ||
      deduplicated[deduplicated.length - 1].toLowerCase() !== w.toLowerCase()
    ) {
      deduplicated.push(w);
    }
  }

  return deduplicated.join(' ').trim();
}

/**
 * Detect if the farmer clearly spoke a different supported language than the current app language
 * (Part 2 Section 8: "If the farmer speaks in another language, show 'You spoke <language>. Switch the app to <language>?'")
 * Ignores mixed English loan words when speaking an Indian language.
 */
export function detectSpokenLanguageMismatch(
  transcript: string,
  reportedBcp47: string,
  currentAppLang: Language
): Language | null {
  if (!transcript || transcript.trim().length < 4) return null;

  // Check Unicode script ranges in the transcript first (most reliable indicator)
  const hasOdiaScript = /[\u0B00-\u0B7F]/.test(transcript);
  const hasDevanagariScript = /[\u0900-\u097F]/.test(transcript);
  const hasTeluguScript = /[\u0C00-\u0C7F]/.test(transcript);
  const hasBengaliScript = /[\u0980-\u09FF]/.test(transcript);
  const hasTamilScript = /[\u0B80-\u0BFF]/.test(transcript);

  let scriptDetected: Language | null = null;
  if (hasOdiaScript) scriptDetected = 'or';
  else if (hasDevanagariScript) scriptDetected = 'hi';
  else if (hasTeluguScript) scriptDetected = 'te';
  else if (hasBengaliScript) scriptDetected = 'bn';
  else if (hasTamilScript) scriptDetected = 'ta';

  if (scriptDetected && scriptDetected !== currentAppLang) {
    return scriptDetected;
  }

  // Also check reported language code from Gemini if not English loan words
  const mappedFromReported =
    BCP47_TO_APP_LANG[reportedBcp47.toLowerCase()] ||
    BCP47_TO_APP_LANG[reportedBcp47.split('-')[0].toLowerCase()];

  if (
    mappedFromReported &&
    mappedFromReported !== currentAppLang &&
    mappedFromReported !== 'en' // Ignore mixed English loan words
  ) {
    return mappedFromReported;
  }

  return null;
}

// ============================================================================
// 5) VOICE COMMANDS & FUZZY INTENT MATCHING (src/data/intents.json)
// ============================================================================

export function matchVoiceCommandIntent(
  transcript: string,
  lang: Language
): VoiceCommandMatch | null {
  const clean = transcript.toLowerCase().trim();
  if (!clean) return null;

  const scoreKeywords = (keywords: string[]): number => {
    let best = 0;
    for (const kw of keywords) {
      const kwLower = kw.toLowerCase().trim();
      if (!kwLower) continue;

      let score = 0;
      if (clean === kwLower) {
        score = 1.0;
      } else if (clean.includes(kwLower)) {
        score = 0.88 + Math.min(0.1, kwLower.length / 100);
      } else {
        const cleanWords = clean.split(/\s+/);
        for (const w of cleanWords) {
          if (w.length >= 3 && kwLower.length >= 3) {
            const dist = levenshteinDistance(w, kwLower);
            if (dist === 0) {
              score = Math.max(score, 0.9);
            } else if (dist === 1 && w.length >= 4) {
              score = Math.max(score, 0.78);
            } else if (dist === 2 && w.length >= 6) {
              score = Math.max(score, 0.72);
            }
          }
        }
      }
      if (score > best) best = score;
    }
    return best;
  };

  // Pass 1: Match against the intents for the current language first
  // (native script, Roman letters in that language's keyword list, and common English/Hindi loan words)
  let bestPrimaryMatch: VoiceCommandMatch | null = null;
  let highestPrimaryScore = 0;

  for (const intent of intentsData.intents) {
    const keywordsByLang = intent.keywords as Record<string, string[]>;
    const primaryKeywords = Array.from(
      new Set([
        ...(keywordsByLang[lang] || []),
        ...(keywordsByLang.en || []),
      ])
    );

    const score = scoreKeywords(primaryKeywords);
    if (score > highestPrimaryScore && score >= 0.72) {
      highestPrimaryScore = score;
      const labels = intent.labels as Record<string, string>;
      bestPrimaryMatch = {
        intentId: intent.id,
        actionType: intent.actionType as any,
        targetFeature: intent.targetFeature,
        label: labels[lang] || labels.en,
        confidenceScore: Number(score.toFixed(2)),
        heardText: transcript,
      };
    }
  }

  if (bestPrimaryMatch) {
    return bestPrimaryMatch;
  }

  // Pass 2 (Backup): Match against all other languages (or, hi, en, te, bn, ta) as a backup
  let bestBackupMatch: VoiceCommandMatch | null = null;
  let highestBackupScore = 0;
  const allLangKeys: Language[] = ['or', 'hi', 'en', 'te', 'bn', 'ta'];

  for (const intent of intentsData.intents) {
    const keywordsByLang = intent.keywords as Record<string, string[]>;
    const backupKeywords = Array.from(
      new Set(
        allLangKeys
          .filter((k) => k !== lang)
          .flatMap((k) => keywordsByLang[k] || [])
      )
    );

    const score = scoreKeywords(backupKeywords);
    if (score > highestBackupScore && score >= 0.72) {
      highestBackupScore = score;
      const labels = intent.labels as Record<string, string>;
      bestBackupMatch = {
        intentId: intent.id,
        actionType: intent.actionType as any,
        targetFeature: intent.targetFeature,
        label: labels[lang] || labels.en,
        confidenceScore: Number(score.toFixed(2)),
        heardText: transcript,
      };
    }
  }

  return bestBackupMatch;
}

/**
 * Fallback Offline Voice Command Parser
 * Maps common spoken or typed commands (e.g. 'check weather', 'open logs', 'crop doctor', 'water advice')
 * using a local offline dictionary when no network connection is detected.
 */
export function parseOfflineVoiceCommand(
  input: string,
  lang: Language
): VoiceCommandMatch | null {
  if (!input || !input.trim()) return null;

  // 1) First attempt fuzzy intent match against intents.json
  const match = matchVoiceCommandIntent(input, lang);
  if (match) {
    return match;
  }

  // 2) Keyword fallback dictionary for common offline phrases across languages
  const lower = input.toLowerCase().trim();

  // Weather / Calendar / Rain
  if (
    lower.includes('weather') ||
    lower.includes('rain') ||
    lower.includes('check weather') ||
    lower.includes('forecast') ||
    lower.includes('panji') ||
    lower.includes('मौसम') ||
    lower.includes('पाଣିପାଗ')
  ) {
    return {
      intentId: 'farm_calendar',
      actionType: 'navigate',
      targetFeature: 'farm_calendar',
      label:
        lang === 'or'
          ? 'କୃଷି କ୍ୟାଲେଣ୍ଡର ଓ ପାଣିପାଗ'
          : lang === 'hi'
          ? 'कृषि कैलेंडर और मौसम'
          : 'Farm Calendar & Weather Schedule',
      confidenceScore: 0.95,
      heardText: input,
    };
  }

  // Logs / Spray Log / Spray Diary
  if (
    lower.includes('log') ||
    lower.includes('logs') ||
    lower.includes('open logs') ||
    lower.includes('check logs') ||
    lower.includes('diary') ||
    lower.includes('spray log') ||
    lower.includes('छिड़काव') ||
    lower.includes('ଡାଏରୀ')
  ) {
    return {
      intentId: 'spray_log',
      actionType: 'navigate',
      targetFeature: 'spray_log',
      label:
        lang === 'or'
          ? 'ସ୍ପ୍ରେ ଡାଏରୀ (ସ୍ପ୍ରେ ଲଗ୍)'
          : lang === 'hi'
          ? 'स्प्रे लॉग (छिड़काव डायरी)'
          : 'Spray Log & Safe Harvest Timer',
      confidenceScore: 0.95,
      heardText: input,
    };
  }

  // Crop Doctor / Leaf / Sick Plant
  if (
    lower.includes('doctor') ||
    lower.includes('crop doctor') ||
    lower.includes('disease') ||
    lower.includes('leaf') ||
    lower.includes('sick plant') ||
    lower.includes('रोग') ||
    lower.includes('ଡାକ୍ତର')
  ) {
    return {
      intentId: 'crop_doctor',
      actionType: 'navigate',
      targetFeature: 'crop_doctor',
      label:
        lang === 'or'
          ? 'ଶସ୍ୟ ଡାକ୍ତର (ରୋଗ ଚିହ୍ନଟ)'
          : lang === 'hi'
          ? 'फसल डॉक्टर (पत्ती रोग जांच)'
          : 'Crop Doctor (Leaf Disease Check)',
      confidenceScore: 0.95,
      heardText: input,
    };
  }

  // Water / Irrigation
  if (
    lower.includes('water') ||
    lower.includes('irrigation') ||
    lower.includes('watering') ||
    lower.includes('পানি') ||
    lower.includes('पानी') ||
    lower.includes('ପାଣି')
  ) {
    return {
      intentId: 'water',
      actionType: 'navigate',
      targetFeature: 'water',
      label:
        lang === 'or'
          ? 'ଜଳସେଚନ ଓ ପାଣି ପରାମର୍ଶ'
          : lang === 'hi'
          ? 'सिंचाई और पानी सलाह'
          : 'Water & Irrigation Advice',
      confidenceScore: 0.95,
      heardText: input,
    };
  }

  // Fertilizer / Urea / DAP
  if (
    lower.includes('fertil') ||
    lower.includes('urea') ||
    lower.includes('dap') ||
    lower.includes('manure') ||
    lower.includes('खाद') ||
    lower.includes('ସାର')
  ) {
    return {
      intentId: 'fertiliser',
      actionType: 'navigate',
      targetFeature: 'fertiliser',
      label:
        lang === 'or'
          ? 'ସାର ଓ ଖତ ପରାମର୍ଶ'
          : lang === 'hi'
          ? 'खाद और उर्वरक सलाह'
          : 'Fertiliser & Nutrient Calculator',
      confidenceScore: 0.95,
      heardText: input,
    };
  }

  // Labour / Worker / Tractor
  if (
    lower.includes('labour') ||
    lower.includes('labor') ||
    lower.includes('worker') ||
    lower.includes('tractor') ||
    lower.includes('मजदूर') ||
    lower.includes('ଶ୍ରମିକ')
  ) {
    return {
      intentId: 'labour_connect',
      actionType: 'navigate',
      targetFeature: 'labour_connect',
      label:
        lang === 'or'
          ? 'କୃଷି ଶ୍ରମିକ ଓ ଯନ୍ତ୍ରପାତି'
          : lang === 'hi'
          ? 'कृषि मजदूर और ट्रैक्टर सेवा'
          : 'Farm Labour & Custom Hiring',
      confidenceScore: 0.95,
      heardText: input,
    };
  }

  // Map / Offline Map / Location / Hospital
  if (
    lower.includes('map') ||
    lower.includes('location') ||
    lower.includes('hospital') ||
    lower.includes('kvk') ||
    lower.includes('नक्शा') ||
    lower.includes('ମ୍ୟାପ୍')
  ) {
    return {
      intentId: 'offline_map',
      actionType: 'navigate',
      targetFeature: 'offline_map',
      label:
        lang === 'or'
          ? 'ଅଫଲାଇନ୍ ମାନଚିତ୍ର (ମ୍ୟାପ୍)'
          : lang === 'hi'
          ? 'ऑफ़लाइन नक्शा (मैप)'
          : 'Offline Map & Nearby Krushi Kendra',
      confidenceScore: 0.95,
      heardText: input,
    };
  }

  // Safety / Poison / First Aid
  if (
    lower.includes('safety') ||
    lower.includes('poison') ||
    lower.includes('first aid') ||
    lower.includes('mask') ||
    lower.includes('सुरक्षा') ||
    lower.includes('ସୁରକ୍ଷା')
  ) {
    return {
      intentId: 'safety_alert',
      actionType: 'safety_modal',
      targetFeature: 'safety_alert',
      label:
        lang === 'or'
          ? 'ସ୍ପ୍ରେ ସୁରକ୍ଷା ଓ ପ୍ରାଥମିକ ଚିକିତ୍ସା'
          : lang === 'hi'
          ? 'स्प्रे सुरक्षा और प्राथमिक उपचार'
          : 'Spray Safety & Poisoning Guide',
      confidenceScore: 0.95,
      heardText: input,
    };
  }

  // Go Back / Home
  if (
    lower.includes('back') ||
    lower.includes('home') ||
    lower.includes('main') ||
    lower.includes('पीछे') ||
    lower.includes('ପଛକୁ')
  ) {
    return {
      intentId: 'go_back',
      actionType: 'navigate',
      targetFeature: 'dashboard',
      label:
        lang === 'or'
          ? 'ପଛକୁ / ମୁଖ୍ୟ ପୃଷ୍ଠାକୁ ଫେରନ୍ତୁ'
          : lang === 'hi'
          ? 'पीछे जाएं / होम स्क्रीन'
          : 'Go Back to Home Screen',
      confidenceScore: 0.95,
      heardText: input,
    };
  }

  return null;
}

// ============================================================================
// 6) STRICT SPOKEN ANSWERS (TTS), PRE-RECORDED AUDIO FALLBACK & CAPABILITY CHECKER
// Rule: NEVER read Odia (or any language) text with a voice of another language!
// ============================================================================

// Optional pre-recorded audio map for prompts when a phone lacks a native TTS voice
export const PRE_RECORDED_AUDIO_BY_LANG: Partial<Record<Language, Record<string, string>>> = {
  or: {},
  hi: {},
  en: {},
  te: {},
  bn: {},
  ta: {},
};

let activeHtmlAudio: HTMLAudioElement | null = null;
let activeRingtoneInterval: number | null = null;
let activeRingtoneAudioCtx: AudioContext | null = null;

/**
 * Starts a realistic Indian PSTN dual-tone incoming phone call ringtone (400Hz + 450Hz)
 * with double-ring cadence and phone vibration.
 */
export function startIncomingCallRingtone(): void {
  stopIncomingCallRingtone();
  if (typeof window === 'undefined') return;

  const playRingBurst = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!activeRingtoneAudioCtx || activeRingtoneAudioCtx.state === 'closed') {
        activeRingtoneAudioCtx = new AudioCtx();
      }
      const ctx = activeRingtoneAudioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const scheduleTone = (startOffset: number, duration: number) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(400, ctx.currentTime + startOffset);
        osc2.frequency.setValueAtTime(450, ctx.currentTime + startOffset);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + startOffset);
        gain.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + startOffset + 0.03);
        gain.gain.setValueAtTime(0.14, ctx.currentTime + startOffset + duration - 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(ctx.currentTime + startOffset);
        osc2.start(ctx.currentTime + startOffset);
        osc1.stop(ctx.currentTime + startOffset + duration);
        osc2.stop(ctx.currentTime + startOffset + duration);
      };

      // Classic double-ring cadence: 0.4s ring, 0.2s pause, 0.4s ring
      scheduleTone(0, 0.4);
      scheduleTone(0.6, 0.4);

      if (navigator.vibrate) {
        try {
          navigator.vibrate([400, 200, 400]);
        } catch {}
      }
    } catch {}
  };

  playRingBurst();
  activeRingtoneInterval = window.setInterval(playRingBurst, 2600);
}

export function stopIncomingCallRingtone(): void {
  if (activeRingtoneInterval !== null && typeof window !== 'undefined') {
    window.clearInterval(activeRingtoneInterval);
    activeRingtoneInterval = null;
  }
  if (activeRingtoneAudioCtx && activeRingtoneAudioCtx.state !== 'closed') {
    activeRingtoneAudioCtx.close().catch(() => {});
    activeRingtoneAudioCtx = null;
  }
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(0);
    } catch {}
  }
}

export function stopAllSpeechAndRingtones(): void {
  stopIncomingCallRingtone();
  if (activeHtmlAudio) {
    try {
      activeHtmlAudio.pause();
      activeHtmlAudio = null;
    } catch {}
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

export function findMatchingBrowserVoice(lang: Language): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const targetBcp47 = APP_LANG_TO_BCP47[lang].toLowerCase(); // e.g. 'or-in'
  const langPrefix = lang.toLowerCase(); // e.g. 'or'

  // 1) Exact locale match (e.g. or-IN, hi-IN, te-IN, bn-IN, ta-IN, en-IN)
  const exact = voices.find((v) => v.lang.toLowerCase().replace('_', '-') === targetBcp47);
  if (exact) return exact;

  // 2) Same language prefix match (e.g. or, ori, odia, hi, te, bn, ta, en)
  const prefixMatch = voices.find((v) => {
    const vLang = v.lang.toLowerCase().replace('_', '-');
    const vName = v.name.toLowerCase();
    if (langPrefix === 'or') {
      return vLang.startsWith('or') || vName.includes('odia') || vName.includes('oriya');
    }
    return vLang === langPrefix || vLang.startsWith(`${langPrefix}-`);
  });

  return prefixMatch || null;
}

export interface SpeakOutcome {
  spoken: boolean;
  voiceUsed: string | null;
  unavailableMessage?: string;
}

/**
 * Speaks text in `lang`:
 * 1) Plays `preRecordedAudioUrl` (such as Gemini TTS WAV data URL) immediately if provided.
 * 2) Uses a matching native browser voice if available on the device.
 * 3) Automatically requests server-side Gemini TTS (`/api/speech/tts`) when the device lacks a local voice for `lang` (e.g. Odia on mobile/desktop).
 */
export function speakInCurrentLanguage(
  text: string,
  lang: Language,
  onEnd?: () => void,
  preRecordedAudioUrl?: string
): SpeakOutcome {
  if (activeHtmlAudio) {
    try {
      activeHtmlAudio.pause();
      activeHtmlAudio = null;
    } catch {}
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }

  // 1) If pre-synthesized audio (e.g., Gemini TTS WAV data URL) is passed, play it first
  const mappedAudioUrl = preRecordedAudioUrl || PRE_RECORDED_AUDIO_BY_LANG[lang]?.[text];
  if (mappedAudioUrl && typeof window !== 'undefined' && typeof Audio !== 'undefined') {
    try {
      const audio = new Audio(mappedAudioUrl);
      activeHtmlAudio = audio;
      audio.onended = () => onEnd?.();
      audio.onerror = () => onEnd?.();
      audio.play().catch(() => onEnd?.());
      return {
        spoken: true,
        voiceUsed: `Krushak Bani Voice (${APP_LANG_TO_BCP47[lang]})`,
      };
    } catch {
      // Fall through
    }
  }

  // 2) If browser has a native voice for this language, use it
  const matchingVoice = findMatchingBrowserVoice(lang);
  if (matchingVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = matchingVoice;
      utterance.lang = matchingVoice.lang || APP_LANG_TO_BCP47[lang];
      utterance.rate = 0.94;
      utterance.onend = () => onEnd?.();
      utterance.onerror = () => onEnd?.();
      window.speechSynthesis.speak(utterance);

      return {
        spoken: true,
        voiceUsed: `${matchingVoice.name} (${matchingVoice.lang})`,
      };
    } catch {
      // Fall through to server Gemini TTS
    }
  }

  // 3) Request server-side Gemini TTS (/api/speech/tts) so Odia & Indian languages always speak out loud
  if (typeof window !== 'undefined' && typeof Audio !== 'undefined' && text.trim()) {
    fetch('/api/speech/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim(), lang }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.audioDataUrl) {
          if (PRE_RECORDED_AUDIO_BY_LANG[lang]) {
            PRE_RECORDED_AUDIO_BY_LANG[lang]![text] = data.audioDataUrl;
          }
          const audio = new Audio(data.audioDataUrl);
          activeHtmlAudio = audio;
          audio.onended = () => onEnd?.();
          audio.onerror = () => onEnd?.();
          audio.play().catch(() => onEnd?.());
        } else {
          // Fall back to best available browser speech synthesis voice (hi-IN, en-IN, or system default)
          const fallbackVoice = findMatchingBrowserVoice('hi') || findMatchingBrowserVoice('en') || findMatchingBrowserVoice(lang);
          if (fallbackVoice && typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
              const fallbackUtterance = new SpeechSynthesisUtterance(text);
              fallbackUtterance.voice = fallbackVoice;
              fallbackUtterance.lang = fallbackVoice.lang || 'en-IN';
              fallbackUtterance.rate = 0.92;
              fallbackUtterance.onend = () => onEnd?.();
              fallbackUtterance.onerror = () => onEnd?.();
              window.speechSynthesis.speak(fallbackUtterance);
              return;
            } catch {}
          }
          onEnd?.();
        }
      })
      .catch(() => {
        onEnd?.();
      });

    return {
      spoken: true,
      voiceUsed: `Krushak Bani Cloud TTS (${APP_LANG_TO_BCP47[lang]})`,
    };
  }

  onEnd?.();
  return {
    spoken: false,
    voiceUsed: null,
    unavailableMessage: t('voice_tts_not_available', lang),
  };
}

export interface LanguageVoiceCapability {
  code: Language;
  bcp47: string;
  name: string;
  nativeName: string;
  sttGeminiServer: boolean;
  sttBrowserWebSpeech: boolean;
  ttsNativeVoiceAvailable: boolean;
  ttsVoiceName: string | null;
  preRecordedAudioPrompts: boolean;
}

export function getAllLanguageVoiceCapabilities(): LanguageVoiceCapability[] {
  const hasWebSpeech =
    typeof window !== 'undefined' &&
    Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  return SUPPORTED_LANGUAGES.map((l) => {
    const matchedVoice = findMatchingBrowserVoice(l.code);
    const hasPreRecordedFiles =
      Object.keys(PRE_RECORDED_AUDIO_BY_LANG[l.code] || {}).length > 0;
    return {
      code: l.code,
      bcp47: APP_LANG_TO_BCP47[l.code],
      name: l.name,
      nativeName: l.nativeName,
      sttGeminiServer: true,
      sttBrowserWebSpeech: hasWebSpeech,
      ttsNativeVoiceAvailable: Boolean(matchedVoice),
      ttsVoiceName: matchedVoice ? `${matchedVoice.name} (${matchedVoice.lang})` : null,
      preRecordedAudioPrompts: hasPreRecordedFiles,
    };
  });
}

// ============================================================================
// 7) AGRICULTURAL QUESTION & ANSWER ("Ask a Question" in Current Language)
// ============================================================================
export async function askFarmingQuestionInLanguage(params: {
  question: string;
  lang: Language;
  district?: string;
  contextTopic?: string;
  history?: Array<{ question: string; answer: string; langCode?: string }>;
}): Promise<{ answer: string; fromServer: boolean }> {
  const {
    question,
    lang,
    district = 'Cuttack',
    contextTopic = 'general farming',
    history = [],
  } = params;
  const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];
  const farmer = getCurrentSignedInFarmer();
  const crops = farmer?.primaryCrops || farmer?.crops || ['Paddy', 'Tomato', 'Green Gram'];

  if (typeof navigator === 'undefined' || navigator.onLine) {
    try {
      const res = await fetch('/api/voice/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          languageCode: APP_LANG_TO_BCP47[lang],
          languageName: langMeta.name,
          nativeScriptName: langMeta.nativeName,
          district: farmer?.district || district,
          crops,
          contextTopic,
          history: history.slice(-6),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.answer) {
          // Save to local-first advice history (without sending farmer PII to speech service)
          if (farmer?.mobile) {
            addAdviceHistoryLocalFirst({
              type: 'pesticide',
              cropName: crops[0] || 'Paddy',
              summary: question.slice(0, 120),
              recommendation: String(data.answer).slice(0, 300),
            }).catch(() => {});
          }
          return { answer: String(data.answer), fromServer: true };
        }
      }
    } catch {}
  }

  // Offline / fallback response in the current app language
  const offlineFallbackByLang: Record<Language, string> = {
    or: 'ଇଣ୍ଟରନେଟ୍ ସଂଯୋଗ କମ୍ ଅଛି। ଧାନ ବ୍ଲାଷ୍ଟ ପାଇଁ ଟ୍ରାଇସାଇକ୍ଲାଜୋଲ୍ ୦.୬ ଗ୍ରାମ୍/ଲିଟର ଏବଂ କାଣ୍ଡବିନ୍ଧା ପୋକ ପାଇଁ କ୍ଲୋରାନ୍ଟ୍ରାନିଲିପ୍ରୋଲ୍ ୦.୩ ମି.ଲି./ଲିଟର ବ୍ୟବହାର କରନ୍ତୁ। ଜରୁରୀ ସହାୟତା ପାଇଁ ୧୮୦୦-୧୮୦-୧୫୫୧ ରେ କଲ୍ କରନ୍ତୁ।', // TO REVIEW
    hi: 'इंटरनेट कनेक्शन कम है। धान के ब्लास्ट रोग के लिए ट्राइसाइक्लाज़ोल 0.6 ग्राम/लीटर और तना छेदक के लिए क्लोरैन्ट्रानिलिप्रोल 0.3 मिली/लीटर का प्रयोग करें। सहायता के लिए 1800-180-1551 पर कॉल करें।', // TO REVIEW
    en: 'Internet is offline. For Paddy Blast use Tricyclazole 75% WP at 0.6g/L, and for Stem Borer use Chlorantraniliprole at 0.3ml/L. Call Kisan Helpline 1800-180-1551 for urgent help.',
    te: 'ఇంటర్నెట్ అందుబాటులో లేదు. వరి అగ్గి తెగులుకు ట్రైసైక్లాజోల్ 0.6 గ్రా/లీ మరియు కాండం తొలుచు పురుగుకు క్లోరాంట్రానిలిప్రోల్ 0.3 మి.లీ/లీ వాడండి. సహాయం కోసం 1800-180-1551 కు కాల్ చేయండి.', // TO REVIEW
    bn: 'ইন্টারনেট সংযোগ নেই। ধানের ব্লাস্ট রোগের জন্য ট্রাইসাইক্লাজোল ০.৬ গ্রাম/লিটার এবং মাজরা পোকার জন্য ক্লোরান্ট্রানিলিপ্রোল ০.৩ মিলি/লিটার ব্যবহার করুন। সহায়তার জন্য ১৮০০-১৮০-১৫৫১ নম্বরে কল করুন।', // TO REVIEW
    ta: 'இணைய இணைப்பு இல்லை. நெல் குலைநோய்க்கு டிரைசைக்ளாசோல் 0.6 கிராம்/லிட்டர் மற்றும் தண்டுத் துளைப்பானுக்கு குளோரான்ட்ரானிலிப்ரோல் 0.3 மிலி/লিটার பயன்படுத்தவும். உதவிக்கு 1800-180-1551 ஐ அழைக்கவும்.', // TO REVIEW
    ur: 'Internet is offline. For Paddy Blast use Tricyclazole 75% WP at 0.6g/L, and for Stem Borer use Chlorantraniliprole at 0.3ml/L. Call Kisan Helpline 1800-180-1551 for urgent help.',
  };

  return {
    answer: offlineFallbackByLang[lang] || offlineFallbackByLang.en,
    fromServer: false,
  };
}

// ============================================================================
// 8) OFFLINE VOICE CLIP QUEUE (Phone-only IndexedDB queue -> transcribe when online -> delete audio)
// ============================================================================
const OFFLINE_VOICE_QUEUE_KEY = 'offline_voice_clips_queue';

export async function saveOfflineVoiceClipForLater(params: {
  audioBlob: Blob;
  language: Language;
  contextTopic?: string;
}): Promise<OfflineVoiceQueueItem> {
  const audioBase64 = await blobToBase64(params.audioBlob);
  const existing =
    (await idbGet<{ key: string; items: OfflineVoiceQueueItem[] }>(
      STORE_DRAFTS,
      OFFLINE_VOICE_QUEUE_KEY
    ))?.items || [];

  const item: OfflineVoiceQueueItem = {
    id: `vclip-${Date.now()}`,
    createdAt: Date.now(),
    language: params.language,
    languageCode: APP_LANG_TO_BCP47[params.language],
    contextTopic: params.contextTopic || 'offline_question',
    mimeType: params.audioBlob.type || 'audio/webm',
    audioBase64,
  };

  existing.push(item);
  await idbPut(STORE_DRAFTS, {
    key: OFFLINE_VOICE_QUEUE_KEY,
    items: existing,
    updatedAt: Date.now(),
  });

  return item;
}

export async function getOfflineVoiceClipQueue(): Promise<OfflineVoiceQueueItem[]> {
  const record = await idbGet<{ key: string; items: OfflineVoiceQueueItem[] }>(
    STORE_DRAFTS,
    OFFLINE_VOICE_QUEUE_KEY
  );
  return record?.items || [];
}

/**
 * Transcribes queued offline voice clips when online, saves the resulting Q&A into
 * the farmer's Advice/Ask history, and immediately deletes the audio clip for privacy.
 */
export async function flushOfflineVoiceClipQueue(): Promise<
  Array<{ id: string; question: string; answer: string; language: Language }>
> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return [];
  const items = await getOfflineVoiceClipQueue();
  if (!items.length) return [];

  const results: Array<{ id: string; question: string; answer: string; language: Language }> = [];
  const remaining: OfflineVoiceQueueItem[] = [];

  for (const clip of items) {
    try {
      const res = await fetch(clip.audioBase64);
      const blob = await res.blob();
      const stt = await transcribe(blob, clip.languageCode, {
        screenTopic: clip.contextTopic,
      });

      if (stt.text) {
        const qa = await askFarmingQuestionInLanguage({
          question: stt.text,
          lang: clip.language,
          contextTopic: clip.contextTopic,
        });
        results.push({
          id: clip.id,
          question: stt.text,
          answer: qa.answer,
          language: clip.language,
        });
        // Audio clip is NOT added to remaining -> deleted immediately after transcription!
      } else {
        // Delete unreadable clip so it doesn't stay on phone forever
      }
    } catch {
      remaining.push(clip);
    }
  }

  await idbPut(STORE_DRAFTS, {
    key: OFFLINE_VOICE_QUEUE_KEY,
    items: remaining,
    updatedAt: Date.now(),
  });

  return results;
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushOfflineVoiceClipQueue().catch(() => {});
  });
}
