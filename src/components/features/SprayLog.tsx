import React, { useState, useEffect } from 'react';
import { Language, SprayRecord, FieldSizeValue } from '../../types';
import { ClipboardList, PlusCircle, AlertTriangle, ShieldCheck, Trash2, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import {
  getSprayLogsLocalFirst,
  addSprayLogLocalFirst,
  deleteSprayLogLocalFirst,
} from '../../services/localFirstSyncEngine';
import { VoiceMicButton } from '../common/VoiceInputField';
import { FieldSizeSelector, getSavedFieldSizeDefault } from '../common/FieldSizeSelector';
import { getEstimatedPHIDays } from '../../services/phiNotificationService';
import { PHINotificationBanner } from '../common/PHINotificationBanner';
import { CropAnalyticsChart } from './CropAnalyticsChart';

interface SprayLogProps {
  lang: Language;
  onTriggerSafetyAlert: () => void;
  onNavigateToPoisoning: () => void;
  prefillData?: { product: string; crop: string; dose: string } | null;
}

export const SprayLog: React.FC<SprayLogProps> = ({
  lang,
  onTriggerSafetyAlert,
  onNavigateToPoisoning,
  prefillData,
}) => {
  const [entries, setEntries] = useState<SprayRecord[]>([]);
  const [productName, setProductName] = useState('');
  const [cropName, setCropName] = useState('Paddy (ଧାନ)');
  const [sprayDate, setSprayDate] = useState(new Date().toISOString().split('T')[0]);
  const [dosage, setDosage] = useState('');
  const [costInr, setCostInr] = useState<string>('');
  const [customPhiDays, setCustomPhiDays] = useState<string>('');
  const [fieldSize, setFieldSize] = useState<FieldSizeValue>(() => getSavedFieldSizeDefault());
  const [acres, setAcres] = useState<number>(() => getSavedFieldSizeDefault().acres);
  const [targetPest, setTargetPest] = useState('');
  const [notes, setNotes] = useState('');
  const [recentWarning, setRecentWarning] = useState<string | null>(null);

  // Load from phone IndexedDB first (local-first)
  useEffect(() => {
    getSprayLogsLocalFirst().then((logs) => {
      if (logs.length > 0) {
        setEntries(logs);
      } else {
        loadDefaultSample();
      }
    });
  }, []);

  const loadDefaultSample = () => {
    const sample: SprayRecord = {
      id: 'log-1',
      product_name: 'Tricyclazole 75% WP',
      crop_name: 'Paddy (ଧାନ)',
      spray_date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
      dosage: '0.6 g / L',
      field_area_acres: 2,
      target_pest_disease: 'Rice Blast (ଚିଟା ରୋଗ)',
      applicator_notes: 'Applied in early morning with power sprayer.',
      created_at: new Date().toISOString()
    };
    setEntries([sample]);
    localStorage.setItem('krushak_spray_log', JSON.stringify([sample]));
  };

  useEffect(() => {
    if (prefillData) {
      setProductName(prefillData.product);
      setCropName(prefillData.crop);
      setDosage(prefillData.dose);
    }
  }, [prefillData]);

  // Check recent spray gap
  const checkRecurrence = (crop: string, dateStr: string): string | null => {
    const cropEntries = entries.filter((e) => e.crop_name.toLowerCase().includes(crop.toLowerCase().split(' ')[0]));
    if (cropEntries.length === 0) return null;

    const latest = cropEntries[0];
    const prevDate = new Date(latest.spray_date).getTime();
    const currDate = new Date(dateStr).getTime();
    const diffDays = Math.round((currDate - prevDate) / (1000 * 3600 * 24));

    if (diffDays >= 0 && diffDays < 7) {
      return lang === 'or'
        ? `ସାବଧାନ: ଏହି ଫସଲରେ ମାତ୍ର ${diffDays} ଦିନ ପୂର୍ବରୁ (${latest.product_name}) ସ୍ପ୍ରେ କରାଯାଇଥିଲା। ୭-୧୦ ଦିନର ବ୍ୟବଧାନ ନରଖିଲେ ଗଛ ପୋଡ଼ିବା ଓ ରାସାୟନିକ ଅବଶିଷ୍ଟ ରହିବାର ଆଶଙ୍କା ଥାଏ!`
        : `WARNING: This crop was sprayed only ${diffDays} days ago with ${latest.product_name}. Spraying too frequently risks phytotoxicity and heavy chemical residue. Maintain minimum 7-10 day interval!`;
    }
    return null;
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    // Check recent spray warning
    const warn = checkRecurrence(cropName, sprayDate);
    setRecentWarning(warn);

    const phiVal = customPhiDays ? parseInt(customPhiDays, 10) : getEstimatedPHIDays(productName);
    const parsedSprayDate = new Date(sprayDate || Date.now());
    const safeDate = new Date(parsedSprayDate);
    safeDate.setDate(safeDate.getDate() + phiVal);
    const safeHarvestDateStr = safeDate.toISOString().split('T')[0];

    const parsedCost = costInr ? parseFloat(costInr) : Math.round(acres * 380);

    const newRecord: SprayRecord = {
      id: `log-${Date.now()}`,
      product_name: productName.trim(),
      crop_name: cropName.trim(),
      spray_date: sprayDate,
      dosage: dosage.trim() || 'Standard Dose',
      field_area_acres: acres,
      field_size: fieldSize,
      target_pest_disease: targetPest.trim() || 'General Pest/Disease',
      applicator_notes: notes.trim(),
      phi_days: phiVal,
      safe_harvest_date: safeHarvestDateStr,
      cost_inr: parsedCost,
      created_at: new Date().toISOString()
    };

    const updated = await addSprayLogLocalFirst(newRecord);
    setEntries(updated);

    // Reset form
    setProductName('');
    setDosage('');
    setCostInr('');
    setCustomPhiDays('');
    setTargetPest('');
    setNotes('');

    // Requirement 4: After adding, trigger safety alert (feature 9)
    onTriggerSafetyAlert();
  };

  const handleDelete = async (id: string) => {
    const updated = await deleteSprayLogLocalFirst(id);
    setEntries(updated);
  };

  // 1. Export as CSV File
  const handleExportCSV = () => {
    if (entries.length === 0) return;
    const headers = ['ID,Product Name,Crop,Spray Date,Dosage,Area (Acres),Target Pest/Disease,Notes'];
    const rows = entries.map((e) =>
      `"${e.id}","${e.product_name}","${e.crop_name}","${e.spray_date}","${e.dosage}",${e.field_area_acres},"${e.target_pest_disease}","${e.applicator_notes || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Krushak_Bani_Spray_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Export / Print Audit Report
  const handlePrintReport = () => {
    window.print();
  };

  // 3. Share via WhatsApp / Message format
  const handleShareWhatsApp = () => {
    if (entries.length === 0) return;
    const latest = entries[0];
    const text = lang === 'or'
      ? `🌾 କୃଷକ ବାଣୀ - ସ୍ପ୍ରେ ଲଗ୍ ରେକର୍ଡ:\nଫସଲ: ${latest.crop_name}\nକୀଟନାଶକ: ${latest.product_name}\nମାତ୍ରା: ${latest.dosage}\nତାରିଖ: ${latest.spray_date}\nଜମି: ${latest.field_area_acres} ଏକର\nଲକ୍ଷ୍ୟ: ${latest.target_pest_disease}\nସମୁଦାୟ ରେକର୍ଡ: ${entries.length} ଟି।`
      : `🌾 Krushak Bani - Chemical Spray Record:\nCrop: ${latest.crop_name}\nProduct: ${latest.product_name}\nDose: ${latest.dosage}\nDate: ${latest.spray_date}\nArea: ${latest.field_area_acres} Acre(s)\nTarget: ${latest.target_pest_disease}\nTotal Logs: ${entries.length}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center shadow-md">
              <ClipboardList className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black">
                {lang === 'or' ? 'ସ୍ପ୍ରେ ଇତିହାସ ଓ ଲଗ୍ (Spray Log)' : 'Chemical Spray History & Log'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
                {lang === 'or'
                  ? 'କୀଟନାଶକ ପ୍ରୟୋଗର ହିସାବ ରଖନ୍ତୁ। CSV ଏକ୍ସପୋର୍ଟ କରନ୍ତୁ ଏବଂ ହ୍ୱାଟ୍ସଆପ୍ ରେ ସେୟାର କରନ୍ତୁ।'
                  : 'Tracks chemical applications, exports audit CSV/PDF records, and warns if sprays are repeated too soon (<7 days).'}
              </p>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black px-3.5 py-2 rounded-2xl text-xs shadow-md transition-all active:scale-95"
              title="Download CSV spreadsheet"
            >
              <span>📥 {lang === 'or' ? 'CSV ଡାଉନଲୋଡ' : 'Export CSV'}</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-2 rounded-2xl text-xs border border-white/40 transition-all"
              title="Print Audit Certificate"
            >
              <span>🖨️ {lang === 'or' ? 'ପ୍ରିଣ୍ଟ / PDF' : 'Print / PDF'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-2xl text-xs shadow-sm transition-all"
              title="Share on WhatsApp"
            >
              <span>💬 {lang === 'or' ? 'ସେୟାର' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Local Notification System: PHI Safe Harvest Date Alerts */}
      <PHINotificationBanner sprayLogs={entries} lang={lang} />

      {/* Recharts Visualization: 6-Month Spray Cost & Application Frequency */}
      <CropAnalyticsChart sprayLogs={entries} cropHistory={[]} lang={lang} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* New Entry Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 text-left space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="font-extrabold text-stone-900 text-base">
              {lang === 'or' ? 'ନୂତନ ସ୍ପ୍ରେ ରେକର୍ଡ ଯୋଡ଼ନ୍ତୁ' : 'Add New Spray Record'}
            </h3>
            <PlusCircle className="w-5 h-5 text-emerald-600" />
          </div>

          <form onSubmit={handleAddEntry} className="space-y-3.5">
            {/* Product Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'or' ? 'କୀଟନାଶକର ନାମ (Product Name):' : 'Product / Chemical Name:'}
              </label>
              <div className="flex items-start gap-2">
                <input
                  type="text"
                  required
                  placeholder={lang === 'or' ? 'ଉଦାହରଣ: Tricyclazole 75% WP' : 'e.g. Coragen 18.5% SC'}
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
                />
                <VoiceMicButton
                  lang={lang}
                  size="sm"
                  screenTopic="spray log product name"
                  fieldLabel="product name"
                  onTranscript={(txt) => setProductName(txt)}
                />
              </div>
            </div>

            {/* Crop & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'or' ? 'ଫସଲ (Crop):' : 'Crop:'}
                </label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
                >
                  <option value="Paddy (ଧାନ)">Paddy (ଧାନ)</option>
                  <option value="Tomato (ବିଲାତି)">Tomato (ବିଲାତି)</option>
                  <option value="Brinjal (ବାଇଗଣ)">Brinjal (ବାଇଗଣ)</option>
                  <option value="Groundnut (ଚିନାବାଦାମ)">Groundnut (ଚିନାବାଦାମ)</option>
                  <option value="Pulses (ମୁଗ/ବିରି)">Pulses (ମୁଗ/ବିରି)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'or' ? 'ତାରିଖ (Date):' : 'Date Applied:'}
                </label>
                <input
                  type="date"
                  required
                  value={sprayDate}
                  onChange={(e) => setSprayDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
                />
              </div>
            </div>

            {/* Dosage */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'or' ? 'ମାତ୍ରା (Dose):' : 'Dosage:'}
              </label>
              <div className="flex items-start gap-1.5">
                <input
                  type="text"
                  placeholder="e.g. 0.6g / L"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  className="flex-1 min-w-0 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
                />
                <VoiceMicButton
                  lang={lang}
                  size="sm"
                  screenTopic="spray log dosage"
                  fieldLabel="dosage"
                  onTranscript={(txt) => setDosage(txt)}
                />
              </div>
            </div>

            {/* Cost (₹) & PHI Days */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'or' ? 'ସ୍ପ୍ରେ ଖର୍ଚ୍ଚ (₹ Cost):' : 'Spray Cost (₹):'}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 750"
                  value={costInr}
                  onChange={(e) => setCostInr(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'or' ? 'PHI ଅବଧି (ଦିନ):' : 'PHI Interval (Days):'}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 14"
                  value={customPhiDays}
                  onChange={(e) => setCustomPhiDays(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
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
                setAcres(computedAcres);
                setFieldSize(fs);
              }}
            />

            {/* Target Pest */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'or' ? 'ଉଦ୍ଦିଷ୍ଟ ରୋଗ / ପୋକ:' : 'Target Pest / Disease:'}
              </label>
              <div className="flex items-start gap-2">
                <input
                  type="text"
                  placeholder={lang === 'or' ? 'ଉଦାହରଣ: ଚିଟା ରୋଗ / କାଣ୍ଡବିନ୍ଧା' : 'e.g. Blast, Stem Borer'}
                  value={targetPest}
                  onChange={(e) => setTargetPest(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
                />
                <VoiceMicButton
                  lang={lang}
                  size="sm"
                  screenTopic="spray log target pest disease"
                  fieldLabel="target pest"
                  onTranscript={(txt) => setTargetPest(txt)}
                />
              </div>
            </div>

            {/* Notes with VoiceMicButton */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {lang === 'or' ? 'ଟିପ୍ପଣୀ (Notes):' : 'Notes:'}
              </label>
              <div className="flex items-start gap-2">
                <input
                  type="text"
                  placeholder={lang === 'or' ? 'ସକାଳେ ସ୍ପ୍ରେ କରାଗଲା...' : 'e.g. Sprayed in morning'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-emerald-600"
                />
                <VoiceMicButton
                  lang={lang}
                  size="sm"
                  screenTopic="spray log notes"
                  fieldLabel="notes"
                  onTranscript={(txt) => setNotes(txt)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'or' ? 'ରେକର୍ଡ କରନ୍ତୁ ଓ ସୁରକ୍ଷା ଚେତାବନୀ ଶୁଣନ୍ତୁ' : 'Save Entry & Trigger Safety Alert'}</span>
            </button>
          </form>
        </div>

        {/* Entries List */}
        <div className="lg:col-span-7 space-y-4 text-left">
          {/* Warning banner if too recent */}
          {recentWarning && (
            <div className="p-4 rounded-3xl bg-red-600 text-white shadow-md flex items-start gap-3 animate-in fade-in">
              <AlertTriangle className="w-6 h-6 text-yellow-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-black uppercase">
                  {lang === 'or' ? 'ଅତ୍ୟାଧିକ ସ୍ପ୍ରେ ସତର୍କତା' : 'FREQUENT SPRAY WARNING'}
                </h4>
                <p className="text-xs text-red-100 mt-1 leading-relaxed">
                  {recentWarning}
                </p>
                <button
                  onClick={onNavigateToPoisoning}
                  className="mt-2 inline-flex items-center gap-1 bg-white text-red-700 text-xs font-extrabold px-3 py-1 rounded-xl shadow-xs hover:bg-yellow-100 transition-colors"
                >
                  <span>{lang === 'or' ? 'ବିଷକ୍ରିୟା ମାର୍ଗଦର୍ଶିକା ଦେଖନ୍ତୁ' : 'View Poisoning Safety Guide'}</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-stone-900 text-base">
              {lang === 'or' ? 'ପୂର୍ବ ସ୍ପ୍ରେ ଇତିହାସ' : 'Spray History'} ({entries.length})
            </h3>
            <button
              onClick={onNavigateToPoisoning}
              className="text-xs font-bold text-red-700 hover:underline flex items-center gap-1"
            >
              <span>{lang === 'or' ? 'ବିଷକ୍ରିୟା ନିୟମାବଳୀ' : 'Poisoning Protocol'}</span>
            </button>
          </div>

          {entries.length === 0 ? (
            <div className="p-8 bg-white rounded-3xl border border-stone-200 text-center text-stone-400">
              <Calendar className="w-10 h-10 mx-auto text-stone-300 mb-2" />
              <p className="text-xs font-semibold">
                {lang === 'or' ? 'କୌଣସି ସ୍ପ୍ରେ ରେକର୍ଡ ଯୋଡ଼ା ହୋଇନାହିଁ।' : 'No spray records logged yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-stone-200 space-y-3 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {item.crop_name}
                        </span>
                        <span className="text-xs text-stone-400 font-medium">
                          {item.spray_date}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-stone-900 mt-1">
                        {item.product_name}
                      </h4>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-100 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-[10px] text-stone-400 block font-bold uppercase">Dose</span>
                      <span className="font-bold text-stone-800">{item.dosage}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-[10px] text-stone-400 block font-bold uppercase">Area</span>
                      <span className="font-bold text-stone-800">
                        {item.field_size
                          ? `${item.field_size.enteredValue} ${item.field_size.unit} (${item.field_area_acres} ac)`
                          : `${item.field_area_acres} Acre(s)`}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                      <span className="text-[10px] text-emerald-800 block font-bold uppercase">PHI & Safe Harvest</span>
                      <span className="font-bold text-emerald-900 block truncate">
                        {item.phi_days ? `${item.phi_days}d PHI (${item.safe_harvest_date || 'Safe'})` : '10d PHI'}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">
                      <span className="text-[10px] text-stone-400 block font-bold uppercase">Cost</span>
                      <span className="font-bold text-stone-800">
                        ₹{item.cost_inr || Math.round((item.field_area_acres || 1) * 380)}
                      </span>
                    </div>
                  </div>

                  {item.applicator_notes && (
                    <p className="text-xs text-stone-500 italic bg-stone-50 p-2 rounded-xl border border-stone-100">
                      "{item.applicator_notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
