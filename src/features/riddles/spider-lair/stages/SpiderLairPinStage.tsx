import React from 'react';
import { PinAnswerStage } from '../../../../shared/stages/PinAnswerStage';
import { SPIDER_PIN_THEME } from '../theme';

interface SpiderLairPinStageProps {
    onAdvance: () => void;
}

export const SpiderLairPinStage: React.FC<SpiderLairPinStageProps> = ({ onAdvance }) => (
    <PinAnswerStage
        correctPin="2468"
        title="The Web Lock"
        prompt="The spider demands a code. Four numbers... always even. 🍩🕷️"
        hint="Count by twos..."
        hintCooldown={60}
        onAdvance={onAdvance}
        theme={SPIDER_PIN_THEME}
    />
);
