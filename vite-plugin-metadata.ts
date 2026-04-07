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
            // Run yt-dlp to get the year
            const { stdout } = await execAsync(`yt-dlp --get-filename -o "%(upload_date)s" -- ${id}`);
            const dateStr = stdout.trim();
            const year = dateStr.substring(0, 4);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ year }));
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
