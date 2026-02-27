import React, { useState } from 'react';
import { ActionRingStage } from '../../../../shared/components/stages/ActionRingStage';

export interface ReactiveParryStageProps {
    onAdvance: () => void;
}

export const ReactiveParryStage: React.FC<ReactiveParryStageProps> = ({ onAdvance }) => {
    const [dodgeUsed, setDodgeUsed] = useState(false);
    const [showDodgeMsg, setShowDodgeMsg] = useState(false);

    const handleDodgeClick = () => {
        setDodgeUsed(true);
        setShowDodgeMsg(true);

        setTimeout(() => {
            setShowDodgeMsg(false);
        }, 4000);
    };

    return (
        <ActionRingStage
            title="Incoming Attack"
            description="An enemy is striking! Press PARRY when the closing ring matches the center ring."
            actionLabel="Parry"
            onAdvance={onAdvance}
            isPaused={showDodgeMsg}
            actionAreaOverride={
                showDodgeMsg ? (
                    <div className="text-emerald-400 font-bold text-xl italic animate-pulse mt-4">
                        "We don't do that here"
                    </div>
                ) : undefined
            }
            extraButtons={
                !dodgeUsed ? (
                    <button
                        onClick={handleDodgeClick}
                        className="px-8 py-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 active:scale-95 text-gray-300 font-semibold tracking-wider text-sm rounded-lg transition-all uppercase shadow-md"
                    >
                        Dodge
                    </button>
                ) : undefined
            }
        />
    );
};

