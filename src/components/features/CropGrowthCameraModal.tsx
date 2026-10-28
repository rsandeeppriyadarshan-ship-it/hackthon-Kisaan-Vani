import React, { useState, useRef, useEffect } from 'react';
import { Language, CropHistoryRecord, CropProgressPhoto } from '../../types';
import { analyzeCropProgress } from '../../services/cropGrowthService';
import { voiceService } from '../../services/voiceService';
import { 
  Camera, 
  SwitchCamera, 
  Upload, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Sprout, 
  TrendingUp, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Layers,
  ChevronRight,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface CropGrowthCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropRecord: CropHistoryRecord;
  lang: Language;
  onSaveProgress: (updatedRecord: CropHistoryRecord) => void;
}

export const CropGrowthCameraModal: React.FC<CropGrowthCameraModalProps> = ({
  isOpen,
  onClose,
  cropRecord,
  lang,
  onSaveProgress
}) => {
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CropProgressPhoto | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start Camera
  const startCamera = async (targetFacing: 'environment' | 'user') => {
    stopCamera();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser or context.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: targetFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        lang === 'or'
          ? 'କ୍ୟାମେରା ଅନୁମତି ମିଳିଲା ନାହିଁ। ଦୟାକରି ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ।'
          : 'Unable to access live camera stream. You can still upload a crop photo from your device.'
      );
      setMode('upload');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isOpen && !capturedImage && mode === 'camera') {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
      voiceService.stopSpeaking();
    };
  }, [isOpen, capturedImage, mode, facingMode]);

  if (!isOpen) return null;

  // Toggle Camera Facing
  const handleToggleFacing = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  // Capture Snapshot
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    stopCamera();
    setCapturedImage(dataUrl);
    runAnalysis(dataUrl);
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCapturedImage(dataUrl);
      stopCamera();
      runAnalysis(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Run AI Analysis
  const runAnalysis = async (imgData: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeCropProgress({
        imageSrc: imgData,
        cropName: cropRecord.crop_name_en,
        variety: cropRecord.variety,
        sowingDate: cropRecord.sowing_date,
        lang
      });
      setAnalysisResult(result);
      voiceService.playChime('success');
    } catch (err) {
      console.error('Error during growth analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Voice Readout
  const handleToggleVoice = () => {
    if (isSpeaking) {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    if (!analysisResult) return;

    let text = '';
    if (lang === 'or') {
      text = `ଫସଲର ବୃଦ୍ଧି ସ୍କୋର ଶହେରୁ ${analysisResult.growth_score} ଅଟେ। ବର୍ତ୍ତମାନର ଅବସ୍ଥା: ${analysisResult.growth_stage_or}। ଆନୁମାନିକ ଅମଳ ତାରିଖ ${analysisResult.estimated_harvest_date} ଅଟେ, ଅର୍ଥାତ୍ ଆହୁରି ${analysisResult.estimated_days_to_harvest} ଦିନ ବାକି ଅଛି। ପରାମର୍ଶ: ${analysisResult.recommended_actions_or[0] || ''}`;
    } else {
      text = `Crop Growth Score is ${analysisResult.growth_score} out of 100. Current stage: ${analysisResult.growth_stage_en}. Estimated harvest date is ${analysisResult.estimated_harvest_date}, with approximately ${analysisResult.estimated_days_to_harvest} days remaining. Action: ${analysisResult.recommended_actions_en[0] || ''}`;
    }

    setIsSpeaking(true);
    voiceService.speak(text, lang, () => {
      setIsSpeaking(false);
    });
  };

  // Save progress photo to crop record
  const handleSaveToRecord = () => {
    if (!analysisResult) return;
    const existingPhotos = cropRecord.progress_photos || [];
    const updatedPhotos = [analysisResult, ...existingPhotos];

    const updatedRecord: CropHistoryRecord = {
      ...cropRecord,
      progress_photos: updatedPhotos,
      latest_growth_score: analysisResult.growth_score,
      latest_growth_stage: analysisResult.growth_stage_en,
      estimated_harvest_date: analysisResult.estimated_harvest_date
    };

    onSaveProgress(updatedRecord);
    onClose();
  };

  // Reset to retake
  const handleRetake = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    voiceService.stopSpeaking();
    setIsSpeaking(false);
    if (mode === 'camera') {
      startCamera(facingMode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl border border-stone-200 max-w-2xl w-full overflow-hidden text-left flex flex-col max-h-[94vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-stone-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/80 text-amber-300 border border-emerald-600">
                  {lang === 'or' ? 'କୃଷି ଏଆଇ ବୃଦ୍ଧି ବିଶ୍ଳେଷଣ' : 'AI Growth & Timeline Scan'}
                </span>
                <span className="text-xs text-stone-300 font-mono">
                  {cropRecord.crop_name_en} ({cropRecord.variety})
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                {lang === 'or' ? 'ଫସଲ ପ୍ରଗତି ଫଟୋ ଓ ବୃଦ୍ଧି ସ୍କୋର' : 'Crop Progress Photo & Growth Score'}
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              voiceService.stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Step 1: Taking / Selecting Photo */}
          {!capturedImage && (
            <div className="space-y-4">
              {/* Camera / Upload Switcher */}
              <div className="flex items-center gap-2 p-1 bg-stone-100 rounded-2xl border border-stone-200 max-w-xs mx-auto">
                <button
                  onClick={() => {
                    setMode('camera');
                    startCamera(facingMode);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'camera'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{lang === 'or' ? 'ଲାଇଭ୍ କ୍ୟାମେରା' : 'Live Camera'}</span>
                </button>
                <button
                  onClick={() => {
                    setMode('upload');
                    stopCamera();
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    mode === 'upload'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{lang === 'or' ? 'ଫଟୋ ଅପଲୋଡ୍' : 'Upload Photo'}</span>
                </button>
              </div>

              {/* Mode: Camera */}
              {mode === 'camera' && (
                <div className="relative rounded-3xl overflow-hidden bg-black aspect-4/3 sm:aspect-16/10 flex items-center justify-center border-2 border-stone-800 shadow-lg">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Framing Overlay */}
                  <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-white/60 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between items-center text-[10px] text-white/90 bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-xs self-start">
                      <Sparkles className="w-3 h-3 text-amber-300 mr-1" />
                      <span>{lang === 'or' ? 'ଫସଲ ପତ୍ର ଓ ଶାଖାକୁ କ୍ୟାମେରା ସମ୍ମୁଖରେ ରଖନ୍ତୁ' : 'Align canopy within frame'}</span>
                    </div>
                    <span className="text-[10px] text-white/80 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs self-end">
                      {facingMode === 'environment' ? 'Back Lens' : 'Front Lens'}
                    </span>
                  </div>

                  {/* Camera Controls Bar */}
                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-5 z-20">
                    <button
                      onClick={handleToggleFacing}
                      className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-md"
                      title="Switch Camera (Front / Back)"
                    >
                      <SwitchCamera className="w-5 h-5" />
                    </button>

                    <button
                      onClick={handleCaptureSnapshot}
                      className="w-16 h-16 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center justify-center p-1.5 shadow-2xl transition-all active:scale-90 cursor-pointer ring-4 ring-white/50"
                      title="Take Photo"
                    >
                      <div className="w-full h-full rounded-full border-2 border-stone-950 flex items-center justify-center">
                        <Camera className="w-6 h-6 stroke-[2.5]" />
                      </div>
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-md"
                      title="Or choose photo from device"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Mode: Upload */}
              {mode === 'upload' && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-stone-50/70 hover:bg-emerald-50/30 group"
                >
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-black text-stone-900">
                    {lang === 'or' ? 'କ୍ଷେତ୍ରରୁ ଫସଲ ଫଟୋ ବାଛନ୍ତୁ' : 'Tap to select crop progress photo'}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    {lang === 'or' ? 'ଜେପିଜି, ପିଏନଜି କିମ୍ବା କ୍ୟାମେରା ରୋଲ୍ ସମର୍ଥିତ' : 'Supports JPG, PNG from device gallery or direct camera'}
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileUpload}
              />

              {cameraError && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Crop Sowing Context Card */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Sprout className="w-4 h-4 text-emerald-700" />
                  <div>
                    <span className="font-bold text-stone-900">
                      {cropRecord.crop_name_en} • {cropRecord.variety}
                    </span>
                    <p className="text-[10px] text-stone-500">
                      {lang === 'or' ? 'ବୁଣା ତାରିଖ:' : 'Sown on:'} {cropRecord.sowing_date} ({cropRecord.plot_name})
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-200/70 text-emerald-900 font-extrabold text-[11px]">
                  {cropRecord.season}
                </span>
              </div>
            </div>
          )}

          {/* Step 2: Analysis in Progress */}
          {capturedImage && isAnalyzing && (
            <div className="p-8 sm:p-12 text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto rounded-3xl overflow-hidden border-2 border-emerald-500 shadow-xl">
                <img
                  src={capturedImage}
                  alt="Captured Crop"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-emerald-600/30 animate-pulse flex items-center justify-center">
                  <div className="w-full h-1 bg-amber-300 shadow-[0_0_15px_#fde047] animate-bounce" />
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
                  <span>
                    {lang === 'or' ? 'କୃଷି ଏଆଇ ବୃଦ୍ଧି ସ୍କୋର ଗଣନା କରୁଛି...' : 'AI Analyzing Foliage Biomass & Growth Score...'}
                  </span>
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  {lang === 'or'
                    ? 'କ୍ଲୋରୋଫିଲ୍ ସବୁଜିମା, କାନୋପି ଆଚ୍ଛାଦନ ଏବଂ ବୁଣା ତାରିଖ ଅନୁସାରେ ଫସଲର ଅମଳ ସମୟ ଆକଳନ ଚାଲିଛି।'
                    : 'Evaluating green leaf index (GLI), canopy density, and projecting harvest timeline based on ICAR benchmarks.'}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Analysis Results View */}
          {capturedImage && !isAnalyzing && analysisResult && (
            <div className="space-y-5 animate-in fade-in">
              {/* Top Score & Image Summary Banner */}
              <div className="rounded-3xl p-5 bg-gradient-to-br from-emerald-950 via-teal-950 to-stone-900 text-white shadow-xl border border-emerald-500/40 relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5">
                  {/* Photo Thumbnail */}
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-2 border-amber-400 shrink-0 shadow-md">
                    <img
                      src={capturedImage}
                      alt="Crop Analysis"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
                      Day {analysisResult.days_since_sowing}
                    </span>
                  </div>

                  {/* Growth Score Gauge */}
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-900 text-emerald-300 border border-emerald-600">
                        {lang === 'or' ? 'ଏଆଇ ବୃଦ୍ଧି ସ୍କୋର' : 'AI Growth Score'}
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">
                        {analysisResult.provider}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-center sm:justify-start gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-amber-300 tracking-tight">
                        {analysisResult.growth_score}
                      </span>
                      <span className="text-lg font-bold text-stone-400">/ 100</span>
                      <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${
                        analysisResult.growth_score >= 80 
                          ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' 
                          : 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                      }`}>
                        {analysisResult.growth_status}
                      </span>
                    </div>

                    <p className="text-sm font-black text-white">
                      {lang === 'or' ? analysisResult.growth_stage_or : analysisResult.growth_stage_en}
                    </p>
                    <p className="text-xs text-stone-300">
                      {lang === 'or' 
                        ? `ବୁଣିବାର ${analysisResult.days_since_sowing} ଦିନ ବିତିଛି • ଆହୁରି ~${analysisResult.estimated_days_to_harvest} ଦିନରେ ଅମଳ ହେବ` 
                        : `${analysisResult.days_since_sowing} days since sowing • ~${analysisResult.estimated_days_to_harvest} days remaining to harvest`}
                    </p>
                  </div>

                  {/* Voice Readout Trigger */}
                  <button
                    onClick={handleToggleVoice}
                    className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0 self-center ${
                      isSpeaking
                        ? 'bg-amber-400 text-stone-950 animate-pulse'
                        : 'bg-white/10 hover:bg-white/20 text-stone-100 border border-white/20'
                    }`}
                    title={lang === 'or' ? 'କଣ୍ଠରେ ଶୁଣନ୍ତୁ' : 'Listen to Voice Analysis'}
                  >
                    {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Key Metrics: Canopy Coverage & Chlorophyll */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-stone-500 text-[10px] font-bold uppercase">
                    <span>{lang === 'or' ? 'ପତ୍ର ଆଚ୍ଛାଦନ (Canopy)' : 'Canopy Coverage'}</span>
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-stone-900">{analysisResult.canopy_cover_percentage}%</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${analysisResult.canopy_cover_percentage}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-stone-500 text-[10px] font-bold uppercase">
                    <span>{lang === 'or' ? 'କ୍ଲୋରୋଫିଲ୍ ସବୁଜିମା' : 'Greenness Index'}</span>
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-stone-900">{analysisResult.chlorophyll_greenness}/100</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-600 h-full rounded-full transition-all"
                      style={{ width: `${analysisResult.chlorophyll_greenness}%` }}
                    />
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-stone-500 text-[10px] font-bold uppercase">
                    <span>{lang === 'or' ? 'ଆନୁମାନିକ ଅମଳ ତାରିଖ' : 'Target Harvest'}</span>
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-black text-stone-900">{analysisResult.estimated_harvest_date}</span>
                  </div>
                  <p className="text-[10px] text-emerald-700 font-bold">
                    {lang === 'or' ? `~${analysisResult.estimated_days_to_harvest} ଦିନ ବାକି` : `~${analysisResult.estimated_days_to_harvest} days left`}
                  </p>
                </div>
              </div>

              {/* Growth Timeline Estimation Stages */}
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    <span>{lang === 'or' ? 'ଫସଲ ବୃଦ୍ଧି ଟାଇମଲାଇନ୍ ଆକଳନ (Growth Stages)' : 'Growth Timeline & Phenological Stages'}</span>
                  </h4>
                  <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                    ICAR Timeline
                  </span>
                </div>

                <div className="space-y-2.5">
                  {analysisResult.timeline_stages.map((st, idx) => {
                    const isCurrent = st.status === 'current';
                    const isCompleted = st.status === 'completed';

                    return (
                      <div
                        key={st.id}
                        className={`p-3 rounded-2xl border transition-all text-xs flex items-start gap-3 ${
                          isCurrent
                            ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-300/60'
                            : isCompleted
                            ? 'bg-emerald-50/60 border-emerald-200 text-stone-700'
                            : 'bg-stone-50/60 border-stone-200 text-stone-500'
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : isCurrent ? (
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-black text-[10px] animate-pulse">
                              {idx + 1}
                            </span>
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center font-bold text-[10px]">
                              {idx + 1}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className={`font-black ${isCurrent ? 'text-stone-900' : isCompleted ? 'text-emerald-950' : 'text-stone-700'}`}>
                              {lang === 'or' ? st.stage_name_or : st.stage_name_en}
                            </span>
                            <span className="text-[10px] font-mono text-stone-500">
                              {st.day_range}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 leading-snug">
                            {lang === 'or' ? st.key_management_or : st.key_management_en}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Observations & Action Advisory */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2 text-xs">
                <span className="font-bold text-stone-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  {lang === 'or' ? 'ଏଆଇ ପର୍ଯ୍ୟବେକ୍ଷଣ ଓ ପରବର୍ତ୍ତୀ କୃଷି ପଦକ୍ଷେପ:' : 'AI Field Observations & Recommended Actions:'}
                </span>
                <ul className="space-y-1 list-disc list-inside text-stone-700">
                  {(lang === 'or' ? analysisResult.ai_observations_or : analysisResult.ai_observations_en).map((obs, idx) => (
                    <li key={idx} className="leading-relaxed">{obs}</li>
                  ))}
                  {(lang === 'or' ? analysisResult.recommended_actions_or : analysisResult.recommended_actions_en).map((act, idx) => (
                    <li key={`act-${idx}`} className="font-semibold text-emerald-900 leading-relaxed">
                      👉 {act}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleSaveToRecord}
                  className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>
                    {lang === 'or' ? 'ଫସଲ ଇତିହାସରେ ସେଭ୍ କରନ୍ତୁ' : 'Save Progress to Crop History'}
                  </span>
                </button>

                <button
                  onClick={handleRetake}
                  className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'or' ? 'ପୁନର୍ବାର ଫଟୋ ନିଅନ୍ତୁ' : 'Retake Photo'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
