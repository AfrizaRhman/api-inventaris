import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  Body,
  BadRequestException,
  Get,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { S3StorageService } from './s3-storage.service';
import { FileUploadHelper, MulterFile } from './file-upload.helper';
import {
  UploadSingleFile,
  UploadMultipleFiles,
  UploadImage,
  UploadDocument,
  UploadAvatar,
} from './upload.decorator';

@Controller('storage')
export class StorageController {
  constructor(
    private readonly s3StorageService: S3StorageService,
    private readonly fileUploadHelper: FileUploadHelper,
  ) {}

  /**
   * Upload a single file
   */
  @Post('upload/single')
  @UploadSingleFile('file')
  async uploadSingleFile(
    @UploadedFile() file: MulterFile,
    @Body('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.fileUploadHelper.uploadSingleFile(file, {
      folder: folder || 'uploads',
    });

    return {
      message: 'File uploaded successfully',
      data: result,
    };
  }

  /**
   * Upload multiple files
   */
  @Post('upload/multiple')
  @UploadMultipleFiles('files', 10)
  async uploadMultipleFiles(
    @UploadedFiles() files: MulterFile[],
    @Body('folder') folder?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const results = await this.fileUploadHelper.uploadMultipleFiles(files, {
      folder: folder || 'uploads',
    });

    return {
      message: `${results.length} files uploaded successfully`,
      data: results,
    };
  }

  /**
   * Upload an image with validation
   */
  @Post('upload/image')
  @UploadImage('image')
  async uploadImage(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new BadRequestException('No image provided');
    }

    const result = await this.fileUploadHelper.uploadSingleFile(
      file,
      FileUploadHelper.UPLOAD_CONFIGS.IMAGES,
    );

    return {
      message: 'Image uploaded successfully',
      data: result,
    };
  }

  /**
   * Upload a document with validation
   */
  @Post('upload/document')
  @UploadDocument('document')
  async uploadDocument(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new BadRequestException('No document provided');
    }

    const result = await this.fileUploadHelper.uploadSingleFile(
      file,
      FileUploadHelper.UPLOAD_CONFIGS.DOCUMENTS,
    );

    return {
      message: 'Document uploaded successfully',
      data: result,
    };
  }

  /**
   * Upload an avatar with validation
   */
  @Post('upload/avatar')
  @UploadAvatar('avatar')
  async uploadAvatar(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new BadRequestException('No avatar provided');
    }

    const result = await this.fileUploadHelper.uploadSingleFile(
      file,
      FileUploadHelper.UPLOAD_CONFIGS.AVATARS,
    );

    return {
      message: 'Avatar uploaded successfully',
      data: result,
    };
  }

  /**
   * Upload property images
   */
  @Post('upload/property-images')
  @UploadMultipleFiles('images', 20)
  async uploadPropertyImages(@UploadedFiles() files: MulterFile[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No images provided');
    }

    const results = await this.fileUploadHelper.uploadMultipleFiles(
      files,
      FileUploadHelper.UPLOAD_CONFIGS.TRANSACTION_IMAGES,
    );

    return {
      message: `${results.length} property images uploaded successfully`,
      data: results,
    };
  }

  /**
   * Delete a file
   */
  @Delete('file/:key')
  async deleteFile(@Param('key') key: string) {
    // Decode the key if it was URL encoded
    const decodedKey = decodeURIComponent(key);
    
    await this.s3StorageService.deleteFile(decodedKey);

    return {
      message: 'File deleted successfully',
    };
  }

  /**
   * Get file info
   */
  @Get('file/:key/info')
  async getFileInfo(@Param('key') key: string) {
    const decodedKey = decodeURIComponent(key);
    const fileInfo = await this.s3StorageService.getFileInfo(decodedKey);

    return {
      message: 'File info retrieved successfully',
      data: fileInfo,
    };
  }

  /**
   * Check if file exists
   */
  @Get('file/:key/exists')
  async fileExists(@Param('key') key: string) {
    const decodedKey = decodeURIComponent(key);
    const exists = await this.s3StorageService.fileExists(decodedKey);

    return {
      exists,
    };
  }

  /**
   * List files in a folder
   */
  @Get('files')
  async listFiles(
    @Query('prefix') prefix?: string,
    @Query('maxKeys') maxKeys?: number,
    @Query('continuationToken') continuationToken?: string,
  ) {
    const result = await this.s3StorageService.listFiles(
      prefix,
      undefined,
      maxKeys ? parseInt(maxKeys.toString(), 10) : undefined,
      continuationToken,
    );

    return {
      message: 'Files listed successfully',
      data: result,
    };
  }

  /**
   * Generate presigned upload URL
   */
  @Post('presigned-url/upload')
  async generatePresignedUploadUrl(
    @Body('key') key: string,
    @Body('contentType') contentType?: string,
    @Body('expiresIn') expiresIn?: number,
  ) {
    if (!key) {
      throw new BadRequestException('Key is required');
    }

    const url = await this.s3StorageService.generatePresignedUploadUrl(key, {
      contentType,
      expiresIn,
    });

    return {
      message: 'Presigned upload URL generated successfully',
      data: {
        url,
        key,
        expiresIn: expiresIn || 3600,
      },
    };
  }

  /**
   * Generate presigned download URL
   */
  @Post('presigned-url/download')
  async generatePresignedDownloadUrl(
    @Body('key') key: string,
    @Body('expiresIn') expiresIn?: number,
    @Body('filename') filename?: string,
  ) {
    if (!key) {
      throw new BadRequestException('Key is required');
    }

    const contentDisposition = filename
      ? `attachment; filename="${filename}"`
      : undefined;
    
    const url = await this.s3StorageService.generatePresignedDownloadUrl(key, {
      expiresIn,
      contentDisposition,
    });

    return {
      message: 'Presigned download URL generated successfully',
      data: {
        url,
        key,
        expiresIn: expiresIn || 3600,
      },
    };
  }

  /**
   * Copy a file
   */
  @Post('file/copy')
  async copyFile(
    @Body('sourceKey') sourceKey: string,
    @Body('destinationKey') destinationKey: string,
  ) {
    if (!sourceKey || !destinationKey) {
      throw new BadRequestException(
        'Source key and destination key are required',
      );
    }

    await this.s3StorageService.copyFile(sourceKey, destinationKey);

    return {
      message: 'File copied successfully',
    };
  }

  /**
   * Move a file
   */
  @Post('file/move')
  async moveFile(
    @Body('sourceKey') sourceKey: string,
    @Body('destinationKey') destinationKey: string,
  ) {
    if (!sourceKey || !destinationKey) {
      throw new BadRequestException(
        'Source key and destination key are required',
      );
    }

    await this.s3StorageService.moveFile(sourceKey, destinationKey);

    return {
      message: 'File moved successfully',
    };
  }

  /**
   * Get public URL for a file
   */
  @Get('file/:key/public-url')
  getPublicUrl(@Param('key') key: string) {
    const decodedKey = decodeURIComponent(key);
    const url = this.s3StorageService.getPublicUrl(decodedKey);

    return {
      message: 'Public URL generated successfully',
      data: {
        url,
        key: decodedKey,
      },
    };
  }
}
