import React, { useState } from 'react';
import { isCloseEnough } from '../../../../shared/logic/fuzzyMatch';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { useKeyboardInput } from '../hooks/useKeyboardInput';

interface PinpointStageProps {
    clues: string[];
    acceptedAnswers: string[];
    onAdvance: (time?: number) => void;
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
    const [startTime] = useState(Date.now());

    const submitGuess = () => {
        if (!guess.trim() || success) return;
        
        if (isCloseEnough(guess, acceptedAnswers)) {
            setSuccess(true);
            setRevealedCount(5);
            const elapsed = (Date.now() - startTime) / 1000;
            setTimeout(() => onAdvance(elapsed), 2000);
        } else {
            setError(true);
            if (revealedCount < 5) {
                setRevealedCount(prev => prev + 1);
            }
            setGuess('');
            setTimeout(() => setError(false), 500);
        }
    };

    const handleKey = (key: string) => {
        if (success) return;
        setGuess(prev => (prev + key).toUpperCase());
    };

    const handleBackspace = () => {
        if (success) return;
        setGuess(prev => prev.slice(0, -1));
    };

    useKeyboardInput({
        onKey: handleKey,
        onBackspace: handleBackspace,
        onEnter: submitGuess,
    });

    return (
        <div className="flex flex-col w-full font-sans animate-in fade-in duration-700 h-[100dvh] md:h-[min(700px,calc(100dvh-120px))] overflow-hidden bg-white dark:bg-[#1b1f23] md:rounded-2xl md:shadow-2xl md:border md:border-gray-200 md:dark:border-gray-800">
            {/* Main Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto flex flex-col items-center p-4">
                <div className="w-full max-w-sm bg-white dark:bg-[#1b1f23] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 flex flex-col items-center">
                    
                    {/* Header */}
                    <div className="w-full p-4 text-center border-b border-gray-50 dark:border-gray-800/50">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Pinpoint</h2>
                    </div>

                    {/* Instruction Box - Now at the Top to avoid overlap */}
                    <div className="w-full px-6 py-2 bg-gray-50/50 dark:bg-gray-900/30 text-center border-b border-gray-50 dark:border-gray-800/10">
                        <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed uppercase tracking-[0.15em]">
                            All clues belong to a category. Guess in as few as possible.
                        </p>
                    </div>

                    {/* Clue Grid */}
                    <div className="w-full flex flex-col min-h-0">
                        {[0, 1, 2, 3, 4].map((idx) => {
                            const isRevealed = idx < revealedCount;
                            return (
                                <div
                                    key={idx}
                                    style={{ backgroundColor: CLUE_COLORS[idx] }}
                                    className={`w-full min-h-[3.5rem] flex items-center justify-center text-blue-950 font-bold transition-all duration-500 uppercase tracking-widest text-sm border-b border-white/10 ${isRevealed ? 'animate-in fade-in slide-in-from-bottom-2' : ''}`}
                                >
                                    {isRevealed ? clues[idx] : `CLUE ${idx + 1}`}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom Interaction Area - Fixed */}
            <div className="w-full bg-white dark:bg-[#1b1f23] border-t border-gray-200 dark:border-gray-800 flex flex-col items-center pt-4 pb-8 px-4 gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] shrink-0">
                {/* Custom Input Display */}
                <div className="w-full max-w-md relative flex flex-col gap-2">
                    <div 
                        className={`relative flex items-center w-full border-b-2 py-3 min-h-[3.5rem] transition-colors duration-300 ${error ? 'border-red-500 animate-shake' : success ? 'border-green-500' : 'border-blue-500'}`}
                    >
                        <div className="text-xl md:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight overflow-hidden whitespace-nowrap">
                            {guess}
                            {!success && (
                                <span className="inline-block w-[3px] h-6 bg-blue-500 ml-1 animate-pulse align-middle" style={{ animationDuration: '0.8s' }} />
                            )}
                            {guess === '' && !success && (
                                <span className="text-gray-300 dark:text-gray-600 font-bold uppercase tracking-tight text-lg">Guess the category...</span>
                            )}
                        </div>
                        <div className="absolute right-0 flex items-center">
                            <span className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-sm border border-gray-200 dark:border-gray-700">
                                {revealedCount} of 5
                            </span>
                        </div>
                    </div>

                    {/* Feedback Text */}
                    <div className="h-4 flex items-center justify-center">
                        {error && <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest animate-in fade-in zoom-in duration-300">Incorrect! +1 Clue revealed</span>}
                        {success && <span className="text-green-500 text-[10px] font-bold uppercase tracking-widest animate-in fade-in zoom-in duration-300">Perfect! Category Identified</span>}
                    </div>
                </div>

                {/* Virtual Keyboard */}
                <VirtualKeyboard 
                    onKey={handleKey}
                    onBackspace={handleBackspace}
                    onEnter={submitGuess}
                    className="w-full transition-opacity duration-300"
                />
            </div>

            {/* Success Overlay if needed (optional, keeping it clean for now) */}
        </div>
    );
};
