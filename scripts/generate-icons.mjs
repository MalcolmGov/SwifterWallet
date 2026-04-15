/**
 * generate-icons.mjs
 * Converts icon.svg and og-image.svg into all required PNG/ICO assets.
 * Run with: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const iconSvg = readFileSync(resolve(root, 'public/icons/icon.svg'));
const ogSvg   = readFileSync(resolve(root, 'public/og-image.svg'));

async function makePng(svgBuffer, outputPath, width, height) {
  await sharp(svgBuffer)
    .resize(width, height)
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
  console.log(`  ✓ ${outputPath.replace(root, '.')} (${width}×${height})`);
}

/**
 * For maskable icons we add extra safe-zone padding (20% each side)
 * so the glyph fits well inside any mask shape.
 * We render a larger canvas and composite the icon centred on a navy bg.
 */
async function makeMaskable(svgBuffer, outputPath, size) {
  // Icon drawn at 60% of the canvas, padded to 20% on each side
  const innerSize = Math.round(size * 0.6);
  const pad = Math.round((size - innerSize) / 2);

  const innerPng = await sharp(svgBuffer)
    .resize(innerSize, innerSize)
    .png()
    .toBuffer();

  // Navy background matching icon background
  const bg = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 13, g: 27, b: 62, alpha: 1 },
    },
  })
    .composite([{ input: innerPng, left: pad, top: pad }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log(`  ✓ ${outputPath.replace(root, '.')} (${size}×${size} maskable)`);
}

/**
 * Build a minimal valid ICO file containing 16×16 and 32×32 PNGs.
 * ICO format: header + directory entries + image data.
 */
async function makeIco(svgBuffer, outputPath) {
  const sizes = [16, 32];
  const pngs = await Promise.all(
    sizes.map(s =>
      sharp(svgBuffer).resize(s, s).png().toBuffer()
    )
  );

  // ICO header: 3 × uint16LE  (reserved=0, type=1, count=N)
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);      // reserved
  header.writeUInt16LE(1, 2);      // type: 1 = ICO
  header.writeUInt16LE(sizes.length, 4);

  const dirEntrySize = 16;
  const dataOffset = 6 + dirEntrySize * sizes.length;

  const dirEntries = [];
  let offset = dataOffset;
  for (let i = 0; i < sizes.length; i++) {
    const s = sizes[i];
    const data = pngs[i];
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(s === 256 ? 0 : s, 0);   // width  (0 = 256)
    entry.writeUInt8(s === 256 ? 0 : s, 1);   // height (0 = 256)
    entry.writeUInt8(0, 2);                    // colour count (0 = >256)
    entry.writeUInt8(0, 3);                    // reserved
    entry.writeUInt16LE(1, 4);                 // colour planes
    entry.writeUInt16LE(32, 6);               // bits per pixel
    entry.writeUInt32LE(data.length, 8);       // size of image data
    entry.writeUInt32LE(offset, 12);           // offset of image data
    dirEntries.push(entry);
    offset += data.length;
  }

  const ico = Buffer.concat([header, ...dirEntries, ...pngs]);
  writeFileSync(outputPath, ico);
  console.log(`  ✓ ${outputPath.replace(root, '.')} (16×16 + 32×32 ICO)`);
}

console.log('\nGenerating SwifterWallet icons…\n');

await Promise.all([
  // Standard PNG icons
  makePng(iconSvg, resolve(root, 'public/icons/favicon-16x16.png'),   16,   16),
  makePng(iconSvg, resolve(root, 'public/icons/favicon-32x32.png'),   32,   32),
  makePng(iconSvg, resolve(root, 'public/icons/apple-touch-icon.png'), 180, 180),
  makePng(iconSvg, resolve(root, 'public/icons/icon-192x192.png'),    192,  192),
  makePng(iconSvg, resolve(root, 'public/icons/icon-512x512.png'),    512,  512),

  // Maskable icons (safe-zone padded)
  makeMaskable(iconSvg, resolve(root, 'public/icons/icon-maskable-192x192.png'), 192),
  makeMaskable(iconSvg, resolve(root, 'public/icons/icon-maskable-512x512.png'), 512),

  // OG image
  makePng(ogSvg, resolve(root, 'public/og-image.png'), 1200, 630),
]);

// ICO must run after we confirm sharp works (sequential is fine)
await makeIco(iconSvg, resolve(root, 'public/favicon.ico'));

// Also copy favicon-32x32 to src/app/favicon.ico (Next.js auto-serves it)
const fav32 = await sharp(iconSvg).resize(32, 32).png().toBuffer();
const fav16 = await sharp(iconSvg).resize(16, 16).png().toBuffer();
// Rebuild ICO for src/app/favicon.ico
await makeIco(iconSvg, resolve(root, 'src/app/favicon.ico'));

console.log('\nAll icons generated successfully.\n');
