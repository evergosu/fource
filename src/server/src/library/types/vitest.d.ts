import type { Database } from 'server/infrastructure/database/database';

declare module 'vitest' {
  export interface TestContext {
    database: Database;
  }
}
