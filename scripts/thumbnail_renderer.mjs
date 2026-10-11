import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

const OUT_DIR = path.resolve('out');

export async function renderFrontierThumbnail(slug) {
  const cleanSlug = slug.replace(/\.mp4$/i, '').replace(/_thumbnail$/i, '');
  const manifestPath = path.join(OUT_DIR, `${cleanSlug}_thumbnail_manifest.json`);

  let manifest = null;
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } else {
    // Fallback minimal manifest
    manifest = {
      topic: cleanSlug.replace(/_/g, ' ').toUpperCase(),
      chosenConcept: {
        archetype: 'impossible_metaphor',
        textHook: 'THE BREAK',
        accentColor: '#f43f5e',
        groundColor: '#080c14',
      },
      textStrategy: {
        hookWord: 'THE BREAK',
      },
      compositionStrategy: {
        aspectRatio: '9:16',
        canvasWidth: 1080,
        canvasHeight: 1920,
      }
    };
  }

  const aspect = manifest.compositionStrategy?.aspectRatio || '9:16';
  const width = aspect === '9:16' ? 1080 : 1920;
  const height = aspect === '9:16' ? 1920 : 1080;

  const hookText = (manifest.textStrategy?.hookWord || manifest.chosenConcept?.textHook || 'WATCH THIS').toUpperCase();
  const accent = manifest.chosenConcept?.accentColor || '#f43f5e';
  const ground = manifest.chosenConcept?.groundColor || '#080c14';
  const archetype = manifest.chosenConcept?.archetype || 'impossible_metaphor';
  const topicTitle = manifest.topic || cleanSlug.replace(/_/g, ' ');

  // Construct High-Converting Frontier T HTML/SVG Composition
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800;900&family=JetBrains+Mono:wght@700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: ${width}px;
      height: ${height}px;
      background: ${ground};
      font-family: 'Inter', -apple-system, sans-serif;
      overflow: hidden;
      position: relative;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }

    /* Ambient atmospheric glow */
    .ambient-glow {
      position: absolute;
      width: 900px;
      height: 900px;
      border-radius: 50%;
      background: radial-gradient(circle, ${accent}55 0%, ${accent}15 45%, transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -45%);
      filter: blur(80px);
      pointer-events: none;
    }

    .ambient-top-glow {
      position: absolute;
      width: 700px;
      height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, #ffffff12 0%, transparent 70%);
      top: -100px;
      left: 50%;
      transform: translateX(-50%);
      filter: blur(60px);
      pointer-events: none;
    }

    /* Precision Grid Overlay */
    .grid-lines {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
      background-size: 80px 80px;
      opacity: 0.7;
      pointer-events: none;
    }

    /* Header Hook Zone (Upper 30%) */
    .header-hook {
      position: relative;
      z-index: 10;
      width: 100%;
      padding-top: 140px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .punch-text {
      font-size: ${aspect === '9:16' ? (hookText.length > 9 ? '112px' : '136px') : '124px'};
      font-weight: 900;
      letter-spacing: -2px;
      line-height: 0.95;
      text-transform: uppercase;
      color: #ffffff;
      text-shadow: 
        0 4px 30px rgba(0, 0, 0, 0.9),
        0 12px 60px rgba(0, 0, 0, 0.8);
      max-width: 940px;
      word-break: break-word;
    }

    .punch-text span {
      color: ${accent};
      text-shadow: 0 0 40px ${accent}aa;
    }

    /* Hero Visual Stage (Dominant 60% Silhouette) */
    .hero-stage {
      position: relative;
      z-index: 5;
      width: 100%;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: -40px;
    }

    /* Vector Hero Metaphor SVG */
    .hero-svg {
      width: ${aspect === '9:16' ? '880px' : '720px'};
      height: ${aspect === '9:16' ? '880px' : '620px'};
      filter: drop-shadow(0 20px 50px rgba(0, 0, 0, 0.7));
    }

    /* Subconscious Tick Marks (Studio aesthetic) */
    .corner-mark {
      position: absolute;
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.25);
      letter-spacing: 2px;
    }
    .corner-tl { top: 60px; left: 60px; }
    .corner-tr { top: 60px; right: 60px; }
    .corner-bl { bottom: 80px; left: 60px; }
    .corner-br { bottom: 80px; right: 60px; }
  </style>
</head>
<body>
  <div class="ambient-top-glow"></div>
  <div class="ambient-glow"></div>
  <div class="grid-lines"></div>

  <div class="corner-mark corner-tl">+ FRONTIER // T</div>
  <div class="corner-mark corner-tr">[01 // HOOK]</div>
  <div class="corner-mark corner-bl">${aspect} HIGH-CONTRAST</div>
  <div class="corner-mark corner-br">AUTONOMOUS CUE</div>

  <!-- Header Hook Zone -->
  <div class="header-hook">
    <h1 class="punch-text">
      ${hookText.split(' ').map((w, idx) => idx === hookText.split(' ').length - 1 ? `<span>${w}</span>` : w).join(' ')}
    </h1>
  </div>

  <!-- Hero Visual Stage -->
  <div class="hero-stage">
    ${renderSvgMetaphor(archetype, accent, topicTitle)}
  </div>
</body>
</html>`;

  // Render via Puppeteer
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const targetPath = path.join(OUT_DIR, `${cleanSlug}_thumbnail.png`);
  await page.screenshot({ path: targetPath, type: 'png' });
  console.log(`🖼️  Frontier T Thumbnail rendered: ${targetPath}`);

  // Mirror to slug.png as fallback
  const altPath = path.join(OUT_DIR, `${cleanSlug}.png`);
  fs.copyFileSync(targetPath, altPath);

  await browser.close();

  return {
    success: true,
    imagePath: targetPath,
    slug: cleanSlug,
    aspect,
    width,
    height,
  };
}

function renderSvgMetaphor(archetype, accent, topicTitle) {
  if (archetype === 'scale_constraint') {
    return `
      <svg class="hero-svg" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Colossal Architectural Monolith -->
        <rect x="140" y="80" width="520" height="480" rx="36" fill="rgba(24, 28, 42, 0.85)" stroke="#334155" stroke-width="3" filter="drop-shadow(0 25px 50px rgba(0,0,0,0.8))"/>
        <!-- Glowing Inner Frame & Monolithic Alert -->
        <rect x="180" y="120" width="440" height="400" rx="24" fill="rgba(15, 23, 42, 0.95)" stroke="${accent}" stroke-width="4"/>
        <circle cx="230" cy="170" r="14" fill="${accent}" />
        <circle cx="280" cy="170" r="14" fill="#64748b" />
        <circle cx="330" cy="170" r="14" fill="#64748b" />
        <path d="M220 280 L580 280" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>
        <path d="M220 340 L500 340" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
        <path d="M220 400 L420 400" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
        <!-- Crushing Force Indicator -->
        <path d="M400 480 L400 620 M360 580 L400 620 L440 580" stroke="${accent}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Miniature Grounded Silhouette Person Trapped Beneath -->
        <circle cx="400" cy="670" r="22" fill="#ffffff" filter="drop-shadow(0 0 16px ${accent})"/>
        <path d="M370 770 L400 705 L430 770 M380 725 L420 725" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
      </svg>
    `;
  } else if (archetype === 'minimal_object') {
    return `
      <svg class="hero-svg" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Floating Glass Cube / Monolithic Card -->
        <rect x="160" y="160" width="480" height="480" rx="40" fill="rgba(30, 41, 59, 0.7)" stroke="#475569" stroke-width="3" filter="drop-shadow(0 30px 60px rgba(0,0,0,0.9))"/>
        <!-- Pure Diagonal Hairline Fracture -->
        <path d="M160 380 L360 410 L440 370 L640 430" stroke="${accent}" stroke-width="6" stroke-linecap="round" filter="drop-shadow(0 0 20px ${accent})"/>
        <!-- Displaced Glowing Quantum / Neural Core -->
        <circle cx="400" cy="400" r="70" fill="radial-gradient(circle, ${accent} 0%, rgba(0,0,0,0) 70%)" />
        <circle cx="400" cy="400" r="32" fill="#ffffff" filter="drop-shadow(0 0 30px ${accent})"/>
        <!-- Ring Orbit -->
        <ellipse cx="400" cy="400" rx="160" ry="60" stroke="${accent}" stroke-width="3" stroke-dasharray="12 12" transform="rotate(-25 400 400)"/>
      </svg>
    `;
  } else if (archetype === 'split_contradiction') {
    return `
      <svg class="hero-svg" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Left Side: Order / Serenity -->
        <path d="M120 160 H400 V640 H120 Z" fill="rgba(15, 23, 42, 0.85)" stroke="#334155" stroke-width="3"/>
        <line x1="180" y1="280" x2="340" y2="280" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>
        <line x1="180" y1="360" x2="300" y2="360" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>
        <line x1="180" y1="440" x2="320" y2="440" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/>
        <!-- Right Side: Chaotic Spikes / Turbulence -->
        <path d="M400 160 H680 V640 H400 Z" fill="rgba(30, 20, 35, 0.85)" stroke="${accent}" stroke-width="3"/>
        <path d="M420 400 Q480 220 540 400 T660 400" stroke="${accent}" stroke-width="6" fill="none" filter="drop-shadow(0 0 18px ${accent})"/>
        <circle cx="540" cy="400" r="28" fill="${accent}" filter="drop-shadow(0 0 24px ${accent})"/>
        <!-- Razor Bifurcation Line -->
        <line x1="400" y1="100" x2="400" y2="700" stroke="#ffffff" stroke-width="5" stroke-dasharray="16 10"/>
      </svg>
    `;
  }

  // Default: impossible_metaphor (Impossible Cranial / Neural / Structural Fusion)
  return `
    <svg class="hero-svg" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="heroCoreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="35%" stop-color="${accent}"/>
          <stop offset="75%" stop-color="${accent}aa"/>
          <stop offset="100%" stop-color="${accent}00"/>
        </radialGradient>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="${accent}"/>
          <stop offset="100%" stop-color="${accent}44"/>
        </linearGradient>
      </defs>

      <!-- Powerful Luminous Backdrop Mass -->
      <circle cx="400" cy="400" r="260" fill="${accent}33" filter="drop-shadow(0 0 80px ${accent})"/>
      <circle cx="400" cy="400" r="210" stroke="url(#ringGrad)" stroke-width="8"/>
      <circle cx="400" cy="400" r="160" fill="rgba(24, 30, 48, 0.92)" stroke="${accent}" stroke-width="6"/>

      <!-- Dominant Glowing Fusion Core -->
      <circle cx="400" cy="400" r="110" fill="url(#heroCoreGrad)"/>
      <circle cx="400" cy="400" r="65" fill="#ffffff" filter="drop-shadow(0 0 35px #ffffff)"/>

      <!-- High-Contrast Structural Blades -->
      <path d="M400 120 L425 240 L375 240 Z" fill="#ffffff"/>
      <path d="M400 680 L425 560 L375 560 Z" fill="#ffffff"/>
      <path d="M120 400 L240 425 L240 375 Z" fill="#ffffff"/>
      <path d="M680 400 L560 425 L560 375 Z" fill="#ffffff"/>

      <!-- Cross Tension Lines -->
      <line x1="250" y1="250" x2="550" y2="550" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
      <line x1="250" y1="550" x2="550" y2="250" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
    </svg>
  `;
}

// CLI entrypoint
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve('./scripts/thumbnail_renderer.mjs')) {
  const targetSlug = process.argv[2] || 'good_vs_bad_stress';
  renderFrontierThumbnail(targetSlug)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Thumbnail render failed:', err.message);
      process.exit(1);
    });
}
