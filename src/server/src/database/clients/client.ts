import type { Database } from '../database';

export abstract class DatabaseContext {
  public abstract truncateAll(): Promise<void>;
  public abstract close(): Promise<void>;
  public abstract getClient(): Database;
}
