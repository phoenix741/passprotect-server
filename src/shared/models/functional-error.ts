import { HttpException } from '@nestjs/common';

export class FunctionalError extends Error {
  field?: string;

  constructor(field?: string, message?: string) {
    super(message);

    this.field = field;
  }

  toGraphQL(defaultLabel = 'label') {
    return {
      errors: [{
        fieldName: this.field || defaultLabel,
        message: this.message,
      }],
    };
  }
}

export function toFunctionalError(error: Error): FunctionalError {
  if (error instanceof FunctionalError) {
    return error;
  }
  if (error instanceof HttpException) {
    return new FunctionalError(undefined, error.message.message);
  }
  return new FunctionalError(undefined, error.message);
}
