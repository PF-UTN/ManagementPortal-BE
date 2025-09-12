/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isImageFile', async: false })
export class IsImageFileConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (!value) {
      return true;
    }

    if (!value.originalname || !value.mimetype || !value.buffer) {
      return false;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(value.mimetype.toLowerCase())) {
      return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (value.size && value.size > maxSize) {
      return false;
    }

    if (value.buffer && value.buffer.length > maxSize) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return 'File must be a valid image (JPEG, PNG, WebP) and smaller than 5MB';
  }
}

export function IsImageFile(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsImageFileConstraint,
    });
  };
}
