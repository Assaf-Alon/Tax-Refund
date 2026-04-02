import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    restrictToVerticalAxis,
    restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CharacterInput } from '../../../../shared/ui/CharacterInput';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { useKeyboardInput } from '../hooks/useKeyboardInput';

interface WordData {
    id: string;
    answer: string;
    clue: string;
    isLockedInitially?: boolean;
}

interface CrossclimbStageProps {
    onAdvance: (time?: number) => void;
}

const WORDS: WordData[] = [
    { id: '1', answer: 'stark', clue: 'To keep value secure (as a ZK-rollup pioneer or a shop)', isLockedInitially: true },
    { id: '2', answer: 'spark', clue: 'Aimer has a song named \'_____ Again\'' },
    { id: '3', answer: 'spare', clue: 'An extra tire or bowling\'s second-best' },
    { id: '4', answer: 'share', clue: 'To distribute equity or social media action' },
    { id: '5', answer: 'shore', clue: 'A coastal boundary or to prop things up' },
    { id: '6', answer: 'store', clue: 'To keep value secure (as a ZK-rollup pioneer or a shop)', isLockedInitially: true },
];

interface SortableRowProps {
    row: WordData;
    idx: number;
    phase: string;
    active: boolean;
    isSolved: boolean;
    handleWordComplete: (rowId: string, value: string) => void;
    setActiveIndex: (idx: number) => void;
    checkDistance: (word1: string, word2: string) => number;
    prevRow?: WordData;
    prevRowSolved?: boolean;
    isJustCorrect?: boolean;
    // New controlled props
    draftValue: string[];
    activeCharIndex: number;
    setActiveCharIndex: (charIdx: number) => void;
}

const SortableRow: React.FC<SortableRowProps> = ({
    row, idx, phase, active, isSolved, handleWordComplete, setActiveIndex, checkDistance, prevRow, prevRowSolved, isJustCorrect,
    draftValue, activeCharIndex, setActiveCharIndex
}) => {
    const isLockedRow = row.isLockedInitially && phase !== 'REORDER' && phase !== 'FINAL' && phase !== 'COMPLETE';
    
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ 
        id: row.id,
        disabled: phase !== 'REORDER'
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? 'none' : transition,
        zIndex: isDragging ? 50 : 1,
    };

    let bgColor = 'bg-white dark:bg-gray-800/50';
    let borderColor = 'border-gray-100 dark:border-gray-800';
    
    if (isLockedRow) {
        bgColor = 'bg-gray-50 dark:bg-gray-900/40';
    } else if (active) {
        bgColor = 'bg-blue-50 dark:bg-blue-900/20';
        borderColor = 'border-blue-300 dark:border-blue-700/50';
    } else if (isSolved) {
        bgColor = 'bg-green-50 dark:bg-green-900/10';
        borderColor = 'border-green-100 dark:border-green-900/20';
    }

    if (phase === 'FINAL' || phase === 'COMPLETE') {
        if (row.isLockedInitially) {
            if (active) {
                bgColor = 'bg-orange-100 dark:bg-orange-900/30';
                borderColor = 'border-orange-300 dark:border-orange-700';
            } else if (isSolved) {
                bgColor = 'bg-green-50 dark:bg-green-900/10';
                borderColor = 'border-green-200 dark:border-green-800';
            } else {
                bgColor = 'bg-[#ffe7d9] dark:bg-orange-950/40';
                borderColor = 'border-orange-200 dark:border-orange-900/50';
            }
        }
    }

    const showDistanceEqual = idx > 0 && prevRow;
    const isDistanceOne = showDistanceEqual && isSolved && prevRowSolved && checkDistance(prevRow!.answer, row.answer) === 1;

    return (
        <React.Fragment>
            {showDistanceEqual && (
                <div className="flex justify-between items-center px-4 w-full h-0 relative">
                    <div className="absolute left-0 right-0 flex justify-between items-center px-[22px] -top-1.5 bottom-0 pointer-events-none">
                        {[0, 1].map(i => (
                            <div key={i} className="flex flex-col items-center">
                                <div className={`w-0.5 h-3 md:h-4 transition-all duration-500 ${isDistanceOne ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-transparent'}`} />
                                <div className={`text-[10px] font-bold transition-colors duration-500 -mt-1 ${isDistanceOne ? 'text-green-500' : 'text-gray-300 dark:text-gray-700'}`}>=</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div 
                ref={setNodeRef}
                style={style}
                onClick={() => {
                    if (!isLockedRow) {
                        setActiveIndex(idx);
                    }
                }}
                className={`
                    relative w-full h-11 rounded-lg border-2 flex items-center justify-center
                    ${bgColor} ${borderColor} ${active ? 'scale-[1.02] shadow-md z-10' : 'scale-100 shadow-sm'}
                    ${phase === 'REORDER' ? 'cursor-grab active:cursor-grabbing hover:border-blue-300 dark:hover:border-blue-700 touch-none' : ''}
                    ${isLockedRow ? 'opacity-80' : ''}
                    ${isDragging ? 'shadow-2xl opacity-90 scale-105 border-blue-400 dark:border-blue-500' : ''}
                    ${isJustCorrect ? 'animate-bounce !border-green-400 !bg-green-100 dark:!bg-green-900/30' : ''}
                    transition-all duration-300
                `}
                {...attributes}
                {...listeners}
            >
                {isLockedRow ? (
                    <div className="flex items-center justify-center text-gray-400">
                        <span role="img" aria-label="locked" className="text-xl">🔒</span>
                    </div>
                ) : isSolved ? (
                    <div className="font-mono text-xl font-bold tracking-[0.5em] text-blue-900 dark:text-blue-100 uppercase mt-1">
                        {row.answer}
                    </div>
                ) : (
                    <div className={active ? '' : 'pointer-events-none'}>
                        <CharacterInput
                            expectedValue={row.answer}
                            onComplete={() => handleWordComplete(row.id, row.answer)}
                            value={draftValue}
                            activeIndex={active ? activeCharIndex : undefined}
                            onCharFocus={(charIdx) => {
                                setActiveIndex(idx);
                                setActiveCharIndex(charIdx);
                            }}
                            readOnlyMode={true}
                            onFocus={() => setActiveIndex(idx)}
                            autoFocus={active}
                            locked={false}
                            backgroundColor="bg-white/10 dark:bg-black/10"
                            borderColor={{ unlocked: 'border-transparent' }}
                            textColor={{ unlocked: 'text-blue-900 dark:text-blue-100' }}
                        />
                    </div>
                )}

                {phase === 'REORDER' && (
                    <div className="absolute right-4 opacity-20 text-gray-400 cursor-grab active:cursor-grabbing">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M4 8h16M4 16h16" />
                        </svg>
                    </div>
                )}
            </div>
        </React.Fragment>
    );
};

export const CrossclimbStage: React.FC<CrossclimbStageProps> = ({
    onAdvance,
}) => {
    const [rows, setRows] = useState<WordData[]>(() => {
        const middle = [...WORDS.slice(1, WORDS.length - 1)];
        for (let i = middle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [middle[i], middle[j]] = [middle[j], middle[i]];
        }
        return [WORDS[0], ...middle, WORDS[WORDS.length - 1]];
    });

    const [solvedWords, setSolvedWords] = useState<Record<string, string>>({});
    const [activeIndex, setActiveIndex] = useState<number>(1);
    const [justCorrectId, setJustCorrectId] = useState<string | null>(null);
    
    // Controlled keyboard state
    const [draftValues, setDraftValues] = useState<Record<string, string[]>>({});
    const [activeCharIndex, setActiveCharIndex] = useState<number>(0);
    const [startTime] = useState(Date.now());

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const checkDistance = (word1: string, word2: string) => {
        let diff = 0;
        const len = Math.max(word1.length, word2.length);
        for (let i = 0; i < len; i++) {
            if ((word1[i] || '').toLowerCase() !== (word2[i] || '').toLowerCase()) diff++;
        }
        return diff;
    };

    const isMiddleSolved = useMemo(() => {
        return rows.slice(1, rows.length - 1).every(row => 
            solvedWords[row.id]?.toLowerCase() === row.answer.toLowerCase()
        );
    }, [rows, solvedWords]);

    const isMiddleOrdered = useMemo(() => {
        if (!isMiddleSolved) return false;
        const middle = rows.slice(1, rows.length - 1);
        for (let i = 1; i < middle.length; i++) {
            if (checkDistance(middle[i].answer, middle[i - 1].answer) !== 1) return false;
        }
        return true;
    }, [rows, isMiddleSolved]);

    const isLadderValid = useMemo(() => {
        const allSolved = rows.every(row => 
            solvedWords[row.id]?.toLowerCase() === row.answer.toLowerCase()
        );
        if (!allSolved) return false;

        return rows.every((row, i) => 
            i === 0 || checkDistance(row.answer, rows[i - 1].answer) === 1
        );
    }, [rows, solvedWords]);

    const phase = isLadderValid ? 'COMPLETE' :
                  isMiddleOrdered ? 'FINAL' :
                  isMiddleSolved ? 'REORDER' : 'FILL';

    // Dynamic terminal row swap logic
    useEffect(() => {
        if (isMiddleOrdered) {
            const firstMiddle = rows[1];
            const topRow = rows[0];
            // If top row (stark/store) doesn't connect to the first middle row, swap terminal constants
            if (checkDistance(topRow.answer, firstMiddle.answer) !== 1) {
                setRows(prev => {
                    const next = [...prev];
                    [next[0], next[next.length - 1]] = [next[next.length - 1], next[0]];
                    return next;
                });
            }
        }
    }, [isMiddleOrdered, rows, checkDistance]);

    useEffect(() => {
        if (phase === 'COMPLETE') {
            const elapsed = (Date.now() - startTime) / 1000;
            setTimeout(() => onAdvance(elapsed), 3000);
        } else if (phase === 'FINAL') {
            const topId = rows[0].id;
            const bottomId = rows[rows.length - 1].id;
            const isTopSolved = solvedWords[topId]?.toLowerCase() === rows[0].answer.toLowerCase();
            const isBottomSolved = solvedWords[bottomId]?.toLowerCase() === rows[rows.length - 1].answer.toLowerCase();

            if (!isTopSolved && activeIndex !== 0) {
                setActiveIndex(0);
                setActiveCharIndex(0);
            } else if (isTopSolved && !isBottomSolved && activeIndex !== rows.length - 1) {
                setActiveIndex(rows.length - 1);
                setActiveCharIndex(0);
            }
        }
    }, [phase, activeIndex, rows, solvedWords, onAdvance]);

    const handleWordComplete = (rowId: string, value: string) => {
        const nextSolved = { ...solvedWords, [rowId]: value };
        setSolvedWords(nextSolved);
        
        // Clear draft
        setDraftValues(prev => {
            const next = { ...prev };
            delete next[rowId];
            return next;
        });

        const nextMiddleSolved = rows.slice(1, rows.length - 1).every(row => 
            nextSolved[row.id]?.toLowerCase() === row.answer.toLowerCase()
        );
        const nextMiddleOrdered = nextMiddleSolved && (() => {
            const middle = rows.slice(1, rows.length - 1);
            for (let i = 1; i < middle.length; i++) {
                if (checkDistance(middle[i].answer, middle[i - 1].answer) !== 1) return false;
            }
            return true;
        })();
        
        const nextPhase = (nextMiddleSolved && nextSolved[rows[0].id] && nextSolved[rows[rows.length-1].id]) ? 'COMPLETE' :
                          nextMiddleOrdered ? 'FINAL' : 
                          nextMiddleSolved ? 'REORDER' : 'FILL';
        
        const nextIdx = rows.findIndex((row, _idx) => {
            const isLocked = row.isLockedInitially && nextPhase !== 'FINAL' && nextPhase !== 'COMPLETE';
            if (isLocked) return false;
            return !nextSolved[row.id] && row.id !== rowId;
        });

        if (nextIdx !== -1) {
            setTimeout(() => {
                setActiveIndex(nextIdx);
                setActiveCharIndex(0);
            }, 400);
        }

        setJustCorrectId(rowId);
        setTimeout(() => setJustCorrectId(null), 800);
    };

    const handleKey = useCallback((key: string) => {
        if (phase === 'REORDER' || phase === 'COMPLETE') return;

        const currentRow = rows[activeIndex];
        if (!currentRow || solvedWords[currentRow.id]) return;

        setDraftValues(prev => {
            const currentDraft = prev[currentRow.id] || currentRow.answer.split('').map(() => '');
            const nextDraft = [...currentDraft];
            nextDraft[activeCharIndex] = key.toLowerCase();
            return { ...prev, [currentRow.id]: nextDraft };
        });

        setActiveCharIndex(prev => Math.min(prev + 1, currentRow.answer.length - 1));
    }, [phase, activeIndex, activeCharIndex, rows, solvedWords]);

    const handleBackspace = useCallback(() => {
        if (phase === 'REORDER' || phase === 'COMPLETE') return;

        const currentRow = rows[activeIndex];
        if (!currentRow || solvedWords[currentRow.id]) return;

        const currentDraft = draftValues[currentRow.id] || currentRow.answer.split('').map(() => '');
        const nextDraft = [...currentDraft];

        if (nextDraft[activeCharIndex]) {
            // Clear current char if exists
            nextDraft[activeCharIndex] = '';
            setDraftValues(prev => ({ ...prev, [currentRow.id]: nextDraft }));
        } else {
            // Move back and clear
            const prevIdx = Math.max(0, activeCharIndex - 1);
            nextDraft[prevIdx] = '';
            setDraftValues(prev => ({ ...prev, [currentRow.id]: nextDraft }));
            setActiveCharIndex(prevIdx);
        }
    }, [phase, activeIndex, activeCharIndex, rows, solvedWords, draftValues]);

    const handleEnter = useCallback(() => {
        if (phase === 'REORDER' || phase === 'COMPLETE') return;

        const currentRow = rows[activeIndex];
        if (!currentRow || solvedWords[currentRow.id]) return;

        const currentDraft = draftValues[currentRow.id] || [];
        const combined = currentDraft.join('').toLowerCase();

        if (combined === currentRow.answer.toLowerCase()) {
            handleWordComplete(currentRow.id, currentRow.answer);
        }
    }, [phase, activeIndex, rows, solvedWords, draftValues]);

    // Handle keyboard input (both physical and virtual)
    useKeyboardInput({
        onKey: handleKey,
        onBackspace: handleBackspace,
        onEnter: handleEnter,
        onMove: (direction) => {
            if (phase === 'REORDER' || phase === 'COMPLETE') return;
            const currentRow = rows[activeIndex];
            if (!currentRow) return;
            const max = currentRow.answer.length - 1;
            if (direction === 'left') {
                setActiveCharIndex(prev => Math.max(0, prev - 1));
            } else {
                setActiveCharIndex(prev => Math.min(max, prev + 1));
            }
        },
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (over && active.id !== over.id) {
            setRows((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                
                const newItems = arrayMove(items, oldIndex, newIndex);
                setActiveIndex(newIndex);
                setActiveCharIndex(0);
                return newItems;
            });
        }
    };

    const nextClue = () => {
        const nextIdx = (activeIndex + 1) % rows.length;
        setActiveIndex(nextIdx);
        setActiveCharIndex(0);
    };
    const prevClue = () => {
        const prevIdx = (activeIndex - 1 + rows.length) % rows.length;
        setActiveIndex(prevIdx);
        setActiveCharIndex(0);
    };

    const currentHint = useMemo(() => {
        if (phase === 'FINAL' || phase === 'COMPLETE') {
            const baseClue = WORDS.find(w => w.isLockedInitially)?.clue || '';
            return ` The top + bottom rows = ${baseClue}. Keep in mind: The first word may be at the bottom. `;
        }
        return rows[activeIndex]?.clue || '';
    }, [phase, activeIndex, rows]);

    return (
        <div className="flex flex-col items-center w-full font-sans p-2 animate-in fade-in duration-700 pb-[300px] h-[100dvh] overflow-hidden">
            <div className="w-full max-w-sm bg-white dark:bg-[#1b1f23] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col items-center max-h-[calc(100dvh-300px)] shrink-0 mb-4">
            <div className="w-full p-3 text-center">
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">CrossClimb</h2>
            </div>

            <div className="p-4 pt-0 w-full flex flex-col items-center space-y-1">
                    <div className="w-full flex justify-between items-center mb-2">
                        <div className="h-4 w-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                        <div className="h-4 w-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                    </div>

                    <div className="w-full flex flex-col gap-1 relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800 -z-10" />
                        <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800 -z-10" />

                        <DndContext 
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                        >
                            <SortableContext 
                                items={rows.map(r => r.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {rows.map((row, idx) => (
                                    <SortableRow
                                        key={row.id}
                                        row={row}
                                        idx={idx}
                                        phase={phase}
                                        active={activeIndex === idx}
                                        isSolved={solvedWords[row.id]?.toLowerCase() === row.answer.toLowerCase()}
                                        handleWordComplete={handleWordComplete}
                                        setActiveIndex={setActiveIndex}
                                        checkDistance={checkDistance}
                                        prevRow={idx > 0 ? rows[idx - 1] : undefined}
                                        prevRowSolved={idx > 0 ? solvedWords[rows[idx-1].id]?.toLowerCase() === rows[idx-1].answer.toLowerCase() : false}
                                        isJustCorrect={justCorrectId === row.id}
                                        draftValue={draftValues[row.id] || []}
                                        activeCharIndex={activeCharIndex}
                                        setActiveCharIndex={setActiveCharIndex}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>

                <div className="w-full px-6 py-2 mt-0">
                    <div className="p-3 rounded-lg bg-gray-50/50 dark:bg-gray-900/30 text-center border border-gray-100/50 dark:border-gray-800/50">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic">
                            {phase === 'COMPLETE' 
                                ? "Ladder sequence complete! Well done." 
                                : phase === 'FINAL'
                                    ? "Ladder sorted! Solve the final two rows."
                                : phase === 'REORDER' 
                                    ? "Middle words solved! Drag rows into a valid chain." 
                                    : "Type middle words first, then drag to sort."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Keyboard & Hint Area */}
            <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ${phase === 'REORDER' ? 'translate-y-full' : 'translate-y-0'}`}>
                <div className="bg-white/90 dark:bg-[#1b1f23]/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 p-2 pt-4 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col items-center gap-4">
                    
                    {/* Compact Hint Bar */}
                    <div className="w-full max-w-xl flex items-center gap-4 px-4">
                        {phase !== 'FINAL' && phase !== 'COMPLETE' ? (
                            <button onClick={prevClue} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90 text-gray-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        ) : <div className="w-9" />}
                        
                        <div className="flex-1 text-center">
                            <p className="text-blue-500 dark:text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-80">
                                {phase === 'FINAL' || phase === 'COMPLETE' ? 'UNIVERSAL HINT' : `ROW ${activeIndex + 1} HINT`}
                            </p>
                            <div className="text-gray-800 dark:text-gray-100 font-semibold text-sm md:text-base min-h-[1.25em] flex items-center justify-center leading-tight">
                                "{currentHint}"
                            </div>
                        </div>

                        {phase !== 'FINAL' && phase !== 'COMPLETE' ? (
                            <button onClick={nextClue} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90 text-gray-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        ) : <div className="w-9" />}
                    </div>

                    {/* Virtual Keyboard */}
                    <VirtualKeyboard 
                        onKey={handleKey}
                        onBackspace={handleBackspace}
                        onEnter={handleEnter}
                        className="pb-2"
                    />
                </div>
            </div>
        </div>
    );
};
