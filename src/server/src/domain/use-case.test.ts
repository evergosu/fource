import { UseCase } from './use-case';
import { Result } from './result';

class MultiplyByTwoUseCase extends UseCase<number> {
  async execute(input: { number: number }): Promise<Result<number>> {
    await Promise.resolve();

    if (input.number < 0) {
      return Result.fail('Negative number not allowed');
    }

    return Result.ok(input.number * 2);
  }
}

describe('use case', () => {
  it('should succeed with valid input', async () => {
    const useCase = new MultiplyByTwoUseCase();

    const result = await useCase.execute({ number: 3 });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBe(6);
  });

  it('should fail with invalid input', async () => {
    const useCase = new MultiplyByTwoUseCase();

    const result = await useCase.execute({ number: -5 });

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBe('Negative number not allowed');
  });
});
