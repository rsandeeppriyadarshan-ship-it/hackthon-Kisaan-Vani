import React, { useEffect } from 'react';
import { Language, WeatherData, FarmerProfile } from '../types';
import {
  Camera,
  Stethoscope,
  Droplets,
  Sprout,
  ShieldAlert,
  ClipboardList,
  Calendar,
  Users,
  Mic,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  Compass,
  PhoneCall,
  Phone
} from 'lucide-react';

import { UserLocation } from '../services/locationService';
import { t, translatePlaceName, formatLocalizedUnit } from '../services/translations';
import { stopAllSpeechAndRingtones } from '../services/SpeechService';

interface DashboardProps {
  lang: Language;
  weather: WeatherData | null;
  selectedDistrict: string;
  selectedBlock?: string;
  selectedVillage?: string;
  onNavigateTo: (featureId: string) => void;
  onOpenVoiceModal: () => void;
  onTriggerSafetyAlert: () => void;
  onOpenLocationModal?: () => void;
  userLocation?: UserLocation | null;
  profile?: FarmerProfile | null;
  onProfileUpdated?: (updated: FarmerProfile) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  lang,
  weather,
  selectedDistrict,
  selectedBlock,
  selectedVillage,
  onNavigateTo,
  onOpenVoiceModal,
  onTriggerSafetyAlert,
  onOpenLocationModal,
  userLocation,
  profile,
  onProfileUpdated
}) => {
  const rainProb = weather ? weather.max_rain_probability_12h : 15;
  const windKmh = weather ? weather.wind_speed_kmh : 8;
  const tempC = weather?.temp_c || 29;
  const isSprayGoodToday = rainProb <= 30 && windKmh <= 15;

  useEffect(() => {
    return () => {
      stopAllSpeechAndRingtones();
    };
  }, []);

  const localizedPlaceLabel = [
    selectedVillage ? translatePlaceName(selectedVillage, lang) : '',
    selectedBlock ? translatePlaceName(selectedBlock, lang) : '',
    translatePlaceName(selectedDistrict, lang)
  ]
    .filter(Boolean)
    .join(', ');

  const featureCards: Array<{
    id: string;
    num: string;
    title: Record<Language, string>;
    desc: Record<Language, string>;
    badge: Record<Language, string>;
    icon: any;
    color: string;
  }> = [
    {
      id: 'crop_doctor',
      num: '1',
      title: {
        en: 'Crop Doctor (Vision AI)',
        or: 'ଶସ୍ୟ ଡାକ୍ତର (କ୍ୟାମେରା ପରୀକ୍ଷା)',
        hi: 'फसल डॉक्टर (Vision AI)',
        te: 'పంట డాక్టర్ (Vision AI)',
        bn: 'ফসল ডাক্তার (Vision AI)',
        ta: 'பயிர் மருத்துவர் (Vision AI)',
        ur: 'Crop Doctor (Vision AI)'
      },
      desc: {
        en: 'Upload leaf photo for instant disease diagnosis',
        or: 'ପତ୍ର ଫଟୋ ଅପଲୋଡ କରନ୍ତୁ, ତୁରନ୍ତ ରୋଗ ଚିହ୍ନଟ ହେବ',
        hi: 'पत्ती की फोटो अपलोड करें, तुरंत रोग पहचानें',
        te: 'ఆకు ఫోటో అప్‌లోడ్ చేయండి, తెగులును గుర్తించండి',
        bn: 'পাতার ছবি আপলোড করুন, রোগ নির্ণয় হবে',
        ta: 'இலை புகைப்படத்தை பதிவேற்றி நோயைக் கண்டறியவும்',
        ur: 'Upload leaf photo for instant disease diagnosis'
      },
      badge: {
        en: 'Vision AI',
        or: 'କ୍ୟାମେରା AI',
        hi: 'कैमरा AI',
        te: 'కెమెరా AI',
        bn: 'ক্যামেরা AI',
        ta: 'கேமரா AI',
        ur: 'Vision AI'
      },
      icon: Camera,
      color: 'from-emerald-600 to-teal-700'
    },
    {
      id: 'crop_stress',
      num: '2',
      title: {
        en: 'Crop Stress Check',
        or: 'ଫସଲ ଚାପ ଯାଞ୍ଚ',
        hi: 'फसल तनाव जांच',
        te: 'పంట ఒత్తిడి తనిఖీ',
        bn: 'ফসলের চাপ পরীক্ষা',
        ta: 'பயிர் அழுத்த சோதனை',
        ur: 'Crop Stress Check'
      },
      desc: {
        en: '4-question leaf color, wilting & water stress check',
        or: 'ପତ୍ର ରଙ୍ଗ, ମଉଳିବା ଓ ଜଳାଭାବ ସମସ୍ୟାର ସମାଧାନ',
        hi: 'पत्ती का रंग, मुरझाना और पानी की कमी का समाधान',
        te: 'ఆకు రంగు, వాడిపోవడం & నీటి ఎద్దడి పరిష్కారం',
        bn: 'পাতার রঙ, নেতিয়ে পড়া ও জলের অভাব সমাধান',
        ta: 'இலை நிறம், வாடுதல் மற்றும் நீர் பற்றாக்குறை தீர்வு',
        ur: '4-question leaf color, wilting & water stress check'
      },
      badge: {
        en: 'Rule Engine',
        or: 'ନିୟମ ପ୍ରଣାଳୀ',
        hi: 'नियम प्रणाली',
        te: 'నియమ వ్యవస్థ',
        bn: 'নিয়ম ব্যবস্থা',
        ta: 'விதி அமைப்பு',
        ur: 'Rule Engine'
      },
      icon: Stethoscope,
      color: 'from-teal-600 to-emerald-700'
    },
    {
      id: 'pesticide',
      num: '3',
      title: {
        en: 'Pesticide Advice',
        or: 'କୀଟନାଶକ ପରାମର୍ଶ',
        hi: 'कीटनाशक सलाह',
        te: 'పురుగుమందుల సలహా',
        bn: 'কীটনাশক পরামর্শ',
        ta: 'பூச்சிக்கொல்லி ஆலோசனை',
        ur: 'Pesticide Advice'
      },
      desc: {
        en: 'OUAT dosages & real-time weather spray check',
        or: 'ଓୟୁଏଟି ମାତ୍ରା ଓ ପାଣିପାଗ ସ୍ପ୍ରେ ଅନୁମୋଦନ',
        hi: 'OUAT मात्रा और मौसम के अनुसार स्प्रे सलाह',
        te: 'OUAT మోతాదులు & వాతావరణ స్ప్రే తనిఖీ',
        bn: 'OUAT মাত্রা ও আবহাওয়া অনুযায়ী স্প্রে পরামর্শ',
        ta: 'OUAT அளவுகள் மற்றும் வானிலை தெளிப்பு சோதனை',
        ur: 'OUAT dosages & real-time weather spray check'
      },
      badge: {
        en: 'OUAT Rules',
        or: 'ଓୟୁଏଟି ନିୟମ',
        hi: 'OUAT नियम',
        te: 'OUAT నియమాలు',
        bn: 'OUAT নিয়ম',
        ta: 'OUAT விதிகள்',
        ur: 'OUAT Rules'
      },
      icon: ShieldCheck,
      color: 'from-amber-600 to-yellow-700'
    },
    {
      id: 'water',
      num: '4',
      title: {
        en: 'Water Advice',
        or: 'ଜଳସେଚନ ପରାମର୍ଶ',
        hi: 'सिंचाई सलाह',
        te: 'నీటిపారుదల సలహా',
        bn: 'সেচ পরামর্শ',
        ta: 'நீர்ப்பாசன ஆலோசனை',
        ur: 'Water Advice'
      },
      desc: {
        en: 'Crop stage interval vs live rain forecast',
        or: 'ବର୍ଷା ଆଶଙ୍କା ଓ ପାଣି ମଡ଼ାଇବାର ସଠିକ ସମୟ',
        hi: 'बारिश की संभावना और सिंचाई का सही समय',
        te: 'వర్ష సూచన & నీరు పెట్టడానికి సరైన సమయం',
        bn: 'বৃষ্টির সম্ভাবনা ও সেচ দেওয়ার সঠিক সময়',
        ta: 'மழை முன்னறிவிப்பு மற்றும் நீர்ப்பாசன நேரம்',
        ur: 'Crop stage interval vs live rain forecast'
      },
      badge: {
        en: 'Weather API',
        or: 'ପାଣିପାଗ ତଥ୍ୟ',
        hi: 'मौसम डेटा',
        te: 'వాతావరణ డేటా',
        bn: 'আবহাওয়া তথ্য',
        ta: 'வானிலை தரவு',
        ur: 'Weather API'
      },
      icon: Droplets,
      color: 'from-sky-600 to-blue-700'
    },
    {
      id: 'fertiliser',
      num: '5',
      title: {
        en: 'Fertiliser Advice',
        or: 'ଖତ ଓ ସାର ପରାମର୍ଶ',
        hi: 'खाद और उर्वरक सलाह',
        te: 'ఎరువుల సలహా',
        bn: 'সার ও খাত পরামর্শ',
        ta: 'உர ஆலோசனை',
        ur: 'Fertiliser Advice'
      },
      desc: {
        en: 'Urea, DAP & Soil Health Card N-P-K calculator',
        or: 'ୟୁରିଆ, ଡିଏପି ଓ ମୃତ୍ତିକା ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ ହିସାବ',
        hi: 'यूरिया, डीएपी और मृदा स्वास्थ्य कार्ड हिसाब',
        te: 'యూరియా, డీఏపీ & భూసార పరీక్ష కార్డు లెక్కలు',
        bn: 'ইউরিয়া, ডিএপি ও সয়েল হেলথ কার্ড হিসাব',
        ta: 'யூரியா, டிஏபி மற்றும் மண் வள அட்டை கணக்கீடு',
        ur: 'Urea, DAP & Soil Health Card N-P-K calculator'
      },
      badge: {
        en: 'Soil Card',
        or: 'ମୃତ୍ତିକା କାର୍ଡ',
        hi: 'मृदा कार्ड',
        te: 'భూసార కార్డు',
        bn: 'মৃত্তিকা কার্ড',
        ta: 'மண் அட்டை',
        ur: 'Soil Card'
      },
      icon: Sprout,
      color: 'from-emerald-700 to-green-800'
    },
    {
      id: 'spray_log',
      num: '6',
      title: {
        en: 'Spray Log',
        or: 'ସ୍ପ୍ରେ ଇତିହାସ ଓ ଲଗ୍',
        hi: 'स्प्रे लॉग और इतिहास',
        te: 'స్ప్రే లాగ్ & చరిత్ర',
        bn: 'স্প্রে লগ ও ইতিহাস',
        ta: 'தெளிப்பு பதிவேடு',
        ur: 'Spray Log'
      },
      desc: {
        en: 'Persistent spray records with <7 day repeat warning',
        or: 'କୀଟନାଶକ ହିସାବ ଓ ବାରମ୍ବାର ସ୍ପ୍ରେ ସତର୍କତା',
        hi: 'कीटनाशक रिकॉर्ड और बार-बार स्प्रे की चेतावनी',
        te: 'పురుగుమందుల రికార్డు & 7 రోజుల లోపు స్ప్రే హెచ్చరిక',
        bn: 'কীটনাশক হিসাব ও ঘন ঘন স্প্রে সতর্কতা',
        ta: 'பூச்சிக்கொல்லி பதிவு மற்றும் 7 நாள் எச்சரிக்கை',
        ur: 'Persistent spray records with <7 day repeat warning'
      },
      badge: {
        en: 'Saved Log',
        or: 'ସୁରକ୍ଷିତ ଲଗ୍',
        hi: 'सुरक्षित लॉग',
        te: 'సేవ్ చేసిన లాగ్',
        bn: 'সংরক্ষিত লগ',
        ta: 'சேமித்த பதிவு',
        ur: 'Saved Log'
      },
      icon: ClipboardList,
      color: 'from-stone-700 to-stone-900'
    },
    {
      id: 'farm_calendar',
      num: '7',
      title: {
        en: '7-Day Farm Calendar',
        or: '୭ ଦିନିଆ କୃଷି କ୍ୟାଲେଣ୍ଡର',
        hi: '७ दिन का कृषि कैलेंडर',
        te: '7-రోజుల వ్యవసాయ క్యాలెండర్',
        bn: '৭ দিনের কৃষি ক্যালেন্ডার',
        ta: '7-நாள் வேளாண் நாட்காட்டி',
        ur: '7-Day Farm Calendar'
      },
      desc: {
        en: '7-day rain & wind forecast with safe spray days',
        or: 'ପାଣିପାଗ ଓ ସ୍ପ୍ରେ ପାଇଁ ଉତ୍ତମ ଦିନ ଗଣନା',
        hi: 'मौसम पूर्वानुमान और स्प्रे के लिए सुरक्षित दिन',
        te: '7-రోజుల వాతావరణం & స్ప్రేకు అనుకూల రోజులు',
        bn: 'আবহাওয়া ও স্প্রে করার উপযুক্ত দিন গণনা',
        ta: '7-நாள் வானிலை மற்றும் தெளிக்க சிறந்த நாட்கள்',
        ur: '7-day rain & wind forecast with safe spray days'
      },
      badge: {
        en: '7-Day Forecast',
        or: '୭-ଦିନିଆ ପୂର୍ବାନୁମାନ',
        hi: '7-दिन पूर्वानुमान',
        te: '7-రోజుల సూచన',
        bn: '৭-দিনের পূর্বাভাস',
        ta: '7-நாள் முன்னறிவிப்பு',
        ur: '7-Day Forecast'
      },
      icon: Calendar,
      color: 'from-emerald-800 to-teal-900'
    },
    {
      id: 'labour_connect',
      num: '8',
      title: {
        en: 'Labour Connect',
        or: 'ଶ୍ରମିକ ଓ ଯନ୍ତ୍ରପାତି ସେବା',
        hi: 'श्रमिक और मशीनरी सेवा',
        te: 'కూలీలు & యంత్రాల సేవ',
        bn: 'শ্রমিক ও যন্ত্রপাতি সেবা',
        ta: 'தொழிலாளர் மற்றும் இயந்திர சேவை',
        ur: 'Labour Connect'
      },
      desc: {
        en: 'Custom hiring, drone spray & labour phone numbers',
        or: 'କଷ୍ଟମ ହାୟାରିଂ, ଡ୍ରୋନ୍ ଓ ଶ୍ରମିକ ଫୋନ୍ ନମ୍ବର',
        hi: 'कस्टम हायरिंग, ड्रोन और श्रमिक फोन नंबर',
        te: 'కస్టమ్ హైరింగ్, డ్రోన్ & కూలీల ఫోన్ నంబర్లు',
        bn: 'কাস্টম হায়ারিং, ড্রোন ও শ্রমিক ফোন নম্বর',
        ta: 'வாடகை இயந்திரம், ட்ரோன் மற்றும் தொழிலாளர் எண்கள்',
        ur: 'Custom hiring, drone spray & labour phone numbers'
      },
      badge: {
        en: 'Direct Call',
        or: 'ସିଧା କଲ୍',
        hi: 'सीधा कॉल',
        te: 'డైరెక్ట్ కాల్',
        bn: 'সরাসরি কল',
        ta: 'நேரடி அழைப்பு',
        ur: 'Direct Call'
      },
      icon: Users,
      color: 'from-blue-700 to-indigo-800'
    },
    {
      id: 'safety_alert',
      num: '9',
      title: {
        en: 'Safety Alert Audio',
        or: 'ସ୍ପ୍ରେ ସୁରକ୍ଷା ଚେତାବନୀ',
        hi: 'स्प्रे सुरक्षा ऑडियो चेतावनी',
        te: 'స్ప్రే భద్రతా ఆడియో హెచ్చరిక',
        bn: 'স্প্রে সুরক্ষা অডিও সতর্কতা',
        ta: 'தெளிப்பு பாதுகாப்பு ஒலி எச்சரிக்கை',
        ur: 'Safety Alert Audio'
      },
      desc: {
        en: 'Mask, goggles, wind direction & audio checklist',
        or: 'ମାସ୍କ, ଚଷମା, ପବନ ଦିଗ ଓ ଓଡ଼ିଆ ଅଡିଓ ଯାଞ୍ଚ',
        hi: 'मास्क, चश्मा, हवा की दिशा और ऑडियो जांच',
        te: 'మాస్క్, కళ్లద్దాలు, గాలి దిశ & ఆడియో చెక్‌లిస్ట్',
        bn: 'মাস্ক, চশমা, বাতাসের দিক ও অডিও চেকলিস্ট',
        ta: 'முகக்கவசம், கண்ணாடி, காற்றின் திசை சரிபார்ப்பு',
        ur: 'Mask, goggles, wind direction & audio checklist'
      },
      badge: {
        en: 'Audio Voice',
        or: 'ଅଡିଓ ବାର୍ତ୍ତା',
        hi: 'ऑडियो संदेश',
        te: 'ఆడియో సందేశం',
        bn: 'অডিও বার্তা',
        ta: 'ஆடியோ செய்தி',
        ur: 'Audio Voice'
      },
      icon: ShieldAlert,
      color: 'from-amber-700 to-rose-700'
    },
    {
      id: 'voice',
      num: '10',
      title: {
        en: 'Voice Assistant',
        or: 'ଓଡ଼ିଆ କଣ୍ଠ ନିର୍ଦ୍ଦେଶ',
        hi: 'आवाज़ सहायक (Voice Assistant)',
        te: 'వాయిస్ అసిస్టెంట్',
        bn: 'কণ্ঠ সহায়ক',
        ta: 'குரல் உதவியாளர்',
        ur: 'Voice Assistant'
      },
      desc: {
        en: 'Speak in your language to use all farm services',
        or: 'ମାଇକ୍ରୋଫୋନରେ କହି ସମସ୍ତ ସେବା ବ୍ୟବହାର କରନ୍ତୁ',
        hi: 'माइक्रोफ़ोन में बोलकर सभी कृषि सेवाओं का उपयोग करें',
        te: 'మైక్రోఫోన్‌లో మాట్లాడి అన్ని సేవలను ఉపయోగించండి',
        bn: 'মাইক্রোফোনে কথা বলে সব কৃষি সেবা ব্যবহার করুন',
        ta: 'மைக்ரோஃபோனில் பேசி அனைத்து சேவைகளையும் பயன்படுத்தவும்',
        ur: 'Speak in your language to use all farm services'
      },
      badge: {
        en: 'Voice AI',
        or: 'କଣ୍ଠ ସହାୟକ',
        hi: 'आवाज़ AI',
        te: 'వాయిస్ AI',
        bn: 'কণ্ঠ AI',
        ta: 'குரல் AI',
        ur: 'Voice AI'
      },
      icon: Mic,
      color: 'from-amber-600 to-amber-700'
    },
    {
      id: 'rotation',
      num: '11',
      title: {
        en: 'Crop Rotation',
        or: 'ଫସଲ ଚକ୍ର ଓ ପର୍ଯ୍ୟାୟକ୍ରମ',
        hi: 'फसल चक्र सलाह',
        te: 'పంట మార్పిడి సలహా',
        bn: 'ফসল পর্যায়ক্রম ও চক্র',
        ta: 'பயிர் சுழற்சி ஆலோசனை',
        ur: 'Crop Rotation'
      },
      desc: {
        en: 'Pulse nitrogen fixation, disease break & soil health',
        or: 'ମୁଗ-ବିରି ଯବକ୍ଷାରଜାନ ବୃଦ୍ଧି ଓ ରୋଗଚକ୍ର ବିଲୋପ',
        hi: 'दालों से नाइट्रोजन वृद्धि और रोग चक्र की रोकथाम',
        te: 'పప్పుధాన్యాలతో నత్రజని వృద్ధి & తెగుళ్ల నివారణ',
        bn: 'ডাল ফসলে নাইট্রোজেন বৃদ্ধি ও রোগচক্র প্রতিরোধ',
        ta: 'பயறு வகை நைட்ரஜன் பெருக்கம் மற்றும் நோய் தடுப்பு',
        ur: 'Pulse nitrogen fixation, disease break & soil health'
      },
      badge: {
        en: 'OUAT Soil',
        or: 'ମୃତ୍ତିକା ସ୍ୱାସ୍ଥ୍ୟ',
        hi: 'मृदा स्वास्थ्य',
        te: 'నేల ఆరోగ్యం',
        bn: 'মাটির স্বাস্থ্য',
        ta: 'மண் வளம்',
        ur: 'OUAT Soil'
      },
      icon: RefreshCw,
      color: 'from-emerald-800 to-green-900'
    },
    {
      id: 'weather_alerts',
      num: '12',
      title: {
        en: 'Weather Alerts (IMD)',
        or: 'ପାଣିପାଗ ସତର୍କତା ଓ ଚେତାବନୀ',
        hi: 'मौसम चेतावनी (IMD)',
        te: 'వాతావరణ హెచ్చరికలు (IMD)',
        bn: 'আবহাওয়া সতর্কতা (IMD)',
        ta: 'வானிலை எச்சரிக்கைகள் (IMD)',
        ur: 'Weather Alerts (IMD)'
      },
      desc: {
        en: 'Lightning, storm & heavy rain alerts with safety audio',
        or: 'ବଜ୍ରପାତ, କାଳବୈଶାଖୀ, ପ୍ରବଳ ବର୍ଷା ଓ ଝଡ଼ ପବନ',
        hi: 'बिजली गिरने, आंधी और भारी बारिश की सुरक्षा चेतावनी',
        te: 'పిడుగులు, తుఫాను & భారీ వర్షం భద్రతా హెచ్చరికలు',
        bn: 'বজ্রপাত, কালবৈশাখী ও প্রবল বৃষ্টির সতর্কতা',
        ta: 'மின்னல், புயல் மற்றும் கனமழை பாதுகாப்பு எச்சரிக்கை',
        ur: 'Lightning, storm & heavy rain alerts with safety audio'
      },
      badge: {
        en: 'Alerts & Safety',
        or: 'ପାଣିପାଗ ସତର୍କତା',
        hi: 'मौसम सुरक्षा',
        te: 'వాతావరణ భద్రత',
        bn: 'আবহাওয়া সুরক্ষা',
        ta: 'வானிலை பாதுகாப்பு',
        ur: 'Alerts & Safety'
      },
      icon: AlertTriangle,
      color: 'from-red-600 to-orange-700'
    },
    {
      id: 'crop_history',
      num: '13',
      title: {
        en: 'Crop History & Growth AI',
        or: 'ଫସଲ ଇତିହାସ ଓ କ୍ୟାମେରା ବୃଦ୍ଧି ମୂଲ୍ୟାଙ୍କନ',
        hi: 'फसल इतिहास और वृद्धि मूल्यांकन',
        te: 'పంట చరిత్ర & పెరుగుదల అంచనా',
        bn: 'ফসলের ইতিহাস ও বৃদ্ধি মূল্যায়ন',
        ta: 'பயிர் வரலாறு மற்றும் வளர்ச்சி மதிப்பீடு',
        ur: 'Crop History & Growth AI'
      },
      desc: {
        en: 'Camera crop scan, 0-100 growth score & harvest timeline',
        or: 'କ୍ୟାମେରା ଫଟୋ ବିଶ୍ଳେଷଣ, ବୃଦ୍ଧି ସ୍କୋର (୦-୧୦୦) ଓ ଅମଳ ସମୟ ପୂର୍ବାନୁମାନ',
        hi: 'कैमरा फोटो विश्लेषण, 0-100 वृद्धि स्कोर और कटाई समय',
        te: 'కెమెరా ఫోటో విశ్లేషణ, 0-100 గ్రోత్ స్కోర్ & కోత సమయం',
        bn: 'ক্যামেরা ছবি বিশ্লেষণ, ০-১০০ বৃদ্ধি স্কোর ও ফসল কাটার সময়',
        ta: 'கேமரா ஆய்வு, 0-100 வளர்ச்சி மதிப்பெண் மற்றும் அறுவடை காலம்',
        ur: 'Camera crop scan, 0-100 growth score & harvest timeline'
      },
      badge: {
        en: 'Growth Score',
        or: 'ବୃଦ୍ଧି ସ୍କୋର',
        hi: 'वृद्धि स्कोर',
        te: 'గ్రోత్ స్కోర్',
        bn: 'বৃদ্ধি স্কোর',
        ta: 'வளர்ச்சி மதிப்பெண்',
        ur: 'Growth Score'
      },
      icon: Camera,
      color: 'from-teal-700 to-emerald-900'
    }
  ];

  const severeAlert = weather?.active_alerts?.find(
    (a) => a.severity === 'RED' || a.severity === 'ORANGE' || a.severity === 'YELLOW'
  );

  const activeAlertsCount = weather?.active_alerts?.length || 0;
  const isSevereAlert = Boolean(
    weather?.active_alerts?.some(
      (a) =>
        a.severity === 'RED' ||
        a.severity === 'ORANGE' ||
        a.severity === 'YELLOW' ||
        ['thunderstorm_lightning', 'cyclone_wind', 'heavy_rain'].includes(a.phenomenon || '')
    )
  );

  let weatherLine2 = '';
  if (!weather) {
    weatherLine2 = t('weather_unavailable', lang);
  } else if (severeAlert) {
    const alertTitle =
      lang === 'or' && severeAlert.headline_or
        ? severeAlert.headline_or
        : severeAlert.headline_en || t('weather_alert_btn', lang);
    weatherLine2 = alertTitle;
  } else if (rainProb > 0) {
    weatherLine2 = t('rain_expected_today', lang, { prob: rainProb });
  } else {
    weatherLine2 = t('no_rain_today', lang);
  }

  return (
    <div className="space-y-6 text-left">
      {/* Severe Weather Alert Ticker if Active */}
      {severeAlert && severeAlert.severity !== 'GREEN' && (
        <div
          onClick={() => onNavigateTo('weather_alerts')}
          className="cursor-pointer group rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 p-3.5 shadow-md border-2 border-amber-300 flex items-center justify-between gap-3 transition-all animate-in fade-in"
        >
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-lg bg-black text-amber-300 font-black text-xs uppercase px-2">
              {t('weather_alerts', lang)}
            </span>
            <p className="text-xs sm:text-sm font-extrabold line-clamp-1">
              {lang === 'or' ? severeAlert.headline_or : severeAlert.headline_en}
            </p>
          </div>
          <span className="text-xs font-black underline shrink-0">
            {t('view_action_btn', lang)} →
          </span>
        </div>
      )}

      {/* Hero Section (With yellow download_btn removed as requested) */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-emerald-700/60 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-600 text-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {t('live_weather', lang)}: {localizedPlaceLabel}
                </span>
              </div>

              {userLocation && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-[11px] font-bold">
                  {t('accuracy_badge', lang, { meters: userLocation.accuracy })}
                </span>
              )}

              {onOpenLocationModal && (
                <button
                  onClick={onOpenLocationModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black shadow-sm transition-all active:scale-95 cursor-pointer"
                  title={t('update_location_btn', lang)}
                >
                  {userLocation ? (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-700 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-900"></span>
                    </span>
                  ) : (
                    <MapPin className="w-3 h-3 text-stone-950" />
                  )}
                  <span>{t('update_location_btn', lang)}</span>
                </button>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight max-w-xl">
              {t('hero_heading', lang)}
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-xl">
              {t('hero_subheading', lang)}
            </p>

            {/* Quick Action Buttons (5 tidy wrapping shortcut buttons) */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onNavigateTo('crop_doctor')}
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-black px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span>{t('diagnose_crop_leaf', lang)}</span>
              </button>

              <button
                onClick={onOpenVoiceModal}
                className="inline-flex items-center gap-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600 text-amber-300 font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Mic className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span>{t('voice_command', lang)}</span>
              </button>

              {/* Red Spray Button & Compact Weather Card Button Row Pair */}
              <div className="flex flex-nowrap max-[340px]:flex-wrap items-center gap-2 w-full sm:w-auto max-w-full">
                <button
                  onClick={onTriggerSafetyAlert}
                  className="flex-[0_1_auto] max-[340px]:w-full inline-flex items-center justify-center gap-1.5 bg-red-600/90 hover:bg-red-600 text-white font-bold px-2.5 sm:px-3 py-1.5 text-xs leading-tight rounded-2xl min-h-[48px] shadow-md transition-all active:scale-95 cursor-pointer max-w-[130px] max-[340px]:max-w-none shrink-0"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0 text-white" />
                  <span className="line-clamp-2 text-[11px] leading-tight font-bold text-center sm:text-left">
                    {t('going_to_spray', lang)}
                  </span>
                </button>

                {/* Detailed Compact Weather Card Button */}
                <button
                  onClick={() => onNavigateTo('weather_alerts')}
                  aria-label="Weather alert"
                  title={t('weather_alert_btn', lang)}
                  className="flex-[1_1_0%] min-w-0 max-[340px]:w-full max-[340px]:flex-none inline-flex items-center gap-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600 text-white px-3 py-1.5 rounded-2xl min-h-[48px] shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <div
                    className={`relative w-8 h-8 rounded-xl bg-gradient-to-br from-red-500/25 to-amber-500/25 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-xs ${
                      isSevereAlert ? 'animate-pulse' : ''
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                    {activeAlertsCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-0.5 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-emerald-950 shadow-xs">
                        {activeAlertsCount}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left flex flex-col justify-center leading-tight">
                    <span className="font-bold text-xs sm:text-sm text-emerald-100 overflow-hidden text-ellipsis whitespace-nowrap block">
                      {t('weather_alert_btn', lang)}
                    </span>
                    <span className="text-[10px] sm:text-xs text-amber-200/90 font-medium overflow-hidden text-ellipsis whitespace-nowrap block mt-0.5">
                      {weatherLine2}
                    </span>
                  </div>
                </button>
              </div>

              <button
                onClick={() => onNavigateTo('crop_history')}
                className="inline-flex items-center gap-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500 text-emerald-200 font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Sprout className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span>{t('crop_history', lang)}</span>
              </button>

              <button
                onClick={() => onNavigateTo('farm_calendar')}
                className="inline-flex items-center gap-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500 text-emerald-200 font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Calendar className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span>{t('farm_calendar_shortcut', lang)}</span>
              </button>
            </div>
          </div>

          {/* Right Live Weather & Spray Window Card */}
          <div className="bg-emerald-950/80 border border-emerald-700/80 rounded-3xl p-5 text-left shrink-0 max-w-sm w-full space-y-4 shadow-inner">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-800">
              <span className="text-xs font-bold text-emerald-300">
                {t('todays_spray_window', lang)}
              </span>
              <span className="text-[10px] uppercase font-bold text-stone-300 bg-emerald-900 px-2 py-0.5 rounded-full">
                {t('open_meteo_badge', lang)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isSprayGoodToday ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-stone-900'
                }`}
              >
                {isSprayGoodToday ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <AlertTriangle className="w-7 h-7" />
                )}
              </div>
              <div>
                <h4 className="text-base font-black text-white">
                  {isSprayGoodToday ? t('spray_favourable', lang) : t('spray_caution', lang)}
                </h4>
                <p className="text-xs text-emerald-200/90 mt-0.5">
                  {isSprayGoodToday
                    ? t('low_wind_rain_sub', lang)
                    : t('high_rain_wind_sub', lang, {
                        rain: rainProb,
                        wind: formatLocalizedUnit(windKmh, 'kmh', lang)
                      })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
              <div className="p-2 rounded-xl bg-emerald-900/60 border border-emerald-800">
                <span className="text-[10px] text-emerald-400 block font-semibold">
                  {t('rain_chance', lang)}
                </span>
                <span className="font-extrabold text-white text-sm">{rainProb}%</span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-900/60 border border-emerald-800">
                <span className="text-[10px] text-emerald-400 block font-semibold">
                  {t('wind_speed', lang)}
                </span>
                <span className="font-extrabold text-white text-sm">
                  {formatLocalizedUnit(windKmh, 'kmh', lang)}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-emerald-900/60 border border-emerald-800">
                <span className="text-[10px] text-emerald-400 block font-semibold">
                  {t('Temp', lang)}
                </span>
                <span className="font-extrabold text-white text-sm">
                  {formatLocalizedUnit(tempC, 'temp_c', lang)}
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigateTo('offline_map')}
              className="w-full py-2 px-3 rounded-2xl bg-emerald-900/90 hover:bg-emerald-900 text-emerald-200 hover:text-white border border-emerald-700/80 text-xs font-bold flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('nav_map', lang)}</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Snakebite & Hospital Bar */}
      <div
        onClick={() => onNavigateTo('snakebite')}
        className="cursor-pointer group rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-4 sm:p-5 shadow-lg border-2 border-red-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:scale-[1.01]"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white text-red-600 flex items-center justify-center font-black text-xl shrink-0 shadow-md group-hover:scale-110 transition-transform">
            108
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg">
                {t('snakebite_emergency', lang)}
              </h3>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-yellow-400 text-stone-900">
                24x7
              </span>
            </div>
            <p className="text-xs text-red-100 mt-0.5">{t('snakebite_desc', lang)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-center">
          <span className="text-xs font-bold text-yellow-300 group-hover:underline">
            {t('open_module', lang)}
          </span>
          <ArrowRight className="w-4 h-4 text-yellow-300 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>



      {/* 13 Features Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-black text-stone-900">
            {t('all_modules_heading', lang)}
          </h3>
          <span className="text-xs text-stone-500 font-semibold">
            {t('open_module', lang)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            // First 12 cards take 2 of 6 columns on desktop (3 per row); last 2 cards take 3 of 6 columns (2 per row, filling full row with no gap)
            const desktopSpanClass = idx >= 12 ? 'lg:col-span-6' : 'lg:col-span-2';
            return (
              <div
                key={feat.id}
                onClick={() => {
                  if (feat.id === 'voice') {
                    onOpenVoiceModal();
                  } else if (feat.id === 'safety_alert') {
                    onTriggerSafetyAlert();
                  } else {
                    onNavigateTo(feat.id);
                  }
                }}
                className={`bg-white rounded-3xl p-5 shadow-xs border border-stone-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between ${desktopSpanClass}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${feat.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                      {feat.badge[lang] || feat.badge.en}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-stone-900 mt-3 group-hover:text-emerald-800 transition-colors">
                    <span className="text-stone-400 font-bold mr-1.5">{feat.num}.</span>
                    {feat.title[lang] || feat.title.en}
                  </h4>

                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {feat.desc[lang] || feat.desc.en}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>{t('open_module', lang)}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
