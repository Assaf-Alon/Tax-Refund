import React, { useState, useMemo, useCallback } from 'react';
import { shuffleArray } from '../../utils/array';

export interface Choice {
    label: string;
    correct: boolean;
}

export interface MultipleChoiceStageProps {
    title: string;
    description: string;
    mediaRow?: React.ReactNode;
    choices: Choice[];
    onAdvance: () => void;
    successMessageRenderer?: (correctLabel: string) => React.ReactNode;
    successDelay?: number;
}


export const MultipleChoiceStage: React.FC<MultipleChoiceStageProps> = ({
    title,
    description,
    mediaRow,
    choices,
    onAdvance,
    successMessageRenderer,
    successDelay = 1500,
}) => {
    const shuffledChoices = useMemo(() => shuffleArray(choices), [choices]);

    const [disabledIndices, setDisabledIndices] = useState<Set<number>>(new Set());
    const [shakingIndex, setShakingIndex] = useState<number | null>(null);
    const [correctIndex, setCorrectIndex] = useState<number | null>(null);
    const [correctLabel, setCorrectLabel] = useState<string | null>(null);

    const handleChoice = useCallback((index: number, choice: Choice) => {
        if (disabledIndices.has(index) || correctIndex !== null) return;

        if (choice.correct) {
            setCorrectIndex(index);
            setCorrectLabel(choice.label);
            setTimeout(() => onAdvance(), successDelay);
        } else {
            setShakingIndex(index);
            setTimeout(() => {
                setShakingIndex(null);
                setDisabledIndices(prev => new Set(prev).add(index));
            }, 400);
        }
    }, [disabledIndices, correctIndex, onAdvance]);

    const getButtonClass = (index: number) => {
        if (correctIndex === index) {
            return 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] border rounded px-2 py-2 text-xs md:text-base md:px-4 md:py-3 transition-all duration-300 font-serif';
        }
        if (disabledIndices.has(index)) {
            return 'bg-black/40 border border-emerald-500/30 text-emerald-100 px-2 py-2 text-xs md:text-base md:px-4 md:py-3 rounded transition-all duration-300 opacity-40 pointer-events-none font-serif';
        }
        if (shakingIndex === index) {
            return 'bg-red-900/40 border border-red-500/60 text-red-300 px-2 py-2 text-xs md:text-base md:px-4 md:py-3 rounded transition-all duration-300 animate-[shake_0.4s_ease-in-out] font-serif';
        }
        return 'bg-black/40 border border-emerald-500/30 text-emerald-100 px-2 py-2 text-xs md:text-base md:px-4 md:py-3 rounded transition-all duration-300 hover:bg-emerald-900/40 cursor-pointer font-serif';
    };

    return (
        <div className="text-center space-y-8 w-full max-w-2xl z-10">
            <h2 className="text-3xl font-bold font-serif text-emerald-400 tracking-wide">
                {title}
            </h2>

            {mediaRow && (
                <div className="flex items-center justify-center gap-6 flex-wrap">
                    {mediaRow}
                </div>
            )}

            <p className="text-lg text-gray-300 font-serif italic">
                {description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {shuffledChoices.map((choice, index) => (
                    <button
                        key={choice.label}
                        className={getButtonClass(index)}
                        onClick={() => handleChoice(index, choice)}
                        disabled={disabledIndices.has(index) || correctIndex !== null}
                    >
                        {choice.label}
                    </button>
                ))}
            </div>

            {correctIndex !== null && correctLabel !== null && successMessageRenderer && (
                <p className="text-emerald-400 font-serif italic text-lg animate-pulse">
                    {successMessageRenderer(correctLabel)}
                </p>
            )}

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-6px); }
                    75% { transform: translateX(6px); }
                }
            `}</style>
        </div>
    );
};
