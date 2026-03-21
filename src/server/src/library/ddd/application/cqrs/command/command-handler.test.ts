import type { Failure } from 'server/library/ddd/domain/issues/failure';

import { Task } from 'server/library/ddd/primitives';

import type { CommandHandler } from './command-handler';
import type { Command } from './command';

describe('command handler', () => {
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

  it('should handle command', async () => {
    const handler = new TestCommandHandler();

    const result = await handler.handle({ id: 'foo' }).run();

    expect(result.isSuccess()).toBe(true);
  });
});
