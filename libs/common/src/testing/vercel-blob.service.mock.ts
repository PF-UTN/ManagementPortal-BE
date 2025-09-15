import { mockDeep } from 'jest-mock-extended';
import { Readable } from 'stream';

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

export const createMockBlobResponse = (
  url: string = 'https://blob.vercel-storage.com/test-image.jpg',
) => ({
  url,
  downloadUrl: url,
  pathname: '/test-image.jpg',
  size: 1024,
  uploadedAt: new Date().toISOString(),
});

export const mockSuccessfulUpload = (
  url: string = 'https://blob.vercel-storage.com/test-image.jpg',
) => {
  vercelBlobServiceMock.uploadImage.mockResolvedValue(url);
  return url;
};

export const mockSuccessfulDeletion = () => {
  vercelBlobServiceMock.deleteImage.mockResolvedValue(undefined);
};

export const mockUploadFailure = (
  error: Error = new Error('Upload failed'),
) => {
  vercelBlobServiceMock.uploadImage.mockRejectedValue(error);
};

export const mockDeletionFailure = (
  error: Error = new Error('Deletion failed'),
) => {
  vercelBlobServiceMock.deleteImage.mockRejectedValue(error);
};

export const mockFilenameGeneration = (
  filename: string = 'products/123-1640995200000-test.jpg',
) => {
  vercelBlobServiceMock.generateImageFilename.mockReturnValue(filename);
  return filename;
};

export const mockImageUrlGeneration = (
  url: string = 'https://blob.vercel-storage.com/test-image.jpg',
) => {
  vercelBlobServiceMock.getImageUrl.mockReturnValue(`${url}?token=mock-token`);
  return `${url}?token=mock-token`;
};
