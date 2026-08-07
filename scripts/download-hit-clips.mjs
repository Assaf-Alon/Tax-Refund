import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const songsJsonPath = path.join(rootDir, 'public/data/songs.json');
const outputDir = path.join(rootDir, 'public/audio');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 24 song IDs used in "It's a Hit" (IT_STAGE_DATA)
const HIT_SONG_IDS = [
  // Stage 1
  101, 25, 62, 74,
  // Stage 2
  1776408730771, 1776408730735, 1776408730777, 1776416445034, 1776416445029,
  // Stage 3
  5, 14, 30, 23, 18, 44, 43, 50, 20, 253, 38,
  // Stage 4
  1776432103947, 1776432103945, 1776432103946, 1776432103951
];

const songsData = JSON.parse(fs.readFileSync(songsJsonPath, 'utf8'));

const formatTime = (seconds) => {
  const s = Math.floor(seconds || 0);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

console.log(`Starting clip download & trim for ${HIT_SONG_IDS.length} songs...`);

for (const songId of HIT_SONG_IDS) {
  const song = songsData.find(s => String(s.id) === String(songId));
  if (!song) {
    console.warn(`[WARN] Song ID ${songId} not found in songs.json! Skipping.`);
    continue;
  }

  const outFile = path.join(outputDir, `${song.id}.mp3`);
  if (fs.existsSync(outFile)) {
    console.log(`[SKIP] ${song.id}.mp3 already exists.`);
    continue;
  }

  const startSec = song.startTime || 0;
  const endSec = (song.endTime && song.endTime > startSec) ? song.endTime : startSec + 20;

  const startStr = formatTime(startSec);
  const endStr = formatTime(endSec);

  console.log(`\n[DOWNLOADING] Song #${song.id} ("${song.name}") [${startStr} - ${endStr}]...`);

  const url = `https://www.youtube.com/watch?v=${song.youtubeId}`;
  
  try {
    const cmd = `yt-dlp --extractor-args "youtube:player_client=android,web" -x --audio-format mp3 --download-sections "*${startStr}-${endStr}" --force-keyframes-at-cuts -o "${outFile}" "${url}"`;
    execSync(cmd, { stdio: 'inherit' });
    console.log(`[SUCCESS] Saved ${song.id}.mp3`);
  } catch (err) {
    console.error(`[ERROR] Failed to download song #${song.id}:`, err.message);
  }
}

console.log('\nAll clips processed!');
