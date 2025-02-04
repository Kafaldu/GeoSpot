import eslint from 'eslint';
import pluginReact from 'eslint-plugin-react';

const { Linter } = eslint;

export default [
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      env: {
        browser: true,
        node: true,
      },
    },
  },
  pluginReact.configs.recommended,
];
