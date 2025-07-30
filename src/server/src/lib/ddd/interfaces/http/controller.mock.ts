/* eslint-disable jsdoc/require-jsdoc */

import { UseCase } from '../../application/use-case/use-case';
import { Mapper } from '../../infrastructure/mapper/mapper';
import { DomainError } from '../../domain/domain-error';
import { Entity } from '../../domain/entity';
import { Result } from '../../types/result';

export const message = 'Test error occurred';

export class TestError extends DomainError {
  constructor() {
    super(message);
  }
}

export interface TestDTO {
  foo: string;
}

export const testDTO = { foo: 'bar' };

export class Test extends Entity<TestDTO> {}

export const test = new Test(testDTO);

export const useCaseSucceeded = {
  execute: vi.fn().mockResolvedValue(Result.ok(test)),
} as unknown as UseCase<Test, Test>;

export const useCaseFailed = {
  execute: vi.fn().mockResolvedValue(Result.fail(new TestError())),
} as unknown as UseCase<Test, Test>;

export const mapper = {
  toDomain: vi.fn().mockReturnValue(Result.ok(test)),
  toDTO: vi.fn().mockReturnValue(Result.ok(testDTO)),
} as unknown as Mapper<Test, TestDTO>;
