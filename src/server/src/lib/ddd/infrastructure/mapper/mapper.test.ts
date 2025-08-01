import type { InfrastructureFailure } from '../infrastructure-error';
import type { DomainFailure } from '../../domain/domain-error';

import { UniqueIdentifier } from '../../domain/identifiers/unique-identifier';
import { InvalidDataTransferObjectFailure } from './mapper-errors';
import { Entity } from '../../domain/entity';
import { Result } from '../../types/result';
import { Mapper } from './mapper';

interface TestDTO {
  string: string;
  number: number;
}

class Test extends Entity<TestDTO> {}

class TestMapper extends Mapper<Test, TestDTO> {
  toDomain(raw: TestDTO): Result<Test, InfrastructureFailure | DomainFailure> {
    if (raw.number === 69) {
      return Result.fail(
        new InvalidDataTransferObjectFailure(this.constructor.name),
      );
    }

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

  const dtoWithErrors: TestDTO = { string: 'bar', number: 69 };

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

  const dtosWithErrors = [dtoOne, dtoWithErrors, dtoTwo];

  it('should map domain to DTO', () => {
    const result = mapper.toDTO(domainOne);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(dtoOne);
  });

  it('should map domain list to DTO list', () => {
    const result = mapper.toDTOList(domains);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(dtos);
  });

  describe('.toDomain()', () => {
    it('should map correct DTO to domain', () => {
      const result = mapper.toDomain(dtoOne);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(domainOne);
    });

    it('should handle error states during DTO mapping to domain', () => {
      const result = mapper.toDomain(dtoWithErrors);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidDataTransferObjectFailure);
      expect(result.error.message).toContain('TestMapper');
    });
  });

  describe('.toDomainList()', () => {
    it('should map DTO list to domain list', () => {
      const result = mapper.toDomainList(dtos);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(domains);
    });

    it('should handle error states during list of DTOs mapping to domain list', () => {
      const result = mapper.toDomainList(dtosWithErrors);

      expect(result.isFailure).toBe(true);
      expect(result.error).toEqual(
        expect.arrayContaining([expect.any(InvalidDataTransferObjectFailure)]),
      );
      expect(result.error.at(0)?.message).toContain('TestMapper');
    });
  });
});
