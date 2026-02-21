// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { FillWordsStage, tokenizeLine } from '../FillWordsStage';

vi.mock('../../ui/CharacterInput', () => ({
    CharacterInput: ({ expectedValue, onComplete }: any) => (
        <div>
            <span data-testid="expected">{expectedValue}</span>
            <button data-testid={`complete-${expectedValue}`} onClick={onComplete}>Complete</button>
        </div>
    )
}));

describe('FillWordsStage', () => {
    afterEach(() => {
        cleanup();
    });
    it('tokenizeLine correctly separates punctuation', () => {
        const tokens = tokenizeLine("Hello, world!");
        expect(tokens).toEqual([
            { word: 'Hello', trailing: ',' },
            { word: 'world', trailing: '!' }
        ]);
    });

    it('renders component and words', () => {
        render(
            <FillWordsStage
                title="Title"
                lines={["Test line"]}
                onAdvance={vi.fn()}
            />
        );

        expect(screen.getByText('Title')).toBeTruthy();
        const inputs = screen.getAllByTestId('expected');
        expect(inputs.length).toBe(2);
        expect(inputs[0].textContent).toBe('Test');
        expect(inputs[1].textContent).toBe('line');
    });

    it('advances when all words completed', () => {
        vi.useFakeTimers();
        const onAdvance = vi.fn();

        render(
            <FillWordsStage
                title="Title"
                lines={["A B"]}
                onAdvance={onAdvance}
            />
        );

        const btnA = screen.getByTestId('complete-A');
        const btnB = screen.getByTestId('complete-B');

        fireEvent.click(btnA);
        expect(onAdvance).not.toHaveBeenCalled();

        fireEvent.click(btnB);

        act(() => {
            vi.runAllTimers();
        });
        expect(onAdvance).toHaveBeenCalled();

        vi.useRealTimers();
    });
});
