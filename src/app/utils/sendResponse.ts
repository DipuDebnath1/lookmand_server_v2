import { Response } from 'express';
type TToken = {
  accessToken: string;
  refreshToken: string;
};

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  data: T;
  tokens?: TToken;
};

const sendResponse = <T>(res: Response, responseData: TResponse<T>) => {
  res.status(responseData.statusCode).json({
    success: responseData.success,
    code: responseData.statusCode,
    message: responseData.message,
    data: responseData.data,
    tokens: responseData.tokens,
  });
};

export default sendResponse;
