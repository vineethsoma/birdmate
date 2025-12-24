/**
 * Structured logging service
 * 
 * Provides JSON-formatted logs with contextual information
 * for observability and debugging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
}

/**
 * Format log entry as JSON
 */
function formatLogEntry(level: LogLevel, message: string, context?: LogContext): string {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };
  
  if (context && Object.keys(context).length > 0) {
    entry.context = context;
  }
  
  return JSON.stringify(entry);
}

/**
 * Log debug message
 */
export function debug(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(formatLogEntry('debug', message, context));
  }
}

/**
 * Log info message
 */
export function info(message: string, context?: LogContext): void {
  console.log(formatLogEntry('info', message, context));
}

/**
 * Log warning message
 */
export function warn(message: string, context?: LogContext): void {
  console.warn(formatLogEntry('warn', message, context));
}

/**
 * Log error message
 */
export function error(message: string, context?: LogContext): void {
  console.error(formatLogEntry('error', message, context));
}

/**
 * Log HTTP request
 */
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  context?: LogContext
): void {
  info(`${method} ${path} ${statusCode}`, {
    method,
    path,
    statusCode,
    durationMs: duration,
    ...context,
  });
}

/**
 * Log search query for audit trail
 */
export function logSearch(
  query: string,
  resultCount: number,
  topResults: string[],
  duration: number
): void {
  info('Search query executed', {
    query,
    resultCount,
    topResults,
    durationMs: duration,
  });
}
