import { useState, useRef, useCallback, useEffect } from 'react';

export type PlayerStatus = 'uninitialized' | 'loading' | 'ready' | 'playing' | 'paused' | 'ended' | 'error';

export const useAudioStream = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<PlayerStatus>('uninitialized');
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  
  // Refs for tracking internal state (Stable function identity)
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const excerptBounds = useRef<{ start: number; end: number } | null>(null);
  
  // Refs for tracking internal state (Stable function identity)
  const activeIdRef = useRef<string | null>(null);
  const activeUrlRef = useRef<string | null>(null);
  const isLoadingRef = useRef<string | null>(null);
  const fetchPromises = useRef<Map<string, Promise<string | null>>>(new Map());
  
  const urlCache = useRef<Map<string, string>>(new Map());
  const onEndRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = new Audio();
    audioRef.current = audio;

    audio.oncanplaythrough = () => { 
      // Only log if it's a new load
      if (statusRef.current === 'loading') {
        console.log("Audio: ready to play");
      }
      setStatus('ready'); 
    };
    audio.onplaying = () => setStatus('playing');
    audio.onpause = () => setStatus('paused');
    audio.onstalled = () => console.warn("Audio: stalled (buffering issue)");
    audio.onwaiting = () => console.log("Audio: waiting for data...");
    
    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
      if (excerptBounds.current) {
        const { start, end } = excerptBounds.current;
        const total = end - start;
        const current = Math.max(0, audio.currentTime - start);
        setProgress(Math.min(100, (current / total) * 100));

        if (audio.currentTime >= end) {
          audio.pause();
          setStatus('ended');
          if (onEndRef.current) { 
            onEndRef.current(); 
            onEndRef.current = null; 
          }
        }
      }
    };

    audio.onended = () => {
        setStatus('ended');
        if (onEndRef.current) { onEndRef.current(); onEndRef.current = null; }
    };
    audio.onerror = () => {
      // Ignore errors if we are intentionally flushing or loading
      if (!audio.src || audio.src === window.location.href || statusRef.current === 'loading') {
        return;
      }
      const errorStr = audio.error ? `Code ${audio.error.code}: ${audio.error.message}` : "Unknown error";
      console.error("Audio element error:", errorStr);
      setStatus('error');
    };

    return () => {
      audio.pause();
      audio.src = '';
      audio.load();
    };
  }, []);

  // Track status in a ref to avoid log spam
  const statusRef = useRef<PlayerStatus>('uninitialized');
  useEffect(() => { statusRef.current = status; }, [status]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setStatus('paused');
  }, []);

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;
    // If it's playing OR was about to play (ready/loading), we should pause it
    if (status === 'playing' || status === 'ready' || status === 'loading') {
      audioRef.current.pause();
      setStatus('paused');
    } else {
      audioRef.current.play().catch(e => console.error("Toggle play failed:", e));
    }
  }, [status]);

  const getStreamUrl = async (videoId: string, force = false): Promise<string | null> => {
    // 1. Check cache (unless forcing refresh)
    if (!force) {
      const cached = urlCache.current.get(videoId);
      if (cached) return cached;
    } else {
      urlCache.current.delete(videoId);
    }
    
    // 2. Check in-flight promises (unless forcing)
    if (!force) {
      const inFlight = fetchPromises.current.get(videoId);
      if (inFlight) return inFlight as Promise<string | null>;
    }

    const fetchPromise = (async () => {
        // 3. Try local proxy first in development
        const isDev = import.meta.env.DEV;
        
        if (isDev) {
          try {
            console.log(`Fetching stream via local proxy for ${videoId}...`);
            const proxyRes = await fetch(`/Tax-Refund/api/stream?id=${videoId}`);
            if (proxyRes.ok) {
              const data = await proxyRes.json() as any;
              if (data.url) {
                urlCache.current.set(videoId, data.url);
                return data.url;
              }
            }
          } catch (e: any) {
            console.warn("Local proxy fetch failed, falling back to Piped...");
          }
        }

        const instances = [
          'https://pipedapi.kavin.rocks',
          'https://pipedapi.ducks.party',
          'https://pipedapi.adminforge.de',
          'https://piped-api.lavish.works',
          'https://pipedapi.rivo.cc',
          'https://pipedapi.syncit.dev',
          'https://pipedapi.leptons.xyz',
          'https://api-piped.mha.fi'
        ].sort(() => Math.random() - 0.5); // Randomize to distribute load
        
        for (const instance of instances) {
          try {
            console.log(`Trying Piped instance: ${instance}`);
            const res = await fetch(`${instance}/streams/${videoId}`, { 
              mode: 'cors',
              signal: AbortSignal.timeout(5000) // 5s timeout
            });
            if (!res.ok) continue;
            const data = await res.json() as any;
            const stream = data.audioStreams?.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];
            if (stream?.url) {
              urlCache.current.set(videoId, stream.url);
              return stream.url;
            }
          } catch (e: any) { 
            console.warn(`Piped instance ${instance} failed:`, e.message);
            continue; 
          }
        }
        return null;
    })();

    if (!force) fetchPromises.current.set(videoId, fetchPromise);
    const result = await fetchPromise;
    if (!force) fetchPromises.current.delete(videoId);
    return result;
  };

  const prefetch = useCallback(async (videoId: string) => {
    if (!videoId || urlCache.current.has(videoId)) return;
    await getStreamUrl(videoId);
  }, []);

  const prepare = useCallback(async (videoId: string, force = false) => {
    if (!videoId) return;
    
    // Guard: already have it or currently loading it
    if (!force && videoId === activeIdRef.current && (activeUrlRef.current || isLoadingRef.current === videoId)) {
        return;
    }
    
    console.log(`Preparing audio for ${videoId}...`);
    isLoadingRef.current = videoId;
    activeIdRef.current = videoId;
    activeUrlRef.current = null;

    if (audioRef.current) {
      audioRef.current.pause();
      // "Flush" to prevent fraction-of-second glitches
      audioRef.current.src = ""; 
      audioRef.current.load();
    }

    setCurrentVideoId(videoId);
    setStreamUrl(null);
    setStatus('loading');
    setProgress(0);
    setCurrentTime(0);
    
    // Give browser a tick to flush
    await new Promise(r => setTimeout(r, 50));

    const url = await getStreamUrl(videoId, force);
    
    // If the request changed while we were fetching, bail
    if (activeIdRef.current !== videoId) return;
    
    if (url) {
      console.log("Audio URL acquired, loading into element...");
      isLoadingRef.current = null;
      activeUrlRef.current = url;
      setStreamUrl(url);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
      }
    } else {
      console.error("All providers failed.");
      isLoadingRef.current = null;
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current.load();
    }
    setCurrentVideoId(null);
    setStreamUrl(null);
    setStatus('uninitialized');
    setProgress(0);
    setCurrentTime(0);
    activeIdRef.current = null;
    activeUrlRef.current = null;
    isLoadingRef.current = null;
  }, []);

  const playExcerpt = useCallback((videoId: string, start: number, end: number, onEnd?: () => void) => {
    const audio = audioRef.current;
    if (!audio || !streamUrl || videoId !== currentVideoId) {
      console.error("playExcerpt blocked: audio not ready");
      return;
    }
    
    onEndRef.current = onEnd || null;
    excerptBounds.current = { start, end };

    // Support resuming if within bounds
    const isWithinBounds = audio.currentTime >= start - 0.5 && audio.currentTime < end;
    
    if (isWithinBounds && statusRef.current === 'playing') {
      return; // Already playing
    }

    if (isWithinBounds && (statusRef.current === 'paused' || statusRef.current === 'ready')) {
      audio.play().catch(e => console.error("Resume failed:", e));
      return;
    }

    // Otherwise (re)start from start
    audio.currentTime = start;
    audio.play().catch(e => {
        console.warn("Autoplay block? Retrying on user interaction...", e);
    });

  }, [currentVideoId, streamUrl]);

  const isReady = (!!streamUrl && status !== 'error') || (!!currentVideoId && urlCache.current.has(currentVideoId));

  return { 
    status, 
    isReady, 
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
