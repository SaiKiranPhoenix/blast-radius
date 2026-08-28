import morgan from 'morgan';
import { env } from '../config/env';

const format = env.NODE_ENV === 'production' ? 'combined' : 'dev';

export const requestLogger = morgan(format, {
  skip: (req) => req.url === '/health' && env.NODE_ENV !== 'development', // Don't spam health check logs in prod
});
