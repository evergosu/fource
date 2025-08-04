import { createPostgresContext } from 'server/database/clients/postgresql';
import { getEnvironment } from 'server/library/environment';
import { startServer } from 'server/server/express';
import { Logger } from 'library/tools/logger';

const environment = getEnvironment();

const logger = new Logger({
  style: environment.node === 'development' ? 'colorful' : 'default',
  level: environment.node === 'development' ? 'info' : 'error',
});

const postgres = await createPostgresContext(logger);

export default startServer(postgres, logger);
