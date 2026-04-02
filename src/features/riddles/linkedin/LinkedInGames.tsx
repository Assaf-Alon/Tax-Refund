import React, { useState, useEffect } from 'react';
import { WelcomeStage } from '../../../shared/stages/WelcomeStage';
import { CongratsStage } from '../../../shared/stages/CongratsStage';
import { DevSkipButton } from '../../admin/DevSkipButton';
import { CrossclimbStage } from './stages/CrossclimbStage';
import { PinpointStage } from './stages/PinpointStage';
import { QueensStage } from './stages/QueensStage';
import { LeaderboardStage } from './stages/LeaderboardStage';
import { LINKEDIN_WELCOME_THEME, LINKEDIN_CONGRATS_THEME } from './theme';
import { useFavicon } from '../../../hooks/useFavicon';
import { updateRiddleMetrics, getRiddleProgress, updateRiddleProgress } from '../../../shared/logic/gameState';

const RIDDLE_ID = 'linkedin-games';

const ProgressHUD: React.FC<{ currentStage: number }> = ({ currentStage }) => {
    if (currentStage === 0 || currentStage === 4) return null;

    const activeLabels = ["Crossclimb", "Pinpoint", "Queens"];

    return (
        <div id="linkedin-progress-hud" className="flex flex-col items-center mb-2 md:mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all duration-500
                            ${currentStage === s 
                                ? 'bg-[#0a66c2] border-[#0a66c2] text-white shadow-md scale-110' 
                                : currentStage > s 
                                    ? 'bg-green-600 border-green-600 text-white' 
                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400'}
                        `}>
                            {currentStage > s ? '✓' : s}
                        </div>
                        {s < 3 && (
                            <div className={`w-8 h-0.5 mx-1 rounded-full ${currentStage > s ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-2 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest opacity-80">
                Game {currentStage} of 3: {activeLabels[currentStage - 1]}
            </div>
        </div>
    );
};

export const LinkedInGames: React.FC = () => {
    useFavicon('/li-48.png');

    const [stage, setStage] = useState<number>(0);
    const [isShowingLeaderboard, setIsShowingLeaderboard] = useState(false);
    const [lastGameTime, setLastGameTime] = useState(0);

    useEffect(() => {
        const savedStage = getRiddleProgress(RIDDLE_ID);
        setStage(savedStage);
    }, []);

    const handleAdvance = (time?: number) => {
        if (typeof time === 'number' && !isShowingLeaderboard) {
            setLastGameTime(time);
            setIsShowingLeaderboard(true);
            
            // Map stage index to game key
            const gameKeys = ["", "crossclimb", "pinpoint", "queens"];
            if (stage >= 1 && stage <= 3) {
                updateRiddleMetrics(RIDDLE_ID, gameKeys[stage], time);
            }
            return;
        }

        const nextStage = stage + 1;
        setStage(nextStage);
        setIsShowingLeaderboard(false);
        updateRiddleProgress(RIDDLE_ID, nextStage);
    };

    const handleNextFromLeaderboard = () => {
        const nextStage = stage + 1;
        setStage(nextStage);
        setIsShowingLeaderboard(false);
        updateRiddleProgress(RIDDLE_ID, nextStage);
    };

    const renderStage = () => {
        if (isShowingLeaderboard) {
            const gameNames = ["", "Crossclimb", "Pinpoint", "Queens"];
            return (
                <LeaderboardStage 
                    gameName={gameNames[stage]} 
                    userTime={lastGameTime} 
                    onNext={handleNextFromLeaderboard} 
                />
            );
        }

        switch (stage) {
            case 0:
                return <WelcomeStage 
                            title="Professional Puzzles" 
                            subtitle="Master the LinkedIn Games" 
                            buttonText="Start Playing" 
                            onAdvance={handleAdvance} 
                            theme={LINKEDIN_WELCOME_THEME} 
                        />;
            case 1:
                return <CrossclimbStage onAdvance={handleAdvance} />;
            case 2:
                return <PinpointStage 
                            clues={['chocolate', 'spy', 'steel art', 'natural history', 'city of prague']} 
                            acceptedAnswers={['Museum']} 
                            onAdvance={handleAdvance} 
                        />;
            case 3:
                return <QueensStage onAdvance={handleAdvance} />;
            case 4:
                return <CongratsStage 
                            title="Executive Performance" 
                            subtitle="You've mastered the professional arena." 
                            theme={LINKEDIN_CONGRATS_THEME} 
                        />;
            default:
                return <div>Unknown Stage: {stage}</div>;
        }
    };

    return (
        <div className="min-h-screen min-w-full overflow-x-hidden text-gray-900 dark:text-gray-200 font-sans selection:bg-blue-500/30 selection:text-white flex flex-col items-center justify-start pt-4 md:pt-12 p-4 md:p-8 relative bg-[#f3f2ef] dark:bg-[#1d2226]">
            <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#0a66c2 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
            />
            
            <main className="w-full max-w-4xl relative z-20 flex flex-col items-center">
                <ProgressHUD currentStage={stage} />
                <div className="w-full">
                    <React.Fragment key={stage}>{renderStage()}</React.Fragment>
                </div>
            </main>

            <DevSkipButton 
                riddleId={RIDDLE_ID} 
                currentStage={stage} 
                totalStages={5} 
                onSkip={handleAdvance} 
            />
        </div>
    );
};
