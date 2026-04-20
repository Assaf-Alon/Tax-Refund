import React, { useState, useEffect, useCallback } from 'react';
import { 
  DndContext, 
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MapPin, Navigation, CheckCircle2, ArrowLeft } from 'lucide-react';

import { VinylCard } from '../../../shared/components/Vinyl/VinylCard';
import { VinylAudioController } from '../../../shared/components/Vinyl/VinylAudioController';
import { useAudioStream } from '../../../shared/hooks/useAudioStream';
import { isChronological } from '../../../shared/utils/vinyl-logic';
import { getRiddleProgress, updateRiddleProgress } from '../../../shared/logic/gameState';
import { CongratsStage } from '../../../shared/stages/CongratsStage';
import { TextAnswerStage } from '../../../shared/stages/TextAnswerStage';
import { DevSkipButton } from '../../admin/DevSkipButton';
import { IT_STAGE_DATA } from './data/stages';
import { HP_THEME as theme } from './theme';
import type { SongItem } from '../../../shared/types/music';
import { useTitle } from '../../../hooks/useTitle';
import { useFavicon } from '../../../hooks/useFavicon';

const RIDDLE_ID = 'its-a-hit';

interface SortableItemProps {
  id: string;
  song: SongItem;
  displayMode: 'mystery' | 'revealed';
  isActive?: boolean;
  isPlaying?: boolean;
  validationStatus?: 'correct' | 'incorrect' | null;
  onSelect: (song: SongItem) => void;
}

const SortableVinylItem: React.FC<SortableItemProps> = ({ 
  id, 
  song, 
  displayMode, 
  isActive, 
  isPlaying, 
  validationStatus,
  onSelect
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative group touch-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
    >
      <div 
        {...attributes} 
        {...listeners}
        onClick={() => onSelect(song)}
      >
        <VinylCard 
          song={song} 
          displayMode={displayMode}
          isPlaying={isPlaying && isActive}
          showThumbnail={true}
          className={`
            ${isActive ? 'ring-2 ring-emerald-500 ring-offset-4 ring-offset-slate-950' : ''} 
            ${validationStatus === 'correct' ? 'ring-4 ring-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]' : ''}
            ${validationStatus === 'incorrect' ? 'ring-4 ring-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)]' : ''}
            transition-all duration-300 scale-90 sm:scale-100
          `}
        />
      </div>
    </div>
  );
};

export const ItsAHitRiddle: React.FC = () => {
  useTitle("Sonic Sequencer");
  useFavicon(`${import.meta.env.BASE_URL}ih-48.png`);

  const [currentStageIdx, setCurrentStageIdx] = useState<number | null>(null);
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [userOrder, setUserOrder] = useState<SongItem[]>([]);
  const [activeSong, setActiveSong] = useState<SongItem | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStageUnlocked, setIsStageUnlocked] = useState(false);
  const [isCongratsUnlocked, setIsCongratsUnlocked] = useState(false);
  const [validationResults, setValidationResults] = useState<Record<number, 'correct' | 'incorrect'>>({});
  const [isButtonShaking, setIsButtonShaking] = useState(false);

  const { 
    status: playerStatus,
    isReady, 
    isPlaying, 
    prepare,
    playExcerpt,
    togglePlayback,
    stop,
    progress,
    lastError
  } = useAudioStream();

  // Load progress and songs
  useEffect(() => {
    const savedProgress = getRiddleProgress(RIDDLE_ID);
    const stageIdx = typeof savedProgress === 'number' ? savedProgress : 0;
    setCurrentStageIdx(stageIdx);

    fetch('/Tax-Refund/data/songs.json')
      .then(res => res.json())
      .then((allSongs: SongItem[]) => {
        setSongs(allSongs);
        loadStage(stageIdx, allSongs);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const loadStage = (idx: number, allSongs: SongItem[]) => {
    const stage = IT_STAGE_DATA[idx];
    if (!stage) return;

    const filtered = allSongs.filter(s => stage.songIds.includes(s.id));
    // Ensure songs are in the order we expect for mapping revealWords correctly if they are sorted by player?
    // Wait, revealWords should match the SONG, not the position. 
    // Let's create a map or just ensure we store the correct word with the song.
    
    // Actually, revealWords[i] matches stage.songIds[i]? No, the user provided them in chronological order.
    // So if the player sorts them correctly, we show the words in chronological order.
    
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    
    setUserOrder(shuffled);
    setIsRevealed(false);
    setActiveSong(null);
    setIsStageUnlocked(false);
    setValidationResults({});
    setIsButtonShaking(false);

    // PRE-PREPARE: Fully initialize player instances to ensure gesture-safe instant play
    filtered.forEach(song => {
      prepare(song.youtubeId);
    });
  };

  const currentStage = currentStageIdx !== null ? IT_STAGE_DATA[currentStageIdx] : null;

  const handleTogglePlayback = useCallback(() => {
    if (!activeSong || !isReady) return;

    if (isPlaying) {
      togglePlayback();
    } else {
      playExcerpt(activeSong.youtubeId, activeSong.startTime, activeSong.endTime);
    }
  }, [activeSong, isReady, isPlaying, togglePlayback, playExcerpt]);

  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { distance: 8 } 
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (isRevealed) return;
    setActiveDragId(event.active.id as string);
    setValidationResults({}); // Clear highlights when user starts moving
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (isRevealed) return;
    const { active, over } = event;
    setActiveDragId(null);
    if (over && active.id !== over.id) {
      setUserOrder((items) => {
        const oldIndex = items.findIndex(i => String(i.id) === active.id);
        const newIndex = items.findIndex(i => String(i.id) === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const checkOrder = () => {
    if (isChronological(userOrder)) {
      setIsRevealed(true);
      setValidationResults({});
    } else {
      // Calculate correct order based on stage data
      if (!currentStage) return;
      
      const results: Record<number, 'correct' | 'incorrect'> = {};
      userOrder.forEach((song, idx) => {
        if (song.id === currentStage.songIds[idx]) {
          results[song.id] = 'correct';
        } else {
          results[song.id] = 'incorrect';
        }
      });
      
      setValidationResults(results);
      setIsButtonShaking(true);
      setTimeout(() => setIsButtonShaking(false), 1000);
    }
  };

  const handleSelectSong = useCallback(async (song: SongItem) => {
    if (isRevealed) return;
    
    // Toggle logic: Use explicit ID comparison to avoid reference issues
    const currentActiveId = activeSong?.id ? Number(activeSong.id) : null;
    const clickedSongId = Number(song.id);

    if (currentActiveId === clickedSongId) {
       togglePlayback();
    } else {
       setActiveSong(song);
       stop();
       await prepare(song.youtubeId);
       playExcerpt(song.youtubeId, song.startTime, 0); 
    }
  }, [activeSong, isRevealed, togglePlayback, stop, prepare, playExcerpt]);

  // Stop music on unmount or stage change
  useEffect(() => {
    return () => stop();
  }, [currentStageIdx, stop]);

  const nextStage = () => {
    if (currentStageIdx === null) return;
    const nextIdx = currentStageIdx + 1;
    setCurrentStageIdx(nextIdx);
    updateRiddleProgress(RIDDLE_ID, nextIdx);
    if (nextIdx < IT_STAGE_DATA.length) {
      loadStage(nextIdx, songs);
    }
  };

  const handleDevSkip = () => {
    if (currentStageIdx === null) return;
    
    // If at the end but congrats is locked, unlock congrats
    if (currentStageIdx === IT_STAGE_DATA.length) {
      if (!isCongratsUnlocked) {
        setIsCongratsUnlocked(true);
      }
      return;
    }

    // If current stage is locked, unlock it
    if (!isStageUnlocked) {
      setIsStageUnlocked(true);
    } else {
      // If current stage is unlocked, skip to next stage
      nextStage();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-emerald-500 font-bold uppercase tracking-widest text-[10px]">Loading Hit Data...</p>
      </div>
    );
  }

  if (currentStageIdx === IT_STAGE_DATA.length) {
    if (!isCongratsUnlocked) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
          <TextAnswerStage 
            title="Final Verification"
            prompt="You have reached the final destination. Enter the keyword found at the Hill to claim your victory."
            acceptedAnswers={['Raanana']}
            onAdvance={() => setIsCongratsUnlocked(true)}
            errorMessage="That keyword doesn't match the Hill..."
            placeholder="Enter final keyword..."
            submitButtonLabel="Verify Arrival"
            theme={{
              title: "text-2xl font-black uppercase tracking-widest text-white mb-4",
              promptText: "text-sm text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed",
              input: "w-full max-w-xs bg-black/40 border border-emerald-500/20 p-4 text-center focus:border-emerald-500 focus:outline-none transition-colors rounded-2xl text-emerald-500 font-bold tracking-widest uppercase mb-4",
              submitButton: theme.button.primary + " w-full max-w-xs text-sm py-4",
              errorText: "text-rose-500 text-[10px] font-bold mt-2"
            }}
          />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
        <CongratsStage 
          title="Sonic Sequencer"
          subtitle={
            <div className="flex flex-col gap-4">
              <p>You've mastered the charts and reached the final hill.</p>
              <p className="text-emerald-500 font-bold text-sm">Up next - Raanana Park! Might want to check out the lake there as well...</p>
            </div>
          }
          theme={theme.congrats}
        >
          <button 
            onClick={() => {
              setCurrentStageIdx(0);
              updateRiddleProgress(RIDDLE_ID, 0);
              loadStage(0, songs);
              setIsCongratsUnlocked(false);
            }}
            className={theme.button.secondary}
          >
            Restart Journey
          </button>
        </CongratsStage>
      </div>
    );
  }

  if (!currentStage) return null;

  if (!isStageUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center mb-12">
           <MapPin size={24} className="text-emerald-500 mb-4" />
           <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{currentStage.locationName}</h1>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Arrive at location to unlock</p>
        </div>

        <TextAnswerStage 
          title="Check-In Required"
          prompt={`Enter the keyword found at ${currentStage.locationName} to begin the riddle.`}
          acceptedAnswers={[currentStage.entryKeyword]}
          onAdvance={() => setIsStageUnlocked(true)}
          errorMessage="Incorrect keyword. Are you at the right spot?"
          placeholder="Enter location keyword..."
          submitButtonLabel="Unlock Riddle"
          theme={{
            title: "text-sm font-black uppercase tracking-widest text-white mb-2",
            promptText: "text-[10px] text-slate-400 mb-6 max-w-[200px] mx-auto leading-relaxed",
            input: "w-full max-w-xs bg-black/40 border border-emerald-500/20 p-4 text-center focus:border-emerald-500 focus:outline-none transition-colors rounded-2xl text-emerald-500 font-bold tracking-widest uppercase mb-4",
            submitButton: theme.button.primary + " w-full max-w-xs text-sm py-4",
            errorText: "text-rose-500 text-[10px] font-bold mt-2"
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center overflow-x-hidden pb-32">
      <div className="w-full px-6 py-8 sm:px-12 sm:py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-50">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
             <MapPin size={12} className="text-emerald-500" />
             <span className={theme.text.subtitle}>{currentStage.locationName}</span>
          </div>
          <h1 className={theme.text.title}>Sonic Sequencer</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Location</span>
            <span className="text-3xl font-black tabular-nums tracking-tighter leading-none">
              {(currentStageIdx ?? 0) + 1}<span className="text-slate-700">/{IT_STAGE_DATA.length}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl px-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
         <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-6 backdrop-blur-xl flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
               <Navigation size={20} className="text-emerald-500" />
            </div>
            <div>
               <p className={theme.text.hint}>Next Destination</p>
               <p className={theme.text.body}>{currentStage.hint}</p>
            </div>
         </div>
      </div>

      <div className="relative w-full flex flex-col items-center gap-12 px-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex flex-col items-center gap-4 w-full">
            <SortableContext items={userOrder.map(s => String(s.id))} strategy={verticalListSortingStrategy}>
              {userOrder.map((song) => {
                return (
                  <SortableVinylItem 
                    key={song.id}
                    id={String(song.id)}
                    song={song}
                    displayMode={isRevealed ? 'revealed' : 'mystery'}
                    isActive={activeSong?.id === song.id}
                    isPlaying={isPlaying}
                    validationStatus={validationResults[song.id]}
                    onSelect={handleSelectSong}
                  />
                );
              })}
            </SortableContext>
          </div>
          <DragOverlay>
            {activeDragId ? (
              <div className="scale-95 opacity-80 pointer-events-none">
                <VinylCard song={userOrder.find(s => String(s.id) === activeDragId) || null} displayMode="mystery" />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {!isRevealed ? (
          <div className="flex flex-col items-center gap-8 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <VinylAudioController 
              isPlaying={isPlaying} 
              isReady={isReady} 
              progress={progress} 
              onToggle={handleTogglePlayback} 
              playerStatus={playerStatus} 
              lastError={lastError} 
              onRetry={() => activeSong && prepare(activeSong.youtubeId, true)} 
              hidePlayButton 
            />
            <button 
              onClick={checkOrder} 
              className={`
                ${theme.button.primary} 
                ${isButtonShaking ? 'animate-shake bg-rose-600 hover:bg-rose-600 shadow-rose-500/40' : ''}
                transition-colors duration-200
              `}
            >
              Verify Chronology
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-12 w-full max-w-md animate-in zoom-in duration-700">
             <div className="flex items-center gap-3 text-emerald-500">
                <CheckCircle2 size={32} />
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Correct Sequence!</h3>
             </div>
             
             <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center w-full">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-6">Location Key Unlocked</p>
                <div className="flex flex-col gap-2 mb-8">
                   {[...userOrder].sort((a,b) => (parseInt(a.year||'0') - parseInt(b.year||'0'))).map((s) => (
                       <div key={s.id} className="text-xs text-emerald-500/80 font-medium">
                          ✓ {s.year} {s.name}{s.category === 'Anime' ? ` - ${s.info}` : ''}
                       </div>
                   ))}
                </div>
                
                <TextAnswerStage 
                  title="Next Destination"
                  prompt="Use your Field Guide and the information above to decode the next location."
                  acceptedAnswers={[currentStage.nextLocationAnswer]}
                  onAdvance={nextStage}
                  errorMessage="That location doesn't seem right..."
                  placeholder="Type the next location..."
                  submitButtonLabel="Move to Destination"
                  theme={{
                    title: "text-sm font-black uppercase tracking-widest text-white mb-2",
                    promptText: "text-[10px] text-slate-400 mb-6 max-w-[200px] mx-auto leading-relaxed",
                    input: "w-full bg-black/40 border border-emerald-500/20 p-4 text-center focus:border-emerald-500 focus:outline-none transition-colors rounded-2xl text-emerald-500 font-bold tracking-widest uppercase mb-4",
                    submitButton: theme.button.primary + " w-full text-sm py-4",
                    errorText: "text-rose-500 text-[10px] font-bold mt-2"
                  }}
                />
             </div>
          </div>
        )}
      </div>
      <button onClick={() => window.history.back()} className="fixed bottom-8 left-8 p-4 rounded-full bg-slate-900/80 border border-white/5 text-slate-500 hover:text-white transition-all backdrop-blur-xl"><ArrowLeft size={20} /></button>
      
      <DevSkipButton 
        riddleId={RIDDLE_ID} 
        currentStage={currentStageIdx ?? 0} 
        totalStages={IT_STAGE_DATA.length + 1} 
        onSkip={handleDevSkip} 
      />
    </div>
  );
};
