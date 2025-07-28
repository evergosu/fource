import type { Logger } from 'library/tools/logger';

import type { Database } from '../database';

/**
 * Abstract class with database methods
 * that must be implemented on context.
 */
export abstract class DatabaseContext {
  public abstract migrate(logger: Logger): Promise<void>;
  public abstract truncateAll(): Promise<void>;
  public abstract close(): Promise<void>;
  public abstract getClient(): Database;
  public abstract seed(): Promise<void>;
}
