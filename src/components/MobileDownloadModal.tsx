import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';
import { t } from '../services/translations';
import { getPublicAppOrApkUrl, APK_URL } from '../config/appConfig';
import {
  Download,
  QrCode,
  X,
  Check,
  Copy,
  Share2,
  CheckCircle2,
  Smartphone,
  Globe,
  Sparkles,
  ArrowDownCircle,
  MoreVertical,
  PlusSquare,
} from 'lucide-react';

interface MobileDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

// Multilingual How to Install instructions dictionary
const INSTALL_GUIDE_DICTIONARY: Record<
  Language,
  {
    howToInstall: string;
    androidTabLabel: string;
    iosTabLabel: string;
    androidStep1Title: string;
    androidStep1Desc: string;
    androidStep2Title: string;
    androidStep2Desc: string;
    iosStep1Title: string;
    iosStep1Desc: string;
    iosStep2Title: string;
    iosStep2Desc: string;
  }
> = {
  or: {
    howToInstall: 'ଫୋନ୍‌ରେ ଇନ୍‌ଷ୍ଟଲ୍ କରିବାର ସରଳ ନିୟମ:',
    androidTabLabel: 'Android (Chrome)',
    iosTabLabel: 'iPhone (Safari)',
    androidStep1Title: 'ବ୍ରାଉଜର୍‌ର ଉପର ୩ଟି ବିନ୍ଦୁ (⋮) ଦବାନ୍ତୁ',
    androidStep1Desc: 'କ୍ରୋମ୍ ବ୍ରାଉଜର୍‌ର ଉପର ଡାହାଣ କୋଣରେ ଥିବା ୩ଟି ବିନ୍ଦୁ (⋮) କ୍ଲିକ୍ କରନ୍ତୁ।',
    androidStep2Title: '"Add to Home screen" ବା "Install app" ବାଛନ୍ତୁ',
    androidStep2Desc: 'ତାଲିକାରୁ "Add to Home screen" ଦବାନ୍ତୁ — ଆପ୍‌ଟି ଆପଣଙ୍କ ମୋବାଇଲ୍ ସ୍କ୍ରିନ୍‌ରେ ସେଭ୍ ହୋଇଯିବ!',
    iosStep1Title: 'ସଫାରୀର Share (⎋) ଚିହ୍ନ ଦବାନ୍ତୁ',
    iosStep1Desc: 'ସଫାରୀ ବ୍ରାଉଜର୍‌ର ତଳ ନିମ୍ନ ଭାଗରେ ଥିବା Share (⎋) ବଟନ୍ ଟ୍ୟାପ୍ କରନ୍ତୁ।',
    iosStep2Title: '"Add to Home Screen" (➕) ବାଛନ୍ତୁ',
    iosStep2Desc: 'ତଳକୁ ସ୍କ୍ରୋଲ୍ କରି "Add to Home Screen" ବାଛନ୍ତୁ।',
  },
  hi: {
    howToInstall: 'फ़ोन पर इंस्टॉल करने के आसान चरण:',
    androidTabLabel: 'Android (Chrome)',
    iosTabLabel: 'iPhone (Safari)',
    androidStep1Title: 'ब्राउज़र बार में 3 डॉट्स मेनू (⋮) पर टैप करें',
    androidStep1Desc: 'क्रोम ब्राउज़र के ऊपरी दाएं कोने में 3 लंबवत बिंदुओं (⋮) पर टैप करें।',
    androidStep2Title: '"Add to Home screen" या "Install app" चुनें',
    androidStep2Desc: 'सूची से "Add to Home screen" चुनें — हरा KrushakBani आइकन होम स्क्रीन पर आ जाएगा!',
    iosStep1Title: 'सफ़ारी शेयर (⎋) बटन पर टैप करें',
    iosStep1Desc: 'सफ़ारी ब्राउज़र में नीचे दिए गए शेयर (⎋) बटन को दबाएं।',
    iosStep2Title: '"Add to Home Screen" (➕) चुनें',
    iosStep2Desc: 'नीचे स्क्रॉल करें और "Add to Home Screen" विकल्प चुनें।',
  },
  en: {
    howToInstall: 'How to Install on Phone:',
    androidTabLabel: 'Android (Chrome)',
    iosTabLabel: 'iPhone (Safari)',
    androidStep1Title: 'Tap Chrome 3-Dots Menu (⋮)',
    androidStep1Desc: 'Tap the 3 vertical dots menu in top-right corner of Chrome.',
    androidStep2Title: 'Select "Add to Home screen" or "Install app"',
    androidStep2Desc: 'Select "Add to Home screen" — the green KrushakBani icon will appear on your phone home screen!',
    iosStep1Title: 'Tap Safari Share Button (⎋)',
    iosStep1Desc: 'Tap the Share icon in Safari bottom navigation bar.',
    iosStep2Title: 'Tap "Add to Home Screen" (➕)',
    iosStep2Desc: 'Scroll down the options list and select "Add to Home Screen".',
  },
  te: {
    howToInstall: 'ఫోన్‌లో ఇన్‌స్టాల్ చేయడానికి సులభమైన దశలు:',
    androidTabLabel: 'Android (Chrome)',
    iosTabLabel: 'iPhone (Safari)',
    androidStep1Title: 'Chrome 3-చుక్కల మెనూ (⋮) నొక్కండి',
    androidStep1Desc: 'క్రోమ్ కుడి వైపు ఎగువన ఉన్న 3 చుక్కల మెనూని నొక్కండి.',
    androidStep2Title: '"Add to Home screen" లేదా "Install app" ఎంచుకోండి',
    androidStep2Desc: 'జాబితా నుండి "Add to Home screen" ను ఎంచుకోండి.',
    iosStep1Title: 'Safari Share (⎋) బటన్‌ను నొక్కండి',
    iosStep1Desc: 'సఫారీ దిగువ బార్‌లో ఉన్న షేర్ ఐకాన్‌ను నొక్కండి.',
    iosStep2Title: '"Add to Home Screen" (➕) ఎంచుకోండి',
    iosStep2Desc: 'క్రిందికి స్క్రోల్ చేసి "Add to Home Screen" ను ఎంచుకోండి.',
  },
  bn: {
    howToInstall: 'ফোনে ইনস্টল করার সহজ ধাপসমূহ:',
    androidTabLabel: 'Android (Chrome)',
    iosTabLabel: 'iPhone (Safari)',
    androidStep1Title: 'Chrome ৩টি বিন্দু (⋮) মেনুতে ট্যাপ করুন',
    androidStep1Desc: 'ক্রোম ব্রাউজারের উপরে ডানদিকে ৩টি বিন্দু মেনুতে ক্লিক করুন।',
    androidStep2Title: '"Add to Home screen" বা "Install app" বেছে নিন',
    androidStep2Desc: 'তালিকা থেকে "Add to Home screen" চাপুন।',
    iosStep1Title: 'Safari শেয়ার (⎋) বাটনে ট্যাপ করুন',
    iosStep1Desc: 'সফারি ব্রাউজারের নিচে শেয়ার বাটনে ট্যাপ করুন।',
    iosStep2Title: '"Add to Home Screen" (➕) বেছে নিন',
    iosStep2Desc: 'নিচে স্ক্রোল করে "Add to Home Screen" চাপুন।',
  },
  ta: {
    howToInstall: 'போனில் நிறுவுவதற்கான எளிய படிகள்:',
    androidTabLabel: 'Android (Chrome)',
    iosTabLabel: 'iPhone (Safari)',
    androidStep1Title: 'Chrome 3 புள்ளிகள் மெனுவை (⋮) தட்டவும்',
    androidStep1Desc: 'மேலே வலதுபுறத்தில் உள்ள 3 புள்ளிகள் மெனுவைத் தட்டவும்.',
    androidStep2Title: '"Add to Home screen" அல்லது "Install app" தேர்ந்தெடுக்கவும்',
    androidStep2Desc: 'பட்டியலிலிருந்து "Add to Home screen" என்பதைத் தேர்ந்தெடுக்கவும்.',
    iosStep1Title: 'Safari பகிர்வு (⎋) பொத்தானைத் தட்டவும்',
    iosStep1Desc: 'சஃபாரி கீழே உள்ள பகிர்வு ஐகானைத் தட்டவும்.',
    iosStep2Title: '"Add to Home Screen" (➕) தேர்ந்தெடுக்கவும்',
    iosStep2Desc: 'கீழே சென்று "Add to Home Screen" என்பதைத் தேர்ந்தெடுக்கவும்.',
  },
  ur: {
    howToInstall: 'فون پر انسٹال کرنے کے آسان طریقے:',
    androidTabLabel: 'Android (Chrome)',
    iosTabLabel: 'iPhone (Safari)',
    androidStep1Title: 'کروم کے 3 ڈاٹس مینو (⋮) پر ٹیپ کریں',
    androidStep1Desc: 'کروم براؤزر کے اوپری دائیں کونے میں 3 نقطوں کو دبائیں۔',
    androidStep2Title: '"Add to Home screen" منتخب کریں',
    androidStep2Desc: 'فہرست سے "Add to Home screen" کا انتخاب کریں۔',
    iosStep1Title: 'سفاری شیئر (⎋) بٹن پر ٹیپ کریں',
    iosStep1Desc: 'سفاری براؤزر کے نیچے شیئر بٹن پر کلک کریں۔',
    iosStep2Title: '"Add to Home Screen" (➕) منتخب کریں',
    iosStep2Desc: 'نیچے جا کر "Add to Home Screen" کا انتخاب کریں۔',
  },
};

export const MobileDownloadModal: React.FC<MobileDownloadModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const { isInstallable, isInstalled, isIOS, isWebview, install } = usePWAInstall();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [installing, setInstalling] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>(() => (isIOS ? 'ios' : 'android'));

  const guide = INSTALL_GUIDE_DICTIONARY[lang] || INSTALL_GUIDE_DICTIONARY.or;
  const targetUrl = getPublicAppOrApkUrl();

  // Generate high-contrast QR code with quiet margin when modal opens
  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(targetUrl, {
      width: 260,
      margin: 3,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.error('Failed to generate QR code:', err));
  }, [isOpen, targetUrl]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = targetUrl;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      } catch {}
      document.body.removeChild(textarea);
    }
  };

  const handleShare = async () => {
    const shareTitle = t('app_title', lang);
    const shareText = `${t('app_title', lang)} — ${t('get_app_modal_subtitle', lang)}: ${targetUrl}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: targetUrl,
        });
        return;
      } catch {
        // Fall back to WhatsApp share
      }
    }
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.location.href = whatsappUrl;
  };

  const handleInstallOrDownload = async () => {
    if (APK_URL) {
      window.location.href = APK_URL;
      return;
    }

    if (isInstallable) {
      setInstalling(true);
      try {
        const success = await install();
        if (success) {
          setInstallSuccess(true);
        }
      } finally {
        setInstalling(false);
      }
      return;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="get-app-modal-title"
    >
      {/* Bottom sheet on mobile, centered modal on desktop */}
      <div
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-2xl border-t-2 sm:border-2 border-emerald-600/80 overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile grab handle */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-emerald-950">
          <div className="w-12 h-1.5 rounded-full bg-white/30" />
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shadow-md shrink-0 font-black">
              <QrCode className="w-6 h-6 stroke-[2.4]" />
            </div>
            <div className="min-w-0">
              <h3
                id="get-app-modal-title"
                className="text-base sm:text-lg font-black text-white truncate"
              >
                {lang === 'or' ? 'କୃଷକ ବାଣୀ ଆପ୍ ଇନ୍‌ଷ୍ଟଲ୍ କରନ୍ତୁ' : 'Install Krushak Bani App'}
              </h3>
              <p className="text-xs text-amber-300 font-bold leading-snug">
                {lang === 'or' ? 'ହୋମ୍ ସ୍କ୍ରିନ୍‌ରେ ଆପ୍ ଯୋଡ଼ି ବିନା ନେଟୱାର୍କରେ ବ୍ୟବହାର କରନ୍ତୁ' : 'Add to phone Home Screen for instant 1-tap offline access'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            aria-label={t('close_btn', lang)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Success Banner if Installed */}
          {(isInstalled || installSuccess) && (
            <div className="p-4 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-extrabold text-xs sm:text-sm flex items-center gap-3 border-2 border-emerald-500 shadow-sm animate-in zoom-in-95">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 stroke-[2.5]" />
              <div>
                <p className="font-black text-emerald-950 dark:text-white">
                  {lang === 'or' ? '✓ ଆପ୍ ହୋମ୍ ସ୍କ୍ରିନ୍‌ରେ ଇନ୍‌ଷ୍ଟଲ୍ ହୋଇସାରିଛି!' : '✓ App is installed on your Home Screen!'}
                </p>
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-0.5">
                  {lang === 'or' ? 'ଫୋନ୍ ଆପ୍ ଲିଷ୍ଟ୍ ବା ହୋମ୍ ସ୍କ୍ରିନ୍‌ରେ "କୃଷକ ବାଣୀ" ଚିହ୍ନ ଦେଖନ୍ତୁ।' : 'Look for the green "KrushakBani" icon on your mobile screen.'}
                </p>
              </div>
            </div>
          )}

          {/* Webview In-App Browser Warning Banner */}
          {isWebview && (
            <div className="p-3.5 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border-2 border-amber-400 text-stone-900 dark:text-amber-100 text-xs font-bold leading-relaxed space-y-1">
              <div className="flex items-center gap-2 text-amber-950 dark:text-amber-300 font-black">
                <Globe className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{lang === 'or' ? '🌐 ବ୍ରାଉଜର୍ ପରିବର୍ତ୍ତନ ସୂଚନା' : '🌐 Open in Mobile Browser'}</span>
              </div>
              <p>
                {lang === 'or'
                  ? 'ଆପଣ QR ସ୍କାନର୍ ବା WhatsApp ଭିତରେ ଖୋଲିଛନ୍ତି। ହୋମ୍ ସ୍କ୍ରିନ୍‌ରେ ଆପ୍ ଇନ୍‌ଷ୍ଟଲ୍ କରିବା ପାଇଁ, ଉପର ୩ଟି ବିନ୍ଦୁ (⋮) ଦବାଇ "Open in Chrome" କିମ୍ବା "Open in Safari" ବାଛନ୍ତୁ।'
                  : 'You opened this link inside a messaging app or QR scanner. To install to Home Screen, tap ⋮ and select "Open in Chrome" or "Open in Safari".'}
              </p>
            </div>
          )}

          {/* Direct Install Button if browser supports beforeinstallprompt */}
          {!isInstalled && isInstallable && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 dark:from-stone-800 dark:to-stone-800 border-2 border-emerald-300 dark:border-emerald-700 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-700 dark:text-amber-400" />
                  <span className="text-xs sm:text-sm font-black text-stone-900 dark:text-white">
                    {lang === 'or' ? 'ହୋମ୍ ସ୍କ୍ରିନ୍‌ରେ ଆପ୍ ଇନ୍‌ଷ୍ଟଲ୍ କରନ୍ତୁ' : '1-Tap Home Screen Install'}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white font-black text-[10px] uppercase">
                  PWA App
                </span>
              </div>

              <button
                type="button"
                onClick={handleInstallOrDownload}
                disabled={installing}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-98 text-stone-950 font-black text-sm shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                <ArrowDownCircle className="w-5 h-5 stroke-[2.5] shrink-0" />
                <span>
                  {installing
                    ? (lang === 'or' ? 'ଇନ୍‌ଷ୍ଟଲ୍ ହେଉଛି...' : 'Installing...')
                    : (lang === 'or' ? 'ଆପ୍ ଇନ୍‌ଷ୍ଟଲ୍ କରନ୍ତୁ (Install App)' : 'Install App to Home Screen')}
                </span>
              </button>
            </div>
          )}

          {/* Clear Language-Aware 'How to Install' Section */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
              <span className="text-xs font-black text-stone-800 dark:text-stone-200">
                {guide.howToInstall}
              </span>
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('android')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'android'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {guide.androidTabLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ios')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'ios'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {guide.iosTabLabel}
                </button>
              </div>
            </div>

            {/* Android Guide */}
            {activeTab === 'android' ? (
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-3 text-xs font-bold text-stone-800 dark:text-stone-200">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 font-black text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-extrabold text-stone-900 dark:text-white">
                      {guide.androidStep1Title}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                      {guide.androidStep1Desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 font-black text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-extrabold text-stone-900 dark:text-white">
                      {guide.androidStep2Title}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                      {guide.androidStep2Desc}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* iPhone Guide */
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 space-y-3 text-xs font-bold text-stone-800 dark:text-stone-200">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 font-black text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-extrabold text-stone-900 dark:text-white">
                      {guide.iosStep1Title}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                      {guide.iosStep1Desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 font-black text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-extrabold text-stone-900 dark:text-white">
                      {guide.iosStep2Title}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                      {guide.iosStep2Desc}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center pt-2">
            <span className="text-xs font-black text-stone-600 dark:text-stone-300 mb-2">
              {lang === 'or' ? 'ଅନ୍ୟ ମୋବାଇଲ୍‌ରେ ସ୍କାନ୍ କରିବା ପାଇଁ QR କୋଡ୍:' : 'Scan QR Code on any phone to open app:'}
            </span>
            <div className="p-3.5 rounded-3xl bg-white border-2 border-stone-200 dark:border-stone-700 shadow-md">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-44 h-44 sm:w-48 sm:h-48 object-contain block rounded-xl"
                />
              ) : (
                <div className="w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center bg-white text-stone-500 text-xs font-bold">
                  <Smartphone className="w-6 h-6 animate-pulse text-emerald-700" />
                </div>
              )}
            </div>
          </div>

          {/* Share & Copy Link */}
          <div className="p-3 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-mono font-bold text-stone-700 dark:text-stone-200 truncate block">
                {targetUrl}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                copied
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-stone-900 hover:bg-emerald-50 text-emerald-900 dark:text-amber-300 border border-emerald-300 dark:border-stone-600'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{t('copied_link_toast', lang)}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t('copy_link_btn', lang)}</span>
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-50 dark:bg-stone-800 hover:bg-emerald-100 text-emerald-950 dark:text-emerald-200 border-2 border-emerald-300 dark:border-emerald-700 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>{t('share_app_btn', lang)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
