import { Response } from 'express';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
) => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

export const sendError = (res: Response, message: string, statusCode: number) => {
  res.status(statusCode).json({
    status: 'error',
    message,
  });
};
