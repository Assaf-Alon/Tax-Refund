import { useState, useEffect, useCallback } from 'react';
import type { SongItem, VinylGameState, Player } from '../../../shared/types/music';

const STORAGE_KEY = 'vinyl_game_state';

const INITIAL_STATE: VinylGameState = {
  status: 'setup',
  players: [],
  currentPlayerIndex: 0,
  timeline: [],
  mysteryCard: null,
  nextMysteryCard: null,
  pool: [],
  usedIds: [],
  mode: 'survivor',
  oneListenOnly: false,
  shuffleMode: false,
  hardMode: false,
  listenedCurrentRound: false,
  candidateMystery: null,
};

export const calculatePlaybackRange = (song: SongItem, shuffle: boolean, hard: boolean) => {
  if (shuffle) {
    // Base safety: OPs are ~90s, but we use known metadata as a hint for longer videos
    const safeMax = Math.max(100, song.altEndTime || 0, song.endTime || 0);
    const duration = hard ? 10 : 20;
    const start = Math.random() * Math.max(0, safeMax - duration);
    return { start, end: start + duration };
  } else {
    // Pick between primary and alternative
    const useAlt = song.altStartTime !== undefined && Math.random() > 0.5;
    const start = useAlt ? song.altStartTime! : song.startTime;
    const end = useAlt ? song.altEndTime! : song.endTime;
    
    if (hard) {
      return { start, end: start + 10 };
    }
    return { start, end };
  }
};

const getInitialState = (): VinylGameState => {
  if (typeof window === 'undefined') return INITIAL_STATE;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.status) return {
        ...INITIAL_STATE,
        ...parsed,
        shuffleMode: parsed.shuffleMode ?? false,
        hardMode: parsed.hardMode ?? false
      };
    } catch (e) {
      console.error("Failed to load game state", e);
    }
  }
  return INITIAL_STATE;
};

export const useVinylGame = () => {
  const [state, setState] = useState<VinylGameState>(getInitialState);

  // Save to localStorage on change
  useEffect(() => {
    if (state.status !== 'setup') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const startRound = useCallback((
    currentPool: SongItem[], 
    usedIds: number[], 
    players: Player[], 
    currentPlayerIndex: number,
    timeline: SongItem[],
    shuffle: boolean,
    hard: boolean,
    incomingMystery?: SongItem,
    incomingRange?: { start: number, end: number }
  ) => {
    const available = currentPool.filter(s => !usedIds.includes(s.id));
    
    // Use provided mystery (from nextMysteryCard) or pick one
    const mysteryCard = incomingMystery || (available.length > 0 
      ? available[Math.floor(Math.random() * available.length)] 
      : null);

    if (!mysteryCard) {
      setState(s => ({ ...s, status: 'gameOver' }));
      return;
    }

    // Calculate range for current mystery if not provided
    const currentRange = incomingRange || calculatePlaybackRange(mysteryCard, shuffle, hard);

    const updatedUsedIds = [...usedIds, mysteryCard.id];
    const stillAvailable = currentPool.filter(s => !updatedUsedIds.includes(s.id));
    const nextMystery = stillAvailable.length > 0 
      ? stillAvailable[Math.floor(Math.random() * stillAvailable.length)]
      : null;
    
    // Calculate range for next mystery
    let nextRange = undefined;
    if (nextMystery) {
      nextRange = calculatePlaybackRange(nextMystery, shuffle, hard);
    }
    
    setState(s => ({
      ...s,
      status: 'playing',
      mysteryCard,
      nextMysteryCard: nextMystery,
      playbackStart: currentRange.start,
      playbackEnd: currentRange.end,
      nextPlaybackStart: nextRange?.start,
      nextPlaybackEnd: nextRange?.end,
      usedIds: updatedUsedIds,
      lastResult: undefined,
      players,
      currentPlayerIndex,
      timeline,
      pool: currentPool,
      listenedCurrentRound: false, // Reset for new round
      shuffleMode: shuffle,
      hardMode: hard
    }));
  }, []);

  const setupGame = useCallback(async (
    playerNames: string[], 
    mode: 'survivor' | 'points' = 'survivor',
    oneListenOnly: boolean = false,
    shuffleMode: boolean = false,
    hardMode: boolean = false,
    startSongId?: number
  ) => {
    try {
      // 1. Load data (only if not pre-loaded)
      let currentPool = state.pool;
      if (currentPool.length === 0) {
        const res = await fetch('/Tax-Refund/data/anime_songs.json');
        const allSongs: SongItem[] = await res.json();
        currentPool = allSongs.filter(s => s.status === 'completed' && s.year);
      }

      // 2. Setup players
      const validNames = playerNames.length > 0 ? playerNames : [''];
      const players: Player[] = validNames.map((name, i) => ({
        id: `p${i}`,
        name: name.trim() || `Player ${i + 1}`,
        score: 0,
        lives: 3,
      }));

      // 3. Select Anchor (Use currentPool)
      let anchor: SongItem;
      if (startSongId !== undefined) {
        const candidate = currentPool.find(s => s.id === startSongId);
        anchor = candidate || currentPool[Math.floor(Math.random() * currentPool.length)];
      } else {
        const yearsArray = currentPool.map(s => parseInt(s.year!)).sort((a, b) => a - b);
        const medianYear = yearsArray[Math.floor(yearsArray.length / 2)];
        const range = 2;
        const anchorCandidates = currentPool.filter(s => {
          const y = parseInt(s.year!);
          return y >= medianYear - range && y <= medianYear + range;
        });
        anchor = anchorCandidates[Math.floor(Math.random() * anchorCandidates.length)];
      }

      // 4. Initial state
      const initialTimeline = [anchor];
      const initialUsedIds = [anchor.id];

      setState(s => ({
        ...s,
        mode,
        oneListenOnly,
        shuffleMode,
        hardMode,
        pool: currentPool
      }));

      // Use the preloaded candidate if it exists
      const range = state.candidateMystery && state.playbackStart !== undefined && state.playbackEnd !== undefined
        ? { start: state.playbackStart, end: state.playbackEnd }
        : undefined;

      startRound(currentPool, initialUsedIds, players, 0, initialTimeline, shuffleMode, hardMode, state.candidateMystery || undefined, range);
    } catch (error) {
      console.error("Failed to setup game:", error);
    }
  }, [startRound, state.pool, state.candidateMystery, state.playbackStart, state.playbackEnd]);

  const checkPlacement = useCallback((targetIndex: number) => {
    if (!state.mysteryCard || state.status !== 'playing') return;

    const { timeline, mysteryCard } = state;
    const mysteryYear = parseInt(mysteryCard.year!);
    
    let isValid = true;
    
    if (targetIndex > 0) {
      const prevYear = parseInt(timeline[targetIndex - 1].year!);
      if (mysteryYear < prevYear) isValid = false;
    }
    
    if (targetIndex < timeline.length) {
      const nextYear = parseInt(timeline[targetIndex].year!);
      if (mysteryYear > nextYear) isValid = false;
    }

    if (isValid) {
      const newTimeline = [...timeline];
      newTimeline.splice(targetIndex, 0, mysteryCard);
      
      const newPlayers = state.players.map((p, i) => 
        i === state.currentPlayerIndex ? { ...p, score: p.score + 100 } : p
      );

      setState(s => ({
        ...s,
        status: 'revealing',
        timeline: newTimeline,
        players: newPlayers,
        lastResult: { success: true, correctYear: mysteryCard.year! }
      }));
    } else {
      const newPlayers = state.players.map((p, i) => {
        if (i !== state.currentPlayerIndex) return p;
        if (state.mode === 'survivor') {
          return { ...p, lives: p.lives - 1 };
        }
        return p; // No life loss in points mode
      });
      
      setState(s => ({
        ...s,
        status: 'revealing',
        players: newPlayers,
        lastResult: { success: false, correctYear: mysteryCard.year! }
      }));
    }
  }, [state]);

  const proceedToNextPlayer = useCallback(() => {
    if (state.status !== 'revealing') return;
    
    const nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
    
    // Check if game is over (all players dead)
    const allDead = state.players.every(p => p.lives <= 0);
    if (allDead) {
      setState((s: VinylGameState) => ({ ...s, status: 'gameOver' }));
      return;
    }

    // Skip dead players
    let finalNextIdx = nextIdx;
    while (state.players[finalNextIdx].lives <= 0 && finalNextIdx !== state.currentPlayerIndex) {
      finalNextIdx = (finalNextIdx + 1) % state.players.length;
    }

    startRound(
      state.pool, 
      state.usedIds, 
      state.players, 
      finalNextIdx, 
      state.timeline,
      state.shuffleMode,
      state.hardMode,
      state.nextMysteryCard || undefined,
      state.nextPlaybackStart !== undefined && state.nextPlaybackEnd !== undefined 
        ? { start: state.nextPlaybackStart, end: state.nextPlaybackEnd } 
        : undefined
    );
  }, [state, startRound]);

  const resetGame = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_STATE);
  }, []);

  const skipCurrentMystery = useCallback(() => {
    if (!state.mysteryCard) return;
    
    // Pick a new mystery (startRound will handle it)
    startRound(
      state.pool, 
      state.usedIds, 
      state.players, 
      state.currentPlayerIndex, 
      state.timeline, 
      state.shuffleMode,
      state.hardMode,
      undefined, // Force a new random one
      undefined  // Force new range
    );
  }, [state, startRound]);

  const prepareInitialSongs = useCallback(async (shuffle?: boolean, hard?: boolean) => {
    try {
      const res = await fetch('/Tax-Refund/data/anime_songs.json');
      const allSongs: SongItem[] = await res.json();
      const pool = allSongs.filter(s => s.status === 'completed' && s.year);
      
      // If we already have a candidate and the modes haven't changed, we can skip if we want,
      // but the requirement says "When selection changes, load a different section".
      // So we always recalculate the range.
      
      const mystery = state.candidateMystery || pool[Math.floor(Math.random() * pool.length)];
      
      // Use provided modes or current state
      const sMode = shuffle !== undefined ? shuffle : state.shuffleMode;
      const hMode = hard !== undefined ? hard : state.hardMode;
      
      const range = calculatePlaybackRange(mystery, sMode, hMode);
      
      setState(s => ({
        ...s,
        pool,
        candidateMystery: mystery,
        playbackStart: range.start,
        playbackEnd: range.end
      }));
    } catch (e) {
      console.error("Failed to preload songs", e);
    }
  }, [state.candidateMystery, state.shuffleMode, state.hardMode]);

  return {
    state,
    setupGame,
    checkPlacement,
    proceedToNextPlayer,
    resetGame,
    skipCurrentMystery,
    prepareInitialSongs,
    consumeListen: () => setState(s => ({ ...s, listenedCurrentRound: true })),
    endGame: () => setState(s => ({ ...s, status: 'gameOver' }))
  };
};

