import React, { useState } from 'react';
import { Language, WeatherAlert, AlertSeverity } from '../../types';
import { voiceService } from '../../services/voiceService';
import { AudioPlayerCard } from '../common/AudioPlayerCard';
import { ODISHA_DISTRICTS } from '../../services/weatherService';
import { AlertTriangle, CloudLightning, Wind, Sun, Volume2, VolumeX, ShieldAlert, CheckCircle2, MapPin, Zap, Radio } from 'lucide-react';

interface WeatherAlertsProps {
  lang: Language;
  alerts: WeatherAlert[];
  currentDistrict: string;
  onDistrictChange: (district: string) => void;
}

export const WeatherAlerts: React.FC<WeatherAlertsProps> = ({
  lang,
  alerts,
  currentDistrict,
  onDistrictChange,
}) => {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  const handlePlayAlert = (alert: WeatherAlert) => {
    setIsPlaying(alert.id);
    const textToSpeak = lang === 'or'
      ? `${alert.headline_or}। ଜରୁରୀ ପରାମର୍ଶ: ${alert.instructions_or.join('. ')}`
      : `${alert.headline_en}. Safety advisory: ${alert.instructions_en.join('. ')}`;

    voiceService.speak(textToSpeak, lang, () => {
      setIsPlaying(null);
    });
  };

  const handleStopAudio = () => {
    voiceService.stopSpeaking();
    setIsPlaying(null);
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'RED':
        return {
          bg: 'bg-red-600 text-white border-red-500',
          label_en: 'RED ALERT (Take Action)',
          label_or: 'ଲାଲ୍ ସତର୍କତା (ତୁରନ୍ତ ସୁରକ୍ଷା ପଦକ୍ଷେପ)'
        };
      case 'ORANGE':
        return {
          bg: 'bg-amber-500 text-stone-950 border-amber-400',
          label_en: 'ORANGE ALERT (Be Prepared)',
          label_or: 'କମଳା ସତର୍କତା (ପ୍ରସ୍ତୁତ ରୁହନ୍ତୁ)'
        };
      case 'YELLOW':
        return {
          bg: 'bg-yellow-400 text-stone-950 border-yellow-300',
          label_en: 'YELLOW ALERT (Be Aware / Watch)',
          label_or: 'ହଳଦିଆ ସତର୍କତା (ସତର୍କ ଦୃଷ୍ଟି ରଖନ୍ତୁ)'
        };
      case 'GREEN':
      default:
        return {
          bg: 'bg-emerald-600 text-white border-emerald-500',
          label_en: 'GREEN (Normal Weather)',
          label_or: 'ସବୁଜ (ସ୍ୱାଭାବିକ ପାଣିପାଗ)'
        };
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center shadow-md shrink-0">
              <CloudLightning className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-950/60 border border-red-400 text-yellow-300 text-xs font-bold mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>IMD Bhubaneswar & OSDMA Alert Feeds</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                {lang === 'or' ? `ପାଣିପାଗ ସତର୍କତା ଓ ଚେତାବନୀ (${currentDistrict})` : `Severe Weather Alerts - ${currentDistrict}`}
              </h2>
              <p className="text-xs sm:text-sm text-red-100 mt-0.5 max-w-xl">
                {lang === 'or'
                  ? 'କାଳବୈଶାଖୀ, ବଜ୍ରପାତ, ପ୍ରବଳ ବର୍ଷା, ଝଡ଼ ପବନ ଓ ଗ୍ରୀଷ୍ମ ପ୍ରବାହ ସମ୍ବନ୍ଧୀୟ ଆଗୁଆ ଚେତାବନୀ ଏବଂ କୃଷି ସୁରକ୍ଷା ନିୟମ।'
                  : 'Early warnings for Thunderstorms, Lightning (Kalbaishakhi), High Wind Gusts, and Heatwaves with farmer field safety actions.'}
              </p>
            </div>
          </div>

          {/* District Quick Switcher */}
          <div className="bg-red-950/70 p-2.5 rounded-2xl border border-red-400/60 text-xs self-start sm:self-auto">
            <label className="text-[10px] text-yellow-300 font-bold block mb-1">
              {lang === 'or' ? 'ଜିଲ୍ଲା ପରିବର୍ତ୍ତନ:' : 'Switch District:'}
            </label>
            <select
              value={currentDistrict}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="bg-red-900 text-white font-bold rounded-xl px-2.5 py-1.5 border border-red-500 focus:outline-none"
            >
              {ODISHA_DISTRICTS.map((d) => (
                <option key={d.name_en} value={d.name_en}>
                  {lang === 'or' ? d.name_or : d.name_en}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lightning Safety Priority Advice for Odisha Farmers */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-50 to-red-50 p-5 border-2 border-amber-300 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 text-stone-900">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-stone-900 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 fill-stone-900" />
          </div>
          <h3 className="font-extrabold text-base text-stone-900">
            {lang === 'or' ? 'ବିଲରେ ବଜ୍ରପାତରୁ ଜୀବନ ରକ୍ଷା ନିୟମ (Lightning Golden Rules):' : 'Farmer Lightning Field Safety Protocol:'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-stone-700">
          <div className="p-3 bg-white rounded-2xl border border-amber-200 shadow-2xs">
            <p className="font-extrabold text-red-700 mb-1">
              ⛔ {lang === 'or' ? 'ଗଛ ତଳେ ଆଶ୍ରୟ ନୁହେଁ' : 'Never Shelter Under Trees'}
            </p>
            <p className="leading-relaxed">
              {lang === 'or'
                ? 'ବିଲରେ ଘଡ଼ଘଡ଼ି ବେଳେ ଏକୁଟିଆ ବଡ଼ ଗଛ କିମ୍ବା ଖୁଣ୍ଟ ତଳେ ଆଦୌ ଛିଡ଼ା ହୁଅନ୍ତୁ ନାହିଁ।'
                : 'Never stand under isolated tall trees or metal electrical towers in open paddies.'}
            </p>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-amber-200 shadow-2xs">
            <p className="font-extrabold text-amber-700 mb-1">
              ⚡ {lang === 'or' ? 'ଧାତବ ଉପକରଣ ତଳେ ରଖନ୍ତୁ' : 'Drop Metal Tools'}
            </p>
            <p className="leading-relaxed">
              {lang === 'or'
                ? 'ଲୁହା କୋଡ଼ି, ଦାଆ, ଟ୍ରାକ୍ଟର କିମ୍ବା ଧାତବ ସ୍ପ୍ରେୟାର ତୁରନ୍ତ ନିଜଠାରୁ ଦୂରରେ ରଖନ୍ତୁ।'
                : 'Drop sickles, iron hoes, metal sprayers, and step away from tractors.'}
            </p>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-amber-200 shadow-2xs">
            <p className="font-extrabold text-emerald-800 mb-1">
              蹲 {lang === 'or' ? 'ତଳେ ଉବୁଡୁ ବସନ୍ତୁ' : 'Lightning Crouch Position'}
            </p>
            <p className="leading-relaxed">
              {lang === 'or'
                ? 'ଘର ନମିଳିଲେ ଦୁଇ ଗୋଡ଼ ଯୋଡ଼ି କାନ ବନ୍ଦ କରି ତଳେ ଉବୁଡୁ ବସନ୍ତୁ (ମାଟିରେ ଶୁଅନ୍ତୁ ନାହିଁ)।'
                : 'If caught in the open, crouch low on the balls of your feet with hands on ears. Do NOT lie flat.'}
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Audio Warning Broadcast */}
      {alerts.length > 0 && (
        <div>
          <AudioPlayerCard
            title={lang === 'or' ? `${currentDistrict} ଜିଲ୍ଲା ପାଣିପାଗ ସତର୍କତା ବୁଲେଟିନ୍` : `${currentDistrict} District Official Weather Broadcast`}
            subtitle={lang === 'or' ? 'ଭାରତୀୟ ପାଣିପାଗ ବିଭାଗ (IMD) ଏବଂ OSDMA ଦ୍ୱାରା ଜାରି ନିର୍ଦ୍ଦେଶାବଳୀ' : 'Issued by India Meteorological Dept (IMD) & OSDMA'}
            textToSpeak={lang === 'or'
              ? `${alerts[0].headline_or}। ଜରୁରୀ ପରାମର୍ଶ: ${alerts[0].instructions_or.join('. ')}`
              : `${alerts[0].headline_en}. Safety instructions: ${alerts[0].instructions_en.join('. ')}`}
            lang={lang}
            accentColor={alerts[0].severity === 'RED' ? 'red' : 'emerald'}
          />
        </div>
      )}

      {/* Active Alerts List */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-stone-900 text-base">
          {lang === 'or' ? 'ସକ୍ରିୟ ଚେତାବନୀ ବିବରଣୀ (Active Bulletins):' : 'Current Warning Bulletins:'}
        </h3>

        {alerts.map((alert) => {
          const badge = getSeverityBadge(alert.severity);
          const isThisPlaying = isPlaying === alert.id;

          return (
            <div
              key={alert.id}
              className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 space-y-4 hover:border-amber-400 transition-all"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2.5">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border shadow-xs ${badge.bg}`}>
                    {lang === 'or' ? badge.label_or : badge.label_en}
                  </span>
                  <span className="text-xs text-stone-500 font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    {alert.district}
                  </span>
                </div>

                {/* Audio Button */}
                <button
                  onClick={isThisPlaying ? handleStopAudio : () => handlePlayAlert(alert)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto ${
                    isThisPlaying
                      ? 'bg-red-600 text-white'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }`}
                >
                  {isThisPlaying ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>{lang === 'or' ? 'ଅଡିଓ ବନ୍ଦ' : 'Stop Narration'}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{lang === 'or' ? 'ଓଡ଼ିଆରେ ଶୁଣନ୍ତୁ' : 'Listen Alert'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Headline */}
              <div>
                <h4 className="text-base sm:text-lg font-black text-stone-900">
                  {lang === 'or' ? alert.headline_or : alert.headline_en}
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  {alert.valid_until} • {alert.issued_by}
                </p>
              </div>

              {/* Instructions List */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                <p className="font-extrabold text-stone-800 text-xs uppercase tracking-wider">
                  {lang === 'or' ? 'କୃଷକଙ୍କ ପାଇଁ ଜରୁରୀ ନିର୍ଦ୍ଦେଶାବଳୀ:' : 'Mandatory Farmer Field Instructions:'}
                </p>
                <ul className="text-xs text-stone-700 space-y-1.5 list-disc list-inside leading-relaxed">
                  {(lang === 'or' ? alert.instructions_or : alert.instructions_en).map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
