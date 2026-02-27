import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface ActionRingStageProps {
    title: string;
    description: string;
    actionLabel: string;
    durationMs?: number;
    targetWindow?: [number, number];
    onAdvance: () => void;
    extraButtons?: React.ReactNode;
    isPaused?: boolean;
    actionAreaOverride?: React.ReactNode;
}

const START_SCALE = 2.5;
const MIN_SCALE = 0.5;
const DEFAULT_TARGET_WINDOW: [number, number] = [0.9, 1.1];

export const ActionRingStage: React.FC<ActionRingStageProps> = ({
    title,
    description,
    actionLabel,
    durationMs = 2500,
    targetWindow = DEFAULT_TARGET_WINDOW,
    onAdvance,
    extraButtons,
    isPaused = false,
    actionAreaOverride,
}) => {
    const [scale, setScale] = useState(START_SCALE);
    const [failed, setFailed] = useState(false);
    const [success, setSuccess] = useState(false);

    const requestRef = useRef<number>(0);
    const startTimeRef = useRef<number | null>(null);

    const [targetMin, targetMax] = targetWindow;

    const animate = useCallback((time: number) => {
        if (isPaused) {
            startTimeRef.current = null;
            requestRef.current = requestAnimationFrame(animate);
            return;
        }

        if (startTimeRef.current === null) {
            startTimeRef.current = time;
        }

        const elapsed = time - startTimeRef.current;
        const progress = Math.min(elapsed / durationMs, 1);
        const currentScale = START_SCALE - (START_SCALE - MIN_SCALE) * progress;

        if (currentScale < targetMin) {
            handleMiss();
            return;
        }

        setScale(currentScale);
        requestRef.current = requestAnimationFrame(animate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPaused, durationMs, targetMin]);

    const startAnimation = useCallback(() => {
        setFailed(false);
        setSuccess(false);
        if (!isPaused) setScale(START_SCALE);
        startTimeRef.current = null;
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(animate);
    }, [animate, isPaused]);

    useEffect(() => {
        startAnimation();
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [startAnimation]);

    const handleMiss = useCallback(() => {
        setFailed(true);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (isPaused) return;
        setTimeout(() => {
            startAnimation();
        }, 1500);
    }, [isPaused, startAnimation]);

    const handleActionClick = () => {
        if (failed || success) return;
        if (requestRef.current) cancelAnimationFrame(requestRef.current);

        if (scale >= targetMin && scale <= targetMax) {
            setSuccess(true);
            setTimeout(() => {
                onAdvance();
            }, 1000);
        } else {
            handleMiss();
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className={`flex flex-col items-center justify-center space-y-16 w-full max-w-md mx-auto relative px-4 text-center transition-colors duration-300 ${failed ? 'animate-pulse' : ''}`}>
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
                    <p className="text-gray-300">{description}</p>
                </div>

                <div className="relative w-48 h-48 flex items-center justify-center">
                    <div className="absolute w-24 h-24 border-4 border-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10" />
                    <div
                        className={`absolute w-24 h-24 border-4 rounded-full transition-colors duration-100 ${failed ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]' :
                            success ? 'border-amber-400 border-8 shadow-[0_0_30px_rgba(251,191,36,1)]' :
                                'border-white opacity-80'
                            }`}
                        style={{ transform: `scale(${scale})` }}
                    />
                    <div className="absolute w-2 h-2 bg-emerald-400 rounded-full blur-sm" />
                </div>

                <div className="h-32 flex flex-col items-center justify-center">
                    {failed ? (
                        <div className="text-red-500 font-bold text-2xl tracking-widest animate-bounce mt-4">
                            MISSED!
                        </div>
                    ) : success ? (
                        <div className="text-amber-400 font-bold text-3xl tracking-widest animate-pulse drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] mt-4">
                            PERFECT {actionLabel.toUpperCase()}!
                        </div>
                    ) : actionAreaOverride ? (
                        actionAreaOverride
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <button
                                onClick={handleActionClick}
                                className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 active:scale-95 text-white font-bold tracking-widest text-xl rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all uppercase"
                            >
                                {actionLabel}
                            </button>
                            {extraButtons}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
