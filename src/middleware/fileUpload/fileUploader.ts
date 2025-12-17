// middlewares/fileUploader.ts
import httpStatus from 'http-status';
import AppError from '../../app/ErrorHandler/AppError';
import config from '../../config';
import localUploader from './LocalFileUpload';
import s3Uploader from './S3FileUploadByMulter';

const fileUploader = (folderName = 'others', Destination?: 'AWS' | 'LOCAL') => {
  //
  // AWS upload
  if (Destination && Destination === 'AWS') return s3Uploader({ folderName });
  // local upload
  if (Destination && Destination === 'LOCAL') return localUploader(folderName);

  // Default upload based on config
  if (config.file.UploaderServices === 'AWS') return s3Uploader({ folderName });

  if (config.file.UploaderServices === 'LOCAL')
    return localUploader(folderName);

  throw new AppError(
    httpStatus.BAD_GATEWAY,
    `Invalid uploader service: ${config.file.UploaderServices}`,
  );
};

export default fileUploader;
