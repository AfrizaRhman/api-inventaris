# Public File Access Examples

## Overview
Files uploaded using the S3 storage utility are now automatically set to `public-read` ACL, making them accessible via direct URLs without authentication.

## Contabo Object Storage URL Format
For your Contabo setup, files will be accessible at:
```
https://usc1.contabostorage.com/hightech-dev/folder/filename.ext
```

## Usage Examples

### 1. Upload Image with Public Access
```typescript
@Post('upload/image')
@UploadImage('image')
async uploadImage(@UploadedFile() file: MulterFile) {
  const result = await this.fileUploadHelper.uploadSingleFile(
    file,
    FileUploadHelper.UPLOAD_CONFIGS.PROPERTY_IMAGES
  );

  return {
    message: 'Image uploaded successfully',
    data: {
      ...result,
      publicUrl: this.s3StorageService.getPublicUrl(result.key),
    }
  };
}
```

### 2. Make Existing File Public
```typescript
// Make an existing file publicly accessible
await this.s3StorageService.makeFilePublic('properties/my-image.jpg');

// Get the public URL
const publicUrl = this.s3StorageService.getPublicUrl('properties/my-image.jpg');
```

### 3. Upload with Guaranteed Public Access
```typescript
const result = await this.s3StorageService.uploadPublicFile(
  fileBuffer,
  {
    folder: 'public-images',
    filename: 'my-public-image.jpg',
    contentType: 'image/jpeg'
  }
);

console.log('Public URL:', result.url);
```

### 4. Upload Private File (Override Default)
```typescript
import { ObjectCannedACL } from '@aws-sdk/client-s3';

const result = await this.s3StorageService.uploadFile(
  fileBuffer,
  {
    folder: 'private-docs',
    filename: 'confidential.pdf',
    contentType: 'application/pdf',
    acl: ObjectCannedACL.private  // Override default public-read
  }
);
```

## Public URL Examples

### Contabo Object Storage URLs
```typescript
// Property image
https://usc1.contabostorage.com/hightech-dev/properties/uuid-filename.jpg

// Avatar image  
https://usc1.contabostorage.com/hightech-dev/avatars/uuid-avatar.png

// Document
https://usc1.contabostorage.com/hightech-dev/documents/uuid-document.pdf
```

## Important Notes

1. **Default Behavior**: All files are now uploaded with `public-read` ACL by default
2. **Bucket Permissions**: Ensure your Contabo bucket allows public read access
3. **Security**: Only upload files that should be publicly accessible
4. **Override**: You can override the ACL for specific uploads if needed

## Bucket Configuration

For Contabo Object Storage, ensure your bucket policy allows public read access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::hightech-dev/*"
    }
  ]
}
```

## Testing Public Access

After uploading a file, you can test public access by:

1. Getting the public URL from the upload response
2. Opening the URL in a browser
3. Verifying the file loads without authentication

Example response:
```json
{
  "message": "Image uploaded successfully",
  "data": {
    "key": "properties/12345678-1234-1234-1234-123456789abc-image.jpg",
    "url": "https://usc1.contabostorage.com/hightech-dev/properties/12345678-1234-1234-1234-123456789abc-image.jpg",
    "bucket": "hightech-dev",
    "location": "s3://hightech-dev/properties/12345678-1234-1234-1234-123456789abc-image.jpg",
    "etag": "\"1234567890abcdef\"",
    "size": 156789,
    "publicUrl": "https://usc1.contabostorage.com/hightech-dev/properties/12345678-1234-1234-1234-123456789abc-image.jpg"
  }
}
```
