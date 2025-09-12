import { mockDeep } from 'jest-mock-extended';
import { Readable } from 'stream';

// Mock interface for VercelBlobService
interface VercelBlobService {
  generateImageFilename(productId: number, originalName: string): string;
  uploadImage(
    buffer: Buffer,
    filename: string,
    mimetype: string,
  ): Promise<string>;
  deleteImage(imageUrl: string): Promise<void>;
  getImageUrl(imageUrl: string): string;
}

export const vercelBlobServiceMock = mockDeep<VercelBlobService>();

// Helper function to create a mock image file
export const createMockImageFile = (
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File => ({
  fieldname: 'image',
  originalname: 'test-image.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 1024,
  buffer: Buffer.from('fake-image-data'),
  destination: '',
  filename: '',
  path: '',
  stream: mockDeep<Readable>(),
  ...overrides,
});

// Helper function to create a mock Vercel Blob response
export const createMockBlobResponse = (
  url: string = 'https://blob.vercel-storage.com/test-image.jpg',
) => ({
  url,
  downloadUrl: url,
  pathname: '/test-image.jpg',
  size: 1024,
  uploadedAt: new Date().toISOString(),
});

// Mock successful upload response
export const mockSuccessfulUpload = (
  url: string = 'https://blob.vercel-storage.com/test-image.jpg',
) => {
  vercelBlobServiceMock.uploadImage.mockResolvedValue(url);
  return url;
};

// Mock successful deletion
export const mockSuccessfulDeletion = () => {
  vercelBlobServiceMock.deleteImage.mockResolvedValue(undefined);
};

// Mock upload failure
export const mockUploadFailure = (
  error: Error = new Error('Upload failed'),
) => {
  vercelBlobServiceMock.uploadImage.mockRejectedValue(error);
};

// Mock deletion failure
export const mockDeletionFailure = (
  error: Error = new Error('Deletion failed'),
) => {
  vercelBlobServiceMock.deleteImage.mockRejectedValue(error);
};

// Mock filename generation
export const mockFilenameGeneration = (
  filename: string = 'products/123-1640995200000-test.jpg',
) => {
  vercelBlobServiceMock.generateImageFilename.mockReturnValue(filename);
  return filename;
};

// Mock image URL generation
export const mockImageUrlGeneration = (
  url: string = 'https://blob.vercel-storage.com/test-image.jpg',
) => {
  vercelBlobServiceMock.getImageUrl.mockReturnValue(`${url}?token=mock-token`);
  return `${url}?token=mock-token`;
};
