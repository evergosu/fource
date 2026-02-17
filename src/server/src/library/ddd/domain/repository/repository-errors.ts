/* eslint-disable prettier/prettier */
import type { UniqueIdentifier } from '../identifiers/unique-identifier';
import type { Specification } from '../rules/specification';

import { type DomainFailure, domainFailure } from '../issues/failure';

export type AggregateNotFoundFailure = {
  readonly id?: UniqueIdentifier | undefined;
  readonly _tag: 'AggregateNotFoundFailure';
  readonly cause: unknown;
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const AggregateNotFoundFailure =
  (name: string, id?: UniqueIdentifier) =>
    (cause: unknown): AggregateNotFoundFailure =>
      domainFailure({
        _tag: 'AggregateNotFoundFailure',
        cause,
        name,
        id,
      });

export type AggregateAlreadyExistsFailure = {
  readonly _tag: 'AggregateAlreadyExistsFailure';
  readonly id?: UniqueIdentifier | undefined;
  readonly cause: unknown;
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const AggregateAlreadyExistsFailure =
  (name: string, id?: UniqueIdentifier) =>
    (cause: unknown): AggregateAlreadyExistsFailure =>
      domainFailure({
        _tag: 'AggregateAlreadyExistsFailure',
        cause,
        name,
        id,
      });

/**
 * Failure representing a concurrency violation on an aggregate.
 *
 * This occurs when two or more processes attempt to modify the same aggregate
 * simultaneously, violating optimistic locking rules.
 */
export type AggregateConcurrencyFailure = {
  readonly _tag: 'AggregateConcurrencyFailure';
  readonly id?: UniqueIdentifier | undefined;
  readonly cause: DomainFailure;
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const AggregateConcurrencyFailure =
  (name: string, id?: UniqueIdentifier) =>
    (cause: DomainFailure): AggregateConcurrencyFailure =>
      domainFailure({
        _tag: 'AggregateConcurrencyFailure',
        cause,
        name,
        id,
      });

export type AggregateSpecificationFailure = {
  readonly specification?: Specification<unknown> | undefined;
  readonly _tag: 'AggregateSpecificationFailure';
  readonly cause: unknown;
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const AggregateSpecificationFailure =
  (name: string, specification?: Specification<unknown>) =>
    (cause: unknown): AggregateSpecificationFailure =>
      domainFailure({
        _tag: 'AggregateSpecificationFailure',
        specification,
        cause,
        name,
      });

export type AggregatePersistenceFailure = {
  readonly _tag: 'AggregatePersistenceFailure';
  readonly cause: unknown;
  readonly name: string;
} & DomainFailure;

// eslint-disable-next-line sonarjs/no-redeclare
export const AggregatePersistenceFailure =
  (name: string) =>
    (cause: unknown): AggregatePersistenceFailure =>
      domainFailure({
        _tag: 'AggregatePersistenceFailure',
        cause,
        name,
      });

export type PersistenceFailures =
  | AggregateAlreadyExistsFailure
  | AggregateSpecificationFailure
  | AggregateConcurrencyFailure
  | AggregatePersistenceFailure
  | AggregateNotFoundFailure;
