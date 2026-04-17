import type { SongItem } from '../types/music';

/**
 * Checks if an array of songs is in chronological order.
 * Accepts relaxed ordering (equal years are okay).
 */
export const isChronological = (songs: (SongItem | null)[]): boolean => {
  const validYears = songs
    .filter((s): s is SongItem & { year: string } => s !== null && s.year !== undefined)
    .map(s => parseInt(s.year))
    .filter(y => !isNaN(y));

  return validYears.every((year, i) => i === 0 || year >= validYears[i - 1]);
};

/**
 * Checks if a specific song can be inserted at a specific index in a timeline
 * and maintain chronological order.
 */
export const isValidPlacement = (
  timeline: SongItem[],
  newSong: SongItem,
  atIndex: number
): boolean => {
  const testTimeline = [...timeline];
  testTimeline.splice(atIndex, 0, newSong);
  return isChronological(testTimeline);
};
