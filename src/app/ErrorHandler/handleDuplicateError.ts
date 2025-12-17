/* eslint-disable @typescript-eslint/no-explicit-any */
import { IErrorMessage } from '../../types/errors.types';

const handleDuplicateError = (
  error: any,
): { code: number; message: string; errorMessages: IErrorMessage[] } => {
  if (error.code !== 11000 || !error.keyValue) {
    return {
      code: 500,
      message: 'Unexpected duplicate error',
      errorMessages: [
        {
          path: '',
          message: 'An unexpected error occurred while checking for duplicates',
        },
      ],
    };
  }

  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  const friendlyField = field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim(); // e.g., userId -> User ID

  const errorMessages: IErrorMessage[] = [
    {
      path: field,
      message: `${friendlyField} '${value}' already exists`,
    },
  ];

  return {
    code: 409,
    message: `${friendlyField} '${value}' already exists`,
    errorMessages,
  };
};

export default handleDuplicateError;
