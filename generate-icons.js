// Uruchom: node generate-icons.js
// Wymaga: npm install canvas

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = path.join(__dirname, 'public', 'icons');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#0f172a');
  grad.addColorStop(0.5, '#1e3a5f');
  grad.addColorStop(1, '#1a4066');

  // Rounded rect
  const r = size * 0.18;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, r);
  ctx.fillStyle = grad;
  ctx.fill();

  // Compass emoji as text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `${size * 0.5}px serif`;
  ctx.fillText('🧭', size / 2, size / 2);

  // Text "V" below
  ctx.font = `bold ${size * 0.2}px sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText('V', size / 2, size * 0.82);

  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(outDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, buffer);
  console.log(`✅ ${filePath}`);
});

console.log('\n🎉 Wszystkie ikony wygenerowane!');
