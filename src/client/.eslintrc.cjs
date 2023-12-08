require('@rushstack/eslint-patch/modern-module-resolution');
require('@rushstack/eslint-patch/custom-config-package-names');

module.exports = {
  env: { browser: true },
  plugins: ['jsx-a11y', 'prettier', 'react', 'react-hooks'],
  extends: [
    '../../.eslintrc.cjs',
    'airbnb',
    'next/core-web-vitals',
    'airbnb/hooks',
    'airbnb-typescript',
    'plugin:prettier/recommended',
  ],
  settings: {
    next: {
      rootDir: '.',
    },
  },
};
