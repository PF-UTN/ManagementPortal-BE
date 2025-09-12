import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { StockDto } from './stock.dto';

describe('StockDto', () => {
  describe('transformation', () => {
    it('should transform string values to numbers from multipart form data', () => {
      // Arrange
      const multipartData = {
        quantityAvailable: '50',
        quantityOrdered: '60',
        quantityReserved: '10',
      };

      // Act
      const dto = plainToClass(StockDto, multipartData);

      // Assert
      expect(dto.quantityAvailable).toBe(50);
      expect(dto.quantityOrdered).toBe(60);
      expect(dto.quantityReserved).toBe(10);
    });

    it('should handle decimal numbers', () => {
      // Arrange
      const multipartData = {
        quantityAvailable: '50.5',
        quantityOrdered: '60.25',
        quantityReserved: '10.75',
      };

      // Act
      const dto = plainToClass(StockDto, multipartData);

      // Assert
      expect(dto.quantityAvailable).toBe(50.5);
      expect(dto.quantityOrdered).toBe(60.25);
      expect(dto.quantityReserved).toBe(10.75);
    });

    it('should handle zero values', () => {
      // Arrange
      const multipartData = {
        quantityAvailable: '0',
        quantityOrdered: '0',
        quantityReserved: '0',
      };

      // Act
      const dto = plainToClass(StockDto, multipartData);

      // Assert
      expect(dto.quantityAvailable).toBe(0);
      expect(dto.quantityOrdered).toBe(0);
      expect(dto.quantityReserved).toBe(0);
    });

    it('should handle already converted numbers', () => {
      // Arrange
      const multipartData = {
        quantityAvailable: 50,
        quantityOrdered: 60,
        quantityReserved: 10,
      };

      // Act
      const dto = plainToClass(StockDto, multipartData);

      // Assert
      expect(dto.quantityAvailable).toBe(50);
      expect(dto.quantityOrdered).toBe(60);
      expect(dto.quantityReserved).toBe(10);
    });
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      // Arrange
      const validData = {
        quantityAvailable: 50,
        quantityOrdered: 60,
        quantityReserved: 10,
      };

      // Act
      const dto = plainToClass(StockDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with negative values', async () => {
      // Arrange
      const invalidData = {
        quantityAvailable: -10,
        quantityOrdered: -5,
        quantityReserved: -2,
      };

      // Act
      const dto = plainToClass(StockDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((error) => error.property === 'quantityAvailable'),
      ).toBe(true);
      expect(errors.some((error) => error.property === 'quantityOrdered')).toBe(
        true,
      );
      expect(
        errors.some((error) => error.property === 'quantityReserved'),
      ).toBe(true);
    });

    it('should fail validation with values exceeding maximum', async () => {
      // Arrange
      const invalidData = {
        quantityAvailable: 100000000, // Exceeds max of 99999999.99
        quantityOrdered: 100000000,
        quantityReserved: 100000000,
      };

      // Act
      const dto = plainToClass(StockDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((error) => error.property === 'quantityAvailable'),
      ).toBe(true);
      expect(errors.some((error) => error.property === 'quantityOrdered')).toBe(
        true,
      );
      expect(
        errors.some((error) => error.property === 'quantityReserved'),
      ).toBe(true);
    });

    it('should fail validation with too many decimal places', async () => {
      // Arrange
      const invalidData = {
        quantityAvailable: 50.123, // More than 2 decimal places
        quantityOrdered: 60.456,
        quantityReserved: 10.789,
      };

      // Act
      const dto = plainToClass(StockDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((error) => error.property === 'quantityAvailable'),
      ).toBe(true);
      expect(errors.some((error) => error.property === 'quantityOrdered')).toBe(
        true,
      );
      expect(
        errors.some((error) => error.property === 'quantityReserved'),
      ).toBe(true);
    });

    it('should fail validation with missing required fields', async () => {
      // Arrange
      const invalidData = {};

      // Act
      const dto = plainToClass(StockDto, invalidData);
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((error) => error.property === 'quantityAvailable'),
      ).toBe(true);
      expect(errors.some((error) => error.property === 'quantityOrdered')).toBe(
        true,
      );
      expect(
        errors.some((error) => error.property === 'quantityReserved'),
      ).toBe(true);
    });

    it('should pass validation with maximum allowed values', async () => {
      // Arrange
      const validData = {
        quantityAvailable: 99999999.99,
        quantityOrdered: 99999999.99,
        quantityReserved: 99999999.99,
      };

      // Act
      const dto = plainToClass(StockDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with exactly 2 decimal places', async () => {
      // Arrange
      const validData = {
        quantityAvailable: 50.12,
        quantityOrdered: 60.34,
        quantityReserved: 10.56,
      };

      // Act
      const dto = plainToClass(StockDto, validData);
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });
  });
});
