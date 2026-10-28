import { CropItem } from './types';

export const MEDICINAL_PLANTS: CropItem[] = [
  {
    id: 'tulsi',
    category: 'medicinal',
    name_en: 'Holy Basil (Tulsi)',
    name_or: 'ତୁଳସୀ (Tulsi)',
    name_hi: 'तुलसी (Holy Basil)',
    scientific_name: 'Ocimum sanctum / Ocimum tenuiflorum',
    icon: '🌿',
    soil_type_en: 'Fertile loamy soil with rich compost and good drainage',
    soil_type_or: 'ଉର୍ବର ଦୋରସା ଓ ଜୈବିକ ଖତ ଯୁକ୍ତ ମାଟି',
    duration_days: 'Perennial medicinal shrub',
    water_requirement: 'Medium',
    water_requirement_or: 'ମଧ୍ୟମ ପାଣି',
    problems: [
      {
        id: 'tulsi_leaf_spot',
        type: 'disease',
        name_en: 'Tulsi Cercospora Leaf Spot (Cercospora ocimicola)',
        name_or: 'ତୁଳସୀ ପତ୍ରଚିତା ରୋଗ',
        severity: 'Medium',
        symptoms_en: 'Dark brown to black angular necrotic spots on leaves leading to defoliation.',
        symptoms_or: 'ତୁଳସୀ ପତ୍ରରେ ଛୋଟ ଛୋଟ କଳା-ବାଦାମୀ ଦାଗ ହୋଇ ପତ୍ର ହଳଦିଆ ପଡ଼ି ଝଡ଼ିବା।',
        treatments: [
          {
            product_en: 'Copper Oxychloride 50% WP (Blitox) OR Organic Bio-fungicide',
            product_or: 'କପର ଅକ୍ସିକ୍ଲୋରାଇଡ୍ କିମ୍ବା ଜୈବିକ କବକନାଶକ',
            active_ingredient: 'Copper Oxychloride 50% WP',
            dose_per_litre: '2.0 g',
            dose_per_200L: '400 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Pseudomonas fluorescens 5 g/L + Cow urine 5% spray (Safe for medicine)',
            organic_alternative_or: 'ସୁଡୋମୋନାସ୍ ୫ ଗ୍ରାମ/ଲିଟର ସହ ୫% ଗୋମୂତ୍ର ସ୍ପ୍ରେ (ଔଷଧୀୟ ପତ୍ର ପାଇଁ ସୁରକ୍ଷିତ)',
            phi_days: 7
          }
        ]
      },
      {
        id: 'tulsi_powdery_mildew',
        type: 'disease',
        name_en: 'Powdery Mildew of Basil (Oidium spp.)',
        name_or: 'ତୁଳସୀ ଧଳା ପାଉଁଶିଆ ରୋଗ',
        severity: 'Medium',
        symptoms_en: 'Floury white powdery fungal growth on leaves and inflorescence manjari.',
        symptoms_or: 'ତୁଳସୀ ପତ୍ର ଓ ମଞ୍ଜରୀ ଉପରେ ଧଳା ପାଉଡର ଭଳି କବକ ମାଡ଼ିବା।',
        treatments: [
          {
            product_en: 'Wettable Sulphur 80% WP or Potassium Bicarbonate',
            product_or: 'ସଲଫର ୮୦% WP କିମ୍ବା ପୋଟାସିୟମ୍ ବାଇକାର୍ବୋନେଟ୍',
            active_ingredient: 'Wettable Sulphur 80% WP',
            dose_per_litre: '2.0 g',
            dose_per_200L: '400 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: '10% raw cow milk spray OR Baking soda 4 g/L + neem oil',
            organic_alternative_or: '୧୦% କଞ୍ଚା କ୍ଷୀର ପାଣି କିମ୍ବା ଖାଇବା ସୋଡ଼ା ସ୍ପ୍ରେ',
            phi_days: 3
          }
        ]
      },
      {
        id: 'tulsi_lace_wing_bug',
        type: 'pest',
        name_en: 'Basil Lace Bug (Cochlochila bullita)',
        name_or: 'ତୁଳସୀ ଲେସ୍ ୱିଙ୍ଗ୍ ପୋକ (ଜାଲି ଡେଣା ପୋକ)',
        severity: 'High',
        symptoms_en: 'Leaves turn bleached, yellow speckled with black tar-like varnish fecal spots underneath.',
        symptoms_or: 'ପତ୍ରର ତଳେ କଳା ଅଠାଳିଆ ମଳ ବିନ୍ଦୁ ଦାଗ, ପତ୍ର ଫିକା ହଳଦିଆ ହୋଇ ଶୁଖିବା।',
        treatments: [
          {
            product_en: 'Azadirachtin 10000 ppm (Neem) OR Imidacloprid 17.8% SL',
            product_or: 'ଜୈବିକ ନିମ୍ବ ଅର୍କ ୧୦୦୦୦ ppm କିମ୍ବା ଇମିଡାକ୍ଲୋପ୍ରିଡ୍',
            active_ingredient: 'Azadirachtin 1% EC',
            dose_per_litre: '2.0 ml Neem extract OR 0.3 ml Imidacloprid',
            dose_per_200L: '400 ml in 200 L water',
            type: 'organic',
            organic_alternative_en: 'Pure Cold Pressed Neem Oil 3000 ppm @ 4 ml/L with liquid soap',
            organic_alternative_or: 'ନିମ୍ବ ତେଲ ୪ ମିଲି/ଲିଟର ସହ ସାବୁନ ପାଣି ସ୍ପ୍ରେ',
            phi_days: 3
          }
        ]
      },
      {
        id: 'tulsi_root_rot',
        type: 'disease',
        name_en: 'Root Rot / Damping Off (Rhizoctonia solani)',
        name_or: 'ତୁଳସୀ ଚେରପଚା ରୋଗ (ଢଳିବା)',
        severity: 'High',
        symptoms_en: 'Dark brown constricted lesions at stem base, plant suddenly wilts with shredded rotten roots.',
        symptoms_or: 'କାଣ୍ଡ ମୂଳରେ କଳା ଦାଗ ହୋଇ ଗଛ ଢଳି ପଡ଼ିବା, ଚେର ନଷ୍ଟ ହୋଇଯିବା।',
        treatments: [
          {
            product_en: 'Carbendazim 50% WP or Trichoderma viride drenching',
            product_or: 'ଟ୍ରାଇକୋଡର୍ମା କିମ୍ବା କାର୍ବେଣ୍ଡାଜିମ୍ ମାଟି ଭିଜାଇବା',
            active_ingredient: 'Trichoderma viride 1% WP / Carbendazim',
            dose_per_litre: '5.0 g Trichoderma OR 1.5 g Carbendazim',
            dose_per_200L: 'Soil drenching around plant basin',
            type: 'bio',
            organic_alternative_en: 'Trichoderma harzianum @ 10 g/L soil drench + reduce watering',
            organic_alternative_or: 'ଟ୍ରାଇକୋଡର୍ମା ୧୦ ଗ୍ରାମ/ଲିଟର ପାଣିରେ ମୂଳରେ ଢାଳନ୍ତୁ',
            phi_days: 7
          }
        ]
      }
    ]
  },
  {
    id: 'aloe_vera',
    category: 'medicinal',
    name_en: 'Aloe Vera (Ghirita Kumari)',
    name_or: 'ଘିକୁଆଁରୀ (Aloe Vera / Ghirita Kumari)',
    name_hi: 'एलोवेरा (घृतकुमारी)',
    scientific_name: 'Aloe barbadensis miller',
    icon: '🪴',
    soil_type_en: 'Sandy, porous, well-drained gravelly soils with pH 7.0-8.5',
    soil_type_or: 'ବାଲିଆ ଓ ପଥୁରିଆ ନିଗିଡ଼ା ମାଟି (ଅତି ପାଣିରେ ପଚିଯାଏ)',
    duration_days: 'Perennial succulent',
    water_requirement: 'Low',
    water_requirement_or: 'ଖୁବ୍ କମ୍ ପାଣି',
    problems: [
      {
        id: 'aloe_soft_rot',
        type: 'disease',
        name_en: 'Bacterial Soft Rot (Pectobacterium chrysanthemi)',
        name_or: 'ଘିକୁଆଁରୀ ଜୀବାଣୁ ଜନିତ ନରମ ପଚା ରୋଗ',
        severity: 'High',
        symptoms_en: 'Water-soaked soft mushy rot starting at leaf bases with pungent foul odor, leaf collapses into gel mush.',
        symptoms_or: 'ପତ୍ର ମୂଳ ନରମ ହୋଇ ପଚି ଦୁର୍ଗନ୍ଧ ହେବା, ପତ୍ର ତରଳ ଜେଲ୍ ଭଳି ଗଳି ପଡ଼ିବା।',
        treatments: [
          {
            product_en: 'Streptocycline 0.1 g/L + Copper Oxychloride 2 g/L',
            product_or: 'ଷ୍ଟ୍ରେପ୍ଟୋସାଇକ୍ଲିନ୍ + କପର ଅକ୍ସିକ୍ଲୋରାଇଡ୍ ସ୍ପ୍ରେ',
            active_ingredient: 'Streptomycin + Copper Oxychloride',
            dose_per_litre: '0.1 g Streptocycline + 2.0 g COC',
            dose_per_200L: '20 g Streptocycline + 400 g COC in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Cut out rotten leaves, sprinkle Wood Ash and Cinnamon powder, withhold water',
            organic_alternative_or: 'ପଚା ପତ୍ର କାଟି କାଠ ପାଉଁଶ ଓ ଡାଲଚିନି ଗୁଣ୍ଡ ଲଗାନ୍ତୁ',
            phi_days: 7
          }
        ]
      },
      {
        id: 'aloe_anthracnose',
        type: 'disease',
        name_en: 'Aloe Leaf Spot & Anthracnose (Colletotrichum gloeosporioides)',
        name_or: 'ଘିକୁଆଁରୀ ପତ୍ର କଳାଜାମୁଆ ରୋଗ',
        severity: 'Medium',
        symptoms_en: 'Circular sunken dark brown to black spots with orange-red fungal margins on thick fleshy leaves.',
        symptoms_or: 'ମୋଟା ପତ୍ର ଉପରେ କଳା ଗୋଲାକାର ଖାଲୁଆ ଦାଗ ଓ ନାଲିଆ ଘେର।',
        treatments: [
          {
            product_en: 'Mancozeb 75% WP or Azoxystrobin 23% SC',
            product_or: 'ମାଙ୍କୋଜେବ୍ ୭୫% WP କିମ୍ବା ଆଜୋକ୍ସିଷ୍ଟ୍ରୋବିନ୍',
            active_ingredient: 'Mancozeb 75% WP',
            dose_per_litre: '2.5 g Mancozeb OR 1.0 ml Azoxystrobin',
            dose_per_200L: '500 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Pseudomonas fluorescens 5 g/L foliar spray',
            organic_alternative_or: 'ସୁଡୋମୋନାସ୍ ୫ ଗ୍ରାମ/ଲିଟର ସ୍ପ୍ରେ',
            phi_days: 7
          }
        ]
      },
      {
        id: 'aloe_scale_insect',
        type: 'pest',
        name_en: 'Aloe White Scale (Duplachionaspis divergens)',
        name_or: 'ଘିକୁଆଁରୀ ଧଳା କାତିପୋକ',
        severity: 'Medium',
        symptoms_en: 'Dense white crusts of tiny scales covering the fleshy green leaves sucking sap, yellowing.',
        symptoms_or: 'ପତ୍ର ଉପରେ ଚୁନ ଭଳି ଧଳା କାତି ପୋକ ଜମି ରସ ଶୋଷିବା।',
        treatments: [
          {
            product_en: 'Malathion 50% EC or Buprofezin 25% SC',
            product_or: 'ମାଲାଥିଅନ୍ କିମ୍ବା ବୁପ୍ରୋଫେଜିନ୍',
            active_ingredient: 'Malathion 50% EC',
            dose_per_litre: '1.5 ml',
            dose_per_200L: '300 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Scrub off with soft brush dipped in soap-oil solution (5 ml soap + 5 ml oil/L)',
            organic_alternative_or: 'ବ୍ରସରେ ସାବୁନ-ତେଲ ପାଣି ଲଗାଇ ପୋକ ଘଷି ସଫା କରନ୍ତୁ',
            phi_days: 7
          }
        ]
      },
      {
        id: 'aloe_sunburn',
        type: 'nutrient',
        name_en: 'Sunburn & Red/Brown Stress (Anthocyanin buildup)',
        name_or: 'ଅତ୍ୟଧିକ ଖରାରୁ ଲାଲ୍-ବାଦାମୀ ପଡ଼ିବା',
        severity: 'Low',
        symptoms_en: 'Leaves turn copper-red or brown with thinned wrinkled tips due to sudden harsh sun and drought.',
        symptoms_or: 'ଟାଣ ଖରାରେ ପତ୍ର ତମ୍ବାଳିଆ ଲାଲ୍ କିମ୍ବା ବାଦାମୀ ହୋଇ ଅଗ ଶୁଖିଯିବା।',
        treatments: [
          {
            product_en: 'Provide 30-50% agro-shade net cover + Deep basal irrigation',
            product_or: 'ଛାଇ ଜାଲି (Shade Net) ବ୍ୟବହାର ଓ ସକାଳୁ ପାଣି ଦେବା',
            active_ingredient: 'Cultural shade management',
            dose_per_litre: 'Cultural management',
            dose_per_200L: 'Cultural management',
            type: 'cultural',
            organic_alternative_en: 'Mulch plant base with dry leaves and spray seaweed extract 2 ml/L',
            organic_alternative_or: 'ମୂଳରେ ଶୁଖିଲା ପତ୍ର ଘୋଡ଼ାଇ ସିୱିଡ୍ ଏକ୍ସଟ୍ରାକ୍ଟ ସ୍ପ୍ରେ କରନ୍ତୁ',
            phi_days: 0
          }
        ]
      }
    ]
  }
];

export const FODDER_CROPS: CropItem[] = [
  {
    id: 'napier_grass',
    category: 'fodder',
    name_en: 'Hybrid Napier Grass (Super Napier / Ghasa)',
    name_or: 'ସୁପର ନେପିୟର ଘାସ (Hybrid Napier)',
    name_hi: 'नेपियर घास (हाइब्रिड नेपियर)',
    scientific_name: 'Pennisetum purpureum × P. glaucum',
    icon: '🌾',
    soil_type_en: 'Deep loamy to clayey soil with good moisture and organic nutrition',
    soil_type_or: 'ଉର୍ବର ଦୋରସା ଓ ପଟୁ ମାଟି (ପ୍ରଚୁର ଗୋବର ଖତ ଆବଶ୍ୟକ)',
    duration_days: 'Perennial fodder (Cuts every 45-50 days)',
    water_requirement: 'High',
    water_requirement_or: 'ଅଧିକ ପାଣି',
    problems: [
      {
        id: 'napier_helninthosporium_blight',
        type: 'disease',
        name_en: 'Helminthosporium Leaf Blight (Bipolaris sacchari)',
        name_or: 'ନେପିୟର ପତ୍ରପୋଡ଼ା ରୋଗ',
        severity: 'Medium',
        symptoms_en: 'Oval reddish-brown spots with yellow borders across leaf blades reducing fodder palatability.',
        symptoms_or: 'ପତ୍ରରେ ଲାଲ୍-ବାଦାମୀ ଦାଗ ହୋଇ ପତ୍ର ଶୁଖିବା, ଗାଈ ଗୋରୁ ଏହି ଘାସ ଖାଇବାକୁ ପସନ୍ଦ କରନ୍ତି ନାହିଁ।',
        treatments: [
          {
            product_en: 'Mancozeb 75% WP spray immediately after harvesting a cut',
            product_or: 'ଘାସ କାଟିବା ପରେ ମାଙ୍କୋଜେବ୍ ୭୫% WP ସ୍ପ୍ରେ',
            active_ingredient: 'Mancozeb 75% WP',
            dose_per_litre: '2.5 g',
            dose_per_200L: '500 g in 200 L water applied post-cutting',
            type: 'chemical',
            organic_alternative_en: 'Pseudomonas fluorescens 5 g/L spray after stubble harvest',
            organic_alternative_or: 'ଘାସ କାଟିବା ପରେ ସୁଡୋମୋନାସ୍ ୫ ଗ୍ରାମ/ଲିଟର ସ୍ପ୍ରେ କରନ୍ତୁ',
            phi_days: 14
          }
        ]
      },
      {
        id: 'napier_fall_armyworm',
        type: 'pest',
        name_en: 'Fall Armyworm (Spodoptera frugiperda)',
        name_or: 'ନେପିୟର ଫଲ୍ ଆର୍ମିୱାର୍ମ ପୋକ',
        severity: 'High',
        symptoms_en: 'Extensive leaf feeding and skeletonizing of tender tillers with sawdust frass.',
        symptoms_or: 'ପତ୍ରକୁ କଣା କରି ସବୁଜ ଅଂଶ ଖାଇଯିବା ଓ କରତ ଗୁଣ୍ଡ ଭଳି ମଳ ପକାଇବା।',
        treatments: [
          {
            product_en: 'Azadirachtin 10,000 ppm OR Spinetoram 11.7% SC (strictly follow PHI)',
            product_or: 'ନିମ୍ବ ଅର୍କ କିମ୍ବା ସ୍ପିନେଟୋରାମ୍ (ଗୋରୁ ଖାଇବା ପୂର୍ବରୁ ସୁରକ୍ଷା ସମୟ ପାଳନ କରନ୍ତୁ)',
            active_ingredient: 'Azadirachtin 1% EC',
            dose_per_litre: '2.0 ml Neem extract',
            dose_per_200L: '400 ml in 200 L water',
            type: 'organic',
            organic_alternative_en: 'Bacillus thuringiensis (Bt) @ 2 g/L (completely safe for cattle)',
            organic_alternative_or: 'ବିଟି ପାଉଡର ୨ ଗ୍ରାମ/ଲିଟର (ଗୋରୁଙ୍କ ପାଇଁ ସମ୍ପୂର୍ଣ୍ଣ ବିପଦମୁକ୍ତ)',
            phi_days: 7
          }
        ]
      },
      {
        id: 'napier_smut',
        type: 'disease',
        name_en: 'Head Smut (Ustilago napierae)',
        name_or: 'ନେପିୟର ଶିଁଷା କଳା ଅଙ୍ଗାରୁଆ ରୋଗ',
        severity: 'Medium',
        symptoms_en: 'Inflorescence converted into a mass of black powdery fungal spores.',
        symptoms_or: 'ଫୁଲ ଶିଁଷା କଳା କୋଇଲା ପାଉଁଶରେ ପରିଣତ ହୋଇଯିବା।',
        treatments: [
          {
            product_en: 'Cut and discard flowering stalks before spore release + Propiconazole',
            product_or: 'କଳା ଶିଁଷା କାଟି ନଷ୍ଟ କରିବା ଓ ପ୍ରୋପିକୋନାଜୋଲ୍ ସ୍ପ୍ରେ',
            active_ingredient: 'Propiconazole 25% EC',
            dose_per_litre: '1.0 ml',
            dose_per_200L: '200 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Regular harvesting at 45 days prevents heading and smut altogether',
            organic_alternative_or: 'ନିୟମିତ ୪୫ ଦିନରେ ଘାସ କାଟିଲେ ଫୁଲ ହୁଏ ନାହିଁ ଓ ରୋଗ ହୁଏ ନାହିଁ',
            phi_days: 15
          }
        ]
      },
      {
        id: 'napier_nitrate_toxicity',
        type: 'nutrient',
        name_en: 'Excess Nitrogen / Drought Nitrate Toxicity Risk',
        name_or: 'ଅତ୍ୟଧିକ ୟୁରିଆରୁ ନାଇଟ୍ରେଟ୍ ବିଷକ୍ରିୟା ବିପଦ',
        severity: 'High',
        symptoms_en: 'Dark lush blue-green grass in drought accumulating toxic nitrate dangerous to cows.',
        symptoms_or: 'ଖରାଟିଆ ପାଗରେ ଅଧିକ ୟୁରିଆ ପଡ଼ିଥିଲେ ଘାସରେ ନାଇଟ୍ରେଟ୍ ଜମି ଗାଈଙ୍କୁ ବିଷ ହୋଇପାରେ।',
        treatments: [
          {
            product_en: 'Balance Urea with Single Super Phosphate & Potash + Irrigate heavily before cutting',
            product_or: 'ୟୁରିଆ ସହିତ ଫସଫେଟ୍ ଓ ପଟାସ୍ ପ୍ରୟୋଗ ଏବଂ କାଟିବା ପୂର୍ବରୁ ପ୍ରଚୁର ପାଣି ଦେବା',
            active_ingredient: 'Fertilizer balanced nutrition',
            dose_per_litre: 'Basal balanced NPK ratio 4:2:1',
            dose_per_200L: 'Irrigation management',
            type: 'cultural',
            organic_alternative_en: 'Apply enriched FYM / Gobar gas slurry instead of raw chemical Urea',
            organic_alternative_or: 'ୟୁରିଆ ବଦଳରେ ଗୋବର ଖତ ଓ ବାୟୋଗ୍ୟାସ ସ୍ଲରି ପ୍ରୟୋଗ',
            phi_days: 0
          }
        ]
      }
    ]
  }
];

export const FORESTRY_TREES: CropItem[] = [
  {
    id: 'teak',
    category: 'forestry',
    name_en: 'Teak (Saguan)',
    name_or: 'ଶାଗୁଆନ (Teak / Saguan)',
    name_hi: 'सागवान (Teak)',
    scientific_name: 'Tectona grandis',
    icon: '🪵',
    soil_type_en: 'Deep well-drained alluvial or loam soil with high calcium and neutral pH',
    soil_type_or: 'ଗଭୀର ନିଗିଡ଼ା ଦୋରସା ଓ ଚୂନ ଯୁକ୍ତ ମାଟି',
    duration_days: 'Timber tree (Harvest at 15-25 years)',
    water_requirement: 'Medium',
    water_requirement_or: 'ମଧ୍ୟମ ପାଣି',
    problems: [
      {
        id: 'teak_defoliator',
        type: 'pest',
        name_en: 'Teak Defoliator (Hyblaea puera)',
        name_or: 'ଶାଗୁଆନ ପତ୍ରଖିଆ ପୋକ (ଡିଫୋଲିଏଟର)',
        severity: 'High',
        symptoms_en: 'Caterpillars voraciously consume entire leaf tissue leaving only major veins, completely defoliating plantations.',
        symptoms_or: 'ଶୁକପୋକ ଶାଗୁଆନର ସବୁ ପତ୍ର ଚରି ଖାଇ କେବଳ ଶିରା ଛାଡ଼ିଦିଅନ୍ତି, ଗଛ ଲଣ୍ଡା ହୋଇଯାଏ।',
        treatments: [
          {
            product_en: 'Quinalphos 25% EC or Chlorantraniliprole 18.5% SC',
            product_or: 'କୁଇନାଲଫସ୍ ୨୫% EC କିମ୍ବା କୋରାଜେନ୍',
            active_ingredient: 'Quinalphos 25% EC',
            dose_per_litre: '2.0 ml Quinalphos OR 0.3 ml Coragen',
            dose_per_200L: '400 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'HpNPV (Hyblaea puera NPV virus) @ 1.5 x 10^5 PIB/ml OR Bt @ 2 g/L',
            organic_alternative_or: 'ବିଟି କିମ୍ବା HpNPV ଭୂତାଣୁ ସ୍ପ୍ରେ',
            phi_days: 30
          }
        ]
      },
      {
        id: 'teak_skeletonizer',
        type: 'pest',
        name_en: 'Teak Skeletonizer (Eutectona machaeralis)',
        name_or: 'ଶାଗୁଆନ କଙ୍କାଳିଆ ପୋକ (ସ୍କେଲିଟନାଇଜର)',
        severity: 'High',
        symptoms_en: 'Larvae feed on green parenchyma beneath webbed shelters leaving brown skeletonized lace leaves.',
        symptoms_or: 'ପତ୍ରର ସବୁଜ ମାଂସ ଖାଇ କେବଳ ଜାଲି ଭଳି କଙ୍କାଳ ଛାଡ଼ିଦିଏ, ପତ୍ର ବାଦାମୀ ପାଉଁଶିଆ ହୋଇ ଶୁଖିଯାଏ।',
        treatments: [
          {
            product_en: 'Emamectin Benzoate 5% SG or Profenofos 50% EC',
            product_or: 'ଏମାମେକ୍ଟିନ୍ ବେଞ୍ଜୋଏଟ୍ କିମ୍ବା ପ୍ରୋଫେନୋଫସ୍',
            active_ingredient: 'Emamectin Benzoate 5% SG',
            dose_per_litre: '0.4 g Emamectin OR 2.0 ml Profenofos',
            dose_per_200L: '80 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Beauveria bassiana 5 g/L foliar spray in post-monsoon period',
            organic_alternative_or: 'ବିଉଭେରିଆ କବକ ୫ ଗ୍ରାମ/ଲିଟର ସ୍ପ୍ରେ',
            phi_days: 30
          }
        ]
      },
      {
        id: 'teak_leaf_rust',
        type: 'disease',
        name_en: 'Teak Leaf Rust (Olivea tectonae)',
        name_or: 'ଶାଗୁଆନ ପତ୍ର ଗେରୁଆ ରୋଗ',
        severity: 'Medium',
        symptoms_en: 'Yellowish-brown powdery pustules covering leaf underside, premature defoliation in winter.',
        symptoms_or: 'ପତ୍ର ତଳେ ହଳଦିଆ-ବାଦାମୀ ଗୁଣ୍ଡ ଭଳି ଗେରୁଆ ଦାଗ, ଶୀତଦିନେ ଅକାଳରେ ପତ୍ର ଝଡ଼ିବା।',
        treatments: [
          {
            product_en: 'Hexaconazole 5% EC or Mancozeb 75% WP',
            product_or: 'ହେକ୍ସାକୋନାଜୋଲ୍ କିମ୍ବା ମାଙ୍କୋଜେବ୍ ୭୫% WP',
            active_ingredient: 'Hexaconazole 5% EC',
            dose_per_litre: '1.0 ml Hexaconazole OR 2.5 g Mancozeb',
            dose_per_200L: '200 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Spray 1% Bordeaux mixture on nursery seedlings and young saplings',
            organic_alternative_or: '୧% ବୋର୍ଦ୍ଦୋ ମିଶ୍ରଣ ଚାରା ଉପରେ ସ୍ପ୍ରେ',
            phi_days: 30
          }
        ]
      },
      {
        id: 'teak_canker_rot',
        type: 'disease',
        name_en: 'Teak Stem Canker & Heart Rot (Phomopsis / Phellinus spp.)',
        name_or: 'ଶାଗୁଆନ କାଣ୍ଡ କ୍ୟାଙ୍କର ଓ ହୃଦୟକାଠ ପଚା ରୋଗ',
        severity: 'High',
        symptoms_en: 'Cracked swollen cankers on trunk with gum oozing, internal heartwood rots reducing timber value.',
        symptoms_or: 'ଗଣ୍ଡିରେ ଫଟା ଦାଗ ହୋଇ ଅଠା ବାହାରିବା, ଭିତର ମୂଲ୍ୟବାନ କାଠ ପୋଲା ହୋଇ ପଚିଯିବା।',
        treatments: [
          {
            product_en: 'Copper Oxychloride 50% WP paste on wounds and trunk fissures',
            product_or: 'କଟା ବା ଫଟା ଗଣ୍ଡିରେ କପର ଅକ୍ସିକ୍ଲୋରାଇଡ୍ ପେଷ୍ଟ ଲଗାଇବା',
            active_ingredient: 'Copper Oxychloride 50% WP',
            dose_per_litre: 'Chisel dead bark and apply 20% COC paste with linseed oil',
            dose_per_200L: 'Direct trunk treatment',
            type: 'chemical',
            organic_alternative_en: 'Prevent mechanical cuts and fire damage; coat cuts with coal tar / Bordeaux paste',
            organic_alternative_or: 'ବୋର୍ଦ୍ଦୋ ପେଷ୍ଟ ବା କୋଲଟାର ଲଗାନ୍ତୁ',
            phi_days: 0
          }
        ]
      }
    ]
  }
];
