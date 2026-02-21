import React from 'react';
import { loadState, setRiddleProgress } from '../../shared/logic/gameState';

interface DevSkipButtonProps {
    riddleId: string;
    currentStage: number;
    totalStages: number;
    onSkip?: () => void;
}

export const DevSkipButton: React.FC<DevSkipButtonProps> = ({
    riddleId,
    currentStage,
    totalStages,
    onSkip
}) => {
    // 1. Only render in development
    if (!import.meta.env.DEV) return null;

    // 2. Only render if enabled in admin settings
    const state = loadState();
    if (!state.adminSettings?.devToolsEnabled) return null;

    // 3. Hide if we are on the last stage (or beyond)
    if (currentStage >= totalStages - 1) return null;

    const handleSkip = () => {
        if (onSkip) {
            onSkip();
        } else {
            setRiddleProgress(riddleId, currentStage + 1);
            // Force a reload so the parent component picks up the new state from localStorage
            window.location.reload();
        }
    };

    return (
        <button
            onClick={handleSkip}
            className="fixed bottom-4 right-4 z-50 bg-black/80 text-white border border-pink-500/50 px-4 py-2 rounded shadow-lg shadow-pink-500/20 backdrop-blur font-mono text-sm hover:bg-black hover:border-pink-500 transition-all active:scale-95 flex items-center gap-2 group"
            title="Dev Tools: Skip to next stage"
        >
            <span className="text-pink-500 group-hover:animate-pulse">⚡</span>
            Skip Stage
        </button>
    );
};
