import React, { useState, useRef } from 'react';
import { Language } from '../../types';
import { analyzeCropImage, DiagnosisResult } from '../../services/cropDoctorService';
import { ALL_CROPS_DATABASE, CROP_CATEGORIES, CropItem, getDiseaseReferenceImage, getDoseVerificationInfo } from '../../data/crops/index';
import { CropDiseaseModal } from './CropDiseaseModal';
import { addAdviceHistoryLocalFirst } from '../../services/localFirstSyncEngine';
import { Camera, Upload, AlertCircle, CheckCircle2, ArrowRight, RefreshCw, Sparkles, HelpCircle, ShieldAlert, Search, Sprout, ZoomIn, X, AlertTriangle } from 'lucide-react';
import { VoiceMicButton } from '../common/VoiceInputField';

interface CropDoctorProps {
  lang: Language;
  onNavigateToAdvice: (cropId: string, diseaseId: string) => void;
  onNavigateToLog?: (product: string, crop: string, dose: string, phi?: number) => void;
}

export const CropDoctor: React.FC<CropDoctorProps> = ({ lang, onNavigateToAdvice, onNavigateToLog }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [diagImgBroken, setDiagImgBroken] = useState(false);
  const [enlargedDiagPhoto, setEnlargedDiagPhoto] = useState<{
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
  const [plantCategory, setPlantCategory] = useState<string>('all');
  const [plantSearch, setPlantSearch] = useState<string>('');
  const [selectedCropForModal, setSelectedCropForModal] = useState<CropItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample diseased leaf images for instant desktop/mobile testing across Paddy and Non-Paddy crops
  const sampleLeaves = [
    {
      name_en: "Rice Blast (ଧାନ ଚିଟା)",
      disease_id: "rice_blast",
      crop_id: "paddy",
      color: "#854d0e",
      desc: "Paddy: Spindle spot on leaf",
      svg: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" fill="#4d7c0f" />
          <path d="M 50 10 Q 55 50 50 90" stroke="#a3e635" strokeWidth="3" fill="none" />
          <ellipse cx="50" cy="45" rx="14" ry="24" fill="#78350f" transform="rotate(-15 50 45)" />
          <ellipse cx="50" cy="45" rx="8" ry="16" fill="#d1d5db" transform="rotate(-15 50 45)" />
          <ellipse cx="50" cy="70" rx="10" ry="18" fill="#78350f" />
          <ellipse cx="50" cy="70" rx="5" ry="10" fill="#e5e7eb" />
        </svg>
      )
    },
    {
      name_en: "Tomato Early Blight (ବିଲାତି ପତ୍ରପୋଡ଼ା)",
      disease_id: "tomato_early_blight",
      crop_id: "tomato",
      color: "#ca8a04",
      desc: "Tomato: Target-board rings",
      svg: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" fill="#3f6212" />
          <circle cx="50" cy="50" r="26" fill="#facc15" />
          <circle cx="50" cy="50" r="20" fill="#451a03" />
          <circle cx="50" cy="50" r="13" stroke="#a16207" strokeWidth="3" fill="#292524" />
          <circle cx="50" cy="50" r="6" stroke="#d6d3d1" strokeWidth="2" fill="#1c1917" />
        </svg>
      )
    },
    {
      name_en: "Groundnut Tikka (ବାଦାମ ଟିକ୍କା)",
      disease_id: "tikka_disease",
      crop_id: "groundnut",
      color: "#9a3412",
      desc: "Groundnut: Dark spot + halo",
      svg: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" fill="#4d7c0f" />
          <circle cx="35" cy="30" r="10" fill="#facc15" />
          <circle cx="35" cy="30" r="7" fill="#1c1917" />
          <circle cx="65" cy="55" r="12" fill="#facc15" />
          <circle cx="65" cy="55" r="9" fill="#1c1917" />
          <circle cx="45" cy="75" r="8" fill="#facc15" />
          <circle cx="45" cy="75" r="5" fill="#1c1917" />
        </svg>
      )
    },
    {
      name_en: "Healthy Leaf (ସୁସ୍ଥ ପତ୍ର)",
      disease_id: "healthy_leaf",
      crop_id: "paddy",
      color: "#15803d",
      desc: "Deep green clean venation",
      svg: (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" fill="#15803d" />
          <path d="M 50 0 L 50 100" stroke="#86efac" strokeWidth="3" />
          <path d="M 50 30 Q 80 20 90 25" stroke="#86efac" strokeWidth="1.5" fill="none" />
          <path d="M 50 60 Q 20 50 10 55" stroke="#86efac" strokeWidth="1.5" fill="none" />
        </svg>
      )
    }
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setAnalyzing(true);
    setResult(null);
    setDiagImgBroken(false);

    try {
      const diag = await analyzeCropImage(file);
      setResult(diag);
      addAdviceHistoryLocalFirst({
        type: 'crop_doctor',
        cropName: diag.crop_id,
        summary: `${diag.disease_name_en} (${diag.confidence_percentage}%)`,
        recommendation: diag.summary_en,
      }).catch(() => {});
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTestSample = async (sample: typeof sampleLeaves[0]) => {
    setAnalyzing(true);
    setResult(null);
    setDiagImgBroken(false);

    // Create synthetic file from SVG canvas
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (sample.disease_id === 'rice_blast') {
        ctx.fillStyle = '#4d7c0f';
        ctx.fillRect(0, 0, 224, 224);
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(112, 100, 35, 58, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d1d5db';
        ctx.beginPath();
        ctx.ellipse(112, 100, 15, 30, -0.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (sample.disease_id === 'tomato_early_blight') {
        ctx.fillStyle = '#3f6212';
        ctx.fillRect(0, 0, 224, 224);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(20, 20, 90, 90);
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(90, 90, 75, 75);
      } else if (sample.disease_id === 'tikka_disease') {
        ctx.fillStyle = '#4d7c0f';
        ctx.fillRect(0, 0, 224, 224);
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(30, 30, 85, 85);
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(115, 115, 70, 70);
      } else {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(0, 0, 224, 224);
      }
    }

    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg'));
    const testFile = new File([blob], `${sample.disease_id}.jpg`, { type: 'image/jpeg' });
    setSelectedImage(canvas.toDataURL());

    const diag = await analyzeCropImage(testFile);
    setResult(diag);
    setAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/60 text-amber-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>MobileNetV2 PlantVillage Architecture + OUAT Diagnostics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {lang === 'or' ? 'ଶସ୍ୟ ଡାକ୍ତର (Crop Doctor AI)' : 'Crop Doctor: Instant Plant Disease AI'}
            </h2>
            <p className="text-emerald-100/90 text-xs sm:text-sm mt-1 max-w-2xl">
              {lang === 'or'
                ? 'ରୋଗାକ୍ରାନ୍ତ ପତ୍ରର ଫଟୋ ଉଠାନ୍ତୁ କିମ୍ବା ଅପଲୋଡ କରନ୍ତୁ। ଆମର AI ମଡେଲ ରୋଗ ଚିହ୍ନଟ କରି ତୁରନ୍ତ OUAT ଅନୁମୋଦିତ କୀଟନାଶକ ପରାମର୍ଶ ଦେବ।'
                : 'Upload or capture an affected leaf photo. Our vision model classifies the disease with confidence scoring and links directly to verified OUAT chemical advice.'}
            </p>
          </div>
        </div>
      </div>

      {/* Upload & Camera Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Left Upload Card */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50/80 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[220px]"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-3">
              <Camera className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h3 className="font-extrabold text-stone-900 text-base">
              {lang === 'or' ? 'ଫଟୋ ଉଠାନ୍ତୁ ବା ଅପଲୋଡ କରନ୍ତୁ' : 'Take Photo or Upload Leaf'}
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-xs">
              {lang === 'or'
                ? 'ମୋବାଇଲ କ୍ୟାମେରା ବ୍ୟବହାର କରି ବିଲରେ ଥିବା ପତ୍ରର ଫଟୋ ନିଅନ୍ତୁ'
                : 'Use device camera or browse local gallery (PNG, JPG)'}
            </p>
            <button className="mt-4 px-4 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold shadow-xs hover:bg-emerald-900 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              <span>{lang === 'or' ? 'ଫାଇଲ ବାଛନ୍ତୁ' : 'Select Leaf Image'}</span>
            </button>
          </div>

          {/* Right Image Preview or Sample Select */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {lang === 'or' ? 'କିମ୍ବା ପରୀକ୍ଷା ପାଇଁ ନମୁନା ବାଛନ୍ତୁ:' : 'Or Select a Test Sample:'}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {sampleLeaves.map((sample) => (
                <button
                  key={sample.disease_id}
                  onClick={() => handleTestSample(sample)}
                  className="p-2.5 rounded-2xl border border-stone-200 hover:border-emerald-400 bg-stone-50 hover:bg-emerald-50/60 text-left transition-all flex items-center gap-2.5 group"
                >
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-xs border border-stone-200">
                    {sample.svg}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-stone-900 truncate group-hover:text-emerald-800">
                      {sample.name_en}
                    </p>
                    <p className="text-[10px] text-stone-500 truncate">{sample.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {selectedImage && (
              <div className="mt-4 pt-3 border-t border-stone-200 flex items-center gap-3">
                <img
                  src={selectedImage}
                  alt="Selected Leaf"
                  className="w-16 h-16 rounded-xl object-cover border border-emerald-300 shadow-sm"
                />
                <div>
                  <p className="text-xs font-bold text-stone-800">
                    {lang === 'or' ? 'ଆପଣଙ୍କ ଅପଲୋଡ ହୋଇଥିବା ପତ୍ର' : 'Active Test Leaf'}
                  </p>
                  <p className="text-[11px] text-stone-500">
                    {analyzing
                      ? (lang === 'or' ? 'ବିଶ୍ଳେଷଣ ଚାଲିଛି...' : 'Evaluating with MobileNetV2...')
                      : (lang === 'or' ? 'ବିଶ୍ଳେଷଣ ସମ୍ପୂର୍ଣ୍ଣ' : 'Evaluation Ready')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analyzing Loader */}
      {analyzing && (
        <div className="p-8 bg-white rounded-3xl border border-emerald-200 text-center flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mb-2" />
          <p className="font-bold text-stone-800 text-sm">
            {lang === 'or' ? 'ପତ୍ରର ଲକ୍ଷଣ ବିଶ୍ଳେଷଣ କରାଯାଉଛି...' : 'Running MobileNetV2 Vision Inference...'}
          </p>
          <p className="text-xs text-stone-500 mt-1">
            {lang === 'or' ? 'କନଫିଡେନ୍ସ ସ୍କୋର ଓ ରୋଗ ଯାଞ୍ଚ ହେଉଛି' : 'Checking confidence threshold (>65%) & disease classes'}
          </p>
        </div>
      )}

      {/* Diagnosis Results Card */}
      {result && !analyzing && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border-2 border-emerald-500/80 animate-in fade-in duration-300">
          {result.status === 'NOT_SURE' ? (
            /* Requirement 5: If confidence is below set value, return "not sure" */
            <div className="text-left space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900">
                <HelpCircle className="w-8 h-8 text-amber-600 shrink-0" />
                <div>
                  <div className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200 text-amber-900">
                    {lang === 'or' ? 'କନଫିଡେନ୍ସ ୬୫% ରୁ କମ - ନିଶ୍ଚିତ ନୁହେଁ' : 'CONFIDENCE BELOW 65% - NOT SURE'}
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-amber-950 mt-1">
                    {lang === 'or' ? result.disease_name_or : result.disease_name_en}
                  </h3>
                  <p className="text-xs text-amber-800 mt-1">
                    {lang === 'or' ? result.summary_or : result.summary_en}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-700 text-xs space-y-2">
                <p className="font-bold text-stone-900">
                  {lang === 'or' ? 'ଉନ୍ନତ ଫଳାଫଳ ପାଇଁ ପରାମର୍ଶ:' : 'Recommendations for clear diagnosis:'}
                </p>
                <ul className="list-disc list-inside space-y-1 text-stone-600">
                  <li>{lang === 'or' ? 'ପତ୍ରର ନିକଟତର ହୋଇ ସ୍ପଷ୍ଟ ଆଲୋକରେ ଫଟୋ ନିଅନ୍ତୁ।' : 'Capture a close-up photo in clear, bright sunlight.'}</li>
                  <li>{lang === 'or' ? 'କ୍ୟାମେରା ହଲେଇବେ ନାହିଁ ଏବଂ ଛାଇ ପକାନ୍ତୁ ନାହିଁ।' : 'Avoid hand blur and cast shadows over the lesion area.'}</li>
                  <li>{lang === 'or' ? 'ରୋଗର ଦାଗ ଫ୍ରେମର ଅଧାରୁ ଅଧିକ ସ୍ଥାନ ନେବା ଆବଶ୍ୟକ।' : 'Ensure the diseased spots occupy at least 50% of the frame.'}</li>
                </ul>
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>{lang === 'or' ? 'ପୁଣି ଥରେ ଫଟୋ ଉଠାନ୍ତୁ' : 'Retake Photograph'}</span>
              </button>
            </div>
          ) : (() => {
            const refImg = getDiseaseReferenceImage(result.disease_id, result.disease_name_en, result.crop_id);
            const doseMeta = getDoseVerificationInfo(result.crop_id, result.disease_id);
            const showRefPhoto = Boolean(refImg?.file && !diagImgBroken);
            const altText = refImg?.alt || `${result.disease_name_or} - ${result.disease_name_en}`;
            const isIllustration = Boolean(refImg?.licence && refImg.licence.toLowerCase().includes('ai-generated'));
            const isPhotoVerified = Boolean(refImg?.verified_by && refImg?.verified_date);

            const openDiagPhotoModal = () => {
              if (!refImg?.file) return;
              setEnlargedDiagPhoto({
                src: refImg.file,
                alt: altText,
                nameOr: result.disease_name_or,
                nameEn: result.disease_name_en,
                symptomDesc: lang === 'or' ? result.summary_or : result.summary_en,
                credit: refImg.credit,
                licence: refImg.licence,
                isIllustration,
                isPhotoVerified,
              });
            };

            return (
              /* Successful Diagnosis */
              <div className="space-y-5 text-left">
                {/* Reference Photo at the top of the card (or text-only fallback if missing, never a blank box) */}
                {showRefPhoto && refImg && (
                  <div className="space-y-1.5">
                    <div className="relative group w-full sm:max-w-md h-44 rounded-2xl overflow-hidden border border-emerald-200 shadow-xs">
                      <img
                        src={refImg.file}
                        alt={altText}
                        onClick={openDiagPhotoModal}
                        onError={() => setDiagImgBroken(true)}
                        className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      />
                      {isIllustration && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-950/85 text-amber-200 text-[10px] font-bold border border-amber-400/40">
                          Illustration, not a real photo
                        </span>
                      )}
                      <button
                        onClick={openDiagPhotoModal}
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

                {/* Header with Name in Farmer's Language and English below the photo + confidence meter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {lang === 'or' ? 'ରୋଗ ଚିହ୍ନଟ ହୋଇଛି' : 'Disease Diagnosed'}
                      </span>
                      <span className="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full font-medium">
                        {result.ai_provider}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
                      {result.disease_name_or}
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-stone-600">
                      {result.disease_name_en}
                    </p>
                  </div>

                  {/* Confidence Bar */}
                  <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-right min-w-[150px]">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1">
                      <span>{lang === 'or' ? 'ନିର୍ଭୁଲତା' : 'Confidence'}</span>
                      <span className="text-emerald-700">{result.confidence_percentage}%</span>
                    </div>
                    <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${result.confidence_percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                    {lang === 'or' ? result.summary_or : result.summary_en}
                  </p>
                </div>

                {/* OUAT Chemical Recommendation Preview */}
                {result.recommended_chemical_en && result.disease_id !== 'healthy_leaf' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                      <p className="text-[11px] font-bold text-stone-500 uppercase">
                        {lang === 'or' ? 'ଅନୁମୋଦିତ କୀଟନାଶକ (OUAT)' : 'Recommended Chemical'}
                      </p>
                      <p className="text-sm font-extrabold text-stone-900">
                        {lang === 'or' ? result.recommended_chemical_or : result.recommended_chemical_en}
                      </p>
                      <p className="text-xs text-emerald-800 font-semibold">
                        {lang === 'or' ? `ମାତ୍ରା: ଲିଟର ପିଛା ${result.dose_per_litre}` : `Dose: ${result.dose_per_litre} / Litre water`}
                      </p>
                      {!doseMeta.isVerified && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-extrabold">
                          <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>SAMPLE: verify with the label or OUAT/ICAR</span>
                        </div>
                      )}
                      <p className="text-[11px] font-bold text-stone-700">
                        📋 {lang === 'or' ? 'Follow the product label (ଡବା ଲେବଲ୍ ଅନୁସରଣ କରନ୍ତୁ)' : 'Follow the product label'}
                      </p>
                      <p className="text-[10px] text-stone-500">
                        Source: {doseMeta.source}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                      <p className="text-[11px] font-bold text-stone-500 uppercase">
                        {lang === 'or' ? 'ଫସଲ ଅମଳ ସୁରକ୍ଷା ସମୟ (PHI)' : 'Pre-Harvest Interval (PHI)'}
                      </p>
                      <p className="text-sm font-extrabold text-stone-900 mt-0.5">
                        {result.phi_days} {lang === 'or' ? 'ଦିନ' : 'Days'}
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        {lang === 'or' ? 'ସ୍ପ୍ରେ ପରେ ଏତେ ଦିନ ପର୍ଯ୍ୟନ୍ତ ଫସଲ ତୋଳନ୍ତୁ ନାହିଁ' : 'Wait this many days before harvesting'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Link: Link output to Pesticide Advice */}
                <div className="pt-2">
                  {result.disease_id !== 'healthy_leaf' ? (
                    <button
                      onClick={() => onNavigateToAdvice(result.crop_id, result.disease_id)}
                      className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-extrabold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                    >
                      <span>
                        {lang === 'or'
                          ? 'ପାଣିପାଗ ଯାଞ୍ଚ କରି ସ୍ପ୍ରେ ପରାମର୍ଶ ଦେଖନ୍ତୁ'
                          : 'Check Weather & Get Full Spray Advice'}
                      </span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-semibold text-center">
                      {lang === 'or'
                        ? 'ଆପଣଙ୍କ ଫସଲ ସୁସ୍ଥ ଅଛି। କୌଣସି କୀଟନାଶକ ସ୍ପ୍ରେ ଆବଶ୍ୟକ ନାହିଁ।'
                        : 'Crop foliage is healthy. No chemical spraying is needed at this time.'}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Comprehensive Pan-India Agricultural Crop Diagnostic Library */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4 text-left">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs">
                  🌾 ସସ୍ୟ ଡାକ୍ତର (Sasya Daktar)
                </span>
                <h3 className="font-extrabold text-base sm:text-lg text-stone-900">
                  {lang === 'or'
                    ? 'ଭାରତର ସମସ୍ତ ଫସଲ, ପନିପରିବା ଓ ଉଦ୍ଭିଦ ରୋଗ ନିଦାନ'
                    : 'All Indian Crops, Vegetables & Plant Diagnostics'}
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {lang === 'or'
                  ? 'ଯେକୌଣସି ଫସଲ ଚୟନ କରି ରୋଗ ଲକ୍ଷଣ ଓ ପ୍ରମାଣିତ OUAT ଔଷଧ ମାତ୍ରା ପପ୍-ଅପ୍ ରେ ଦେଖନ୍ତୁ।'
                  : 'Select any grain, pulse, oilseed, vegetable, fruit, cash crop, flower or tree to inspect symptoms & verified OUAT remedies.'}
              </p>
            </div>

            <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl self-start sm:self-auto border border-emerald-200">
              <span>{ALL_CROPS_DATABASE.length} {lang === 'or' ? 'ଗୋଟି ଫସଲ ଉପଲବ୍ଧ' : 'Crops Available'}</span>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs font-bold scrollbar-none">
            {CROP_CATEGORIES.map((cat) => {
              const count = cat.id === 'all'
                ? ALL_CROPS_DATABASE.length
                : ALL_CROPS_DATABASE.filter((c) => c.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setPlantCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    plantCategory === cat.id
                      ? 'bg-emerald-800 text-white shadow-sm font-black'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{lang === 'or' ? cat.name_or : cat.name_en}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    plantCategory === cat.id ? 'bg-amber-400 text-stone-950 font-black' : 'bg-stone-200/80 text-stone-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search input + Voice Mic Button */}
        <div className="flex items-start gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={plantSearch}
              onChange={(e) => setPlantSearch(e.target.value)}
              placeholder={
                lang === 'or'
                  ? 'ଯେକୌଣସି ଫସଲ ଖୋଜନ୍ତୁ (ଯଥା: ଧାନ, ଗହମ, ମକା, ମାଣ୍ଡିଆ, ହରଡ଼, ମୁଗ, ଚିନାବାଦାମ, ସୋରିଷ, ଟମାଟୋ, ବାଇଗଣ, ଆମ୍ବ, ହଳଦୀ, କପା, ଗେଣ୍ଡୁ, ଶାଗୁଆନ)...'
                  : 'Search any crop (Paddy, Wheat, Maize, Ragi, Arhar, Moong, Groundnut, Mustard, Tomato, Chilli, Mango, Turmeric, Cotton, Teak)...'
              }
              className="w-full bg-stone-50 border border-stone-200 text-xs sm:text-sm rounded-2xl pl-9 pr-3 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <VoiceMicButton
            lang={lang}
            screenTopic="crop doctor plant search"
            fieldLabel="plant or vegetable name"
            onTranscript={(txt) => setPlantSearch(txt)}
          />
        </div>

        {/* Grid of All Indian Plants */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ALL_CROPS_DATABASE.filter((crop) => {
            const matchesCat = plantCategory === 'all' || crop.category === plantCategory;
            const q = plantSearch.trim().toLowerCase();
            const matchesQuery =
              !q ||
              crop.name_en.toLowerCase().includes(q) ||
              crop.name_or.includes(q) ||
              (crop.name_hi && crop.name_hi.includes(q)) ||
              crop.scientific_name.toLowerCase().includes(q) ||
              crop.problems.some(
                (p) =>
                  p.name_en.toLowerCase().includes(q) ||
                  p.name_or.includes(q)
              );
            return matchesCat && matchesQuery;
          }).map((crop) => {
            const isSelected = selectedCropForModal?.id === crop.id;
            const problemNamesPreview = crop.problems.length > 0
              ? crop.problems
                  .slice(0, 4)
                  .map((p) => (lang === 'or' ? p.name_or : p.name_en))
                  .join(', ')
              : 'No photo yet';

            return (
              <div
                key={crop.id}
                onClick={() => setSelectedCropForModal(crop)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/50 shadow-md'
                    : 'bg-stone-50 hover:bg-emerald-50/40 border-stone-200 hover:border-emerald-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{crop.icon}</span>
                    <div className="flex items-center gap-1.5">
                      {/* Dynamic Problem Count Badge */}
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                        {crop.problems.length > 0
                          ? `${crop.problems.length} ${lang === 'or' ? 'ଗୋଟି ସମସ୍ୟା' : 'Problems'}`
                          : 'No photo yet'}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-700">
                        {crop.category}
                      </span>
                    </div>
                  </div>

                  <h4 className="font-black text-sm text-stone-900 mt-2">
                    {lang === 'or' ? crop.name_or : crop.name_en}
                  </h4>
                  <p className="text-[11px] text-stone-500 italic">
                    {crop.scientific_name}
                  </p>

                  <div className="mt-2 text-[11px] text-stone-600 space-y-0.5">
                    <p>🗓️ {crop.duration_days} • 💧 {crop.water_requirement} water</p>
                    <p className="font-semibold text-emerald-800 line-clamp-1" title={problemNamesPreview}>
                      🦠 {problemNamesPreview}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs font-bold text-emerald-700 group">
                  <span className="group-hover:underline">
                    {lang === 'or' ? 'ରୋଗ ଓ ପ୍ରତିକାର ଦେଖନ୍ତୁ' : 'View Diseases & Remedies'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Centered Modal on Desktop & Full-Height Bottom Sheet on Mobile */}
      <CropDiseaseModal
        crop={selectedCropForModal}
        allCrops={ALL_CROPS_DATABASE}
        lang={lang}
        onClose={() => setSelectedCropForModal(null)}
        onSelectCrop={(c) => setSelectedCropForModal(c)}
        onNavigateToAdvice={onNavigateToAdvice}
        onNavigateToLog={onNavigateToLog}
      />

      {/* Enlarged Reference Photo Modal for Diagnosis Result */}
      {enlargedDiagPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEnlargedDiagPhoto(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl border border-stone-200 space-y-3 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-black text-base sm:text-lg text-stone-900">
                  {enlargedDiagPhoto.nameOr}
                </h4>
                <p className="text-xs font-bold text-stone-600">
                  {enlargedDiagPhoto.nameEn}
                </p>
              </div>
              <button
                onClick={() => setEnlargedDiagPhoto(null)}
                className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                aria-label="Close enlarged photo"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={enlargedDiagPhoto.src}
              alt={enlargedDiagPhoto.alt}
              className="w-full max-h-[52vh] object-contain rounded-2xl bg-stone-950 border border-stone-200"
            />
            <div className="flex flex-wrap items-center gap-2">
              {enlargedDiagPhoto.isIllustration && (
                <span className="px-2.5 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-extrabold">
                  Illustration, not a real photo
                </span>
              )}
              {!enlargedDiagPhoto.isPhotoVerified && (
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
                {enlargedDiagPhoto.symptomDesc}
              </p>
              {(enlargedDiagPhoto.credit || enlargedDiagPhoto.licence) && (
                <p className="text-[10px] text-stone-500 pt-1 border-t border-emerald-200 mt-1">
                  Credit: {enlargedDiagPhoto.credit} • Licence: {enlargedDiagPhoto.licence}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

