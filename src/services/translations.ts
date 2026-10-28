/**
 * Centralized 6-Language Translations File for Krushak Bani Odisha
 * Supported Languages:
 * - en: English (Fallback)
 * - hi: Hindi (हिन्दी) // TO REVIEW
 * - or: Odia (ଓଡ଼ିଆ) // TO REVIEW
 * - te: Telugu (తెలుగు) // TO REVIEW
 * - bn: Bengali (বাংলা) // TO REVIEW
 * - ta: Tamil (தமிழ்) // TO REVIEW
 *
 * NOTE: All non-English translations are marked "// TO REVIEW" in comments.
 * If any translation is missing, `t()` automatically falls back to English.
 */

import { Language } from '../types';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  voiceLang: string;
  ttsLang: string;
  greeting: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ', // TO REVIEW
    flag: '🌾',
    voiceLang: 'or-IN',
    ttsLang: 'or-IN',
    greeting: 'ନମସ୍କାର କୃଷକ ବନ୍ଧୁ! କୃଷକ ବାଣୀ ଓଡ଼ିଶାକୁ ସ୍ୱାଗତ।' // TO REVIEW
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🌐',
    voiceLang: 'en-IN',
    ttsLang: 'en-IN',
    greeting: 'Welcome Farmer Friend! Welcome to Krushak Bani Odisha.'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी', // TO REVIEW
    flag: '🇮🇳',
    voiceLang: 'hi-IN',
    ttsLang: 'hi-IN',
    greeting: 'नमस्ते किसान भाई! कृषक वाणी ओडिशा में आपका स्वागत है।' // TO REVIEW
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు', // TO REVIEW
    flag: '🌱',
    voiceLang: 'te-IN',
    ttsLang: 'te-IN',
    greeting: 'నమస్కారం రైతు సోదరా! కృషక్ వాణి ఒడిశాకు స్వాగతం.' // TO REVIEW
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা', // TO REVIEW
    flag: '🌾',
    voiceLang: 'bn-IN',
    ttsLang: 'bn-IN',
    greeting: 'নমস্কার কৃষক ভাই! কৃষক বাণী ওড়িশায় আপনাকে স্বাগতম।' // TO REVIEW
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்', // TO REVIEW
    flag: '🌴',
    voiceLang: 'ta-IN',
    ttsLang: 'ta-IN',
    greeting: 'வணக்கம் உழவர் தோழரே! கிருஷக் வாணி ஒடிசாவுக்கு வரவேற்கிறோம்.' // TO REVIEW
  }
];

export type TranslationDict = Record<string, Partial<Record<Language, string>> & { en: string }>;

export const TRANSLATIONS: TranslationDict = {
  // ==========================================================================
  // BRAND, HEADER & NAVIGATION
  // ==========================================================================
  app_title: {
    en: 'Krushak Bani Odisha',
    or: 'କୃଷକ ବାଣୀ ଓଡ଼ିଶା', // TO REVIEW
    hi: 'कृषक वाणी ओडिशा', // TO REVIEW
    te: 'కృషక్ వాణి ఒడిశా', // TO REVIEW
    bn: 'কৃষক বাণী ওড়িশা', // TO REVIEW
    ta: 'கிருஷக் வாணி ஒடிசா' // TO REVIEW
  },
  app_subtitle: {
    en: 'OUAT & ICAR Verified Agri & Farmer Safety PWA',
    or: 'ଓୟୁଏଟି ଓ ଆଇସିଏଆର ପ୍ରମାଣିତ କୃଷି ଓ ସୁରକ୍ଷା ପୋର୍ଟାଲ', // TO REVIEW
    hi: 'OUAT व ICAR प्रमाणित कृषि व किसान सुरक्षा पोर्टल', // TO REVIEW
    te: 'OUAT & ICAR ధృవీకరించిన వ్యవసాయ & రైతు భద్రతా పోర్టల్', // TO REVIEW
    bn: 'OUAT ও ICAR অনুমোদিত কৃষি ও সুরক্ষা পোর্টাল', // TO REVIEW
    ta: 'OUAT & ICAR சரிபார்க்கப்பட்ட வேளாண் & பாதுகாப்பு தளம்' // TO REVIEW
  },
  step_of: {
    en: 'Step {current} of {total}',
    or: 'ପଦକ୍ଷେପ {current} / {total}', // TO REVIEW
    hi: 'चरण {current} / {total}', // TO REVIEW
    te: 'దశ {current} / {total}', // TO REVIEW
    bn: 'ধাপ {current} / {total}', // TO REVIEW
    ta: 'படி {current} / {total}' // TO REVIEW
  },
  back: {
    en: 'Back',
    or: 'ପଛକୁ', // TO REVIEW
    hi: 'पीछे', // TO REVIEW
    te: 'వెనుకకు', // TO REVIEW
    bn: 'পিছনে', // TO REVIEW
    ta: 'பின்னால்' // TO REVIEW
  },
  back_to_home: {
    en: 'Back to Home',
    or: 'ମୁଖ୍ୟ ପୃଷ୍ଠାକୁ ଫେରନ୍ତୁ', // TO REVIEW
    hi: 'मुख्य पृष्ठ पर लौटें', // TO REVIEW
    te: 'హోమ్‌కు తిరిగి వెళ్ళండి', // TO REVIEW
    bn: 'হোম পেজে ফিরে যান', // TO REVIEW
    ta: 'முகப்புக்குத் திரும்புக' // TO REVIEW
  },
  continue_btn: {
    en: 'Continue',
    or: 'ଆଗକୁ ବଢ଼ନ୍ତୁ', // TO REVIEW
    hi: 'आगे बढ़ें', // TO REVIEW
    te: 'కొనసాగించు', // TO REVIEW
    bn: 'এগিয়ে যান', // TO REVIEW
    ta: 'தொடரவும்' // TO REVIEW
  },
  next_btn: {
    en: 'Next',
    or: 'ପରବର୍ତ୍ତୀ', // TO REVIEW
    hi: 'अगला', // TO REVIEW
    te: 'తదుపరి', // TO REVIEW
    bn: 'পরবর্তী', // TO REVIEW
    ta: 'அடுத்து' // TO REVIEW
  },
  finish_btn: {
    en: 'Finish & Open Home Screen',
    or: 'ସମାପ୍ତ କରନ୍ତୁ ଓ ହୋମ୍ ଖୋଲନ୍ତୁ', // TO REVIEW
    hi: 'समाप्त करें और होम स्क्रीन खोलें', // TO REVIEW
    te: 'ముగించి హోమ్ స్క్రీన్ తెరవండి', // TO REVIEW
    bn: 'শেষ করুন এবং হোম স্ক্রিন খুলুন', // TO REVIEW
    ta: 'முடித்து முகப்புத் திரையைத் திறக்கவும்' // TO REVIEW
  },
  skip_btn: {
    en: 'Skip',
    or: 'ଏଡ଼ାନ୍ତୁ', // TO REVIEW
    hi: 'छोड़ें', // TO REVIEW
    te: 'దాటవేయి', // TO REVIEW
    bn: 'এড়িয়ে যান', // TO REVIEW
    ta: 'தவிர்க்கவும்' // TO REVIEW
  },
  edit_btn: {
    en: 'Edit',
    or: 'ବଦଳାନ୍ତୁ', // TO REVIEW
    hi: 'बदलें', // TO REVIEW
    te: 'మార్చు', // TO REVIEW
    bn: 'সম্পাদনা', // TO REVIEW
    ta: 'திருத்து' // TO REVIEW
  },
  close_btn: {
    en: 'Close',
    or: 'ବନ୍ଦ କରନ୍ତୁ', // TO REVIEW
    hi: 'बंद करें', // TO REVIEW
    te: 'మూసివేయి', // TO REVIEW
    bn: 'বন্ধ করুন', // TO REVIEW
    ta: 'மூடு' // TO REVIEW
  },
  cancel_btn: {
    en: 'Cancel',
    or: 'বাতিଲ କରନ୍ତୁ', // TO REVIEW
    hi: 'रद्द करें', // TO REVIEW
    te: 'రద్దు చేయండి', // TO REVIEW
    bn: 'বাতিল করুন', // TO REVIEW
    ta: 'ரத்து செய்' // TO REVIEW
  },
  save_return_review: {
    en: 'Save & Return to Review',
    or: 'ସେଭ୍ କରନ୍ତୁ ଓ ସମୀକ୍ଷାକୁ ଫେରନ୍ତୁ', // TO REVIEW
    hi: 'सेव करें और समीक्षा पर लौटें', // TO REVIEW
    te: 'సేవ్ చేసి సమీక్షకు తిరిగి వెళ్ళండి', // TO REVIEW
    bn: 'সেভ করুন এবং পর্যালোচনায় ফিরুন', // TO REVIEW
    ta: 'சேமித்து மதிப்பாய்வுக்குத் திரும்புக' // TO REVIEW
  },
  try_again: {
    en: 'Try again',
    or: 'ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ', // TO REVIEW
    hi: 'पुनः प्रयास करें', // TO REVIEW
    te: 'మళ్ళీ ప్రయత్నించండి', // TO REVIEW
    bn: 'আবার চেষ্টা করুন', // TO REVIEW
    ta: 'மீண்டும் முயற்சிக்கவும்' // TO REVIEW
  },
  tap_to_allow: {
    en: 'Tap to allow',
    or: 'ଅନୁମତି ପାଇଁ ଟ୍ୟାପ୍ କରନ୍ତୁ', // TO REVIEW
    hi: 'अनुमति के लिए टैप करें', // TO REVIEW
    te: 'అనుమతించడానికి నొక్కండి', // TO REVIEW
    bn: 'অনুমতি দিতে ট্যাপ করুন', // TO REVIEW
    ta: 'அனுமதிக்க தட்டவும்' // TO REVIEW
  },

  // ==========================================================================
  // STEP 1: PERMISSIONS
  // ==========================================================================
  perm_title: {
    en: 'App Permissions for Farm Services',
    or: 'କୃଷି ସେବା ପାଇଁ ଆପ୍ ଅନୁମତି', // TO REVIEW
    hi: 'कृषि सेवाओं के लिए ऐप अनुमतियां', // TO REVIEW
    te: 'వ్యవసాయ సేవల కోసం యాప్ అనుమతులు', // TO REVIEW
    bn: 'কৃষি পরিষেবার জন্য অ্যাপ অনুমতি', // TO REVIEW
    ta: 'வேளாண் சேவைகளுக்கான செயலி அனுமதிகள்' // TO REVIEW
  },
  perm_subtitle: {
    en: 'We need these permissions once to help diagnose crops, check local weather, and work offline.',
    or: 'ଫସଲ ରୋଗ ଚିହ୍ନଟ, ପାଣିପାଗ ସୂଚନା ଓ ଅଫଲାଇନ୍ ସେବା ପାଇଁ ଏହି ଅନୁମତି ଆବଶ୍ୟକ।', // TO REVIEW
    hi: 'फसल रोग पहचान, स्थानीय मौसम और ऑफलाइन काम के लिए इन अनुमतियों की आवश्यकता है।', // TO REVIEW
    te: 'పంట వ్యాధుల గుర్తింపు, స్థానిక వాతావరణం మరియు ఆఫ్‌లైన్ సేవలకు ఈ అనుమతులు అవసరం.', // TO REVIEW
    bn: 'ফসলের রোগ নির্ণয়, আবহাওয়া এবং অফলাইন কাজের জন্য এই অনুমতিগুলি প্রয়োজন।', // TO REVIEW
    ta: 'பயிர் நோய் கண்டறிதல், வானிலை மற்றும் ஆஃப்லைன் சேவைக்கு இந்த அனுமதிகள் தேவை.' // TO REVIEW
  },
  perm_camera_title: {
    en: 'Camera',
    or: 'କ୍ୟାମେରା', // TO REVIEW
    hi: 'कैमरा', // TO REVIEW
    te: 'కెమెరా', // TO REVIEW
    bn: 'ক্যামেরা', // TO REVIEW
    ta: 'கேமரா' // TO REVIEW
  },
  perm_camera_desc: {
    en: 'To take photos of sick crop leaves and farmer profile photo',
    or: 'ରୋଗାକ୍ରାନ୍ତ ପତ୍ରର ଫଟୋ ଓ କୃଷକ ପରିଚୟ ଫଟୋ ଉଠାଇବା ପାଇଁ', // TO REVIEW
    hi: 'बीमार फसल की पत्तियों और किसान प्रोफाइल फोटो लेने के लिए', // TO REVIEW
    te: 'తెగులు సోకిన ఆకుల ఫోటోలు మరియు రైతు ఫోటో తీయడానికి', // TO REVIEW
    bn: 'আক্রান্ত পাতার ছবি এবং কৃষকের প্রোফাইল ছবি তোলার জন্য', // TO REVIEW
    ta: 'நோயுற்ற இலைகள் மற்றும் விவசாயியின் புகைப்படம் எடுக்க' // TO REVIEW
  },
  perm_mic_title: {
    en: 'Microphone',
    or: 'ମାଇକ୍ରୋଫୋନ୍', // TO REVIEW
    hi: 'माइक्रोफ़ोन', // TO REVIEW
    te: 'మైక్రోఫోన్', // TO REVIEW
    bn: 'মাইক্রোফোন', // TO REVIEW
    ta: 'மைக்ரோஃபோன்' // TO REVIEW
  },
  perm_mic_desc: {
    en: 'For voice search and AI helpline calls inside the app later',
    or: 'ପରବର୍ତ୍ତୀ ସମୟରେ ଆପ୍ ଭିତରେ କଣ୍ଠ ସନ୍ଧାନ ଓ ଏଆଇ କଲ୍ ପାଇଁ', // TO REVIEW
    hi: 'बाद में ऐप के अंदर वॉइस सर्च और एआई हेल्पलाइन कॉल के लिए', // TO REVIEW
    te: 'యాప్‌లో వాయిస్ సెర్చ్ మరియు AI హెల్ప్‌లైన్ కాల్స్ కోసం', // TO REVIEW
    bn: 'পরবর্তীতে অ্যাপের ভেতরে ভয়েস সার্চ ও এআই কলের জন্য', // TO REVIEW
    ta: 'செயலிக்குள் குரல் தேடல் மற்றும் AI அழைப்புகளுக்கு' // TO REVIEW
  },
  perm_loc_title: {
    en: 'Location (GPS)',
    or: 'ସ୍ଥାନ (GPS)', // TO REVIEW
    hi: 'स्थान (GPS)', // TO REVIEW
    te: 'లొకేషన్ (GPS)', // TO REVIEW
    bn: 'অবস্থান (GPS)', // TO REVIEW
    ta: 'இருப்பிடம் (GPS)' // TO REVIEW
  },
  perm_loc_desc: {
    en: 'For accurate village weather, spray windows, and nearest 108 hospital',
    or: 'ସଠିକ୍ ଗାଁ ପାଣିପାଗ, ସ୍ପ୍ରେ ସମୟ ଓ ନିକଟତମ ୧୦୮ ହସ୍ପିଟାଲ ପାଇଁ', // TO REVIEW
    hi: 'सटीक गांव के मौसम, स्प्रे समय और नजदीकी 108 अस्पताल के लिए', // TO REVIEW
    te: 'గ్రామ వాతావరణం, స్ప్రే సమయం మరియు సమీప 108 ఆసుపత్రి కోసం', // TO REVIEW
    bn: 'সঠিক আবহাওয়া, স্প্রে করার সময় এবং নিকটস্থ ১০৮ হাসপাতালের জন্য', // TO REVIEW
    ta: 'துல்லியமான கிராம வானிலை மற்றும் அருகிலுள்ள 108 மருத்துவமனைக்கு' // TO REVIEW
  },
  perm_photos_title: {
    en: 'Photos and files',
    or: 'ଫଟୋ ଓ ଫାଇଲ୍', // TO REVIEW
    hi: 'फोटो और फाइलें', // TO REVIEW
    te: 'ఫోటోలు మరియు ఫైళ్లు', // TO REVIEW
    bn: 'ফটো এবং ফাইল', // TO REVIEW
    ta: 'புகைப்படங்கள் மற்றும் கோப்புகள்' // TO REVIEW
  },
  perm_photos_desc: {
    en: 'Upload saved leaf photos from phone gallery and save your Farmer ID card',
    or: 'ଗ୍ୟାଲେରୀରୁ ପତ୍ର ଫଟୋ ଅପଲୋଡ୍ ଓ କୃଷକ କାର୍ଡ ସେଭ୍ କରିବା ପାଇଁ', // TO REVIEW
    hi: 'गैलरी से पत्ती की फोटो अपलोड करने और किसान आईडी कार्ड सेव करने के लिए', // TO REVIEW
    te: 'గ్యాలరీ నుండి ఆకు ఫోటోలను అప్‌లోడ్ చేయడానికి మరియు ID కార్డ్ సేవ్ చేయడానికి', // TO REVIEW
    bn: 'গ্যালারি থেকে পাতার ছবি আপলোড ও কৃষক আইডি কার্ড সেভ করার জন্য', // TO REVIEW
    ta: 'கேலரியில் இருந்து இலை படங்களை பதிவேற்ற மற்றும் அடையாள அட்டையை சேமிக்க' // TO REVIEW
  },
  perm_storage_title: {
    en: 'Storage',
    or: 'ଅଫଲାଇନ୍ ଷ୍ଟୋରେଜ୍', // TO REVIEW
    hi: 'ऑफलाइन स्टोरेज', // TO REVIEW
    te: 'ఆఫ్‌లైన్ స్టోరేజ్', // TO REVIEW
    bn: 'অফলাইন স্টোরেজ', // TO REVIEW
    ta: 'ஆஃப்லைன் சேமிப்பகம்' // TO REVIEW
  },
  perm_storage_desc: {
    en: 'Keep your spray logs, crop history, and maps safe without internet',
    or: 'ବିନା ଇଣ୍ଟରନେଟରେ ସ୍ପ୍ରେ ଲଗ୍, ଫସଲ ଇତିହାସ ଓ ମାନଚିତ୍ର ସୁରକ୍ଷିତ ରଖିବାକୁ', // TO REVIEW
    hi: 'बिना इंटरनेट के स्प्रे लॉग, फसल इतिहास और नक्शे सुरक्षित रखने के लिए', // TO REVIEW
    te: 'ఇంటర్నెట్ లేకుండా స్ప్రే లాగ్‌లు, పంట చరిత్రను భద్రపరచడానికి', // TO REVIEW
    bn: 'ইন্টারনেট ছাড়াই স্প্রে লগ, ফসলের ইতিহাস ও মানচিত্র নিরাপদ রাখতে', // TO REVIEW
    ta: 'இணையம் இல்லாமல் தெளிப்பு பதிவுகள் மற்றும் வரைபடங்களை சேமிக்க' // TO REVIEW
  },
  perm_notif_title: {
    en: 'Notifications',
    or: 'বিଜ୍ଞପ୍ତି ଓ ସତର୍କତା', // TO REVIEW
    hi: 'सूचनाएं व अलर्ट', // TO REVIEW
    te: 'నోటిఫికేషన్లు', // TO REVIEW
    bn: 'বিজ্ঞপ্তি ও সতর্কতা', // TO REVIEW
    ta: 'அறிவிப்புகள்' // TO REVIEW
  },
  perm_notif_desc: {
    en: 'Receive lightning, heavy rain, and pest outbreak alerts',
    or: 'ବଜ୍ରପାତ, ପ୍ରବଳ ବର୍ଷା ଓ ରୋଗ-ପୋକ ସତର୍କତା ପାଇବା ପାଇଁ', // TO REVIEW
    hi: 'बिजली गिरने, भारी बारिश और कीट प्रकोप की चेतावनी पाने के लिए', // TO REVIEW
    te: 'పిడుగులు, భారీ వర్షం మరియు తెగుళ్ల హెచ్చరికలు పొందడానికి', // TO REVIEW
    bn: 'বজ্রপাত, ভারী বৃষ্টি এবং পোকার আক্রমণের সতর্কতা পেতে', // TO REVIEW
    ta: 'மின்னல், கனமழை மற்றும் பூச்சி தாக்குதல் எச்சரிக்கைகளைப் பெற' // TO REVIEW
  },
  perm_ios_note: {
    en: 'Note for iPhone: Notifications only work after adding this app to your Home Screen.',
    or: 'ଆଇଫୋନ୍ (iPhone) ସୂଚନା: ଆପ୍ କୁ ହୋମ୍ ସ୍କ୍ରିନ୍ ରେ ଯୋଡ଼ିବା ପରେ ହିଁ ନୋଟିଫିକେସନ୍ କାମ କରେ।', // TO REVIEW
    hi: 'iPhone के लिए नोट: सूचनाएं केवल ऐप को होम स्क्रीन पर जोड़ने के बाद काम करती हैं।', // TO REVIEW
    te: 'iPhone గమనిక: యాప్‌ను హోమ్ స్క్రీన్‌కు జోడించిన తర్వాతే నోటిఫికేషన్‌లు పనిచేస్తాయి.', // TO REVIEW
    bn: 'iPhone নোট: অ্যাপটি হোম স্ক্রিনে যোগ করার পরেই বিজ্ঞপ্তি কাজ করে।', // TO REVIEW
    ta: 'iPhone குறிப்பு: செயலியை முகப்புத் திரையில் சேர்த்த பிறகே அறிவிப்புகள் செயல்படும்.' // TO REVIEW
  },
  allow_all_and_continue: {
    en: 'Allow all and continue',
    or: 'ସମସ୍ତ ଅନୁମତି ଦିଅନ୍ତୁ ଓ ଆଗକୁ ବଢ଼ନ୍ତୁ', // TO REVIEW
    hi: 'सभी अनुमतियां दें और आगे बढ़ें', // TO REVIEW
    te: 'అన్నీ అనుమతించి కొనసాగించండి', // TO REVIEW
    bn: 'সব অনুমতি দিন এবং এগিয়ে যান', // TO REVIEW
    ta: 'அனைத்தையும் அனுமதித்து தொடரவும்' // TO REVIEW
  },
  requesting_perms: {
    en: 'Requesting permissions...',
    or: 'ଅନୁମତି ମଗାଯାଉଛି...', // TO REVIEW
    hi: 'अनुमतियां मांगी जा रही हैं...', // TO REVIEW
    te: 'అనుమతులు అడుగుతోంది...', // TO REVIEW
    bn: 'অনুমতি চাওয়া হচ্ছে...', // TO REVIEW
    ta: 'அனுமதிகள் கோரப்படுகின்றன...' // TO REVIEW
  },
  asked_once_note: {
    en: 'Asked only once on first launch',
    or: 'କେବଳ ପ୍ରଥମ ଥର ଖୋଲିବା ସମୟରେ ପଚରାଯାଏ', // TO REVIEW
    hi: 'केवल पहली बार ऐप खोलने पर पूछा जाता है', // TO REVIEW
    te: 'మొదటిసారి తెరిచినప్పుడు మాత్రమే అడుగుతుంది', // TO REVIEW
    bn: 'শুধুমাত্র প্রথমবার খোলার সময় জিজ্ঞাসা করা হয়', // TO REVIEW
    ta: 'முதல் முறை திறக்கும்போது மட்டுமே கேட்கப்படும்' // TO REVIEW
  },

  // ==========================================================================
  // STEP 2: LANGUAGE
  // ==========================================================================
  lang_step_title: {
    en: 'Choose Your Language',
    or: 'ଆପଣଙ୍କ ଭାଷା ବାଛନ୍ତୁ', // TO REVIEW
    hi: 'अपनी भाषा चुनें', // TO REVIEW
    te: 'మీ భాషను ఎంచుకోండి', // TO REVIEW
    bn: 'আপনার ভাষা নির্বাচন করুন', // TO REVIEW
    ta: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்' // TO REVIEW
  },
  lang_step_subtitle: {
    en: 'Select the language you want to use across Krushak Bani Odisha.',
    or: 'କୃଷକ ବାଣୀ ଓଡ଼ିଶା ଆପ୍ ବ୍ୟବହାର କରିବା ପାଇଁ ଆପଣଙ୍କ ପସନ୍ଦର ଭାଷା ବାଛନ୍ତୁ।', // TO REVIEW
    hi: 'कृषक वाणी ओडिशा ऐप में उपयोग करने के लिए अपनी पसंदीदा भाषा चुनें।', // TO REVIEW
    te: 'కృషక్ వాణి ఒడిశా యాప్‌లో ఉపయోగించడానికి మీ భాషను ఎంచుకోండి.', // TO REVIEW
    bn: 'কৃষক বাণী ওড়িশা অ্যাপে ব্যবহারের জন্য আপনার পছন্দের ভাষা বেছে নিন।', // TO REVIEW
    ta: 'கிருஷக் வாணி ஒடிசா செயலியில் பயன்படுத்த விரும்பும் மொழியைத் தேர்ந்தெடுக்கவும்.' // TO REVIEW
  },
  default_badge: {
    en: '(Default)',
    or: '(ଡିଫଲ୍ଟ)', // TO REVIEW
    hi: '(डिफ़ॉल्ट)', // TO REVIEW
    te: '(డిఫాల్ట్)', // TO REVIEW
    bn: '(ডিফল্ট)', // TO REVIEW
    ta: '(இயல்புநிலை)' // TO REVIEW
  },
  already_registered_login: {
    en: 'Already registered? Log in',
    or: 'ପୂର୍ବରୁ ପଞ୍ଜୀକୃତ କି? ଲଗ୍ ଇନ୍ କରନ୍ତୁ', // TO REVIEW
    hi: 'पहले से पंजीकृत हैं? लॉग इन करें', // TO REVIEW
    te: 'ఇప్పటికే నమోదు చేసుకున్నారా? లాగిన్ అవ్వండి', // TO REVIEW
    bn: 'ইতিমধ্যে নিবন্ধিত? লগ ইন করুন', // TO REVIEW
    ta: 'ஏற்கனவே பதிவு செய்துள்ளீர்களா? உள்நுழையவும்' // TO REVIEW
  },

  // ==========================================================================
  // STEP 3: MOBILE & OTP
  // ==========================================================================
  mobile_step_title: {
    en: 'Mobile Number Verification',
    or: 'ମୋବାଇଲ୍ ନମ୍ବର ଓ ଓଟିପି (OTP) ଯାଞ୍ଚ', // TO REVIEW
    hi: 'मोबाइल नंबर और ओटीपी (OTP) सत्यापन', // TO REVIEW
    te: 'మొబైల్ నంబర్ మరియు OTP ధృవీకరణ', // TO REVIEW
    bn: 'মোবাইল নম্বর এবং ওটিপি (OTP) যাচাইকরণ', // TO REVIEW
    ta: 'மொபைல் எண் மற்றும் OTP சரிபார்ப்பு' // TO REVIEW
  },
  login_step_title: {
    en: 'Log In with Your Registered Mobile Number',
    or: 'ଆପଣଙ୍କ ପଞ୍ଜୀକୃତ ମୋବାଇଲ୍ ନମ୍ବର ସହ ଲଗ୍ ଇନ୍ କରନ୍ତୁ', // TO REVIEW
    hi: 'अपने पंजीकृत मोबाइल नंबर से लॉग इन करें', // TO REVIEW
    te: 'మీ నమోదిత మొబైల్ నంబర్‌తో లాగిన్ అవ్వండి', // TO REVIEW
    bn: 'আপনার নিবন্ধিত মোবাইল নম্বর দিয়ে লগ ইন করুন', // TO REVIEW
    ta: 'உங்கள் பதிவுசெய்யப்பட்ட மொபைல் எண் மூலம் உள்நுழையவும்' // TO REVIEW
  },
  mobile_step_subtitle: {
    en: 'Enter your 10-digit mobile number. Existing accounts will be restored automatically.',
    or: 'ଆପଣଙ୍କ ୧୦ ଅଙ୍କ ବିଶିଷ୍ଟ ମୋବାଇଲ୍ ନମ୍ବର ଦିଅନ୍ତୁ। ପୁରୁଣା ଆକାଉଣ୍ଟ ଥିଲେ ସ୍ୱୟଂଚାଳିତ ଭାବେ ଖୋଲିଯିବ।', // TO REVIEW
    hi: 'अपना 10 अंकों का मोबाइल नंबर दर्ज करें। पुराना खाता होने पर अपने आप खुल जाएगा।', // TO REVIEW
    te: 'మీ 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి. పాత ఖాతా ఉంటే ఆటోమేటిక్‌గా తెరుచుకుంటుంది.', // TO REVIEW
    bn: 'আপনার ১০ সংখ্যার মোবাইল নম্বর দিন। পুরনো অ্যাকাউন্ট থাকলে স্বয়ংক্রিয়ভাবে পুনরুদ্ধার হবে।', // TO REVIEW
    ta: 'உங்கள் 10 இலக்க மொபைல் எண்ணை உள்ளிடவும். பழைய கணக்கு இருந்தால் தானாக மீட்கப்படும்.' // TO REVIEW
  },
  demo_mode_banner: {
    en: 'DEMO MODE: OTP is simulated (Local Copy + Central Server DB Active)',
    or: 'DEMO MODE: ଓଟିପି (OTP) ସିମୁଲେଟେଡ୍ (ସ୍ଥାନୀୟ ଓ ସର୍ଭର ଡାଟାବେସ୍ ସକ୍ରିୟ)', // TO REVIEW
    hi: 'DEMO MODE: ओटीपी (OTP) सिमुलेटेड है (लोकल व सर्वर डेटाबेस सक्रिय)', // TO REVIEW
    te: 'DEMO MODE: OTP అనుకరించబడింది (లోకల్ & సర్వర్ డేటాబేస్)', // TO REVIEW
    bn: 'DEMO MODE: ওটিপি (OTP) সিমুলেটেড (লোকাল ও সার্ভার ডেটাবেস সক্রিয়)', // TO REVIEW
    ta: 'DEMO MODE: OTP உருவகப்படுத்தப்பட்டது (உள்ளூர் & சர்வர் தரவுத்தளம்)' // TO REVIEW
  },
  indian_mobile_label: {
    en: 'Indian Mobile Number (+91)',
    or: 'ଭାରତୀୟ ମୋବାଇଲ୍ ନମ୍ବର (+91)', // TO REVIEW
    hi: 'भारतीय मोबाइल नंबर (+91)', // TO REVIEW
    te: 'భారతీయ మొబైల్ నంబర్ (+91)', // TO REVIEW
    bn: 'ভারতীয় মোবাইল নম্বর (+91)', // TO REVIEW
    ta: 'இந்திய மொபைல் எண் (+91)' // TO REVIEW
  },
  send_otp_btn: {
    en: 'Send 6-Digit OTP',
    or: '୬-ଅଙ୍କ ଓଟିପି (OTP) ପଠାନ୍ତୁ', // TO REVIEW
    hi: '6-अंकों का ओटीपी (OTP) भेजें', // TO REVIEW
    te: '6-అంకెల OTP పంపండి', // TO REVIEW
    bn: '৬-সংখ্যার ওটিপি পাঠান', // TO REVIEW
    ta: '6-இலக்க OTP அனுப்பவும்' // TO REVIEW
  },
  simulated_otp_for: {
    en: 'DEMO MODE: Simulated SMS OTP for +91 {mobile}:',
    or: 'DEMO MODE: +91 {mobile} ପାଇଁ ସିମୁଲେଟେଡ୍ OTP:', // TO REVIEW
    hi: 'DEMO MODE: +91 {mobile} के लिए सिमुलेटेड OTP:', // TO REVIEW
    te: 'DEMO MODE: +91 {mobile} కోసం అనుకరించిన OTP:', // TO REVIEW
    bn: 'DEMO MODE: +91 {mobile}-এর জন্য সিমুলেটেড OTP:', // TO REVIEW
    ta: 'DEMO MODE: +91 {mobile}-க்கான மாதிரி OTP:' // TO REVIEW
  },
  auto_fill_otp: {
    en: 'Auto-Fill OTP',
    or: 'ସ୍ୱୟଂ-ପୂରଣ କରନ୍ତୁ', // TO REVIEW
    hi: 'ऑटो-फिल OTP', // TO REVIEW
    te: 'ఆటో-ఫిల్ OTP', // TO REVIEW
    bn: 'অটো-ফিল OTP', // TO REVIEW
    ta: 'தானாக நிரப்புக' // TO REVIEW
  },
  enter_6_digit_otp: {
    en: 'Enter 6-Digit OTP',
    or: '୬-ଅଙ୍କ ବିଶିଷ୍ଟ OTP ଦିଅନ୍ତୁ', // TO REVIEW
    hi: '6-अंकों का OTP दर्ज करें', // TO REVIEW
    te: '6-అంకెల OTP నమోదు చేయండి', // TO REVIEW
    bn: '৬-সংখ্যার OTP লিখুন', // TO REVIEW
    ta: '6-இலக்க OTP-ஐ உள்ளிடவும்' // TO REVIEW
  },
  otp_expires_attempts: {
    en: 'Expires in {time} • Attempts left: {attempts}',
    or: 'ସମୟ ବାକି {time} • ସୁଯୋଗ ବାକି: {attempts}', // TO REVIEW
    hi: 'समाप्ति समय {time} • शेष प्रयास: {attempts}', // TO REVIEW
    te: 'గడువు {time} • మిగిలిన ప్రయత్నాలు: {attempts}', // TO REVIEW
    bn: 'মেয়াদ {time} • বাকি প্রচেষ্টা: {attempts}', // TO REVIEW
    ta: 'காலாவதி {time} • மீதமுள்ள முயற்சிகள்: {attempts}' // TO REVIEW
  },
  verify_otp_btn: {
    en: 'Verify OTP & Continue',
    or: 'ଓଟିପି (OTP) ଯାଞ୍ଚ କରନ୍ତୁ ଓ ଆଗକୁ ବଢ଼ନ୍ତୁ', // TO REVIEW
    hi: 'ओटीपी (OTP) सत्यापित करें और आगे बढ़ें', // TO REVIEW
    te: 'OTP ధృవీకరించి కొనసాగించండి', // TO REVIEW
    bn: 'ওটিপি যাচাই করুন এবং এগিয়ে যান', // TO REVIEW
    ta: 'OTP சரிபார்த்து தொடரவும்' // TO REVIEW
  },
  change_mobile_number: {
    en: 'Change mobile number',
    or: 'ମୋବାଇଲ୍ ନମ୍ବର ବଦଳାନ୍ତୁ', // TO REVIEW
    hi: 'मोबाइल नंबर बदलें', // TO REVIEW
    te: 'మొబైల్ నంబర్ మార్చండి', // TO REVIEW
    bn: 'মোবাইল নম্বর পরিবর্তন করুন', // TO REVIEW
    ta: 'மொபைல் எண்ணை மாற்றவும்' // TO REVIEW
  },
  resend_otp_in: {
    en: 'Resend OTP in {seconds}s',
    or: '{seconds} ସେକେଣ୍ଡରେ ପୁଣି OTP ପଠାନ୍ତୁ', // TO REVIEW
    hi: '{seconds} सेकंड में ओटीपी पुनः भेजें', // TO REVIEW
    te: '{seconds} సెకన్లలో OTP మళ్ళీ పంపండి', // TO REVIEW
    bn: '{seconds} সেকেন্ডে ওটিপি পুনরায় পাঠান', // TO REVIEW
    ta: '{seconds} வினாடிகளில் OTP மீண்டும் அனுப்பவும்' // TO REVIEW
  },
  resend_otp_now: {
    en: 'Resend New OTP',
    or: 'ନୂଆ ଓଟିପି (OTP) ପଠାନ୍ତୁ', // TO REVIEW
    hi: 'नया ओटीपी (OTP) भेजें', // TO REVIEW
    te: 'కొత్త OTP పంపండి', // TO REVIEW
    bn: 'নতুন ওটিপি পাঠান', // TO REVIEW
    ta: 'புதிய OTP அனுப்பவும்' // TO REVIEW
  },
  otp_err_invalid_mobile: {
    en: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
    or: 'ଦୟାକରି ୬, ୭, ୮ ବା ୯ ରୁ ଆରମ୍ଭ ହେଉଥିବା ୧୦ ଅଙ୍କର ସଠିକ୍ ମୋବାଇଲ୍ ନମ୍ବର ଦିଅନ୍ତୁ।', // TO REVIEW
    hi: 'कृपया 6, 7, 8 या 9 से शुरू होने वाला 10 अंकों का सही मोबाइल नंबर दर्ज करें।', // TO REVIEW
    te: 'దయచేసి 6, 7, 8 లేదా 9తో ప్రారంభమయ్యే సరైన 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి.', // TO REVIEW
    bn: 'অনুগ্রহ করে ৬, ৭, ৮ বা ৯ দিয়ে শুরু হওয়া ১০ সংখ্যার সঠিক মোবাইল নম্বর দিন।', // TO REVIEW
    ta: '6, 7, 8 அல்லது 9 இல் தொடங்கும் சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்.' // TO REVIEW
  },
  otp_err_expired: {
    en: 'OTP has expired (valid for 5 minutes). Please tap Resend OTP.',
    or: 'OTP ସମୟ ଶେଷ ହୋଇଯାଇଛି। ଦୟାକରି ପୁଣି OTP ପଠାନ୍ତୁ।', // TO REVIEW
    hi: 'OTP समाप्त हो गया है। कृपया नया OTP भेजें।', // TO REVIEW
    te: 'OTP గడువు ముగిసింది. దయచేసి మళ్ళీ OTP పంపండి.', // TO REVIEW
    bn: 'OTP-এর মেয়াদ শেষ হয়েছে। অনুগ্রহ করে আবার OTP পাঠান।', // TO REVIEW
    ta: 'OTP காலாவதியானது. மீண்டும் OTP அனுப்பவும்.' // TO REVIEW
  },
  otp_err_max_attempts: {
    en: 'Maximum wrong attempts (3) reached. Please request a new OTP.',
    or: 'ସର୍ବାଧିକ ୩ ଥର ଭୁଲ୍ ପ୍ରୟାସ ହୋଇଛି। ଦୟାକରି ନୂଆ OTP ମଗାନ୍ତୁ।', // TO REVIEW
    hi: 'अधिकतम 3 गलत प्रयास पूरे हो गए। कृपया नया OTP मंगाएं।', // TO REVIEW
    te: 'గరిష్టంగా 3 తప్పు ప్రయత్నాలు జరిగాయి. దయచేసి కొత్త OTP పొందండి.', // TO REVIEW
    bn: 'সর্বোচ্চ ৩ বার ভুল প্রচেষ্টা হয়েছে। অনুগ্রহ করে নতুন OTP নিন।', // TO REVIEW
    ta: 'அதிகபட்ச 3 தவறான முயற்சிகள் முடிந்தன. புதிய OTP கோரவும்.' // TO REVIEW
  },
  otp_err_wrong_code: {
    en: 'Incorrect OTP. Please check and try again.',
    or: 'ଭୁଲ୍ OTP। ଦୟାକରି ଯାଞ୍ଚ କରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।', // TO REVIEW
    hi: 'गलत OTP। कृपया जांचें और पुनः प्रयास करें।', // TO REVIEW
    te: 'తప్పు OTP. దయచేసి సరిచూసి మళ్ళీ ప్రయత్నించండి.', // TO REVIEW
    bn: 'ভুল OTP। অনুগ্রহ করে যাচাই করে আবার চেষ্টা করুন।', // TO REVIEW
    ta: 'தவறான OTP. சரிபார்த்து மீண்டும் முயற்சிக்கவும்.' // TO REVIEW
  },

  // ==========================================================================
  // STEP 4: FARMER DETAILS & FIELD SIZE
  // ==========================================================================
  details_step_title: {
    en: 'Farmer Details & Field Size',
    or: 'କୃଷକଙ୍କ ବିବରଣୀ ଓ ଜମିର ପରିମାଣ', // TO REVIEW
    hi: 'किसान का विवरण और खेत का आकार', // TO REVIEW
    te: 'రైతు వివరాలు & పొలం విస్తీర్ణం', // TO REVIEW
    bn: 'কৃষকের বিবরণ ও জমির পরিমাণ', // TO REVIEW
    ta: 'விவசாயி விவரங்கள் & நிலத்தின் அளவு' // TO REVIEW
  },
  profile_photo_label: {
    en: 'Profile Photo (Optional – Round Frame or Initials)',
    or: 'ପ୍ରୋଫାଇଲ୍ ଫଟୋ (ଇଚ୍ଛାଧୀନ – ଗୋଲାକାର ଫ୍ରେମ୍ ବା ନାମର ପ୍ରଥମ ଅକ୍ଷର)', // TO REVIEW
    hi: 'प्रोफ़ाइल फोटो (वैकल्पिक – गोल फ्रेम या नाम के अक्षर)', // TO REVIEW
    te: 'ప్రొఫైల్ ఫోటో (ఐచ్ఛికం – గుండ్రని ఫ్రేమ్ లేదా పేరు అక్షరాలు)', // TO REVIEW
    bn: 'প্রোফাইল ছবি (ঐচ্ছিক – গোল ফ্রেম বা নামের আদ্যক্ষর)', // TO REVIEW
    ta: 'சுயவிவரப் படம் (விருப்பமானது – வட்ட சட்டகம் அல்லது முதலெழுத்து)' // TO REVIEW
  },
  capture_photo_btn: {
    en: 'Capture Photo',
    or: 'ଫଟୋ ଉଠାନ୍ତୁ', // TO REVIEW
    hi: 'फोटो खींचें', // TO REVIEW
    te: 'ఫోటో తీయండి', // TO REVIEW
    bn: 'ছবি তুলুন', // TO REVIEW
    ta: 'புகைப்படம் எடு' // TO REVIEW
  },
  full_name_label: {
    en: 'Full Name',
    or: 'ସମ୍ପୂର୍ଣ୍ଣ ନାମ', // TO REVIEW
    hi: 'पूरा नाम', // TO REVIEW
    te: 'పూర్తి పేరు', // TO REVIEW
    bn: 'পুরো নাম', // TO REVIEW
    ta: 'முழு பெயர்' // TO REVIEW
  },
  full_name_placeholder: {
    en: 'Enter your full name',
    or: 'ଆପଣଙ୍କ ସମ୍ପୂର୍ଣ୍ଣ ନାମ ଲେଖନ୍ତୁ', // TO REVIEW
    hi: 'अपना पूरा नाम लिखें', // TO REVIEW
    te: 'మీ పూర్తి పేరు రాయండి', // TO REVIEW
    bn: 'আপনার পুরো নাম লিখুন', // TO REVIEW
    ta: 'உங்கள் முழு பெயரை உள்ளிடவும்' // TO REVIEW
  },
  age_label: {
    en: 'Age (10 to 100 years)',
    or: 'ବୟସ (୧୦ ରୁ ୧୦୦ ବର୍ଷ)', // TO REVIEW
    hi: 'आयु (10 से 100 वर्ष)', // TO REVIEW
    te: 'వయస్సు (10 నుండి 100 సం.)', // TO REVIEW
    bn: 'বয়স (১০ থেকে ১০০ বছর)', // TO REVIEW
    ta: 'வயது (10 முதல் 100 வரை)' // TO REVIEW
  },
  gender_label: {
    en: 'Gender',
    or: 'ଲିଙ୍ଗ', // TO REVIEW
    hi: 'लिंग', // TO REVIEW
    te: 'లింగం', // TO REVIEW
    bn: 'লিঙ্গ', // TO REVIEW
    ta: 'பாலினம்' // TO REVIEW
  },
  gender_male: {
    en: 'Male',
    or: 'ପୁରୁଷ', // TO REVIEW
    hi: 'पुरुष', // TO REVIEW
    te: 'పురుషుడు', // TO REVIEW
    bn: 'পুরুষ', // TO REVIEW
    ta: 'ஆண்' // TO REVIEW
  },
  gender_female: {
    en: 'Female',
    or: 'ମହିଳା', // TO REVIEW
    hi: 'महिला', // TO REVIEW
    te: 'స్త్రీ', // TO REVIEW
    bn: 'মহিলা', // TO REVIEW
    ta: 'பெண்' // TO REVIEW
  },
  gender_other: {
    en: 'Other',
    or: 'ଅନ୍ୟାନ୍ୟ', // TO REVIEW
    hi: 'अन्य', // TO REVIEW
    te: 'ఇతర', // TO REVIEW
    bn: 'অন্যান্য', // TO REVIEW
    ta: 'மற்றவை' // TO REVIEW
  },
  take_live_photo: {
    en: 'Take a live photo',
    or: 'ଲାଇଭ୍ ଫଟୋ ଉଠାନ୍ତୁ', // TO REVIEW
    hi: 'लाइव फोटो लें', // TO REVIEW
    te: 'లైవ్ ఫోటో తీయండి', // TO REVIEW
    bn: 'লাইভ ছবি তুলুন', // TO REVIEW
    ta: 'நேரடி புகைப்படம் எடுக்கவும்' // TO REVIEW
  },
  upload_photo: {
    en: 'Upload photo',
    or: 'ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ', // TO REVIEW
    hi: 'फोटो अपलोड करें', // TO REVIEW
    te: 'ఫోటో అప్‌లోడ్ చేయండి', // TO REVIEW
    bn: 'ছবি আপলোড করুন', // TO REVIEW
    ta: 'புகைப்படத்தை பதிவேற்றவும்' // TO REVIEW
  },
  field_size_label: {
    en: 'Total Field Size',
    or: 'ମୋଟ ଚାଷ ଜମିର ପରିମାଣ', // TO REVIEW
    hi: 'कुल खेत का आकार', // TO REVIEW
    te: 'మొత్తం పొలం విస్తీర్ణం', // TO REVIEW
    bn: 'মোট চাষের জমির পরিমাণ', // TO REVIEW
    ta: 'மொத்த நிலத்தின் அளவு' // TO REVIEW
  },
  enter_value_label: {
    en: 'Enter Value',
    or: 'ସଂଖ୍ୟା ଲେଖନ୍ତୁ', // TO REVIEW
    hi: 'संख्या दर्ज करें', // TO REVIEW
    te: 'సంఖ్యను నమోదు చేయండి', // TO REVIEW
    bn: 'সংখ্যা লিখুন', // TO REVIEW
    ta: 'மதிப்பை உள்ளிடவும்' // TO REVIEW
  },
  select_unit_label: {
    en: 'Select Unit',
    or: 'ଏକକ ବାଛନ୍ତୁ', // TO REVIEW
    hi: 'इकाई चुनें', // TO REVIEW
    te: 'యూనిట్ ఎంచుకోండి', // TO REVIEW
    bn: 'একক নির্বাচন করুন', // TO REVIEW
    ta: 'அலகைத் தேர்ந்தெடுக்கவும்' // TO REVIEW
  },
  unit_acre: {
    en: 'Acre',
    or: 'ଏକର (Acre)', // TO REVIEW
    hi: 'एकड़ (Acre)', // TO REVIEW
    te: 'ఎకరం (Acre)', // TO REVIEW
    bn: 'একর (Acre)', // TO REVIEW
    ta: 'ஏக்கர் (Acre)' // TO REVIEW
  },
  unit_hectare: {
    en: 'Hectare',
    or: 'ହେକ୍ଟର (Hectare)', // TO REVIEW
    hi: 'हेक्टेयर (Hectare)', // TO REVIEW
    te: 'హెక్టారు (Hectare)', // TO REVIEW
    bn: 'হেক্টর (Hectare)', // TO REVIEW
    ta: 'ஹெக்டேர் (Hectare)' // TO REVIEW
  },
  unit_decimal: {
    en: 'Decimal',
    or: 'ଡିସିମିଲ୍ (Decimal)', // TO REVIEW
    hi: 'डिसमिल (Decimal)', // TO REVIEW
    te: 'డెసిమల్ (Decimal)', // TO REVIEW
    bn: 'ডেসিমেল (Decimal)', // TO REVIEW
    ta: 'டெசிமல் (Decimal)' // TO REVIEW
  },
  unit_cent: {
    en: 'Cent',
    or: 'ସେଣ୍ଟ (Cent)', // TO REVIEW
    hi: 'सेंट (Cent)', // TO REVIEW
    te: 'సెంటు (Cent)', // TO REVIEW
    bn: 'সেন্ট (Cent)', // TO REVIEW
    ta: 'சென்ட் (Cent)' // TO REVIEW
  },
  unit_guntha: {
    en: 'Guntha',
    or: 'ଗୁଣ୍ଠ (Guntha)', // TO REVIEW
    hi: 'गुंठा (Guntha)', // TO REVIEW
    te: 'గుంట (Guntha)', // TO REVIEW
    bn: 'গুণ্ঠা (Guntha)', // TO REVIEW
    ta: 'குந்தா (Guntha)' // TO REVIEW
  },
  unit_bigha: {
    en: 'Bigha',
    or: 'ବିঘା (Bigha)', // TO REVIEW
    hi: 'बीघा (Bigha)', // TO REVIEW
    te: 'బిఘా (Bigha)', // TO REVIEW
    bn: 'বিঘা (Bigha)', // TO REVIEW
    ta: 'பிகா (Bigha)' // TO REVIEW
  },
  unit_katha: {
    en: 'Katha',
    or: 'କଠା (Katha)', // TO REVIEW
    hi: 'कट्ठा (Katha)', // TO REVIEW
    te: 'కఠా (Katha)', // TO REVIEW
    bn: 'কাঠা (Katha)', // TO REVIEW
    ta: 'கதா (Katha)' // TO REVIEW
  },
  unit_sqft: {
    en: 'Square feet',
    or: 'ବର୍ଗ ଫୁଟ୍ (Sq ft)', // TO REVIEW
    hi: 'वर्ग फुट (Sq ft)', // TO REVIEW
    te: 'చదరపు అడుగులు (Sq ft)', // TO REVIEW
    bn: 'বর্গফুট (Sq ft)', // TO REVIEW
    ta: 'சதுர அடி (Sq ft)' // TO REVIEW
  },
  unit_sqm: {
    en: 'Square metre',
    or: 'ବର୍ଗ ମିଟର (Sq m)', // TO REVIEW
    hi: 'वर्ग मीटर (Sq m)', // TO REVIEW
    te: 'చదరపు మీటర్లు (Sq m)', // TO REVIEW
    bn: 'বর্গমিটার (Sq m)', // TO REVIEW
    ta: 'சதுர மீட்டர் (Sq m)' // TO REVIEW
  },
  dont_know_field_size: {
    en: "I don't know my field size",
    or: 'ମୁଁ ମୋ ଜମିର ସଠିକ୍ ମାପ ଜାଣିନାହିଁ', // TO REVIEW
    hi: 'मुझे अपने खेत का आकार नहीं पता', // TO REVIEW
    te: 'నాకు నా పొలం పరిమాణం తెలియదు', // TO REVIEW
    bn: 'আমি আমার জমির মাপ জানি না', // TO REVIEW
    ta: 'எனது நிலத்தின் அளவு எனக்குத் தெரியாது' // TO REVIEW
  },
  about_how_many_acres: {
    en: 'About how many acres? (Since {unit} varies by state)',
    or: 'ପ୍ରାୟ କେତେ ଏକର ହେବ? ({unit} ରାଜ୍ୟ ଅନୁସାରେ ଭିନ୍ନ ହୋଇଥାଏ)', // TO REVIEW
    hi: 'लगभग कितने एकड़? (क्योंकि {unit} राज्य के अनुसार बदलता है)', // TO REVIEW
    te: 'సుమారు ఎన్ని ఎకరాలు? ({unit} రాష్ట్రాన్ని బట్టి మారుతుంది)', // TO REVIEW
    bn: 'প্রায় কত একর? (যেহেতু {unit} রাজ্যভেদে ভিন্ন হয়)', // TO REVIEW
    ta: 'சுமார் எத்தனை ஏக்கர்? ({unit} மாநிலத்திற்கு மாநிலம் மாறுபடும்)' // TO REVIEW
  },
  internal_calc_acres: {
    en: 'Converted for advisories: {acres} Acres',
    or: 'ପରାମର୍ଶ ପାଇଁ ହିସାବ: {acres} ଏକର', // TO REVIEW
    hi: 'सलाह के लिए गणना: {acres} एकड़', // TO REVIEW
    te: 'సలహాల కోసం లెక్క: {acres} ఎకరాలు', // TO REVIEW
    bn: 'পরামর্শের জন্য হিসাব: {acres} একর', // TO REVIEW
    ta: 'ஆலோசனைக்கான கணக்கீடு: {acres} ஏக்கர்' // TO REVIEW
  },
  size_small_title: {
    en: 'Small',
    or: 'ଛୋଟ ଜମି', // TO REVIEW
    hi: 'छोटा खेत', // TO REVIEW
    te: 'చిన్న పొలం', // TO REVIEW
    bn: 'ছোট জমি', // TO REVIEW
    ta: 'சிறிய நிலம்' // TO REVIEW
  },
  size_small_sub: {
    en: '< 1 Acre (~0.5 ac)',
    or: '୧ ଏକରରୁ କମ୍ (~0.5 ଏକର)', // TO REVIEW
    hi: '1 एकड़ से कम (~0.5 एकड़)', // TO REVIEW
    te: '1 ఎకరం కంటే తక్కువ (~0.5 ఎ.)', // TO REVIEW
    bn: '১ একরের কম (~০.৫ একর)', // TO REVIEW
    ta: '1 ஏக்கருக்கும் குறைவு (~0.5 ஏ.)' // TO REVIEW
  },
  size_medium_title: {
    en: 'Medium',
    or: 'ମଧ୍ୟମ ଜମି', // TO REVIEW
    hi: 'मध्यम खेत', // TO REVIEW
    te: 'మధ్యస్థ పొలం', // TO REVIEW
    bn: 'মাঝারি জমি', // TO REVIEW
    ta: 'நடுத்தர நிலம்' // TO REVIEW
  },
  size_medium_sub: {
    en: '1 – 3 Acres (~2 ac)',
    or: '୧ – ୩ ଏକର (~2 ଏକର)', // TO REVIEW
    hi: '1 – 3 एकड़ (~2 एकड़)', // TO REVIEW
    te: '1 – 3 ఎకరాలు (~2 ఎ.)', // TO REVIEW
    bn: '১ – ৩ একর (~২ একর)', // TO REVIEW
    ta: '1 – 3 ஏக்கர் (~2 ஏ.)' // TO REVIEW
  },
  size_large_title: {
    en: 'Large',
    or: 'ବଡ଼ ଜମି', // TO REVIEW
    hi: 'बड़ा खेत', // TO REVIEW
    te: 'పెద్ద పొలం', // TO REVIEW
    bn: 'বড় জমি', // TO REVIEW
    ta: 'பெரிய நிலம்' // TO REVIEW
  },
  size_large_sub: {
    en: '> 3 Acres (~5 ac)',
    or: '୩ ଏକରରୁ ଅଧିକ (~5 ଏକର)', // TO REVIEW
    hi: '3 एकड़ से अधिक (~5 एकड़)', // TO REVIEW
    te: '3 ఎకరాల కంటే ఎక్కువ (~5 ఎ.)', // TO REVIEW
    bn: '৩ একরের বেশি (~৫ একর)', // TO REVIEW
    ta: '3 ஏக்கருக்கும் மேல் (~5 ஏ.)' // TO REVIEW
  },
  err_enter_full_name: {
    en: 'Please enter your full name.',
    or: 'ଦୟାକରି ଆପଣଙ୍କ ସମ୍ପୂର୍ଣ୍ଣ ନାମ ଲେଖନ୍ତୁ।', // TO REVIEW
    hi: 'कृपया अपना पूरा नाम दर्ज करें।', // TO REVIEW
    te: 'దయచేసి మీ పూర్తి పేరును నమోదు చేయండి.', // TO REVIEW
    bn: 'অনুগ্রহ করে আপনার পুরো নাম লিখুন।', // TO REVIEW
    ta: 'உங்கள் முழு பெயரை உள்ளிடவும்.' // TO REVIEW
  },
  err_valid_age: {
    en: 'Please enter a valid age between 10 and 100.',
    or: 'ଦୟାକରି ୧୦ ରୁ ୧୦୦ ମଧ୍ୟରେ ସଠିକ୍ ବୟସ ଦିଅନ୍ତୁ।', // TO REVIEW
    hi: 'कृपया 10 से 100 के बीच सही आयु दर्ज करें।', // TO REVIEW
    te: 'దయచేసి 10 మరియు 100 మధ్య సరైన వయస్సును నమోదు చేయండి.', // TO REVIEW
    bn: 'অনুগ্রহ করে ১০ থেকে ১০০-এর মধ্যে সঠিক বয়স দিন।', // TO REVIEW
    ta: '10 முதல் 100 க்குள் சரியான வயதை உள்ளிடவும்.' // TO REVIEW
  },
  err_valid_field_size: {
    en: 'Please enter a valid field size number.',
    or: 'ଦୟାକରି ଜମିର ସଠିକ୍ ପରିମାଣ ଲେଖନ୍ତୁ।', // TO REVIEW
    hi: 'कृपया खेत का सही आकार दर्ज करें।', // TO REVIEW
    te: 'దయచేసి సరైన పొలం విస్తీర్ణం సంఖ్యను నమోదు చేయండి.', // TO REVIEW
    bn: 'অনুগ্রহ করে জমির সঠিক পরিমাণ লিখুন।', // TO REVIEW
    ta: 'சரியான நில அளவை உள்ளிடவும்.' // TO REVIEW
  },

  // ==========================================================================
  // STEP 5: ADDRESS & GPS
  // ==========================================================================
  address_step_title: {
    en: 'Farm Address & Location',
    or: 'ଚାଷ ଜମିର ଠିକଣା ଓ ଅବସ୍ଥିତି', // TO REVIEW
    hi: 'खेत का पता और स्थान', // TO REVIEW
    te: 'పొలం చిరునామా & లొకేషన్', // TO REVIEW
    bn: 'খামারের ঠিকানা এবং অবস্থান', // TO REVIEW
    ta: 'பண்ணை முகவரி & இருப்பிடம்' // TO REVIEW
  },
  address_sample_subtitle: {
    en: 'SAMPLE Village List Active • Select your village or use GPS',
    or: 'ନମୁନା (SAMPLE) ଗାଁ ତାଲିକା ସକ୍ରିୟ • ଆପଣଙ୍କ ଗାଁ ବାଛନ୍ତୁ କିମ୍ବା GPS ବ୍ୟବହାର କରନ୍ତୁ', // TO REVIEW
    hi: 'नमूना (SAMPLE) गांव सूची सक्रिय • अपना गांव चुनें या GPS का उपयोग करें', // TO REVIEW
    te: 'నమూనా (SAMPLE) గ్రామ జాబితా • మీ గ్రామాన్ని ఎంచుకోండి లేదా GPS వాడండి', // TO REVIEW
    bn: 'নমুনা (SAMPLE) গ্রামের তালিকা • আপনার গ্রাম বেছে নিন বা GPS ব্যবহার করুন', // TO REVIEW
    ta: 'மாதிரி (SAMPLE) கிராமப் பட்டியல் • உங்கள் கிராமத்தைத் தேர்ந்தெடுக்கவும் அல்லது GPS-ஐப் பயன்படுத்தவும்' // TO REVIEW
  },
  use_gps_btn: {
    en: 'Use GPS',
    or: 'GPS ବ୍ୟବହାର କରନ୍ତୁ', // TO REVIEW
    hi: 'GPS का उपयोग करें', // TO REVIEW
    te: 'GPS ఉపయోగించండి', // TO REVIEW
    bn: 'GPS ব্যবহার করুন', // TO REVIEW
    ta: 'GPS-ஐப் பயன்படுத்தவும்' // TO REVIEW
  },
  detecting_gps: {
    en: 'Detecting GPS...',
    or: 'GPS ଖୋଜାଯାଉଛି...', // TO REVIEW
    hi: 'GPS खोजा जा रहा है...', // TO REVIEW
    te: 'GPS గుర్తిస్తోంది...', // TO REVIEW
    bn: 'GPS খোঁজা হচ্ছে...', // TO REVIEW
    ta: 'GPS கண்டறியப்படுகிறது...' // TO REVIEW
  },
  gps_accuracy_label: {
    en: 'GPS Accuracy: ±{meters} metres',
    or: 'GPS ସଠିକତା: ±{meters} ମିଟର', // TO REVIEW
    hi: 'GPS सटीकता: ±{meters} मीटर', // TO REVIEW
    te: 'GPS ఖచ్చితత్వం: ±{meters} మీటర్లు', // TO REVIEW
    bn: 'GPS নির্ভুলতা: ±{meters} মিটার', // TO REVIEW
    ta: 'GPS துல்லியம்: ±{meters} மீட்டர்' // TO REVIEW
  },
  gps_poor_accuracy_warn: {
    en: 'Poor accuracy – Try again outdoors if possible (Flagged)',
    or: 'କମ୍ ସଠିକତା – ସମ୍ଭବ ହେଲେ ବାହାରେ ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ (ଚିହ୍ନିତ)', // TO REVIEW
    hi: 'कम सटीकता – संभव हो तो बाहर खुले में पुनः प्रयास करें (चिह्नित)', // TO REVIEW
    te: 'తక్కువ ఖచ్చితత్వం – బయట మళ్ళీ ప్రయత్నించండి (ఫ్లాగ్ చేయబడింది)', // TO REVIEW
    bn: 'কম নির্ভুলতা – সম্ভব হলে বাইরে আবার চেষ্টা করুন (চিহ্নিত)', // TO REVIEW
    ta: 'குறைந்த துல்லியம் – வெளியே மீண்டும் முயற்சிக்கவும் (குறிக்கப்பட்டது)' // TO REVIEW
  },
  gps_suggested_nearest: {
    en: 'Suggested Nearest: {village}, Block: {block}, District: {district}',
    or: 'ନିକଟତମ ପ୍ରସ୍ତାବିତ: {village}, ବ୍ଲକ୍: {block}, ଜିଲ୍ଲା: {district}', // TO REVIEW
    hi: 'निकटतम सुझाया गया: {village}, ब्लॉक: {block}, जिला: {district}', // TO REVIEW
    te: 'సమీప సూచన: {village}, బ్లాక్: {block}, జిల్లా: {district}', // TO REVIEW
    bn: 'নিকটতম প্রস্তাবিত: {village}, ব্লক: {block}, জেলা: {district}', // TO REVIEW
    ta: 'அருகிலுள்ள பரிந்துரை: {village}, வட்டாரம்: {block}, மாவட்டம்: {district}' // TO REVIEW
  },
  confirm_suggested_address: {
    en: 'Confirm Suggested Address',
    or: 'ପ୍ରସ୍ତାବିତ ଠିକଣା ନିଶ୍ଚିତ କରନ୍ତୁ', // TO REVIEW
    hi: 'सुझाए गए पते की पुष्टि करें', // TO REVIEW
    te: 'సూచించిన చిరునామాను నిర్ధారించండి', // TO REVIEW
    bn: 'প্রস্তাবিত ঠিকানা নিশ্চিত করুন', // TO REVIEW
    ta: 'பரிந்துரைக்கப்பட்ட முகவரியை உறுதிப்படுத்தவும்' // TO REVIEW
  },
  confirmed_gps_address: {
    en: 'Confirmed GPS Suggestion',
    or: 'GPS ଠିକଣା ନିଶ୍ଚିତ ହୋଇଛି', // TO REVIEW
    hi: 'GPS पता पुष्ट किया गया', // TO REVIEW
    te: 'GPS చిరునామా నిర్ధారించబడింది', // TO REVIEW
    bn: 'GPS ঠিকানা নিশ্চিত করা হয়েছে', // TO REVIEW
    ta: 'GPS முகவரி உறுதிப்படுத்தப்பட்டது' // TO REVIEW
  },
  state_label: {
    en: 'State',
    or: 'ରାଜ୍ୟ', // TO REVIEW
    hi: 'राज्य', // TO REVIEW
    te: 'రాష్ట్రం', // TO REVIEW
    bn: 'রাজ্য', // TO REVIEW
    ta: 'மாநிலம்' // TO REVIEW
  },
  district_label: {
    en: 'District',
    or: 'ଜିଲ୍ଲା', // TO REVIEW
    hi: 'जिला', // TO REVIEW
    te: 'జిల్లా', // TO REVIEW
    bn: 'জেলা', // TO REVIEW
    ta: 'மாவட்டம்' // TO REVIEW
  },
  block_label: {
    en: 'Block',
    or: 'ବ୍ଲକ୍', // TO REVIEW
    hi: 'ब्लॉक', // TO REVIEW
    te: 'బ్లాక్ / మండలం', // TO REVIEW
    bn: 'ব্লক', // TO REVIEW
    ta: 'வட்டாரம் (Block)' // TO REVIEW
  },
  village_label: {
    en: 'Village (SAMPLE List)',
    or: 'ଗାଁ (SAMPLE ତାଲିକା)', // TO REVIEW
    hi: 'गांव (SAMPLE सूची)', // TO REVIEW
    te: 'గ్రామం (SAMPLE జాబితా)', // TO REVIEW
    bn: 'গ্রাম (SAMPLE তালিকা)', // TO REVIEW
    ta: 'கிராமம் (SAMPLE பட்டியல்)' // TO REVIEW
  },
  search_placeholder: {
    en: 'Search...',
    or: 'ଖୋଜନ୍ତୁ...', // TO REVIEW
    hi: 'खोजें...', // TO REVIEW
    te: 'వెతకండి...', // TO REVIEW
    bn: 'খুঁজুন...', // TO REVIEW
    ta: 'தேடுக...' // TO REVIEW
  },
  village_not_listed: {
    en: 'My village is not listed',
    or: 'ମୋ ଗାଁ ନାମ ତାଲିକାରେ ନାହିଁ', // TO REVIEW
    hi: 'मेरा गांव सूची में नहीं है', // TO REVIEW
    te: 'నా గ్రామం జాబితాలో లేదు', // TO REVIEW
    bn: 'আমার গ্রাম তালিকায় নেই', // TO REVIEW
    ta: 'எனது கிராமம் பட்டியலில் இல்லை' // TO REVIEW
  },
  choose_from_list: {
    en: 'Choose from list',
    or: 'ତାଲିକାରୁ ବାଛନ୍ତୁ', // TO REVIEW
    hi: 'सूची से चुनें', // TO REVIEW
    te: 'జాబితా నుండి ఎంచుకోండి', // TO REVIEW
    bn: 'তালিকা থেকে বেছে নিন', // TO REVIEW
    ta: 'பட்டியலிலிருந்து தேர்ந்தெடுக்கவும்' // TO REVIEW
  },
  type_village_placeholder: {
    en: 'Type your village name...',
    or: 'ଆପଣଙ୍କ ଗାଁ ନାମ ଲେଖନ୍ତୁ...', // TO REVIEW
    hi: 'अपने गांव का नाम लिखें...', // TO REVIEW
    te: 'మీ గ్రామం పేరు రాయండి...', // TO REVIEW
    bn: 'আপনার গ্রামের নাম লিখুন...', // TO REVIEW
    ta: 'உங்கள் கிராமத்தின் பெயரை உள்ளிடவும்...' // TO REVIEW
  },
  unverified_village_note: {
    en: 'Marked as "unverified" until full village dataset is loaded.',
    or: 'ସମ୍ପୂର୍ଣ୍ଣ ତାଲିକା ଯୋଡ଼ା ହେବା ପର୍ଯ୍ୟନ୍ତ ଏହା "ଅପ୍ରମାଣିତ" (unverified) ରହିବ।', // TO REVIEW
    hi: 'पूरी सूची जुड़ने तक यह "असत्यापित" (unverified) के रूप में दर्ज रहेगा।', // TO REVIEW
    te: 'పూర్తి జాబితా లోడ్ అయ్యే వరకు ఇది "ధృవీకరించబడనిది"గా ఉంటుంది.', // TO REVIEW
    bn: 'সম্পূর্ণ তালিকা যুক্ত না হওয়া পর্যন্ত এটি "অযাচাইকৃত" হিসেবে থাকবে।', // TO REVIEW
    ta: 'முழு பட்டியல் சேர்க்கப்படும் வரை இது "சரிபார்க்கப்படாதது" எனக் குறிக்கப்படும்.' // TO REVIEW
  },
  pin_code_label: {
    en: 'PIN Code (6 Digits)',
    or: 'ପିନ୍ କୋଡ୍ (୬ ଅଙ୍କ)', // TO REVIEW
    hi: 'पिन कोड (6 अंक)', // TO REVIEW
    te: 'పిన్ కోడ్ (6 అంకెలు)', // TO REVIEW
    bn: 'পিন কোড (৬ সংখ্যা)', // TO REVIEW
    ta: 'பின் குறியீடு (6 இலக்கங்கள்)' // TO REVIEW
  },
  land_ownership_label: {
    en: 'Land Ownership (Optional)',
    or: 'ଜମି ମାଲିକାନା (ଇଚ୍ଛାଧୀନ)', // TO REVIEW
    hi: 'भूमि स्वामित्व (वैकल्पिक)', // TO REVIEW
    te: 'భూ యాజమాన్యం (ఐచ్ఛికం)', // TO REVIEW
    bn: 'জমির মালিকানা (ঐচ্ছিক)', // TO REVIEW
    ta: 'நில உரிமை (விருப்பமானது)' // TO REVIEW
  },
  ownership_own: {
    en: 'Own Land',
    or: 'ନିଜ ଜମି', // TO REVIEW
    hi: 'अपनी भूमि', // TO REVIEW
    te: 'సొంత భూమి', // TO REVIEW
    bn: 'নিজের জমি', // TO REVIEW
    ta: 'சொந்த நிலம்' // TO REVIEW
  },
  ownership_tenant: {
    en: 'Tenant Farmer',
    or: 'ଲିଜ୍ / ଭାଗ ଚାଷୀ', // TO REVIEW
    hi: 'किरायेदार किसान', // TO REVIEW
    te: 'కౌలు రైతు', // TO REVIEW
    bn: 'বর্গা / ইজারা চাষী', // TO REVIEW
    ta: 'குத்தகை விவசாயி' // TO REVIEW
  },
  ownership_sharecropper: {
    en: 'Sharecropper',
    or: 'ଭାଗଚାଷୀ', // TO REVIEW
    hi: 'बटाईदार', // TO REVIEW
    te: 'పాలేరు / వాటాదారు', // TO REVIEW
    bn: 'ভাগচাষী', // TO REVIEW
    ta: 'பங்கு சாகுபடியாளர்' // TO REVIEW
  },
  irrigation_source_label: {
    en: 'Irrigation Source (Optional)',
    or: 'ଜଳସେଚନ ଉତ୍ସ (ଇଚ୍ଛାଧୀନ)', // TO REVIEW
    hi: 'सिंचाई का स्रोत (वैकल्पिक)', // TO REVIEW
    te: 'నీటిపారుదల వనరు (ఐచ్ఛికం)', // TO REVIEW
    bn: 'সেচের উৎস (ঐচ্ছিক)', // TO REVIEW
    ta: 'நீர்ப்பாசன ஆதாரம் (விருப்பமானது)' // TO REVIEW
  },
  irr_rain_fed: {
    en: 'Rain-fed',
    or: 'ବର୍ଷା ଆଧାରିତ', // TO REVIEW
    hi: 'वर्षा आधारित', // TO REVIEW
    te: 'వర్షాధార', // TO REVIEW
    bn: 'বৃষ্টি নির্ভর', // TO REVIEW
    ta: 'மானாவாரி (மழை சார்ந்தது)' // TO REVIEW
  },
  irr_canal: {
    en: 'Canal',
    or: 'କେନାଲ୍', // TO REVIEW
    hi: 'नहर', // TO REVIEW
    te: 'కాలువ', // TO REVIEW
    bn: 'খাল / ক্যানেল', // TO REVIEW
    ta: 'கால்வாய்' // TO REVIEW
  },
  irr_tubewell: {
    en: 'Tube well or borewell',
    or: 'ଟ୍ୟୁবୱେଲ୍ ବା ବୋରୱେଲ୍', // TO REVIEW
    hi: 'ट्यूबवेल या बोरवेल', // TO REVIEW
    te: 'బోరుబావి / ట్యూబ్‌వెల్', // TO REVIEW
    bn: 'টিউবওয়েল বা বোরওয়েল', // TO REVIEW
    ta: 'ஆழ்துளை கிணறு (Borewell)' // TO REVIEW
  },
  irr_pond_river: {
    en: 'Pond or river',
    or: 'ପୋଖରୀ ବା ନଦୀ', // TO REVIEW
    hi: 'तालाब या नदी', // TO REVIEW
    te: 'చెరువు లేదా నది', // TO REVIEW
    bn: 'পুকুর বা নদী', // TO REVIEW
    ta: 'குளம் அல்லது ஆறு' // TO REVIEW
  },
  irr_drip_sprinkler: {
    en: 'Drip or sprinkler',
    or: 'ଡ୍ରିପ୍ ବା ସ୍ପ୍ରିଙ୍କଲର୍', // TO REVIEW
    hi: 'ड्रिप या स्प्रिंकलर', // TO REVIEW
    te: 'డ్రిప్ లేదా స్ప్రింక్లర్', // TO REVIEW
    bn: 'ড্রিপ বা স্প্রিংকলার', // TO REVIEW
    ta: 'சொட்டு நீர் / தெளிப்பு பாசனம்' // TO REVIEW
  },
  emergency_contact_name_label: {
    en: 'Emergency Contact Name (Optional)',
    or: 'ଜରୁରୀକାଳୀନ ଯୋଗାଯୋଗ ନାମ (ଇଚ୍ଛାଧୀନ)', // TO REVIEW
    hi: 'आपातकालीन संपर्क नाम (वैकल्पिक)', // TO REVIEW
    te: 'అత్యవసర సంప్రదింపు పేరు (ఐచ్ఛికం)', // TO REVIEW
    bn: 'জরুরি যোগাযোগের নাম (ঐচ্ছিক)', // TO REVIEW
    ta: 'அவசர தொடர்பு பெயர் (விருப்பமானது)' // TO REVIEW
  },
  emergency_contact_phone_label: {
    en: 'Emergency Contact Phone (Optional)',
    or: 'ଜରୁରୀକାଳୀନ ଫୋନ୍ ନମ୍ବର (ଇଚ୍ଛାଧୀନ)', // TO REVIEW
    hi: 'आपातकालीन संपर्क फोन (वैकल्पिक)', // TO REVIEW
    te: 'అత్యవసర ఫోన్ నంబర్ (ఐచ్ఛికం)', // TO REVIEW
    bn: 'জরুরি যোগাযোগের ফোন (ঐচ্ছিক)', // TO REVIEW
    ta: 'அவசர தொடர்பு தொலைபேசி (விருப்பமானது)' // TO REVIEW
  },

  // ==========================================================================
  // STEP 6: WHAT DO YOU FARM
  // ==========================================================================
  crops_step_title: {
    en: 'What Do You Farm?',
    or: 'ଆପଣ କ’ଣ ଚାଷ କରନ୍ତି?', // TO REVIEW
    hi: 'आप क्या खेती करते हैं?', // TO REVIEW
    te: 'మీరు ఏమి సాగు చేస్తారు?', // TO REVIEW
    bn: 'আপনি কী চাষ করেন?', // TO REVIEW
    ta: 'நீங்கள் என்ன விவசாயம் செய்கிறீர்கள்?' // TO REVIEW
  },
  crops_step_subtitle: {
    en: 'Tap any farming type card to pick specific crops. Items in multiple types are saved once.',
    or: 'ଫସଲ ବାଛିବା ପାଇଁ ଯେକୌଣସି କାର୍ଡ ଉପରେ ଟ୍ୟାପ୍ କରନ୍ତୁ। ଏକାଧିକ ବର୍ଗରେ ଥିବା ଫସଲ ଥରେ ମାତ୍ର ସେଭ୍ ହୁଏ।', // TO REVIEW
    hi: 'फसलें चुनने के लिए किसी भी कार्ड पर टैप करें। एक से अधिक श्रेणी वाली फसल एक ही बार सेव होती है।', // TO REVIEW
    te: 'పంటలను ఎంచుకోవడానికి ఏదైనా కార్డుపై నొక్కండి. ఎంపిక చేసినవి ఒక్కసారి మాత్రమే సేవ్ అవుతాయి.', // TO REVIEW
    bn: 'ফসল বেছে নিতে যেকোনো কার্ডে ট্যাপ করুন। একাধিক বিভাগে থাকা ফসল একবারই সেভ হয়।', // TO REVIEW
    ta: 'பயிர்களைத் தேர்ந்தெடுக்க எந்த அட்டையையும் தட்டவும். தேர்ந்தெடுக்கப்பட்டவை ஒருமுறை மட்டுமே சேமிக்கப்படும்.' // TO REVIEW
  },
  selected_crops_label: {
    en: 'Selected Crops ({count}):',
    or: 'ବଛାଯାଇଥିବା ଫସଲ ({count}):', // TO REVIEW
    hi: 'चुनी गई फसलें ({count}):', // TO REVIEW
    te: 'ఎంచుకున్న పంటలు ({count}):', // TO REVIEW
    bn: 'নির্বাচিত ফসল ({count}):', // TO REVIEW
    ta: 'தேர்ந்தெடுக்கப்பட்ட பயிர்கள் ({count}):' // TO REVIEW
  },
  other_crops_label: {
    en: 'Other Crops (Optional)',
    or: 'ଅନ୍ୟାନ୍ୟ ଫସଲ (ଇଚ୍ଛାଧୀନ)', // TO REVIEW
    hi: 'अन्य फसलें (वैकल्पिक)', // TO REVIEW
    te: 'ఇతర పంటలు (ఐచ్ఛికం)', // TO REVIEW
    bn: 'অন্যান্য ফসল (ঐচ্ছিক)', // TO REVIEW
    ta: 'மற்ற பயிர்கள் (விருப்பமானது)' // TO REVIEW
  },
  other_crops_placeholder: {
    en: 'Type any other crop not listed above...',
    or: 'ଉପରେ ନଥିବା ଅନ୍ୟ କୌଣସି ଫସଲର ନାମ ଲେଖନ୍ତୁ...', // TO REVIEW
    hi: 'ऊपर सूची में न होने वाली कोई अन्य फसल लिखें...', // TO REVIEW
    te: 'పైన లేని ఏదైనా ఇతర పంట పేరు రాయండి...', // TO REVIEW
    bn: 'উপরে তালিকাভুক্ত নয় এমন অন্য কোনো ফসলের নাম লিখুন...', // TO REVIEW
    ta: 'மேலே இல்லாத பிற பயிர் பெயரை உள்ளிடவும்...' // TO REVIEW
  },
  done_selected_btn: {
    en: 'Done ({count} selected)',
    or: 'ସମ୍ପୂର୍ଣ୍ଣ ({count} ଟି ବଛାଯାଇଛି)', // TO REVIEW
    hi: 'पूर्ण ({count} चयनित)', // TO REVIEW
    te: 'పూర్తయింది ({count} ఎంచుకోబడ్డాయి)', // TO REVIEW
    bn: 'সম্পন্ন ({count} টি নির্বাচিত)', // TO REVIEW
    ta: 'முடிந்தது ({count} தேர்ந்தெடுக்கப்பட்டது)' // TO REVIEW
  },
  crops_advice_note: {
    en: 'Advice is available only for some crops. We are adding more.',
    or: 'କେବଳ କେତେକ ଫସଲ ପାଇଁ ପରାମର୍ଶ ଉପଲବ୍ଧ ଅଛି। ଆମେ ଆହୁରି ଫସଲ ଯୋଡ଼ୁଛୁ।', // TO REVIEW
    hi: 'सलाह केवल कुछ फसलों के लिए उपलब्ध है। हम और फसलें जोड़ रहे हैं।', // TO REVIEW
    te: 'కొన్ని పంటలకు మాత్రమే సలహాలు అందుబాటులో ఉన్నాయి. మేము మరిన్ని జోడిస్తున్నాము.', // TO REVIEW
    bn: 'পরামর্শ শুধুমাত্র কিছু ফসলের জন্য উপলব্ধ। আমরা আরও ফসল যোগ করছি।', // TO REVIEW
    ta: 'சில பயிர்களுக்கு மட்டுமே ஆலோசனை உள்ளது. மேலும் பலவற்றை சேர்த்து வருகிறோம்.' // TO REVIEW
  },

  // ==========================================================================
  // STEP 7: REVIEW & CREATE ACCOUNT
  // ==========================================================================
  review_step_title: {
    en: 'Review & Create Account',
    or: 'ସମୀକ୍ଷା କରନ୍ତୁ ଓ ଆକାଉଣ୍ଟ ଖୋଲନ୍ତୁ', // TO REVIEW
    hi: 'समीक्षा करें और खाता बनाएं', // TO REVIEW
    te: 'సమీక్షించండి & ఖాతాను సృష్టించండి', // TO REVIEW
    bn: 'পর্যালোচনা করুন এবং অ্যাকাউন্ট তৈরি করুন', // TO REVIEW
    ta: 'சரிபார்த்து கணக்கை உருவாக்கவும்' // TO REVIEW
  },
  review_step_subtitle: {
    en: 'Review your details below. Tap Edit on any section to make changes.',
    or: 'ତଳେ ଆପଣଙ୍କ ବିବରଣୀ ଦେଖନ୍ତୁ। କୌଣସି ପରିବର୍ତ୍ତନ ପାଇଁ "ବଦଳାନ୍ତୁ" ଦବାନ୍ତୁ।', // TO REVIEW
    hi: 'नीचे अपने विवरण की समीक्षा करें। बदलाव के लिए किसी भी भाग पर "बदलें" दबाएं।', // TO REVIEW
    te: 'క్రింద మీ వివరాలను సమీక్షించండి. మార్పుల కోసం "మార్చు" నొక్కండి.', // TO REVIEW
    bn: 'নিচে আপনার বিবরণ দেখুন। পরিবর্তনের জন্য যেকোনো অংশে "সম্পাদনা" ট্যাপ করুন।', // TO REVIEW
    ta: 'உங்கள் விவரங்களைச் சரிபார்க்கவும். மாற்றங்களுக்கு "திருத்து" என்பதைத் தட்டவும்.' // TO REVIEW
  },
  photo_consent_label: {
    en: 'I agree to save my photo on my Farmer ID card and profile (Optional – uncheck to use initials instead).',
    or: 'ମୁଁ ମୋ କୃଷକ ପରିଚୟ ପତ୍ର ଓ ପ୍ରୋଫାଇଲରେ ମୋ ଫଟୋ ସେଭ୍ କରିବାକୁ ସହମତ (ଇଚ୍ଛାଧୀନ)।', // TO REVIEW
    hi: 'मैं अपने किसान पहचान पत्र और प्रोफ़ाइल पर अपनी फोटो सेव करने के लिए सहमत हूं (वैकल्पिक)।', // TO REVIEW
    te: 'నా రైతు గుర్తింపు కార్డు మరియు ప్రొఫైల్‌లో నా ఫోటోను సేవ్ చేయడానికి అంగీకరిస్తున్నాను (ఐచ్ఛికం).', // TO REVIEW
    bn: 'আমি আমার কৃষক আইডি কার্ড এবং প্রোফাইলে আমার ছবি সেভ করতে সম্মত (ঐচ্ছিক)।', // TO REVIEW
    ta: 'எனது விவசாயி அடையாள அட்டை மற்றும் சுயவிவரத்தில் எனது புகைப்படத்தைச் சேமிக்க சம்மதிக்கிறேன் (விருப்பமானது).' // TO REVIEW
  },
  create_account_btn: {
    en: 'Create my account',
    or: 'ମୋ ଆକାଉଣ୍ଟ ତିଆରି କରନ୍ତୁ', // TO REVIEW
    hi: 'मेरा खाता बनाएं', // TO REVIEW
    te: 'నా ఖాతాను సృష్టించండి', // TO REVIEW
    bn: 'আমার অ্যাকাউন্ট তৈরি করুন', // TO REVIEW
    ta: 'எனது கணக்கை உருவாக்கவும்' // TO REVIEW
  },
  privacy_security_note: {
    en: 'Privacy Guarantee: Saved to local copy + central server database. Security rules ensure only you can read and write your own record.',
    or: 'ଗୋପନୀୟତା ସୁରକ୍ଷା: ଆପଣଙ୍କ ତଥ୍ୟ ସ୍ଥାନୀୟ କପି ଓ କେନ୍ଦ୍ରୀୟ ସର୍ଭରରେ ସୁରକ୍ଷିତ। କେବଳ ଆପଣ ହିଁ ନିଜ ତଥ୍ୟ ଦେଖିପାରିବେ ଓ ବଦଳାଇପାରିବେ।', // TO REVIEW
    hi: 'गोपनीयता गारंटी: आपका डेटा लोकल कॉपी और केंद्रीय सर्वर डेटाबेस में सुरक्षित है। केवल आप ही अपना रिकॉर्ड पढ़ और लिख सकते हैं।', // TO REVIEW
    te: 'గోప్యతా హామీ: మీ డేటా లోకల్ కాపీ మరియు సెంట్రల్ సర్వర్ డేటాబేస్‌లో సురక్షితంగా ఉంటుంది. మీ రికార్డును మీరు మాత్రమే చూడగలరు.', // TO REVIEW
    bn: 'গোপনীয়তা গ্যারান্টি: আপনার তথ্য লোকাল কপি ও কেন্দ্রীয় সার্ভারে সুরক্ষিত। শুধুমাত্র আপনিই আপনার তথ্য দেখতে ও পরিবর্তন করতে পারবেন।', // TO REVIEW
    ta: 'தனியுரிமை உத்தரவாதம்: உள்ளூர் நகல் மற்றும் மத்திய சர்வரில் பாதுகாப்பாக சேமிக்கப்படுகிறது. நீங்கள் மட்டுமே உங்கள் பதிவைப் படிக்கவும் மாற்றவும் முடியும்.' // TO REVIEW
  },

  // ==========================================================================
  // POST-REGISTRATION: FARMER ID CARD & INTERACTIVE APP TRAINING
  // ==========================================================================
  farmer_id_card: {
    en: 'Farmer ID Card',
    or: 'କୃଷକ ପରିଚୟ ପତ୍ର', // TO REVIEW
    hi: 'किसान पहचान पत्र', // TO REVIEW
    te: 'రైతు గుర్తింపు కార్డు', // TO REVIEW
    bn: 'কৃষক পরিচয়পত্র', // TO REVIEW
    ta: 'உழவர் அடையாள அட்டை' // TO REVIEW
  },
  qr_only_id_note: {
    en: 'QR code contains ONLY Farmer ID ({id}) – No personal data',
    or: 'QR କୋଡରେ କେବଳ କୃଷକ ଆଇଡି ({id}) ଅଛି – କୌଣସି ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ ନାହିଁ', // TO REVIEW
    hi: 'QR कोड में केवल किसान आईडी ({id}) है – कोई व्यक्तिगत डेटा नहीं', // TO REVIEW
    te: 'QR కోడ్‌లో రైతు ID ({id}) మాత్రమే ఉంది – వ్యక్తిగత సమాచారం లేదు', // TO REVIEW
    bn: 'QR কোডে শুধুমাত্র কৃষক আইডি ({id}) রয়েছে – কোনো ব্যক্তিগত তথ্য নেই', // TO REVIEW
    ta: 'QR குறியீட்டில் விவசாயி ID ({id}) மட்டுமே உள்ளது – தனிப்பட்ட தகவல் இல்லை' // TO REVIEW
  },
  main_crops_label: {
    en: 'Main Crops:',
    or: 'ମୁଖ୍ୟ ଫସଲ:', // TO REVIEW
    hi: 'मुख्य फसलें:', // TO REVIEW
    te: 'ప్రధాన పంటలు:', // TO REVIEW
    bn: 'প্রধান ফসল:', // TO REVIEW
    ta: 'முக்கிய பயிர்கள்:' // TO REVIEW
  },
  save_as_image: {
    en: 'Save as image',
    or: 'ଫଟୋ ଭାବେ ସେଭ୍ କରନ୍ତୁ', // TO REVIEW
    hi: 'इमेज के रूप में सेव करें', // TO REVIEW
    te: 'చిత్రంగా సేవ్ చేయండి', // TO REVIEW
    bn: 'ছবি হিসেবে সেভ করুন', // TO REVIEW
    ta: 'படமாக சேமிக்கவும்' // TO REVIEW
  },
  share_card: {
    en: 'Share',
    or: 'ସେୟାର୍ କରନ୍ତୁ', // TO REVIEW
    hi: 'शेयर करें', // TO REVIEW
    te: 'షేర్ చేయండి', // TO REVIEW
    bn: 'শেয়ার করুন', // TO REVIEW
    ta: 'பகிரவும்' // TO REVIEW
  },
  start_training_btn: {
    en: 'Start Interactive App Training',
    or: 'ଆପ୍ ବ୍ୟବହାର ତାଲିମ ଆରମ୍ଭ କରନ୍ତୁ', // TO REVIEW
    hi: 'इंटरैक्टिव ऐप प्रशिक्षण शुरू करें', // TO REVIEW
    te: 'యాప్ శిక్షణను ప్రారంభించండి', // TO REVIEW
    bn: 'অ্যাপ প্রশিক্ষণ শুরু করুন', // TO REVIEW
    ta: 'செயலி பயிற்சியைத் தொடங்கவும்' // TO REVIEW
  },
  practice_mode_badge: {
    en: 'Practice mode – Sample data only (Never dials 108 or saves fake data)',
    or: 'ଅଭ୍ୟାସ ମୋଡ୍ (Practice mode) – କେବଳ ନମୁନା ତଥ୍ୟ (୧୦୮ କଲ୍ ବା ନକଲି ତଥ୍ୟ ସେଭ୍ ହୁଏ ନାହିଁ)', // TO REVIEW
    hi: 'अभ्यास मोड (Practice mode) – केवल नमूना डेटा (108 कॉल या नकली डेटा सेव नहीं होता)', // TO REVIEW
    te: 'ప్రాక్టీస్ మోడ్ (Practice mode) – నమూనా డేటా మాత్రమే (108 కాల్ వెళ్ళదు)', // TO REVIEW
    bn: 'অনুশীলন মোড (Practice mode) – শুধুমাত্র নমুনা তথ্য (১০৮ কল বা নকল তথ্য সেভ হয় না)', // TO REVIEW
    ta: 'பயிற்சி முறை (Practice mode) – மாதிரி தரவு மட்டுமே (108 அழைப்பு செல்லாது)' // TO REVIEW
  },
  replay_training: {
    en: 'Replay App Training',
    or: 'ଆପ୍ ତାଲିମ ପୁଣି ଦେଖନ୍ତୁ', // TO REVIEW
    hi: 'ऐप प्रशिक्षण फिर से देखें', // TO REVIEW
    te: 'యాప్ శిక్షణ మళ్ళీ చూడండి', // TO REVIEW
    bn: 'অ্যাপ প্রশিক্ষণ পুনরায় দেখুন', // TO REVIEW
    ta: 'செயலி பயிற்சியை மீண்டும் பார்க்கவும்' // TO REVIEW
  },
  sign_out: {
    en: 'Sign Out',
    or: 'ଲଗ୍ ଆଉଟ୍ (Sign Out)', // TO REVIEW
    hi: 'लॉग आउट (Sign Out)', // TO REVIEW
    te: 'సైన్ అవుట్ (Sign Out)', // TO REVIEW
    bn: 'সাইন আউট (Sign Out)', // TO REVIEW
    ta: 'வெளியேறு (Sign Out)' // TO REVIEW
  },

  // ==========================================================================
  // HOME SCREEN, HEADER & BOTTOM BAR
  // ==========================================================================
  voice_assistant: {
    en: 'Voice Assistant',
    or: 'କୃଷି ଭଏସ୍', // TO REVIEW
    hi: 'कृषि वॉइस', // TO REVIEW
    te: 'వాయిస్ అసిస్టెంట్', // TO REVIEW
    bn: 'কৃষি ভয়েস', // TO REVIEW
    ta: 'குரல் உதவி' // TO REVIEW
  },
  home: {
    en: 'Home',
    or: 'ମୂଳ', // TO REVIEW
    hi: 'होम', // TO REVIEW
    te: 'హోమ్', // TO REVIEW
    bn: 'হোম', // TO REVIEW
    ta: 'முகப்பு' // TO REVIEW
  },
  crop_doctor: {
    en: 'Crop Doctor',
    or: 'ଶସ୍ୟ ଡାକ୍ତର', // TO REVIEW
    hi: 'फसल डॉक्टर', // TO REVIEW
    te: 'పంట డాక్టర్', // TO REVIEW
    bn: 'ফসল ডাক্তার', // TO REVIEW
    ta: 'பயிர் மருத்துவர்' // TO REVIEW
  },
  pesticide_spray: {
    en: 'Spray',
    or: 'ସ୍ପ୍ରେ', // TO REVIEW
    hi: 'स्प्रे', // TO REVIEW
    te: 'స్ప్రే', // TO REVIEW
    bn: 'স্প্রে', // TO REVIEW
    ta: 'தெளிப்பு' // TO REVIEW
  },
  offline_map: {
    en: 'Map',
    or: 'ମାନଚିତ୍ର', // TO REVIEW
    hi: 'नक्शा', // TO REVIEW
    te: 'మ్యాప్', // TO REVIEW
    bn: 'মানচিত্র', // TO REVIEW
    ta: 'வரைபடம்' // TO REVIEW
  },
  change_location: {
    en: 'Change Location / GPS',
    or: 'ସ୍ଥାନ ବଦଳାନ୍ତୁ / GPS', // TO REVIEW
    hi: 'स्थान बदलें / GPS', // TO REVIEW
    te: 'లొకేషన్ మార్చండి / GPS', // TO REVIEW
    bn: 'স্থান পরিবর্তন / GPS', // TO REVIEW
    ta: 'இடம் மாற்றம் / GPS' // TO REVIEW
  },
  download_app: {
    en: 'Download App',
    or: 'ଆପ୍ ଡାଉନଲୋଡ୍', // TO REVIEW
    hi: 'ऐप डाउनलोड करें', // TO REVIEW
    te: 'యాప్ డౌన్‌లోడ్', // TO REVIEW
    bn: 'অ্যাপ ডাউনলোড', // TO REVIEW
    ta: 'செயலி பதிவிறக்கம்' // TO REVIEW
  },
  download_banner_title: {
    en: 'Download Krushak Bani Odisha on Mobile',
    or: 'ମୋବାଇଲ୍ରେ କୃଷକ ବାଣୀ ଓଡ଼ିଶା ଆପ୍ ଡାଉନଲୋଡ୍ କରନ୍ତୁ', // TO REVIEW
    hi: 'मोबाइल पर कृषक वाणी ओडिशा ऐप डाउनलोड करें', // TO REVIEW
    te: 'మొబైల్‌లో కృషక్ వాణి ఒడిశా యాప్ డౌన్‌లోడ్ చేసుకోండి', // TO REVIEW
    bn: 'মোবাইলে কৃষক বাণী ওড়িশা অ্যাপ ডাউনলোড করুন', // TO REVIEW
    ta: 'மொபைலில் கிருஷக் வாணி ஒடிசா செயலியைப் பதிவிறக்கவும்' // TO REVIEW
  },
  download_banner_sub: {
    en: 'Install to Home Screen for instant offline use',
    or: 'ହୋମ୍ ସ୍କ୍ରିନ୍ରେ ସେଭ୍ କରନ୍ତୁ, ବିନା ନେଟୱାର୍କରେ ବି ଚାଲିବ', // TO REVIEW
    hi: 'बिना इंटरनेट के उपयोग के लिए होम स्क्रीन पर इंस्टॉल करें', // TO REVIEW
    te: 'ఆఫ్‌లైన్ ఉపయోగం కోసం హోమ్ స్క్రీన్‌లో ఇన్‌స్టాల్ చేయండి', // TO REVIEW
    bn: 'অফলাইন ব্যবহারের জন্য হোম স্ক্রিনে ইনস্টল করুন', // TO REVIEW
    ta: 'ஆஃப்லைன் பயன்பாட்டிற்கு முகப்புத் திரையில் நிறுவவும்' // TO REVIEW
  },
  rain_label: {
    en: 'rain',
    or: 'ବର୍ଷା', // TO REVIEW
    hi: 'बारिश', // TO REVIEW
    te: 'వర్షం', // TO REVIEW
    bn: 'বৃষ্টি', // TO REVIEW
    ta: 'மழை' // TO REVIEW
  },
  wind_label: {
    en: 'Wind',
    or: 'ପବନ', // TO REVIEW
    hi: 'हवा', // TO REVIEW
    te: 'గాలి', // TO REVIEW
    bn: 'বাতাস', // TO REVIEW
    ta: 'காற்று' // TO REVIEW
  },
  temp_label: {
    en: 'Temp',
    or: 'ତାପମାତ୍ରା', // TO REVIEW
    hi: 'तापमान', // TO REVIEW
    te: 'ఉష్ణోగ్రత', // TO REVIEW
    bn: 'তাপমাত্রা', // TO REVIEW
    ta: 'வெப்பநிலை' // TO REVIEW
  },
  permissions_ok: {
    en: 'Permissions: OK',
    or: 'ଅନୁମତି ସକ୍ରିୟ', // TO REVIEW
    hi: 'अनुमतियां सक्रिय', // TO REVIEW
    te: 'అనుమతులు సక్రియం', // TO REVIEW
    bn: 'অনুমতি সক্রিয়', // TO REVIEW
    ta: 'அனுமதிகள் தயார்' // TO REVIEW
  },
  allow_gps_mic: {
    en: 'Permissions',
    or: 'ଅନୁମତି', // TO REVIEW
    hi: 'अनुमतियां', // TO REVIEW
    te: 'అనుమతులు', // TO REVIEW
    bn: 'অনুমতি', // TO REVIEW
    ta: 'அனுமதிகள்' // TO REVIEW
  },
  verified_badge: {
    en: 'Verified',
    or: 'ଯାଞ୍ଚ ହୋଇଛି', // TO REVIEW
    hi: 'सत्यापित', // TO REVIEW
    te: 'ధృవీకరించబడింది', // TO REVIEW
    bn: 'যাচাইকৃত', // TO REVIEW
    ta: 'சரிபார்க்கப்பட்டது' // TO REVIEW
  },
  hero_heading: {
    en: 'Intelligent Farming & Safety Suite for Odisha Farmers',
    or: 'ଓଡ଼ିଶା କୃଷକଙ୍କ ପାଇଁ ସମ୍ପୂର୍ଣ୍ଣ ସୁରକ୍ଷା ଓ ପରାମର୍ଶ ପୋର୍ଟାଲ', // TO REVIEW
    hi: 'ओडिशा के किसानों के लिए संपूर्ण कृषि और सुरक्षा पोर्टल', // TO REVIEW
    te: 'ఒడిశా రైతుల కోసం సమగ్ర వ్యవసాయ & భద్రతా పోర్టల్', // TO REVIEW
    bn: 'ওড়িশার কৃষকদের জন্য সম্পূর্ণ কৃষি ও সুরক্ষা পোর্টাল', // TO REVIEW
    ta: 'ஒடிசா விவசாயிகளுக்கான முழுமையான வேளாண் மற்றும் பாதுகாப்பு தளம்' // TO REVIEW
  },
  hero_subheading: {
    en: 'Complete agricultural suite: Crop Doctor AI, Weather Alerts, Crop History, Spray Log, OUAT dosing, and 108 emergency safety.',
    or: 'ଶସ୍ୟ ଡାକ୍ତର (ରୋଗ ଚିହ୍ନଟ), ପାଣିପାଗ ସତର୍କତା, ଫସଲ ଇତିହାସ, ସ୍ପ୍ରେ ଲଗ୍, ଓୟୁଏଟି କୀଟନାଶକ ମାତ୍ରା ଓ ସାପ କାମୁଡ଼ା ୧୦୮ ସେବା।', // TO REVIEW
    hi: 'फसल डॉक्टर एआई, मौसम अलर्ट, फसल इतिहास, स्प्रे लॉग, OUAT कीटनाशक मात्रा और 108 सर्पदंश आपातकालीन सेवा।', // TO REVIEW
    te: 'పంట డాక్టర్ AI, వాతావరణ హెచ్చరికలు, పంట చరిత్ర, స్ప్రే లాగ్, OUAT మోతాదులు మరియు 108 అత్యవసర భద్రత.', // TO REVIEW
    bn: 'ফসল ডাক্তার এআই, আবহাওয়া সতর্কতা, ফসলের ইতিহাস, স্প্রে লগ, OUAT কীটনাশক মাত্রা এবং ১০৮ জরুরি সুরক্ষা।', // TO REVIEW
    ta: 'பயிர் மருத்துவர் AI, வானிலை எச்சரிக்கைகள், பயிர் வரலாறு, தெளிப்பு பதிவேடு மற்றும் 108 அவசர பாதுகாப்பு.' // TO REVIEW
  },
  diagnose_crop_leaf: {
    en: 'Diagnose Crop Leaf',
    or: 'ପତ୍ର ଫଟୋ ଉଠାନ୍ତୁ', // TO REVIEW
    hi: 'पत्ती की जांच करें', // TO REVIEW
    te: 'ఆకు పరీక్ష చేయండి', // TO REVIEW
    bn: 'পাতার রোগ নির্ণয়', // TO REVIEW
    ta: 'இலை நோய் கண்டறிதல்' // TO REVIEW
  },
  going_to_spray: {
    en: 'Going to Spray',
    or: 'ସ୍ପ୍ରେ କରିବାକୁ ଯାଉଛି', // TO REVIEW
    hi: 'स्प्रे करने जा रहे हैं', // TO REVIEW
    te: 'స్ప్రే చేయబోతున్నాను', // TO REVIEW
    bn: 'স্প্রে করতে যাচ্ছি', // TO REVIEW
    ta: 'மருந்து தெளிக்கச் செல்கிறேன்' // TO REVIEW
  },

  todays_spray_window: {
    en: "Today's Spray Window",
    or: 'ଆଜି ସ୍ପ୍ରେ କରିବା ଅନୁକୂଳ କି?', // TO REVIEW
    hi: 'आज स्प्रे के लिए उपयुक्त समय', // TO REVIEW
    te: 'నేటి స్ప్రే సమయం', // TO REVIEW
    bn: 'আজকের স্প্রে করার সময়', // TO REVIEW
    ta: 'இன்றைய தெளிப்பு நேரம்' // TO REVIEW
  },
  spray_favourable: {
    en: 'Favourable for Spraying',
    or: 'ସ୍ପ୍ରେ ପାଇଁ ଅନୁକୂଳ', // TO REVIEW
    hi: 'स्प्रे के लिए अनुकूल', // TO REVIEW
    te: 'స్ప్రే చేయడానికి అనుకూలం', // TO REVIEW
    bn: 'স্প্রে করার জন্য অনুকূল', // TO REVIEW
    ta: 'மருந்து தெளிக்க உகந்தது' // TO REVIEW
  },
  spray_caution: {
    en: 'Caution / Delay Advised',
    or: 'ସାବଧାନତା ଆବଶ୍ୟକ', // TO REVIEW
    hi: 'सावधानी / प्रतीक्षा करें', // TO REVIEW
    te: 'జాగ్రత్త / వాయిదా వేయండి', // TO REVIEW
    bn: 'সতর্কতা / অপেক্ষা করুন', // TO REVIEW
    ta: 'கவனம் / தாமதிக்கவும்' // TO REVIEW
  },
  all_modules_heading: {
    en: 'All Agricultural & Safety Modules:',
    or: 'କୃଷକ ବାଣୀ ସମସ୍ତ କୃଷି ଓ ସୁରକ୍ଷା ସେବା:', // TO REVIEW
    hi: 'सभी कृषि और सुरक्षा सेवाएं:', // TO REVIEW
    te: 'అన్ని వ్యవసాయ & భద్రతా సేవలు:', // TO REVIEW
    bn: 'সকল কৃষি ও সুরক্ষা পরিষেবা:', // TO REVIEW
    ta: 'அனைத்து வேளாண் மற்றும் பாதுகாப்பு சேவைகள்:' // TO REVIEW
  },
  open_module: {
    en: 'Open Module',
    or: 'ଖୋଲନ୍ତୁ', // TO REVIEW
    hi: 'खोलें', // TO REVIEW
    te: 'తెరవండి', // TO REVIEW
    bn: 'খুলুন', // TO REVIEW
    ta: 'திறக்கவும்' // TO REVIEW
  },

  // ==========================================================================
  // LOCAL-FIRST SYNC STATUS, SIGN-OUT CONFIRMATION, LOCKED FIELDS & ADMIN
  // ==========================================================================
  sync_saved_on_phone: {
    en: 'Saved on phone',
    or: 'ଫୋନରେ ସେଭ୍ ହୋଇଛି', // TO REVIEW
    hi: 'फ़ोन में सेव है', // TO REVIEW
    te: 'ఫోన్‌లో సేవ్ అయింది', // TO REVIEW
    bn: 'ফোনে সেভ হয়েছে', // TO REVIEW
    ta: 'போனில் சேமிக்கப்பட்டது' // TO REVIEW
  },
  sync_syncing: {
    en: 'Syncing',
    or: 'ସିଙ୍କ୍ ହେଉଛି...', // TO REVIEW
    hi: 'सिंक हो रहा है...', // TO REVIEW
    te: 'సింక్ అవుతోంది...', // TO REVIEW
    bn: 'সিঙ্ক হচ্ছে...', // TO REVIEW
    ta: 'ஒத்திசைக்கிறது...' // TO REVIEW
  },
  sync_saved_to_server: {
    en: 'Saved to server',
    or: 'ସର୍ଭରରେ ସେଭ୍ ହୋଇଛି', // TO REVIEW
    hi: 'सर्वर पर सेव है', // TO REVIEW
    te: 'సర్వర్‌లో సేవ్ అయింది', // TO REVIEW
    bn: 'সার্ভারে সেভ হয়েছে', // TO REVIEW
    ta: 'சர்வரில் சேமிக்கப்பட்டது' // TO REVIEW
  },
  last_synced_label: {
    en: 'Last synced: {time}',
    or: 'ଶେଷ ସିଙ୍କ୍: {time}', // TO REVIEW
    hi: 'अंतिम सिंक: {time}', // TO REVIEW
    te: 'చివరి సింక్: {time}', // TO REVIEW
    bn: 'সর্বশেষ সিঙ্ক: {time}', // TO REVIEW
    ta: 'கடைசி ஒத்திசைவு: {time}' // TO REVIEW
  },
  last_synced_never: {
    en: 'Last synced: On phone (waiting for sync)',
    or: 'ଶେଷ ସିଙ୍କ୍: ଫୋନରେ ସୁରକ୍ଷିତ', // TO REVIEW
    hi: 'अंतिम सिंक: फ़ोन पर सुरक्षित', // TO REVIEW
    te: 'చివరి సింక్: ఫోన్‌లో భద్రంగా ఉంది', // TO REVIEW
    bn: 'সর্বশেষ সিঙ্ক: ফোনে সংরক্ষিত', // TO REVIEW
    ta: 'கடைசி ஒத்திசைவு: போனில் உள்ளது' // TO REVIEW
  },
  sync_queue_pending: {
    en: '{count} queued offline',
    or: '{count} ଟି ଅଫଲାଇନ୍ କ୍ୟୁରେ ଅଛି', // TO REVIEW
    hi: '{count} ऑफ़लाइन कतार में', // TO REVIEW
    te: '{count} ఆఫ్‌లైన్ క్యూలో ఉన్నాయి', // TO REVIEW
    bn: '{count} টি অফলাইন কিউতে', // TO REVIEW
    ta: '{count} ஆஃப்லைன் வரிசையில்' // TO REVIEW
  },
  sign_out_confirm_title: {
    en: 'Sign Out & Remove Data from This Phone?',
    or: 'ଲଗ୍ ଆଉଟ୍ କରି ଏହି ଫୋନରୁ ତଥ୍ୟ ହଟାଇବେ କି?', // TO REVIEW
    hi: 'साइन आउट करें और इस फ़ोन से डेटा हटाएं?', // TO REVIEW
    te: 'సైన్ అవుట్ చేసి ఈ ఫోన్ నుండి డేటా తొలగించాలా?', // TO REVIEW
    bn: 'সাইন আউট করে এই ফোন থেকে তথ্য মুছে ফেলবেন?', // TO REVIEW
    ta: 'வெளியேறி এই போனிலிருந்து தரவை நீக்கவா?' // TO REVIEW
  },
  sign_out_confirm_desc: {
    en: "Your farmer record will be removed from this phone so another person using the same phone cannot see it. Your master copy stays safely stored on the server and will restore automatically next time you log in with OTP.",
    or: 'ଆପଣଙ୍କ କୃଷକ ତଥ୍ୟ ଏହି ଫୋନରୁ ହଟାଯିବ ଯାହାଫଳରେ ଅନ୍ୟ କେହି ଦେଖିପାରିବେ ନାହିଁ। ଆପଣଙ୍କ ମାଷ୍ଟର ରେକର୍ଡ ସର୍ଭରରେ ସୁରକ୍ଷିତ ରହିବ ଏବଂ ପୁଣି OTP ଲগଇନ୍ କଲେ ଫେରିଆସିବ।', // TO REVIEW
    hi: 'आपका किसान डेटा इस फ़ोन से हटा दिया जाएगा ताकि कोई दूसरा व्यक्ति इसे न देख सके। आपका मास्टर रिकॉर्ड सर्वर पर सुरक्षित रहेगा।', // TO REVIEW
    te: 'మీ రైతు డేటా ఈ ఫోన్ నుండి తొలగించబడుతుంది, కాబట్టి వేరొకరు చూడలేరు. మీ మాస్టర్ రికార్డ్ సర్వర్‌లో సురక్షితంగా ఉంటుంది.', // TO REVIEW
    bn: 'আপনার তথ্য এই ফোন থেকে মুছে ফেলা হবে যাতে অন্য কেউ দেখতে না পায়। আপনার মাস্টার রেকর্ড সার্ভারে সুরক্ষিত থাকবে।', // TO REVIEW
    ta: 'மற்றவர்கள் பார்க்காதபடி உங்கள் தரவு இந்த போனிலிருந்து நீக்கப்படும். உங்கள் முதன்மை பதிவு சர்வரில் பாதுகாப்பாக இருக்கும்.' // TO REVIEW
  },
  sign_out_unsynced_warning: {
    en: 'WARNING: You have {count} change(s) in the offline queue that have NOT synced to the server yet! If you sign out now while offline, those unsynced changes will be lost.',
    or: 'ଚେତାବନୀ: ଆପଣଙ୍କର {count} ଟି ପରିବର୍ତ୍ତନ ଏପର୍ଯ୍ୟନ୍ତ ସର୍ଭରରେ ସିଙ୍କ୍ ହୋଇନାହିଁ! ବର୍ତ୍ତମାନ ଲଗ୍ ଆଉଟ୍ କଲେ ସେହି ଅସିଙ୍କ୍ ପରିବର୍ତ୍ତନ ହଜିযିବ।', // TO REVIEW
    hi: 'चेतावनी: आपके {count} बदलाव अभी तक सर्वर पर सिंक नहीं हुए हैं! यदि आप अभी साइन आउट करते हैं, तो वे बदलाव खो जाएंगे।', // TO REVIEW
    te: 'హెచ్చరిక: మీ {count} మార్పులు ఇంకా సర్వర్‌కు సింక్ కాలేదు! ఇప్పుడు సైన్ అవుట్ చేస్తే ఆ మార్పులు పోతాయి.', // TO REVIEW
    bn: 'সতর্কতা: আপনার {count} টি পরিবর্তন এখনও সার্ভারে সিঙ্ক হয়নি! এখন সাইন আউট করলে সেগুলি মুছে যাবে।', // TO REVIEW
    ta: 'எச்சரிக்கை: உங்கள் {count} மாற்றங்கள் இன்னும் சர்வரில் ஒத்திசைக்கப்படவில்லை! இப்போது வெளியேறினால் அவை இழக்கப்படும்.' // TO REVIEW
  },
  sign_out_confirm_btn: {
    en: 'Yes, Wipe Phone Copy & Sign Out',
    or: 'ହଁ, ଫୋନରୁ ତଥ୍ୟ ହଟାନ୍ତୁ ଓ ଲଗ୍ ଆଉଟ୍ କରନ୍ତୁ', // TO REVIEW
    hi: 'हाँ, फ़ोन से हटाएं और साइन आउट करें', // TO REVIEW
    te: 'అవును, ఫోన్ నుండి తొలగించి సైన్ అవుట్ చేయండి', // TO REVIEW
    bn: 'হ্যাঁ, ফোন থেকে মুছে সাইন আউট করুন', // TO REVIEW
    ta: 'ஆம், போனிலிருந்து நீக்கி வெளியேறு' // TO REVIEW
  },
  locked_fields_btn: {
    en: 'Request Locked Address / GPS Correction',
    or: 'ଲକ୍ ହୋଇଥିବା ଠିକଣା / GPS ସଂଶୋଧନ ଅନୁରୋଧ', // TO REVIEW
    hi: 'लॉक किए गए पते / GPS में सुधार का अनुरोध', // TO REVIEW
    te: 'లాక్ చేసిన చిరునామా / GPS సవరణ అభ్యర్థన', // TO REVIEW
    bn: 'লক করা ঠিকানা / GPS সংশোধনের অনুরোধ', // TO REVIEW
    ta: 'பூட்டப்பட்ட முகவரி / GPS திருத்தக் கோரிக்கை' // TO REVIEW
  },
  admin_portal_btn: {
    en: 'Admin Portal (Locked Fields & Security)',
    or: 'ଆଡମିନ୍ ପୋର୍ଟାଲ୍ (ସଂଶୋଧନ ଅନୁମୋଦନ)', // TO REVIEW
    hi: 'एडमिन पोर्टल (सुधार अनुमोदन)', // TO REVIEW
    te: 'అడ్మిన్ పోర్టల్ (సవరణ ఆమోదం)', // TO REVIEW
    bn: 'অ্যাডমিন পোর্টাল (সংশোধন অনুমোদন)', // TO REVIEW
    ta: 'நிர்வாக தளம் (திருத்த ஒப்புதல்)' // TO REVIEW
  },

  // ==========================================================================
  // COMPLETE ODIA, ENGLISH & HINDI KEYS FOR ALL UI LABELS & MODULES
  // ==========================================================================
  voice_command: {
    en: 'Voice Command',
    or: 'କଣ୍ଠ ନିର୍ଦ୍ଦେଶ',
    hi: 'आवाज़ कमांड',
    te: 'వాయిస్ కమాండ్',
    bn: 'কণ্ঠ নির্দেশ',
    ta: 'குரல் கட்டளை'
  },
  download_btn: {
    en: 'Get App',
    or: 'ଆପ୍ ପାଆନ୍ତୁ',
    hi: 'ऐप प्राप्त करें',
    te: 'యాప్ పొందండి',
    bn: 'অ্যাপ পান',
    ta: 'செயலியைப் பெறுக'
  },
  download_banner_subtitle: {
    en: 'Works offline in villages without internet',
    or: 'ବିନା ଇଣ୍ଟରନେଟରେ ଗାଁରେ ମଧ୍ୟ ସମ୍ପୂର୍ଣ୍ଣ କାମ କରେ',
    hi: 'बिना इंटरनेट के गांवों में भी काम करता है',
    te: 'ఇంటర్నెట్ లేకుండా గ్రామాల్లో కూడా పనిచేస్తుంది',
    bn: 'ইন্টারনেট ছাড়াই গ্রামে কাজ করে',
    ta: 'இணையம் இல்லாமல் கிராமங்களிலும் வேலை செய்யும்'
  },
  nav_map: {
    en: 'Offline Map & GPS',
    or: 'ମାନଚିତ୍ର ଓ ସ୍ଥାନ',
    hi: 'मानचित्र और स्थान',
    te: 'మ్యాప్ & లొకేషన్',
    bn: 'মানচিত্র ও অবস্থান',
    ta: 'வரைபடம் & இடம்'
  },
  nav_doctor: {
    en: 'Crop Doctor',
    or: 'ଶସ୍ୟ ଡାକ୍ତର',
    hi: 'फसल डॉक्टर',
    te: 'పంట డాక్టర్',
    bn: 'ফসল ডাক্তার',
    ta: 'பயிர் மருத்துவர்'
  },
  nav_spray: {
    en: 'Pesticide',
    or: 'କୀଟନାଶକ',
    hi: 'कीटनाशक',
    te: 'పురుగుమందు',
    bn: 'কীটনাশক',
    ta: 'பூச்சிக்கொல்லி'
  },
  crop_history: {
    en: 'Crop History & Growth',
    or: 'ଫସଲ ଇତିହାସ ଓ ବୃଦ୍ଧି',
    hi: 'फसल इतिहास और वृद्धि',
    te: 'పంట చరిత్ర & పెరుగుదల',
    bn: 'ফসলের ইতিহাস ও বৃদ্ধি',
    ta: 'பயிர் வரலாறு & வளர்ச்சி'
  },
  rain_chance: {
    en: 'Rain Chance',
    or: 'ବର୍ଷା ସମ୍ଭାବନା',
    hi: 'बारिश की संभावना',
    te: 'వర్షం అవకాశం',
    bn: 'বৃষ্টির সম্ভাবনা',
    ta: 'மழை வாய்ப்பு'
  },
  wind_speed: {
    en: 'Wind Speed',
    or: 'ପବନ ବେଗ',
    hi: 'हवा की गति',
    te: 'గాలి వేగం',
    bn: 'বাতাসের গতি',
    ta: 'காற்றின் வேகம்'
  },
  Temp: {
    en: 'Temperature',
    or: 'ତାପମାତ୍ରା',
    hi: 'तापमान',
    te: 'ఉష్ణోగ్రత',
    bn: 'তাপমাত্রা',
    ta: 'வெப்பநிலை'
  },
  snakebite_emergency: {
    en: '108 Snakebite & Poisoning Emergency',
    or: '୧୦୮ ସାପ କାମୁଡ଼ା ଓ ବିଷକ୍ରିୟା ଜରୁରୀ ସେବା',
    hi: '108 सांप काटने और विष आपातकालीन सेवा',
    te: '108 పాము కాటు అత్యవసర సేవ',
    bn: '১০৮ সাপে কামড়ানো জরুরি সেবা',
    ta: '108 பாம்பு கடி அவசர உதவி'
  },
  snakebite_desc: {
    en: 'Direct 108 ambulance call, WHO first-aid steps & nearest anti-snake venom (ASV) hospitals',
    or: 'ସିଧାସଳଖ ୧୦୮ ଆମ୍ବୁଲାନ୍ସ କଲ୍, ପ୍ରାଥମିକ ଚିକିତ୍ସା ଓ ନିକଟତମ ASV ହସ୍ପିଟାଲ ତାଲିକା',
    hi: 'सीधा 108 एम्बुलेंस कॉल, प्राथमिक उपचार और नजदीकी एंटी-स्नेक वेनम (ASV) अस्पताल',
    te: '108 అంబులెన్స్ కాల్, ప్రథమ చికిత్స & సమీప ASV ఆసుపత్రులు',
    bn: 'সরাসরি ১০৮ অ্যাম্বুলেন্স কল, প্রাথমিক চিকিৎসা ও নিকটস্থ ASV হাসপাতাল',
    ta: '108 ஆம்புலன்ஸ் அழைப்பு, முதலுதவி மற்றும் அருகிலுள்ள ASV மருத்துவமனைகள்'
  },
  live_weather: {
    en: 'Live Weather',
    or: 'ସଜୀବ ପାଣିପାଗ',
    hi: 'लाइव मौसम',
    te: 'ప్రత్యక్ష వాతావరణం',
    bn: 'লাইভ আবহাওয়া',
    ta: 'நேரடி வானிலை'
  },
  permissions_title: {
    en: 'App Permissions',
    or: 'ଆପ୍ ଅନୁମତି ସ୍ଥିତି',
    hi: 'ऐप अनुमतियां',
    te: 'యాప్ అనుమతులు',
    bn: 'অ্যাপ অনুমতি',
    ta: 'செயலி அனுமதிகள்'
  },
  registered_farmer_id: {
    en: 'Registered Farmer ID',
    or: 'ପଞ୍ଜୀକୃତ କୃଷକ ପରିଚୟ ସଂଖ୍ୟା (ID)',
    hi: 'पंजीकृत किसान पहचान संख्या (ID)',
    te: 'నమోదిత రైతు గుర్తింపు సంఖ్య (ID)',
    bn: 'নিবন্ধিত কৃষক আইডি (ID)',
    ta: 'பதிவுசெய்யப்பட்ட விவசாயி எண் (ID)'
  },
  view_id_card: {
    en: 'View ID Card',
    or: 'ପରିଚୟ ପତ୍ର ଦେଖନ୍ତୁ',
    hi: 'पहचान पत्र देखें',
    te: 'గుర్తింపు కార్డు చూడండి',
    bn: 'পরিচয়পত্র দেখুন',
    ta: 'அடையாள அட்டையைப் பார்க்க'
  },
  lang_changed_toast: {
    en: 'Language changed to {langName}',
    or: 'ଭାଷା {langName} କୁ ବଦଳାଗଲା',
    hi: 'भाषा बदलकर {langName} कर दी गई है',
    te: 'భాష {langName} కు మార్చబడింది',
    bn: 'ভাষা {langName}-এ পরিবর্তন করা হয়েছে',
    ta: 'மொழி {langName} ஆக மாற்றப்பட்டது'
  },
  account_menu: {
    en: 'Account & Settings Menu',
    or: 'ଆକାଉଣ୍ଟ ଓ ମେନୁ',
    hi: 'खाता और मेनू',
    te: 'ఖాతా & మెనూ',
    bn: 'অ্যাকাউন্ট ও মেনু',
    ta: 'கணக்கு மற்றும் மெனு'
  },
  weather_alerts: {
    en: 'Weather Alerts',
    or: 'ପାଣିପାଗ ସତର୍କତା',
    hi: 'मौसम चेतावनी',
    te: 'వాతావరణ హెచ్చరికలు',
    bn: 'আবহাওয়া সতর্কতা',
    ta: 'வானிலை எச்சரிக்கைகள்'
  },
  what_are_you_growing: {
    en: 'What are you growing?',
    or: 'ଆପଣ କେଉଁ ଫସଲ ଚାଷ କରୁଛନ୍ତି?',
    hi: 'आप कौन सी फसल उगा रहे हैं?',
    te: 'మీరు ఏ పంట పండిస్తున్నారు?',
    bn: 'আপনি কোন ফসল চাষ করছেন?',
    ta: 'நீங்கள் என்ன பயிர் செய்கிறீர்கள்?'
  },
  change_crop_btn: {
    en: 'Change Crop',
    or: 'ଫସଲ ବଦଳାନ୍ତୁ',
    hi: 'फसल बदलें',
    te: 'పంట మార్చండి',
    bn: 'ফসল পরিবর্তন করুন',
    ta: 'பயிரை மாற்றவும்'
  },
  back_btn: {
    en: 'Back',
    or: 'ପଛକୁ',
    hi: 'पीछे',
    te: 'వెనుకకు',
    bn: 'পিছনে',
    ta: 'பின்னால்'
  },
  pick_crop_item_title: {
    en: 'Tap to select your crop',
    or: 'ଆପଣଙ୍କ ଫସଲ ଉପରେ ଟ୍ୟାପ୍ କରି ବାଛନ୍ତୁ',
    hi: 'अपनी फसल चुनने के लिए टैप करें',
    te: 'మీ పంటను ఎంచుకోవడానికి నొక్కండి',
    bn: 'আপনার ফসল নির্বাচন করতে ট্যাপ করুন',
    ta: 'உங்கள் பயிரைத் தேர்ந்தெடுக்க தட்டவும்'
  },
  pick_farming_type_title: {
    en: 'Select a farming category or search above',
    or: 'ଚାଷ ବର୍ଗ ବାଛନ୍ତୁ କିମ୍ବା ଉପରେ ଖୋଜନ୍ତୁ',
    hi: 'खेती की श्रेणी चुनें या ऊपर खोजें',
    te: 'వ్యవసాయ వర్గాన్ని ఎంచుకోండి లేదా పైన వెతకండి',
    bn: 'চাষের বিভাগ বেছে নিন বা উপরে খুঁজুন',
    ta: 'விவசாய வகையைத் தேர்ந்தெடுக்கவும் அல்லது தேடவும்'
  },
  search_crops_placeholder: {
    en: 'Search crop name (e.g. Paddy, Tomato, Brinjal)...',
    or: 'ଫସଲ ନାମ ଖୋଜନ୍ତୁ (ଯଥା: ଧାନ, ଟମାଟୋ, ବାଇଗଣ)...',
    hi: 'फसल का नाम खोजें (जैसे: धान, टमाटर, बैंगन)...',
    te: 'పంట పేరు వెతకండి (ఉదా: వరి, టమాటా, వంకాయ)...',
    bn: 'ফসলের নাম খুঁজুন (যেমন: ধান, টমেটো, বেগুন)...',
    ta: 'பயிர் பெயரைத் தேடுங்கள் (எ.கா: நெல், தக்காளி)...'
  },
  save_to_my_crops: {
    en: 'Also save to my main crops',
    or: 'ମୋ ମୁଖ୍ୟ ଫସଲ ତାଲିକାରେ ମଧ୍ୟ ସେଭ୍ କରନ୍ତୁ',
    hi: 'मेरी मुख्य फसलों में भी सेव करें',
    te: 'నా ప్రధాన పంటలలో కూడా సేవ్ చేయండి',
    bn: 'আমার প্রধান ফসলের তালিকাতেও সেভ করুন',
    ta: 'எனது முக்கிய பயிர்களிலும் சேமிக்கவும்'
  },
  all_categories_tab: {
    en: 'All Categories',
    or: 'ସମସ୍ତ ବର୍ଗ',
    hi: 'सभी श्रेणियां',
    te: 'అన్ని వర్గాలు',
    bn: 'সব বিভাগ',
    ta: 'அனைத்து வகைகளும்'
  },
  mic_test_menu: {
    en: '3-Second Microphone Test',
    or: '୩-ସେକେଣ୍ଡ ମାଇକ୍ରୋଫୋନ୍ ପରୀକ୍ଷା',
    hi: '3-सेकंड माइक्रोफ़ोन परीक्षण',
    te: '3-సెకన్ల మైక్రోఫోన్ పరీక్ష',
    bn: '৩-সেকেন্ড মাইক্রোফোন পরীক্ষা',
    ta: '3-வினாடி மைக்ரோஃபோன் சோதனை'
  },
  mic_test_menu_btn: {
    en: 'Test Mic (3s)',
    or: 'ମାଇକ୍ ଯାଞ୍ଚ (୩ ସେ.)',
    hi: 'माइक जांचें (3 से.)',
    te: 'మైక్ పరీక్ష (3 సె.)',
    bn: 'মাইক পরীক্ষা (৩ সে.)',
    ta: 'மைக் சோதனை (3 வி.)'
  },
  mic_test_title: {
    en: '3-Second Microphone Check',
    or: '୩-ସେକେଣ୍ଡ ମାଇକ୍ରୋଫୋନ୍ ଯାଞ୍ଚ',
    hi: '3-सेकंड माइक्रोफ़ोन जांच',
    te: '3-సెకన్ల మైక్రోఫోన్ తనిఖీ',
    bn: '৩-সেকেন্ড মাইক্রোফোন পরীক্ষা',
    ta: '3-வினாடி மைக்ரோஃபோன் சோதனை'
  },
  voice_privacy_note: {
    en: 'Mic stops automatically after speaking • Never stays on in background',
    or: 'କହିବା ପରେ ମାଇକ୍ ଆପେ ଆପେ ବନ୍ଦ ହୁଏ • ବ୍ୟାକଗ୍ରାଉଣ୍ଡରେ ଚାଲୁ ରହେ ନାହିଁ',
    hi: 'बोलने के बाद माइक अपने आप बंद हो जाता है • बैकग्राउंड में चालू नहीं रहता',
    te: 'మాట్లాడిన తర్వాత మైక్ ఆటోమేటిక్‌గా ఆగిపోతుంది',
    bn: 'কথা বলার পর মাইক নিজে থেকেই বন্ধ হয়ে যায়',
    ta: 'பேசிய பிறகு மைக் தானாகவே நின்றுவிடும்'
  },
  mic_test_desc: {
    en: 'Tap the button below and speak "Jai Kisan" or your crop name for 3 seconds to verify your phone microphone.',
    or: 'ତଳ ବଟନ୍ ଦବାଇ ୩ ସେକେଣ୍ଡ ପାଇଁ "ଜୟ କିଷାନ" କିମ୍ବା ଆପଣଙ୍କ ଫସଲର ନାମ କୁହନ୍ତୁ।',
    hi: 'नीचे बटन दबाएं और अपने फ़ोन माइक की जांच के लिए 3 सेकंड तक "जय किसान" या अपनी फसल का नाम बोलें।',
    te: 'క్రింది బటన్ నొక్కి 3 సెకన్ల పాటు మాట్లాడి మీ మైక్‌ను పరీక్షించండి.',
    bn: 'নিচের বোতামে ট্যাপ করে ৩ সেকেন্ড কথা বলে আপনার মাইক পরীক্ষা করুন।',
    ta: 'கீழே உள்ள பொத்தானைத் தட்டி 3 வினாடிகள் பேசி மைக்கைச் சோதிக்கவும்.'
  },
  weather_alert_btn: {
    en: 'Weather Alert',
    or: 'ପାଣିପାଗ ସତର୍କତା',
    hi: 'मौसम चेतावनी',
    te: 'వాతావరణ హెచ్చరిక',
    bn: 'আবহাওয়া সতর্কতা',
    ta: 'வானிலை எச்சரிக்கை'
  },
  rain_expected_today: {
    en: 'Rain Expected · {prob}%',
    or: 'ଆଜି ବର୍ଷା ହେବ · {prob}%',
    hi: 'आज बारिश होगी · {prob}%',
    te: 'ఈరోజు వర్షం పడుతుంది · {prob}%',
    bn: 'আজ বৃষ্টি হবে · {prob}%',
    ta: 'இன்று மழை பெய்யும் · {prob}%'
  },
  no_rain_today: {
    en: 'No Rain Today',
    or: 'ଆଜି ବର୍ଷା ନାହିଁ',
    hi: 'आज बारिश नहीं',
    te: 'ఈరోజు వర్షం లేదు',
    bn: 'আজ বৃষ্টি নেই',
    ta: 'இன்று மழை இல்லை'
  },
  checking_weather: {
    en: 'Checking...',
    or: 'ଯାଞ୍ଚ କରୁଛି...',
    hi: 'जांच जारी है...',
    te: 'తనిఖీ చేస్తోంది...',
    bn: 'যাচাই করা হচ্ছে...',
    ta: 'சரிபார்க்கிறது...'
  },
  weather_unavailable: {
    en: 'Weather Unavailable',
    or: 'ପାଣିପାଗ ଉପଲବ୍ଧ ନାହିଁ',
    hi: 'मौसम उपलब्ध नहीं',
    te: 'వాతావరణం అందుబాటులో లేదు',
    bn: 'আবহাওয়া উপলব্ধ নয়',
    ta: 'வானிலை கிடைக்கவில்லை'
  },
  voice_i_am_listening: {
    en: 'I am listening...',
    or: 'ମୁଁ ଶୁଣୁଛି... କୁହନ୍ତୁ',
    hi: 'मैं सुन रहा हूँ... बोलिए',
    te: 'నేను వింటున్నాను... మాట్లాడండి',
    bn: 'আমি শুনছি... বলুন',
    ta: 'நான் கேட்கிறேன்... பேசுங்கள்'
  },
  mic_test_pass: {
    en: 'Microphone works clearly! You can now use Voice Commands.',
    or: 'ମାଇକ୍ରୋଫୋନ୍ ସଫଳତାର ସହ କାମ କରୁଛି! ଏବେ ଆପଣ କଣ୍ଠ ନିର୍ଦ୍ଦେଶ ବ୍ୟବହାର କରିପାରିବେ।',
    hi: 'माइक्रोफ़ोन बिल्कुल सही काम कर रहा है! अब आप वॉइस कमांड का उपयोग कर सकते हैं।',
    te: 'మైక్రోఫోన్ స్పష్టంగా పనిచేస్తోంది!',
    bn: 'মাইক্রোফোন স্পষ্টভাবে কাজ করছে!',
    ta: 'மைக்ரோஃபோன் தெளிவாக வேலை செய்கிறது!'
  },
  mic_test_fail_quiet: {
    en: 'I could not hear you clearly. Please hold the phone close and speak slowly.',
    or: 'ମୁଁ ଆପଣଙ୍କ କଥା ସ୍ପଷ୍ଟ ଶୁଣିପାରିଲି ନାହିଁ। ଦୟାକରି ଫୋନ୍ ପାଖରେ ଧରି ଧୀରେ କୁହନ୍ତୁ।',
    hi: 'मैं आपकी आवाज़ साफ़ नहीं सुन सका। कृपया फ़ोन पास रखें और धीरे बोलें।',
    te: 'మీ మాట స్పష్టంగా వినిపించలేదు. ఫోన్ దగ్గరగా ఉంచి నెమ్మదిగా మాట్లాడండి.',
    bn: 'আমি আপনার কথা স্পষ্ট শুনতে পাইনি। ফোনটি কাছে ধরে ধীরে বলুন।',
    ta: 'உங்கள் குரல் தெளிவாகக் கேட்கவில்லை. போனை அருகில் வைத்து மெதுவாகப் பேசுங்கள்.'
  },
  voice_mic_denied_title: {
    en: 'Microphone permission is blocked or denied',
    or: 'ମାଇକ୍ରୋଫୋନ୍ ଅନୁମତି ବନ୍ଦ ଅଛି (Blocked)',
    hi: 'माइक्रोफ़ोन की अनुमति बंद (Blocked) है',
    te: 'మైక్రోఫోన్ అనుమతి నిరాకరించబడింది',
    bn: 'মাইক্রোফোন অনুমতি ব্লক করা আছে',
    ta: 'மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டுள்ளது'
  },
  voice_mic_steps_android: {
    en: 'Android Chrome: Tap the lock icon next to the address bar → Permissions → Microphone → Allow.',
    or: 'ଆଣ୍ଡ୍ରଏଡ୍ (Android Chrome): ଉପର ଠିକଣା ବାର୍ ପାଖରେ ଥିବା ତାଲା (🔒) ଚିହ୍ନ ଦବାନ୍ତୁ → Permissions → Microphone → Allow କରନ୍ତୁ।',
    hi: 'Android Chrome: ऊपर एड्रेस बार के पास ताला (🔒) आइकन दबाएं → Permissions → Microphone → Allow करें।',
    te: 'Android Chrome: అడ్రస్ బార్ పక్కన ఉన్న లాక్ (🔒) చిహ్నాన్ని నొక్కండి → Permissions → Microphone → Allow.',
    bn: 'Android Chrome: অ্যাড্রেস বারের পাশে লক (🔒) আইকনে ট্যাপ করুন → Permissions → Microphone → Allow।',
    ta: 'Android Chrome: முகவரிப் பட்டியின் அருகிலுள்ள பூட்டு (🔒) சின்னத்தைத் தட்டவும் → Microphone → Allow.'
  },
  voice_mic_steps_iphone: {
    en: 'iPhone Safari: Tap "aA" or settings icon in the address bar → Website Settings → Microphone → Allow.',
    or: 'ଆଇଫୋନ୍ (iPhone Safari): ଠିକଣା ବାରରେ "aA" ଦବାନ୍ତୁ → Website Settings → Microphone → Allow କରନ୍ତୁ।',
    hi: 'iPhone Safari: एड्रेस बार में "aA" दबाएं → Website Settings → Microphone → Allow करें।',
    te: 'iPhone Safari: అడ్రస్ బార్‌లో "aA" నొక్కండి → Website Settings → Microphone → Allow.',
    bn: 'iPhone Safari: অ্যাড্রেস বারে "aA" ট্যাপ করুন → Website Settings → Microphone → Allow।',
    ta: 'iPhone Safari: முகவரிப் பட்டியில் "aA" தட்டவும் → Website Settings → Microphone → Allow.'
  },
  voice_mic_steps_desktop: {
    en: 'Computer / Desktop: Click the site settings icon in the browser URL bar and allow Microphone.',
    or: 'କମ୍ପ୍ୟୁଟର (Desktop): ବ୍ରାଉଜର୍ ଠିକଣା ବାରରେ ସେଟିଂସ୍ ଚିହ୍ନ ଦବାଇ ମାଇକ୍ରୋଫୋନ୍ Allow କରନ୍ତୁ।',
    hi: 'कंप्यूटर (Desktop): ब्राउज़र एड्रेस बार में सेटिंग्स आइकन पर क्लिक करें और माइक्रोफ़ोन Allow करें।',
    te: 'కంప్యూటర్: బ్రౌజర్ అడ్రస్ బార్‌లో సెట్టింగ్స్ చిహ్నాన్ని క్లిక్ చేసి మైక్రోఫోన్ అనుమతించండి.',
    bn: 'কম্পিউটার: ব্রাউজারের অ্যাড্রেস বারে সেটিংস আইকনে ক্লিক করে মাইক্রোফোন Allow করুন।',
    ta: 'கணினி: உலாவி முகவரிப் பட்டியில் உள்ள அமைப்புகள் சின்னத்தைக் கிளிக் செய்து மைக்கை அனுமதிக்கவும்.'
  },
  voice_mic_not_found: {
    en: 'No microphone was found, or the microphone is currently in use by another app.',
    or: 'କୌଣସି ମାଇକ୍ରୋଫୋନ୍ ମିଳିଲା ନାହିଁ କିମ୍ବା ମାଇକ୍ ଅନ୍ୟ କୌଣସି ଆପ୍ ଦ୍ୱାରା ବ୍ୟବহୃତ ହେଉଛି।',
    hi: 'कोई माइक्रोफ़ोन नहीं मिला, या माइक्रोफ़ोन किसी अन्य ऐप द्वारा उपयोग किया जा रहा है।',
    te: 'మైక్రోఫోన్ కనుగొనబడలేదు లేదా మరొక యాప్‌లో ఉపయోగించబడుతోంది.',
    bn: 'কোনো মাইক্রোফোন পাওয়া যায়নি বা অন্য অ্যাপে ব্যবহৃত হচ্ছে।',
    ta: 'மைக்ரோஃபோன் கண்டறியப்படவில்லை அல்லது অন্য செயலியில் பயன்பாட்டில் உள்ளது.'
  },
  voice_mic_insecure_frame: {
    en: 'Microphone requires a secure HTTPS connection or frame permission.',
    or: 'ମାଇକ୍ରୋଫୋନ୍ ପାଇଁ ସୁରକ୍ଷିତ ସଂଯୋଗ (HTTPS) ଓ ଅନୁମତି ଆବଶ୍ୟକ।',
    hi: 'माइक्रोफ़ोन के लिए सुरक्षित HTTPS कनेक्शन और अनुमति आवश्यक है।',
    te: 'మైక్రోఫోన్ కోసం సురక్షిత HTTPS కనెక్షన్ అవసరం.',
    bn: 'মাইক্রোফোনের জন্য নিরাপদ HTTPS সংযোগ প্রয়োজন।',
    ta: 'மைக்ரோஃபோனுக்கு பாதுகாப்பான HTTPS இணைப்பு தேவை.'
  },
  voice_commands_tab: {
    en: 'Voice Commands',
    or: 'କଣ୍ଠ ନିର୍ଦ୍ଦେଶ (Commands)',
    hi: 'वॉइस कमांड',
    te: 'వాయిస్ కమాండ్స్',
    bn: 'ভয়েস কমান্ড',
    ta: 'குரல் கட்டளைகள்'
  },
  voice_ask_question_tab: {
    en: 'Ask Farming Question',
    or: 'ଚାଷ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ',
    hi: 'खेती का सवाल पूछें',
    te: 'వ్యవసాయ ప్రశ్న అడగండి',
    bn: 'চাষের প্রশ্ন জিজ্ঞাসা করুন',
    ta: 'விவசாய கேள்வி கேளுங்கள்'
  },
  voice_spoke_other_lang_prompt: {
    en: 'You spoke in {langName}. Switch app language to {langName}?',
    or: 'ଆପଣ {langName} ରେ କହିଲେ। ଆପ୍ ଭାଷା {langName} କୁ ବଦଳାଇବେ କି?',
    hi: 'आपने {langName} में बोला। क्या ऐप की भाषा {langName} में बदलें?',
    te: 'మీరు {langName} లో మాట్లాడారు. యాప్ భాషను {langName} కు మార్చాలా?',
    bn: 'আপনি {langName}-এ কথা বলেছেন। অ্যাপের ভাষা কি {langName}-এ পরিবর্তন করবেন?',
    ta: 'நீங்கள் {langName} மொழியில் பேசினீர்கள். செயலி மொழியை மாற்றவா?'
  },
  voice_yes_btn: {
    en: 'Yes',
    or: 'ହଁ',
    hi: 'हाँ',
    te: 'అవును',
    bn: 'হ্যাঁ',
    ta: 'ஆம்'
  },
  voice_no_btn: {
    en: 'No',
    or: 'ନା',
    hi: 'नहीं',
    te: 'కాదు',
    bn: 'না',
    ta: 'இல்லை'
  },
  voice_thinking: {
    en: 'Thinking...',
    or: 'ବୁଝୁଛି ଓ ଉତ୍ତର ଖୋଜୁଛି...',
    hi: 'सोच रहा हूँ...',
    te: 'ఆలోచిస్తోంది...',
    bn: 'ভাবছি...',
    ta: 'யோசிக்கிறது...'
  },
  voice_did_you_mean: {
    en: 'Did you mean:',
    or: 'ଆପଣ ଏହା ଚାହୁଁଛନ୍ତି କି:',
    hi: 'क्या आपका मतलब यह है:',
    te: 'మీ ఉద్దేశ్యం ఇదేనా:',
    bn: 'আপনি কি এটি বোঝাতে চেয়েছেন:',
    ta: 'நீங்கள் இதைக் குறிப்பிட்டீர்களா:'
  },
  voice_ask_placeholder: {
    en: 'Tap the mic or type your farming question here...',
    or: 'ମାଇକ୍ ଦବାଇ କୁହନ୍ତୁ କିମ୍ବା ଏଠାରେ ଆପଣଙ୍କ ଚାଷ ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ...',
    hi: 'माइक दबाकर बोलें या यहाँ अपना खेती का सवाल लिखें...',
    te: 'మైక్ నొక్కండి లేదా మీ వ్యవసాయ ప్రశ్నను ఇక్కడ టైప్ చేయండి...',
    bn: 'মাইকে ট্যাপ করুন বা আপনার চাষের প্রশ্ন এখানে লিখুন...',
    ta: 'மைக்கைத் தட்டவும் அல்லது உங்கள் விவசாயக் கேள்வியை இங்கே தட்டச்சு செய்யவும்...'
  },
  voice_did_i_hear_correctly: {
    en: 'Did I hear your question correctly? You can edit it below before sending:',
    or: 'ମୁଁ ଆପଣଙ୍କ ପ୍ରଶ୍ନ ଠିକ୍ ଶୁଣିଛି କି? ପଠାଇବା ପୂର୍ବରୁ ତଳେ ଦେଖନ୍ତୁ ବା ବଦଳାନ୍ତୁ:',
    hi: 'क्या मैंने आपका सवाल सही सुना? भेजने से पहले आप इसे नीचे सुधार सकते हैं:',
    te: 'నేను మీ ప్రశ్నను సరిగ్గా విన్నానా? పంపే ముందు సవరించవచ్చు:',
    bn: 'আমি কি আপনার প্রশ্ন ঠিক শুনেছি? পাঠানোর আগে নিচে সম্পাদনা করতে পারেন:',
    ta: 'உங்கள் கேள்வியை சரியாகக் கேட்டேனா? அனுப்பும் முன் திருத்தலாம்:'
  },
  voice_ask_send_btn: {
    en: 'Get Farming Answer',
    or: 'କୃଷି ଉତ୍ତର ପାଆନ୍ତୁ',
    hi: 'कृषि उत्तर प्राप्त करें',
    te: 'సమాధానం పొందండి',
    bn: 'উত্তর পান',
    ta: 'பதில் பெறுக'
  },
  voice_offline_msg: {
    en: 'You are currently offline. Basic commands work offline, or you can save your voice question for when internet returns.',
    or: 'ଆପଣ ବର୍ତ୍ତମାନ ଅଫଲାଇନ୍ ଅଛନ୍ତି। ଆପଣଙ୍କ କଣ୍ଠ ପ୍ରଶ୍ନ ସେଭ୍ କରନ୍ତୁ, ଇଣ୍ଟରନେଟ୍ ଆସିଲେ ଉତ୍ତର ମିଳିବ।',
    hi: 'आप अभी ऑफ़लाइन हैं। अपना वॉइस सवाल सेव करें, इंटरनेट आने पर उत्तर मिलेगा।',
    te: 'మీరు ప్రస్తుతం ఆఫ్‌లైన్‌లో ఉన్నారు. మీ వాయిస్ ప్రశ్నను సేవ్ చేయవచ్చు.',
    bn: 'আপনি বর্তমানে অফলাইনে আছেন। আপনার ভয়েস প্রশ্নটি সেভ করে রাখতে পারেন।',
    ta: 'நீங்கள் தற்போது ஆஃப்லைனில் உள்ளீர்கள். உங்கள் குரல் கேள்வியைச் சேமிக்கலாம்.'
  },
  voice_save_offline_clip_btn: {
    en: 'Record & Save Question for Later',
    or: 'ପ୍ରଶ୍ନ ରେକର୍ଡ କରି ସେଭ୍ ରଖନ୍ତୁ',
    hi: 'सवाल रिकॉर्ड करें और बाद के लिए सेव करें',
    te: 'ప్రశ్నను రికార్డ్ చేసి సేవ్ చేయండి',
    bn: 'প্রশ্ন রেকর্ড করে সেভ রাখুন',
    ta: 'கேள்வியைப் பதிவுசெய்து சேமிக்கவும்'
  },
  voice_offline_clip_saved: {
    en: 'Your voice question is saved on this phone and will be answered automatically when internet returns.',
    or: 'ଆପଣଙ୍କ କଣ୍ଠ ପ୍ରଶ୍ନ ଫୋନରେ ସେଭ୍ ହେଲା। ଇଣ୍ଟରନେଟ୍ ଆସିଲେ ସ୍ୱୟଂଚାଳିତ ଭାବେ ଉତ୍ତର ମିଳିବ।',
    hi: 'आपका वॉइस सवाल फ़ोन में सेव हो गया है और इंटरनेट आने पर अपने आप उत्तर मिलेगा।',
    te: 'మీ వాయిస్ ప్రశ్న ఫోన్‌లో సేవ్ చేయబడింది.',
    bn: 'আপনার ভয়েস প্রশ্ন ফোনে সেভ করা হয়েছে।',
    ta: 'உங்கள் குரல் கேள்வி போனில் சேமிக்கப்பட்டது.'
  },
  voice_no_speech_5s: {
    en: 'No speech was heard in the first 5 seconds. Please tap the mic and speak right away.',
    or: 'ପ୍ରଥମ ୫ ସେକେଣ୍ଡରେ କୌଣସି କଥା ଶୁଣାଗଲା ନାହିଁ। ଦୟାକରି ମାଇକ୍ ଦବାଇ ତୁରନ୍ତ କୁହନ୍ତୁ।',
    hi: 'पहले 5 सेकंड में कोई आवाज़ नहीं सुनाई दी। कृपया माइक दबाएं और तुरंत बोलें।',
    te: 'మొదటి 5 సెకన్లలో మాట వినిపించలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.',
    bn: 'প্রথম ৫ সেকেন্ডে কোনো কথা শোনা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
    ta: 'முதல் 5 வினாடிகளில் எந்தப் பேச்சும் கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்.'
  },
  voice_quality_unclear: {
    en: 'I could not hear you clearly. Please hold the phone close and speak slowly.',
    or: 'ମୁଁ ଆପଣଙ୍କ କଥା ସ୍ପଷ୍ଟ ଶୁଣିପାରିଲି ନାହିଁ। ଦୟାକରି ଫୋନ୍ ପାଖରେ ଧରି ଧୀରେ କୁହନ୍ତୁ।',
    hi: 'मैं आपकी आवाज़ साफ़ नहीं सुन सका। कृपया फ़ोन पास रखें और धीरे बोलें।',
    te: 'మీ మాట స్పష్టంగా వినిపించలేదు. ఫోన్ దగ్గరగా ఉంచి నెమ్మదిగా మాట్లాడండి.',
    bn: 'আমি আপনার কথা স্পষ্ট শুনতে পাইনি। ফোনটি কাছে ধরে ধীরে বলুন।',
    ta: 'உங்கள் குரல் தெளிவாகக் கேட்கவில்லை. போனை அருகில் வைத்து மெதுவாகப் பேசுங்கள்.'
  },
  voice_all_engines_failed: {
    en: 'Could not transcribe audio right now. Please tap a quick button below or type your question.',
    or: 'ବର୍ତ୍ତମାନ କଣ୍ଠ ଚିହ୍ନଟ ହୋଇପାରିଲା ନାହିଁ। ଦୟାକରି ତଳ ବଟନ୍ ବାଛନ୍ତୁ କିମ୍ବା ଲେଖନ୍ତୁ।',
    hi: 'अभी आवाज़ पहचानी नहीं जा सकी। कृपया नीचे दिए गए बटन चुनें या टाइप करें।',
    te: 'ఆడియోను గుర్తించలేకపోయాము. దయచేసి క్రింది బటన్‌ను ఎంచుకోండి.',
    bn: 'অডিও চেনা যায়নি। নিচের বোতাম বেছে নিন বা টাইপ করুন।',
    ta: 'குரலை அடையாளம் காண முடியவில்லை. கீழே உள்ள பொத்தானைத் தேர்ந்தெடுக்கவும்.'
  },
  voice_tts_not_available: {
    en: 'Voice for this language is not available on this phone.',
    or: 'ଏହି ଫୋନରେ ଓଡ଼ିଆ କଣ୍ଠ (TTS Voice) ଉପଲବ୍ଧ ନାହିଁ।',
    hi: 'इस फ़ोन पर इस भाषा की आवाज़ उपलब्ध नहीं है।',
    te: 'ఈ ఫోన్‌లో ఈ భాషకు వాయిస్ అందుబాటులో లేదు.',
    bn: 'এই ফোনে এই ভাষার ভয়েস উপলব্ধ নেই।',
    ta: 'இந்த போனில் இந்த மொழிக்கான குரல் இல்லை.'
  },
  home_greeting_default_farmer: {
    en: 'Farmer Friend',
    or: 'କୃଷକ ବନ୍ଧୁ',
    hi: 'किसान भाई',
    te: 'రైతు సోదరా',
    bn: 'কৃষক ভাই',
    ta: 'உழவர் தோழரே'
  },
  menu_my_id_card: {
    en: 'My Farmer ID Card',
    or: 'ମୋ କୃଷକ ପରିଚୟ ପତ୍ର',
    hi: 'मेरा किसान पहचान पत्र',
    te: 'నా రైతు గుర్తింపు కార్డు',
    bn: 'আমার কৃষক আইডি কার্ড',
    ta: 'எனது விவசாயி அடையாள அட்டை'
  },
  menu_my_account: {
    en: 'My Account & Profile',
    or: 'ମୋ ଆକାଉଣ୍ଟ ଓ ପ୍ରୋଫାଇଲ୍',
    hi: 'मेरा खाता और प्रोफ़ाइल',
    te: 'నా ఖాతా & ప్రొఫైల్',
    bn: 'আমার অ্যাকাউন্ট ও প্রোফাইল',
    ta: 'எனது கணக்கு & சுயவிவரம்'
  },
  menu_request_correction: {
    en: 'Request Address / GPS Correction',
    or: 'ଠିକଣା / GPS ସଂଶୋଧନ ଅନୁରୋଧ',
    hi: 'पता / GPS सुधार अनुरोध',
    te: 'చిరునామా / GPS సవరణ అభ్యర్థన',
    bn: 'ঠিকানা / GPS সংশোধনের অনুরোধ',
    ta: 'முகவரி / GPS திருத்தக் கோரிக்கை'
  },
  menu_my_crops_field: {
    en: 'My Crops & Field Size',
    or: 'ମୋ ଫସଲ ଓ ଜମିର ପରିମାଣ',
    hi: 'मेरी फसलें और खेत का आकार',
    te: 'నా పంటలు & పొలం విస్తీర్ణం',
    bn: 'আমার ফসল ও জমির পরিমাণ',
    ta: 'எனது பயிர்கள் & நில அளவு'
  },
  menu_language: {
    en: 'Change Language',
    or: 'ଭାଷା ବଦଳାନ୍ତୁ',
    hi: 'भाषा बदलें',
    te: 'భాష మార్చండి',
    bn: 'ভাষা পরিবর্তন করুন',
    ta: 'மொழியை மாற்றவும்'
  },
  menu_replay_training: {
    en: 'Replay App Training',
    or: 'ଆପ୍ ବ୍ୟବହାର ତାଲିମ ପୁଣି ଦେଖନ୍ତୁ',
    hi: 'ऐप प्रशिक्षण फिर से देखें',
    te: 'యాప్ శిక్షణ మళ్ళీ చూడండి',
    bn: 'অ্যাপ প্রশিক্ষণ পুনরায় দেখুন',
    ta: 'செயலி பயிற்சியை மீண்டும் பார்க்கவும்'
  },
  menu_notifications_permissions: {
    en: 'Permissions & Location',
    or: 'ଅନୁମତି ଓ ସ୍ଥାନ ସେଟିଂସ୍',
    hi: 'अनुमतियां और स्थान सेटिंग्स',
    te: 'అనుమతులు & లొకేషన్',
    bn: 'অনুমতি ও অবস্থান সেটিংস',
    ta: 'அனுமதிகள் & இருப்பிடம்'
  },
  menu_emergency_contact: {
    en: 'Emergency Contact & 108',
    or: 'ଜରୁରୀକାଳୀନ ଯୋଗାଯୋଗ ଓ ୧୦୮',
    hi: 'आपातकालीन संपर्क और 108',
    te: 'అత్యవసర సంప్రదింపు & 108',
    bn: 'জরুরি যোগাযোগ ও ১০৮',
    ta: 'அவசர தொடர்பு & 108'
  },
  menu_help_report: {
    en: 'Help & Kisan Call Centre',
    or: 'ସହାୟତା ଓ କିଷାନ କଲ୍ ସେଣ୍ଟର',
    hi: 'सहायता और किसान कॉल सेंटर',
    te: 'సహాయం & కిసాన్ కాల్ సెంటర్',
    bn: 'সহায়তা ও কিষাণ কল সেন্টার',
    ta: 'உதவி & கிசான் அழைப்பு மையம்'
  },
  menu_privacy_delete: {
    en: 'Privacy & Data Security',
    or: 'ଗୋପନୀୟତା ଓ ତଥ୍ୟ ସୁରକ୍ଷା',
    hi: 'गोपनीयता और डेटा सुरक्षा',
    te: 'గోప్యత & డేటా భద్రత',
    bn: 'গোপনীয়তা ও তথ্য সুরক্ষা',
    ta: 'தனியுரிமை & தரவு பாதுகாப்பு'
  },
  menu_about: {
    en: 'About Krushak Bani Odisha',
    or: 'କୃଷକ ବାଣୀ ଓଡ଼ିଶା ବିଷୟରେ',
    hi: 'कृषक वाणी ओडिशा के बारे में',
    te: 'కృషక్ వాణి ఒడిశా గురించి',
    bn: 'কৃষক বাণী ওড়িশা সম্পর্কে',
    ta: 'கிருஷக் வாணி ஒடிசா பற்றி'
  },
  menu_sign_out: {
    en: 'Sign Out',
    or: 'ଲଗ୍ ଆଉଟ୍ କରନ୍ତୁ',
    hi: 'लॉग आउट करें',
    te: 'సైన్ అవుట్ చేయండి',
    bn: 'সাইন আউট করুন',
    ta: 'வெளியேறு'
  },
  photo_label: {
    en: 'Farmer Photo',
    or: 'କୃଷକଙ୍କ ଫଟୋ',
    hi: 'किसान की फोटो',
    te: 'రైతు ఫోటో',
    bn: 'কৃষকের ছবি',
    ta: 'விவசாயி புகைப்படம்'
  },
  field_size_value_label: {
    en: 'Field Size Value',
    or: 'ଜମିର ପରିମାଣ ସଂଖ୍ୟା',
    hi: 'खेत का आकार संख्या',
    te: 'పొలం విస్తీర్ణం విలువ',
    bn: 'জমির পরিমাণ সংখ্যা',
    ta: 'நில அளவு மதிப்பு'
  },
  field_size_unit_label: {
    en: 'Unit',
    or: 'ଏକକ',
    hi: 'इकाई',
    te: 'యూనిట్',
    bn: 'একক',
    ta: 'அலகு'
  },
  bigha_katha_prompt: {
    en: 'Approx Acres',
    or: 'ଆନୁମାନିକ ଏକର',
    hi: 'अनुमानित एकड़',
    te: 'సుమారు ఎకరాలు',
    bn: 'আনুমানিক একর',
    ta: 'சுமார் ஏக்கர்'
  },
  land_own: {
    en: 'Own Land',
    or: 'ନିଜ ଜମି',
    hi: 'अपनी ज़मीन',
    te: 'సొంత భూమి',
    bn: 'নিজের জমি',
    ta: 'சொந்த நிலம்'
  },
  land_tenant: {
    en: 'Tenant Farmer',
    or: 'ଭାଗ / ଲିଜ୍ ଚାଷୀ',
    hi: 'किरायेदार / पट्टेदार किसान',
    te: 'కౌలు రైతు',
    bn: 'বর্গা চাষী',
    ta: 'குத்தகை விவசாயி'
  },
  land_sharecropper: {
    en: 'Sharecropper',
    or: 'ଭାଗଚାଷୀ',
    hi: 'बटाईदार',
    te: 'వాటాదారు',
    bn: 'ভাগচাষী',
    ta: 'பங்கு விவசாயி'
  },
  emergency_contact_name: {
    en: 'Emergency Contact Name',
    or: 'ଜରୁରୀକାଳୀନ ଯୋଗାଯୋଗ ବ୍ୟକ୍ତିଙ୍କ ନାମ',
    hi: 'आपातकालीन संपर्क व्यक्ति का नाम',
    te: 'అత్యవసర సంప్రదింపు పేరు',
    bn: 'জরুরি যোগাযোগের নাম',
    ta: 'அவசர தொடர்பு பெயர்'
  },
  emergency_contact_phone: {
    en: 'Emergency Contact Phone',
    or: 'ଜରୁରୀକାଳୀନ ଫୋନ୍ ନମ୍ବର',
    hi: 'आपातकालीन फ़ोन नंबर',
    te: 'అత్యవసర ఫోన్ నంబర్',
    bn: 'জরুরি ফোন নম্বর',
    ta: 'அவசர தொலைபேசி எண்'
  },
  perm_location_title: {
    en: 'Location (GPS)',
    or: 'ସ୍ଥାନ (GPS)',
    hi: 'स्थान (GPS)',
    te: 'లొకేషన్ (GPS)',
    bn: 'অবস্থান (GPS)',
    ta: 'இருப்பிடம் (GPS)'
  },
  snakebite_108_btn: {
    en: 'Call 108 Ambulance',
    or: '୧୦୮ ଆମ୍ବୁଲାନ୍ସକୁ କଲ୍ କରନ୍ତୁ',
    hi: '108 एम्बुलेंस को कॉल करें',
    te: '108 అంబులెన్స్‌కు కాల్ చేయండి',
    bn: '১০৮ অ্যাম্বুলেন্সে কল করুন',
    ta: '108 ஆம்புலன்ஸை அழைக்கவும்'
  },
  consent_photo_checkbox: {
    en: 'Save my photo on my Farmer ID card',
    or: 'ମୋ କୃଷକ ପରିଚୟ ପତ୍ରରେ ମୋ ଫଟୋ ସେଭ୍ କରନ୍ତୁ',
    hi: 'मेरे किसान पहचान पत्र पर मेरी फोटो सेव करें',
    te: 'నా రైతు ID కార్డుపై నా ఫోటో సేవ్ చేయండి',
    bn: 'আমার কৃষক আইডি কার্ডে আমার ছবি সেভ করুন',
    ta: 'எனது விவசாயி அடையாள அட்டையில் புகைப்படத்தைச் சேமிக்கவும்'
  },
  delete_account_confirm_title: {
    en: 'Remove Account Data from Phone?',
    or: 'ଫୋନରୁ ଆକାଉଣ୍ଟ ତଥ୍ୟ ହଟାଇବେ କି?',
    hi: 'फ़ोन से खाता डेटा हटाएं?',
    te: 'ఫోన్ నుండి ఖాతా డేటాను తొలగించాలా?',
    bn: 'ফোন থেকে অ্যাকাউন্টের তথ্য মুছবেন?',
    ta: 'போனிலிருந்து கணக்கு தரவை நீக்கவா?'
  },
  delete_account_confirm_desc: {
    en: 'This clears your local phone copy. You can restore anytime with OTP.',
    or: 'ଏହା ଫୋନର ସ୍ଥାନୀୟ କପି ହଟାଇଦେବ। ଆପଣ ଯେକୌଣସି ସମୟରେ OTP ଦ୍ୱାରା ପୁଣି ଲଗ୍ ଇନ୍ କରିପାରିବେ।',
    hi: 'यह आपके फ़ोन की लोकल कॉपी साफ़ कर देगा। आप कभी भी OTP से लॉग इन कर सकते हैं।',
    te: 'ఇది ఫోన్‌లోని లోకల్ కాపీని తొలగిస్తుంది.',
    bn: 'এটি ফোনের লোকাল কপি মুছে দেবে।',
    ta: 'இது போனில் உள்ள நகலை நீக்கும்.'
  },
  delete_account_confirm_btn: {
    en: 'Confirm & Sign Out',
    or: 'ନିଶ୍ଚିତ କରନ୍ତୁ ଓ ଲଗ୍ ଆଉଟ୍ କରନ୍ତୁ',
    hi: 'पुष्टि करें और साइन आउट करें',
    te: 'నిర్ధారించి సైన్ అవుట్ చేయండి',
    bn: 'নিশ্চিত করুন ও সাইন আউট করুন',
    ta: 'உறுதிசெய்து வெளியேறு'
  },

  // ==========================================================================
  // NEW "GET THE APP" FLOATING BUTTON & QR / SHARE / INSTALL MODAL
  // ==========================================================================
  get_app_btn: {
    en: 'Get App',
    or: 'ଆପ୍ ପାଆନ୍ତୁ',
    hi: 'ऐप प्राप्त करें',
    te: 'యాప్ పొందండి',
    bn: 'অ্যাপ পান',
    ta: 'செயலியைப் பெறுக'
  },
  get_app_modal_title: {
    en: 'Get Krushak Bani Odisha App',
    or: 'କୃଷକ ବାଣୀ ଓଡ଼ିଶା ଆପ୍ ପାଆନ୍ତୁ',
    hi: 'कृषक वाणी ओडिशा ऐप प्राप्त करें',
    te: 'కృషక్ వాణి ఒడిశా యాప్ పొందండి',
    bn: 'কৃষক বাণী ওড়িশা অ্যাপ পান',
    ta: 'கிருஷக் வாணி ஒடிசா செயலியைப் பெறுங்கள்'
  },
  get_app_modal_subtitle: {
    en: 'Scan the QR code or open the link',
    or: 'QR କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ କିମ୍ବା ଲିଙ୍କ୍ ଖୋଲନ୍ତୁ',
    hi: 'QR कोड स्कैन करें या लिंक खोलें',
    te: 'QR కోడ్‌ను స్కాన్ చేయండి లేదా లింక్‌ను తెరవండి',
    bn: 'QR কোড স্ক্যান করুন অথবা লিঙ্কটি খুলুন',
    ta: 'QR குறியீட்டை ஸ்கேன் செய்யவும் அல்லது இணைப்பைத் திறக்கவும்'
  },
  copy_link_btn: {
    en: 'Copy Link',
    or: 'ଲିଙ୍କ୍ କପି କରନ୍ତୁ',
    hi: 'लिंक कॉपी करें',
    te: 'లింక్ కాపీ చేయండి',
    bn: 'লিঙ্ক কপি করুন',
    ta: 'இணைப்பை நகலெடு'
  },
  link_copied_toast: {
    en: 'Copied ✓',
    or: 'ନକଲ ହେଲା ✓',
    hi: 'कॉपी हो गया ✓',
    te: 'కాపీ అయింది ✓',
    bn: 'কপি হয়েছে ✓',
    ta: 'நகலெடுக்கப்பட்டது ✓'
  },
  share_app_btn: {
    en: 'Share',
    or: 'ଶେୟାର କରନ୍ତୁ',
    hi: 'शेयर करें',
    te: 'షేర్ చేయండి',
    bn: 'শেয়ার করুন',
    ta: 'பகிரவும்'
  },
  install_app_btn: {
    en: 'Download / Install',
    or: 'ଡାଉନଲୋଡ୍ / ଇନଷ୍ଟଲ୍ କରନ୍ତୁ',
    hi: 'डाउनलोड / इंस्टॉल करें',
    te: 'డౌన్‌లోడ్ / ఇన్‌స్టాల్ చేయండి',
    bn: 'ডাউনলোড / ইনস্টল করুন',
    ta: 'பதிவிறக்கம் / நிறுவவும்'
  },
  ios_install_hint: {
    en: 'On iPhone Safari: Tap Share (⎋) → Add to Home Screen',
    or: 'ଆଇଫୋନ୍ Safari ରେ: Share (⎋) → Add to Home Screen ଦବାନ୍ତୁ',
    hi: 'iPhone Safari पर: Share (⎋) → Add to Home Screen दबाएं',
    te: 'iPhone Safariలో: Share (⎋) → Add to Home Screen నొక్కండి',
    bn: 'iPhone Safari-তে: Share (⎋) → Add to Home Screen ট্যাপ করুন',
    ta: 'iPhone Safari-ல்: Share (⎋) → Add to Home Screen தட்டவும்'
  },
  android_install_hint: {
    en: 'Tip: In Chrome, tap the 3-dot menu (⋮) → Install app / Add to Home screen',
    or: 'ସୂଚନା: Chrome ରେ ଉପର ୩-ବିନ୍ଦୁ ମେନୁ (⋮) ଦବାଇ "Install app" ବା "Add to Home screen" ବାଛନ୍ତୁ',
    hi: 'सुझाव: Chrome में ऊपर 3-बिंदु मेनू (⋮) दबाकर "Install app" या "Add to Home screen" चुनें',
    te: 'సూచన: Chromeలో 3-చుక్కల మెనూ (⋮) నొక్కి "Install app" ఎంచుకోండి',
    bn: 'পরামর্শ: Chrome-এ ৩-ডট মেনু (⋮) ট্যাপ করে "Install app" বেছে নিন',
    ta: 'குறிப்பு: Chrome-ல் 3-புள்ளி মেনু (⋮) தட்டி "Install app" தேர்ந்தெடுக்கவும்'
  },

  // ==========================================================================
  // ACCURATE LOCATION, GOOGLE MAPS / LEAFLET PIN & REVERSE GEOCODING
  // ==========================================================================
  accuracy_badge: {
    en: 'Accuracy: ±{meters} m',
    or: 'ସଠିକତା: ±{meters} ମି.',
    hi: 'सटीकता: ±{meters} मी.',
    te: 'ఖచ్చితత్వం: ±{meters} మీ.',
    bn: 'নির্ভুলতা: ±{meters} মি.',
    ta: 'துல்லியம்: ±{meters} மீ.'
  },
  location_not_exact_warn: {
    en: 'Location is not exact. Please confirm on the map.',
    or: 'ସ୍ଥାନ ସଠିକ୍ ନୁହେଁ। ଦୟାକରି ମାନଚିତ୍ରରେ ପିନ୍ ଘୁଞ୍ଚାଇ ନିଶ୍ଚିତ କରନ୍ତୁ।',
    hi: 'स्थान सटीक नहीं है। कृपया मानचित्र पर पिन की पुष्टि करें।',
    te: 'లొకేషన్ ఖచ్చితంగా లేదు. దయచేసి మ్యాప్‌లో నిర్ధారించండి.',
    bn: 'অবস্থান সঠিক নয়। অনুগ্রহ করে মানচিত্রে নিশ্চিত করুন।',
    ta: 'இருப்பிடம் துல்லியமாக இல்லை. வரைபடத்தில் உறுதிப்படுத்தவும்.'
  },
  confirm_location_btn: {
    en: 'Confirm location',
    or: 'ସ୍ଥାନ ନିଶ୍ଚିତ କରନ୍ତୁ',
    hi: 'स्थान की पुष्टि करें',
    te: 'లొకేషన్ నిర్ధారించండి',
    bn: 'অবস্থান নিশ্চিত করুন',
    ta: 'இருப்பிடத்தை உறுதிப்படுத்தவும்'
  },
  update_location_btn: {
    en: 'Update location',
    or: 'ସ୍ଥାନ ଅପଡେଟ୍ କରନ୍ତୁ',
    hi: 'स्थान अपडेट करें',
    te: 'లొకేషన్ అప్‌డేట్ చేయండి',
    bn: 'অবস্থান আপডেট করুন',
    ta: 'இருப்பிடத்தைப் புதுப்பிக்கவும்'
  },
  drag_pin_instruction: {
    en: 'Drag the pin or tap anywhere on the map to mark your exact farm / village location.',
    or: 'ଆପଣଙ୍କ ସଠିକ୍ ଗାଁ ବା ଚାଷ ଜମି ଚିହ୍ନଟ କରିବା ପାଇଁ ମାନଚିତ୍ରରେ ପିନ୍ ଟାଣନ୍ତୁ କିମ୍ବା ଟ୍ୟାପ୍ କରନ୍ତୁ।',
    hi: 'अपने सटीक गांव या खेत का स्थान चुनने के लिए मानचित्र पर पिन खींचें या टैप करें।',
    te: 'మీ గ్రామం లేదా పొలం స్థానాన్ని గుర్తించడానికి మ్యాప్‌పై పిన్‌ను లాగండి లేదా నొక్కండి.',
    bn: 'আপনার সঠিক গ্রাম বা জমির অবস্থান চিহ্নিত করতে মানচিত্রে পিন টানুন বা ট্যাপ করুন।',
    ta: 'உங்கள் துல்லியமான கிராமம் அல்லது நிலத்தைக் குறிக்க வரைபடத்தில் பின்னை இழுக்கவும்.'
  },
  location_perm_denied_odia_guide: {
    en: 'Location permission is blocked. To enable: Tap the lock icon (🔒) in the browser bar → Permissions → Location → Allow, or select your District, Block, and Village manually below.',
    or: 'ସ୍ଥାନ (GPS) ଅନୁମତି ବନ୍ଦ ଅଛି। ଚାଲୁ କରିବା ପାଇଁ: ବ୍ରାଉଜର୍ ଉପର ତାଲା ଚିହ୍ନ (🔒) ଦବାନ୍ତୁ → Permissions → Location → Allow କରନ୍ତୁ, କିମ୍ବା ତଳ ତାଲିକାରୁ ଆପଣଙ୍କ ଜିଲ୍ଲା, ବ୍ଲକ୍ ଓ ଗାଁ ବାଛନ୍ତୁ।',
    hi: 'स्थान (GPS) अनुमति बंद है। चालू करने के लिए: ब्राउज़र बार में ताला (🔒) दबाएं → Location → Allow करें, या नीचे अपना जिला, ब्लॉक और गांव चुनें।',
    te: 'లొకేషన్ అనుమతి నిరాకరించబడింది. బ్రౌజర్‌లో Location → Allow చేయండి లేదా క్రింద మీ జిల్లా, బ్లాక్, గ్రామం ఎంచుకోండి.',
    bn: 'অবস্থান (GPS) অনুমতি ব্লক করা আছে। ব্রাউজারে Location → Allow করুন অথবা নিচে আপনার জেলা, ব্লক ও গ্রাম বেছে নিন।',
    ta: 'இருப்பிட அனுமதி மறுக்கப்பட்டுள்ளது. உலாவியில் Location → Allow செய்யவும் அல்லது கீழே আপনার மாவட்டம், வட்டாரம், கிராமத்தைத் தேர்ந்தெடுக்கவும்.'
  },


  farm_calendar_shortcut: {
    en: '7-Day Farm Calendar',
    or: '୭ ଦିନିଆ କୃଷି କ୍ୟାଲେଣ୍ଡର',
    hi: '७ दिन का कृषि कैलेंडर',
    te: '7-రోజుల వ్యవసాయ క్యాలెండర్',
    bn: '৭ দিনের কৃষি ক্যালেন্ডার',
    ta: '7-நாள் வேளாண் நாட்காட்டி'
  },
  open_meteo_badge: {
    en: 'Open-Meteo Live',
    or: 'ସଜୀବ ପାଣିପାଗ ତଥ୍ୟ',
    hi: 'ओपन-मेटियो लाइव',
    te: 'ఓపెన్-మెటియో లైవ్',
    bn: 'ওপেন-মেটিও লাইভ',
    ta: 'நேரடி வானிலை'
  },
  OPEN_METEO_BADGE: {
    en: 'Open-Meteo Live',
    or: 'ସଜୀବ ପାଣିପାଗ ତଥ୍ୟ',
    hi: 'ओपन-मेटियो लाइव',
    te: 'ఓపెన్-మెటియో లైవ్',
    bn: 'ওপেন-মেটিও লাইভ',
    ta: 'நேரடி வானிலை'
  },
  low_wind_rain_sub: {
    en: 'Low rain & gentle wind — safe for spraying today.',
    or: 'କମ୍ ବର୍ଷା ଓ ଧୀର ପବନ — ଆଜି ସ୍ପ୍ରେ କରିବା ପାଇଁ ସୁରକ୍ଷିତ।',
    hi: 'कम बारिश और हल्की हवा — आज स्प्रे करने के लिए सुरक्षित।',
    te: 'తక్కువ వర్షం & తేలికపాటి గాలి — ఈరోజు స్ప్రే చేయడానికి సురక్షితం.',
    bn: 'কম বৃষ্টি ও মৃদু বাতাস — আজ স্প্রে করার জন্য নিরাপদ।',
    ta: 'குறைந்த மழை மற்றும் மிதமான காற்று — இன்று தெளிக்க பாதுகாப்பானது.'
  },
  high_rain_wind_sub: {
    en: 'Rain chance {rain}% • Wind {wind} — wait before spraying.',
    or: 'ବର୍ଷା ସମ୍ଭାବନା {rain}% • ପବନ {wind} — ସ୍ପ୍ରେ କରିବା ପୂର୍ବରୁ ଅପେକ୍ଷା କରନ୍ତୁ।',
    hi: 'बारिश की संभावना {rain}% • हवा {wind} — स्प्रे करने से पहले प्रतीक्षा करें।',
    te: 'వర్షం అవకాశం {rain}% • గాలి {wind} — స్ప్రే చేసే ముందు వేచి ఉండండి.',
    bn: 'বৃষ্টির সম্ভাবনা {rain}% • বাতাস {wind} — স্প্রে করার আগে অপেক্ষা করুন।',
    ta: 'மழை வாய்ப்பு {rain}% • காற்று {wind} — தெளிக்கும் முன் காத்திருக்கவும்.'
  },

  view_action_btn: {
    en: 'View Alert',
    or: 'ସତର୍କତା ଦେଖନ୍ତୁ',
    hi: 'चेतावनी देखें',
    te: 'హెచ్చరిక చూడండి',
    bn: 'সতর্কতা দেখুন',
    ta: 'எச்சரிக்கையைப் பார்க்க'
  },

  ask_question_placeholder: {
    en: 'Type a follow-up question for the AI agent...',
    or: 'ଏଠାରେ ଆପଣଙ୍କ ପରବର୍ତ୍ତୀ ଚାଷ ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ...',
    hi: 'यहाँ अपना अगला कृषि प्रश्न लिखें...',
    te: 'మీ తదుపరి ప్రశ్నను ఇక్కడ టైప్ చేయండి...',
    bn: 'আপনার পরবর্তী প্রশ্ন এখানে লিখুন...',
    ta: 'உங்கள் அடுத்த கேள்வியை இங்கே தட்டச்சு செய்யவும்...'
  },
  call_status_completed: {
    en: 'Completed',
    or: 'ସମ୍ପୂର୍ଣ୍ଣ',
    hi: 'सफल',
    te: 'పూర్తయింది',
    bn: 'সম্পন্ন',
    ta: 'முடிந்தது'
  },
  call_status_rate_limited: {
    en: 'Rate Limited',
    or: 'ସୀମା ଶେଷ',
    hi: 'सीमा समाप्त',
    te: 'పరిమితి ముగిసింది',
    bn: 'সীমা শেষ',
    ta: 'வரம்பு முடிந்தது'
  },
  call_status_failed: {
    en: 'Failed',
    or: 'ବିଫଳ',
    hi: 'असफल',
    te: 'విఫలమైంది',
    bn: 'ব্যর্থ',
    ta: 'தோல்வி'
  },
  language_menu_label: {
    en: 'Select Language',
    or: 'ଭାଷା ବାଛନ୍ତୁ',
    hi: 'भाषा चुनें',
    te: 'భాషను ఎంచుకోండి',
    bn: 'ভাষা বেছে নিন',
    ta: 'மொழியைத் தேர்ந்தெடுக்கவும்'
  },
  gps_signal_unavailable_msg: {
    en: 'GPS signal is weak or unavailable. Please drag the pin on the map or select your District, Block, and Village manually below.',
    or: 'GPS ସିଗନାଲ୍ ଦୁର୍ବଳ ଅଛି। ଦୟାକରି ମାନଚିତ୍ରରେ ପିନ୍ ଘୁଞ୍ଚାନ୍ତୁ କିମ୍ବା ତଳୁ ଜିଲ୍ଲା, ବ୍ଲକ୍ ଓ ଗାଁ ବାଛନ୍ତୁ।',
    hi: 'GPS सिग्नल कमजोर है। कृपया मानचित्र पर पिन खींचें या नीचे से जिला, ब्लॉक और गांव चुनें।',
    te: 'GPS సిగ్నల్ బలహీనంగా ఉంది. దయచేసి మ్యాప్‌లో పిన్ లాగండి లేదా జిల్లా, బ్లాక్, గ్రామం ఎంచుకోండి.',
    bn: 'GPS সিগন্যাল দুর্বল। মানচিত্রে পিন টানুন বা নিচ থেকে জেলা, ব্লক ও গ্রাম বেছে নিন।',
    ta: 'GPS சிக்னல் பலவீனமாக உள்ளது. வரைபடத்தில் பின்னை நகர்த்தவும் அல்லது கீழே தேர்ந்தெடுக்கவும்.'
  },
  select_accurate_place_title: {
    en: 'Confirm Your Farm & Village Location',
    or: 'ଆପଣଙ୍କ ସଠିକ୍ ଗାଁ ଓ ଚାଷ ଜମି ସ୍ଥାନ ବାଛନ୍ତୁ',
    hi: 'अपने गांव और खेत का सटीक स्थान चुनें',
    te: 'మీ గ్రామం & పొలం స్థానాన్ని నిర్ధారించండి',
    bn: 'আপনার গ্রাম ও জমির সঠিক অবস্থান নির্বাচন করুন',
    ta: 'உங்கள் கிராமம் மற்றும் நிலத்தின் இடத்தை உறுதிப்படுத்தவும்'
  },
  select_accurate_place_subtitle: {
    en: 'Use GPS, drag the map pin, or choose District, Block & Village',
    or: 'GPS ବ୍ୟବହାର କରନ୍ତୁ, ମାନଚିତ୍ରରେ ପିନ୍ ଟାଣନ୍ତୁ କିମ୍ବା ଜିଲ୍ଲା, ବ୍ଲକ୍ ଓ ଗାଁ ବାଛନ୍ତୁ',
    hi: 'GPS का उपयोग करें, मानचित्र पिन खींचें या जिला, ब्लॉक व गांव चुनें',
    te: 'GPS ఉపయోగించండి, మ్యాప్ పిన్ లాగండి లేదా జిల్లా, బ్లాక్ & గ్రామం ఎంచుకోండి',
    bn: 'GPS ব্যবহার করুন, ম্যাপ পিন টানুন অথবা জেলা, ব্লক ও গ্রাম বেছে নিন',
    ta: 'GPS பயன்படுத்தவும், பின்னை நகர்த்தவும் அல்லது மாவட்டம், வட்டாரம், கிராமத்தைத் தேர்ந்தெடுக்கவும்'
  },
  selected_place_label: {
    en: 'Selected Location',
    or: 'ବଛାଯାଇଥିବା ସ୍ଥାନ',
    hi: 'चयनित स्थान',
    te: 'ఎంచుకున్న ప్రదేశం',
    bn: 'নির্বাচিত অবস্থান',
    ta: 'தேர்ந்தெடுக்கப்பட்ட இடம்'
  },
  detecting_best_gps: {
    en: 'Detecting GPS...',
    or: 'ସଠିକ୍ GPS ଖୋଜାଯାଉଛି...',
    hi: 'सटीक GPS खोजा जा रहा है...',
    te: 'GPS గుర్తిస్తోంది...',
    bn: 'GPS খোঁজা হচ্ছে...',
    ta: 'GPS கண்டறியப்படுகிறது...'
  },
  search_village_block_district: {
    en: 'Search village, block, or district name...',
    or: 'ଗାଁ, ବ୍ଲକ୍ କିମ୍ବା ଜିଲ୍ଲା ନାମ ଖୋଜନ୍ତୁ...',
    hi: 'गांव, ब्लॉक या जिले का नाम खोजें...',
    te: 'గ్రామం, బ్లాక్ లేదా జిల్లా పేరు వెతకండి...',
    bn: 'গ্রাম, ব্লক বা জেলার নাম খুঁজুন...',
    ta: 'கிராமம், வட்டாரம் அல்லது மாவட்ட பெயரைத் தேடுங்கள்...'
  },
  hospital_label: {
    en: '108 Hospital',
    or: '୧୦୮ ହସ୍ପିଟାଲ',
    hi: '108 अस्पताल',
    te: '108 ఆసుపత్రి',
    bn: '১০৮ হাসপাতাল',
    ta: '108 மருத்துவமனை'
  },
  chc_drone_label: {
    en: 'CHC / Drone',
    or: 'ଯନ୍ତ୍ରପାତି / ଡ୍ରୋନ୍ କେନ୍ଦ୍ର',
    hi: 'मशीनरी / ड्रोन केंद्र',
    te: 'యంత్రాల / డ్రోన్ కేంద్రం',
    bn: 'যন্ত্রপাতি / ড্রোন কেন্দ্র',
    ta: 'இயந்திர / ட்ரோன் மையம்'
  },
  kvk_soil_lab_label: {
    en: 'KVK / Soil Lab',
    or: 'କେଭିକେ (KVK) / ମାଟି ପରୀକ୍ଷା',
    hi: 'केवीके (KVK) / मिट्टी जांच',
    te: 'KVK / భూసార పరీక్ష',
    bn: 'KVK / মাটি পরীক্ষা',
    ta: 'KVK / மண் பரிசோதனை'
  },
  copied_link_toast: {
    en: 'Copied ✓',
    or: 'ନକଲ ହେଲା ✓',
    hi: 'कॉपी हो गया ✓',
    te: 'కాపీ అయింది ✓',
    bn: 'কপি হয়েছে ✓',
    ta: 'நகலெடுக்கப்பட்டது ✓'
  },
  install_or_download_btn: {
    en: 'Download / Install App',
    or: 'ଆପ୍ ଡାଉନଲୋଡ୍ / ଇନଷ୍ଟଲ୍ କରନ୍ତୁ',
    hi: 'ऐप डाउनलोड / इंस्टॉल करें',
    te: 'యాప్ డౌన్‌లోడ్ / ఇన్‌స్టాల్ చేయండి',
    bn: 'অ্যাপ ডাউনলোড / ইনস্টল করুন',
    ta: 'செயலியை பதிவிறக்கம் / நிறுவவும்'
  },
  app_already_installed: {
    en: 'App Installed on Device ✓',
    or: 'ଆପ୍ ଫୋନରେ ଇନଷ୍ଟଲ୍ ଅଛି ✓',
    hi: 'ऐप फ़ोन में इंस्टॉल है ✓',
    te: 'యాప్ ఇన్‌స్టాల్ చేయబడింది ✓',
    bn: 'অ্যাপ ফোনে ইনস্টল করা আছে ✓',
    ta: 'செயலி நிறுவப்பட்டுள்ளது ✓'
  },
  ios_install_instruction: {
    en: 'On iPhone Safari: Tap Share (⎋) → Add to Home Screen',
    or: 'ଆଇଫୋନ୍ Safari ରେ: Share (⎋) → Add to Home Screen ଦବାନ୍ତୁ',
    hi: 'iPhone Safari पर: Share (⎋) → Add to Home Screen दबाएं',
    te: 'iPhone Safariలో: Share (⎋) → Add to Home Screen నొక్కండి',
    bn: 'iPhone Safari-তে: Share (⎋) → Add to Home Screen ট্যাপ করুন',
    ta: 'iPhone Safari-ல்: Share (⎋) → Add to Home Screen தட்டவும்'
  },
  listen: {
    en: 'Listen',
    or: 'ଶୁଣନ୍ତୁ',
    hi: 'सुनें',
    te: 'వినండి',
    bn: 'শুনুন',
    ta: 'கேளுங்கள்'
  }
};

/**
 * Translate helper with English fallback and parameter interpolation
 */
export function t(
  key: string,
  lang: Language,
  params?: Record<string, string | number>
): string {
  const entry = TRANSLATIONS[key];
  let text = key;
  if (entry) {
    text = entry[lang] || entry.en || key;
  }
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return text;
}

/**
 * Comprehensive Odisha Towns, Districts & Blocks Fallback Dictionary (English -> Odia & Hindi)
 * Ensures place names returned by reverse geocoders or stored in profiles are always shown
 * in the selected language (e.g., "ଭୁବନେଶ୍ୱର, ଖୋର୍ଦ୍ଧା" instead of "Bhubaneswar, Khordha").
 */
const ODISHA_PLACE_DICTIONARY: Record<string, { or: string; hi: string }> = {
  odisha: { or: 'ଓଡ଼ିଶା', hi: 'ओडिशा' },
  orissa: { or: 'ଓଡ଼ିଶା', hi: 'ओडिशा' },
  india: { or: 'ଭାରତ', hi: 'भारत' },
  bhubaneswar: { or: 'ଭୁବନେଶ୍ୱର', hi: 'भुवनेश्वर' },
  khordha: { or: 'ଖୋର୍ଦ୍ଧା', hi: 'खोर्धा' },
  khurda: { or: 'ଖୋର୍ଦ୍ଧା', hi: 'खोर्धा' },
  cuttack: { or: 'କଟକ', hi: 'कटक' },
  'cuttack sadar': { or: 'କଟକ ସଦର', hi: 'कटक सदर' },
  kandarpur: { or: 'କନ୍ଦରପୁର', hi: 'कंदरपुर' },
  puri: { or: 'ପୁରୀ', hi: 'पुरी' },
  konark: { or: 'କୋଣାର୍କ', hi: 'कोणार्क' },
  pipili: { or: 'ପିପିଲି', hi: 'पिपिली' },
  nimapara: { or: 'ନିମାପଡ଼ା', hi: 'निमापड़ा' },
  satyabadi: { or: 'ସତ୍ୟବାଦୀ', hi: 'सत्यबादी' },
  jatni: { or: 'ଜଟଣୀ', hi: 'जटनी' },
  balianta: { or: 'ବାଲିଅନ୍ତା', hi: 'बालिअंता' },
  balipatna: { or: 'ବାଲିପାଟଣା', hi: 'बालिपाटना' },
  begunia: { or: 'ବେଗୁନିଆ', hi: 'बेगुनिया' },
  bolagarh: { or: 'ବୋଲଗଡ଼', hi: 'बोलगढ़' },
  tangi: { or: 'ଟାଙ୍ଗୀ', hi: 'टांगी' },
  banapur: { or: 'ବାଣପୁର', hi: 'बाणपुर' },
  chilika: { or: 'ଚିଲିକା', hi: 'चिल्का' },
  banki: { or: 'ବାଙ୍କୀ', hi: 'बांकी' },
  athagarh: { or: 'ଆଠଗଡ଼', hi: 'आठगढ़' },
  salipur: { or: 'ସାଲେପୁର', hi: 'सालेपुर' },
  niali: { or: 'ନିଆଳି', hi: 'नियाली' },
  tangi_choudwar: { or: 'ଟାଙ୍ଗୀ-ଚୌଦ୍ୱାର', hi: 'टांगी-चौद्वार' },
  choudwar: { or: 'ଚୌଦ୍ୱାର', hi: 'चौद्वार' },
  balasore: { or: 'ବାଲେଶ୍ୱର', hi: 'बालेश्वर' },
  baleswar: { or: 'ବାଲେଶ୍ୱର', hi: 'बालेश्वर' },
  remuna: { or: 'ରେମୁଣା', hi: 'रेमुना' },
  jaleswar: { or: 'ଜଳେଶ୍ୱର', hi: 'जलेश्वर' },
  soro: { or: 'ସୋର', hi: 'सोरो' },
  nilagiri: { or: 'ନୀଳଗିରି', hi: 'नीलगिरि' },
  bhadrak: { or: 'ଭଦ୍ରକ', hi: 'भद्रक' },
  basudevpur: { or: 'ବାସୁଦେବପୁର', hi: 'बासुदेवपुर' },
  chandbali: { or: 'ଚାନ୍ଦବାଲି', hi: 'चांदबाली' },
  dhamnagar: { or: 'ଧାମନଗର', hi: 'धामनगर' },
  kendrapara: { or: 'କେନ୍ଦ୍ରାପଡ଼ା', hi: 'केंद्रापड़ा' },
  pattamundai: { or: 'ପଟ୍ଟାମୁଣ୍ଡାଇ', hi: 'पट्टामुंडई' },
  aul: { or: 'ଆଳି', hi: 'आली' },
  rajnagar: { or: 'ରାଜନଗର', hi: 'राजनगर' },
  jagatsinghpur: { or: 'ଜଗତସିଂହପୁର', hi: 'जगतसिंहपुर' },
  paradeep: { or: 'ପାରାଦୀପ', hi: 'पारादीप' },
  paradip: { or: 'ପାରାଦୀପ', hi: 'पारादीप' },
  kujang: { or: 'କୁଜଙ୍ଗ', hi: 'कुजंग' },
  tirtol: { or: 'ତିର୍ତ୍ତୋଲ', hi: 'तिर्तोल' },
  jajpur: { or: 'ଯାଜପୁର', hi: 'जाजपुर' },
  vyasanagar: { or: 'ବ୍ୟାସନଗର', hi: 'व्यासनगर' },
  dharmasala: { or: 'ଧର୍ମଶାଳା', hi: 'धर्मशाला' },
  sukinda: { or: 'ସୁକିନ୍ଦା', hi: 'सुकिंदा' },
  ganjam: { or: 'ଗଞ୍ଜାମ', hi: 'गंजाम' },
  berhampur: { or: 'ବ୍ରହ୍ମପୁର', hi: 'ब्रह्मपुर' },
  brahmapur: { or: 'ବ୍ରହ୍ମପୁର', hi: 'ब्रह्मपुर' },
  chatrapur: { or: 'ଛତ୍ରପୁର', hi: 'छत्रपुर' },
  chhatrapur: { or: 'ଛତ୍ରପୁର', hi: 'छत्रपुर' },
  aska: { or: 'ଆସ୍କା', hi: 'आस्का' },
  bhanjanagar: { or: 'ଭଞ୍ଜନଗର', hi: 'भंजनगर' },
  gopalpur: { or: 'ଗୋପାଳପୁର', hi: 'गोपालपुर' },
  hilikatu: { or: 'ହିଞ୍ଜିଳିକାଟୁ', hi: 'हिंजिलिकाटु' },
  hinjilicut: { or: 'ହିଞ୍ଜିଳିକାଟୁ', hi: 'हिंजिलिकाटु' },
  gajapati: { or: 'ଗଜପତି', hi: 'गजपति' },
  paralakhemundi: { or: 'ପାରଳାଖେମୁଣ୍ଡି', hi: 'पारलाखेमुंडी' },
  mayurbhanj: { or: 'ମୟୂରଭଞ୍ଜ', hi: 'मयूरभंज' },
  baripada: { or: 'ବାରିପଦା', hi: 'बारीपदा' },
  rairangpur: { or: 'ରାଇରଙ୍ଗପୁର', hi: 'रायरंगपुर' },
  karanjia: { or: 'କରଞ୍ଜିଆ', hi: 'करंजिया' },
  udala: { or: 'ଉଦଳା', hi: 'उदला' },
  keonjhar: { or: 'କେନ୍ଦୁଝର', hi: 'केंदुझर' },
  kendujhar: { or: 'କେନ୍ଦୁଝର', hi: 'केंदुझर' },
  anandapur: { or: 'ଆନନ୍ଦପୁର', hi: 'आनंदपुर' },
  barbil: { or: 'ବଡ଼ବିଲ', hi: 'बड़बिल' },
  joda: { or: 'ଯୋଡ଼ା', hi: 'जोड़ा' },
  champua: { or: 'ଚମ୍ପୁଆ', hi: 'चम्पुआ' },
  sundargarh: { or: 'ସୁନ୍ଦରଗଡ଼', hi: 'सुंदरगढ़' },
  rourkela: { or: 'ରାଉରକେଲା', hi: 'राउरकेला' },
  rajgangpur: { or: 'ରାଜଗାଙ୍ଗପୁର', hi: 'राजगांगपुर' },
  bonai: { or: 'ବଣାଇ', hi: 'बonaई' },
  deogarh: { or: 'ଦେବଗଡ଼', hi: 'देवगढ़' },
  debagarh: { or: 'ଦେବଗଡ଼', hi: 'देवगढ़' },
  angul: { or: 'ଅନୁଗୋଳ', hi: 'अनुगुल' },
  anugul: { or: 'ଅନୁଗୋଳ', hi: 'अनुगुल' },
  talcher: { or: 'ତାଳଚେର', hi: 'तालचेर' },
  athmallik: { or: 'ଆଠମଲ୍ଲିକ', hi: 'आठमल्लिक' },
  chhendipada: { or: 'ଛେଣ୍ଡିପଦା', hi: 'छेंडीपदा' },
  dhenkanal: { or: 'ଢେଙ୍କାନାଳ', hi: 'ढेंकानाल' },
  kamakhyanagar: { or: 'କାମାକ୍ଷାନଗର', hi: 'कामाख्यानगर' },
  hindol: { or: 'ହିନ୍ଦୋଳ', hi: 'हिंदोल' },
  bhuban: { or: 'ଭୁବନ', hi: 'भुबन' },
  sambalpur: { or: 'ସମ୍ବଲପୁର', hi: 'संबलपुर' },
  burla: { or: 'ବୁର୍ଲା', hi: 'बुर्ला' },
  hirakud: { or: 'ହୀରାକୁଦ', hi: 'हीराकुद' },
  kuchinda: { or: 'କୁଚିଣ୍ଡା', hi: 'कुचिंडा' },
  rairakhol: { or: 'ରେଢ଼ାଖୋଲ', hi: 'रेढ़ाखोल' },
  bargarh: { or: 'ବରଗଡ଼', hi: 'बरगढ़' },
  padampur: { or: 'ପଦ୍ମପୁର', hi: 'पद्मपुर' },
  attabira: { or: 'ଅତାବିରା', hi: 'अताबिरा' },
  barpali: { or: 'ବରପାଲି', hi: 'बरपाली' },
  jharsuguda: { or: 'ଝାରସୁଗୁଡ଼ା', hi: 'झारसुगुड़ा' },
  brajarajnagar: { or: 'ବ୍ରଜରାଜନଗର', hi: 'ब्रजराजनगर' },
  belpahar: { or: 'ବେଲପାହାଡ଼', hi: 'बेलपहाड़' },
  subarnapur: { or: 'ସୁବର୍ଣ୍ଣପୁର', hi: 'सुबर्णपुर' },
  sonepur: { or: 'ସୋନପୁର', hi: 'सोनपुर' },
  binika: { or: 'ବିନିକା', hi: 'बिनिका' },
  tarbha: { or: 'ତରଭା', hi: 'तरभा' },
  bolangir: { or: 'ବଲାଙ୍ଗୀର', hi: 'बलांगीर' },
  balangir: { or: 'ବଲାଙ୍ଗୀର', hi: 'बलांगीर' },
  titilagarh: { or: 'ଟିଟିଲାଗଡ଼', hi: 'टिटिलागढ़' },
  patnagarh: { or: 'ପାଟଣାଗଡ଼', hi: 'पाटनागढ़' },
  kantabanji: { or: 'କଣ୍ଟାବାଞ୍ଜି', hi: 'कांटाबांजी' },
  nuapada: { or: 'ନୂଆପଡ଼ା', hi: 'नुआपड़ा' },
  khariar: { or: 'ଖଡ଼ିଆଳ', hi: 'खड़ियार' },
  komna: { or: 'କୋମନା', hi: 'कोमना' },
  kalahandi: { or: 'କଳାହାଣ୍ଡି', hi: 'कालाहांडी' },
  bhawanipatna: { or: 'ଭବାନୀପାଟଣା', hi: 'भवानीपाटना' },
  dharamgarh: { or: 'ଧର୍ମଗଡ଼', hi: 'धर्मगढ़' },
  junagarh: { or: 'ଜୁନାଗଡ଼', hi: 'जूनागढ़' },
  kesinga: { or: 'କେସିଙ୍ଗା', hi: 'केसिंगा' },
  boudh: { or: 'ବୌଦ୍ଧ', hi: 'बौध' },
  baudh: { or: 'ବୌଦ୍ଧ', hi: 'बौध' },
  kantamal: { or: 'କଣ୍ଟାମାଳ', hi: 'कंटामाल' },
  harabhanga: { or: 'ହରଭଙ୍ଗା', hi: 'हरभंगा' },
  nayagarh: { or: 'ନୟାଗଡ଼', hi: 'नयागढ़' },
  odagaon: { or: 'ଓଡ଼ଗାଁ', hi: 'ओड़गाँव' },
  khandapada: { or: 'ଖଣ୍ଡପଡ଼ା', hi: 'खंडपड़ा' },
  daspalla: { or: 'ଦଶପଲ୍ଲା', hi: 'दशपल्ला' },
  ranpur: { or: 'ରଣପୁର', hi: 'रणपुर' },
  kandhamal: { or: 'କନ୍ଧମାଳ', hi: 'कंधमाल' },
  phulbani: { or: 'ଫୁଲବାଣୀ', hi: 'फुलबानी' },
  balliguda: { or: 'ବାଲିଗୁଡ଼ା', hi: 'बालीगुड़ा' },
  g_udayagiri: { or: 'ଜି. ଉଦୟଗିରି', hi: 'जी. उदयगिरि' },
  rayagada: { or: 'ରାୟଗଡ଼ା', hi: 'रायगड़ा' },
  gunupur: { or: 'ଗୁଣୁପୁର', hi: 'गुणुपुर' },
  bissam_cuttack: { or: 'ବିଷମ କଟକ', hi: 'बिषम कटक' },
  koraput: { or: 'କୋରାପୁଟ', hi: 'कोरापुट' },
  jeypore: { or: 'ଜୟପୁର', hi: 'जयपुर' },
  sunabeda: { or: 'ସୁନାବେଡ଼ା', hi: 'सुनाबेड़ा' },
  kotpad: { or: 'କୋଟପାଡ଼', hi: 'कोटपाड़' },
  semiliguda: { or: 'ସେମିଳିଗୁଡ଼ା', hi: 'सेमिलीगुड़ा' },
  nabarangpur: { or: 'ନବରଙ୍ଗପୁର', hi: 'नबरंगपुर' },
  umarkote: { or: 'ଉମରକୋଟ', hi: 'उमरकोट' },
  malkangiri: { or: 'ମାଲକାନଗିରି', hi: 'मालकानगिरि' },
  chitrakonda: { or: 'ଚିତ୍ରକୋଣ୍ଡା', hi: 'चित्रकोंडा' },
  mathili: { or: 'ମାଥିଲି', hi: 'माथिली' }
};

/**
 * Translates any single place token or comma-separated place string (e.g. "Bhubaneswar, Khordha")
 * into Odia or Hindi when selected, using both ODISHA_PLACE_DICTIONARY and external lookups.
 */
export function translatePlaceName(
  rawPlace: string | undefined | null,
  lang: Language,
  dynamicDictionary?: Record<string, { or?: string; hi?: string }>
): string {
  if (!rawPlace) return '';
  if (lang === 'en') return rawPlace;

  const segments = rawPlace.split(',').map((s) => s.trim()).filter(Boolean);
  const translatedSegments = segments.map((seg) => {
    // Strip parenthetical English/Odia duplicates if present
    const cleanKey = seg
      .replace(/\(.*?\)/g, '')
      .replace(/\b(district|block|tehsil|tahasil|subdivision|municipality|gram panchayat)\b/gi, '')
      .trim()
      .toLowerCase();

    if (dynamicDictionary && dynamicDictionary[cleanKey]) {
      const match = dynamicDictionary[cleanKey];
      if (lang === 'or' && match.or) return match.or;
      if (lang === 'hi' && match.hi) return match.hi;
    }

    const dictMatch = ODISHA_PLACE_DICTIONARY[cleanKey];
    if (dictMatch) {
      if (lang === 'or') return dictMatch.or;
      if (lang === 'hi') return dictMatch.hi;
    }

    // Also check if any key in ODISHA_PLACE_DICTIONARY is contained in cleanKey
    for (const [k, val] of Object.entries(ODISHA_PLACE_DICTIONARY)) {
      if (cleanKey === k) {
        return lang === 'or' ? val.or : lang === 'hi' ? val.hi : seg;
      }
    }
    return seg;
  });

  // Deduplicate adjacent identical segments (e.g., if subdistrict and city both mapped to ଭୁବନେଶ୍ୱର)
  const deduped: string[] = [];
  for (const item of translatedSegments) {
    if (deduped[deduped.length - 1] !== item) {
      deduped.push(item);
    }
  }
  return deduped.join(', ');
}

/**
 * Translates common English crop names stored in profiles/history into Odia / Hindi / selected language
 */
const COMMON_CROP_TRANSLATIONS: Record<string, { or: string; hi: string; te?: string; bn?: string; ta?: string }> = {
  paddy: { or: 'ଧାନ', hi: 'धान', te: 'వరి', bn: 'ধান', ta: 'நெல்' },
  'paddy (rice)': { or: 'ଧାନ', hi: 'धान', te: 'వరి', bn: 'ধান', ta: 'நெல்' },
  rice: { or: 'ଧାନ', hi: 'धान', te: 'వరి', bn: 'ধান', ta: 'நெல்' },
  wheat: { or: 'ଗହମ', hi: 'गेहूँ', te: 'గోధుమ', bn: 'গম', ta: 'கோதுமை' },
  maize: { or: 'ମକା', hi: 'मक्का', te: 'మొక్కజొన్న', bn: 'ভুট্টা', ta: 'மக்காச்சோளம்' },
  ragi: { or: 'ମାଣ୍ଡିଆ', hi: 'रागी (मंडुआ)', te: 'రాగులు', bn: 'রাগি', ta: 'கேழ்வரகு' },
  'ragi (finger millet)': { or: 'ମାଣ୍ଡିଆ', hi: 'रागी (मंडुआ)', te: 'రాగులు', bn: 'রাগি', ta: 'கேழ்வரகு' },
  tomato: { or: 'ଟମାଟୋ (ବିଲାତି)', hi: 'टमाटर', te: 'టమాటా', bn: 'টমেটো', ta: 'தக்காளி' },
  brinjal: { or: 'ବାଇଗଣ', hi: 'बैंगन', te: 'వంకాయ', bn: 'বেগুন', ta: 'கத்திரிக்காய்' },
  potato: { or: 'ଆଳୁ', hi: 'आलू', te: 'బంగాళాదుంప', bn: 'আলু', ta: 'உருளைக்கிழங்கு' },
  okra: { or: 'ଭେଣ୍ଡି', hi: 'भिंडी', te: 'బెండకాయ', bn: 'ঢেঁড়স', ta: 'வெண்டைக்காய்' },
  'okra (bhendi)': { or: 'ଭେଣ୍ଡି', hi: 'भिंडी', te: 'బెండకాయ', bn: 'ঢেঁড়স', ta: 'வெண்டைக்காய்' },
  chilli: { or: 'ଲଙ୍କା', hi: 'मिर्च', te: 'మిరప', bn: 'লঙ্কা', ta: 'மிளகாய்' },
  'green chilli': { or: 'କଞ୍ଚା ଲଙ୍କା', hi: 'हरी मिर्च', te: 'పచ్చిమిర్చి', bn: 'কাঁচা লঙ্কা', ta: 'பச்சை மிளகாய்' },
  onion: { or: 'ପିଆଜ', hi: 'प्याज', te: 'ఉల్లిపాయ', bn: 'পেঁয়াজ', ta: 'வெங்காயம்' },
  garlic: { or: 'ରସୁଣ', hi: 'लहसुन', te: 'వెల్లుల్లి', bn: 'রসুন', ta: 'பூண்டு' },
  ginger: { or: 'ଅଦା', hi: 'अदरक', te: 'అల్లం', bn: 'আদা', ta: 'இஞ்சி' },
  turmeric: { or: 'ହଳଦୀ', hi: 'हल्दी', te: 'పసుపు', bn: 'হলুদ', ta: 'மஞ்சள்' },
  cauliflower: { or: 'ଫୁଲକୋବି', hi: 'फूलगोभी', te: 'కాలీఫ్లవర్', bn: 'ফুলকপি', ta: 'காலிஃபிளவர்' },
  cabbage: { or: 'ବନ୍ଧାକୋବି', hi: 'पत्तागोभी', te: 'క్యాబేజీ', bn: 'বাঁধাকপি', ta: 'முட்டைக்கோஸ்' },
  moong: { or: 'ମୁଗ', hi: 'मूंग', te: 'పెసలు', bn: 'মুগ ডাল', ta: 'பாசிப்பயறு' },
  'green gram (moong)': { or: 'ମୁଗ', hi: 'मूंग', te: 'పెసలు', bn: 'মুগ ডাল', ta: 'பாசிப்பயறு' },
  biri: { or: 'ବିରି', hi: 'उड़द', te: 'మినుములు', bn: 'কলাই ডাল', ta: 'உளுந்து' },
  'black gram (biri)': { or: 'ବିରି', hi: 'उड़द', te: 'మినుములు', bn: 'কলাই ডাল', ta: 'உளுந்து' },
  arhar: { or: 'ହରଡ଼', hi: 'अरहर (तूर)', te: 'కందులు', bn: 'অড়হর', ta: 'துவரை' },
  groundnut: { or: 'ଚିନାବାଦାମ', hi: 'मूंगफली', te: 'వేరుశనగ', bn: 'চিনাবাদাম', ta: 'நிலக்கடலை' },
  mustard: { or: 'ସୋରିଷ', hi: 'सरसों', te: 'ఆవాలు', bn: 'সরিষা', ta: 'கடுகு' },
  sesame: { or: 'ରାଶି', hi: 'तिल', te: 'నువ్వులు', bn: 'তিল', ta: 'எள்' },
  sunflower: { or: 'ସୂର୍ଯ୍ୟମୁଖୀ', hi: 'सूरजमुखी', te: 'పొద్దుతిరుగుడు', bn: 'সূর্যমুখী', ta: 'சூரியகாந்தி' },
  sugarcane: { or: 'ଆଖୁ', hi: 'गन्ना', te: 'చెరకు', bn: 'আখ', ta: 'கரும்பு' },
  cotton: { or: 'କପା', hi: 'कपास', te: 'పత్తి', bn: 'তুলা', ta: 'பருத்தி' },
  jute: { or: 'ଝୋଟ', hi: 'जूट', te: 'జనపనార', bn: 'পাট', ta: 'சணல்' },
  banana: { or: 'କଦଳୀ', hi: 'केला', te: 'అరటి', bn: 'কলা', ta: 'வாழை' },
  mango: { or: 'ଆମ୍ବ', hi: 'आम', te: 'మామిడి', bn: 'আম', ta: 'மாம்பழம்' },
  papaya: { or: 'ଅମୃତଭଣ୍ଡା', hi: 'पपीता', te: 'బొప్పాయి', bn: 'পেঁপে', ta: 'பப்பாளி' },
  coconut: { or: 'ନଡ଼ିଆ', hi: 'नारियल', te: 'కొబ్బరి', bn: 'নারকেল', ta: 'தேங்காய்' },
  mushroom: { or: 'ଛତୁ', hi: 'मशरूम', te: 'పుట్టగొడుగు', bn: 'মাশরুম', ta: 'காளான்' },
  'paddy straw mushroom': { or: 'ପାଳ ଛତୁ', hi: 'पुआल मशरूम', te: 'పుట్టగొడుగు', bn: 'খড় মাশরুম', ta: 'காளான்' },
  'oyster mushroom': { or: 'ଧିଙ୍ଗିରି ଛତୁ', hi: 'ऑयस्टर मशरूम', te: 'ఆయిస్టర్ మష్రూమ్', bn: 'অয়েস্টার মাশরুম', ta: 'சிப்பி காளான்' },
  vegetables: { or: 'ପନିପରିବା', hi: 'सब्जियां', te: 'కూరగాయలు', bn: 'শাকসবজি', ta: 'காய்கறிகள்' },
  pulses: { or: 'ଡାଲି ଜାତୀୟ ଫସଲ', hi: 'दलहन', te: 'పప్పుధాన్యాలు', bn: 'ডাল শস্য', ta: 'பயறு வகைகள்' }
};

export function translateCropName(rawCrop: string, lang: Language): string {
  if (!rawCrop || lang === 'en') return rawCrop;
  const key = rawCrop.trim().toLowerCase();
  const entry = COMMON_CROP_TRANSLATIONS[key];
  if (entry) {
    if (lang === 'or') return entry.or;
    if (lang === 'hi') return entry.hi;
    if (lang === 'te' && entry.te) return entry.te;
    if (lang === 'bn' && entry.bn) return entry.bn;
    if (lang === 'ta' && entry.ta) return entry.ta;
  }
  return rawCrop;
}

/**
 * Formats weather & farm units in the selected language (e.g., km/h -> କି.ମି./ଘଣ୍ଟା, °C -> °ସେ.)
 */
export function formatLocalizedUnit(
  value: number | string,
  unit: 'kmh' | 'temp_c' | 'meters' | 'acres' | 'km',
  lang: Language
): string {
  if (unit === 'kmh') {
    if (lang === 'or') return `${value} କି.ମି./ଘଣ୍ଟା`;
    if (lang === 'hi') return `${value} किमी/घंटा`;
    return `${value} km/h`;
  }
  if (unit === 'temp_c') {
    if (lang === 'or') return `${value}°ସେ.`;
    if (lang === 'hi') return `${value}°से.`;
    return `${value}°C`;
  }
  if (unit === 'meters') {
    if (lang === 'or') return `±${value} ମି.`;
    if (lang === 'hi') return `±${value} मी.`;
    return `±${value} m`;
  }
  if (unit === 'acres') {
    if (lang === 'or') return `${value} ଏକର`;
    if (lang === 'hi') return `${value} एकड़`;
    return `${value} Acres`;
  }
  if (unit === 'km') {
    if (lang === 'or') return `${value} କି.ମି.`;
    if (lang === 'hi') return `${value} किमी`;
    return `${value} km`;
  }
  return `${value}`;
}

