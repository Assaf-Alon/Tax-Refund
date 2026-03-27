import React, { useState } from 'react';
import { isCloseEnough } from '../../../../shared/logic/fuzzyMatch';

interface PinpointStageProps {
    clues: string[];
    acceptedAnswers: string[];
    onAdvance: () => void;
}

const CLUE_COLORS = ['#a8caff', '#90baff', '#78aaff', '#5c99f2', '#3e87e6'];

export const PinpointStage: React.FC<PinpointStageProps> = ({
    clues,
    acceptedAnswers,
    onAdvance,
}) => {
    const [revealedCount, setRevealedCount] = useState(1);
    const [guess, setGuess] = useState('');
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleGuess = (e: React.FormEvent) => {
        e.preventDefault();
        if (isCloseEnough(guess, acceptedAnswers)) {
            setSuccess(true);
            setRevealedCount(5);
            setTimeout(onAdvance, 2000);
        } else {
            setError(true);
            if (revealedCount < 5) {
                setRevealedCount(prev => prev + 1);
            }
            setTimeout(() => setError(false), 500);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen font-sans p-4 animate-in fade-in duration-700">
            <div className="w-full max-w-sm bg-white dark:bg-[#1b1f23] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col items-center">
                
                {/* Header */}
                <div className="w-full p-6 text-center">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Pinpoint</h2>
                </div>

                {/* Clue Grid */}
                <div className="w-full">
                    {[0, 1, 2, 3, 4].map((idx) => {
                        const isRevealed = idx < revealedCount;
                        return (
                            <div
                                key={idx}
                                style={{ backgroundColor: CLUE_COLORS[idx] }}
                                className={`w-full h-14 flex items-center justify-center text-blue-950 font-bold transition-all duration-500 uppercase tracking-wider ${isRevealed ? 'animate-in fade-in slide-in-from-bottom-2' : ''}`}
                            >
                                {isRevealed ? clues[idx] : `CLUE ${idx + 1}`}
                            </div>
                        );
                    })}
                </div>

                {/* Instruction Box */}
                <div className="w-full px-6 py-4">
                    <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                            All 5 clues belong to a common category. Guess the category in as few clue reveals as possible.
                        </p>
                    </div>
                </div>

                {/* Input Area */}
                <div className="w-full px-6 pb-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <form onSubmit={handleGuess} className="relative flex items-center w-full">
                        <input
                            type="text"
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            placeholder="Guess the category..."
                            disabled={success}
                            className={`w-full bg-transparent border-b-2 ${error ? 'border-red-500 animate-shake' : 'border-transparent'} focus:border-blue-500 focus:outline-none py-2 pr-20 text-gray-900 dark:text-white font-medium transition-all duration-300 placeholder:text-gray-400`}
                        />
                        <div className="absolute right-0 flex items-center pointer-events-none">
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-sm">
                                {revealedCount} of 5
                            </span>
                        </div>
                    </form>
                </div>

                {/* Success Indicator */}
                {success && (
                    <div className="w-full bg-green-500 py-2 text-center text-white text-xs font-bold uppercase tracking-widest animate-in slide-in-from-bottom-full duration-500">
                        Correct!
                    </div>
                )}
            </div>
        </div>
    );
};
