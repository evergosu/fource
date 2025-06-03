import type { Database } from 'server/database/database';

declare module 'vitest' {
  export interface TestContext {
    database: Database;
  }
}
