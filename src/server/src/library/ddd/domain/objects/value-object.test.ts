import { ValueObject } from './value-object';

class Address extends ValueObject<{
  coordinates: { lat: number; lng: number };
  street: string;
  city: string;
}> {
  get coordinates(): { lat: number; lng: number } {
    return this.properties.coordinates;
  }

  get street(): string {
    return this.properties.street;
  }

  get city(): string {
    return this.properties.city;
  }

  set city(city) {
    this.properties.city = city;
  }
}

describe('value object', () => {
  const gotham = new Address({
    coordinates: { lat: 39.15, lng: 75.07 },
    street: 'Crime Alley',
    city: 'Gotham',
  });

  it('should deeply freeze properties', () => {
    expect(() => {
      gotham.city = 'Metropolis';
    }).toThrow();

    expect(() => {
      gotham.coordinates.lat = 42;
    }).toThrow();
  });

  it('should allow subclass-specific value object logic if needed', () => {
    class Email extends ValueObject<{ value: string }> {
      private constructor(properties: { value: string }) {
        super(properties);
      }

      static create(value: string) {
        if (!value.includes('@')) {
          throw new Error('Invalid email');
        }

        return new Email({ value });
      }

      get value(): string {
        return this.properties.value;
      }
    }

    const emailOne = Email.create('one@example.com');
    const emailTwo = Email.create('one@example.com');
    const emailThree = Email.create('two@example.com');

    expect(emailOne.equals(emailTwo)).toBe(true);
    expect(emailOne.equals(emailThree)).toBe(false);
  });

  describe('.equals()', () => {
    it('should return false if compared to undefined or null', () => {
      expect(gotham.equals()).toBe(false);
      // eslint-disable-next-line unicorn/no-null
      expect(gotham.equals(null as unknown as typeof gotham)).toBe(false);
    });

    it('should return true if compared to the same instance', () => {
      expect(gotham.equals(gotham)).toBe(true);
    });

    it('should return false when compared with non-value object', () => {
      expect(gotham.equals({} as unknown as undefined)).toBe(false);
    });

    it('should consider two instances with same properties as equal', () => {
      const newYork = new Address({
        coordinates: { lat: 39.15, lng: 75.07 },
        street: 'Crime Alley',
        city: 'Gotham',
      });

      expect(gotham.equals(newYork)).toBe(true);
    });

    it('should consider two instances with different properties as not equal', () => {
      const metropolis = new Address({
        coordinates: { lng: 75.22, lat: 39 },
        street: 'Fifth Avenue',
        city: 'Metropolis',
      });

      expect(gotham.equals(metropolis)).toBe(false);
    });
  });

  describe('.isValueObject()', () => {
    it('should correctly identify a ValueObject instance using static type guard', () => {
      expect(ValueObject.isValueObject(gotham)).toBe(true);
      expect(ValueObject.isValueObject({})).toBe(false);
      // eslint-disable-next-line unicorn/no-null
      expect(ValueObject.isValueObject(null)).toBe(false);
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(ValueObject.isValueObject(undefined)).toBe(false);
    });
  });
});
