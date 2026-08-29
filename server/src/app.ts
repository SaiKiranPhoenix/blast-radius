import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

import servicesRouter from './routes/services.routes';
import teamsRouter from './routes/teams.routes';
import incidentsRouter from './routes/incidents.routes';
import graphRouter from './routes/graph.routes';
import healthRouter from './routes/health.routes';

export const app = express();

app.use(
  cors({
    origin: env.CLIENT_ORIGIN ?? 'http://localhost:5173',
    methods: ['GET'],
    allowedHeaders: ['Content-Type'],
  }),
);

app.use(express.json());
app.use(requestLogger);

app.use('/health', healthRouter);
app.use('/api/services', servicesRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/graph', graphRouter);

app.use(notFound);
app.use(errorHandler);
