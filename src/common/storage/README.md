# S3-Compatible Storage Utility Documentation

This utility provides a comprehensive solution for handling S3-compatible storage operations in your NestJS application. It works with AWS S3, Contabo Object Storage, MinIO, DigitalOcean Spaces, and other S3-compatible providers.

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Basic Usage](#basic-usage)
4. [File Upload Examples](#file-upload-examples)
5. [Advanced Operations](#advanced-operations)
6. [API Reference](#api-reference)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

## Installation

The S3 storage utility has been installed with all necessary dependencies:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner multer @types/multer uuid @types/uuid
```

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

#### For AWS S3:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET=your-bucket-name
```

#### For Contabo Object Storage:
```env
AWS_REGION=usc1
AWS_ACCESS_KEY_ID=your_contabo_access_key
AWS_SECRET_ACCESS_KEY=your_contabo_secret_key
AWS_S3_BUCKET=your-bucket-name
AWS_S3_ENDPOINT=https://usc1.contabostorage.com
AWS_S3_FORCE_PATH_STYLE=true
```

#### For Other S3-Compatible Services:
```env
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=your-bucket-name
AWS_S3_ENDPOINT=https://your-provider-endpoint.com
AWS_S3_FORCE_PATH_STYLE=true  # Usually required for non-AWS providers
```

### Module Setup

The S3 storage utility is already integrated into your common module. To use it in other modules:

```typescript
import { Module } from '@nestjs/common';
import { StorageModule } from '../common/storage/storage.module';

@Module({
  imports: [StorageModule],
  // ... other module configuration
})
export class YourModule {}
```

## Basic Usage

### Injecting the Services

```typescript
import { Injectable } from '@nestjs/common';
import { S3StorageService, FileUploadHelper } from '../common/storage';

@Injectable()
export class YourService {
  constructor(
    private readonly s3StorageService: S3StorageService,
    private readonly fileUploadHelper: FileUploadHelper,
  ) {}
}
```

### Simple File Upload

```typescript
// Upload a file buffer
const result = await this.s3StorageService.uploadFile(fileBuffer, {
  folder: 'uploads',
  filename: 'my-file.jpg',
  contentType: 'image/jpeg',
});

console.log(result.url); // S3 URL of uploaded file
```

## File Upload Examples

### 1. Single File Upload Controller

```typescript
import { Controller, Post, UploadedFile } from '@nestjs/common';
import { UploadSingleFile } from '../common/storage';

@Controller('files')
export class FilesController {
  @Post('upload')
  @UploadSingleFile('file')
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.fileUploadHelper.uploadSingleFile(file, {
      folder: 'documents',
    });
    
    return { success: true, data: result };
  }
}
```

### 2. Image Upload with Validation

```typescript
@Post('upload/image')
@UploadImage('image') // Built-in image validation
async uploadImage(@UploadedFile() file: Express.Multer.File) {
  const result = await this.fileUploadHelper.uploadSingleFile(
    file,
    FileUploadHelper.UPLOAD_CONFIGS.IMAGES
  );
  
  return result;
}
```

### 3. Multiple Files Upload

```typescript
@Post('upload/multiple')
@UploadMultipleFiles('files', 10) // Max 10 files
async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
  const results = await this.fileUploadHelper.uploadMultipleFiles(files, {
    folder: 'gallery',
  });
  
  return results;
}
```

### 4. Property Images Upload

```typescript
@Post('properties/:id/images')
@UploadMultipleFiles('images', 20)
async uploadPropertyImages(
  @Param('id') propertyId: string,
  @UploadedFiles() files: Express.Multer.File[]
) {
  const results = await this.fileUploadHelper.uploadMultipleFiles(files, {
    folder: \`properties/\${propertyId}\`,
    ...FileUploadHelper.UPLOAD_CONFIGS.PROPERTY_IMAGES,
  });
  
  return results;
}
```

## Advanced Operations

### 1. Presigned URLs

```typescript
// Generate upload URL for client-side uploads
const uploadUrl = await this.s3StorageService.generatePresignedUploadUrl(
  'uploads/my-file.jpg',
  {
    contentType: 'image/jpeg',
    expiresIn: 3600, // 1 hour
  }
);

// Generate download URL
const downloadUrl = await this.s3StorageService.generatePresignedDownloadUrl(
  'uploads/my-file.jpg',
  {
    expiresIn: 1800, // 30 minutes
    contentDisposition: 'attachment; filename="downloaded-file.jpg"',
  }
);
```

### 2. File Management Operations

```typescript
// Check if file exists
const exists = await this.s3StorageService.fileExists('uploads/my-file.jpg');

// Get file information
const fileInfo = await this.s3StorageService.getFileInfo('uploads/my-file.jpg');

// Copy file
await this.s3StorageService.copyFile(
  'uploads/original.jpg',
  'uploads/backup/original.jpg'
);

// Move file
await this.s3StorageService.moveFile(
  'uploads/temp.jpg',
  'uploads/permanent.jpg'
);

// Delete file
await this.s3StorageService.deleteFile('uploads/unwanted.jpg');

// Delete multiple files
await this.s3StorageService.deleteMultipleFiles([
  'uploads/file1.jpg',
  'uploads/file2.jpg',
]);
```

### 3. List Files

```typescript
// List all files in a folder
const result = await this.s3StorageService.listFiles('uploads/');

// List with pagination
const result = await this.s3StorageService.listFiles(
  'uploads/',
  undefined, // bucket (uses default)
  50, // max files
  'continuation-token' // for pagination
);

console.log(result.files); // Array of file info
console.log(result.hasMore); // Boolean
console.log(result.nextContinuationToken); // For next page
```

## API Reference

### Built-in Upload Configurations

```typescript
// Predefined configurations available in FileUploadHelper.UPLOAD_CONFIGS

IMAGES: {
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxFileSize: 5 * 1024 * 1024, // 5MB
  folder: 'images',
}

DOCUMENTS: {
  allowedMimeTypes: ['application/pdf', 'application/msword', ...],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  folder: 'documents',
}

AVATARS: {
  allowedMimeTypes: ['image/jpeg', 'image/png'],
  maxFileSize: 2 * 1024 * 1024, // 2MB
  folder: 'avatars',
}

PROPERTY_IMAGES: {
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFileSize: 8 * 1024 * 1024, // 8MB
  folder: 'properties',
}
```

### Upload Decorators

```typescript
@UploadSingleFile(fieldName, options?) // Single file
@UploadMultipleFiles(fieldName, maxCount?, options?) // Multiple files
@UploadFileFields(fields, options?) // Multiple fields
@UploadImage(fieldName, maxSize?) // Image with validation
@UploadDocument(fieldName, maxSize?) // Document with validation
@UploadAvatar(fieldName) // Avatar with validation
```

## Error Handling

The utility includes comprehensive error handling:

```typescript
try {
  const result = await this.s3StorageService.uploadFile(file);
} catch (error) {
  if (error.message.includes('File size')) {
    // Handle file size error
  } else if (error.message.includes('File type')) {
    // Handle file type error
  } else {
    // Handle other S3 errors
  }
}
```

## Best Practices

### 1. File Organization

```typescript
// Use descriptive folder structures
const folderStructure = {
  userAvatars: 'users/{userId}/avatar',
  propertyImages: 'properties/{propertyId}/images',
  documents: 'documents/{year}/{month}',
  tempUploads: 'temp/{sessionId}',
};
```

### 2. File Naming

```typescript
// The utility automatically generates unique names
const options = {
  folder: 'uploads',
  filename: 'user-document.pdf', // Will become: user-document_uuid.pdf
  preserveOriginalName: false, // Set to true to keep exact name
};
```

### 3. Cleanup Operations

```typescript
// Clean up temporary files
async cleanupTempFiles(sessionId: string) {
  const files = await this.s3StorageService.listFiles(\`temp/\${sessionId}/\`);
  const keys = files.files.map(f => f.key);
  await this.s3StorageService.deleteMultipleFiles(keys);
}
```

### 4. Using with Database

```typescript
// Store S3 key in database for later reference
@Entity()
export class Document {
  @Column()
  title: string;
  
  @Column()
  s3Key: string; // Store the S3 key
  
  @Column()
  s3Url: string; // Store the URL
  
  @Column()
  fileSize: number;
  
  @Column()
  mimeType: string;
}

// In your service
async saveDocument(file: MulterFile, title: string) {
  const uploadResult = await this.fileUploadHelper.uploadSingleFile(file);
  
  const document = new Document();
  document.title = title;
  document.s3Key = uploadResult.key;
  document.s3Url = uploadResult.url;
  document.fileSize = uploadResult.size;
  document.mimeType = file.mimetype;
  
  return this.documentRepository.save(document);
}
```

## Testing the API

You can test the storage functionality using the built-in endpoints:

```bash
# Upload a single file
curl -X POST http://localhost:3000/storage/upload/single \\
  -F "file=@/path/to/your/file.jpg" \\
  -F "folder=test-uploads"

# Upload an image
curl -X POST http://localhost:3000/storage/upload/image \\
  -F "image=@/path/to/image.jpg"

# Get file info
curl http://localhost:3000/storage/file/test-uploads%2Ffilename.jpg/info

# Delete a file
curl -X DELETE http://localhost:3000/storage/file/test-uploads%2Ffilename.jpg
```

## Troubleshooting

### Common Issues

1. **AWS Credentials**: Ensure your AWS credentials are correctly configured
2. **Bucket Permissions**: Verify your S3 bucket has appropriate permissions
3. **CORS**: Configure CORS if accessing from frontend applications
4. **File Size Limits**: Check both application and AWS limits

### Debug Mode

Enable debug logging by setting the log level in your application.

---

This utility provides a production-ready solution for S3 storage operations in your NestJS application. All functions include proper error handling, logging, and TypeScript typing for a robust development experience.
