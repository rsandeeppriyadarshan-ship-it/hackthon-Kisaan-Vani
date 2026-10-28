import React, { useState } from 'react';
import { Language, WeatherData, CropRule, FertiliserStage, FieldSizeValue } from '../../types';
import rulesDataRaw from '../../data/rules.json';
import { Sprout, CloudRain, AlertTriangle, CheckCircle, Scale, FileText } from 'lucide-react';
import { FieldSizeSelector, getSavedFieldSizeDefault } from '../common/FieldSizeSelector';

interface FertiliserAdviceProps {
  lang: Language;
  weather: WeatherData | null;
}

export const FertiliserAdvice: React.FC<FertiliserAdviceProps> = ({ lang, weather }) => {
  const [selectedCrop, setSelectedCrop] = useState('paddy');
  const [selectedStage, setSelectedStage] = useState('tillering');
  const [fieldSize, setFieldSize] = useState<FieldSizeValue>(() => getSavedFieldSizeDefault());
  const [acres, setAcres] = useState<number>(() => getSavedFieldSizeDefault().acres);
  const [useSoilCard, setUseSoilCard] = useState(false);
  const [soilN, setSoilN] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [soilP, setSoilP] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [soilK, setSoilK] = useState<'Low' | 'Medium' | 'High'>('Medium');

  const crops = rulesDataRaw.crops as Record<string, CropRule>;
  const activeCrop = crops[selectedCrop] || crops.paddy;
  const stages = Object.keys(activeCrop.fertiliser_doses || {});
  const activeDose: FertiliserStage = activeCrop.fertiliser_doses?.[selectedStage] || Object.values(activeCrop.fertiliser_doses || {})[0];

  // Soil health card multipliers
  const nMult = soilN === 'Low' ? 1.25 : (soilN === 'High' ? 0.75 : 1.0);
  const pMult = soilP === 'Low' ? 1.25 : (soilP === 'High' ? 0.75 : 1.0);
  const kMult = soilK === 'Low' ? 1.25 : (soilK === 'High' ? 0.75 : 1.0);

  const ureaCalculated = Math.round((activeDose?.urea_kg_per_acre || 0) * acres * (useSoilCard ? nMult : 1.0));
  const dapCalculated = Math.round((activeDose?.dap_kg_per_acre || 0) * acres * (useSoilCard ? pMult : 1.0));
  const mopCalculated = Math.round((activeDose?.mop_kg_per_acre || 0) * acres * (useSoilCard ? kMult : 1.0));
  const zincCalculated = Math.round((activeDose?.zinc_kg_per_acre || 0) * acres);

  const rainProb = weather ? weather.max_rain_probability_12h : 15;
  const delayBecauseOfRain = rainProb > 35;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-900 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-400 text-stone-900 flex items-center justify-center shadow-md">
            <Sprout className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black">
              {lang === 'or' ? 'ଖତ ଓ ସାର ପରାମର୍ଶ (Fertiliser Advice)' : 'Stage-wise Fertiliser & Soil Health Advisor'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
              {lang === 'or'
                ? 'ଓୟୁଏଟି ମାନକ ଅନୁଯାୟୀ ସଠିକ ସାର ମାତ୍ରା ଏବଂ ମୃତ୍ତିକା ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ ଅନୁକୂଳିତ ହିସାବ।'
                : 'Calculates Basal, Tillering & Panicle stage doses with optional Soil Health Card N-P-K adjustments.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4 text-left">
          <h3 className="font-extrabold text-stone-900 text-base pb-2 border-b border-stone-100">
            {lang === 'or' ? 'ଫସଲ ଓ କ୍ଷେତ୍ର ବିବରଣୀ' : 'Crop & Field Specifications'}
          </h3>

          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {lang === 'or' ? 'ଫସଲ (Crop):' : 'Select Crop:'}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => {
                setSelectedCrop(e.target.value);
                const first = Object.keys(crops[e.target.value]?.fertiliser_doses || {})[0];
                if (first) setSelectedStage(first);
              }}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
            >
              {Object.entries(crops).map(([key, c]) => (
                <option key={key} value={key}>
                  {lang === 'or' ? c.name_or : c.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Growth Stage Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {lang === 'or' ? 'ପ୍ରୟୋଗ ପର୍ଯ୍ୟାୟ (Application Stage):' : 'Application Stage:'}
            </label>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
            >
              {stages.map((stg) => {
                const doseObj = activeCrop.fertiliser_doses[stg];
                return (
                  <option key={stg} value={stg}>
                    {lang === 'or' ? doseObj.stage_or : doseObj.stage_en}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Field Size Selector (9 units + Bigha/Katha ask-once + 3 picture choices) */}
          <FieldSizeSelector
            lang={lang}
            initialFieldSize={fieldSize}
            syncToFarmerProfile={true}
            compact={true}
            onChange={(computedAcres, fs) => {
              setAcres(computedAcres);
              setFieldSize(fs);
            }}
          />

          {/* Optional Soil Health Card NPK Toggle (Requirement 5) */}
          <div className="pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-stone-900">
                  {lang === 'or' ? 'ମୃତ୍ତିକା ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ (Soil Card) ହିସାବ?' : 'Enable Soil Health Card N-P-K?'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSoilCard}
                  onChange={(e) => setUseSoilCard(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {useSoilCard && (
              <div className="mt-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5 animate-in fade-in">
                <p className="text-[11px] text-stone-500">
                  {lang === 'or'
                    ? 'ଆପଣଙ୍କ କାର୍ଡରେ ଥିବା N, P, K ମାନ ବାଛନ୍ତୁ (ନିମ୍ନ ଥିଲେ ସାର ୨୫% ଅଧିକ, ଉଚ୍ଚ ଥିଲେ ୨୫% କମ ଦିଆଯିବ):'
                    : 'Select test values: Low adds +25%, High reduces -25% to optimize cost:'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 block mb-1">
                      {lang === 'or' ? 'ଯବକ୍ଷାରଜାନ (N)' : 'Nitrogen (N)'}
                    </label>
                    <select
                      value={soilN}
                      onChange={(e) => setSoilN(e.target.value as any)}
                      className="w-full bg-white border border-stone-300 rounded-lg p-1.5 text-xs font-bold"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 block mb-1">
                      {lang === 'or' ? 'ଫସଫରସ୍ (P)' : 'Phosphorus (P)'}
                    </label>
                    <select
                      value={soilP}
                      onChange={(e) => setSoilP(e.target.value as any)}
                      className="w-full bg-white border border-stone-300 rounded-lg p-1.5 text-xs font-bold"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 block mb-1">
                      {lang === 'or' ? 'ପଟାସ (K)' : 'Potash (K)'}
                    </label>
                    <select
                      value={soilK}
                      onChange={(e) => setSoilK(e.target.value as any)}
                      className="w-full bg-white border border-stone-300 rounded-lg p-1.5 text-xs font-bold"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7 space-y-4 text-left">
          {/* Weather Delay Warning (Requirement 5: Delay if rain chance is high) */}
          {delayBecauseOfRain ? (
            <div className="p-4 sm:p-5 rounded-3xl bg-amber-600 text-white shadow-md flex items-start gap-3">
              <CloudRain className="w-6 h-6 text-white shrink-0 mt-0.5 animate-bounce" />
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-800 text-yellow-200">
                  {lang === 'or' ? 'ସାର ପ୍ରୟୋଗ ସ୍ଥଗିତ ରଖନ୍ତୁ' : 'DELAY FERTILISER APPLICATION'}
                </span>
                <h4 className="text-base sm:text-lg font-black mt-1">
                  {lang === 'or' ? `ବର୍ଷା ସମ୍ଭାବନା (${rainProb}%) - ସାର ପକାନ୍ତୁ ନାହିଁ` : `High Rain Probability (${rainProb}%)`}
                </h4>
                <p className="text-xs text-amber-100 mt-1">
                  {lang === 'or'
                    ? 'ବର୍ତ୍ତମାନ ୟୁରିଆ ପ୍ରୟୋଗ କଲେ ପ୍ରବଳ ବର୍ଷାରେ ଧୋଇ ହୋଇ ବିଲରୁ ବାହାରିଯିବ। ବର୍ଷା ଥମିବା ଓ ଜମିରୁ ଅତିରିକ୍ତ ପାଣି ନିଷ୍କାସନ ହେବା ପର୍ଯ୍ୟନ୍ତ ଅପେକ୍ଷା କରନ୍ତୁ।'
                    : 'Applying fertilizer now will lead to nitrogen leaching and surface runoff loss. Wait until rain subsides.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between">
              <span className="font-semibold">
                {lang === 'or' ? 'ପାଣିପାଗ ସ୍ଥିତି: ବର୍ଷା ସମ୍ଭାବନା କମ ଅଛି, ସାର ପ୍ରୟୋଗ କରିପାରିବେ।' : 'Weather: Low rain risk. Good window for fertilizer top-dressing.'}
              </span>
              <span className="font-black text-emerald-700">{rainProb}% Rain</span>
            </div>
          )}

          {/* Stage Recommendation Breakdown */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  {lang === 'or' ? 'ନିର୍ବାଚିତ ପର୍ଯ୍ୟାୟ' : 'Selected Stage'}
                </span>
                <h4 className="text-base sm:text-lg font-black text-stone-900 mt-0.5">
                  {lang === 'or' ? activeDose?.stage_or : activeDose?.stage_en}
                </h4>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800">
                {acres} {lang === 'or' ? 'ଏକର ପାଇଁ' : 'Acre(s)'}
              </span>
            </div>

            {/* Unverified Dose Sample Label */}
            {!(activeDose?.verified_by && activeDose?.verified_date) && (
              <div className="px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-extrabold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>SAMPLE: verify with the label or OUAT/ICAR</span>
              </div>
            )}

            {/* Calculated Fertilizer Quantity Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Urea */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <p className="text-[10px] font-black uppercase text-stone-400">Urea (ୟୁରିଆ)</p>
                <p className="text-xl font-black text-stone-900 mt-1">
                  {ureaCalculated} <span className="text-xs font-semibold text-stone-500">kg</span>
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">46% N</p>
              </div>

              {/* DAP */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <p className="text-[10px] font-black uppercase text-stone-400">DAP (ଡି.ଏ.ପି.)</p>
                <p className="text-xl font-black text-stone-900 mt-1">
                  {dapCalculated} <span className="text-xs font-semibold text-stone-500">kg</span>
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">18:46:0</p>
              </div>

              {/* MOP Potash */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <p className="text-[10px] font-black uppercase text-stone-400">Potash (MOP)</p>
                <p className="text-xl font-black text-stone-900 mt-1">
                  {mopCalculated} <span className="text-xs font-semibold text-stone-500">kg</span>
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">60% K2O</p>
              </div>

              {/* Zinc Sulphate */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                <p className="text-[10px] font-black uppercase text-stone-400">Zinc (ଜିଙ୍କ୍)</p>
                <p className="text-xl font-black text-stone-900 mt-1">
                  {zincCalculated} <span className="text-xs font-semibold text-stone-500">kg</span>
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">ZnSO4</p>
              </div>
            </div>

            {/* Mandatory Follow Product Label & Dose Source Attribution */}
            <div className="px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="font-bold text-stone-800">
                📋 {lang === 'or' ? 'Follow the product label (ବସ୍ତା ଲେବଲ୍ ଅନୁସରଣ କରନ୍ତୁ)' : 'Follow the product label'}
              </span>
              <span className="text-stone-500 font-medium">
                Source: {activeDose?.source || 'OUAT / ICAR Package of Practices'}
              </span>
            </div>

            {/* Application Notes */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-stone-800 space-y-1.5">
              <p className="font-extrabold text-emerald-950">
                {lang === 'or' ? 'ପ୍ରୟୋଗ ବିଧି (OUAT ନିୟମ):' : 'Application Instructions:'}
              </p>
              <p className="leading-relaxed">
                {lang === 'or' ? activeDose?.notes_or : activeDose?.notes_en}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
