import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config({
  files: ['**/*.{ts,tsx}'],
  ignores: ['dist'],

  languageOptions: {
    parser: tseslint.parser, // 🔴 REQUIRED
    ecmaVersion: 2020,
    globals: globals.browser,
  },

  plugins: {
    '@typescript-eslint': tseslint.plugin, // 🔴 REQUIRED
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
  },

  extends: [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    'prettier',
  ],

  rules: {
    ...reactHooks.configs.recommended.rules,

    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],

    '@typescript-eslint/array-type': [
      'error',
      {
        default: 'generic',
        readonly: 'generic',
      },
    ],
  },
});
