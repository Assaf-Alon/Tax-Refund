import React from 'react';
import { FillWordsStage } from '../../../../shared/stages/FillWordsStage';
import { SPIDER_FILL_WORDS_THEME } from '../theme';

const LYRICS_LINES = [
    "I think it's time for a date",
];

interface SpiderLairLyricsStageProps {
    onAdvance: () => void;
}

export const SpiderLairLyricsStage: React.FC<SpiderLairLyricsStageProps> = ({ onAdvance }) => (
    <FillWordsStage
        title="Spider Dance"
        introContent={
            <>
                <p className="text-pink-200/70 text-sm">
                    Complete the lyrics. The spider hums the tune...
                </p>
                <p className="text-[#ff007f] font-mono text-lg tracking-wider">
                    2, 4, 6, 8
                </p>
            </>
        }
        lines={LYRICS_LINES}
        hint="Spider Dance — Undertale"
        hintCooldown={60}
        onAdvance={onAdvance}
        theme={SPIDER_FILL_WORDS_THEME}
    />
);
