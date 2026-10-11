import fs from 'fs';
import path from 'path';

const MOTION_CANVAS_DIR = path.resolve('.');
const OUT_DIR = path.join(MOTION_CANVAS_DIR, 'out');
const RIGHTCLIPS_DIR = '/home/phyroosh/TopProducts/RightClips';
const RIGHTCLIPS_OUT = path.join(RIGHTCLIPS_DIR, 'out');
const RIGHTCLIPS_METADATA = path.join(RIGHTCLIPS_DIR, 'studio', 'metadata.json');

export function exportVideoToRightClips(targetSlug = null) {
  if (!fs.existsSync(OUT_DIR)) {
    throw new Error(`Motion Canvas out/ directory does not exist: ${OUT_DIR}`);
  }

  // Find target mp4 file(s)
  const allOutFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.mp4'));
  if (allOutFiles.length === 0) {
    throw new Error('No rendered .mp4 files found in out/. Render a video first!');
  }

  let selectedFile = null;
  if (targetSlug) {
    const cleanSlug = targetSlug.replace(/\.mp4$/i, '');
    selectedFile = allOutFiles.find(f => f.replace(/\.mp4$/i, '') === cleanSlug) || `${cleanSlug}.mp4`;
  } else {
    // Pick newest file
    const sorted = allOutFiles.map(f => ({
      file: f,
      mtime: fs.statSync(path.join(OUT_DIR, f)).mtimeMs,
    })).sort((a, b) => b.mtime - a.mtime);
    selectedFile = sorted[0].file;
  }

  const srcVideoPath = path.join(OUT_DIR, selectedFile);
  if (!fs.existsSync(srcVideoPath)) {
    throw new Error(`Video file not found: ${srcVideoPath}`);
  }

  const slug = selectedFile.replace(/\.mp4$/i, '');

  // Ensure RightClips out dir exists
  if (!fs.existsSync(RIGHTCLIPS_OUT)) {
    fs.mkdirSync(RIGHTCLIPS_OUT, { recursive: true });
  }

  // Copy MP4
  const destVideoPath = path.join(RIGHTCLIPS_OUT, selectedFile);
  fs.copyFileSync(srcVideoPath, destVideoPath);
  console.log(`📹 Copied video: ${selectedFile} -> ${destVideoPath}`);

  // Copy thumbnail if available
  const thumbCandidates = [
    path.join(OUT_DIR, `${slug}.png`),
    path.join(OUT_DIR, `${slug}_thumbnail.png`),
  ];
  for (const t of thumbCandidates) {
    if (fs.existsSync(t)) {
      const destThumb = path.join(RIGHTCLIPS_OUT, path.basename(t));
      fs.copyFileSync(t, destThumb);
      console.log(`🖼️  Copied thumbnail: ${path.basename(t)} -> ${destThumb}`);
    }
  }

  // Resolve metadata
  let metadata = null;
  const metaPaths = [
    path.join(OUT_DIR, `${slug}.json`),
    path.join(MOTION_CANVAS_DIR, 'src', 'projects', `${slug}.meta.json`),
  ];

  for (const mp of metaPaths) {
    if (fs.existsSync(mp)) {
      try {
        metadata = JSON.parse(fs.readFileSync(mp, 'utf8'));
        console.log(`📝 Loaded metadata from: ${mp}`);
        break;
      } catch (e) {
        console.warn(`Could not parse ${mp}:`, e.message);
      }
    }
  }

  const topicName = (metadata?.topic || slug.replace(/_/g, ' ')).replace(/\b\w/g, l => l.toUpperCase());

  if (!metadata) {
    metadata = {
      topic: topicName,
      title: `${topicName} Explained In 30 Seconds 🧠 #Shorts`,
      description: `What happens when you truly understand ${topicName}?\n\nHere is the core mechanism breakdown in 30 seconds.\n\n🔑 Key Takeaway: Real progress happens at the edge of discomfort.\n\n#Shorts #${topicName.replace(/\s+/g, '')} #Psychology #Productivity #Mindset #SelfImprovement`,
      tags: ['Shorts', 'YouTube Shorts', topicName, 'Psychology', 'Self Improvement', 'Mindset', 'Productivity'],
      categoryId: '28',
      privacyStatus: 'public',
    };
  }

  // Register in RightClips studio/metadata.json
  let studioMetadata = {};
  if (fs.existsSync(RIGHTCLIPS_METADATA)) {
    try {
      studioMetadata = JSON.parse(fs.readFileSync(RIGHTCLIPS_METADATA, 'utf8'));
    } catch (e) {
      console.warn('Warning reading RightClips studio/metadata.json:', e.message);
    }
  }

  studioMetadata[selectedFile] = {
    topic: metadata.topic || topicName,
    title: metadata.title || `${topicName} 🧠 #Shorts`,
    description: metadata.description || '',
    tags: metadata.tags || ['Shorts', topicName, 'Technology'],
    categoryId: metadata.categoryId || '28',
    privacyStatus: metadata.privacyStatus || 'public',
  };

  fs.writeFileSync(RIGHTCLIPS_METADATA, JSON.stringify(studioMetadata, null, 2), 'utf8');
  console.log(`✅ Synced metadata into RightClips studio/metadata.json for [${selectedFile}]`);

  return {
    success: true,
    file: selectedFile,
    destVideoPath,
    metadata: studioMetadata[selectedFile],
    studioUrl: 'http://localhost:4000',
  };
}

// CLI entrypoint if executed directly
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve('./scripts/export_to_rightclips.mjs')) {
  try {
    const slugArg = process.argv[2] || null;
    const result = exportVideoToRightClips(slugArg);
    console.log('\n🎉 Successfully exported to RightClips!');
    console.log(`📌 Title: "${result.metadata.title}"`);
    console.log(`🌐 Open RightClips Studio at: ${result.studioUrl} to 1-click publish to YouTube.`);
  } catch (err) {
    console.error('❌ Export failed:', err.message);
    process.exit(1);
  }
}
