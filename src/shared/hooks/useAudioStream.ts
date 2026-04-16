import { useState, useRef, useCallback, useEffect } from 'react';

// Define YT types for internal use since they might not be in global @types
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export type PlayerStatus = 'uninitialized' | 'loading' | 'ready' | 'playing' | 'paused' | 'ended' | 'error';
export type EngineType = 'native' | 'youtube';

const ensureYTAPI = () => {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();
  
  return new Promise<void>((resolve) => {
    // If someone already started loading it, we can't easily hook into their onYouTubeIframeAPIReady
    // but check if script tag exists
    const existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
    
    // Store original callback if it exists
    const prevCallback = window.onYouTubeIframeAPIReady;
    
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      resolve();
    };

    if (!existing) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } else if (window.YT && window.YT.Player) {
      // Already loaded by someone else
      resolve();
    }
  });
};

export const useAudioStream = () => {
  // --- Refs & State ---
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  
  const [status, setStatus] = useState<PlayerStatus>('uninitialized');
  const [engine, setEngine] = useState<EngineType>('native');
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const excerptBounds = useRef<{ start: number; end: number } | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const isLoadingRef = useRef<string | null>(null);
  const fetchPromises = useRef<Map<string, Promise<string | null>>>(new Map());
  const urlCache = useRef<Map<string, string>>(new Map());
  const onEndRef = useRef<(() => void) | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const statusRef = useRef<PlayerStatus>('uninitialized');
  const engineRef = useRef<EngineType>('native');

  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { engineRef.current = engine; }, [engine]);

  // --- Initialization ---
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Setup Native Audio
    const audio = new Audio();
    audioRef.current = audio;

    // Setup YT Container
    const container = document.createElement('div');
    container.id = `yt-player-${Math.random().toString(36).substr(2, 9)}`;
    container.style.position = 'fixed';
    container.style.top = '-1000px'; // Hidden but active
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
    ytContainerRef.current = container;

    // --- Audio Event Listeners ---
    audio.oncanplaythrough = () => { 
      if (statusRef.current === 'loading' && engineRef.current === 'native') {
        setStatus('ready'); 
      }
    };
    audio.onplaying = () => { if (engineRef.current === 'native') setStatus('playing'); };
    audio.onpause = () => { if (engineRef.current === 'native') setStatus('paused'); };
    audio.ontimeupdate = () => {
      if (engineRef.current !== 'native') return;
      handleTimeUpdate(audio.currentTime);
    };
    audio.onended = () => {
      if (engineRef.current !== 'native') return;
      handleEnded();
    };
    audio.onerror = () => {
      if (engineRef.current !== 'native') return;
      if (!audio.src || audio.src === window.location.href || statusRef.current === 'loading') return;
      console.error("Audio element error:", audio.error);
      setStatus('error');
    };

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      audio.pause();
      audio.src = '';
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch(e) {}
      }
      if (ytContainerRef.current) {
        document.body.removeChild(ytContainerRef.current);
      }
    };
  }, []);

  // --- Shared Logic ---
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
    if (excerptBounds.current) {
      const { start, end } = excerptBounds.current;
      const total = end - start;
      const current = Math.max(0, time - start);
      setProgress(Math.min(100, (current / total) * 100));

      if (time >= end) {
        stop();
        handleEnded();
      }
    }
  };

  const handleEnded = () => {
    setStatus('ended');
    if (onEndRef.current) { 
      onEndRef.current(); 
      onEndRef.current = null; 
    }
  };

  // --- Engine Control ---
  const stop = useCallback(() => {
    if (engineRef.current === 'youtube' && ytPlayerRef.current?.pauseVideo) {
      try { ytPlayerRef.current.pauseVideo(); } catch(e) {}
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
    if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
    }
    setStatus('paused');
  }, []);

  const togglePlayback = useCallback(() => {
    const isPlaying = statusRef.current === 'playing';
    if (isPlaying) {
      stop();
    } else {
       if (engineRef.current === 'youtube' && ytPlayerRef.current?.playVideo) {
         try { ytPlayerRef.current.playVideo(); } catch(e) {}
       } else if (audioRef.current) {
         audioRef.current.play().catch(e => console.error("Native play failed:", e));
       }
    }
  }, [stop]);

  // --- Fetching Logic ---
  const getStreamUrl = async (videoId: string, force = false): Promise<string | null> => {
    if (!force) {
      const cached = urlCache.current.get(videoId);
      if (cached) return cached;
      const inFlight = fetchPromises.current.get(videoId);
      if (inFlight) return inFlight;
    }

    const fetchPromise = (async () => {
      const isDev = import.meta.env.DEV;
      
      // 1. Try local proxy first (Dev only)
      if (isDev) {
        try {
          const res = await fetch(`/Tax-Refund/api/stream?id=${videoId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.url) return data.url;
          }
        } catch (e) {}
      }

      // 2. Swarm Proxy Logic (Improved for Prod)
      const pipedInstances = [
        'https://pipedapi.kavin.rocks',
        'https://pipedapi.ducks.party',
        'https://piped-api.lavish.works',
        'https://pipedapi.adminforge.de',
        'https://api-piped.mha.fi'
      ].sort(() => Math.random() - 0.5);

      for (const instance of pipedInstances) {
        try {
          const targetUrl = `${instance}/streams/${videoId}`;
          const res = await fetch(targetUrl, { 
            referrerPolicy: 'no-referrer',
            signal: AbortSignal.timeout(3000) 
          });
          
          if (res.ok) {
            const data = await res.json();
            const stream = data.audioStreams?.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];
            if (stream?.url) {
              const finalUrl = stream.url.includes('googlevideo.com') ? stream.url : `${stream.url}${stream.url.includes('?') ? '&' : '?'}local=true`;
              return finalUrl;
            }
          }
        } catch (e) {}
      }
      return null;
    })();

    fetchPromises.current.set(videoId, fetchPromise);
    const result = await fetchPromise;
    if (result) urlCache.current.set(videoId, result);
    fetchPromises.current.delete(videoId);
    return result;
  };

  const fallbackToNative = async (videoId: string) => {
    console.log(`[AudioEngine] Switching to native fallback for ${videoId}`);
    const url = await getStreamUrl(videoId);
    if (activeIdRef.current !== videoId) return;

    if (url) {
      setEngine('native');
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
    } else {
      setStatus('error');
    }
    isLoadingRef.current = null;
  };

  // --- Main Engine Operations ---
  const prepare = useCallback(async (videoId: string, force = false) => {
    if (!videoId) return;
    if (!force && videoId === activeIdRef.current && (statusRef.current === 'ready' || isLoadingRef.current === videoId)) return;

    console.log(`[AudioEngine] Preparing ${videoId}...`);
    isLoadingRef.current = videoId;
    activeIdRef.current = videoId;
    setStatus('loading');
    setCurrentVideoId(videoId);
    setProgress(0);
    setCurrentTime(0);

    // Initial stop
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    if (ytPlayerRef.current?.pauseVideo) { try { ytPlayerRef.current.pauseVideo(); } catch(e) {} }
    if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }

    const isProd = import.meta.env.PROD;
    
    // --- Step 1: Try YouTube IFrame (Primary for Prod) ---
    if (isProd) {
      try {
        await ensureYTAPI();
        if (activeIdRef.current !== videoId) return; 

        return new Promise<void>((resolve) => {
          let hasTimedOut = false;
          const timeout = setTimeout(() => {
            hasTimedOut = true;
            console.warn("[AudioEngine] YouTube load timed out, falling back...");
            fallbackToNative(videoId).then(resolve);
          }, 6000);

          const initPlayer = () => {
            if (hasTimedOut) return;
            
            if (ytPlayerRef.current && ytPlayerRef.current.cueVideoById) {
                try {
                    ytPlayerRef.current.cueVideoById(videoId);
                    setEngine('youtube');
                    setStatus('ready');
                    clearTimeout(timeout);
                    resolve();
                    return;
                } catch (e) {
                    console.warn("[AudioEngine] YouTube sync error, re-creating player...");
                }
            }

            ytPlayerRef.current = new window.YT.Player(ytContainerRef.current?.id, {
                height: '0',
                width: '0',
                videoId: videoId,
                playerVars: {
                    'autoplay': 0,
                    'controls': 0,
                    'disablekb': 1,
                    'fs': 0,
                    'rel': 0,
                    'showinfo': 0,
                    'iv_load_policy': 3,
                    'origin': window.location.origin
                },
                events: {
                    'onReady': () => {
                        if (hasTimedOut) return;
                        clearTimeout(timeout);
                        setEngine('youtube');
                        setStatus('ready');
                        resolve();
                    },
                    'onStateChange': (event: any) => {
                        if (event.data === window.YT.PlayerState.PLAYING) setStatus('playing');
                        if (event.data === window.YT.PlayerState.PAUSED) setStatus('paused');
                        if (event.data === window.YT.PlayerState.ENDED) handleEnded();
                    },
                    'onError': (e: any) => {
                        console.warn(`[AudioEngine] YT Error ${e.data}, falling back...`);
                        clearTimeout(timeout);
                        fallbackToNative(videoId).then(resolve);
                    }
                }
            });
          };

          initPlayer();
        });
      } catch (e) {
        console.error("[AudioEngine] YT API block:", e);
        return fallbackToNative(videoId);
      }
    } else {
      return fallbackToNative(videoId);
    }
  }, []);

  const playExcerpt = useCallback((videoId: string, start: number, end: number, onEnd?: () => void) => {
    if (videoId !== currentVideoId || statusRef.current === 'error') {
        console.error("playExcerpt blocked: not prepared or error status");
        return;
    }

    onEndRef.current = onEnd || null;
    excerptBounds.current = { start, end };

    if (engineRef.current === 'youtube' && ytPlayerRef.current) {
        try {
            ytPlayerRef.current.seekTo(start, true);
            ytPlayerRef.current.playVideo();
            
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = window.setInterval(() => {
                if (ytPlayerRef.current?.getCurrentTime) {
                    handleTimeUpdate(ytPlayerRef.current.getCurrentTime());
                }
            }, 100);
        } catch (e) {
            console.error("[AudioEngine] YT Playback command failed:", e);
            setStatus('error');
        }
    } else if (audioRef.current) {
        audioRef.current.currentTime = start;
        audioRef.current.play().catch(e => {
            console.warn("Native playback blocked (awaiting user gesture?)", e);
        });
    }
  }, [currentVideoId]);

  const reset = useCallback(() => {
    stop();
    if (audioRef.current) { audioRef.current.src = ""; }
    if (ytPlayerRef.current?.stopVideo) { try { ytPlayerRef.current.stopVideo(); } catch(e) {} }
    setCurrentVideoId(null);
    setStatus('uninitialized');
    setEngine('native');
    setProgress(0);
    setCurrentTime(0);
    activeIdRef.current = null;
    isLoadingRef.current = null;
  }, [stop]);

  const prefetch = useCallback(async (videoId: string) => {
    if (!videoId || urlCache.current.has(videoId)) return;
    await getStreamUrl(videoId);
  }, []);

  return { 
    status, 
    isReady: status === 'ready' || status === 'playing' || status === 'paused', 
    isPlaying: status === 'playing', 
    progress,
    currentTime,
    prepare, 
    playExcerpt, 
    stop, 
    togglePlayback,
    prefetch,
    reset
  };
};
