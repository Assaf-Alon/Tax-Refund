export interface SongItem {
  id: number;
  query: string;
  info: string;
  name: string;
  youtubeId: string;
  startTime: number;
  endTime: number;
  altStartTime?: number;
  altEndTime?: number;
  year?: string;
  status: 'pending' | 'completed';
}

export type GameStatus = 'setup' | 'playing' | 'revealing' | 'gameOver';

export interface Player {
  id: string;
  name: string;
  score: number;
  lives: number;
}

export interface VinylGameState {
  status: GameStatus;
  players: Player[];
  currentPlayerIndex: number;
  timeline: SongItem[];
  mysteryCard: SongItem | null;
  nextMysteryCard: SongItem | null;
  pool: SongItem[];
  usedIds: number[];
  lastResult?: {
    success: boolean;
    correctYear: string;
  };
}

