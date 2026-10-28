import { CropItem } from './types';

export const CASH_CROPS: CropItem[] = [
  {
    id: 'sugarcane',
    category: 'cash_crops',
    name_en: 'Sugarcane (Akhu)',
    name_or: 'ଆଖୁ (Sugarcane / Akhu)',
    name_hi: 'गन्ना (Sugarcane)',
    scientific_name: 'Saccharum officinarum',
    icon: '🎋',
    soil_type_en: 'Deep heavy alluvial loam with good water retention and aeration',
    soil_type_or: 'ଗଭୀର ମଟାଳ ଓ ପଟୁ ମାଟି (ପାଣି ଧାରଣ କ୍ଷମତା ଥିବା ଦରକାର)',
    duration_days: '10-12 months',
    water_requirement: 'High',
    water_requirement_or: 'ଅଧିକ ପାଣି',
    problems: [
      {
        id: 'sugarcane_red_rot',
        type: 'disease',
        name_en: 'Red Rot (Colletotrichum falcatum)',
        name_or: 'ଆଖୁ ଲାଲ୍ ପଚା ରୋଗ (ମଦ ଗନ୍ଧ)',
        severity: 'High',
        symptoms_en: 'Third and fourth leaves wither, inner cane pith turns blood red with white transverse bands, sour alcoholic smell.',
        symptoms_or: '୩ୟ ଓ ୪ର୍ଥ ପତ୍ର ଶୁଖିବା, ଆଖୁ କାଣ୍ଡ ଭିତର ଲାଲ୍ ରକ୍ତ ଭଳି ହୋଇ ଧଳା ଗାର ପଡ଼ିବା ଓ ମଦ ଭଳି ଦୁର୍ଗନ୍ଧ ହେବା।',
        treatments: [
          {
            product_en: 'Carbendazim 50% WP sett treatment + Hot water treatment',
            product_or: 'କାର୍ବେଣ୍ଡାଜିମ୍ ୫୦% WP ଖଣ୍ଡ ବିହନ ବିଶୋଧନ',
            active_ingredient: 'Carbendazim 50% WP',
            dose_per_litre: '1.0 g (dip setts for 15 minutes)',
            dose_per_200L: '200 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Trichoderma viride @ 5 kg/acre mixed with 1 tonne press mud / FYM',
            organic_alternative_or: 'ଟ୍ରାଇକୋଡର୍ମା ଖତ କିମ୍ବା ପ୍ରେସମଡ୍ ସହ ମିଶାଇ ଜମିରେ ପ୍ରୟୋଗ',
            phi_days: 60
          }
        ]
      },
      {
        id: 'sugarcane_early_shoot_borer',
        type: 'pest',
        name_en: 'Early Shoot Borer (Chilo infuscatellus)',
        name_or: 'ଆଖୁ ଆଗୁଆ କାଣ୍ଡବିନ୍ଧା ପୋକ',
        severity: 'High',
        symptoms_en: 'Dead hearts in young shoots within 1-3 months of planting, dead heart pulls out easily with offensive odor.',
        symptoms_or: 'ଚାରା ଆଖୁର ମଝି ଡାଳ ଶୁଖିଯିବା, ଟାଣିଲେ ସହଜରେ ବାହାରି ଆସିବା ଓ ଦୁର୍ଗନ୍ଧ ହେବା।',
        treatments: [
          {
            product_en: 'Chlorantraniliprole 18.5% SC (Coragen) soil drenching along furrow',
            product_or: 'କୋରାଜେନ୍ ଧାଡ଼ି ମାଟିରେ ଢାଳିବା',
            active_ingredient: 'Chlorantraniliprole 18.5% SC',
            dose_per_litre: '0.4 ml',
            dose_per_200L: '150 ml in 200 L water directed to shoot base',
            type: 'chemical',
            organic_alternative_en: 'Release Trichogramma chilonis egg parasitoid cards @ 20,000/acre',
            organic_alternative_or: 'ଟ୍ରାଇକୋଗ୍ରାମା ମିତ୍ରକୀଟ କାର୍ଡ ୨୦,୦୦୦/ଏକର ଖଞ୍ଜିବା',
            phi_days: 60
          }
        ]
      },
      {
        id: 'sugarcane_pyrilla',
        type: 'pest',
        name_en: 'Sugarcane Pyrilla / Leafhopper (Pyrilla perpusilla)',
        name_or: 'ଆଖୁ ପାଇରିଲା ପୋକ (ପତ୍ରଡିଆଁ)',
        severity: 'High',
        symptoms_en: 'Nymphs and adults suck sap beneath leaves, secrete honeydew causing heavy black sooty mold.',
        symptoms_or: 'ପତ୍ର ତଳେ ବସି ରସ ଶୋଷିବା, ଅଠାଳିଆ ମହୁ ଛାଡ଼ିବାରୁ ପତ୍ର କଳା ପାଉଁଶିଆ ହୋଇ ସୂର୍ଯ୍ୟାଲୋକ ବନ୍ଦ ହେବା।',
        treatments: [
          {
            product_en: 'Chlorpyrifos 20% EC or Malathion 50% EC',
            product_or: 'କ୍ଲୋରପାଇରିଫସ୍ ୨୦% EC କିମ୍ବା ମାଲାଥିଅନ୍',
            active_ingredient: 'Chlorpyrifos 20% EC',
            dose_per_litre: '2.0 ml',
            dose_per_200L: '400 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Conservation and release of Epiricania melanoleuca parasitoid cocoons',
            organic_alternative_or: 'ଏପିରିକାନିଆ ମିତ୍ର କୀଟ ସଂରକ୍ଷଣ',
            phi_days: 30
          }
        ]
      },
      {
        id: 'sugarcane_smut',
        type: 'disease',
        name_en: 'Sugarcane Whip Smut (Sporisorium scitamineum)',
        name_or: 'ଆଖୁ ଚାବୁକ ଅଙ୍ଗାରୁଆ ରୋଗ',
        severity: 'High',
        symptoms_en: 'Long curved black pencil-thick whip-like structure emerging from apex of cane stalk.',
        symptoms_or: 'ଆଖୁ ଅଗରୁ ଲମ୍ବା ବଙ୍କା କଳା ଚାବୁକ ଭଳି ଅଙ୍ଗାରୁଆ ସଂରଚନା ବାହାରିବା।',
        treatments: [
          {
            product_en: 'Triadimefon 25% WP or Propiconazole 25% EC sett treatment',
            product_or: 'ଟ୍ରାଇଆଡିମେଫନ୍ କିମ୍ବା ପ୍ରୋପିକୋନାଜୋଲ୍ ବିହନ ବିଶୋଧନ',
            active_ingredient: 'Triadimefon 25% WP',
            dose_per_litre: '1.0 g',
            dose_per_200L: '200 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Rogue out whips in gunny bags to prevent spore spread + hot water treat setts 52°C 30m',
            organic_alternative_or: 'ଚାବୁକକୁ ବସ୍ତା ଘୋଡ଼ାଇ କାଟି ପୋଡ଼ି ଦିଅନ୍ତୁ',
            phi_days: 60
          }
        ]
      }
    ]
  },
  {
    id: 'cotton',
    category: 'cash_crops',
    name_en: 'Cotton (Kapa)',
    name_or: 'କପା (Cotton / Kapa)',
    name_hi: 'कपास (Cotton)',
    scientific_name: 'Gossypium hirsutum',
    icon: '☁️',
    soil_type_en: 'Deep black cotton soil (Vertisols) or fertile red loam',
    soil_type_or: 'ଗଭୀର କଳା କପା ମାଟି କିମ୍ବା ନିଗିଡ଼ା ଲାଲ୍ ଦୋରସା ମାଟି',
    duration_days: '150-180 days',
    water_requirement: 'Medium',
    water_requirement_or: 'ମଧ୍ୟମ ପାଣି',
    problems: [
      {
        id: 'cotton_pink_bollworm',
        type: 'pest',
        name_en: 'Pink Bollworm (Pectinophora gossypiella)',
        name_or: 'କପା ଗୋଲାପୀ ବଲ୍ଓ୍ୱାର୍ମ ପୋକ',
        severity: 'High',
        symptoms_en: 'Rosette flowers that fail to open, entry holes plugged in bolls, stained damaged lint.',
        symptoms_or: 'କପା ଫୁଲ ଗୋଲାପ ଭଳି ବଙ୍କା ହୋଇ ରହିବା, ଡୋଡ଼ି ଭିତରେ କପା ନଷ୍ଟ ହୋଇ ଦାଗ ଲାଗିବା।',
        treatments: [
          {
            product_en: 'Profenofos 50% EC or Chlorantraniliprole 18.5% SC',
            product_or: 'ପ୍ରୋଫେନୋଫସ୍ ୫୦% EC କିମ୍ବା କୋରାଜେନ୍',
            active_ingredient: 'Profenofos 50% EC',
            dose_per_litre: '2.0 ml Profenofos OR 0.3 ml Coragen',
            dose_per_200L: '400 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Gossyplure pheromone traps @ 8 traps/acre + Trichogramma bactrae cards',
            organic_alternative_or: 'ଗୋସିପ୍ଲିଓର ଫେରୋମୋନ୍ ଫାନ୍ଦ ୮ଟି/ଏକର',
            phi_days: 21
          }
        ]
      },
      {
        id: 'cotton_whitefly',
        type: 'pest',
        name_en: 'Cotton Whitefly (Bemisia tabaci)',
        name_or: 'କପା ଧଳାମାଛି (ଲିଫ୍ କର୍ଲ ବାହକ)',
        severity: 'High',
        symptoms_en: 'Nymphs suck sap beneath leaves, secreting honeydew causing black sooty mold and Leaf Curl Virus.',
        symptoms_or: 'ପତ୍ର ତଳେ ଧଳାମାଛି ବସି ରସ ଶୋଷିବା, ପତ୍ର କୁଞ୍ଚିତ ହୋଇ ତଳେ କଳା ଫିମ୍ପି ମାଡ଼ିବା।',
        treatments: [
          {
            product_en: 'Diafenthiuron 50% WP (Pegasus) or Pyriproxyfen 10% EC',
            product_or: 'ପେଗାସସ୍ (ଡାୟାଫେନଥିଉରନ୍) କିମ୍ବା ପାଇରିପ୍ରୋକ୍ସିଫେନ୍',
            active_ingredient: 'Diafenthiuron 50% WP',
            dose_per_litre: '1.2 g',
            dose_per_200L: '240 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Yellow sticky traps (25/acre) + Neem oil 1500 ppm @ 4 ml/L',
            organic_alternative_or: 'ହଳଦିଆ ଫାନ୍ଦ ୨୫ଟି/ଏକର + ନିମ୍ବ ତେଲ ସ୍ପ୍ରେ',
            phi_days: 15
          }
        ]
      },
      {
        id: 'cotton_bacterial_blight',
        type: 'disease',
        name_en: 'Bacterial Blight / Angular Leaf Spot (Xanthomonas citri pv. malvacearum)',
        name_or: 'କପା ଜୀବାଣୁ ଜନିତ କୋଣିଆ ପତ୍ରପୋଡ଼ା (ବ୍ଲାକ୍ ଆର୍ମ)',
        severity: 'High',
        symptoms_en: 'Angular water-soaked spots bounded by veins on leaves, black arm cankers on branches and bolls.',
        symptoms_or: 'ପତ୍ର ଶିରା ମଝିରେ କୋଣିଆ ଭିଜା ଭିଜା ଦାଗ, ଡାଳ ଓ ଡୋଡ଼ି ଉପରେ କଳା କ୍ଷତ।',
        treatments: [
          {
            product_en: 'Copper Oxychloride 50% WP + Streptocycline',
            product_or: 'କପର ଅକ୍ସିକ୍ଲୋରାଇଡ୍ + ଷ୍ଟ୍ରେପ୍ଟୋସାଇକ୍ଲିନ୍',
            active_ingredient: 'Copper Oxychloride + Streptomycin',
            dose_per_litre: '2.5 g COC + 0.1 g Streptocycline',
            dose_per_200L: '500 g COC + 20 g Streptocycline in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Acid delinting of cotton seed with concentrated Sulphuric acid',
            organic_alternative_or: 'ସଲଫ୍ୟୁରିକ୍ ଏସିଡ୍ ବିହନ ବିଶୋଧନ',
            phi_days: 21
          }
        ]
      },
      {
        id: 'cotton_magnesium_deficiency',
        type: 'nutrient',
        name_en: 'Magnesium Deficiency (Reddening of Cotton Leaves)',
        name_or: 'ମ୍ୟାଗ୍ନେସିୟମ୍ ଅଭାବ (କପା ପତ୍ର ଲାଲ୍ ପଡ଼ିବା)',
        severity: 'Medium',
        symptoms_en: 'Interveinal reddening and purplish discoloration of mature leaves while veins stay green.',
        symptoms_or: 'ପତ୍ର ଶିରା ସବୁଜ ଥାଇ ମଝି ଭାଗ ଲାଲ୍ ବା ବାଇଗଣୀ ରଙ୍ଗ ହୋଇଯିବା।',
        treatments: [
          {
            product_en: 'Magnesium Sulphate (MgSO4) 1% foliar spray at boll development',
            product_or: 'ମ୍ୟାଗ୍ନେସିୟମ୍ ସଲଫେଟ୍ ୧% ସ୍ପ୍ରେ',
            active_ingredient: 'Magnesium Sulphate 9.6% Mg',
            dose_per_litre: '10.0 g / L (1%)',
            dose_per_200L: '2 kg MgSO4 in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Dolomite application in soil @ 100 kg/acre during field preparation',
            organic_alternative_or: 'ଜମି ପ୍ରସ୍ତୁତି ବେଳେ ଡୋଲୋମାଇଟ୍ ଚୂନ ପ୍ରୟୋଗ',
            phi_days: 0
          }
        ]
      }
    ]
  },
  {
    id: 'betel_vine',
    category: 'cash_crops',
    name_en: 'Betel Vine (Paan / Paana)',
    name_or: 'ପାନ (Betel Vine / Paana)',
    name_hi: 'पान (Betel Vine)',
    scientific_name: 'Piper betle',
    icon: '🍃',
    soil_type_en: 'Well-drained fertile sandy loam or clay loam with pH 7.0-7.5 inside conservatory bareja',
    soil_type_or: 'ନିଗିଡ଼ା ଉର୍ବର ଦୋରସା ମାଟି (ପାନ ବରଜ ଭିତରେ)',
    duration_days: 'Perennial vine',
    water_requirement: 'High',
    water_requirement_or: 'ନିୟମିତ ହାଲୁକା ପାଣି',
    problems: [
      {
        id: 'paan_foot_rot',
        type: 'disease',
        name_en: 'Foot Rot & Leaf Rot (Phytophthora parasitica var. piperina)',
        name_or: 'ପାନ ପଚା ରୋଗ (ଫାଇଟୋପଥୋରା)',
        severity: 'High',
        symptoms_en: 'Black slimy rot at collar base, oily dark circular spots on leaves spreading rapidly.',
        symptoms_or: 'ପାନ ଡାଳ ମୂଳରେ କଳା ଚିକ୍କଣ ପଚା, ପାନ ପତ୍ରରେ ତେଲିଆ କଳା ଦାଗ ହୋଇ ସବୁ ପତ୍ର ପଚିବା।',
        treatments: [
          {
            product_en: 'Bordeaux Mixture 1% or Metalaxyl 8% + Mancozeb 64% drenching',
            product_or: '୧% ବୋର୍ଦ୍ଦୋ ମିଶ୍ରଣ କିମ୍ବା ରିଡୋମିଲ୍ ମାଟି ଭିଜାଇବା',
            active_ingredient: 'Bordeaux Mixture (Copper Sulphate + Lime)',
            dose_per_litre: '10 g Copper sulphate + 10 g Lime OR 2 g Ridomil MZ',
            dose_per_200L: 'Apply to vine base every 20 days during rains',
            type: 'chemical',
            organic_alternative_en: 'Trichoderma viride @ 5 kg/bareja mixed in mustard oil cake slurry',
            organic_alternative_or: 'ସୋରିଷ ପିଡ଼ିଆ ସହ ଟ୍ରାଇକୋଡର୍ମା ମିଶାଇ ମୂଳରେ ଦିଅନ୍ତୁ',
            phi_days: 14
          }
        ]
      },
      {
        id: 'paan_bacterial_leaf_spot',
        type: 'disease',
        name_en: 'Bacterial Leaf Spot & Stem Canker (Xanthomonas campestris pv. betlicola)',
        name_or: 'ପାନ ଜୀବାଣୁ ଜନିତ ପତ୍ରଚିତା ରୋଗ',
        severity: 'High',
        symptoms_en: 'Tiny water-soaked spots on leaves surrounded by diffuse yellow halo, turning brown necrotic.',
        symptoms_or: 'ପାନ ଉପରେ ହଳଦିଆ ଘେର ବିଶିଷ୍ଟ ଛୋଟ ଛୋଟ କଳା ଚିତା ଦାଗ, ପତ୍ର ବିକ୍ରି ଯୋଗ୍ୟ ରହେ ନାହିଁ।',
        treatments: [
          {
            product_en: 'Streptocycline 0.1 g/L + Copper Oxychloride 1.5 g/L spray',
            product_or: 'ଷ୍ଟ୍ରେପ୍ଟୋସାଇକ୍ଲିନ୍ + କପର ଅକ୍ସିକ୍ଲୋରାଇଡ୍ ସ୍ପ୍ରେ',
            active_ingredient: 'Streptomycin + Copper Oxychloride',
            dose_per_litre: '0.1 g Streptocycline + 1.5 g COC',
            dose_per_200L: '20 g Streptocycline + 300 g COC in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Foliar spray of fresh cow dung supernatant 5%',
            organic_alternative_or: '୫% ଗୋବର ପାଣି ଛାଣି ପାନ ଉପରେ ସ୍ପ୍ରେ କରନ୍ତୁ',
            phi_days: 10
          }
        ]
      },
      {
        id: 'paan_root_knot_nematode',
        type: 'nematode',
        name_en: 'Betel Vine Root Knot Nematode (Meloidogyne incognita)',
        name_or: 'ପାନ ଗଣ୍ଠି ଚେର କୃମି ରୋଗ',
        severity: 'High',
        symptoms_en: 'Swelling and galls on roots, pale stunted vines with small crinkled yellow leaves.',
        symptoms_or: 'ପାନ ଚେରରେ ବହୁତ ଗଣ୍ଠି ହେବା, ପାନ ଗଛ ବଢ଼େ ନାହିଁ ଓ ପତ୍ର ଛୋଟ ହଳଦିଆ ପଡ଼ିଯାଏ।',
        treatments: [
          {
            product_en: 'Carbofuran 3% CG or Neem Cake soil application',
            product_or: 'ନିମ୍ବ ପିଡ଼ିଆ ଓ କାର୍ବୋଫୁରାନ୍ ମାଟି ପ୍ରୟୋଗ',
            active_ingredient: 'Carbofuran 3% CG',
            dose_per_litre: 'Apply 5 kg granules per 1000 vines along ridges',
            dose_per_200L: 'Soil application in bareja',
            type: 'chemical',
            organic_alternative_en: 'Neem cake application @ 500 kg/acre + Paecilomyces lilacinus @ 2 kg',
            organic_alternative_or: 'ନିମ୍ବ ପିଡ଼ିଆ ଓ କୃମିନାଶକ କବକ ପ୍ରୟୋଗ',
            phi_days: 30
          }
        ]
      },
      {
        id: 'paan_scale_insects',
        type: 'pest',
        name_en: 'Scale Insects & Mealybugs (Lepidosaphes cornutus)',
        name_or: 'ପାନ କାତିପୋକ ଓ ଧଳା ପୋକ',
        severity: 'Medium',
        symptoms_en: 'Minute mussel-shaped scales encrusting nodes and stems, sucking sap causing vine shrivelling.',
        symptoms_or: 'ପାନ କାଣ୍ଡ ଓ ଗଣ୍ଠି ଉପରେ କାତି ଭଳି ପୋକ ଜମି ରସ ଶୋଷି ଗଛ ଶୁଖାଇ ଦିଅନ୍ତି।',
        treatments: [
          {
            product_en: 'Malathion 50% EC or Dimethoate 30% EC targeted to stems',
            product_or: 'ମାଲାଥିଅନ୍ କିମ୍ବା ରୋଗର କାଣ୍ଡରେ ସ୍ପ୍ରେ',
            active_ingredient: 'Malathion 50% EC',
            dose_per_litre: '1.5 ml',
            dose_per_200L: '300 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Fish oil rosin soap (FORS) @ 25 g/L water spray on stems',
            organic_alternative_or: 'ମାଛ ତେଲ ସାବୁନ ୨୫ ଗ୍ରାମ/ଲିଟର ସ୍ପ୍ରେ',
            phi_days: 14
          }
        ]
      }
    ]
  }
];

export const FLOWERS: CropItem[] = [
  {
    id: 'marigold',
    category: 'flowers',
    name_en: 'Marigold (Gendei / Genda)',
    name_or: 'ଗେଣ୍ଡୁ ଫୁଲ (Marigold / Gendei)',
    name_hi: 'गेंदा (Marigold)',
    scientific_name: 'Tagetes erecta',
    icon: '🌼',
    soil_type_en: 'Deep fertile loam with good water drainage',
    soil_type_or: 'ନିଗିଡ଼ା ଦୋରସା ଓ ବାଲିଆ ମାଟି',
    duration_days: '90-120 days',
    water_requirement: 'Medium',
    water_requirement_or: 'ମଧ୍ୟମ ପାଣି',
    problems: [
      {
        id: 'marigold_collar_rot',
        type: 'disease',
        name_en: 'Collar Rot & Damping Off (Phytophthora cryptogea)',
        name_or: 'ଗେଣ୍ଡୁ ମୂଳପଚା ରୋଗ (ଢଳିପଡ଼ିବା)',
        severity: 'High',
        symptoms_en: 'Collar turns brown-black, rots at ground level, plants topple and wilt rapidly.',
        symptoms_or: 'ମାଟି ପାଖ କାଣ୍ଡ କଳା ପଡ଼ି ପଚିଯିବା ଓ ଗଛ ହଠାତ୍ ଢଳି ପଡ଼ି ମରିଯିବା।',
        treatments: [
          {
            product_en: 'Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ) drenching',
            product_or: 'ରିଡୋମିଲ୍ ଏମଜେଡ୍ ମୂଳ ଭିଜାଇବା',
            active_ingredient: 'Metalaxyl + Mancozeb',
            dose_per_litre: '2.5 g',
            dose_per_200L: '500 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Trichoderma harzianum @ 5 g/L drenching around plant base',
            organic_alternative_or: 'ଟ୍ରାଇକୋଡର୍ମା ୫ ଗ୍ରାମ/ଲିଟର ପାଣିରେ ମୂଳରେ ଢାଳିବା',
            phi_days: 7
          }
        ]
      },
      {
        id: 'marigold_bud_borer',
        type: 'pest',
        name_en: 'Gram Pod Borer / Bud Borer (Helicoverpa armigera)',
        name_or: 'ଗେଣ୍ଡୁ କଢ଼ ଓ ଫୁଲବିନ୍ଧା ପୋକ',
        severity: 'High',
        symptoms_en: 'Caterpillars bore holes into flower buds and eat petal bases preventing flower blooming.',
        symptoms_or: 'ପୋକ ଫୁଲ କଢ଼ କଣା କରି ଭିତର ପାଖୁଡ଼ା ଖାଇଯାଏ, ଫୁଲ ଫୁଟେ ନାହିଁ।',
        treatments: [
          {
            product_en: 'Emamectin Benzoate 5% SG or Spinosad 45% SC',
            product_or: 'ଏମାମେକ୍ଟିନ୍ ବେଞ୍ଜୋଏଟ୍ ୫% SG କିମ୍ବା ସ୍ପିନୋସାଡ୍',
            active_ingredient: 'Emamectin Benzoate 5% SG',
            dose_per_litre: '0.4 g Emamectin OR 0.3 ml Spinosad',
            dose_per_200L: '80 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Bacillus thuringiensis @ 2 g/L or Handpick caterpillars in evening',
            organic_alternative_or: 'ବିଟି ପାଉଡର ୨ ଗ୍ରାମ/ଲିଟର ସ୍ପ୍ରେ',
            phi_days: 5
          }
        ]
      },
      {
        id: 'marigold_leaf_spot',
        type: 'disease',
        name_en: 'Alternaria Leaf Spot & Flower Blight (Alternaria tagetica)',
        name_or: 'ଗେଣ୍ଡୁ ପତ୍ରଚିତା ଓ ଫୁଲପୋଡ଼ା ରୋଗ',
        severity: 'Medium',
        symptoms_en: 'Circular brownish-black spots on leaves and petal tips turning brown dry paper.',
        symptoms_or: 'ପତ୍ର ଓ ଫୁଲ ପାଖୁଡ଼ାରେ କଳା-ବାଦାମୀ ଦାଗ ହୋଇ ଶୁଖି କାଗଜ ଭଳି ହେବା।',
        treatments: [
          {
            product_en: 'Mancozeb 75% WP or Azoxystrobin 23% SC',
            product_or: 'ମାଙ୍କୋଜେବ୍ ୭୫% WP କିମ୍ବା ଆଜୋକ୍ସିଷ୍ଟ୍ରୋବିନ୍',
            active_ingredient: 'Mancozeb 75% WP',
            dose_per_litre: '2.5 g',
            dose_per_200L: '500 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Neem seed kernel extract 5% + Trichoderma spray',
            organic_alternative_or: 'ନିମ୍ବ ମଞ୍ଜି ଅର୍କ ୫% ସ୍ପ୍ରେ',
            phi_days: 5
          }
        ]
      },
      {
        id: 'marigold_red_spider_mite',
        type: 'pest',
        name_en: 'Red Spider Mite (Tetranychus urticae)',
        name_or: 'ଗେଣ୍ଡୁ ଲାଲ୍ ମାକୁଡ଼ି ପୋକ (ମାଇଟ୍)',
        severity: 'Medium',
        symptoms_en: 'Fine silken webbing on leaf underside, yellow stippling turning bronze and drying.',
        symptoms_or: 'ପତ୍ର ତଳେ ସୂକ୍ଷ୍ମ ଜାଲ କରି ରସ ଶୋଷିବା, ପତ୍ର ତମ୍ବାଳିଆ ପଡ଼ି ଶୁଖିଯିବା।',
        treatments: [
          {
            product_en: 'Spiromesifen 22.9% SC (Oberon) or Fenazaquin 10% EC',
            product_or: 'ଓବେରନ୍ (ସ୍ପାଇରୋମେସିଫେନ୍ ୨୨.୯% SC)',
            active_ingredient: 'Spiromesifen 22.9% SC',
            dose_per_litre: '1.0 ml',
            dose_per_200L: '200 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Wettable sulphur 80% WP @ 3 g/L',
            organic_alternative_or: 'ସଲଫର ୩ ଗ୍ରାମ/ଲିଟର ସ୍ପ୍ରେ',
            phi_days: 5
          }
        ]
      }
    ]
  },
  {
    id: 'rose',
    category: 'flowers',
    name_en: 'Rose (Golapa)',
    name_or: 'ଗୋଲାପ (Rose / Golapa)',
    name_hi: 'गुलाब (Rose)',
    scientific_name: 'Rosa chinensis / Rosa indica',
    icon: '🌹',
    soil_type_en: 'Rich clay loam with pH 6.0-6.8 and abundant organic manure',
    soil_type_or: 'ଉର୍ବର ଦୋରସା ଓ ପ୍ରଚୁର ସଢ଼ା ଖତ ଯୁକ୍ତ ମାଟି',
    duration_days: 'Perennial flowering bush',
    water_requirement: 'Medium',
    water_requirement_or: 'ମଧ୍ୟମ ପାଣି',
    problems: [
      {
        id: 'rose_dieback',
        type: 'disease',
        name_en: 'Rose Dieback (Diplodia rosarum / Colletotrichum)',
        name_or: 'ଗୋଲାପ ଡାଇବ୍ୟାକ୍ (ଡାଳ ଉପରୁ ତଳକୁ ଶୁଖିବା)',
        severity: 'High',
        symptoms_en: 'Pruned canes turn black from cut ends downwards into rootstock, plant dies.',
        symptoms_or: 'ଛଟେଇ ପରେ ଡାଳ ଅଗରୁ କଳା ପଡ଼ି ତଳକୁ ଶୁଖିଯିବା ଓ ଗଛ ମରିଯିବା।',
        treatments: [
          {
            product_en: 'Copper Oxychloride 50% WP paste on cut ends + Carbendazim spray',
            product_or: 'କଟା ଡାଳରେ କପର ଅକ୍ସିକ୍ଲୋରାଇଡ୍ ପେଷ୍ଟ ଲଗାଇବା',
            active_ingredient: 'Copper Oxychloride 50% WP',
            dose_per_litre: 'Paste: 10 g COC in 50 ml water; Spray: 2.5 g/L',
            dose_per_200L: '500 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Cut canes with sterilized secateurs at 45° angle and apply cow dung + lime paste',
            organic_alternative_or: 'ଗୋବର ଓ ଚୂନ ଲେପ କଟା ଡାଳରେ ଲଗାନ୍ତୁ',
            phi_days: 7
          }
        ]
      },
      {
        id: 'rose_black_spot',
        type: 'disease',
        name_en: 'Rose Black Spot (Diplocarpon rosae)',
        name_or: 'ଗୋଲାପ କଳା ଚିତା ରୋଗ (ବ୍ଲାକ୍ ସ୍ପଟ୍)',
        severity: 'High',
        symptoms_en: 'Circular black spots with feathery fringed margins on upper leaf surface, severe defoliation.',
        symptoms_or: 'ପତ୍ର ଉପରେ ଚିରା ଚିରା ଧାର ଥିବା କଳା ଗୋଲ ଦାଗ, ପତ୍ର ହଳଦିଆ ହୋଇ ସବୁ ଝଡ଼ିପଡ଼ିବା।',
        treatments: [
          {
            product_en: 'Difenoconazole 25% EC (Score) or Trifloxystrobin + Tebuconazole',
            product_or: 'ସ୍କୋର (ଡିଫେନୋକୋନାଜୋଲ୍ ୨୫% EC)',
            active_ingredient: 'Difenoconazole 25% EC',
            dose_per_litre: '0.8 ml',
            dose_per_200L: '160 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Baking soda spray: 5 g Sodium bicarbonate + 5 ml horticultural oil in 1 L water',
            organic_alternative_or: 'ଖାଇବା ସୋଡ଼ା ୫ ଗ୍ରାମ + ଅଳ୍ପ ତେଲ ପାଣିରେ ମିଶାଇ ସ୍ପ୍ରେ',
            phi_days: 7
          }
        ]
      },
      {
        id: 'rose_thrips',
        type: 'pest',
        name_en: 'Rose Thrips (Frankliniella occidentalis / Scirtothrips)',
        name_or: 'ଗୋଲାପ ଚିପୁଡ଼ା ପୋକ (ଫୁଲ ପାଖୁଡ଼ା କଳା ପଡ଼ିବା)',
        severity: 'High',
        symptoms_en: 'Petal edges turn brownish black and crisp, distorted crinkled flower buds that fail to open.',
        symptoms_or: 'ଫୁଲ ପାଖୁଡ଼ା ଧାର କଳା ପଡ଼ି ପୋଡ଼ିଗଲା ଭଳି ହେବା, କଢ଼ ଫୁଟିବା ଆଗରୁ ବିକୃତ ହୋଇ ଶୁଖିବା।',
        treatments: [
          {
            product_en: 'Fipronil 5% SC or Spinetoram 11.7% SC',
            product_or: 'ଫିପ୍ରୋନିଲ୍ ୫% SC କିମ୍ବା ଡେଲିଗେଟ୍',
            active_ingredient: 'Fipronil 5% SC',
            dose_per_litre: '1.5 ml Fipronil OR 0.5 ml Spinetoram',
            dose_per_200L: '300 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Blue sticky traps near rose bushes + Neem oil 1500 ppm @ 3 ml/L',
            organic_alternative_or: 'ନୀଳ ଅଠା ଫାନ୍ଦ + ନିମ୍ବ ତେଲ ସ୍ପ୍ରେ',
            phi_days: 5
          }
        ]
      },
      {
        id: 'rose_powdery_mildew',
        type: 'disease',
        name_en: 'Powdery Mildew of Rose (Podosphaera pannosa)',
        name_or: 'ଗୋଲାପ ଧଳା ପାଉଁଶିଆ ରୋଗ',
        severity: 'Medium',
        symptoms_en: 'Powdery white talcum powder coating on young leaves, curled shoots and distorted flower buds.',
        symptoms_or: 'କଅଁଳ ପତ୍ର ଓ କଢ଼ ଉପରେ ଧଳା ପାଉଡର କବକ, ପତ୍ର ବଙ୍କା ଟଙ୍କା ହୋଇ ମୋଡ଼ି ହେବା।',
        treatments: [
          {
            product_en: 'Penconazole 10% EC (Topas) or Hexaconazole 5% EC',
            product_or: 'ହେକ୍ସାକୋନାଜୋଲ୍ କିମ୍ବା ଟୋପାସ୍',
            active_ingredient: 'Hexaconazole 5% EC',
            dose_per_litre: '1.0 ml',
            dose_per_200L: '200 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Spray 10% raw cow milk solution or Wettable sulphur 2 g/L',
            organic_alternative_or: '୧୦% କଞ୍ଚା କ୍ଷୀର ପାଣି ସ୍ପ୍ରେ',
            phi_days: 5
          }
        ]
      }
    ]
  }
];

export const ORNAMENTAL_PLANTS: CropItem[] = [
  {
    id: 'indoor_plants',
    category: 'ornamental',
    name_en: 'Indoor & Foliage Plants (Monstera / Money Plant / Areca)',
    name_or: 'ଘର ଭିତର ଶୋଭାବର୍ଦ୍ଧକ ଗଛ (ମନି ପ୍ଲାଣ୍ଟ / ଆରେକା ପାମ)',
    name_hi: 'इंडोर प्लांट्स (मनी प्लांट / एरिका पाम)',
    scientific_name: 'Epipremnum aureum / Dypsis lutescens / Monstera deliciosa',
    icon: '🪴',
    soil_type_en: 'Porous potting mix of cocopeat, vermicompost, perlite, and garden soil',
    soil_type_or: 'ନଡ଼ିଆ କତା ଗୁଣ୍ଡ (କୋକୋପିଟ୍), ଜିଆଖତ ଓ ହାଲୁକା ମାଟି ମିଶ୍ରଣ',
    duration_days: 'Perennial foliage',
    water_requirement: 'Low',
    water_requirement_or: 'ମାଟି ଶୁଖିଲେ ଯାଇ ପାଣି ଦିଅନ୍ତୁ',
    problems: [
      {
        id: 'indoor_root_rot',
        type: 'disease',
        name_en: 'Overwatering Root Rot (Pythium / Phytophthora spp.)',
        name_or: 'ଅତ୍ୟଧିକ ପାଣିରୁ ଚେରପଚା ରୋଗ (ରୁଟ୍ ରଟ୍)',
        severity: 'High',
        symptoms_en: 'Yellow drooping soft leaves, potting soil stays soggy with sour odor, roots black and mushy.',
        symptoms_or: 'ପତ୍ର ହଳଦିଆ ହୋଇ ନଇଁ ପଡ଼ିବା, କୁଣ୍ଡ ମାଟି ସବୁବେଳେ କାଦୁଆ ରହି ଚେର କଳା ନରମ ହୋଇ ପଚିବା।',
        treatments: [
          {
            product_en: 'Carbendazim 50% WP or Metalaxyl + Mancozeb potting drench',
            product_or: 'କାର୍ବେଣ୍ଡାଜିମ୍ କୁଣ୍ଡ ମାଟିରେ ଢାଳିବା ଓ ପାଣି କମାଇବା',
            active_ingredient: 'Carbendazim 50% WP',
            dose_per_litre: '1.5 g / L water',
            dose_per_200L: 'Repot into fresh dry well-draining potting mix',
            type: 'chemical',
            organic_alternative_en: 'Trim mushy black roots, treat with Cinnamon powder / Trichoderma and repot',
            organic_alternative_or: 'ପଚା ଚେର କାଟି ଡାଲଚିନି ଗୁଣ୍ଡ ବା ଟ୍ରାଇକୋଡର୍ମା ଲଗାଇ ନୂଆ ମାଟିରେ ଲଗାନ୍ତୁ',
            phi_days: 0
          }
        ]
      },
      {
        id: 'indoor_mealybug',
        type: 'pest',
        name_en: 'Houseplant Mealybug (Pseudococcus viburni)',
        name_or: 'ଶୋଭାବର୍ଦ୍ଧକ ଗଛ ଧଳା ତୁଳା ପୋକ (ମିଲିବଗ୍)',
        severity: 'High',
        symptoms_en: 'Cottony white sticky residue in leaf axils, yellowing leaf curl, honeydew excretion.',
        symptoms_or: 'ପତ୍ର କୋଣରେ ତୁଳା ଭଳି ଧଳା ପୋକ ଜମି ରହିବା, ପତ୍ର ଅଠାଳିଆ ହୋଇ କୁଞ୍ଚିତ ହେବା।',
        treatments: [
          {
            product_en: 'Imidacloprid 17.8% SL or Thiamethoxam 25% WG',
            product_or: 'ଇମିଡାକ୍ଲୋପ୍ରିଡ୍ ୧୭.୮% SL',
            active_ingredient: 'Imidacloprid 17.8% SL',
            dose_per_litre: '0.4 ml',
            dose_per_200L: '80 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Rub leaves with 70% Isopropyl alcohol cotton swab + Neem soap spray',
            organic_alternative_or: 'ତୁଳାରେ ସ୍ପିରିଟ୍ ବା ନିମ୍ବ ସାବୁନ ପାଣି ଲଗାଇ ପୋଛି ଦିଅନ୍ତୁ',
            phi_days: 0
          }
        ]
      },
      {
        id: 'indoor_spider_mites',
        type: 'pest',
        name_en: 'Two-Spotted Spider Mite (Tetranychus urticae)',
        name_or: 'ଘର ଗଛ ଲାଲ୍-ହଳଦିଆ ମାଇଟ୍ (ଜାଲ ବୁଣିବା)',
        severity: 'Medium',
        symptoms_en: 'Dusty fine cobwebs between leaf stalks, yellow flecking, bleached dry foliage.',
        symptoms_or: 'ପତ୍ର ମଝିରେ ସୂକ୍ଷ୍ମ ବୁଢ଼ିଆଣୀ ଜାଲ, ପତ୍ର ଉପରେ ଛୋଟ ଛୋଟ ହଳଦିଆ ବିନ୍ଦୁ ଦାଗ।',
        treatments: [
          {
            product_en: 'Propargite 57% EC or Spiromesifen 22.9% SC',
            product_or: 'ଓବେରନ୍ କିମ୍ବା ଓମାଇଟ୍ (ପ୍ରୋପାର୍ଗାଇଟ୍)',
            active_ingredient: 'Spiromesifen 22.9% SC',
            dose_per_litre: '1.0 ml',
            dose_per_200L: '200 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Shower whole plant thoroughly with lukewarm water + spray rosemary/neem oil',
            organic_alternative_or: 'ଗଛକୁ ପାଣି ଧାରରେ ଧୋଇ ନିମ୍ବ ତେଲ ସ୍ପ୍ରେ କରନ୍ତୁ',
            phi_days: 0
          }
        ]
      },
      {
        id: 'indoor_leaf_tip_burn',
        type: 'nutrient',
        name_en: 'Fluoride / Salt Burn / Low Humidity Tip Burn',
        name_or: 'ପତ୍ର ଅଗ ପୋଡ଼ିବା (ଲୁଣିଆ ପାଣି ଓ କମ୍ ଆର୍ଦ୍ରତା)',
        severity: 'Low',
        symptoms_en: 'Dry crispy brown leaf tips and margins due to tap water chlorine/salts or dry AC air.',
        symptoms_or: 'କାଚ କଲମି ବା ଟ୍ୟାପ୍ ପାଣିରେ ଲୁଣ ଅଂଶ ଯୋଗୁଁ ପତ୍ରର ଅଗ ଶୁଖି କାଠୁଆ ବାଦାମୀ ହେବା।',
        treatments: [
          {
            product_en: 'Switch to RO/rain water + Flush pot with surplus water to leach salts',
            product_or: 'ମଧୁର ବର୍ଷା ପାଣି ବ୍ୟବହାର ଓ କୁଣ୍ଡରୁ ଲୁଣ ନିଷ୍କାସନ',
            active_ingredient: 'Leaching cultural remedy',
            dose_per_litre: 'Flush potting soil with 3x pot volume clean water',
            dose_per_200L: 'Cultural water treatment',
            type: 'cultural',
            organic_alternative_en: 'Group indoor plants together on pebble humidity trays and mist daily',
            organic_alternative_or: 'ଗୋଡ଼ି ଥାଳିରେ ପାଣି ରଖି କୁଣ୍ଡ ଉପରେ ବସାନ୍ତୁ',
            phi_days: 0
          }
        ]
      }
    ]
  }
];
