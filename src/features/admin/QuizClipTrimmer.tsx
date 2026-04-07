import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Scissors, RotateCcw, MonitorPlay, ChevronLeft, ChevronRight, List, Download, CheckCircle, Search } from 'lucide-react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

interface SongItem {
  id: number;
  query: string;
  info: string;
  name: string;
  youtubeId: string;
  startTime: string;
  endTime: string;
  year?: string;
  status: 'pending' | 'completed';
}

export const QuizClipTrimmer: React.FC = () => {
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [startTime, setStartTime] = useState<string>('0');
  const [endTime, setEndTime] = useState<string>('10');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [player, setPlayer] = useState<any>(null);
  const [year, setYear] = useState<string>('');
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const previewIntervalRef = useRef<number | null>(null);

  // Load initial data
  useEffect(() => {
    const saved = localStorage.getItem('trimmer_songs');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSongs(parsed);
      const lastIdx = localStorage.getItem('trimmer_current_index');
      if (lastIdx) setCurrentIndex(parseInt(lastIdx));
    } else {
      fetch('/Tax-Refund/data/anime_songs.json')
        .then(res => res.json())
        .then(data => {
          setSongs(data);
          localStorage.setItem('trimmer_songs', JSON.stringify(data));
        })
        .catch(err => console.error("Failed to load songs:", err));
    }

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log("YouTube API Ready");
      };
    }

    return () => {
      if (previewIntervalRef.current) clearInterval(previewIntervalRef.current);
    };
  }, []);

  // Update current song state when index changes
  useEffect(() => {
    if (songs.length > 0 && currentIndex < songs.length) {
      const song = songs[currentIndex];
      setVideoUrl(song.youtubeId);
      setStartTime(song.startTime || '0');
      setEndTime(song.endTime || '10');
      setYear(song.year || '');
      localStorage.setItem('trimmer_current_index', currentIndex.toString());
      
      // Auto-load if we have a youtubeId
      if (song.youtubeId) {
        setTimeout(() => loadVideo(song.youtubeId), 500);
      }
    }
  }, [currentIndex, songs.length]);

  const saveCurrentProgress = () => {
    const updatedSongs = [...songs];
    updatedSongs[currentIndex] = {
      ...updatedSongs[currentIndex],
      youtubeId: extractVideoId(videoUrl) || videoUrl,
      startTime,
      endTime,
      year,
      status: 'completed'
    };
    setSongs(updatedSongs);
    localStorage.setItem('trimmer_songs', JSON.stringify(updatedSongs));
  };

  const extractVideoId = (url: string) => {
    if (!url) return null;
    // Handle music.youtube.com, youtube.com, youtu.be, etc.
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|music\.youtube\.com\/watch\?v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && (match[2].length === 11)) ? match[2] : (url.length === 11 ? url : null);
  };

  const loadVideo = (idOverride?: string) => {
    const targetUrl = idOverride || videoUrl;
    const videoId = extractVideoId(targetUrl);
    if (!videoId) {
      if (!idOverride) alert("Please enter a valid YouTube URL.");
      return;
    }

    if (player) {
      player.destroy();
    }

    if (videoId) {
      fetchYear(videoId);
    }

    setIsPlayerReady(false);

    const newPlayer = new window.YT.Player('player', {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        'enablejsapi': 1,
        'autoplay': 0,
        'rel': 0,
        'origin': window.location.origin === 'null' ? '*' : window.location.origin
      },
      events: {
        'onReady': (event: any) => {
          setIsPlayerReady(true);
          setPlayer(event.target);
        },
        'onStateChange': (event: any) => {
          if (event.data === window.YT.PlayerState.PAUSED && isPreviewing) {
            setTimeout(() => {
              if (newPlayer.getPlayerState() === window.YT.PlayerState.PAUSED) {
                stopPreview();
              }
            }, 200);
          }
        },
        'onError': (e: any) => {
          console.error("YT Player Error:", e.data);
        }
      }
    });
  };

  const fetchYear = async (videoId: string) => {
    try {
      const response = await fetch(`/api/metadata?id=${videoId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.year) setYear(data.year);
      }
    } catch (err) {
      console.error("Failed to fetch year:", err);
    }
  };

  const useCurrentTime = (type: 'start' | 'end') => {
    if (!player || !isPlayerReady) return;
    const time = player.getCurrentTime().toFixed(2);
    if (type === 'start') setStartTime(time);
    else setEndTime(time);
  };

  const startPreview = () => {
    if (!player || !isPlayerReady) return;

    const start = parseFloat(startTime);
    const end = parseFloat(endTime);

    if (isNaN(start) || isNaN(end) || end <= start) {
      alert("Check your start/end times.");
      return;
    }

    setIsPreviewing(true);
    player.seekTo(start, true);
    player.playVideo();

    if (previewIntervalRef.current) clearInterval(previewIntervalRef.current);
    previewIntervalRef.current = window.setInterval(() => {
      const currentTime = player.getCurrentTime();
      if (currentTime >= end) {
        if (isLooping) {
          player.seekTo(start, true);
        } else {
          stopPreview();
        }
      }
    }, 100);
  };

  const stopPreview = () => {
    setIsPreviewing(false);
    if (previewIntervalRef.current) {
      clearInterval(previewIntervalRef.current);
      previewIntervalRef.current = null;
    }
    if (player && isPlayerReady) player.pauseVideo();
  };

  const togglePreview = () => {
    if (isPreviewing) stopPreview();
    else startPreview();
  };

  const goToNext = () => {
    saveCurrentProgress();
    if (currentIndex < songs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    saveCurrentProgress();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const exportData = () => {
    saveCurrentProgress();
    // Use a timeout to ensure state is updated before export
    setTimeout(() => {
        const currentSongs = JSON.parse(localStorage.getItem('trimmer_songs') || '[]');
        const blob = new Blob([JSON.stringify(currentSongs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", url);
        downloadAnchorNode.setAttribute("download", "trimmed_songs.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        URL.revokeObjectURL(url);
    }, 0);
  };

  const currentSong = songs[currentIndex];

  const handleSearch = () => {
      const query = currentSong.query;
      window.open(`https://music.youtube.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className={`transition-all duration-300 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <List size={20} className="text-indigo-400" />
            Playlist
          </h2>
          <span className="text-xs bg-slate-800 px-2 py-1 rounded-full text-slate-400">
            {songs.filter(s => s.status === 'completed').length}/{songs.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {songs.map((song, idx) => (
            <button
              key={song.id}
              onClick={() => { saveCurrentProgress(); setCurrentIndex(idx); }}
              className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                currentIndex === idx ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'hover:bg-slate-800/50 text-slate-400'
              }`}
            >
              <div className="min-w-[1.5rem] text-xs font-mono opacity-50">{idx + 1}</div>
              <div className="flex-1 truncate">
                <div className="text-sm font-semibold truncate">{song.name}</div>
                <div className="text-[10px] opacity-60 truncate">{song.info}</div>
              </div>
              {song.status === 'completed' && <CheckCircle size={14} className="text-emerald-500" />}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={exportData}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold transition-all"
          >
            <Download size={18} />
            Export Results
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="p-4 border-b border-slate-900 flex justify-between items-center sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <List size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Bulk Clip Trimmer
            </h1>
          </div>
          <div className="w-10"></div> {/* Spacer */}
        </header>

        <main className="p-4 md:p-8 flex flex-col items-center space-y-8 pb-32">
          {currentSong && (
            <div className="w-full max-w-4xl space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
                <div className="space-y-1">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{currentSong.info}</span>
                    <h2 className="text-2xl font-black text-white">{currentSong.name}</h2>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Paste YouTube URL or ID"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-5 py-3 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                      />
                      <button 
                        onClick={handleSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors"
                        title="Search on YouTube"
                      >
                        <Search size={20} />
                      </button>
                  </div>
                  <button
                    onClick={() => loadVideo()}
                    className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20"
                  >
                    Load
                  </button>
                </div>

                <div className="flex items-center gap-4 bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50">
                  <div className="flex-1 flex items-center gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-2">Release Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2023"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="bg-transparent border-none text-indigo-300 font-mono focus:ring-0 outline-none w-20"
                    />
                  </div>
                </div>
              </div>

              <div className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                <div id="player" className="w-full h-full"></div>
                {!isPlayerReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-950/80 backdrop-blur-sm p-4 text-center">
                    <MonitorPlay size={48} className="mb-4 opacity-20" />
                    <p className="text-sm font-medium">Load a video to start trimming</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl space-y-6">
                  <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-300 uppercase tracking-tight">
                    <Scissors size={18} />
                    Markers
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Start</label>
                        <input
                          type="number" step="0.1" value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-center font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <button onClick={() => useCurrentTime('start')} className="mt-5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-sm font-bold">SET</button>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">End</label>
                        <input
                          type="number" step="0.1" value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-center font-mono focus:ring-1 focus:ring-rose-500 outline-none"
                        />
                      </div>
                      <button onClick={() => useCurrentTime('end')} className="mt-5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 px-4 py-2 rounded-xl text-sm font-bold">SET</button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl flex flex-col justify-between space-y-4">
                  <button
                    onClick={togglePreview}
                    disabled={!isPlayerReady}
                    className={`w-full py-6 rounded-2xl font-black text-xl shadow-2xl transform transition-all flex items-center justify-center gap-3 ${
                      !isPlayerReady ? 'bg-slate-800 text-slate-600' :
                      isPreviewing ? 'bg-slate-700 text-white ring-2 ring-slate-500' : 
                      'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                  >
                    {isPreviewing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
                    PREVIEW
                  </button>

                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => setIsLooping(!isLooping)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${
                        isLooping ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-600'
                      }`}
                    >
                      <RotateCcw size={12} className={isLooping ? 'animate-spin-slow' : ''} />
                      Looping
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer Navigation */}
        <footer className="fixed bottom-0 right-0 left-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 p-4 z-20">
            <div className={`max-w-4xl mx-auto flex items-center justify-between gap-4 transition-all duration-300 ${isSidebarOpen ? 'ml-80' : ''}`}>
                <button 
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft /> Previous
                </button>
                
                <div className="flex items-center gap-4">
                    <div className="text-sm font-mono text-slate-500 bg-slate-950 px-4 py-1 rounded-full border border-slate-800">
                        {currentIndex + 1} / {songs.length}
                    </div>

                    <button 
                      onClick={exportData}
                      className="p-3 rounded-2xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 transition-all active:scale-95"
                      title="Export Progress"
                    >
                      <Download size={20} />
                    </button>
                </div>

                <button 
                  onClick={goToNext}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-500 transition-all text-white group"
                >
                  Next & Save <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </footer>
      </div>
    </div>
  );
};
