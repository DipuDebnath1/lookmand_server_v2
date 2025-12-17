import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';
import config from '../config'; // Assuming config is an external config file

// Type definition for the config file (if you don't already have it)
interface AwsConfig {
  aws: {
    bucketRegion?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
  };
}

const awsConfig: AwsConfig = config; // Ensuring config has the correct types

// Create an S3 client instance with proper typing
const s3: S3Client = new S3Client({
  region: awsConfig.aws.bucketRegion,
  credentials: {
    accessKeyId: awsConfig.aws.accessKeyId,
    secretAccessKey: awsConfig.aws.secretAccessKey,
  },
} as S3ClientConfig); // Type assertion to ensure compatibility with S3ClientConfig

export default s3;
