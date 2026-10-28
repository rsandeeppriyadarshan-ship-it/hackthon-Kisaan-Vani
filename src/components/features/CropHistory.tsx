import React, { useState, useEffect } from 'react';
import { Language, CropHistoryRecord, FieldSizeValue, SprayRecord } from '../../types';
import { VoiceMicButton } from '../common/VoiceInputField';
import { FieldSizeSelector, getSavedFieldSizeDefault } from '../common/FieldSizeSelector';
import { getSprayLogsLocalFirst } from '../../services/localFirstSyncEngine';
import { CropAnalyticsChart } from './CropAnalyticsChart';
import { PHINotificationBanner } from '../common/PHINotificationBanner';
import { 
  BookOpen, 
  PlusCircle, 
  Trash2, 
  TrendingUp, 
  Calendar, 
  Sprout, 
  ArrowRight, 
  CheckCircle2, 
  DollarSign, 
  Award, 
  Layers,
  Camera,
  Sparkles,
  Activity,
  Clock,
  Image as ImageIcon,
  Eye,
  Check
} from 'lucide-react';
import { CropGrowthCameraModal } from './CropGrowthCameraModal';

interface CropHistoryProps {
  lang: Language;
  onNavigateToRotation: () => void;
}

export const CropHistory: React.FC<CropHistoryProps> = ({ lang, onNavigateToRotation }) => {
  const [records, setRecords] = useState<CropHistoryRecord[]>([]);
  const [sprayLogs, setSprayLogs] = useState<SprayRecord[]>([]);
  const [year, setYear] = useState(2025);
  const [season, setSeason] = useState<'Kharif' | 'Rabi' | 'Summer'>('Kharif');
  const [plotName, setPlotName] = useState('ବଡ଼ ବିଲ (Main Plot)');
  const [cropName, setCropName] = useState('Paddy (ଧାନ)');
  const [variety, setVariety] = useState('Swarna (MTU 7029)');
  const [fieldSize, setFieldSize] = useState<FieldSizeValue>(() => getSavedFieldSizeDefault());
  const [areaAcres, setAreaAcres] = useState<number>(() => getSavedFieldSizeDefault().acres);
  const [sowingDate, setSowingDate] = useState('2025-06-25');
  const [harvestDate, setHarvestDate] = useState('2025-11-20');
  const [yieldQuintals, setYieldQuintals] = useState<number>(44);
  const [expenses, setExpenses] = useState<number>(18500);
  const [revenue, setRevenue] = useState<number>(48400); // 44q * ~₹2183 MSP
  const [notes, setNotes] = useState('Good monsoon, applied OUAT basal & tillering doses.');

  // Camera Progress Photo State
  const [selectedRecordForCamera, setSelectedRecordForCamera] = useState<CropHistoryRecord | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  useEffect(() => {
    getSprayLogsLocalFirst().then((logs) => {
      setSprayLogs(logs);
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('krushak_crop_history');
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch {
        loadDefaultHistory();
      }
    } else {
      loadDefaultHistory();
    }
  }, []);

  const loadDefaultHistory = () => {
    const initial: CropHistoryRecord[] = [
      {
        id: 'hist-1',
        year: 2025,
        season: 'Kharif',
        plot_name: 'ବଡ଼ ବିଲ (Main Plot)',
        crop_name_en: 'Paddy',
        crop_name_or: 'ଧାନ',
        variety: 'Swarna (MTU 7029)',
        area_acres: 2.0,
        sowing_date: '2025-06-20',
        harvest_date: '2025-11-25',
        yield_quintals: 46,
        yield_per_acre: 23,
        total_expenses_inr: 18000,
        net_revenue_inr: 51000,
        notes: 'OUAT basal + AWD irrigation adopted. Zero blast incidence.',
        latest_growth_score: 88,
        latest_growth_stage: 'Active Tillering (ପିଲ ବାହାରିବା)',
        estimated_harvest_date: '2025-11-20',
        progress_photos: [
          {
            id: 'prog-sample-1',
            captured_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            image_url: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80',
            growth_score: 88,
            growth_status: 'EXCELLENT',
            growth_stage_en: 'Active Tillering',
            growth_stage_or: 'ପିଲ ବାହାରିବା ଅବସ୍ଥା',
            days_since_sowing: 38,
            estimated_days_to_harvest: 45,
            estimated_harvest_date: '2025-11-20',
            canopy_cover_percentage: 78,
            biomass_index: 8.4,
            chlorophyll_greenness: 86,
            ai_observations_en: ['Vigorous tillering with dense canopy coverage.', 'Chlorophyll green index is optimal for 2nd top dressing.'],
            ai_observations_or: ['ଗଛରେ ଉତ୍ତମ ପିଲ ବାହାରିବା ସହିତ ପତ୍ର ଆଚ୍ଛାଦନ ଉଚ୍ଚକୋଟୀର ରହିଛି।', 'ଦ୍ୱିତୀୟ କିସ୍ତି ୟୁରିଆ ପାଇଁ କ୍ଲୋରୋଫିଲ୍ ସ୍ଥିତି ଅନୁକୂଳ।'],
            recommended_actions_en: ['Apply 2nd top dressing of Urea (25kg/acre).', 'Maintain 3-5 cm water level in plot.'],
            recommended_actions_or: ['ଏକର ପ୍ରତି ୨୫ କେଜି ୟୁରିଆ ଦିଅନ୍ତୁ।', 'କ୍ଷେତରେ ୩ ରୁ ୫ ସେମି ପାଣି ରଖନ୍ତୁ।'],
            timeline_stages: [
              {
                id: 's1',
                stage_name_en: 'Seedling & Nursery',
                stage_name_or: 'ତଳି ରୋପଣ',
                day_range: 'Day 1 - 25',
                status: 'completed',
                estimated_date: '2025-07-15',
                key_management_en: 'Shallow water and basal NPK',
                key_management_or: 'ପତଳା ପାଣି ଓ ମୂଳ ଖତ'
              },
              {
                id: 's2',
                stage_name_en: 'Active Tillering',
                stage_name_or: 'ପିଲ ବାହାରିବା',
                day_range: 'Day 26 - 50',
                status: 'current',
                estimated_date: '2025-08-10',
                key_management_en: 'Urea 1st top dressing, stem borer monitoring',
                key_management_or: 'ୟୁରିଆ ଖତ ଓ କାଣ୍ଡବିନ୍ଧା ପୋକ ଦମନ'
              },
              {
                id: 's3',
                stage_name_en: 'Panicle Initiation',
                stage_name_or: 'ଥୋଡ଼ ହେବା',
                day_range: 'Day 51 - 75',
                status: 'upcoming',
                estimated_date: '2025-09-05',
                key_management_en: 'MOP Potash top dressing',
                key_management_or: 'ପୋଟାସ ଖତ ପ୍ରୟୋଗ'
              },
              {
                id: 's4',
                stage_name_en: 'Maturity & Harvest',
                stage_name_or: 'ଅମଳ',
                day_range: 'Day 100 - 135',
                status: 'upcoming',
                estimated_date: '2025-11-20',
                key_management_en: 'Harvest when 85% panicles are golden yellow',
                key_management_or: '୮୫% କେଣ୍ଡା ସୁନେଲି ହେଲେ ଅମଳ କରନ୍ତୁ'
              }
            ],
            provider: 'CropBio Computer Vision ML'
          }
        ],
        created_at: new Date().toISOString()
      },
      {
        id: 'hist-2',
        year: 2024,
        season: 'Rabi',
        plot_name: 'ବଡ଼ ବିଲ (Main Plot)',
        crop_name_en: 'Green Gram (Moong)',
        crop_name_or: 'ମୁଗ (Moong)',
        variety: 'IPM 02-03',
        area_acres: 2.0,
        sowing_date: '2024-12-10',
        harvest_date: '2025-02-28',
        yield_quintals: 12,
        yield_per_acre: 6,
        total_expenses_inr: 6500,
        net_revenue_inr: 28500,
        notes: 'Residual moisture crop. Fixed ~40kg N/ha into soil.',
        created_at: new Date().toISOString()
      },
      {
        id: 'hist-3',
        year: 2024,
        season: 'Kharif',
        plot_name: 'ବଡ଼ ବିଲ (Main Plot)',
        crop_name_en: 'Paddy',
        crop_name_or: 'ଧାନ',
        variety: 'Pooja (CR Dhan)',
        area_acres: 2.0,
        sowing_date: '2024-06-28',
        harvest_date: '2024-11-30',
        yield_quintals: 42,
        yield_per_acre: 21,
        total_expenses_inr: 17500,
        net_revenue_inr: 44000,
        notes: 'Normal rain, treated seeds with Carbendazim.',
        created_at: new Date().toISOString()
      }
    ];
    setRecords(initial);
    localStorage.setItem('krushak_crop_history', JSON.stringify(initial));
  };

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const yieldPerAcre = areaAcres > 0 ? Math.round((yieldQuintals / areaAcres) * 10) / 10 : 0;

    const newRec: CropHistoryRecord = {
      id: `hist-${Date.now()}`,
      year: Number(year),
      season,
      plot_name: plotName.trim() || 'My Plot',
      crop_name_en: cropName.split(' ')[0],
      crop_name_or: cropName,
      variety: variety.trim() || 'Standard Variety',
      area_acres: areaAcres,
      field_size: fieldSize,
      sowing_date: sowingDate,
      harvest_date: harvestDate || undefined,
      yield_quintals: yieldQuintals,
      yield_per_acre: yieldPerAcre,
      total_expenses_inr: expenses,
      net_revenue_inr: revenue,
      notes: notes.trim(),
      created_at: new Date().toISOString()
    };

    const updated = [newRec, ...records];
    setRecords(updated);
    localStorage.setItem('krushak_crop_history', JSON.stringify(updated));
  };

  const handleDelete = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    localStorage.setItem('krushak_crop_history', JSON.stringify(updated));
  };

  const handleOpenProgressCamera = (rec: CropHistoryRecord) => {
    setSelectedRecordForCamera(rec);
    setIsCameraModalOpen(true);
  };

  const handleSaveProgress = (updatedRecord: CropHistoryRecord) => {
    const updated = records.map((r) => (r.id === updatedRecord.id ? updatedRecord : r));
    setRecords(updated);
    localStorage.setItem('krushak_crop_history', JSON.stringify(updated));
  };

  // Aggregated Stats
  const totalYieldAllYears = records.reduce((sum, r) => sum + (r.yield_quintals || 0), 0);
  const totalProfitAllYears = records.reduce((sum, r) => sum + ((r.net_revenue_inr || 0) - (r.total_expenses_inr || 0)), 0);

  return (
    <div className="space-y-6 text-left">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center shadow-md">
              <BookOpen className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-700/60 text-amber-300 text-xs font-bold mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Multi-Season Plot Journal & Yield Tracker</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                {lang === 'or' ? 'ଫସଲ ଇତିହାସ ଓ କ୍ଷେତ୍ର ଡାଏରୀ (Crop History)' : 'Crop History & Multi-Year Field Journal'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
                {lang === 'or'
                  ? 'ବିଭିନ୍ନ ଋତୁ (ଖରିଫ, ରବି, ଗ୍ରୀଷ୍ମ) ରେ ଲଗାଇଥିବା ଫସଲ, କିସମ, ଅମଳ ଓ ଖର୍ଚ୍ଚ-ଲାଭ ହିସାବ ରଖନ୍ତୁ।'
                  : 'Track historical varieties, sowing/harvest dates, quintals harvested per acre, and net profits across plots.'}
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToRotation}
            className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black px-4 py-2 rounded-2xl text-xs shadow-md transition-all self-start sm:self-auto"
          >
            <span>{lang === 'or' ? 'ପରବର୍ତ୍ତୀ ଫସଲ ଚକ୍ର ଯୋଜନା' : 'Plan Next Rotation'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Local Notification System: Safe Harvest Date PHI Banner */}
      <PHINotificationBanner sprayLogs={sprayLogs} lang={lang} />

      {/* Recharts Analytics Visualization: 6-Month Spray Cost & Application Frequency */}
      <CropAnalyticsChart sprayLogs={sprayLogs} cropHistory={records} lang={lang} />

      {/* AI Crop Growth Camera & Timeline Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-stone-900 text-white shadow-lg border border-emerald-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-md">
            <Camera className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-bold">
                {lang === 'or' ? 'ନୂତନ ଏଆଇ ଫିଚର୍' : 'NEW AI FEATURE'}
              </span>
              <span className="text-xs font-black text-amber-300">
                {lang === 'or' ? 'ଫସଲ ବୃଦ୍ଧି ସ୍କୋର (Growth Score)' : 'Crop Growth Score & Timeline'}
              </span>
            </div>
            <p className="text-sm font-black text-white">
              {lang === 'or'
                ? 'କ୍ୟାମେରାରେ ଫସଲର ପ୍ରଗତି ଫଟୋ ନିଅନ୍ତୁ — ଏଆଇ ବୃଦ୍ଧି ସ୍କୋର ଓ ଅମଳ ଟାଇମଲାଇନ୍ ଦେବ!'
                : 'Snap a progress photo with your camera — AI analyzes foliage to predict Growth Score & Harvest Timeline!'}
            </p>
            <p className="text-xs text-stone-300">
              {lang === 'or' 
                ? 'କାନୋପି ଆଚ୍ଛାଦନ, କ୍ଲୋରୋଫିଲ୍ ସବୁଜିମା ଓ ୬-ସ୍ତରୀୟ ଫସଲ ଅବସ୍ଥା ଆକଳନ' 
                : 'Evaluates canopy density, leaf chlorophyll index, and phenological stage'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (records.length > 0) {
              handleOpenProgressCamera(records[0]);
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs sm:text-sm font-black shadow-md transition-all active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Camera className="w-4 h-4 stroke-[2.5]" />
          <span>{lang === 'or' ? 'ପ୍ରଗତି ଫଟୋ ନିଅନ୍ତୁ (Take Photo)' : 'Take Progress Photo'}</span>
        </button>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase block">
              {lang === 'or' ? 'ମୋଟ ଫସଲ ଋତୁ' : 'Total Seasons Logged'}
            </span>
            <span className="text-lg font-black text-stone-900">{records.length} Seasons</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase block">
              {lang === 'or' ? 'ମୋଟ ଅମଳ' : 'Cumulative Harvest'}
            </span>
            <span className="text-lg font-black text-amber-800">{totalYieldAllYears} Quintals</span>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase block">
              {lang === 'or' ? 'ମୋଟ ନିଟ୍ ଲାଭ' : 'Net Farm Margin'}
            </span>
            <span className="text-lg font-black text-emerald-700">₹{totalProfitAllYears.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form to Add New Season History */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="font-extrabold text-stone-900 text-base">
              {lang === 'or' ? 'ନୂତନ ଫସଲ ଇତିହାସ ଯୋଡ଼ନ୍ତୁ' : 'Log Crop Season Entry'}
            </h3>
            <PlusCircle className="w-5 h-5 text-emerald-600" />
          </div>

          <form onSubmit={handleAddRecord} className="space-y-3">
            {/* Year & Season */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === 'or' ? 'ବର୍ଷ (Year):' : 'Year:'}
                </label>
                <input
                  type="number"
                  min="2018"
                  max="2030"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === 'or' ? 'ଋତୁ (Season):' : 'Season:'}
                </label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-stone-800"
                >
                  <option value="Kharif">{lang === 'or' ? 'ଖରିଫ (ମୌସୁମୀ)' : 'Kharif (Monsoon)'}</option>
                  <option value="Rabi">{lang === 'or' ? 'ରବି (ଶୀତ)' : 'Rabi (Winter)'}</option>
                  <option value="Summer">{lang === 'or' ? 'ଗ୍ରୀଷ୍ମ (ଜାଏଦ୍)' : 'Summer (Zaid)'}</option>
                </select>
              </div>
            </div>

            {/* Plot Name & Crop */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === 'or' ? 'ଜମିର ନାମ (Plot):' : 'Plot Name:'}
                </label>
                <div className="flex items-start gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. Badabila"
                    value={plotName}
                    onChange={(e) => setPlotName(e.target.value)}
                    className="flex-1 min-w-0 bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-stone-800"
                  />
                  <VoiceMicButton
                    lang={lang}
                    size="sm"
                    screenTopic="crop history plot name"
                    fieldLabel="plot name"
                    onTranscript={(txt) => setPlotName(txt)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === 'or' ? 'ଫସଲ (Crop):' : 'Crop:'}
                </label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-stone-800"
                >
                  <option value="Paddy (ଧାନ)">Paddy (ଧାନ)</option>
                  <option value="Green Gram (ମୁଗ)">Green Gram (ମୁଗ)</option>
                  <option value="Black Gram (ବିରି)">Black Gram (ବିରି)</option>
                  <option value="Groundnut (ଚିନାବାଦାମ)">Groundnut (ଚିନାବାଦାମ)</option>
                  <option value="Mustard (ସୋରିଷ)">Mustard (ସୋରିଷ)</option>
                  <option value="Maize (ମକା)">Maize (ମକା)</option>
                  <option value="Brinjal (ବାଇଗଣ)">Brinjal (ବାଇଗଣ)</option>
                  <option value="Tomato (ବିଲାତି)">Tomato (ବିଲାତି)</option>
                </select>
              </div>
            </div>

            {/* Seed Variety */}
            <div>
              <label className="block text-[11px] font-bold text-stone-600 mb-1">
                {lang === 'or' ? 'ବିହନ କିସମ (Variety):' : 'Seed Variety:'}
              </label>
              <div className="flex items-start gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. Swarna, MTU-1010"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  className="flex-1 min-w-0 bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-stone-800"
                />
                <VoiceMicButton
                  lang={lang}
                  size="sm"
                  screenTopic="crop history seed variety"
                  fieldLabel="seed variety"
                  onTranscript={(txt) => setVariety(txt)}
                />
              </div>
            </div>

            {/* Field Size Selector (9 units + Bigha/Katha ask-once + 3 picture choices) */}
            <FieldSizeSelector
              lang={lang}
              initialFieldSize={fieldSize}
              syncToFarmerProfile={true}
              compact={true}
              onChange={(computedAcres, fs) => {
                setAreaAcres(computedAcres);
                setFieldSize(fs);
              }}
            />

            {/* Sowing & Harvest Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === 'or' ? 'ବୁଣା ତାରିଖ:' : 'Sowing Date:'}
                </label>
                <input
                  type="date"
                  value={sowingDate}
                  onChange={(e) => setSowingDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-2 py-1.5 text-xs font-semibold text-stone-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  {lang === 'or' ? 'ଅମଳ ତାରିଖ:' : 'Harvest Date:'}
                </label>
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-2 py-1.5 text-xs font-semibold text-stone-800"
                />
              </div>
            </div>

            {/* Yield & Economics */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                  {lang === 'or' ? 'ଅମଳ (କ୍ୱିଣ୍ଟାଲ)' : 'Yield (Q)'}
                </label>
                <input
                  type="number"
                  value={yieldQuintals}
                  onChange={(e) => setYieldQuintals(parseFloat(e.target.value) || 0)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                  {lang === 'or' ? 'ଖର୍ଚ୍ଚ (₹)' : 'Expense (₹)'}
                </label>
                <input
                  type="number"
                  value={expenses}
                  onChange={(e) => setExpenses(parseFloat(e.target.value) || 0)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                  {lang === 'or' ? 'ବିକ୍ରି (₹)' : 'Income (₹)'}
                </label>
                <input
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-1.5 text-xs font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'or' ? 'ଇତିହାସରେ ସେଭ୍ କରନ୍ତୁ' : 'Save to Crop Journal'}</span>
            </button>
          </form>
        </div>

        {/* Multi-Season History List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-stone-900 text-base">
              {lang === 'or' ? 'ବର୍ଷୱାରୀ ଫସଲ ଚାଲୁ ରେକର୍ଡ' : 'Season-wise Succession Journal'}
            </h3>
            <span className="text-xs text-stone-500 font-semibold">
              {records.length} {lang === 'or' ? 'ପଞ୍ଜିକୃତ ରେକର୍ଡ' : 'entries'}
            </span>
          </div>

          <div className="space-y-3">
            {records.map((rec) => {
              const netProfit = (rec.net_revenue_inr || 0) - (rec.total_expenses_inr || 0);

              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-3xl p-5 shadow-xs border border-stone-200 hover:border-emerald-400 hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                          {rec.year} • {rec.season}
                        </span>
                        <span className="text-xs font-bold text-stone-500">
                          {rec.plot_name}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-stone-900 mt-1">
                        {lang === 'or' ? rec.crop_name_or : rec.crop_name_en}{' '}
                        <span className="text-xs font-semibold text-stone-500">({rec.variety})</span>
                      </h4>
                    </div>

                    <button
                      onClick={() => handleDelete(rec.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-100 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Area</span>
                      <span className="font-black text-stone-800">
                        {rec.field_size
                          ? `${rec.field_size.enteredValue} ${rec.field_size.unit} (${rec.area_acres} ac)`
                          : `${rec.area_acres} Acres`}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Yield / Acre</span>
                      <span className="font-black text-amber-800">{rec.yield_per_acre} Q/acre</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-[10px] text-stone-400 font-bold uppercase block">Total Yield</span>
                      <span className="font-black text-stone-800">{rec.yield_quintals} Quintals</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                      <span className="text-[10px] text-emerald-700 font-bold uppercase block">Net Margin</span>
                      <span className="font-black text-emerald-800">₹{netProfit.toLocaleString()}</span>
                    </div>
                  </div>

                  {rec.notes && (
                    <p className="text-xs text-stone-500 italic bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      "{rec.notes}"
                    </p>
                  )}

                  {/* AI Growth Score & Progress Photos Section */}
                  <div className="pt-2.5 border-t border-stone-100 space-y-2.5">
                    {rec.latest_growth_score !== undefined ? (
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
                            {rec.latest_growth_score}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                                {lang === 'or' ? 'ଏଆଇ ବୃଦ୍ଧି ସ୍କୋର' : 'AI Growth Score'}
                              </span>
                              <span className="text-xs font-black text-stone-900">
                                {rec.latest_growth_stage || 'Active Growth'}
                              </span>
                            </div>
                            {rec.estimated_harvest_date && (
                              <p className="text-[11px] text-stone-600 mt-0.5">
                                📅 {lang === 'or' ? 'ଆନୁମାନିକ ଅମଳ ତାରିଖ:' : 'Target Harvest:'} <strong>{rec.estimated_harvest_date}</strong>
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenProgressCamera(rec)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-xs transition-all cursor-pointer self-start sm:self-auto"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>{lang === 'or' ? 'ନୂଆ ଫଟୋ ନିଅନ୍ତୁ' : 'Update Photo'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                        <span className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          {lang === 'or' ? 'ଏହି ଫସଲର କୌଣସି ପ୍ରଗତି ଫଟୋ ନାହିଁ' : 'No progress photo yet'}
                        </span>
                        <button
                          onClick={() => handleOpenProgressCamera(rec)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black shadow-xs transition-all cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>{lang === 'or' ? 'କ୍ୟାମେରା ସ୍କାନ୍' : 'Take Progress Photo'}</span>
                        </button>
                      </div>
                    )}

                    {/* Progress Photo Thumbnail Strip */}
                    {rec.progress_photos && rec.progress_photos.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                          {lang === 'or' ? 'ପ୍ରଗତି ଫଟୋ ଗ୍ୟାଲେରୀ:' : 'Progress Photo Timeline:'}
                        </span>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {rec.progress_photos.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => handleOpenProgressCamera(rec)}
                              className="group relative w-16 h-16 rounded-xl overflow-hidden border border-stone-200 shrink-0 cursor-pointer shadow-2xs hover:ring-2 hover:ring-emerald-500 transition-all"
                              title={`Day ${p.days_since_sowing}: Growth Score ${p.growth_score}/100`}
                            >
                              <img src={p.image_url} alt="Progress" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-amber-300 text-center font-bold">
                                {p.growth_score}pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Crop Growth Camera Modal */}
      {selectedRecordForCamera && (
        <CropGrowthCameraModal
          isOpen={isCameraModalOpen}
          onClose={() => {
            setIsCameraModalOpen(false);
            setSelectedRecordForCamera(null);
          }}
          cropRecord={selectedRecordForCamera}
          lang={lang}
          onSaveProgress={handleSaveProgress}
        />
      )}
    </div>
  );
};
