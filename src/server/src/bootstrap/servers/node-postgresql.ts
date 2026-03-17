import { createPostgresContext } from 'server/infrastructure/database/clients/postgresql';
import { getEnvironment } from 'server/library/environment';
import { Logger } from 'library/tools/logger';

import { startServer } from '../express';

const environment = getEnvironment();

const logger = new Logger({
  style: environment.node === 'development' ? 'colorful' : 'default',
  level: environment.node === 'development' ? 'info' : 'error',
});

const postgres = await createPostgresContext(logger);

export default startServer(postgres, logger);
