/**
 * Voice Command, Audio Scripts & Strict TTS Service Adapter
 * Delegates to SpeechService.ts so all voice features share a single source of truth
 * and NEVER read Odia (or any language) text with a different language's voice.
 */

import { Language, VoiceIntent } from '../types';
import {
  matchVoiceCommandIntent,
  parseOfflineVoiceCommand,
  speakInCurrentLanguage,
  SpeakOutcome,
} from './SpeechService';

export interface AudioScriptItem {
  id: string;
  title_en: string;
  title_or: string;
  odia_text: string;
  english_text: string;
}

export const ODIA_AUDIO_SCRIPTS: Record<
  'spray_safety_checklist' | 'poisoning_emergency' | 'snakebite_first_aid',
  AudioScriptItem
> = {
  spray_safety_checklist: {
    id: 'spray_safety_checklist',
    title_en: 'Pre-Spray Personal Safety Checklist',
    title_or: 'ସ୍ପ୍ରେ ପୂର୍ବରୁ ବ୍ୟକ୍ତିଗତ ସୁରକ୍ଷା ତାଲିକା', // TO REVIEW
    odia_text:
      'ସ୍ପ୍ରେ କରିବା ପୂର୍ବରୁ ମୁହଁରେ ମାସ୍କ, ହାତରେ ଗ୍ଲୋଭସ୍ ଏବଂ ଆଖିରେ ଚଷମା ପିନ୍ଧନ୍ତୁ। ଖାଲି ପେଟରେ କିମ୍ବା ପ୍ରବଳ ପବନ ବିପରୀତ ଦିଗରେ କେବେବି କୀଟନାଶକ ସ୍ପ୍ରେ କରନ୍ତୁ ନାହିଁ।', // TO REVIEW
    english_text:
      'Before spraying, always wear a face mask, hand gloves, and eye protection. Never spray on an empty stomach or against strong wind.',
  },
  poisoning_emergency: {
    id: 'poisoning_emergency',
    title_en: 'Pesticide Poisoning First-Aid Protocol',
    title_or: 'କୀଟନାଶକ ବିଷକ୍ରିୟା ପ୍ରାଥମିକ ଚିକିତ୍ସା', // TO REVIEW
    odia_text:
      'କୀଟନାଶକ ଦେହରେ ଲାଗିଲେ ତୁରନ୍ତ ସଫା ପାଣି ଓ ସାବୁନରେ ୧୫ ମିନିଟ୍ ଧୋଇ ଦିଅନ୍ତୁ। ରୋଗୀଙ୍କୁ ଖୋଲା ପବନକୁ ଆଣନ୍ତୁ, କୀଟନାଶକ ବୋତଲ ସାଙ୍ଗରେ ଧରି ତୁରନ୍ତ ୧୦୮ ଆମ୍ବୁଲାନ୍ସ ଡାକନ୍ତୁ।', // TO REVIEW
    english_text:
      'If pesticide touches skin or eyes, wash immediately with clean running water for 15 minutes. Move the person to fresh air and call 108 ambulance with the chemical bottle.',
  },
  snakebite_first_aid: {
    id: 'snakebite_first_aid',
    title_en: 'Snakebite Life-Saving First Aid',
    title_or: 'ସାପ କାମୁଡ଼ା ଜୀବନ ରକ୍ଷାକାରୀ ପ୍ରାଥମିକ ଚିକିତ୍ସା', // TO REVIEW
    odia_text:
      'ସାପ କାମୁଡ଼ିଲେ ଭୟଭୀତ ହୁଅନ୍ତୁ ନାହିଁ। କାମୁଡ଼ିଥିବା ଅଙ୍ଗକୁ ହଲଚଲ କରନ୍ତୁ ନାହିଁ, କୌଣସି କଷି ବାନ୍ଧନ୍ତୁ ନାହିଁ କିମ୍ବା ବ୍ଲେଡ୍ ରେ କାଟନ୍ତୁ ନାହିଁ। ତୁରନ୍ତ ୧୦୮ କୁ କଲ୍ କରି ସରକାରୀ ଡାକ୍ତରଖାନାକୁ ନିଅନ୍ତୁ।', // TO REVIEW
    english_text:
      'Stay calm after a snakebite. Immobilize the bitten limb, do not tie tight tourniquets or cut the wound, and call 108 immediately for free Anti-Snake Venom at the nearest government hospital.',
  },
};

export function parseVoiceCommand(transcript: string, lang: Language = 'or'): VoiceIntent {
  const matched = parseOfflineVoiceCommand(transcript, lang) || matchVoiceCommandIntent(transcript, lang);
  if (matched) {
    return {
      intent: matched.intentId as any,
      confidence: matched.confidenceScore,
      action_label_en: matched.label,
      action_label_or: matched.label,
      target_feature: matched.targetFeature,
    };
  }

  return {
    intent: 'unknown',
    confidence: 0.3,
    action_label_en: 'Command not recognized',
    action_label_or: 'ନିର୍ଦ୍ଦେଶ ବୁଝାପଡ଼ିଲା ନାହିଁ', // TO REVIEW
    target_feature: 'dashboard',
  };
}

export function speakText(
  text: string,
  lang: Language,
  onEnd?: () => void
): SpeakOutcome {
  return speakInCurrentLanguage(text, lang, onEnd);
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

export function playChime(type: 'start' | 'end' | 'alert' | 'ping' | 'success' = 'ping'): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value =
      type === 'alert' ? 660 : type === 'start' ? 520 : type === 'end' ? 440 : 580;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.start();
    osc.stop(ctx.currentTime + 0.18);
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 250);
  } catch {}
}

export const voiceService = {
  speak: speakText,
  stopSpeaking,
  playChime,
  parseCommand: parseVoiceCommand,
};
