export {};

declare module 'vitest' {
  interface TestContext {
    database: import('server/infrastructure/database/database').Database;
  }
}
