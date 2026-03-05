import type { DatabaseTransaction } from 'server/database/database';

/* eslint-disable sonarjs/no-nested-functions */
import {
  AggregateSpecificationFailure,
  AggregateAlreadyExistsFailure,
  AggregateConcurrencyFailure,
  AggregateNotFoundFailure,
} from 'server/library/ddd/domain/repository/repository-errors';
import { TransactionalDatabaseProvider } from 'server/library/ddd/domain/repository/repository-provider';
import {
  UniqueIdentifier,
  Specification,
  Task,
} from 'server/library/ddd/primitives';
import { guardEmptyArray } from 'server/library/ddd/domain/invariants/array/empty-array';
import { AggregateTracker } from 'server/database/orm/unit-of-work/aggregate-tracker';

import { StoryRepository } from './story-repository';
import { Story } from './story';

describe('story repository', () => {
  const storyFirst = {
    authorId: UniqueIdentifier.create().value.toString(),
    title: 'Title number one',
    body: 'Body number one',
  };

  const storySecond = {
    authorId: UniqueIdentifier.create().value.toString(),
    body: 'Body number two and too long',
    title: 'Title number two',
  };

  const tracker = new AggregateTracker();

  const createEnvironment = (transaction: DatabaseTransaction) => ({
    provider: new TransactionalDatabaseProvider(transaction),
    tracker,
  });

  describe('.getBySpecification()', () => {
    class IsShortSpecification extends Specification<Story<'persisted'>> {
      isSatisfiedBy(candidate: Story<'persisted'>): boolean {
        return candidate.body.body.length < 20;
      }
    }

    it('should return all stories from @database matching specification', async ({
      database,
    }) => {
      await database.transaction(async transaction => {
        const repository = StoryRepository.new(createEnvironment(transaction));

        const specification = new IsShortSpecification();

        await Task.all([
          Story.create(storyFirst)
            .toTask()
            .flatMap(story => repository.create(story)),
          Story.create(storySecond)
            .toTask()
            .flatMap(story => repository.create(story)),
        ]).run();

        const result = await repository.getBySpecification(specification).run();

        expect(result.isSuccess()).toBe(true);
        expect(result.value.length).toBe(1);
        expect(result.value.at(0)?.body).toBe(storySecond.body);

        transaction.rollback();
      });
    });

    it('should return AggregateSpecificationFailure from @database if no entities match specification', async ({
      database,
    }) => {
      await database.transaction(async transaction => {
        const repository = StoryRepository.new(createEnvironment(transaction));

        const specification = new IsShortSpecification();

        await Task.all([
          Story.create(storySecond)
            .toTask()
            .flatMap(story => repository.create(story)),
        ]).run();

        const result = await repository.getBySpecification(specification).run();

        expect(result.isFailure()).toBe(true);
        expect(result.error._tag).toBe(AggregateSpecificationFailure);

        transaction.rollback();
      });
    });
  });

  describe('.getById()', () => {
    it('should return a story by its id from @database', async ({
      database,
    }) => {
      await database.transaction(async transaction => {
        const repository = StoryRepository.new(createEnvironment(transaction));

        const story = Story.create(storyFirst);

        await story
          .toTask()
          .flatMap(story => repository.create(story))
          .run();

        const result = await story
          .toTask()
          .flatMap(story => repository.getById(story.id))
          .run();

        expect(result.isSuccess()).toBe(true);
        expect(result.value.id).toBe(story.value.id);

        transaction.rollback();
      });
    });

    it('should fail when story does not exist in @database', async ({
      database,
    }) => {
      await database.transaction(async transaction => {
        const repository = StoryRepository.new(createEnvironment(transaction));

        const result = await Story.create(storyFirst)
          .toTask()
          .flatMap(story => repository.getById(story.id))
          .run();

        expect(result.isFailure()).toBe(true);
        expect(result.error._tag).toBe(AggregateNotFoundFailure);

        transaction.rollback();
      });
    });
  });

  describe('.delete()', () => {
    it('should delete an existing story in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = StoryRepository.new(createEnvironment(transaction));

        const story = Story.create(storyFirst);

        await story
          .toTask()
          .flatMap(story => repository.create(story))
          .run();

        const first = await repository
          .getAll()
          .refine(guardEmptyArray('test'))
          .map(ss => ss[0])
          .flatMap(s => repository.delete(s))
          .run();

        const isEmpty = await repository.getAll().run();

        expect(first.isSuccess()).toBeTruthy();
        expect(isEmpty.isFailure()).toBeTruthy();
        expect(isEmpty.error._tag).toBe(AggregateNotFoundFailure);

        transaction.rollback();
      });
    });

    it('should fail when story does not exist in @database', async ({
      database,
    }) => {
      await database.transaction(async transaction => {
        const repository = StoryRepository.new(createEnvironment(transaction));

        const story = Story.create(storyFirst);

        await story
          .toTask()
          .flatMap(story => repository.create(story))
          .run();

        const first = repository
          .getAll()
          .refine(guardEmptyArray('test'))
          .map(ss => ss[0]);

        await first.flatMap(story => repository.delete(story)).run();

        const result = await first
          .flatMap(story => repository.delete(story))
          .run();

        expect(result.isFailure()).toBeTruthy();
        expect(result.error).toBeInstanceOf(AggregateNotFoundFailure);

        transaction.rollback();
      });
    });
  });

  describe('.getAll()', () => {
    it('should return all stories from @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = StoryRepository.new(createEnvironment(transaction));

        const result = await Task.all([
          Story.create(storyFirst)
            .toTask()
            .flatMap(story => repository.create(story)),
          Story.create(storySecond)
            .toTask()
            .flatMap(story => repository.create(story)),
        ])
          .flatMap(() => repository.getAll())
          .run();

        expect(result.isSuccess()).toBe(true);
        expect(result.value).toHaveLength(2);

        transaction.rollback();
      });
    });

    it('should fail when no stories exists in @database', async ({
      database,
    }) => {
      await database.transaction(async transaction => {
        const repository = StoryRepository.new(createEnvironment(transaction));

        const result = await repository.getAll().run();

        expect(result.isFailure()).toBe(true);
        expect(result.error).toBeInstanceOf(AggregateNotFoundFailure);

        transaction.rollback();
      });
    });
  });

  describe('.create()', () => {
    it('should create a new story in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = StoryRepository.new(createEnvironment(transaction));

        const result = await Story.create(storyFirst)
          .toTask()
          .flatMap(story => repository.create(story))
          .run();

        expect(result.isSuccess()).toBe(true);

        transaction.rollback();
      });
    });

    it('should fail when the story already exists in @database', async ({
      database,
    }) => {
      await database.transaction(async transaction => {
        const repository = StoryRepository.new(createEnvironment(transaction));

        const resultFirst = await Story.create(storyFirst)
          .toTask()
          .flatMap(story => repository.create(story))
          .run();

        expect(resultFirst.isSuccess()).toBe(true);

        const resultSecond = await Story.create(storyFirst)
          .toTask()
          .flatMap(story => repository.create(story))
          .run();

        expect(resultSecond.isFailure()).toBe(true);
        expect(resultSecond.error._tag).toBe(AggregateAlreadyExistsFailure);

        transaction.rollback();
      });
    });
  });

  describe('.updateWithLock()', () => {
    it('should update an existing story in @database', async ({ database }) => {
      await database.transaction(async transaction => {
        const repository = StoryRepository.new(createEnvironment(transaction));

        const story = Story.create(storyFirst);

        await story
          .toTask()
          .flatMap(story => repository.create(story))
          .run();

        const first = repository
          .getAll()
          .refine(guardEmptyArray('test'))
          .map(ss => ss[0]);

        await first
          .flatMap(s => s.updateTitle('Brand new updated title').toTask())
          .flatMap(s => repository.updateWithLock(s))
          .run();

        const updatedFirst = await first.run();

        expect(updatedFirst.isSuccess()).toBeTruthy();
        expect(updatedFirst.value.title.title).toBe('Brand new updated title');

        transaction.rollback();
      });
    });

    it('should fail when story does not exist in @database', async ({
      database,
    }) => {
      await database.transaction(async transaction => {
        const repository = StoryRepository.new(createEnvironment(transaction));

        const story = Story.create(storyFirst);

        await story
          .toTask()
          .flatMap(story => repository.create(story))
          .run();

        const first = repository
          .getAll()
          .refine(guardEmptyArray('test'))
          .map(ss => ss[0]);

        await first.flatMap(story => repository.delete(story)).run();

        const result = await first
          .flatMap(s => s.updateTitle('Brand new updated title').toTask())
          .flatMap(s => repository.updateWithLock(s))
          .run();

        expect(result.isFailure()).toBeTruthy();
        expect(result.error).toBeInstanceOf(AggregateNotFoundFailure);

        transaction.rollback();
      });
    });

    it('should fail when story is already concurrently updated in @database', async ({
      database,
    }) => {
      await database.transaction(async transaction => {
        const repository = StoryRepository.new(createEnvironment(transaction));

        const story = Story.create(storyFirst);

        await story
          .toTask()
          .flatMap(story => repository.create(story))
          .run();

        const first = repository
          .getAll()
          .refine(guardEmptyArray('test'))
          .map(ss => ss[0]);

        const result = await first
          .flatMap(s => s.updateTitle('Brand new updated title').toTask())
          .flatMap(s => s.updateTitle('Brand new updated title').toTask())
          .flatMap(s => repository.updateWithLock(s))
          .run();

        expect(result.isFailure()).toBeTruthy();
        expect(result.error).toBeInstanceOf(AggregateConcurrencyFailure);

        transaction.rollback();
      });
    });
  });
});
