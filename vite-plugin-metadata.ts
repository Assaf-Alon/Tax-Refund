import type { Plugin } from 'vite';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default function metadataPlugin(): Plugin {
  return {
    name: 'vite-plugin-metadata',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Handle /api/metadata
        if (req.url?.startsWith('/api/metadata')) {
          const url = new URL(req.url, `http://${req.headers.host}`);
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
          } catch (error) {
            console.error('Metadata fetch error:', error);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to fetch metadata' }));
          }
          return;
        }
        next();
      });
    },
  };
}
