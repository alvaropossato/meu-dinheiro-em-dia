import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const svgPath = path.resolve('public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  console.log('Gerando ícones PWA...');

  // 1. pwa-192x192.png
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');
  console.log('✓ public/pwa-192x192.png gerado');

  // 2. pwa-512x512.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');
  console.log('✓ public/pwa-512x512.png gerado');

  // 3. apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('✓ public/apple-touch-icon.png gerado');

  // 4. pwa-maskable-512x512.png (com margem de 15% no safe zone)
  const innerResized = await sharp(svgBuffer)
    .resize(400, 400)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 107, b: 0, alpha: 1 }, // brand orange #FF6B00
    },
  })
    .composite([
      {
        input: innerResized,
        top: 56,
        left: 56,
      },
    ])
    .png()
    .toFile('public/pwa-maskable-512x512.png');
  console.log('✓ public/pwa-maskable-512x512.png gerado');

  // 5. favicon.ico
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile('public/favicon.ico');
  console.log('✓ public/favicon.ico gerado');
}

generate().catch((err) => {
  console.error('Erro na geração de ícones:', err);
  process.exit(1);
});
