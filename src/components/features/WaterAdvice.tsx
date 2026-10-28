import React, { useState, useMemo } from 'react';
import { Language, WeatherData, FieldSizeValue } from '../../types';
import {
  ALL_WATER_ADVICE_PLANTS,
  WATER_ADVICE_CATEGORIES,
  getLocalizedPlantName,
  PlantWaterProfile
} from '../../data/waterAdviceCatalog';
import { getCurrentSignedInFarmer } from '../../services/authDatabaseService';
import {
  Droplets,
  CloudRain,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  Sparkles,
  Sprout,
  Layers
} from 'lucide-react';
import { VoiceMicButton } from '../common/VoiceInputField';
import { FieldSizeSelector, getSavedFieldSizeDefault } from '../common/FieldSizeSelector';

interface WaterAdviceProps {
  lang: Language;
  weather: WeatherData | null;
}

export const WaterAdvice: React.FC<WaterAdviceProps> = ({ lang, weather }) => {
  const signedInFarmer = useMemo(() => getCurrentSignedInFarmer(), []);
  const farmerCropIds = useMemo(() => signedInFarmer?.cropIds || [], [signedInFarmer]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCrop, setSelectedCrop] = useState<string>(() => {
    if (farmerCropIds.length > 0 && ALL_WATER_ADVICE_PLANTS.some((p) => p.id === farmerCropIds[0])) {
      return farmerCropIds[0];
    }
    return 'paddy';
  });
  const [customPlantName, setCustomPlantName] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('tillering');
  const [daysSinceWater, setDaysSinceWater] = useState<number>(4);
  const [fieldSize, setFieldSize] = useState<FieldSizeValue>(() => getSavedFieldSizeDefault());
  const [acres, setAcres] = useState<number>(() => getSavedFieldSizeDefault().acres);

  // Filter plants by category and search query
  const filteredPlants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ALL_WATER_ADVICE_PLANTS.filter((p) => {
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
        return false;
      }
      if (!q) return true;
      return (
        p.name_en.toLowerCase().includes(q) ||
        p.name_or.toLowerCase().includes(q) ||
        (p.name_hi && p.name_hi.toLowerCase().includes(q)) ||
        (p.name_te && p.name_te.toLowerCase().includes(q)) ||
        (p.name_bn && p.name_bn.toLowerCase().includes(q)) ||
        (p.name_ta && p.name_ta.toLowerCase().includes(q)) ||
        p.categoryNameEn.toLowerCase().includes(q) ||
        p.categoryNameOr.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  // Group filtered plants by category for <optgroup>
  const groupedPlants = useMemo(() => {
    const map = new Map<string, { label: string; items: PlantWaterProfile[] }>();
    for (const plant of filteredPlants) {
      const existing = map.get(plant.categoryId);
      const label =
        lang === 'or'
          ? `${plant.categoryNameOr} (${plant.categoryNameEn})`
          : plant.categoryNameEn;
      if (existing) {
        existing.items.push(plant);
      } else {
        map.set(plant.categoryId, { label, items: [plant] });
      }
    }
    return Array.from(map.entries());
  }, [filteredPlants, lang]);

  // Resolve active plant profile (including custom plant fallback)
  const activePlant: PlantWaterProfile = useMemo(() => {
    if (selectedCrop === '__custom__') {
      const fallback = ALL_WATER_ADVICE_PLANTS.find((p) => p.id === 'tomato') || ALL_WATER_ADVICE_PLANTS[0];
      return {
        ...fallback,
        id: '__custom__',
        icon: '🌱',
        name_en: customPlantName.trim() || 'Custom Plant / Crop',
        name_or: customPlantName.trim() || 'ଅନ୍ୟାନ୍ୟ ଗଛ / ଫସଲ'
      };
    }
    return (
      ALL_WATER_ADVICE_PLANTS.find((p) => p.id === selectedCrop) ||
      ALL_WATER_ADVICE_PLANTS[0]
    );
  }, [selectedCrop, customPlantName]);

  // Ensure selectedStage belongs to activePlant.stages
  const activeStageObj = useMemo(() => {
    return (
      activePlant.stages.find((s) => s.id === selectedStage) ||
      activePlant.stages[0]
    );
  }, [activePlant, selectedStage]);

  const recommendedInterval = activeStageObj?.intervalDays || 4;
  const rainProb = weather ? weather.max_rain_probability_12h : 15;

  // Determine decision
  let decision: 'IRRIGATE_NOW' | 'SKIP_RAIN' | 'NOT_YET' = 'NOT_YET';
  if (rainProb >= 45) {
    decision = 'SKIP_RAIN';
  } else if (daysSinceWater >= recommendedInterval) {
    decision = 'IRRIGATE_NOW';
  } else {
    decision = 'NOT_YET';
  }

  const daysRemaining = Math.max(1, recommendedInterval - daysSinceWater);

  // Farmer's registered crops resolved from catalog
  const farmerSavedPlants = useMemo(() => {
    return farmerCropIds
      .map((cid) => ALL_WATER_ADVICE_PLANTS.find((p) => p.id === cid))
      .filter((p): p is PlantWaterProfile => Boolean(p));
  }, [farmerCropIds]);

  const handleSelectPlant = (plantId: string) => {
    setSelectedCrop(plantId);
    const found = ALL_WATER_ADVICE_PLANTS.find((p) => p.id === plantId);
    if (found && found.stages.length > 0) {
      setSelectedStage(found.stages[0].id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-sky-800 to-blue-900 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-400 text-sky-950 flex items-center justify-center shadow-md shrink-0">
              <Droplets className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black">
                {lang === 'or' ? 'ଜଳସେଚନ ପରାମର୍ଶ (Water Advice)' : 'Smart Irrigation & Water Advisory'}
              </h2>
              <p className="text-xs sm:text-sm text-sky-100/90 mt-0.5">
                {lang === 'or'
                  ? `ସମସ୍ତ ${ALL_WATER_ADVICE_PLANTS.length}+ ପ୍ରକାର ଗଛ, ପନିପରିବା, ଫଳ, ଫୁଲ ଓ ଫସଲ ପାଇଁ ସଠିକ୍ ଜଳସେଚନ ସୂଚୀ।`
                  : `Complete stage-wise water schedule for all ${ALL_WATER_ADVICE_PLANTS.length}+ crops, vegetables, fruits, flowers, and trees.`}
              </p>
            </div>
          </div>
          <div className="self-start sm:self-center bg-sky-950/50 border border-sky-400/30 rounded-2xl px-3.5 py-2 text-xs font-bold text-sky-100 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-sky-300 shrink-0" />
            <span>
              {lang === 'or'
                ? `${ALL_WATER_ADVICE_PLANTS.length}+ ଗଛ ଉପଲବ୍ଧ`
                : `${ALL_WATER_ADVICE_PLANTS.length}+ Plants Included`}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4 text-left">
          <h3 className="font-extrabold text-stone-900 text-base pb-2 border-b border-stone-100 flex items-center justify-between">
            <span>{lang === 'or' ? 'ଜଳସେଚନ ପରିମାପକ' : 'Irrigation Parameters'}</span>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              {activePlant.icon} {lang === 'or' ? activePlant.name_or : activePlant.name_en}
            </span>
          </h3>

          {/* Quick-Select for Farmer's Registered Crops */}
          {farmerSavedPlants.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                {lang === 'or' ? 'ଆପଣଙ୍କ ପଞ୍ଜୀକୃତ ଫସଲ:' : 'Your Registered Crops:'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {farmerSavedPlants.map((plant) => {
                  const isActive = selectedCrop === plant.id;
                  return (
                    <button
                      key={plant.id}
                      type="button"
                      onClick={() => handleSelectPlant(plant.id)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isActive
                          ? 'bg-sky-700 text-white border-sky-700 shadow-sm'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-sky-50 hover:border-sky-300'
                      }`}
                    >
                      <span>{plant.icon}</span>
                      <span>{lang === 'or' ? plant.name_or : plant.name_en}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-700" />
              {lang === 'or' ? 'ଗଛ / ଫସଲ ବିଭାଗ (Category):' : 'Plant / Crop Category:'}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                const newCat = e.target.value;
                setSelectedCategory(newCat);
                if (newCat !== 'all') {
                  const firstInCat = ALL_WATER_ADVICE_PLANTS.find((p) => p.categoryId === newCat);
                  if (firstInCat) {
                    handleSelectPlant(firstInCat.id);
                  }
                }
              }}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-sky-600"
            >
              {WATER_ADVICE_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {lang === 'or' ? `${cat.name_or} (${cat.name_en})` : cat.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Search & Select Any Plant */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700">
              {lang === 'or'
                ? 'ଗଛ / ଫସଲ ଖୋଜନ୍ତୁ କିମ୍ବା ବାଛନ୍ତୁ (ସମସ୍ତ ୧୩୦+ ଗଛ):'
                : 'Search or Select Any Plant / Crop (All 130+ Plants):'}
            </label>

            {/* Instant Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  const q = val.trim().toLowerCase();
                  if (q) {
                    const match = ALL_WATER_ADVICE_PLANTS.find(
                      (p) =>
                        p.name_en.toLowerCase().includes(q) ||
                        p.name_or.toLowerCase().includes(q) ||
                        (p.name_hi && p.name_hi.toLowerCase().includes(q))
                    );
                    if (match) {
                      handleSelectPlant(match.id);
                    }
                  }
                }}
                placeholder={
                  lang === 'or'
                    ? 'ଗଛର ନାମ ଲେଖନ୍ତୁ (ଯଥା: ଧାନ, ଟମାଟୋ, ଆମ୍ବ, ଗୋଲାପ, ଛତୁ...)'
                    : 'Search any plant (e.g. Paddy, Mango, Rose, Mushroom, Bamboo...)'
                }
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-stone-800 focus:outline-sky-600"
              />
            </div>

            {/* Grouped Plant Dropdown */}
            <select
              value={selectedCrop}
              onChange={(e) => handleSelectPlant(e.target.value)}
              className="w-full bg-sky-50/60 border border-sky-300 rounded-xl px-3 py-2.5 text-xs font-bold text-stone-900 focus:outline-sky-600"
            >
              {groupedPlants.map(([catId, group]) => (
                <optgroup key={catId} label={group.label}>
                  {group.items.map((plant) => (
                    <option key={plant.id} value={plant.id}>
                      {plant.icon} {getLocalizedPlantName(plant, lang)}
                    </option>
                  ))}
                </optgroup>
              ))}
              <optgroup
                label={
                  lang === 'or'
                    ? '➕ ଅନ୍ୟାନ୍ୟ ଗଛ (ନିଜେ ନାମ ଲେଖନ୍ତୁ)'
                    : '➕ Other / Custom Plant (Enter Name)'
                }
              >
                <option value="__custom__">
                  🌱 {lang === 'or' ? 'ଅନ୍ୟ କୌଣସି ଗଛ / ଫସଲ (Custom Plant)' : 'Other Plant / Crop (Type Custom Name)'}
                </option>
              </optgroup>
            </select>

            {selectedCrop === '__custom__' && (
              <input
                type="text"
                value={customPlantName}
                onChange={(e) => setCustomPlantName(e.target.value)}
                placeholder={
                  lang === 'or'
                    ? 'ଆପଣଙ୍କ ଗଛ ବା ଫସଲର ନାମ ଲେଖନ୍ତୁ...'
                    : 'Enter your plant or crop name...'
                }
                className="w-full bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-900 focus:outline-amber-600"
              />
            )}
          </div>

          {/* Stage Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {lang === 'or' ? 'ଗଛ / ଫସଲର ବର୍ତ୍ତମାନର ଅବସ୍ଥା (Growth Stage):' : 'Plant / Crop Growth Stage:'}
            </label>
            <select
              value={activeStageObj?.id || ''}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-stone-800 focus:outline-sky-600"
            >
              {activePlant.stages.map((stg) => (
                <option key={stg.id} value={stg.id}>
                  {lang === 'or'
                    ? `${stg.label_or} — ପ୍ରତି ${stg.intervalDays} ଦିନରେ`
                    : `${stg.label_en} — Every ${stg.intervalDays} day(s)`}
                </option>
              ))}
            </select>
          </div>

          {/* Days Since Last Irrigation Slider + Voice Number Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <label className="text-xs font-bold text-stone-700">
                {lang === 'or' ? 'ଶେଷ ଜଳସେଚନକୁ କେତେ ଦିନ ହେଲା?' : 'Days Since Last Irrigation:'}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={daysSinceWater}
                  onChange={(e) => setDaysSinceWater(Math.max(0, Math.min(30, Number(e.target.value) || 0)))}
                  className="w-16 text-center bg-sky-50 border border-sky-300 rounded-xl py-1 text-xs font-black text-sky-900"
                />
                <span className="text-xs font-black text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
                  {lang === 'or' ? 'ଦିନ' : 'Day(s)'}
                </span>
              </div>
            </div>
            <VoiceMicButton
              lang={lang}
              expectNumber={true}
              screenTopic="water irrigation advice"
              fieldLabel="days since last irrigation"
              onTranscript={(txt) => {
                const num = parseFloat(txt);
                if (!isNaN(num)) {
                  setDaysSinceWater(Math.max(0, Math.min(30, Math.round(num))));
                }
              }}
              size="sm"
              className="mb-2"
            />
            <input
              type="range"
              min="0"
              max="20"
              value={Math.min(20, daysSinceWater)}
              onChange={(e) => setDaysSinceWater(parseInt(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400">
              <span>{lang === 'or' ? '0 (ଆଜି)' : '0 (Today)'}</span>
              <span>{lang === 'or' ? '10 ଦିନ' : '10 Days'}</span>
              <span>{lang === 'or' ? '20 ଦିନ' : '20 Days'}</span>
            </div>
          </div>

          {/* Field Size Selector */}
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

          {/* Rules Interval badge */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-medium">
              {lang === 'or' ? 'ଏହି ଅବସ୍ଥା ପାଇଁ ନିର୍ଦ୍ଧାରିତ ବ୍ୟବଧାନ:' : 'Standard Stage Interval:'}
            </span>
            <span className="font-black text-stone-900">
              {recommendedInterval} {lang === 'or' ? 'ଦିନରେ ଥରେ' : 'Days'} • {acres} {lang === 'or' ? 'ଏକର' : 'Acre(s)'}
            </span>
          </div>

          {/* Weather Box */}
          {weather && (
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-sky-700" />
                <span className="font-semibold text-sky-950">
                  {lang === 'or' ? 'ଆଗାମୀ ବର୍ଷା ସମ୍ଭାବନା:' : 'Next 12h Rain Forecast:'}
                </span>
              </div>
              <span className="font-black text-sky-800">{rainProb}%</span>
            </div>
          )}
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-7 space-y-4 text-left">
          {decision === 'IRRIGATE_NOW' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-sky-700 text-white shadow-md space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-sky-800 text-amber-300">
                    {lang === 'or' ? 'ପାଣି ଆବଶ୍ୟକ' : 'IRRIGATION DUE'}
                  </span>
                  <h4 className="text-xl font-black mt-0.5">
                    {lang === 'or'
                      ? `${activePlant.icon} ${activePlant.name_or}: ତୁରନ୍ତ ଜଳସେଚନ କରନ୍ତୁ`
                      : `${activePlant.icon} ${activePlant.name_en}: Irrigate Immediately`}
                  </h4>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
                {lang === 'or'
                  ? `ଗତ ଜଳସେଚନକୁ ${daysSinceWater} ଦିନ ବିତିସାରିଛି (${activeStageObj?.label_or} ରେ ପ୍ରତି ${recommendedInterval} ଦିନରେ ପାଣି ଦରକାର)। ଆଗାମୀ ବର୍ଷା ସମ୍ଭାବନା ମାତ୍ର ${rainProb}% ଅଛି, ତେଣୁ ଜମିକୁ ବତର ପାଣି ଦିଅନ୍ତୁ।`
                  : `It has been ${daysSinceWater} days since the last watering (recommended interval for ${activeStageObj?.label_en} is every ${recommendedInterval} days). Rainfall chance is low (${rainProb}%). Provide irrigation to maintain root-zone moisture.`}
              </p>
            </div>
          )}

          {decision === 'SKIP_RAIN' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-amber-600 text-white shadow-md space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <CloudRain className="w-5 h-5 text-white animate-bounce" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-800 text-yellow-200">
                    {lang === 'or' ? 'ବର୍ଷା ସମ୍ଭାବନା' : 'RAIN EXPECTED'}
                  </span>
                  <h4 className="text-xl font-black mt-0.5">
                    {lang === 'or'
                      ? `ପାଣି ଦିଅନ୍ତୁ ନାହିଁ - ବର୍ଷା ସମ୍ଭାବନା (${rainProb}%)`
                      : `Skip Irrigation - Rain Forecast (${rainProb}%)`}
                  </h4>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
                {lang === 'or'
                  ? 'ଆଗାମୀ ୧୨ ରୁ ୨୪ ଘଣ୍ଟା ମଧ୍ୟରେ ଉଲ୍ଲେଖନୀୟ ବର୍ଷା ହେବାର ଆଶଙ୍କା ଅଛି। ବର୍ତ୍ତମାନ କେନାଲ ବା ମୋଟର ପାଣି ମଡ଼ାଇଲେ ବିଲରେ ଜଳବନ୍ଦୀ ହୋଇ ଚେର ପଚିଯାଇପାରେ।'
                  : 'Significant rain probability in the coming 12-24 hours. Natural rain will replenish soil moisture and avoid costly pumping.'}
              </p>
            </div>
          )}

          {decision === 'NOT_YET' && (
            <div className="p-5 sm:p-6 rounded-3xl bg-stone-800 text-white shadow-md space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-stone-700 text-amber-300">
                    {lang === 'or' ? 'ବତର ଅଛି' : 'SOIL MOISTURE ADEQUATE'}
                  </span>
                  <h4 className="text-xl font-black mt-0.5">
                    {lang === 'or'
                      ? `ବର୍ତ୍ତମାନ ଆବଶ୍ୟକ ନାହିଁ (ଆଉ ${daysRemaining} ଦିନ ପରେ)`
                      : `Not Yet Needed (Wait ${daysRemaining} more day(s))`}
                  </h4>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {lang === 'or'
                  ? `${activePlant.name_or} ରେ ଶେଷ ପାଣି ଦେବାକୁ ମାତ୍ର ${daysSinceWater} ଦିନ ହୋଇଛି। ମାଟିରେ ଯଥେଷ୍ଟ ବତର ଥିବାରୁ ଅତିରିକ୍ତ ପାଣି ଦେବାର ଆବଶ୍ୟକତା ନାହିଁ।`
                  : `Soil around ${activePlant.name_en} currently holds adequate root-zone moisture. Next scheduled watering window is in approximately ${daysRemaining} day(s).`}
              </p>
            </div>
          )}

          {/* Plant-Specific Method, Water Requirement & Critical Advisory Card */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{activePlant.icon}</span>
                <div>
                  <h4 className="font-extrabold text-stone-900 text-sm sm:text-base">
                    {lang === 'or'
                      ? `${activePlant.name_or} (${activePlant.name_en}) ଜଳସେଚନ ନିର୍ଦ୍ଦେଶାବଳୀ`
                      : `${activePlant.name_en} Irrigation Guide`}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {lang === 'or' ? activePlant.categoryNameOr : activePlant.categoryNameEn}
                  </p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-sky-800 bg-sky-50 border border-sky-200 px-3 py-1 rounded-xl">
                {activeStageObj?.depthMmOrLitersPerAcre}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-200/80 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {lang === 'or' ? 'ଉପଯୁକ୍ତ ଜଳସେଚନ ପଦ୍ଧତି' : 'Recommended Irrigation Method'}
                </span>
                <p className="text-xs font-bold text-stone-900">
                  {lang === 'or' ? activePlant.method_or : activePlant.method_en}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {lang === 'or' ? 'ଜରୁରୀ ସତର୍କତା' : 'Critical Stage Advisory'}
                </span>
                <p className="text-xs font-bold text-stone-900">
                  {lang === 'or' ? activePlant.critical_note_or : activePlant.critical_note_en}
                </p>
              </div>
            </div>

            {/* All Growth Stages Schedule Table for Selected Plant */}
            <div className="space-y-2 pt-1">
              <h5 className="text-xs font-extrabold text-stone-700">
                {lang === 'or'
                  ? `${activePlant.name_or} ର ସମସ୍ତ ବୃଦ୍ଧି ଅବସ୍ଥା ଅନୁଯାୟୀ ପାଣି ଦେବା ସମୟ:`
                  : `Complete Stage-Wise Watering Schedule for ${activePlant.name_en}:`}
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activePlant.stages.map((stg) => {
                  const isCurrentStage = stg.id === activeStageObj?.id;
                  return (
                    <button
                      key={stg.id}
                      type="button"
                      onClick={() => setSelectedStage(stg.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 ${
                        isCurrentStage
                          ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-500'
                          : 'bg-stone-50/70 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-stone-900 truncate">
                          {lang === 'or' ? stg.label_or : stg.label_en}
                        </p>
                        <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                          {stg.depthMmOrLitersPerAcre}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-black ${
                          isCurrentStage
                            ? 'bg-sky-700 text-white'
                            : 'bg-white text-stone-800 border border-stone-200'
                        }`}
                      >
                        {lang === 'or' ? `${stg.intervalDays} ଦିନ` : `${stg.intervalDays}d`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* General OUAT Water Conservation Tips Card */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200 space-y-3">
            <h4 className="font-extrabold text-stone-900 text-sm">
              {lang === 'or' ? 'ଓୟୁଏଟି ଜଳ ସଂରକ୍ଷଣ ନିୟମ:' : 'OUAT Water Conservation Tips:'}
            </h4>
            <ul className="text-xs text-stone-600 space-y-1.5 list-disc list-inside">
              <li>
                {lang === 'or'
                  ? 'ଧାନରେ ସର୍ବଦା ଗଭୀର ପାଣି ନରଖି ପର୍ଯ୍ୟାୟକ୍ରମେ ଓଦା ଓ ଶୁଖିଲା (AWD) ପଦ୍ଧତି ଆପଣାନ୍ତୁ।'
                  : 'Adopt Alternate Wetting & Drying (AWD) rather than continuous deep flooding in paddy.'}
              </li>
              <li>
                {lang === 'or'
                  ? 'ଖରାବେଳେ ଜଳସେଚନ କଲେ ବାଷ୍ପୀଭବନ ଅଧିକ ହୁଏ; ସକାଳେ ବା ସନ୍ଧ୍ୟାରେ ପାଣି ମଡ଼ାନ୍ତୁ।'
                  : 'Irrigate in early morning or late evening to minimize evaporative losses.'}
              </li>
              <li>
                {lang === 'or'
                  ? 'ଫୁଲ ଓ ଫଳ ଧରିବା ସମୟରେ ମାଟିକୁ ଆଦୌ ଶୁଖିବାକୁ ଦିଅନ୍ତୁ ନାହିଁ ଏବଂ ଗଛ ମୂଳରେ ନଡ଼ା ଆଚ୍ଛାଦନ (Mulching) କରନ୍ତୁ।'
                  : 'Maintain consistent moisture during flowering/fruiting and use organic mulching around plant basins.'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

