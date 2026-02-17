import type { StringDataRightTruncation } from './errors/string-data-right-truncation-failure';
import type { InvalidDatetimeFormatFailure } from './errors/invalid-datetime-format-failure';
import type { UnknownInfrastructureFailure } from './errors/unknown-infrastructure-failure';
import type { ForeignKeyViolationFailure } from './errors/foreign-key-violation-failure';
import type { ExclusionViolationFailure } from './errors/exclusion-violation-failure';
import type { NotNullViolationFailure } from './errors/not-null-violation-failure';
import type { LockNotAvailableFailure } from './errors/lock-not-available-failure';
import type { ConnectionExistFailure } from './errors/connection-exist-failure';
import type { UniqueViolationFailure } from './errors/unique-violation-failure';
import type { CheckViolationFailure } from './errors/check-violation-failure';
import type { SerializationFailure } from './errors/serialization-failure';
import type { ConnectionFailure } from './errors/connection-failure';
import type { DeadlockFailure } from './errors/deadlock-failure';

export type InfrastructureFailures =
  | InvalidDatetimeFormatFailure
  | UnknownInfrastructureFailure
  | ForeignKeyViolationFailure
  | ExclusionViolationFailure
  | StringDataRightTruncation
  | NotNullViolationFailure
  | LockNotAvailableFailure
  | ConnectionExistFailure
  | UniqueViolationFailure
  | CheckViolationFailure
  | SerializationFailure
  | ConnectionFailure
  | DeadlockFailure;
