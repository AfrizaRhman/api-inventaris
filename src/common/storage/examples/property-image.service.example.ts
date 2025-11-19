import { Injectable } from '@nestjs/common';
import { S3StorageService, FileUploadHelper, MulterFile } from '../index';

/**
 * Example service showing how to integrate S3 storage with properties
 * This is a documentation example - adapt the patterns to your needs
 */
@Injectable()
export class PropertyImageService {
  constructor(
    private readonly s3StorageService: S3StorageService,
    private readonly fileUploadHelper: FileUploadHelper,
  ) {}

  /**
   * Upload property images
   */
  async uploadPropertyImages(propertyId: string, files: MulterFile[]) {
    const results = await this.fileUploadHelper.uploadMultipleFiles(files, {
      folder: `properties/${propertyId}`,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxFileSize: 8 * 1024 * 1024, // 8MB
      metadata: {
        propertyId,
        uploadedAt: new Date().toISOString(),
      },
    });

    return results;
  }

  /**
   * Delete property images
   */
  async deletePropertyImages(imageKeys: string[]) {
    await this.s3StorageService.deleteMultipleFiles(imageKeys);
  }

  /**
   * Clean up property files when property is deleted
   */
  async cleanupPropertyFiles(propertyId: string) {
    const files = await this.s3StorageService.listFiles(
      `properties/${propertyId}/`,
    );
    
    if (files.files.length > 0) {
      const keys = files.files.map((file) => file.key);
      await this.s3StorageService.deleteMultipleFiles(keys);
    }
  }
}
