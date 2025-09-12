import { IsImageFile, IsImageFileConstraint } from './image-file.validator';

describe('IsImageFileValidator', () => {
  let validator: IsImageFileConstraint;

  beforeEach(() => {
    validator = new IsImageFileConstraint();
  });

  describe('validate', () => {
    it('should return true for undefined value', () => {
      // Act
      const result = validator.validate(undefined);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for null value', () => {
      // Act
      const result = validator.validate(null);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when originalname is missing', () => {
      // Arrange
      const file = {
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
      };

      // Act
      const result = validator.validate(file);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when mimetype is missing', () => {
      // Arrange
      const file = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
      };

      // Act
      const result = validator.validate(file);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when buffer is missing', () => {
      // Arrange
      const file = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
      };

      // Act
      const result = validator.validate(file);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true for valid JPEG file', () => {
      // Arrange
      const file = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
      };

      // Act
      const result = validator.validate(file);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for valid JPG file', () => {
      // Arrange
      const file = {
        originalname: 'test.jpg',
        mimetype: 'image/jpg',
        buffer: Buffer.from('test'),
      };

      // Act
      const result = validator.validate(file);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for valid PNG file', () => {
      // Arrange
      const file = {
        originalname: 'test.png',
        mimetype: 'image/png',
        buffer: Buffer.from('test'),
      };

      // Act
      const result = validator.validate(file);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for valid WebP file', () => {
      // Arrange
      const file = {
        originalname: 'test.webp',
        mimetype: 'image/webp',
        buffer: Buffer.from('test'),
      };

      // Act
      const result = validator.validate(file);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for valid file with uppercase mimetype', () => {
      // Arrange
      const file = {
        originalname: 'test.jpg',
        mimetype: 'IMAGE/JPEG',
        buffer: Buffer.from('test'),
      };

      // Act
      const result = validator.validate(file);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for invalid mimetype', () => {
      // Arrange
      const file = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
        buffer: Buffer.from('test'),
      };

      // Act
      const result = validator.validate(file);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for GIF file (not allowed)', () => {
      // Arrange
      const file = {
        originalname: 'test.gif',
        mimetype: 'image/gif',
        buffer: Buffer.from('test'),
      };

      // Act
      const result = validator.validate(file);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when file size exceeds limit (using size property)', () => {
      // Arrange
      const file = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 6 * 1024 * 1024, // 6MB > 5MB limit
      };

      // Act
      const result = validator.validate(file);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when buffer size exceeds limit', () => {
      // Arrange
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB > 5MB limit
      const file = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: largeBuffer,
      };

      // Act
      const result = validator.validate(file);

      // Assert
      expect(result).toBe(false);
    });

    it('should return true when file size is within limit', () => {
      // Arrange
      const file = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 4 * 1024 * 1024, // 4MB < 5MB limit
      };

      // Act
      const result = validator.validate(file);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true when buffer size is within limit', () => {
      // Arrange
      const file = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.alloc(4 * 1024 * 1024), // 4MB < 5MB limit
      };

      // Act
      const result = validator.validate(file);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('defaultMessage', () => {
    it('should return correct error message', () => {
      // Act
      const message = validator.defaultMessage();

      // Assert
      expect(message).toBe(
        'File must be a valid image (JPEG, PNG, WebP) and smaller than 5MB',
      );
    });
  });

  describe('IsImageFile decorator', () => {
    it('should be a function', () => {
      // Assert
      expect(typeof IsImageFile).toBe('function');
    });

    it('should return a decorator function', () => {
      // Act
      const decorator = IsImageFile();

      // Assert
      expect(typeof decorator).toBe('function');
    });

    it('should accept validation options', () => {
      // Act
      const decorator = IsImageFile({ message: 'Custom error message' });

      // Assert
      expect(typeof decorator).toBe('function');
    });
  });
});
