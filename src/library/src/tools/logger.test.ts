import type { UnionTuple } from 'library/typescript/union-tuple';
import type { MockInstance } from 'vitest';

import { readFileSync } from 'node:fs';

import { type LogEmoji, type LogLevel, Logger } from './logger';

describe('logger', () => {
  let logSpy: MockInstance;
  let errorSpy: MockInstance;
  let logger: Logger;

  const EMOJIS: UnionTuple<LogEmoji> = ['➜', '✔', '❢', '✖'];

  const LOG_LEVELS: UnionTuple<LogLevel> = ['info', 'success', 'warn', 'error', 'silent'];

  const message = 'test';

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-09T12:34:56'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    // Order matters. Logger should capture spy console and not real one.
    logger = new Logger();
  });

  afterEach(() => {
    logger.setLevel('info');
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should print log message', () => {
    logger.log(message);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(message));
  });

  it('should handle non-string or falsy messages', () => {
    logger.log(undefined as unknown as string);
    logger.log([] as unknown as string);
    logger.log({} as unknown as string);
    logger.log(false as unknown as string);
    logger.log(0 as unknown as string);

    expect(logSpy).toHaveBeenCalledTimes(5);
  });

  it('should print success message', () => {
    logger.success(message);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(message));
  });

  it('should print info message', () => {
    logger.info(message);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(message));
  });

  it('should print warning message', () => {
    logger.warn(message);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(message));
  });

  it('should contain timestamp', () => {
    logger.log(message);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('12:34:56'));
  });

  it('should contain correct emoji in each message', () => {
    callEachLog(logger, message);

    for (const [index, emoji] of EMOJIS.entries()) {
      // Plus one for .log() which is not contain emojis.
      expect(logSpy.mock.calls[index + 1]?.at(0)).toContain(emoji);
    }
  });

  describe('.level', () => {
    it('should not print any message, if level is "silent"', () => {
      const logger = new Logger({ level: 'silent' });

      callEachLog(logger, message);

      expect(logSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should be able to change log level', () => {
      logger.setLevel('error');

      logger.log(message);

      expect(logSpy).not.toHaveBeenCalled();
    });

    it('should print warn message, if level is `warn` or above', () => {
      for (const level of LOG_LEVELS) {
        logger.setLevel(level);
        logger.warn(message);
      }

      expect(logSpy).toHaveBeenCalledTimes(3);
    });

    it('should print info message, if level is `info` or above', () => {
      for (const level of LOG_LEVELS) {
        logger.setLevel(level);
        logger.info(message);
      }

      expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it('should print log message, if level is `info` or above', () => {
      for (const level of LOG_LEVELS) {
        logger.setLevel(level);
        logger.log(message);
      }

      expect(logSpy).toHaveBeenCalledTimes(1);
    });

    it('should print success message, if level is `success` or above', () => {
      for (const level of LOG_LEVELS) {
        logger.setLevel(level);
        logger.success(message);
      }

      expect(logSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('.style', () => {
    const COLORS = {
      yellow: '\u001B[0;33m',
      green: '\u001B[0;32m',
      blue: '\u001B[0;34m',
      red: '\u001B[0;31m',
      gray: '\u001B[90m',
      reset: '\u001B[0m',
    };

    it('should print correct colorful text in each message', () => {
      callEachLog(logger, message);

      const expectedColors: UnionTuple<keyof Omit<typeof COLORS, 'reset'>> = ['gray', 'blue', 'green', 'yellow', 'red'];

      for (const [index, color] of expectedColors.entries()) {
        const row = logSpy.mock.calls[index]?.at(0) as string;

        expect(row.startsWith(COLORS[color])).toBeTruthy();
        expect(row.endsWith(COLORS.reset)).toBeTruthy();
      }
    });

    it('should not print colors when style is set to `default`', () => {
      const logger = new Logger({ style: 'default' });

      callEachLog(logger, message);

      for (const call of logSpy.mock.calls) {
        const printed = call.join(' ');

        for (const color of Object.values(COLORS)) {
          expect(printed).not.toContain(color);
        }
      }
    });

    it('should isolate config between logger instances', () => {
      const loggerOne = new Logger({ style: 'default' });
      const loggerTwo = new Logger({ style: 'colorful' });

      loggerOne.info(message);
      loggerTwo.info(message);

      const [outputOne, outputTwo] = logSpy.mock.calls.map(call => call.join(' '));

      expect(outputOne).not.toMatch(COLORS.blue);
      expect(outputTwo).toMatch(COLORS.blue);
    });
  });

  describe('.error()', () => {
    it('should print error message', () => {
      logger.error(message);

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(message));
    });

    it('should print error message, if level is `error` or above', () => {
      const logger = new Logger();

      for (const level of LOG_LEVELS) {
        logger.setLevel(level);
        logger.error(message);
      }

      expect(logSpy).toHaveBeenCalledTimes(4);
    });

    it('should print error, if provided', () => {
      const error = new Error('test error');

      logger.error(message, error);

      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining(String(error)));
    });

    it('should trace error stack, if present', () => {
      const error = new Error('test error');

      logger.error(message, error);

      expect(errorSpy).toHaveBeenCalledWith(expect.stringMatching(/at .*:\d+:\d+/));
    });

    it('should trace nested errors', () => {
      const rootError = new Error('root error');
      const middleError = new Error('middle error', { cause: rootError });
      const topError = new Error('top error', { cause: middleError });

      logger.error(message, topError);

      const output = errorSpy.mock.calls.map(call => call.join(' ')).join('\n');

      expect(output).toMatch(topError.message);
      expect(output).toMatch(middleError.message);
      expect(output).toMatch(rootError.message);
    });

    it('should display indentation level of nested errors', () => {
      const rootError = new Error('test error');
      const error = new Error('test error', { cause: rootError });

      // Default style to get rid of colors for indent detection.
      const logger = new Logger({ style: 'default' });

      logger.error(message, error);

      const fourSpaces = ' '.repeat(4);

      const lastError = errorSpy.mock.lastCall?.pop() as string;

      expect(lastError.startsWith(fourSpaces)).toBeTruthy();
    });

    it('should filter the trace of internal errors', () => {
      try {
        readFileSync('/always_throw');
      } catch (error) {
        logger.error(message, error);

        const output = errorSpy.mock.calls.map(call => call.join(' ')).join('\n');

        expect(output).not.toMatch(/^(?:\s*at .*node:(?:internal|vm|fs|timers)|node_modules\/internal)/);
      }
    });

    it('should respect default style in error traces', () => {
      const logger = new Logger({ style: 'default' });

      const error = new Error('test error');

      logger.error(message, error);

      const output = errorSpy.mock.calls.map(call => call.join(' ')).join('\n');

      // eslint-disable-next-line no-control-regex, sonarjs/sonar-no-control-regex
      const ANSI_COLOR_CODES = /\u001B\[\d+m/;

      expect(output).not.toMatch(ANSI_COLOR_CODES);
    });

    it('should fallback to console, if called from non-node environment', () => {
      const original = process.versions.node;

      delete (process.versions as { node?: string }).node;

      // Initialized right after deletion to pick up required environment.
      const logger = new Logger();

      const error = new Error('test error');

      logger.error(message, error);

      const output = errorSpy.mock.calls.map(call => call.join(' ')).join('\n');

      // eslint-disable-next-line no-control-regex, sonarjs/sonar-no-control-regex
      const ANSI_COLOR_CODES = /\u001B\[\d+m/;

      expect(output).not.toMatch(ANSI_COLOR_CODES);

      process.versions.node = original;
    });
  });
});

type LogMethod = Extract<keyof Logger, 'success' | 'error' | 'info' | 'warn' | 'log'>;

function callEachLog(logger: Logger, message: string) {
  const methods: LogMethod[] = ['log', 'info', 'success', 'warn', 'error'];

  for (const method of methods) {
    logger[method](message);
  }
}
