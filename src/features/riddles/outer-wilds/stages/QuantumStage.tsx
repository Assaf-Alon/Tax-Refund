import React, { useRef, useEffect, useState } from 'react';

// Placeholder or imported image for the shard. We'll try to import a real one if generated.
// For now, we fallback to a stylized div if the image fails or isn't there.
import shardImage from '../assets/quantum_shard.png';

interface QuantumStageProps {
    onAdvance: () => void;
}

export const QuantumStage: React.FC<QuantumStageProps> = ({ onAdvance }) => {
    const [hasLookedAway, setHasLookedAway] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const shardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowHint(true);
        }, 60000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                // If it is 100% out of view (isIntersecting is false)
                if (!entry.isIntersecting) {
                    setHasLookedAway(true);
                }
            },
            {
                threshold: 0, // Trigger as soon as 1 pixel is visible or 0 visible
            }
        );

        if (shardRef.current) {
            observer.observe(shardRef.current);
        }

        return () => {
            if (shardRef.current) {
                observer.unobserve(shardRef.current);
            }
        };
    }, []);

    return (
        <div className="w-full min-h-[200vh] flex flex-col items-center relative text-center">
            {/* Top Area */}
            <div className="h-screen w-full flex flex-col items-center justify-center p-8">
                <p className="text-xl md:text-2xl text-gray-300 mb-12 italic font-serif">
                    "I exist... but the moment you look away, I am gone."
                </p>

                <div ref={shardRef} className="min-h-[300px] flex items-center justify-center transition-opacity duration-[2000ms]">
                    {!hasLookedAway ? (
                        <div className="relative animate-pulse">
                            {/* We try to use an image, with fallback styling */}
                            <img
                                src={shardImage}
                                alt="Quantum Shard"
                                className="w-64 h-auto object-contain drop-shadow-[0_0_15px_rgba(156,163,175,0.5)]"
                                onError={(e) => {
                                    // Fallback if image not yet generated
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                }}
                            />
                            {/* Fallback SVGs if no image generated yet. Just a dark grey crystal shape. */}
                            <div className="hidden w-48 h-64 bg-slate-800 clip-path-polygon-[50%_0%,_100%_25%,_80%_100%,_20%_90%,_0%_30%] border border-slate-600 shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center">
                                <span className="text-slate-500 text-xs text-center px-4">Quantum Shard</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center animate-fade-in">
                            <p className="text-orange-400 mb-8 max-w-md">
                                The shard has relocated. A path is now clear.
                            </p>
                            <button
                                onClick={onAdvance}
                                className="px-8 py-4 bg-orange-600 hover:bg-orange-500 focus:ring-orange-500/50 text-white rounded-lg font-medium transition-all duration-300 shadow-lg shadow-orange-500/25"
                            >
                                Proceed
                            </button>
                        </div>
                    )}
                </div>

                {showHint && !hasLookedAway && (
                    <p className="text-sm text-gray-500 mt-24 animate-bounce animate-fade-in">
                        Scroll down...
                    </p>
                )}
            </div>

            {/* Bottom Area to force scrolling */}
            <div className="h-screen w-full flex items-end justify-center pb-32">
                <p className="text-lg text-gray-400">
                    You are no longer observing. Scroll back up.
                </p>
            </div>
        </div>
    );
};
