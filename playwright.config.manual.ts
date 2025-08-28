import { defineConfig, devices } from '@playwright/test';

/**
 * 수동 테스트용 설정 (서버를 별도로 실행해야 함)
 * 사용법: pnpm dev 실행 후 별도 터미널에서 pnpm exec playwright test --config=playwright.config.manual.ts
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',

  use: {
    baseURL: 'http://127.0.0.1:5173',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: process.env.CI ? 'retain-on-failure' : 'off',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // webServer 설정 제거 - 수동으로 서버 실행
});
