import React, { useState, useRef, useCallback } from 'react';
import { CharacterInput } from '../../../../shared/ui/CharacterInput';
import type { CharacterInputHandle } from '../../../../shared/ui/CharacterInput';
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

interface WordToken {
    word: string;       // the actual word (may include apostrophes)
    trailing: string;   // trailing punctuation: ? , etc.
}

/** Split a lyrics line into word tokens, separating trailing punctuation */
function tokenizeLine(line: string): WordToken[] {
    return line.split(' ').map(raw => {
        // Strip trailing punctuation (?,!.) from the word
        const match = raw.match(/^(.+?)([?,!.]*$)/);
        if (match) {
            return { word: match[1], trailing: match[2] };
        }
        return { word: raw, trailing: '' };
    });
}

export const LyricsStage: React.FC<LyricsStageProps> = ({ onAdvance }) => {
    // Flatten all words across all lines into a single list for tracking
    const linesTokens = LYRICS_LINES.map(tokenizeLine);
    const allWords = linesTokens.flat();
    const totalWords = allWords.length;

    const [completedWords, setCompletedWords] = useState<boolean[]>(
        () => new Array(totalWords).fill(false)
    );

    // Refs for each word's CharacterInput
    const wordRefs = useRef<(CharacterInputHandle | null)[]>([]);

    const handleWordComplete = useCallback((globalIndex: number) => {
        setCompletedWords(prev => {
            const next = [...prev];
            next[globalIndex] = true;

            // Focus next incomplete word
            const nextIdx = next.findIndex((done, i) => i > globalIndex && !done);
            if (nextIdx !== -1) {
                // Small delay to let React render the locked state
                setTimeout(() => {
                    wordRefs.current[nextIdx]?.focus();
                }, 50);
            }

            // Check if ALL words are done
            if (next.every(Boolean)) {
                setTimeout(() => onAdvance(), 400);
            }

            return next;
        });
    }, [onAdvance]);

    // Build the global word index counter
    let globalIdx = 0;

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

            <div className="space-y-3">
                {linesTokens.map((tokens, lineIdx) => {
                    const lineElements = tokens.map((token, wordIdx) => {
                        const thisGlobalIdx = globalIdx;
                        globalIdx++;

                        return (
                            <React.Fragment key={`${lineIdx}-${wordIdx}`}>
                                {wordIdx > 0 && (
                                    <span className="inline-block w-3 sm:w-5" />
                                )}
                                <CharacterInput
                                    ref={el => { wordRefs.current[thisGlobalIdx] = el; }}
                                    expectedValue={token.word}
                                    onComplete={() => handleWordComplete(thisGlobalIdx)}
                                    locked={completedWords[thisGlobalIdx]}
                                    autoFocus={thisGlobalIdx === 0}
                                />
                                {token.trailing && (
                                    <span className="text-[#ff007f]/60 font-mono text-sm sm:text-lg">
                                        {token.trailing}
                                    </span>
                                )}
                            </React.Fragment>
                        );
                    });

                    return (
                        <div key={lineIdx} className="flex flex-wrap justify-center items-center gap-y-1">
                            {lineElements}
                        </div>
                    );
                })}
            </div>

            <HintButton hint="Spider Dance — Undertale" cooldownSeconds={60} />
        </div>
    );
};
