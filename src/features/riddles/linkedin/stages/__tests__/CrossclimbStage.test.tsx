// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { CrossclimbStage } from '../CrossclimbStage';

// Mock CharacterInput to provide a button we can click to 'solve' a word
vi.mock('../../../../../shared/ui/CharacterInput', () => ({
    CharacterInput: ({ onComplete, expectedValue }: { onComplete: () => void, expectedValue: string }) => (
        <button onClick={onComplete}>Solve {expectedValue}</button>
    ),
}));

describe('CrossclimbStage', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('requires typing (solving) words before they are revealed', () => {
        render(<CrossclimbStage onAdvance={vi.fn()} />);
        // Words should NOT be revealed initially (they are in CharacterInput)
        expect(screen.queryByText('STACK')).toBeNull();
        expect(screen.getByText('Solve stack')).toBeTruthy();
    });

    it('locks end caps until middle rows are solved', () => {
        render(<CrossclimbStage onAdvance={vi.fn()} />);
        
        // Both end caps are locked initially
        expect(screen.getAllByLabelText('locked')).toHaveLength(2);
        
        // Solve middle rows (in their deterministic order)
        fireEvent.click(screen.getByText('Solve black'));
        fireEvent.click(screen.getByText('Solve snack'));
        fireEvent.click(screen.getByText('Solve stack'));
        fireEvent.click(screen.getByText('Solve slack'));
        
        // Now it enters REORDER phase, so lock icons disappear
        expect(screen.queryByLabelText('locked')).toBeNull();
    });

    it('shows terminal inputs in REORDER phase even if unordered', () => {
        render(<CrossclimbStage onAdvance={vi.fn()} />);
        
        // Solve middle rows
        fireEvent.click(screen.getByText('Solve black'));
        fireEvent.click(screen.getByText('Solve snack'));
        fireEvent.click(screen.getByText('Solve stack'));
        fireEvent.click(screen.getByText('Solve slack'));

        // It should be in REORDER phase
        expect(screen.queryByLabelText('locked')).toBeNull();
        expect(screen.queryByText('Solve block')).toBeTruthy();
        expect(screen.queryByText('Solve stark')).toBeTruthy();
    });
});
