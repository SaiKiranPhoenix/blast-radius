import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import type { ApiError } from '../types/api.types';
import { env } from '../config/env';

interface Neo4jLikeError {
  name?: string;
  code?: string;
}

function isNeo4jConnectionError(error: unknown): error is Neo4jLikeError {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const candidate = error as Neo4jLikeError;
  return candidate.name === 'Neo4jError' || candidate.code === 'ServiceUnavailable';
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (isNeo4jConnectionError(err)) {
    statusCode = 503;
    code = 'DB_CONNECTION_ERROR';
    message = 'Database is currently unavailable';
  } else if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.errors.map((error) => `${error.path.join('.')}: ${error.message}`).join(', ');
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
