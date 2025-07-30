import { InfrastructureError } from '../infrastructure-error';

/**
 * Error representing an invalid state during
 * data transfer object convertation.
 */
export class InvalidDataTransferObjectError extends InfrastructureError {
  /**
   * Creates domain error with optional identifier of the aggregate.
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
