/**
 * ---
 * Base class for mapping database projections into read models.
 * ---
 * Query mappers are used only on the read side of a CQRS system.
 * They do not interact with domain aggregates and must not
 * enforce domain invariants. Their responsibility is purely
 * structural translation between persistence representations
 * and query DTOs used by application services.
 * ---
 * @template Row Database row representation.
 * @template View Query DTO returned to application layer.
 */
export abstract class QueryMapper<Row, View> {
  /**
   * ---
   * Maps a single database row to a query DTO.
   * ---
   * @param row Raw row returned from the persistence layer.
   * @returns View model used by application layer.
   */
  public abstract toView(row: Row): View;

  /**
   * ---
   * Maps multiple rows to query DTOs.
   * ---
   * @param rows Collection of rows returned by the persistence layer.
   * @returns Array of view models.
   */
  public toViews(rows: readonly Row[]): View[] {
    return rows.map(row => this.toView(row));
  }
}
