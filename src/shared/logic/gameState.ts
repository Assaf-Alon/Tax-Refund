
export interface GameState {
    riddleProgress: Record<string, number>;
    inventory: string[];
}

const STORAGE_KEY = 'tr_gamestate';

const defaultState: GameState = {
    riddleProgress: {},
    inventory: []
};

export const loadState = (): GameState => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultState;
        return JSON.parse(raw);
    } catch (e) {
        console.warn('Failed to load game state', e);
        return defaultState;
    }
};

export const saveState = (state: GameState): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to save game state', e);
    }
};

export const updateRiddleProgress = (riddleId: string, stage: number): GameState => {
    const current = loadState();
    const newState = {
        ...current,
        riddleProgress: {
            ...current.riddleProgress,
            [riddleId]: stage
        }
    };
    saveState(newState);
    return newState;
};

export const getRiddleProgress = (riddleId: string): number => {
    const state = loadState();
    return state.riddleProgress[riddleId] || 0;
};
