import React from 'react';
import type { CongratsTheme } from './types';

export interface CongratsStageProps {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    children?: React.ReactNode;
    theme?: CongratsTheme;
}

export const CongratsStage: React.FC<CongratsStageProps> = ({
    title,
    subtitle,
    children,
    theme,
}) => {
    return (
        <div className={theme?.container ?? 'flex flex-col items-center justify-center space-y-8 text-center px-4 w-full h-full'}>
            <div className="space-y-4">
                {typeof title === 'string' ? (
                    <h1 className={theme?.title ?? 'text-4xl md:text-5xl font-bold text-green-400 tracking-tight'}>
                        {title}
                    </h1>
                ) : (
                    title
                )}

                {subtitle && (
                    typeof subtitle === 'string' ? (
                        <p className={theme?.subtitle ?? 'text-lg md:text-xl text-gray-300 max-w-xl mx-auto'}>
                            {subtitle}
                        </p>
                    ) : (
                        subtitle
                    )
                )}
            </div>

            {children && (
                <div className="mt-8">
                    {children}
                </div>
            )}
        </div>
    );
};
