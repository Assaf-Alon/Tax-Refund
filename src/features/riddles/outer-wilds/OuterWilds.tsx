import React, { useState, useEffect } from 'react';
import { getRiddleProgress, updateRiddleProgress } from '../../../shared/logic/gameState';
import { WelcomeStage } from '../../../shared/stages/WelcomeStage';
import { DrawSequenceStage } from '../../../shared/stages/DrawSequenceStage';
import { TextAnswerStage } from '../../../shared/stages/TextAnswerStage';
import { CongratsStage } from '../../../shared/stages/CongratsStage';
import { DevSkipButton } from '../../admin/DevSkipButton';
import { QuantumStage } from './stages/QuantumStage';
import { GhostMatterRiverStage } from './stages/GhostMatterRiverStage';
import { QuantumEntanglementStage } from './stages/QuantumEntanglementStage';
import outerWildsLogo from './assets/OuterWildsLogo.png';
import outerWildsTheme from './assets/Outer Wilds.mp3';
import { useAudio } from '../../../shared/utils/useAudio';

const DelayedTranslatorLink: React.FC<{ delay: number }> = ({ delay }) => {
    const [showTranslatorLink, setShowTranslatorLink] = useState(false);
    const [emphasizeLink, setEmphasizeLink] = useState(false);

    useEffect(() => {
        const timer1 = setTimeout(() => setShowTranslatorLink(true), delay);
        const timer2 = setTimeout(() => setEmphasizeLink(true), delay + 7000);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [delay]);

    return (
        <div className={`transition-all duration-1000 ${showTranslatorLink ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} ${emphasizeLink ? 'scale-125' : ''}`}>
            <a
                href="#/translator"
                target="_blank"
                rel="noopener noreferrer"
                className={`
                    px-6 py-2 transition-all duration-500 rounded font-mono tracking-wider uppercase inline-block
                    ${emphasizeLink
                        ? 'border-2 border-blue-400 bg-blue-500/30 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] font-bold text-base'
                        : 'border border-blue-500/50 hover:bg-blue-500/20 text-blue-300 text-sm'
                    }
                `}
            >
                Open Translation Tool
            </a>
        </div>
    );
};

const RIDDLE_ID = 'outer-wilds';

const SHARED_TEXT_THEME = {
    container: "text-center space-y-8 w-full max-w-lg z-10",
    title: "text-3xl font-bold text-orange-400",
    promptText: "text-lg text-gray-300",
    input: "w-full max-w-xs bg-black/70 border border-orange-500/50 p-3 text-center focus:outline-none focus:ring-2 focus:ring-orange-500 rounded text-orange-200",
    submitButton: "px-8 py-3 border border-orange-500/50 hover:bg-orange-500 hover:text-white transition-all duration-200 uppercase tracking-wider rounded text-orange-400 font-bold",
    errorText: "text-red-400 text-md animate-pulse font-medium"
};

export const OuterWilds: React.FC = () => {
    const [stage, setStage] = useState<number>(0);

    // Audio should play starting from stage 1 through 9
    const audioSrc = stage >= 1 && stage < 10 ? outerWildsTheme : null;
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
                        title={<img src={outerWildsLogo} alt="Outer Wilds Ventures Logo" className="mx-auto max-w-xs md:max-w-md" />}
                        subtitle="Join the expedition"
                        buttonText="Begin"
                        onAdvance={handleAdvance}
                        theme={{
                            button: "mt-8 px-8 py-4 bg-orange-600 hover:bg-orange-500 focus:ring-orange-500/50 text-white rounded-lg font-medium transition-all duration-300 shadow-lg shadow-orange-500/25"
                        }}
                    />
                );
            case 1:
                return (
                    <TextAnswerStage
                        title="End of the Loop"
                        prompt="The sun explodes in how many minutes?"
                        acceptedAnswers={["22"]}
                        exactMatchOnly={true}
                        onAdvance={handleAdvance}
                        theme={SHARED_TEXT_THEME}
                    />
                );
            case 2:
                return (
                    <TextAnswerStage
                        title="The Reckless Traveler"
                        prompt="Who plays the harmonica deep inside a corrupted seed?"
                        acceptedAnswers={["feldspar"]}
                        exactMatchOnly={false}
                        onAdvance={handleAdvance}
                        theme={SHARED_TEXT_THEME}
                    />
                );
            case 3:
                return (
                    <QuantumStage onAdvance={handleAdvance} />
                );
            case 4:
                return (
                    <TextAnswerStage
                        title="The Ancient Architects"
                        prompt="They arrived on The Vessel and built the Ash Twin Project. Who are they?"
                        acceptedAnswers={["nomai", "the nomai"]}
                        exactMatchOnly={false}
                        onAdvance={handleAdvance}
                        theme={SHARED_TEXT_THEME}
                    />
                );
            case 5:
                return (
                    <TextAnswerStage
                        title="The Ultimate Power"
                        prompt="What powers the Ash Twin Project?"
                        acceptedAnswers={["supernova", "the sun", "the sun exploding", "sun", "a supernova"]}
                        exactMatchOnly={false}
                        onAdvance={handleAdvance}
                        theme={SHARED_TEXT_THEME}
                    />
                );
            case 6:
                return (
                    <GhostMatterRiverStage onAdvance={handleAdvance} />
                );
            case 7:
                return (
                    <QuantumEntanglementStage onAdvance={handleAdvance} />
                );
            case 8:
                return (
                    <TextAnswerStage
                        title="The Blind Terror"
                        prompt="F*ck this planet."
                        acceptedAnswers={["dark bramble"]}
                        exactMatchOnly={false}
                        onAdvance={handleAdvance}
                        theme={SHARED_TEXT_THEME}
                    />
                );
            case 9:
                return (
                    <div className="flex flex-col items-center gap-12 pt-8">
                        <DrawSequenceStage
                            expectedDigits={[
                                [ // 2
                                    ["0-1", "1-3", "2-3", "2-4", "4-5"],
                                ],
                                [ // 9
                                    ["0-1", "0-2", "1-3", "2-3", "3-5"],
                                    ["0-1", "0-2", "1-3", "2-3", "3-5", "4-5"], // With bottom hook
                                ],
                                [ // 0
                                    ["0-1", "0-2", "1-3", "2-4", "3-5", "4-5"],
                                ],
                                [ // 6
                                    ["0-2", "2-3", "2-4", "3-5", "4-5"],
                                    ["0-1", "0-2", "2-3", "2-4", "3-5", "4-5"], // With top bar
                                ],
                            ]}
                            onAdvance={handleAdvance}
                        />

                        {/* The component handles its own hook lifecycle */}
                        <DelayedTranslatorLink delay={7000} />
                    </div>
                );
            case 10:
                return (
                    <CongratsStage
                        title="Mission Accomplished"
                        subtitle="You've mapped the stars."
                        theme={{
                            title: "text-4xl md:text-5xl font-bold text-orange-400 tracking-tight"
                        }}
                    />
                );
            default:
                return (
                    <CongratsStage
                        title="Mission Accomplished"
                        subtitle="You've mapped the stars."
                        theme={{
                            title: "text-4xl md:text-5xl font-bold text-orange-400 tracking-tight"
                        }}
                    />
                );
        }
    };

    return (
        <div
            className="min-h-screen min-w-full overflow-x-hidden text-gray-200 font-sans selection:bg-orange-500/30 selection:text-white"
            style={{
                background: 'radial-gradient(circle, #0f172a 0%, #000000 100%)',
            }}
        >
            <main className="container mx-auto p-4 md:p-12 min-h-[100vh] flex flex-col items-center justify-center relative z-0">
                <React.Fragment key={stage}>{renderStage()}</React.Fragment>
            </main>
            <DevSkipButton riddleId={RIDDLE_ID} currentStage={stage} totalStages={11} onSkip={handleAdvance} />
        </div>
    );
};
