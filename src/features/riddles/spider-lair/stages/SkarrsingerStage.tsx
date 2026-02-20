import React, { useState } from 'react';
import { HintButton } from '../../../../shared/ui/HintButton';

interface SkarrsingerStageProps {
    onAdvance: () => void;
}

const ACCEPTED_ANSWERS = ['skarrsinger karmelita', 'karmelita'];

/**
 * Compute character histogram similarity between two strings.
 * Returns a value between 0 and 1.
 * At 1.0, both strings have identical character frequency distributions.
 */
function histogramSimilarity(a: string, b: string): number {
    const freqA: Record<string, number> = {};
    const freqB: Record<string, number> = {};

    for (const ch of a) freqA[ch] = (freqA[ch] || 0) + 1;
    for (const ch of b) freqB[ch] = (freqB[ch] || 0) + 1;

    const allChars = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
    let shared = 0;
    let total = 0;

    for (const ch of allChars) {
        const countA = freqA[ch] || 0;
        const countB = freqB[ch] || 0;
        shared += Math.min(countA, countB);
        total += Math.max(countA, countB);
    }

    return total === 0 ? 0 : shared / total;
}

const SIMILARITY_THRESHOLD = 0.6;

function isCloseEnough(input: string): boolean {
    const normalized = input.toLowerCase().trim();

    // Exact match
    if (ACCEPTED_ANSWERS.includes(normalized)) return true;

    // Fuzzy match against each accepted answer
    return ACCEPTED_ANSWERS.some(
        answer => histogramSimilarity(normalized, answer) >= SIMILARITY_THRESHOLD
    );
}

export const SkarrsingerStage: React.FC<SkarrsingerStageProps> = ({ onAdvance }) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isCloseEnough(inputValue)) {
            onAdvance();
        } else {
            setError('The web rejects your answer...');
            setInputValue('');
        }
    };

    return (
        <div className="text-center space-y-8 w-full max-w-lg">
            <h2 className="text-2xl text-[#ff007f]">The Spider's Riddle</h2>

            <blockquote className="border-l-4 border-[#ff007f]/50 pl-4 text-pink-200/90 italic text-lg">
                "I sing, I fight, I kill. But mostly kill."
            </blockquote>

            <p className="text-pink-200/60 text-sm">Who speaks these words?</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full max-w-xs bg-black/50 border border-[#b0005d] p-3 text-center text-pink-100 focus:border-[#ff007f] focus:outline-none focus:ring-1 focus:ring-[#ff007f] transition-colors rounded"
                    placeholder="Name..."
                    autoFocus
                />
                <button
                    type="submit"
                    className="px-6 py-2 bg-[#ff007f]/10 border border-[#b0005d] hover:bg-[#ff007f]/20 hover:border-[#ff007f] transition-all duration-200 text-xs uppercase tracking-wider text-pink-200 rounded"
                >
                    Answer
                </button>
            </form>

            {error && (
                <p className="text-red-400 text-sm animate-pulse">{error}</p>
            )}

            <HintButton hint="A singer from Silksong... with claws." cooldownSeconds={60} />
        </div>
    );
};
