import pluginReact from "eslint-plugin-react";

export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        process: "readonly",
      },
    },
    plugins: {
      react: pluginReact, // Flat Config format
    },
    settings: {
      react: {
        version: "detect", // Automatically detects the installed React version
      },
    },
    rules: pluginReact.configs.recommended.rules, 
  }
];
