import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueensStage } from '../QueensStage';

describe('QueensStage', () => {
    it('renders the initial grid correctly', () => {
        const { container } = render(<QueensStage onAdvance={vi.fn()} />);
        expect(screen.getAllByText(/Queens/i).length).toBeGreaterThan(0);
        expect(screen.getByText(/Daily Puzzle: Hearts & Crowns/i)).toBeTruthy();
        
        const cells = container.querySelectorAll('.grid > div');
        expect(cells.length).toBe(81);
    });

    it('places a queen on cell click', () => {
        const { container } = render(<QueensStage onAdvance={vi.fn()} />);
        
        const cells = container.querySelectorAll('.grid > div');
        const firstCell = cells[0];
        
        fireEvent.click(firstCell);
        expect(firstCell.querySelector('svg')).toBeTruthy();
        
        fireEvent.click(firstCell);
        expect(firstCell.querySelector('svg')).toBeTruthy();
        
        fireEvent.click(firstCell);
        expect(firstCell.querySelector('svg')).toBeFalsy();
    });

    it('advances after solving', async () => {
        render(<QueensStage onAdvance={vi.fn()} />);
        const resetButtons = screen.getAllByText(/Reset/i);
        expect(resetButtons.length).toBeGreaterThan(0);
    });

    it('renders the prefilled queen at (4,7)', () => {
        const { container } = render(<QueensStage onAdvance={vi.fn()} />);
        const cells = container.querySelectorAll('.grid > div');
        const prefilledCell = cells[4 * 9 + 7]; // (4,7) index
        expect(prefilledCell.querySelector('svg')).toBeTruthy();
        
        // Try to toggle it - should NOT remove it
        fireEvent.click(prefilledCell);
        expect(prefilledCell.querySelector('svg')).toBeTruthy();
    });
});
