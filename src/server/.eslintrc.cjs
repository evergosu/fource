require('@rushstack/eslint-patch/modern-module-resolution');
require('@rushstack/eslint-patch/custom-config-package-names');

module.exports = {
  env: { node: true },
  plugins: ['node', 'prettier'],
  extends: [
    '../../.eslintrc.cjs',
    'plugin:node/recommended',
    'plugin:prettier/recommended',
  ],
  rules: {
    'node/no-unsupported-features/es-syntax': [
      'error',
      { ignores: ['modules'] },
    ],
  },
  settings: {
    node: {
      tryExtensions: ['.js', '.json', '.node', '.ts'],
    },
  },
};
