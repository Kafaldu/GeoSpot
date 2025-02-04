import pluginReact from 'eslint-plugin-react';

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
      plugins: {
        react: pluginReact, // Define the plugin here directly
      },
    },
  },
  pluginReact.configs.recommended, // Use the recommended config from the plugin
];
