import React, { useEffect, useState } from 'react';
import shardImage from '../assets/QuantumShard2.png';

interface QuantumEntanglementStageProps {
    onAdvance: () => void;
}

export const QuantumEntanglementStage: React.FC<QuantumEntanglementStageProps> = ({ onAdvance }) => {
    const [hasConcealed, setHasConcealed] = useState(false);

    useEffect(() => {
        // Detect if the user is on a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // If not mobile, immediately bypass this stage because desktop visibility
        // behavior is too inconsistent with the "cease observation" lore.
        // TODO: try to figure out a better way to implement this
        if (!isMobile) {
            onAdvance();
            return;
        }

        const handleVisibilityChange = () => {
            if (document.hidden || document.visibilityState === 'hidden') {
                setHasConcealed(true);
            } else if (document.visibilityState === 'visible') {
                // Handled in second effect
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [onAdvance]);

    // Effect to check if we should advance when coming back
    useEffect(() => {
        const handleVisibilityChangeForAdvance = () => {
            if (!document.hidden && document.visibilityState === 'visible' && hasConcealed) {
                // Add a tiny delay so the screen renders before jumping to the scary stage
                setTimeout(onAdvance, 100);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChangeForAdvance);
        // Also check immediately in case it re-renders while visible after having been hidden
        if (!document.hidden && document.visibilityState === 'visible' && hasConcealed) {
            setTimeout(onAdvance, 100);
        }

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChangeForAdvance);
        };
    }, [hasConcealed, onAdvance]);

    return (
        <div className="flex flex-col items-center justify-center space-y-8 text-center px-4">
            <h2 className="text-3xl font-bold text-orange-400 tracking-widest uppercase">
                Rule of Quantum Entanglement
            </h2>
            <div className="max-w-md bg-black/50 border border-emerald-500/30 p-8 rounded shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <p className="text-xl text-emerald-100 italic leading-relaxed">
                    "To travel with a quantum object, you must cease observing your surroundings entirely."
                </p>
                <p className="mt-8 text-md font-bold text-orange-300 animate-pulse">
                    The observer must close their eyes.
                </p>
            </div>

            <div className="mt-12">
                <img
                    src={shardImage}
                    alt="A blurry quantum shard"
                    className="w-48 md:w-64 h-auto mx-auto drop-shadow-[0_0_15px_rgba(156,163,175,0.5)]"
                    draggable={false}
                />
            </div>
        </div>
    );
};
