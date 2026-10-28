import React, { useState } from 'react';
import { Language, SprayRecord, CropHistoryRecord } from '../../types';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, IndianRupee, Droplets, Calendar, Sparkles } from 'lucide-react';

interface CropAnalyticsChartProps {
  sprayLogs: SprayRecord[];
  cropHistory: CropHistoryRecord[];
  lang: Language;
}

const PIE_COLORS = ['#059669', '#d97706', '#2563eb', '#dc2626', '#7c3aed', '#0891b2', '#e11d48'];

export const CropAnalyticsChart: React.FC<CropAnalyticsChartProps> = ({
  sprayLogs,
  cropHistory,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'crops' | 'season'>('monthly');

  // Helper to generate last 6 month labels (e.g. Nov 2025, Dec 2025 ... Apr 2026)
  const getLast6MonthsData = () => {
    const months: { [key: string]: { monthLabel: string; cost: number; sprayCount: number } } = {};
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const yearMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthNameEn = d.toLocaleString('en-US', { month: 'short' });
      const yearShort = String(d.getFullYear()).slice(-2);
      
      const label = lang === 'or'
        ? `${monthNameEn} '${yearShort}`
        : `${monthNameEn} '${yearShort}`;

      months[yearMonthKey] = { monthLabel: label, cost: 0, sprayCount: 0 };
    }

    // Populate with spray log data
    sprayLogs.forEach((log) => {
      if (!log.spray_date) return;
      const logYearMonth = log.spray_date.slice(0, 7);
      if (months[logYearMonth]) {
        // Estimated cost per spray if not specified: acres * ~₹350 per spray
        const cost = log.cost_inr || Math.round((log.field_area_acres || 1) * 380);
        months[logYearMonth].cost += cost;
        months[logYearMonth].sprayCount += 1;
      }
    });

    return Object.values(months);
  };

  // Crop-wise Cost Distribution
  const getCropWiseData = () => {
    const cropMap: { [key: string]: number } = {};
    sprayLogs.forEach((log) => {
      const cropKey = log.crop_name.split(' ')[0] || 'Other';
      const cost = log.cost_inr || Math.round((log.field_area_acres || 1) * 380);
      cropMap[cropKey] = (cropMap[cropKey] || 0) + cost;
    });

    const result = Object.entries(cropMap).map(([crop, cost]) => ({
      name: crop,
      value: cost,
    }));

    if (result.length === 0) {
      return [
        { name: 'Paddy (ଧାନ)', value: 1450 },
        { name: 'Tomato (ବିଲାତି)', value: 820 },
        { name: 'Brinjal (ବାଇଗଣ)', value: 650 },
      ];
    }
    return result;
  };

  // Seasonal Performance Data from Crop History
  const getSeasonalData = () => {
    return cropHistory.slice(0, 6).map((item) => ({
      name: `${item.year} ${item.season}`,
      crop: lang === 'or' ? item.crop_name_or : item.crop_name_en,
      expense: item.total_expenses_inr || 0,
      profit: (item.net_revenue_inr || 0) - (item.total_expenses_inr || 0),
      yieldQuintals: item.yield_quintals || 0,
    })).reverse();
  };

  const monthlyData = getLast6MonthsData();
  const cropData = getCropWiseData();
  const seasonalData = getSeasonalData();

  const total6MonthCost = monthlyData.reduce((acc, curr) => acc + curr.cost, 0);
  const total6MonthSprays = monthlyData.reduce((acc, curr) => acc + curr.sprayCount, 0);
  const avgCostPerSpray = total6MonthSprays > 0 ? Math.round(total6MonthCost / total6MonthSprays) : 0;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-5 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
            <BarChart3 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-stone-900 flex items-center gap-2">
              <span>
                {lang === 'or'
                  ? 'ଗତ ୬ ମାସର ସ୍ପ୍ରେ ଖର୍ଚ୍ଚ ଓ ବାରମ୍ବାରତା ବିଶ୍ଳେଷଣ'
                  : '6-Month Spray Cost & Application Frequency Analytics'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                Recharts
              </span>
            </h3>
            <p className="text-xs text-stone-500">
              {lang === 'or'
                ? 'ମାସିକ କୀଟନାଶକ ପ୍ରୟୋଗ ଖର୍ଚ୍ଚ (₹) ଏବଂ ସ୍ପ୍ରେ ସଂଖ୍ୟାର ଆଲେଖ'
                : 'Interactive chart showing 6-month spray expenses, application count, and seasonal net margin.'}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'monthly'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'or' ? '୬-ମାସର ଟ୍ରେଣ୍ଡ' : '6-Month Trend'}
          </button>
          <button
            onClick={() => setActiveTab('crops')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'crops'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'or' ? 'ଫସଲ ଖର୍ଚ୍ଚ' : 'Crop Breakdown'}
          </button>
          <button
            onClick={() => setActiveTab('season')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'season'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'or' ? 'ଋତୁୱାରୀ ଲାଭ' : 'Seasonal Profit'}
          </button>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-800 font-bold uppercase block">
              {lang === 'or' ? '୬-ମାସର ମୋଟ ସ୍ପ୍ରେ ଖର୍ଚ୍ଚ' : '6-Mo Spray Cost'}
            </span>
            <span className="text-base font-black text-emerald-950">₹{total6MonthCost.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-amber-800 font-bold uppercase block">
              {lang === 'or' ? 'ସ୍ପ୍ରେ ବାରମ୍ବାରତା (ସଂଖ୍ୟା)' : 'Total Sprays Logged'}
            </span>
            <span className="text-base font-black text-amber-950">{total6MonthSprays} Times</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-teal-50/80 border border-teal-100 col-span-2 sm:col-span-1 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-teal-800 font-bold uppercase block">
              {lang === 'or' ? 'ହାରାହାରି ସ୍ପ୍ରେ ପିଛା ଖର୍ଚ୍ଚ' : 'Avg Cost / Spray'}
            </span>
            <span className="text-base font-black text-teal-950">₹{avgCostPerSpray}</span>
          </div>
        </div>
      </div>

      {/* Main Chart View */}
      <div className="pt-2 h-72 sm:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'monthly' ? (
            <ComposedChart data={monthlyData} margin={{ top: 15, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 11, fill: '#44403c' }} />
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#059669"
                tick={{ fontSize: 11, fill: '#059669' }}
                unit="₹"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#d97706"
                tick={{ fontSize: 11, fill: '#d97706' }}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value: any, name: any) => {
                  if (name === 'Spray Cost (₹)' || name === 'ସ୍ପ୍ରେ ଖର୍ଚ୍ଚ (₹)') return [`₹${value}`, name];
                  return [`${value} times`, name];
                }}
                contentStyle={{ borderRadius: '16px', borderColor: '#059669', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar
                yAxisId="left"
                dataKey="cost"
                name={lang === 'or' ? 'ସ୍ପ୍ରେ ଖର୍ଚ୍ଚ (₹)' : 'Spray Cost (₹)'}
                fill="#10b981"
                radius={[8, 8, 0, 0]}
                barSize={32}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="sprayCount"
                name={lang === 'or' ? 'ସ୍ପ୍ରେ ସଂଖ୍ୟା (Frequency)' : 'Spray Count (Frequency)'}
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 5, fill: '#d97706' }}
              />
            </ComposedChart>
          ) : activeTab === 'crops' ? (
            <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <Pie
                data={cropData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
              >
                {cropData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val: any) => [`₹${val}`, 'Chemical Cost']} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          ) : (
            <BarChart data={seasonalData} margin={{ top: 15, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#44403c' }} />
              <YAxis tick={{ fontSize: 11, fill: '#44403c' }} unit="₹" />
              <Tooltip formatter={(val: any) => [`₹${val}`, 'Amount']} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar
                dataKey="expense"
                name={lang === 'or' ? 'ମୋଟ ଖର୍ଚ୍ଚ (Expenses)' : 'Total Expenses (₹)'}
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="profit"
                name={lang === 'or' ? 'ନିଟ୍ ଲାଭ (Net Profit)' : 'Net Profit (₹)'}
                fill="#059669"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
