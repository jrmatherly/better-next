import { env } from '@/env';
/* import { showLogger } from '@/lib/settings'; */
import type {
  LogContext,
  LogData,
  LogLevel,
  LogModule,
  SensitiveDataConfig,
} from '@/types/logs';
import { consola } from 'consola';

/** Types and Interfaces */
/* type LogLevel = 'debug' | 'error' | 'info' | 'warn';
type LogModule = 'auth' | 'database' | 'general' | 'api' | 'ui';

interface LogContext {
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

interface LogData {
  level: LogLevel;
  message: string;
  context: LogContext;
  timestamp: string;
  data?: unknown;
}

interface SensitiveDataConfig {
  patterns: RegExp[];
  replacement: string;
} */

/** Constants */

/*
 * Node environment
 */
const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

/*
 * Show logger in local development or when explicitly enabled
 */
const loggerConfig = {
  enabled: isDev ? true : env.NEXT_PUBLIC_SHOW_LOGGER,
  level: env.NEXT_PUBLIC_LOG_LEVEL,
} as const;

const showLogger = loggerConfig.enabled;

const LOG_COLORS = {
  debug: '#A78BFA',
  error: '#EF4444',
  info: '#22D3EE',
  warn: '#FBBF24',
} as const;

const MODULE_PREFIXES = {
  auth: '🔐 Auth',
  database: '💾 DB',
  general: '📌 General',
  api: '🌐 API',
  ui: '🎨 UI',
} as const;

/** Default sensitive data patterns */
const DEFAULT_SENSITIVE_PATTERNS: SensitiveDataConfig = {
  patterns: [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
    /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // Credit card
    /\b(?:\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/, // Phone
  ],
  replacement: '[REDACTED]',
};

/** Generate a unique ID that works in all environments including Edge Runtime */
const generateId = (): string => {
  if (typeof window === 'undefined') {
    /** Server-side: use timestamp and random for uniqueness */
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomStr}`;
  }
  /** Client-side: use Web Crypto API if available, fallback to timestamp+random */
  if (window?.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
};

/** Memoize function for performance */
const memoize = <TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  resolver?: (...args: TArgs) => string
): ((...args: TArgs) => TReturn) => {
  const cache = new Map<string, TReturn>();

  return (...args: TArgs): TReturn => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key) as TReturn;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/** Logger class */
class Logger {
  private console: typeof consola;
  private context: LogContext;
  private sensitiveConfig: SensitiveDataConfig;
  private static instance: Map<LogModule | undefined, Logger> = new Map();

  private constructor(module?: LogModule) {
    this.console = consola.create({
      level: env.NEXT_PUBLIC_LOG_LEVEL
        ? Number.parseInt(env.NEXT_PUBLIC_LOG_LEVEL, 10)
        : showLogger
          ? 4
          : 2,
      formatOptions: {
        date: true,
        colors: true,
      },
    });

    this.context = {
      module,
      requestId: generateId(),
    };

    this.sensitiveConfig = DEFAULT_SENSITIVE_PATTERNS;
  }

  public static getInstance(module?: LogModule): Logger {
    const existingLogger = Logger.instance.get(module);
    if (!existingLogger) {
      Logger.instance.set(module, new Logger(module));
      return Logger.instance.get(module) as Logger;
    }
    return existingLogger;
  }

  private sanitizeData(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
      return this.sanitizeString(String(data));
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([key, value]) => [
        key,
        this.sanitizeData(value),
      ])
    );
  }

  private sanitizeString = memoize((str: string): string => {
    let result = str;
    for (const pattern of this.sensitiveConfig.patterns) {
      result = result.replace(pattern, this.sensitiveConfig.replacement);
    }
    return result;
  });

  private formatMessage(
    level: LogLevel,
    message: string,
    data?: unknown
  ): LogData {
    const sanitizedData = this.sanitizeData(data);
    return {
      level,
      message: this.context.module
        ? `${MODULE_PREFIXES[this.context.module]} ${message}`
        : message,
      context: this.context,
      timestamp: new Date().toISOString(),
      data: sanitizedData,
    };
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!showLogger && level === 'debug') return;

    const logData = this.formatMessage(level, message, data);

    // Add trace ID if not present
    if (!logData.context.traceId) {
      logData.context.traceId = generateId();
    }

    switch (level) {
      case 'debug':
        this.console.debug(logData);
        break;
      case 'error':
        this.console.error(logData);
        break;
      case 'warn':
        this.console.warn(logData);
        break;
      default:
        this.console.info(logData);
    }

    /** Log rotation (if configured) */
    /* if (env.LOG_ROTATION === 'true' && typeof window === 'undefined') {
      // Implement log rotation logic here if needed
    } */
  }

  /** Public methods */
  public setContext(context: Partial<LogContext>): this {
    this.context = { ...this.context, ...context };
    return this;
  }

  public setSensitivePatterns(
    patterns: RegExp[],
    replacement = '[REDACTED]'
  ): this {
    this.sensitiveConfig = { patterns, replacement };
    return this;
  }

  public startTrace(): this {
    this.context.traceId = generateId();
    this.context.spanId = generateId();
    return this;
  }

  public debug(message: string, data?: unknown): this {
    this.log('debug', message, data);
    return this;
  }

  public info(message: string, data?: unknown): this {
    this.log('info', message, data);
    return this;
  }

  public warn(message: string, data?: unknown): this {
    this.log('warn', message, data);
    return this;
  }

  public error(message: string, error?: Error | unknown): this {
    const errorData =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: error.cause,
          }
        : error;

    this.log('error', message, errorData);
    return this;
  }

  public when(condition: boolean, fn: (logger: this) => void): this {
    if (condition) {
      fn(this);
    }
    return this;
  }
}

/** Create module-specific loggers using singleton pattern */
export const logger = Logger.getInstance('general');
export const dbLogger = Logger.getInstance('database');
export const authLogger = Logger.getInstance('auth');
export const apiLogger = Logger.getInstance('api');
export const uiLogger = Logger.getInstance('ui');

/** Backward compatibility */
export default function log(data: unknown, comment?: string): void {
  logger.info(comment ?? 'Development Log', data);
}
