import React from 'react';
import { Language } from '../../types';
import { ODIA_AUDIO_SCRIPTS } from '../../services/voiceService';
import { AudioPlayerCard } from '../common/AudioPlayerCard';
import { Skull, PhoneCall, AlertTriangle, Droplets, Wind, ShieldAlert, ArrowRight } from 'lucide-react';

interface PoisoningGuideProps {
  lang: Language;
}

export const PoisoningGuide: React.FC<PoisoningGuideProps> = ({ lang }) => {
  const script = ODIA_AUDIO_SCRIPTS.poisoning_emergency;

  return (
    <div className="space-y-6 text-left">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-800 to-rose-900 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center shadow-md">
              <Skull className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black">
                {lang === 'or' ? 'କୀଟନାଶକ ବିଷକ୍ରିୟା ମାର୍ଗଦର୍ଶିକା (Poisoning Guide)' : 'Pesticide Poisoning Emergency Guide'}
              </h2>
              <p className="text-xs sm:text-sm text-rose-100/90 mt-0.5">
                {lang === 'or'
                  ? 'କୀଟନାଶକ ପ୍ରୟୋଗ ସମୟରେ ବିଷକ୍ରିୟାର ଲକ୍ଷଣ ଓ ତତ୍କାଳ ଜୀବନ ରକ୍ଷାକାରୀ ପ୍ରାଥମିକ ଚିକିତ୍ସା।'
                  : 'Official protocol for accidental dermal absorption, inhalation, or ingestion of crop chemicals.'}
              </p>
            </div>
          </div>

          <a
            href="tel:108"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-black px-4 py-2.5 rounded-2xl text-sm shadow-md transition-all self-start sm:self-auto"
          >
            <PhoneCall className="w-4 h-4 stroke-[3]" />
            <span>{lang === 'or' ? '୧୦୮ ଡାକନ୍ତୁ' : 'DIAL 108'}</span>
          </a>
        </div>
      </div>

      {/* Audio Player with Interactive Progress Bar */}
      <div>
        <AudioPlayerCard
          title={lang === 'or' ? script.title_or : script.title_en}
          subtitle={lang === 'or' ? 'ଡାକ୍ତରୀ ପ୍ରାଥମିକ ଚିକିତ୍ସା ଅଡିଓ ମାର୍ଗଦର୍ଶନ' : 'Doctor-Verified First Aid Audio Protocols'}
          textToSpeak={lang === 'or' ? script.odia_text : script.english_text}
          lang={lang}
          accentColor="red"
        />
      </div>

      {/* Symptoms vs Emergency Action Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Symptoms */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-stone-900">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-extrabold">
              {lang === 'or' ? 'ବିଷକ୍ରିୟାର ପ୍ରାଥମିକ ଲକ୍ଷଣ:' : 'Warning Symptoms of Poisoning:'}
            </h3>
          </div>

          <div className="space-y-2.5 text-xs text-stone-700">
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100">
              <strong className="text-stone-900 block mb-0.5">
                {lang === 'or' ? '୧. ହାଲୁକା ଲକ୍ଷଣ (Mild):' : '1. Mild Poisoning:'}
              </strong>
              <span>
                {lang === 'or'
                  ? 'ମୁଣ୍ଡ ବିନ୍ଧା, ମୁଣ୍ଡ ବୁଲାଇବା, ଅତ୍ୟଧିକ ଝାଳ ବୋହିବା, ଲାଳ ଗଳିବା, କ୍ଳାନ୍ତି ଅନୁଭବ।'
                  : 'Headache, dizziness, excessive sweating, increased salivation, fatigue.'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200">
              <strong className="text-amber-950 block mb-0.5">
                {lang === 'or' ? '୨. ମଧ୍ୟମ ଲକ୍ଷଣ (Moderate):' : '2. Moderate Poisoning:'}
              </strong>
              <span>
                {lang === 'or'
                  ? 'ପେଟ କାମୁଡ଼ିବା, ବାରମ୍ବାର ବାନ୍ତି ହେବା, ଝାଡ଼ା ହେବା, ଆଖିର ପିଅର ଛୋଟ ହୋଇଯିବା (Pinpoint pupils)।'
                  : 'Stomach cramps, continuous nausea & vomiting, pinpoint pupils (miosis), muscle twitching.'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-red-50/70 border border-red-200">
              <strong className="text-red-950 block mb-0.5">
                {lang === 'or' ? '୩. ଗମ୍ଭୀର ଲକ୍ଷଣ (Severe):' : '3. Severe Poisoning:'}
              </strong>
              <span>
                {lang === 'or'
                  ? 'ନିଶ୍ୱାସ ନେବାରେ ପ୍ରବଳ କଷ୍ଟ, ଅଚେତ ହୋଇଯିବା, ବାତ ମାରିବା (Convulsions), ଓଠ ନୀଳ ପଡ଼ିବା।'
                  : 'Difficulty breathing, chest tightness, loss of consciousness, convulsions, cyanosis.'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Steps */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100 text-stone-900">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-extrabold">
              {lang === 'or' ? 'ତତ୍କାଳ ପ୍ରାଥମିକ ଚିକିତ୍ସା ପଦକ୍ଷେପ:' : 'Immediate Emergency Actions:'}
            </h3>
          </div>

          <div className="space-y-3 text-xs text-stone-700">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-100">
              <Wind className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block">
                  {lang === 'or' ? 'ପଦକ୍ଷେପ ୧: ଖୋଲା ପବନକୁ ନିଅନ୍ତୁ' : 'Step 1: Move to Fresh Air'}
                </strong>
                <span>
                  {lang === 'or'
                    ? 'ରୋଗୀଙ୍କୁ ସଙ୍ଗେ ସଙ୍ଗେ ସ୍ପ୍ରେ ହେଉଥିବା ଜମିରୁ ଦୂରକୁ ଖୋଲା ପବନ ଓ ଛାଇକୁ ନେଇଯାଆନ୍ତୁ।'
                    : 'Immediately isolate victim from the sprayed field into fresh open air.'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-100">
              <Droplets className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-stone-900 block">
                  {lang === 'or' ? 'ପଦକ୍ଷେପ ୨: ଲୁଗା ବଦଳାଇ ସାବୁନରେ ଧୁଅନ୍ତୁ' : 'Step 2: Strip Clothing & Wash'}
                </strong>
                <span>
                  {lang === 'or'
                    ? 'ଔଷଧ ପଡ଼ିଥିବା ସମସ୍ତ ଲୁଗାପଟା କାଢ଼ି ଦିଅନ୍ତୁ ଏବଂ ଚର୍ମ ଓ କେଶକୁ ପ୍ରଚୁର ପାଣି ଓ ସାବୁନରେ ଧୁଅନ୍ତୁ।'
                    : 'Strip off contaminated clothing. Wash exposed skin, face and eyes with copious water & soap.'}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50 border border-rose-200">
              <Skull className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-red-950 block">
                  {lang === 'or' ? 'ପଦକ୍ଷେପ ୩: କୀଟନାଶକ ବୋତଲ ସହିତ ହସ୍ପିଟାଲ ନିଅନ୍ତୁ' : 'Step 3: Rush to Hospital with Container'}
                </strong>
                <span>
                  {lang === 'or'
                    ? 'ଡାକ୍ତର ସଠିକ Antidote (Atropine / PAM) ଦେବା ପାଇଁ କୀଟନାଶକର ଡବା ନିଶ୍ଚୟ ସାଙ୍ଗରେ ନିଅନ୍ତୁ।'
                    : 'Always bring the pesticide container/label to hospital so medical officers can identify the exact antidote (e.g. Atropine, PAM).'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
