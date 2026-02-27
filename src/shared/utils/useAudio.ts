import { useEffect, useRef } from 'react';

export interface UseAudioOptions {
    loop?: boolean;
    crossfadeDuration?: number;
}

// Global cache to keep audio elements alive and remember their playback position,
// and to keep them "blessed" for mobile autoplay once interacted with.
const audioCache = new Map<string, HTMLAudioElement>();

export function useAudio(src: string | null, options: UseAudioOptions = {}) {
    const fadingAudioRef = useRef<HTMLAudioElement | null>(null);
    const activeAudioRef = useRef<HTMLAudioElement | null>(null);
    const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const fadeInIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { loop = false, crossfadeDuration = 2000 } = options;

    useEffect(() => {
        return () => {
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
            if (fadeInIntervalRef.current) clearInterval(fadeInIntervalRef.current);

            // Note: we do NOT pause or delete from cache on unmount by default,
            // so we don't lose the position. But we *do* pause the currently active
            // audio if the component unmounts entirely to avoid ghost music.
            if (activeAudioRef.current) {
                activeAudioRef.current.pause();
                activeAudioRef.current = null;
            }
            if (fadingAudioRef.current) {
                fadingAudioRef.current.pause();
                fadingAudioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        // Clear existing intervals
        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        if (fadeInIntervalRef.current) clearInterval(fadeInIntervalRef.current);
        fadeIntervalRef.current = null;
        fadeInIntervalRef.current = null;

        if (fadingAudioRef.current) {
            fadingAudioRef.current.pause();
            fadingAudioRef.current = null;
        }

        // Fade out previously active audio
        if (activeAudioRef.current) {
            const oldAudio = activeAudioRef.current;
            activeAudioRef.current = null;

            // Only fade out if it's not the exact same audio element we're about to play
            const nextAudio = src ? audioCache.get(src) : null;
            if (oldAudio !== nextAudio) {
                if (crossfadeDuration > 0) {
                    fadingAudioRef.current = oldAudio;
                    const steps = Math.ceil(crossfadeDuration / 50);
                    const stepVolume = Math.max(0.001, oldAudio.volume) / steps;

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
            } else {
                // It's the same audio, transfer it back active
                activeAudioRef.current = oldAudio;
            }
        }

        if (!src) return;

        let audio = audioCache.get(src);
        if (!audio) {
            audio = new Audio(src);
            audioCache.set(src, audio);
        }
        audio.loop = loop;

        // If it's continuing to play (from the `oldAudio === nextAudio` check), don't disrupt it
        if (activeAudioRef.current !== audio) {
            activeAudioRef.current = audio;

            if (crossfadeDuration > 0) {
                audio.volume = 0.001;
                const steps = Math.ceil(crossfadeDuration / 50);
                const stepVolume = 1 / steps;

                fadeInIntervalRef.current = setInterval(() => {
                    if (activeAudioRef.current === audio) {
                        const newVol = Math.min(1, audio.volume + stepVolume);
                        audio.volume = Math.max(0, Math.min(1, newVol));
                        if (newVol >= 1) {
                            if (fadeInIntervalRef.current) clearInterval(fadeInIntervalRef.current);
                            fadeInIntervalRef.current = null;
                        }
                    }
                }, 50);
            } else {
                audio.volume = 1;
            }

            let interactionListener: (() => void) | null = null;
            const attemptPlay = async () => {
                try {
                    await audio.play();
                } catch (error) {
                    if (error instanceof Error && error.name === 'NotAllowedError') {
                        interactionListener = () => {
                            if (activeAudioRef.current === audio) {
                                audio.play().then(() => {
                                    if (interactionListener) {
                                        document.removeEventListener('click', interactionListener);
                                        document.removeEventListener('touchend', interactionListener);
                                        interactionListener = null;
                                    }
                                }).catch(e => console.error('Audio playback failed after interaction:', e));
                            } else {
                                // Audio source changed, clean up stranded listener
                                if (interactionListener) {
                                    document.removeEventListener('click', interactionListener);
                                    document.removeEventListener('touchend', interactionListener);
                                    interactionListener = null;
                                }
                            }
                        };

                        document.addEventListener('click', interactionListener);
                        document.addEventListener('touchend', interactionListener);
                    } else {
                        console.error('Audio playback error:', error);
                    }
                }
            };
            attemptPlay();

            return () => {
                if (interactionListener) {
                    document.removeEventListener('click', interactionListener);
                    document.removeEventListener('touchend', interactionListener);
                }
            };
        }
    }, [src, loop, crossfadeDuration]);
}
