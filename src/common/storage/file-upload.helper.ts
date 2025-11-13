import { Injectable, BadRequestException } from '@nestjs/common';
import {
  S3StorageService,
  S3UploadOptions,
  S3UploadResult,
} from './s3-storage.service';
import { ObjectCannedACL } from '@aws-sdk/client-s3';
import * as path from 'path';

export interface FileUploadOptions extends S3UploadOptions {
  allowedMimeTypes?: string[];
  maxFileSize?: number; // in bytes
  generateThumbnail?: boolean;
}

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface FileUploadResult extends S3UploadResult {
  originalName: string;
  mimeType: string;
  fileExtension: string;
}

@Injectable()
export class FileUploadHelper {
  constructor(private readonly s3StorageService: S3StorageService) { }

  /**
   * Upload a single file from Multer
   */
  async uploadSingleFile(
    file: MulterFile,
    options: FileUploadOptions = {},
  ): Promise<FileUploadResult> {
    this.validateFile(file, options);

    const uploadOptions: S3UploadOptions = {
      ...options,
      filename: options.filename || file.originalname,
      contentType: file.mimetype,
      metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
        ...options.metadata,
      },
    };

    const result = await this.s3StorageService.uploadFile(
      file.buffer,
      uploadOptions,
    );

    return {
      ...result,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileExtension: path.extname(file.originalname),
    };
  }

  /**
   * Upload multiple files from Multer
   */
  async uploadMultipleFiles(
    files: MulterFile[],
    options: FileUploadOptions = {},
  ): Promise<FileUploadResult[]> {
    const uploadPromises = files.map((file) =>
      this.uploadSingleFile(file, options),
    );
    return Promise.all(uploadPromises);
  }

  /**
   * Upload files organized by field name
   */
  async uploadFilesByField(
    files: { [fieldname: string]: MulterFile[] },
    optionsByField: { [fieldname: string]: FileUploadOptions } = {},
  ): Promise<{ [fieldname: string]: FileUploadResult[] }> {
    const result: { [fieldname: string]: FileUploadResult[] } = {};

    for (const [fieldname, fileArray] of Object.entries(files)) {
      const fieldOptions = optionsByField[fieldname] || {};
      result[fieldname] = await this.uploadMultipleFiles(
        fileArray,
        fieldOptions,
      );
    }

    return result;
  }

  /**
   * Replace an existing file
   */
  async replaceFile(
    oldKey: string,
    newFile: MulterFile,
    options: FileUploadOptions = {},
  ): Promise<FileUploadResult> {
    // Upload new file first
    const uploadResult = await this.uploadSingleFile(newFile, options);

    // Delete old file
    try {
      await this.s3StorageService.deleteFile(oldKey);
    } catch (error) {
      // Log error but don't fail the operation
      console.error(
        `Failed to delete old file ${oldKey}:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
    }

    return uploadResult;
  }

  /**
   * Validate file against options
   */
  private validateFile(file: MulterFile, options: FileUploadOptions): void {
    // Check file size
    if (options.maxFileSize && file.size > options.maxFileSize) {
      throw new BadRequestException(
        `File size ${file.size} exceeds maximum allowed size ${options.maxFileSize}`,
      );
    }

    // Check MIME type
    if (
      options.allowedMimeTypes &&
      !options.allowedMimeTypes.includes(file.mimetype)
    ) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${options.allowedMimeTypes.join(', ')}`,
      );
    }

    // Basic file validation
    if (!file.buffer || file.size === 0) {
      throw new BadRequestException('Empty file is not allowed');
    }
  }

  /**
   * Get MIME type from file extension
   */
  getMimeType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.mp4': 'video/mp4',
      '.mpeg': 'video/mpeg',
      '.mov': 'video/quicktime',
    };

    return mimeMap[ext] || 'application/octet-stream';
  }

  /**
   * Generate a safe filename
   */
  generateSafeFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);

    // Remove special characters and spaces
    const safeName = name
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();

    return `${safeName}${ext}`;
  }

  /**
   * convert base64 to buffer
   */
  base64ToBuffer(base64String: string): {
    buffer: Buffer;
    mimeType: string;
    originalName: string;
  } {
    const matches = base64String.match(/^data:(.+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      throw new BadRequestException('Invalid base64 image format');
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const extension = mimeType.split('/')[1] || 'jpg';

    return {
      buffer,
      mimeType,
      originalName: `upload.${extension}`,
    };
  }


  /**
   * Predefined upload configurations
   */
  static readonly UPLOAD_CONFIGS = {
    IMAGES: {
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      maxFileSize: 5 * 1024 * 1024, // 5MB
      folder: 'images',
      acl: ObjectCannedACL.public_read,
    } as FileUploadOptions,

    DOCUMENTS: {
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      folder: 'documents',
      acl: ObjectCannedACL.public_read,
    } as FileUploadOptions,

    AVATARS: {
      allowedMimeTypes: ['image/jpeg', 'image/png'],
      maxFileSize: 2 * 1024 * 1024, // 2MB
      folder: 'avatars',
      acl: ObjectCannedACL.public_read,
    } as FileUploadOptions,

    VIDEOS: {
      allowedMimeTypes: ['video/mp4', 'video/mpeg', 'video/quicktime'],
      maxFileSize: 100 * 1024 * 1024, // 100MB
      folder: 'videos',
      acl: ObjectCannedACL.public_read,
    } as FileUploadOptions,

    TRANSACTION_IMAGES: {
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      maxFileSize: 8 * 1024 * 1024, // 8MB
      folder: 'transactions/payment-proof',
      acl: ObjectCannedACL.public_read,
    } as FileUploadOptions,
  };
}
