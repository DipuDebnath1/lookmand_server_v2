/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import fs from 'fs';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express';
import httpStatus from 'http-status';
import multer, { StorageEngine } from 'multer';
import path from 'path';
import AppError from '../../app/ErrorHandler/AppError';
import config from '../../config';

// Define the type for the UPLOADS_FOLDER parameter

// const localFileUploadDestination = `./public`;
const localFileUploadDestination = `./public`;

export default function (UPLOADS_FOLDER: string): multer.Multer {
  // Define storage configuration for multer using diskStorage
  const storage: StorageEngine = multer.diskStorage({
    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void,
    ) => {
      const fullPath = path.join(localFileUploadDestination, UPLOADS_FOLDER);

      // ✅ Check if folder exists — if not, create it (including nested directories)
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }

      cb(null, fullPath);
    },

    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void,
    ) => {
      const fileExt = path.extname(file.originalname);
      const filename =
        file.originalname
          .replace(fileExt, '')
          .toLowerCase() // Fixed typo: toLocaleLowerCase -> toLowerCase
          .split(' ')
          .join('-') +
        '-' +
        Date.now();

      cb(null, filename + fileExt); // Final filename with extension
    },
  });

  // Define multer middleware options
  const upload = multer({
    storage,
    limits: {
      fileSize: Number(config.file.MaxFileSizeLimit) * 1024 * 1024, // Max allowed file size: 500MB
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: any) => {
      const isImage = [
        'image/jpg',
        'image/png',
        'image/jpeg',
        'image/heic',
        'image/heif',
      ].includes(file.mimetype);

      const isVideo = ['video/mp4', 'video/mkv', 'video/mov'].includes(
        file.mimetype,
      );

      // Check if the file is either an image or a video
      if (!isImage && !isVideo)
        return cb(
          new AppError(
            httpStatus.BAD_REQUEST,
            'Only jpg, png, jpeg, heic, heif, mp4, mkv, mov formats are allowed!',
          ),
          false,
        );
      cb(null, true); // Accept the file

      // // Now enforce per-type size using req.headers['content-length']
      // const contentLength = Number(req.headers['content-length'] || 0);

      // // image size limit check
      // if (isImage) {
      //   const limit =
      //     Number(config.file.imageFileSizeLimit || 10) * 1024 * 1024;
      //   if (contentLength > limit) {
      //     return cb(
      //       new AppError(httpStatus.BAD_REQUEST, 'Image size exceeds limit'),
      //       false,
      //     );
      //   } else {
      //     cb(null, true); // Accept the file
      //   }
      // }

      // // video size limit check
      // if (isVideo) {
      //   const limit =
      //     Number(config.file.videoFileSizeLimit || 200) * 1024 * 1024;
      //   if (contentLength > limit) {
      //     return cb(
      //       new AppError(httpStatus.BAD_REQUEST, 'Video size exceeds limit'),
      //       false,
      //     );
      //   } else {
      //     cb(null, true); // Accept the file
      //   }
      // }
    },
  });

  return upload; // Return the configured multer upload middleware
}
