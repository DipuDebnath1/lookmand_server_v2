/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../../config';
import AppError from '../../ErrorHandler/AppError';
import httpStatus from 'http-status';

// refresh token decoded
export const accessTokenDecoded = (token: string) => {
  try {
    const decoded = jwt.verify(
      token as string,
      config.tokens.accessTokenSecret,
    ) as JwtPayload;
    return decoded;
  } catch (error: any) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Invalid token: ' + error.message,
    );
  }
};

// refresh token decoded
export const refreshTokenDecoded = (token: string) => {
  try {
    const decoded = jwt.verify(
      token as string,
      config.tokens.refreshTokenSecret,
    ) as JwtPayload;
    return decoded;
  } catch (error: any) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'Invalid token: ' + error.message,
    );
  }
};
