// @ts-check
/**
 * Typescript ESLint configuration file.
 * @version 2025.06.29
 */

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    ignores: [
      'node_modules/**/*', // 排除 node_modules（通常默认排除）
      'dist/**/*', // 排除 test 文件夹
      'tests/**/*', // 排除 test 文件夹
      'coverage/**/*', // 排除测试覆盖率文件夹
      '*.config.js', // 排除所有配置文件
    ],
  },
  {
    rules: {
      '@typescript-eslint/prefer-for-of': 'off',
      '@typescript-eslint/unified-signatures': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  }
);
