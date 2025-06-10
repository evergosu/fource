import type { Logger } from 'library/tools/logger';

import type { Database } from '../database';

export abstract class DatabaseContext {
  public abstract migrate(logger: Logger): Promise<void>;
  public abstract truncateAll(): Promise<void>;
  public abstract close(): Promise<void>;
  public abstract getClient(): Database;
  public abstract seed(): Promise<void>;
}
