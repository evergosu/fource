import { UseCaseExecutionError } from './use-case-errors';
import { ApplicationError } from '../application-error';
import { Result } from '../../types/result';
import { UseCase } from './use-case';

class TestError extends ApplicationError {}

class MultiplyByTwoUseCase extends UseCase<{ number: number }, number> {
  async implement(input: { number: number }): Promise<Result<number>> {
    await Promise.resolve();

    if (input.number < 0) {
      return Result.fail(new TestError('Negative number not allowed'));
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
    expect(result.error).toBeInstanceOf(TestError);
  });

  it('should gacefully fail on unexpected error', async () => {
    const useCase = new ErrorUseCase();

    await expect(useCase.execute({})).resolves.not.toThrow();

    const result = await useCase.execute({});

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error).toStrictEqual(new Error('foo'));
  });

  it('should gacefully fail on unexpected throw', async () => {
    const useCase = new CrashedUseCase();

    await expect(useCase.execute({})).resolves.not.toThrow();

    const result = await useCase.execute({});

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UseCaseExecutionError);
    expect((result.error as UseCaseExecutionError).message).toBe(
      'Unknown error during CrashedUseCase execution',
    );
    expect((result.error as UseCaseExecutionError).name).toBe(
      'UseCaseExecutionApplicationError',
    );
  });
});
