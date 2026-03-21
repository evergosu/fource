import { build } from 'library/tools/builder/build';
import { Logger } from 'library/tools/logger';

const logger = new Logger({
  style: 'colorful',
  level: 'info',
});

try {
  await build('src/**/*.ts', logger);
} catch (error: unknown) {
  logger.error('Server build failed, because:', error);
}
