import type { Database } from '../database';

export abstract class DatabaseContext {
  public abstract truncateAll(): Promise<void>;
  public abstract migrate(): Promise<void>;
  public abstract close(): Promise<void>;
  public abstract getClient(): Database;
  public abstract seed(): Promise<void>;
}
