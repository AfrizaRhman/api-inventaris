/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
  PutObjectAclCommand,
  PutObjectCommandInput,
  DeleteObjectCommandInput,
  GetObjectCommandInput,
  HeadObjectCommandInput,
  ListObjectsV2CommandInput,
  CopyObjectCommandInput,
  PutObjectAclCommandInput,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export interface S3UploadOptions {
  folder?: string;
  filename?: string;
  contentType?: string;
  acl?: ObjectCannedACL;
  metadata?: Record<string, string>;
  tags?: Record<string, string>;
  preserveOriginalName?: boolean;
}

export interface S3UploadResult {
  key: string;
  url: string;
  bucket: string;
  location: string;
  etag: string;
  size: number;
}

export interface S3FileInfo {
  key: string;
  size: number;
  lastModified: Date;
  etag: string;
  contentType: string;
  metadata?: Record<string, string>;
}

export interface S3ListResult {
  files: S3FileInfo[];
  hasMore: boolean;
  nextContinuationToken?: string;
}

export interface S3PresignedUrlOptions {
  expiresIn?: number; // seconds
  contentType?: string;
  contentDisposition?: string;
}

@Injectable()
export class S3StorageService {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly s3Client: S3Client;
  private readonly defaultBucket: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const bucket = this.configService.get<string>('AWS_S3_BUCKET');
    const endpoint = this.configService.get<string>('AWS_S3_ENDPOINT');
    const forcePathStyle = this.configService.get<string>('AWS_S3_FORCE_PATH_STYLE') === 'true';

    if (!bucket) {
      throw new Error('AWS_S3_BUCKET environment variable is required');
    }

    this.defaultBucket = bucket;

    this.s3Client = new S3Client({
      region,
      endpoint, // Custom endpoint for S3-compatible services like Contabo
      forcePathStyle, // Required for some S3-compatible services
      credentials: accessKeyId && secretAccessKey ? {
        accessKeyId,
        secretAccessKey,
      } : undefined, // Use IAM role if credentials not provided
    });

    const storageType = endpoint ? 'S3-compatible storage' : 'AWS S3';
    this.logger.log(`S3StorageService initialized with ${storageType}, bucket: ${this.defaultBucket}`);
  }

  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: Buffer | Uint8Array | string,
    options: S3UploadOptions = {},
    bucket?: string,
  ): Promise<S3UploadResult> {
    try {
      const targetBucket = bucket || this.defaultBucket;
      const key = this.generateFileKey(options);
      
      const uploadParams: PutObjectCommandInput = {
        Bucket: targetBucket,
        Key: key,
        Body: file,
        ContentType: options.contentType || 'application/octet-stream',
        ACL: options.acl || ObjectCannedACL.public_read, // Default to public-read for easy access
        Metadata: options.metadata,
      };

      const command = new PutObjectCommand(uploadParams);
      const result = await this.s3Client.send(command);

      const url = this.getPublicUrl(key, targetBucket);
      const location = `s3://${targetBucket}/${key}`;

      this.logger.log(`File uploaded successfully to ${location}`);

      return {
        key,
        url,
        bucket: targetBucket,
        location,
        etag: result.ETag || '',
        size: Buffer.isBuffer(file) ? file.length : file.toString().length,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to upload file: ${errorMessage}`,
        errorStack,
      );
      throw new Error(`S3 upload failed: ${errorMessage}`);
    }
  }

  /**
   * Upload multiple files to S3
   */
  async uploadMultipleFiles(
    files: Array<{ buffer: Buffer | Uint8Array; options: S3UploadOptions }>,
    bucket?: string,
  ): Promise<S3UploadResult[]> {
    try {
      const uploadPromises = files.map(({ buffer, options }) =>
        this.uploadFile(buffer, options, bucket),
      );

      const results = await Promise.all(uploadPromises);
      this.logger.log(`Successfully uploaded ${results.length} files`);
      
      return results;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to upload multiple files: ${errorMessage}`,
        errorStack,
      );
      throw new Error(`S3 multiple upload failed: ${errorMessage}`);
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(key: string, bucket?: string): Promise<void> {
    try {
      const targetBucket = bucket || this.defaultBucket;
      
      const deleteParams: DeleteObjectCommandInput = {
        Bucket: targetBucket,
        Key: key,
      };

      const command = new DeleteObjectCommand(deleteParams);
      await this.s3Client.send(command);

      this.logger.log(`File deleted successfully: s3://${targetBucket}/${key}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to delete file: ${errorMessage}`, errorStack);
      throw new Error(`S3 delete failed: ${errorMessage}`);
    }
  }

  /**
   * Delete multiple files from S3
   */
  async deleteMultipleFiles(keys: string[], bucket?: string): Promise<void> {
    try {
      const deletePromises = keys.map((key) => this.deleteFile(key, bucket));
      await Promise.all(deletePromises);
      
      this.logger.log(`Successfully deleted ${keys.length} files`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to delete multiple files: ${errorMessage}`,
        errorStack,
      );
      throw new Error(`S3 multiple delete failed: ${errorMessage}`);
    }
  }

  /**
   * Get a file from S3
   */
  async getFile(key: string, bucket?: string): Promise<Buffer> {
    try {
      const targetBucket = bucket || this.defaultBucket;
      
      const getParams: GetObjectCommandInput = {
        Bucket: targetBucket,
        Key: key,
      };

      const command = new GetObjectCommand(getParams);
      const result = await this.s3Client.send(command);

      if (!result.Body) {
        throw new Error('File body is empty');
      }

      const chunks: Buffer[] = [];
      const stream = result.Body as any;
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const buffer = Buffer.concat(chunks);
      this.logger.log(`File retrieved successfully: s3://${targetBucket}/${key}`);
      
      return buffer;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to get file: ${errorMessage}`, errorStack);
      throw new Error(`S3 get file failed: ${errorMessage}`);
    }
  }

  /**
   * Check if a file exists in S3
   */
  async fileExists(key: string, bucket?: string): Promise<boolean> {
    try {
      const targetBucket = bucket || this.defaultBucket;
      
      const headParams: HeadObjectCommandInput = {
        Bucket: targetBucket,
        Key: key,
      };

      const command = new HeadObjectCommand(headParams);
      await this.s3Client.send(command);
      
      return true;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'name' in error) {
        const awsError = error as any;
        if (
          awsError.name === 'NotFound' ||
          awsError.$metadata?.httpStatusCode === 404
        ) {
          return false;
        }
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`S3 file exists check failed: ${errorMessage}`);
    }
  }

  /**
   * Get file metadata
   */
  async getFileInfo(key: string, bucket?: string): Promise<S3FileInfo> {
    try {
      const targetBucket = bucket || this.defaultBucket;
      
      const headParams: HeadObjectCommandInput = {
        Bucket: targetBucket,
        Key: key,
      };

      const command = new HeadObjectCommand(headParams);
      const result = await this.s3Client.send(command);

      return {
        key,
        size: result.ContentLength || 0,
        lastModified: result.LastModified || new Date(),
        etag: result.ETag || '',
        contentType: result.ContentType || 'application/octet-stream',
        metadata: result.Metadata,
      };
    } catch (error) {
      this.logger.error(`Failed to get file info: ${error.message}`, error.stack);
      throw new Error(`S3 get file info failed: ${error.message}`);
    }
  }

  /**
   * List files in a S3 bucket/folder
   */
  async listFiles(
    prefix?: string,
    bucket?: string,
    maxKeys?: number,
    continuationToken?: string,
  ): Promise<S3ListResult> {
    try {
      const targetBucket = bucket || this.defaultBucket;
      
      const listParams: ListObjectsV2CommandInput = {
        Bucket: targetBucket,
        Prefix: prefix,
        MaxKeys: maxKeys || 1000,
        ContinuationToken: continuationToken,
      };

      const command = new ListObjectsV2Command(listParams);
      const result = await this.s3Client.send(command);

      const files: S3FileInfo[] = (result.Contents || []).map(object => ({
        key: object.Key || '',
        size: object.Size || 0,
        lastModified: object.LastModified || new Date(),
        etag: object.ETag || '',
        contentType: 'application/octet-stream', // S3 list doesn't return content type
      }));

      return {
        files,
        hasMore: result.IsTruncated || false,
        nextContinuationToken: result.NextContinuationToken,
      };
    } catch (error) {
      this.logger.error(`Failed to list files: ${error.message}`, error.stack);
      throw new Error(`S3 list files failed: ${error.message}`);
    }
  }

  /**
   * Copy a file within S3
   */
  async copyFile(
    sourceKey: string,
    destinationKey: string,
    sourceBucket?: string,
    destinationBucket?: string,
  ): Promise<void> {
    try {
      const srcBucket = sourceBucket || this.defaultBucket;
      const destBucket = destinationBucket || this.defaultBucket;
      
      const copyParams: CopyObjectCommandInput = {
        Bucket: destBucket,
        Key: destinationKey,
        CopySource: `${srcBucket}/${sourceKey}`,
      };

      const command = new CopyObjectCommand(copyParams);
      await this.s3Client.send(command);

      this.logger.log(`File copied from s3://${srcBucket}/${sourceKey} to s3://${destBucket}/${destinationKey}`);
    } catch (error) {
      this.logger.error(`Failed to copy file: ${error.message}`, error.stack);
      throw new Error(`S3 copy file failed: ${error.message}`);
    }
  }

  /**
   * Move a file within S3 (copy then delete)
   */
  async moveFile(
    sourceKey: string,
    destinationKey: string,
    sourceBucket?: string,
    destinationBucket?: string,
  ): Promise<void> {
    try {
      await this.copyFile(sourceKey, destinationKey, sourceBucket, destinationBucket);
      await this.deleteFile(sourceKey, sourceBucket);
      
      this.logger.log(`File moved from ${sourceKey} to ${destinationKey}`);
    } catch (error) {
      this.logger.error(`Failed to move file: ${error.message}`, error.stack);
      throw new Error(`S3 move file failed: ${error.message}`);
    }
  }

  /**
   * Generate a presigned URL for file upload
   */
  async generatePresignedUploadUrl(
    key: string,
    options: S3PresignedUrlOptions = {},
    bucket?: string,
  ): Promise<string> {
    try {
      const targetBucket = bucket || this.defaultBucket;
      const expiresIn = options.expiresIn || 3600; // 1 hour default
      
      const putParams: PutObjectCommandInput = {
        Bucket: targetBucket,
        Key: key,
        ContentType: options.contentType,
        ContentDisposition: options.contentDisposition,
      };

      const command = new PutObjectCommand(putParams);
      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      this.logger.log(`Generated presigned upload URL for: ${key}`);
      return presignedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate presigned upload URL: ${error.message}`, error.stack);
      throw new Error(`S3 presigned upload URL generation failed: ${error.message}`);
    }
  }

  /**
   * Generate a presigned URL for file download
   */
  async generatePresignedDownloadUrl(
    key: string,
    options: S3PresignedUrlOptions = {},
    bucket?: string,
  ): Promise<string> {
    try {
      const targetBucket = bucket || this.defaultBucket;
      const expiresIn = options.expiresIn || 3600; // 1 hour default
      
      const getParams: GetObjectCommandInput = {
        Bucket: targetBucket,
        Key: key,
        ResponseContentDisposition: options.contentDisposition,
      };

      const command = new GetObjectCommand(getParams);
      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      this.logger.log(`Generated presigned download URL for: ${key}`);
      return presignedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate presigned download URL: ${error.message}`, error.stack);
      throw new Error(`S3 presigned download URL generation failed: ${error.message}`);
    }
  }

  /**
   * Get the public URL for a file (if bucket allows public access)
   */
  getPublicUrl(key: string, bucket?: string): string {
    const targetBucket = bucket || this.defaultBucket;
    const endpoint = this.configService.get<string>('AWS_S3_ENDPOINT');
    const forcePathStyle = this.configService.get<string>('AWS_S3_FORCE_PATH_STYLE') === 'true';
    const contaboPublicUrlId = this.configService.get<string>('CONTABO_PUBLIC_URL_ID');
    
    if (endpoint) {
      // For Contabo Object Storage, use the special public URL format with identifier
      if (contaboPublicUrlId && endpoint.includes('contabostorage.com')) {
        return `${endpoint}/${contaboPublicUrlId}:${targetBucket}/${key}`;
      }
      
      // For other custom endpoints, use path-style URLs
      if (forcePathStyle) {
        return `${endpoint}/${targetBucket}/${key}`;
      } else {
        // Virtual-hosted-style URL for custom endpoints
        const baseUrl = endpoint.replace('https://', '').replace('http://', '');
        return `https://${targetBucket}.${baseUrl}/${key}`;
      }
    } else {
      // Default AWS S3 URL format
      return `https://${targetBucket}.s3.amazonaws.com/${key}`;
    }
  }

  /**
   * Generate a unique file key
   */
  private generateFileKey(options: S3UploadOptions): string {
    const folder = options.folder ? `${options.folder}/` : '';
    
    if (options.filename) {
      if (options.preserveOriginalName) {
        return `${folder}${options.filename}`;
      }
      
      const ext = path.extname(options.filename);
      const name = path.basename(options.filename, ext);
      return `${folder}${name}_${uuidv4()}${ext}`;
    }
    
    return `${folder}${uuidv4()}`;
  }

  /**
   * Make an existing file publicly accessible
   */
  async makeFilePublic(key: string, bucket?: string): Promise<void> {
    try {
      const targetBucket = bucket || this.defaultBucket;
      
      const aclParams: PutObjectAclCommandInput = {
        Bucket: targetBucket,
        Key: key,
        ACL: ObjectCannedACL.public_read,
      };

      const command = new PutObjectAclCommand(aclParams);
      await this.s3Client.send(command);
      
      this.logger.log(`File made public: s3://${targetBucket}/${key}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to make file public: ${errorMessage}`, errorStack);
      throw new Error(`S3 make file public failed: ${errorMessage}`);
    }
  }

  /**
   * Upload a file and ensure it's publicly accessible
   */
  async uploadPublicFile(
    file: Buffer | Uint8Array | string,
    options: S3UploadOptions = {},
    bucket?: string,
  ): Promise<S3UploadResult> {
    // Ensure the file is uploaded with public-read ACL
    const uploadOptions = {
      ...options,
      acl: ObjectCannedACL.public_read,
    };
    
    return this.uploadFile(file, uploadOptions, bucket);
  }


  /**
   * Get the underlying S3 client (for advanced operations)
   */
  getS3Client(): S3Client {
    return this.s3Client;
  }

  /**
   * Get the default bucket name
   */
  getDefaultBucket(): string {
    return this.defaultBucket;
  }
}
