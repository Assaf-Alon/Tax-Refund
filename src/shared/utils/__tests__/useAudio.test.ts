import { renderHook } from '@testing-library/react';
import { useAudio } from '../useAudio';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useAudio', () => {
    let playMock: ReturnType<typeof vi.fn>;
    let pauseMock: ReturnType<typeof vi.fn>;
    let originalAudio: typeof window.Audio;

    beforeEach(() => {
        playMock = vi.fn().mockResolvedValue(undefined);
        pauseMock = vi.fn();

        originalAudio = window.Audio;
        window.Audio = vi.fn().mockImplementation(function (this: any, src?: string) {
            this.src = src || '';
            this.play = playMock;
            this.pause = pauseMock;
            this.loop = false;
            this.volume = 1;
        }) as unknown as typeof window.Audio;
    });

    afterEach(() => {
        window.Audio = originalAudio;
        vi.restoreAllMocks();
    });

    it('should instance Audio and play when a src is provided', () => {
        renderHook(() => useAudio('test.mp3'));
        expect(window.Audio).toHaveBeenCalledWith('test.mp3');
        expect(playMock).toHaveBeenCalled();
    });

    it('should not instance Audio when src is null', () => {
        renderHook(() => useAudio(null));
        expect(window.Audio).not.toHaveBeenCalled();
        expect(playMock).not.toHaveBeenCalled();
    });

    it('should pause on unmount', () => {
        const { unmount } = renderHook(() => useAudio('test.mp3'));
        unmount();
        expect(pauseMock).toHaveBeenCalled();
    });

    it('should add interaction listeners on NotAllowedError', async () => {
        playMock.mockRejectedValueOnce(Object.assign(new Error(''), { name: 'NotAllowedError' }));
        const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

        renderHook(() => useAudio('test.mp3'));

        // wait for the promise to reject
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
        expect(addEventListenerSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    });

    it('should crossfade when src changes', () => {
        vi.useFakeTimers();
        const { rerender } = renderHook(({ src }) => useAudio(src, { crossfadeDuration: 2000 }), {
            initialProps: { src: 'test1.mp3' }
        });

        const allInstances = (window.Audio as ReturnType<typeof vi.fn>).mock.instances;
        const track1 = allInstances[0];

        expect(track1.src).toBe('test1.mp3');
        expect(track1.volume).toBe(0); // Starts fade in

        // Fast forward 2 seconds to complete fade in
        vi.advanceTimersByTime(2000);
        expect(track1.volume).toBe(1);

        // Change track
        rerender({ src: 'test2.mp3' });

        const track2 = allInstances[1];
        expect(track2.src).toBe('test2.mp3');
        expect(track2.volume).toBe(0);

        // Advance 1000ms, both should be at 0.5
        vi.advanceTimersByTime(1000);
        expect(track1.volume).toBeCloseTo(0.5, 1);
        expect(track2.volume).toBeCloseTo(0.5, 1);

        // Advance another 1000ms
        vi.advanceTimersByTime(1000);
        expect(track1.volume).toBe(0);
        expect(pauseMock).toHaveBeenCalledTimes(1); // track1 is paused
        expect(track2.volume).toBe(1);

        vi.useRealTimers();
    });

    it('should not crossfade if crossfadeDuration is 0', () => {
        const { rerender } = renderHook(({ src }) => useAudio(src, { crossfadeDuration: 0 }), {
            initialProps: { src: 'test1.mp3' }
        });

        const allInstances = (window.Audio as ReturnType<typeof vi.fn>).mock.instances;
        const track1 = allInstances[0];

        expect(track1.volume).toBe(1);

        rerender({ src: 'test2.mp3' });

        // Immediate pause without interval
        expect(pauseMock).toHaveBeenCalledTimes(1);

        const track2 = allInstances[1];
        expect(track2.volume).toBe(1);
    });
});
