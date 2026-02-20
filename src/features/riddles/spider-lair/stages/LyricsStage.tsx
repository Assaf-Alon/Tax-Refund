import React, { useState } from 'react';
import { CharacterInput } from '../../../../shared/ui/CharacterInput';
import { HintButton } from '../../../../shared/ui/HintButton';

interface LyricsStageProps {
    onAdvance: () => void;
}

const LYRICS_LINES = [
    "I think it's time for a date",
    "I've got a craving and I think you're my taste",
    "So won't you come out and play?",
    "Darling it's your lucky day",
];

export const LyricsStage: React.FC<LyricsStageProps> = ({ onAdvance }) => {
    const [completedLines, setCompletedLines] = useState<boolean[]>(
        () => LYRICS_LINES.map(() => false)
    );

    const handleLineComplete = (index: number) => {
        setCompletedLines(prev => {
            const next = [...prev];
            next[index] = true;

            // Check if all lines are complete
            if (next.every(Boolean)) {
                // Small delay so the user sees the last character appear
                setTimeout(() => onAdvance(), 300);
            }
            return next;
        });
    };

    return (
        <div className="text-center space-y-6 w-full max-w-2xl">
            <h2 className="text-2xl text-[#ff007f]">Spider Dance</h2>
            <p className="text-pink-200/70 text-sm">
                Complete the lyrics. The spider hums the tune...
            </p>

            {/* Show the hint: the passcode IS the first line */}
            <p className="text-[#ff007f] font-mono text-lg tracking-wider">
                2, 4, 6, 8
            </p>

            <div className="space-y-4">
                {LYRICS_LINES.map((line, i) => (
                    <div key={i} className="space-y-1">
                        <div className={`transition-opacity duration-500 ${completedLines[i] ? 'opacity-50' : 'opacity-100'
                            }`}>
                            <CharacterInput
                                expectedValue={line}
                                onComplete={() => handleLineComplete(i)}
                            />
                        </div>
                        {completedLines[i] && (
                            <p className="text-green-400 text-xs">✓</p>
                        )}
                    </div>
                ))}
            </div>

            <HintButton hint="Spider Dance — Undertale" cooldownSeconds={60} />
        </div>
    );
};
