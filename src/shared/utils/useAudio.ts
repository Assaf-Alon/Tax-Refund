import { useEffect, useRef } from 'react';

export interface UseAudioOptions {
    loop?: boolean;
    crossfadeDuration?: number;
}

export function useAudio(src: string | null, options: UseAudioOptions = {}) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fadingAudioRef = useRef<HTMLAudioElement | null>(null);
    const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const fadeInIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { loop = false, crossfadeDuration = 2000 } = options;

    // Handle unmount cleanup
    useEffect(() => {
        return () => {
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            if (fadeInIntervalRef.current) clearInterval(fadeInIntervalRef.current);

            if (fadingAudioRef.current) {
                fadingAudioRef.current.pause();
                fadingAudioRef.current = null;
            }
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        if (fadeInIntervalRef.current) clearInterval(fadeInIntervalRef.current);
        fadeIntervalRef.current = null;
        fadeInIntervalRef.current = null;

        if (fadingAudioRef.current) {
            fadingAudioRef.current.pause();
            fadingAudioRef.current = null;
        }

        if (audioRef.current) {
            const oldAudio = audioRef.current;
            audioRef.current = null;

            if (crossfadeDuration > 0) {
                fadingAudioRef.current = oldAudio;
                const steps = Math.ceil(crossfadeDuration / 50);
                const stepVolume = oldAudio.volume / steps;

                fadeIntervalRef.current = setInterval(() => {
                    if (fadingAudioRef.current) {
                        const newVol = Math.max(0, fadingAudioRef.current.volume - stepVolume);
                        fadingAudioRef.current.volume = Math.max(0, Math.min(1, newVol));
                        if (newVol <= 0) {
                            fadingAudioRef.current.pause();
                            fadingAudioRef.current = null;
                            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
                            fadeIntervalRef.current = null;
                        }
                    }
                }, 50);
            } else {
                oldAudio.pause();
            }
        }

        if (!src) return;

        const audio = new Audio(src);
        audio.loop = loop;
        audioRef.current = audio;

        if (crossfadeDuration > 0) {
            audio.volume = 0;
            const steps = Math.ceil(crossfadeDuration / 50);
            const stepVolume = 1 / steps;

            fadeInIntervalRef.current = setInterval(() => {
                if (audioRef.current === audio) {
                    const newVol = Math.min(1, audio.volume + stepVolume);
                    audio.volume = Math.max(0, Math.min(1, newVol));
                    if (newVol >= 1) {
                        if (fadeInIntervalRef.current) clearInterval(fadeInIntervalRef.current);
                        fadeInIntervalRef.current = null;
                    }
                }
            }, 50);
        }

        let interactionListener: (() => void) | null = null;

        const attemptPlay = async () => {
            try {
                await audio.play();
            } catch (error) {
                if (error instanceof Error && error.name === 'NotAllowedError') {
                    // Autoplay was prevented. Wait for user interaction.
                    interactionListener = () => {
                        if (audioRef.current === audio) {
                            audio.play().catch((e) => console.error('Audio playback failed after interaction:', e));
                        }
                        removeListeners();
                    };
                    document.addEventListener('click', interactionListener);
                    document.addEventListener('pointerdown', interactionListener);
                    document.addEventListener('keydown', interactionListener);
                } else {
                    console.error('Audio playback error:', error);
                }
            }
        };

        const removeListeners = () => {
            if (interactionListener) {
                document.removeEventListener('click', interactionListener);
                document.removeEventListener('pointerdown', interactionListener);
                document.removeEventListener('keydown', interactionListener);
                interactionListener = null;
            }
        };

        attemptPlay();

        return () => {
            removeListeners();
        };
    }, [src, loop, crossfadeDuration]);
}
