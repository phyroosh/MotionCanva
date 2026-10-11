import fs from 'fs';
import path from 'path';
import http from 'http';
import { google } from 'googleapis';

const MOTION_CANVAS_DIR = path.resolve('.');
const OUT_DIR = path.join(MOTION_CANVAS_DIR, 'out');
const RIGHTCLIPS_STUDIO_DIR = '/home/phyroosh/TopProducts/RightClips/studio';

// Resolve client_secrets.json and token.json
function resolveCredentials() {
  const localSecrets = path.join(MOTION_CANVAS_DIR, 'client_secrets.json');
  const rightClipsSecrets = path.join(RIGHTCLIPS_STUDIO_DIR, 'client_secrets.json');
  const localToken = path.join(MOTION_CANVAS_DIR, 'token.json');
  const rightClipsToken = path.join(RIGHTCLIPS_STUDIO_DIR, 'token.json');

  let secretsPath = null;
  if (fs.existsSync(localSecrets)) {
    secretsPath = localSecrets;
  } else if (fs.existsSync(rightClipsSecrets)) {
    secretsPath = rightClipsSecrets;
  }

  let tokenPath = null;
  if (fs.existsSync(localToken)) {
    tokenPath = localToken;
  } else if (fs.existsSync(rightClipsToken)) {
    tokenPath = rightClipsToken;
  }

  return { secretsPath, tokenPath };
}

async function getOAuth2Client() {
  const { secretsPath, tokenPath } = resolveCredentials();

  if (!secretsPath) {
    throw new Error(
      'No Google OAuth credentials found!\n' +
      'Please place your YouTube Data API "client_secrets.json" in this directory, or in RightClips/studio/.'
    );
  }

  const content = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
  const creds = content.installed || content.web;
  const port = 4100;
  const redirectUri = `http://localhost:${port}/oauth2callback`;

  const oauth2Client = new google.auth.OAuth2(
    creds.client_id,
    creds.client_secret,
    redirectUri
  );

  if (tokenPath && fs.existsSync(tokenPath)) {
    const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    oauth2Client.setCredentials(tokens);
    console.log(`🔑 Using existing authorized token from: ${tokenPath}`);
    return oauth2Client;
  }

  // If no token exists, prompt OAuth flow
  console.log('\n🔒 No active YouTube token found. Starting authorization flow...');
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.force-ssl',
      'https://www.googleapis.com/auth/youtube',
    ],
  });

  console.log(`\n👉 Open this URL in your browser to authorize:\n${authUrl}\n`);

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (req.url && req.url.includes('/oauth2callback')) {
        const urlParams = new URL(req.url, `http://localhost:${port}`).searchParams;
        const code = urlParams.get('code');
        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h1>Authorization Successful!</h1><p>You can close this tab and return to the terminal.</p>');
          server.close();

          try {
            const { tokens } = await oauth2Client.getToken(code);
            oauth2Client.setCredentials(tokens);
            const saveTokenPath = path.join(MOTION_CANVAS_DIR, 'token.json');
            fs.writeFileSync(saveTokenPath, JSON.stringify(tokens, null, 2));
            console.log(`✅ Saved new YouTube token to: ${saveTokenPath}`);
            resolve(oauth2Client);
          } catch (e) {
            reject(e);
          }
        }
      }
    });

    server.listen(port, () => {
      console.log(`Waiting for OAuth callback on http://localhost:${port}/oauth2callback ...`);
    });
  });
}

export async function uploadVideoToYouTube(targetSlug = null) {
  if (!fs.existsSync(OUT_DIR)) {
    throw new Error(`Out directory not found: ${OUT_DIR}`);
  }

  const allOutFiles = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.mp4'));
  if (allOutFiles.length === 0) {
    throw new Error('No .mp4 files found in out/. Render a video first!');
  }

  let selectedFile = null;
  if (targetSlug) {
    const cleanSlug = targetSlug.replace(/\.mp4$/i, '');
    selectedFile = allOutFiles.find(f => f.replace(/\.mp4$/i, '') === cleanSlug) || `${cleanSlug}.mp4`;
  } else {
    const sorted = allOutFiles.map(f => ({
      file: f,
      mtime: fs.statSync(path.join(OUT_DIR, f)).mtimeMs,
    })).sort((a, b) => b.mtime - a.mtime);
    selectedFile = sorted[0].file;
  }

  const videoPath = path.join(OUT_DIR, selectedFile);
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file does not exist: ${videoPath}`);
  }

  const slug = selectedFile.replace(/\.mp4$/i, '');

  // Load metadata
  let meta = null;
  const metaPaths = [
    path.join(OUT_DIR, `${slug}.json`),
    path.join(MOTION_CANVAS_DIR, 'src', 'projects', `${slug}.meta.json`),
  ];
  for (const p of metaPaths) {
    if (fs.existsSync(p)) {
      meta = JSON.parse(fs.readFileSync(p, 'utf8'));
      break;
    }
  }

  const title = meta?.title || `${slug.replace(/_/g, ' ')} #Shorts`;
  const description = meta?.description || 'Auto-generated high-impact video.';
  const tags = meta?.tags || ['Shorts', 'Viral'];
  const categoryId = meta?.categoryId || '28';
  const privacyStatus = meta?.privacyStatus || 'public';

  const auth = await getOAuth2Client();
  const youtube = google.youtube({ version: 'v3', auth });

  console.log(`\n🚀 Uploading [${selectedFile}] to YouTube...`);
  console.log(`📌 Title: ${title}`);
  console.log(`🔒 Privacy: ${privacyStatus}`);

  const fileSize = fs.statSync(videoPath).size;

  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title,
        description,
        tags,
        categoryId,
      },
      status: {
        privacyStatus,
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: fs.createReadStream(videoPath),
    },
  });

  const videoId = res.data.id;
  const videoUrl = `https://youtu.be/${videoId}`;
  const shortsUrl = `https://youtube.com/shorts/${videoId}`;

  console.log(`\n🎉 Upload successful!`);
  console.log(`📺 Video ID: ${videoId}`);
  console.log(`🔗 Watch URL: ${videoUrl}`);
  console.log(`📱 Shorts URL: ${shortsUrl}`);

  // Post pinned comment if available
  if (meta?.pinnedComment && videoId) {
    try {
      console.log(`💬 Posting pinned comment...`);
      await youtube.commentThreads.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            videoId,
            topLevelComment: {
              snippet: {
                textOriginal: meta.pinnedComment,
              },
            },
          },
        },
      });
      console.log(`✅ Pinned comment published.`);
    } catch (commentErr) {
      console.warn(`⚠️ Could not post pinned comment:`, commentErr.message);
    }
  }

  return {
    videoId,
    videoUrl,
    shortsUrl,
    title,
  };
}

// CLI entrypoint
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve('./scripts/publish_youtube.mjs')) {
  const targetSlug = process.argv[2] || null;
  uploadVideoToYouTube(targetSlug)
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Upload failed:', err.message);
      process.exit(1);
    });
}
