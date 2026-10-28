import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../../types';
import { CropItem, CropProblem, ProblemType, getCustomProblemPhoto, saveCustomProblemPhoto } from '../../data/crops/index';
import { X, ChevronLeft, ChevronRight, Camera, Image as ImageIcon, ZoomIn, AlertTriangle, ShieldCheck, ArrowRight, PlusCircle, Check } from 'lucide-react';

interface CropDiseaseModalProps {
  crop: CropItem | null;
  allCrops: CropItem[];
  lang: Language;
  onClose: () => void;
  onSelectCrop: (crop: CropItem) => void;
  onNavigateToAdvice: (cropId: string, diseaseId: string) => void;
  onNavigateToLog?: (product: string, crop: string, dose: string, phi?: number) => void;
}

export const CropDiseaseModal: React.FC<CropDiseaseModalProps> = ({
  crop,
  allCrops,
  lang,
  onClose,
  onSelectCrop,
  onNavigateToAdvice,
  onNavigateToLog
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | ProblemType>('all');
  const [zoomedImage, setZoomedImage] = useState<{
    src: string;
    alt: string;
    namePrimary: string;
    nameEn: string;
    symptomDesc: string;
    credit?: string;
    licence?: string;
    isIllustration?: boolean;
    isVerified?: boolean;
  } | null>(null);
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingForProblemId, setUploadingForProblemId] = useState<string | null>(null);

  // Body scroll locking & ESC listener
  useEffect(() => {
    if (!crop) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomedImage) {
          setZoomedImage(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Load any saved custom photos for current crop's problems
    const photos: Record<string, string> = {};
    crop.problems.forEach((p) => {
      const saved = getCustomProblemPhoto(p.id);
      if (saved) photos[p.id] = saved;
    });
    setCustomPhotos(photos);
    setBrokenImages({});

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [crop, zoomedImage, onClose]);

  if (!crop) return null;

  // Previous and Next crop navigation
  const currentIndex = allCrops.findIndex((c) => c.id === crop.id);
  const prevCrop = currentIndex > 0 ? allCrops[currentIndex - 1] : allCrops[allCrops.length - 1];
  const nextCrop = currentIndex < allCrops.length - 1 ? allCrops[currentIndex + 1] : allCrops[0];

  // Counts per problem type
  const counts = {
    all: crop.problems.length,
    disease: crop.problems.filter((p) => p.type === 'disease').length,
    pest: crop.problems.filter((p) => p.type === 'pest').length,
    nematode: crop.problems.filter((p) => p.type === 'nematode').length,
    weed: crop.problems.filter((p) => p.type === 'weed').length,
    nutrient: crop.problems.filter((p) => p.type === 'nutrient').length
  };

  const filteredProblems = activeFilter === 'all'
    ? crop.problems
    : crop.problems.filter((p) => p.type === activeFilter);

  const handlePhotoUpload = (problemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      saveCustomProblemPhoto(problemId, base64);
      setCustomPhotos((prev) => ({ ...prev, [problemId]: base64 }));
      setBrokenImages((prev) => ({ ...prev, [problemId]: false }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const triggerUpload = (problemId: string) => {
    setUploadingForProblemId(problemId);
    fileInputRef.current?.click();
  };

  const handleAddToLog = (problem: CropProblem) => {
    const treatment = problem.treatments[0];
    if (!treatment) return;
    const productName = treatment.product_en || treatment.product_or;
    const cropName = `${crop.name_en} (${crop.name_or})`;
    const dose = treatment.dose_per_litre;
    const phi = treatment.phi_days;

    if (onNavigateToLog) {
      onNavigateToLog(productName, cropName, dose, phi);
    }
    setCopiedId(problem.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Hidden file input for photo upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (uploadingForProblemId) {
            handlePhotoUpload(uploadingForProblemId, e);
          }
        }}
      />

      {/* Modal / Bottom Sheet Card */}
      <div
        className="bg-emerald-950 text-white w-full max-w-4xl h-[92vh] sm:h-[88vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col border border-emerald-700/60 overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-emerald-950 border-b border-emerald-800/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl sm:text-4xl shrink-0 p-2 rounded-2xl bg-white/10 border border-white/15">
              {crop.icon}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-2xl font-black text-white truncate">
                  {lang === 'or' ? crop.name_or : crop.name_en}
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-stone-950">
                  {crop.category}
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 italic truncate mt-0.5">
                {crop.scientific_name} • {lang === 'or' ? crop.soil_type_or : crop.soil_type_en}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Previous / Next Crop Navigator Strip */}
        <div className="px-4 py-2 bg-emerald-900/60 border-b border-emerald-800/50 flex items-center justify-between text-xs font-bold shrink-0">
          <button
            onClick={() => onSelectCrop(prevCrop)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="truncate max-w-[120px] sm:max-w-none">
              {lang === 'or' ? prevCrop.name_or : prevCrop.name_en}
            </span>
          </button>

          <span className="text-[11px] text-emerald-300 font-mono">
            {currentIndex + 1} / {allCrops.length}
          </span>

          <button
            onClick={() => onSelectCrop(nextCrop)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 transition-colors cursor-pointer"
          >
            <span className="truncate max-w-[120px] sm:max-w-none">
              {lang === 'or' ? nextCrop.name_or : nextCrop.name_en}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Problem Filter Tabs Strip */}
        <div className="px-4 py-2.5 bg-emerald-950/90 border-b border-emerald-800/40 flex items-center gap-1.5 overflow-x-auto text-xs font-bold shrink-0 scrollbar-none">
          {[
            { id: 'all', label_en: 'All', label_or: 'ସମସ୍ତ', count: counts.all },
            { id: 'disease', label_en: 'Diseases', label_or: 'ରୋଗ', count: counts.disease },
            { id: 'pest', label_en: 'Pests', label_or: 'ପୋକ', count: counts.pest },
            { id: 'nematode', label_en: 'Nematodes', label_or: 'କୃମି', count: counts.nematode },
            { id: 'weed', label_en: 'Weeds', label_or: 'ଘାସ', count: counts.weed },
            { id: 'nutrient', label_en: 'Nutrient Deficiency', label_or: 'ସାର ଅଭାବ', count: counts.nutrient }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-amber-400 text-stone-950 shadow-md font-black'
                  : 'bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800/80'
              }`}
            >
              <span>{lang === 'or' ? tab.label_or : tab.label_en}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeFilter === tab.id ? 'bg-stone-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-left">
          {/* Yellow Section Title */}
          <div className="flex items-center justify-between pb-2 border-b border-emerald-800/60">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
              <span>🌾</span>
              <span>
                {lang === 'or'
                  ? 'ପ୍ରମାଣିତ ରୋଗ ନିୟନ୍ତ୍ରଣ ଓ ସ୍ପ୍ରେ ମାତ୍ରା (OUAT REMEDIES)'
                  : 'VERIFIED CROP DISEASE CONTROL & SPRAY DOSAGE (OUAT REMEDIES)'}
              </span>
            </h4>
            <span className="text-[11px] text-emerald-300 font-medium">
              {filteredProblems.length} {lang === 'or' ? 'ଗୋଟି ସମସ୍ୟା' : 'problems'}
            </span>
          </div>

          {crop.problems.length === 0 ? (
            <div className="p-8 text-center bg-emerald-900/30 rounded-2xl border border-emerald-800 text-emerald-200 text-xs space-y-1">
              <p className="font-extrabold text-amber-300 text-sm">No photo yet</p>
              <p className="text-emerald-300/90">
                {lang === 'or'
                  ? `${crop.name_or} (${crop.name_en}) ପାଇଁ ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ରୋଗ ତାଲିକା କିମ୍ବା ଫଟୋ ଯୋଡ଼ାଯାଇ ନାହିଁ।`
                  : `No disease entries or reference photos have been added yet for ${crop.name_en} (${crop.name_or}).`}
              </p>
            </div>
          ) : filteredProblems.length === 0 ? (
            <div className="p-8 text-center bg-emerald-900/30 rounded-2xl border border-emerald-800 text-emerald-300 text-xs">
              {lang === 'or' ? 'ଏହି ଶ୍ରେଣୀରେ କୌଣସି ସମସ୍ୟା ମିଳିଲା ନାହିଁ।' : 'No records found in this category.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProblems.map((prob) => {
                const treatment = prob.treatments[0];
                const refImageObj = prob.reference_images && prob.reference_images.length > 0 ? prob.reference_images[0] : null;
                const photoFile = refImageObj?.file || refImageObj?.url || prob.image;
                const activePhoto = customPhotos[prob.id] || photoFile;
                const showPhoto = Boolean(activePhoto && !brokenImages[prob.id]);
                const altText = refImageObj?.alt || `${prob.name_en} (${prob.name_or})`;
                const licenceText = refImageObj?.licence || refImageObj?.license || 'AI-generated, team-owned';
                const creditText = refImageObj?.credit || refImageObj?.source || 'Krushak Bani Odisha Team';
                const isIllustration = !customPhotos[prob.id] && licenceText.toLowerCase().includes('ai-generated');
                const isPictureVerified = Boolean(
                  (prob.verified_by && prob.verified_date) ||
                  (refImageObj?.verified_by && refImageObj?.verified_date)
                );
                const isDoseVerified = Boolean(treatment?.verified_by && treatment?.verified_date);
                const doseSource = treatment?.source || 'OUAT / ICAR Package of Practices';

                const openZoomModal = () => {
                  if (!activePhoto) return;
                  setZoomedImage({
                    src: activePhoto,
                    alt: altText,
                    namePrimary: prob.name_or,
                    nameEn: prob.name_en,
                    symptomDesc: lang === 'or' ? prob.symptoms_or : prob.symptoms_en,
                    credit: creditText,
                    licence: licenceText,
                    isIllustration,
                    isVerified: isPictureVerified,
                  });
                };

                return (
                  <div
                    key={prob.id}
                    className="bg-emerald-900/70 border border-emerald-700/60 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 shadow-md hover:border-emerald-500 transition-colors"
                  >
                    {/* Top of Card: Reference Photo (if present & valid) + Disease Name in Farmer's Language and English */}
                    <div className="space-y-2.5">
                      {showPhoto && (
                        <div className="space-y-1.5">
                          <div className="relative group w-full h-36 sm:h-40 rounded-xl overflow-hidden border border-emerald-700/80">
                            <img
                              src={activePhoto}
                              alt={altText}
                              onClick={openZoomModal}
                              onError={() => setBrokenImages((prev) => ({ ...prev, [prob.id]: true }))}
                              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                            />
                            {isIllustration && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-400 text-stone-950 text-[10px] font-black shadow-xs">
                                Illustration, not a real photo
                              </span>
                            )}
                            <button
                              onClick={openZoomModal}
                              className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/70 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-black/90 transition-colors cursor-pointer"
                              title="Tap to view larger photo and symptoms"
                            >
                              <ZoomIn className="w-3 h-3" />
                              <span>{lang === 'or' ? 'ବଡ଼ କରି ଦେଖନ୍ତୁ' : 'Tap to Enlarge'}</span>
                            </button>
                            {licenceText && (
                              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/65 text-emerald-200 text-[9px] font-medium">
                                {licenceText}
                              </span>
                            )}
                          </div>
                          {!isPictureVerified && (
                            <p className="text-[10px] font-bold text-amber-300 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>Picture to be verified</span>
                            </p>
                          )}
                        </div>
                      )}

                      {/* Header Info + Text Fallback when photo is missing (shows disease name only, never a blank box) */}
                      <div>
                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                prob.severity === 'High'
                                  ? 'bg-red-500 text-white'
                                  : prob.severity === 'Medium'
                                  ? 'bg-amber-400 text-stone-950'
                                  : 'bg-emerald-400 text-stone-950'
                              }`}
                            >
                              {prob.severity} Severity
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-white/10 text-emerald-200">
                              {prob.type}
                            </span>
                          </div>

                          <button
                            onClick={() => triggerUpload(prob.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 hover:text-amber-300 transition-colors cursor-pointer"
                          >
                            <Camera className="w-3 h-3" />
                            <span>{showPhoto ? (lang === 'or' ? 'ଫଟୋ ବଦଳାନ୍ତୁ' : 'Replace Photo') : (lang === 'or' ? '+ ଫଟୋ ଯୋଡ଼ନ୍ତୁ' : '+ Upload Photo')}</span>
                          </button>
                        </div>

                        {/* Disease Name in Farmer's Language and in English below the photo */}
                        <h5 className="font-extrabold text-sm sm:text-base text-amber-300 mt-1.5 leading-snug">
                          {prob.name_or}
                        </h5>
                        <p className="text-xs text-emerald-100/90 font-semibold">
                          {prob.name_en}
                        </p>
                      </div>
                    </div>

                    {/* Symptoms Description */}
                    <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs space-y-1">
                      <p className="font-bold text-emerald-300 text-[11px]">
                        🔍 {lang === 'or' ? 'ରୋଗ ଲକ୍ଷଣ:' : 'Symptoms:'}
                      </p>
                      <p className="text-emerald-100/90 leading-relaxed text-[11px]">
                        {lang === 'or' ? prob.symptoms_or : prob.symptoms_en}
                      </p>
                    </div>

                    {/* OUAT Treatment Box */}
                    {treatment && (
                      <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-700/80 text-xs space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-amber-400 block">
                              💊 {lang === 'or' ? 'ଅନୁମୋଦିତ ଔଷଧ / କୀଟନାଶକ:' : 'Recommended Product:'}
                            </span>
                            <span className="font-extrabold text-white text-xs sm:text-sm">
                              {lang === 'or' ? treatment.product_or : treatment.product_en}
                            </span>
                            <span className="block text-[10px] text-emerald-300/80 font-mono">
                              ({treatment.active_ingredient})
                            </span>
                          </div>

                          {/* PHI Badge */}
                          <div className="text-right shrink-0 bg-white/10 px-2 py-1 rounded-lg border border-white/15">
                            <span className="text-[9px] uppercase font-bold text-amber-300 block">
                              PHI (ଅମଳ ବ୍ୟବଧାନ)
                            </span>
                            <span className="font-black text-xs text-white">
                              {treatment.phi_days} {lang === 'or' ? 'ଦିନ' : 'Days'}
                            </span>
                          </div>
                        </div>

                        {/* Unverified Dose Sample Label */}
                        {!isDoseVerified && (
                          <div className="px-2 py-1 rounded-lg bg-amber-400/20 border border-amber-400/60 text-amber-200 text-[10px] font-extrabold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                            <span>SAMPLE: verify with the label or OUAT/ICAR</span>
                          </div>
                        )}

                        {/* Dosage Ratios */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-emerald-800/80">
                          <div className="bg-emerald-900/50 p-1.5 rounded-lg">
                            <span className="text-[10px] text-emerald-300 block font-bold">
                              {lang === 'or' ? 'ଲିଟର ପିଛା:' : 'Per Litre:'}
                            </span>
                            <span className="font-black text-amber-200">
                              {treatment.dose_per_litre}
                            </span>
                          </div>
                          <div className="bg-emerald-900/50 p-1.5 rounded-lg">
                            <span className="text-[10px] text-emerald-300 block font-bold">
                              {lang === 'or' ? '୨୦୦ ଲିଟର (ଏକର):' : 'Per 200 L (Acre):'}
                            </span>
                            <span className="font-black text-amber-200">
                              {treatment.dose_per_200L}
                            </span>
                          </div>
                        </div>

                        {/* Mandatory Follow Product Label & Dose Source Attribution */}
                        <div className="pt-1 border-t border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-emerald-200">
                          <span className="font-bold text-amber-300">
                            📋 {lang === 'or' ? 'Follow the product label (ଡବା ଲେବଲ୍ ଅନୁସରଣ କରନ୍ତୁ)' : 'Follow the product label'}
                          </span>
                          <span className="text-emerald-300/90">
                            Source: {doseSource}
                          </span>
                        </div>

                        {/* Organic Alternative */}
                        {treatment.organic_alternative_en && (
                          <div className="p-2 rounded-lg bg-emerald-900/30 border border-emerald-700/50 text-[11px] text-emerald-200">
                            <span className="font-bold text-emerald-300">
                              🌿 {lang === 'or' ? 'ଜୈବିକ ବିକଳ୍ପ:' : 'Organic / Bio Option:'}
                            </span>{' '}
                            <span>
                              {lang === 'or' ? treatment.organic_alternative_or || treatment.organic_alternative_en : treatment.organic_alternative_en}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons: Spray Calculator & Spray Log */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => onNavigateToAdvice(crop.id, prob.id)}
                        className="py-2.5 px-3 bg-amber-400 hover:bg-amber-300 active:scale-98 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>{lang === 'or' ? 'ସ୍ପ୍ରେ କ୍ୟାଲକୁଲେଟରକୁ ନିଅନ୍ତୁ →' : 'Take to Spray Calculator →'}</span>
                      </button>

                      <button
                        onClick={() => handleAddToLog(prob)}
                        className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-600 active:scale-98 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-emerald-500/50"
                      >
                        {copiedId === prob.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-amber-300" />
                            <span className="text-amber-300">{lang === 'or' ? 'ଯୋଡ଼ାଗଲା!' : 'Added!'}</span>
                          </>
                        ) : (
                          <>
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>{lang === 'or' ? 'Add to Spray Log' : 'Add to Spray Log'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Full-Screen Photo Zoom Lightbox Modal with Symptom Description in Farmer's Language */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-lg w-full bg-emerald-950 border border-emerald-700 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col items-center space-y-3 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-start justify-between gap-2">
              <div>
                <h4 className="text-white text-base sm:text-lg font-extrabold">
                  {zoomedImage.namePrimary}
                </h4>
                <p className="text-emerald-300 text-xs font-semibold">
                  {zoomedImage.nameEn}
                </p>
              </div>
              <button
                onClick={() => setZoomedImage(null)}
                className="p-2 rounded-full bg-white/15 text-white hover:bg-white/30 cursor-pointer"
                aria-label="Close enlarged photo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full space-y-1.5">
              <div className="relative w-full">
                <img
                  src={zoomedImage.src}
                  alt={zoomedImage.alt}
                  className="max-h-[52vh] w-full rounded-2xl shadow-lg object-contain bg-black/40 border border-white/15"
                />
                {zoomedImage.isIllustration && (
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-amber-400 text-stone-950 text-xs font-black shadow-md">
                    Illustration, not a real photo
                  </span>
                )}
              </div>
              {!zoomedImage.isVerified && (
                <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Picture to be verified</span>
                </p>
              )}
            </div>

            <div className="w-full p-3 rounded-2xl bg-emerald-900/80 border border-emerald-700 text-xs space-y-1">
              <p className="font-bold text-amber-300">
                🔍 {lang === 'or' ? 'ରୋଗର ମୁଖ୍ୟ ଲକ୍ଷଣ:' : 'Symptom Description:'}
              </p>
              <p className="text-white leading-relaxed">
                {zoomedImage.symptomDesc}
              </p>
              {(zoomedImage.credit || zoomedImage.licence) && (
                <p className="text-[10px] text-emerald-300/90 pt-1 border-t border-emerald-800 mt-1">
                  Credit: {zoomedImage.credit} • Licence: {zoomedImage.licence}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
