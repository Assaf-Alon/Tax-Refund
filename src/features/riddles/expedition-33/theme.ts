import type { TextAnswerTheme, WelcomeTheme, CongratsTheme } from '../../../shared/stages/types';

export const SHARED_TEXT_THEME: TextAnswerTheme = {
    container: "text-center space-y-8 w-full max-w-lg z-10",
    title: "text-3xl font-bold font-serif text-emerald-400 tracking-wide",
    promptText: "text-lg text-gray-300 font-serif italic",
    input: "w-full max-w-xs bg-black/60 border border-emerald-500/30 p-3 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/60 rounded text-emerald-100 placeholder-emerald-800/50",
    submitButton: "px-8 py-3 bg-emerald-900/40 border border-emerald-500/50 hover:bg-emerald-800 hover:text-white transition-all duration-300 uppercase tracking-widest rounded text-emerald-400 font-bold",
    errorText: "text-red-400 text-md animate-pulse font-medium"
};

export const WELCOME_THEME: WelcomeTheme = {
    button: "mt-8 px-10 py-4 bg-emerald-800/80 hover:bg-emerald-600 focus:ring-emerald-500/50 text-emerald-50 rounded font-serif italic text-xl transition-all duration-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-500/30",
    container: "flex flex-col items-center justify-center space-y-12 text-center px-4 w-full h-full"
};

export const CONGRATS_THEME: CongratsTheme = {
    title: "text-4xl md:text-6xl font-serif italic text-emerald-400 tracking-tight"
};
