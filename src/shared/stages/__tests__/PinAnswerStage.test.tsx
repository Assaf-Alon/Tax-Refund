// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import { PinAnswerStage } from '../PinAnswerStage';

vi.mock('../../ui/PinPad', () => ({
    PinPad: ({ onDigit }: { onDigit: (d: string) => void }) => (
        <div>
            <button onClick={() => onDigit('1')}>1</button>
            <button onClick={() => onDigit('2')}>2</button>
            <button onClick={() => onDigit('3')}>3</button>
        </div>
    ),
}));

describe('PinAnswerStage', () => {
    afterEach(() => {
        cleanup();
    });
    it('renders title and prompt', () => {
        render(
            <PinAnswerStage
                title="Code"
                prompt="Enter PIN"
                correctPin="123"
                onAdvance={vi.fn()}
            />
        );
        expect(screen.getByText('Code')).toBeTruthy();
        expect(screen.getByText('Enter PIN')).toBeTruthy();
    });

    it('calls onAdvance only when correct PIN is fully entered', () => {
        const onAdvance = vi.fn();
        render(
            <PinAnswerStage
                title="Code"
                prompt="Enter PIN"
                correctPin="123"
                onAdvance={onAdvance}
            />
        );

        const btn1 = screen.getByText('1');
        const btn2 = screen.getByText('2');
        const btn3 = screen.getByText('3');

        act(() => { btn1.click(); });
        expect(onAdvance).not.toHaveBeenCalled();

        act(() => { btn2.click(); });
        expect(onAdvance).not.toHaveBeenCalled();

        act(() => { btn3.click(); });
        expect(onAdvance).toHaveBeenCalled();
    });
});
