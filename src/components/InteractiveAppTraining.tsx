import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { t, SUPPORTED_LANGUAGES } from '../services/translations';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  CheckCircle2,
  Camera,
  ShieldCheck,
  ClipboardList,
  Calendar,
  PhoneCall,
  Users,
  Headphones,
  UserCheck,
  Sprout,
  CloudSun,
  AlertTriangle
} from 'lucide-react';

interface InteractiveAppTrainingProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onNavigateTo: (tabId: string) => void;
}

interface TrainingStep {
  id: string;
  targetTab: string;
  spotlightPosition: 'top' | 'center' | 'bottom';
  icon: React.ComponentType<{ className?: string }>;
  badgeEn: string;
  title: Record<Language, string>;
  caption: Record<Language, string>;
  sampleDataPreview: {
    label: string;
    detail: string;
    actionLabel?: string;
    actionResult?: string;
  };
}

const TRAINING_STEPS: TrainingStep[] = [
  {
    id: 'top_bar',
    targetTab: 'dashboard',
    spotlightPosition: 'top',
    icon: CloudSun,
    badgeEn: '1 / 9 • Top Bar & Live Weather',
    title: {
      en: 'Top Bar: Weather, District, Language & Menu',
      or: 'ଉପର ବାର୍: ପାଣିପାଗ, ଜିଲ୍ଲା, ଭାଷା ଓ ମେନୁ', // TO REVIEW
      hi: 'शीर्ष बार: मौसम, जिला, भाषा और मेनू', // TO REVIEW
      te: 'టాప్ బార్: వాతావరణం, జిల్లా, భాష & మెనూ', // TO REVIEW
      bn: 'উপরের বার: আবহাওয়া, জেলা, ভাষা ও মেনু', // TO REVIEW
      ta: 'மேல் பட்டை: வானிலை, மாவட்டம், மொழி & மெனு', // TO REVIEW
      ur: 'Top Bar: Weather, District, Language & Menu'
    },
    caption: {
      en: 'At the top of the screen, you can check live village temperature, rain probability, switch among 6 languages anytime, and open your account menu.',
      or: 'ସ୍କ୍ରିନ୍ ଉପର ଭାଗରେ ଆପଣ ଆଜିର ତାପମାତ୍ରା, ବର୍ଷା ସମ୍ଭାବନା ଦେଖିପାରିବେ, ୬ଟି ଭାଷା ବଦଳାଇପାରିବେ ଏବଂ ଆକାଉଣ୍ଟ ମେନୁ ଖୋଲିପାରିବେ।', // TO REVIEW
      hi: 'स्क्रीन के ऊपर आप लाइव तापमान, बारिश की संभावना देख सकते हैं, 6 भाषाओं में बदल सकते हैं और खाता मेनू खोल सकते हैं।', // TO REVIEW
      te: 'స్క్రీన్ పైన మీరు ఉష్ణోగ్రత, వర్ష సూచన చూడవచ్చు, 6 భాషలను మార్చుకోవచ్చు మరియు ఖాతా మెనూ తెరవవచ్చు.', // TO REVIEW
      bn: 'স্ক্রিনের উপরে আপনি তাপমাত্রা, বৃষ্টির সম্ভাবনা দেখতে পারেন, ৬টি ভাষা পরিবর্তন করতে পারেন এবং অ্যাকাউন্ট মেনু খুলতে পারেন।', // TO REVIEW
      ta: 'திரையின் மேற்பகுதியில் வெப்பநிலை, மழை வாய்ப்பு, 6 மொழிகள் மாற்றம் மற்றும் கணக்கு মெனுவைக் காணலாம்.', // TO REVIEW
      ur: 'At the top of the screen, you can check live weather and switch languages.'
    },
    sampleDataPreview: {
      label: 'Sample Top Bar Preview (Practice Only)',
      detail: 'Cuttack • 31°C • 20% Rain • Language: ଓଡ଼ିଆ / English / हिन्दी / తెలుగు / বাংলা / தமிழ்'
    }
  },
  {
    id: 'choose_crops',
    targetTab: 'dashboard',
    spotlightPosition: 'center',
    icon: Sprout,
    badgeEn: '2 / 9 • Choosing What You Grow',
    title: {
      en: 'Choosing What You Grow',
      or: 'ଆପଣଙ୍କ ଚାଷ ଫସଲ ବାଛିବା', // TO REVIEW
      hi: 'अपनी फसल चुनना', // TO REVIEW
      te: 'మీరు పండించే పంటలను ఎంచుకోవడం', // TO REVIEW
      bn: 'আপনার চাষের ফসল নির্বাচন', // TO REVIEW
      ta: 'நீங்கள் பயிரிடும் பயிர்களைத் தேர்ந்தெடுத்தல்', // TO REVIEW
      ur: 'Choosing What You Grow'
    },
    caption: {
      en: 'Your selected crops (such as Paddy, Tomato, Brinjal, Pulses) customize your advisories. You can switch crops anytime inside each advisory tool.',
      or: 'ଆପଣ ବାଛିଥିବା ଫସଲ (ଯଥା ଧାନ, ଟମାଟୋ, ବାଇଗଣ, ମୁଗ) ଅନୁସାରେ ପରାମର୍ଶ ମିଳିଥାଏ। ଆପଣ ଯେକୌଣସି ସମୟରେ ଫସଲ ବଦଳାଇ ପାରିବେ।', // TO REVIEW
      hi: 'आपकी चुनी हुई फसलें (जैसे धान, टमाटर, बैंगन, मूंग) के अनुसार सलाह मिलती है। आप किसी भी समय फसल बदल सकते हैं।', // TO REVIEW
      te: 'మీరు ఎంచుకున్న పంటల (వరి, టమాటా, వంకాయ, పెసలు) ఆధారంగా సలహాలు అందుతాయి.', // TO REVIEW
      bn: 'আপনার নির্বাচিত ফসল (যেমন ধান, টমেটো, বেগুন, মুগ) অনুযায়ী পরামর্শ দেওয়া হয়।', // TO REVIEW
      ta: 'நீங்கள் தேர்ந்தெடுத்த பயிர்களுக்கு (நெல், தக்காளி, கத்திரிக்காய்) ஏற்ப ஆலோசனை வழங்கப்படும்.', // TO REVIEW
      ur: 'Your selected crops customize your advisories.'
    },
    sampleDataPreview: {
      label: 'Sample Crop Selection (Practice Mode)',
      detail: '🌾 Paddy (Swarna) • 🍅 Tomato • 🍆 Brinjal • 🟢 Moong'
    }
  },
  {
    id: 'crop_doctor',
    targetTab: 'crop_doctor',
    spotlightPosition: 'center',
    icon: Camera,
    badgeEn: '3 / 9 • Crop Doctor Practice',
    title: {
      en: 'Crop Doctor: Practice with a Sample Leaf Photo',
      or: 'ଶସ୍ୟ ଡାକ୍ତର: ନମୁନା ପତ୍ର ଫଟୋ ସହ ଅଭ୍ୟାସ କରନ୍ତୁ', // TO REVIEW
      hi: 'फसल डॉक्टर: नमूना पत्ती फोटो के साथ अभ्यास करें', // TO REVIEW
      te: 'పంట డాక్టర్: నమూనా ఆకు ఫోటోతో ప్రాక్టీస్ చేయండి', // TO REVIEW
      bn: 'ফসল ডাক্তার: নমুনা পাতার ছবি দিয়ে অনুশীলন করুন', // TO REVIEW
      ta: 'பயிர் மருத்துவர்: மாதிரி இலைப் படத்துடன் பயிற்சி செய்க', // TO REVIEW
      ur: 'Crop Doctor: Practice with a Sample Leaf Photo'
    },
    caption: {
      en: 'Take a photo of an affected leaf to identify diseases like Rice Blast or Blight. Tap the button below to test with a sample leaf photo in Practice Mode!',
      or: 'ରୋଗାକ୍ରାନ୍ତ ପତ୍ରର ଫଟୋ ଉଠାଇ ଧାନ ବ୍ଲାଷ୍ଟ ବା ପତ୍ରପୋଡ଼ା ରୋଗ ଚିହ୍ନଟ କରନ୍ତୁ। ତଳେ ଥିବା ବଟନ୍ ଦବାଇ ନମୁନା ପତ୍ର ପରୀକ୍ଷା କରନ୍ତୁ!', // TO REVIEW
      hi: 'बीमार पत्ती की फोटो लेकर धान ब्लास्ट या झुलसा रोग की पहचान करें। नीचे दिए बटन को दबाकर नमूना पत्ती से अभ्यास करें!', // TO REVIEW
      te: 'ఆకు ఫోటో తీసి వరి బ్లాస్ట్ లేదా తెగుళ్లను గుర్తించండి. దిగువ బటన్‌ను నొక్కి నమూనా ఆకుతో పరీక్షించండి!', // TO REVIEW
      bn: 'আক্রান্ত পাতার ছবি তুলে ধানের ব্লাস্ট বা ধসা রোগ শনাক্ত করুন। নিচের বোতামে ট্যাপ করে নমুনা পাতা পরীক্ষা করুন!', // TO REVIEW
      ta: 'பாதிக்கப்பட்ட இலையைப் படம் எடுத்து நோயைக் கண்டறியலாம். கீழே உள்ள பொத்தானை அழுத்தி மாதிரி இலையைச் சோதிக்கவும்!', // TO REVIEW
      ur: 'Take a photo of an affected leaf to identify diseases.'
    },
    sampleDataPreview: {
      label: 'Sample Leaf Photo: Paddy Leaf with Spindle Lesions',
      detail: 'Tap below to run a safe practice diagnosis without saving to your history.',
      actionLabel: '🔍 Test Sample Paddy Leaf Photo',
      actionResult: '✓ Practice Diagnosis: Rice Blast (Magnaporthe oryzae) – 94% match! Recommended: Tricyclazole 75% WP @ 0.6g/L.'
    }
  },
  {
    id: 'spray_water_fertiliser',
    targetTab: 'pesticide',
    spotlightPosition: 'center',
    icon: ShieldCheck,
    badgeEn: '4 / 9 • Spray, Water & Fertiliser Advice',
    title: {
      en: 'Spray, Water & Fertiliser Advice',
      or: 'କୀଟନାଶକ ସ୍ପ୍ରେ, ଜଳସେଚନ ଓ ସାର ପରାମର୍ଶ', // TO REVIEW
      hi: 'कीटनाशक स्प्रे, सिंचाई और उर्वरक सलाह', // TO REVIEW
      te: 'పురుగుమందుల స్ప్రే, నీరు & ఎరువుల సలహా', // TO REVIEW
      bn: 'কীটনাশক স্প্রে, সেচ ও সার পরামর্শ', // TO REVIEW
      ta: 'பூச்சிக்கொல்லி, நீர் மற்றும் உர ஆலோசனை', // TO REVIEW
      ur: 'Spray, Water & Fertiliser Advice'
    },
    caption: {
      en: 'Get OUAT-approved pesticide dosages per litre and per acre, irrigation schedules checked against rain forecasts, and NPK fertiliser calculations.',
      or: 'ଓୟୁଏଟି ଅନୁମୋଦିତ କୀଟନାଶକ ମାତ୍ରା (ଲିଟର ଓ ଏକର ପ୍ରତି), ବର୍ଷା ଅନୁଯାୟୀ ଜଳସେଚନ ସମୟ ଏବଂ ୟୁରିଆ-ଡିଏପି-ପୋଟାସ ହିସାବ ପାଆନ୍ତୁ।', // TO REVIEW
      hi: 'OUAT प्रमाणित कीटनाशक मात्रा, बारिश के अनुसार सिंचाई समय और यूरिया-डीएपी-पोटाश की सटीक गणना प्राप्त करें।', // TO REVIEW
      te: 'OUAT ఆమోదించిన మోతాదులు, వర్ష సూచన ప్రకారం నీటి తడి మరియు NPK ఎరువుల లెక్కలు పొందండి.', // TO REVIEW
      bn: 'OUAT অনুমোদিত কীটনাশকের মাত্রা, বৃষ্টির পূর্বাভাস অনুযায়ী সেচ এবং ইউরিয়া-ডিএপি-পটাশ সারের হিসাব পান।', // TO REVIEW
      ta: 'OUAT பரிந்துரைத்த பூச்சிக்கொல்லி அளவு, மழைக்கு ஏற்ப నీர்ப்பாசனம் மற்றும் உர அளவுகளைப் பெறுங்கள்.', // TO REVIEW
      ur: 'Get OUAT-approved dosages, water schedules, and NPK calculations.'
    },
    sampleDataPreview: {
      label: 'Sample Advisory (Practice Mode)',
      detail: 'Spray Window: Favourable (Wind 8 km/h, Rain 10%) • Basal Dose: DAP 55 kg + MOP 27 kg/acre'
    }
  },
  {
    id: 'spray_log',
    targetTab: 'spray_log',
    spotlightPosition: 'center',
    icon: ClipboardList,
    badgeEn: '5 / 9 • Spray Log & Safety Warning',
    title: {
      en: 'Spray Log: Track Chemical Sprays Safely',
      or: 'ସ୍ପ୍ରେ ଲଗ୍: କୀଟନାଶକ ସ୍ପ୍ରେ ହିସାବ ଓ ସତର୍କତା', // TO REVIEW
      hi: 'स्प्रे लॉग: छिड़काव का रिकॉर्ड और सुरक्षा चेतावनी', // TO REVIEW
      te: 'స్ప్రే లాగ్: పురుగుమందుల పిచికారీ రికార్డు', // TO REVIEW
      bn: 'স্প্রে লগ: কীটনাশক স্প্রে-র হিসাব ও সতর্কতা', // TO REVIEW
      ta: 'தெளிப்புப் பதிவேடு (Spray Log)', // TO REVIEW
      ur: 'Spray Log: Track Chemical Sprays Safely'
    },
    caption: {
      en: 'Record every pesticide spray. If you spray again within 7 days, the app warns you to prevent crop toxicity and chemical overdose.',
      or: 'ପ୍ରତ୍ୟେକ ସ୍ପ୍ରେ ର ତାରିଖ ଓ ମାତ୍ରା ଲେଖି ରଖନ୍ତୁ। ୭ ଦିନ ଭିତରେ ପୁଣି ସ୍ପ୍ରେ କଲେ ଆପ୍ ଆପଣଙ୍କୁ ସতର୍କ କରାଇদেব।', // TO REVIEW
      hi: 'हर छिड़काव का रिकॉर्ड रखें। 7 दिनों के भीतर दोबारा स्प्रे करने पर ऐप ओवरडोज से बचाने के लिए चेतावनी देता है।', // TO REVIEW
      te: 'ప్రతి స్ప్రే వివరాలను నమోదు చేయండి. 7 రోజులలోపు మళ్ళీ స్ప్రే చేస్తే యాప్ మిమ్మల్ని హెచ్చరిస్తుంది.', // TO REVIEW
      bn: 'প্রতিটি স্প্রে-র হিসাব রাখুন। ৭ দিনের মধ্যে পুনরায় স্প্রে করলে অ্যাপ আপনাকে সতর্ক করবে।', // TO REVIEW
      ta: 'ஒவ்வொரு தெளிப்பையும் பதிவு செய்யுங்கள். 7 நாட்களுக்குள் மீண்டும் தெளித்தால் செயலி எச்சரிக்கும்.', // TO REVIEW
      ur: 'Record every pesticide spray safely.'
    },
    sampleDataPreview: {
      label: 'Sample Log Entry (Not Saved to Your Account)',
      detail: 'Sample: Neem Oil 1500 ppm • 3 ml/L • 2.0 Acres • Status: Safe Interval'
    }
  },
  {
    id: 'farm_calendar',
    targetTab: 'farm_calendar',
    spotlightPosition: 'center',
    icon: Calendar,
    badgeEn: '6 / 9 • 7-Day Farm Calendar',
    title: {
      en: '7-Day Farm Weather Calendar',
      or: '୭-ଦିନିଆ କୃଷି ଓ ପାଣିପାଗ କ୍ୟାଲେଣ୍ଡର', // TO REVIEW
      hi: '7-दिवसीय कृषि और मौसम कैलेंडर', // TO REVIEW
      te: '7-రోజుల వ్యవసాయ వాతావరణ క్యాలెండర్', // TO REVIEW
      bn: '৭-দিনের কৃষি ও আবহাওয়া ক্যালেন্ডার', // TO REVIEW
      ta: '7-நாள் வேளாண் வானிலை நாட்காட்டி', // TO REVIEW
      ur: '7-Day Farm Weather Calendar'
    },
    caption: {
      en: 'Plan your week ahead! Green days are ideal for spraying and fertiliser application; red/amber days warn of rain or high wind.',
      or: 'ଆଗାମୀ ୭ ଦିନର ଯୋଜନା କରନ୍ତୁ! ସବୁଜ ଦିନଗୁଡ଼ିକ ସ୍ପ୍ରେ ଓ ସାର ଦେବା ପାଇଁ ଉତ୍ତମ; ଲାଲ୍/ହଳଦିଆ ଦିନ ବର୍ଷା ବା ପବନ ସୂଚନା ଦିଏ।', // TO REVIEW
      hi: 'आने वाले 7 दिनों की योजना बनाएं! हरे दिन स्प्रे और खाद के लिए उत्तम हैं; लाल/पीले दिन बारिश या तेज हवा की चेतावनी देते हैं।', // TO REVIEW
      te: 'రాబోయే 7 రోజుల ప్రణాళిక చేసుకోండి! ఆకుపచ్చ రోజులు స్ప్రే చేయడానికి అనుకూలం.', // TO REVIEW
      bn: 'আগামী ৭ দিনের পরিকল্পনা করুন! সবুজ দিনগুলো স্প্রে ও সার দেওয়ার জন্য উপযুক্ত।', // TO REVIEW
      ta: 'வரும் 7 நாட்களுக்கான திட்டமிடல்! பச்சை நாட்கள் மருந்து தெளிக்க ஏற்றவை.', // TO REVIEW
      ur: 'Plan your week ahead with the 7-day weather calendar.'
    },
    sampleDataPreview: {
      label: 'Sample 7-Day Forecast (Practice Mode)',
      detail: 'Mon: ✓ Good to Spray • Tue: ✓ Good to Spray • Wed: 🌧️ 75% Rain (Delay Spray)'
    }
  },
  {
    id: 'safety_108',
    targetTab: 'snakebite',
    spotlightPosition: 'center',
    icon: PhoneCall,
    badgeEn: '7 / 9 • Safety & 108 Emergency Button',
    title: {
      en: 'Snakebite & Poisoning Safety (108 Button)',
      or: 'ସାପ କାମୁଡ଼ା ଓ ବିଷକ୍ରିୟା ସୁରକ୍ଷା (୧୦୮ ବଟନ୍)', // TO REVIEW
      hi: 'सर्पदंश और विषाक्तता सुरक्षा (108 आपातकालीन बटन)', // TO REVIEW
      te: 'పాముకాటు & భద్రత (108 అత్యవசர బటన్)', // TO REVIEW
      bn: 'সাপের কামড় ও বিষক্রিয়া সুরক্ষা (১০৮ জরুরি বোতাম)', // TO REVIEW
      ta: 'பாம்புக்கடி பாதுகாப்பு மற்றும் 108 அவசர அழைப்பு', // TO REVIEW
      ur: 'Snakebite & Poisoning Safety (108 Button)'
    },
    caption: {
      en: 'In a real emergency, tapping 108 calls an ambulance and shows nearest Anti-Snake Venom (ASV) hospitals and WHO first-aid rules. (In Practice Mode, no real call is placed.)',
      or: 'ଜରୁରୀ ପରିସ୍ଥିତିରେ ୧୦୮ ଦବାଇଲେ ଆମ୍ବୁଲାନ୍ସ କଲ୍ ହୁଏ ଏବଂ ନିକଟତମ ASV ହସ୍ପିଟାଲ ଓ ପ୍ରାଥମିକ ଚିକିତ୍ସା ଦେଖାଏ। (ଅଭ୍ୟାସ ମୋଡରେ ପ୍ରକୃତ କଲ୍ ଯିବ ନାହିଁ।)', // TO REVIEW
      hi: 'आपातकाल में 108 दबाने से एम्बुलेंस कॉल होती है और नजदीकी ASV अस्पताल व प्राथमिक उपचार दिखता है। (अभ्यास मोड में कोई असली कॉल नहीं जाएगी।)', // TO REVIEW
      te: 'అత్యవసర పరిస్థితిలో 108 నొక్కితే అంబులెన్స్ కాల్ వెళ్తుంది మరియు సమీప ASV ఆసుపత్రులు కనిపిస్తాయి. (ప్రాక్టీస్ మోడ్‌లో నిజమైన కాల్ వెళ్ళదు.)', // TO REVIEW
      bn: 'জরুরি অবস্থায় ১০৮ টিপলে অ্যাম্বুলেন্স কল হয় এবং নিকটস্থ ASV হাসপাতাল ও প্রাথমিক চিকিৎসা দেখায়। (অনুশীলন মোডে কোনো আসল কল যাবে না।)', // TO REVIEW
      ta: 'அவசர நிலையில் 108-ஐ அழுத்தினால் ஆம்புலன்ஸ் அழைப்பு செல்லும். (பயிற்சி முறையில் உண்மையான அழைப்பு செல்லாது.)', // TO REVIEW
      ur: 'In a real emergency, tapping 108 calls an ambulance.'
    },
    sampleDataPreview: {
      label: 'Practice 108 Simulation (Safe – Will NOT Dial 108)',
      detail: 'Nearest ASV Hub: SCB Medical College / District HQ Hospital (24x7 ASV Stock Available)',
      actionLabel: '🚑 Test Safe 108 Button (Practice Only)',
      actionResult: '✓ Practice Check Complete: In real mode, this opens your phone dialer with 108. No call was placed during training.'
    }
  },
  {
    id: 'labour_contacts',
    targetTab: 'labour_connect',
    spotlightPosition: 'center',
    icon: Users,
    badgeEn: '8 / 9 • Labour & Machinery Contacts',
    title: {
      en: 'Labour, Tractor & Drone Sprayer Contacts',
      or: 'ଶ୍ରମିକ, ଟ୍ରାକ୍ଟର ଓ ଡ୍ରୋନ୍ ସ୍ପ୍ରେୟার ଯୋଗାଯୋଗ', // TO REVIEW
      hi: 'श्रमिक, ट्रैक्टर और ड्रोन स्प्रेयर संपर्क', // TO REVIEW
      te: 'కూలీలు, ట్రాక్టర్ & డ్రోన్ స్ప్రేయర్ నంబర్లు', // TO REVIEW
      bn: 'শ্রমিক, ট্রাক্টর ও ড্রোন স্প্রেয়ার যোগাযোগ', // TO REVIEW
      ta: 'தொழிலாளர்கள், டிராக்டர் & ட்ரோன் தொடர்பு எண்கள்', // TO REVIEW
      ur: 'Labour, Tractor & Drone Sprayer Contacts'
    },
    caption: {
      en: 'Find verified Custom Hiring Centres (CHC), tractor rentals, drone spraying teams, and farm labour groups in your district.',
      or: 'ଆପଣଙ୍କ ଜିଲ୍ଲାରେ କଷ୍ଟମ ହାୟାରିଂ ସେଣ୍ଟର (CHC), ଟ୍ରାକ୍ଟର, ଡ୍ରୋନ୍ ସ୍ପ୍ରେ ଓ କୃଷି ଶ୍ରମିକ ଦଳଙ୍କ ଫୋନ୍ ନମ୍ବର ପାଆନ୍ତୁ।', // TO REVIEW
      hi: 'अपने जिले में कस्टम हायरिंग सेंटर (CHC), ट्रैक्टर, ड्रोन स्प्रे और कृषि श्रमिक समूहों के नंबर पाएं।', // TO REVIEW
      te: 'మీ జిల్లాలో కస్టమ్ హైరింగ్ సెంటర్లు (CHC), ట్రాక్టర్లు మరియు డ్రోన్ స్ప్రేయర్ల నంబర్లు పొందండి.', // TO REVIEW
      bn: 'আপনার জেলায় কাস্টম হায়ারিং সেন্টার (CHC), ট্রাক্টর এবং ড্রোন স্প্রেয়ারদের নম্বর পান।', // TO REVIEW
      ta: 'உங்கள் மாவட்டத்தில் டிராக்டர், ட்ரோன் தெளிப்பான் மற்றும் தொழிலாளர் குழுக்களின் எண்களைப் பெறுங்கள்.', // TO REVIEW
      ur: 'Find verified Custom Hiring Centres and labour groups.'
    },
    sampleDataPreview: {
      label: 'Sample CHC Directory Entry (Practice Only)',
      detail: 'Odisha Agro CHC Unit • Tractor & Rotavator • ₹800/hr • Verified Block Provider'
    }
  },
  {
    id: 'account_menu',
    targetTab: 'dashboard',
    spotlightPosition: 'top',
    icon: UserCheck,
    badgeEn: '9 / 9 • Account Menu & Replay Training',
    title: {
      en: 'Account Menu: Farmer ID Card, Replay Training & Sign Out',
      or: 'ଆକାଉଣ୍ଟ ମେନୁ: କୃଷକ କାର୍ଡ, ତାଲିମ ପୁନଃ-ପ୍ରଦର୍ଶନ ଓ ଲଗ୍ ଆଉଟ୍', // TO REVIEW
      hi: 'खाता मेनू: किसान आईडी कार्ड, प्रशिक्षण रीप्ले और साइन आउट', // TO REVIEW
      te: 'ఖాతా మెనూ: రైతు ID కార్డ్, శిక్షణ రీప్లే & సైన్ అవుట్', // TO REVIEW
      bn: 'অ্যাকাউন্ট মেনু: কৃষক আইডি কার্ড, প্রশিক্ষণ রিপ্লে ও সাইন আউট', // TO REVIEW
      ta: 'கணக்கு மெனு: அடையாள அட்டை, பயிற்சி & வெளியேறுதல்', // TO REVIEW
      ur: 'Account Menu: Farmer ID Card & Replay Training'
    },
    caption: {
      en: 'Tap your name or ID icon in the top bar anytime to view or download your QR Farmer ID card, replay this interactive training, or sign out.',
      or: 'ଉପର ବାର୍ ରେ ଆପଣଙ୍କ ନାମ ବା ଆଇଡି ବଟନ୍ ଦବାଇ ଯେକୌଣସି ସମୟରେ QR କୃଷକ କାର୍ଡ ଦେଖିପାରିବେ, ଏହି ତାଲିମ ପୁଣି ଦେଖିପାରିବେ କିମ୍ବା ଲଗ୍ ଆଉଟ୍ କରିପାରିବେ।', // TO REVIEW
      hi: 'शीर्ष बार में अपने नाम या आईडी बटन पर टैप करके कभी भी अपना QR किसान कार्ड देखें, यह प्रशिक्षण दोबारा चलाएं या लॉग आउट करें।', // TO REVIEW
      te: 'టాప్ బార్‌లో మీ పేరుపై నొక్కి ఎప్పుడైనా QR రైతు కార్డును చూడవచ్చు లేదా ఈ శిక్షణను మళ్ళీ చూడవచ్చు.', // TO REVIEW
      bn: 'উপরের বারে আপনার নামের ওপর ট্যাপ করে যেকোনো সময় QR কৃষক কার্ড দেখুন বা এই প্রশিক্ষণটি পুনরায় চালান।', // TO REVIEW
      ta: 'மேல் பட்டையில் உங்கள் பெயரைத் தட்டி எப்போது வேண்டுமானாலும் அடையாள அட்டையைப் பார்க்கலாம் அல்லது பயிற்சியை மீண்டும் இயக்கலாம்.', // TO REVIEW
      ur: 'Tap your name in the top bar anytime to view your ID card or replay training.'
    },
    sampleDataPreview: {
      label: 'You Are Ready to Farm Smarter!',
      detail: 'Tap Finish below to exit Practice Mode and open your real Krushak Bani Home Screen.'
    }
  }
];

export const InteractiveAppTraining: React.FC<InteractiveAppTrainingProps> = ({
  isOpen,
  lang,
  onClose,
  onNavigateTo
}) => {
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [practiceActionFeedback, setPracticeActionFeedback] = useState<string>('');

  const currentStep = TRAINING_STEPS[stepIdx];

  // Navigate the underlying app screen to match the current spotlight step
  useEffect(() => {
    if (!isOpen) return;
    if (currentStep) {
      onNavigateTo(currentStep.targetTab);
    }
    setPracticeActionFeedback('');
  }, [isOpen, stepIdx]);

  // Speak caption if browser supports TTS for the chosen language
  useEffect(() => {
    if (!isOpen || !audioEnabled || !currentStep) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const textToSpeak = currentStep.caption[lang] || currentStep.caption.en;
      const utter = new SpeechSynthesisUtterance(textToSpeak);
      const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
      utter.lang = langMeta?.ttsLang || 'en-IN';
      utter.rate = 0.95;
      window.speechSynthesis.speak(utter);
    } catch {
      // Gracefully ignore if voice is unavailable; text captions are always shown
    }

    return () => {
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      } catch {}
    };
  }, [isOpen, stepIdx, lang, audioEnabled]);

  if (!isOpen || !currentStep) return null;

  const IconComp = currentStep.icon;
  const titleText = currentStep.title[lang] || currentStep.title.en;
  const captionText = currentStep.caption[lang] || currentStep.caption.en;

  const handleNext = () => {
    if (stepIdx < TRAINING_STEPS.length - 1) {
      setStepIdx(stepIdx + 1);
    } else {
      onNavigateTo('dashboard');
      onClose();
    }
  };

  const handleBack = () => {
    if (stepIdx > 0) {
      setStepIdx(stepIdx - 1);
    }
  };

  const handleSkip = () => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {}
    onNavigateTo('dashboard');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto flex flex-col justify-between bg-black/55 backdrop-blur-[2px] p-3 sm:p-6 animate-in fade-in">
      {/* Top Practice Mode Banner (Always Visible During Training) */}
      <div className="w-full max-w-2xl mx-auto rounded-2xl bg-amber-400 text-stone-950 px-4 py-2.5 shadow-xl border-2 border-stone-900 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-stone-950 shrink-0" />
          <span className="text-xs sm:text-sm font-black uppercase tracking-wide">
            {t('practice_mode_badge', lang)}
          </span>
        </div>

        <button
          onClick={handleSkip}
          className="px-3 py-1 rounded-xl bg-stone-950 hover:bg-stone-800 text-amber-300 text-xs font-black shrink-0 cursor-pointer"
        >
          {t('skip_btn', lang)}
        </button>
      </div>

      {/* Spotlight Visual Highlight Ring Indicator on Real Screen */}
      <div className="my-auto w-full max-w-xl mx-auto">
        <div className="rounded-3xl bg-white text-stone-900 shadow-2xl border-4 border-amber-400 overflow-hidden">
          {/* Spotlight Card Header */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shrink-0 shadow-md">
                <IconComp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 block">
                  {currentStep.badgeEn}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                  {titleText}
                </h3>
              </div>
            </div>

            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="p-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-amber-300 border border-emerald-600 transition-colors cursor-pointer shrink-0"
              title={audioEnabled ? 'Mute narration' : 'Enable narration'}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-200 h-2">
            <div
              className="bg-emerald-600 h-2 transition-all duration-300"
              style={{ width: `${((stepIdx + 1) / TRAINING_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Caption Body (Always displayed clearly for languages without browser TTS) */}
          <div className="p-5 sm:p-6 space-y-4 text-left">
            <p className="text-sm sm:text-base font-bold text-stone-800 leading-relaxed">
              {captionText}
            </p>

            {/* Sample Data Spotlight Box */}
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 uppercase">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>{currentStep.sampleDataPreview.label}</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-emerald-950">
                {currentStep.sampleDataPreview.detail}
              </p>

              {currentStep.sampleDataPreview.actionLabel && (
                <div className="pt-1">
                  <button
                    onClick={() =>
                      setPracticeActionFeedback(
                        currentStep.sampleDataPreview.actionResult || 'Practice completed!'
                      )
                    }
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs sm:text-sm font-black shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    {currentStep.sampleDataPreview.actionLabel}
                  </button>
                </div>
              )}

              {practiceActionFeedback && (
                <div className="p-3 rounded-xl bg-emerald-800 text-white text-xs sm:text-sm font-bold flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <span>{practiceActionFeedback}</span>
                </div>
              )}
            </div>

            {/* Step Dots */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {TRAINING_STEPS.map((st, i) => (
                <button
                  key={st.id}
                  onClick={() => setStepIdx(i)}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    i === stepIdx ? 'w-7 bg-emerald-700' : 'w-2.5 bg-stone-300 hover:bg-stone-400'
                  }`}
                  aria-label={`Step ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="px-5 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
            <button
              onClick={handleBack}
              disabled={stepIdx === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all ${
                stepIdx === 0
                  ? 'opacity-40 cursor-not-allowed bg-stone-200 text-stone-500'
                  : 'bg-stone-200 hover:bg-stone-300 text-stone-800 cursor-pointer'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('back', lang)}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSkip}
                className="px-4 py-3 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                {t('skip_btn', lang)}
              </button>

              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-black shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <span>
                  {stepIdx === TRAINING_STEPS.length - 1 ? t('finish_btn', lang) : t('next_btn', lang)}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Helper Caption */}
      <div className="text-center text-xs text-white/90 font-semibold">
        {t('replay_training', lang)}
      </div>
    </div>
  );
};
