import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TextAnswerStage } from '../../../../shared/stages/TextAnswerStage';

export interface FadingTextStageProps {
    onAdvance: () => void;
}

const INITIAL_TEXT = "Assaf doesn't understand the mechanics of this 'Foretell' card lady.";
const ACCEPTED_ANSWERS = ['sciel'];

// Delay (ms) before the Nth character disappears (0-indexed).
// Drops 0-9 follow the user-specified schedule. Drop 10+ spread over 500ms.
const SCHEDULED_DELAYS = [600, 500, 500, 400, 300, 200, 100, 100, 100, 100]; // 10 entries

function buildChars(text: string) {
    return text.split('').map((char, index) => ({ id: index, char, visible: true }));
}

function getDelay(dropIndex: number, totalFadeable: number): number {
    if (dropIndex < SCHEDULED_DELAYS.length) {
        return SCHEDULED_DELAYS[dropIndex];
    }
    const remaining = totalFadeable - SCHEDULED_DELAYS.length;
    return remaining > 0 ? Math.ceil(500 / remaining) : 15;
}

export const FadingTextStage: React.FC<FadingTextStageProps> = ({ onAdvance }) => {
    const [chars, setChars] = useState(() => buildChars(INITIAL_TEXT));
    const [allGone, setAllGone] = useState(false);
    const [attempt, setAttempt] = useState(0);

    // Keep a mutable ref of chars so the fade loop never touches setState updater callbacks
    const charsRef = useRef(chars);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dropIndexRef = useRef(0);

    const totalFadeable = INITIAL_TEXT.split('').filter(c => c !== ' ').length;

    useEffect(() => {
        const fresh = buildChars(INITIAL_TEXT);
        charsRef.current = fresh;
        dropIndexRef.current = 0;
        setChars(fresh);
        setAllGone(false);

        const fadeNext = () => {
            const current = charsRef.current;
            const visibleIndices = current
                .map((c, i) => (c.visible && c.char !== ' ' ? i : -1))
                .filter(i => i !== -1);

            if (visibleIndices.length === 0) {
                setAllGone(true);
                return;
            }

            const delay = getDelay(dropIndexRef.current, totalFadeable);
            dropIndexRef.current++;

            timerRef.current = setTimeout(() => {
                // Read latest from ref, mutate a copy, write back
                const snapshot = charsRef.current;
                const still = snapshot
                    .map((c, i) => (c.visible && c.char !== ' ' ? i : -1))
                    .filter(i => i !== -1);

                if (still.length === 0) {
                    setAllGone(true);
                    return;
                }

                const randomIndex = still[Math.floor(Math.random() * still.length)];
                const next = [...snapshot];
                next[randomIndex] = { ...next[randomIndex], visible: false };

                // Update ref first, then state — no side-effects inside setState
                charsRef.current = next;
                setChars(next);

                fadeNext(); // schedule next drop entirely outside setState
            }, delay);
        };

        fadeNext();

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [attempt]);

    const handleTryAgain = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setAttempt(a => a + 1);
    }, []);

    const promptNode = (
        <div className="space-y-5">
            <div className="text-xl md:text-2xl font-serif text-gray-200 tracking-wide leading-relaxed min-h-[80px] flex flex-wrap gap-x-[0.3em] justify-center">
                {/* Group chars into words so the browser never breaks a word mid-span */}
                {chars.reduce<{ wordChars: typeof chars; wordStart: number }[]>((words, c, i) => {
                    if (c.char === ' ') {
                        return [...words, { wordChars: [], wordStart: i + 1 }];
                    }
                    const last = words[words.length - 1];
                    last.wordChars.push(c);
                    return words;
                }, [{ wordChars: [], wordStart: 0 }]).map((word, wi) => (
                    <span key={wi} className="whitespace-nowrap inline-flex">
                        {word.wordChars.map((c) => (
                            <span
                                key={c.id}
                                className={`transition-opacity duration-300 ease-in-out ${c.visible ? 'opacity-100' : 'opacity-0'}`}
                            >
                                {c.char}
                            </span>
                        ))}
                    </span>
                ))}
            </div>

            {/* Only clickable once all text is gone */}
            <div className={`flex justify-center transition-opacity duration-500 ${allGone ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button
                    type="button"
                    onClick={handleTryAgain}
                    className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2 transition-colors duration-200"
                >
                    Try again
                </button>
            </div>
        </div>
    );

    return (
        <TextAnswerStage
            title="The Fading Memory"
            prompt={promptNode}
            acceptedAnswers={ACCEPTED_ANSWERS}
            errorMessage="The memory rejects that name... Try again."
            placeholder="Type quickly..."
            submitButtonLabel="Recall"
            onAdvance={onAdvance}
        />
    );
};
