import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, ChevronDown, ChevronUp, AlertCircle, AlertTriangle, Info, CheckCircle2, SlidersHorizontal, Copy, Check } from 'lucide-react';
import { logger, type LogEntry, type LogLevel } from '../../utils/logger';
import { SHOW_DEBUG_TERMINAL } from '../../config/featureFlags';

export const MiniDebugTerminal: React.FC = () => {
  if (!SHOW_DEBUG_TERMINAL) return null;

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpandedFull, setIsExpandedFull] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Initial logs load
    setLogs(logger.getLogs());

    const unsubscribe = logger.subscribe((entry) => {
      if (entry.message === '__CLEAR__') {
        setLogs([]);
      } else {
        setLogs((prev) => [...prev.slice(-199), entry]);
      }
    });

    return unsubscribe;
  }, []);

  const handleCopyLogs = () => {
    const textToCopy = filteredLogs.map((log) => {
      let line = `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`;
      if (log.details !== undefined) {
        const detailsStr = typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : String(log.details);
        line += `\n${detailsStr}`;
      }
      return line;
    }).join('\n\n');

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error('Failed to copy logs:', err);
    });
  };

  useEffect(() => {
    if (autoScroll && scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll, isOpen]);

  const filteredLogs = filterLevel === 'all'
    ? logs
    : logs.filter(l => l.level === filterLevel);

  const errorCount = logs.filter(l => l.level === 'error').length;
  const warnCount = logs.filter(l => l.level === 'warn').length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[99999] pointer-events-none font-mono text-xs">
      {/* Floating Toggle Button when closed */}
      {!isOpen && (
        <div className="p-3 flex justify-end pointer-events-auto">
          <button
            onClick={() => setIsOpen(true)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-xl shadow-2xl backdrop-blur-md border transition-all duration-200
              ${errorCount > 0 
                ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse' 
                : warnCount > 0 
                  ? 'bg-amber-950/90 border-amber-500 text-amber-300' 
                  : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:bg-slate-800'
              }
            `}
          >
            <Terminal size={14} />
            <span className="font-bold">Debug Terminal</span>
            {errorCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                {errorCount} ERR
              </span>
            )}
            {warnCount > 0 && errorCount === 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-600 text-black text-[10px] font-black">
                {warnCount} WARN
              </span>
            )}
          </button>
        </div>
      )}

      {/* Expanded Terminal Overlay */}
      {isOpen && (
        <div 
          className={`
            pointer-events-auto bg-slate-950/95 border-t border-slate-800 shadow-2xl flex flex-col transition-all duration-300 backdrop-blur-xl
            ${isExpandedFull ? 'h-[75vh]' : 'h-64'}
          `}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 shrink-0 select-none">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-emerald-400" />
              <span className="font-bold text-slate-200 uppercase tracking-widest text-[11px]">Mini Debug Console</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {filteredLogs.length} logs
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Level Filter Dropdown */}
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded px-2 py-1">
                <SlidersHorizontal size={10} className="text-slate-400" />
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value as any)}
                  className="bg-transparent text-[10px] text-slate-300 outline-none cursor-pointer"
                >
                  <option value="all">All Logs</option>
                  <option value="error">Errors ({errorCount})</option>
                  <option value="warn">Warnings ({warnCount})</option>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                </select>
              </div>

              {/* Copy Logs button */}
              <button
                onClick={handleCopyLogs}
                title="Copy Logs to Clipboard"
                className={`p-1.5 flex items-center gap-1 text-[11px] rounded transition-colors ${
                  copied 
                    ? 'text-emerald-400 bg-emerald-950/60 font-bold' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span className="text-[10px]">{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              {/* Clear button */}
              <button
                onClick={() => logger.clear()}
                title="Clear Logs"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
              >
                <Trash2 size={13} />
              </button>

              {/* Expand / Minimize height button */}
              <button
                onClick={() => setIsExpandedFull(!isExpandedFull)}
                title={isExpandedFull ? "Minimize Height" : "Expand Height"}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              >
                {isExpandedFull ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
              </button>

              {/* Close Terminal button */}
              <button
                onClick={() => setIsOpen(false)}
                title="Close Terminal"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              >
                <ChevronDown size={15} />
              </button>
            </div>
          </div>

          {/* Log Stream Body */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-1.5 font-mono text-[11px] leading-relaxed select-text"
          >
            {filteredLogs.length === 0 ? (
              <div className="text-slate-600 text-center py-8 italic text-xs">
                No logs recorded yet. Interact with vinyl records to see output.
              </div>
            ) : (
              filteredLogs.map((log) => {
                let badgeStyle = "text-sky-400 border-sky-500/20 bg-sky-950/40";
                let textStyle = "text-slate-300";
                let Icon = Info;

                if (log.level === 'error') {
                  badgeStyle = "text-rose-300 border-rose-600/50 bg-rose-950/90 font-bold animate-pulse";
                  textStyle = "text-rose-300 font-semibold bg-rose-950/40 p-1.5 rounded border border-rose-800/50";
                  Icon = AlertCircle;
                } else if (log.level === 'warn') {
                  badgeStyle = "text-amber-300 border-amber-500/30 bg-amber-950/50";
                  textStyle = "text-amber-200 bg-amber-950/20 p-1 rounded";
                  Icon = AlertTriangle;
                } else if (log.level === 'success') {
                  badgeStyle = "text-emerald-300 border-emerald-500/30 bg-emerald-950/40";
                  textStyle = "text-emerald-300 font-medium";
                  Icon = CheckCircle2;
                }

                return (
                  <div 
                    key={log.id} 
                    className={`flex items-start gap-2 border-b border-slate-900/60 pb-1.5 ${textStyle}`}
                  >
                    <span className="text-[9px] text-slate-500 shrink-0 font-sans mt-0.5">
                      {log.timestamp}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider shrink-0 ${badgeStyle}`}>
                      <Icon size={10} />
                      {log.level}
                    </span>
                    <div className="flex-1 break-all">
                      <span>{log.message}</span>
                      {log.details !== undefined && (
                        <pre className="mt-1 text-[10px] text-slate-400 bg-black/60 p-2 rounded overflow-x-auto border border-slate-800">
                          {typeof log.details === 'object' 
                            ? JSON.stringify(log.details, null, 2) 
                            : String(log.details)
                          }
                        </pre>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-1.5 bg-slate-900/80 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500 select-none">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1 cursor-pointer hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-0"
                />
                Auto-scroll
              </label>
            </div>
            <span>Tax Refund Debug Infrastructure</span>
          </div>
        </div>
      )}
    </div>
  );
};
