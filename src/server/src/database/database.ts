import type { PostgresLite } from './clients/pglite';
import type { Postgres } from './clients/postgresql';

export type Database = PostgresLite | Postgres;
