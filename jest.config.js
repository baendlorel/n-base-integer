/** @type {import('jest').Config} */
export default {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/?(*.)test.ts'], // 只运行 .test.ts 结尾的测试文件
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'lcov'],
  // 不显示跳过的测试
  verbose: false,
};
