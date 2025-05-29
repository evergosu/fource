/**
 * Supported log levels for controlling verbosity of output.
 */
export type LogLevel = 'success' | 'silent' | 'error' | 'warn' | 'info';

/**
 * Supported styles for controlling visual output.
 */
export type LogStyle = 'colorful' | 'default';

/**
 * Configuration options for the Logger instance.
 */
export interface LoggerOptions {
  /**
   * Minimum severity level to log. Messages below this level are ignored.
   *
   * - `'silent'`  - disables all logging.
   * - `'error'`   - logs only errors.
   * - `'warn'`    - logs warnings and above.
   * - `'info'`    - logs informational messages and above.
   * - `'success'` - logs everything including success notices.
   *
   * @default 'success'
   */
  level?: LogLevel;

  /**
   * Style of output using ANSI color codes.
   * Default is useful in environments where color is unsupported or undesired.
   *
   * - `'default'`  - disables all styling, using defaults.
   * - `'colorful'` - logs using ANSI color codes.
   *
   * @default 'colorful'
   */
  style?: LogStyle;
}

/**
 * A structured, cross-platform logger that supports log levels, emoji indicators,
 * timestamps, optional color formatting (Node), and pretty stack traces.
 * Automatically adapts to browser and Node.js environments.
 */
export class Logger {
  private style: LogStyle;
  private level: LogLevel;
  private isNode: boolean;

  /**
   * Create a new Logger instance.
   *
   * @param options - Logger configuration for output level and styling.
   */
  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? 'success';
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
   * Updates the current log style.
   *
   * @param style - The type of styling output.
   */
  setStyle(style: LogStyle): void {
    this.style = style;
  }

  /**
   * Logs a success message with a checkmark emoji.
   *
   * @param message - The message to print.
   */
  success(message: string): void {
    if (this.shouldLog('success')) {
      this.print('[✔]', message, 'green');
    }
  }

  /**
   * Logs an error message with optional stack trace formatting.
   *
   * @param message - Summary of the error.
   * @param error - Optional `Error` instance for stack trace output.
   */
  error(message: string, error?: unknown): void {
    if (!this.shouldLog('error')) return;

    this.print('[✖]', message, 'red');

    if (error instanceof Error) {
      this.trace(error);
    }
  }

  /**
   * Logs a warning message with a warning emoji.
   *
   * @param message - The warning content.
   */
  warn(message: string): void {
    if (this.shouldLog('warn')) {
      this.print('[⚠]', message, 'yellow');
    }
  }

  /**
   * Logs an informational message with an info emoji.
   *
   * @param message - The information to display.
   */
  info(message: string): void {
    if (this.shouldLog('info')) {
      this.print('[➜]', message, 'blue');
    }
  }

  /**
   * Logs a plain, unstyled message (same level as `info`).
   *
   * @param message - Any generic message to show.
   */
  log(message: string): void {
    if (this.shouldLog('info')) {
      this.print('', message, 'gray');
    }
  }

  /**
   * Determines if the current log level allows showing the given severity.
   *
   * @param level - Level of the message to be printed.
   * @returns `true` if the message should be printed, `false` otherwise.
   */
  private shouldLog(level: LogLevel): boolean {
    return LEVELS[level] <= LEVELS[this.level];
  }

  /**
   * Prints a formatted log line with emoji, color, and timestamp.
   *
   * @param emoji - Emoji symbol prefixing the message.
   * @param message - Text content of the log line.
   * @param color - Color to use for Node terminal output.
   */
  private print(
    emoji: string,
    message: string,
    color: keyof typeof COLOR,
  ): void {
    const line = this.formatLine(emoji, message);

    if (!this.isNode || this.style === 'default') {
      console.log(line);
    } else {
      console.log(`${COLOR[color]}${line}${COLOR.reset}`);
    }
  }

  /**
   * Builds a formatted line with timestamp and emoji.
   *
   * @param emoji - Optional emoji to prefix the message.
   * @param message - Raw message string.
   * @returns A line formatted with timestamp and emoji.
   */
  private formatLine(emoji: string, message: string): string {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

    const maybeEmoji = emoji ? `${emoji} ` : '';

    return `[${timestamp}] ${maybeEmoji}${message}`;
  }

  /**
   * Outputs a formatted stack trace to the console.
   * Automatically strips internal Node frames unless the error is from Node.
   *
   * @param error - The error instance to trace.
   */
  private trace(error: Error): void {
    if (!this.isNode) {
      console.error(error);
      return;
    }

    const header = `${error.name}: ${error.message}`;

    this.error(header);

    if (error.stack) {
      const lines = error.stack.split('\n').slice(1);

      const isNodeError =
        error.stack.includes('node:') || error.name.startsWith('Node');

      const filtered = lines.filter(line => {
        const isInternal = /node:|internal\/|node_modules\/internal-/.test(
          line,
        );

        return !isInternal || isNodeError;
      });

      for (const line of filtered) {
        const message = line.trim();

        console.error(
          this.style === 'default'
            ? message
            : `${COLOR.gray}${message}${COLOR.reset}`,
        );
      }
    }

    if (error.cause instanceof Error) {
      const prefix =
        this.style === 'default'
          ? 'Caused by:'
          : `${COLOR.gray}Caused by:${COLOR.reset}`;

      console.error(prefix);

      this.trace(error.cause);
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
  success: 4,
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
};
