import baseConfig from '../eslint.config';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactNative from 'eslint-plugin-react-native';

export default [  
  ...baseConfig,
  
  {
    files: ['src/**/*.{ts,tsx}', '*.tsx'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-native': reactNative,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-unused-styles': 'error',
      'react-native/split-platform-components': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  
  {
    files: ['**/*.js'],
    ...baseConfig.filter(config => !config.languageOptions?.parserOptions?.project),
  },
];
