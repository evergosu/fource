import { InfrastructureFailure } from '../infrastructure-error';

/**
 * Failure representing an invalid state during
 * data transfer object convertation.
 */
export class InvalidDataTransferObjectFailure extends InfrastructureFailure {
  /**
   * Creates infrastructure failure with optional identifier of the aggregate.
   * @param mapperName - The identifier of the aggregate root.
   */
  constructor(public readonly mapperName?: string) {
    super(
      mapperName
        ? `An invalid data transfer object has been passed to the ${mapperName}`
        : `An invalid data transfer object has been used`,
    );
  }
}
