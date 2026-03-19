import type { Failure } from 'server/library/ddd/domain/issues/failure';

import { Task } from 'server/library/ddd/primitives';

import type { CommandHandler } from './command-handler';
import type { Command } from './command';

import { InMemoryCommandBus } from './command-bus';

const testFailure: Failure = {
  _tag: 'TestFailure',
};

type TestFailure = typeof testFailure;

class TestCommand implements Command<void, TestFailure> {
  // eslint-disable-next-line prettier/prettier
  constructor(public readonly id: string) { }
}

class TestCommandHandler implements CommandHandler<TestCommand, void, TestFailure> {
  handle(command: TestCommand): Task<void, TestFailure> {
    return command.id ? Task.ok() : Task.fail(testFailure);
  }
}

describe('middleware pipeline', () => {
  it('executes middleware before handler', async () => {
    const bus = new InMemoryCommandBus();

    const middleware = {
      execute: vi.fn((_, next: () => Task<unknown, unknown>) => {
        next();
      }),
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    bus.use(middleware as any);

    bus.register(TestCommand, new TestCommandHandler());

    await bus.dispatch(new TestCommand('a')).run();

    expect(middleware.execute).toHaveBeenCalledTimes(1);
  });
});
