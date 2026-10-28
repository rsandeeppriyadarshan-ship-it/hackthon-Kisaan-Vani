import React, { useState, useEffect } from 'react';
import { Language, WeatherData, FieldSizeValue } from '../../types';
import { getAllCropsDictionary } from '../../data/plantDatabase';
import { ShieldCheck, Wind, CloudRain, AlertTriangle, CheckCircle, Volume2, CalendarPlus, ChevronRight, ZoomIn, X } from 'lucide-react';
import { FieldSizeSelector, getSavedFieldSizeDefault } from '../common/FieldSizeSelector';

interface PesticideAdviceProps {
  lang: Language;
  weather: WeatherData | null;
  initialCropId?: string;
  initialDiseaseId?: string;
  onTriggerSafetyAlert: () => void;
  onProceedToLog: (product: string, crop: string, dose: string) => void;
}

export const PesticideAdvice: React.FC<PesticideAdviceProps> = ({
  lang,
  weather,
  initialCropId = 'paddy',
  initialDiseaseId = 'rice_blast',
  onTriggerSafetyAlert,
  onProceedToLog,
}) => {
  const crops = getAllCropsDictionary();
  const [selectedCrop, setSelectedCrop] = useState(initialCropId);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState(initialDiseaseId);
  const [diseaseConfirmed, setDiseaseConfirmed] = useState(true);
  const [fieldSize, setFieldSize] = useState<FieldSizeValue>(() => getSavedFieldSizeDefault());
  const [acres, setAcres] = useState<number>(() => getSavedFieldSizeDefault().acres);
  const [imgBroken, setImgBroken] = useState<Record<string, boolean>>({});
  const [enlargedPhoto, setEnlargedPhoto] = useState<{
    src: string;
    alt: string;
    nameOr: string;
    nameEn: string;
    symptomDesc: string;
    credit?: string;
    licence?: string;
    isIllustration?: boolean;
    isPhotoVerified?: boolean;
  } | null>(null);

  const activeCrop = crops[selectedCrop] || crops.paddy;
  const activeDisease = activeCrop.diseases_pests.find((d) => d.id === selectedDiseaseId) || activeCrop.diseases_pests[0];

  useEffect(() => {
    if (initialCropId && crops[initialCropId]) {
      setSelectedCrop(initialCropId);
    }
    if (initialDiseaseId) {
      setSelectedDiseaseId(initialDiseaseId);
    }
  }, [initialCropId, initialDiseaseId]);

  // Handle crop change
  const handleCropChange = (cropKey: string) => {
    setSelectedCrop(cropKey);
    const newCrop = crops[cropKey];
    if (newCrop && newCrop.diseases_pests.length > 0) {
      setSelectedDiseaseId(newCrop.diseases_pests[0].id);
    }
  };

  // Weather evaluation
  const rainProb = weather ? weather.max_rain_probability_12h : 15;
  const windKmh = weather ? weather.wind_speed_kmh : 9;

  let sprayDecision: 'SPRAY_NOW' | 'WAIT_RAIN' | 'WAIT_WIND' | 'DO_NOT_SPRAY_UNCONFIRMED' = 'SPRAY_NOW';
  if (!diseaseConfirmed) {
    sprayDecision = 'DO_NOT_SPRAY_UNCONFIRMED';
  } else if (rainProb > 30) {
    sprayDecision = 'WAIT_RAIN';
  } else if (windKmh > 15) {
    sprayDecision = 'WAIT_WIND';
  }

  const waterTotalLitres = acres * 200;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/60 text-amber-300 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OUAT & ICAR Verified Chemical Dosages</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              {lang === 'or' ? 'କୀଟନାଶକ ପରାମର୍ଶ (Pesticide Advisory)' : 'Verified Pesticide Advisory & Dose Calculator'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5 max-w-2xl">
              {lang === 'or'
                ? 'ପାଣିପାଗ (ବର୍ଷା ଓ ପବନ) ସ୍ଥିତି ଯାଞ୍ଚ କରି କୀଟନାଶକର ସଠିକ ମାତ୍ରା ଓ ସୁରକ୍ଷା ନିୟମ ଜାଣନ୍ତୁ।'
                : 'Calculates verified doses based on active crop stage, weather suitability (rain & wind check), and harvest waiting periods.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Selectors */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4 text-left">
          <h3 className="font-extrabold text-stone-900 text-base pb-2 border-b border-stone-100">
            {lang === 'or' ? 'ଫସଲ ଓ ରୋଗ ଚୟନ କରନ୍ତୁ' : 'Crop & Target Pest Selection'}
          </h3>

          {/* Crop Dropdown */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {lang === 'or' ? 'ଫସଲ (Crop):' : 'Select Crop:'}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => handleCropChange(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
            >
              {Object.entries(crops).map(([key, c]) => (
                <option key={key} value={key}>
                  {lang === 'or' ? c.name_or : c.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Disease Dropdown */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {lang === 'or' ? 'ରୋଗ କିମ୍ବା ପୋକ (Disease / Pest):' : 'Identified Disease or Pest:'}
            </label>
            <select
              value={selectedDiseaseId}
              onChange={(e) => setSelectedDiseaseId(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
            >
              {activeCrop.diseases_pests.map((d) => (
                <option key={d.id} value={d.id}>
                  {lang === 'or' ? d.name_or : d.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Disease Confirmed Toggle (Requirement 3: Send disease_confirmed=true) */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-stone-900">
                {lang === 'or' ? 'ରୋଗ ନିଶ୍ଚିତ ହୋଇଛି କି?' : 'Is Disease Confirmed?'}
              </p>
              <p className="text-[11px] text-stone-500">
                {lang === 'or' ? 'ଅଯଥା ସ୍ପ୍ରେ ରୋକିବା ପାଇଁ ଆବଶ୍ୟକ' : 'Avoid prophylactic blind spray'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={diseaseConfirmed}
                onChange={(e) => setDiseaseConfirmed(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
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

          {/* Real-time Weather Context */}
          {weather && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                <span>{lang === 'or' ? 'ପାଣିପାଗ ସ୍ଥିତି' : 'Live Open-Meteo Conditions'}:</span>
                <span className="text-emerald-700 font-extrabold">{weather.location_name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-stone-700 pt-1">
                <div className="flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>
                    {rainProb}% {lang === 'or' ? 'ବର୍ଷା ସମ୍ଭାବନା' : 'Rain chance'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {windKmh} km/h {lang === 'or' ? 'ପବନ ବେଗ' : 'Wind speed'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Advisory Output */}
        <div className="lg:col-span-7 space-y-4 text-left">
          {/* Decision Status Banner */}
          {sprayDecision === 'SPRAY_NOW' && (
            <div className="p-4 sm:p-5 rounded-3xl bg-emerald-700 text-white shadow-md flex items-start gap-3">
              <CheckCircle className="w-7 h-7 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-800 text-amber-300">
                  {lang === 'or' ? 'ପାଣିପାଗ ଅନୁକୂଳ' : 'FAVOURABLE CONDITIONS'}
                </span>
                <h4 className="text-lg sm:text-xl font-black mt-1">
                  {lang === 'or' ? 'ସ୍ପ୍ରେ ପାଇଁ ଅନୁମୋଦିତ (SPRAY APPROVED)' : 'SPRAY APPROVED: WEATHER IS OPTIMAL'}
                </h4>
                <p className="text-xs text-emerald-100 mt-1">
                  {lang === 'or'
                    ? 'ବର୍ଷା ସମ୍ଭାବନା ୩୦% ରୁ କମ ଏବଂ ପବନ ସ୍ୱାଭାବିକ ଅଛି। ସକାଳ ୯ଟା ପୂର୍ବରୁ କିମ୍ବା ଅପରାହ୍ନରେ ସ୍ପ୍ରେ କରନ୍ତୁ।'
                    : 'Rain probability is under 30% and wind is low. Safe window for foliar application.'}
                </p>
              </div>
            </div>
          )}

          {sprayDecision === 'WAIT_RAIN' && (
            <div className="p-4 sm:p-5 rounded-3xl bg-amber-600 text-white shadow-md flex items-start gap-3">
              <CloudRain className="w-7 h-7 text-white shrink-0 mt-0.5 animate-bounce" />
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-800 text-yellow-200">
                  {lang === 'or' ? 'ବର୍ଷା ଆଶଙ୍କା' : 'RAIN EXPECTED'}
                </span>
                <h4 className="text-lg sm:text-xl font-black mt-1">
                  {lang === 'or' ? `ସ୍ପ୍ରେ କରନ୍ତୁ ନାହିଁ - ବର୍ଷା ସମ୍ଭାବନା (${rainProb}%)` : `WAIT - High Rain Probability (${rainProb}%)`}
                </h4>
                <p className="text-xs text-amber-100 mt-1">
                  {lang === 'or'
                    ? 'ବର୍ତ୍ତମାନ ସ୍ପ୍ରେ କଲେ ବର୍ଷା ପାଣିରେ କୀଟନାଶକ ଧୋଇ ହୋଇ ନଷ୍ଟ ହେବ। ବର୍ଷା ଥମିବା ଯାଏଁ ଅପେକ୍ଷା କରନ୍ତୁ।'
                    : 'Spraying now will result in wash-off, wasting cost and chemical efficacy. Wait for dry spell.'}
                </p>
              </div>
            </div>
          )}

          {sprayDecision === 'WAIT_WIND' && (
            <div className="p-4 sm:p-5 rounded-3xl bg-amber-600 text-white shadow-md flex items-start gap-3">
              <Wind className="w-7 h-7 text-white shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-800 text-yellow-200">
                  {lang === 'or' ? 'ପ୍ରବଳ ପବନ' : 'HIGH WIND'}
                </span>
                <h4 className="text-lg sm:text-xl font-black mt-1">
                  {lang === 'or' ? `ଅପେକ୍ଷା କରନ୍ତୁ - ପ୍ରବଳ ପବନ (${windKmh} km/h)` : `WAIT - High Wind Gusts (${windKmh} km/h)`}
                </h4>
                <p className="text-xs text-amber-100 mt-1">
                  {lang === 'or'
                    ? 'ଅତ୍ୟଧିକ ପବନ ଯୋଗୁଁ ଔଷଧ ଛିଞ୍ଚାଡ଼ି ହୋଇ ମୁହଁରେ ପଡ଼ିପାରେ। ପବନ କମିବା ପର୍ଯ୍ୟନ୍ତ ଅପେକ୍ଷା କରନ୍ତୁ।'
                    : 'Wind speed exceeds 15 km/h. Spray drift risks contaminating applicator and non-target crops.'}
                </p>
              </div>
            </div>
          )}

          {sprayDecision === 'DO_NOT_SPRAY_UNCONFIRMED' && (
            <div className="p-4 sm:p-5 rounded-3xl bg-stone-700 text-white shadow-md flex items-start gap-3">
              <AlertTriangle className="w-7 h-7 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-stone-800 text-amber-300">
                  {lang === 'or' ? 'ରୋଗ ଅନିଶ୍ଚିତ' : 'UNCONFIRMED'}
                </span>
                <h4 className="text-lg sm:text-xl font-black mt-1">
                  {lang === 'or' ? 'ସ୍ପ୍ରେ କରନ୍ତୁ ନାହିଁ (ରୋଗ ଚିହ୍ନଟ ହୋଇନାହିଁ)' : 'Do Not Spray (Unconfirmed diagnosis)'}
                </h4>
                <p className="text-xs text-stone-200 mt-1">
                  {lang === 'or'
                    ? 'ଅଯଥା ରାସାୟନିକ ସ୍ପ୍ରେ କଲେ ବିଲର ହିତକାରୀ ପୋକ ନଷ୍ଟ ହୋଇଯାନ୍ତି। ପ୍ରଥମେ ଶସ୍ୟ ଡାକ୍ତରରେ ଫଟୋ ଉଠାଇ ନିଶ୍ଚିତ ହୁଅନ୍ତୁ।'
                    : 'Indiscriminate chemical application kills natural friendly predator insects and creates pest resistance.'}
                </p>
              </div>
            </div>
          )}

          {/* Dosage & Chemical Breakdown Card */}
          {activeDisease && (() => {
            const refImg = activeDisease.reference_images && activeDisease.reference_images.length > 0
              ? activeDisease.reference_images[0]
              : null;
            const showPhoto = Boolean(refImg?.file && !imgBroken[activeDisease.id]);
            const altText = refImg?.alt || `${activeDisease.name_or} - ${activeDisease.name_en}`;
            const isVerified = Boolean(activeDisease.verified_by && activeDisease.verified_date);
            const doseSource = activeDisease.source || 'OUAT / ICAR Package of Practices';
            const isIllustration = Boolean(refImg?.licence && refImg.licence.toLowerCase().includes('ai-generated'));
            const isPhotoVerified = Boolean(refImg?.verified_by && refImg?.verified_date);

            const openZoom = () => {
              if (!refImg?.file) return;
              setEnlargedPhoto({
                src: refImg.file,
                alt: altText,
                nameOr: activeDisease.name_or,
                nameEn: activeDisease.name_en,
                symptomDesc: lang === 'or' ? activeDisease.symptoms_or : activeDisease.symptoms_en,
                credit: refImg.credit,
                licence: refImg.licence,
                isIllustration,
                isPhotoVerified,
              });
            };

            return (
              <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4">
                {/* Reference Photo at top of card (or text-only fallback if missing, never a blank box) */}
                {showPhoto && refImg && (
                  <div className="space-y-1.5">
                    <div className="relative group w-full h-44 rounded-2xl overflow-hidden border border-stone-200">
                      <img
                        src={refImg.file}
                        alt={altText}
                        onClick={openZoom}
                        onError={() => setImgBroken((prev) => ({ ...prev, [activeDisease.id]: true }))}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      />
                      {isIllustration && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-950/85 text-amber-200 text-[10px] font-bold border border-amber-400/40">
                          Illustration, not a real photo
                        </span>
                      )}
                      <button
                        onClick={openZoom}
                        className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 text-white text-xs font-bold flex items-center gap-1 hover:bg-black/90 transition-colors cursor-pointer"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>{lang === 'or' ? 'ବଡ଼ କରି ଦେଖନ୍ତୁ' : 'Tap to Enlarge'}</span>
                      </button>
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/65 text-white text-[10px] font-medium">
                        {refImg.licence}
                      </span>
                    </div>
                    {!isPhotoVerified && (
                      <p className="text-[11px] font-bold text-amber-800">
                        ⚠️ Picture to be verified
                      </p>
                    )}
                  </div>
                )}

                {/* Disease Name in Farmer's Language and in English below the photo */}
                <div className="pb-2 border-b border-stone-100">
                  <h4 className="text-base sm:text-lg font-black text-stone-900">
                    {activeDisease.name_or}
                  </h4>
                  <p className="text-xs font-bold text-stone-600">
                    {activeDisease.name_en}
                  </p>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div>
                    <p className="text-[11px] font-bold text-stone-400 uppercase">
                      {lang === 'or' ? 'ଓୟୁଏଟି ଅନୁମୋଦିତ କୀଟନାଶକ' : 'OUAT Recommended Treatment'}
                    </p>
                    <h4 className="text-base sm:text-lg font-black text-emerald-950 mt-0.5">
                      {lang === 'or' ? activeDisease.chemical_or : activeDisease.chemical}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    {activeDisease.safety_class}
                  </span>
                </div>

                {/* Unverified Dose Sample Label */}
                {!isVerified && (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-extrabold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>SAMPLE: verify with the label or OUAT/ICAR</span>
                  </div>
                )}

                {/* Dosing Calculations */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                    <p className="text-[10px] font-bold text-stone-400 uppercase">
                      {lang === 'or' ? 'ଲିଟର ପିଛା ମାତ୍ରା' : 'Dose per Litre'}
                    </p>
                    <p className="text-sm font-black text-stone-900 mt-0.5">
                      {activeDisease.dose_per_litre}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                    <p className="text-[10px] font-bold text-stone-400 uppercase">
                      {lang === 'or' ? `${acres} ଏକର ପାଇଁ ପାଣି` : `Water for ${acres} Acre(s)`}
                    </p>
                    <p className="text-sm font-black text-sky-700 mt-0.5">
                      {waterTotalLitres} Litres (L)
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200">
                    <p className="text-[10px] font-bold text-stone-400 uppercase">
                      {lang === 'or' ? 'ଅମଳ ଅବଧି (PHI)' : 'Waiting Period (PHI)'}
                    </p>
                    <p className="text-sm font-black text-amber-700 mt-0.5">
                      {activeDisease.phi_days} {lang === 'or' ? 'ଦିନ' : 'Days'}
                    </p>
                  </div>
                </div>

                {/* Mandatory Follow Product Label & Dose Source Attribution */}
                <div className="px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <span className="font-bold text-stone-800">
                    📋 {lang === 'or' ? 'Follow the product label (ଡବା ଲେବଲ୍ ଅନୁସରଣ କରନ୍ତୁ)' : 'Follow the product label'}
                  </span>
                  <span className="text-stone-500 font-medium">
                    Source: {doseSource}
                  </span>
                </div>

                {/* Symptoms & Alternative */}
                <div className="text-xs space-y-2 text-stone-700 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
                  <p>
                    <strong>{lang === 'or' ? 'ଲକ୍ଷଣ:' : 'Symptoms:'}</strong>{' '}
                    {lang === 'or' ? activeDisease.symptoms_or : activeDisease.symptoms_en}
                  </p>
                  {activeDisease.alternative && (
                    <p className="text-stone-600">
                      <strong>{lang === 'or' ? 'ବିକଳ୍ପ (Alternative):' : 'Alternative:'}</strong>{' '}
                      {activeDisease.alternative}
                    </p>
                  )}
                </div>

                {/* Bottom Safety & Log Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    onClick={onTriggerSafetyAlert}
                    className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-900 font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{lang === 'or' ? 'ସ୍ପ୍ରେ ସୁରକ୍ଷା ଚେତାବନୀ ଶୁଣନ୍ତୁ' : 'Play Safety Checklist Audio'}</span>
                  </button>

                  <button
                    onClick={() =>
                      onProceedToLog(
                        lang === 'or' ? activeDisease.chemical_or : activeDisease.chemical,
                        lang === 'or' ? activeCrop.name_or : activeCrop.name_en,
                        activeDisease.dose_per_litre
                      )
                    }
                    className="flex-1 py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    <span>{lang === 'or' ? 'ସ୍ପ୍ରେ ଲଗ୍ ରେ ଲେଖନ୍ତୁ' : 'Add to Spray Log'}</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Enlarged Reference Photo Modal */}
      {enlargedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEnlargedPhoto(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-stone-200 space-y-3 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-black text-base sm:text-lg text-stone-900">
                  {enlargedPhoto.nameOr}
                </h4>
                <p className="text-xs font-bold text-stone-600">
                  {enlargedPhoto.nameEn}
                </p>
              </div>
              <button
                onClick={() => setEnlargedPhoto(null)}
                className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                aria-label="Close enlarged photo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={enlargedPhoto.src}
              alt={enlargedPhoto.alt}
              className="w-full max-h-[52vh] object-contain rounded-2xl bg-stone-950 border border-stone-200"
            />
            <div className="flex flex-wrap items-center gap-2">
              {enlargedPhoto.isIllustration && (
                <span className="px-2.5 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-extrabold">
                  Illustration, not a real photo
                </span>
              )}
              {!enlargedPhoto.isPhotoVerified && (
                <span className="px-2.5 py-0.5 rounded-md bg-stone-100 border border-stone-300 text-stone-800 text-[11px] font-bold">
                  ⚠️ Picture to be verified
                </span>
              )}
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
              <p className="font-bold text-emerald-900">
                🔍 {lang === 'or' ? 'ରୋଗର ମୁଖ୍ୟ ଲକ୍ଷଣ:' : 'Symptom Description:'}
              </p>
              <p className="text-stone-800 leading-relaxed">
                {enlargedPhoto.symptomDesc}
              </p>
              {(enlargedPhoto.credit || enlargedPhoto.licence) && (
                <p className="text-[10px] text-stone-500 pt-1 border-t border-emerald-200 mt-1">
                  Credit: {enlargedPhoto.credit} • Licence: {enlargedPhoto.licence}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
