import { ZodError } from 'zod';
import { IErrorMessage } from '../../types/errors.types';

const handleZodError = (error: ZodError) => {
  const errorMessages: IErrorMessage[] = error.errors.map((el) => {
    return {
      path: el.path[el.path.length - 1],
      message: el.message,
    };
  });

  // console.log({ from: 'from zod hander', errorMessages });

  const code = 400;
  return {
    code,
    message: 'Zod Validation Error',
    errorMessages,
  };
};

export default handleZodError;
