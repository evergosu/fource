/* eslint-disable prettier/prettier */
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
  constructor(public readonly id: string) { }
}

class TestCommandHandler
  implements CommandHandler<TestCommand, void, TestFailure> {
  handle(command: TestCommand): Task<void, TestFailure> {
    return command.id ? Task.ok() : Task.fail(testFailure);
  }
}

describe('command bus', () => {
  it('should dispatch command to correct handler', async () => {
    const bus = new InMemoryCommandBus();

    bus.register(TestCommand, new TestCommandHandler());

    const result = await bus.dispatch(new TestCommand('a')).run();

    expect(result.isSuccess()).toBe(true);
  });
});
