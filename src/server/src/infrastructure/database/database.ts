/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PgliteTransaction } from 'drizzle-orm/pglite';
import type { PgTransaction } from 'drizzle-orm/pg-core';

import type { PostgresLite } from './clients/pglite';
import type { Postgres } from './clients/postgresql';

export type Database = PostgresLite | Postgres;

export type DatabaseTransaction = PgliteTransaction<any, any> | PgTransaction<any, any>;
