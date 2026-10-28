import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function main() {
  const publicDir = path.resolve(process.cwd(), 'public');
  const sourceImage = path.join(publicDir, 'assets', 'aistudio', 'IMG-20261027-WA0019_c19846df.jpg');

  if (!fs.existsSync(sourceImage)) {
    console.error('Source image not found:', sourceImage);
    process.exit(1);
  }

  // 1. Extract the full emblem & text with padding from the 1080x720 source image
  // Width 840 from left 120 ensures 'Krushak Bani' text has full breathing room
  const croppedSourceBuffer = await sharp(sourceImage)
    .extract({ left: 110, top: 0, width: 860, height: 720 })
    .resize(370, 370, { fit: 'contain', background: { r: 254, g: 253, b: 247, alpha: 1 } })
    .toBuffer();

  // 2. Create an SVG overlay that provides the golden squircle frame & golden border
  const goldenFrameSvg = `
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Golden Metallic Gradient for Frame -->
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="30%" stop-color="#facc15" />
        <stop offset="70%" stop-color="#eab308" />
        <stop offset="100%" stop-color="#ca8a04" />
      </linearGradient>

      <!-- Inner Cream Background Fill -->
      <radialGradient id="creamGrad" cx="50%" cy="50%" r="65%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="80%" stop-color="#fefde8" />
        <stop offset="100%" stop-color="#fef9c3" />
      </radialGradient>

      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.3" />
      </filter>
    </defs>

    <!-- Base Cream Squircle -->
    <rect x="8" y="8" width="496" height="496" rx="100" ry="100" fill="url(#creamGrad)" stroke="url(#goldGrad)" stroke-width="16" filter="url(#shadow)" />

    <!-- Inner Golden Stitch Ring -->
    <rect x="22" y="22" width="468" height="468" rx="88" ry="88" fill="none" stroke="#eab308" stroke-width="3" stroke-dasharray="8 8" opacity="0.8" />
  </svg>
  `;

  // Composite the cropped emblem inside the golden squircle frame at top: 71, left: 71
  const compositeBuffer = await sharp(Buffer.from(goldenFrameSvg))
    .composite([
      {
        input: croppedSourceBuffer,
        top: 71,
        left: 71,
      },
    ])
    .png({ quality: 100 })
    .toBuffer();

  // Save 512x512 PNG
  await sharp(compositeBuffer)
    .resize(512, 512)
    .toFile(path.join(publicDir, 'pwa-512x512.png'));

  // Save 192x192 PNG
  await sharp(compositeBuffer)
    .resize(192, 192)
    .toFile(path.join(publicDir, 'pwa-192x192.png'));

  // Save 512x512 Maskable PNG
  await sharp(compositeBuffer)
    .resize(512, 512)
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Save Apple Touch Icon (180x180)
  await sharp(compositeBuffer)
    .resize(180, 180)
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Save Favicon 32x32
  await sharp(compositeBuffer)
    .resize(32, 32)
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  // Save Favicon ico
  await sharp(compositeBuffer)
    .resize(48, 48)
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('New style logo with golden border generated successfully!');
}

main().catch((err) => {
  console.error('Error generating new style logo:', err);
  process.exit(1);
});
