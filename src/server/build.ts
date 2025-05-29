import { Logger } from 'server/lib/logger';
import fs from 'node:fs/promises';
import { globby } from 'globby';
import esbuild from 'esbuild';
import path from 'node:path';

const logger = new Logger({
  style: 'colorful',
  level: 'success',
});

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
 * Rewrites imports to add `.js` extension before final emit.
 */
export function addJsExtensionPlugin(): esbuild.Plugin {
  return {
    setup(build) {
      build.onResolve({ filter: /^[^.].*/ }, arguments_ => {
        // Ignore node_modules and external packages.
        if (
          arguments_.kind === 'import-statement' &&
          !arguments_.path.startsWith('.')
        ) {
          return;
        }

        // Preserve the import path but mark it for post-processing.
        return {
          path: path.resolve(arguments_.resolveDir, arguments_.path),
          namespace: 'add-js-extension',
        };
      });

      build.onLoad(
        { namespace: 'add-js-extension', filter: /.*/ },
        async arguments_ => {
          const tsPath = `${arguments_.path}.ts`;

          const contents = await fs.readFile(tsPath, 'utf8');

          // Rewrite imports to add .js extension.
          const rewritten = contents.replaceAll(
            /from\s+["'](.+?)["']/g,
            (match, p1: string) => {
              if (
                p1.startsWith('.') &&
                !p1.endsWith('.js') &&
                !p1.endsWith('.ts')
              ) {
                return `from "${p1}.js"`;
              }

              return match;
            },
          );

          return {
            resolveDir: path.dirname(tsPath),
            contents: rewritten,
            loader: 'ts',
          };
        },
      );
    },
    name: 'add-js-extension',
  };
}

/**
 * Deletes the `dist` directory and all its contents.
 */
async function cleanDistribution() {
  const distributionDirectory = path.resolve('dist');

  try {
    await fs.rm(distributionDirectory, { recursive: true, force: true });

    logger.info('Cleaned dist directory.');
  } catch (error) {
    logger.error('Failed to clean dist directory.', error);
  }
}

async function build() {
  const target = await getNodeTarget();

  const pattern = 'src/**/*.ts';

  const entryPoints = await globby(pattern, {
    gitignore: true,
    absolute: false,
  });

  if (entryPoints.length === 0) {
    throw new Error(`No entry points found in ${pattern}.`);
  }

  await cleanDistribution();

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

try {
  await build();
} catch (error: unknown) {
  logger.error('Build failed.', error);
}
