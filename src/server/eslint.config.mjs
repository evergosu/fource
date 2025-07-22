import * as resolver from 'eslint-import-resolver-typescript';
import { configs, config, parser } from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';
import perfectionist from 'eslint-plugin-perfectionist';
import { fixupConfigRules } from '@eslint/compat';
import * as regexp from 'eslint-plugin-regexp';
import _import from 'eslint-plugin-import-x';
import promise from 'eslint-plugin-promise';
import drizzle from 'eslint-plugin-drizzle';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import vitest from 'eslint-plugin-vitest';
import { fileURLToPath } from 'node:url';
import node from 'eslint-plugin-n';
import globals from 'globals';
import path from 'node:path';
import js from '@eslint/js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default config(
  js.configs.recommended,
  node.configs['flat/recommended-module'],
  ...configs.recommended,
  ...configs.strictTypeChecked,
  ...configs.stylisticTypeChecked,
  ...fixupConfigRules(_import.flatConfigs.recommended),
  ...fixupConfigRules(_import.flatConfigs.typescript),
  perfectionist.configs['recommended-line-length'],
  sonarjs.configs.recommended,
  unicorn.configs['flat/recommended'],
  regexp.configs['flat/recommended'],
  promise.configs['flat/recommended'],
  prettier,
  {
    rules: {
      ...drizzle.configs.recommended.rules,
    },
    plugins: {
      drizzle,
    },
  },
  {
    extends: [configs.disableTypeChecked],
    files: ['**/*.{js,jsx,cjs,mjs}'],
  },
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    rules: {
      ...vitest.configs.recommended.rules,
    },
    plugins: {
      vitest,
    },
  },
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              message:
                'Do not import directly from src — use client/*, server/*, tests/*, etc.',
              group: ['src/*'],
            },
            {
              message:
                'Avoid deep relative imports into src. Use proper aliases instead.',
              group: ['../*/src/*', '../../*/src/*'],
            },
          ],
        },
      ],

      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '*.config.{mjs,ts}',
            'vitest.setup.ts',
            '**/*.spec.*',
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
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
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
          allowList: {
            ProcessEnv: true,
          },
          ignore: [String.raw`(.|-)env`, /^ignore/i],
        },
      ],
      '@typescript-eslint/dot-notation': [
        'error',
        {
          allowProtectedClassPropertyAccess: true,
          allowPrivateClassPropertyAccess: true,
        },
      ],
      '@typescript-eslint/no-empty-function': [
        'error',
        {
          allow: ['arrowFunctions', 'private-constructors'],
        },
      ],
      '@typescript-eslint/no-invalid-void-type': [
        'error',
        {
          allowAsThisParameter: true,
        },
      ],
      '@typescript-eslint/no-namespace': [
        'error',
        {
          allowDeclarations: true,
        },
      ],
      'sonarjs/new-cap': [
        'error',
        {
          capIsNewExceptions: ['Router'],
        },
      ],
      'import-x/newline-after-import': 'error',
      'sonarjs/no-empty-test-file': 'off',
      'import-x/no-duplicates': 'error',
      'n/no-missing-import': 'off',
      // Note: you must disable the base rule as it can report incorrect errors.
      'dot-notation': 'off',
      // Enabled in @typescript-eslint/no-empty-function.
      'no-empty-function': 'off',
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
      vitest: { typecheck: true },
      next: { rootDir: '.' },
    },
    languageOptions: {
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
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: parser,
    },
    linterOptions: { reportUnusedDisableDirectives: true },
  },
  {
    ignores: ['.yarn/', 'bin/**', 'build/**', 'dist/**', 'node_modules/**'],
  },
);
