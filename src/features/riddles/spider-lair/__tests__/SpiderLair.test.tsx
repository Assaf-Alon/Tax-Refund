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

vi.mock('../stages/TextAnswerStage', () => ({
    TextAnswerStage: ({ title, onAdvance }: { title: string; onAdvance: () => void }) => (
        <div>
            <h2>{title}</h2>
            <button onClick={onAdvance}>Mock Text Answer</button>
        </div>
    ),
}));

vi.mock('../assets/slab.png', () => ({ default: 'slab.png' }));
vi.mock('../assets/mite.png', () => ({ default: 'mite.png' }));

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

    it('renders TextAnswerStage for stage 4 (A Question of Acts)', () => {
        vi.mocked(gameState.getRiddleProgress).mockReturnValue(4);

        renderWithRouter(<SpiderLair />);

        expect(screen.getByText('A Question of Acts')).toBeTruthy();
    });

    it('renders TextAnswerStage for stage 5 (A Dark Act)', () => {
        vi.mocked(gameState.getRiddleProgress).mockReturnValue(5);

        renderWithRouter(<SpiderLair />);

        expect(screen.getByText('A Dark Act')).toBeTruthy();
    });

    it('renders TextAnswerStage for stage 6 (Allies in Battle)', () => {
        vi.mocked(gameState.getRiddleProgress).mockReturnValue(6);

        renderWithRouter(<SpiderLair />);

        expect(screen.getByText('Allies in Battle')).toBeTruthy();
    });

    it('renders CreatureStage at stage 7', () => {
        vi.mocked(gameState.getRiddleProgress).mockReturnValue(7);

        renderWithRouter(<SpiderLair />);

        expect(screen.getByText('What Creature Is This?')).toBeTruthy();
    });

    it('renders TextAnswerStage for stage 8 (Name This Place)', () => {
        vi.mocked(gameState.getRiddleProgress).mockReturnValue(8);

        renderWithRouter(<SpiderLair />);

        expect(screen.getByText('Name This Place')).toBeTruthy();
    });

    it('renders TextAnswerStage for stage 10 (A Command to Remember)', () => {
        vi.mocked(gameState.getRiddleProgress).mockReturnValue(10);

        renderWithRouter(<SpiderLair />);

        expect(screen.getByText('A Command to Remember')).toBeTruthy();
    });

    it('renders CongratsPage when progress is at stage 11', () => {
        vi.mocked(gameState.getRiddleProgress).mockReturnValue(11);

        renderWithRouter(<SpiderLair />);

        expect(screen.getByText('CONGRATULATIONS')).toBeTruthy();
    });

    it('renders CongratsPage for any stage beyond 11', () => {
        vi.mocked(gameState.getRiddleProgress).mockReturnValue(99);

        renderWithRouter(<SpiderLair />);

        expect(screen.getByText('CONGRATULATIONS')).toBeTruthy();
    });
});
