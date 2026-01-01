import baseConfig from '../eslint.config';
import angular from 'angular-eslint';

export default [
  ...baseConfig,
  ...angular.configs.tsRecommended,

  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.spec.json', './tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },


  {
    files: ['**/*.html'],
    ...angular.configs.templateRecommended,
  },
];
