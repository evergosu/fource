import { DataTypeInvariantViolationException } from './type-error';
import { Option } from './option';

describe('option', () => {
  describe('.some()', () => {
    it('should create a Some with a value', () => {
      const option = Option.some(42);

      expect(option.isSome()).toBe(true);
      expect(option.get()).toBe(42);
    });

    it('should throw if Some is passed null or undefined', () => {
      // eslint-disable-next-line unicorn/no-null
      expect(() => Option.some(null)).toThrow(
        DataTypeInvariantViolationException,
      );
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(() => Option.some(undefined)).toThrow(
        DataTypeInvariantViolationException,
      );
      // @ts-expect-error - it is fine to expect errors in tests.
      expect(() => Option.some()).toThrow(DataTypeInvariantViolationException);
    });
  });

  describe('.none()', () => {
    it('should create a None value', () => {
      const option = Option.none<number>();

      expect(option.isNone()).toBe(true);
    });
  });

  describe('.from()', () => {
    it('should create Option from value', () => {
      expect(Option.from('foo').isSome()).toBe(true);
      expect(Option.from(42).isSome()).toBe(true);
      expect(Option.from(false).isSome()).toBe(true);
      expect(Option.from([34]).isSome()).toBe(true);
      expect(Option.from({ foo: 'bar' }).isSome()).toBe(true);
    });

    it('should create Option from lack of value', () => {
      // eslint-disable-next-line unicorn/no-null
      expect(Option.from(null).isNone()).toBe(true);
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(Option.from(undefined).isNone()).toBe(true);
    });
  });

  describe('.get()', () => {
    it('should unwrap Some value without errors', () => {
      const option = Option.some(42);

      expect(() => option.get()).not.toThrow();
      expect(option.get()).toBe(42);
    });

    it('should throw if unwrap None value', () => {
      const option = Option.none<number>();

      expect(() => option.get()).toThrow(DataTypeInvariantViolationException);
    });
  });

  describe('.getOrElse()', () => {
    it('should unwrap on Some with inner value', () => {
      const option = Option.some(42);

      expect(option.getOrElse(34)).toBe(42);
    });

    it('should unwrap on None value with fallback', () => {
      const option = Option.none<number>();

      expect(option.getOrElse(42)).toBe(42);
    });
  });

  describe('.getOrElseLazy()', () => {
    it('should unwrap on Some with inner value', () => {
      const option = Option.some(42);

      expect(option.getOrElseLazy(() => 34)).toBe(42);
    });

    it('should unwrap on None value with fallback', () => {
      const option = Option.none<number>();

      expect(option.getOrElseLazy(() => 42)).toBe(42);
    });
  });

  describe('.fold()', () => {
    it('should fold on Some value', () => {
      const option = Option.some('foo');

      const result = option.fold({
        some: v => `some(${v})`,
        none: () => 'none',
      });

      expect(result).toBe('some(foo)');
    });

    it('should fold on None value', () => {
      const option = Option.none<string>();

      const result = option.fold({
        some: v => `some(${v})`,
        none: () => 'none',
      });

      expect(result).toBe('none');
    });
  });

  describe('.map()', () => {
    it('should map value if Some', () => {
      const option = Option.some(42).map(x => x - 8);

      expect(option.isSome()).toBe(true);
      expect(option.get()).toBe(34);
    });

    it('should not map value if None', () => {
      const option = Option.none<number>().map(x => x * 42);

      expect(option.isNone()).toBe(true);
    });
  });

  describe('.flatMap()', () => {
    it('should flatMap Some to another Option', () => {
      const option = Option.some('foo').flatMap(v => Option.some(v + 'bar'));

      expect(option.isSome()).toBe(true);
      expect(option.get()).toBe('foobar');
    });

    it('should flatMap None and remain None', () => {
      const option = Option.none<string>().flatMap(v => Option.some(v + 'foo'));

      expect(option.isNone()).toBe(true);
    });
  });

  describe('.toString()', () => {
    it('should serialize Some value', () => {
      const option = Option.some(42);

      expect(option.toString()).toBe('Some(42)');
    });

    it('should serialize None', () => {
      const option = Option.none();

      expect(option.toString()).toBe('None()');
    });
  });
});
