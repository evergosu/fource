import type { StorySelectSchema } from 'server/database/schema/story';
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

import { StoryQueryRepository } from './story-query-repository';
import { StoryRepository } from './story-repository';
import { StoryRehydrator } from './story-rehydrator';
import { StoryDatabase } from './story-database';
import { Story } from '../domain/story';

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
    class IsShortSpecification extends Specification<StorySelectSchema> {
      isSatisfiedBy(candidate: StorySelectSchema): boolean {
        return candidate.body.length < 20;
      }
    }

    it('should return all stories from @database matching specification', async ({
      database,
    }) => {
      await database.transaction(async transaction => {
        const commandRepository = StoryRepository.new(
          createEnvironment(transaction),
        );

        const queryRepository = new StoryQueryRepository(
          new TransactionalDatabaseProvider(transaction).get(StoryDatabase),
        );

        const specification = new IsShortSpecification();

        await Task.sequence([
          Story.create(storyFirst)
            .toTask()
            .flatMap(story => commandRepository.create(story)),
          Story.create(storySecond)
            .toTask()
            .flatMap(story => commandRepository.create(story)),
        ]).run();

        const result = await queryRepository
          .getBySpecification(specification)
          .run();

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
        const commandRepository = StoryRepository.new(
          createEnvironment(transaction),
        );

        const queryRepository = new StoryQueryRepository(
          new TransactionalDatabaseProvider(transaction).get(StoryDatabase),
        );

        const specification = new IsShortSpecification();

        await Task.sequence([
          Story.create(storySecond)
            .toTask()
            .flatMap(story => commandRepository.create(story)),
        ]).run();

        const result = await queryRepository
          .getBySpecification(specification)
          .run();

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
        const commandRepository = StoryRepository.new(
          createEnvironment(transaction),
        );

        const queryRepository = new StoryQueryRepository(
          new TransactionalDatabaseProvider(transaction).get(StoryDatabase),
        );

        const story = Story.create(storyFirst);

        await story
          .toTask()
          .flatMap(story => commandRepository.create(story))
          .run();

        const first = await queryRepository
          .getAll()
          .refine(guardEmptyArray('test'))
          .map(ss => ss[0])
          .flatMap(s => StoryRehydrator.rehydrate(s).toTask())
          .flatMap(s => commandRepository.delete(s))
          .run();

        const isEmpty = await queryRepository.getAll().run();

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
        const commandRepository = StoryRepository.new(
          createEnvironment(transaction),
        );

        const queryRepository = new StoryQueryRepository(
          new TransactionalDatabaseProvider(transaction).get(StoryDatabase),
        );

        const story = Story.create(storyFirst);

        await story
          .toTask()
          .flatMap(story => commandRepository.create(story))
          .run();

        const first = queryRepository
          .getAll()
          .refine(guardEmptyArray('test'))
          .map(ss => ss[0]);

        await first

          .flatMap(s => StoryRehydrator.rehydrate(s).toTask())
          .flatMap(story => commandRepository.delete(story))
          .run();

        const result = await first
          .flatMap(s => StoryRehydrator.rehydrate(s).toTask())
          .flatMap(story => commandRepository.delete(story))
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
        const commandRepository = StoryRepository.new(
          createEnvironment(transaction),
        );

        const queryRepository = new StoryQueryRepository(
          new TransactionalDatabaseProvider(transaction).get(StoryDatabase),
        );

        const result = await Task.sequence([
          Story.create(storyFirst)
            .toTask()
            .flatMap(story => commandRepository.create(story)),
          Story.create(storySecond)
            .toTask()
            .flatMap(story => commandRepository.create(story)),
        ])
          .flatMap(() => queryRepository.getAll())
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
        const queryRepository = new StoryQueryRepository(
          new TransactionalDatabaseProvider(transaction).get(StoryDatabase),
        );

        const result = await queryRepository.getAll().run();

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
        const commandRepository = StoryRepository.new(
          createEnvironment(transaction),
        );

        const queryRepository = new StoryQueryRepository(
          new TransactionalDatabaseProvider(transaction).get(StoryDatabase),
        );

        const story = Story.create(storyFirst);

        await story
          .toTask()
          .flatMap(story => commandRepository.create(story))
          .run();

        const first = queryRepository
          .getAll()
          .refine(guardEmptyArray('test'))
          .map(ss => ss[0]);

        await first
          .flatMap(s => StoryRehydrator.rehydrate(s).toTask())
          .flatMap(s => s.updateTitle('Brand new updated title').toTask())
          .flatMap(s => commandRepository.updateWithLock(s))
          .run();

        const updatedFirst = await first.run();

        expect(updatedFirst.isSuccess()).toBeTruthy();
        expect(updatedFirst.value.title).toBe('Brand new updated title');

        transaction.rollback();
      });
    });

    it('should fail when story does not exist in @database', async ({
      database,
    }) => {
      await database.transaction(async transaction => {
        const commandRepository = StoryRepository.new(
          createEnvironment(transaction),
        );

        const queryRepository = new StoryQueryRepository(
          new TransactionalDatabaseProvider(transaction).get(StoryDatabase),
        );

        const story = Story.create(storyFirst);

        await story
          .toTask()
          .flatMap(story => commandRepository.create(story))
          .run();

        const first = queryRepository
          .getAll()
          .refine(guardEmptyArray('test'))
          .map(ss => ss[0]);

        await first
          .flatMap(s => StoryRehydrator.rehydrate(s).toTask())
          .flatMap(story => commandRepository.delete(story))
          .run();

        const result = await first
          .flatMap(s => StoryRehydrator.rehydrate(s).toTask())
          .flatMap(s => s.updateTitle('Brand new updated title').toTask())
          .flatMap(s => commandRepository.updateWithLock(s))
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
        const commandRepository = StoryRepository.new(
          createEnvironment(transaction),
        );

        const queryRepository = new StoryQueryRepository(
          new TransactionalDatabaseProvider(transaction).get(StoryDatabase),
        );

        const story = Story.create(storyFirst);

        await story
          .toTask()
          .flatMap(story => commandRepository.create(story))
          .run();

        const first = queryRepository
          .getAll()
          .refine(guardEmptyArray('test'))
          .map(ss => ss[0]);

        const result = await first
          .flatMap(s => StoryRehydrator.rehydrate(s).toTask())
          .flatMap(s => s.updateTitle('Brand new updated title').toTask())
          .flatMap(s => s.updateTitle('Brand new updated title').toTask())
          .flatMap(s => commandRepository.updateWithLock(s))
          .run();

        expect(result.isFailure()).toBeTruthy();
        expect(result.error).toBeInstanceOf(AggregateConcurrencyFailure);

        transaction.rollback();
      });
    });
  });
});
