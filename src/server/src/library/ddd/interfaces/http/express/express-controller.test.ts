import express, {
  type Response,
  type Request,
  type Express,
  Router,
} from 'express';
import { asyncHandler } from 'server/router/async-handler';
import request from 'supertest';

import {
  useCaseSucceeded,
  useCaseFailed,
  type TestDTO,
  message,
  testDTO,
  mapper,
} from '../controller.mock';
import { ExpressController } from './express-controller';
import { Result } from '../../../types/result';

class SuccessController extends ExpressController<
  typeof useCaseSucceeded,
  typeof mapper
> {
  protected async implement(request: Request): Promise<Result<TestDTO>> {
    return this.mapper
      .toDomain(request.body)
      .flatMapAsync(r => this.useCase.execute(r))
      .then(r => r.flatMap(d => this.mapper.toDTO(d)));
  }
}

class ErrorController extends ExpressController<
  typeof useCaseFailed,
  typeof mapper
> {
  protected implement(request: Request): Promise<Result<unknown>> {
    throw new Error(message, { cause: request.body });
  }
}

describe('controller', () => {
  let successController: SuccessController;
  let errorController: ErrorController;
  let application: Express;

  beforeEach(() => {
    vi.clearAllMocks();

    successController = new SuccessController(useCaseSucceeded, mapper);
    errorController = new ErrorController(useCaseFailed, mapper);

    const router = Router();

    router.get(
      '/success',
      asyncHandler(async (request: Request, response: Response) => {
        await successController.execute(request, response);
      }),
    );

    router.get(
      '/error',
      asyncHandler(async (request: Request, response: Response) => {
        await errorController.execute(request, response);
      }),
    );

    application = express();

    application.use(express.json());
    application.use(router);
  });

  describe('.execute()', () => {
    it('should send result on success with 200 status code', async () => {
      const response = await request(application).get('/success');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(testDTO);
    });

    it('should send message on unexpected error with 500 status code', async () => {
      const response = await request(application).get('/error');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ message });
    });
  });
});
