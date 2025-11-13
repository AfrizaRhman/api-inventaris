import { applyDecorators, UseInterceptors } from '@nestjs/common';
import {
  FileInterceptor,
  FilesInterceptor,
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

/**
 * Single file upload decorator
 */
export function UploadSingleFile(fieldName: string, options?: MulterOptions) {
  return applyDecorators(UseInterceptors(FileInterceptor(fieldName, options)));
}

/**
 * Multiple files upload decorator (same field)
 */
export function UploadMultipleFiles(
  fieldName: string,
  maxCount?: number,
  options?: MulterOptions,
) {
  return applyDecorators(
    UseInterceptors(FilesInterceptor(fieldName, maxCount, options)),
  );
}

/**
 * Multiple files upload decorator (different fields)
 */
export function UploadFileFields(
  fields: Array<{ name: string; maxCount?: number }>,
  options?: MulterOptions,
) {
  return applyDecorators(
    UseInterceptors(FileFieldsInterceptor(fields, options)),
  );
}

/**
 * Image upload decorator with validation
 */
export function UploadImage(fieldName: string, maxSize = 5 * 1024 * 1024) {
  const options: MulterOptions = {
    limits: {
      fileSize: maxSize,
    },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
      }
      callback(null, true);
    },
  };

  return UploadSingleFile(fieldName, options);
}

/**
 * Document upload decorator with validation
 */
export function UploadDocument(fieldName: string, maxSize = 10 * 1024 * 1024) {
  const options: MulterOptions = {
    limits: {
      fileSize: maxSize,
    },
    fileFilter: (req, file, callback) => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];
      
      if (!allowedTypes.includes(file.mimetype)) {
        return callback(new Error('Only document files are allowed!'), false);
      }
      callback(null, true);
    },
  };

  return UploadSingleFile(fieldName, options);
}

/**
 * Avatar upload decorator with validation
 */
export function UploadAvatar(fieldName: string) {
  const options: MulterOptions = {
    limits: {
      fileSize: 2 * 1024 * 1024, // 2MB
    },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return callback(
          new Error('Only JPG, JPEG and PNG files are allowed for avatars!'),
          false,
        );
      }
      callback(null, true);
    },
  };

  return UploadSingleFile(fieldName, options);
}
