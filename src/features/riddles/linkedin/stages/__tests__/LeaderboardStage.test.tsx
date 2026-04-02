import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { LeaderboardStage } from '../LeaderboardStage';
import '@testing-library/jest-dom/vitest';

describe('LeaderboardStage', () => {
    afterEach(() => {
        cleanup();
    });

    const defaultProps = {
        gameName: 'Test Game',
        userTime: 45.5,
        onNext: vi.fn(),
    };

    it('renders "Play Next" button by default', () => {
        render(<LeaderboardStage {...defaultProps} />);
        expect(screen.getByRole('button', { name: /Play Next/i })).toBeInTheDocument();
    });

    it('renders "Complete Challenge" button when isLastGame is true', () => {
        render(<LeaderboardStage {...defaultProps} isLastGame={true} />);
        expect(screen.getByRole('button', { name: /Complete Challenge/i })).toBeInTheDocument();
    });

    it('calls onNext when the button is clicked', () => {
        const onNext = vi.fn();
        render(<LeaderboardStage {...defaultProps} onNext={onNext} />);
        
        const button = screen.getByRole('button', { name: /Play Next/i });
        fireEvent.click(button);
        
        expect(onNext).toHaveBeenCalledTimes(1);
    });

    it('renders the game name performance label', () => {
        render(<LeaderboardStage {...defaultProps} />);
        // match the specific paragraph that contains the game name
        const label = screen.getByText((content, element) => {
            return element?.tagName.toLowerCase() === 'p' && content.includes('Test Game');
        });
        expect(label).toBeInTheDocument();
        expect(label).toHaveTextContent(/Performance/i);
    });
});
