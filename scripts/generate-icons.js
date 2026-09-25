import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Write public/icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
    <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.1"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="112" fill="url(#bg)"/>
  <rect width="504" height="504" x="4" y="4" rx="108" fill="none" stroke="#1e293b" stroke-width="4"/>

  <!-- Radar Grid Background -->
  <circle cx="256" cy="256" r="170" fill="none" stroke="#0e7490" stroke-width="2" stroke-dasharray="6,6" opacity="0.4"/>
  <circle cx="256" cy="256" r="115" fill="none" stroke="#0e7490" stroke-width="2" stroke-dasharray="4,4" opacity="0.4"/>
  <circle cx="256" cy="256" r="60" fill="none" stroke="#0e7490" stroke-width="1.5" opacity="0.3"/>
  <line x1="256" y1="80" x2="256" y2="432" stroke="#0e7490" stroke-width="1.5" opacity="0.3"/>
  <line x1="80" y1="256" x2="432" y2="256" stroke="#0e7490" stroke-width="1.5" opacity="0.3"/>

  <!-- Shield Outline -->
  <path d="M256 96 L376 150 V260 C376 342 324 402 256 426 C188 402 136 342 136 260 V150 Z" 
        fill="#082f49" fill-opacity="0.7" stroke="url(#shieldGrad)" stroke-width="12" stroke-linejoin="round"/>

  <!-- Inner Radar Glow & Target -->
  <path d="M256 128 L350 170 V255 C350 320 308 370 256 392 C204 370 162 320 162 255 V170 Z" 
        fill="url(#radarGrad)" stroke="#22d3ee" stroke-width="4" stroke-opacity="0.5"/>

  <!-- Center Crosshairs / Core -->
  <circle cx="256" cy="256" r="32" fill="#0284c7" fill-opacity="0.3" stroke="#38bdf8" stroke-width="4"/>
  <circle cx="256" cy="256" r="14" fill="#38bdf8"/>
  <circle cx="256" cy="256" r="4" fill="#ffffff"/>

  <!-- Scan Sweep Wedge -->
  <path d="M256 256 L335 180 A110 110 0 0 1 350 256 Z" fill="#22d3ee" fill-opacity="0.3"/>
  <line x1="256" y1="256" x2="335" y2="180" stroke="#67e8f9" stroke-width="4"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');
console.log('Created public/icon.svg');

// Helper to draw a pixel on PNG
function drawPixel(png, x, y, r, g, b, a) {
  if (x < 0 || x >= png.width || y < 0 || y >= png.height) return;
  const idx = (png.width * y + x) << 2;
  const alpha = a / 255;
  const invAlpha = 1 - alpha;
  png.data[idx] = Math.round(png.data[idx] * invAlpha + r * alpha);
  png.data[idx + 1] = Math.round(png.data[idx + 1] * invAlpha + g * alpha);
  png.data[idx + 2] = Math.round(png.data[idx + 2] * invAlpha + b * alpha);
  png.data[idx + 3] = Math.min(255, Math.round(png.data[idx + 3] + a));
}

// Generate stylized PNG with shield and radar
function generateIconPNG(size, isMaskable = false) {
  const png = new PNG({ width: size, height: size });
  const center = size / 2;
  const scale = size / 512;
  // If maskable, safe zone is 80%, so scale inner content by 0.75
  const iconScale = isMaskable ? scale * 0.75 : scale * 0.92;

  // Background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      // Gradient from #020617 to #0f172a
      const t = (x + y) / (size * 2);
      const bgR = Math.round(2 + t * 13);
      const bgG = Math.round(6 + t * 17);
      const bgB = Math.round(23 + t * 19);

      if (isMaskable) {
        png.data[idx] = bgR;
        png.data[idx + 1] = bgG;
        png.data[idx + 2] = bgB;
        png.data[idx + 3] = 255;
      } else {
        // Rounded corners
        const cornerR = size * 0.22;
        let inside = true;
        if (x < cornerR && y < cornerR) {
          inside = Math.hypot(x - cornerR, y - cornerR) <= cornerR;
        } else if (x > size - cornerR && y < cornerR) {
          inside = Math.hypot(x - (size - cornerR), y - cornerR) <= cornerR;
        } else if (x < cornerR && y > size - cornerR) {
          inside = Math.hypot(x - cornerR, y - (size - cornerR)) <= cornerR;
        } else if (x > size - cornerR && y > size - cornerR) {
          inside = Math.hypot(x - (size - cornerR), y - (size - cornerR)) <= cornerR;
        }

        if (inside) {
          png.data[idx] = bgR;
          png.data[idx + 1] = bgG;
          png.data[idx + 2] = bgB;
          png.data[idx + 3] = 255;
        } else {
          png.data[idx] = 0;
          png.data[idx + 1] = 0;
          png.data[idx + 2] = 0;
          png.data[idx + 3] = 0;
        }
      }
    }
  }

  // Draw Shield
  const shieldWidth = 240 * iconScale;
  const shieldHeight = 310 * iconScale;
  const topY = center - shieldHeight * 0.48;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const relX = Math.abs(x - center);
      const relY = y - topY;

      if (relY >= 0 && relY <= shieldHeight) {
        let maxRelX = 0;
        if (relY < shieldHeight * 0.4) {
          // Top slant
          maxRelX = (shieldWidth / 2) * (0.8 + 0.2 * (relY / (shieldHeight * 0.4)));
        } else {
          // Bottom taper to point
          const t = (relY - shieldHeight * 0.4) / (shieldHeight * 0.6);
          maxRelX = (shieldWidth / 2) * Math.max(0, 1 - t * t * 0.95);
        }

        if (relX <= maxRelX) {
          // Shield border check
          const isBorder = relX >= maxRelX - (12 * iconScale) || relY <= (12 * iconScale);
          if (isBorder) {
            // Cyan-blue gradient border
            drawPixel(png, x, y, 6, 182, 212, 255);
          } else {
            // Inner shield dark blue glow
            drawPixel(png, x, y, 8, 47, 73, 180);
          }
        }
      }
    }
  }

  // Draw concentric radar rings
  const ringRadii = [30, 65, 105].map(r => r * iconScale);
  ringRadii.forEach((r) => {
    const steps = Math.round(2 * Math.PI * r * 2);
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * 2 * Math.PI;
      const rx = Math.round(center + r * Math.cos(angle));
      const ry = Math.round(center + r * Math.sin(angle));
      drawPixel(png, rx, ry, 34, 211, 238, 140);
    }
  });

  // Draw glowing center dot
  const dotR = 14 * iconScale;
  for (let dy = -dotR; dy <= dotR; dy++) {
    for (let dx = -dotR; dx <= dotR; dx++) {
      const dist = Math.hypot(dx, dy);
      if (dist <= dotR) {
        const a = Math.round(255 * (1 - dist / dotR));
        drawPixel(png, Math.round(center + dx), Math.round(center + dy), 56, 189, 248, a);
      }
    }
  }

  // White core spark
  const coreR = 4 * iconScale;
  for (let dy = -coreR; dy <= coreR; dy++) {
    for (let dx = -coreR; dx <= coreR; dx++) {
      if (Math.hypot(dx, dy) <= coreR) {
        drawPixel(png, Math.round(center + dx), Math.round(center + dy), 255, 255, 255, 255);
      }
    }
  }

  return PNG.sync.write(png);
}

// Generate required PWA sizes
const sizes = [
  { name: 'pwa-192x192.png', size: 192, maskable: false },
  { name: 'pwa-512x512.png', size: 512, maskable: false },
  { name: 'pwa-maskable-512x512.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
  { name: 'favicon.png', size: 64, maskable: false },
];

sizes.forEach(({ name, size, maskable }) => {
  const buf = generateIconPNG(size, maskable);
  fs.writeFileSync(path.join(publicDir, name), buf);
  console.log(`Generated public/${name} (${size}x${size}, maskable=${maskable})`);
});

console.log('All PWA icons generated successfully!');
