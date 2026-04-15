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
};

const getInitialState = (): VinylGameState => {
  if (typeof window === 'undefined') return INITIAL_STATE;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.status) return parsed;
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
    incomingMystery?: SongItem
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

    const updatedUsedIds = [...usedIds, mysteryCard.id];
    const stillAvailable = currentPool.filter(s => !updatedUsedIds.includes(s.id));
    const nextMystery = stillAvailable.length > 0 
      ? stillAvailable[Math.floor(Math.random() * stillAvailable.length)]
      : null;
    
    setState(s => ({
      ...s,
      status: 'playing',
      mysteryCard,
      nextMysteryCard: nextMystery,
      usedIds: updatedUsedIds,
      lastResult: undefined,
      players,
      currentPlayerIndex,
      timeline,
      pool: currentPool
    }));
  }, []);

  const setupGame = useCallback(async (playerNames: string[], startSongId?: number) => {
    try {
      // 1. Load data
      const res = await fetch('/Tax-Refund/data/anime_songs.json');
      const allSongs: SongItem[] = await res.json();
      const pool = allSongs.filter(s => s.status === 'completed' && s.year);

      // 2. Setup players
      const validNames = playerNames.length > 0 ? playerNames : [''];
      const players: Player[] = validNames.map((name, i) => ({
        id: `p${i}`,
        name: name.trim() || `Player ${i + 1}`,
        score: 0,
        lives: 3,
      }));

      // 3. Select Anchor
      let anchor: SongItem;
      if (startSongId !== undefined) {
        const candidate = pool.find(s => s.id === startSongId);
        anchor = candidate || pool[Math.floor(Math.random() * pool.length)];
      } else {
        const yearsArray = pool.map(s => parseInt(s.year!)).sort((a, b) => a - b);
        const medianYear = yearsArray[Math.floor(yearsArray.length / 2)];
        const range = 2;
        const anchorCandidates = pool.filter(s => {
          const y = parseInt(s.year!);
          return y >= medianYear - range && y <= medianYear + range;
        });
        anchor = anchorCandidates[Math.floor(Math.random() * anchorCandidates.length)];
      }

      // 4. Initial state
      const initialTimeline = [anchor];
      const initialUsedIds = [anchor.id];

      startRound(pool, initialUsedIds, players, 0, initialTimeline);
    } catch (error) {
      console.error("Failed to setup game:", error);
    }
  }, [startRound]);

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
      const newPlayers = state.players.map((p, i) => 
        i === state.currentPlayerIndex ? { ...p, lives: p.lives - 1 } : p
      );
      
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
      state.nextMysteryCard || undefined
    );
  }, [state, startRound]);

  const resetGame = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_STATE);
  }, []);

  return {
    state,
    setupGame,
    checkPlacement,
    proceedToNextPlayer,
    resetGame,
    endGame: () => setState(s => ({ ...s, status: 'gameOver' }))
  };
};
