import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const DISEASES_JSON_PATH = path.join(ROOT, 'src/data/diseases.json');
const OUT_DIR = path.join(ROOT, 'public/disease-photos');

const diseasesJson = JSON.parse(fs.readFileSync(DISEASES_JSON_PATH, 'utf8'));

function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRng(seedStr) {
  let s = hashSeed(seedStr) || 123456789;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

function classifyPlantAndSymptom(entry) {
  const id = (entry.id || '').toLowerCase();
  const crop = (entry.crop_id || '').toLowerCase();
  const sym = (entry.symptoms_en || '').toLowerCase();

  let morph = 'broad_leaf';
  const monocots = new Set([
    'paddy', 'wheat', 'maize', 'ragi', 'bajra', 'jowar', 'barley',
    'sweet_corn', 'baby_corn', 'fodder_maize', 'fodder_sorghum',
    'sugarcane', 'napier_grass', 'guinea_grass', 'lemongrass', 'bamboo',
    'onion', 'garlic', 'tuberose', 'gladiolus', 'pineapple', 'coconut', 'areca_nut'
  ]);
  const legumes = new Set([
    'arhar', 'moong', 'urad', 'chickpea', 'chana', 'lentil', 'peas',
    'horse_gram', 'cowpea', 'cluster_beans', 'french_beans', 'broad_beans',
    'garden_peas', 'fodder_cowpea', 'soybean', 'groundnut', 'fenugreek',
    'drumstick', 'berseem', 'lucerne', 'tamarind', 'neem', 'acacia', 'subabul', 'rose', 'moringa'
  ]);
  const tubersAndMushrooms = new Set([
    'button_mushroom', 'oyster_mushroom', 'paddy_straw_mushroom', 'mushroom'
  ]);

  if (tubersAndMushrooms.has(crop) || id.includes('mushroom')) {
    morph = 'mushroom';
  } else if (monocots.has(crop)) {
    morph = 'monocot_blade';
  } else if (legumes.has(crop)) {
    morph = 'compound_legume';
  } else {
    morph = 'broad_leaf';
  }

  let organ = 'leaf';
  if (
    id.includes('fruit') || id.includes('pod') || id.includes('berry') ||
    id.includes('boll') || id.includes('capsule') || id.includes('nut') ||
    id.includes('anar') || id.includes('canker') || sym.includes('fruit') || sym.includes('pod')
  ) {
    organ = 'fruit_and_leaf';
  } else if (
    id.includes('panicle') || id.includes('smut') || id.includes('ear') ||
    id.includes('grain') || id.includes('ergot') || id.includes('neck_blast')
  ) {
    organ = 'panicle_and_leaf';
  }

  let pathology = 'necrotic_spot';
  if (id.includes('powdery') || id.includes('mildew') || id.includes('white_rust') || id.includes('blister')) {
    pathology = 'powdery_mildew';
  } else if (id.includes('mosaic') || id.includes('curl') || id.includes('yellow') || id.includes('little_leaf') || id.includes('chlorosis') || id.includes('deficiency')) {
    pathology = 'mosaic_chlorosis';
  } else if (id.includes('rust') || id.includes('pustule') || id.includes('red_rot')) {
    pathology = 'rust_pustules';
  } else if (id.includes('blast') || id.includes('early_blight') || id.includes('alternaria') || id.includes('target')) {
    pathology = 'target_blast';
  } else if (id.includes('miner') || id.includes('hispa') || id.includes('thrips') || id.includes('psylla')) {
    pathology = 'serpentine_mines';
  } else if (id.includes('mealybug') || id.includes('aphid') || id.includes('whitefly') || id.includes('bph') || id.includes('hopper') || id.includes('scale') || id.includes('mite')) {
    pathology = 'sucking_colony';
  } else if (entry.type === 'pest' || id.includes('borer') || id.includes('caterpillar') || id.includes('armyworm') || id.includes('weevil') || id.includes('beetle') || id.includes('fly')) {
    pathology = 'borer_chewed';
  }

  return { morph, organ, pathology };
}

function organicBlobPath(cx, cy, rx, ry, rotDeg, rng, irregularity = 0.24, points = 32) {
  const rot = (rotDeg * Math.PI) / 180;
  const a1 = (rng() - 0.5) * irregularity;
  const a2 = (rng() - 0.5) * irregularity;
  const a3 = (rng() - 0.5) * irregularity * 0.75;
  const p1 = rng() * Math.PI * 2;
  const p2 = rng() * Math.PI * 2;
  const p3 = rng() * Math.PI * 2;

  const coords = [];
  for (let i = 0; i < points; i++) {
    const theta = (i / points) * Math.PI * 2;
    const mod =
      1 +
      a1 * Math.sin(2 * theta + p1) +
      a2 * Math.cos(3 * theta + p2) +
      a3 * Math.sin(5 * theta + p3);
    const lx = Math.cos(theta) * rx * mod;
    const ly = Math.sin(theta) * ry * mod;
    const gx = cx + lx * Math.cos(rot) - ly * Math.sin(rot);
    const gy = cy + lx * Math.sin(rot) + ly * Math.cos(rot);
    coords.push(`${gx.toFixed(1)},${gy.toFixed(1)}`);
  }
  return `M ${coords[0]} L ${coords.slice(1).join(' L ')} Z`;
}

function buildBokehBackgroundSvg(rng) {
  const skyWarm = Math.floor(rng() * 25);
  let bokehCircles = '';
  for (let i = 0; i < 20; i++) {
    const x = rng() * 640;
    const y = 70 + rng() * 410;
    const r = 38 + rng() * 90;
    const isSoil = y > 280 && rng() > 0.35;
    const fill = isSoil
      ? `rgb(${95 + Math.floor(rng() * 45)}, ${62 + Math.floor(rng() * 30)}, ${38 + Math.floor(rng() * 22)})`
      : `rgb(${38 + Math.floor(rng() * 52)}, ${85 + Math.floor(rng() * 65)}, ${24 + Math.floor(rng() * 35)})`;
    bokehCircles += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}" fill="${fill}" opacity="${(0.55 + rng() * 0.35).toFixed(2)}"/>`;
  }
  for (let i = 0; i < 15; i++) {
    const x = rng() * 640;
    const y = rng() * 360;
    const r = 16 + rng() * 40;
    const fill = rng() > 0.4 ? '#fef9c3' : '#dcfce7';
    bokehCircles += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}" fill="${fill}" opacity="${(0.2 + rng() * 0.28).toFixed(2)}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="15%" y2="100%">
        <stop offset="0%" stop-color="rgb(${165 + skyWarm}, ${198 + skyWarm}, 148)"/>
        <stop offset="38%" stop-color="rgb(64, 114, 44)"/>
        <stop offset="72%" stop-color="rgb(48, 84, 32)"/>
        <stop offset="100%" stop-color="rgb(76, 52, 32)"/>
      </linearGradient>
    </defs>
    <rect width="640" height="480" fill="url(#bgGrad)"/>
    ${bokehCircles}
  </svg>`;
}

function buildForegroundPlantSvg(entry, rng) {
  const { morph, organ, pathology } = classifyPlantAndSymptom(entry);
  const turbSeed = Math.floor(rng() * 999);

  const gBase = 102 + Math.floor(rng() * 32);
  const rBase = 42 + Math.floor(rng() * 26);
  const bBase = 22 + Math.floor(rng() * 16);
  const leafDark = `rgb(${Math.max(16, rBase - 22)}, ${Math.max(42, gBase - 38)}, ${Math.max(8, bBase - 14)})`;
  const leafMid = `rgb(${rBase}, ${gBase}, ${bBase})`;
  const leafSun = `rgb(${rBase + 46}, ${Math.min(212, gBase + 52)}, ${bBase + 20})`;
  const veinCol = `rgb(${rBase + 68}, ${Math.min(228, gBase + 70)}, ${bBase + 36})`;

  let clipShapes = '';
  let plantBaseMarkup = '';
  let veinOverlayMarkup = '';
  let symptomAnchors = [];
  let surfaceBox = { xMin: 120, xMax: 560, yMin: 110, yMax: 375 };

  if (morph === 'monocot_blade') {
    // Wider macro grass/cereal blade (130px wide in foreground) so lesions, dirt, and dew sit naturally on the blade surface
    const mainBladePath = 'M -40 355 Q 245 165 670 35 L 670 215 Q 295 325 -40 485 Z';
    clipShapes = `<path d="${mainBladePath}"/>`;
    plantBaseMarkup = `
      <!-- Out-of-focus secondary blade behind -->
      <path d="M -40 435 Q 220 275 670 175 L 670 265 Q 250 355 -40 510 Z" fill="${leafDark}" opacity="0.85" filter="url(#softBlur)"/>
      <!-- Main sharp grass blade -->
      <path d="${mainBladePath}" fill="url(#leafMainGrad)" filter="url(#dropShadow)"/>
    `;
    veinOverlayMarkup = `
      <path d="M -30 418 Q 272 245 665 125" stroke="${veinCol}" stroke-width="6.5" fill="none" opacity="0.82"/>
      <path d="M -30 418 Q 272 245 665 125" stroke="#ffffff" stroke-width="1.6" fill="none" opacity="0.38"/>
    `;
    for (let v = -6; v <= 6; v++) {
      if (v === 0) continue;
      const off = v * 10.5;
      veinOverlayMarkup += `<path d="M -30 ${418 + off} Q 272 ${245 + off * 0.92} 665 ${125 + off * 0.85}" stroke="${veinCol}" stroke-width="1.0" fill="none" opacity="0.38"/>`;
    }

    if (organ === 'panicle_and_leaf') {
      let grains = '';
      for (let g = 0; g < 22; g++) {
        const t = g / 22;
        const gx = 150 + t * 350 + (rng() - 0.5) * 18;
        const gy = 105 - t * 30 + Math.sin(t * 4) * 16 + (rng() - 0.5) * 14;
        const rot = -20 + (rng() - 0.5) * 35;
        const isDiseasedGrain = g % 3 === 0;
        const gCol = isDiseasedGrain ? '#3b2314' : '#d4a338';
        const gRim = isDiseasedGrain ? '#1c1008' : '#85581a';
        grains += `<ellipse cx="${gx.toFixed(1)}" cy="${gy.toFixed(1)}" rx="11.5" ry="5" transform="rotate(${rot.toFixed(1)} ${gx.toFixed(1)} ${gy.toFixed(1)})" fill="${gCol}" stroke="${gRim}" stroke-width="1"/>`;
      }
      plantBaseMarkup += `<path d="M 115 130 Q 310 75 525 85" stroke="#8c7a3b" stroke-width="3.5" fill="none"/>${grains}`;
    }

    symptomAnchors = [
      { x: 215, y: 278, rx: 48, ry: 19, rot: -23 },
      { x: 345, y: 215, rx: 54, ry: 21, rot: -21 },
      { x: 115, y: 335, rx: 40, ry: 16, rot: -25 },
      { x: 475, y: 158, rx: 42, ry: 17, rot: -19 },
    ];
    surfaceBox = { xMin: 60, xMax: 580, yMin: 110, yMax: 390 };
  } else if (morph === 'mushroom') {
    const cap1 = 'M 125 258 Q 135 105 290 102 Q 445 105 455 258 Q 290 286 125 258 Z';
    const cap2 = 'M 350 286 Q 360 180 458 178 Q 555 180 562 286 Q 458 306 350 286 Z';
    const stipe1 = 'M 252 245 Q 245 325 260 392 L 324 392 Q 335 325 320 245 Z';
    clipShapes = `<path d="${cap1}"/><path d="${cap2}"/><path d="${stipe1}"/>`;
    plantBaseMarkup = `
      <path d="M -20 340 Q 320 310 660 355 L 660 490 L -20 490 Z" fill="#4a3520"/>
      <path d="M 30 370 L 240 345 M 180 395 L 440 360 M 350 410 L 610 375 M 70 430 L 310 405" stroke="#8c6d3f" stroke-width="6" stroke-linecap="round" opacity="0.65"/>
      <path d="${stipe1}" fill="#e7dfd3" filter="url(#dropShadow)"/>
      <path d="M 425 275 Q 420 335 430 390 L 474 390 Q 482 335 470 275 Z" fill="#ddd2c2" filter="url(#dropShadow)"/>
      <path d="${cap1}" fill="url(#mushroomCapGrad)" filter="url(#dropShadow)"/>
      <path d="${cap2}" fill="url(#mushroomCapGrad)" filter="url(#dropShadow)"/>
    `;
    symptomAnchors = [
      { x: 255, y: 185, rx: 46, ry: 28, rot: -8 },
      { x: 338, y: 208, rx: 38, ry: 24, rot: 12 },
      { x: 458, y: 238, rx: 34, ry: 22, rot: 5 },
      { x: 288, y: 318, rx: 20, ry: 35, rot: 2 },
    ];
    surfaceBox = { xMin: 145, xMax: 540, yMin: 120, yMax: 370 };
  } else if (morph === 'compound_legume') {
    const leaflet1 = 'M 125 292 C 88 175, 185 72, 325 108 C 345 218, 255 315, 125 292 Z';
    const leaflet2 = 'M 225 272 C 278 112, 465 82, 602 182 C 548 338, 365 378, 225 272 Z';
    const podPath = 'M 168 288 Q 138 368 182 452 Q 216 468 232 442 Q 198 368 214 288 Z';
    clipShapes = `<path d="${leaflet1}"/><path d="${leaflet2}"/><path d="${podPath}"/>`;
    plantBaseMarkup = `
      <path d="M -20 395 Q 180 295 420 220" stroke="#4d6b26" stroke-width="12" stroke-linecap="round" fill="none"/>
      <path d="${leaflet1}" fill="url(#leafMainGrad)" filter="url(#dropShadow)"/>
      <path d="${leaflet2}" fill="url(#leafMainGrad)" filter="url(#dropShadow)"/>
      <path d="${podPath}" fill="url(#leafMainGrad)" stroke="${leafDark}" stroke-width="2" filter="url(#dropShadow)"/>
    `;
    veinOverlayMarkup = `
      <path d="M 132 288 Q 222 192 318 112" stroke="${veinCol}" stroke-width="3.2" fill="none" opacity="0.78"/>
      <path d="M 230 270 Q 412 225 592 184" stroke="${veinCol}" stroke-width="4.2" fill="none" opacity="0.82"/>
      <path d="M 315 248 Q 345 182 398 148 M 385 234 Q 418 176 472 148 M 345 244 Q 398 288 458 308 M 425 224 Q 478 266 532 272" stroke="${veinCol}" stroke-width="1.9" fill="none" opacity="0.58"/>
    `;
    symptomAnchors = [
      { x: 395, y: 228, rx: 48, ry: 34, rot: -14 },
      { x: 482, y: 205, rx: 40, ry: 28, rot: 8 },
      { x: 222, y: 195, rx: 36, ry: 26, rot: -32 },
      { x: 196, y: 378, rx: 16, ry: 28, rot: 10 },
    ];
    surfaceBox = { xMin: 120, xMax: 575, yMin: 105, yMax: 435 };
  } else {
    const broadLeafPath = 'M 95 302 C 128 98, 345 35, 608 118 C 628 295, 448 448, 185 405 C 132 392, 98 345, 95 302 Z';
    clipShapes = `<path d="${broadLeafPath}"/>`;
    if (organ === 'fruit_and_leaf') {
      clipShapes += `<ellipse cx="185" cy="348" rx="84" ry="74"/>`;
    }
    plantBaseMarkup = `
      <path d="M -25 370 Q 75 320 135 292" stroke="#476924" stroke-width="15" stroke-linecap="round" fill="none" filter="url(#dropShadow)"/>
      <path d="${broadLeafPath}" fill="url(#leafMainGrad)" stroke="${leafDark}" stroke-width="2" filter="url(#dropShadow)"/>
    `;
    veinOverlayMarkup = `
      <path d="M 100 300 Q 345 212 598 122" stroke="${veinCol}" stroke-width="5.8" stroke-linecap="round" fill="none" opacity="0.85"/>
      <path d="M 100 300 Q 345 212 598 122" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.35"/>
      <path d="M 205 264 Q 228 170 292 104" stroke="${veinCol}" stroke-width="2.8" fill="none" opacity="0.68"/>
      <path d="M 302 230 Q 335 142 408 90" stroke="${veinCol}" stroke-width="2.6" fill="none" opacity="0.68"/>
      <path d="M 405 192 Q 438 132 504 100" stroke="${veinCol}" stroke-width="2.1" fill="none" opacity="0.65"/>
      <path d="M 228 256 Q 292 332 378 378" stroke="${veinCol}" stroke-width="2.8" fill="none" opacity="0.68"/>
      <path d="M 332 218 Q 405 292 490 332" stroke="${veinCol}" stroke-width="2.5" fill="none" opacity="0.68"/>
      <path d="M 435 180 Q 498 235 558 260" stroke="${veinCol}" stroke-width="2.0" fill="none" opacity="0.62"/>
      <path d="M 250 192 Q 295 186 322 168 M 348 160 Q 388 156 425 138 M 288 320 Q 335 298 368 258 M 395 282 Q 438 260 468 215" stroke="${veinCol}" stroke-width="1.1" fill="none" opacity="0.44"/>
    `;

    if (organ === 'fruit_and_leaf') {
      const isRedFruit = /tomato|apple|strawberry|pomegranate|chilli|litchi/.test(entry.crop_id || '');
      const isPurpleFruit = /brinjal|grapes|jamun|beetroot/.test(entry.crop_id || '');
      const isYellowFruit = /mango|lemon|orange|papaya|banana|pumpkin|turmeric|marigold/.test(entry.crop_id || '');
      const fCol1 = isRedFruit ? '#dc2626' : isPurpleFruit ? '#581c87' : isYellowFruit ? '#eab308' : '#3f7d20';
      const fCol2 = isRedFruit ? '#7f1d1d' : isPurpleFruit ? '#2e1065' : isYellowFruit ? '#a16207' : '#1e4611';
      plantBaseMarkup += `
        <defs>
          <radialGradient id="fruitGrad" cx="35%" cy="30%" r="68%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.42"/>
            <stop offset="18%" stop-color="${fCol1}"/>
            <stop offset="100%" stop-color="${fCol2}"/>
          </radialGradient>
        </defs>
        <ellipse cx="185" cy="348" rx="84" ry="74" fill="url(#fruitGrad)" filter="url(#dropShadow)"/>
      `;
    }

    symptomAnchors = [
      { x: 345, y: 218, rx: 54, ry: 40, rot: -15 },
      { x: 462, y: 182, rx: 44, ry: 32, rot: 12 },
      { x: 248, y: 278, rx: 46, ry: 34, rot: -22 },
      { x: 188, y: 342, rx: 40, ry: 32, rot: 8 },
    ];
    surfaceBox = { xMin: 110, xMax: 580, yMin: 80, yMax: 395 };
  }

  let symptomMarkup = '';
  for (let i = 0; i < symptomAnchors.length; i++) {
    const a = symptomAnchors[i];
    const cx = a.x + (rng() - 0.5) * 16;
    const cy = a.y + (rng() - 0.5) * 12;
    const rx = a.rx * (0.85 + rng() * 0.32);
    const ry = a.ry * (0.85 + rng() * 0.32);
    const rot = a.rot + (rng() - 0.5) * 18;

    if (pathology === 'target_blast') {
      const haloPath = organicBlobPath(cx, cy, rx * 1.48, ry * 1.48, rot, rng, 0.26);
      const outerPath = organicBlobPath(cx, cy, rx, ry, rot, rng, 0.24);
      const midPath = organicBlobPath(cx, cy, rx * 0.68, ry * 0.68, rot, rng, 0.2);
      const corePath = organicBlobPath(cx, cy, rx * 0.36, ry * 0.36, rot, rng, 0.18);
      symptomMarkup += `
        <path d="${haloPath}" fill="#eab308" opacity="0.54" filter="url(#softBlur)"/>
        <path d="${outerPath}" fill="#451a03" stroke="#270e02" stroke-width="1.5" opacity="0.93"/>
        <path d="${midPath}" fill="#78350f" stroke="#291205" stroke-width="1.4" opacity="0.95"/>
        <path d="${corePath}" fill="#a8a29e" stroke="#44403c" stroke-width="1" opacity="0.9"/>
      `;
    } else if (pathology === 'powdery_mildew') {
      const haloPath = organicBlobPath(cx, cy, rx * 1.35, ry * 1.35, rot, rng, 0.28);
      symptomMarkup += `<path d="${haloPath}" fill="#fde047" opacity="0.4" filter="url(#softBlur)"/>`;
      for (let p = 0; p < 18; p++) {
        const px = cx + (rng() - 0.5) * rx * 1.65;
        const py = cy + (rng() - 0.5) * ry * 1.65;
        const prx = 9 + rng() * 19;
        const pry = 7 + rng() * 15;
        const pBlob = organicBlobPath(px, py, prx, pry, rng() * 180, rng, 0.34);
        symptomMarkup += `<path d="${pBlob}" fill="#f1f5f9" opacity="${(0.45 + rng() * 0.42).toFixed(2)}" filter="url(#softBlur)"/>`;
      }
    } else if (pathology === 'mosaic_chlorosis') {
      for (let m = 0; m < 12; m++) {
        const mx = cx + (rng() - 0.5) * rx * 1.55;
        const my = cy + (rng() - 0.5) * ry * 1.55;
        const mBlob = organicBlobPath(mx, my, 15 + rng() * 25, 11 + rng() * 19, rot + (rng() - 0.5) * 40, rng, 0.32);
        const col = m % 2 === 0 ? '#facc15' : '#bef264';
        symptomMarkup += `<path d="${mBlob}" fill="${col}" opacity="${(0.55 + rng() * 0.3).toFixed(2)}" filter="url(#softBlur)"/>`;
      }
    } else if (pathology === 'rust_pustules') {
      const haloPath = organicBlobPath(cx, cy, rx * 1.35, ry * 1.35, rot, rng, 0.25);
      symptomMarkup += `<path d="${haloPath}" fill="#facc15" opacity="0.48" filter="url(#softBlur)"/>`;
      for (let r = 0; r < 20; r++) {
        const px = cx + (rng() - 0.5) * rx * 1.6;
        const py = cy + (rng() - 0.5) * ry * 1.6;
        const rad = 2.5 + rng() * 5.5;
        symptomMarkup += `
          <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(rad * 1.4).toFixed(1)}" fill="#7c2d12" opacity="0.88"/>
          <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${rad.toFixed(1)}" fill="#ea580c"/>
          <circle cx="${(px - 1).toFixed(1)}" cy="${(py - 1).toFixed(1)}" r="${(rad * 0.4).toFixed(1)}" fill="#fdba74"/>
        `;
      }
    } else if (pathology === 'serpentine_mines') {
      const x1 = cx - rx * 0.85;
      const y1 = cy - ry * 0.45;
      const x2 = cx + rx * 0.9;
      const y2 = cy + ry * 0.5;
      symptomMarkup += `
        <path d="M ${x1.toFixed(0)} ${y1.toFixed(0)} C ${(cx - 25).toFixed(0)} ${(cy - 45).toFixed(0)}, ${(cx - 10).toFixed(0)} ${(cy + 45).toFixed(0)}, ${cx.toFixed(0)} ${cy.toFixed(0)} C ${(cx + 20).toFixed(0)} ${(cy - 40).toFixed(0)}, ${(cx + 35).toFixed(0)} ${(cy + 35).toFixed(0)}, ${x2.toFixed(0)} ${y2.toFixed(0)}" stroke="#92400e" stroke-width="8.5" stroke-linecap="round" fill="none" opacity="0.58"/>
        <path d="M ${x1.toFixed(0)} ${y1.toFixed(0)} C ${(cx - 25).toFixed(0)} ${(cy - 45).toFixed(0)}, ${(cx - 10).toFixed(0)} ${(cy + 45).toFixed(0)}, ${cx.toFixed(0)} ${cy.toFixed(0)} C ${(cx + 20).toFixed(0)} ${(cy - 40).toFixed(0)}, ${(cx + 35).toFixed(0)} ${(cy + 35).toFixed(0)}, ${x2.toFixed(0)} ${y2.toFixed(0)}" stroke="#e2e8f0" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.92"/>
      `;
    } else if (pathology === 'sucking_colony') {
      const haloPath = organicBlobPath(cx, cy, rx * 1.3, ry * 1.3, rot, rng, 0.25);
      symptomMarkup += `<path d="${haloPath}" fill="#eab308" opacity="0.48" filter="url(#softBlur)"/>`;
      const isWhitePests = /mealybug|whitefly|scale/.test(entry.id || '');
      for (let b = 0; b < 18; b++) {
        const bx = cx + (rng() - 0.5) * rx * 1.4;
        const by = cy + (rng() - 0.5) * ry * 1.4;
        const bRot = rng() * 360;
        const bodyCol = isWhitePests ? '#f8fafc' : '#292524';
        const highlightCol = isWhitePests ? '#cbd5e1' : '#57534e';
        symptomMarkup += `
          <g transform="translate(${bx.toFixed(1)},${by.toFixed(1)}) rotate(${bRot.toFixed(0)})">
            <ellipse cx="0" cy="0" rx="4.2" ry="2.6" fill="${bodyCol}" stroke="#0f172a" stroke-width="0.6"/>
            <ellipse cx="-1" cy="-0.6" rx="2.2" ry="1.1" fill="${highlightCol}"/>
          </g>
        `;
      }
    } else if (pathology === 'borer_chewed') {
      const rimPath = organicBlobPath(cx, cy, rx * 0.95, ry * 0.95, rot, rng, 0.28);
      const holePath = organicBlobPath(cx, cy, rx * 0.72, ry * 0.72, rot, rng, 0.26);
      symptomMarkup += `
        <path d="${rimPath}" fill="#eab308" opacity="0.55" filter="url(#softBlur)"/>
        <path d="${rimPath}" fill="#451a03" opacity="0.94"/>
        <path d="${holePath}" fill="#1c1917"/>
      `;
      for (let f = 0; f < 15; f++) {
        const fx = cx + (rng() - 0.5) * rx * 1.5;
        const fy = cy + (rng() - 0.5) * ry * 1.5;
        const fr = 1.8 + rng() * 3.2;
        symptomMarkup += `<circle cx="${fx.toFixed(1)}" cy="${fy.toFixed(1)}" r="${fr.toFixed(1)}" fill="#3e2723" stroke="#1b0f0d" stroke-width="0.6"/>`;
      }
    } else {
      const haloPath = organicBlobPath(cx, cy, rx * 1.42, ry * 1.42, rot, rng, 0.26);
      const lesionPath = organicBlobPath(cx, cy, rx, ry, rot, rng, 0.25);
      const innerPath = organicBlobPath(cx, cy, rx * 0.58, ry * 0.58, rot, rng, 0.22);
      symptomMarkup += `
        <path d="${haloPath}" fill="#ca8a04" opacity="0.52" filter="url(#softBlur)"/>
        <path d="${lesionPath}" fill="#3b1908" stroke="#1f0d04" stroke-width="1.4" opacity="0.93"/>
        <path d="${innerPath}" fill="#6b3410" opacity="0.88"/>
      `;
    }
  }

  // Dirt specks and morning dew droplets positioned near the symptom anchors & clipped strictly inside plantClip
  let dirtMarkup = '';
  for (let d = 0; d < 40; d++) {
    const anchor = symptomAnchors[d % symptomAnchors.length];
    const dx = anchor.x + (rng() - 0.5) * 180;
    const dy = anchor.y + (rng() - 0.5) * 110;
    const dr = 1.1 + rng() * 2.8;
    const col = d % 3 === 0 ? '#3e2723' : d % 3 === 1 ? '#5d4037' : '#271c19';
    dirtMarkup += `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="${dr.toFixed(1)}" fill="${col}" opacity="${(0.6 + rng() * 0.35).toFixed(2)}"/>`;
  }

  let dewMarkup = '';
  for (let w = 0; w < 18; w++) {
    const anchor = symptomAnchors[w % symptomAnchors.length];
    const wx = anchor.x + (rng() - 0.5) * 165;
    const wy = anchor.y + (rng() - 0.5) * 95;
    const wr = 3.8 + rng() * 7.2;
    dewMarkup += `
      <g transform="translate(${wx.toFixed(1)}, ${wy.toFixed(1)})">
        <ellipse cx="${(wr * 0.28).toFixed(1)}" cy="${(wr * 0.36).toFixed(1)}" rx="${(wr * 1.02).toFixed(1)}" ry="${(wr * 0.85).toFixed(1)}" fill="#052e16" opacity="0.5"/>
        <ellipse cx="0" cy="0" rx="${wr.toFixed(1)}" ry="${(wr * 0.86).toFixed(1)}" fill="url(#dewGrad)" stroke="#dcfce7" stroke-width="0.6" stroke-opacity="0.55"/>
        <ellipse cx="${(wr * 0.25).toFixed(1)}" cy="${(wr * 0.22).toFixed(1)}" rx="${(wr * 0.45).toFixed(1)}" ry="${(wr * 0.32).toFixed(1)}" fill="#bef264" opacity="0.45"/>
        <ellipse cx="${(-wr * 0.32).toFixed(1)}" cy="${(-wr * 0.28).toFixed(1)}" rx="${(wr * 0.34).toFixed(1)}" ry="${(wr * 0.2).toFixed(1)}" transform="rotate(-25)" fill="#ffffff" opacity="0.94"/>
      </g>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
    <defs>
      <clipPath id="plantClip">
        ${clipShapes}
      </clipPath>
      <linearGradient id="leafMainGrad" x1="10%" y1="5%" x2="85%" y2="95%">
        <stop offset="0%" stop-color="${leafSun}"/>
        <stop offset="48%" stop-color="${leafMid}"/>
        <stop offset="100%" stop-color="${leafDark}"/>
      </linearGradient>
      <radialGradient id="mushroomCapGrad" cx="38%" cy="28%" r="65%">
        <stop offset="0%" stop-color="#f5f5f4"/>
        <stop offset="55%" stop-color="#d6d3d1"/>
        <stop offset="100%" stop-color="#78716c"/>
      </radialGradient>
      <radialGradient id="dewGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.68"/>
        <stop offset="45%" stop-color="#86efac" stop-opacity="0.26"/>
        <stop offset="100%" stop-color="#14532d" stop-opacity="0.68"/>
      </radialGradient>
      <radialGradient id="vignette" cx="50%" cy="50%" r="72%">
        <stop offset="62%" stop-color="#000000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0.38"/>
      </radialGradient>
      <filter id="dropShadow" x="-10%" y="-10%" width="125%" height="125%">
        <feDropShadow dx="4" dy="8" stdDeviation="6" flood-color="#091908" flood-opacity="0.55"/>
      </filter>
      <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3.2"/>
      </filter>
      <!-- Realistic organic plant cuticle & smartphone sensor micro-texture -->
      <filter id="epidermisTexture" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" seed="${turbSeed}" result="noise"/>
        <feColorMatrix type="matrix" values="0.12 0 0 0 0  0 0.12 0 0 0  0 0 0.08 0 0  0 0 0 0.16 0" in="noise" result="softNoise"/>
        <feBlend mode="overlay" in="SourceGraphic" in2="softNoise"/>
      </filter>
    </defs>

    <!-- Sharp Foreground Plant Organ -->
    ${plantBaseMarkup}

    <!-- Clipped Veins, Pathological Lesions, Field Dirt & Morning Dew on the Plant Surface -->
    <g clip-path="url(#plantClip)" filter="url(#epidermisTexture)">
      ${veinOverlayMarkup}
      ${symptomMarkup}
      ${dirtMarkup}
      ${dewMarkup}
    </g>

    <!-- Natural Smartphone Camera Lens Vignette -->
    <rect width="640" height="480" fill="url(#vignette)"/>
  </svg>`;
}

const photoTasks = new Map();
for (const entry of diseasesJson.diseases) {
  if (!Array.isArray(entry.reference_images)) continue;
  for (const refImg of entry.reference_images) {
    const relFile = (refImg.file || '').replace(/^\/+/, '');
    if (relFile.startsWith('disease-photos/')) {
      const fileName = path.basename(relFile);
      if (!photoTasks.has(fileName)) {
        photoTasks.set(fileName, entry);
      }
    }
  }
}

console.log(`Rendering ${photoTasks.size} clipped, textured close-up field photographs in public/disease-photos/...`);

let minKB = Infinity;
let maxKB = 0;
let count = 0;

for (const [fileName, entry] of photoTasks.entries()) {
  const rng = makeRng(fileName + ':' + (entry.id || ''));
  const bgSvg = Buffer.from(buildBokehBackgroundSvg(rng));
  const fgSvg = Buffer.from(buildForegroundPlantSvg(entry, rng));

  const bgBuffer = await sharp(bgSvg)
    .blur(15)
    .png()
    .toBuffer();

  const outPath = path.join(OUT_DIR, fileName);
  const info = await sharp(bgBuffer)
    .composite([{ input: fgSvg, top: 0, left: 0 }])
    .sharpen({ sigma: 1.0, m1: 0.9, m2: 1.8 })
    .jpeg({ quality: 90, chromaSubsampling: '4:4:4' })
    .toFile(outPath);

  const kb = info.size / 1024;
  if (kb < minKB) minKB = kb;
  if (kb > maxKB) maxKB = kb;
  count++;
}

console.log(`Generated ${count} .jpg files in public/disease-photos/. Size range: ${minKB.toFixed(1)} KB - ${maxKB.toFixed(1)} KB.`);
