import React, { useState, useEffect } from 'react';
import { getRiddleProgress, updateRiddleProgress } from '../../../shared/logic/gameState';
import { WelcomeStage } from '../../../shared/stages/WelcomeStage';
import { CongratsStage } from '../../../shared/stages/CongratsStage';
import { DevSkipButton } from '../../admin/DevSkipButton';
import { CrossclimbStage } from './stages/CrossclimbStage';
import { PinpointStage } from './stages/PinpointStage';
import { QueensStage } from './stages/QueensStage';
import { LINKEDIN_WELCOME_THEME, LINKEDIN_CONGRATS_THEME } from './theme';
import { useFavicon } from '../../../hooks/useFavicon';

const RIDDLE_ID = 'linkedin-games';

export const LinkedInGames: React.FC = () => {
    useFavicon('/li-48.png'); // LinkedIn favicon

    const [stage, setStage] = useState<number>(0);

    useEffect(() => {
        const savedStage = getRiddleProgress(RIDDLE_ID);
        setStage(savedStage);
    }, []);

    const handleAdvance = () => {
        const nextStage = stage + 1;
        setStage(nextStage);
        updateRiddleProgress(RIDDLE_ID, nextStage);
    };

    const renderStage = () => {
        switch (stage) {
            case 0:
                return (
                    <WelcomeStage
                        title="Professional Puzzles"
                        subtitle="Master the LinkedIn Games"
                        buttonText="Start Playing"
                        onAdvance={handleAdvance}
                        theme={LINKEDIN_WELCOME_THEME}
                    />
                );
            case 1:
                return (
                    <CrossclimbStage
                        onAdvance={handleAdvance}
                    />
                );
            case 2:
                return (
                    <PinpointStage
                        clues={[
                            'chocolate',
                            'spy',
                            'steel art',
                            'natural history',
                            'city of prague'
                        ]}
                        acceptedAnswers={['Museum']}
                        onAdvance={handleAdvance}
                    />
                );
            case 3:
                return (
                    <QueensStage
                        onAdvance={handleAdvance}
                    />
                );
            case 4:
                return (
                    <CongratsStage
                        title="Executive Performance"
                        subtitle="You've mastered the professional arena."
                        theme={LINKEDIN_CONGRATS_THEME}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div 
            className="min-h-screen min-w-full overflow-x-hidden text-gray-900 dark:text-gray-200 font-sans selection:bg-blue-500/30 selection:text-white flex flex-col items-center justify-center p-4 md:p-12 relative bg-[#f3f2ef] dark:bg-[#1d2226]"
        >
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#0a66c2 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
            />
            
            <main className="w-full max-w-4xl relative z-10">
                <React.Fragment key={stage}>{renderStage()}</React.Fragment>
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
