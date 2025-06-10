import { Logger } from 'library/tools/logger';

import { createPostgresContext } from '../database/clients/postgresql';
import { getEnvironment } from '../lib/environment';
import { startServer } from '../server/express';

const environment = getEnvironment();

const logger = new Logger({
  style: environment.node === 'development' ? 'colorful' : 'default',
  level: environment.node === 'development' ? 'info' : 'error',
});

const postgres = await createPostgresContext(logger);

export default startServer(postgres, logger);
