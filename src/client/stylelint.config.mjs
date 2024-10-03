export default {
  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind'],
      },
    ],
  },
  extends: ['stylelint-config-standard', 'stylelint-prettier/recommended'],
};
