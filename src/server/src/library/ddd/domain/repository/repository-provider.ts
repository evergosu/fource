import type { DatabaseTransaction } from 'server/infrastructure/database/database';

export type DatabaseConstructor<T> = new (
  transaction: DatabaseTransaction,
) => T;

/**
 * ---
 * Store of a repositories bound to the current transaction.
 */
export class TransactionalDatabaseProvider {
  private readonly instances = new Map<DatabaseConstructor<unknown>, unknown>();

  /**
   * ---
   * Creates instance of `TransactionalRepositoryProvider`
   * ---
   * @param transaction - current transaction to bind
   */
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly transaction: DatabaseTransaction) { }

  /**
   * ---
   * Resolves a repository bound to the current transaction.
   * Instantiates it lazily on first request.
   * ---
   * @param Database - concrete repository to retrieve
   */
  get<T>(Database: DatabaseConstructor<T>): T {
    const cachedRepository = this.instances.get(Database);

    if (cachedRepository) {
      return cachedRepository as T;
    }

    const repository = new Database(this.transaction);

    this.instances.set(Database, repository);

    return repository;
  }
}
