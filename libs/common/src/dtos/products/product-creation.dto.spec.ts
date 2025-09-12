import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { ProductCreationDto } from './product-creation.dto';

describe('ProductCreationDto', () => {
  describe('transformation', () => {
    it('should transform string values to correct types from multipart form data', () => {
      // Arrange
      const multipartData = {
        name: 'Test Product',
        description: 'Test Description',
        price: '100.25',
        weight: '1.5',
        enabled: 'true',
        categoryId: '1',
        supplierId: '2',
        stock:
          '{"quantityAvailable": 50, "quantityOrdered": 60, "quantityReserved": 10}',
      };

      // Act
      const dto = plainToClass(ProductCreationDto, multipartData);

      // Assert
      expect(dto.name).toBe('Test Product');
      expect(dto.description).toBe('Test Description');
      expect(dto.price).toBe(100.25);
      expect(dto.weight).toBe(1.5);
      expect(dto.enabled).toBe(true);
      expect(dto.categoryId).toBe(1);
      expect(dto.supplierId).toBe(2);
      expect(dto.stock).toEqual({
        quantityAvailable: 50,
        quantityOrdered: 60,
        quantityReserved: 10,
      });
    });

    it('should handle boolean false value', () => {
      // Arrange
      const multipartData = {
        name: 'Test Product',
        description: 'Test Description',
        price: '100.25',
        weight: '1.5',
        enabled: false, // Use boolean instead of string
        categoryId: '1',
        supplierId: '2',
        stock:
          '{"quantityAvailable": 50, "quantityOrdered": 60, "quantityReserved": 10}',
      };

      // Act
      const dto = plainToClass(ProductCreationDto, multipartData);

      // Assert
      expect(dto.enabled).toBe(false);
    });

    it('should handle decimal numbers correctly', () => {
      // Arrange
      const multipartData = {
        name: 'Test Product',
        description: 'Test Description',
        price: '99.99',
        weight: '2.5',
        enabled: 'true',
        categoryId: '1',
        supplierId: '2',
        stock:
          '{"quantityAvailable": 50, "quantityOrdered": 60, "quantityReserved": 10}',
      };

      // Act
      const dto = plainToClass(ProductCreationDto, multipartData);

      // Assert
      expect(dto.price).toBe(99.99);
      expect(dto.weight).toBe(2.5);
    });

    it('should handle stock JSON string transformation', () => {
      // Arrange
      const multipartData = {
        name: 'Test Product',
        description: 'Test Description',
        price: '100.25',
        weight: '1.5',
        enabled: 'true',
        categoryId: '1',
        supplierId: '2',
        stock:
          '{"quantityAvailable": 100, "quantityOrdered": 200, "quantityReserved": 50}',
      };

      // Act
      const dto = plainToClass(ProductCreationDto, multipartData);

      // Assert
      expect(dto.stock).toEqual({
        quantityAvailable: 100,
        quantityOrdered: 200,
        quantityReserved: 50,
      });
    });

    it('should handle already parsed stock object', () => {
      // Arrange
      const multipartData = {
        name: 'Test Product',
        description: 'Test Description',
        price: '100.25',
        weight: '1.5',
        enabled: 'true',
        categoryId: '1',
        supplierId: '2',
        stock: {
          quantityAvailable: 100,
          quantityOrdered: 200,
          quantityReserved: 50,
        },
      };

      // Act
      const dto = plainToClass(ProductCreationDto, multipartData);

      // Assert
      expect(dto.stock).toEqual({
        quantityAvailable: 100,
        quantityOrdered: 200,
        quantityReserved: 50,
      });
    });

    it('should handle image file', () => {
      // Arrange
      const mockImageFile = {
        fieldname: 'image',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake-image-data'),
      } as Express.Multer.File;

      const multipartData = {
        name: 'Test Product',
        description: 'Test Description',
        price: '100.25',
        weight: '1.5',
        enabled: 'true',
        categoryId: '1',
        supplierId: '2',
        stock:
          '{"quantityAvailable": 50, "quantityOrdered": 60, "quantityReserved": 10}',
        image: mockImageFile,
      };

      // Act
      const dto = plainToClass(ProductCreationDto, multipartData);

      // Assert
      expect(dto.image).toEqual(mockImageFile);
    });
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      // Arrange
      const validData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100.25,
        weight: 1.5,
        enabled: true,
        categoryId: 1,
        supplierId: 2,
        stock: {
          quantityAvailable: 50,
          quantityOrdered: 60,
          quantityReserved: 10,
        },
      };

      // Act
      const dto = plainToClass(ProductCreationDto, validData);
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
        stock: {
          quantityAvailable: -1,
          quantityOrdered: -1,
          quantityReserved: -1,
        },
      };

      // Act
      const dto = plainToClass(ProductCreationDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass validation with valid image file', async () => {
      // Arrange
      const mockImageFile = {
        fieldname: 'image',
        originalname: 'test-image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake-image-data'),
      } as Express.Multer.File;

      const validData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100.25,
        weight: 1.5,
        enabled: true,
        categoryId: 1,
        supplierId: 2,
        stock: {
          quantityAvailable: 50,
          quantityOrdered: 60,
          quantityReserved: 10,
        },
        image: mockImageFile,
      };

      // Act
      const dto = plainToClass(ProductCreationDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid image file', async () => {
      // Arrange
      const invalidImageFile = {
        fieldname: 'image',
        originalname: 'test.txt',
        encoding: '7bit',
        mimetype: 'text/plain',
        size: 1024,
        buffer: Buffer.from('fake-text-data'),
      } as Express.Multer.File;

      const validData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100.25,
        weight: 1.5,
        enabled: true,
        categoryId: 1,
        supplierId: 2,
        stock: {
          quantityAvailable: 50,
          quantityOrdered: 60,
          quantityReserved: 10,
        },
        image: invalidImageFile,
      };

      // Act
      const dto = plainToClass(ProductCreationDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((error) => error.property === 'image')).toBe(true);
    });

    it('should pass validation without image file', async () => {
      // Arrange
      const validData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100.25,
        weight: 1.5,
        enabled: true,
        categoryId: 1,
        supplierId: 2,
        stock: {
          quantityAvailable: 50,
          quantityOrdered: 60,
          quantityReserved: 10,
        },
      };

      // Act
      const dto = plainToClass(ProductCreationDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });
  });
});
