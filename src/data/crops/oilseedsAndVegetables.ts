import { CropItem } from './types';

export const OILSEEDS: CropItem[] = [
  {
    id: 'groundnut',
    category: 'oilseeds',
    name_en: 'Groundnut (Peanut / Chinabadam)',
    name_or: 'ଚିନାବାଦାମ (Groundnut)',
    name_hi: 'मूंगफली (Groundnut)',
    scientific_name: 'Arachis hypogaea',
    icon: '🥜',
    soil_type_en: 'Well-drained light sandy loam with good calcium content',
    soil_type_or: 'ବାଲିଆ ଦୋରସା ଓ ଚୂନ ଯୁକ୍ତ ହାଲୁକା ମାଟି (ଯେପରି ଛୁଇଁ ସହଜରେ ମାଟିରେ ପଶିପାରିବ)',
    duration_days: '105-125 days',
    water_requirement: 'Medium',
    water_requirement_or: 'ମଧ୍ୟମ ପାଣି',
    problems: [
      {
        id: 'groundnut_tikka',
        type: 'disease',
        name_en: 'Tikka Disease / Leaf Spot (Cercospora arachidicola)',
        name_or: 'ଚିନାବାଦାମ ଟିକା ରୋଗ (ପତ୍ର ଚିତା)',
        severity: 'High',
        symptoms_en: 'Early and late leaf spots: circular dark brown spots with bright yellow halo causing severe defoliation.',
        symptoms_or: 'ପତ୍ରରେ ଗାଢ଼ କଳା-ବାଦାମୀ ଦାଗ ଏବଂ ଚାରିପାଖରେ ହଳଦିଆ ବଳୟ, ପତ୍ର ଝଡ଼ିବା।',
        treatments: [
          {
            product_en: 'Tebuconazole 25.9% EC (Folicur) OR Mancozeb 75% WP',
            product_or: 'ଟେବୁକୋନାଜୋଲ୍ (ଫୋଲିକର) କିମ୍ବା ମାଙ୍କୋଜେବ୍ ୭୫%',
            active_ingredient: 'Tebuconazole 25.9% EC',
            dose_per_litre: '1.0 ml Tebuconazole OR 2.5 g Mancozeb',
            dose_per_200L: '200 ml Tebuconazole in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Cow urine 10% spray + Pseudomonas fluorescens 5 g/L',
            organic_alternative_or: '୧୦% ଗୋମୂତ୍ର ସହ ସୁଡୋମୋନାସ୍ ୫ ଗ୍ରାମ/ଲିଟର ସ୍ପ୍ରେ',
            phi_days: 21
          }
        ]
      },
      {
        id: 'groundnut_collar_rot',
        type: 'disease',
        name_en: 'Collar Rot / Crown Rot (Aspergillus niger)',
        name_or: 'ଚିନାବାଦାମ କଲାର ରଟ୍ (ମୂଳପଚା ରୋଗ)',
        severity: 'High',
        symptoms_en: 'Black fungal spore masses on collar region at ground level causing seedling collapse.',
        symptoms_or: 'ମାଟି ସଂଲଗ୍ନ କାଣ୍ଡରେ କଳା ପାଉଡର ଭଳି କବକ ହୋଇ ଚାରା ଗଛ ଢଳି ପଡ଼ି ମରିଯିବା।',
        treatments: [
          {
            product_en: 'Carbendazim 50% WP (2 g/kg seed treat) + Mancozeb',
            product_or: 'ବାଭିଷ୍ଟିନ୍ ବିହନ ବିଶୋଧନ + ମାଙ୍କୋଜେବ୍ ମାଟି ଭିଜାଇବା',
            active_ingredient: 'Carbendazim 50% WP',
            dose_per_litre: '2.0 g / kg seed OR 2.0 g / L for soil drench',
            dose_per_200L: '400 g in 200 L water drenching',
            type: 'chemical',
            organic_alternative_en: 'Trichoderma harzianum seed treatment @ 10 g/kg seed',
            organic_alternative_or: 'ଟ୍ରାଇକୋଡର୍ମା ୧୦ ଗ୍ରାମ ପ୍ରତି କେଜି ବିହନରେ ମିଶାଇ ବିଶୋଧନ',
            phi_days: 45
          }
        ]
      },
      {
        id: 'groundnut_white_grub',
        type: 'pest',
        name_en: 'White Grub (Holotrichia consanguinea)',
        name_or: 'ଧଳା ଶୁକପୋକ (ହ୍ୱାଇଟ୍ ଗ୍ରବ୍ / ମାଟିପୋକ)',
        severity: 'High',
        symptoms_en: 'C-shaped fat white larvae chew tap roots and pods underground causing patches of dead wilted plants.',
        symptoms_or: 'ମାଟି ତଳେ ରହି ଗଛର ଚେର ଓ କଞ୍ଚା ବାଦାମ ଛୁଇଁ ଖାଇଦିଏ, ଜମିରେ ତାଳି ତାଳି ଗଛ ମରିଯାଏ।',
        treatments: [
          {
            product_en: 'Fipronil 40% + Imidacloprid 40% WG (Lesenta) / Chlorpyrifos 20% EC',
            product_or: 'ଲେସେଣ୍ଟା କିମ୍ବା କ୍ଲୋରପାଇରିଫସ୍ ୨୦% EC ମାଟି ପ୍ରୟୋଗ',
            active_ingredient: 'Fipronil + Imidacloprid',
            dose_per_litre: '1.0 g Lesenta OR 4.0 ml Chlorpyrifos drenching',
            dose_per_200L: 'Soil application at sowing or first weeding',
            type: 'chemical',
            organic_alternative_en: 'Metarhizium anisopliae bio-control fungus @ 2 kg/acre in 100 kg FYM',
            organic_alternative_or: 'ମେଟାରାଇଜିଅମ୍ ୨ କେଜି ଖତ ସହ ମିଶାଇ ଜମି ପ୍ରସ୍ତୁତି ବେଳେ ପ୍ରୟୋଗ',
            phi_days: 40
          }
        ]
      },
      {
        id: 'groundnut_leaf_miner',
        type: 'pest',
        name_en: 'Groundnut Leaf Miner (Aproaerema modicella)',
        name_or: 'ଚିନାବାଦାମ ପତ୍ରସୁଡ଼ଙ୍ଗୀ ପୋକ (ଲିଫ୍ ମାଇନର)',
        severity: 'Medium',
        symptoms_en: 'Small blister mines on leaves, leaflets folded and webbed together, turning brown and burnt.',
        symptoms_or: 'ପତ୍ର ଭିତରେ ଧଳା ସୁଡ଼ଙ୍ଗ କରି ପତ୍ର ଯୋଡ଼ି ଦିଏ, ପତ୍ର ପୋଡ଼ିଗଲା ଭଳି ଶୁଖିଯାଏ।',
        treatments: [
          {
            product_en: 'Quinalphos 25% EC or Dimethoate 30% EC',
            product_or: 'କୁଇନାଲଫସ୍ ୨୫% EC କିମ୍ବା ରୋଗର',
            active_ingredient: 'Quinalphos 25% EC',
            dose_per_litre: '2.0 ml',
            dose_per_200L: '400 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Neem oil 1500 ppm @ 4 ml/L + light trap installation',
            organic_alternative_or: 'ନିମ୍ବ ତେଲ ୪ ମିଲି/ଲିଟର ସ୍ପ୍ରେ + ଆଲୋକ ଫାନ୍ଦ ବ୍ୟବହାର',
            phi_days: 25
          }
        ]
      }
    ]
  },
  {
    id: 'mustard',
    category: 'oilseeds',
    name_en: 'Mustard (Sarson / Sorisa)',
    name_or: 'ସୋରିଷ (Mustard / Sarson)',
    name_hi: 'सरसों (Mustard)',
    scientific_name: 'Brassica juncea',
    icon: '🌼',
    soil_type_en: 'Sandy loam to clay loam with good drainage and pH 6.0-7.5',
    soil_type_or: 'ବାଲିଆ ଦୋରସା ଓ ନିଗିଡ଼ା ମାଟି',
    duration_days: '90-110 days',
    water_requirement: 'Low',
    water_requirement_or: 'କମ୍ ପାଣି',
    problems: [
      {
        id: 'mustard_aphid',
        type: 'pest',
        name_en: 'Mustard Aphid (Lipaphis erysimi)',
        name_or: 'ସୋରିଷ ଜାବପୋକ (ମାହୁ)',
        severity: 'High',
        symptoms_en: 'Dense colonies of green aphids sucking sap from inflorescence, curling pods, halting seed development.',
        symptoms_or: 'ଫୁଲ କେନ୍ଦା ଓ ଛୁଇଁରେ ହଜାର ହଜାର ସବୁଜ ଜାବପୋକ ବସି ରସ ଶୋଷି ଫସଲ ନଷ୍ଟ କରନ୍ତି।',
        treatments: [
          {
            product_en: 'Dimethoate 30% EC (Rogor) or Thiamethoxam 25% WG',
            product_or: 'ରୋଗର (ଡାଇମେଥୋଏଟ୍ ୩୦% EC) କିମ୍ବା ଆକ୍ଟାରା',
            active_ingredient: 'Dimethoate 30% EC',
            dose_per_litre: '1.7 ml Rogor OR 0.3 g Thiamethoxam',
            dose_per_200L: '350 ml Rogor in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Yellow sticky traps (15/acre) + Garlic-chilli extract 5%',
            organic_alternative_or: 'ହଳଦିଆ ଫାନ୍ଦ ୧୫ଟି/ଏକର + ରସୁଣ-ଲଙ୍କା କାଢ଼ା ସ୍ପ୍ରେ',
            phi_days: 14
          }
        ]
      },
      {
        id: 'mustard_white_rust',
        type: 'disease',
        name_en: 'White Rust / Blister (Albugo candida)',
        name_or: 'ସୋରିଷ ଧଳା ଗେରୁଆ ରୋଗ (ହ୍ୱାଇଟ୍ ରଷ୍ଟ)',
        severity: 'High',
        symptoms_en: 'White to creamy shiny blisters on undersurface of leaves, floral malformation (staghead).',
        symptoms_or: 'ପତ୍ର ତଳେ ଧଳା ଚକ୍ଚକ୍ ଫୋଟକା ଦାଗ, ଫୁଲ କେନ୍ଦା ବଙ୍କା ହୋଇ ହରିଣ ଶିଙ୍ଗ ଭଳି ବିକୃତ ହେବା।',
        treatments: [
          {
            product_en: 'Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ)',
            product_or: 'ରିଡୋମିଲ୍ ଏମଜେଡ୍ (ମେଟାଲାକ୍ସିଲ୍ + ମାଙ୍କୋଜେବ୍)',
            active_ingredient: 'Metalaxyl 8% + Mancozeb 64% WP',
            dose_per_litre: '2.0 g',
            dose_per_200L: '400 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Bordeaux mixture 1% foliar spray',
            organic_alternative_or: '୧% ବୋର୍ଦ୍ଦୋ ମିଶ୍ରଣ ପତ୍ର ସ୍ପ୍ରେ',
            phi_days: 21
          }
        ]
      },
      {
        id: 'mustard_alternaria_blight',
        type: 'disease',
        name_en: 'Alternaria Blight (Alternaria brassicae)',
        name_or: 'ସୋରିଷ ଅଲଟରନାରିଆ ପତ୍ରପୋଡ଼ା ରୋଗ',
        severity: 'High',
        symptoms_en: 'Concentric target-board rings on leaves, black linear spots on siliquae pods causing seed shattering.',
        symptoms_or: 'ପତ୍ରରେ ଚକ୍ରାକାର ବାଦାମୀ ଦାଗ, ଛୁଇଁ ଉପରେ କଳା ଦାଗ ହୋଇ ମଞ୍ଜି ପୂରିବା ଆଗରୁ ଫାଟିଯିବା।',
        treatments: [
          {
            product_en: 'Mancozeb 75% WP or Iprodione 50% WP (Rovral)',
            product_or: 'ମାଙ୍କୋଜେବ୍ ୭୫% WP କିମ୍ବା ରୋଭରାଲ୍',
            active_ingredient: 'Mancozeb 75% WP',
            dose_per_litre: '2.5 g',
            dose_per_200L: '500 g in 200 L water at 45 DAS',
            type: 'chemical',
            organic_alternative_en: 'Trichoderma harzianum @ 5 g/L spray',
            organic_alternative_or: 'ଟ୍ରାଇକୋଡର୍ମା ୫ ଗ୍ରାମ/ଲିଟର ସ୍ପ୍ରେ',
            phi_days: 21
          }
        ]
      },
      {
        id: 'mustard_sawfly',
        type: 'pest',
        name_en: 'Mustard Sawfly (Athalia lugens proxima)',
        name_or: 'ସୋରିଷ କରତମାଛି ଶୁକପୋକ',
        severity: 'Medium',
        symptoms_en: 'Dark greenish-black cylindrical larvae skeletonize leaves by nibbling margins into jagged tears.',
        symptoms_or: 'ଗାଢ଼ ସବୁଜ-କଳା ପୋକ କରତ ଭଳି ପତ୍ରର ଧାର କାଟି କଣା କରି ଖାଆନ୍ତି।',
        treatments: [
          {
            product_en: 'Malathion 50% EC',
            product_or: 'ମାଲାଥିଅନ୍ ୫୦% EC',
            active_ingredient: 'Malathion 50% EC',
            dose_per_litre: '1.5 ml',
            dose_per_200L: '300 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Hand picking in early morning or dusting wood ash on foliage',
            organic_alternative_or: 'ସକାଳୁ ହାତରେ ବାଛି ମାରିବା କିମ୍ବା ପାଉଁଶ ଛିଞ୍ଚିବା',
            phi_days: 10
          }
        ]
      }
    ]
  },
  {
    id: 'sesame',
    category: 'oilseeds',
    name_en: 'Sesame (Rasi / Til)',
    name_or: 'ରାଶି (Sesame / Til)',
    name_hi: 'तिल (Sesame)',
    scientific_name: 'Sesamum indicum',
    icon: '🌱',
    soil_type_en: 'Well drained sandy loam to light red soils',
    soil_type_or: 'ନିଗିଡ଼ା ବାଲିଆ ଦୋରସା ଓ ଲାଲ୍ ମାଟି',
    duration_days: '80-95 days',
    water_requirement: 'Low',
    water_requirement_or: 'ଖୁବ୍ କମ୍ ପାଣି',
    problems: [
      {
        id: 'sesame_phyllody',
        type: 'disease',
        name_en: 'Sesame Phyllody (Phytoplasma - Leafhopper vector)',
        name_or: 'ରାଶି ଫିଲୋଡି ରୋଗ (ପତ୍ରଭରା ଶିଁଷା)',
        severity: 'High',
        symptoms_en: 'Floral parts transformed into green leafy structures, profuse clustering, zero seed capsule formation.',
        symptoms_or: 'ଫୁଲ ନହୋଇ ଗୁଚ୍ଛ ଗୁଚ୍ଛ ସବୁଜ ପତ୍ର ହୋଇଯିବା, ରାଶି ଛୁଇଁ ଆଦୌ ଧରେ ନାହିଁ।',
        treatments: [
          {
            product_en: 'Dimethoate 30% EC (Rogor) or Imidacloprid (to control leafhoppers)',
            product_or: 'ରୋଗର କିମ୍ବା ଇମିଡାକ୍ଲୋପ୍ରିଡ୍ (ଡେଇଁପୋକ ନିୟନ୍ତ୍ରଣ)',
            active_ingredient: 'Dimethoate 30% EC',
            dose_per_litre: '1.5 ml',
            dose_per_200L: '300 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Rogue out affected plants immediately + Neem oil 3000 ppm spray',
            organic_alternative_or: 'ରୋଗିଣା ଗଛ ଉପାଡ଼ି ପୋଡ଼ନ୍ତୁ + ନିମ୍ବ ତେଲ ସ୍ପ୍ରେ',
            phi_days: 21
          }
        ]
      },
      {
        id: 'sesame_antigastra',
        type: 'pest',
        name_en: 'Shoot & Leaf Webber (Antigastra catalaunalis)',
        name_or: 'ରାଶି ଡଗ ଓ ପତ୍ରଗୁଡ଼ା ପୋକ',
        severity: 'High',
        symptoms_en: 'Caterpillars web together tender top leaves, flowers, and bore into developing capsules.',
        symptoms_or: 'ଡଗ ଓ ପତ୍ରକୁ ଜାଲ କରି ଗୁଡ଼ାଇ ଦିଏ ଏବଂ ରାଶି ଛୁଇଁ କଣା କରି ଭିତର ମଞ୍ଜି ଖାଇଯାଏ।',
        treatments: [
          {
            product_en: 'Emamectin Benzoate 5% SG or Quinalphos 25% EC',
            product_or: 'ଏମାମେକ୍ଟିନ୍ ବେଞ୍ଜୋଏଟ୍ ୫% SG କିମ୍ବା କୁଇନାଲଫସ୍',
            active_ingredient: 'Emamectin Benzoate 5% SG',
            dose_per_litre: '0.4 g Emamectin OR 2.0 ml Quinalphos',
            dose_per_200L: '80 g Emamectin in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Bt (Bacillus thuringiensis) @ 2 g/L + light trap',
            organic_alternative_or: 'ବିଟି ପାଉଡର ୨ ଗ୍ରାମ/ଲିଟର ସ୍ପ୍ରେ + ଆଲୋକ ଫାନ୍ଦ',
            phi_days: 14
          }
        ]
      },
      {
        id: 'sesame_bacterial_leaf_spot',
        type: 'disease',
        name_en: 'Bacterial Leaf Spot (Pseudomonas sesami)',
        name_or: 'ରାଶି ଜୀବାଣୁ ଜନିତ ପତ୍ରଚିତା ରୋଗ',
        severity: 'Medium',
        symptoms_en: 'Dark brown to black angular water-soaked lesions on leaves and stem streaks.',
        symptoms_or: 'ପତ୍ରରେ କଳା କୋଣିଆ ଭିଜା ଭିଜା ଦାଗ ଓ କାଣ୍ଡରେ କଳା ଗାର।',
        treatments: [
          {
            product_en: 'Streptocycline + Copper Oxychloride 50% WP',
            product_or: 'ଷ୍ଟ୍ରେପ୍ଟୋସାଇକ୍ଲିନ୍ + କପର ଅକ୍ସିକ୍ଲୋରାଇଡ୍',
            active_ingredient: 'Streptomycin + Copper Oxychloride',
            dose_per_litre: '0.1 g Streptocycline + 2.0 g COC',
            dose_per_200L: '20 g Streptocycline + 400 g COC in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Soak seeds in hot water at 52°C for 10 min prior to sowing',
            organic_alternative_or: '୫୨ ଡିଗ୍ରୀ ଗରମ ପାଣିରେ ୧୦ ମିନିଟ ବିହନ ବୁଡ଼ାଇ ବିଶୋଧନ',
            phi_days: 20
          }
        ]
      },
      {
        id: 'sesame_macrophomina_stem_rot',
        type: 'disease',
        name_en: 'Charcoal Rot / Stem Rot (Macrophomina phaseolina)',
        name_or: 'ରାଶି ଅଙ୍ଗାରୁଆ କାଣ୍ଡପଚା ରୋଗ',
        severity: 'High',
        symptoms_en: 'Blackening of stem from soil level, internal pith disintegrates showing tiny black microsclerotia.',
        symptoms_or: 'କାଣ୍ଡ ମୂଳରୁ କଳା ପଡ଼ି କୋଇଲା ଭଳି ପାଉଁଶିଆ ହେବା, ଗଛ ଶୁଖି ଝଡ଼ିପଡ଼ିବା।',
        treatments: [
          {
            product_en: 'Carbendazim 50% WP soil drenching + Seed treatment',
            product_or: 'କାର୍ବେଣ୍ଡାଜିମ୍ ବିହନ ବିଶୋଧନ ଓ ମୂଳ ଭିଜାଇବା',
            active_ingredient: 'Carbendazim 50% WP',
            dose_per_litre: '2.0 g',
            dose_per_200L: '400 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Trichoderma viride @ 2.5 kg/acre in 100 kg farmyard manure',
            organic_alternative_or: 'ଟ୍ରାଇକୋଡର୍ମା ୨.୫ କେଜି ଖତ ସହ ମିଶାଇ ଜମିରେ ପ୍ରୟୋଗ',
            phi_days: 35
          }
        ]
      }
    ]
  },
  {
    id: 'sunflower',
    category: 'oilseeds',
    name_en: 'Sunflower (Surjamukhi)',
    name_or: 'ସୂର୍ଯ୍ୟମୁଖୀ (Sunflower)',
    name_hi: 'सूरजमुखी',
    scientific_name: 'Helianthus annuus',
    icon: '🌻',
    soil_type_en: 'Deep fertile loamy soil with neutral pH',
    soil_type_or: 'ଉର୍ବର ଦୋରସା ଓ ନିଗିଡ଼ା ମାଟି',
    duration_days: '85-100 days',
    water_requirement: 'Medium',
    water_requirement_or: 'ମଧ୍ୟମ ପାଣି',
    problems: [
      {
        id: 'sunflower_head_rot',
        type: 'disease',
        name_en: 'Head Rot / Rhizopus Rot (Rhizopus oryzae)',
        name_or: 'ସୂର୍ଯ୍ୟମୁଖୀ ଫୁଲମୁଣ୍ଡ ପଚା ରୋଗ',
        severity: 'High',
        symptoms_en: 'Soft watery brown rot on back of flower head, black mold growth, seeds turning rotten.',
        symptoms_or: 'ଫୁଲର ପଛପଟ ନରମ ହୋଇ ପଚିଯିବା ଏବଂ କଳା ଫିମ୍ପି ମାଡ଼ି ମଞ୍ଜି ପଚିଯିବା।',
        treatments: [
          {
            product_en: 'Mancozeb 75% WP spray on back of head',
            product_or: 'ମାଙ୍କୋଜେବ୍ ୭୫% WP ଫୁଲ ପଛପଟେ ସ୍ପ୍ରେ',
            active_ingredient: 'Mancozeb 75% WP',
            dose_per_litre: '2.5 g',
            dose_per_200L: '500 g in 200 L water targeted to head',
            type: 'chemical',
            organic_alternative_en: 'Avoid bird injury to heads + Trichoderma foliar spray 5 g/L',
            organic_alternative_or: 'ଚଢ଼େଇ କ୍ଷତିରୁ ରକ୍ଷା ଓ ଟ୍ରାଇକୋଡର୍ମା ସ୍ପ୍ରେ',
            phi_days: 25
          }
        ]
      },
      {
        id: 'sunflower_borer',
        type: 'pest',
        name_en: 'Capitulum Borer (Helicoverpa armigera)',
        name_or: 'ସୂର୍ଯ୍ୟମୁଖୀ ଫୁଲବିନ୍ଧା ପୋକ',
        severity: 'High',
        symptoms_en: 'Larvae feed directly on disc florets and bore into developing seed achenes.',
        symptoms_or: 'ଶୁକପୋକ ଫୁଲ ଭିତରେ ବସି ନୂଆ ମଞ୍ଜି କୋରି ଖାଇ ପୋଲା କରିଦିଏ।',
        treatments: [
          {
            product_en: 'Spinosad 45% SC or Chlorantraniliprole 18.5% SC',
            product_or: 'ସ୍ପିନୋସାଡ୍ ୪୫% SC କିମ୍ବା କୋରାଜେନ୍',
            active_ingredient: 'Spinosad 45% SC',
            dose_per_litre: '0.3 ml',
            dose_per_200L: '60 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Bt spray @ 2 g/L + HaNPV @ 250 LE/acre',
            organic_alternative_or: 'ବିଟି କିମ୍ବା HaNPV ସ୍ପ୍ରେ',
            phi_days: 14
          }
        ]
      },
      {
        id: 'sunflower_alternaria',
        type: 'disease',
        name_en: 'Alternaria Leaf & Head Blight (Alternaria helianthi)',
        name_or: 'ସୂର୍ଯ୍ୟମୁଖୀ ପତ୍ରପୋଡ଼ା ରୋଗ',
        severity: 'High',
        symptoms_en: 'Dark brown circular necrotic spots on leaves surrounded by chlorotic yellow zone.',
        symptoms_or: 'ପତ୍ର ଉପରେ କଳା-ବାଦାମୀ ଗୋଲ ଦାଗ ଓ ହଳଦିଆ ଘେର, ପତ୍ର ଜଳିଗଲା ଭଳି ଶୁଖିବା।',
        treatments: [
          {
            product_en: 'Propiconazole 25% EC (Tilt)',
            product_or: 'ପ୍ରୋପିକୋନାଜୋଲ୍ ୨୫% EC (ଟିଲ୍ଟ)',
            active_ingredient: 'Propiconazole 25% EC',
            dose_per_litre: '1.0 ml',
            dose_per_200L: '200 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Neem seed kernel extract 5% + Trichoderma spray',
            organic_alternative_or: 'ନିମ୍ବ ମଞ୍ଜି ଅର୍କ ୫% + ଟ୍ରାଇକୋଡର୍ମା ସ୍ପ୍ରେ',
            phi_days: 21
          }
        ]
      },
      {
        id: 'sunflower_boron_deficiency',
        type: 'nutrient',
        name_en: 'Boron Deficiency (Chaffy Seed / Empty Head)',
        name_or: 'ବୋରୋନ୍ ଅଭାବ (ପୋଲା ମଞ୍ଜି ଓ ଫୁଲ ଫାଟିବା)',
        severity: 'Medium',
        symptoms_en: 'Poor seed filling, hollow chaffy seeds in center of flower head, cracked stems.',
        symptoms_or: 'ଫୁଲର ମଝି ଭାଗରେ ମଞ୍ଜି ନହୋଇ ପୋଲା ହେବା, କାଣ୍ଡ ଫାଟି ରସ ବାହାରିବା।',
        treatments: [
          {
            product_en: 'Solubor / Borax 20% foliar spray at star bud stage',
            product_or: 'ସୋଲୁବୋର (ବୋରୋନ୍ ୨୦%) ସ୍ପ୍ରେ',
            active_ingredient: 'Di-Sodium Octaborate Tetrahydrate (20% B)',
            dose_per_litre: '1.5 g',
            dose_per_200L: '300 g in 200 L water at bud stage',
            type: 'chemical',
            organic_alternative_en: 'Basal application of Borax @ 4 kg/acre with organic compost',
            organic_alternative_or: 'ଜମି ପ୍ରସ୍ତୁତି ବେଳେ ବୋରାକ୍ସ ୪ କେଜି ଖତ ସହ ମିଶାଇ ପ୍ରୟୋଗ',
            phi_days: 0
          }
        ]
      }
    ]
  }
];

export const VEGETABLES: CropItem[] = [
  {
    id: 'tomato',
    category: 'vegetables',
    name_en: 'Tomato',
    name_or: 'ବିଲାତି ବାଇଗଣ (Tomato)',
    name_hi: 'टमाटर (Tomato)',
    scientific_name: 'Solanum lycopersicum',
    icon: '🍅',
    soil_type_en: 'Well-drained sandy loam with pH 6.0-7.0',
    soil_type_or: 'ନିଗିଡ଼ା ବାଲିଆ ଦୋରସା ମାଟି',
    duration_days: '90-110 days',
    water_requirement: 'Medium',
    water_requirement_or: 'ମଧ୍ୟମ ପାଣି',
    problems: [
      {
        id: 'tomato_early_blight',
        type: 'disease',
        name_en: 'Early Blight (Alternaria solani)',
        name_or: 'ଟମାଟୋ ଆଗୁଆ ପତ୍ରପୋଡ଼ା (ଟାର୍ଗେଟ୍ ଦାଗ)',
        severity: 'High',
        symptoms_en: 'Concentric brown rings like target board on lower leaves, defoliation.',
        symptoms_or: 'ତଳ ପତ୍ରରେ ଲକ୍ଷ୍ୟବିନ୍ଦୁ ଭଳି ବାଦାମୀ ଚକ୍ର ଦାଗ, ପତ୍ର ହଳଦିଆ ହୋଇ ଝଡ଼ିବା।',
        treatments: [
          {
            product_en: 'Mancozeb 75% WP or Azoxystrobin 23% SC',
            product_or: 'ମାଙ୍କୋଜେବ୍ ୭୫% WP କିମ୍ବା ଆଜୋକ୍ସିଷ୍ଟ୍ରୋବିନ୍',
            active_ingredient: 'Mancozeb 75% WP',
            dose_per_litre: '2.5 g Mancozeb OR 1.0 ml Azoxystrobin',
            dose_per_200L: '500 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Trichoderma viride 5 g/L + Cow urine 5% spray',
            organic_alternative_or: 'ଟ୍ରାଇକୋଡର୍ମା ୫ ଗ୍ରାମ/ଲିଟର ସହ ଗୋମୂତ୍ର ମିଶ୍ରଣ',
            phi_days: 5
          }
        ]
      },
      {
        id: 'tomato_leaf_curl',
        type: 'disease',
        name_en: 'Tomato Leaf Curl Virus (Whitefly Vector)',
        name_or: 'ଟମାଟୋ ପତ୍ର କୁଞ୍ଚନ ଭୂତାଣୁ ରୋଗ (ଧଳାମାଛି)',
        severity: 'High',
        symptoms_en: 'Upward curling and thickening of leaves, dwarfing, bushy growth, no fruit set.',
        symptoms_or: 'ପତ୍ର ଉପରକୁ କୁଞ୍ଚିତ ହୋଇ ଛୋଟ ମୋଟା ହେବା, ଗଛ ବୁଦୁବୁଦିକା ହୋଇ ଫଳ ନଧରିବା।',
        treatments: [
          {
            product_en: 'Diafenthiuron 50% WP (Pegasus) or Acetamiprid 20% SP',
            product_or: 'ପେଗାସସ୍ (ଡାୟାଫେନଥିଉରନ୍ ୫୦% WP)',
            active_ingredient: 'Diafenthiuron 50% WP',
            dose_per_litre: '1.2 g',
            dose_per_200L: '240 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Yellow sticky traps (20/acre) + Neem oil 1500 ppm @ 3 ml/L',
            organic_alternative_or: 'ହଳଦିଆ ଅଠା ଫାନ୍ଦ ୨୦ଟି/ଏକର + ନିମ୍ବ ତେଲ ୩ ମିଲି/ଲିଟର',
            phi_days: 7
          }
        ]
      },
      {
        id: 'tomato_fruit_borer',
        type: 'pest',
        name_en: 'Tomato Fruit Borer (Helicoverpa armigera)',
        name_or: 'ଟମାଟୋ ଫଳବିନ୍ଧା ପୋକ',
        severity: 'High',
        symptoms_en: 'Circular entry holes into green and ripening fruits, inner pulp eaten, watery rot.',
        symptoms_or: 'ଫଳରେ ଗୋଲାକାର କଣା କରି ଭିତର ଅଂଶ ଖାଇବା, ଟମାଟୋ ପଚି ନଷ୍ଟ ହେବା।',
        treatments: [
          {
            product_en: 'Chlorantraniliprole 18.5% SC (Coragen) OR Emamectin Benzoate 5% SG',
            product_or: 'କୋରାଜେନ୍ (କ୍ଲୋରାଣ୍ଟ୍ରାନିଲିପ୍ରୋଲ୍) କିମ୍ବା ଏମାମେକ୍ଟିନ୍',
            active_ingredient: 'Chlorantraniliprole 18.5% SC',
            dose_per_litre: '0.3 ml Coragen OR 0.4 g Emamectin',
            dose_per_200L: '60 ml Coragen in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Pheromone traps (Helilure) @ 8/acre + Bt spray @ 2 g/L',
            organic_alternative_or: 'ଫେରୋମୋନ୍ ଫାନ୍ଦ ୮ଟି/ଏକର + ବିଟି ସ୍ପ୍ରେ',
            phi_days: 3
          }
        ]
      },
      {
        id: 'tomato_bacterial_wilt',
        type: 'disease',
        name_en: 'Bacterial Wilt (Ralstonia solanacearum)',
        name_or: 'ଟମାଟୋ ଜୀବାଣୁ ଜନିତ ଝାଉଁଳା ରୋଗ (ପାଣି ପରୀକ୍ଷା)',
        severity: 'High',
        symptoms_en: 'Rapid wilting of entire plant while green, white bacterial streaming in water glass test.',
        symptoms_or: 'ଗଛ ସବୁଜ ଥାଇ ହଠାତ୍ ମଉଳି ଶୁଖିଯିବା, କାଣ୍ଡ କାଟି ଗ୍ଲାସ ପାଣିରେ ବୁଡ଼ାଇଲେ ଧଳା ସୂତା ଭଳି ବାହାରିବା।',
        treatments: [
          {
            product_en: 'Streptocycline 0.1 g/L + Copper Oxychloride 2 g/L root drenching',
            product_or: 'ଷ୍ଟ୍ରେପ୍ଟୋସାଇକ୍ଲିନ୍ + କପର ଅକ୍ସିକ୍ଲୋରାଇଡ୍ ମୂଳ ଭିଜାଇବା',
            active_ingredient: 'Streptomycin + Copper Oxychloride',
            dose_per_litre: '0.1 g Streptocycline + 2.0 g COC',
            dose_per_200L: '20 g Streptocycline + 400 g COC in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Soil drenching with Pseudomonas fluorescens @ 10 g/L',
            organic_alternative_or: 'ସୁଡୋମୋନାସ୍ ୧୦ ଗ୍ରାମ/ଲିଟର ପାଣିରେ ମୂଳରେ ଢାଳିବା',
            phi_days: 10
          }
        ]
      }
    ]
  },
  {
    id: 'brinjal',
    category: 'vegetables',
    name_en: 'Brinjal (Eggplant / Baigana)',
    name_or: 'ବାଇଗଣ (Brinjal / Eggplant)',
    name_hi: 'बैंगन (Brinjal)',
    scientific_name: 'Solanum melongena',
    icon: '🍆',
    soil_type_en: 'Rich silt loam with good drainage and organic matter',
    soil_type_or: 'ଉର୍ବର ଦୋରସା ଓ ଜୈବିକ ଖତ ଯୁକ୍ତ ମାଟି',
    duration_days: '120-140 days',
    water_requirement: 'Medium',
    water_requirement_or: 'ମଧ୍ୟମ ପାଣି',
    problems: [
      {
        id: 'brinjal_shoot_fruit_borer',
        type: 'pest',
        name_en: 'Shoot & Fruit Borer (Leucinodes orbonalis)',
        name_or: 'ବାଇଗଣ ଡଗ ଓ ଫଳ ବିନ୍ଧା ପୋକ',
        severity: 'High',
        symptoms_en: 'Wilting tender shoots droop down, bored fruits with holes plugged with dark frass.',
        symptoms_or: 'କଅଁଳ ଡଗ ମଉଳି ଝାଉଁଳିବା, ଫଳରେ କଣା ହୋଇ କଳା ମଳ ବାହାରିବା।',
        treatments: [
          {
            product_en: 'Emamectin Benzoate 5% SG or Chlorantraniliprole 18.5% SC',
            product_or: 'ଏମାମେକ୍ଟିନ୍ ବେଞ୍ଜୋଏଟ୍ ୫% SG କିମ୍ବା କୋରାଜେନ୍',
            active_ingredient: 'Emamectin Benzoate 5% SG',
            dose_per_litre: '0.4 g Emamectin OR 0.3 ml Coragen',
            dose_per_200L: '80 g Emamectin in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Lucinlure pheromone traps @ 12/acre + clip and destroy wilted shoots weekly',
            organic_alternative_or: 'ଲୁସିନଲିଉର ଫେରୋମୋନ୍ ଫାନ୍ଦ ୧୨ଟି/ଏକର + ମଲା ଡଗ କାଟି ପୋଡ଼ନ୍ତୁ',
            phi_days: 3
          }
        ]
      },
      {
        id: 'brinjal_little_leaf',
        type: 'disease',
        name_en: 'Little Leaf of Brinjal (Phytoplasma - Leafhopper vector)',
        name_or: 'ବାଇଗଣ ଛୋଟ ପତ୍ର ରୋଗ (ଲିଟିଲ୍ ଲିଫ୍)',
        severity: 'High',
        symptoms_en: 'Leaves severely reduced in size forming tiny rosette clusters, bush without fruit setting.',
        symptoms_or: 'ପତ୍ର ଅତି ଛୋଟ ହୋଇ ଗଛ ଘଞ୍ଚ ବୁଦା ଭଳି ହେବା, ଫୁଲ ବା ଫଳ ଆଦୌ ନହେବା।',
        treatments: [
          {
            product_en: 'Imidacloprid 17.8% SL or Thiamethoxam 25% WG',
            product_or: 'ଇମିଡାକ୍ଲୋପ୍ରିଡ୍ କିମ୍ବା ଥିଆମେଥୋକ୍ସାମ୍ (ଡେଇଁପୋକ ନିୟନ୍ତ୍ରଣ)',
            active_ingredient: 'Imidacloprid 17.8% SL',
            dose_per_litre: '0.4 ml',
            dose_per_200L: '80 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Uproot and bury infected plants immediately + Neem oil 4 ml/L',
            organic_alternative_or: 'ରୋଗିଣା ଗଛ ଉପାଡ଼ି ପୋତି ଦିଅନ୍ତୁ + ନିମ୍ବ ତେଲ ସ୍ପ୍ରେ',
            phi_days: 7
          }
        ]
      },
      {
        id: 'brinjal_phomopsis_blight',
        type: 'disease',
        name_en: 'Phomopsis Blight & Fruit Rot (Phomopsis vexans)',
        name_or: 'ବାଇଗଣ ଫୋମୋପସିସ୍ ପତ୍ରପୋଡ଼ା ଓ ଫଳପଚା',
        severity: 'High',
        symptoms_en: 'Brown circular spots on leaves, soft watery fruit rot turning into mummified black fruits.',
        symptoms_or: 'ପତ୍ରରେ ଗୋଲାକାର ବାଦାମୀ ଦାଗ, ବାଇଗଣ ପଚି କଳା ପଡ଼ି ଶୁଖି ଝୁଲି ରହିବା।',
        treatments: [
          {
            product_en: 'Copper Oxychloride 50% WP or Carbendazim 50% WP',
            product_or: 'କପର ଅକ୍ସିକ୍ଲୋରାଇଡ୍ ୫୦% WP କିମ୍ବା ବାଭିଷ୍ଟିନ୍',
            active_ingredient: 'Copper Oxychloride 50% WP',
            dose_per_litre: '2.5 g COC OR 1.0 g Carbendazim',
            dose_per_200L: '500 g COC in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Trichoderma viride 5 g/L foliar spray + seed dip in hot water 50°C 15 min',
            organic_alternative_or: 'ଟ୍ରାଇକୋଡର୍ମା ସ୍ପ୍ରେ ଏବଂ ଗରମ ପାଣିରେ ବିହନ ବିଶୋଧନ',
            phi_days: 7
          }
        ]
      },
      {
        id: 'brinjal_root_knot_nematode',
        type: 'nematode',
        name_en: 'Root Knot Nematode (Meloidogyne incognita)',
        name_or: 'ବାଇଗଣ ଗଣ୍ଠି ଚେର କୃମି ରୋଗ (ନେମାଟୋଡ୍)',
        severity: 'High',
        symptoms_en: 'Galls or knots on root system, stunted yellowing plants wilting in midday heat.',
        symptoms_or: 'ଚେରରେ ଛୋଟ ବଡ଼ ଗଣ୍ଠି ହୋଇଯିବା, ମଧ୍ୟାହ୍ନ ଖରାରେ ଗଛ ନଇଁ ପଡ଼ିବା ଓ ଉପୁଜିବା।',
        treatments: [
          {
            product_en: 'Fluensulfone 2% GR or Cartap Hydrochloride 4% G',
            product_or: 'ଫ୍ଲୁଏନସଲଫୋନ୍ କିମ୍ବା କାର୍ଟାପ୍ ହାଇଡ୍ରୋକ୍ଲୋରାଇଡ୍ ଗ୍ରାନୁଲ୍',
            active_ingredient: 'Fluensulfone 2% GR',
            dose_per_litre: '5 kg granules per acre applied into root zone soil',
            dose_per_200L: 'Soil application at transplanting',
            type: 'chemical',
            organic_alternative_en: 'Paecilomyces lilacinus @ 2 kg/acre + Neem cake 200 kg/acre',
            organic_alternative_or: 'ପେସିଲୋମାଇସିସ୍ କୃମିନାଶକ କବକ + ନିମ୍ବ ପିଡ଼ିଆ ମାଟିରେ ପ୍ରୟୋଗ',
            phi_days: 30
          }
        ]
      }
    ]
  },
  {
    id: 'chilli',
    category: 'vegetables',
    name_en: 'Chilli (Mirchi)',
    name_or: 'ଲଙ୍କା / ମରିଚ (Chilli)',
    name_hi: 'मिर्च (Chilli)',
    scientific_name: 'Capsicum annuum',
    icon: '🌶️',
    soil_type_en: 'Well-drained black or red clay loam rich in organic matter',
    soil_type_or: 'ନିଗିଡ଼ା କଳା ଓ ଲାଲ୍ ଦୋରସା ମାଟି',
    duration_days: '120-150 days',
    water_requirement: 'Medium',
    water_requirement_or: 'ମଧ୍ୟମ ପାଣି',
    problems: [
      {
        id: 'chilli_thrips',
        type: 'pest',
        name_en: 'Chilli Thrips (Scirtothrips dorsalis)',
        name_or: 'ଲଙ୍କା ଚିପୁଡ଼ା ପୋକ (ପତ୍ର ଉପରକୁ ଡଙ୍ଗା ଭଳି କୁଞ୍ଚିତ)',
        severity: 'High',
        symptoms_en: 'Upward cup-shaped curling of leaves, brownish bronze underside, brittle crinkled foliage.',
        symptoms_or: 'ପତ୍ର ଉପର ମୁହାଁ ଡଙ୍ଗା ଭଳି କୁଞ୍ଚିତ ହେବା, ପତ୍ର ତଳପଟ ତମ୍ବାଳିଆ ଦିଶିବା।',
        treatments: [
          {
            product_en: 'Fipronil 5% SC (Regent) or Spinetoram 11.7% SC (Delegate)',
            product_or: 'ଫିପ୍ରୋନିଲ୍ ୫% SC (ରେଜେଣ୍ଟ) କିମ୍ବା ଡେଲିଗେଟ୍',
            active_ingredient: 'Fipronil 5% SC',
            dose_per_litre: '1.5 ml Fipronil OR 0.5 ml Spinetoram',
            dose_per_200L: '300 ml Fipronil in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Blue sticky traps (15/acre) + Neem oil 3000 ppm @ 3 ml/L',
            organic_alternative_or: 'ନୀଳ ଅଠା ଫାନ୍ଦ ୧୫ଟି/ଏକର + ନିମ୍ବ ତେଲ ୩ ମିଲି/ଲିଟର',
            phi_days: 7
          }
        ]
      },
      {
        id: 'chilli_yellow_mite',
        type: 'pest',
        name_en: 'Yellow Mite (Polyphagotarsonemus latus)',
        name_or: 'ଲଙ୍କା ହଳଦିଆ ମାଇଟ୍ (ପତ୍ର ତଳକୁ ଓଲଟା ଡଙ୍ଗା ଭଳି କୁଞ୍ଚିତ)',
        severity: 'High',
        symptoms_en: 'Downward curling and elongation of leaves (inverted boat shape), elongated petioles.',
        symptoms_or: 'ପତ୍ର ତଳ ମୁହାଁ ଓଲଟା ଡଙ୍ଗା ଭଳି ବଙ୍କା ହୋଇ ଲମ୍ବା ଡେମ୍ଫ ହେବା, ଗଛ ନିସ୍ତେଜ ହେବା।',
        treatments: [
          {
            product_en: 'Spiromesifen 22.9% SC (Oberon) or Diafenthiuron 50% WP',
            product_or: 'ଓବେରନ୍ (ସ୍ପାଇରୋମେସିଫେନ୍ ୨୨.୯% SC)',
            active_ingredient: 'Spiromesifen 22.9% SC',
            dose_per_litre: '1.0 ml',
            dose_per_200L: '200 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Wettable sulphur 80% WP @ 3 g/L',
            organic_alternative_or: 'ସଲଫର ୮୦% ୩ ଗ୍ରାମ/ଲିଟର ସ୍ପ୍ରେ',
            phi_days: 5
          }
        ]
      },
      {
        id: 'chilli_anthracnose_dieback',
        type: 'disease',
        name_en: 'Anthracnose & Dieback (Colletotrichum capsici)',
        name_or: 'ଲଙ୍କା ଡାଳମୁହଁ ଶୁଖିବା (ଡାଇବ୍ୟାକ୍) ଓ ଫଳପଚା',
        severity: 'High',
        symptoms_en: 'Twigs dry from tip downwards, sunken circular necrotic spots on ripe red fruits.',
        symptoms_or: 'ଡାଳ ଉପରୁ ତଳକୁ ଶୁଖିବା, ପାଚିଲା ଲଙ୍କାରେ ଗାଢ଼ କଳା ଖାଲୁଆ ଦାଗ ହୋଇ ପଚିବା।',
        treatments: [
          {
            product_en: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top)',
            product_or: 'ଆମିଷ୍ଟାର ଟପ୍ (ଆଜୋକ୍ସିଷ୍ଟ୍ରୋବିନ୍ + ଡିଫେନୋକୋନାଜୋଲ)',
            active_ingredient: 'Azoxystrobin + Difenoconazole',
            dose_per_litre: '1.0 ml',
            dose_per_200L: '200 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Copper Hydroxide 77% WP @ 2 g/L foliar spray',
            organic_alternative_or: 'କପର ହାଇଡ୍ରୋକ୍ସାଇଡ୍ ୨ ଗ୍ରାମ/ଲିଟର ସ୍ପ୍ରେ',
            phi_days: 5
          }
        ]
      },
      {
        id: 'chilli_damping_off',
        type: 'disease',
        name_en: 'Damping Off in Nursery (Pythium aphanidermatum)',
        name_or: 'ଲଙ୍କା ତଳିଘରା ଡ୍ୟାମ୍ପିଙ୍ଗ୍ ଅଫ୍ (ଚାରାପଚା ରୋଗ)',
        severity: 'High',
        symptoms_en: 'Water-soaked soft rotting of collar at nursery soil surface causing young seedlings to topple over.',
        symptoms_or: 'ତଳିଘରାରେ ଚାରା ଗଛର ମୂଳ ପଚିଯାଇ ଢଳି ପଡ଼ିବା ଓ ଦଳଦଳ ଚାରା ମରିବା।',
        treatments: [
          {
            product_en: 'Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ) drenching',
            product_or: 'ରିଡୋମିଲ୍ ଏମଜେଡ୍ ତଳିଘରା ମାଟି ଭିଜାଇବା',
            active_ingredient: 'Metalaxyl + Mancozeb',
            dose_per_litre: '2.5 g',
            dose_per_200L: '500 g in 200 L water drenching',
            type: 'chemical',
            organic_alternative_en: 'Seed treatment with Trichoderma @ 10 g/kg + solarize nursery bed',
            organic_alternative_or: 'ଟ୍ରାଇକୋଡର୍ମା ବିହନ ବିଶୋଧନ ଓ ପଲିଥିନ ଘୋଡ଼ାଇ ଖରାରେ ତଳିଘରା ତତାଇବା',
            phi_days: 15
          }
        ]
      }
    ]
  },
  {
    id: 'okra',
    category: 'vegetables',
    name_en: 'Okra (Bhindi / Ladyfinger)',
    name_or: 'ଭେଣ୍ଡି (Okra / Bhindi)',
    name_hi: 'भिंडी (Okra)',
    scientific_name: 'Abelmoschus esculentus',
    icon: '🌱',
    soil_type_en: 'Sandy loam to clay loam with good drainage and neutral pH',
    soil_type_or: 'ନିଗିଡ଼ା ଦୋରସା ଓ ପଟୁ ମାଟି',
    duration_days: '65-80 days',
    water_requirement: 'Medium',
    water_requirement_or: 'ମଧ୍ୟମ ପାଣି',
    problems: [
      {
        id: 'okra_yvmv',
        type: 'disease',
        name_en: 'Yellow Vein Mosaic Virus - YVMV (Whitefly Vector)',
        name_or: 'ଭେଣ୍ଡି ହଳଦିଆ ଶିରା ମୋଜାଇକ୍ ରୋଗ',
        severity: 'High',
        symptoms_en: 'Intricate network of yellow veins on deep green leaf blade, stunted chlorotic fibrous small fruits.',
        symptoms_or: 'ପତ୍ରର ଶିରାଗୁଡ଼ିକ ହଳଦିଆ ହୋଇ ଜାଲ ଭଳି ଦିଶିବା, ଭେଣ୍ଡି ଟାଣ ଓ ଛୋଟ ହୋଇଯିବା।',
        treatments: [
          {
            product_en: 'Acetamiprid 20% SP or Thiamethoxam 25% WG',
            product_or: 'ଏସିଟାମିପ୍ରିଡ୍ ୨୦% SP କିମ୍ବା ଥିଆମେଥୋକ୍ସାମ୍',
            active_ingredient: 'Acetamiprid 20% SP',
            dose_per_litre: '0.4 g',
            dose_per_200L: '80 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Use resistant hybrid seeds (Arka Anamika) + Yellow sticky traps 15/acre',
            organic_alternative_or: 'ରୋଗ ପ୍ରତିରୋଧକ କିସମ ଚୟନ + ହଳଦିଆ ଫାନ୍ଦ',
            phi_days: 3
          }
        ]
      },
      {
        id: 'okra_shoot_fruit_borer',
        type: 'pest',
        name_en: 'Shoot & Fruit Borer (Earias vittella)',
        name_or: 'ଭେଣ୍ଡି ଡଗ ଓ ଫଳ ବିନ୍ଧା ପୋକ (ଇରିଆସ୍)',
        severity: 'High',
        symptoms_en: 'Wilted shoots, deformed bent crooked fruits with caterpillars inside.',
        symptoms_or: 'ଡଗ ଶୁଖି ନଇଁ ପଡ଼ିବା, ଭେଣ୍ଡି ବଙ୍କା ଟଙ୍କା ହୋଇ ଭିତରେ ପୋକ ରହିବା।',
        treatments: [
          {
            product_en: 'Emamectin Benzoate 5% SG or Spinosad 45% SC',
            product_or: 'ଏମାମେକ୍ଟିନ୍ ବେଞ୍ଜୋଏଟ୍ ୫% SG କିମ୍ବା ସ୍ପିନୋସାଡ୍',
            active_ingredient: 'Emamectin Benzoate 5% SG',
            dose_per_litre: '0.4 g Emamectin OR 0.3 ml Spinosad',
            dose_per_200L: '80 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Neem seed kernel extract 5% + Hand clip affected tender shoots weekly',
            organic_alternative_or: 'ନିମ୍ବ ମଞ୍ଜି ଅର୍କ ୫% + ମଲା ଡଗ କାଟି ନଷ୍ଟ କରିବା',
            phi_days: 3
          }
        ]
      },
      {
        id: 'okra_powdery_mildew',
        type: 'disease',
        name_en: 'Powdery Mildew (Erysiphe cichoracearum)',
        name_or: 'ଭେଣ୍ଡି ଧଳା ପାଉଁଶିଆ ରୋଗ',
        severity: 'Medium',
        symptoms_en: 'White powdery fungal growth covering both surfaces of leaves, leaves turn brown and dry.',
        symptoms_or: 'ପତ୍ରର ଉପର ଓ ତଳ ଭାଗରେ ଧଳା ପାଉଡର ଭଳି କବକ ମାଡ଼ିବା, ପତ୍ର ଶୁଖି ଝଡ଼ିବା।',
        treatments: [
          {
            product_en: 'Wettable Sulphur 80% WP or Dinocap 48% EC',
            product_or: 'ସଲଫେକ୍ସ (ସଲଫର ୮୦% WP)',
            active_ingredient: 'Wettable Sulphur 80% WP',
            dose_per_litre: '2.5 g',
            dose_per_200L: '500 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Foliar spray of 10% unboiled cow milk solution',
            organic_alternative_or: '୧୦% କଞ୍ଚା କ୍ଷୀର ପାଣି ସ୍ପ୍ରେ କରନ୍ତୁ',
            phi_days: 5
          }
        ]
      },
      {
        id: 'okra_jassid',
        type: 'pest',
        name_en: 'Cotton Jassid / Leafhopper (Amrasca biguttula biguttula)',
        name_or: 'ଭେଣ୍ଡି ଡେଇଁପୋକ (ଜାସିଡ୍ / ପତ୍ରଡିଆଁ)',
        severity: 'Medium',
        symptoms_en: 'Leaves curl downwards at edges, yellow margins turning brown burnt hopperburn.',
        symptoms_or: 'ପତ୍ର ତଳକୁ ମୋଡ଼ି ହେବା, ପତ୍ରର ଧାର ହଳଦିଆରୁ ପୋଡ଼ିଗଲା ଭଳି ବାଦାମୀ ହେବା (ହପରବର୍ଣ୍ଣ)।',
        treatments: [
          {
            product_en: 'Imidacloprid 17.8% SL',
            product_or: 'ଇମିଡାକ୍ଲୋପ୍ରିଡ୍ ୧୭.୮% SL',
            active_ingredient: 'Imidacloprid 17.8% SL',
            dose_per_litre: '0.3 ml',
            dose_per_200L: '60 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Neem oil 1500 ppm @ 3 ml/L + 1 g detergent powder',
            organic_alternative_or: 'ନିମ୍ବ ତେଲ ୩ ମିଲି/ଲିଟର ସହ ସାବୁନ ପାଣି',
            phi_days: 5
          }
        ]
      }
    ]
  }
];
