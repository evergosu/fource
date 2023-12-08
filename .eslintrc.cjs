module.exports = {
  root: true,
  env: {
    es2024: true,
  },
  plugins: ['@typescript-eslint', 'import', 'promise', 'unicorn'],
  extends: [
    'plugin:import/recommended',
    'plugin:promise/recommended',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:unicorn/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.eslint.json', './src/*/tsconfig.json'],
    ecmaFeatures: {
      jsx: true,
      impliedStrict: true,
    },
  },
  reportUnusedDisableDirectives: true,
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx', '.js'],
    },
    'import/resolver': {
      node: true,
      typescript: {
        alwaysTryTypes: true,
      },
    },
    'import/core-modules': [
      '@rushstack/eslint-patch/modern-module-resolution',
      '@rushstack/eslint-patch/custom-config-package-names',
    ],
    rules: {
      // Already checked by typescript.
      'import/named': 'off',
      'import/default': 'off',
      'import/namespace': 'off',
      'import/no-named-as-default-member': 'off',
      // Re-eanbled after airbnb.
      'import/no-unresolved': 'error',
    },
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'variable',
        types: ['boolean'],
        format: ['PascalCase'],
        prefix: ['can', 'did', 'does', 'has', 'is', 'should', 'will'],
      },
    ],
  },
};
