import { CropItem } from './types';

export const CEREALS_AND_MILLETS: CropItem[] = [
  {
    id: 'paddy',
    category: 'cereals',
    name_en: 'Paddy (Rice)',
    name_or: 'ଧାନ (Paddy)',
    name_hi: 'धान (चावल)',
    scientific_name: 'Oryza sativa',
    icon: '🌾',
    soil_type_en: 'Clayey to clay loam with high water holding capacity',
    soil_type_or: 'ମଟାଳ ଓ ଦୋରସା ମାଟି',
    duration_days: '110-145 days',
    water_requirement: 'High',
    water_requirement_or: 'ଅଧିକ ପାଣି',
    problems: [
      {
        id: 'paddy_blast',
        type: 'disease',
        name_en: 'Rice Blast (Magnaporthe oryzae)',
        name_or: 'ଧାନ ଚିଟା ରୋଗ (ବ୍ଲାଷ୍ଟ)',
        severity: 'High',
        symptoms_en: 'Spindle-shaped brown lesions with grey center on leaf blades and neck rot at heading stage.',
        symptoms_or: 'ପତ୍ରରେ ତ୍ରିକୋଣିଆ କିମ୍ବା ଡଙ୍ଗା ଆକାରର ବାଦାମୀ ଚିତା ଦାଗ, ଶିଁଷା ମୂଳ କଳା ପଡ଼ି ଭାଙ୍ଗିଯିବା।',
        treatments: [
          {
            product_en: 'Tricyclazole 75% WP (Baan)',
            product_or: 'ଟ୍ରାଇସାଇକ୍ଲାଜୋଲ୍ ୭୫% WP (ବାଣ)',
            active_ingredient: 'Tricyclazole 75% WP',
            dose_per_litre: '0.6 g',
            dose_per_200L: '120 g in 200 L water/acre',
            type: 'chemical',
            organic_alternative_en: 'Pseudomonas fluorescens 0.5% WP @ 5 g/L',
            organic_alternative_or: 'ସୁଡୋମୋନାସ୍ ଫ୍ଲୋରେସେନ୍ସ ୫ ଗ୍ରାମ/ଲିଟର',
            phi_days: 30
          }
        ]
      },
      {
        id: 'paddy_stem_borer',
        type: 'pest',
        name_en: 'Yellow Stem Borer (Scirpophaga incertulas)',
        name_or: 'ହଳଦିଆ କାଣ୍ଡବିନ୍ଧା ପୋକ',
        severity: 'High',
        symptoms_en: 'Dead heart at vegetative stage and white earheads (chaffy grain) at maturity.',
        symptoms_or: 'ଗଛ ବୃଦ୍ଧି ସମୟରେ ମଝି ଡାଳ ଶୁଖିବା (ମଲାଡିଲ) ଓ ପାଚିଲା ବେଳେ ଧଳା ଶିଁଷା (ଶୂନ୍ୟ ଧାନ)।',
        treatments: [
          {
            product_en: 'Chlorantraniliprole 0.4% G (Ferterra) / 18.5% SC (Coragen)',
            product_or: 'କୋରାଜେନ୍ / ଫର୍ଟେରା (କ୍ଲୋରାଣ୍ଟ୍ରାନିଲିପ୍ରୋଲ)',
            active_ingredient: 'Chlorantraniliprole 18.5% SC',
            dose_per_litre: '0.3 ml',
            dose_per_200L: '60 ml in 200 L water/acre',
            type: 'chemical',
            organic_alternative_en: 'Pheromone traps @ 8 traps/acre + Trichogramma japonicum egg cards',
            organic_alternative_or: 'ଫେରୋମୋନ୍ ଟ୍ରାପ୍ ୮ଟି/ଏକର + ଟ୍ରାଇକୋଗ୍ରାମା କାର୍ଡ',
            phi_days: 21
          }
        ]
      },
      {
        id: 'paddy_bacterial_leaf_blight',
        type: 'disease',
        name_en: 'Bacterial Leaf Blight (BLB)',
        name_or: 'ଜୀବାଣୁ ଜନିତ ପତ୍ରପୋଡ଼ା (BLB)',
        severity: 'High',
        symptoms_en: 'Water-soaked wavy yellow to translucent lesions along leaf margins starting from tip.',
        symptoms_or: 'ପତ୍ରର ଧାର ଧାର ହଳଦିଆରୁ ପାଉଁଶିଆ ହୋଇ କୁଞ୍ଚିତ ହେବା ଓ ପତ୍ର ଶୁଖିଯିବା।',
        treatments: [
          {
            product_en: 'Copper Oxychloride 50% WP + Streptocycline',
            product_or: 'କପର ଅକ୍ସିକ୍ଲୋରାଇଡ୍ ୫୦% + ଷ୍ଟ୍ରେପ୍ଟୋସାଇକ୍ଲିନ୍',
            active_ingredient: 'Copper Oxychloride 50% WP + Streptomycin Sulphate',
            dose_per_litre: '2.0 g COC + 0.1 g Streptocycline',
            dose_per_200L: '400 g COC + 20 g Streptocycline in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Fresh cow dung slurry spray 5% supernatant',
            organic_alternative_or: '୫% ସତେଜ ଗୋବର ପାଣି ଛାଣି ସ୍ପ୍ରେ କରନ୍ତୁ',
            phi_days: 15
          }
        ]
      },
      {
        id: 'paddy_zinc_deficiency',
        type: 'nutrient',
        name_en: 'Zinc Deficiency (Khaira Disease)',
        name_or: 'ଜିଙ୍କ ଅଭାବ (ଖଇରା ରୋଗ)',
        severity: 'Medium',
        symptoms_en: 'Rusty reddish-brown discoloration on lower leaves, stunted plant height.',
        symptoms_or: 'ତଳ ପତ୍ରରେ ତମ୍ବାଳିଆ ଖଇରା ରଙ୍ଗର ଦାଗ, ଗଛ ଡେଙ୍ଗା ନହୋଇ ବୁଦୁବୁଦିକା ରହିବା।',
        treatments: [
          {
            product_en: 'Chelated Zinc (EDTA Zn 12%) or Zinc Sulphate 21%',
            product_or: 'ଚିଲେଟେଡ୍ ଜିଙ୍କ (EDTA ୧୨%) କିମ୍ବା ଜିଙ୍କ ସଲଫେଟ୍',
            active_ingredient: 'Zinc Sulphate Heptahydrate 21% / EDTA Zn',
            dose_per_litre: '1.5 g Chelated Zn OR 5.0 g ZnSO4 + 2.5 g Lime',
            dose_per_200L: '300 g EDTA Zn in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Enriched farmyard manure with zinc @ 10 kg/acre',
            organic_alternative_or: 'ଖତ ସହିତ ଜିଙ୍କ ମିଶାଇ ମୂଳ ସାର ପ୍ରୟୋଗ',
            phi_days: 0
          }
        ]
      }
    ]
  },
  {
    id: 'wheat',
    category: 'cereals',
    name_en: 'Wheat',
    name_or: 'ଗହମ (Wheat)',
    name_hi: 'गेहूं (Wheat)',
    scientific_name: 'Triticum aestivum',
    icon: '🌾',
    soil_type_en: 'Well-drained fertile loamy soils with pH 6.0-7.5',
    soil_type_or: 'ଉର୍ବର ଦୋରସା ଓ ବାଲିଆ ମାଟି',
    duration_days: '100-125 days',
    water_requirement: 'Medium',
    water_requirement_or: 'ମଧ୍ୟମ ପାଣି',
    problems: [
      {
        id: 'wheat_rust',
        type: 'disease',
        name_en: 'Yellow / Brown Rust (Puccinia spp.)',
        name_or: 'ଗହମ ହଳଦିଆ ଓ ବାଦାମୀ ଗେରୁଆ ରୋଗ',
        severity: 'High',
        symptoms_en: 'Yellow linear stripes of powdery pustules on leaves resembling turmeric powder.',
        symptoms_or: 'ପତ୍ର ଉପରେ ହଳଦି ଗୁଣ୍ଡ ଭଳି ଧାଡ଼ି ଧାଡ଼ି ହଳଦିଆ ଗୁଣ୍ଡ ଦାଗ।',
        treatments: [
          {
            product_en: 'Propiconazole 25% EC (Tilt)',
            product_or: 'ପ୍ରୋପିକୋନାଜୋଲ୍ ୨୫% EC (ଟିଲ୍ଟ)',
            active_ingredient: 'Propiconazole 25% EC',
            dose_per_litre: '1.0 ml',
            dose_per_200L: '200 ml in 200 L water/acre',
            type: 'chemical',
            organic_alternative_en: 'Neem seed kernel extract 5% + Trichoderma spray',
            organic_alternative_or: 'ନିମ୍ବ ମଞ୍ଜି ଅର୍କ ୫% + ଟ୍ରାଇକୋଡର୍ମା ସ୍ପ୍ରେ',
            phi_days: 35
          }
        ]
      },
      {
        id: 'wheat_aphid',
        type: 'pest',
        name_en: 'Wheat Aphid (Sitobion avenae)',
        name_or: 'ଗହମ ଜାବପୋକ (ମାହୁ)',
        severity: 'Medium',
        symptoms_en: 'Sucking sap from leaves and young earheads, secreting sticky honeydew.',
        symptoms_or: 'ପତ୍ର ଓ କଅଁଳ ଶିଁଷାରୁ ରସ ଶୋଷିବା, ଅଠାଳିଆ ମହୁ ଭଳି ଝାଳ ଛାଡ଼ିବା।',
        treatments: [
          {
            product_en: 'Imidacloprid 17.8% SL',
            product_or: 'ଇମିଡାକ୍ଲୋପ୍ରିଡ୍ ୧୭.୮% SL',
            active_ingredient: 'Imidacloprid 17.8% SL',
            dose_per_litre: '0.4 ml',
            dose_per_200L: '80 ml in 200 L water/acre',
            type: 'chemical',
            organic_alternative_en: 'Neem oil 1500 ppm @ 3 ml/L or soap water solution',
            organic_alternative_or: 'ନିମ୍ବ ତେଲ ୩ ମିଲି/ଲିଟର କିମ୍ବା ସାବୁନ ପାଣି',
            phi_days: 21
          }
        ]
      },
      {
        id: 'wheat_loose_smut',
        type: 'disease',
        name_en: 'Loose Smut (Ustilago tritici)',
        name_or: 'ଗହମ କଳା ଅଙ୍ଗାରୁଆ ରୋଗ',
        severity: 'High',
        symptoms_en: 'Entire earhead transformed into black sooty mass of fungal spores.',
        symptoms_or: 'ଗହମ ଶିଁଷା ସମ୍ପୂର୍ଣ୍ଣ କଳା ଅଙ୍ଗାର ପାଉଁଶରେ ପରିଣତ ହୋଇଯିବା।',
        treatments: [
          {
            product_en: 'Carboxin 37.5% + Thiram 37.5% DS (Vitavax Power)',
            product_or: 'ଭିଟାଭାକ୍ସ ପାୱାର ବିହନ ବିଶୋଧନ',
            active_ingredient: 'Carboxin + Thiram',
            dose_per_litre: '2.5 g / kg seed',
            dose_per_200L: 'Seed treatment before sowing',
            type: 'chemical',
            organic_alternative_en: 'Hot water seed treatment at 54°C for 10 minutes',
            organic_alternative_or: '୫୪ ଡିଗ୍ରୀ ଗରମ ପାଣିରେ ୧୦ ମିନିଟ ବିହନ ବୁଡ଼ାଇ ଶୁଖାନ୍ତୁ',
            phi_days: 60
          }
        ]
      },
      {
        id: 'wheat_phalaris_minor',
        type: 'weed',
        name_en: 'Canary Grass Weed (Phalaris minor / Mandusi)',
        name_or: 'ଗୁଲି ଡଣ୍ଡା / ମାଣ୍ଡୁସି ଘାସ (ଅନାବନା)',
        severity: 'High',
        symptoms_en: 'Mimics wheat plants in early stage, smothers crop canopy reducing yield by 50%.',
        symptoms_or: 'ଗହମ ଭଳି ଦିଶୁଥିବା କ୍ଷତିକାରକ ଘାସ, ଗହମର ଖାଦ୍ୟ ଓ ପାଣି ଛଡ଼ାଇ ନେଇ ଉଜୁଡ଼ି ଦିଏ।',
        treatments: [
          {
            product_en: 'Clodinafop-propargyl 15% WP (Topic)',
            product_or: 'କ୍ଲୋଡିନାଫପ୍-ପ୍ରୋପାର୍ଗିଲ୍ ୧୫% WP',
            active_ingredient: 'Clodinafop-propargyl 15% WP',
            dose_per_litre: '0.8 g',
            dose_per_200L: '160 g in 200 L water at 30-35 DAS',
            type: 'chemical',
            organic_alternative_en: 'Two hand weedings at 20 and 40 days after sowing',
            organic_alternative_or: 'ବୁଣିବାର ୨୦ ଓ ୪୦ ଦିନରେ ହାତରେ ଘାସ ବଛା',
            phi_days: 45
          }
        ]
      }
    ]
  },
  {
    id: 'maize',
    category: 'cereals',
    name_en: 'Maize (Corn)',
    name_or: 'ମକା (Maize)',
    name_hi: 'मक्का (भुट्टा)',
    scientific_name: 'Zea mays',
    icon: '🌽',
    soil_type_en: 'Deep fertile loams, well-drained with neutral pH',
    soil_type_or: 'ନିଗିଡ଼ା ଦୋରସା ଓ ପଟୁ ମାଟି',
    duration_days: '85-115 days',
    water_requirement: 'Medium',
    water_requirement_or: 'ମଧ୍ୟମ ପାଣି',
    problems: [
      {
        id: 'maize_fall_armyworm',
        type: 'pest',
        name_en: 'Fall Armyworm - FAW (Spodoptera frugiperda)',
        name_or: 'ମକା ଫଲ୍ ଆର୍ମିୱାର୍ମ ପୋକ (FAW)',
        severity: 'High',
        symptoms_en: 'Papery window pane feeding on whorls with sawdust-like frass and deep holes.',
        symptoms_or: 'ମକା ଡାଳର ମୁକୁଟ ଭିତରେ ବସି ପତ୍ର କଣା କରି କରତ ଗୁଣ୍ଡ ଭଳି ମଳ ପକାଇବା।',
        treatments: [
          {
            product_en: 'Spinetoram 11.7% SC (Delegate)',
            product_or: 'ସ୍ପିନେଟୋରାମ୍ ୧୧.୭% SC (ଡେଲିଗେଟ୍)',
            active_ingredient: 'Spinetoram 11.7% SC',
            dose_per_litre: '0.5 ml',
            dose_per_200L: '100 ml in 200 L water directly into whorls',
            type: 'chemical',
            organic_alternative_en: 'Metarhizium rileyi / Beauveria bassiana 5 g/L into whorl',
            organic_alternative_or: 'ମେଟାରାଇଜିଅମ୍ ବା ବିଉଭେରିଆ ୫ ଗ୍ରାମ/ଲିଟର ଡାଳ ଭିତରକୁ ସ୍ପ୍ରେ',
            phi_days: 14
          }
        ]
      },
      {
        id: 'maize_turcicum_blight',
        type: 'disease',
        name_en: 'Turcicum Leaf Blight (Exserohilum turcicum)',
        name_or: 'ମକା ଟରସିକମ୍ ପତ୍ରପୋଡ଼ା ରୋଗ',
        severity: 'High',
        symptoms_en: 'Long elliptical grayish-green boat-shaped lesions on leaves.',
        symptoms_or: 'ପତ୍ର ଉପରେ ଲମ୍ବା ଡଙ୍ଗା ଭଳି ପାଉଁଶିଆ ବାଦାମୀ ଦାଗ।',
        treatments: [
          {
            product_en: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC',
            product_or: 'ଆମିଷ୍ଟାର ଟପ୍ (ଆଜୋକ୍ସିଷ୍ଟ୍ରୋବିନ୍ + ଡିଫେନୋକୋନାଜୋଲ)',
            active_ingredient: 'Azoxystrobin + Difenoconazole',
            dose_per_litre: '1.0 ml',
            dose_per_200L: '200 ml in 200 L water/acre',
            type: 'chemical',
            organic_alternative_en: 'Trichoderma viride foliar spray @ 5 g/L',
            organic_alternative_or: 'ଟ୍ରାଇକୋଡର୍ମା ଭିରିଡି ୫ ଗ୍ରାମ/ଲିଟର',
            phi_days: 21
          }
        ]
      },
      {
        id: 'maize_stem_borer',
        type: 'pest',
        name_en: 'Maize Stem Borer (Chilo partellus)',
        name_or: 'ମକା କାଣ୍ଡବିନ୍ଧା ପୋକ (ଚିଲୋ)',
        severity: 'Medium',
        symptoms_en: 'Shot holes across leaves in parallel lines, dead heart in young plants.',
        symptoms_or: 'ପତ୍ରରେ ଧାଡ଼ି ଧାଡ଼ି ବନ୍ଧୁକ ଗୁଳି ଭଳି ଗୋଲ କଣା, ମଝି ଡାଳ ଶୁଖିବା।',
        treatments: [
          {
            product_en: 'Cartap Hydrochloride 4% G (Caldan)',
            product_or: 'କାର୍ଟାପ୍ ହାଇଡ୍ରୋକ୍ଲୋରାଇଡ୍ ୪% G',
            active_ingredient: 'Cartap Hydrochloride 4% G',
            dose_per_litre: '5 kg granules per acre applied into leaf whorls',
            dose_per_200L: 'Whorl application 5 kg/acre',
            type: 'chemical',
            organic_alternative_en: 'Neem seed cake in whorl + light traps',
            organic_alternative_or: 'ନିମ୍ବ ପିଡ଼ିଆ ଗୁଣ୍ଡ ଗଛର ଡାଳ ଭିତରେ ଦିଅନ୍ତୁ',
            phi_days: 28
          }
        ]
      },
      {
        id: 'maize_nitrogen_deficiency',
        type: 'nutrient',
        name_en: 'Nitrogen Deficiency',
        name_or: 'ଯବକ୍ଷାରଜାନ ଅଭାବ (V-ଆକାର ହଳଦିଆ)',
        severity: 'Medium',
        symptoms_en: 'V-shaped yellowing starting from tip of older leaves along the midrib.',
        symptoms_or: 'ତଳ ପତ୍ରର ଅଗରୁ ଆରମ୍ଭ ହୋଇ ଶିରା ବାଟେ V-ଆକାରରେ ହଳଦିଆ ପଡ଼ି ଶୁଖିବା।',
        treatments: [
          {
            product_en: 'Urea 2% foliar spray or Nano Urea',
            product_or: 'ୟୁରିଆ ୨% ସ୍ପ୍ରେ କିମ୍ବା ନାନୋ ୟୁରିଆ',
            active_ingredient: 'Nano Nitrogen / Soluble Urea',
            dose_per_litre: '4 ml Nano Urea OR 20 g standard Urea / L',
            dose_per_200L: '800 ml Nano Urea in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Jeevamrutha application or vermicompost tea foliar spray',
            organic_alternative_or: 'ଜୀବାମୃତ କିମ୍ବା ଜିଆଖତ ପାଣି ସ୍ପ୍ରେ କରନ୍ତୁ',
            phi_days: 0
          }
        ]
      }
    ]
  },
  {
    id: 'ragi',
    category: 'cereals',
    name_en: 'Finger Millet (Ragi / Mandia)',
    name_or: 'ମାଣ୍ଡିଆ (Ragi / Mandia)',
    name_hi: 'रागी (मंडुआ)',
    scientific_name: 'Eleusine coracana',
    icon: '🌾',
    soil_type_en: 'Red loamy, gravelly, well drained upland soils',
    soil_type_or: 'ଲାଲ୍ ବାଲିଆ ଓ ନିଗିଡ଼ା ଉପର ଜମି',
    duration_days: '95-120 days',
    water_requirement: 'Low',
    water_requirement_or: 'କମ୍ ପାଣି (ଖରା ସହିଷ୍ଣୁ)',
    problems: [
      {
        id: 'ragi_blast',
        type: 'disease',
        name_en: 'Finger Millet Blast (Pyricularia grisea)',
        name_or: 'ମାଣ୍ଡିଆ ଚିଟା ରୋଗ (ବ୍ଲାଷ୍ଟ)',
        severity: 'High',
        symptoms_en: 'Diamond-shaped spots on leaves, finger and neck blast causing chaffy finger heads.',
        symptoms_or: 'ପତ୍ରରେ ହୀରା ଆକାରର ବାଦାମୀ ଚିତା ଦାଗ, ମାଣ୍ଡିଆ ଆଙ୍ଗୁଠି ଶିଁଷା କଳା ପଡ଼ି ମରିଯିବା।',
        treatments: [
          {
            product_en: 'Kitazin 48% EC (IBP)',
            product_or: 'କିଟାଜିନ୍ ୪୮% EC',
            active_ingredient: 'Kitazin (IBP) 48% EC',
            dose_per_litre: '1.0 ml',
            dose_per_200L: '200 ml in 200 L water/acre',
            type: 'chemical',
            organic_alternative_en: 'Pseudomonas fluorescens seed treatment @ 10 g/kg + foliar spray @ 5 g/L',
            organic_alternative_or: 'ସୁଡୋମୋନାସ୍ ବିହନ ବିଶୋଧନ ଓ ପତ୍ର ସ୍ପ୍ରେ',
            phi_days: 25
          }
        ]
      },
      {
        id: 'ragi_stem_borer',
        type: 'pest',
        name_en: 'Ragi Stem Borer (Sesamia inferens)',
        name_or: 'ମାଣ୍ଡିଆ ଗୋଲାପୀ କାଣ୍ଡବିନ୍ଧା ପୋକ',
        severity: 'Medium',
        symptoms_en: 'Pinkish larvae boring into tillers causing central shoot drying (dead heart).',
        symptoms_or: 'ଗୋଲାପୀ ଶୁକପୋକ କାଣ୍ଡ କଣା କରି ଭିତରେ ପଶିବା, ମଝି ଡାଳ ଶୁଖିବା।',
        treatments: [
          {
            product_en: 'Chlorpyrifos 20% EC',
            product_or: 'କ୍ଲୋରପାଇରିଫସ୍ ୨୦% EC',
            active_ingredient: 'Chlorpyrifos 20% EC',
            dose_per_litre: '2.0 ml',
            dose_per_200L: '400 ml in 200 L water/acre',
            type: 'chemical',
            organic_alternative_en: 'Neem seed kernel extract 5% @ 50 ml/L',
            organic_alternative_or: 'ନିମ୍ବ ମଞ୍ଜି ଅର୍କ ୫% ସ୍ପ୍ରେ',
            phi_days: 28
          }
        ]
      },
      {
        id: 'ragi_caterpillar',
        type: 'pest',
        name_en: 'Hairy Caterpillar (Amsacta albistriga)',
        name_or: 'ମାଣ୍ଡିଆ ବାଳୁଙ୍ଗା ପୋକ',
        severity: 'High',
        symptoms_en: 'Gregarious red hairy caterpillars voraciously defoliating entire seedlings.',
        symptoms_or: 'ଲାଲ୍ ରୁଆଁଳିଆ ପୋକ ଦଳବଦ୍ଧ ଭାବେ ଚାରା ଗଛର ସବୁ ପତ୍ର ଖାଇ ଡାଳ ଖାଲି କରିଦିଅନ୍ତି।',
        treatments: [
          {
            product_en: 'Quinalphos 25% EC',
            product_or: 'କୁଇନାଲଫସ୍ ୨୫% EC',
            active_ingredient: 'Quinalphos 25% EC',
            dose_per_litre: '2.0 ml',
            dose_per_200L: '400 ml in 200 L water/acre',
            type: 'chemical',
            organic_alternative_en: 'Trenching around field + dusting Methyl Parathion on boundaries',
            organic_alternative_or: 'ଜମି ଚାରିପାଖେ ଗାତ ଖୋଳି ପୋକ ଅଟକାନ୍ତୁ',
            phi_days: 21
          }
        ]
      },
      {
        id: 'ragi_downy_mildew',
        type: 'disease',
        name_en: 'Downy Mildew / Green Ear (Sclerophthora macrospora)',
        name_or: 'ମାଣ୍ଡିଆ ଡାଉନି ମିଲ୍ଡ୍ୟୁ (ସବୁଜ ଶିଁଷା ରୋଗ)',
        severity: 'Medium',
        symptoms_en: 'Floral heads turn into bushy leaf-like structures without seed setting.',
        symptoms_or: 'ମାଣ୍ଡିଆ ଶିଁଷାରେ ଦାନା ନହୋଇ ଝାଙ୍କ ଭଳି ଛୋଟ ଛୋଟ ପତ୍ରରେ ପରିଣତ ହୋଇଯିବା।',
        treatments: [
          {
            product_en: 'Metalaxyl 35% WS (Apron) seed treat + Ridomil MZ spray',
            product_or: 'ମେଟାଲାକ୍ସିଲ୍ ବିହନ ବିଶୋଧନ ଓ ରିଡୋମିଲ୍ ସ୍ପ୍ରେ',
            active_ingredient: 'Metalaxyl-M 35% WS',
            dose_per_litre: '2.0 g / kg seed OR 2.0 g / L for spray',
            dose_per_200L: '400 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Rogue out infected green-ear plants immediately',
            organic_alternative_or: 'ରୋଗିଣା ଗଛଗୁଡ଼ିକୁ ଉପାଡ଼ି ଜମିରୁ ଦୂରରେ ପୋଡ଼ି ଦିଅନ୍ତୁ',
            phi_days: 40
          }
        ]
      }
    ]
  },
  {
    id: 'bajra',
    category: 'cereals',
    name_en: 'Pearl Millet (Bajra)',
    name_or: 'ବାଜରା (Bajra)',
    name_hi: 'बाजरा',
    scientific_name: 'Pennisetum glaucum',
    icon: '🌾',
    soil_type_en: 'Sandy loam to well-drained shallow soils',
    soil_type_or: 'ବାଲିଆ ଦୋରସା ଓ ହାଲୁକା ମାଟି',
    duration_days: '75-90 days',
    water_requirement: 'Low',
    water_requirement_or: 'ଖୁବ୍ କମ୍ ପାଣି',
    problems: [
      {
        id: 'bajra_ergot',
        type: 'disease',
        name_en: 'Ergot of Bajra (Claviceps fusiformis)',
        name_or: 'ବାଜରା ଅର୍ଗଟ୍ (ମହୁଆ ରୋଗ)',
        severity: 'High',
        symptoms_en: 'Pinkish sweet honeydew droplets oozing from florets, later forming dark sclerotia poisonous to cattle.',
        symptoms_or: 'ଶିଁଷାରୁ ଗୋଲାପୀ ମହୁ ଭଳି ତେଲିଆ ରସ ଝରିବା, ପରେ ବିଷାକ୍ତ କଳା ଦାନା ହେବା।',
        treatments: [
          {
            product_en: 'Ziram 75% WP or Mancozeb 75% WP',
            product_or: 'ଜିରାମ୍ ୭୫% WP କିମ୍ବା ମାଙ୍କୋଜେବ୍ ୭୫% WP',
            active_ingredient: 'Ziram 75% WP',
            dose_per_litre: '2.0 g',
            dose_per_200L: '400 g in 200 L water at boot leaf stage',
            type: 'chemical',
            organic_alternative_en: 'Dip seeds in 20% salt water solution to float out ergot sclerotia',
            organic_alternative_or: '୨୦% ଲୁଣ ପାଣିରେ ବିହନ ପକାଇ ଭାସୁଥିବା ରୋଗିଣା ମଞ୍ଜି ଛାଣି ଫିଙ୍ଗନ୍ତୁ',
            phi_days: 30
          }
        ]
      },
      {
        id: 'bajra_smut',
        type: 'disease',
        name_en: 'Bajra Smut (Tolyposporium penicillariae)',
        name_or: 'ବାଜରା କଳା ଟିକା ରୋଗ (ସ୍ମଟ୍)',
        severity: 'Medium',
        symptoms_en: 'Ovaries converted into bright green turning brown-black fungal sori.',
        symptoms_or: 'ବାଜରା ଦାନା ସ୍ଥାନରେ କଳା ପାଉଁଶ ଭରା ବଡ଼ ବଡ଼ ଦାନା ସୃଷ୍ଟି ହେବା।',
        treatments: [
          {
            product_en: 'Carbendazim 50% WP (Bavistin)',
            product_or: 'ବାଭିଷ୍ଟିନ୍ (କାର୍ବେଣ୍ଡାଜିମ୍ ୫୦% WP)',
            active_ingredient: 'Carbendazim 50% WP',
            dose_per_litre: '1.0 g',
            dose_per_200L: '200 g in 200 L water at ear emergence',
            type: 'chemical',
            organic_alternative_en: 'Crop rotation and resistant cultivars (ICMH 451)',
            organic_alternative_or: 'ଫସଲ ପର୍ଯ୍ୟାୟ ଓ ରୋଗ ପ୍ରତିରୋଧକ କିସମ ଚାଷ',
            phi_days: 28
          }
        ]
      },
      {
        id: 'bajra_shoot_fly',
        type: 'pest',
        name_en: 'Shoot Fly (Atherigona soccata)',
        name_or: 'ବାଜରା ଡାଳମାଛି (ସୁଟ୍ ଫ୍ଲାଇ)',
        severity: 'High',
        symptoms_en: 'Maggots cut seedling growing point within 3 weeks causing dead hearts with rotting smell.',
        symptoms_or: '୩ ସପ୍ତାହ ଭିତରେ ଚାରା ଗଛର ମଝି କାଣ୍ଡ କାଟିଦିଏ, ମଝି ଡାଳ ପଚି ଦୁର୍ଗନ୍ଧ ହୁଏ।',
        treatments: [
          {
            product_en: 'Thiamethoxam 30% FS seed treatment',
            product_or: 'ଥିଆମେଥୋକ୍ସାମ୍ ୩୦% FS ବିହନ ବିଶୋଧନ',
            active_ingredient: 'Thiamethoxam 30% FS',
            dose_per_litre: '10 ml / kg seed',
            dose_per_200L: 'Seed dressing before planting',
            type: 'chemical',
            organic_alternative_en: 'Fish meal traps @ 10 traps/acre',
            organic_alternative_or: 'ଶୁଖୁଆ ଫାନ୍ଦ (Fish meal trap) ୧୦ ଟି/ଏକର',
            phi_days: 60
          }
        ]
      },
      {
        id: 'bajra_striga_weed',
        type: 'weed',
        name_en: 'Witchweed Parasitic Weed (Striga asiatica)',
        name_or: 'ବାଜରା ଷ୍ଟ୍ରାଇଗା ପରଜୀବୀ ଘାସ',
        severity: 'High',
        symptoms_en: 'Root parasite attaching to bajra roots causing wilting and chlorosis.',
        symptoms_or: 'ବାଜରା ଚେରକୁ ମାଡ଼ି ବସି ଗଛର ସବୁ ରସ ଶୋଷିନିଏ, ଗଛ ହଳଦିଆ ହୋଇ ଶୁଖିଯାଏ।',
        treatments: [
          {
            product_en: '2,4-D Sodium Salt 80% WP post-emergence spray',
            product_or: '୨,୪-ଡି ସୋଡିୟମ୍ ସଲ୍ଟ ୮୦% WP',
            active_ingredient: '2,4-D Sodium Salt 80% WP',
            dose_per_litre: '2.0 g directed to soil weeds',
            dose_per_200L: '400 g in 200 L water directed spray',
            type: 'chemical',
            organic_alternative_en: 'Trap cropping with cowpea or hand pulling before flowering',
            organic_alternative_or: 'ଝୁଡ଼ଙ୍ଗ ମିଶ୍ରିତ ଚାଷ କିମ୍ବା ଫୁଲ ଫୁଟିବା ଆଗରୁ ହାତରେ ଉପାଡ଼ିବା',
            phi_days: 45
          }
        ]
      }
    ]
  }
];

export const PULSES: CropItem[] = [
  {
    id: 'arhar',
    category: 'pulses',
    name_en: 'Pigeon Pea (Arhar / Harada)',
    name_or: 'ହରଡ଼ (Arhar / Pigeon Pea)',
    name_hi: 'अरहर (तूर दाल)',
    scientific_name: 'Cajanus cajan',
    icon: '🫘',
    soil_type_en: 'Deep loam to clay loam soils with excellent drainage',
    soil_type_or: 'ଗଭୀର ଦୋରସା ଓ ନିଗିଡ଼ା ମାଟି (ପାଣି ଜମିବା ଅନୁଚିତ)',
    duration_days: '140-180 days',
    water_requirement: 'Low',
    water_requirement_or: 'କମ୍ ପାଣି',
    problems: [
      {
        id: 'arhar_fusarium_wilt',
        type: 'disease',
        name_en: 'Fusarium Wilt (Fusarium udum)',
        name_or: 'ହରଡ଼ ଝାଉଁଳା ରୋଗ (ଫ୍ୟୁଜାରିୟମ ୱିଲ୍ଟ)',
        severity: 'High',
        symptoms_en: 'Sudden drooping and drying of leaves, black vascular band inside split stem.',
        symptoms_or: 'ହଠାତ୍ ଗଛର ସବୁ ପତ୍ର ଝାଉଁଳି ଶୁଖିଯିବା, କାଣ୍ଡ ଚିରିଲେ ଭିତରେ କଳା ଦାଗ ଦେଖାଯିବା।',
        treatments: [
          {
            product_en: 'Trichoderma viride 1% WP soil treat + Carbendazim seed treat',
            product_or: 'ଟ୍ରାଇକୋଡର୍ମା ଖତ ମିଶ୍ରଣ ଓ କାର୍ବେଣ୍ଡାଜିମ୍ ବିହନ ବିଶୋଧନ',
            active_ingredient: 'Carbendazim 50% WP + Trichoderma viride',
            dose_per_litre: '2.0 g / kg seed OR 2.5 kg Trichoderma in 200 kg FYM/acre',
            dose_per_200L: 'Soil enrichment before sowing',
            type: 'bio',
            organic_alternative_en: 'Trichoderma viride mixed with 100 kg neem cake and FYM',
            organic_alternative_or: '୧୦୦ କେଜି ନିମ୍ବ ପିଡ଼ିଆ ଓ ଖତ ସହ ଟ୍ରାଇକୋଡର୍ମା ମିଶାଇ ଜମିରେ ପ୍ରୟୋଗ',
            phi_days: 60
          }
        ]
      },
      {
        id: 'arhar_pod_borer',
        type: 'pest',
        name_en: 'Gram Pod Borer (Helicoverpa armigera)',
        name_or: 'ହରଡ଼ ଛୁଇଁ ବିନ୍ଧା ପୋକ (ହେଲିକୋଭର୍ପା)',
        severity: 'High',
        symptoms_en: 'Caterpillars feed on flower buds and bore circular holes into developing pods.',
        symptoms_or: 'ଶୁକପୋକ ଫୁଲ କଢ଼ ଖାଏ ଏବଂ ଛୁଇଁରେ ଗୋଲ କଣା କରି ଭିତର ମଞ୍ଜି ଖାଇଯାଏ।',
        treatments: [
          {
            product_en: 'Chlorantraniliprole 18.5% SC (Coragen) OR Emamectin Benzoate 5% SG',
            product_or: 'କୋରାଜେନ୍ (କ୍ଲୋରାଣ୍ଟ୍ରାନିଲିପ୍ରୋଲ୍) କିମ୍ବା ଏମାମେକ୍ଟିନ୍ ବେଞ୍ଜୋଏଟ୍',
            active_ingredient: 'Chlorantraniliprole 18.5% SC',
            dose_per_litre: '0.3 ml Coragen OR 0.4 g Emamectin',
            dose_per_200L: '60 ml Coragen in 200 L water/acre',
            type: 'chemical',
            organic_alternative_en: 'Helicoverpa NPV @ 250 LE/acre + 5 Pheromone traps/acre',
            organic_alternative_or: 'ହାଭି-NPV ଭୂତାଣୁ ସ୍ପ୍ରେ + ଫେରୋମୋନ୍ ଫାନ୍ଦ ୫ଟି/ଏକର',
            phi_days: 15
          }
        ]
      },
      {
        id: 'arhar_sterility_mosaic',
        type: 'disease',
        name_en: 'Sterility Mosaic Disease - SMD (Eriophyid Mite vector)',
        name_or: 'ହରଡ଼ ବନ୍ଧ୍ୟା ରୋଗ (SMD - ମାଇଟ୍ ବାହକ)',
        severity: 'High',
        symptoms_en: 'Bushy stunted growth, green mosaic leaves, complete lack of flower and pod formation.',
        symptoms_or: 'ଗଛ ବୁଦୁବୁଦିକା ହୋଇ ବଢ଼େ, ଫୁଲ ବା ଛୁଇଁ ଆଦୌ ଧରେ ନାହିଁ।',
        treatments: [
          {
            product_en: 'Propargite 57% EC or Fenazaquin 10% EC (for mite vector)',
            product_or: 'ପ୍ରୋପାର୍ଗାଇଟ୍ ୫୭% EC କିମ୍ବା ଫେନାଜାକୁଇନ୍',
            active_ingredient: 'Propargite 57% EC',
            dose_per_litre: '2.0 ml',
            dose_per_200L: '400 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Uproot infected plants immediately + spray wettable sulphur 3 g/L',
            organic_alternative_or: 'ରୋଗିଣା ଗଛ ଉପାଡ଼ି ପୋଡ଼ି ଦିଅନ୍ତୁ + ସଲଫର ୩ ଗ୍ରାମ/ଲିଟର ସ୍ପ୍ରେ',
            phi_days: 30
          }
        ]
      },
      {
        id: 'arhar_pod_fly',
        type: 'pest',
        name_en: 'Pod Fly (Melanagromyza obtusa)',
        name_or: 'ହରଡ଼ ଛୁଇଁ ମାଛି (ପଡ୍ ଫ୍ଲାଇ)',
        severity: 'Medium',
        symptoms_en: 'Maggots feed internally on seeds without external holes until adult emergence windows appear.',
        symptoms_or: 'ଛୁଇଁ ବାହାରୁ ଭଲ ଦିଶେ କିନ୍ତୁ ଭିତରେ ପୋକ ମଞ୍ଜି ଖାଇ ପତଳା ଝିଲ୍ଲୀ ଛାଡ଼ିଦିଏ।',
        treatments: [
          {
            product_en: 'Dimethoate 30% EC (Rogor) or Monocrotophos',
            product_or: 'ରୋଗର (ଡାଇମେଥୋଏଟ୍ ୩୦% EC)',
            active_ingredient: 'Dimethoate 30% EC',
            dose_per_litre: '1.7 ml',
            dose_per_200L: '350 ml in 200 L water at podding',
            type: 'chemical',
            organic_alternative_en: 'Neem oil 3000 ppm @ 3 ml/L at 50% flowering',
            organic_alternative_or: 'ନିମ୍ବ ତେଲ ୩୦୦୦ ppm ୩ ମିଲି/ଲିଟର ୫୦% ଫୁଲ ସମୟରେ',
            phi_days: 21
          }
        ]
      }
    ]
  },
  {
    id: 'moong',
    category: 'pulses',
    name_en: 'Green Gram (Moong)',
    name_or: 'ମୁଗ (Green Gram / Moong)',
    name_hi: 'मूंग (Green Gram)',
    scientific_name: 'Vigna radiata',
    icon: '🫘',
    soil_type_en: 'Well-drained alluvial, loam, or black soil',
    soil_type_or: 'ନିଗିଡ଼ା ଦୋରସା ଓ କଳା ମାଟି',
    duration_days: '60-75 days',
    water_requirement: 'Low',
    water_requirement_or: 'କମ୍ ପାଣି',
    problems: [
      {
        id: 'moong_mymv',
        type: 'disease',
        name_en: 'Yellow Mosaic Virus - MYMV (Whitefly Vector)',
        name_or: 'ମୁଗ ହଳଦିଆ ଶିରା ମୋଜାଇକ୍ ରୋଗ (ଧଳାମାଛି)',
        severity: 'High',
        symptoms_en: 'Bright yellow patches on leaves alternating with green, small distorted pods with shrivelled seeds.',
        symptoms_or: 'ପତ୍ରରେ ଉଜ୍ଜ୍ୱଳ ହଳଦିଆ ଦାଗ ମିଶ୍ରିତ ହୋଇ ରହିବା, ଛୁଇଁରେ ଦାନା ପୂରେ ନାହିଁ।',
        treatments: [
          {
            product_en: 'Thiamethoxam 25% WG (Actara) or Acetamiprid 20% SP',
            product_or: 'ଆକ୍ଟାରା (ଥିଆମେଥୋକ୍ସାମ୍ ୨୫% WG) କିମ୍ବା ଏସିଟାମିପ୍ରିଡ୍',
            active_ingredient: 'Thiamethoxam 25% WG',
            dose_per_litre: '0.3 g',
            dose_per_200L: '60 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Yellow sticky traps (15/acre) + Neem seed kernel extract 5%',
            organic_alternative_or: 'ହଳଦିଆ ଅଠା ଫାନ୍ଦ ୧୫ଟି/ଏକର + ନିମ୍ବ ମଞ୍ଜି ଅର୍କ ୫%',
            phi_days: 14
          }
        ]
      },
      {
        id: 'moong_powdery_mildew',
        type: 'disease',
        name_en: 'Powdery Mildew (Erysiphe polygoni)',
        name_or: 'ମୁଗ ଧଳା ପାଉଁଶିଆ ରୋଗ (ପାଉଡରି ମିଲ୍ଡ୍ୟୁ)',
        severity: 'Medium',
        symptoms_en: 'White floury powdery talcum-like patches covering leaves, stems, and pods.',
        symptoms_or: 'ପତ୍ର, କାଣ୍ଡ ଓ ଛୁଇଁ ଉପରେ ଅଟା ବା ଧଳା ପାଉଡର ଭଳି କବକ ଆସ୍ତରଣ।',
        treatments: [
          {
            product_en: 'Wettable Sulphur 80% WP (Sulfex) or Hexaconazole 5% EC',
            product_or: 'ସଲଫେକ୍ସ (ସଲଫର ୮୦% WP) କିମ୍ବା ହେକ୍ସାକୋନାଜୋଲ୍',
            active_ingredient: 'Wettable Sulphur 80% WP',
            dose_per_litre: '2.5 g Sulphur OR 1.0 ml Hexaconazole',
            dose_per_200L: '500 g Sulphur in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Cow milk spray 10% solution (100 ml milk in 900 ml water)',
            organic_alternative_or: '୧୦% କଞ୍ଚା କ୍ଷୀର ପାଣି ସ୍ପ୍ରେ କରନ୍ତୁ',
            phi_days: 10
          }
        ]
      },
      {
        id: 'moong_aphid',
        type: 'pest',
        name_en: 'Black Bean Aphid (Aphis craccivora)',
        name_or: 'ମୁଗ କଳା ଜାବପୋକ (ମାହୁ)',
        severity: 'Medium',
        symptoms_en: 'Colonies of black aphids cluster on tender shoots, flowers, and pods sucking sap.',
        symptoms_or: 'କଅଁଳ ଡାଳ, ଫୁଲ ଓ ଛୁଇଁ ଉପରେ କଳା ପୋକ ଜମି ରସ ଶୋଷି ଗଛ ଶୁଖାଇବା।',
        treatments: [
          {
            product_en: 'Imidacloprid 17.8% SL',
            product_or: 'ଇମିଡାକ୍ଲୋପ୍ରିଡ୍ ୧୭.୮% SL',
            active_ingredient: 'Imidacloprid 17.8% SL',
            dose_per_litre: '0.3 ml',
            dose_per_200L: '60 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Neem oil 1500 ppm @ 3 ml/L + soap emulsion',
            organic_alternative_or: 'ନିମ୍ବ ତେଲ ୩ ମିଲି/ଲିଟର ସହ ସାବୁନ ପାଣି ମିଶ୍ରଣ',
            phi_days: 15
          }
        ]
      },
      {
        id: 'moong_cercospora',
        type: 'disease',
        name_en: 'Cercospora Leaf Spot (Cercospora canescens)',
        name_or: 'ମୁଗ ସର୍କୋସ୍ପୋରା ପତ୍ର ଚିତା ରୋଗ',
        severity: 'Medium',
        symptoms_en: 'Circular to irregular brown spots with grayish centers and dark borders on leaves.',
        symptoms_or: 'ପତ୍ର ଉପରେ ଗୋଲାକାର ଧୂସର-ବାଦାମୀ ଚିତା ଦାଗ, ପତ୍ର ଅକାଳରେ ଝଡ଼ିବା।',
        treatments: [
          {
            product_en: 'Carbendazim 12% + Mancozeb 63% WP (SAAF)',
            product_or: 'ସାଫ୍ (କାର୍ବେଣ୍ଡାଜିମ୍ + ମାଙ୍କୋଜେବ୍)',
            active_ingredient: 'Carbendazim 12% + Mancozeb 63% WP',
            dose_per_litre: '2.0 g',
            dose_per_200L: '400 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Pseudomonas fluorescens foliar spray @ 5 g/L',
            organic_alternative_or: 'ସୁଡୋମୋନାସ୍ ୫ ଗ୍ରାମ/ଲିଟର ପତ୍ର ସ୍ପ୍ରେ',
            phi_days: 15
          }
        ]
      }
    ]
  },
  {
    id: 'urad',
    category: 'pulses',
    name_en: 'Black Gram (Urad / Biri)',
    name_or: 'ବିରି (Black Gram / Urad)',
    name_hi: 'उड़द (Black Gram)',
    scientific_name: 'Vigna mungo',
    icon: '🫘',
    soil_type_en: 'Heavy loamy to clay loam fertile soils',
    soil_type_or: 'ମଟାଳ ଓ ଦୋରସା ଉର୍ବର ମାଟି',
    duration_days: '65-80 days',
    water_requirement: 'Low',
    water_requirement_or: 'କମ୍ ପାଣି',
    problems: [
      {
        id: 'urad_leaf_crinkle',
        type: 'disease',
        name_en: 'Urad Leaf Crinkle Virus (ULCV)',
        name_or: 'ବିରି ପତ୍ର କୁଞ୍ଚନ ରୋଗ (କ୍ରିଙ୍କଲ୍ ଭୂତାଣୁ)',
        severity: 'High',
        symptoms_en: 'Severe crinkling, curling, and thickening of third leaf, bushy growth and no pod set.',
        symptoms_or: 'ପତ୍ର ମୋଟା ହୋଇ କୁଞ୍ଚିତ ହେବା, ଗଛ ଛୋଟ ରହି ଫୁଲ ଓ ଛୁଇଁ ନହେବା।',
        treatments: [
          {
            product_en: 'Acetamiprid 20% SP + Roguing diseased plants',
            product_or: 'ଏସିଟାମିପ୍ରିଡ୍ ୨୦% SP ଏବଂ ରୋଗିଣା ଗଛ ଉପାଡ଼ିବା',
            active_ingredient: 'Acetamiprid 20% SP',
            dose_per_litre: '0.4 g',
            dose_per_200L: '80 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Hot water seed treatment at 55°C for 10 min + Neem spray',
            organic_alternative_or: 'ଗରମ ପାଣିରେ ବିହନ ବିଶୋଧନ + ନିମ୍ବ ତେଲ ସ୍ପ୍ରେ',
            phi_days: 14
          }
        ]
      },
      {
        id: 'urad_pod_borer',
        type: 'pest',
        name_en: 'Spotted Pod Borer (Maruca vitrata)',
        name_or: 'ବିରି ଚିତ୍ରିତ ଛୁଇଁ ବିନ୍ଧା ପୋକ (ମାରୁକା)',
        severity: 'High',
        symptoms_en: 'Caterpillars web together flowers, leaves, and pods with silk, feeding within the web.',
        symptoms_or: 'ଫୁଲ, ପତ୍ର ଓ ଛୁଇଁକୁ ଜାଲ କରି ଗୁଡ଼ାଇ ଦିଏ ଏବଂ ଭିତରେ ବସି ସବୁ କୋରି ଖାଏ।',
        treatments: [
          {
            product_en: 'Chlorantraniliprole 18.5% SC or Flubendiamide 39.35% SC',
            product_or: 'କୋରାଜେନ୍ କିମ୍ବା ଫେମ (ଫ୍ଲୁବେଣ୍ଡିଆମାଇଡ୍)',
            active_ingredient: 'Chlorantraniliprole 18.5% SC',
            dose_per_litre: '0.3 ml',
            dose_per_200L: '60 ml in 200 L water/acre',
            type: 'chemical',
            organic_alternative_en: 'Bacillus thuringiensis (Bt) @ 2 g/L at early webbing',
            organic_alternative_or: 'ବିଟି (ବାସିଲସ୍ ଥୁରିନଜିଏନସିସ୍) ୨ ଗ୍ରାମ/ଲିଟର',
            phi_days: 15
          }
        ]
      },
      {
        id: 'urad_root_rot',
        type: 'disease',
        name_en: 'Dry Root Rot / Macrophomina (Rhizoctonia bataticola)',
        name_or: 'ବିରି ଶୁଖିଲା ଚେରପଚା ରୋଗ',
        severity: 'High',
        symptoms_en: 'Lower leaves yellow and drop, tap root becomes shredded, dark, and brittle with tiny sclerotia.',
        symptoms_or: 'ତଳ ପତ୍ର ହଳଦିଆ ହୋଇ ଝଡ଼ିବା, ଚେର କଳା ପଡ଼ି ଛେଚା ହୋଇ ଭାଙ୍ଗିଯିବା।',
        treatments: [
          {
            product_en: 'Carbendazim 50% WP seed treatment + Trichoderma soil application',
            product_or: 'କାର୍ବେଣ୍ଡାଜିମ୍ ବିହନ ବିଶୋଧନ + ଟ୍ରାଇକୋଡର୍ମା ଖତ ମିଶ୍ରଣ',
            active_ingredient: 'Carbendazim 50% WP',
            dose_per_litre: '2.0 g / kg seed',
            dose_per_200L: 'Soil application with FYM 100 kg/acre',
            type: 'chemical',
            organic_alternative_en: 'Trichoderma harzianum @ 2.5 kg/acre in 100 kg farmyard manure',
            organic_alternative_or: 'ଟ୍ରାଇକୋଡର୍ମା ୨.୫ କେଜି ଖତ ସହ ମିଶାଇ ଜମି ପ୍ରସ୍ତୁତି ବେଳେ ପ୍ରୟୋଗ',
            phi_days: 45
          }
        ]
      },
      {
        id: 'urad_iron_chlorosis',
        type: 'nutrient',
        name_en: 'Iron Chlorosis (Calcareous Soil Induced)',
        name_or: 'ଲୁହା (Iron) ଅଭାବ - ପତ୍ର ଧଳା ପଡ଼ିବା',
        severity: 'Medium',
        symptoms_en: 'Interveinal yellowing of youngest leaves turning ivory white in severe cases.',
        symptoms_or: 'ନୂଆ କଅଁଳ ପତ୍ରର ଶିରା ସବୁଜ ରହି ବାକି ଅଂଶ ହଳଦିଆ ଓ ଶେଷରେ ଧଳା କାଗଜ ଭଳି ହେବା।',
        treatments: [
          {
            product_en: 'Ferrous Sulphate (FeSO4) 1% + Citric Acid 0.1%',
            product_or: 'ଫେରସ୍ ସଲଫେଟ୍ (ହୀରାକସ) ୧% ସ୍ପ୍ରେ',
            active_ingredient: 'Ferrous Sulphate 19% Fe',
            dose_per_litre: '5.0 g FeSO4 + 0.5 g Citric acid (lemon juice)',
            dose_per_200L: '1 kg FeSO4 in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Foliar spray of enriched compost tea with sour butter milk',
            organic_alternative_or: 'ଖତ ପାଣି ସହ ଘୋଳ ଦହି ମିଶାଇ ପତ୍ର ସ୍ପ୍ରେ',
            phi_days: 0
          }
        ]
      }
    ]
  },
  {
    id: 'chana',
    category: 'pulses',
    name_en: 'Chickpea (Chana / Bengal Gram)',
    name_or: 'ବୁଟ / ଚଣା (Chickpea / Chana)',
    name_hi: 'चना (छोला)',
    scientific_name: 'Cicer arietinum',
    icon: '🫘',
    soil_type_en: 'Sandy loam to clay loam with good subsoil drainage',
    soil_type_or: 'ଦୋରସା ଓ କଳା ମାଟି (ଅତି ଜଳବଦ୍ଧତା ଅନୁପଯୁକ୍ତ)',
    duration_days: '95-115 days',
    water_requirement: 'Low',
    water_requirement_or: 'ଖୁବ୍ କମ୍ ପାଣି',
    problems: [
      {
        id: 'chana_aschochyta_blight',
        type: 'disease',
        name_en: 'Ascochyta Blight (Ascochyta rabiei)',
        name_or: 'ଚଣା ଆସ୍କୋକାଇଟା ଝାଉଁଳା ରୋଗ',
        severity: 'High',
        symptoms_en: 'Circular lesions on leaves and pods with dark brown concentric rings, stem girdling.',
        symptoms_or: 'ପତ୍ର ଓ ଛୁଇଁ ଉପରେ ଚକ୍ରାକାର ଗାଢ଼ ବାଦାମୀ ଦାଗ, ଡାଳ ଭାଙ୍ଗିଯିବା।',
        treatments: [
          {
            product_en: 'Chlorothalonil 75% WP (Kavach)',
            product_or: 'କବଚ (କ୍ଲୋରୋଥାଲୋନିଲ୍ ୭୫% WP)',
            active_ingredient: 'Chlorothalonil 75% WP',
            dose_per_litre: '2.0 g',
            dose_per_200L: '400 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Trichoderma viride foliar spray 5 g/L',
            organic_alternative_or: 'ଟ୍ରାଇକୋଡର୍ମା ୫ ଗ୍ରାମ/ଲିଟର ସ୍ପ୍ରେ',
            phi_days: 20
          }
        ]
      },
      {
        id: 'chana_pod_borer',
        type: 'pest',
        name_en: 'Chickpea Pod Borer (Helicoverpa armigera)',
        name_or: 'ଚଣା ଛୁଇଁ ବିନ୍ଧା ପୋକ',
        severity: 'High',
        symptoms_en: 'Larvae eat leaves and bore round holes into pods inserting half body inside.',
        symptoms_or: 'ଶୁକପୋକ ଛୁଇଁ ଭିତରେ ମୁଣ୍ଡ ପୂରାଇ ମଞ୍ଜି ଖାଇ କଣା କରିଦିଏ।',
        treatments: [
          {
            product_en: 'Emamectin Benzoate 5% SG (Proclaim)',
            product_or: 'ପ୍ରୋକ୍ଲେମ୍ (ଏମାମେକ୍ଟିନ୍ ବେଞ୍ଜୋଏଟ୍ ୫% SG)',
            active_ingredient: 'Emamectin Benzoate 5% SG',
            dose_per_litre: '0.4 g',
            dose_per_200L: '80 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'T-shaped bird perches (20/acre) + Pheromone traps @ 5/acre',
            organic_alternative_or: 'ପକ୍ଷୀ ବସିବା ପାଇଁ T-ଖୁଣ୍ଟି ୨୦ ଟି/ଏକର + ଫେରୋମୋନ୍ ଫାନ୍ଦ',
            phi_days: 14
          }
        ]
      },
      {
        id: 'chana_fusarium_wilt',
        type: 'disease',
        name_en: 'Chickpea Wilt (Fusarium oxysporum f. sp. ciceris)',
        name_or: 'ଚଣା ୱିଲ୍ଟ ଝାଉଁଳା ରୋଗ',
        severity: 'High',
        symptoms_en: 'Drooping of petioles and rachis, internal xylem browning visible when stem is split vertically.',
        symptoms_or: 'କଅଁଳ ଡାଳ ଓ ପତ୍ର ମଉଳି ଶୁଖିବା, କାଣ୍ଡ ଭିତରେ ବାଦାମୀ ରଙ୍ଗର ଶିରା ଦେଖାଯିବା।',
        treatments: [
          {
            product_en: 'Seed treat Carbendazim 2g + Thiram 2g per kg seed',
            product_or: 'କାର୍ବେଣ୍ଡାଜିମ୍ + ଥିରାମ ବିହନ ବିଶୋଧନ',
            active_ingredient: 'Carbendazim + Thiram',
            dose_per_litre: '3.0 g / kg seed',
            dose_per_200L: 'Seed treatment before sowing',
            type: 'chemical',
            organic_alternative_en: 'Seed treatment with Trichoderma viride @ 10 g/kg seed',
            organic_alternative_or: 'ଟ୍ରାଇକୋଡର୍ମା ୧୦ ଗ୍ରାମ ପ୍ରତି କେଜି ବିହନରେ ବିଶୋଧନ',
            phi_days: 60
          }
        ]
      },
      {
        id: 'chana_cutworm',
        type: 'pest',
        name_en: 'Black Cutworm (Agrotis ipsilon)',
        name_or: 'ଚଣା କାଣ୍ଡକଟା ପୋକ (କଟ୍-ୱାର୍ମ)',
        severity: 'Medium',
        symptoms_en: 'Nocturnal greasy black caterpillars cut young seedlings at soil level at night.',
        symptoms_or: 'ରାତିରେ ମାଟିରୁ ବାହାରି ଛୋଟ ଚାରା ଗଛର ଗୋଡ଼ କାଟିଦିଏ, ସକାଳେ ଗଛ ପଡ଼ି ରହେ।',
        treatments: [
          {
            product_en: 'Chlorpyrifos 20% EC soil drenching',
            product_or: 'କ୍ଲୋରପାଇରିଫସ୍ ୨୦% EC ମାଟି ଭିଜାଇବା',
            active_ingredient: 'Chlorpyrifos 20% EC',
            dose_per_litre: '3.0 ml drenching near root zone in late afternoon',
            dose_per_200L: '600 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Poison bait: 10 kg rice bran + 1 kg jaggery + 100 ml Chlorpyrifos/Bt balls near plants',
            organic_alternative_or: 'କୁଣ୍ଡା ଓ ଗୁଡ଼ ମିଶ୍ରିତ ବିଷ ଗୁଳି ଜମିରେ ସନ୍ଧ୍ୟାବେଳେ ପକାନ୍ତୁ',
            phi_days: 30
          }
        ]
      }
    ]
  }
];
