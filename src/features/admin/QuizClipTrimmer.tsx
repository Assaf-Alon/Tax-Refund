import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Scissors, RotateCcw, MonitorPlay, ChevronLeft, ChevronRight, List, Download, CheckCircle, Search, Loader2, AlertTriangle, ExternalLink, Trash2, Edit2, X, Upload } from 'lucide-react';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

import type { SongItem } from '../../shared/types/music';



export const QuizClipTrimmer: React.FC = () => {
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [startTime, setStartTime] = useState<string>('0');
  const [endTime, setEndTime] = useState<string>('10');
  const [activeTab, setActiveTab] = useState<'main' | 'alt'>('main');
  const [altStartTime, setAltStartTime] = useState<string>('0');
  const [altEndTime, setAltEndTime] = useState<string>('10');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [player, setPlayer] = useState<any>(null);
  const [year, setYear] = useState<string>('');
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFetchingYear, setIsFetchingYear] = useState(false);
  const [yearMetadata, setYearMetadata] = useState<{ details?: any, confidence?: string, error?: string, message?: string }>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editInfo, setEditInfo] = useState('');

  const previewIntervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setStartTime((song.startTime ?? 0).toString());
      setEndTime((song.endTime ?? 10).toString());
      setAltStartTime((song.altStartTime ?? 0).toString());
      setAltEndTime((song.altEndTime ?? 10).toString());
      setYear(song.year || '');
      localStorage.setItem('trimmer_current_index', currentIndex.toString());
      setActiveTab('main');

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
      startTime: Math.floor(parseFloat(startTime) || 0),
      endTime: Math.ceil(parseFloat(endTime) || 0),
      altStartTime: Math.floor(parseFloat(altStartTime) || 0),
      altEndTime: Math.ceil(parseFloat(altEndTime) || 0),
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
      const currentSong = songs[currentIndex];
      const hasYear = !!currentSong?.year;
      const isNewVideo = videoId !== currentSong?.youtubeId;

      if (!hasYear || isNewVideo) {
        fetchYear(videoId);
      }
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
    setIsFetchingYear(true);
    try {
      const response = await fetch(`/api/metadata?id=${videoId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.year) setYear(data.year);
        setYearMetadata({ details: data.details, confidence: data.confidence });
      } else {
        const errorData = await response.json();
        setYearMetadata({
          error: errorData.error,
          message: errorData.message
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch year:", err);
      setYearMetadata({ error: 'fetch_error', message: err.message });
    } finally {
      setIsFetchingYear(false);
    }
  };

  const useCurrentTime = (type: 'start' | 'end') => {
    if (!player || !isPlayerReady) return;
    const time = player.getCurrentTime().toFixed(2);
    if (activeTab === 'main') {
      if (type === 'start') setStartTime(time);
      else setEndTime(time);
    } else {
      if (type === 'start') setAltStartTime(time);
      else setAltEndTime(time);
    }
  };

  const startPreview = () => {
    if (!player || !isPlayerReady) return;

    const start = parseFloat(activeTab === 'main' ? startTime : altStartTime);
    const end = parseFloat(activeTab === 'main' ? endTime : altEndTime);

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

  const exportData = (e?: React.MouseEvent) => {
    e?.preventDefault();
    saveCurrentProgress();

    // Get fresh data from localStorage
    const currentSongs = JSON.parse(localStorage.getItem('trimmer_songs') || '[]');
    const blob = new Blob([JSON.stringify(currentSongs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", `trimmed_songs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);

    downloadAnchorNode.click();

    // Clean up
    setTimeout(() => {
      downloadAnchorNode.remove();
      // Use a longer timeout for revocation to ensure the browser has finished the download
      window.URL.revokeObjectURL(url);
    }, 60000);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const importedSongs = JSON.parse(content);

        if (!Array.isArray(importedSongs)) {
          throw new Error("Invalid file format: root should be an array.");
        }

        // Basic validation of the first item
        if (importedSongs.length > 0) {
          const first = importedSongs[0];
          if (typeof first.name !== 'string' || typeof first.query !== 'string') {
            throw new Error("Invalid file format: items missing required fields.");
          }
        }

        if (window.confirm(`Importing ${importedSongs.length} songs will overwrite your current progress. Continue?`)) {
          setSongs(importedSongs);
          setCurrentIndex(0);
          localStorage.setItem('trimmer_songs', JSON.stringify(importedSongs));
          localStorage.setItem('trimmer_current_index', '0');
          alert("Import successful!");
        }
      } catch (err: any) {
        alert("Failed to import data: " + err.message);
      }

      // Reset input so the same file can be imported again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const currentSong = songs[currentIndex];

  const handleSearch = () => {
    const query = currentSong.query;
    window.open(`https://music.youtube.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  const openEditModal = () => {
    setEditName(currentSong.name);
    setEditInfo(currentSong.info);
    setIsEditModalOpen(true);
  };

  const updateMetadata = () => {
    setSongs(prevSongs => {
      const updated = [...prevSongs];
      updated[currentIndex] = {
        ...updated[currentIndex],
        name: editName,
        info: editInfo,
        query: editName // Keep search query in sync
      };
      localStorage.setItem('trimmer_songs', JSON.stringify(updated));
      return updated;
    });

    setIsEditModalOpen(false);

    // Re-fetch year only if link changed or year missing
    const videoId = extractVideoId(videoUrl);
    const hasYear = !!currentSong?.year;
    const isNewVideo = videoId !== currentSong?.youtubeId;

    if (videoId && (!hasYear || isNewVideo)) {
      fetchYear(videoId);
    }
  };

  const handleVerifyYear = () => {
    const query = `${currentSong.name} original release year`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  const deleteSong = (indexToDelete: number) => {
    if (!window.confirm(`Are you sure you want to delete "${songs[indexToDelete].name}"?`)) return;

    saveCurrentProgress();

    const newSongs = songs.filter((_, idx) => idx !== indexToDelete);
    let newIndex = currentIndex;

    if (indexToDelete === currentIndex) {
      if (indexToDelete === songs.length - 1 && songs.length > 1) {
        newIndex = currentIndex - 1;
      }
      // Else newIndex remains the same, pointing to the next song (now at current index)
    } else if (indexToDelete < currentIndex) {
      newIndex = currentIndex - 1;
    }

    setSongs(newSongs);
    setCurrentIndex(newIndex);

    // Sync to localStorage
    localStorage.setItem('trimmer_songs', JSON.stringify(newSongs));
    localStorage.setItem('trimmer_current_index', newIndex.toString());
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className={`transition-all duration-300 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col z-30 ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
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
            <div
              key={song.id}
              onClick={() => { saveCurrentProgress(); setCurrentIndex(idx); }}
              className={`group cursor-pointer w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${currentIndex === idx ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'hover:bg-slate-800/50 text-slate-400'
                }`}
            >
              <div className="min-w-[1.5rem] text-xs font-mono opacity-50">{idx + 1}</div>
              <div className="flex-1 truncate">
                <div className="text-sm font-semibold truncate">{song.name}</div>
                <div className="text-[10px] opacity-60 truncate">{song.info}</div>
              </div>
              {song.status === 'completed' && <CheckCircle size={14} className="text-emerald-500 shrink-0" />}

              <button
                onClick={(e) => { e.stopPropagation(); deleteSong(idx); }}
                className="p-2 text-slate-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                title="Delete song"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-800 space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={importData}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-bold transition-all border border-slate-700"
          >
            <Upload size={18} />
            Import from File
          </button>
          <button
            onClick={(e) => exportData(e)}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 py-3 rounded-xl font-bold transition-all"
          >
            <Download size={18} />
            Export Results
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="p-4 border-b border-slate-900 flex justify-between items-center bg-slate-950/80 backdrop-blur-md">
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

        <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
          {currentSong && (
            <div className="w-full max-w-4xl space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{currentSong.info}</span>
                    <h2 className="text-2xl font-black text-white">{currentSong.name}</h2>
                  </div>
                  <button
                    onClick={openEditModal}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-slate-700 transition-all shadow-lg active:scale-95"
                    title="Edit Metadata"
                  >
                    <Edit2 size={20} />
                  </button>
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
                    <div className="relative flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 2023"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="bg-transparent border-none text-indigo-300 font-mono focus:ring-0 outline-none w-20 px-2"
                      />

                      <div className="flex items-center gap-1">
                        {isFetchingYear && <Loader2 size={14} className="animate-spin text-indigo-400" />}

                        {(yearMetadata.error === 'yt-dlp_missing' || yearMetadata.error === 'yt-dlp_error') && !isFetchingYear && (
                          <div className="group relative">
                            <AlertTriangle size={14} className="text-rose-500 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-2xl">
                              <div className="font-bold text-rose-400 mb-1">
                                {yearMetadata.error === 'yt-dlp_missing' ? 'yt-dlp Missing' : 'yt-dlp Error'}
                              </div>
                              <p className="mb-2">
                                {yearMetadata.error === 'yt-dlp_missing'
                                  ? 'Automatic year fetching requires yt-dlp to be installed.'
                                  : 'Failed to extract metadata. Your yt-dlp might be outdated.'}
                              </p>
                              <div className="p-2 bg-black/50 rounded font-mono text-[10px] break-words overflow-hidden">
                                {yearMetadata.error === 'yt-dlp_missing' ? 'sudo apt install yt-dlp' : (yearMetadata.message || 'Unknown error')}
                              </div>
                              {yearMetadata.error === 'yt-dlp_error' && (
                                <div className="mt-2 text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                                  Try: yt-dlp -U
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {yearMetadata.confidence === 'low' && !isFetchingYear && !yearMetadata.error && (
                          <div className="group relative">
                            <AlertTriangle size={14} className="text-amber-500 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                              Low confidence. Multiple years found:
                              <div className="mt-1 font-mono">
                                {yearMetadata.details?.copyright && <div>Copyright: {yearMetadata.details.copyright}</div>}
                                {yearMetadata.details?.platform && <div>Platform: {yearMetadata.details.platform}</div>}
                              </div>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={handleVerifyYear}
                          className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-500 hover:text-indigo-400"
                          title="Verify on Google"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>
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
                  <div className="flex items-baseline justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-300 uppercase tracking-tight">
                      <Scissors size={18} />
                      Markers
                    </h2>
                  </div>

                  <div className="flex gap-2 p-1 bg-slate-950 rounded-xl">
                    {['main', 'alt'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                          }`}
                      >
                        {tab} Marker
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Start</label>
                        <input
                          type="number" step="0.1"
                          value={activeTab === 'main' ? startTime : altStartTime}
                          onChange={(e) => activeTab === 'main' ? setStartTime(e.target.value) : setAltStartTime(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-center font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <button onClick={() => useCurrentTime('start')} className="mt-5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-sm font-bold">SET</button>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">End</label>
                        <input
                          type="number" step="0.1"
                          value={activeTab === 'main' ? endTime : altEndTime}
                          onChange={(e) => activeTab === 'main' ? setEndTime(e.target.value) : setAltEndTime(e.target.value)}
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
                    className={`w-full py-6 rounded-2xl font-black text-xl shadow-2xl transform transition-all flex items-center justify-center gap-3 ${!isPlayerReady ? 'bg-slate-800 text-slate-600' :
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
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${isLooping ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-600'
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
          <div className="h-8 shrink-0"></div> {/* Bottom spacing for main content */}
        </main>

        {/* Footer Navigation */}
        <footer className="bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 p-4 shrink-0">
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-4">
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
                onClick={(e) => exportData(e)}
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

      {/* Metadata Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Edit Metadata</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Song Name (Artist - Title)</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Anime / Section</label>
                <input
                  type="text"
                  value={editInfo}
                  onChange={(e) => setEditInfo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-white transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 transition-all text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={updateMetadata}
                className="flex-1 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 transition-all text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
