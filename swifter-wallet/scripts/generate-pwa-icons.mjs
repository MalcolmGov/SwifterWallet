// Generates PWA icons from the SVG source using sharp.
// Run: node scripts/generate-pwa-icons.mjs

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SVG = readFileSync(path.join(ROOT, 'public/icons/icon.svg'));

// Maskable icon adds extra padding so the glyph sits inside the safe zone
const MASKABLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e0b4a"/>
      <stop offset="60%" stop-color="#140d30"/>
      <stop offset="100%" stop-color="#0a0a12"/>
    </linearGradient>
    <linearGradient id="glyph" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="50%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#7c3aed"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#7c3aed" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <!-- Full bleed background (no rounded corners — the OS masks it) -->
  <rect width="512" height="512" fill="url(#bg)"/>
  <ellipse cx="256" cy="256" rx="200" ry="200" fill="url(#glow)"/>
  <!-- S scaled down ~20% to sit well inside the maskable safe zone -->
  <g transform="translate(51,51) scale(0.8)">
    <path
      d="M 315 160 C 315 160 290 140 256 140 C 207 140 172 170 172 210 C 172 248 200 268 240 278 L 272 287 C 310 297 340 318 340 360 C 340 402 305 372 256 372 C 220 372 190 355 180 340"
      stroke="url(#glyph)" stroke-width="42" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path
      d="M 197 352 C 197 352 222 372 256 372 C 305 372 340 342 340 302 C 340 264 312 244 272 234 L 240 225 C 202 215 172 194 172 152 C 172 110 207 140 256 140 C 292 140 322 157 332 172"
      stroke="url(#glyph)" stroke-width="42" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
</svg>`;

const icons = [
  { src: SVG,                         size: 192, file: 'icon-192x192.png' },
  { src: SVG,                         size: 512, file: 'icon-512x512.png' },
  { src: Buffer.from(MASKABLE_SVG),   size: 192, file: 'icon-maskable-192x192.png' },
  { src: Buffer.from(MASKABLE_SVG),   size: 512, file: 'icon-maskable-512x512.png' },
  // Apple touch icon (180×180, no rounding — iOS clips it itself)
  { src: Buffer.from(MASKABLE_SVG),   size: 180, file: 'apple-touch-icon.png' },
];

for (const { src, size, file } of icons) {
  const dest = path.join(ROOT, 'public/icons', file);
  await sharp(src).resize(size, size).png().toFile(dest);
  console.log(`✓  ${file} (${size}×${size})`);
}

console.log('\nAll PWA icons generated.');
