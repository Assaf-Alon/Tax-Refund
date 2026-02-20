// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock the gameState module
vi.mock('../../../../shared/logic/gameState', () => ({
    getRiddleProgress: vi.fn(),
    updateRiddleProgress: vi.fn(),
}));

// Mock child components that import static assets.
// The path must match what SpiderLair.tsx uses to import them.
vi.mock('../CongratsPage', () => ({
    CongratsPage: () => <div>CONGRATULATIONS</div>,
}));

vi.mock('../stages/CreatureStage', () => ({
    CreatureStage: ({ onAdvance }: { onAdvance: () => void }) => (
        <div>
            <h2>What Creature Is This?</h2>
            <button onClick={onAdvance}>Mock Advance</button>
        </div>
    ),
}));

vi.mock('../stages/PasscodeStage', () => ({
    PasscodeStage: ({ onAdvance }: { onAdvance: () => void }) => (
        <div>
            <h2>The Web Lock</h2>
            <button onClick={onAdvance}>Mock Unlock</button>
        </div>
    ),
}));

vi.mock('../stages/LyricsStage', () => ({
    LyricsStage: ({ onAdvance }: { onAdvance: () => void }) => (
        <div>
            <h2>Fill In the Blanks</h2>
            <button onClick={onAdvance}>Mock Lyrics</button>
        </div>
    ),
}));

vi.mock('../stages/SkarrsingerStage', () => ({
    SkarrsingerStage: ({ onAdvance }: { onAdvance: () => void }) => (
        <div>
            <h2>The Spider's Riddle</h2>
            <button onClick={onAdvance}>Mock Riddle</button>
        </div>
    ),
}));

vi.mock('../stages/EntranceStage', () => ({
    EntranceStage: ({ onAdvance }: { onAdvance: () => void }) => (
        <div>
            <h1>The Spider's Lair</h1>
            <button onClick={onAdvance}>Enter the Webs</button>
        </div>
    ),
}));

import { SpiderLair } from '../SpiderLair';
import * as gameState from '../../../../shared/logic/gameState';

const renderWithRouter = (ui: React.ReactElement) =>
    render(<MemoryRouter>{ui}</MemoryRouter>);

describe('SpiderLair', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders EntranceStage (Stage 0) by default', () => {
        vi.mocked(gameState.getRiddleProgress).mockReturnValue(0);

        renderWithRouter(<SpiderLair />);

        expect(screen.getByText("The Spider's Lair")).toBeTruthy();
        expect(screen.getByText('Enter the Webs')).toBeTruthy();
    });

    it('calls updateRiddleProgress when advancing a stage', () => {
        vi.mocked(gameState.getRiddleProgress).mockReturnValue(0);
        vi.mocked(gameState.updateRiddleProgress).mockReturnValue({
            riddleProgress: { 'spider-lair': 1 },
            inventory: [],
            adminSettings: { bypassPinOnLocalhost: true },
        });

        renderWithRouter(<SpiderLair />);

        const button = screen.getByText('Enter the Webs');
        button.click();

        expect(gameState.updateRiddleProgress).toHaveBeenCalledWith('spider-lair', 1);
    });

    it('renders PasscodeStage when progress is at stage 1', () => {
        vi.mocked(gameState.getRiddleProgress).mockReturnValue(1);

        renderWithRouter(<SpiderLair />);

        expect(screen.getByText('The Web Lock')).toBeTruthy();
    });

    it('renders CongratsPage when progress is at stage 5', () => {
        vi.mocked(gameState.getRiddleProgress).mockReturnValue(5);

        renderWithRouter(<SpiderLair />);

        expect(screen.getByText('CONGRATULATIONS')).toBeTruthy();
    });
});
