import React, { useState, useEffect } from 'react';
import { getRiddleProgress, updateRiddleProgress } from '../../../shared/logic/gameState';
import { EntranceStage } from './stages/EntranceStage';
import { PasscodeStage } from './stages/PasscodeStage';
import { LyricsStage } from './stages/LyricsStage';
import { SkarrsingerStage } from './stages/SkarrsingerStage';
import { CreatureStage } from './stages/CreatureStage';
import { TextAnswerStage } from './stages/TextAnswerStage';
import { CongratsPage } from './CongratsPage';
import slabImg from './assets/slab.png';
import miteImg from './assets/mite.png';

const RIDDLE_ID = 'spider-lair';

export const SpiderLair: React.FC = () => {
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
                return <EntranceStage onAdvance={handleAdvance} />;
            case 1:
                return <PasscodeStage onAdvance={handleAdvance} />;
            case 2:
                return <LyricsStage onAdvance={handleAdvance} />;
            case 3:
                return <SkarrsingerStage onAdvance={handleAdvance} />;
            case 4:
                return (
                    <TextAnswerStage
                        title="A Question of Acts"
                        prompt="How many acts are there to Silksong?"
                        acceptedAnswers={['3']}
                        errorMessage="The threads tighten... try again."
                        onAdvance={handleAdvance}
                    />
                );
            case 5:
                return (
                    <TextAnswerStage
                        title="A Dark Act"
                        prompt="In what act does Pharloom get aids?"
                        acceptedAnswers={['3']}
                        hint="The final act holds the darkest secret..."
                        hintCooldown={60}
                        errorMessage="Wrong answer. The web trembles."
                        onAdvance={handleAdvance}
                    />
                );
            case 6:
                return (
                    <TextAnswerStage
                        title="Allies in Battle"
                        prompt="I use them to help against tough opponents..."
                        acceptedAnswers={['friends', 'cogfly']}
                        hint="Small, buzzy, and loyal..."
                        hintCooldown={60}
                        errorMessage="That's not who helps you... 🛸"
                        onAdvance={handleAdvance}
                    />
                );
            case 7:
                return <CreatureStage onAdvance={handleAdvance} />;
            case 8:
                return (
                    <TextAnswerStage
                        title="Name This Place"
                        prompt="What's the name of the place in this image?"
                        acceptedAnswers={['the slab', 'slab']}
                        hint="A flat, cold resting place..."
                        hintCooldown={60}
                        errorMessage="That's wrong. Try again."
                        onAdvance={handleAdvance}
                        image={slabImg}
                        imageAlt="A mysterious location"
                    />
                );
            case 9:
                return (
                    <TextAnswerStage
                        title="Name This Creature"
                        prompt="What's the name of this f*cker?"
                        acceptedAnswers={['hitler', 'mite']}
                        hint="Small, annoying, and a Nazi"
                        hintCooldown={60}
                        errorMessage="Nope. Try a specific enemy of Jews..."
                        onAdvance={handleAdvance}
                        image={miteImg}
                        imageAlt="A small annoying creature"
                    />
                );
            case 10:
                return (
                    <TextAnswerStage
                        title="A Command to Remember"
                        prompt="What CLI command does Hornet often use when speaking to the knight?"
                        acceptedAnswers={['git gud', 'git good']}
                        hint="A version control system..."
                        hintCooldown={60}
                        errorMessage="The spider shakes her head... Not good."
                        onAdvance={handleAdvance}
                    />
                );
            case 11:
                return <CongratsPage />;
            default:
                return <CongratsPage />;
        }
    };

    return (
        <div
            className="min-h-screen min-w-full font-mono tracking-wide selection:bg-pink-900 selection:text-white overflow-x-hidden text-pink-200"
            style={{
                background: 'radial-gradient(circle, #2d0036 0%, #000000 100%)',
            }}
        >
            {/* Subtle web pattern overlay */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cline x1='0' y1='0' x2='60' y2='60' stroke='%23ff007f' stroke-width='0.5'/%3E%3Cline x1='60' y1='0' x2='0' y2='60' stroke='%23ff007f' stroke-width='0.5'/%3E%3Cline x1='30' y1='0' x2='30' y2='60' stroke='%23ff007f' stroke-width='0.3'/%3E%3Cline x1='0' y1='30' x2='60' y2='30' stroke='%23ff007f' stroke-width='0.3'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                }}
            />

            <header className="p-4 border-b border-[#ff007f]/20 flex justify-between items-center bg-black/30 backdrop-blur-sm sticky top-0 z-10">
                <div className="text-xs uppercase tracking-[0.2em] text-[#ff007f]/50">
                    Spider's Lair // Web {stage}
                </div>
                <div className="w-2 h-2 rounded-full bg-[#ff007f] animate-pulse shadow-[0_0_10px_rgba(255,0,127,0.6)]" />
            </header>

            <main className="container mx-auto p-4 md:p-12 min-h-[80vh] flex flex-col items-center justify-center relative z-0">
                <React.Fragment key={stage}>{renderStage()}</React.Fragment>
            </main>

            <footer className="text-center p-8 text-xs text-[#ff007f]/20">
                <p>silk_thread_v2.4 // end_of_web</p>
            </footer>
        </div>
    );
};
