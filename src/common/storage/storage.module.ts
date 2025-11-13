import { Module } from '@nestjs/common';
import { S3StorageService } from './s3-storage.service';
import { FileUploadHelper } from './file-upload.helper';
import { StorageController } from './storage.controller';

@Module({
  controllers: [StorageController],
  providers: [S3StorageService, FileUploadHelper],
  exports: [S3StorageService, FileUploadHelper],
})
export class StorageModule {}
