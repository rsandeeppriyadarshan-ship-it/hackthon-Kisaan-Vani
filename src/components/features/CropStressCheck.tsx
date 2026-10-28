import React, { useState } from 'react';
import { Language } from '../../types';
import { getDiseaseReferenceImage } from '../../data/crops/index';
import { Stethoscope, Droplets, Sprout, AlertTriangle, ArrowRight, CheckCircle2, ZoomIn, X } from 'lucide-react';

interface CropStressCheckProps {
  lang: Language;
  onNavigateToWater: () => void;
  onNavigateToFertiliser: () => void;
}

export const CropStressCheck: React.FC<CropStressCheckProps> = ({
  lang,
  onNavigateToWater,
  onNavigateToFertiliser,
}) => {
  const [leafColour, setLeafColour] = useState('pale_yellow');
  const [wiltingStatus, setWiltingStatus] = useState('none');
  const [daysSinceWater, setDaysSinceWater] = useState(6);
  const [soilFeel, setSoilFeel] = useState('bone_dry');
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
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

  // Rule engine evaluation
  const evaluateStress = () => {
    const results = [];

    // Drought / moisture stress
    if ((wiltingStatus === 'severe' || wiltingStatus === 'mild') && daysSinceWater > 4 && soilFeel === 'bone_dry') {
      results.push({
        id: 'drought',
        title_en: 'Severe Moisture / Drought Stress',
        title_or: 'ଜଳାଭାବ ଓ ମରୁଡ଼ି ଚାପ',
        severity: 'CRITICAL',
        color: 'red',
        desc_en: 'Plant cells are losing turgor pressure. Leaves are drooping to reduce transpiration.',
        desc_or: 'ପାଣି ଅଭାବରୁ ଗଛର କୋଷ ଦୁର୍ବଳ ହୋଇ ପତ୍ର ଝାଉଁଳି ପଡ଼ୁଛି।',
        action_en: 'Apply immediate light irrigation. Do NOT apply dry urea right now (it burns thirsty roots).',
        action_or: 'ତୁରନ୍ତ ହାଲୁକା ପାଣି ମଡ଼ାନ୍ତୁ। ଏହି ସମୟରେ ଖାଲି ୟୁରିଆ ସାର ଦିଅନ୍ତୁ ନାହିଁ।',
        has_dose: false,
        source: 'OUAT / ICAR Package of Practices',
        link: 'water'
      });
    }

    // Waterlogging / root rot
    if (soilFeel === 'slushy' && (leafColour === 'pale_yellow' || leafColour === 'brown_tips')) {
      results.push({
        id: 'waterlogging',
        title_en: 'Waterlogging & Root Suffocation',
        title_or: 'ଜଳବନ୍ଦୀ ଓ ଚେର ପଚା ସମସ୍ୟା',
        severity: 'HIGH',
        color: 'amber',
        desc_en: 'Excess standing water has choked soil oxygen, preventing nutrient absorption.',
        desc_or: 'ଜମିରେ ଅତିରିକ୍ତ ପାଣି ଜମି ରହିବା ଯୋଗୁଁ ଚେରକୁ ଅମ୍ଳଜାନ ମିଳୁନାହିଁ।',
        action_en: 'Drain standing water immediately. Once drained, spray 19:19:19 foliar fertilizer @ 5g/L.',
        action_or: 'ନାଳି ଖୋଳି ବିଲରୁ ଅତିରିକ୍ତ ପାଣି କାଢ଼ି ଦିଅନ୍ତୁ। ପରେ ୧୯:୧୯:୧୯ ସାର ସ୍ପ୍ରେ କରନ୍ତୁ।',
        has_dose: true,
        source: 'OUAT / ICAR Package of Practices',
        link: 'water'
      });
    }

    // Nitrogen deficiency
    if (leafColour === 'pale_yellow' && wiltingStatus === 'none') {
      results.push({
        id: 'nitrogen',
        title_en: 'Nitrogen (N) Deficiency',
        title_or: 'ଯବକ୍ଷାରଜାନ (ୟୁରିଆ) ଅଭାବ',
        severity: 'MEDIUM',
        color: 'amber',
        desc_en: 'General yellowing of older leaves starting from leaf tips, causing stunted tillering.',
        desc_or: 'ପୁରୁଣା ପତ୍ରଗୁଡ଼ିକ ହଳଦିଆ ପଡ଼ିଯିବା ଏବଂ ଗଛର ପିଲ ବାହାରିବା କମିଯିବା।',
        action_en: 'Top-dress Urea @ 18-20 kg/acre on moist soil or spray 2% Urea foliar solution.',
        action_or: 'ବତର ଥିବା ଜମିରେ ଏକର ପିଛା ୧୮-୨୦ କେଜି ୟୁରିଆ ପ୍ରୟୋଗ କରନ୍ତୁ ବା ୨% ୟୁରିଆ ସ୍ପ୍ରେ କରନ୍ତୁ।',
        has_dose: true,
        source: 'OUAT / ICAR Package of Practices',
        link: 'fertiliser'
      });
    }

    // Potassium deficiency
    if (leafColour === 'brown_tips') {
      results.push({
        id: 'potassium',
        title_en: 'Potassium (K) Deficiency / Marginal Scorch',
        title_or: 'ପଟାସ (Potash) ଅଭାବ ବା ଧାର ପୋଡ଼ା',
        severity: 'MEDIUM',
        color: 'amber',
        desc_en: 'Scorching or firing along leaf margins. Weak stems susceptible to lodging and blast.',
        desc_or: 'ପତ୍ରର ଧାରଗୁଡ଼ିକ ପୋଡ଼ିଗଲା ଭଳି ଶୁଖିଯିବା। କାଣ୍ଡ ଦୁର୍ବଳ ହୋଇ ନଇଁପଡ଼ିବାର ଆଶଙ୍କା ଥାଏ।',
        action_en: 'Apply Muriate of Potash (MOP) or spray 00:00:50 (Potassium Sulphate) @ 5g/L.',
        action_or: 'ଏମ୍.ଓ.ପି. (MOP) ପଟାସ ପ୍ରୟୋଗ କରନ୍ତୁ କିମ୍ବା ୦୦:୦୦:୫୦ ସ୍ପ୍ରେ କରନ୍ତୁ।',
        has_dose: true,
        source: 'OUAT / ICAR Package of Practices',
        link: 'fertiliser'
      });
    }

    // Phosphorus deficiency
    if (leafColour === 'purple_red') {
      results.push({
        id: 'phosphorus',
        title_en: 'Phosphorus (P) Deficiency',
        title_or: 'ଫସଫରସ୍ (ଡି.ଏ.ପି.) ଅଭାବ',
        severity: 'MEDIUM',
        color: 'purple',
        desc_en: 'Purplish-red discoloration on leaves and stunted root establishment.',
        desc_or: 'ପତ୍ର ବାଇଗଣୀ-ଲାଲ ଦେଖାଯିବା ଏବଂ ଚେରର ବୃଦ୍ଧି ବନ୍ଦ ହୋଇଯିବା।',
        action_en: 'Apply Single Super Phosphate (SSP) or DAP along with light irrigation.',
        action_or: 'ହାଲୁକା ପାଣି ସହିତ ଡି.ଏ.ପି. କିମ୍ବା ଏସ୍.ଏସ୍.ପି. ସାର ପ୍ରୟୋଗ କରନ୍ତୁ।',
        has_dose: true,
        source: 'OUAT / ICAR Package of Practices',
        link: 'fertiliser'
      });
    }

    if (results.length === 0) {
      results.push({
        id: 'healthy',
        title_en: 'Normal Balanced Vigor',
        title_or: 'ଫସଲ ସନ୍ତୁଳିତ ଓ ସୁସ୍ଥ ଅଛି',
        severity: 'LOW',
        color: 'emerald',
        desc_en: 'No major abiotic stress detected from current symptoms. Foliage is in healthy status.',
        desc_or: 'କୌଣସି ଗମ୍ଭୀର ଚାପର ଲକ୍ଷଣ ନାହିଁ। ଫସଲ ସୁସ୍ଥ ରହିଛି।',
        action_en: 'Continue scheduled irrigation and keep checking under-leaf canopy for early insects.',
        action_or: 'ନିୟମିତ ଜଳସେଚନ ଜାରି ରଖନ୍ତୁ ଏବଂ କୀଟପତଙ୍ଗ ଉପରେ ଦୃଷ୍ଟି ରଖନ୍ତୁ।',
        has_dose: false,
        source: 'OUAT / ICAR Package of Practices',
        link: 'none'
      });
    }

    return results;
  };

  const results = evaluateStress();

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center shadow-md">
            <Stethoscope className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black">
              {lang === 'or' ? 'ଫସଲ ଚାପ ଯାଞ୍ଚ (Crop Stress Check)' : 'Crop Abiotic Stress Checker'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
              {lang === 'or'
                ? 'ପତ୍ରର ରଙ୍ଗ, ମଉଳିବା ଓ ପାଣି ଦେବାର ଦିନ ଉତ୍ତର ଦିଅନ୍ତୁ; ନିୟମ ଆଧାରରେ ତୁରନ୍ତ ସମସ୍ୟା ଚିହ୍ନଟ ହେବ।'
                : 'Answer 4 quick field questions to detect nutrient deficiencies, drought, or waterlogging instantly.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Controls */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4 text-left">
          <h3 className="font-extrabold text-stone-900 text-base pb-2 border-b border-stone-100">
            {lang === 'or' ? 'କ୍ଷେତ୍ର ନିରୀକ୍ଷଣ ଫର୍ମ' : 'Field Observation Inputs'}
          </h3>

          {/* 1. Leaf Colour */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {lang === 'or' ? '୧. ପତ୍ରର ରଙ୍ଗ କିପରି ଅଛି?' : '1. Leaf Colour & Appearance'}
            </label>
            <select
              value={leafColour}
              onChange={(e) => setLeafColour(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
            >
              <option value="pale_yellow">{lang === 'or' ? 'ହଳଦିଆ ପଡ଼ିଯାଇଛି (Pale Yellow)' : 'Pale Yellowing'}</option>
              <option value="brown_tips">{lang === 'or' ? 'ପତ୍ର ଧାର ବାଦାମୀ/ପୋଡ଼ା ଦାଗ (Brown / Burnt Tips)' : 'Brown / Burnt Tips'}</option>
              <option value="purple_red">{lang === 'or' ? 'ବାଇଗଣୀ କିମ୍ବା ଲାଲ ରଙ୍ଗ (Purple / Reddish)' : 'Purplish / Reddish tinge'}</option>
              <option value="normal_green">{lang === 'or' ? 'ସାଧାରଣ ସବୁଜ (Healthy Green)' : 'Normal Vibrant Green'}</option>
            </select>
          </div>

          {/* 2. Wilting Status */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {lang === 'or' ? '୨. ଗଛ ମଉଳିବା ବା ଝାଉଁଳିବା ସ୍ଥିତି?' : '2. Wilting / Drooping Status'}
            </label>
            <select
              value={wiltingStatus}
              onChange={(e) => setWiltingStatus(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
            >
              <option value="none">{lang === 'or' ? 'କୌଣସି ମଉଳିବା ନାହିଁ (No Wilting)' : 'Firm & Erect (No wilting)'}</option>
              <option value="mild">{lang === 'or' ? 'ଦ୍ୱିପ୍ରହରେ ହାଲୁକା ଝାଉଁଳିବା (Mild Daytime Wilting)' : 'Mild Daytime Wilting'}</option>
              <option value="severe">{lang === 'or' ? 'ପତ୍ର ସମ୍ପୂର୍ଣ୍ଣ ନଇଁପଡ଼ିବା (Severe Drooping)' : 'Severe Drooping'}</option>
            </select>
          </div>

          {/* 3. Days Since Last Water */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700">
                {lang === 'or' ? '୩. ଶେଷ ଜଳସେଚନକୁ କେତେ ଦିନ ହେଲା?' : '3. Days Since Last Irrigation'}
              </label>
              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {daysSinceWater} {lang === 'or' ? 'ଦିନ' : 'days'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={daysSinceWater}
              onChange={(e) => setDaysSinceWater(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>0 (ଆଜି)</span>
              <span>10 ଦିନ</span>
              <span>20+ ଦିନ</span>
            </div>
          </div>

          {/* 4. Soil Moisture Feel */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {lang === 'or' ? '୪. ମାଟିର ଓଦା ଅନୁଭବ (ମୃତ୍ତିକା ସ୍ପର୍ଶ)?' : '4. Soil Moisture Feel in Hand'}
            </label>
            <select
              value={soilFeel}
              onChange={(e) => setSoilFeel(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
            >
              <option value="bone_dry">{lang === 'or' ? 'ଧୂଳିଆ / ସମ୍ପୂର୍ଣ୍ଣ ଶୁଖିଲା (Bone Dry)' : 'Bone Dry (crumbles into dust)'}</option>
              <option value="moist">{lang === 'or' ? 'ଉପଯୁକ୍ତ ବତର (Sufficiently Moist)' : 'Sufficiently Moist (forms loose ball)'}</option>
              <option value="slushy">{lang === 'or' ? 'କାଦୁଆ / ପାଣି ଜମିଛି (Waterlogged / Slushy)' : 'Waterlogged / Slushy puddles'}</option>
            </select>
          </div>
        </div>

        {/* Diagnosis Results */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-extrabold text-stone-900 text-base text-left">
            {lang === 'or' ? 'ଚିହ୍ନଟ ହୋଇଥିବା ଚାପ ଓ ସମାଧାନ:' : 'Diagnostic Results & Prescribed Actions:'}
          </h3>

          <div className="space-y-3">
            {results.map((res) => {
              const refImg = getDiseaseReferenceImage(res.id, res.title_en);
              const showPhoto = Boolean(refImg?.file && !brokenImages[res.id]);
              const altText = refImg?.alt || `${res.title_or} - ${res.title_en}`;
              const isIllustration = Boolean(refImg?.licence && refImg.licence.toLowerCase().includes('ai-generated'));
              const isPhotoVerified = Boolean(refImg?.verified_by && refImg?.verified_date);

              const openZoom = () => {
                if (!refImg?.file) return;
                setEnlargedPhoto({
                  src: refImg.file,
                  alt: altText,
                  nameOr: res.title_or,
                  nameEn: res.title_en,
                  symptomDesc: lang === 'or' ? res.desc_or : res.desc_en,
                  credit: refImg.credit,
                  licence: refImg.licence,
                  isIllustration,
                  isPhotoVerified,
                });
              };

              return (
                <div
                  key={res.id}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200 text-left space-y-3"
                >
                  {/* Reference photo at top of card (or text fallback if missing, never a blank box) */}
                  {showPhoto && refImg && (
                    <div className="space-y-1.5">
                      <div className="relative group w-full h-40 rounded-2xl overflow-hidden border border-stone-200">
                        <img
                          src={refImg.file}
                          alt={altText}
                          onClick={openZoom}
                          onError={() => setBrokenImages((prev) => ({ ...prev, [res.id]: true }))}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                        />
                        {isIllustration && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-950/85 text-amber-200 text-[10px] font-bold border border-amber-400/40">
                            Illustration, not a real photo
                          </span>
                        )}
                        <button
                          onClick={openZoom}
                          className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[11px] font-bold flex items-center gap-1 hover:bg-black/90 transition-colors cursor-pointer"
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

                  {/* Name in Farmer's Language and English below the photo */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          res.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : (res.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')
                        }`}>
                          {res.severity}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-stone-900 mt-1">
                        {res.title_or}
                      </h4>
                      <p className="text-xs font-bold text-stone-600">
                        {res.title_en}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {lang === 'or' ? res.desc_or : res.desc_en}
                  </p>

                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                    <p className="text-[11px] font-bold text-stone-500 uppercase">
                      {lang === 'or' ? 'ପରାମର୍ଶିତ କାର୍ଯ୍ୟାନୁଷ୍ଠାନ:' : 'Prescribed Remedial Action:'}
                    </p>
                    <p className="text-xs font-bold text-stone-900">
                      {lang === 'or' ? res.action_or : res.action_en}
                    </p>
                    {res.has_dose && (
                      <div className="pt-1 space-y-1">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-extrabold">
                          <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>SAMPLE: verify with the label or OUAT/ICAR</span>
                        </div>
                        <p className="text-[11px] font-bold text-stone-700">
                          📋 {lang === 'or' ? 'Follow the product label (ଡବା ଲେବଲ୍ ଅନୁସରଣ କରନ୍ତୁ)' : 'Follow the product label'}
                        </p>
                        <p className="text-[10px] text-stone-500">
                          Source: {res.source}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Direct Action Link buttons (Requirement 4: Link to water and fertiliser advice) */}
                  <div className="pt-1 flex flex-wrap gap-2">
                    {res.link === 'water' && (
                      <button
                        onClick={onNavigateToWater}
                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Droplets className="w-3.5 h-3.5" />
                        <span>{lang === 'or' ? 'ଜଳସେଚନ ପରାମର୍ଶ ଖୋଲନ୍ତୁ' : 'Open Water Advice'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {res.link === 'fertiliser' && (
                      <button
                        onClick={onNavigateToFertiliser}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Sprout className="w-3.5 h-3.5" />
                        <span>{lang === 'or' ? 'ସାର ମାତ୍ରା ପରାମର୍ଶ ଖୋଲନ୍ତୁ' : 'Open Fertiliser Advice'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
                🔍 {lang === 'or' ? 'ଚାପ / ରୋଗର ମୁଖ୍ୟ ଲକ୍ଷଣ:' : 'Symptom Description:'}
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
