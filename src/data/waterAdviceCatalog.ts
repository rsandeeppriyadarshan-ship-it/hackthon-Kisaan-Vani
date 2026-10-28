import cropsData from './crops.json';
import rulesDataRaw from './rules.json';
import { Language } from '../types';

export interface PlantWaterStage {
  id: string;
  label_en: string;
  label_or: string;
  intervalDays: number;
  depthMmOrLitersPerAcre: string;
}

export interface PlantWaterProfile {
  id: string;
  icon: string;
  categoryId: string;
  categoryNameEn: string;
  categoryNameOr: string;
  name_en: string;
  name_or: string;
  name_hi?: string;
  name_te?: string;
  name_bn?: string;
  name_ta?: string;
  method_en: string;
  method_or: string;
  critical_note_en: string;
  critical_note_or: string;
  stages: PlantWaterStage[];
}

const STAGE_LABELS_OR: Record<string, { en: string; or: string }> = {
  transplanting: {
    en: 'Transplanting / Establishment',
    or: 'ତଳି ରୁଆ / ଚାରା ଲଗାଇବା ଅବସ୍ଥା'
  },
  tillering: {
    en: 'Tillering Stage',
    or: 'ପିଲ ବାହାରିବା ଅବସ୍ଥା (Tillering)'
  },
  panicle_initiation: {
    en: 'Panicle Initiation (Booting)',
    or: 'ଥୋଡ଼ ବାହାରିବା ଅବସ୍ଥା (Panicle Initiation)'
  },
  flowering: {
    en: 'Flowering Stage',
    or: 'ଫୁଲ ଧରିବା ଅବସ୍ଥା (Flowering)'
  },
  grain_filling: {
    en: 'Grain / Seed Filling',
    or: 'ଦାନା ପୂରଣ ଅବସ୍ଥା (Grain Filling)'
  },
  maturity: {
    en: 'Pre-Harvest / Maturity',
    or: 'ପାଚିବା / ଅମଳ ପୂର୍ବ ଅବସ୍ଥା (Maturity)'
  },
  vegetative: {
    en: 'Vegetative Growth Stage',
    or: 'ଡାଳ ପତ୍ର ବୃଦ୍ଧି ଅବସ୍ଥା (Vegetative)'
  },
  fruiting: {
    en: 'Fruiting & Harvesting Stage',
    or: 'ଫଳ ଧରିବା ଓ ତୋଳିବା ଅବସ୍ଥା (Fruiting)'
  },
  sowing: {
    en: 'Sowing & Germination',
    or: 'ବିହନ ବୁଣା ଓ ଗଜା ବାହାରିବା ଅବସ୍ଥା'
  },
  pegging: {
    en: 'Pegging Stage',
    or: 'ସୂତା / କୀଳା ମାଟିରେ ପଶିବା ଅବସ୍ଥା (Pegging)'
  },
  pod_formation: {
    en: 'Pod Formation & Development',
    or: 'ଛୁଇଁ / ଫଳ ଗଠନ ଅବସ୍ଥା'
  },
  branching: {
    en: 'Branching Stage',
    or: 'ଶାଖା ପ୍ରশাଖା ବାହାରିବା ଅବସ୍ଥା'
  },
  pod_filling: {
    en: 'Pod Filling Stage',
    or: 'ଛୁଇଁରେ ଦାନା ପୂରଣ ଅବସ୍ଥା'
  }
};

function getTailoredStagesAndTipsForPlant(
  itemId: string,
  categoryId: string
): {
  stages: PlantWaterStage[];
  method_en: string;
  method_or: string;
  critical_note_en: string;
  critical_note_or: string;
} {
  // 1. Check if rules.json has specific intervals for this crop
  const rulesCrops = rulesDataRaw.crops as Record<string, any>;
  if (rulesCrops[itemId]?.irrigate_every_days) {
    const rawStages = rulesCrops[itemId].irrigate_every_days as Record<string, number>;
    const stages: PlantWaterStage[] = Object.entries(rawStages).map(([stgKey, days]) => ({
      id: stgKey,
      label_en: STAGE_LABELS_OR[stgKey]?.en || stgKey.replace(/_/g, ' '),
      label_or: STAGE_LABELS_OR[stgKey]?.or || stgKey.replace(/_/g, ' '),
      intervalDays: Number(days) || 4,
      depthMmOrLitersPerAcre: itemId === 'paddy' ? '50 mm (~2,00,000 L/acre)' : '35 mm (~1,40,000 L/acre)'
    }));
    if (itemId === 'paddy') {
      return {
        stages,
        method_en: 'Alternate Wetting & Drying (AWD) — 2 to 5 cm standing water',
        method_or: 'ପର୍ଯ୍ୟାୟକ୍ରମେ ଓଦା ଓ ଶୁଖିଲା (AWD) ପଦ୍ଧତି — ୨ ରୁ ୫ ସେ.ମି. ପାଣି',
        critical_note_en: 'Never let the field crack during Panicle Initiation and Flowering stages.',
        critical_note_or: 'ଥୋଡ଼ ବାହାରିବା ଓ ଫୁଲ ଆସିବା ସମୟରେ ବିଲକୁ ଆଦୌ ଫାଟିବାକୁ ଦିଅନ୍ତୁ ନାହିଁ।'
      };
    }
    return {
      stages,
      method_en: 'Ridge & Furrow or Drip Irrigation',
      method_or: 'ହୁଡ଼ା ଓ ନାଳ (Furrow) କିମ୍ବା ବୁନ୍ଦା ଜଳସେଚନ (Drip)',
      critical_note_en: 'Maintain uniform root-zone moisture during flowering and fruit/pod set; avoid waterlogging.',
      critical_note_or: 'ଫୁଲ ଓ ଫଳ ଧରିବା ସମୟରେ ମାଟିରେ ସମାନ ବତର ରଖନ୍ତୁ; ମୂଳରେ ପାଣି ଜମିବାକୁ ଦିଅନ୍ତୁ ନାହିଁ।'
    };
  }

  // 2. Leafy vegetables (Spinach, Amaranth, Fenugreek, Coriander, Lettuce)
  if (['spinach', 'amaranth', 'fenugreek', 'coriander', 'lettuce'].includes(itemId)) {
    return {
      stages: [
        {
          id: 'germination',
          label_en: 'Sowing & Germination (0–10 days)',
          label_or: 'ବିହନ ବୁଣା ଓ ଗଜା ଅବସ୍ଥା (୦–୧୦ ଦିନ)',
          intervalDays: 3,
          depthMmOrLitersPerAcre: '20 mm (~80,000 L/acre)'
        },
        {
          id: 'leaf_growth',
          label_en: 'Active Leafy Growth (10–30 days)',
          label_or: 'ପତ୍ର ବୃଦ୍ଧି ଅବସ୍ଥା (୧୦–୩୦ ଦିନ)',
          intervalDays: 4,
          depthMmOrLitersPerAcre: '25 mm (~1,00,000 L/acre)'
        },
        {
          id: 'multi_cut_harvest',
          label_en: 'Pre-Harvest / After Leaf Cutting',
          label_or: 'ଶାଗ କଟା ପରବର୍ତ୍ତୀ ଅବସ୍ଥା',
          intervalDays: 5,
          depthMmOrLitersPerAcre: '25 mm (~1,00,000 L/acre)'
        }
      ],
      method_en: 'Light Bed Flooding or Sprinkler Irrigation',
      method_or: 'ହାଲୁକା ପଟାଳି ଜଳସେଚନ କିମ୍ବା ଛିଞ୍ଚା (Sprinkler) ପଦ୍ଧତି',
      critical_note_en: 'Leafy greens have shallow roots; give light, frequent watering and avoid standing water to prevent collar rot.',
      critical_note_or: 'ଶାଗ ଫସଲର ଚେର ଅগଭୀର ଥାଏ; ଅଳ୍ପ ଓ ନିୟମିତ ପାଣି ଦିଅନ୍ତୁ, ପାଣି ଜମିলে ମୂଳ ପଚା ରୋଗ ହୁଏ।'
    };
  }

  // 3. Cole crops (Cabbage, Cauliflower, Broccoli, Knol-khol)
  if (['cabbage', 'cauliflower', 'broccoli', 'knol_khol'].includes(itemId)) {
    return {
      stages: [
        {
          id: 'transplanting',
          label_en: 'Transplanting & Seedling Establishment',
          label_or: 'ଚାରା ରୋପଣ ଓ ମୂଳ ଧରିବା ଅବସ୍ଥା',
          intervalDays: 3,
          depthMmOrLitersPerAcre: '25 mm (~1,00,000 L/acre)'
        },
        {
          id: 'vegetative',
          label_en: 'Vegetative Frame Development',
          label_or: 'ପତ୍ର ବୃଦ୍ଧି ଅବସ୍ଥା',
          intervalDays: 6,
          depthMmOrLitersPerAcre: '35 mm (~1,40,000 L/acre)'
        },
        {
          id: 'curd_head_formation',
          label_en: 'Head / Curd Formation (Critical)',
          label_or: 'ଫୁଲ / ବନ୍ଧା ଗଠନ ଅବସ୍ଥା (ଅତି ଜରୁରୀ)',
          intervalDays: 5,
          depthMmOrLitersPerAcre: '40 mm (~1,60,000 L/acre)'
        },
        {
          id: 'maturity',
          label_en: 'Head Compacting & Pre-Harvest',
          label_or: 'ଅମଳ ପୂର୍ବ ଅବସ୍ଥା',
          intervalDays: 7,
          depthMmOrLitersPerAcre: '30 mm (~1,20,000 L/acre)'
        }
      ],
      method_en: 'Furrow Irrigation or Drip Irrigation',
      method_or: 'ସିଆର / ନାଳ ଜଳସେଚନ କିମ୍ବା ଡ୍ରିପ୍ ପଦ୍ଧତି',
      critical_note_en: 'Moisture stress during curd/head formation reduces size; excess water late in maturity can cause head splitting.',
      critical_note_or: 'କୋବି ବସିବା ସମୟରେ ପାଣି ଅଭାବ ହେଲେ ଫୁଲ ଛୋଟ ହୁଏ; ଅମଳ ପୂର୍ବରୁ ଅଧିକ ପାଣି ଦେଲେ ବନ୍ଧା ଫାଟିଯାଏ।'
    };
  }

  // 4. Cucurbits & Gourds (Cucumber, Pumpkin, Bottle/Bitter/Ridge/Sponge/Snake/Ash/Pointed/Ivy gourd, Melons)
  if (
    [
      'cucumber',
      'pumpkin',
      'bottle_gourd',
      'bitter_gourd',
      'ridge_gourd',
      'sponge_gourd',
      'snake_gourd',
      'ash_gourd',
      'pointed_gourd',
      'ivy_gourd',
      'watermelon',
      'muskmelon'
    ].includes(itemId)
  ) {
    return {
      stages: [
        {
          id: 'pit_establishment',
          label_en: 'Sowing / Pit Establishment',
          label_or: 'ମନ୍ଦା ପ୍ରସ୍ତୁତି ଓ ଗଜା ବାହାରିବା ଅବସ୍ଥା',
          intervalDays: 4,
          depthMmOrLitersPerAcre: '25 mm (~1,00,000 L/acre)'
        },
        {
          id: 'vine_trailing',
          label_en: 'Vine Trailing & Branching',
          label_or: 'ଲତା ମାଡ଼ିବା ଅବସ୍ଥା',
          intervalDays: 6,
          depthMmOrLitersPerAcre: '35 mm (~1,40,000 L/acre)'
        },
        {
          id: 'flowering_fruit_set',
          label_en: 'Flowering & Fruit Setting (Critical)',
          label_or: 'ଫୁଲ ଓ କଷି ଧରିବା ଅବସ୍ଥା (ଜରୁରୀ)',
          intervalDays: 4,
          depthMmOrLitersPerAcre: '40 mm (~1,60,000 L/acre)'
        },
        {
          id: 'fruit_sizing',
          label_en: 'Fruit Sizing & Picking',
          label_or: 'ଫଳ ବଢ଼ିବା ଓ ତୋଳିବା ଅବସ୍ଥା',
          intervalDays: 5,
          depthMmOrLitersPerAcre: '35 mm (~1,40,000 L/acre)'
        }
      ],
      method_en: 'Basin / Pit Ring or Drip Irrigation (Keep foliage dry)',
      method_or: 'ମନ୍ଦା ଚାରିପାଖେ ରିଙ୍ଗ ପଦ୍ଧତି କିମ୍ବା ବୁନ୍ଦା ଜଳସେଚନ',
      critical_note_en: 'Water only the root pit/basin; wetting trailing vines increases powdery and downy mildew risk.',
      critical_note_or: 'କେବଳ ମନ୍ଦା ମୂଳରେ ପାଣି ଦିଅନ୍ତୁ; ଲତା ଓ ପତ୍ର ଓଦା ହେଲେ ପାଉଁଶିଆ ରୋଗ ବଢ଼ିଥାଏ।'
    };
  }

  // 5. Root, Bulb & Tuber Crops (Potato, Sweet potato, Onion, Garlic, Ginger, Turmeric, Carrot, Radish, Beetroot, Turnip, Yam, Colocasia, Tapioca)
  if (
    [
      'potato',
      'sweet_potato',
      'onion',
      'garlic',
      'ginger',
      'turmeric',
      'carrot',
      'radish',
      'beetroot',
      'turnip',
      'elephant_foot_yam',
      'colocasia',
      'tapioca'
    ].includes(itemId)
  ) {
    return {
      stages: [
        {
          id: 'sprouting',
          label_en: 'Planting / Sprouting Stage',
          label_or: 'ରୋପଣ ଓ ଗଜା ବାହାରିବା ଅବସ୍ଥା',
          intervalDays: 5,
          depthMmOrLitersPerAcre: '30 mm (~1,20,000 L/acre)'
        },
        {
          id: 'vegetative_stolon',
          label_en: 'Vegetative & Stolon / Root Initiation',
          label_or: 'ଗଛ ବୃଦ୍ଧି ଓ କନ୍ଦା ଆରମ୍ଭ ଅବସ୍ଥା',
          intervalDays: 6,
          depthMmOrLitersPerAcre: '35 mm (~1,40,000 L/acre)'
        },
        {
          id: 'tuber_bulb_bulking',
          label_en: 'Tuber / Bulb / Rhizome Bulking (Critical)',
          label_or: 'କନ୍ଦା / ଆଳୁ / ପିଆଜ ମୋଟା ହେବା ଅବସ୍ଥା (ଜରୁରୀ)',
          intervalDays: 5,
          depthMmOrLitersPerAcre: '40 mm (~1,60,000 L/acre)'
        },
        {
          id: 'pre_harvest_curing',
          label_en: 'Pre-Harvest Skin Hardening (Stop 10d before harvest)',
          label_or: 'ଅମଳ ପୂର୍ବ ଅବସ୍ଥା (ଅମଳର ୧୦ ଦିନ ପୂର୍ବରୁ ପାଣି ବନ୍ଦ କରନ୍ତୁ)',
          intervalDays: 12,
          depthMmOrLitersPerAcre: '20 mm (~80,000 L/acre)'
        }
      ],
      method_en: 'Furrow Irrigation (up to 2/3rd ridge height) or Drip',
      method_or: 'ହୁଡ଼ার ଦୁଇ-ତୃତୀୟାଂଶ ଉଚ୍ଚତା ପର୍ଯ୍ୟନ୍ତ ନାଳ ପାଣି କିମ୍ବା ଡ୍ରିପ୍',
      critical_note_en: 'Never submerge ridges completely; stop irrigation 10–12 days before digging for better storage life.',
      critical_note_or: 'ହୁଡ଼ାକୁ ସମ୍ପୂର୍ଣ୍ଣ ବୁଡ଼ାନ୍ତୁ ନାହିଁ; ଭଲ ସଂରକ୍ଷଣ ପାଇଁ ଅମଳର ୧୦–୧୨ ଦିନ ପୂର୍ବରୁ ପାଣି ଦେବା ବନ୍ଦ କରନ୍ତୁ।'
    };
  }

  // 6. Cereals & Millets (Wheat, Maize, Ragi, Bajra, Jowar, Barley, Sweet corn, Baby corn)
  if (
    categoryId === 'cereals_millets' ||
    ['wheat', 'maize', 'ragi', 'bajra', 'jowar', 'barley', 'sweet_corn', 'baby_corn'].includes(itemId)
  ) {
    const isMillet = ['ragi', 'bajra', 'jowar'].includes(itemId);
    return {
      stages: [
        {
          id: 'establishment_cri',
          label_en: 'Seedling / Crown Root Initiation (CRI)',
          label_or: 'ଚାରା ମୂଳ ଧରିବା ଅବସ୍ଥା (CRI Stage)',
          intervalDays: isMillet ? 10 : 6,
          depthMmOrLitersPerAcre: '40 mm (~1,60,000 L/acre)'
        },
        {
          id: 'vegetative_knee_high',
          label_en: 'Tillering / Knee-High Stage',
          label_or: 'ପିଲ ବାହାରିବା / ଆଣ୍ଠୁ ଉଚ୍ଚତା ଅବସ୍ଥା',
          intervalDays: isMillet ? 12 : 8,
          depthMmOrLitersPerAcre: '45 mm (~1,80,000 L/acre)'
        },
        {
          id: 'flowering_tasseling',
          label_en: 'Tasseling / Flowering / Ear Emergence (Critical)',
          label_or: 'ଫୁଲ ଓ କେଣ୍ଡା ବାହାରିବା ଅବସ୍ଥା (ଅତି ଜରୁରୀ)',
          intervalDays: isMillet ? 8 : 5,
          depthMmOrLitersPerAcre: '50 mm (~2,00,000 L/acre)'
        },
        {
          id: 'grain_milk_dough',
          label_en: 'Milking & Grain Filling Stage',
          label_or: 'କ୍ଷୀର ଭରିବା ଓ ଦାନା ପୂରଣ ଅବସ୍ଥା',
          intervalDays: isMillet ? 12 : 7,
          depthMmOrLitersPerAcre: '45 mm (~1,80,000 L/acre)'
        }
      ],
      method_en: 'Check-Basin or Ridge & Furrow Irrigation',
      method_or: 'ପଟାଳି କିମ୍ବା ହୁଡ଼ା-ନାଳ ଜଳସେଚନ ପଦ୍ଧତି',
      critical_note_en: 'Tasseling/silking in maize and CRI stage in wheat are the most moisture-sensitive stages; drain excess rain water immediately.',
      critical_note_or: 'ମକାରେ ଚୂଳ ବାହାରିବା ଓ ଗହମରେ ମୂଳ ଚେର (CRI) ସମୟରେ ପାଣି ଅଭାବ ହେବାକୁ ଦିଅନ୍ତୁ ନାହିଁ; ମୂଳରେ ପାଣି ଜମିলে ତୁରନ୍ତ ନିଷ୍କାସନ କରନ୍ତୁ।'
    };
  }

  // 7. Pulses & Legumes (Arhar, Moong, Urad, Chickpea, Lentil, Peas, Horse gram, Cowpea, Beans)
  if (
    categoryId === 'pulses' ||
    ['cluster_beans', 'french_beans', 'cowpea', 'broad_beans', 'garden_peas'].includes(itemId)
  ) {
    const isVegetableBean = ['cluster_beans', 'french_beans', 'broad_beans', 'garden_peas'].includes(
      itemId
    );
    return {
      stages: [
        {
          id: 'sowing',
          label_en: 'Sowing & Emergence',
          label_or: 'ବିହନ ବୁଣା ଓ ଗଜା ବାହାରିବା ଅବସ୍ଥା',
          intervalDays: isVegetableBean ? 6 : 10,
          depthMmOrLitersPerAcre: '30 mm (~1,20,000 L/acre)'
        },
        {
          id: 'branching',
          label_en: 'Vegetative Branching Stage',
          label_or: 'ଶାଖା ବାହାରିବା ଅବସ୍ଥା',
          intervalDays: isVegetableBean ? 7 : 14,
          depthMmOrLitersPerAcre: '35 mm (~1,40,000 L/acre)'
        },
        {
          id: 'flowering_bud',
          label_en: 'Flower Bud Initiation (Critical)',
          label_or: 'ଫୁଲ କଢ଼ ଆସିବା ଅବସ୍ଥା (ଅତି ଜରୁରୀ)',
          intervalDays: isVegetableBean ? 5 : 10,
          depthMmOrLitersPerAcre: '35 mm (~1,40,000 L/acre)'
        },
        {
          id: 'pod_filling',
          label_en: 'Pod Development & Seed Filling (Critical)',
          label_or: 'ଛୁଇଁ ଓ ଦାନା ପୂରଣ ଅବସ୍ଥା (ଜରୁରୀ)',
          intervalDays: isVegetableBean ? 6 : 11,
          depthMmOrLitersPerAcre: '35 mm (~1,40,000 L/acre)'
        }
      ],
      method_en: 'Light Sprinkler or Furrow Irrigation (Zero Waterlogging)',
      method_or: 'ହାଲୁକା ଛିଞ୍ଚା (Sprinkler) କିମ୍ବା ନାଳ ଜଳସେଚନ',
      critical_note_en: 'Pulses require light life-saving irrigation at pre-flowering and pod-filling; heavy flooding during full bloom causes flower drop.',
      critical_note_or: 'ଡାଲି ଜାତୀୟ ଫସଲରେ ଫୁଲ ଆସିବା ପୂର୍ବରୁ ଓ ଛୁଇଁ ପୂରଣ ବେଳେ ହାଲୁକା ପାଣି ଦିଅନ୍ତୁ; ଅଧିକ ପାଣି ଜମିଲେ ଫୁଲ ଝଡ଼ିପଡ଼େ।'
    };
  }

  // 8. Oilseeds (Mustard, Sesame, Sunflower, Soybean, Castor, Niger)
  if (categoryId === 'oilseeds') {
    return {
      stages: [
        {
          id: 'sowing',
          label_en: 'Sowing & Seedling Establishment',
          label_or: 'ବୁଣା ଓ ଚାରା ଅବସ୍ଥା',
          intervalDays: 8,
          depthMmOrLitersPerAcre: '30 mm (~1,20,000 L/acre)'
        },
        {
          id: 'rosette_branching',
          label_en: 'Rosette / Branching Stage (25–30 DAS)',
          label_or: 'ଶାଖା ବାହାରିବା ଅବସ୍ଥା (୨୫–୩୦ ଦିନ)',
          intervalDays: 10,
          depthMmOrLitersPerAcre: '35 mm (~1,40,000 L/acre)'
        },
        {
          id: 'flowering',
          label_en: 'Flowering / Budding Stage (Critical)',
          label_or: 'ଫୁଲ ଧରିବା ଅବସ୍ଥା (ଅତି ଜରୁରୀ)',
          intervalDays: 7,
          depthMmOrLitersPerAcre: '40 mm (~1,60,000 L/acre)'
        },
        {
          id: 'siliqua_seed_filling',
          label_en: 'Pod / Capsule / Seed Oil Filling',
          label_or: 'ଫଳ ଓ ତୈଳ ଦାନା ପୂରଣ ଅବସ୍ଥା',
          intervalDays: 9,
          depthMmOrLitersPerAcre: '35 mm (~1,40,000 L/acre)'
        }
      ],
      method_en: 'Check-Basin, Furrow, or Sprinkler Irrigation',
      method_or: 'ପଟାଳି କିମ୍ବା ଛିଞ୍ଚା ଜଳସେଚନ ପଦ୍ଧତି',
      critical_note_en: 'Two critical irrigations at branching/rosette and pod/seed filling boost oil content significantly.',
      critical_note_or: 'ଶାଖା ବାହାରିବା ଓ ଫଳରେ ଦାନା ପୂରଣ ସମୟରେ ପାଣି ଦେଲେ ତୈଳ ଅଂଶ ଓ ଅମଳ ବହୁତ ବଢ଼ିଥାଏ।'
    };
  }

  // 9. Fruits & Orchard Crops
  if (categoryId === 'fruits' || ['raw_banana', 'raw_papaya', 'drumstick'].includes(itemId)) {
    const isHighWaterFruit = ['banana', 'raw_banana', 'papaya', 'raw_papaya', 'pineapple', 'strawberry'].includes(
      itemId
    );
    return {
      stages: [
        {
          id: 'sapling_establishment',
          label_en: 'Sapling / Sucker Establishment',
          label_or: 'ନୂଆ ଚାରା / ପୁଆ ଲଗାଇବା ଅବସ୍ଥା',
          intervalDays: isHighWaterFruit ? 3 : 4,
          depthMmOrLitersPerAcre: isHighWaterFruit ? '15–20 L/plant' : '20–30 L/tree'
        },
        {
          id: 'vegetative_flush',
          label_en: 'Vegetative Canopy Growth',
          label_or: 'ଗଛ ଓ ନୂଆ ପତ୍ର ବୃଦ୍ଧି ଅବସ୍ଥା',
          intervalDays: isHighWaterFruit ? 4 : 8,
          depthMmOrLitersPerAcre: isHighWaterFruit ? '20–25 L/plant' : '35–50 L/tree'
        },
        {
          id: 'flowering_shooting',
          label_en: 'Flowering / Bunch Shooting (Critical)',
          label_or: 'ଫୁଲ / ଭଣ୍ଡା ବାହାରିବା ଅବସ୍ଥା (ଜରୁରୀ)',
          intervalDays: isHighWaterFruit ? 3 : 6,
          depthMmOrLitersPerAcre: isHighWaterFruit ? '25–30 L/plant' : '45–60 L/tree'
        },
        {
          id: 'fruit_development',
          label_en: 'Fruit Development & Sizing',
          label_or: 'ଫଳ ବଢ଼ିବା ଓ ପାଚିବା ଅବସ୍ଥା',
          intervalDays: isHighWaterFruit ? 4 : 6,
          depthMmOrLitersPerAcre: isHighWaterFruit ? '25–30 L/plant' : '50–70 L/tree'
        }
      ],
      method_en: 'Ring Basin Method or Drip Irrigation around Canopy Drip-Line',
      method_or: 'ଗଛ ଚାରିପାଖେ ରିଙ୍ଗ (ଥାଳିଆ) କିମ୍ବା ବୁନ୍ଦା ଜଳସେଚନ (Drip)',
      critical_note_en: 'Use double-ring basin so water does not touch the main trunk directly (prevents collar/foot rot in papaya and citrus).',
      critical_note_or: 'ପାଣି ଯେପରି ସିଧାସଳଖ ଗଛ ଗଣ୍ଡିରେ ନ ଲାଗେ ସେଥିପାଇଁ ଚାରିପାଖେ ରିଙ୍ଗ କରି ପାଣି ଦିଅନ୍ତୁ (ଅମୃତଭଣ୍ଡା ଓ ଲେମ୍ବୁରେ ମୂଳପଚା ରୋକିଥାଏ)।'
    };
  }

  // 10. Flowers
  if (categoryId === 'flowers') {
    return {
      stages: [
        {
          id: 'transplanting',
          label_en: 'Transplanting / Cutting Establishment',
          label_or: 'ଚାରା / କଲମୀ ରୋପଣ ଅବସ୍ଥା',
          intervalDays: 3,
          depthMmOrLitersPerAcre: '25 mm (~1,00,000 L/acre)'
        },
        {
          id: 'vegetative_pinching',
          label_en: 'Vegetative Growth & Pinching Stage',
          label_or: 'ଗଛ ବୃଦ୍ଧି ଓ ଡଗ ଛେଦନ ଅବସ୍ଥା',
          intervalDays: 5,
          depthMmOrLitersPerAcre: '30 mm (~1,20,000 L/acre)'
        },
        {
          id: 'bud_initiation',
          label_en: 'Flower Bud Initiation (Critical)',
          label_or: 'ଫୁଲ କଢ଼ ଆସିବା ଅବସ୍ଥା (ଅତି ଜରୁରୀ)',
          intervalDays: 4,
          depthMmOrLitersPerAcre: '35 mm (~1,40,000 L/acre)'
        },
        {
          id: 'full_bloom_picking',
          label_en: 'Full Blooming & Daily Picking',
          label_or: 'ଫୁଲ ଫୁଟିବା ଓ ତୋଳିବା ଅବସ୍ଥା',
          intervalDays: 4,
          depthMmOrLitersPerAcre: '35 mm (~1,40,000 L/acre)'
        }
      ],
      method_en: 'Drip or Ridge & Furrow Irrigation (Avoid overhead spray on open blooms)',
      method_or: 'ଡ୍ରିପ୍ କିମ୍ବା ସିଆର ଜଳସେଚନ (ଫୁଲ ଉପରେ ସିଧା ପାଣି ପକାନ୍ତୁ ନାହିଁ)',
      critical_note_en: 'Irrigate at the root zone; overhead watering on open flowers causes petal spotting and botrytis blight.',
      critical_note_or: 'ଗଛ ମୂଳରେ ପାଣି ଦିଅନ୍ତୁ; ଫୁଟିଥିବା ଫୁଲ ଉପରେ ପାଣି ପଡ଼ିଲେ ପାଖୁଡ଼ା ଦାଗ ହୋଇ ନଷ୍ଟ ହୁଏ।'
    };
  }

  // 11. Spices (Cumin, Black pepper, Cardamom, etc.)
  if (categoryId === 'spices') {
    return {
      stages: [
        {
          id: 'establishment',
          label_en: 'Sowing / Vine Establishment',
          label_or: 'ବୁଣା / ଚାରା ଲଗାଇବା ଅବସ୍ଥା',
          intervalDays: 5,
          depthMmOrLitersPerAcre: '30 mm (~1,20,000 L/acre)'
        },
        {
          id: 'vegetative',
          label_en: 'Vegetative Growth',
          label_or: 'ଶାଖା ଓ ପତ୍ର ବୃଦ୍ଧି ଅବସ୍ଥା',
          intervalDays: 7,
          depthMmOrLitersPerAcre: '35 mm (~1,40,000 L/acre)'
        },
        {
          id: 'spike_flowering',
          label_en: 'Flowering / Spike / Umbel Emergence',
          label_or: 'ଫୁଲ ଓ କଷି ବାହାରିବା ଅବସ୍ଥା',
          intervalDays: 5,
          depthMmOrLitersPerAcre: '35 mm (~1,40,000 L/acre)'
        },
        {
          id: 'berry_seed_filling',
          label_en: 'Seed / Berry / Capsule Maturation',
          label_or: 'ମସଲା ଦାନା ପୂରଣ ଅବସ୍ଥା',
          intervalDays: 7,
          depthMmOrLitersPerAcre: '30 mm (~1,20,000 L/acre)'
        }
      ],
      method_en: 'Drip, Micro-Sprinkler, or Raised-Bed Furrow Irrigation',
      method_or: 'ବୁନ୍ଦା (Drip) କିମ୍ବା ଉଚ୍ଚ ପଟାଳି ନାଳ ଜଳସେଚନ',
      critical_note_en: 'Ensure good drainage around spice roots to prevent Phytophthora foot rot and wilt.',
      critical_note_or: 'ମସଲା ଫସଲ ମୂଳରେ ଜଳ ନିଷ୍କାସନ ବ୍ୟବସ୍ଥା ରଖନ୍ତୁ, ନଚେତ୍ ମୂଳପଚା ଓ ଝାଉଁଳା ରୋଗ ହୋଇଥାଏ।'
    };
  }

  // 12. Cash & Plantation Crops (Sugarcane, Cotton, Jute, Tobacco, Cashew, Areca nut, Rubber, Tea, Coffee)
  if (categoryId === 'cash_plantation') {
    const isSugarcane = itemId === 'sugarcane';
    return {
      stages: [
        {
          id: 'germination_planting',
          label_en: 'Sett Planting / Seedling Establishment (0–45 days)',
          label_or: 'ଖଣ୍ଡ ରୋପଣ / ଚାରା ମୂଳ ଧରିବା ଅବସ୍ଥା',
          intervalDays: isSugarcane ? 6 : 7,
          depthMmOrLitersPerAcre: '45 mm (~1,80,000 L/acre)'
        },
        {
          id: 'tillering_formative',
          label_en: 'Formative / Tillering / Square Formation (Critical)',
          label_or: 'ପିଲ ବାହାରିବା / କଢ଼ ଗଠନ ଅବସ୍ଥା (ଜରୁରୀ)',
          intervalDays: isSugarcane ? 7 : 8,
          depthMmOrLitersPerAcre: '50 mm (~2,00,000 L/acre)'
        },
        {
          id: 'grand_growth_boll',
          label_en: 'Grand Growth / Boll / Nut Development',
          label_or: 'ମୁଖ୍ୟ ବୃଦ୍ଧି / ଫଳ ଗଠନ ଅବସ୍ଥା',
          intervalDays: isSugarcane ? 8 : 9,
          depthMmOrLitersPerAcre: '55 mm (~2,20,000 L/acre)'
        },
        {
          id: 'ripening_maturity',
          label_en: 'Ripening / Pre-Harvest Maturity',
          label_or: 'ପାଚିବା ଓ ଅମଳ ପୂର୍ବ ଅବସ୍ଥା',
          intervalDays: 14,
          depthMmOrLitersPerAcre: '40 mm (~1,60,000 L/acre)'
        }
      ],
      method_en: 'Alternate Furrow or Drip Fertigation',
      method_or: 'ଏକାନ୍ତର ନାଳ (Alternate Furrow) କିମ୍ବା ଡ୍ରିପ୍ ଜଳସେଚନ',
      critical_note_en: 'Formative tillering and grand growth stages demand regular moisture; withhold water 15 days before sugarcane harvest to boost sucrose.',
      critical_note_or: 'ମୁଖ୍ୟ ବୃଦ୍ଧି ସମୟରେ ନିୟମିତ ପାଣି ଦିଅନ୍ତୁ; ଆଖୁ ଅମଳର ୧୫ ଦିନ ପୂର୍ବରୁ ପାଣି ବନ୍ଦ କଲେ ମିଠା ଅଂଶ ବଢ଼ିଥାଏ।'
    };
  }

  // 13. Fodder & Grass (Napier, Guinea, Berseem, Lucerne, Fodder Maize/Sorghum/Cowpea, Azolla)
  if (categoryId === 'fodder_grass') {
    const isAzolla = itemId === 'azolla';
    return {
      stages: [
        {
          id: 'sowing_slip_planting',
          label_en: isAzolla ? 'Azolla Pit Inoculation (10 cm water)' : 'Slip Planting / Sowing Establishment',
          label_or: isAzolla ? 'ଆଜୋଲା କୁଣ୍ଡ ପ୍ରସ୍ତୁତି (୧୦ ସେ.ମି. ପାଣି)' : 'ମୂଳ / ବିହନ ରୋପଣ ଅବସ୍ଥା',
          intervalDays: isAzolla ? 2 : 4,
          depthMmOrLitersPerAcre: isAzolla ? 'Maintain 10 cm standing water' : '35 mm (~1,40,000 L/acre)'
        },
        {
          id: 'vegetative_fodder',
          label_en: isAzolla ? 'Rapid Multiplication Stage' : 'Active Lush Foliage Growth',
          label_or: isAzolla ? 'ଆଜୋଲା ଦ୍ରୁତ ବୃଦ୍ଧି ଅବସ୍ଥା' : 'ସବୁଜ ଘାସ ବୃଦ୍ଧି ଅବସ୍ଥା',
          intervalDays: isAzolla ? 3 : 7,
          depthMmOrLitersPerAcre: isAzolla ? 'Top up 20% fresh water' : '40 mm (~1,60,000 L/acre)'
        },
        {
          id: 'post_cut_regrowth',
          label_en: isAzolla ? 'Daily Harvesting & Water Exchange' : 'Immediate Irrigation After Cutting (Ratoon)',
          label_or: isAzolla ? 'ଦୈନିକ ଅମଳ ଓ ପାଣି ବଦଳାଇବା' : 'ଘାସ କାଟିବା ପରବର୍ତ୍ତୀ ଜଳସେଚନ',
          intervalDays: isAzolla ? 3 : 5,
          depthMmOrLitersPerAcre: isAzolla ? 'Replace 25% water every 10 days' : '40 mm (~1,60,000 L/acre)'
        }
      ],
      method_en: isAzolla ? 'lined Shallow Pit (10 cm water depth)' : 'Border Strip or Sprinkler Irrigation',
      method_or: isAzolla ? 'ପଲିଥିନ୍ କୁଣ୍ଡରେ ୧୦ ସେ.ମି. ପାଣି ସ୍ତର' : 'ପଟାଳି କିମ୍ବା ଛିଞ୍ଚା ଜଳସେଚନ',
      critical_note_en: 'Irrigate immediately after each fodder cut along with Urea top-dressing for rapid green regrowth.',
      critical_note_or: 'ପ୍ରତିଥର ଗୋ-ଖାଦ୍ୟ ଘାସ କାଟିବା ପରେ ତୁରନ୍ତ ପାଣି ଦେলে କଅଁଳ ପତ୍ର ଶୀଘ୍ର ବାହାରେ।'
    };
  }

  // 14. Medicinal & Aromatic Plants (Aloe vera, Tulsi, Ashwagandha, Lemongrass, Mentha)
  if (categoryId === 'medicinal_aromatic') {
    const isHardy = ['aloe_vera', 'ashwagandha'].includes(itemId);
    return {
      stages: [
        {
          id: 'planting_establishment',
          label_en: 'Sucker / Slip / Seedling Establishment',
          label_or: 'ଚାରା ରୋପଣ ଓ ମୂଳ ଧରିବା ଅବସ୍ଥା',
          intervalDays: isHardy ? 7 : 4,
          depthMmOrLitersPerAcre: '25 mm (~1,00,000 L/acre)'
        },
        {
          id: 'vegetative_herbage',
          label_en: 'Active Leaf / Herbage Growth',
          label_or: 'ପତ୍ର ଓ ଔଷଧୀୟ ଅଂଶ ବୃଦ୍ଧି ଅବସ୍ଥା',
          intervalDays: isHardy ? 12 : 6,
          depthMmOrLitersPerAcre: '30 mm (~1,20,000 L/acre)'
        },
        {
          id: 'pre_harvest_oil',
          label_en: 'Pre-Harvest Essential Oil / Root Maturity',
          label_or: 'ଅମଳ ପୂର୍ବ ଅବସ୍ଥା',
          intervalDays: isHardy ? 15 : 8,
          depthMmOrLitersPerAcre: '25 mm (~1,00,000 L/acre)'
        }
      ],
      method_en: 'Raised Bed Drip or Light Furrow Irrigation',
      method_or: 'ଉଚ୍ଚ ପଟାଳି ଡ୍ରିପ୍ କିମ୍ବା ହାଲୁକା ନାଳ ଜଳସେଚନ',
      critical_note_en: 'Avoid over-watering Aloe vera and Ashwagandha to prevent root rot; Mentha and Lemongrass respond well to light frequent watering after cutting.',
      critical_note_or: 'ଘିଅକୁଆଁରୀ ଓ ଅଶ୍ୱଗନ୍ଧାରେ ଅଧିକ ପାଣି ଦେলে ଚେର ପଚିଯାଏ; ପୋଦିନା ଓ ଲେମନଗ୍ରାସରେ କଟା ପରେ ହାଲୁକା ପାଣି ଦିଅନ୍ତୁ।'
    };
  }

  // 15. Trees & Timber (Bamboo, Teak, Eucalyptus, Casuarina, Neem, Acacia, Mahogany, Subabul)
  if (categoryId === 'trees_timber') {
    return {
      stages: [
        {
          id: 'year1_sapling',
          label_en: 'Newly Planted Sapling (First 6 Months)',
          label_or: 'ନୂଆ ଚାରା ରୋପଣ (ପ୍ରଥମ ୬ ମାସ)',
          intervalDays: 5,
          depthMmOrLitersPerAcre: '15–20 Liters per sapling pit'
        },
        {
          id: 'young_tree_establishment',
          label_en: 'Young Plantation (1 to 2 Years)',
          label_or: 'ଚାରା ବୃଦ୍ଧି ଅବସ୍ଥା (୧ ରୁ ୨ ବର୍ଷ)',
          intervalDays: 10,
          depthMmOrLitersPerAcre: '30–40 Liters per tree basin'
        },
        {
          id: 'established_summer',
          label_en: 'Established Tree (Dry Summer Season)',
          label_or: 'ବଡ଼ ଗଛ (ଖରାଦିନିଆ ଜଳସେଚନ)',
          intervalDays: 15,
          depthMmOrLitersPerAcre: '50 Liters per tree basin'
        }
      ],
      method_en: 'Saucer Pit / Ring Basin with Organic Mulching',
      method_or: 'ଗଛ ମୂଳ ଥାଳିଆ (Basin) ଓ ଶୁଖିଲା ପତ୍ର ଆଚ୍ଛାଦନ (Mulching)',
      critical_note_en: 'Mulch tree basins with dry leaves or paddy straw to conserve soil moisture during Odisha summer months.',
      critical_note_or: 'ଖରାଦିନେ ମାଟିରେ ବତର ରଖିବା ପାଇଁ ଗଛ ମୂଳରେ ନଡ଼ା ବା ଶୁଖିଲା ପତ୍ର ଘୋଡ଼ାଇ ରଖନ୍ତୁ।'
    };
  }

  // 16. Mushrooms (Paddy straw, Oyster, Button)
  if (categoryId === 'mushrooms') {
    return {
      stages: [
        {
          id: 'spawn_running',
          label_en: 'Bed Spawning / Mycelium Run (Keep covered)',
          label_or: 'ବେଡ୍ ପ୍ରସ୍ତୁତି ଓ କବକ ଜାଲ ମାଡ଼ିବା ଅବସ୍ଥା',
          intervalDays: 1,
          depthMmOrLitersPerAcre: 'Light misting on floor/walls (80–85% RH)'
        },
        {
          id: 'pinhead_initiation',
          label_en: 'Pinhead Initiation (Uncover & Mist)',
          label_or: 'ଛତୁ କଢ଼ (Pinhead) ବାହାରିବା ଅବସ୍ଥା',
          intervalDays: 1,
          depthMmOrLitersPerAcre: 'Fine mist sprayer 2 times daily'
        },
        {
          id: 'cropping_flush',
          label_en: 'Fruiting Body & Flush Harvesting',
          label_or: 'ଛତୁ ଫୁଟିବା ଓ ତୋଳିବା ଅବସ୍ଥା',
          intervalDays: 1,
          depthMmOrLitersPerAcre: 'Fine misting to keep bed moist (never pour water)'
        }
      ],
      method_en: 'Fine Hand Mist Sprayer & Wet Gunny Bag Humidity Control',
      method_or: 'ହାଲୁକା କୁହୁଡ଼ି ସ୍ପ୍ରେୟର (Mist Spray) ଓ ଓଦା ଅଖା ଦ୍ୱାରା ଆର୍ଦ୍ରତା ରକ୍ଷା',
      critical_note_en: 'Never pour water directly on mushroom beds; use a fine mist sprayer so straw remains damp without water dripping.',
      critical_note_or: 'ଛତୁ ବେଡ୍ ଉପରେ କେବେବି ସିଧା ପାଣି ଢାଳନ୍ତୁ ନାହିଁ; କେବଳ ସ୍ପ୍ରେୟରରେ ହାଲୁକା କୁହୁଡ଼ି ଭଳି ପାଣି ଛିଞ୍ଚନ୍ତୁ।'
    };
  }

  // 17. Nursery & Ornamental Plants (Fruit saplings, Vegetable seedlings, Ornamental plants, Orchids)
  if (categoryId === 'nursery_ornamental') {
    return {
      stages: [
        {
          id: 'seedbed_propagation',
          label_en: 'Seedbed / Pro-Tray Germination',
          label_or: 'ତଳିଘରା / ଟ୍ରେ ଗଜା ଅବସ୍ଥା',
          intervalDays: 1,
          depthMmOrLitersPerAcre: 'Rose-can / Fine mist morning & evening'
        },
        {
          id: 'polybag_potted',
          label_en: 'Polybag / Potted Plant Growth',
          label_or: 'ପଲିব্যাগ / କୁଣ୍ଡ ଚାରା ବୃଦ୍ଧି ଅବସ୍ଥା',
          intervalDays: 2,
          depthMmOrLitersPerAcre: 'Water until drainage holes moisten'
        },
        {
          id: 'hardening_stage',
          label_en: 'Pre-Transplant Hardening Stage',
          label_or: 'ରୁଆ ପୂର୍ବରୁ ଚାରା ଟାଣ କରିବା ଅବସ୍ଥା',
          intervalDays: 3,
          depthMmOrLitersPerAcre: 'Reduced watering for root sturdiness'
        }
      ],
      method_en: 'Rose-Can Watering, Micro-Mist, or Drip',
      method_or: 'ଝରଣା ଡବା (Rose-Can) କିମ୍ବା ମାଇକ୍ରୋ-ସ୍ପ୍ରିଙ୍କଲର',
      critical_note_en: 'Ensure nursery beds are raised 15 cm above ground with cocopeat/sand drainage to prevent damping-off disease.',
      critical_note_or: 'ତଳିଘରାରେ ତଳିପଚା (Damping-off) ରୋକିବା ପାଇଁ ଉଚ୍ଚ ପଟାଳି କରନ୍ତୁ ଏବଂ ଅତ୍ୟଧିକ ପାଣି ଜମିବାକୁ ଦିଅନ୍ତୁ ନାହିଁ।'
    };
  }

  // 18. Default for remaining vegetables (Tomato, Brinjal, Chilli, Capsicum, Okra, etc.) & custom plants
  return {
    stages: [
      {
        id: 'transplanting',
        label_en: 'Transplanting / Seedling Establishment',
        label_or: 'ଚାରା ରୋପଣ ଓ ମୂଳ ଧରିବା ଅବସ୍ଥା',
        intervalDays: 3,
        depthMmOrLitersPerAcre: '30 mm (~1,20,000 L/acre)'
      },
      {
        id: 'vegetative',
        label_en: 'Vegetative Growth Stage',
        label_or: 'ଡାଳ ପତ୍ର ବୃଦ୍ଧି ଅବସ୍ଥା',
        intervalDays: 5,
        depthMmOrLitersPerAcre: '35 mm (~1,40,000 L/acre)'
      },
      {
        id: 'flowering',
        label_en: 'Flowering & Budding Stage (Critical)',
        label_or: 'ଫୁଲ ଓ କଷି ଧରିବା ଅବସ୍ଥା (ଅତି ଜରୁରୀ)',
        intervalDays: 4,
        depthMmOrLitersPerAcre: '40 mm (~1,60,000 L/acre)'
      },
      {
        id: 'fruiting',
        label_en: 'Fruiting & Harvesting Stage',
        label_or: 'ଫଳ ବଢ଼ିବା ଓ ତୋଳିବା ଅବସ୍ଥା',
        intervalDays: 4,
        depthMmOrLitersPerAcre: '40 mm (~1,60,000 L/acre)'
      }
    ],
    method_en: 'Ridge & Furrow or Drip Irrigation',
    method_or: 'ହୁଡ଼ା ଓ ନାଳ (Furrow) କିମ୍ବା ବୁନ୍ଦା ଜଳସେଚନ (Drip)',
    critical_note_en: 'Maintain even soil moisture during flowering and fruit set to prevent blossom drop and fruit cracking.',
    critical_note_or: 'ଫୁଲ ଝଡ଼ିବା ଓ ଫଳ ଫାଟିବା ରୋକିବା ପାଇଁ ଫୁଲ ଓ ଫଳ ଅବସ୍ଥାରେ ମାଟିରେ ନିୟମିତ ବତର ରଖନ୍ତୁ।'
  };
}

/**
 * Builds the complete, deduplicated catalog of all 130+ plants across all 12 categories
 * from crops.json + rules.json so every single plant in the app is available in Water Advice.
 */
export const ALL_WATER_ADVICE_PLANTS: PlantWaterProfile[] = (() => {
  const list: PlantWaterProfile[] = [];
  const seen = new Set<string>();

  // Put Cereals & Millets (Paddy first) and Vegetables at the top for quick access, followed by all other categories
  const orderedCategories = [
    ...cropsData.categories.filter((c) => c.id === 'cereals_millets'),
    ...cropsData.categories.filter((c) => c.id !== 'cereals_millets' && c.id !== 'other')
  ];

  for (const cat of orderedCategories) {
    for (const item of cat.items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);

      const tailored = getTailoredStagesAndTipsForPlant(item.id, cat.id);
      list.push({
        id: item.id,
        icon: item.icon || cat.icon || '🌱',
        categoryId: cat.id,
        categoryNameEn: cat.name.en,
        categoryNameOr: cat.name.or,
        name_en: item.name_en,
        name_or: item.name_or || item.name_en,
        name_hi: item.name_hi,
        name_te: item.name_te,
        name_bn: item.name_bn,
        name_ta: item.name_ta,
        method_en: tailored.method_en,
        method_or: tailored.method_or,
        critical_note_en: tailored.critical_note_en,
        critical_note_or: tailored.critical_note_or,
        stages: tailored.stages
      });
    }
  }

  return list;
})();

export const WATER_ADVICE_CATEGORIES = [
  { id: 'all', icon: '🌿', name_en: 'All Plants & Crops (130+)', name_or: 'ସମସ୍ତ ଗଛ ଓ ଫସଲ (୧୩୦+)' },
  ...cropsData.categories
    .filter((c) => c.id !== 'other')
    .map((c) => ({
      id: c.id,
      icon: c.icon,
      name_en: c.name.en,
      name_or: c.name.or
    }))
];

export function getLocalizedPlantName(plant: PlantWaterProfile, lang: Language): string {
  if (lang === 'or') return `${plant.name_or} (${plant.name_en})`;
  if (lang === 'hi' && plant.name_hi) return `${plant.name_hi} (${plant.name_en})`;
  if (lang === 'te' && plant.name_te) return `${plant.name_te} (${plant.name_en})`;
  if (lang === 'bn' && plant.name_bn) return `${plant.name_bn} (${plant.name_en})`;
  if (lang === 'ta' && plant.name_ta) return `${plant.name_ta} (${plant.name_en})`;
  return plant.name_en;
}
