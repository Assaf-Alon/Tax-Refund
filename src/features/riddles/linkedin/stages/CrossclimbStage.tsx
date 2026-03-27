import React, { useState, useEffect, useMemo } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
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

interface WordData {
    id: string;
    answer: string;
    clue: string;
    isLockedInitially?: boolean;
}

interface CrossclimbStageProps {
    onAdvance: () => void;
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
    isMiddleRow: boolean;
    handleWordComplete: (rowId: string, value: string) => void;
    setActiveIndex: (idx: number) => void;
    checkDistance: (word1: string, word2: string) => number;
    prevRow?: WordData;
    prevRowSolved?: boolean;
}

const SortableRow: React.FC<SortableRowProps> = ({
    row, idx, phase, active, isSolved, isMiddleRow, handleWordComplete, setActiveIndex, checkDistance, prevRow, prevRowSolved
}) => {
    const isLockedRow = row.isLockedInitially && phase !== 'FINAL' && phase !== 'COMPLETE';
    
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ 
        id: row.id,
        disabled: !isMiddleRow || phase !== 'REORDER'
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
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

    // Phase 3 styling for end-caps
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
                <div className="flex justify-between items-center px-4 w-full h-3">
                    {[0, 1].map(i => (
                        <div key={i} className={`text-[10px] font-bold transition-colors duration-500 ${isDistanceOne ? 'text-green-500' : 'text-gray-300 dark:text-gray-700'}`}>=</div>
                    ))}
                </div>
            )}
            <div 
                ref={setNodeRef}
                style={style}
                onClick={() => !isLockedRow && setActiveIndex(idx)}
                className={`
                    relative w-full h-14 rounded-lg border-2 flex items-center justify-center
                    ${!isDragging ? 'transition-all duration-300' : ''}
                    ${bgColor} ${borderColor} ${active ? 'scale-[1.02] shadow-md z-10' : 'scale-100 shadow-sm'}
                    ${isMiddleRow && phase === 'REORDER' ? 'cursor-grab active:cursor-grabbing hover:border-blue-300 dark:hover:border-blue-700 touch-none' : ''}
                    ${isLockedRow ? 'opacity-80' : ''}
                    ${isDragging ? 'shadow-2xl opacity-90 scale-105 border-blue-400 dark:border-blue-500' : ''}
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
                            onFocus={() => setActiveIndex(idx)}
                            autoFocus={active}
                            locked={false}
                            backgroundColor="bg-white/10 dark:bg-black/10"
                            borderColor={{ unlocked: 'border-transparent' }}
                            textColor={{ unlocked: 'text-blue-900 dark:text-blue-100' }}
                        />
                    </div>
                )}

                {isMiddleRow && phase === 'REORDER' && (
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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
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

    useEffect(() => {
        if (phase === 'COMPLETE') {
            setTimeout(onAdvance, 3000);
        } else if (phase === 'FINAL' && activeIndex !== 0 && activeIndex !== rows.length - 1) {
            setActiveIndex(0);
        }
    }, [phase, activeIndex, rows.length, onAdvance]);

    const handleWordComplete = (rowId: string, value: string) => {
        const nextSolved = { ...solvedWords, [rowId]: value };
        setSolvedWords(nextSolved);
        
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
        if (nextIdx !== -1) setActiveIndex(nextIdx);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if (over && active.id !== over.id) {
            setRows((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                
                if (newIndex === 0 || newIndex === items.length - 1 || oldIndex === 0 || oldIndex === items.length - 1) {
                    return items;
                }
                
                const newItems = arrayMove(items, oldIndex, newIndex);
                setActiveIndex(newIndex);
                return newItems;
            });
        }
    };

    const nextClue = () => setActiveIndex(prev => (prev + 1) % rows.length);
    const prevClue = () => setActiveIndex(prev => (prev - 1 + rows.length) % rows.length);

    const currentHint = useMemo(() => {
        if (phase === 'FINAL' || phase === 'COMPLETE') {
            const baseClue = WORDS.find(w => w.isLockedInitially)?.clue || '';
            return ` The top + bottom rows = ${baseClue}. Keep in mind: The first word may be at the bottom. `;
        }
        return rows[activeIndex]?.clue || '';
    }, [phase, activeIndex, rows]);

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen font-sans p-4 animate-in fade-in duration-700 bg-[#f3f2ef] dark:bg-[#121212]">
            <div className="w-full max-w-sm bg-white dark:bg-[#1b1f23] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col items-center">
                <div className="w-full p-6 text-center">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">CrossClimb</h2>
                </div>

                <div className="p-6 pt-0 w-full flex flex-col items-center space-y-4">
                    <div className="w-full flex justify-between items-center mb-2">
                        <div className="h-4 w-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                        <div className="h-4 w-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                    </div>

                    <div className="w-full flex flex-col gap-2 relative">
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
                                        isMiddleRow={idx > 0 && idx < rows.length - 1}
                                        handleWordComplete={handleWordComplete}
                                        setActiveIndex={setActiveIndex}
                                        checkDistance={checkDistance}
                                        prevRow={idx > 0 ? rows[idx - 1] : undefined}
                                        prevRowSolved={idx > 0 ? solvedWords[rows[idx-1].id]?.toLowerCase() === rows[idx-1].answer.toLowerCase() : false}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>

                <div className="w-full px-6 py-4 mt-2">
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

            <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-[#1b1f23]/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 p-4 md:p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center justify-center z-50">
                <div className="w-full max-w-xl flex items-center gap-6">
                    {phase !== 'FINAL' && phase !== 'COMPLETE' ? (
                        <button onClick={prevClue} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 text-gray-400 hover:text-blue-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    ) : (
                        <div className="w-12 h-12" />
                    )}
                    
                    <div className="flex-1 text-center">
                        <p className="text-blue-500 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">
                            {phase === 'FINAL' || phase === 'COMPLETE' ? 'UNIVERSAL HINT' : `ROW ${activeIndex + 1} HINT`}
                        </p>
                        <div className="text-gray-800 dark:text-gray-100 font-semibold text-base md:text-lg min-h-[1.5em] flex items-center justify-center leading-tight">
                            "{currentHint}"
                        </div>
                    </div>

                    {phase !== 'FINAL' && phase !== 'COMPLETE' ? (
                        <button onClick={nextClue} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 text-gray-400 hover:text-blue-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ) : (
                        <div className="w-12 h-12" />
                    )}
                </div>
            </div>
        </div>
    );
};
