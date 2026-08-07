export type LogLevel = 'info' | 'warn' | 'error' | 'success';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: any;
}

type LogListener = (entry: LogEntry) => void;

class DebugLogger {
  private logs: LogEntry[] = [];
  private listeners: Set<LogListener> = new Set();
  private maxLogs = 200;

  public log(level: LogLevel, message: string, details?: any) {
    const entry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }),
      level,
      message,
      details
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    this.notify(entry);

    // Also output to standard browser console with formatted styles
    const colors: Record<LogLevel, string> = {
      info: 'color: #38bdf8',
      warn: 'color: #fbbf24; font-weight: bold',
      error: 'color: #f87171; font-weight: bold',
      success: 'color: #4ade80; font-weight: bold'
    };
    console.log(`%c[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, colors[level], details ?? '');
  }

  public info(message: string, details?: any) {
    this.log('info', message, details);
  }

  public warn(message: string, details?: any) {
    this.log('warn', message, details);
  }

  public error(message: string, details?: any) {
    this.log('error', message, details);
  }

  public success(message: string, details?: any) {
    this.log('success', message, details);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clear() {
    this.logs = [];
    this.notifyAll();
  }

  public subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(entry: LogEntry) {
    this.listeners.forEach((listener) => {
      try {
        listener(entry);
      } catch (err) {
        console.error('Error in logger listener', err);
      }
    });
  }

  private notifyAll() {
    // Notify with a dummy clear entry or trigger state reset
    this.listeners.forEach((listener) => {
      try {
        listener({ id: 'clear', timestamp: '', level: 'info', message: '__CLEAR__' });
      } catch (err) {
        console.error('Error clearing logger listeners', err);
      }
    });
  }
}

export const logger = new DebugLogger();
