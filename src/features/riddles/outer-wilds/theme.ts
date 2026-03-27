import type { TextAnswerTheme, WelcomeTheme, CongratsTheme } from '../../../shared/stages/types';

export const SHARED_TEXT_THEME: TextAnswerTheme = {
    container: "text-center space-y-8 w-full max-w-lg z-10",
    title: "text-3xl font-bold text-orange-400",
    promptText: "text-lg text-gray-300",
    input: "w-full max-w-xs bg-black/70 border border-orange-500/50 p-3 text-center focus:outline-none focus:ring-2 focus:ring-orange-500 rounded text-orange-200",
    submitButton: "px-8 py-3 border border-orange-500/50 hover:bg-orange-500 hover:text-white transition-all duration-200 uppercase tracking-wider rounded text-orange-400 font-bold",
    errorText: "text-red-400 text-md animate-pulse font-medium"
};

export const WELCOME_THEME: WelcomeTheme = {
    button: "mt-8 px-8 py-4 bg-orange-600 hover:bg-orange-500 focus:ring-orange-500/50 text-white rounded-lg font-medium transition-all duration-300 shadow-lg shadow-orange-500/25"
};

export const CONGRATS_THEME: CongratsTheme = {
    title: "text-4xl md:text-5xl font-bold text-orange-400 tracking-tight"
};
