import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  const sizes = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
  ];

  for (const item of sizes) {
    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(path.join('public', item.name));
    console.log(`Generated public/${item.name}`);
  }

  // Generate maskable icon with safe zone (15% padding)
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 20, g: 83, b: 45, alpha: 1 } // #14532d
    }
  })
  .composite([
    {
      input: await sharp(svgBuffer).resize(410, 410).png().toBuffer(),
      gravity: 'center'
    }
  ])
  .png()
  .toFile(path.join('public', 'pwa-maskable-512x512.png'));
  console.log('Generated public/pwa-maskable-512x512.png');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
