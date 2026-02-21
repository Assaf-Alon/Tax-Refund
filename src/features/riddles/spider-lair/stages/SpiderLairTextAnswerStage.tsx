import React from 'react';
import { TextAnswerStage, type TextAnswerStageProps } from '../../../../shared/stages/TextAnswerStage';
import { SPIDER_TEXT_THEME } from '../theme';

type SpiderLairTextAnswerStageProps = Omit<TextAnswerStageProps, 'theme'>;

export const SpiderLairTextAnswerStage: React.FC<SpiderLairTextAnswerStageProps> = (props) => (
    <TextAnswerStage
        {...props}
        errorMessage={props.errorMessage ?? 'The web rejects your answer...'}
        theme={SPIDER_TEXT_THEME}
    />
);
