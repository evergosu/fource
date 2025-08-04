import { UniqueIdentifier } from './identifiers/unique-identifier';
import { Entity } from './entity';

describe('entity', () => {
  // A simple concrete entity for testing purposes.
  interface UserProperties {
    email: string;
    name: string;
  }

  class UserEntity extends Entity<UserProperties> {
    get email() {
      return this.properties.email;
    }

    get name() {
      return this.properties.name;
    }
  }

  const johnProperties: UserProperties = {
    email: 'john@gmail.com',
    name: 'John',
  };

  const janeProperties: UserProperties = {
    email: 'jane@gmail.com',
    name: 'Jane',
  };

  const john = new UserEntity(johnProperties);
  const jane = new UserEntity(janeProperties);

  it('should create an entity with properties and a generated ID', () => {
    expect(john.name).toBe(johnProperties.name);
    expect(john.email).toBe(johnProperties.email);
    expect(john.id).toBeInstanceOf(UniqueIdentifier);
    expect(typeof john.id.toValue()).toBe('string');
  });

  it('should be immutable after creation', () => {
    expect(Object.isFrozen(john)).toBe(true);
  });

  it('should create an entity with a provided unique identifier', () => {
    const id = UniqueIdentifier.create('foo').value;

    const user = new UserEntity(johnProperties, id);

    expect(user.id.equals(id)).toBe(true);
  });

  describe('.equals()', () => {
    it('should return false when comparing with undefined', () => {
      expect(john.equals()).toBe(false);
    });

    it('should return true when comparing entity with itself', () => {
      expect(john.equals(john)).toBe(true);
    });

    it('should return false when comparing with non-entity object', () => {
      expect(john.equals({} as unknown as undefined)).toBe(false);
    });

    it('should return true when comparing two entities with the same ID', () => {
      const id = UniqueIdentifier.create('foo').value;

      const john = new UserEntity(johnProperties, id);

      const jane = new UserEntity(janeProperties, id);

      expect(john.equals(jane)).toBe(true);
    });

    it('should return false when comparing entities with different IDs', () => {
      expect(john.equals(jane)).toBe(false);
    });
  });

  describe('.isEntity()', () => {
    it('should correctly identify an Entity instance using static type guard', () => {
      expect(Entity.isEntity(john)).toBe(true);
      expect(Entity.isEntity({})).toBe(false);
      // eslint-disable-next-line unicorn/no-null
      expect(Entity.isEntity(null)).toBe(false);
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(Entity.isEntity(undefined)).toBe(false);
    });
  });
});
