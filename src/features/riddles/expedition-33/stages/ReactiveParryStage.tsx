import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface ReactiveParryStageProps {
    onAdvance: () => void;
}

const ANIMATION_DURATION_MS = 2500; // Time from scale 2.5 to 0.5
const START_SCALE = 2.5;
const MIN_SCALE = 0.5;
const PARRY_WINDOW = [0.9, 1.1]; // The target scale area

export const ReactiveParryStage: React.FC<ReactiveParryStageProps> = ({ onAdvance }) => {
    const [scale, setScale] = useState(START_SCALE);
    const [failed, setFailed] = useState(false);
    const [success, setSuccess] = useState(false);
    const [dodgeUsed, setDodgeUsed] = useState(false);
    const [showDodgeMsg, setShowDodgeMsg] = useState(false);

    const requestRef = useRef<number>(0);
    const startTimeRef = useRef<number | null>(null);

    const animate = useCallback((time: number) => {
        // If we are showing the dodge message, just request the next frame without updating anything
        if (showDodgeMsg) {
            startTimeRef.current = null; // Reset start time so it doesn't jump when unpaused
            requestRef.current = requestAnimationFrame(animate);
            return;
        }

        if (startTimeRef.current === null) {
            startTimeRef.current = time;
        }

        const elapsed = time - startTimeRef.current;
        const progress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);

        // Calculate current scale linearly based on progress
        const currentScale = START_SCALE - (START_SCALE - MIN_SCALE) * progress;

        // If it goes past the target scale window without player parrying...
        if (currentScale < PARRY_WINDOW[0]) {
            handleMiss();
            return;
        }

        setScale(currentScale);
        requestRef.current = requestAnimationFrame(animate);
    }, [showDodgeMsg]);

    const startAnimation = useCallback(() => {
        setFailed(false);
        setSuccess(false);
        // Don't reset scale if we are showing the dodge message
        if (!showDodgeMsg) {
            setScale(START_SCALE);
        }
        startTimeRef.current = null;
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(animate);
    }, [animate, showDodgeMsg]);

    useEffect(() => {
        startAnimation();
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [startAnimation]);

    const handleMiss = useCallback(() => {
        setFailed(true);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (showDodgeMsg) return; // Don't fail if we are showing the joke
        // Show failure state briefly, then restart
        setTimeout(() => {
            // Only restart if not showing dodge msg
            startAnimation();
        }, 1500);
    }, [showDodgeMsg, startAnimation]);

    const handleParryClick = () => {
        if (failed || success) return;

        if (!dodgeUsed) {
            handleMiss();
            return;
        }

        if (requestRef.current) cancelAnimationFrame(requestRef.current);

        if (scale >= PARRY_WINDOW[0] && scale <= PARRY_WINDOW[1]) {
            setSuccess(true);
            setTimeout(() => {
                onAdvance();
            }, 1000);
        } else {
            handleMiss();
        }
    };

    const handleDodgeClick = () => {
        if (failed || success) return;

        // We do NOT want to cancel the animation frame here, otherwise React stops calling
        // the animate loop entirely. Instead, the animate loop checks showDodgeMsg and idles.

        setDodgeUsed(true);
        setShowDodgeMsg(true);

        // Wait 4 seconds, hide message, restart animation
        setTimeout(() => {
            setShowDodgeMsg(false);
            startAnimation();
        }, 4000);
    };

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className={`flex flex-col items-center justify-center space-y-16 w-full max-w-md mx-auto relative px-4 text-center transition-colors duration-300 ${failed ? 'animate-pulse' : ''}`}>
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Incoming Attack</h2>
                    <p className="text-gray-300">
                        An enemy is striking! Press PARRY when the closing ring matches the center ring.
                    </p>
                </div>

                <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* Target Ring */}
                    <div className="absolute w-24 h-24 border-4 border-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10" />

                    {/* Shrinking Ring */}
                    <div
                        className={`absolute w-24 h-24 border-4 rounded-full transition-colors duration-100 ${failed ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]' :
                            success ? 'border-amber-400 border-8 shadow-[0_0_30px_rgba(251,191,36,1)]' :
                                'border-white opacity-80'
                            }`}
                        style={{
                            transform: `scale(${scale})`,
                        }}
                    />

                    {/* Center point */}
                    <div className="absolute w-2 h-2 bg-emerald-400 rounded-full blur-sm" />
                </div>

                <div className="h-32 flex flex-col items-center justify-center">
                    {failed ? (
                        <div className="text-red-500 font-bold text-2xl tracking-widest animate-bounce mt-4">
                            MISSED!
                        </div>
                    ) : success ? (
                        <div className="text-amber-400 font-bold text-3xl tracking-widest animate-pulse drop-shadow-[0_0_10px_rgba(251,191,36,0.8)] mt-4">
                            PERFECT PARRY!
                        </div>
                    ) : showDodgeMsg ? (
                        <div className="text-emerald-400 font-bold text-xl italic animate-pulse mt-4">
                            "We don't do that here"
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <button
                                onClick={handleParryClick}
                                className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 active:scale-95 text-white font-bold tracking-widest text-xl rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all uppercase"
                            >
                                Parry
                            </button>
                            {!dodgeUsed && (
                                <button
                                    onClick={handleDodgeClick}
                                    className="px-8 py-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 active:scale-95 text-gray-300 font-semibold tracking-wider text-sm rounded-lg transition-all uppercase shadow-md"
                                >
                                    Dodge
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
