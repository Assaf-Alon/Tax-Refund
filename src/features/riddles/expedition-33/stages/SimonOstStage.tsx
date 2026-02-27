import React from 'react';
import simonPortrait from '../assets/simon.png';
import swordOfLumiereVid from '../assets/sword-of-lumiere.mp4';
import { MultipleChoiceStage, type Choice } from '../../../../shared/components/stages/MultipleChoiceStage';

interface SimonOstStageProps {
    onAdvance: () => void;
}

const ALL_CHOICES: Choice[] = [
    { label: 'We Lost', correct: true },
    { label: 'Don\'t Cry', correct: true },
    { label: 'Lumière', correct: false },
    { label: "L'Appel du Vide", correct: false },
    { label: 'Paintress Waltz', correct: false },
    { label: 'Expedition March', correct: false },
    { label: 'Clair de Lune', correct: false },
    { label: 'Gommage', correct: false },
    { label: "Monoko's Requiem", correct: false },
    { label: 'Expedition 0', correct: false },
    { label: 'The 33rd Year', correct: false },
    { label: 'Echoes of the Paintress', correct: false },
    { label: 'Symphony of the End', correct: false },
];

export const SimonOstStage: React.FC<SimonOstStageProps> = ({ onAdvance }) => {
    return (
        <MultipleChoiceStage
            title="Simon's Melody"
            description="What's the OST that plays when we fight Simon?"
            choices={ALL_CHOICES}
            onAdvance={onAdvance}
            mediaRow={
                <>
                    <img
                        src={simonPortrait}
                        alt="Simon"
                        className="w-36 md:w-44 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.2)] border border-emerald-500/20"
                    />
                    <video
                        src={swordOfLumiereVid}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-48 md:w-56 rounded-lg shadow-[0_0_30px_rgba(16,185,129,0.2)] border border-emerald-500/20"
                    />
                </>
            }
            successMessageRenderer={(correctLabel) => (
                correctLabel === 'We Lost'
                    ? 'That is correct, but I was hoping you\'d go for the Don\'t Cry option 😜'
                    : 'אללל תבכייייי אל תבכייי!!!!'
            )}
        />
    );
};

