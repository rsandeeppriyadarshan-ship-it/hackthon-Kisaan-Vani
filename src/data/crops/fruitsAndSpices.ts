import { CropItem } from './types';

export const FRUITS: CropItem[] = [
  {
    id: 'mango',
    category: 'fruits',
    name_en: 'Mango (Amba)',
    name_or: 'ଆମ୍ବ (Mango)',
    name_hi: 'आम (Mango)',
    scientific_name: 'Mangifera indica',
    icon: '🥭',
    soil_type_en: 'Deep well-drained alluvial, loam, or laterite soils with pH 5.5-7.5',
    soil_type_or: 'ଗଭୀର ନିଗିଡ଼ା ଦୋରସା, ପଟୁ ଓ ଲାଲ୍ ମାଟି',
    duration_days: 'Perennial tree (Flowering Dec-Jan, Harvest May-Jul)',
    water_requirement: 'Medium',
    water_requirement_or: 'ମଧ୍ୟମ ପାଣି',
    problems: [
      {
        id: 'mango_hopper',
        type: 'pest',
        name_en: 'Mango Hopper (Amritodus atkinsoni / Idioscopus spp.)',
        name_or: 'ଆମ୍ବ ବଉଳ ଡେଇଁପୋକ (ହପର)',
        severity: 'High',
        symptoms_en: 'Nymphs and adults suck sap from tender panicles causing blossom withering and sooty mold.',
        symptoms_or: 'ଆମ୍ବ ବଉଳରୁ ରସ ଶୋଷି ବଉଳ କଳା ପକାଇ ଝଡ଼ାଇ ଦିଏ, ଗଛ ଅଠାଳିଆ କଳା ପଡ଼ିଯାଏ।',
        treatments: [
          {
            product_en: 'Thiamethoxam 25% WG or Imidacloprid 17.8% SL',
            product_or: 'ଆକ୍ଟାରା (ଥିଆମେଥୋକ୍ସାମ୍) କିମ୍ବା ଇମିଡାକ୍ଲୋପ୍ରିଡ୍',
            active_ingredient: 'Thiamethoxam 25% WG',
            dose_per_litre: '0.3 g Thiamethoxam OR 0.4 ml Imidacloprid',
            dose_per_200L: '60 g Thiamethoxam in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Neem oil 3000 ppm @ 3 ml/L + Verticillium lecanii 5 g/L',
            organic_alternative_or: 'ନିମ୍ବ ତେଲ ୩ ମିଲି/ଲିଟର ସହ ଭର୍ଟିସିଲିଅମ୍ କବକ ସ୍ପ୍ରେ',
            phi_days: 15
          }
        ]
      },
      {
        id: 'mango_powdery_mildew',
        type: 'disease',
        name_en: 'Powdery Mildew of Mango (Oidium mangiferae)',
        name_or: 'ଆମ୍ବ ବଉଳ ଧଳା ପାଉଁଶିଆ ରୋଗ',
        severity: 'High',
        symptoms_en: 'White powdery coating covering panicles, young leaves, and tiny fruitlets causing drop.',
        symptoms_or: 'ବଉଳ ଓ କଅଁଳ ଆମ୍ବିଳି ଉପରେ ଧଳା ପାଉଡର ଭଳି କବକ ମାଡ଼ି ବଉଳ ଝଡ଼ିପଡ଼ିବା।',
        treatments: [
          {
            product_en: 'Hexaconazole 5% EC (Contaf) or Dinocap 48% EC',
            product_or: 'କଣ୍ଟାଫ୍ (ହେକ୍ସାକୋନାଜୋଲ୍ ୫% EC) କିମ୍ବା ଡିନୋକାପ୍',
            active_ingredient: 'Hexaconazole 5% EC',
            dose_per_litre: '1.0 ml',
            dose_per_200L: '200 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Wettable Sulphur 80% WP @ 2.5 g/L',
            organic_alternative_or: 'ସଲଫର ୮୦% WP ୨.୫ ଗ୍ରାମ/ଲିଟର ସ୍ପ୍ରେ',
            phi_days: 15
          }
        ]
      },
      {
        id: 'mango_anthracnose',
        type: 'disease',
        name_en: 'Anthracnose & Black Spot (Colletotrichum gloeosporioides)',
        name_or: 'ଆମ୍ବ କଳାଜାମୁଆ ରୋଗ (ଆନ୍ଥ୍ରାକ୍ନୋଜ୍)',
        severity: 'High',
        symptoms_en: 'Dark brown to black tear stains on fruit peel and sunken spots expanding during ripening.',
        symptoms_or: 'ପାଚିଲା ବେଳେ ଆମ୍ବ ଚୋପା ଉପରେ କଳା ଲୁହ ଧାର ଭଳି ଖାଲୁଆ ଦାଗ ହୋଇ ପଚିଯିବା।',
        treatments: [
          {
            product_en: 'Copper Oxychloride 50% WP or Azoxystrobin 23% SC',
            product_or: 'କପର ଅକ୍ସିକ୍ଲୋରାଇଡ୍ ୫୦% WP କିମ୍ବା ଆଜୋକ୍ସିଷ୍ଟ୍ରୋବିନ୍',
            active_ingredient: 'Copper Oxychloride 50% WP',
            dose_per_litre: '2.5 g COC OR 1.0 ml Azoxystrobin',
            dose_per_200L: '500 g COC in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Hot water treatment of harvested fruits at 52°C for 5 minutes',
            organic_alternative_or: 'ତୋଳିବା ପରେ ୫୨ ଡିଗ୍ରୀ ଗରମ ପାଣିରେ ୫ ମିନିଟ ବୁଡ଼ାଇ ଶୁଖାନ୍ତୁ',
            phi_days: 14
          }
        ]
      },
      {
        id: 'mango_fruit_fly',
        type: 'pest',
        name_en: 'Oriental Fruit Fly (Bactrocera dorsalis)',
        name_or: 'ଆମ୍ବ ଫଳମାଛି (ମ୍ୟାଗଟ୍ ପୋକ)',
        severity: 'High',
        symptoms_en: 'Female fly lays eggs beneath skin; maggots feed inside causing premature fruit drop and rot.',
        symptoms_or: 'ଆମ୍ବ ଚୋପା ତଳେ ଅଣ୍ଡା ଦିଏ, ଭିତରେ ଧଳା ପୋକ ମାଂସ ଖାଇ ଆମ୍ବ ପଚାଇ ତଳେ ଖସାଇ ଦିଏ।',
        treatments: [
          {
            product_en: 'Methyl Eugenol Pheromone Traps @ 6 traps/acre + Bait spray',
            product_or: 'ମିଥାଇଲ୍ ୟୁଜେନଲ୍ ଫେରୋମୋନ୍ ଫାନ୍ଦ ୬ଟି/ଏକର + ବିଷ ଫାନ୍ଦ',
            active_ingredient: 'Methyl Eugenol lure + Malathion bait',
            dose_per_litre: 'Bait: 100 g Jaggery + 2 ml Malathion 50% EC in 1 L water',
            dose_per_200L: 'Spot spray on tree trunks only',
            type: 'chemical',
            organic_alternative_en: 'Sanitation: Collect and bury fallen infested fruits 60 cm deep',
            organic_alternative_or: 'ତଳେ ପଡ଼ିଥିବା ପୋକରା ଆମ୍ବକୁ ଗାତ ଖୋଳି ମାଟି ତଳେ ପୋତନ୍ତୁ',
            phi_days: 7
          }
        ]
      }
    ]
  },
  {
    id: 'banana',
    category: 'fruits',
    name_en: 'Banana (Kadali)',
    name_or: 'କଦଳୀ (Banana / Kadali)',
    name_hi: 'केला (Banana)',
    scientific_name: 'Musa paradisiaca',
    icon: '🍌',
    soil_type_en: 'Deep rich loamy soil with rich humus and good drainage',
    soil_type_or: 'ଗଭୀର ଦୋରସା ଓ ଜୈବିକ ଖତ ଯୁକ୍ତ ମାଟି',
    duration_days: '10-12 months',
    water_requirement: 'High',
    water_requirement_or: 'ଅଧିକ ପାଣି',
    problems: [
      {
        id: 'banana_sigatoka',
        type: 'disease',
        name_en: 'Sigatoka Leaf Spot (Pseudocercospora fijiensis)',
        name_or: 'କଦଳୀ ସିଗାଟୋକା ପତ୍ରପୋଡ଼ା ରୋଗ',
        severity: 'High',
        symptoms_en: 'Spindle-shaped brown streaks with greyish white centers surrounded by yellow halo on leaf blade.',
        symptoms_or: 'ପତ୍ରରେ ବାଦାମୀ ଗାର ହୋଇ ପରେ ପାଉଁଶିଆ କେନ୍ଦ୍ର ବିଶିଷ୍ଟ ବଡ଼ ବଡ଼ ପୋଡ଼ା ଦାଗ ହେବା।',
        treatments: [
          {
            product_en: 'Propiconazole 25% EC (Tilt) mixed with Mineral Oil',
            product_or: 'ପ୍ରୋପିକୋନାଜୋଲ୍ ୨୫% EC + ମିନେରାଲ୍ ଅଏଲ୍',
            active_ingredient: 'Propiconazole 25% EC',
            dose_per_litre: '1.0 ml Tilt + 10 ml Mineral Spray Oil',
            dose_per_200L: '200 ml Tilt + 2 L Mineral Oil in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Cut and burn heavily spotted lower dried leaves regularly',
            organic_alternative_or: 'ରୋଗାକ୍ରାନ୍ତ ତଳ ପତ୍ରଗୁଡ଼ିକୁ କାଟି ଜମି ବାହାରେ ପୋଡ଼ି ଦିଅନ୍ତୁ',
            phi_days: 15
          }
        ]
      },
      {
        id: 'banana_panama_wilt',
        type: 'disease',
        name_en: 'Panama Wilt (Fusarium oxysporum f. sp. cubense - TR4)',
        name_or: 'କଦଳୀ ପାନାମା ଝାଉଁଳା ରୋଗ (କାଣ୍ଡ ଫାଟିବା)',
        severity: 'High',
        symptoms_en: 'Yellowing of lower leaves hanging around pseudostem like a skirt, longitudinal split of trunk base.',
        symptoms_or: 'ତଳ ପତ୍ରଗୁଡ଼ିକ ହଳଦିଆ ହୋଇ ତଳକୁ ଝୁଲି ପଡ଼ିବା, କାଣ୍ଡର ମୂଳ ଲମ୍ବାଳିଆ ଭାବେ ଫାଟିଯିବା।',
        treatments: [
          {
            product_en: 'Carbendazim 50% WP sucker dip + root soil drenching',
            product_or: 'କାର୍ବେଣ୍ଡାଜିମ୍ ପିଲା ବିଶୋଧନ ଓ ମୂଳରେ ଢାଳିବା',
            active_ingredient: 'Carbendazim 50% WP',
            dose_per_litre: '2.0 g',
            dose_per_200L: '400 g in 200 L water drenching',
            type: 'chemical',
            organic_alternative_en: 'Plant tissue-cultured Grand Naine suckers + Trichoderma viride 50 g/pit',
            organic_alternative_or: 'ଟିସୁ କଲଚର ଚାରା ରୋପଣ + ଟ୍ରାଇକୋଡର୍ମା ଖାତରେ ଦିଅନ୍ତୁ',
            phi_days: 60
          }
        ]
      },
      {
        id: 'banana_pseudostem_weevil',
        type: 'pest',
        name_en: 'Pseudostem Borer Weevil (Odoiporus longicollis)',
        name_or: 'କଦଳୀ କାଣ୍ଡବିନ୍ଧା ଶୁଣ୍ଢିଆ ପୋକ',
        severity: 'High',
        symptoms_en: 'Jelly-like exudation on pseudostem, boreholes with frass, trunk snaps in wind.',
        symptoms_or: 'କାଣ୍ଡରୁ ଜେଲି ଭଳି ଅଠା ବାହାରିବା, ଭିତର ପୋଲା ହୋଇ ପବନରେ କଦଳୀ ଗଛ ଭାଙ୍ଗିଯିବା।',
        treatments: [
          {
            product_en: 'Chlorpyrifos 20% EC stem injection or swabbing',
            product_or: 'କ୍ଲୋରପାଇରିଫସ୍ ୨୦% EC କାଣ୍ଡରେ ଲେପନ କିମ୍ବା ଇଞ୍ଜେକ୍ସନ',
            active_ingredient: 'Chlorpyrifos 20% EC',
            dose_per_litre: '2.5 ml',
            dose_per_200L: '500 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Beauveria bassiana 10 g/L swabbed on pseudostem + Cosmolure traps',
            organic_alternative_or: 'ବିଉଭେରିଆ କବକ କାଣ୍ଡରେ ଲେପ ଦିଅନ୍ତୁ',
            phi_days: 30
          }
        ]
      },
      {
        id: 'banana_bunchy_top',
        type: 'disease',
        name_en: 'Banana Bunchy Top Virus - BBTV (Aphid vector)',
        name_or: 'କଦଳୀ ମୁକୁଟ ବୁଦା ରୋଗ (ବଞ୍ଚି ଟପ୍ ଭୂତାଣୁ)',
        severity: 'High',
        symptoms_en: 'Dark green "Morse code" dots and dashes along leaf veins, stunted leaves crowded at top like rosette.',
        symptoms_or: 'ପତ୍ର ଶିରାରେ ମୋର୍ସ କୋଡ୍ ଭଳି କଳା ବିନ୍ଦୁ ଗାର, ଡେଙ୍ଗା ନହୋଇ ମୁଣ୍ଡରେ ଛୋଟ ଛୋଟ ପତ୍ର ଜମି ରହିବା।',
        treatments: [
          {
            product_en: 'Imidacloprid 17.8% SL (kill aphid vector Pentalonia nigronervosa)',
            product_or: 'ଇମିଡାକ୍ଲୋପ୍ରିଡ୍ ୧୭.୮% SL (ଜାବପୋକ ନିୟନ୍ତ୍ରଣ)',
            active_ingredient: 'Imidacloprid 17.8% SL',
            dose_per_litre: '0.4 ml',
            dose_per_200L: '80 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Destroy diseased mat with 2,4-D herbicide injection + quarantine',
            organic_alternative_or: 'ରୋଗିଣା ମାଆ ଗଛ ଓ ପିଲା ଗଛ ସମୂଳେ ନଷ୍ଟ କରନ୍ତୁ',
            phi_days: 45
          }
        ]
      }
    ]
  },
  {
    id: 'papaya',
    category: 'fruits',
    name_en: 'Papaya (Amrutabhanda)',
    name_or: 'ଅମୃତଭଣ୍ଡା (Papaya)',
    name_hi: 'पपीता (Papaya)',
    scientific_name: 'Carica papaya',
    icon: '🍈',
    soil_type_en: 'Extremely well-drained sandy loam (highly susceptible to waterlogging)',
    soil_type_or: 'ଉଚ୍ଚ ନିଗିଡ଼ା ବାଲିଆ ଦୋରସା ମାଟି (ପାଣି ଜମିଲେ ଚେର ପଚିଯାଏ)',
    duration_days: '9-12 months',
    water_requirement: 'Medium',
    water_requirement_or: 'ମଧ୍ୟମ ପାଣି',
    problems: [
      {
        id: 'papaya_ring_spot',
        type: 'disease',
        name_en: 'Papaya Ring Spot Virus - PRSV (Aphid Vector)',
        name_or: 'ଅମୃତଭଣ୍ଡା ରିଙ୍ଗ୍ ସ୍ପଟ୍ ଭୂତାଣୁ ରୋଗ',
        severity: 'High',
        symptoms_en: 'Shoestring narrow leaves, yellow mosaic, oily circular dark rings on fruit peel.',
        symptoms_or: 'ପତ୍ର ଦଉଡ଼ି ଭଳି ପତଳା ହୋଇଯିବା, ଫଳ ଚୋପା ଉପରେ ଗୋଲ ଗୋଲ ତେଲିଆ ଚିତା ଦାଗ।',
        treatments: [
          {
            product_en: 'Dimethoate 30% EC or Imidacloprid 17.8% SL (vector management)',
            product_or: 'ରୋଗର କିମ୍ବା ଇମିଡାକ୍ଲୋପ୍ରିଡ୍ (ଜାବପୋକ ନିୟନ୍ତ୍ରଣ)',
            active_ingredient: 'Dimethoate 30% EC',
            dose_per_litre: '1.5 ml',
            dose_per_200L: '300 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Border crop with 3 rows of Maize or Sorghum as barrier + reflective mulch',
            organic_alternative_or: 'ଚାରିପାଖେ ମକା ବା ଯୋୱାର ୩ ଧାଡ଼ି ବାଡ଼ ଫସଲ ଲଗାନ୍ତୁ',
            phi_days: 14
          }
        ]
      },
      {
        id: 'papaya_foot_rot',
        type: 'disease',
        name_en: 'Foot Rot & Stem Rot (Pythium aphanidermatum)',
        name_or: 'ଅମୃତଭଣ୍ଡା ମୂଳପଚା ଓ କାଣ୍ଡପଚା ରୋଗ',
        severity: 'High',
        symptoms_en: 'Water-soaked soft patches at soil collar, bark sloughs off, tree snaps in breeze.',
        symptoms_or: 'ମାଟି ପାଖ କାଣ୍ଡ ନରମ ହୋଇ ପଚିଯିବା, ଗଛର ଛାଲ ଛାଡ଼ି ପବନରେ ଭାଙ୍ଗି ପଡ଼ିବା।',
        treatments: [
          {
            product_en: 'Copper Oxychloride 50% WP or Metalaxyl 8% + Mancozeb 64%',
            product_or: 'କପର ଅକ୍ସିକ୍ଲୋରାଇଡ୍ କିମ୍ବା ରିଡୋମିଲ୍ ଏମଜେଡ୍ କାଣ୍ଡ ଲେପନ',
            active_ingredient: 'Copper Oxychloride 50% WP',
            dose_per_litre: '3.0 g / L soil drench and paste on stem',
            dose_per_200L: '600 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Ensure raised bed drainage + Trichoderma drenching @ 10 g/tree',
            organic_alternative_or: 'ଉଚ୍ଚ ମାଟି ହିଡ଼ରେ ଲଗାନ୍ତୁ ଓ ଟ୍ରାଇକୋଡର୍ମା ପ୍ରୟୋଗ କରନ୍ତୁ',
            phi_days: 20
          }
        ]
      },
      {
        id: 'papaya_mealybug',
        type: 'pest',
        name_en: 'Papaya Mealybug (Paracoccus marginatus)',
        name_or: 'ଅମୃତଭଣ୍ଡା ଧଳା ପାଉଡର ପୋକ (ମିଲିବଗ୍)',
        severity: 'High',
        symptoms_en: 'White cottony waxy clusters covering leaves and fruit surface, yellowing, stunted crinkled leaves.',
        symptoms_or: 'ପତ୍ର ଓ ଫଳ ଉପରେ ତୁଳା ଭଳି ଧଳା ପୋକ ଘଞ୍ଚ ହୋଇ ମାଡ଼ିବା, କଳା ଫିମ୍ପି ଜମିବା।',
        treatments: [
          {
            product_en: 'Profenofos 50% EC or Buprofezin 25% SC',
            product_or: 'ପ୍ରୋଫେନୋଫସ୍ ୫୦% EC କିମ୍ବା ବୁପ୍ରୋଫେଜିନ୍',
            active_ingredient: 'Profenofos 50% EC',
            dose_per_litre: '2.0 ml Profenofos OR 1.5 ml Buprofezin',
            dose_per_200L: '400 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Release Acerophagus papayae parasitoid wasps + soap water spray 20 g/L',
            organic_alternative_or: 'ବାୟୋ-ପାରାସାଇଟ୍ ମିତ୍ର କୀଟ ବ୍ୟବହାର + ତେଲ-ସାବୁନ ପାଣି ସ୍ପ୍ରେ',
            phi_days: 7
          }
        ]
      },
      {
        id: 'papaya_anthracnose',
        type: 'disease',
        name_en: 'Fruit Anthracnose (Colletotrichum gloeosporioides)',
        name_or: 'ଅମୃତଭଣ୍ଡା ଫଳପଚା ରୋଗ',
        severity: 'Medium',
        symptoms_en: 'Small round water-soaked sunken spots on ripening fruit surface enlarging into pink fungal centers.',
        symptoms_or: 'ପାଚିଲା ଅମୃତଭଣ୍ଡା ଉପରେ ଗୋଲ ଖାଲୁଆ ଦାଗ ଓ ମଝିରେ ଗୋଲାପୀ ଫିମ୍ପି।',
        treatments: [
          {
            product_en: 'Carbendazim 50% WP or Mancozeb 75% WP',
            product_or: 'ବାଭିଷ୍ଟିନ୍ କିମ୍ବା ମାଙ୍କୋଜେବ୍ ୭୫% WP',
            active_ingredient: 'Carbendazim 50% WP',
            dose_per_litre: '1.0 g Carbendazim OR 2.5 g Mancozeb',
            dose_per_200L: '200 g Carbendazim in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Post-harvest dipping in hot water (48°C) for 20 minutes',
            organic_alternative_or: '୪୮ ଡିଗ୍ରୀ ଉଷୁମ ପାଣିରେ ୨୦ ମିନିଟ ବୁଡ଼ାଇ ସାଇତନ୍ତୁ',
            phi_days: 5
          }
        ]
      }
    ]
  },
  {
    id: 'guava',
    category: 'fruits',
    name_en: 'Guava (Pijuli)',
    name_or: 'ପିଜୁଳି (Guava / Pijuli)',
    name_hi: 'अमरूद (Guava)',
    scientific_name: 'Psidium guajava',
    icon: '🍈',
    soil_type_en: 'Tolerates wide range of soils from sand to clay with pH 4.5-8.2',
    soil_type_or: 'ସବୁ ପ୍ରକାର ଦୋରସା, ବାଲିଆ ଓ ମଟାଳ ମାଟିରେ ବଢ଼ିପାରେ',
    duration_days: 'Perennial (Flowering round the year)',
    water_requirement: 'Medium',
    water_requirement_or: 'ମଧ୍ୟମ ପାଣି',
    problems: [
      {
        id: 'guava_wilt',
        type: 'disease',
        name_en: 'Guava Wilt (Fusarium oxysporum f. sp. psidii)',
        name_or: 'ପିଜୁଳି ଝାଉଁଳା ରୋଗ (ୱିଲ୍ଟ)',
        severity: 'High',
        symptoms_en: 'Yellowing of leaves, defoliation from twigs downwards, vascular browning, tree dies in months.',
        symptoms_or: 'ପତ୍ର ହଳଦିଆ ହୋଇ ଡାଳରୁ ଝଡ଼ିବା, କାଣ୍ଡ ଭିତରେ ବାଦାମୀ ରଙ୍ଗ ହୋଇ ଗଛ ଶୁଖି ମରିଯିବା।',
        treatments: [
          {
            product_en: 'Carbendazim 50% WP root drenching + Soil solarization',
            product_or: 'ବାଭିଷ୍ଟିନ୍ ମୂଳ ମାଟିରେ ଢାଳିବା',
            active_ingredient: 'Carbendazim 50% WP',
            dose_per_litre: '2.0 g / L (5 litres per tree basin)',
            dose_per_200L: '400 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Trichoderma harzianum @ 50 g/tree mixed with neem cake 2 kg',
            organic_alternative_or: 'ଟ୍ରାଇକୋଡର୍ମା ୫୦ ଗ୍ରାମ ସହ ୨ କେଜି ନିମ୍ବ ପିଡ଼ିଆ ମୂଳରେ ଦିଅନ୍ତୁ',
            phi_days: 30
          }
        ]
      },
      {
        id: 'guava_fruit_fly',
        type: 'pest',
        name_en: 'Guava Fruit Fly (Bactrocera correcta)',
        name_or: 'ପିଜୁଳି ଫଳମାଛି ପୋକ',
        severity: 'High',
        symptoms_en: 'Puncture mark with brown resin droplet on fruit skin, internal pulp infested with squirming maggots.',
        symptoms_or: 'ପିଜୁଳି ଚୋପାରେ ଫୋଡ଼ି ହେଲା ଭଳି ଦାଗ, ଭିତରେ ଧଳା ଶୁକପୋକ ମାଂସ ଖାଇ ପଚାଇ ଦିଅନ୍ତି।',
        treatments: [
          {
            product_en: 'Methyl Eugenol Fruit Fly Traps @ 6-8 traps/acre',
            product_or: 'ଫଳମାଛି ଫେରୋମୋନ୍ ଫାନ୍ଦ (ମିଥାଇଲ୍ ୟୁଜେନଲ୍) ୬-୮ ଟି/ଏକର',
            active_ingredient: 'Methyl Eugenol lure + Malathion',
            dose_per_litre: 'Trap hanging on branches at 1.5 m height',
            dose_per_200L: 'Change lure every 45 days',
            type: 'chemical',
            organic_alternative_en: 'Bagging young fruits with non-woven polypropylene covers at marble size',
            organic_alternative_or: 'ପିଜୁଳି ଛୋଟ ଥିବା ବେଳେ କାଗଜ ବା କପଡ଼ା ଠୁଙ୍ଗାରେ ଘୋଡ଼ାନ୍ତୁ',
            phi_days: 7
          }
        ]
      },
      {
        id: 'guava_tea_mosquito',
        type: 'pest',
        name_en: 'Tea Mosquito Bug (Helopeltis antonii)',
        name_or: 'ପିଜୁଳି ମସା ପୋକ (ଟି-ମସ୍କିଟୋ ବଗ୍)',
        severity: 'Medium',
        symptoms_en: 'Scabby corky black necrotic spots on developing fruit skin, resembling scab lesions.',
        symptoms_or: 'ପିଜୁଳି ଚୋପା ଉପରେ କଳା ଖସଖସିଆ କାଛୁ ଭଳି ଫୋଟକା ଦାଗ ହେବା।',
        treatments: [
          {
            product_en: 'Thiamethoxam 25% WG or Lambda Cyhalothrin 5% EC',
            product_or: 'ଆକ୍ଟାରା କିମ୍ବା କରାଟେ (ଲାମ୍ବଡା ସାଇହାଲୋଥ୍ରିନ୍)',
            active_ingredient: 'Lambda Cyhalothrin 5% EC',
            dose_per_litre: '1.0 ml',
            dose_per_200L: '200 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Neem oil 3000 ppm @ 3 ml/L foliar spray in evening',
            organic_alternative_or: 'ନିମ୍ବ ତେଲ ୩ ମିଲି/ଲିଟର ସନ୍ଧ୍ୟା ସମୟରେ ସ୍ପ୍ରେ',
            phi_days: 10
          }
        ]
      },
      {
        id: 'guava_canker',
        type: 'disease',
        name_en: 'Guava Fruit Canker (Pestalotiopsis psidii)',
        name_or: 'ପିଜୁଳି କ୍ୟାଙ୍କର ରୋଗ',
        severity: 'Medium',
        symptoms_en: 'Raised crater-like corky rusty cankers with torn epidermal margins on fruits.',
        symptoms_or: 'ପିଜୁଳି ଉପରେ ଫାଟିଗଲା ଭଳି ଖସଖସିଆ ଖାଲୁଆ କଙ୍କର ଦାଗ।',
        treatments: [
          {
            product_en: 'Copper Oxychloride 50% WP or Bordeaux Mixture 1%',
            product_or: 'କପର ଅକ୍ସିକ୍ଲୋରାଇଡ୍ ୫୦% WP କିମ୍ବା ବୋର୍ଦ୍ଦୋ ମିଶ୍ରଣ',
            active_ingredient: 'Copper Oxychloride 50% WP',
            dose_per_litre: '2.5 g',
            dose_per_200L: '500 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Prune dead diseased twigs and spray 1% Bordeaux mixture',
            organic_alternative_or: 'ଶୁଖିଲା ଡାଳ କାଟି ୧% ବୋର୍ଦ୍ଦୋ ମିଶ୍ରଣ ସ୍ପ୍ରେ କରନ୍ତୁ',
            phi_days: 15
          }
        ]
      }
    ]
  }
];

export const SPICES: CropItem[] = [
  {
    id: 'turmeric',
    category: 'spices',
    name_en: 'Turmeric (Haladi)',
    name_or: 'ହଳଦୀ (Turmeric / Haladi)',
    name_hi: 'हल्दी (Turmeric)',
    scientific_name: 'Curcuma longa',
    icon: '🫚',
    soil_type_en: 'Rich well-drained sandy loam or clay loam with high humus',
    soil_type_or: 'ଉର୍ବର ନିଗିଡ଼ା ଦୋରସା ଓ ଲାଲ୍ ମାଟି (କନ୍ଧମାଳ ଜଳବାୟୁ ଉପଯୁକ୍ତ)',
    duration_days: '8-9 months (240-270 days)',
    water_requirement: 'Medium',
    water_requirement_or: 'ମଧ୍ୟମ ପାଣି',
    problems: [
      {
        id: 'turmeric_rhizome_rot',
        type: 'disease',
        name_en: 'Rhizome Rot / Soft Rot (Pythium aphanidermatum)',
        name_or: 'ହଳଦୀ ଗଣ୍ଠିପଚା ରୋଗ (ରାଇଜୋମ୍ ରଟ୍)',
        severity: 'High',
        symptoms_en: 'Collar region rots with foul smell, foliage dries from base, rhizomes turn soft and watery.',
        symptoms_or: 'କାଣ୍ଡ ମୂଳ ପଚି ଦୁର୍ଗନ୍ଧ ହେବା, ପତ୍ର ହଳଦିଆ ହୋଇ ଶୁଖିବା ଓ ମାଟି ତଳ ହଳଦୀ ଗଣ୍ଠି ପଚି ପାଣି ହୋଇଯିବା।',
        treatments: [
          {
            product_en: 'Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ) drenching',
            product_or: 'ରିଡୋମିଲ୍ ଏମଜେଡ୍ ରାଇଜୋମ୍ ବିଶୋଧନ ଓ ମାଟି ଭିଜାଇବା',
            active_ingredient: 'Metalaxyl + Mancozeb',
            dose_per_litre: '2.5 g',
            dose_per_200L: '500 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Trichoderma harzianum @ 2.5 kg in 100 kg FYM per acre + deep bed drainage',
            organic_alternative_or: 'ଟ୍ରାଇକୋଡର୍ମା ଖତ ମିଶ୍ରଣ ଓ ଜମିରୁ ଅତିରିକ୍ତ ପାଣି ନିଷ୍କାସନ',
            phi_days: 40
          }
        ]
      },
      {
        id: 'turmeric_shoot_borer',
        type: 'pest',
        name_en: 'Shoot Borer (Conogethes punctiferalis)',
        name_or: 'ହଳଦୀ କାଣ୍ଡବିନ୍ଧା ପୋକ',
        severity: 'High',
        symptoms_en: 'Larvae bore into pseudostem leaving frass extruded at bore hole, central shoot withers (dead heart).',
        symptoms_or: 'ଶୁକପୋକ କାଣ୍ଡ ଭିତରେ ପଶି କୋରି ଖାଏ, ମଝି ଡାଳ ଶୁଖିଯାଏ।',
        treatments: [
          {
            product_en: 'Chlorantraniliprole 18.5% SC or Flubendiamide 39.35% SC',
            product_or: 'କୋରାଜେନ୍ କିମ୍ବା ଫେମ୍ (ଫ୍ଲୁବେଣ୍ଡିଆମାଇଡ୍)',
            active_ingredient: 'Chlorantraniliprole 18.5% SC',
            dose_per_litre: '0.3 ml',
            dose_per_200L: '60 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Bacillus thuringiensis @ 2 g/L or Beauveria bassiana 5 g/L',
            organic_alternative_or: 'ବିଟି କିମ୍ବା ବିଉଭେରିଆ କବକ ସ୍ପ୍ରେ',
            phi_days: 21
          }
        ]
      },
      {
        id: 'turmeric_leaf_blotch',
        type: 'disease',
        name_en: 'Leaf Blotch (Taphrina maculans)',
        name_or: 'ହଳଦୀ ପତ୍ର କଳଙ୍କି ରୋଗ (ଟ୍ୟାଫ୍ରିନା)',
        severity: 'Medium',
        symptoms_en: 'Small oval reddish-brown to dirty yellow spots on both leaf surfaces, coalescing into dirty blotches.',
        symptoms_or: 'ପତ୍ର ଉଭୟ ପଟେ ବହୁ ସଂଖ୍ୟକ ଛୋଟ ଛୋଟ ଲାଲ୍-ବାଦାମୀ ଦାଗ ଏବଂ ପତ୍ର ପୋଡ଼ିଯିବା।',
        treatments: [
          {
            product_en: 'Mancozeb 75% WP or Copper Oxychloride 50% WP',
            product_or: 'ମାଙ୍କୋଜେବ୍ ୭୫% WP କିମ୍ବା କପର ଅକ୍ସିକ୍ଲୋରାଇଡ୍',
            active_ingredient: 'Mancozeb 75% WP',
            dose_per_litre: '2.5 g',
            dose_per_200L: '500 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Bordeaux mixture 1% spray at onset of monsoon',
            organic_alternative_or: '୧% ବୋର୍ଦ୍ଦୋ ମିଶ୍ରଣ ସ୍ପ୍ରେ',
            phi_days: 30
          }
        ]
      },
      {
        id: 'turmeric_rhizome_scale',
        type: 'pest',
        name_en: 'Rhizome Scale (Aspidiella hartii)',
        name_or: 'ହଳଦୀ ଗଣ୍ଠି କାତିପୋକ (ସ୍ମଲ୍ ସ୍କେଲ୍)',
        severity: 'Medium',
        symptoms_en: 'Minute circular brownish-white scales encrust stored seed rhizomes sucking sap, causing shrivelling.',
        symptoms_or: 'ସାଇତା ହଳଦୀ ଗଣ୍ଠି ଉପରେ ଧଳା କାତି ଭଳି ପୋକ ଜମି ରହି ଗଣ୍ଠିକୁ ଶୁଖାଇ ଚୁନ ଭଳି କରିଦିଅନ୍ତି।',
        treatments: [
          {
            product_en: 'Quinalphos 25% EC rhizome dip before storage',
            product_or: 'କୁଇନାଲଫସ୍ ୨୫% EC ରେ ଗଣ୍ଠି ବୁଡ଼ାଇ ସାଇତିବା',
            active_ingredient: 'Quinalphos 25% EC',
            dose_per_litre: '2.0 ml (soak seed rhizomes for 15 minutes)',
            dose_per_200L: 'Seed treatment before storage and sowing',
            type: 'chemical',
            organic_alternative_en: 'Dip rhizomes in 2% Neem oil emulsion before storage',
            organic_alternative_or: '୨% ନିମ୍ବ ତେଲ ମିଶ୍ରଣରେ ବୁଡ଼ାଇ ଛାଇରେ ଶୁଖାଇ ସାଇତନ୍ତୁ',
            phi_days: 60
          }
        ]
      }
    ]
  },
  {
    id: 'ginger',
    category: 'spices',
    name_en: 'Ginger (Ada)',
    name_or: 'ଅଦା (Ginger / Ada)',
    name_hi: 'अदरक (Ginger)',
    scientific_name: 'Zingiber officinale',
    icon: '🫚',
    soil_type_en: 'Sandy loam or clay loam with high organic humus and good drainage',
    soil_type_or: 'ନିଗିଡ଼ା ଦୋରସା ଓ ଜୈବିକ ଖତ ଯୁକ୍ତ ମାଟି',
    duration_days: '8-9 months (210-240 days)',
    water_requirement: 'Medium',
    water_requirement_or: 'ମଧ୍ୟମ ପାଣି',
    problems: [
      {
        id: 'ginger_soft_rot',
        type: 'disease',
        name_en: 'Soft Rot / Rhizome Rot (Pythium myriotylum)',
        name_or: 'ଅଦା ଗଣ୍ଠିପଚା ରୋଗ',
        severity: 'High',
        symptoms_en: 'Water-soaked collar turns soft, pseudostem easily pulls out with rotten base, foul stench.',
        symptoms_or: 'କାଣ୍ଡ ମୂଳ ନରମ ହୋଇ ପଚିଯିବା, ଟାଣିଲେ ସହଜରେ ଛିଣ୍ଡି ଆସିବା ଓ ଦୁର୍ଗନ୍ଧ ହେବା।',
        treatments: [
          {
            product_en: 'Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ) drenching',
            product_or: 'ରିଡୋମିଲ୍ ଏମଜେଡ୍ ମୂଳ ଭିଜାଇବା',
            active_ingredient: 'Metalaxyl + Mancozeb',
            dose_per_litre: '2.5 g',
            dose_per_200L: '500 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Trichoderma harzianum @ 2.5 kg/acre + Neem cake 200 kg/acre',
            organic_alternative_or: 'ଟ୍ରାଇକୋଡର୍ମା ସହ ନିମ୍ବ ପିଡ଼ିଆ ପ୍ରୟୋଗ',
            phi_days: 45
          }
        ]
      },
      {
        id: 'ginger_bacterial_wilt',
        type: 'disease',
        name_en: 'Bacterial Wilt (Ralstonia pseudosolanacearum)',
        name_or: 'ଅଦା ଜୀବାଣୁ ଝାଉଁଳା ରୋଗ',
        severity: 'High',
        symptoms_en: 'Bronze curling of leaves, water-soaked dark collar, milky bacterial ooze in clear water.',
        symptoms_or: 'ପତ୍ର ତମ୍ବାଳିଆ ହୋଇ କୁଞ୍ଚିତ ହେବା, କାଣ୍ଡ କାଟି ପାଣିରେ ବୁଡ଼ାଇଲେ ଧଳା କ୍ଷୀର ଭଳି ବ୍ୟାକ୍ଟେରିଆ ବାହାରିବା।',
        treatments: [
          {
            product_en: 'Streptocycline 0.1 g/L + Copper Oxychloride 2 g/L drenching',
            product_or: 'ଷ୍ଟ୍ରେପ୍ଟୋସାଇକ୍ଲିନ୍ + କପର ଅକ୍ସିକ୍ଲୋରାଇଡ୍ ମୂଳରେ ଢାଳିବା',
            active_ingredient: 'Streptomycin + Copper Oxychloride',
            dose_per_litre: '0.1 g Streptocycline + 2.0 g COC',
            dose_per_200L: '20 g Streptocycline + 400 g COC in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Treat seed rhizomes with hot water at 47°C for 30 minutes',
            organic_alternative_or: '୪୭ ଡିଗ୍ରୀ ଗରମ ପାଣିରେ ୩୦ ମିନିଟ ବିହନ ବିଶୋଧନ',
            phi_days: 45
          }
        ]
      },
      {
        id: 'ginger_shoot_borer',
        type: 'pest',
        name_en: 'Shoot Borer (Conogethes punctiferalis)',
        name_or: 'ଅଦା କାଣ୍ଡବିନ୍ଧା ପୋକ',
        severity: 'High',
        symptoms_en: 'Yellowing of central shoots with bore holes and extruded larval fecal pellets on stem.',
        symptoms_or: 'କାଣ୍ଡରେ ଛୋଟ କଣା ହୋଇ ପୋକର ମଳ ବାହାରିବା, ମଝି ଡାଳ ଶୁଖିବା।',
        treatments: [
          {
            product_en: 'Spinosad 45% SC or Chlorantraniliprole 18.5% SC',
            product_or: 'ସ୍ପିନୋସାଡ୍ ୪୫% SC କିମ୍ବା କୋରାଜେନ୍',
            active_ingredient: 'Spinosad 45% SC',
            dose_per_litre: '0.3 ml',
            dose_per_200L: '60 ml in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Beauveria bassiana @ 5 g/L foliar spray in August-September',
            organic_alternative_or: 'ବିଉଭେରିଆ କବକ ୫ ଗ୍ରାମ/ଲିଟର ସ୍ପ୍ରେ',
            phi_days: 21
          }
        ]
      },
      {
        id: 'ginger_leaf_spot',
        type: 'disease',
        name_en: 'Phyllosticta Leaf Spot (Phyllosticta zingiberi)',
        name_or: 'ଅଦା ଫାଇଲୋଷ୍ଟିକ୍ଟା ପତ୍ରଚିତା ରୋଗ',
        severity: 'Medium',
        symptoms_en: 'Oval yellowish to white spots with reddish margin coalescing into large holes in leaf.',
        symptoms_or: 'ପତ୍ରରେ ଧଳା-ହଳଦିଆ ଦାଗ ଓ ଚାରିପାଖେ ଲାଲ୍ ଘେର, ପତ୍ର କଣା କଣା ହୋଇଯିବା।',
        treatments: [
          {
            product_en: 'Mancozeb 75% WP (Indofil M-45)',
            product_or: 'ମାଙ୍କୋଜେବ୍ ୭୫% WP (ଇଣ୍ଡୋଫିଲ୍)',
            active_ingredient: 'Mancozeb 75% WP',
            dose_per_litre: '2.5 g',
            dose_per_200L: '500 g in 200 L water',
            type: 'chemical',
            organic_alternative_en: 'Pseudomonas fluorescens foliar spray @ 5 g/L',
            organic_alternative_or: 'ସୁଡୋମୋନାସ୍ ୫ ଗ୍ରାମ/ଲିଟର ସ୍ପ୍ରେ',
            phi_days: 25
          }
        ]
      }
    ]
  }
];
