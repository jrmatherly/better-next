/** Types and Interfaces */
export type LogLevel = 'debug' | 'error' | 'info' | 'warn';
export type LogModule =
  | 'auth'
  | 'database'
  | 'general'
  | 'api'
  | 'apiKey'
  | 'ui';

export interface LogContext {
  [key: string]: unknown;
  module?: LogModule;
  sessionId?: string;
  userId?: string;
  requestId?: string;
  path?: string;
  metadata?: Record<string, unknown>;
  traceId?: string;
  spanId?: string;
}

export interface LogData {
  level: LogLevel;
  message: string;
  context: LogContext;
  timestamp: string;
  data?: unknown;
}

export interface SensitiveDataConfig {
  patterns: RegExp[];
  replacement: string;
}
