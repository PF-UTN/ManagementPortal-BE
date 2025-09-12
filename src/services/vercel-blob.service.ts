import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { put, del } from '@vercel/blob';

@Injectable()
export class VercelBlobService {
  private readonly logger = new Logger(VercelBlobService.name);
  private readonly token: string;

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.get<string>('BLOB_READ_WRITE_TOKEN');

    if (!token) {
      throw new Error(`Vercel Blob token not found`);
    }

    this.token = token;
  }

  /**
   * Upload an image file to Vercel Blob storage
   * @param file - The file buffer or stream to upload
   * @param filename - The filename for the blob
   * @param contentType - The MIME type of the file
   * @returns Promise<string> - The URL of the uploaded blob
   */
  async uploadImage(
    file: Buffer | Uint8Array,
    filename: string,
    contentType: string,
  ): Promise<string> {
    try {
      this.validateImageFile(file, contentType);

      const blob = await put(filename, file, {
        access: 'public',
        token: this.token,
        contentType,
      });

      this.logger.log(`Image uploaded successfully: ${blob.url}`);
      return blob.url;
    } catch (error) {
      this.logger.error(
        `Failed to upload image: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to upload image');
    }
  }

  /**
   * Delete an image from Vercel Blob storage
   * @param url - The URL of the blob to delete
   * @returns Promise<void>
   */
  async deleteImage(url: string): Promise<void> {
    try {
      if (!url) {
        return;
      }

      await del(url, {
        token: this.token,
      });

      this.logger.log(`Image deleted successfully: ${url}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete image: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Validate image file before upload
   * @param file - The file buffer to validate
   * @param contentType - The MIME type to validate
   */
  private validateImageFile(
    file: Buffer | Uint8Array,
    contentType: string,
  ): void {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.length > maxSize) {
      throw new BadRequestException('Image file size must be less than 5MB');
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(contentType.toLowerCase())) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, and WebP images are allowed',
      );
    }

    if (file.length === 0) {
      throw new BadRequestException('Image file cannot be empty');
    }
  }

  /**
   * Generate a unique filename for the product image
   * @param productId - The product ID
   * @param originalFilename - The original filename
   * @returns string - The generated filename
   */
  generateImageFilename(productId: number, originalFilename: string): string {
    const timestamp = Date.now();
    const extension = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
    return `products/${productId}-${timestamp}.${extension}`;
  }

  /**
   * Gets the image URL with token for authentication
   * @param imageUrl - The base image URL
   * @returns string - The image URL with token
   */
  getImageUrl(imageUrl: string): string {
    return `${imageUrl}?token=${this.token}`;
  }

  /**
   * Gets the current token (for testing purposes)
   * @returns string - The current token
   */
  private getToken(): string {
    return this.token;
  }
}
