/**
 * Supported log levels for controlling verbosity.
 */
export type LogLevel = 'success' | 'silent' | 'error' | 'warn' | 'info';

/**
 * Output style for terminal formatting.
 */
export type LogStyle = 'colorful' | 'default';

/**
 * Emoji symbols associated with log levels.
 */
export type LogEmoji = '➜' | '✔' | '❢' | '✖';

/**
 * Configuration options for the Logger.
 */
export interface LoggerOptions {
  /**
   * Minimum level of messages to output. Lower severity messages are ignored.
   *
   * @default 'info'
   */
  level?: LogLevel;

  /**
   * Output style for ANSI formatting.
   * Default is useful in environments where color is unsupported or undesired.
   *
   * @default 'colorful'
   */
  style?: LogStyle;

  /**
   * Custom function for logging regular output.
   * Useful for testing or redirection (e.g., to file, memory).
   *
   * @default console.log
   */
  logFunction?: typeof console.log;

  /**
   * Custom function for logging error output.
   * Useful for testing or redirection (e.g., to file, memory).
   *
   * @default console.error
   */
  errorFunction?: typeof console.error;
}

/**
 * A structured, cross-platform logger that supports log levels, emoji indicators,
 * timestamps, optional color formatting (Node), and pretty stack traces.
 * Automatically adapts to browser and Node.js environments.
 */
export class Logger {
  private errorFunction: typeof console.error;
  private logFunction: typeof console.log;
  private style: LogStyle;
  private isNode: boolean;
  public level: LogLevel;

  /**
   * Create a new Logger instance.
   *
   * @param options - Logger configuration for output level and styling.
   */
  constructor(options: LoggerOptions = {}) {
    this.logFunction = options.logFunction ?? console.log;
    this.errorFunction = options.errorFunction ?? console.error;
    this.level = options.level ?? 'info';
    this.style = options.style ?? 'colorful';
    this.isNode = typeof process !== 'undefined' && !!process.versions.node;
  }

  /**
   * Updates the current log level threshold.
   *
   * @param level - The new minimum severity level to display.
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Logs a success message with a checkmark emoji.
   *
   * @param message - The message to print.
   */
  success(message: string): void {
    if (this.shouldLog('success')) {
      this.print(message, 'green', EMOJI.success);
    }
  }

  /**
   * Logs an error message with optional stack trace formatting.
   *
   * @param message - The message to print.
   * @param error - Optional `Error` instance for stack trace output.
   */
  error(message: string, error?: unknown): void {
    if (!this.shouldLog('error')) return;

    this.print(message, 'red', EMOJI.error);

    if (error instanceof Error) {
      this.trace(error);
    }
  }

  /**
   * Logs a warning message with an exclamation emoji.
   *
   * @param message - The message to print.
   */
  warn(message: string): void {
    if (this.shouldLog('warn')) {
      this.print(message, 'yellow', EMOJI.warn);
    }
  }

  /**
   * Logs an informational message with an arrow emoji.
   *
   * @param message - The message to print.
   */
  info(message: string): void {
    if (this.shouldLog('info')) {
      this.print(message, 'blue', EMOJI.info);
    }
  }

  /**
   * Logs a plain, unstyled message (same level as `info`).
   *
   * @param message - Any generic message to print.
   */
  log(message: string): void {
    if (this.shouldLog('info')) {
      this.print(message, 'gray');
    }
  }

  /**
   * Determines if the current log level allows showing the given severity.
   *
   * @param level - Level of the message to be printed.
   * @returns `true` if the message should be printed, `false` otherwise.
   */
  private shouldLog(level: LogLevel): boolean {
    if (level === 'silent') return false;

    return LEVELS[level] <= LEVELS[this.level];
  }

  /**
   * Prints a formatted log message with emoji, color, and timestamp.
   *
   * @param message - The message to print.
   * @param color - Color to use for Node terminal output.
   * @param emoji - Emoji symbol prefixing the message.
   */
  private print(message: string, color: keyof typeof COLOR, emoji?: LogEmoji): void {
    this.pipeToLog(message, this.addEmoji(emoji), this.addTimestamp, this.addColor(color), this.logFunction);
  }

  /**
   * Wraps provided message with ANSI color codes,
   * if environment allows.
   *
   * @param message - Text content to colorize.
   * @param color - Color to use for Node terminal output.
   * @returns The formatted message with an ANSI colors.
   */
  private addColor(color: keyof typeof COLOR): (message: string) => string {
    return message => (!this.isNode || this.style === 'default' ? message : `${COLOR[color]}${message}${COLOR.reset}`);
  }

  /**
   * Prepends message with emoji.
   *
   * @param message - Raw text string.
   * @param emoji - Optional emoji to prefix the line.
   * @returns The formatted message with an emoji.
   */
  private addEmoji(emoji?: LogEmoji): (message: string) => string {
    return message => (emoji ? `[${emoji}] ${message}` : message);
  }

  /**
   * Prepends message with timestamp (en-US, 24-hours).
   *
   * @param message - Raw text string.
   * @returns The formatted message with a timestamp.
   */
  private addTimestamp(this: void, message: string): string {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

    return `[${timestamp}] ${message}`;
  }

  /**
   * Prepends line with four spaces per level.
   *
   * @param line - Raw text string.
   * @param level - Optional level of message.
   * @returns The formatted line with an indentation.
   */
  private addIndent(level = 0): (line: string) => string {
    return line => `${'    '.repeat(level)}${line}`;
  }

  /**
   * Applies a sequence of transformation functions to a value,
   * then passes the final result to a side-effect function.
   *
   * This method enforces a functional pipeline pattern:
   * - All but the last function must return a value of the same type (`T`).
   * - The final function must perform a side effect (returning `void`),
   *   such as writing to a log or console.
   *
   * @template T The data type being transformed.
   * @param value The initial value to pass through the pipeline.
   * @param fns A series of functions:
   *   - Zero or more pure functions of type `(input: T) => T`
   *   - One final terminal function of type `(input: T) => void`
   *
   * @example
   * this.pipeToLog('message', this.addTimestamp, this.addColor, console.log);
   */
  private pipeToLog<T>(value: T, ...fns: [...((input: T) => T)[], (input: T) => void]): void {
    const length = fns.length;

    if (length === 0) return;

    const log = fns[length - 1] as (input: T) => void;

    let result = value;
    for (let index = 0; index < length - 1; index++) {
      result = (fns[index] as (input: T) => T)(result);
    }

    log(result);
  }

  /**
   * Outputs a formatted stack trace to the console.
   * Automatically strips internal Node frames unless the error is from Node.
   *
   * @param error - The error instance to trace.
   */
  private trace(error: Error, level = 0): void {
    if (!this.isNode) {
      this.errorFunction(error);

      return;
    }

    this.pipeToLog(`${error.name}: ${error.message}`, this.addIndent(level), this.addColor('red'), this.errorFunction);

    if (error.stack && typeof error.stack === 'string') {
      const rawLines = error.stack.split('\n').slice(1);

      const lines = rawLines.filter(line => {
        const isInternal = /^(?:\s*at .*node:(?:internal|vm|fs|timers)|node_modules\/internal)/.test(line);

        return !isInternal;
      });

      for (const line of lines) {
        this.pipeToLog(line.trim(), this.addIndent(level), this.addColor('gray'), this.errorFunction);
      }
    }

    if (error.cause instanceof Error) {
      this.pipeToLog('Caused by:', this.addIndent(level), this.addColor('red'), this.errorFunction);

      this.trace(error.cause, level + 1);
    }
  }
}

// ANSI escape code map for terminal colors (used only in Node).
const COLOR = {
  yellow: '\u001B[0;33m',
  green: '\u001B[0;32m',
  blue: '\u001B[0;34m',
  red: '\u001B[0;31m',
  reset: '\u001B[0m',
  gray: '\u001B[90m',
};

/**
 * Internal log level severity map used for filtering output.
 */
const LEVELS: Record<LogLevel, number> = {
  success: 3,
  silent: 0,
  error: 1,
  info: 4,
  warn: 2,
};

/**
 * Internal log emoji map used for marking output.
 */
const EMOJI: Record<Exclude<LogLevel, 'silent'>, LogEmoji> = {
  success: '✔',
  error: '✖',
  warn: '❢',
  info: '➜',
};
