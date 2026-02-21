import React, { useState, useRef, useCallback } from 'react';
import { CharacterInput } from '../ui/CharacterInput';
import type { CharacterInputHandle } from '../ui/CharacterInput';
import { HintButton } from '../ui/HintButton';
import type { FillWordsTheme } from './types';

export interface FillWordsStageProps {
    title: string;
    introContent?: React.ReactNode;
    lines: string[];
    hint?: string;
    hintCooldown?: number;
    onAdvance: () => void;
    theme?: FillWordsTheme;
}

export interface WordToken {
    word: string;       // the actual word (may include apostrophes)
    trailing: string;   // trailing punctuation: ? , etc.
}

/** Split a lyrics line into word tokens, separating trailing punctuation */
export function tokenizeLine(line: string): WordToken[] {
    return line.split(' ').map(raw => {
        // Strip trailing punctuation (?,!.) from the word
        const match = raw.match(/^(.+?)([?,!.]*$)/);
        if (match) {
            return { word: match[1], trailing: match[2] };
        }
        return { word: raw, trailing: '' };
    });
}

export const FillWordsStage: React.FC<FillWordsStageProps> = ({
    title,
    introContent,
    lines,
    hint,
    hintCooldown = 60,
    onAdvance,
    theme,
}) => {
    // Flatten all words across all lines into a single list for tracking
    const linesTokens = lines.map(tokenizeLine);
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
        <div className={theme?.container ?? 'text-center space-y-6 w-full max-w-2xl'}>
            <h2 className={theme?.title ?? 'text-2xl font-bold'}>{title}</h2>

            {introContent}

            <div className="space-y-3">
                {linesTokens.map((tokens, lineIdx) => {
                    const lineElements = tokens.map((token, wordIdx) => {
                        const thisGlobalIdx = globalIdx++;
                        return (
                            <React.Fragment key={`${lineIdx}-${wordIdx}`}>
                                {wordIdx > 0 && (
                                    <span className={theme?.wordGap ?? 'inline-block w-3 sm:w-5'} />
                                )}
                                <CharacterInput
                                    ref={el => { wordRefs.current[thisGlobalIdx] = el; }}
                                    expectedValue={token.word}
                                    onComplete={() => handleWordComplete(thisGlobalIdx)}
                                    locked={completedWords[thisGlobalIdx]}
                                    autoFocus={thisGlobalIdx === 0}
                                />
                                {token.trailing && (
                                    <span className={theme?.trailingPunctuation ?? 'opacity-60'}>
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

            {hint && <HintButton hint={hint} cooldownSeconds={hintCooldown} />}
        </div>
    );
};
