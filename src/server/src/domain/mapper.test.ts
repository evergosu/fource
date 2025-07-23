import { UniqueIdentifier } from './unique-identifier';
import { Entity } from './entity';
import { Mapper } from './mapper';
import { Result } from './result';

interface TestDTO {
  string: string;
  number: number;
}

class Test extends Entity<TestDTO> {}

class TestMapper extends Mapper<Test, TestDTO> {
  toDomain(raw: TestDTO): Result<Test> {
    return Result.ok(
      new Test(
        { number: raw.number, string: raw.string },
        UniqueIdentifier.create(raw.string),
      ),
    );
  }

  toDTO(domain: Test): Result<TestDTO> {
    return Result.ok({
      string: domain.properties.string,
      number: domain.properties.number,
    });
  }
}

describe('mapper', () => {
  const dtoOne: TestDTO = { string: 'foo', number: 42 };

  const dtoTwo: TestDTO = { string: 'bar', number: 34 };

  const mapper = new TestMapper();

  const domainOne = new Test(
    { string: 'foo', number: 42 },
    UniqueIdentifier.create(dtoOne.string),
  );

  const domainTwo = new Test(
    { string: 'bar', number: 34 },
    UniqueIdentifier.create(dtoTwo.string),
  );

  const domains = [domainOne, domainTwo];

  const dtos = [dtoOne, dtoTwo];

  it('should map domain to DTO', () => {
    const result = mapper.toDTO(domainOne);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(dtoOne);
  });

  it('should map DTO to domain', () => {
    const result = mapper.toDomain(dtoOne);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(domainOne);
  });

  it('should map domain list to DTO list', () => {
    const result = mapper.toDTOList(domains);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(dtos);
  });

  it('should map DTO list to domain list', () => {
    const result = mapper.toDomainList(dtos);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(domains);
  });
});
