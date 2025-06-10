import type { Logger } from 'library/tools/logger';

import fs from 'node:fs/promises';
import { globby } from 'globby';
import esbuild from 'esbuild';
import path from 'node:path';

import { addJsExtensionPlugin } from './add-js-plugin';

/**
 * Detect the Node.js version target from package.json `engines.node` field.
 * Defaults to `node18` if not found or malformed.
 */
async function getNodeTarget(): Promise<string> {
  try {
    const file = await fs.readFile('package.json', 'utf8');

    const packageJson = JSON.parse(file) as { engines: { node: string } };

    const nodeEngine = packageJson.engines.node;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const match = /(\d+)/.exec(nodeEngine)!;

    const version = match[1] ?? '18';

    return `node${version}`;
  } catch {
    return 'node18';
  }
}

/**
 * Deletes the `dist` directory and all its contents.
 */
async function cleanDistribution(logger: Logger) {
  const distributionDirectory = path.resolve('dist');

  try {
    await fs.rm(distributionDirectory, { recursive: true, force: true });

    logger.info('Cleaned dist directory.');
  } catch (error) {
    logger.error('Failed to clean dist directory.', error);
  }
}

export async function build(pattern: string, logger: Logger) {
  const target = await getNodeTarget();

  const entryPoints = await globby(pattern, {
    gitignore: true,
    absolute: false,
  });

  if (entryPoints.length === 0) {
    throw new Error(`No entry points found in ${pattern}.`);
  }

  await cleanDistribution(logger);

  await esbuild.build({
    plugins: [addJsExtensionPlugin()],
    tsconfig: './tsconfig.json',
    packages: 'external',
    allowOverwrite: true,
    platform: 'node',
    sourcemap: true,
    outdir: 'dist',
    format: 'esm',
    bundle: true,
    entryPoints,
    target,
  });

  logger.success(
    `Build completed. Target: ${target}. Files: ${entryPoints.length.toString()}.`,
  );
}
