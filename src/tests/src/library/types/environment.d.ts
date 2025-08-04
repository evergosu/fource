export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      NEXT_PUBLIC_BASE_URL: string;
      NEXT_PUBLIC_ORIGIN: string;
    }
  }
}
