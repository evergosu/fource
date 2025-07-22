import { DomainError } from './domain-error';
import { Controller } from './controller';
import { UseCase } from './use-case';
import { Either } from './either';
import { Option } from './option';
import { Result } from './result';

const message = 'Test error occurred';

class TestError extends DomainError {
  constructor() {
    super(message);
  }
}

type Request = Record<'body', unknown>;

interface Response {
  status: (code: number) => Response;
  json: (payload: unknown) => void;
}

class SuccessController extends Controller {
  protected send(response: Response, status: number, payload: unknown): void {
    response.status(status).json(payload);
  }

  protected implement(request: Request): Promise<Result<unknown>> {
    return this.useCase.execute(request.body);
  }
}

class ErrorController extends Controller {
  protected implement(request: Request): Promise<Result<unknown>> {
    throw new Error(message, { cause: request.body });
  }

  protected send(response: Response, status: number, payload: unknown): void {
    response.status(status).json(payload);
  }
}

const payload = { foo: 'bar' };

const request = { body: payload } as Request;

const response = {
  status: vi.fn().mockReturnThis(),
  json: vi.fn(),
};

const useCaseSucceeded = {
  execute: vi.fn().mockResolvedValue(Result.ok(payload)),
} as unknown as UseCase;

const useCaseFailed = {
  execute: vi.fn().mockResolvedValue(Result.fail(new TestError())),
} as unknown as UseCase;

describe('controller', () => {
  let controller: SuccessController | ErrorController;

  beforeEach(() => {
    vi.clearAllMocks();

    controller = new SuccessController(useCaseSucceeded);
  });

  describe('.execute()', () => {
    it('should call use case with provided payload', async () => {
      const controller = new SuccessController(useCaseSucceeded);

      await expect(
        controller.execute(request, response),
      ).resolves.not.toThrow();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(useCaseSucceeded.execute).toHaveBeenCalledWith(payload);
    });

    it('should send result on success with 200 status code', async () => {
      await expect(
        controller.execute(request, response),
      ).resolves.not.toThrow();

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith(payload);
    });

    it('should send message on expected error with 400 status code', async () => {
      controller = new SuccessController(useCaseFailed);

      await expect(
        controller.execute(request, response),
      ).resolves.not.toThrow();

      expect(response.status).toHaveBeenCalledWith(400);
      expect(response.json).toHaveBeenCalledWith({ message });
    });

    it('should send message on unexpected error with 500 status code', async () => {
      controller = new ErrorController(useCaseSucceeded);

      await expect(
        controller.execute(request, response),
      ).resolves.not.toThrow();

      expect(response.status).toHaveBeenCalledWith(500);
      expect(response.json).toHaveBeenCalledWith({ message });
    });
  });

  describe('.handleError()', () => {
    it('should handle string errors', () => {
      const response = controller['handleError']('string error');

      expect(response).toEqual([400, { message: 'string error' }]);
    });

    it('should handle domain errors', () => {
      const response = controller['handleError'](new TestError());

      expect(response).toEqual([400, { message }]);
    });
  });

  describe('.handleResult()', () => {
    it('should return 200 and value on success', () => {
      const value = 'foo';

      const result = Result.ok(value);

      const response = controller['handleResult'](result);

      expect(response).toEqual([200, value]);
    });

    it('should return custom status code on success', () => {
      const value = 'foo';

      const status = 201;

      const result = Result.ok(value);

      const response = controller['handleResult'](result, status);

      expect(response).toEqual([status, value]);
    });

    it('should return 400 and error message on failure', () => {
      const result = Result.fail(new TestError());

      const response = controller['handleResult'](result);

      expect(response).toEqual([400, { message }]);
    });
  });

  describe('.handleEither()', () => {
    it('should return 200 and value on right', () => {
      const value = 'foo';

      const either = Either.right(value);

      const response = controller['handleEither'](either);

      expect(response).toEqual([200, value]);
    });

    it('should return custom status code on right', () => {
      const value = 'foo';

      const status = 202;

      const either = Either.right(value);

      const response = controller['handleEither'](either, status);

      expect(response).toEqual([status, value]);
    });

    it('should return 400 and error message on left', () => {
      const value = 'foo';

      const either = Either.left(value);

      const response = controller['handleEither'](either);

      expect(response).toEqual([400, { message: value }]);
    });

    it('should return 400 and domain error on left', () => {
      const either = Either.left(new TestError());

      const response = controller['handleEither'](either);

      expect(response).toEqual([400, { message }]);
    });
  });

  describe('.handleOption()', () => {
    it('should return 200 and value on some', () => {
      const value = 'foo';

      // eslint-disable-next-line unicorn/no-array-callback-reference
      const option = Option.some(value);

      const response = controller['handleOption'](option);

      expect(response).toEqual([200, value]);
    });

    it('should return custom status on some', () => {
      const value = 'foo';

      const status = 204;

      // eslint-disable-next-line unicorn/no-array-callback-reference
      const option = Option.some(value);

      const response = controller['handleOption'](option, status);

      expect(response).toEqual([status, value]);
    });

    it('should return 404 on none', () => {
      const option = Option.none();

      const response = controller['handleOption'](option);

      expect(response).toEqual([404, { message: 'Not found' }]);
    });
  });
});
