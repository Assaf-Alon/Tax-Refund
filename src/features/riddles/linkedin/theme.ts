import type { WelcomeTheme, CongratsTheme } from '../../../shared/stages/types';

export const LINKEDIN_COLORS = {
    blue: '#0a66c2',
    bgLight: '#f3f2ef',
    bgDark: '#1d2226',
};

export const LINKEDIN_WELCOME_THEME: WelcomeTheme = {
    container: "text-center space-y-8 animate-in fade-in zoom-in duration-1000",
    title: "text-5xl font-extrabold text-blue-600 dark:text-blue-500 tracking-tight",
    subtitle: "text-xl text-blue-800/80 dark:text-blue-200/60 font-medium",
    button: "px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)] uppercase tracking-widest text-sm"
};

export const LINKEDIN_CONGRATS_THEME: CongratsTheme = {
    container: "text-center space-y-6 animate-in fade-in slide-in-from-top-10 duration-1000",
    title: "text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600",
    subtitle: "text-blue-800/80 dark:text-blue-200/80 text-lg font-medium"
};
