import React, { useState, useEffect, useCallback } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  TouchSensor,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import { RotateCcw, Users, Music, AlertCircle, Plus, Trash2, Shuffle, Zap } from 'lucide-react';

import { useVinylGame } from './hooks/useVinylGame';
import { useAudioStream } from '../../shared/hooks/useAudioStream';
import { VinylCard } from '../../shared/components/Vinyl/VinylCard';
import { VinylAudioController } from '../../shared/components/Vinyl/VinylAudioController';
import { DraggableVinylCard } from './components/DraggableVinylCard';
import { Timeline } from './components/Timeline';

export const VinylTimelinePage: React.FC = () => {
  const { state, setupGame, checkPlacement, proceedToNextPlayer, resetGame, skipCurrentMystery, prepareInitialSongs, consumeListen, endGame } = useVinylGame();
  
  const { 
    status: playerStatus,
    isReady, 
    isPlaying: actualIsPlaying, 
    prepare,
    playExcerpt,
    togglePlayback,
    progress,
    lastError,
    prefetch,
    reset
  } = useAudioStream();

  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const isPlaying = localIsPlaying || actualIsPlaying;
  const [playerNames, setPlayerNames] = useState<string[]>(['']);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [isSoloContinuing, setIsSoloContinuing] = useState(false);
  const [gameMode, setGameMode] = useState<'survivor' | 'points'>('survivor');
  const [oneListenOnly, setOneListenOnly] = useState(false);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [hardMode, setHardMode] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Anime']);
  const [availableCategories, setAvailableCategories] = useState<{name: string, count: number}[]>([]);

  // 0. Preload pool and initial candidate on mount OR when modes change in setup
  useEffect(() => {
    if (state.status === 'setup') {
      prepareInitialSongs(shuffleMode, hardMode, selectedCategories);
    }
  }, [prepareInitialSongs, state.status, shuffleMode, hardMode, selectedCategories]);

  useEffect(() => {
    fetch('/Tax-Refund/data/songs.json')
      .then(res => res.json())
      .then((songs: any[]) => {
        const counts: Record<string, number> = {};
        songs.forEach(s => {
          if (s.status !== 'completed' || !s.year) return;
          const cat = s.category || 'Anime';
          counts[cat] = (counts[cat] || 0) + 1;
        });
        
        const cats = Object.entries(counts).map(([name, count]) => ({ name, count }));
        setAvailableCategories(cats);
        
        // Ensure starting categories exist
        const validSelected = selectedCategories.filter(sc => counts[sc]);
        if (validSelected.length === 0 && cats.length > 0) {
          setSelectedCategories([cats[0].name]);
        }
      })
      .catch(console.error);
  }, []);

  // 1. Auto-prepare stream & reset state
  useEffect(() => {
    if (state.status === 'playing' && state.mysteryCard?.youtubeId) {
      prepare(state.mysteryCard.youtubeId);
      setLocalIsPlaying(false);
      setShowResultModal(false);
      if (state.players.filter(p => p.lives > 0).length > 1) {
        setIsSoloContinuing(false); // Reset solo mode if we are back to actual multiplayer
      }
    } else if (state.status === 'setup' && state.candidateMystery?.youtubeId) {
      // PRELOAD the first song while in setup screen
      prepare(state.candidateMystery.youtubeId);
    }
  }, [state.status, state?.mysteryCard?.id, state?.candidateMystery?.youtubeId, state.playbackStart, state.playbackEnd, prepare]);


  // 2. Global status observer (Cleanup)
  useEffect(() => {
    if (state.status === 'gameOver') {
      reset();
    }
  }, [state.status, reset]);

  // 3. Preload next mystery & pool in background
  useEffect(() => {
    if (state.status === 'playing') {
      // High priority: The very next card
      if (state.nextMysteryCard?.youtubeId) {
        prefetch(state.nextMysteryCard.youtubeId);
      }

      // Low priority: General pool
      if (state?.pool?.length > 0) {
        const remaining = state.pool.filter(s => !state.usedIds.includes(s.id));
        remaining.slice(0, 3).forEach(s => prefetch(s.youtubeId));
      }
    }
  }, [state?.status, state.nextMysteryCard?.id, state?.pool, state?.usedIds, prefetch]);

  // 4. Result modal delay
  useEffect(() => {
    if (state.status === 'revealing' && state.lastResult) {
      const timer = setTimeout(() => setShowResultModal(true), 800);
      return () => clearTimeout(timer);
    } else {
      setShowResultModal(false);
    }
  }, [state.status, state.lastResult]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handlePlaySnippet = useCallback(() => {
    if (!state?.mysteryCard || !isReady) return;

    if (isPlaying) {
      togglePlayback();
      setLocalIsPlaying(false);
      // Consume listen when pausing or when it ends
      if (state.oneListenOnly) consumeListen();
    } else {
      if (state.oneListenOnly && state.listenedCurrentRound) return;

      setLocalIsPlaying(true);
      playExcerpt(
        state.mysteryCard.youtubeId, 
        state.playbackStart ?? state.mysteryCard.startTime, 
        state.playbackEnd ?? state.mysteryCard.endTime,
        () => {
          setLocalIsPlaying(false);
          if (state.oneListenOnly) consumeListen();
        }
      );
    }
  }, [state.mysteryCard, state.playbackStart, state.playbackEnd, state.oneListenOnly, state.listenedCurrentRound, isReady, isPlaying, togglePlayback, playExcerpt, consumeListen]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    setActiveId(null);

    if (over) {
      const separatorIdx = parseInt(String(over.id));
      if (!isNaN(separatorIdx)) {
        checkPlacement(separatorIdx);
      }
    }
  };

  if (state.status === 'setup') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-4">
        <div className="w-full max-w-md mt-12 bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
               <Music className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black italic tracking-tighter uppercase">Vinyl Timeline</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 text-center">Put the records in the right order</p>
          </div>

          <div className="space-y-4 mb-8">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">The Players</label>
            {playerNames.map((name, i) => (
              <div key={i} className="group relative flex items-center gap-2">
                <div className="absolute left-4 z-10">
                   <Users size={14} className="text-slate-500 group-focus-within:text-white transition-colors" />
                </div>
                <input 
                  value={name}
                  onChange={(e) => {
                    const next = [...playerNames];
                    next[i] = e.target.value;
                    setPlayerNames(next);
                  }}
                  placeholder={`Player ${i + 1}`}
                  className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-slate-700 focus:outline-none focus:border-white/20 focus:bg-slate-950 transition-all"
                />
                {playerNames.length > 1 && (
                  <button 
                    onClick={() => setPlayerNames(playerNames.filter((_, idx) => idx !== i))}
                    className="p-3 text-slate-600 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            
            {playerNames.length < 5 && (
              <button 
                onClick={() => setPlayerNames([...playerNames, ''])}
                className="w-full py-3 flex items-center justify-center gap-2 border border-dashed border-white/10 rounded-xl text-slate-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest"
              >
                <Plus size={16} />
                <span>Add Player</span>
              </button>
            )}
          </div>

          {/* Settings Section */}
          <div className="space-y-6 mb-8 pt-6 border-t border-white/5">
             <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Song Categories</label>
                  <button 
                    onClick={() => {
                      if (selectedCategories.length === availableCategories.length) {
                        setSelectedCategories([availableCategories[0]?.name || 'Anime']);
                      } else {
                        setSelectedCategories(availableCategories.map(c => c.name));
                      }
                    }}
                    className="text-[8px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {selectedCategories.length === availableCategories.length ? 'Reset' : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                   {availableCategories.map(cat => (
                     <button 
                       key={cat.name}
                       onClick={() => {
                         const next = selectedCategories.includes(cat.name)
                           ? selectedCategories.filter(c => c !== cat.name)
                           : [...selectedCategories, cat.name];
                         if (next.length > 0) setSelectedCategories(next);
                       }}
                       className={`px-4 py-3 rounded-2xl flex flex-col items-start gap-1 transition-all border ${
                         selectedCategories.includes(cat.name) 
                           ? 'bg-rose-600 border-rose-500 text-white shadow-lg' 
                           : 'bg-slate-950/50 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                       }`}
                     >
                       <span className="text-[10px] font-black uppercase tracking-tight">{cat.name}</span>
                       <span className={`text-[8px] font-bold uppercase opacity-60 ${selectedCategories.includes(cat.name) ? 'text-white' : 'text-slate-500'}`}>
                        {cat.count} Songs
                       </span>
                     </button>
                   ))}
                </div>
             </div>

             <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Game Mode</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/50 rounded-2xl border border-white/5">
                    <button 
                      onClick={() => setGameMode('survivor')}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${gameMode === 'survivor' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                      Survivor
                    </button>
                    <button 
                      onClick={() => setGameMode('points')}
                      className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${gameMode === 'points' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                      Points
                    </button>
                </div>
             </div>

             <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group"
                  onClick={() => setOneListenOnly(!oneListenOnly)}>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-white uppercase flex items-center gap-2">
                     One Listen Only
                     <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                   </span>
                   <span className="text-[8px] font-medium text-slate-500 uppercase tracking-tighter">Snippet plays once per turn</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${oneListenOnly ? 'bg-rose-600' : 'bg-slate-800'}`}>
                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${oneListenOnly ? 'left-6' : 'left-1'}`} />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className={`flex flex-col gap-2 p-4 bg-slate-950/50 rounded-2xl border transition-all cursor-pointer group ${shuffleMode ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/5'}`}
                     onClick={() => setShuffleMode(!shuffleMode)}>
                  <div className="flex items-center justify-between">
                    <Shuffle size={14} className={shuffleMode ? 'text-rose-500' : 'text-slate-500'} />
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${shuffleMode ? 'bg-rose-600' : 'bg-slate-800'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${shuffleMode ? 'left-6' : 'left-1'}`} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white uppercase">Shuffle</span>
                    <span className="text-[8px] font-medium text-slate-500 uppercase tracking-tighter">Random 20s Clip</span>
                  </div>
                </div>

                <div className={`flex flex-col gap-2 p-4 bg-slate-950/50 rounded-2xl border transition-all cursor-pointer group ${hardMode ? 'border-rose-500/50 bg-rose-500/5' : 'border-white/5'}`}
                     onClick={() => setHardMode(!hardMode)}>
                  <div className="flex items-center justify-between">
                    <Zap size={14} className={hardMode ? 'text-rose-500' : 'text-slate-500'} />
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${hardMode ? 'bg-rose-600' : 'bg-slate-800'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${hardMode ? 'left-6' : 'left-1'}`} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white uppercase">Hard Mode</span>
                    <span className="text-[8px] font-medium text-slate-500 uppercase tracking-tighter">10s Snippet Only</span>
                  </div>
                </div>
             </div>
          </div>

          <button 
            onClick={() => setupGame(playerNames, gameMode, oneListenOnly, shuffleMode, hardMode, selectedCategories)}
            className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black italic tracking-tighter uppercase shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            Start Game
          </button>
        </div>
      </div>
    );
  }

  // GAME OVER SCREEN
  if (state.status === 'gameOver') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
         {/* Survivor Mode Winner Overlay */}
         {!isSoloContinuing && state.players.filter(p => p.lives > 0).length === 1 && (
           <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-1000">
               <div className="w-20 h-20 rounded-2xl bg-amber-500 flex items-center justify-center mb-6 shadow-amber-500/20 shadow-2xl border border-amber-400/50">
                  <Zap className="text-white w-10 h-10 fill-current" />
               </div>
               <h3 className="text-xl font-black text-slate-500 uppercase tracking-widest mb-1">Survivor Found</h3>
               <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-8">{state.players.find(p => p.lives > 0)?.name} Wins!</h2>
               <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button 
                    onClick={() => setIsSoloContinuing(true)}
                    className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black italic tracking-tighter uppercase shadow-2xl hover:scale-105 transition-all"
                  >
                    Keep Playing Solo
                  </button>
                  <button 
                    onClick={endGame}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black italic tracking-tighter uppercase border border-white/10 hover:bg-slate-800 transition-all"
                  >
                    End Game
                  </button>
               </div>
           </div>
         )}

         <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/40 border border-indigo-400 rotate-6">
            <Music className="text-white w-12 h-12" />
         </div>
         <h1 className="text-6xl font-black italic tracking-tighter uppercase mb-2">Game Over</h1>
         <p className="text-slate-500 font-bold uppercase tracking-widest mb-12">The music has stopped</p>

         <div className="w-full max-w-sm space-y-4 mb-12">
            {state.players.sort((a,b) => b.score - a.score).map((p, i) => (
              <div key={p.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${i === 0 ? 'bg-white text-slate-950 border-white scale-110 shadow-2xl z-10' : 'bg-slate-900/50 border-white/5 text-slate-400'}`}>
                <div className="flex items-center gap-4">
                  <span className={`text-xl font-black font-mono ${i === 0 ? 'text-indigo-600' : 'text-slate-700'}`}>#{i+1}</span>
                  <span className="font-black uppercase tracking-tight">{p.name}</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-xs font-bold opacity-50 uppercase tracking-widest">Score</span>
                   <span className="text-lg font-black">{p.score}</span>
                </div>
              </div>
            ))}
         </div>

         <button 
           onClick={resetGame}
           className="px-12 py-5 bg-white text-slate-950 rounded-2xl font-black italic tracking-tighter uppercase shadow-2xl hover:scale-110 transition-all active:rotate-0 -rotate-2"
         >
           Play Again
         </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center overflow-x-hidden pb-32">
        {/* HEADER / STATUS */}
        <div className="w-full flex items-center justify-between px-6 py-8 sm:px-12 sm:py-12 relative z-50">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Current Player</span>
              <h2 className="text-3xl font-black italic tracking-tighter uppercase">
                {state.players[state.currentPlayerIndex].name}
              </h2>
           </div>

           <div className="flex items-center gap-6">
              <button 
                onClick={resetGame}
                className="p-3 rounded-xl bg-slate-900 border border-white/5 text-slate-500 hover:text-white hover:border-white/10 transition-all flex items-center gap-2 group"
                title="Restart Game"
              >
                <RotateCcw size={16} className="group-hover:rotate-[-45deg] transition-transform" />
                <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest">Restart</span>
              </button>

              <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Score</span>
                 <span className="text-3xl font-black tabular-nums tracking-tighter leading-none">{state.players[state.currentPlayerIndex].score}</span>
              </div>
              {state.mode === 'survivor' && (
                <div className="flex items-center gap-1.5 mt-4">
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                        i < state.players[state.currentPlayerIndex].lives ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-slate-800'
                      }`} 
                    />
                  ))}
                </div>
              )}
           </div>
        </div>

        <DndContext 
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* COMPACT PLAYER AREA */}
          <div className="relative flex flex-col items-center gap-4 w-full px-4">
             {/* Draggable Area */}
             <div className="w-full flex justify-center h-64 sm:h-72 mb-4">
                  <div className="scale-75 sm:scale-100 origin-center">
                      <DraggableVinylCard 
                        id={state.mysteryCard?.id || 0}
                        song={state.mysteryCard}
                        displayMode={state.status === 'revealing' ? 'revealed' : state.status === 'playing' ? 'mystery' : 'revealed'}
                      />
                  </div>
             </div>

             {/* Controls */}
             <VinylAudioController 
               isPlaying={isPlaying}
               isReady={isReady}
               progress={progress}
               onToggle={handlePlaySnippet}
               playerStatus={playerStatus}
               lastError={lastError}
               onRetry={() => state.mysteryCard && prepare(state.mysteryCard.youtubeId, true)}
               oneListenOnly={state.oneListenOnly}
               listenedCurrentRound={state.listenedCurrentRound}
             />
          </div>

          {/* TIMELINE */}
          <div className="w-full max-w-6xl px-2 sm:px-8 mt-4 overflow-x-hidden">
             <Timeline 
               songs={state.timeline || []} 
             />
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="w-48 h-48 scale-50 opacity-80 pointer-events-none transform-gpu transition-transform duration-200">
                <VinylCard 
                  song={state.mysteryCard} 
                  displayMode="mystery" 
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* OVERLAYS */}
        {playerStatus === 'error' && state.mysteryCard && (
           <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-full max-w-sm p-8 bg-slate-900 border border-rose-500/30 rounded-[2.5rem] flex flex-col items-center text-center shadow-2xl">
                 <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 border border-rose-500/20">
                    <AlertCircle className="text-rose-500 w-8 h-8" />
                 </div>
                 
                 <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Connection Blocked</h3>
                 
                 <div className="p-4 bg-black/40 rounded-2xl border border-white/5 w-full mb-6 text-left">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Failing Song:</p>
                    <p className="text-sm font-bold text-white mb-1 line-clamp-1">{state.mysteryCard.name}</p>
                    <p className="text-[8px] font-medium text-slate-500 break-all opacity-40 mb-3">
                       ID: {state.mysteryCard.youtubeId}
                    </p>
                    
                    {lastError && (
                       <div className="mt-2 pt-2 border-t border-white/5">
                          <p className="text-[10px] font-black text-rose-500/80 uppercase tracking-widest mb-1">Technical Detail:</p>
                          <p className="text-[10px] font-bold text-rose-200/60 leading-tight">
                             {lastError}
                          </p>
                       </div>
                    )}
                 </div>

                 <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed mb-8">
                    YouTube is blocking this specific stream. You can retry or skip this song to keep the game going.
                 </p>

                 <div className="flex flex-col gap-3 w-full">
                    <button 
                      onClick={() => prepare(state.mysteryCard!.youtubeId, true)}
                      className="w-full py-4 bg-white text-slate-950 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                       Try Reconnecting
                    </button>
                    <button 
                      onClick={skipCurrentMystery}
                      className="w-full py-4 bg-rose-600/10 text-rose-500 border border-rose-500/20 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-500/20 transition-all"
                    >
                       Skip This Card
                    </button>
                 </div>
              </div>
           </div>
        )}

        {state.status === 'revealing' && state.lastResult && showResultModal && (
           <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 animate-in fade-in duration-500 ${
             state.lastResult.success ? 'bg-emerald-950/95' : 'bg-rose-950/95'
           } backdrop-blur-xl`}>
              <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl animate-bounce border ${
                state.lastResult.success ? 'bg-emerald-500 border-emerald-400' : 'bg-rose-500 border-rose-400'
              }`}>
                 {state.lastResult.success ? <Music className="text-white w-10 h-10" /> : <Music className="text-white w-10 h-10 opacity-50" />}
              </div>
              <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-2 text-center">
                 {state.lastResult.success ? 'Brilliant!' : 'Nope!'}
              </h2>
              <div className="flex flex-col items-center gap-1 mb-10">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Correct Year</span>
                 <span className="text-6xl font-black text-white tabular-nums tracking-tighter leading-none">{state.lastResult.correctYear}</span>
              </div>
              <div className="w-full max-w-sm flex flex-col items-center gap-6">
                 <VinylCard 
                    song={state.mysteryCard} 
                    displayMode="revealed"
                 />
                 <button 
                   onClick={proceedToNextPlayer}
                   className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black italic tracking-tighter uppercase shadow-2xl hover:scale-105 transition-all"
                 >
                   Continue
                 </button>
              </div>
           </div>
        )}
    </div>
  );
};
