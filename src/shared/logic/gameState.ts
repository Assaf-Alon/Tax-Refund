
export interface GameState {
    riddleProgress: Record<string, number>;
    inventory: string[];
    adminSettings: {
        bypassPinOnLocalhost: boolean;
        devToolsEnabled: boolean;
    };
}

const STORAGE_KEY = 'tr_gamestate';

const defaultState: GameState = {
    riddleProgress: {},
    inventory: [],
    adminSettings: {
        bypassPinOnLocalhost: true,
        devToolsEnabled: false
    }
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

/** Reset a single riddle to stage 0 */
export const resetRiddleProgress = (riddleId: string): void => {
    const current = loadState();
    const { [riddleId]: _, ...rest } = current.riddleProgress;
    saveState({ ...current, riddleProgress: rest });
};

/** Reset ALL riddle progress */
export const resetAllProgress = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};

/** Jump a riddle to an arbitrary stage (admin use) */
export const setRiddleProgress = (riddleId: string, stage: number): void => {
    const current = loadState();
    saveState({
        ...current,
        riddleProgress: {
            ...current.riddleProgress,
            [riddleId]: stage,
        },
    });
};

/** Update admin settings */
export const updateAdminSettings = (settings: Partial<GameState['adminSettings']>): GameState => {
    const current = loadState();
    const newState = {
        ...current,
        adminSettings: {
            ...current.adminSettings,
            ...settings
        }
    };
    saveState(newState);
    return newState;
};
