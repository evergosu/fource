import { createPostgresLiteContext } from 'server/database/clients/pglite';
import { getEnvironment } from 'server/library/environment';
import { startServer } from 'server/server/express';
import { Logger } from 'library/tools/logger';

const environment = getEnvironment();

const logger = new Logger({
  style: environment.node === 'development' ? 'colorful' : 'default',
  level: environment.node === 'development' ? 'info' : 'error',
});

const pglite = await createPostgresLiteContext(logger);

export default startServer(pglite, logger);
