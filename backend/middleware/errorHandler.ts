import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/httpErrors';

interface ErrorResponse {
  status: string;
  message: string;
  stack?: string;
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err);

  const statusCode = err instanceof HttpError ? err.statusCode : 500;

  const response: ErrorResponse = {
    status: 'error',
    message: err instanceof Error ? err.message : 'Internal Server Error',
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err instanceof Error ? err.stack : undefined;
  }

  res.status(statusCode).json(response);
};
