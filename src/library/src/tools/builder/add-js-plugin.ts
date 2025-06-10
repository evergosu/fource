import fs from 'node:fs/promises';
import esbuild from 'esbuild';
import path from 'node:path';

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
