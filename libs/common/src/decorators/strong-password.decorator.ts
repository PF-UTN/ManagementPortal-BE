import {
  IsStrongPassword,
  IsStrongPasswordOptions,
  ValidationOptions,
} from 'class-validator';

export function IsStrongPasswordCustom(validationOptions?: ValidationOptions) {
  const options: IsStrongPasswordOptions = {
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  };

  return IsStrongPassword(options, {
    message:
      validationOptions?.message ||
      'password must contain 8 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
    ...validationOptions,
  });
}
