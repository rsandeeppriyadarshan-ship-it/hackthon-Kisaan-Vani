import React, { useState, useEffect } from 'react';
import { Language, WeatherData, FarmerProfile } from '../../types';
import { Calendar, CloudRain, Wind, Thermometer, CheckCircle2, AlertTriangle, Sun, Bell, BellOff, Sparkles, CheckSquare, Clock } from 'lucide-react';
import { t, translatePlaceName, formatLocalizedUnit } from '../../services/translations';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  isRemindersEnabled,
  setRemindersEnabled,
  generateUpcomingFarmTasks,
  triggerInstantTaskReminder,
  FarmReminderTask,
} from '../../utils/farmScheduler';

interface FarmCalendarProps {
  lang: Language;
  weather: WeatherData | null;
  selectedDistrict: string;
  farmerProfile?: FarmerProfile | null;
  onTriggerToast?: (title: string, body: string) => void;
}

export const FarmCalendar: React.FC<FarmCalendarProps> = ({
  lang,
  weather,
  selectedDistrict,
  farmerProfile = null,
  onTriggerToast,
}) => {
  const forecast = weather?.forecast_days || [];
  const localizedDistrict = translatePlaceName(selectedDistrict, lang);

  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'default' | 'unsupported'>(getNotificationPermission());
  const [remindersOn, setRemindersOn] = useState<boolean>(isRemindersEnabled());
  const [upcomingTasks, setUpcomingTasks] = useState<FarmReminderTask[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [alertSuccessMsg, setAlertSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const tasks = generateUpcomingFarmTasks(farmerProfile, weather);
    setUpcomingTasks(tasks);
  }, [farmerProfile, weather]);

  const handleTogglePermission = async () => {
    if (permissionState === 'default') {
      const granted = await requestNotificationPermission();
      setPermissionState(getNotificationPermission());
      if (granted) {
        setRemindersOn(true);
        setAlertSuccessMsg(
          lang === 'or'
            ? '✅ ଆପଣଙ୍କ ଫାର୍ମ କ୍ୟାଲେଣ୍ଡର ସ୍ମାରକୀ ସଫଳତାର ସହ ସକ୍ରିୟ ହେଲା!'
            : lang === 'hi'
            ? '✅ आपका फार्म कैलेंडर रिमाइंडर सफलतापूर्वक सक्रिय हो गया!'
            : '✅ Farm calendar task notifications activated successfully!'
        );
        setTimeout(() => setAlertSuccessMsg(null), 4000);
      }
    } else {
      const nextState = !remindersOn;
      setRemindersOn(nextState);
      setRemindersEnabled(nextState);
    }
  };

  const handleTestAlert = () => {
    triggerInstantTaskReminder(lang, onTriggerToast);
    setAlertSuccessMsg(
      lang === 'or'
        ? '🔔 ପରୀକ୍ଷାମୂଳକ ଆଲର୍ଟ ପଠାଗଲା! ଫୋନ୍ ସ୍କ୍ରିନ୍ କିମ୍ବା ଆପ୍ ବ୍ୟାନର୍ ଦେଖନ୍ତୁ।'
        : lang === 'hi'
        ? '🔔 टेस्ट अलर्ट भेजा गया! फोन स्क्रीन या इन-ऐप बैनर देखें।'
        : '🔔 Test reminder dispatched! Check system banner or in-app toast.'
    );
    setTimeout(() => setAlertSuccessMsg(null), 4000);
  };

  const toggleTaskCompleted = (taskId: string) => {
    setCompletedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-3xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-900 flex items-center justify-center shadow-md shrink-0">
              <Calendar className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-700/60 text-amber-300 text-xs font-bold mb-1">
                <Sun className="w-3.5 h-3.5" />
                <span>{t('open_meteo_badge', lang)}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                {t('farm_calendar_shortcut', lang)} - {localizedDistrict}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-0.5">
                {lang === 'or'
                  ? 'ପ୍ରତି ଦିନର ବର୍ଷା ସମ୍ଭାବନା ଓ ପବନର ବେଗ ଦେଖି ସ୍ପ୍ରେ କରିବାର ସବୁଠୁ ଭଲ ଦିନ ବାଛନ୍ତୁ।'
                  : lang === 'hi'
                  ? 'प्रतिदिन बारिश की संभावना और हवा की गति देखकर स्प्रे करने का सबसे सुरक्षित दिन चुनें।'
                  : 'Identifies optimal spraying windows based on precipitation risk (<30%) and wind speeds (≤15 km/h).'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background Reminder Notification Control Center */}
      <div className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
              remindersOn && permissionState === 'granted'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {remindersOn && permissionState === 'granted' ? (
                <Bell className="w-5 h-5 text-emerald-700 animate-bounce" />
              ) : (
                <BellOff className="w-5 h-5 text-amber-700" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-stone-900">
                  {lang === 'or' ? '🔔 କୃଷି କାର୍ଯ୍ୟ ସ୍ମାରକୀ (Background Reminders)' : lang === 'hi' ? '🔔 कृषि कार्य रिमाइंडर (Push Notifications)' : '🔔 Farm Calendar Background Reminders'}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  permissionState === 'granted' && remindersOn
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {permissionState === 'granted' && remindersOn
                    ? (lang === 'or' ? 'ସକ୍ରିୟ' : lang === 'hi' ? 'सक्रिय' : 'ACTIVE')
                    : (lang === 'or' ? 'ନିଷ୍କ୍ରିୟ' : lang === 'hi' ? 'निष्क्रिय' : 'INACTIVE')}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {lang === 'or'
                  ? 'ସାର ପ୍ରୟୋଗ, ଜଳସେଚନ ଓ କୀଟନାଶକ ସ୍ପ୍ରେ ସମୟ ପୂର୍ବରୁ ସ୍ୱୟଂଚାଳିତ ମୋବାଇଲ ନୋଟିଫିକେସନ୍ ପାଅନ୍ତୁ।'
                  : lang === 'hi'
                  ? 'खाद, सिंचाई और कीटनाशक छिड़काव के समय से पहले स्वचालित मोबाइल नोटिफिकेशन प्राप्त करें।'
                  : 'Receive push alerts and local reminders before scheduled spraying, fertilization, and irrigation tasks.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={handleTogglePermission}
              className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 shadow-xs transition-transform active:scale-95 ${
                permissionState === 'granted' && remindersOn
                  ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>
                {permissionState === 'default'
                  ? (lang === 'or' ? 'ଅନୁମତି ଦିଅନ୍ତୁ' : lang === 'hi' ? 'अनुमति दें' : 'Enable Push Alerts')
                  : remindersOn
                  ? (lang === 'or' ? 'ସ୍ମାରକୀ ବନ୍ଦ କରନ୍ତୁ' : lang === 'hi' ? 'रिमाइंडर बंद करें' : 'Disable Reminders')
                  : (lang === 'or' ? 'ସ୍ମାରକୀ ଚାଲୁ କରନ୍ତୁ' : lang === 'hi' ? 'रिमाइंडर चालू करें' : 'Enable Reminders')}
              </span>
            </button>

            <button
              onClick={handleTestAlert}
              className="px-3.5 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95"
              title="Test notification dispatch"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>{lang === 'or' ? 'ପରୀକ୍ଷା ଆଲର୍ଟ' : lang === 'hi' ? 'टेस्ट अलर्ट' : 'Test Alert'}</span>
            </button>
          </div>
        </div>

        {alertSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{alertSuccessMsg}</span>
          </div>
        )}

        {/* Dynamic Scheduled Tasks Timeline */}
        {upcomingTasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'or' ? 'ଆଗାମୀ କୃଷି କାର୍ଯ୍ୟସୂଚୀ' : lang === 'hi' ? 'आगामी कृषि कार्य सूची' : 'Upcoming Scheduled Farming Tasks'}</span>
              </h4>
              <span className="text-[11px] font-medium text-stone-400">
                {upcomingTasks.length} {lang === 'or' ? 'କାର୍ଯ୍ୟ' : lang === 'hi' ? 'कार्य' : 'tasks scheduled'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {upcomingTasks.map((task) => {
                const isDone = completedTaskIds.includes(task.id);
                const titleText = task.title[lang] || task.title['en'] || task.title['or'];
                const bodyText = task.body[lang] || task.body['en'] || task.body['or'];

                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskCompleted(task.id)}
                    className={`cursor-pointer p-3.5 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-stone-50 border-stone-200 opacity-60'
                        : task.priority === 'high'
                        ? 'bg-amber-50/50 border-amber-200 hover:border-amber-400 shadow-xs'
                        : 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-400 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <button className="mt-0.5 text-stone-400 hover:text-emerald-600 transition-colors">
                          <CheckSquare className={`w-4 h-4 ${isDone ? 'text-emerald-600 fill-emerald-100' : 'text-stone-300'}`} />
                        </button>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-black ${isDone ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                              {titleText}
                            </span>
                          </div>
                          <p className={`text-[11px] mt-1 leading-snug ${isDone ? 'line-through text-stone-400' : 'text-stone-600'}`}>
                            {bodyText}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 px-2 py-0.5 bg-white border border-stone-200 rounded-lg text-[10px] font-bold text-stone-600">
                        {task.dueDate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 7-Day Cards List */}
      <div className="space-y-3.5">
        {forecast.map((day, idx) => {
          return (
            <div
              key={day.date}
              className={`rounded-3xl p-4 sm:p-5 shadow-xs border transition-all ${
                day.is_good_for_spraying
                  ? 'bg-white border-emerald-300 hover:border-emerald-500 hover:shadow-md'
                  : (day.rain_probability > 40
                      ? 'bg-amber-50/60 border-amber-300'
                      : 'bg-stone-50/80 border-stone-200')
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Date and Day Title */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold text-center shrink-0 ${
                    day.is_good_for_spraying
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : (day.rain_probability > 40 ? 'bg-amber-500 text-stone-900' : 'bg-stone-200 text-stone-700')
                  }`}>
                    <span className="text-[10px] uppercase tracking-wider leading-none">
                      {idx === 0
                        ? lang === 'or'
                          ? 'ଆଜି'
                          : lang === 'hi'
                          ? 'आज'
                          : 'TODAY'
                        : new Date(day.date).toLocaleDateString(lang === 'or' ? 'or-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'short' })}
                    </span>
                    <span className="text-base font-black leading-none mt-1">
                      {new Date(day.date).getDate()}
                    </span>
                  </div>

                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-stone-900 text-base">
                        {lang === 'or' ? day.day_name_or : day.day_name_en}
                      </h3>
                      <span className="text-xs text-stone-400">({day.date})</span>
                    </div>

                    <p className="text-xs text-stone-600 mt-0.5">
                      {lang === 'or' ? day.notes_or : day.notes_en}
                    </p>
                  </div>
                </div>

                {/* Spray Decision Badge */}
                <div className="flex items-center gap-2 sm:self-center">
                  <div className={`px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 shadow-xs ${
                    day.is_good_for_spraying
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : (day.rain_probability > 40
                          ? 'bg-red-100 text-red-900 border border-red-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-300')
                  }`}>
                    {day.is_good_for_spraying ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    )}
                    <span>{lang === 'or' ? day.spray_status_or : day.spray_status_en}</span>
                  </div>
                </div>
              </div>

              {/* Weather Metrics Bar */}
              <div className="mt-3.5 pt-3 border-t border-stone-100 grid grid-cols-3 gap-2 text-xs text-left">
                {/* Rain */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-100">
                  <CloudRain className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">
                      {t('rain_chance', lang)}
                    </span>
                    <span className="font-black text-stone-800">{day.rain_probability}%</span>
                  </div>
                </div>

                {/* Wind */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-100">
                  <Wind className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">
                      {t('wind_speed', lang)}
                    </span>
                    <span className="font-black text-stone-800">
                      {formatLocalizedUnit(day.wind_speed_max, 'kmh', lang)}
                    </span>
                  </div>
                </div>

                {/* Temp */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-stone-50 border border-stone-100">
                  <Thermometer className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="text-[10px] text-stone-400 block font-bold uppercase">
                      {t('Temp', lang)}
                    </span>
                    <span className="font-black text-stone-800">
                      {day.min_temp}° - {formatLocalizedUnit(day.max_temp, 'temp_c', lang)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

