export type AppErrorCode =
  | 'SERVICE_NOT_FOUND'
  | 'TEAM_NOT_FOUND'
  | 'INCIDENT_NOT_FOUND'
  | 'DB_CONNECTION_ERROR'
  | 'QUERY_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  public readonly isOperational = true;

  public constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: AppErrorCode,
  ) {
    super(message);
    this.name = 'AppError';
  }

  public static notFound(entity: string, id: string): AppError {
    return new AppError(`No ${entity} found with id: ${id}`, 404, 'NOT_FOUND');
  }

  public static dbError(error: unknown): AppError {
    const message = error instanceof Error ? error.message : 'Database connection failed';

    return new AppError(
      `Database is currently unavailable: ${message}`,
      503,
      'DB_CONNECTION_ERROR',
    );
  }

  public static validationError(message: string): AppError {
    return new AppError(message, 400, 'VALIDATION_ERROR');
  }
}

export const notFound = AppError.notFound;
export const dbError = AppError.dbError;
export const validationError = AppError.validationError;
