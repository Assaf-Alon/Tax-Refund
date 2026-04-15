import { useState, useRef, useCallback, useEffect } from 'react';

export type PlayerStatus = 'uninitialized' | 'loading' | 'ready' | 'playing' | 'paused' | 'ended' | 'error';

export const useAudioStream = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [status, setStatus] = useState<PlayerStatus>('uninitialized');
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  
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
    
    audio.onended = () => {
        setStatus('ended');
        if (onEndRef.current) { onEndRef.current(); onEndRef.current = null; }
    };
    audio.onerror = () => {
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

  const getStreamUrl = async (videoId: string): Promise<string | null> => {
    // 1. Check cache
    const cached = urlCache.current.get(videoId);
    if (cached) return cached;
    
    // 2. Check in-flight promises
    const inFlight = fetchPromises.current.get(videoId);
    if (inFlight) return inFlight as Promise<string | null>;

    const fetchPromise = (async () => {
        try {
          console.log(`Fetching stream via proxy for ${videoId}...`);
          const proxyRes = await fetch(`/Tax-Refund/api/stream?id=${videoId}`);
          if (proxyRes.ok) {
            const data = await proxyRes.json();
            if (data.url) {
              urlCache.current.set(videoId, data.url);
              return data.url;
            }
          }
        } catch (e: any) {}

        const instances = [
          'https://pipedapi.kavin.rocks',
          'https://pipedapi.ducks.party',
          'https://pipedapi.adminforge.de',
          'https://piped-api.lavish.works'
        ];
        
        for (const instance of instances) {
          try {
            const res = await fetch(`${instance}/streams/${videoId}`, { 
              mode: 'cors',
              signal: AbortSignal.timeout(3000)
            });
            if (!res.ok) continue;
            const data = await res.json();
            const stream = data.audioStreams?.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];
            if (stream?.url) {
              urlCache.current.set(videoId, stream.url);
              return stream.url;
            }
          } catch (e: any) { continue; }
        }
        return null;
    })();

    fetchPromises.current.set(videoId, fetchPromise);
    const result = await fetchPromise;
    fetchPromises.current.delete(videoId); // Cleanup promise cache
    return result;
  };

  const prefetch = useCallback(async (videoId: string) => {
    if (!videoId || urlCache.current.has(videoId)) return;
    await getStreamUrl(videoId);
  }, []);

  const prepare = useCallback(async (videoId: string) => {
    if (!videoId) return;
    
    // Guard: already have it or currently loading it
    if (videoId === activeIdRef.current && (activeUrlRef.current || isLoadingRef.current === videoId)) {
        return;
    }
    
    console.log(`Preparing audio for ${videoId}...`);
    isLoadingRef.current = videoId;
    activeIdRef.current = videoId;
    activeUrlRef.current = null;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }

    setCurrentVideoId(videoId);
    setStreamUrl(null);
    setStatus('loading');
    
    const url = await getStreamUrl(videoId);
    
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

  const playExcerpt = useCallback((videoId: string, start: number, end: number, onEnd?: () => void) => {
    const audio = audioRef.current;
    if (!audio || !streamUrl || videoId !== currentVideoId) {
      console.error("playExcerpt blocked: audio not ready");
      return;
    }
    
    onEndRef.current = onEnd || null;

    const cleanup = () => {
      audio.removeEventListener('seeked', onOnceSeeked);
      audio.removeEventListener('timeupdate', onTimeUpdate);
    };

    const onTimeUpdate = () => {
      if (audio.currentTime >= end) {
        audio.pause();
        cleanup();
        if (onEndRef.current) { onEndRef.current(); onEndRef.current = null; }
      }
    };

    const onOnceSeeked = () => {
      audio.addEventListener('timeupdate', onTimeUpdate);
    };

    cleanup();
    
    audio.play()
      .then(() => {
        audio.addEventListener('seeked', onOnceSeeked);
        audio.currentTime = start;
      })
      .catch(() => {
        audio.addEventListener('seeked', onOnceSeeked);
        audio.currentTime = start;
        audio.play().catch(() => {});
      });

  }, [currentVideoId, streamUrl]);

  return { status, isReady: !!streamUrl && status !== 'error', isPlaying: status === 'playing', prepare, playExcerpt, stop, prefetch };
};
