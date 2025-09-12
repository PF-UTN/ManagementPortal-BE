import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { ProductUpdateDto } from './product-update.dto';

describe('ProductUpdateDto', () => {
  describe('transformation', () => {
    it('should transform string values to correct types from multipart form data', () => {
      // Arrange
      const multipartData = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: '150.75',
        weight: '2.0',
        enabled: false,
        categoryId: '3',
        supplierId: '4',
      };

      // Act
      const dto = plainToClass(ProductUpdateDto, multipartData);

      // Assert
      expect(dto.name).toBe('Updated Product');
      expect(dto.description).toBe('Updated Description');
      expect(dto.price).toBe(150.75);
      expect(dto.weight).toBe(2.0);
      expect(dto.enabled).toBe(false);
      expect(dto.categoryId).toBe(3);
      expect(dto.supplierId).toBe(4);
    });

    it('should handle boolean true value', () => {
      // Arrange
      const multipartData = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: '150.75',
        weight: '2.0',
        enabled: 'true',
        categoryId: '3',
        supplierId: '4',
      };

      // Act
      const dto = plainToClass(ProductUpdateDto, multipartData);

      // Assert
      expect(dto.enabled).toBe(true);
    });

    it('should handle decimal numbers correctly', () => {
      // Arrange
      const multipartData = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: '199.99',
        weight: '3.5',
        enabled: 'true',
        categoryId: '3',
        supplierId: '4',
      };

      // Act
      const dto = plainToClass(ProductUpdateDto, multipartData);

      // Assert
      expect(dto.price).toBe(199.99);
      expect(dto.weight).toBe(3.5);
    });

    it('should handle image file', () => {
      // Arrange
      const mockImageFile = {
        fieldname: 'image',
        originalname: 'updated-image.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 2048,
        buffer: Buffer.from('fake-updated-image-data'),
      } as Express.Multer.File;

      const multipartData = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: '150.75',
        weight: '2.0',
        enabled: 'true',
        categoryId: '3',
        supplierId: '4',
        image: mockImageFile,
      };

      // Act
      const dto = plainToClass(ProductUpdateDto, multipartData);

      // Assert
      expect(dto.image).toEqual(mockImageFile);
    });
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      // Arrange
      const validData = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 150.75,
        weight: 2.0,
        enabled: true,
        categoryId: 3,
        supplierId: 4,
      };

      // Act
      const dto = plainToClass(ProductUpdateDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing required fields', async () => {
      // Arrange
      const invalidData = {
        name: '',
        description: '',
        price: -1,
        weight: -1,
        enabled: 'invalid',
        categoryId: -1,
        supplierId: -1,
      };

      // Act
      const dto = plainToClass(ProductUpdateDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass validation with valid image file', async () => {
      // Arrange
      const mockImageFile = {
        fieldname: 'image',
        originalname: 'updated-image.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 2048,
        buffer: Buffer.from('fake-updated-image-data'),
      } as Express.Multer.File;

      const validData = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 150.75,
        weight: 2.0,
        enabled: true,
        categoryId: 3,
        supplierId: 4,
        image: mockImageFile,
      };

      // Act
      const dto = plainToClass(ProductUpdateDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid image file', async () => {
      // Arrange
      const invalidImageFile = {
        fieldname: 'image',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('fake-pdf-data'),
      } as Express.Multer.File;

      const validData = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 150.75,
        weight: 2.0,
        enabled: true,
        categoryId: 3,
        supplierId: 4,
        image: invalidImageFile,
      };

      // Act
      const dto = plainToClass(ProductUpdateDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'image')).toBe(true);
    });

    it('should pass validation without image file', async () => {
      // Arrange
      const validData = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 150.75,
        weight: 2.0,
        enabled: true,
        categoryId: 3,
        supplierId: 4,
      };

      // Act
      const dto = plainToClass(ProductUpdateDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });
  });
});
