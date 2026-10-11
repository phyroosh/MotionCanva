import {defineConfig, Plugin} from 'vite';
import motionCanvasPlugin from '@motion-canvas/vite-plugin';
import ffmpegPlugin from '@motion-canvas/ffmpeg';
import {exportVideoToRightClips} from './scripts/export_to_rightclips.mjs';

const motionCanvas = (motionCanvasPlugin as unknown as {default: typeof motionCanvasPlugin}).default ?? motionCanvasPlugin;
const ffmpeg = (ffmpegPlugin as unknown as {default: typeof ffmpegPlugin}).default ?? ffmpegPlugin;

function rightclipsBridgePlugin(): Plugin {
  return {
    name: 'rightclips-bridge-plugin',
    configureServer(server) {
      server.middlewares.use('/api/export-rightclips', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = body ? JSON.parse(body) : {};
              const slug = parsed.slug || null;
              const result = exportVideoToRightClips(slug);
              res.writeHead(200, {'Content-Type': 'application/json'});
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.writeHead(500, {'Content-Type': 'application/json'});
              res.end(JSON.stringify({success: false, error: err.message}));
            }
          });
        } else {
          try {
            const result = exportVideoToRightClips(null);
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(result));
          } catch (err: any) {
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({success: false, error: err.message}));
          }
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    motionCanvas({
      project: [
        './src/projects/*.ts',
        './src/project.ts',
      ],
      output: './out',
    }),
    ffmpeg(),
    rightclipsBridgePlugin(),
  ],
});
