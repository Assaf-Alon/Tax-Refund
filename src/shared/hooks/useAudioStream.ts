import { useState, useRef, useCallback, useEffect } from 'react';

// Define YT types for internal use since they might not be in global @types
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
    _audioLogs: any[];
  }
}

export type PlayerStatus = 'uninitialized' | 'loading' | 'ready' | 'playing' | 'paused' | 'ended' | 'error';
export type EngineType = 'native' | 'youtube';

const ensureYTAPI = () => {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();
  
  return new Promise<void>((resolve) => {
    const existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
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
      resolve();
    }
  });
};

const Log = {
  info: (msg: string, ...args: any[]) => {
    if (typeof window !== 'undefined') {
       window._audioLogs = window._audioLogs || [];
       window._audioLogs.push({ t: Date.now(), level: 'info', msg, args });
    }
    console.log(`%c[AudioEngine] ${msg}`, 'color: #3b82f6; font-weight: bold', ...args);
  },
  warn: (msg: string, ...args: any[]) => {
    if (typeof window !== 'undefined') {
       window._audioLogs = window._audioLogs || [];
       window._audioLogs.push({ t: Date.now(), level: 'warn', msg, args });
    }
    console.warn(`%c[AudioEngine] ${msg}`, 'color: #f59e0b; font-weight: bold', ...args);
  },
  error: (msg: string, ...args: any[]) => {
    if (typeof window !== 'undefined') {
       window._audioLogs = window._audioLogs || [];
       window._audioLogs.push({ t: Date.now(), level: 'error', msg, args });
    }
    console.error(`%c[AudioEngine] ${msg}`, 'color: #ef4444; font-weight: bold', ...args);
  },
  success: (msg: string, ...args: any[]) => {
    if (typeof window !== 'undefined') {
       window._audioLogs = window._audioLogs || [];
       window._audioLogs.push({ t: Date.now(), level: 'success', msg, args });
    }
    console.log(`%c[AudioEngine] ${msg}`, 'color: #10b981; font-weight: bold', ...args);
  },
};

export const useAudioStream = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  
  const [status, setStatus] = useState<PlayerStatus>('uninitialized');
  const [engine, setEngine] = useState<EngineType>('native');
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = new Audio();
    audioRef.current = audio;
    const container = document.createElement('div');
    container.id = `yt-player-${Math.random().toString(36).substr(2, 9)}`;
    container.style.position = 'fixed';
    container.style.top = '-1000px';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
    ytContainerRef.current = container;

    audio.oncanplaythrough = () => { 
      if (statusRef.current === 'loading' && engineRef.current === 'native') setStatus('ready'); 
    };
    audio.onplaying = () => { if (engineRef.current === 'native') setStatus('playing'); };
    audio.onpause = () => { if (engineRef.current === 'native') setStatus('paused'); };
    audio.ontimeupdate = () => { if (engineRef.current === 'native') handleTimeUpdate(audio.currentTime); };
    audio.onended = () => { if (engineRef.current === 'native') handleEnded(); };
    audio.onerror = () => {
      if (engineRef.current !== 'native') return;
      const src = audio.src;
      // Filter out intentional resets or initial state or during loading transition
      if (!src || src === window.location.href || src.endsWith('/') || statusRef.current === 'loading' || isLoadingRef.current) return;
      
      const errorMsg = audio.error?.message || `Code ${audio.error?.code}`;
      if (errorMsg.includes("Empty src")) return; // Silence this specific noise
      
      setLastError(`Native Audio Error: ${errorMsg}`);
      setStatus('error');
    };

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      audio.pause();
      audio.src = '';
      if (ytPlayerRef.current) { try { ytPlayerRef.current.destroy(); } catch {} }
      if (ytContainerRef.current) document.body.removeChild(ytContainerRef.current);
    };
  }, []);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
    if (excerptBounds.current) {
      const { start, end } = excerptBounds.current;
      const total = end - start;
      const current = Math.max(0, time - start);
      setProgress(Math.min(100, (current / total) * 100));
      
      // If end is very large (e.g. 999999), don't auto-stop
      if (end < 3600 && time >= end) { 
        stop(); 
        handleEnded(); 
      }
    }
  };

  const handleEnded = () => {
    setStatus('ended');
    if (onEndRef.current) { onEndRef.current(); onEndRef.current = null; }
  };

  const stop = useCallback(() => {
    if (engineRef.current === 'youtube' && ytPlayerRef.current?.pauseVideo) {
      try { ytPlayerRef.current.pauseVideo(); } catch { }
    } else if (audioRef.current) { audioRef.current.pause(); }
    if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
    setStatusSync('paused');
  }, []);

  const getStreamUrl = async (videoId: string, force = false): Promise<string | null> => {
    if (!force) {
      const cached = urlCache.current.get(videoId);
      if (cached) return cached;
      const inFlight = fetchPromises.current.get(videoId);
      if (inFlight) return inFlight;
    }
    const fetchPromise = (async () => {
      const isDev = import.meta.env.DEV;
      if (isDev) {
        try {
          const res = await fetch(`/Tax-Refund/api/stream?id=${videoId}`);
          if (res.ok) { const data = await res.json(); if (data.url) return data.url; }
        } catch {}
      }
      const pipedInstances = ['https://pipedapi.kavin.rocks','https://pipedapi.ducks.party','https://piped-api.lavish.works','https://pipedapi.adminforge.de','https://api-piped.mha.fi'].sort(() => Math.random() - 0.5);
      const isProd = import.meta.env.PROD;
      for (const instance of pipedInstances) {
        try {
          Log.info(`Trying ${instance}`);
          const res = await fetch(`${instance}/streams/${videoId}`, { referrerPolicy: 'no-referrer', mode: isProd ? 'cors' : 'no-cors', signal: AbortSignal.timeout(3000) }).catch(() => null);
          if (res?.ok) {
            const data = await res.json();
            const stream = data.audioStreams?.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];
            if (stream?.url) return stream.url.includes('googlevideo.com') ? stream.url : `${stream.url}${stream.url.includes('?') ? '&' : '?'}local=true`;
          }
        } catch {}
      }
      setLastError("All stream proxies failed. Check internet.");
      return null;
    })();
    fetchPromises.current.set(videoId, fetchPromise);
    const result = await fetchPromise;
    if (result) urlCache.current.set(videoId, result);
    fetchPromises.current.delete(videoId);
    return result;
  };

  const fallbackToNative = async (videoId: string) => {
    Log.warn(`Falling back to native for ${videoId}`);
    const url = await getStreamUrl(videoId);
    if (activeIdRef.current !== videoId) return;
    if (url) {
      setEngine('native');
      if (audioRef.current) { audioRef.current.src = url; audioRef.current.load(); }
    } else {
      setStatus('error');
    }
    isLoadingRef.current = null;
  };

  const prepare = useCallback(async (videoId: string, force = false, retryCount = 0) => {
    if (!videoId) return;
    if (!force && videoId === activeIdRef.current && (statusRef.current === 'ready' || isLoadingRef.current === videoId)) return;
    Log.info(`Preparing ${videoId} (Retry: ${retryCount})`);
    isLoadingRef.current = videoId;
    activeIdRef.current = videoId;
    statusRef.current = 'loading';
    setStatus('loading');
    setLastError(null);
    setCurrentVideoId(videoId);
    setProgress(0);
    setCurrentTime(0);

    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; }
    if (ytPlayerRef.current?.pauseVideo) { try { ytPlayerRef.current.pauseVideo(); } catch { } }
    if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }

    if (import.meta.env.PROD) {
      try {
        await ensureYTAPI();
        if (activeIdRef.current !== videoId) return;
        return new Promise<void>((resolve) => {
          let hasTimedOut = false;
          const timeout = setTimeout(() => {
            hasTimedOut = true;
            Log.warn("YT Timeout, switching engine");
            fallbackToNative(videoId).then(() => {
              if (statusRef.current === 'error' && retryCount < 1) {
                 Log.info("Auto-retrying after backup failure...");
                 prepare(videoId, true, retryCount + 1).then(resolve);
              } else {
                 resolve();
              }
            });
          }, 6000);

          const initPlayer = () => {
            if (hasTimedOut || activeIdRef.current !== videoId) return;
            
            // 1. If player exists and is healthy, just cue the new video
            if (ytPlayerRef.current?.cueVideoById) {
                try {
                    ytPlayerRef.current.cueVideoById(videoId);
                    // Double check we haven't been superseded during the function call
                    if (activeIdRef.current === videoId) {
                      setEngine('youtube'); 
                      setStatus('ready');
                      clearTimeout(timeout); 
                      resolve();
                    }
                    return;
                } catch (e) {
                    Log.warn("cueVideoById failed, recreating player", e);
                }
            }

            // 2. If we're here, we need a new player instance. 
            // CLEANUP: Destroy existing player if it exists on the same element to avoid ghost iframes and phasing
            if (ytPlayerRef.current?.destroy) {
               try { ytPlayerRef.current.destroy(); } catch {}
               ytPlayerRef.current = null;
            }

            ytPlayerRef.current = new window.YT.Player(ytContainerRef.current?.id, {
                height: '0', 
                width: '0', 
                videoId: videoId,
                host: 'https://www.youtube.com',
                playerVars: { 
                    'autoplay': 0, 
                    'controls': 0, 
                    'disablekb': 1, 
                    'fs': 0, 
                    'rel': 0, 
                    'showinfo': 0, 
                    'iv_load_policy': 3, 
                    'origin': window.location.origin,
                    'widget_referrer': window.location.origin
                },
                events: {
                    'onReady': () => { 
                      if (!hasTimedOut && activeIdRef.current === videoId) { 
                        clearTimeout(timeout); 
                        setEngine('youtube'); 
                        setStatus('ready'); 
                        resolve(); 
                      } 
                    },
                    'onStateChange': (event: any) => {
                        if (activeIdRef.current !== videoId) return;
                        const s = event.data;
                        if (s === window.YT.PlayerState.PLAYING) setStatus('playing');
                        if (s === window.YT.PlayerState.PAUSED) setStatus('paused');
                        if (s === window.YT.PlayerState.ENDED) handleEnded();
                    },
                    'onError': (e: any) => { 
                       if (activeIdRef.current !== videoId) return;
                       Log.warn(`YT Error ${e.data}`); 
                       clearTimeout(timeout); 
                       if (retryCount < 1) {
                          Log.info("Auto-retrying after YT error...");
                          prepare(videoId, true, retryCount + 1).then(resolve);
                       } else {
                          fallbackToNative(videoId).then(resolve); 
                       }
                    }
                }
            });
          };
          initPlayer();
        });
      } catch { setLastError("YT API Blocked"); return fallbackToNative(videoId); }
    } else {
      return fallbackToNative(videoId);
    }
  }, []);

  const setStatusSync = (s: PlayerStatus) => {
    statusRef.current = s;
    setStatus(s);
  };

  const playExcerpt = useCallback((videoId: string, start: number, end: number, onEnd?: () => void) => {
    if (statusRef.current === 'error') return;
    onEndRef.current = onEnd || null;
    
    // Default to a very large end time if none provided or it's 0
    const effectiveEnd = (end === 0 || end === undefined) ? 999999 : end;
    excerptBounds.current = { start, end: effectiveEnd };
    
    if (engineRef.current === 'youtube' && ytPlayerRef.current) {
        try {
            setCurrentVideoId(videoId);
            ytPlayerRef.current.seekTo(start, true);
            ytPlayerRef.current.playVideo();
            // REMOVE setStatusSync('playing') - Let onStateChange handle it for gesture-safe feedback
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = window.setInterval(() => {
                if (ytPlayerRef.current?.getCurrentTime) handleTimeUpdate(ytPlayerRef.current.getCurrentTime());
            }, 100);
        } catch { setStatusSync('error'); }
    } else if (audioRef.current) {
        setCurrentVideoId(videoId);
        audioRef.current.currentTime = start;
        audioRef.current.play().catch(() => Log.warn("Native blocked"));
    }
  }, [currentVideoId]);

  const togglePlayback = useCallback(() => {
    const s = statusRef.current;
    if (s === 'ready' || s === 'paused' || s === 'ended') {
      if (engineRef.current === 'youtube' && ytPlayerRef.current?.playVideo) {
        ytPlayerRef.current.playVideo();
      } else if (audioRef.current) {
        audioRef.current.play();
      }
      // REMOVE setStatusSync('playing') - Event driven for accuracy
    } else if (s === 'playing') {
      stop();
    }
  }, [stop]);

  return { status, isReady: status === 'ready' || status === 'playing' || status === 'paused', isPlaying: status === 'playing', progress, currentTime, lastError, prepare, playExcerpt, stop, togglePlayback, prefetch: async (id: string) => { if (!import.meta.env.PROD && id) await getStreamUrl(id); }, reset: () => { stop(); if (audioRef.current) audioRef.current.src = ""; if (ytPlayerRef.current?.stopVideo) ytPlayerRef.current.stopVideo(); setCurrentVideoId(null); setStatusSync('uninitialized'); setEngine('native'); setProgress(0); setCurrentTime(0); activeIdRef.current = null; isLoadingRef.current = null; } };
};
