import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import type { ApiError } from '../types/api.types';
import { env } from '../config/env';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err.name === 'Neo4jError' || err.code === 'ServiceUnavailable') {
    statusCode = 503;
    code = 'DB_CONNECTION_ERROR';
    message = 'Database is currently unavailable';
  } else if (err.name === 'ZodError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
  } else if (err instanceof Error) {
    message = env.NODE_ENV === 'development' ? err.message : message;
  }

  // Log server errors for debugging
  if (statusCode >= 500) {
    console.error('Server Error:', err);
  }

  const response: ApiError = {
    success: false,
    error: {
      code,
      message,
    },
  };

  res.status(statusCode).json(response);
};
