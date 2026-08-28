import { describe, expect, it } from 'vitest';
import { AppError, dbError, notFound, validationError } from '../../../src/utils/AppError';

describe('AppError', () => {
  it('creates service not found errors', () => {
    expect(notFound('service', 'svc-missing')).toMatchObject({
      message: 'No service found with id: svc-missing',
      statusCode: 404,
      code: 'SERVICE_NOT_FOUND',
    });
  });

  it('creates database errors', () => {
    expect(dbError(new Error('offline'))).toMatchObject({
      statusCode: 503,
      code: 'DB_CONNECTION_ERROR',
      message: 'Database is currently unavailable: offline',
    });
  });

  it('creates validation errors', () => {
    expect(validationError('bad query')).toEqual(
      new AppError('bad query', 400, 'VALIDATION_ERROR'),
    );
  });
});
