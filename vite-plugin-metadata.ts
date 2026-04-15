import type { Plugin } from 'vite';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default function metadataPlugin(): Plugin {
  return {
    name: 'vite-plugin-metadata',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Handle /api/stream
        if (req.url?.includes('/api/stream')) {
          const urlStr = req.url.startsWith('http') ? req.url : `http://${req.headers.host}${req.url}`;
          const url = new URL(urlStr);
          const id = url.searchParams.get('id');

          if (!id) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing id parameter' }));
            return;
          }

          try {
            // First attempt: yt-dlp for direct URL
            const { stdout } = await execAsync(`yt-dlp -g --format "bestaudio[ext=m4a]/bestaudio" -- ${id}`);
            const streamUrl = stdout.trim();
            
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ url: streamUrl }));
          } catch (error: any) {
            console.warn('yt-dlp stream fetch failed, trying Piped fallback...');
            // Fallback: try one reliable piped instance as proxy
            try {
              const pipedRes = await fetch(`https://pipedapi.kavin.rocks/streams/${id}`);
              const data = await pipedRes.json() as any;
              const stream = data.audioStreams?.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];
              if (stream?.url) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ url: stream.url }));
                return;
              }
            } catch (e) {}

            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to fetch stream' }));
          }
          return;
        }

        // Handle /api/metadata
        if (req.url?.includes('/api/metadata')) {
          const urlStr = req.url.startsWith('http') ? req.url : `http://${req.headers.host}${req.url}`;
          const url = new URL(urlStr);
          const id = url.searchParams.get('id');

          if (!id) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing id parameter' }));
            return;
          }

          try {
            // Run yt-dlp to get multiple year-related fields
            const { stdout } = await execAsync(`yt-dlp --print "release_year,release_date,upload_date" -- ${id}`);
            const lines = stdout.trim().split('\n');

            const copyright = lines[0] !== 'NA' ? lines[0] : null;
            const platform = lines[1] !== 'NA' ? lines[1].substring(0, 4) : null;
            const upload = lines[2] !== 'NA' ? lines[2].substring(0, 4) : null;

            const years = [copyright, platform, upload].filter(Boolean) as string[];
            const bestYear = years.length > 0 ? Math.min(...years.map(y => parseInt(y))).toString() : null;

            // Confidence is low if copyright and platform differ by more than 1 year
            const confidence = (copyright && platform && Math.abs(parseInt(copyright) - parseInt(platform)) > 1) ? 'low' : 'high';

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              year: bestYear,
              details: { copyright, platform, upload },
              confidence
            }));
          } catch (error: any) {
            const isMissing = error.message.includes('not found') || error.code === 127;
            console.error('Metadata fetch error:', isMissing ? 'yt-dlp not found in PATH' : error.message);

            res.statusCode = 500;
            res.end(JSON.stringify({
              error: isMissing ? 'yt-dlp_missing' : 'yt-dlp_error',
              message: isMissing ? 'yt-dlp is not installed on the server' : error.message
            }));
          }
          return;
        }
        next();
      });
    },
  };
}
