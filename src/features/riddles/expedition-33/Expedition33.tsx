import React, { useState, useEffect } from 'react';
import { getRiddleProgress, updateRiddleProgress } from '../../../shared/logic/gameState';
import { WelcomeStage } from '../../../shared/stages/WelcomeStage';
import { TextAnswerStage } from '../../../shared/stages/TextAnswerStage';
import { CongratsStage } from '../../../shared/stages/CongratsStage';
import { DevSkipButton } from '../../admin/DevSkipButton';
import { useAudio } from '../../../shared/utils/useAudio';
import { useFavicon } from '../../../hooks/useFavicon';

import { EsquieStage } from './stages/EsquieStage';
import { ReactiveParryStage } from './stages/ReactiveParryStage';
import { FadingTextStage } from './stages/FadingTextStage';
import { TeamBuilderStage } from './stages/TeamBuilderStage';
import { FinalChoiceStage } from './stages/FinalChoiceStage';
import { SimonOstStage } from './stages/SimonOstStage';

import lumiereOst from './assets/Lumiere.mp3';
import weLostOst from './assets/We Lost.mp3';
import exp33Art from './assets/exp33.png';

import { SHARED_TEXT_THEME, WELCOME_THEME, CONGRATS_THEME } from './theme';

const RIDDLE_ID = 'expedition-33';

export const Expedition33: React.FC = () => {
    // Optionally use a custom favicon if desired, else it defaults smoothly
    useFavicon(`${import.meta.env.BASE_URL}xp33-256.png`);

    const [stage, setStage] = useState<number>(0);

    const audioSrc = stage === 7 ? weLostOst : lumiereOst;
    useAudio(audioSrc, { loop: true });

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
                        title={
                            <div className="flex flex-col items-center space-y-6">
                                <img
                                    src={exp33Art}
                                    alt="Clair Obscur: Expedition 33"
                                    className="w-72 md:w-96 rounded-lg shadow-[0_0_40px_rgba(16,185,129,0.25)]"
                                />
                                <h1 className="text-5xl md:text-6xl font-serif italic tracking-wide text-emerald-50 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                                    Lumière
                                </h1>
                            </div>
                        }
                        subtitle="Join the Expedition"
                        buttonText="Enter"
                        onAdvance={handleAdvance}
                        theme={WELCOME_THEME}
                    />
                );
            case 1:
                return (
                    <TextAnswerStage
                        title="Lovely Feet"
                        prompt="She has lovely feet... 🦧"
                        acceptedAnswers={["lune"]}
                        onAdvance={handleAdvance}
                        theme={SHARED_TEXT_THEME}
                    />
                );
            case 2:
                return (
                    <EsquieStage onAdvance={handleAdvance} />
                );
            case 3:
                return (
                    <ReactiveParryStage onAdvance={handleAdvance} />
                );
            case 4:
                return (
                    <TextAnswerStage
                        title="The Antagonist"
                        prompt="I stand in your way, cane in hand, guarding the Paintress to protect my own. Who am I?"
                        acceptedAnswers={['reunuar', 'renoir']}
                        onAdvance={handleAdvance}
                        theme={SHARED_TEXT_THEME}
                    />
                );
            case 5:
                return (
                    <TeamBuilderStage onAdvance={handleAdvance} />
                );
            case 6:
                return (
                    <FadingTextStage onAdvance={handleAdvance} />
                );
            case 7:
                return (
                    <SimonOstStage onAdvance={handleAdvance} />
                );
            case 8:
                return (
                    <FinalChoiceStage onAdvance={handleAdvance} />
                );
            case 9:
                return (
                    <CongratsStage
                        title="The Paintress Falls"
                        subtitle="You have completed the Expedition."
                        theme={CONGRATS_THEME}
                    />
                );
            default:
                return (
                    <CongratsStage
                        title="The Paintress Falls"
                        subtitle="You have completed the Expedition."
                        theme={CONGRATS_THEME}
                    />
                );
        }
    };

    return (
        <div
            className="min-h-screen min-w-full overflow-x-hidden text-gray-200 font-sans selection:bg-emerald-500/30 selection:text-white"
            style={{
                // Dark slate background for a serious, "clair obscur" vibe
                background: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)',
            }}
        >
            <main className="container mx-auto p-4 md:p-12 min-h-[100vh] flex flex-col items-center justify-center relative z-0">
                <React.Fragment key={stage}>{renderStage()}</React.Fragment>
            </main>
            <DevSkipButton riddleId={RIDDLE_ID} currentStage={stage} totalStages={10} onSkip={handleAdvance} />
        </div>
    );
};
