/* eslint-disable no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */

import { ErrorRequestHandler } from 'express';
import { IErrorMessage } from '../types/errors.types';
import config from '../config';
import handleZodError from '../app/ErrorHandler/handleZodError';
import handleValidationError from '../app/ErrorHandler/handleValidationError';
import handleDuplicateError from '../app/ErrorHandler/handleDuplicateError';
import AppError from '../app/ErrorHandler/AppError';
import { logger } from '../app/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (config.node === 'development') {
    // eslint-disable-next-line no-console
    console.log('🚨 globalErrorHandler ~~ ', error);
  } else logger.error('🚨 globalErrorHandler ~~ ', error);

  let code = 500;
  let message = 'Something went wrong';
  let errorMessages: IErrorMessage[] = [];

  // Handle ZodError
  if (error.name === 'ZodError') {
    const simplifiedError = handleZodError(error);
    code = simplifiedError.code;
    message = `${simplifiedError.errorMessages
      .map((err) => `${err.path + ' ' + err.message}`)
      .join(', ')}`;
    errorMessages = simplifiedError.errorMessages;
  }
  // Handle ValidationError (e.g., Mongoose)
  else if (error.name === 'ValidationError') {
    const simplifiedError = handleValidationError(error);
    code = simplifiedError.code;
    message = `${simplifiedError.errorMessages
      .map((err) => err.message)
      .join(', ')}`;

    errorMessages = simplifiedError.errorMessages;
  }
  // Handle DuplicateError (e.g., from database unique constraint violation)
  else if (error.name === 'DuplicateError') {
    const simplifiedError = handleDuplicateError(error);
    code = simplifiedError.code;
    message = `${simplifiedError.errorMessages
      .map((err) => err.message)
      .join(', ')}`;
    errorMessages = simplifiedError.errorMessages;
  } else if (error.name === 'MongoServerError') {
    const simplifiedError = handleDuplicateError(error);
    code = simplifiedError.code;
    message = `${simplifiedError.errorMessages
      .map((err) => err.message)
      .join(', ')}`;
    errorMessages = simplifiedError.errorMessages;
  }
  // Handle ApiError (custom error type)
  else if (error instanceof AppError) {
    code = error.statusCode;
    message = error.message || 'Something went wrong';
    errorMessages = error.message
      ? [
          {
            path: '',
            message: error.message,
          },
        ]
      : [];
  }
  // Handle other general errors
  else if (error instanceof Error) {
    message = error.message || 'Internal Server Error';
    errorMessages = error.message
      ? [
          {
            path: '',
            message: error.message,
          },
        ]
      : [];
  }

  // Format multiple error messages as a comma-separated list in the message field
  const formattedMessage =
    errorMessages.length > 1
      ? errorMessages.map((err) => err.path + ' ' + err.message).join(', ')
      : message;

  // Send response with statusCode, success, message, and error
  res.status(code).json({
    code,
    message: `${formattedMessage}`,
    error: errorMessages,
    stack: config.node === 'development' ? error?.stack : undefined,
  });
};

export default globalErrorHandler;
