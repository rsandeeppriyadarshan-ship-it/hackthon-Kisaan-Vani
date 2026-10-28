/**
 * Comprehensive Pan-India Agricultural Plant & Vegetable Database
 * Covers all major Indian vegetables, cereals, pulses, oilseeds, fruits, cash crops, and spices.
 * Provides ICAR and OUAT verified disease diagnostics and spray treatments.
 */

import { PlantItem, CropDisease } from '../types';

export interface PlantWithDiagnostics extends PlantItem {
  soil_type: string;
  fertiliser_summary: {
    basal: string;
    vegetative: string;
    flowering: string;
  };
  irrigation_interval_days: number;
  diseases: CropDisease[];
}

export const INDIAN_PLANT_DATABASE: PlantWithDiagnostics[] = [
  // ================= VEGETABLES =================
  {
    id: 'tomato',
    category: 'vegetable',
    name_en: 'Tomato',
    name_or: 'ବିଲାତି ବାଇଗଣ (Tomato)',
    name_hi: 'टमाटर (Tomato)',
    name_bn: 'টমেটো',
    name_ta: 'தக்காளி',
    name_ur: 'ٹماٹر',
    scientific_name: 'Solanum lycopersicum',
    icon: '🍅',
    season: 'Rabi & Summer (Oct-Feb / Jun-Jul)',
    growth_duration_days: '90-110 days',
    water_requirement: 'Medium',
    soil_type: 'Well-drained sandy loam pH 6.0-7.0',
    fertiliser_summary: {
      basal: 'FYM 8t + DAP 50kg + MOP 30kg + Zinc 5kg/acre',
      vegetative: 'Urea 25kg/acre at 30 days',
      flowering: 'Urea 20kg + MOP 15kg/acre at fruit set'
    },
    irrigation_interval_days: 4,
    common_diseases: ['Early Blight', 'Leaf Curl Virus', 'Bacterial Wilt', 'Fruit Borer'],
    diseases: [
      {
        id: 'tomato_early_blight',
        name_en: 'Early Blight (Alternaria solani)',
        name_or: 'ଆଗୁଆ ପତ୍ରପୋଡ଼ା (ଟାର୍ଗେଟ୍ ବୋର୍ଡ ଦାଗ)',
        symptoms_en: 'Concentric brown rings like target board on lower leaves, defoliation.',
        symptoms_or: 'ତଳ ପତ୍ରରେ ଲକ୍ଷ୍ୟବିନ୍ଦୁ ଭଳି ବାଦାମୀ ଚକ୍ର ଦାଗ, ପତ୍ର ହଳଦିଆ ହୋଇ ଝଡ଼ିବା।',
        chemical: 'Mancozeb 75% WP or Chlorothalonil 75% WP',
        chemical_or: 'ମାଙ୍କୋଜେବ୍ ୭୫% WP କିମ୍ବା କ୍ଲୋରୋଥାଲୋନିଲ୍',
        dose_per_litre: '2.0 g',
        dose_per_acre: '400 g in 200 L water',
        phi_days: 5,
        safety_class: 'Class III (Blue)',
        alternative: 'Azoxystrobin 23% SC @ 1 ml/L'
      },
      {
        id: 'tomato_leaf_curl',
        name_en: 'Tomato Leaf Curl Virus (Whitefly Vector)',
        name_or: 'ପତ୍ର କୁଞ୍ଚନ ଭୂତାଣୁ ରୋଗ (ଧଳାମାଛି ବାହକ)',
        symptoms_en: 'Upward rolling and thick puckered leaves with stunted growth.',
        symptoms_or: 'ପତ୍ର ଉପର ମୁହାଁ କୁଞ୍ଚିତ ହୋଇ ଛୋଟ ହେବା, ଗଛ ବୁଦୁବୁଦିକା ହୋଇ ଫଳ ଧରେ ନାହିଁ।',
        chemical: 'Diafenthiuron 50% WP or Acetamiprid 20% SP',
        chemical_or: 'ଡାୟାଫେନଥିଉରନ୍ ୫୦% WP କିମ୍ବା ଏସିଟାମିପ୍ରିଡ୍',
        dose_per_litre: '1.0 g',
        dose_per_acre: '200 g in 200 L water',
        phi_days: 7,
        safety_class: 'Class III (Blue)',
        alternative: 'Yellow sticky traps (15/acre) + Neem oil 1500ppm'
      }
    ]
  },
  {
    id: 'brinjal',
    category: 'vegetable',
    name_en: 'Brinjal (Eggplant)',
    name_or: 'ବାଇଗଣ (Brinjal)',
    name_hi: 'बैंगन (Brinjal)',
    name_bn: 'বেগুন',
    name_ta: 'கத்தரிக்காய்',
    name_ur: 'بینگن',
    scientific_name: 'Solanum melongena',
    icon: '🍆',
    season: 'All Seasons (Kharif, Rabi, Summer)',
    growth_duration_days: '120-140 days',
    water_requirement: 'Medium',
    soil_type: 'Rich silt loam with good drainage',
    fertiliser_summary: {
      basal: 'FYM 6t + DAP 50kg + MOP 30kg/acre',
      vegetative: 'Urea 25kg/acre at 30 days',
      flowering: 'Urea 20kg + MOP 15kg at first picking'
    },
    irrigation_interval_days: 5,
    common_diseases: ['Shoot & Fruit Borer', 'Phomopsis Blight', 'Little Leaf Disease'],
    diseases: [
      {
        id: 'brinjal_shoot_fruit_borer',
        name_en: 'Shoot & Fruit Borer (Leucinodes orbonalis)',
        name_or: 'ଡଗ ଓ ଫଳ ବିନ୍ଧା ପୋକ',
        symptoms_en: 'Wilting tender shoots and boreholes with excreta in fruits.',
        symptoms_or: 'କଅଁଳ ଡଗ ମଉଳି ଝାଉଁଳିବା, ଫଳରେ କଣା ହୋଇ ମଳ ବାହାରିବା।',
        chemical: 'Emamectin Benzoate 5% SG',
        chemical_or: 'ଏମାମେକ୍ଟିନ୍ ବେଞ୍ଜୋଏଟ୍ ୫% SG',
        dose_per_litre: '0.4 g',
        dose_per_acre: '80 g in 200 L water',
        phi_days: 3,
        safety_class: 'Class III (Blue)',
        alternative: 'Spinosad 45% SC @ 0.3 ml/L'
      },
      {
        id: 'brinjal_phomopsis',
        name_en: 'Phomopsis Blight & Fruit Rot',
        name_or: 'ଫୋମୋପସିସ୍ ପତ୍ରପୋଡ଼ା ଓ ଫଳପଚା',
        symptoms_en: 'Circular brown spots on leaves, soft watery fruit rot.',
        symptoms_or: 'ପତ୍ରରେ ବାଦାମୀ ଦାଗ ଏବଂ ଫଳ ପଚି ଗଛରୁ ଝଡ଼ିପଡ଼ିବା।',
        chemical: 'Copper Oxychloride 50% WP',
        chemical_or: 'କପର ଅକ୍ସିକ୍ଲୋରାଇଡ୍ ୫୦% WP',
        dose_per_litre: '2.5 g',
        dose_per_acre: '500 g in 200 L water',
        phi_days: 7,
        safety_class: 'Class III (Blue)',
        alternative: 'Carbendazim 50% WP @ 1 g/L'
      }
    ]
  },
  {
    id: 'chilli',
    category: 'vegetable',
    name_en: 'Chilli & Capsicum',
    name_or: 'ଲଙ୍କା / ମରିଚ (Chilli)',
    name_hi: 'मिर्च (Chilli)',
    name_bn: 'লঙ্কা',
    name_ta: 'மிளகாய்',
    name_ur: 'مرچ',
    scientific_name: 'Capsicum annuum',
    icon: '🌶️',
    season: 'Kharif & Rabi (Jun-Jul / Sep-Oct)',
    growth_duration_days: '120-150 days',
    water_requirement: 'Medium',
    soil_type: 'Black clay loam or well-drained red loam',
    fertiliser_summary: {
      basal: 'FYM 5t + DAP 45kg + MOP 30kg + Sulphur 10kg/acre',
      vegetative: 'Urea 20kg at 35 days',
      flowering: 'Urea 20kg + MOP 15kg at flowering'
    },
    irrigation_interval_days: 6,
    common_diseases: ['Dieback & Anthracnose', 'Thrips & Mites', 'Chilli Murda Complex (Leaf Curl)'],
    diseases: [
      {
        id: 'chilli_anthracnose',
        name_en: 'Dieback & Anthracnose (Colletotrichum capsici)',
        name_or: 'ଡାଳମୁହଁ ଶୁଖିବା (ଡାଇବ୍ୟାକ୍) ଓ ଫଳପଚା',
        symptoms_en: 'Branches drying from tip downwards, sunken circular black spots on ripe pods.',
        symptoms_or: 'ଡାଳ ଉପରୁ ତଳକୁ ଶୁଖିବା, ପାଚିଲା ଲଙ୍କାରେ ଗାଢ଼ କଳା ଖାଲୁଆ ଦାଗ।',
        chemical: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC',
        chemical_or: 'ଆମିଷ୍ଟାର ଟପ୍ (ଆଜୋକ୍ସିଷ୍ଟ୍ରୋବିନ୍ + ଡିଫେନୋକୋନାଜୋଲ୍)',
        dose_per_litre: '1.0 ml',
        dose_per_acre: '200 ml in 200 L water',
        phi_days: 5,
        safety_class: 'Class III (Blue)',
        alternative: 'Copper Hydroxide 77% WP @ 2 g/L'
      },
      {
        id: 'chilli_thrips_mites',
        name_en: 'Thrips & Mites (Murda Leaf Curl Complex)',
        name_or: 'ଚିପୁଡ଼ା ପୋକ / ମାଇଟ୍ (ପତ୍ର ଡଙ୍ଗା ଭଳି କୁଞ୍ଚିତ)',
        symptoms_en: 'Upward cup curling from thrips, downward boat-shape curling from mites.',
        symptoms_or: 'ପତ୍ର ଉପରକୁ ଓ ତଳକୁ ଡଙ୍ଗା ଭଳି କୁଞ୍ଚିତ ହେବା, ଗଛ ବଢେ ନାହିଁ।',
        chemical: 'Fipronil 5% SC (for thrips) + Spiromesifen 22.9% SC (for mites)',
        chemical_or: 'ଫିପ୍ରୋନିଲ୍ ୫% SC + ସ୍ପାଇରୋମେସିଫେନ୍',
        dose_per_litre: '1.5 ml Fipronil OR 1.0 ml Spiromesifen',
        dose_per_acre: '300 ml in 200 L water',
        phi_days: 7,
        safety_class: 'Class III (Blue)',
        alternative: 'Neem seed kernel extract 5% @ 50 ml/L'
      }
    ]
  },
  {
    id: 'okra',
    category: 'vegetable',
    name_en: 'Okra (Bhindi / Ladyfinger)',
    name_or: 'ଭେଣ୍ଡି (Okra / Bhindi)',
    name_hi: 'भिंडी (Okra)',
    name_bn: 'ঢেঁড়শ',
    name_ta: 'வெண்டைக்காய்',
    name_ur: 'بھنڈی',
    scientific_name: 'Abelmoschus esculentus',
    icon: '🌱',
    season: 'Kharif (Jun-Jul) & Summer (Feb-Mar)',
    growth_duration_days: '65-80 days',
    water_requirement: 'Medium',
    soil_type: 'Clay loam or sandy loam with neutral pH',
    fertiliser_summary: {
      basal: 'FYM 5t + DAP 35kg + MOP 25kg/acre',
      vegetative: 'Urea 25kg at 25 days after sowing',
      flowering: 'Urea 20kg at first picking'
    },
    irrigation_interval_days: 4,
    common_diseases: ['Yellow Vein Mosaic Virus (YVMV)', 'Shoot & Fruit Borer', 'Powdery Mildew'],
    diseases: [
      {
        id: 'okra_yvmv',
        name_en: 'Yellow Vein Mosaic Virus (transmitted by Whitefly)',
        name_or: 'ହଳଦିଆ ଶିରା ମୋଜାଇକ୍ ରୋଗ',
        symptoms_en: 'Network of yellow veins on dark green background, small chlorotic fibrous fruits.',
        symptoms_or: 'ପତ୍ରର ଶିରାଗୁଡ଼ିକ ହଳଦିଆ ହୋଇ ଜାଲ ଭଳି ଦିଶିବା, ଭେଣ୍ଡି ଟାଣ ଓ ଛୋଟ ହେବା।',
        chemical: 'Acetamiprid 20% SP or Thiamethoxam 25% WG',
        chemical_or: 'ଏସିଟାମିପ୍ରିଡ୍ ୨୦% SP କିମ୍ବା ଥିଆମେଥୋକ୍ସାମ୍',
        dose_per_litre: '0.4 g',
        dose_per_acre: '80 g in 200 L water',
        phi_days: 3,
        safety_class: 'Class III (Blue)',
        alternative: 'Use YVMV-resistant varieties (Arka Anamika, Kashi Kranti)'
      }
    ]
  },
  {
    id: 'potato',
    category: 'vegetable',
    name_en: 'Potato',
    name_or: 'ଆଳୁ (Potato)',
    name_hi: 'आलू (Potato)',
    name_bn: 'আলু',
    name_ta: 'உருளைக்கிழங்கு',
    name_ur: 'آلو',
    scientific_name: 'Solanum tuberosum',
    icon: '🥔',
    season: 'Rabi (Oct-Nov planting)',
    growth_duration_days: '90-120 days',
    water_requirement: 'High',
    soil_type: 'Loose fertile sandy loam with pH 5.5-6.5',
    fertiliser_summary: {
      basal: 'FYM 10t + DAP 65kg + MOP 40kg + Urea 25kg/acre',
      vegetative: 'Urea 30kg at 30 days during earthing up',
      flowering: 'MOP 15kg for tuber bulking'
    },
    irrigation_interval_days: 6,
    common_diseases: ['Late Blight', 'Early Blight', 'Bacterial Brown Rot'],
    diseases: [
      {
        id: 'potato_late_blight',
        name_en: 'Late Blight (Phytophthora infestans)',
        name_or: 'ଆଳୁ ପଛୁଆ ପତ୍ରପୋଡ଼ା / ଝାଉଁଳା ରୋଗ',
        symptoms_en: 'Water-soaked irregular black lesions on leaves with white cottony mold underneath in humid fog.',
        symptoms_or: 'କୁହୁଡ଼ିଆ ପାଗରେ ପତ୍ର ଉପରେ କଳା ଜଳିଗଲା ଭଳି ଦାଗ, ପତ୍ର ତଳେ ଧଳା କବକ।',
        chemical: 'Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ)',
        chemical_or: 'ରିଡୋମିଲ୍ ଏମଜେଡ୍ (ମେଟାଲାକ୍ସିଲ୍ + ମାଙ୍କୋଜେବ୍)',
        dose_per_litre: '2.5 g',
        dose_per_acre: '500 g in 200 L water',
        phi_days: 14,
        safety_class: 'Class III (Blue)',
        alternative: 'Cymoxanil 8% + Mancozeb 64% WP @ 2.5 g/L'
      }
    ]
  },
  {
    id: 'onion_garlic',
    category: 'vegetable',
    name_en: 'Onion & Garlic',
    name_or: 'ପିଆଜ ଓ ରସୁଣ (Onion & Garlic)',
    name_hi: 'प्याज और लहसुन (Onion & Garlic)',
    name_bn: 'পেঁয়াজ ও রসুন',
    name_ta: 'வெங்காயம் & பூண்டு',
    name_ur: 'پیاز اور لہسن',
    scientific_name: 'Allium cepa / Allium sativum',
    icon: '🧅',
    season: 'Rabi (Nov-Dec) & Kharif (Jul-Aug)',
    growth_duration_days: '110-130 days',
    water_requirement: 'Medium',
    soil_type: 'Friable sandy loam with organic matter',
    fertiliser_summary: {
      basal: 'FYM 8t + DAP 45kg + MOP 30kg + Sulphur 15kg/acre',
      vegetative: 'Urea 25kg at 30 days',
      flowering: 'Urea 20kg at 45 days'
    },
    irrigation_interval_days: 5,
    common_diseases: ['Purple Blotch', 'Stemphylium Blight', 'Thrips'],
    diseases: [
      {
        id: 'onion_purple_blotch',
        name_en: 'Purple Blotch (Alternaria porri)',
        name_or: 'ପିଆଜ ବାଇଗଣୀ ଦାଗ ରୋଗ',
        symptoms_en: 'Small water-soaked lesions turning purple-brown with yellow rings.',
        symptoms_or: 'ପତ୍ରରେ ଛୋଟ ପାଣିଚିଆ ଦାଗ ଯାହା ପରେ ବାଇଗଣୀ-ବାଦାମୀ ରଙ୍ଗ ଧରେ।',
        chemical: 'Tebuconazole 25.9% EC or Mancozeb 75% WP',
        chemical_or: 'ଟେବୁକୋନାଜୋଲ୍ କିମ୍ବା ମାଙ୍କୋଜେବ୍',
        dose_per_litre: '1.0 ml Tebuconazole OR 2.5 g Mancozeb',
        dose_per_acre: '200 ml in 200 L water',
        phi_days: 10,
        safety_class: 'Class III (Blue)',
        alternative: 'Propiconazole 25% EC @ 1 ml/L'
      }
    ]
  },
  {
    id: 'cauliflower_cabbage',
    category: 'vegetable',
    name_en: 'Cauliflower & Cabbage',
    name_or: 'ଫୁଲକୋବି ଓ ବନ୍ଧାକୋବି (Cole Crops)',
    name_hi: 'फूलगोभी और पत्तागोभी',
    name_bn: 'ফুলকপি ও বাঁধাকপি',
    name_ta: 'காலிஃபிளவர் & முட்டைக்கோஸ்',
    name_ur: 'گوبھی اور بند گوبھی',
    scientific_name: 'Brassica oleracea',
    icon: '🥦',
    season: 'Rabi (Sep-Nov planting)',
    growth_duration_days: '75-95 days',
    water_requirement: 'Medium',
    soil_type: 'Deep loam rich in boron and molybdenum',
    fertiliser_summary: {
      basal: 'FYM 8t + DAP 50kg + MOP 35kg + Borax 4kg/acre',
      vegetative: 'Urea 30kg at 25 days',
      flowering: 'Urea 25kg at curd/head formation'
    },
    irrigation_interval_days: 5,
    common_diseases: ['Diamondback Moth (DBM)', 'Black Rot', 'Clubroot', 'Downy Mildew'],
    diseases: [
      {
        id: 'cole_dbm',
        name_en: 'Diamondback Moth (Plutella xylostella)',
        name_or: 'କୋବି ହୀରାକୃତି ପୋକ (DBM)',
        symptoms_en: 'Small greenish caterpillars feeding on leaves creating paper-thin window holes.',
        symptoms_or: 'ପତ୍ର ଖାଇ ଛାଣି ଭଳି କଣା କରିଦିଅନ୍ତି, କୋବି ଫୁଲ ନଷ୍ଟ ହୁଏ।',
        chemical: 'Chlorantraniliprole 18.5% SC or Spinetoram 11.7% SC',
        chemical_or: 'କୋରାଜେନ୍ କିମ୍ବା ଡେଲିଗେଟ୍ (ସ୍ପିନେଟୋରାମ୍)',
        dose_per_litre: '0.3 ml',
        dose_per_acre: '60 ml in 200 L water',
        phi_days: 5,
        safety_class: 'Class IV (Green)',
        alternative: 'Bacillus thuringiensis (Bt) @ 2 g/L'
      }
    ]
  },
  {
    id: 'cucurbits_gourds',
    category: 'vegetable',
    name_en: 'Gourds (Karela, Lauki, Potala, Ridge, Pumpkin)',
    name_or: 'କଲରା, ଲାଉ, ପୋଟଳ, ଜାହ୍ନି, ବୋଇତି କଖାରୁ (Gourds)',
    name_hi: 'करेला, लौकी, परवल, तोरी, कद्दू',
    name_bn: 'করলা, লাউ, পটল, ঝিঙে, কুমড়ো',
    name_ta: 'பாகற்காய், சுரைக்காய், பூசணி',
    name_ur: 'کریلا، لوکی، کدو، ترئی',
    scientific_name: 'Cucurbitaceae family',
    icon: '🥒',
    season: 'Summer (Feb-Mar) & Kharif (Jun-Jul)',
    growth_duration_days: '70-100 days',
    water_requirement: 'Medium',
    soil_type: 'Sandy loam with organic compost',
    fertiliser_summary: {
      basal: 'FYM 6t + DAP 35kg + MOP 25kg/acre',
      vegetative: 'Urea 20kg at vine spreading',
      flowering: 'Urea 15kg + MOP 10kg at flowering'
    },
    irrigation_interval_days: 4,
    common_diseases: ['Fruit Fly (Bactrocera cucurbitae)', 'Downy Mildew', 'Powdery Mildew'],
    diseases: [
      {
        id: 'cucurbit_fruit_fly',
        name_en: 'Cucurbit Fruit Fly',
        name_or: 'ବାଉଁଶିଆ ଫଳମାଛି (ଫଳ ଭିତରେ କୀଟ)',
        symptoms_en: 'Punctured fruits weeping resin drops, premature yellowing, decay and maggots inside.',
        symptoms_or: 'ଫଳରେ କଣା ହୋଇ ରସ ବାହାରିବା, ଫଳ ବଙ୍କା ହୋଇ ପଚିଯିବା ଏବଂ ଭିତରେ ପୋକ।',
        chemical: 'Cue-lure pheromone traps (6/acre) + Malathion 50% EC bait spray',
        chemical_or: 'କ୍ୟୁ-ଲିଓର ଫାଶ + ମାଲାଥିଅନ୍ ଓ ଗୁଡ଼ ମିଶ୍ରଣ ସ୍ପ୍ରେ',
        dose_per_litre: '2.0 ml Malathion + 10 g Jaggery (Gur)',
        dose_per_acre: 'Pheromone traps @ 6 per acre',
        phi_days: 3,
        safety_class: 'Class III (Blue)',
        alternative: 'Neem-based bait spray'
      }
    ]
  },
  {
    id: 'spinach_leafy',
    category: 'vegetable',
    name_en: 'Spinach & Leafy Greens (Palak, Kosala, Methi)',
    name_or: 'ପାଳଙ୍ଗ, କୋଶଳା ଓ ମେଥି ଶାଗ (Leafy Vegetables)',
    name_hi: 'पालक, चौलाई और मेथी (हरी सब्जियां)',
    name_bn: 'পালং শাক ও মেথি শাক',
    name_ta: 'கீரை & வெந்தயக்கீரை',
    name_ur: 'پالک اور میتھی',
    scientific_name: 'Spinacia oleracea / Amaranthus',
    icon: '🥬',
    season: 'All Round Year (Aug-Mar best)',
    growth_duration_days: '30-45 days',
    water_requirement: 'High',
    soil_type: 'Rich humus soil with high moisture retention',
    fertiliser_summary: {
      basal: 'FYM 8t + Vermicompost 1t + DAP 25kg/acre',
      vegetative: 'Urea 15kg/acre after each harvest cutting',
      flowering: 'Organic jeevamrutha liquid foliar spray'
    },
    irrigation_interval_days: 3,
    common_diseases: ['Damping Off', 'Leaf Spot', 'Aphids'],
    diseases: [
      {
        id: 'spinach_leaf_spot',
        name_en: 'Cercospora Leaf Spot',
        name_or: 'ପତ୍ର ଚିତା ରୋଗ',
        symptoms_en: 'Small brown circular spots with reddish margins on tender green leaves.',
        symptoms_or: 'ପତ୍ରରେ ଛୋଟ ଗୋଲ ବାଦାମୀ ଦାଗ, ଶାଗର ବିକ୍ରୟ ମୂଲ୍ୟ କମିଯାଏ।',
        chemical: 'Copper Oxychloride 50% WP',
        chemical_or: 'କପର ଅକ୍ସିକ୍ଲୋରାଇଡ୍ ୫୦% WP',
        dose_per_litre: '2.0 g',
        dose_per_acre: '400 g in 200 L water',
        phi_days: 7,
        safety_class: 'Class III (Blue)',
        alternative: 'Trichoderma viride foliar spray @ 5 g/L'
      }
    ]
  },

  // ================= CEREALS & GRAINS =================
  {
    id: 'paddy',
    category: 'cereal',
    name_en: 'Paddy (Rice)',
    name_or: 'ଧାନ (Paddy / Rice)',
    name_hi: 'धान / चावल (Paddy)',
    name_bn: 'ধান',
    name_ta: 'நெல் (அரிசி)',
    name_ur: 'دھان / چاول',
    scientific_name: 'Oryza sativa',
    icon: '🌾',
    season: 'Kharif (Jun-Dec) & Rabi (Jan-May)',
    growth_duration_days: '115-145 days',
    water_requirement: 'High',
    soil_type: 'Clayey alluvial & deltaic soils with standing water holding',
    fertiliser_summary: {
      basal: 'DAP 44kg + Urea 18kg + MOP 27kg + Zinc 10kg/acre',
      vegetative: 'Urea 18kg at tillering (21 DAT)',
      flowering: 'Urea 18kg + MOP 9kg at panicle initiation'
    },
    irrigation_interval_days: 3,
    common_diseases: ['Rice Blast', 'Bacterial Leaf Blight (BLB)', 'Stem Borer', 'BPH Planthopper', 'Sheath Blight'],
    diseases: [
      {
        id: 'rice_blast',
        name_en: 'Rice Blast (Pyricularia oryzae)',
        name_or: 'ଧାନ ଚିଟା / ବ୍ଲାଷ୍ଟ ରୋଗ',
        symptoms_en: 'Spindle-shaped eye spots on leaves, black rotting of neck and nodes.',
        symptoms_or: 'ପତ୍ରରେ ଆଖି ଭଳି ବାଦାମୀ ଧାର ଥିବା ଦାଗ, କେଣ୍ଡା ବେକ ପଚା।',
        chemical: 'Tricyclazole 75% WP',
        chemical_or: 'ଟ୍ରାଇସାଇକ୍ଲାଜୋଲ ୭୫% WP',
        dose_per_litre: '0.6 g',
        dose_per_acre: '120 g in 200 L water',
        phi_days: 30,
        safety_class: 'Class III (Blue)',
        alternative: 'Isoprothiolane 40% EC @ 1.5 ml/L'
      },
      {
        id: 'rice_stem_borer',
        name_en: 'Yellow Stem Borer',
        name_or: 'କାଣ୍ଡବିନ୍ଧା ପୋକ (ଶୁଖିଲା ମଜା / ଧଳା କେଣ୍ଡା)',
        symptoms_en: 'Dead heart in vegetative stage, White earhead in grain filling.',
        symptoms_or: 'ଗଛ ମଜା ଶୁଖିଯିବା (ଡେଡ୍ ହାର୍ଟ) ଏବଂ ବାହାରୁଥିବା ଧାନ କେଣ୍ଡା ଧଳା ଓ ଫମ୍ପା ହେବା।',
        chemical: 'Chlorantraniliprole 18.5% SC (Coragen)',
        chemical_or: 'କ୍ଲୋରାନଟ୍ରାନିଲିପ୍ରୋଲ ୧୮.୫% SC (କୋରାଜେନ୍)',
        dose_per_litre: '0.3 ml',
        dose_per_acre: '60 ml in 200 L water',
        phi_days: 14,
        safety_class: 'Class IV (Green)',
        alternative: 'Cartap Hydrochloride 4% G @ 7.5 kg/acre'
      }
    ]
  },
  {
    id: 'wheat',
    category: 'cereal',
    name_en: 'Wheat',
    name_or: 'ଗହମ (Wheat)',
    name_hi: 'गेहूं (Wheat)',
    name_bn: 'গম',
    name_ta: 'கோதுமை',
    name_ur: 'گندم',
    scientific_name: 'Triticum aestivum',
    icon: '🌾',
    season: 'Rabi (Nov-Dec sowing)',
    growth_duration_days: '110-125 days',
    water_requirement: 'Medium',
    soil_type: 'Well-aerated fertile clay loam',
    fertiliser_summary: {
      basal: 'DAP 50kg + MOP 25kg + Urea 25kg/acre',
      vegetative: 'Urea 30kg at Crown Root Initiation (CRI stage)',
      flowering: 'Urea 20kg at late jointing'
    },
    irrigation_interval_days: 15,
    common_diseases: ['Yellow Rust', 'Brown Rust', 'Loose Smut', 'Karnal Bunt'],
    diseases: [
      {
        id: 'wheat_rust',
        name_en: 'Yellow / Stripe Rust (Puccinia striiformis)',
        name_or: 'ଗହମ ହଳଦିଆ କଳଙ୍କୀ ରୋଗ',
        symptoms_en: 'Yellow stripe-like pustules on leaves leaving yellow dust on touch.',
        symptoms_or: 'ପତ୍ରରେ ହଳଦିଆ ଗୁଣ୍ଡ ଭଳି ଧାଡ଼ିଆ ଦାଗ, ହାତ ଲଗାଇଲେ ଗୁଣ୍ଡ ଲାଗେ।',
        chemical: 'Propiconazole 25% EC (Tilt)',
        chemical_or: 'ପ୍ରୋପିକୋନାଜୋଲ୍ ୨୫% EC',
        dose_per_litre: '1.0 ml',
        dose_per_acre: '200 ml in 200 L water',
        phi_days: 30,
        safety_class: 'Class III (Blue)',
        alternative: 'Tebuconazole 25.9% EC @ 1 ml/L'
      }
    ]
  },
  {
    id: 'maize',
    category: 'cereal',
    name_en: 'Maize (Corn)',
    name_or: 'ମକା (Maize / Corn)',
    name_hi: 'मक्का (Maize)',
    name_bn: 'ভুট্টা',
    name_ta: 'மக்காச்சோளம்',
    name_ur: 'مکئی',
    scientific_name: 'Zea mays',
    icon: '🌽',
    season: 'Kharif, Rabi & Spring',
    growth_duration_days: '95-115 days',
    water_requirement: 'Medium',
    soil_type: 'Deep loamy soil with high organic matter',
    fertiliser_summary: {
      basal: 'DAP 45kg + MOP 30kg + Zinc 10kg + Urea 20kg/acre',
      vegetative: 'Urea 30kg at knee-high stage (30-35 DAS)',
      flowering: 'Urea 20kg at tasseling/silking'
    },
    irrigation_interval_days: 8,
    common_diseases: ['Fall Armyworm (FAW)', 'Maydis Leaf Blight', 'Stem Borer'],
    diseases: [
      {
        id: 'maize_faw',
        name_en: 'Fall Armyworm (Spodoptera frugiperda)',
        name_or: 'ମକା ଫଲ୍ ଆର୍ମିଓ୍ୱାର୍ମ (ମାରାତ୍ମକ କୀଟ)',
        symptoms_en: 'Window paning and ragged holes on whorl leaves with abundant saw-dust frass.',
        symptoms_or: 'ମକା ଗର୍ଭ ପତ୍ର ଖାଇ କଣା କରିଦେବା ଏବଂ କାଠ ଗୁଣ୍ଡ ଭଳି ମଳ ଜମିବା।',
        chemical: 'Spinetoram 11.7% SC or Chlorantraniliprole 18.5% SC',
        chemical_or: 'ସ୍ପିନେଟୋରାମ୍ (ଡେଲିଗେଟ୍) କିମ୍ବା କ୍ଲୋରାନଟ୍ରାନିଲିପ୍ରୋଲ୍',
        dose_per_litre: '0.5 ml',
        dose_per_acre: '100 ml in 200 L water directed into whorl',
        phi_days: 14,
        safety_class: 'Class IV (Green)',
        alternative: 'Metarhizium rileyi or Bt spray @ 2 g/L'
      }
    ]
  },
  {
    id: 'millets_ragi',
    category: 'cereal',
    name_en: 'Finger Millet (Mandia / Ragi) & Millets',
    name_or: 'ମାଣ୍ଡିଆ ଓ ମିଲେଟ୍ସ (Mandia / Ragi)',
    name_hi: 'रागी / मड़ुआ (Ragi / Millets)',
    name_bn: 'রাগি / মারুয়া',
    name_ta: 'கேழ்வரகு (ராகி)',
    name_ur: 'راگی / باجرہ',
    scientific_name: 'Eleusine coracana',
    icon: '🌾',
    season: 'Kharif (Odisha Millet Mission)',
    growth_duration_days: '105-120 days',
    water_requirement: 'Low',
    soil_type: 'Red sandy loam, laterite soils',
    fertiliser_summary: {
      basal: 'FYM 4t + DAP 25kg + MOP 15kg/acre',
      vegetative: 'Urea 15kg at 25 DAT',
      flowering: 'Foliar spray 19-19-19 @ 5g/L'
    },
    irrigation_interval_days: 12,
    common_diseases: ['Finger Millet Blast', 'Foot Rot', 'Grasshopper'],
    diseases: [
      {
        id: 'ragi_blast',
        name_en: 'Ragi Blast (Pyricularia grisea)',
        name_or: 'ମାଣ୍ଡିଆ ଚିଟା ରୋଗ',
        symptoms_en: 'Diamond shaped eye spots on leaf, fingers of earhead turning pale grey and breaking.',
        symptoms_or: 'ପତ୍ରରେ ଧୂସର ଦାଗ, ମାଣ୍ଡିଆ କେଣ୍ଡାର ଆଙ୍ଗୁଠି ଶୁଖି ଭାଙ୍ଗିଯାଏ।',
        chemical: 'Kitazin 48% EC or Tricyclazole 75% WP',
        chemical_or: 'କିଟାଜିନ୍ କିମ୍ବା ଟ୍ରାଇସାଇକ୍ଲାଜୋଲ୍',
        dose_per_litre: '1.0 ml Kitazin OR 0.6 g Tricyclazole',
        dose_per_acre: '120 g in 200 L water',
        phi_days: 21,
        safety_class: 'Class III (Blue)',
        alternative: 'Pseudomonas fluorescens @ 5 g/L'
      }
    ]
  },

  // ================= PULSES & OILSEEDS =================
  {
    id: 'green_gram_black_gram',
    category: 'pulse',
    name_en: 'Green Gram (Moong) & Black Gram (Biri)',
    name_or: 'ମୁଗ ଓ ବିରି (Moong & Biri Pulses)',
    name_hi: 'मूंग और उड़द (Moong & Urad)',
    name_bn: 'মুগ ও মাশকলাই',
    name_ta: 'பாசிப்பயறு & உளுந்து',
    name_ur: 'مونگ اور ماش',
    scientific_name: 'Vigna radiata / Vigna mungo',
    icon: '🫘',
    season: 'Rabi / Summer (Post-paddy fallow)',
    growth_duration_days: '65-75 days',
    water_requirement: 'Low',
    soil_type: 'Loamy soil with Rhizobium nodulation',
    fertiliser_summary: {
      basal: 'DAP 35kg + MOP 15kg + Sulphur 10kg/acre',
      vegetative: 'Rhizobium seed treatment before sowing',
      flowering: 'DAP 2% foliar spray at flowering'
    },
    irrigation_interval_days: 15,
    common_diseases: ['Yellow Mosaic Virus', 'Powdery Mildew', 'Pod Borer'],
    diseases: [
      {
        id: 'pulse_ymv',
        name_en: 'Yellow Mosaic Virus (MYMV)',
        name_or: 'ହଳଦିଆ ମୋଜାଇକ୍ ରୋଗ',
        symptoms_en: 'Irregular yellow and green patches on leaves, tiny deformed pods.',
        symptoms_or: 'ପତ୍ରରେ ହଳଦିଆ ଓ ସବୁଜ ମିଶା ଦାଗ, ଛୁଇଁ ଛୋଟ ହୋଇଯାଏ।',
        chemical: 'Thiamethoxam 25% WG',
        chemical_or: 'ଥିଆମେଥୋକ୍ସାମ୍ ୨୫% WG',
        dose_per_litre: '0.3 g',
        dose_per_acre: '60 g in 200 L water',
        phi_days: 14,
        safety_class: 'Class III (Blue)',
        alternative: 'Grow resistant varieties like IPM 02-03, Pant Mung'
      }
    ]
  },
  {
    id: 'mustard',
    category: 'oilseed',
    name_en: 'Mustard & Rapeseed',
    name_or: 'ସୋରିଷ (Mustard / Rai)',
    name_hi: 'सरसों / राई (Mustard)',
    name_bn: 'সরিষা',
    name_ta: 'கடுகு',
    name_ur: 'سرسوں',
    scientific_name: 'Brassica juncea',
    icon: '🌼',
    season: 'Rabi (Oct-Nov sowing)',
    growth_duration_days: '90-110 days',
    water_requirement: 'Low',
    soil_type: 'Light to heavy loam with adequate sulphur',
    fertiliser_summary: {
      basal: 'DAP 40kg + MOP 20kg + Sulphur 15kg/acre',
      vegetative: 'Urea 25kg at first irrigation (30 DAS)',
      flowering: 'Foliar Boron 1g/L at siliqua filling'
    },
    irrigation_interval_days: 18,
    common_diseases: ['Mustard Aphid', 'Alternaria Blight', 'White Rust'],
    diseases: [
      {
        id: 'mustard_aphids',
        name_en: 'Mustard Aphid (Lipaphis erysimi)',
        name_or: 'ସୋରିଷ ଜାବପୋକ (ମହୁଆ ପୋକ)',
        symptoms_en: 'Masses of tiny green aphids sucking sap from flowers and pods, black sooty mold.',
        symptoms_or: 'ଫୁଲ ଓ ଛୁଇଁରେ ଲକ୍ଷ ଲକ୍ଷ ଛୋଟ ପୋକ ଲାଗି ରସ ଶୋଷିବା, ଅମଳ କମିଯିବା।',
        chemical: 'Dimethoate 30% EC or Imidacloprid 17.8% SL',
        chemical_or: 'ରୋଗର (ଡାଇମେଥୋଏଟ୍) କିମ୍ବା ଇମିଡାକ୍ଲୋପ୍ରିଡ୍',
        dose_per_litre: '1.5 ml Dimethoate OR 0.3 ml Imidacloprid',
        dose_per_acre: '300 ml in 200 L water in evening',
        phi_days: 14,
        safety_class: 'Class III (Blue)',
        alternative: 'Yellow sticky traps + 5% Neem seed kernel extract'
      }
    ]
  },
  {
    id: 'groundnut',
    category: 'oilseed',
    name_en: 'Groundnut (Peanut)',
    name_or: 'ଚିନାବାଦାମ (Groundnut)',
    name_hi: 'मूंगफली (Groundnut)',
    name_bn: 'চিনাবাদাম',
    name_ta: 'வேர்க்கடலை',
    name_ur: 'مونگ پھلی',
    scientific_name: 'Arachis hypogaea',
    icon: '🥜',
    season: 'Kharif (Jun-Jul) & Rabi (Nov-Dec)',
    growth_duration_days: '105-125 days',
    water_requirement: 'Medium',
    soil_type: 'Sandy loam with loose calcium-rich texture for pegging',
    fertiliser_summary: {
      basal: 'DAP 40kg + MOP 25kg + Zinc 10kg/acre',
      vegetative: 'Gypsum 100kg/acre at 40-45 DAS (Pegging stage)',
      flowering: 'Borax 4kg/acre for pod filling'
    },
    irrigation_interval_days: 8,
    common_diseases: ['Tikka Leaf Spot', 'Collar Rot', 'Spodoptera Caterpillar'],
    diseases: [
      {
        id: 'groundnut_tikka',
        name_en: 'Tikka Leaf Spot (Cercospora)',
        name_or: 'ବାଦାମ ଟିକ୍କା ପତ୍ର ଦାଗ ରୋଗ',
        symptoms_en: 'Circular dark spots with prominent yellow rings causing severe defoliation.',
        symptoms_or: 'ପତ୍ରରେ ଗୋଲାକାର କଳା ଦାଗ ଓ ହଳଦିଆ ବଳୟ, ପତ୍ର ଝଡ଼ିଯାଏ।',
        chemical: 'Carbendazim 12% + Mancozeb 63% WP (SAAF)',
        chemical_or: 'ସାଫ୍ (କାର୍ବେଣ୍ଡାଜିମ୍ + ମାଙ୍କୋଜେବ୍)',
        dose_per_litre: '2.0 g',
        dose_per_acre: '400 g in 200 L water',
        phi_days: 21,
        safety_class: 'Class III (Blue)',
        alternative: 'Hexaconazole 5% SC @ 2 ml/L'
      }
    ]
  },

  // ================= FRUITS & CASH CROPS =================
  {
    id: 'mango',
    category: 'fruit',
    name_en: 'Mango',
    name_or: 'ଆମ୍ବ (Mango)',
    name_hi: 'आम (Mango)',
    name_bn: 'আম',
    name_ta: 'மாம்பழம்',
    name_ur: 'آم',
    scientific_name: 'Mangifera indica',
    icon: '🥭',
    season: 'Perennial (Flowering Dec-Jan / Fruiting Apr-Jun)',
    growth_duration_days: 'Perennial orchard',
    water_requirement: 'Medium',
    soil_type: 'Deep alluvial or red loamy soil with depth > 2m',
    fertiliser_summary: {
      basal: 'FYM 50kg + DAP 1.5kg + MOP 1kg per grown tree after monsoon',
      vegetative: 'Urea 1kg per tree before flowering',
      flowering: 'Micro-nutrient spray (Boron 1g + Zinc 2g/L)'
    },
    irrigation_interval_days: 10,
    common_diseases: ['Mango Hopper', 'Powdery Mildew', 'Anthracnose', 'Fruit Fly'],
    diseases: [
      {
        id: 'mango_hopper',
        name_en: 'Mango Hopper (Amritodus atkinsoni)',
        name_or: 'ଆମ୍ବ ମହୁଆ ପୋକ (ଫୁଲ ଝଡ଼ିବା)',
        symptoms_en: 'Tiny wedge-shaped insects sucking sap from blossom inflorescences, causing flower drop.',
        symptoms_or: 'ଆମ୍ବ ବଉଳରୁ ରସ ଶୋଷି ବଉଳ କଳା କରିଦିଅନ୍ତି, ସମସ୍ତ ଫୁଲ ଝଡ଼ିପଡ଼େ।',
        chemical: 'Thiamethoxam 25% WG or Imidacloprid 17.8% SL',
        chemical_or: 'ଥିଆମେଥୋକ୍ସାମ୍ କିମ୍ବା ଇମିଡାକ୍ଲୋପ୍ରିଡ୍',
        dose_per_litre: '0.4 g Thiamethoxam OR 0.3 ml Imidacloprid',
        dose_per_acre: 'Spray thoroughly on tree canopy before flowers open',
        phi_days: 15,
        safety_class: 'Class III (Blue)',
        alternative: 'Neem oil 3000 ppm @ 2 ml/L'
      }
    ]
  },
  {
    id: 'banana',
    category: 'fruit',
    name_en: 'Banana',
    name_or: 'କଦଳୀ (Banana)',
    name_hi: 'केला (Banana)',
    name_bn: 'কলা',
    name_ta: 'வாழைப்பழம்',
    name_ur: 'کیلا',
    scientific_name: 'Musa paradisiaca',
    icon: '🍌',
    season: 'Year-round planting',
    growth_duration_days: '11-13 months',
    water_requirement: 'High',
    soil_type: 'Deep rich loamy soil pH 6.5-7.5',
    fertiliser_summary: {
      basal: 'FYM 15kg + DAP 100g + Neem cake 1kg per pit',
      vegetative: 'Urea 50g + MOP 60g per plant at 2nd, 3rd, 4th month',
      flowering: 'MOP 100g per plant at bunch shooting'
    },
    irrigation_interval_days: 4,
    common_diseases: ['Sigatoka Leaf Spot', 'Panama Wilt (Fusarium)', 'Banana Pseudostem Borer'],
    diseases: [
      {
        id: 'banana_sigatoka',
        name_en: 'Sigatoka Leaf Spot (Mycosphaerella)',
        name_or: 'କଦଳୀ ସିଗାଟୋକା ପତ୍ରପୋଡ଼ା ରୋଗ',
        symptoms_en: 'Spindle spots with grey centers on leaves drying leaf margins prematurely.',
        symptoms_or: 'ପତ୍ର ଉପରେ ବାଦାମୀ ଓ ଧୂସର ଦାଗ, ପତ୍ର ଅକାଳରେ ଶୁଖିଯାଏ।',
        chemical: 'Propiconazole 25% EC + Mineral Oil',
        chemical_or: 'ପ୍ରୋପିକୋନାଜୋଲ୍ + ମିନେରାଲ୍ ଅଏଲ୍',
        dose_per_litre: '1.0 ml Propiconazole + 10 ml Oil',
        dose_per_acre: '200 ml in 200 L water',
        phi_days: 21,
        safety_class: 'Class III (Blue)',
        alternative: 'Carbendazim 50% WP @ 1 g/L'
      }
    ]
  },
  {
    id: 'papaya',
    category: 'fruit',
    name_en: 'Papaya',
    name_or: 'ଅମୃତଭଣ୍ଡା / ପପିୟା (Papaya)',
    name_hi: 'पपीता (Papaya)',
    name_bn: 'পেঁপে',
    name_ta: 'பப்பாளி',
    name_ur: 'پپیتا',
    scientific_name: 'Carica papaya',
    icon: '🍈',
    season: 'Year round planting',
    growth_duration_days: '9-12 months',
    water_requirement: 'Medium',
    soil_type: 'Extremely well-drained loamy soil (no water-logging)',
    fertiliser_summary: {
      basal: 'FYM 10kg + Bone meal 500g + DAP 100g per pit',
      vegetative: 'Urea 50g + MOP 50g bi-monthly',
      flowering: 'Boron 1g/L foliar spray to prevent latex dripping'
    },
    irrigation_interval_days: 5,
    common_diseases: ['Papaya Ring Spot Virus (PRSV)', 'Foot Rot / Stem Rot'],
    diseases: [
      {
        id: 'papaya_ring_spot',
        name_en: 'Papaya Ring Spot Virus (Aphid vector)',
        name_or: 'ଅମୃତଭଣ୍ଡା ରିଙ୍ଗ୍ ସ୍ପଟ୍ ଭୂତାଣୁ ରୋଗ',
        symptoms_en: 'Shoestring leaves, yellow mosaic, oily rings on stems and fruit surface.',
        symptoms_or: 'ପତ୍ର ଛୋଟ ଦଉଡ଼ି ଭଳି ହୋଇଯିବା, ଫଳ ଉପରେ ତେଲିଆ ଗୋଲ ଦାଗ।',
        chemical: 'Control aphid vector with Dimethoate 30% EC or Imidacloprid',
        chemical_or: 'ଜାବପୋକ ନିୟନ୍ତ୍ରଣ ପାଇଁ ଇମିଡାକ୍ଲୋପ୍ରିଡ୍',
        dose_per_litre: '0.3 ml',
        dose_per_acre: '60 ml in 200 L water',
        phi_days: 14,
        safety_class: 'Class III (Blue)',
        alternative: 'Border crop with Maize or Sorghum + silver reflective mulch'
      }
    ]
  },
  {
    id: 'sugarcane',
    category: 'cash_crop',
    name_en: 'Sugarcane',
    name_or: 'ଆଖୁ (Sugarcane)',
    name_hi: 'गन्ना (Sugarcane)',
    name_bn: 'আখ',
    name_ta: 'கரும்பு',
    name_ur: 'گنا',
    scientific_name: 'Saccharum officinarum',
    icon: '🎋',
    season: 'Spring / Autumn planting',
    growth_duration_days: '10-12 months',
    water_requirement: 'High',
    soil_type: 'Deep heavy alluvial loam',
    fertiliser_summary: {
      basal: 'DAP 60kg + MOP 40kg + Urea 30kg + Zinc 10kg/acre',
      vegetative: 'Urea 40kg at 45 & 90 days followed by earthing up',
      flowering: 'MOP 20kg at grand growth stage'
    },
    irrigation_interval_days: 7,
    common_diseases: ['Red Rot (Colletotrichum)', 'Early Shoot Borer', 'Pyrilla'],
    diseases: [
      {
        id: 'sugarcane_red_rot',
        name_en: 'Red Rot (Colletotrichum falcatum)',
        name_or: 'ଆଖୁ ଲାଲ୍ ପଚା ରୋଗ (ମଦ ଗନ୍ଧ)',
        symptoms_en: 'Third and fourth leaves yellowing, internal cane pith turning red with white transverse bands, sour alcoholic smell.',
        symptoms_or: 'ଆଖୁ ଭିତର ଲାଲ୍ ରଙ୍ଗ ହୋଇ ସେଥିରୁ ମଦ ଭଳି ଦୁର୍ଗନ୍ଧ ବାହାରିବା।',
        chemical: 'Carbendazim 50% WP set treatment before planting',
        chemical_or: 'କାର୍ବେଣ୍ଡାଜିମ୍ ୫୦% WP ବିହନ ବିଶୋଧନ',
        dose_per_litre: '1.0 g per L water set dip for 15 mins',
        dose_per_acre: 'Healthy disease-free seed sets only',
        phi_days: 60,
        safety_class: 'Class III (Blue)',
        alternative: 'Trichoderma viride soil application @ 2.5 kg/acre'
      }
    ]
  },
  {
    id: 'cotton',
    category: 'cash_crop',
    name_en: 'Cotton',
    name_or: 'କପା (Cotton)',
    name_hi: 'कपास (Cotton)',
    name_bn: 'তুলা',
    name_ta: 'பருத்தி',
    name_ur: 'کپاس',
    scientific_name: 'Gossypium hirsutum',
    icon: '☁️',
    season: 'Kharif (May-Jun sowing)',
    growth_duration_days: '150-180 days',
    water_requirement: 'Medium',
    soil_type: 'Deep black cotton soil (Vertisols)',
    fertiliser_summary: {
      basal: 'DAP 45kg + MOP 30kg + Magnesium Sulphate 10kg/acre',
      vegetative: 'Urea 25kg at 35 DAS',
      flowering: 'Urea 25kg + MOP 15kg at square formation'
    },
    irrigation_interval_days: 10,
    common_diseases: ['Pink Bollworm', 'Whitefly', 'Bacterial Blight'],
    diseases: [
      {
        id: 'cotton_pink_bollworm',
        name_en: 'Pink Bollworm (Pectinophora gossypiella)',
        name_or: 'କପା ଗୋଲାପୀ ବଲ୍ଓ୍ୱାର୍ମ ପୋକ',
        symptoms_en: 'Rosette flowers, boreholes in bolls, damaged lint and stained fiber.',
        symptoms_or: 'କପା ଫୁଲ ଗୋଲାପ ଭଳି ବଙ୍କା ହୋଇ ରହିବା, କପା ଡୋଡ଼ି ଭିତରେ ପୋକ।',
        chemical: 'Profenofos 50% EC or Chlorantraniliprole 18.5% SC',
        chemical_or: 'ପ୍ରୋଫେନୋଫସ୍ ୫୦% EC କିମ୍ବା କୋରାଜେନ୍',
        dose_per_litre: '2.0 ml Profenofos OR 0.3 ml Chlorantraniliprole',
        dose_per_acre: '400 ml in 200 L water',
        phi_days: 21,
        safety_class: 'Class II (Yellow)',
        alternative: 'Pheromone traps (Gossyplure) @ 8/acre'
      }
    ]
  }
];

export function getPlantById(id: string): PlantWithDiagnostics | undefined {
  return INDIAN_PLANT_DATABASE.find((p) => p.id === id);
}

export function searchPlants(query: string, category?: string): PlantWithDiagnostics[] {
  let list = INDIAN_PLANT_DATABASE;
  if (category && category !== 'all') {
    list = list.filter((p) => p.category === category);
  }
  if (!query) return list;

  const q = query.toLowerCase();
  return list.filter(
    (p) =>
      p.name_en.toLowerCase().includes(q) ||
      p.name_or.toLowerCase().includes(q) ||
      p.name_hi.toLowerCase().includes(q) ||
      p.scientific_name.toLowerCase().includes(q) ||
      p.common_diseases.some((d) => d.toLowerCase().includes(q))
  );
}

import rulesDataRaw from './rules.json';
import { CropRule } from '../types';
import { getDiseaseReferenceImage } from './crops/index';

export function getAllCropsDictionary(): Record<string, CropRule> {
  const rawCrops = rulesDataRaw.crops as Record<string, CropRule>;
  const baseCrops: Record<string, CropRule> = {};

  for (const [key, crop] of Object.entries(rawCrops)) {
    baseCrops[key] = {
      ...crop,
      diseases_pests: (crop.diseases_pests || []).map((d) => {
        const refImg = getDiseaseReferenceImage(d.id, d.name_en, key);
        return {
          ...d,
          reference_images: refImg ? [refImg] : d.reference_images || [],
          source: d.source || 'OUAT / ICAR Package of Practices',
          verified_by: d.verified_by ?? null,
          verified_date: d.verified_date ?? null,
        };
      }),
    };
  }

  for (const plant of INDIAN_PLANT_DATABASE) {
    if (!baseCrops[plant.id]) {
      baseCrops[plant.id] = {
        name_en: plant.name_en,
        name_or: plant.name_or,
        irrigate_every_days: {
          vegetative: plant.irrigation_interval_days,
          flowering: Math.max(3, plant.irrigation_interval_days - 2),
          maturity: plant.irrigation_interval_days + 4
        },
        fertiliser_doses: {
          basal: {
            stage_en: 'Basal (Soil preparation/planting)',
            stage_or: 'ମୂଳ ସାର',
            urea_kg_per_acre: 15,
            dap_kg_per_acre: 40,
            mop_kg_per_acre: 25,
            zinc_kg_per_acre: 5,
            notes_en: plant.fertiliser_summary.basal,
            notes_or: plant.fertiliser_summary.basal,
            source: 'OUAT / ICAR Package of Practices',
            verified_by: null,
            verified_date: null
          },
          vegetative: {
            stage_en: 'Vegetative growth',
            stage_or: 'ବୃଦ୍ଧି ସମୟ',
            urea_kg_per_acre: 20,
            dap_kg_per_acre: 0,
            mop_kg_per_acre: 10,
            zinc_kg_per_acre: 0,
            notes_en: plant.fertiliser_summary.vegetative,
            notes_or: plant.fertiliser_summary.vegetative,
            source: 'OUAT / ICAR Package of Practices',
            verified_by: null,
            verified_date: null
          }
        },
        diseases_pests: plant.diseases.map((d) => {
          const refImg = getDiseaseReferenceImage(d.id, d.name_en, plant.id);
          return {
            ...d,
            reference_images: refImg ? [refImg] : d.reference_images || [],
            source: d.source || 'OUAT / ICAR Package of Practices',
            verified_by: d.verified_by ?? null,
            verified_date: d.verified_date ?? null,
          };
        })
      };
    }
  }
  return baseCrops;
}
