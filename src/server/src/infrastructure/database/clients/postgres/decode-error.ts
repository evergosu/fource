import type { InfrastructureFailures } from 'server/library/ddd/infrastructure/infrastructure-errors';

import { StringDataRightTruncation } from 'server/library/ddd/infrastructure/errors/string-data-right-truncation-failure';
import { InvalidDatetimeFormatFailure } from 'server/library/ddd/infrastructure/errors/invalid-datetime-format-failure';
import { UnknownInfrastructureFailure } from 'server/library/ddd/infrastructure/errors/unknown-infrastructure-failure';
import { ForeignKeyViolationFailure } from 'server/library/ddd/infrastructure/errors/foreign-key-violation-failure';
import { ExclusionViolationFailure } from 'server/library/ddd/infrastructure/errors/exclusion-violation-failure';
import { NotNullViolationFailure } from 'server/library/ddd/infrastructure/errors/not-null-violation-failure';
import { LockNotAvailableFailure } from 'server/library/ddd/infrastructure/errors/lock-not-available-failure';
import { UniqueViolationFailure } from 'server/library/ddd/infrastructure/errors/unique-violation-failure';
import { ConnectionExistFailure } from 'server/library/ddd/infrastructure/errors/connection-exist-failure';
import { CheckViolationFailure } from 'server/library/ddd/infrastructure/errors/check-violation-failure';
import { SerializationFailure } from 'server/library/ddd/infrastructure/errors/serialization-failure';
import { ConnectionFailure } from 'server/library/ddd/infrastructure/errors/connection-failure';
import { DeadlockFailure } from 'server/library/ddd/infrastructure/errors/deadlock-failure';
import { assertNever } from 'server/library/ddd/utility/assert-never';

import { isKnownPostgresError } from './known-errors';
import { TransactionFailure } from 'server/library/ddd/infrastructure/errors/transaction-failure';
/**
 * ---
 * PostgreSQL-specific error decoder.
 * ---
 * This decoder maps known PostgreSQL constraint violations
 * (identified by SQLSTATE error codes) into domain-level kinds.
 * ---
 * All unrecognized errors are lifted into `UnknownInfrastructureFailure`.
 * ---
 * PostgreSQL SQLSTATE reference:
 * See: [https://www.postgresql.org/docs/current/errcodes-appendix.html]
 * ---
 * @param error - The error thrown by the PostgreSQL driver.
 */
export function decodePostgresError(error: unknown): InfrastructureFailures {
  if (isKnownPostgresError(error)) {
    switch (error.code) {
      case '23505': {
        return UniqueViolationFailure(error.code, error.constraint ?? 'unknown', error);
      }
      case '23503': {
        return ForeignKeyViolationFailure(error.code, error.constraint ?? 'unknown', error);
      }
      case '23502': {
        return NotNullViolationFailure(error.code, error.column ?? 'unknown', error);
      }
      case '23514': {
        return CheckViolationFailure(error.code, error.constraint ?? 'unknown', error);
      }
      case '23P01': {
        return ExclusionViolationFailure(error.code, error.constraint ?? 'unknown', error);
      }
      case '40001': {
        return SerializationFailure(error.code, error);
      }
      case '40P01': {
        return DeadlockFailure(error.code, error);
      }
      case '55P03': {
        return LockNotAvailableFailure(error.code, error);
      }
      case '08006': {
        return ConnectionFailure(error.code, error);
      }
      case '08003': {
        return ConnectionExistFailure(error.code, error);
      }
      case '22001': {
        return StringDataRightTruncation(error.code, error);
      }
      case '22007': {
        return InvalidDatetimeFormatFailure(error.code, error);
      }
      case '25P02': {
        return TransactionFailure(error.code, error);
      }

      default: {
        assertNever(error.code);
      }
    }
  }

  return UnknownInfrastructureFailure(error);
}
