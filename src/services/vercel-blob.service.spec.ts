import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { del, put } from '@vercel/blob';
import { mockDeep } from 'jest-mock-extended';

import { VercelBlobService } from './vercel-blob.service';

jest.mock('@vercel/blob', () => ({
  put: jest.fn(),
  del: jest.fn(),
}));

describe('VercelBlobService', () => {
  let service: VercelBlobService;
  let configService: ConfigService;

  const mockToken = 'vercel_blob_rw_test_token';

  const mockConfigService = mockDeep<ConfigService>();

  beforeEach(async () => {
    mockConfigService.get.mockReturnValue(mockToken);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VercelBlobService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<VercelBlobService>(VercelBlobService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getToken', () => {
    it('should return token from env', () => {
      // Arrange
      const getSpy = jest.spyOn(configService, 'get');
      // Act
      const result = service['getToken']();

      // Assert
      expect(result).toBe(mockToken);
      expect(getSpy).toHaveBeenCalledWith('BLOB_READ_WRITE_TOKEN');
    });
  });

  describe('generateImageFilename', () => {
    it('should generate filename with product ID and timestamp', () => {
      // Arrange
      const productId = 123;
      const originalName = 'test-image.jpg';

      // Act
      const result = service.generateImageFilename(productId, originalName);

      // Assert
      expect(result).toMatch(/^products\/123-\d+\.jpg$/);
    });

    it('should handle different file extensions', () => {
      // Arrange
      const productId = 456;
      const originalName = 'photo.png';

      // Act
      const result = service.generateImageFilename(productId, originalName);

      // Assert
      expect(result).toMatch(/^products\/456-\d+\.png$/);
    });

    it('should handle files with spaces in names', () => {
      // Arrange
      const productId = 789;
      const originalName = 'my product image.webp';

      // Act
      const result = service.generateImageFilename(productId, originalName);

      // Assert
      expect(result).toMatch(/^products\/789-\d+\.webp$/);
    });
  });

  describe('uploadImage', () => {
    const mockBuffer = Buffer.from('test image data');
    const mockFilename = 'products/123-1640995200000-test.jpg';
    const mockMimetype = 'image/jpeg';

    it('should upload image successfully', async () => {
      // Arrange
      const mockResponse = {
        url: 'https://blob.vercel-storage.com/products/123-1640995200000-test.jpg',
      };
      (put as jest.Mock).mockResolvedValueOnce(mockResponse);

      // Act
      const result = await service.uploadImage(
        mockBuffer,
        mockFilename,
        mockMimetype,
      );

      // Assert
      expect(result).toBe(mockResponse.url);
      expect(put).toHaveBeenCalledWith(mockFilename, mockBuffer, {
        access: 'public',
        token: mockToken,
        contentType: mockMimetype,
      });
    });

    it('should throw BadRequestException when upload fails', async () => {
      // Arrange
      (put as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'));

      // Act & Assert
      await expect(
        service.uploadImage(mockBuffer, mockFilename, mockMimetype),
      ).rejects.toThrow('Failed to upload image');
    });
  });

  describe('deleteImage', () => {
    const mockImageUrl =
      'https://blob.vercel-storage.com/products/123-1640995200000-test.jpg';

    it('should delete image successfully', async () => {
      // Arrange
      (del as jest.Mock).mockResolvedValueOnce(undefined);

      // Act
      await service.deleteImage(mockImageUrl);

      // Assert
      expect(del).toHaveBeenCalledWith(mockImageUrl, { token: mockToken });
    });

    it('should handle error when deletion fails', async () => {
      // Arrange
      const error = new Error('Deletion failed');
      (del as jest.Mock).mockRejectedValueOnce(error);

      // Act
      await service.deleteImage(mockImageUrl);

      // Assert
      // service logs the error but does not throw
      expect(del).toHaveBeenCalledWith(mockImageUrl, { token: mockToken });
    });
  });

  describe('getImageUrl', () => {
    const mockImageUrl =
      'https://blob.vercel-storage.com/products/123-1640995200000-test.jpg';

    it('should return image URL with token', () => {
      // Act
      const result = service.getImageUrl(mockImageUrl);

      // Assert
      expect(result).toBe(`${mockImageUrl}?token=${mockToken}`);
    });
  });
});
