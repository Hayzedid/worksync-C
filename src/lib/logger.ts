export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  stackTrace?: string;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

class Logger {
  private config: LoggerConfig;
  private sessionId: string;
  private logs: LogEntry[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      minLevel: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
      enableConsole: process.env.NODE_ENV !== 'production',
      enableStorage: true,
      maxStorageEntries: 1000,
      enableRemote: process.env.NODE_ENV === 'production',
      remoteEndpoint: '/api/logs',
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.loadStoredLogs();
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private loadStoredLogs(): void {
    if (!this.config.enableStorage) return;

    try {
      const stored = localStorage.getItem('app_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load stored logs:', error);
    }
  }

  private saveLogsToStorage(): void {
    if (!this.config.enableStorage) return;

    try {
      // Keep only the latest entries
      const logsToStore = this.logs.slice(-this.config.maxStorageEntries);
      localStorage.setItem('app_logs', JSON.stringify(logsToStore));
      this.logs = logsToStore;
    } catch (error) {
      console.warn('Failed to save logs to storage:', error);
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.warn('Failed to send log to remote:', error);
    }
  }

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Add user ID if available
    const userId = this.getCurrentUserId();
    if (userId) {
      entry.userId = userId;
    }

    // Add stack trace for errors
    if (level === LogLevel.ERROR) {
      entry.stackTrace = new Error().stack;
    }

    return entry;
  }

  private getCurrentUserId(): string | undefined {
    try {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch {
      // Ignore errors getting user ID
    }
    return undefined;
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (level < this.config.minLevel) return;

    const entry = this.createLogEntry(level, message, data);

    // Console logging
    if (this.config.enableConsole) {
      const logMethod = level === LogLevel.DEBUG ? 'debug' :
                       level === LogLevel.INFO ? 'info' :
                       level === LogLevel.WARN ? 'warn' : 'error';
      
      if (data) {
        console[logMethod](entry.message, data);
      } else {
        console[logMethod](entry.message);
      }
    }

    // Storage logging
    this.logs.push(entry);
    this.saveLogsToStorage();

    // Remote logging (async, don't await)
    if (level >= LogLevel.WARN) {
      this.sendToRemote(entry);
    }
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  // Convenience methods
  apiCall(method: string, url: string, data?: any): void {
    this.debug(`API ${method} ${url}`, data);
  }

  apiResponse(method: string, url: string, status: number, data?: any): void {
    const message = `API ${method} ${url} - ${status}`;
    if (status >= 400) {
      this.error(message, data);
    } else {
      this.debug(message, data);
    }
  }

  userAction(action: string, data?: any): void {
    this.info(`User action: ${action}`, data);
  }

  pageView(path: string): void {
    this.info(`Page view: ${path}`);
  }

  // Get logs for debugging/support
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
    if (this.config.enableStorage) {
      localStorage.removeItem('app_logs');
    }
  }

  // Export logs for support
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Global logger instance
export const logger = new Logger();

// Performance monitoring
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  static startTiming(name: string): void {
    this.marks.set(name, performance.now());
  }

  static endTiming(name: string): number {
    const start = this.marks.get(name);
    if (!start) {
      logger.warn(`No start timing found for: ${name}`);
      return 0;
    }

    const duration = performance.now() - start;
    this.marks.delete(name);
    
    logger.debug(`Performance: ${name}`, { duration: `${duration.toFixed(2)}ms` });
    return duration;
  }

  static measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.startTiming(name);
      fn()
        .then(result => {
          this.endTiming(name);
          resolve(result);
        })
        .catch(error => {
          this.endTiming(name);
          logger.error(`Performance measurement failed: ${name}`, error);
          reject(error);
        });
    });
  }
}

// Error tracking utilities
export const trackError = (error: Error, context?: any) => {
  logger.error(error.message, {
    name: error.name,
    stack: error.stack,
    context
  });
};

export const trackApiError = (method: string, url: string, error: any) => {
  logger.error(`API Error: ${method} ${url}`, {
    error: error.message || error,
    stack: error.stack
  });
};

// User analytics
export const trackUserEvent = (event: string, properties?: any) => {
  logger.info(`User event: ${event}`, properties);
};

export const trackPageView = (path: string, additionalData?: any) => {
  logger.info(`Page view: ${path}`, additionalData);
};
