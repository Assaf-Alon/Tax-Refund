import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';

import versoImg from '../assets/verso.png';
import maelleImg from '../assets/maelle.png';

export interface FinalChoiceStageProps {
    onAdvance: () => void;
}

type Choice = 'verso' | 'maelle';

const HOLD_DURATION_MS = 5000;
const VIBRATION_INTERVAL_MS = 500;
const PARTICLE_COUNT = 50;

interface DustParticle {
    id: number;
    originX: number;
    originY: number;
    driftX: number;
    driftY: number;
    delay: number;
    rotation: number;
    size: number;
}

export const FinalChoiceStage: React.FC<FinalChoiceStageProps> = ({ onAdvance }) => {
    const [activeChoice, setActiveChoice] = useState<Choice | null>(null);
    const [progress, setProgress] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [finalChoice, setFinalChoice] = useState<Choice | null>(null);

    const holdStartRef = useRef<number | null>(null);
    const animFrameRef = useRef<number>(0);
    const lastVibrationRef = useRef<number>(0);

    const particles = useMemo<DustParticle[]>(() =>
        Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
            id: i,
            originX: Math.random() * 100,
            originY: Math.random() * 100,
            driftX: (Math.random() - 0.5) * 250,
            driftY: (Math.random() - 0.5) * 250 - 60,
            delay: Math.random() * 0.5,
            rotation: Math.random() * 360,
            size: 4 + Math.random() * 6,
        })),
        [],
    );

    const updateProgress = useCallback((time: number) => {
        if (holdStartRef.current === null) return;

        const elapsed = time - holdStartRef.current;
        const p = Math.min(elapsed / HOLD_DURATION_MS, 1);
        setProgress(p);

        // Vibrate in pulses
        if (navigator.vibrate) {
            const vibrationStep = Math.floor(elapsed / VIBRATION_INTERVAL_MS);
            if (vibrationStep > lastVibrationRef.current) {
                navigator.vibrate(50);
                lastVibrationRef.current = vibrationStep;
            }
        }

        if (p >= 1) {
            navigator.vibrate?.(200);
            setCompleted(true);
            return;
        }
        animFrameRef.current = requestAnimationFrame(updateProgress);
    }, []);

    useEffect(() => {
        if (completed && activeChoice) {
            setFinalChoice(activeChoice);
            const timer = setTimeout(() => onAdvance(), 1800);
            return () => clearTimeout(timer);
        }
    }, [completed, activeChoice, onAdvance]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    const handlePointerDown = (choice: Choice) => {
        if (completed) return;
        setActiveChoice(choice);
        setProgress(0);
        lastVibrationRef.current = 0;
        holdStartRef.current = performance.now();
        animFrameRef.current = requestAnimationFrame(updateProgress);
    };

    const handlePointerUp = () => {
        if (completed) return;
        setActiveChoice(null);
        setProgress(0);
        holdStartRef.current = null;
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };


    const renderCard = (choice: Choice) => {
        const img = choice === 'verso' ? versoImg : maelleImg;
        const label = choice === 'verso' ? 'Verso' : 'Maëlle';
        const isActive = activeChoice === choice;
        const isDisintegrating = activeChoice !== null && activeChoice !== choice;

        return (
            <div
                className="flex flex-col items-center gap-3 select-none"
                onPointerDown={(e) => {
                    e.preventDefault();
                    handlePointerDown(choice);
                }}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onContextMenu={(e) => e.preventDefault()}
                style={{ touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
            >
                <div className="relative w-36 h-48 md:w-44 md:h-56">
                    {/* Character image */}
                    <img
                        src={img}
                        alt={label}
                        draggable={false}
                        className="absolute inset-0 w-full h-full object-cover rounded-xl border-2 border-slate-600/50 shadow-lg transition-opacity duration-200"
                        style={{
                            opacity: isDisintegrating ? Math.max(1 - progress * 1.5, 0) : 1,
                            filter: completed && finalChoice === choice
                                ? 'drop-shadow(0 0 20px rgba(251,191,36,0.8))'
                                : isActive
                                    ? `brightness(${1 + progress * 0.3})`
                                    : 'none',
                            WebkitTouchCallout: 'none',
                            WebkitUserSelect: 'none',
                        }}
                    />

                    {/* Dust particles (on the card being erased) */}
                    {isDisintegrating && progress > 0 && (
                        <div className="absolute inset-0 overflow-visible pointer-events-none rounded-xl">
                            {particles.map(p => {
                                const adjustedProgress = Math.max(0, (progress - p.delay) / (1 - p.delay));
                                if (adjustedProgress <= 0) return null;
                                return (
                                    <div
                                        key={p.id}
                                        className="absolute rounded-sm"
                                        style={{
                                            left: `${p.originX}%`,
                                            top: `${p.originY}%`,
                                            width: p.size,
                                            height: p.size,
                                            backgroundColor: `rgba(${148 + Math.random() * 40}, ${163 + Math.random() * 30}, ${184 + Math.random() * 30}, ${1 - adjustedProgress * 0.8})`,
                                            opacity: adjustedProgress < 0.2
                                                ? adjustedProgress / 0.2
                                                : 1 - (adjustedProgress - 0.2) / 0.8,
                                            transform: `translate(${p.driftX * adjustedProgress}px, ${p.driftY * adjustedProgress}px) rotate(${p.rotation * adjustedProgress}deg) scale(${1 - adjustedProgress * 0.5})`,
                                        }}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* SVG progress ring (on the actively held card) */}
                    {isActive && progress > 0 && (
                        <svg
                            className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] pointer-events-none"
                            viewBox="0 0 160 200"
                            style={{ filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.5))' }}
                        >
                            <rect
                                x="4" y="4" width="152" height="192" rx="16" ry="16"
                                fill="none"
                                stroke="rgba(251,191,36,0.15)"
                                strokeWidth="3"
                            />
                            <rect
                                x="4" y="4" width="152" height="192" rx="16" ry="16"
                                fill="none"
                                stroke="rgba(251,191,36,0.9)"
                                strokeWidth="3"
                                strokeDasharray={2 * (152 + 192)}
                                strokeDashoffset={2 * (152 + 192) * (1 - progress)}
                                strokeLinecap="round"
                            />
                        </svg>
                    )}

                    {/* Completion golden glow overlay */}
                    {completed && finalChoice === choice && (
                        <div
                            className="absolute inset-0 rounded-xl animate-pulse"
                            style={{
                                boxShadow: '0 0 40px rgba(251,191,36,0.6), inset 0 0 30px rgba(251,191,36,0.15)',
                                border: '2px solid rgba(251,191,36,0.8)',
                            }}
                        />
                    )}
                </div>

                {/* Label */}
                <span
                    className={`text-lg font-serif tracking-wide transition-all duration-500 ${completed && finalChoice === choice
                        ? 'text-amber-400 font-bold text-xl'
                        : isDisintegrating
                            ? 'text-gray-600'
                            : 'text-gray-200'
                        }`}
                    style={{
                        opacity: isDisintegrating ? Math.max(1 - progress * 1.3, 0) : 1,
                    }}
                >
                    {label}
                </span>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center justify-center space-y-10 w-full max-w-lg mx-auto relative px-4 text-center">
                {/* Title */}
                <div className="space-y-3">
                    <h2 className="text-3xl font-bold font-serif tracking-tight text-white">
                        The Final Choice
                    </h2>
                    <p className="text-gray-300 font-serif italic text-lg">
                        The Canvas is splitting. Choose the one you stand with.
                    </p>
                </div>

                {/* Character cards */}
                <div className="flex items-center justify-center gap-6 md:gap-10">
                    {renderCard('verso')}
                    {renderCard('maelle')}
                </div>

                {/* Instruction */}
                <div className={`transition-all duration-700 ${completed ? 'opacity-0' : 'opacity-100'}`}>
                    {activeChoice ? (
                        <p className="text-amber-400/80 text-sm font-medium animate-pulse">
                            Keep holding...
                        </p>
                    ) : (
                        <p className="text-gray-500 text-sm">
                            Press and hold to choose
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
