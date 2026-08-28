import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { errorHandler } from '../../../src/middleware/errorHandler';
import { AppError } from '../../../src/utils/AppError';

describe('errorHandler', () => {
  let status: ReturnType<typeof vi.fn>;
  let json: ReturnType<typeof vi.fn>;
  let response: Response;

  beforeEach(() => {
    status = vi.fn().mockReturnThis();
    json = vi.fn().mockReturnThis();
    response = { status, json } as unknown as Response;
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('passes AppError status and code through', () => {
    errorHandler(
      new AppError('Missing service', 404, 'SERVICE_NOT_FOUND'),
      {} as Request,
      response,
      vi.fn() as NextFunction,
    );

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'SERVICE_NOT_FOUND',
        message: 'Missing service',
      },
    });
  });

  it('maps Neo4j service errors to DB_CONNECTION_ERROR', () => {
    errorHandler(
      { name: 'Neo4jError', code: 'ServiceUnavailable' },
      {} as Request,
      response,
      vi.fn() as NextFunction,
    );

    expect(status).toHaveBeenCalledWith(503);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'DB_CONNECTION_ERROR',
        message: 'Database is currently unavailable',
      },
    });
  });

  it('maps unknown errors to INTERNAL_ERROR', () => {
    errorHandler(new Error('boom'), {} as Request, response, vi.fn() as NextFunction);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: expect.any(String),
      },
    });
  });
});
