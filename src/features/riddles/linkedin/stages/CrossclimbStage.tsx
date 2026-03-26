import React, { useState, useEffect } from 'react';
import { CharacterInput } from '../../../../shared/ui/CharacterInput';

interface WordData {
    answer: string;
    clue: string;
    isLockedInitially?: boolean;
}

interface CrossclimbStageProps {
    onAdvance: () => void;
}

const WORDS: WordData[] = [
    { answer: 'stark', clue: 'the company', isLockedInitially: true },
    { answer: 'stack', clue: 'full "____" engineer' },
    { answer: 'stick', clue: 'game theory' },
    { answer: 'stock', clue: 'equity' },
    { answer: 'stuck', clue: 'the company', isLockedInitially: true },
];

export const CrossclimbStage: React.FC<CrossclimbStageProps> = ({
    onAdvance,
}) => {
    const [solvedWords, setSolvedWords] = useState<string[]>(new Array(WORDS.length).fill(''));
    const [activeIndex, setActiveIndex] = useState<number>(1);

    const middleSolved = !!(solvedWords[1] && solvedWords[2] && solvedWords[3]);
    const allSolved = solvedWords.every((word, idx) => word.toLowerCase() === WORDS[idx].answer.toLowerCase());

    const handleWordComplete = (index: number, value: string) => {
        setSolvedWords(prev => {
            const next = [...prev];
            next[index] = value;
            
            // Auto-focus next unsolved
            const isMiddleSolved = !!(next[1] && next[2] && next[3]);
            const nextIdx = WORDS.findIndex((w, i) => {
                const locked = w.isLockedInitially && !isMiddleSolved;
                return !locked && !next[i];
            });
            if (nextIdx !== -1 && nextIdx !== index) {
                setActiveIndex(nextIdx);
            }
            
            return next;
        });
    };

    const handleSwap = (i: number, j: number) => {
        setSolvedWords(prev => {
            const next = [...prev];
            const temp = next[i];
            next[i] = next[j];
            next[j] = temp;
            return next;
        });
    };

    const [swapIndex, setSwapIndex] = useState<number | null>(null);

    const onRowClick = (idx: number) => {
        if (isRowLocked(idx)) return;
        
        if (solvedWords[idx]) {
            if (swapIndex === null) {
                setSwapIndex(idx);
            } else {
                handleSwap(swapIndex, idx);
                setSwapIndex(null);
            }
        } else {
            setSwapIndex(null);
            setActiveIndex(idx);
        }
    };

    const isRowLocked = (index: number) => {
        return WORDS[index].isLockedInitially && !middleSolved;
    };

    useEffect(() => {
        if (allSolved) {
            setTimeout(onAdvance, 2000);
        }
    }, [allSolved, onAdvance]);

    const nextClue = () => setActiveIndex(prev => (prev + 1) % WORDS.length);
    const prevClue = () => setActiveIndex(prev => (prev - 1 + WORDS.length) % WORDS.length);

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen font-sans p-4">
            {/* Main Card */}
            <div className="w-full max-w-sm bg-white dark:bg-[#1b1f23] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col items-center p-6 space-y-4">
                
                {/* Ladder Header */}
                <div className="w-full flex justify-between items-center mb-4">
                    <div className="h-4 w-1 bg-gray-300 rounded-full" />
                    <div className="h-4 w-1 bg-gray-300 rounded-full" />
                </div>

                {/* Ladder Rows */}
                <div className="w-full flex flex-col gap-2 relative">
                    {/* Visual lines connecting rows */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 -z-10" />
                    <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gray-200 -z-10" />

                    {WORDS.map((word, idx) => {
                        const locked = isRowLocked(idx);
                        const active = activeIndex === idx;
                        const solved = solvedWords[idx].toLowerCase() === word.answer.toLowerCase();

                        // Colors based on state
                        let bgColor = 'bg-white dark:bg-gray-800/50';
                        let borderColor = 'border-gray-200 dark:border-gray-700';
                        if (locked) {
                            bgColor = 'bg-[#ffe7d9] dark:bg-orange-900/20';
                            borderColor = 'border-[#ffd4bc] dark:border-orange-900/30';
                        } else if (active) {
                            bgColor = 'bg-[#c8e2ff] dark:bg-blue-900/30';
                            borderColor = 'border-[#a8cfff] dark:border-blue-800/50';
                        } else if (solved) {
                            bgColor = 'bg-green-50 dark:bg-green-900/10';
                            borderColor = 'border-green-100 dark:border-green-900/20';
                        }

                        return (
                            <React.Fragment key={idx}>
                                {idx > 0 && (
                                    <div className="flex justify-between items-center px-4 w-full h-4">
                                        <div className="text-gray-400 font-bold">=</div>
                                        <div className="text-gray-400 font-bold">=</div>
                                    </div>
                                )}
                                <div 
                                    onClick={() => onRowClick(idx)}
                                    className={`
                                        relative w-full h-14 rounded-lg border-2 transition-all duration-300 flex items-center justify-center cursor-pointer
                                        ${bgColor} ${borderColor} ${active ? 'scale-[1.02] shadow-md z-10' : 'scale-100 shadow-sm'}
                                        ${locked ? 'opacity-90 grayscale-[0.2]' : ''}
                                        ${swapIndex === idx ? 'ring-2 ring-blue-500 animate-pulse' : ''}
                                    `}
                                >
                                    {locked ? (
                                        <div className="flex items-center gap-2 text-[#8c5a45]">
                                            <span role="img" aria-label="locked" className="text-xl">🔒</span>
                                        </div>
                                    ) : (
                                        <div className={active ? '' : 'pointer-events-none'}>
                                            {solvedWords[idx] ? (
                                                <div className="font-mono text-xl font-bold tracking-[0.5em] text-blue-900 dark:text-blue-100 uppercase">
                                                    {solvedWords[idx]}
                                                </div>
                                            ) : (
                                                <CharacterInput
                                                    expectedValue={WORDS[idx].answer}
                                                    onComplete={() => handleWordComplete(idx, WORDS[idx].answer)}
                                                    onFocus={() => setActiveIndex(idx)}
                                                    locked={false}
                                                    autoFocus={active}
                                                    backgroundColor="bg-white dark:bg-black/20"
                                                    borderColor={{
                                                        unlocked: 'border-transparent'
                                                    }}
                                                    textColor={{
                                                        unlocked: 'text-blue-900 dark:text-blue-100'
                                                    }}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Middle Action Buttons */}
                <div className="flex gap-4 w-full pt-4">
                    <button 
                        onClick={() => {/* Reveal row logic */}}
                        className="flex-1 py-2 px-4 rounded-full border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                    >
                        Reveal row
                    </button>
                    <button 
                        onClick={() => {/* Hint logic */}}
                        className="flex-1 py-2 px-4 rounded-full border border-gray-400 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                    >
                        Hint
                    </button>
                </div>
            </div>

            {/* Bottom Clue Controller */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1b1f23] border-t border-gray-200 dark:border-gray-800 p-4 md:p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center justify-center z-50">
                <div className="w-full max-w-xl flex items-center gap-6">
                    <button 
                        onClick={prevClue}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    
                    <div className="flex-1 text-center">
                        <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">
                            Clue for Row {activeIndex + 1}
                        </p>
                        <div className="text-gray-800 dark:text-gray-100 font-medium text-lg min-h-[1.5em] flex items-center justify-center">
                            "{WORDS[activeIndex].clue}"
                        </div>
                    </div>

                    <button 
                        onClick={nextClue}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes bounce {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .active-row { animation: bounce 2s infinite ease-in-out; }
            `}} />
        </div>
    );
};
