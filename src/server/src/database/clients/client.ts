import type { Logger } from 'server/lib/logger';

import type { Database } from '../database';

export abstract class DatabaseContext {
  public abstract migrate(logger: Logger): Promise<void>;
  public abstract truncateAll(): Promise<void>;
  public abstract close(): Promise<void>;
  public abstract getClient(): Database;
  public abstract seed(): Promise<void>;
}
