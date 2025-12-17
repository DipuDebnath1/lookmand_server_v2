/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';
import s3Client from '../../config/aws.config';
import { logger } from '../../app/logger';
import process from 'process';
import config from '../../config';
import {
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import mime from 'mime-types';

/**
 * Upload a single file to S3
 */
export const uploadFileToS3 = async (
  filePath: string,
  s3Key: string,
  contentType?: string,
): Promise<string> => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath);
  const detectedContentType =
    contentType || mime.lookup(filePath) || 'application/octet-stream';

  const command = new PutObjectCommand({
    Bucket: config.aws.bucketName,
    Key: s3Key,
    Body: fileContent,
    ContentType: detectedContentType,
    // Cache control for HLS files
    CacheControl: s3Key.endsWith('.m3u8')
      ? 'max-age=60, must-revalidate' // Playlists: 60 seconds
      : s3Key.endsWith('.ts')
        ? 'max-age=31536000, immutable' // Segments: 1 year (immutable)
        : 'max-age=3600', // Other files: 1 hour
  });

  await s3Client.send(command);

  // Return CloudFront URL if configured, otherwise S3 URL
  if (config.aws.cloudfrontUrl) {
    return `${config.aws.cloudfrontUrl}/${s3Key}`;
  }

  return `https://${config.aws.bucketName}.s3.${config.aws.bucketRegion || 'us-east-1'}.amazonaws.com/${s3Key}`;
};

/**
 * Upload an entire directory to S3 (useful for HLS segments)
 */
export const uploadDirectoryToS3 = async (
  localDir: string,
  s3BaseKey: string,
): Promise<Array<{ key: string; url: string }>> => {
  if (!fs.existsSync(localDir)) {
    throw new Error(`Directory not found: ${localDir}`);
  }

  const files = fs.readdirSync(localDir);
  const uploadedFiles: Array<{ key: string; url: string }> = [];

  // Upload files sequentially to avoid overwhelming S3 or memory
  for (const file of files) {
    const filePath = path.join(localDir, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile()) {
      const s3Key = `${s3BaseKey}/${file}`;
      const url = await uploadFileToS3(filePath, s3Key);
      uploadedFiles.push({ key: s3Key, url });
      logger.info(`Uploaded: ${s3Key}`);
    }
  }

  logger.info(`Uploaded ${uploadedFiles.length} files from ${localDir} to S3`);
  return uploadedFiles;
};

/**
 * Delete a file from S3
 */
export const deleteFileFromS3 = async (s3Key: string): Promise<void> => {
  const command = new DeleteObjectCommand({
    Bucket: config.aws.bucketName,
    Key: s3Key,
  });

  await s3Client.send(command);
  logger.info(`Deleted from S3: ${s3Key}`);
};

/**
 * Delete multiple files from S3 (useful for cleanup)
 */
export const deleteFilesFromS3 = async (s3Keys: string[]): Promise<void> => {
  const deletePromises = s3Keys.map((key) => deleteFileFromS3(key));
  await Promise.all(deletePromises);
  logger.info(`Deleted ${s3Keys.length} files from S3`);
};

/**
 * Delete an entire directory from S3 by prefix
 */
export const deleteDirectoryFromS3 = async (
  s3Prefix: string,
): Promise<void> => {
  // Note: For production, implement pagination if you have many files
  // This is a simplified version
  // const { ListObjectsV2Command } = require('@aws-sdk/client-s3');

  const listCommand = new ListObjectsV2Command({
    Bucket: config.aws.bucketName,
    Prefix: s3Prefix,
  });

  const listResult = await s3Client.send(listCommand);

  if (listResult.Contents && listResult.Contents.length > 0) {
    const keys = listResult.Contents.map((obj) => obj.Key!);
    await deleteFilesFromS3(keys);
    logger.info(`Deleted directory from S3: ${s3Prefix}`);
  }
};

/**
 * Cleanup local files after successful S3 upload
 */
export const cleanupLocalFiles = (filePaths: string[]): void => {
  filePaths.forEach((filePath) => {
    try {
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
        logger.info(`Cleaned up local file: ${filePath}`);
      }
    } catch (err: any) {
      logger.warn(`Failed to cleanup ${filePath}: ${err.message}`);
    }
  });
};

/**
 * Get S3 URL for a given key
 */
export const getS3Url = (s3Key: string): string => {
  if (config.aws.cloudfrontUrl) {
    return `${config.aws.cloudfrontUrl}/${s3Key}`;
  }
  return `https://${config.aws.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
};
