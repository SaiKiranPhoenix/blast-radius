import { app } from './app';
import { env } from './config/env';
import { closeDriver } from './config/neo4j';

const PORT = env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const shutdown = async () => {
  console.log('Shutting down server...');
  await closeDriver();
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
