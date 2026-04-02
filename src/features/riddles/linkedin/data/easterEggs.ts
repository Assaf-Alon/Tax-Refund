export type EasterEggFn = (context: { gameName: string, userTime: number }) => string;

/**
 * A mapping of game names to specific humorous "insight" quotes.
 * Add new game names here to assign them a unique quote.
 */
export const GAME_SPECIFIC_EGGS: Record<string, EasterEggFn> = {
    "Crossclimb": () => `You solved it faster then ${50 + Math.floor(Math.random() * 9) * 5}% of CEOs`,
    "Pinpoint": () => "While you were solving this someone from HUJI that you don't know sent you a connection request",
    "Queens": () => "You solved it faster than Roy for a change"
};

/**
 * Fallback quotes if a game name is not explicitly mapped.
 */
export const DEFAULT_EASTER_EGGS: EasterEggFn[] = [
    () => `You solved it faster than ${50 + Math.floor(Math.random() * 9) * 5}% of CEOs`,
    () => "While you were solving this someone from HUJI that you don't know sent you a connection request"
];

/**
 * Helper to get the appropriate easter egg for a given game.
 */
export const getEasterEgg = (gameName: string, userTime: number): string => {
    const fn = GAME_SPECIFIC_EGGS[gameName] || DEFAULT_EASTER_EGGS[0];
    return fn({ gameName, userTime });
};
