import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import * as resolver from 'eslint-import-resolver-typescript';
import { configs, config, parser } from 'typescript-eslint';
import testingLibrary from 'eslint-plugin-testing-library';
import prettier from 'eslint-plugin-prettier/recommended';
import perfectionist from 'eslint-plugin-perfectionist';
import * as regexp from 'eslint-plugin-regexp';
import { FlatCompat } from '@eslint/eslintrc';
import _import from 'eslint-plugin-import-x';
import jestDom from 'eslint-plugin-jest-dom';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import promise from 'eslint-plugin-promise';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import vitest from 'eslint-plugin-vitest';
import { fileURLToPath } from 'node:url';
import react from 'eslint-plugin-react';
import globals from 'globals';
import path from 'node:path';
import js from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  resolvePluginsRelativeTo: __dirname,
  baseDirectory: __dirname,
});

export default config(
  js.configs.recommended,
  ...configs.recommended,
  ...configs.strictTypeChecked,
  ...configs.stylisticTypeChecked,
  ...fixupConfigRules(_import.flatConfigs.recommended),
  ...fixupConfigRules(_import.flatConfigs.react),
  ...fixupConfigRules(_import.flatConfigs.typescript),
  perfectionist.configs['recommended-line-length'],
  sonarjs.configs.recommended,
  unicorn.configs['flat/recommended'],
  regexp.configs['flat/recommended'],
  promise.configs['flat/recommended'],
  jsxA11y.flatConfigs.recommended,
  ...fixupConfigRules(
    ...compat.config({
      extends: ['plugin:@next/next/recommended'],
    }),
  ),
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  ...compat.config({
    extends: ['plugin:react-hooks/recommended'],
  }),
  prettier,
  {
    extends: [configs.disableTypeChecked],
    files: ['**/*.{js,jsx,cjs,mjs}'],
  },
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    ...jestDom.configs['flat/recommended'],
    plugins: {
      'testing-library': fixupPluginRules({
        rules: testingLibrary.rules,
      }),
      vitest,
    },
    rules: {
      ...testingLibrary.configs['flat/react'].rules,
      ...vitest.configs.recommended.rules,
    },
  },
  {
    rules: {
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            'mocks/server.ts',
            '*.config.{mjs,ts}',
            'vitest.setup.ts',
            '**/*.test.*',
          ],
          peerDependencies: true,
          packageDir: __dirname,
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          prefix: ['can', 'did', 'does', 'has', 'is', 'should', 'will'],
          format: ['PascalCase', 'camelCase'],
          selector: 'variable',
          types: ['boolean'],
        },
      ],
      'prettier/prettier': [
        'error',
        {
          arrowParens: 'avoid',
          bracketSpacing: true,
          trailingComma: 'all',
          singleQuote: true,
          semi: true,
        },
      ],
      'unicorn/prevent-abbreviations': [
        'error',
        {
          ignore: [String.raw`(.|-)env`, /^ignore/i],
        },
      ],
      'import-x/newline-after-import': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/first': 'error',
      // Already checked by typescript.
      'import-x/no-named-as-default-member': 'off',
      'import-x/namespace': 'off',
      'import-x/default': 'off',
      'import-x/named': 'off',
    },
    settings: {
      'import-x/parsers': {
        '@typescript-eslint/parser': [
          '.ts',
          '.tsx',
          '.cts',
          '.mts',
          '.js',
          '.jsx',
          '.cjs',
          '.mjs',
        ],
      },
      'import-x/resolver': {
        options: {
          tsconfigRootDir: __dirname,
          alwaysTryTypes: true,
        },
        name: 'typescript',
        resolver: resolver,
        node: true,
      },
      perfectionist: {
        partitionByComment: true,
        partitionByNewLine: true,
        type: 'line-length',
      },
      react: { version: 'detect' },
      vitest: { typecheck: true },
      next: { rootDir: '.' },
    },
    languageOptions: {
      ...jsxA11y.flatConfigs.recommended.languageOptions,
      ...react.configs.flat.recommended.languageOptions,
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.config.mjs'],
        },
        warnOnUnsupportedTypeScriptVersion: false,
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...vitest.environments.env.globals,
        ...globals.builtin,
        ...globals.serviceworker,
        ...globals.browser,
        React: true,
        JSX: true,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: parser,
    },
    linterOptions: { reportUnusedDisableDirectives: true },
  },
  {
    ignores: [
      '.next/*',
      '.yarn/',
      'bin/**',
      'build/**',
      'dist/**',
      'node_modules/**',
    ],
  },
);
