import React, { useState } from 'react';
import { Language, CropRotationItem } from '../../types';
import rotationDataRaw from '../../data/rotation.json';
import { RefreshCw, Sprout, ArrowRight, ShieldCheck, Droplets, TrendingUp, CheckCircle } from 'lucide-react';

interface CropRotationAdviceProps {
  lang: Language;
}

export const CropRotationAdvice: React.FC<CropRotationAdviceProps> = ({ lang }) => {
  const [previousCrop, setPreviousCrop] = useState<string>('paddy');
  const [targetSeason, setTargetSeason] = useState<string>('all');

  const rotations = rotationDataRaw.rotations as CropRotationItem[];

  const filteredRotations = rotations.filter((r) => {
    const matchCrop = r.previous_crop_id === previousCrop;
    const matchSeason = targetSeason === 'all' || r.season.toLowerCase().includes(targetSeason.toLowerCase());
    return matchCrop && matchSeason;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center shadow-md">
            <RefreshCw className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black">
              {lang === 'or' ? 'ଫସଲ ପର୍ଯ୍ୟାୟକ୍ରମ ଓ ଫସଲ ଚକ୍ର (Crop Rotation)' : 'Agro-Climatic Crop Rotation Advisor'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
              {lang === 'or'
                ? 'ପୂର୍ବ ଫସଲ ଓ ଋତୁ ଅନୁସାରେ ପରବର୍ତ୍ତୀ ଲାଭଜନକ ଫସଲ ବାଛନ୍ତୁ; ଯାହା ମାଟିର ଉର୍ବରତା ବଢ଼ାଇବ ଓ ରୋଗଚକ୍ର ଭାଙ୍ଗିବ।'
                : 'Maps previous crop harvest to high-value next crops that fix atmospheric nitrogen and terminate pathogen cycles.'}
            </p>
          </div>
        </div>
      </div>

      {/* Selectors */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {lang === 'or' ? 'ପୂର୍ବରୁ ଅମଳ ହୋଇଥିବା ଫସଲ (Previous Crop):' : 'Previous Harvested Crop:'}
            </label>
            <select
              value={previousCrop}
              onChange={(e) => setPreviousCrop(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
            >
              <option value="paddy">{lang === 'or' ? 'ଖରିଫ ଧାନ (Kharif Paddy)' : 'Kharif Paddy (Rice)'}</option>
              <option value="maize">{lang === 'or' ? 'ମକା (Maize)' : 'Maize / Corn'}</option>
              <option value="brinjal">{lang === 'or' ? 'ବାଇଗଣ / ବିଲାତି (Vegetables)' : 'Vegetables (Brinjal / Tomato)'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {lang === 'or' ? 'ଆଗାମୀ ଋତୁ (Target Season):' : 'Upcoming Planting Season:'}
            </label>
            <select
              value={targetSeason}
              onChange={(e) => setTargetSeason(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
            >
              <option value="all">{lang === 'or' ? 'ସମସ୍ତ ଋତୁ (All Seasons)' : 'All Seasons'}</option>
              <option value="Rabi">{lang === 'or' ? 'ରବି ଋତୁ (Rabi / Winter)' : 'Rabi (Winter)'}</option>
              <option value="Summer">{lang === 'or' ? 'ଗ୍ରୀଷ୍ମ ଋତୁ (Summer / Zaid)' : 'Summer (Zaid)'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommended Crops Cards */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-stone-900 text-base">
          {lang === 'or' ? 'ପରାମର୍ଶିତ ପରବର୍ତ୍ତୀ ଫସଲ ଚୟନ:' : 'Recommended Rotation Options:'} ({filteredRotations.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRotations.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 hover:border-emerald-400 hover:shadow-md transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {item.season}
                  </span>
                  <h4 className="text-lg font-black text-stone-900 mt-1">
                    {lang === 'or' ? item.recommended_crop_or : item.recommended_crop_en}
                  </h4>
                  <p className="text-xs text-stone-500 font-medium">
                    {lang === 'or' ? `ଉପଯୁକ୍ତ ଅଞ୍ଚଳ: ${item.agro_zone}` : `Zone: ${item.agro_zone}`}
                  </p>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Sprout className="w-5 h-5" />
                </div>
              </div>

              {/* Badges: N-Fixation and Water */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-100">
                  <span className="text-[10px] text-stone-400 block font-bold uppercase">
                    {lang === 'or' ? 'ଯବକ୍ଷାରଜାନ ବୃଦ୍ଧି' : 'Nitrogen Fixed'}
                  </span>
                  <span className="font-extrabold text-emerald-800">{item.nitrogen_fixed_kg_ha}</span>
                </div>

                <div className="p-2.5 rounded-2xl bg-stone-50 border border-stone-100">
                  <span className="text-[10px] text-stone-400 block font-bold uppercase">
                    {lang === 'or' ? 'ଜଳ ଆବଶ୍ୟକତା' : 'Water Need'}
                  </span>
                  <span className="font-extrabold text-sky-800">{item.water_need}</span>
                </div>
              </div>

              {/* Disease-Break Benefit */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-1">
                <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>{lang === 'or' ? 'ରୋଗ ଓ ପୋକ ଚକ୍ର ଭାଙ୍ଗିବାର ଲାଭ:' : 'Disease Break Cycle Benefit:'}</span>
                </p>
                <p className="text-stone-700 leading-relaxed">
                  {lang === 'or' ? item.disease_break_benefits_or : item.disease_break_benefits_en}
                </p>
              </div>

              {/* Profit potential */}
              <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
                <TrendingUp className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-semibold">{item.profit_multiplier}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
