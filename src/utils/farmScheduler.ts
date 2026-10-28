import { FarmerProfile, Language, WeatherData, SprayRecord } from '../types';

export interface FarmReminderTask {
  id: string;
  title: Record<string, string>;
  body: Record<string, string>;
  category: 'spray' | 'fertilizer' | 'irrigation' | 'harvest' | 'general';
  dueDate: string; // YYYY-MM-DD
  cropName?: string;
  isCompleted?: boolean;
  priority: 'high' | 'medium' | 'normal';
}

const STORAGE_REMINDER_SETTINGS = 'kb_farm_reminders_enabled';
const STORAGE_SCHEDULED_TASKS = 'kb_scheduled_farm_tasks';
const STORAGE_TRIGGERED_NOTIFS = 'kb_triggered_notifications_log';

/**
 * Check if browser Web Notification API is supported
 */
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

/**
 * Get current notification permission status ('granted' | 'denied' | 'default' | 'unsupported')
 */
export const getNotificationPermission = (): 'granted' | 'denied' | 'default' | 'unsupported' => {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
};

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setRemindersEnabled(true);
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Error requesting notification permission:', e);
    return false;
  }
};

/**
 * Get saved farmer preference for task reminders
 */
export const isRemindersEnabled = (): boolean => {
  if (typeof localStorage === 'undefined') return true;
  const saved = localStorage.getItem(STORAGE_REMINDER_SETTINGS);
  return saved === null ? true : saved === 'true';
};

/**
 * Toggle farmer reminder preference
 */
export const setRemindersEnabled = (enabled: boolean): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_REMINDER_SETTINGS, String(enabled));
  }
};

/**
 * Trigger an in-app or system Web Notification
 */
export const sendSystemNotification = (
  title: string,
  body: string,
  tag?: string,
  onInAppToast?: (title: string, body: string) => void
): boolean => {
  let sentSystemNotif = false;

  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const options: NotificationOptions & { renotify?: boolean } = {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: tag || 'krushak-bani-farm-reminder',
        renotify: true,
      };

      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, options);
        });
        sentSystemNotif = true;
      } else {
        new Notification(title, options);
        sentSystemNotif = true;
      }
    } catch (err) {
      console.warn('Fallback to in-app toast notification due to platform constraint:', err);
    }
  }

  // Always invoke in-app toast callback if provided or if system notif couldn't be shown
  if (onInAppToast) {
    onInAppToast(title, body);
  }

  return sentSystemNotif;
};

/**
 * Generate upcoming farming tasks dynamically based on crop schedules & weather
 */
export const generateUpcomingFarmTasks = (
  farmer: FarmerProfile | null,
  weather: WeatherData | null
): FarmReminderTask[] => {
  const tasks: FarmReminderTask[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  const crops = farmer?.primaryCrops?.length ? farmer.primaryCrops : ['Paddy (ଧାନ)', 'Vegetables (ପନିପରିବା)'];

  // 1. Weather-based Spray Window Task
  const sprayDay = weather?.forecast_days?.find((d) => d.is_good_for_spraying);
  if (sprayDay) {
    tasks.push({
      id: `task-spray-${sprayDay.date}`,
      category: 'spray',
      dueDate: sprayDay.date,
      priority: 'high',
      cropName: crops[0],
      title: {
        or: `🌱 ସ୍ପ୍ରେ କରିବାର ସୁବିଧା ଦିନ: ${sprayDay.date === todayStr ? 'ଆଜି' : sprayDay.date}`,
        hi: `🌱 छिड़काव के लिए अनुकूल समय: ${sprayDay.date === todayStr ? 'आज' : sprayDay.date}`,
        en: `🌱 Optimal Spraying Window: ${sprayDay.date === todayStr ? 'Today' : sprayDay.date}`,
        bn: `🌱 স্প্রে করার উপযুক্ত সময়: ${sprayDay.date === todayStr ? 'আজ' : sprayDay.date}`,
        ta: `🌱 தெளிப்பதற்கான சிறந்த நேரம்: ${sprayDay.date === todayStr ? 'இன்று' : sprayDay.date}`,
        ur: `🌱 اسپرے کا بہترین وقت: ${sprayDay.date === todayStr ? 'آج' : sprayDay.date}`,
      },
      body: {
        or: `ପବନ ${sprayDay.wind_speed_max} କିମି/ଘଣ୍ଟା ଏବଂ ବର୍ଷା ${sprayDay.rain_probability}%। ସୁରକ୍ଷିତ ସ୍ପ୍ରେ କରନ୍ତୁ।`,
        hi: `हवा ${sprayDay.wind_speed_max} किमी/घंटा और बारिश ${sprayDay.rain_probability}%। सुरक्षित छिड़काव करें।`,
        en: `Wind speed ${sprayDay.wind_speed_max} km/h, rain risk ${sprayDay.rain_probability}%. Safe time for application.`,
        bn: `বাতাসের গতি ${sprayDay.wind_speed_max} কিমি/ঘণ্টা, বৃষ্টির ঝুঁকি ${sprayDay.rain_probability}%।`,
        ta: `காற்றின் வேகம் ${sprayDay.wind_speed_max} கிமீ/மணி, மழை ஆபத்து ${sprayDay.rain_probability}%.`,
        ur: `ہوا کی رفتار ${sprayDay.wind_speed_max} کلومیٹر/گھنٹہ، بارش کا امکان ${sprayDay.rain_probability}%۔`,
      },
    });
  }

  // 2. Crop Fertilizer Split Application Reminder
  crops.forEach((crop, idx) => {
    const cropSimple = crop.split(' ')[0];
    const dueDate = new Date(Date.now() + (idx + 1) * 2 * 86400000).toISOString().split('T')[0];

    tasks.push({
      id: `task-fertilizer-${cropSimple}-${dueDate}`,
      category: 'fertilizer',
      dueDate,
      priority: 'medium',
      cropName: crop,
      title: {
        or: `🧪 ${cropSimple} - ସାର ପ୍ରୟୋଗ ସମୟ (DAP / Urea)`,
        hi: `🧪 ${cropSimple} - उर्वरक प्रयोग का समय (DAP / यूरिया)`,
        en: `🧪 ${cropSimple} - Fertilizer Dose Due (DAP / Urea)`,
        bn: `🧪 ${cropSimple} - সার প্রয়োগের সময়`,
        ta: `🧪 ${cropSimple} - உரம் இடும் நேரம்`,
        ur: `🧪 ${cropSimple} - کھاد ڈالنے کا وقت`,
      },
      body: {
        or: `ଖେତର ମାଟିରେ ଆବଶ୍ୟକୀୟ ନାଇଟ୍ରୋଜେନ ଓ ଫସଫରସ୍‌ ଯୋଗାଇବା ପାଇଁ ଶୀଘ୍ର ସାର ପ୍ରୟୋଗ କରନ୍ତୁ।`,
        hi: `फसल की अच्छी पैदावार के लिए समय पर उर्वरक का छिड़काव करें।`,
        en: `Apply recommended split nitrogen & phosphate dose for optimal tillering and yield.`,
        bn: `ফসলের ভালো ফলনের জন্য সঠিক সময়ে সার প্রয়োগ করুন।`,
        ta: `சிறந்த மகசூலுக்கு சரியான நேரத்தில் உரம் இடவும்.`,
        ur: `بہتر پیداوار کے لیے وقت پر کھاد کا استعمال کریں۔`,
      },
    });
  });

  // 3. Irrigation Alert based on dry spell
  const dryDay = weather?.forecast_days?.find((d) => d.rain_probability < 15);
  if (dryDay) {
    tasks.push({
      id: `task-irrigation-${dryDay.date}`,
      category: 'irrigation',
      dueDate: dryDay.date,
      priority: 'medium',
      cropName: crops[0],
      title: {
        or: `💧 ଜଳସେଚନ ପରାମର୍ଶ (${dryDay.date})`,
        hi: `💧 सिंचाई की सलाह (${dryDay.date})`,
        en: `💧 Irrigation Scheduled Alert (${dryDay.date})`,
        bn: `💧 সেচের পরামর্শ (${dryDay.date})`,
        ta: `💧 நீர்ப்பாசன எச்சரிக்கை (${dryDay.date})`,
        ur: `💧 آبپاشی کا مشورہ (${dryDay.date})`,
      },
      body: {
        or: `ଶୁଖିଲା ପାଗ ଥିବାରୁ ଜମିରେ ହାଲୁକା ଜଳସେଚନ କରନ୍ତୁ। ଫସଲରେ ଜଳ ଅଭାବ ହେବାକୁ ଦିଅନ୍ତୁ ନାହିଁ।`,
        hi: `शुष्क मौसम के कारण खेत में हल्की सिंचाई करें ताकि फसल को नमी मिले।`,
        en: `Low rainfall risk forecast. Schedule light field flooding or drip irrigation.`,
        bn: `শুষ্ক আবহাওয়ার কারণে জমিতে সেচ দিন।`,
        ta: `வறண்ட வானிலை காரணமாக வயலுக்கு நீர்ப்பாசனம் செய்யுங்கள்.`,
        ur: `خشک موسم کی وجہ سے کھیت میں ہلکی آبپاشی کریں۔`,
      },
    });
  }

  // 4. PHI Harvest Safe Alerts from Spray Log
  if (farmer?.sprayLog && farmer.sprayLog.length > 0) {
    farmer.sprayLog.forEach((spray: SprayRecord) => {
      if (spray.safe_harvest_date) {
        tasks.push({
          id: `task-phi-${spray.id}`,
          category: 'harvest',
          dueDate: spray.safe_harvest_date,
          priority: 'high',
          cropName: spray.crop_name,
          title: {
            or: `🌾 ସୁରକ୍ଷିତ ଅମଳ ତାରିଖ (PHI Safe): ${spray.crop_name}`,
            hi: `🌾 सुरक्षित कटाई तिथि (PHI Safe): ${spray.crop_name}`,
            en: `🌾 Safe Harvest Window (PHI Complete): ${spray.crop_name}`,
            bn: `🌾 নিরাপদ ফসল কাটার তারিখ: ${spray.crop_name}`,
            ta: `🌾 பாதுகாப்பான அறுவடை நாள்: ${spray.crop_name}`,
            ur: `🌾 کٹائی کی محفوظ تاریخ: ${spray.crop_name}`,
          },
          body: {
            or: `${spray.product_name} ସ୍ପ୍ରେ ପରର କୀଟନାଶକ ଅବଶେଷ ସମୟ ସମାପ୍ତ। ବର୍ତ୍ତମାନ ଫସଲ ଅମଳ ପାଇଁ ସମ୍ପୂର୍ଣ୍ଣ ସୁରକ୍ଷିତ।`,
            hi: `${spray.product_name} छिड़काव के बाद का प्रतीक्षा समय समाप्त। अब कटाई के लिए सुरक्षित है।`,
            en: `Pre-harvest interval for ${spray.product_name} completed. Produce is safe for consumption and market.`,
            bn: `কীটনাশকের প্রভাব শেষ। এখন ফসল তোলার জন্য নিরাপদ।`,
            ta: `பூச்சிக்கொல்லி காலம் முடிந்தது. இப்போது அறுவடை செய்யலாம்.`,
            ur: `کیڑے مار دوا کی میعاد ختم۔ اب کٹائی کے لیے محفوظ ہے۔`,
          },
        });
      }
    });
  }

  return tasks;
};

/**
 * Periodically check due tasks and fire notifications if enabled
 */
export const checkAndTriggerDueReminders = (
  farmer: FarmerProfile | null,
  weather: WeatherData | null,
  lang: Language,
  onInAppToast?: (title: string, body: string) => void
): void => {
  if (!isRemindersEnabled()) return;

  const tasks = generateUpcomingFarmTasks(farmer, weather);
  const todayStr = new Date().toISOString().split('T')[0];

  let triggeredLog: Record<string, string> = {};
  if (typeof localStorage !== 'undefined') {
    try {
      triggeredLog = JSON.parse(localStorage.getItem(STORAGE_TRIGGERED_NOTIFS) || '{}');
    } catch {
      triggeredLog = {};
    }
  }

  tasks.forEach((task) => {
    // Check if task is due today or overdue within last 1 day
    if (task.dueDate <= todayStr) {
      const lastTriggered = triggeredLog[task.id];
      if (!lastTriggered || lastTriggered !== todayStr) {
        const title = task.title[lang] || task.title['en'] || task.title['or'];
        const body = task.body[lang] || task.body['en'] || task.body['or'];

        const sent = sendSystemNotification(title, body, task.id, onInAppToast);
        if (sent || onInAppToast) {
          triggeredLog[task.id] = todayStr;
        }
      }
    }
  });

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_TRIGGERED_NOTIFS, JSON.stringify(triggeredLog));
  }
};

/**
 * Trigger Instant Test Reminder Alert for farmer UI testing
 */
export const triggerInstantTaskReminder = (
  lang: Language,
  onInAppToast?: (title: string, body: string) => void
): void => {
  const testTitles: Record<string, string> = {
    or: '🔔 କୃଷକ ବାଣୀ କାର୍ଯ୍ୟ ସ୍ମାରକୀ - ପରୀକ୍ଷାମୂଳକ ଆଲର୍ଟ',
    hi: '🔔 कृषक वाणी कृषि रिमाइंडर - टेस्ट अलर्ट',
    en: '🔔 Krushak Bani Task Reminder - Test Alert',
    bn: '🔔 কৃষক বাণী কাজের রিমাইন্ডার - টেস্ট এলার্ট',
    ta: '🔔 கர்ஷக் பானி பணி நினைவூட்டல் - சோதனை எச்சரிக்கை',
    ur: '🔔 کرشک بانی ٹاسک یاد دہانی - ٹیسٹ الرٹ',
  };

  const testBodies: Record<string, string> = {
    or: 'ଆପଣଙ୍କ କୃଷି କ୍ୟାଲେଣ୍ଡର ସ୍ମାରକୀ ସକ୍ରିୟ ଅଛି। ସ୍ପ୍ରେ, ସାର ପ୍ରୟୋଗ ଓ ଜଳସେଚନ ଆଲର୍ଟ ସମୟାନୁସାରେ ମିଳିବ।',
    hi: 'आपका कृषि कैलेंडर रिमाइंडर सक्रिय है। छिड़काव, उर्वरक और सिंचाई अलर्ट समय पर मिलेंगे।',
    en: 'Your Farm Calendar alerts are active! You will receive timely notifications for spraying, fertilizer, and irrigation.',
    bn: 'আপনার কৃষি ক্যালেন্ডার এলার্ট সক্রিয় রয়েছে।',
    ta: 'உங்கள் பண்ணை காலண்டர் விழிப்பூட்டல்கள் செயலில் உள்ளன!',
    ur: 'آپ کا فارم کیلنڈر الرٹ فعال ہے!',
  };

  const title = testTitles[lang] || testTitles['en'];
  const body = testBodies[lang] || testBodies['en'];

  sendSystemNotification(title, body, 'instant-test-reminder', onInAppToast);
};
