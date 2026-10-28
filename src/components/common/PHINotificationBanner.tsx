import React, { useState, useEffect } from 'react';
import { Language, SprayRecord } from '../../types';
import {
  auditAllSprayLogsPHI,
  requestPushNotificationPermission,
  checkAndTriggerPHIPushNotifications,
  PHIStatusResult,
} from '../../services/phiNotificationService';
import { ShieldCheck, Bell, AlertCircle, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface PHINotificationBannerProps {
  sprayLogs: SprayRecord[];
  lang: Language;
  compact?: boolean;
}

export const PHINotificationBanner: React.FC<PHINotificationBannerProps> = ({
  sprayLogs,
  lang,
  compact = false,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'denied';
  });

  const [phiResults, setPhiResults] = useState<PHIStatusResult[]>([]);
  const [notifiedCount, setNotifiedCount] = useState<number>(0);

  useEffect(() => {
    const results = auditAllSprayLogsPHI(sprayLogs);
    setPhiResults(results);

    // Try sending push notifications if permission granted
    if (permission === 'granted') {
      const count = checkAndTriggerPHIPushNotifications(sprayLogs, lang);
      setNotifiedCount(count);
    }
  }, [sprayLogs, permission, lang]);

  const handleEnableNotifications = async () => {
    const perm = await requestPushNotificationPermission();
    setPermission(perm);
    if (perm === 'granted') {
      const count = checkAndTriggerPHIPushNotifications(sprayLogs, lang);
      setNotifiedCount(count);
    }
  };

  const safeCrops = phiResults.filter((r) => r.status === 'HARVEST_TODAY' || r.status === 'SAFE');
  const waitingCrops = phiResults.filter((r) => r.status === 'WAITING');

  if (phiResults.length === 0) return null;

  return (
    <div className="space-y-3 text-left">
      {/* Banner Header / Permission bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white rounded-3xl p-4 sm:p-5 shadow-sm border border-emerald-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 shadow-xs font-black">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-600">
                {lang === 'or' ? 'ଅମଳ ସୁରକ୍ଷା' : 'PHI Safety'}
              </span>
              <h4 className="text-sm sm:text-base font-extrabold text-white">
                {lang === 'or'
                  ? 'ସୁରକ୍ଷିତ ଅମଳ ତାରିଖ ଓ ସପ୍ତାହସାରା PHI ଆଲର୍ଟ'
                  : 'Pre-Harvest Interval (PHI) & Safe Harvest System'}
              </h4>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              {lang === 'or'
                ? 'କୀଟନାଶକର ପ୍ରଭାବ ଶେଷ ହେବା ପରେ ସୁରକ୍ଷିତ ଅମଳ ତାରିଖ ଗଣନା କରାଯାଏ।'
                : 'Monitors pesticide residue waiting periods and alerts when crops reach Safe Harvest Date.'}
            </p>
          </div>
        </div>

        {/* Push Notification Permission Button */}
        <div>
          {permission === 'granted' ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-emerald-800/80 border border-emerald-500/80 text-emerald-200 text-xs font-bold shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'or' ? 'ପୁଶ୍ ସତର୍କତା ଚାଲୁ ଅଛି' : 'Push Alerts Active'}</span>
            </span>
          ) : (
            <button
              onClick={handleEnableNotifications}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Bell className="w-4 h-4 stroke-[2.5]" />
              <span>
                {lang === 'or'
                  ? 'ସୁରକ୍ଷିତ ଅମଳ ନୋଟିଫିକେସନ୍ ଅନ୍ କରନ୍ତୁ'
                  : 'Enable Push Notifications'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* List of Active PHI Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Ready / Safe Harvest Crops */}
        {safeCrops.slice(0, compact ? 2 : 4).map((item) => (
          <div
            key={item.record.id}
            className="bg-emerald-50 border border-emerald-300 rounded-3xl p-4 shadow-2xs flex items-start gap-3 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-700 text-white">
                  {item.record.crop_name}
                </span>
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                  🟢 {lang === 'or' ? 'ସୁରକ୍ଷିତ ଅମଳ ଯୋଗ୍ୟ' : 'Safe Harvest Date Reached'}
                </span>
              </div>
              <p className="text-xs font-extrabold text-stone-900">
                {lang === 'or' ? item.statusLabelOr : item.statusLabelEn}
              </p>
              <p className="text-[11px] text-stone-600">
                🧪 <strong>{item.record.product_name}</strong> (PHI: {item.phiDays} {lang === 'or' ? 'ଦିନ' : 'days'}) • {lang === 'or' ? 'ସ୍ପ୍ରେ:' : 'Sprayed:'} {item.record.spray_date}
              </p>
            </div>
          </div>
        ))}

        {/* PHI Waiting Crops */}
        {waitingCrops.slice(0, compact ? 2 : 4).map((item) => (
          <div
            key={item.record.id}
            className="bg-amber-50 border border-amber-300 rounded-3xl p-4 shadow-2xs flex items-start gap-3 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-600 text-white">
                  {item.record.crop_name}
                </span>
                <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">
                  ⏳ {lang === 'or' ? `ଅପେକ୍ଷା: ${item.daysRemaining} ଦିନ` : `Wait: ${item.daysRemaining} days`}
                </span>
              </div>
              <p className="text-xs font-extrabold text-stone-900">
                {lang === 'or' ? item.statusLabelOr : item.statusLabelEn}
              </p>
              <p className="text-[11px] text-stone-600">
                📅 {lang === 'or' ? 'ସୁରକ୍ଷିତ ଅମଳ ତାରିଖ:' : 'Safe Harvest Date:'} <strong>{item.safeHarvestDateStr}</strong> (PHI {item.phiDays} days for {item.record.product_name})
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
