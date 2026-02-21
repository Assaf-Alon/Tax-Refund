import type { TextAnswerTheme, PinAnswerTheme, FillWordsTheme } from '../../../shared/stages/types';

export const SPIDER_TEXT_THEME: TextAnswerTheme = {
    container: 'text-center space-y-8 w-full max-w-lg',
    title: 'text-2xl text-[#ff007f]',
    promptText: 'text-pink-200/60 text-sm',
    input: 'w-full max-w-xs bg-black/50 border border-[#b0005d] p-3 text-center text-pink-100 focus:border-[#ff007f] focus:outline-none focus:ring-1 focus:ring-[#ff007f] transition-colors rounded',
    submitButton: 'px-6 py-2 bg-[#ff007f]/10 border border-[#b0005d] hover:bg-[#ff007f]/20 hover:border-[#ff007f] transition-all duration-200 text-xs uppercase tracking-wider text-pink-200 rounded',
    errorText: 'text-red-400 text-sm animate-pulse',
    imageWrapper: 'max-w-xs rounded-lg border border-[#b0005d] shadow-[0_0_20px_rgba(255,0,127,0.3)]',
};

export const SPIDER_PIN_THEME: PinAnswerTheme = {
    container: 'text-center space-y-8 w-full max-w-sm',
    title: 'text-2xl text-[#ff007f]',
    promptText: 'text-pink-200/70 text-sm',
    dotFilled: 'bg-[#ff007f] shadow-[0_0_10px_rgba(255,0,127,0.6)]',
    dotEmpty: 'bg-gray-700 border border-[#b0005d]',
    shakeAnimation: 'animate-shake',
    pinButton: 'w-12 h-12 text-2xl bg-black/50 hover:bg-[#ff007f]/20 border border-[#b0005d] hover:border-[#ff007f] rounded font-semibold transition-all duration-200 text-pink-200',
};

export const SPIDER_FILL_WORDS_THEME: FillWordsTheme = {
    container: 'text-center space-y-6 w-full max-w-2xl',
    title: 'text-2xl text-[#ff007f]',
    wordGap: 'inline-block w-3 sm:w-5',
    trailingPunctuation: 'text-[#ff007f]/60 font-mono text-sm sm:text-lg',
};
