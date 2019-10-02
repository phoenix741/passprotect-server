import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import * as validator from 'validator';

export function IsJWT(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isJWT',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: value => validator.isJWT(value),
      },
    });
  };
}
