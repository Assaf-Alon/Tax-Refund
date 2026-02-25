import React from 'react';
import type { WelcomeTheme } from './types';

export interface WelcomeStageProps {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    buttonText: string;
    onAdvance: () => void;
    theme?: WelcomeTheme;
}

export const WelcomeStage: React.FC<WelcomeStageProps> = ({
    title,
    subtitle,
    buttonText,
    onAdvance,
    theme,
}) => {
    return (
        <div className={theme?.container ?? 'flex flex-col items-center justify-center space-y-8 text-center px-4 w-full h-full'}>
            <div className="space-y-4">
                {typeof title === 'string' ? (
                    <h1 className={theme?.title ?? 'text-4xl md:text-5xl font-bold tracking-tight'}>
                        {title}
                    </h1>
                ) : (
                    title
                )}

                {subtitle && (
                    typeof subtitle === 'string' ? (
                        <p className={theme?.subtitle ?? 'text-lg md:text-xl text-gray-300 opacity-90 max-w-2xl mx-auto'}>
                            {subtitle}
                        </p>
                    ) : (
                        subtitle
                    )
                )}
            </div>

            <button
                onClick={onAdvance}
                className={theme?.button ?? 'mt-8 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all duration-300 focus:ring-4 focus:ring-blue-500/50 shadow-lg shadow-blue-500/25'}
            >
                {buttonText}
            </button>
        </div>
    );
};
