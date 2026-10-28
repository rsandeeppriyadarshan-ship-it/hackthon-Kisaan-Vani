import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { voiceService, ODIA_AUDIO_SCRIPTS } from '../../services/voiceService';
import { AudioPlayerCard } from '../common/AudioPlayerCard';
import { ShieldCheck, Volume2, VolumeX, CheckCircle, AlertTriangle, Wind, Droplets, Eye, X } from 'lucide-react';

interface SafetyAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onProceedToLog?: () => void;
}

export const SafetyAlertModal: React.FC<SafetyAlertModalProps> = ({
  isOpen,
  onClose,
  lang,
  onProceedToLog,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [checkedItems, setCheckedItems] = useState({
    mask: false,
    gloves: false,
    wind: false,
    notEmptyStomach: false,
  });

  const script = ODIA_AUDIO_SCRIPTS.spray_safety_checklist;

  useEffect(() => {
    if (isOpen) {
      // Auto-play audio checklist when opened as requested
      handlePlayAudio();
    } else {
      voiceService.stopSpeaking();
      setIsPlaying(false);
    }
  }, [isOpen]);

  const handlePlayAudio = () => {
    setIsPlaying(true);
    const textToSpeak = lang === 'or' ? script.odia_text : script.english_text;
    voiceService.speak(textToSpeak, lang, () => {
      setIsPlaying(false);
    });
  };

  const handleStopAudio = () => {
    voiceService.stopSpeaking();
    setIsPlaying(false);
  };

  const toggleCheck = (key: keyof typeof checkedItems) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allChecked = Object.values(checkedItems).every(Boolean);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border-2 border-amber-400 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-900 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700">
                {lang === 'or' ? 'ଅତ୍ୟାବଶ୍ୟକୀୟ ସୁରକ୍ଷା ଚେତାବନୀ' : 'MANDATORY SAFETY ALERT'}
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-stone-900 leading-tight mt-0.5">
                {lang === 'or' ? script.title_or : script.title_en}
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              handleStopAudio();
              onClose();
            }}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Player with Interactive Progress Bar */}
        {/* Audio Player with Interactive Progress Bar */}
        <div className="mt-4">
          <AudioPlayerCard
            title={lang === 'or' ? 'ଓଡ଼ିଆ କଣ୍ଠ ସୁରକ୍ଷା ନିର୍ଦ୍ଦେଶ (Voice Checklist)' : 'Audio Safety Narration'}
            subtitle={lang === 'or' ? 'ସ୍ପ୍ରେ ପୂର୍ବରୁ ଧ୍ୟାନ ଦେଇ ଶୁଣନ୍ତୁ' : 'Official OUAT farmer safety guidelines'}
            textToSpeak={lang === 'or' ? script.odia_text : script.english_text}
            lang={lang}
            accentColor="amber"
            autoPlay={true}
          />
        </div>

        {/* Visual PPE & Safety Checklist */}
        <div className="mt-4 text-left">
          <p className="text-xs font-bold text-stone-700 mb-2">
            {lang === 'or' ? 'ସ୍ପ୍ରେ ପୂର୍ବରୁ ସୁରକ୍ଷା ଯାଞ୍ଚ କରନ୍ତୁ:' : 'Pre-Spray Safety Checklist:'}
          </p>
          <div className="space-y-2">
            {/* Checklist Item 1 */}
            <div
              onClick={() => toggleCheck('mask')}
              className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                checkedItems.mask
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {lang === 'or'
                    ? 'ମୁହଁରେ ମାସ୍କ ଏବଂ ଆଖିରେ ସୁରକ୍ଷା ଚଷମା ପିନ୍ଧିଛି'
                    : 'Wearing Face Mask & Eye Protection Goggles'}
                </span>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${checkedItems.mask ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300'}`}>
                {checkedItems.mask && <CheckCircle className="w-4 h-4" />}
              </div>
            </div>

            {/* Checklist Item 2 */}
            <div
              onClick={() => toggleCheck('gloves')}
              className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                checkedItems.gloves
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Droplets className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {lang === 'or'
                    ? 'ହାତରେ ରବର ମୋଜା (Gloves) ଓ ଗୋଡ଼ରେ ବୁଟ୍ ଜୋତା ପିନ୍ଧିଛି'
                    : 'Wearing Chemical Gloves & Field Rubber Boots'}
                </span>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${checkedItems.gloves ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300'}`}>
                {checkedItems.gloves && <CheckCircle className="w-4 h-4" />}
              </div>
            </div>

            {/* Checklist Item 3 */}
            <div
              onClick={() => toggleCheck('wind')}
              className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                checkedItems.wind
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Wind className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {lang === 'or'
                    ? 'ପବନର ପଛ ପଟୁ ସ୍ପ୍ରେ କରିବି (ପବନ ମୁହଁରେ କଦାପି ନୁହେଁ)'
                    : 'Spraying with Wind at my Back (Never facing the wind)'}
                </span>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${checkedItems.wind ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300'}`}>
                {checkedItems.wind && <CheckCircle className="w-4 h-4" />}
              </div>
            </div>

            {/* Checklist Item 4 */}
            <div
              onClick={() => toggleCheck('notEmptyStomach')}
              className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                checkedItems.notEmptyStomach
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {lang === 'or'
                    ? 'ଖାଲି ପେଟରେ ନୁହେଁ ଏବଂ ସ୍ପ୍ରେ ବେଳେ ଖାଇବା/ଧୂମପାନ କରିବି ନାହିଁ'
                    : 'Not on Empty Stomach & Zero Eating/Smoking while spraying'}
                </span>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${checkedItems.notEmptyStomach ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300'}`}>
                {checkedItems.notEmptyStomach && <CheckCircle className="w-4 h-4" />}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-stone-200 flex flex-col sm:flex-row gap-2">
          {onProceedToLog && (
            <button
              onClick={() => {
                handleStopAudio();
                onClose();
                onProceedToLog();
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md transition-colors"
            >
              {lang === 'or' ? 'ସ୍ପ୍ରେ ଲଗ୍ ରେ ଯୋଡ଼ନ୍ତୁ (Record in Log)' : 'Record in Spray Log'}
            </button>
          )}
          <button
            onClick={() => {
              handleStopAudio();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-semibold transition-colors"
          >
            {lang === 'or' ? 'ବନ୍ଦ କରନ୍ତୁ' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
