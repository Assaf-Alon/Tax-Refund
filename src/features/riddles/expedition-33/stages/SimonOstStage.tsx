import React, { useState, useMemo, useCallback } from 'react';
import simonPortrait from '../assets/simon.png';
import swordOfLumiereVid from '../assets/sword-of-lumiere.mp4';

interface SimonOstStageProps {
    onAdvance: () => void;
}

interface Choice {
    label: string;
    correct: boolean;
}

const ALL_CHOICES: Choice[] = [
    { label: 'We Lost', correct: true },
    { label: 'Don\'t Cry', correct: true },
    { label: 'Lumière', correct: false },
    { label: "L'Appel du Vide", correct: false },
    { label: 'Paintress Waltz', correct: false },
    { label: 'Expedition March', correct: false },
    { label: 'Clair de Lune', correct: false },
    { label: 'Gommage', correct: false },
    { label: "Monoko's Requiem", correct: false },
    { label: 'Expedition 0', correct: false },
    { label: 'The 33rd Year', correct: false },
    { label: 'Echoes of the Paintress', correct: false },
    { label: 'Symphony of the End', correct: false },
];

function shuffleArray<T>(arr: T[]): T[] {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export const SimonOstStage: React.FC<SimonOstStageProps> = ({ onAdvance }) => {
    const shuffledChoices = useMemo(() => shuffleArray(ALL_CHOICES), []);

    const [disabledIndices, setDisabledIndices] = useState<Set<number>>(new Set());
    const [shakingIndex, setShakingIndex] = useState<number | null>(null);
    const [correctIndex, setCorrectIndex] = useState<number | null>(null);
    const [correctLabel, setCorrectLabel] = useState<string | null>(null);

    const handleChoice = useCallback((index: number, choice: Choice) => {
        if (disabledIndices.has(index) || correctIndex !== null) return;

        if (choice.correct) {
            setCorrectIndex(index);
            setCorrectLabel(choice.label);
            setTimeout(() => onAdvance(), 1500);
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
            return 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] border rounded px-4 py-3 transition-all duration-300 font-serif';
        }
        if (disabledIndices.has(index)) {
            return 'bg-black/40 border border-emerald-500/30 text-emerald-100 px-4 py-3 rounded transition-all duration-300 opacity-40 pointer-events-none font-serif';
        }
        if (shakingIndex === index) {
            return 'bg-red-900/40 border border-red-500/60 text-red-300 px-4 py-3 rounded transition-all duration-300 animate-[shake_0.4s_ease-in-out] font-serif';
        }
        return 'bg-black/40 border border-emerald-500/30 text-emerald-100 px-4 py-3 rounded transition-all duration-300 hover:bg-emerald-900/40 cursor-pointer font-serif';
    };

    return (
        <div className="text-center space-y-8 w-full max-w-2xl z-10">
            <h2 className="text-3xl font-bold font-serif text-emerald-400 tracking-wide">
                Simon's Melody
            </h2>

            {/* Media row: portrait + video */}
            <div className="flex items-center justify-center gap-6 flex-wrap">
                <img
                    src={simonPortrait}
                    alt="Simon"
                    className="w-36 md:w-44 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.2)] border border-emerald-500/20"
                />
                <video
                    src={swordOfLumiereVid}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-48 md:w-56 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.2)] border border-emerald-500/20"
                />
            </div>

            <p className="text-lg text-gray-300 font-serif italic">
                What's the OST that plays when we fight Simon?
            </p>

            {/* Multiple-choice grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

            {/* Success message */}
            {correctIndex !== null && (
                <p className="text-emerald-400 font-serif italic text-lg animate-pulse">
                    {correctLabel === 'We Lost'
                        ? 'That is correct, but I was hoping you\'d go for the Don\'t Cry option 😜'
                        : 'אללל תבכייייי אל תבכייי!!!!'}
                </p>
            )}

            {/* Shake keyframes injected via style tag */}
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
