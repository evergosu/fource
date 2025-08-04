import { UseCaseExecutionException } from './use-case-errors';
import { ApplicationFailure } from '../application-error';
import { Result } from '../../types/result';
import { UseCase } from './use-case';

class TestFailure extends ApplicationFailure {}

class MultiplyByTwoUseCase extends UseCase<{ number: number }, number> {
  async implement(input: {
    number: number;
  }): Promise<Result<number, TestFailure>> {
    await Promise.resolve();

    if (input.number < 0) {
      return Result.fail(new TestFailure('Negative number not allowed'));
    }

    return Result.ok(input.number * 2);
  }
}

class ErrorUseCase extends UseCase<unknown, unknown> {
  async implement(): Promise<Result<number>> {
    await Promise.resolve();

    throw new Error('foo');
  }
}

class CrashedUseCase extends UseCase<unknown, unknown> {
  async implement(): Promise<Result<number>> {
    await Promise.resolve();

    // eslint-disable-next-line sonarjs/no-throw-literal, @typescript-eslint/only-throw-error
    throw 'foo';
  }
}

describe('use case', () => {
  it('should succeed with valid input', async () => {
    const useCase = new MultiplyByTwoUseCase();

    const result = await useCase.execute({ number: 3 });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(6);
  });

  it('should fail with invalid input', async () => {
    const useCase = new MultiplyByTwoUseCase();

    const result = await useCase.execute({ number: -5 });

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(TestFailure);
  });

  it('should gacefully fail on unexpected error', async () => {
    const useCase = new ErrorUseCase();

    await expect(useCase.execute({})).resolves.not.toThrow();

    const result = await useCase.execute({});

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UseCaseExecutionException);
  });

  it('should gacefully fail on unexpected throw', async () => {
    const useCase = new CrashedUseCase();

    await expect(useCase.execute({})).resolves.not.toThrow();

    const result = await useCase.execute({});

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UseCaseExecutionException);
  });
});
