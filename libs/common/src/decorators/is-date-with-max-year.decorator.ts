import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Validates that a Date instance does not exceed the given maximum year.
 * @param maxYear Maximum allowed year (default: 9999)
 * @param validationOptions Optional validation options
 */
export function IsDateWithMaxYear(
  maxYear = 9999,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateWithMaxYear',
      target: object.constructor,
      propertyName,
      options: {
        message:
          validationOptions?.message ||
          `year must be less than or equal to ${maxYear}`,
        ...validationOptions,
      },
      constraints: [maxYear],
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (!(value instanceof Date) || isNaN(value.getTime())) {
            return false;
          }
          const max = args.constraints[0];
          return value.getFullYear() <= max;
        },
      },
    });
  };
}
