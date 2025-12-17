/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */

// module.exports = s3Uploader;
import { Request } from 'express';
import httpStatus from 'http-status';
import multer, { StorageEngine } from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import AppError from '../../app/ErrorHandler/AppError';
import s3Client from '../../config/aws.config'; // Import the S3 client instance
import config from '../../config';

// Define the accepted file types for fileFilter
// type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

interface FileUploadOptions {
  folderName: string;
}

const s3Uploader = ({ folderName = 'others' }: FileUploadOptions) => {
  // The multer storage engine configuration for S3
  const storage: StorageEngine = multerS3({
    s3: s3Client as any,
    bucket: process.env.AWS_S3_BUCKET_NAME as string,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (
      req: Request,
      file: Express.Multer.File,

      cb: Function,
    ): void {
      const ext = path.extname(file.originalname.trim());
      const originalName = file.originalname.replace(/\s+/g, '-'); // Replace spaces with dashes
      const fileName = `${originalName.replace(ext, '')}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
      const fullPath = `${folderName}/${fileName}`;
      cb(null, fullPath); // Upload to S3 path like "events/..."
    },
  });

  // Define multer middleware options
  const upload = multer({
    storage,
    limits: { fileSize: Number(config.file.imageFileSizeLimit) * 1024 * 1024 }, // max allowed file size: 5 MB
    fileFilter: (req: Request, file: Express.Multer.File, cb: any) => {
      if (
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/heic' ||
        file.mimetype === 'image/heif'
      ) {
        cb(null, true); // Accept the file
      } else {
        cb(
          new AppError(
            httpStatus.BAD_REQUEST,
            'Only jpg, jpeg, png, heic, and heif formats are allowed!',
          ),
          false,
        ); // Reject the file
      }
    },
  });

  return upload;
};

export default s3Uploader;
