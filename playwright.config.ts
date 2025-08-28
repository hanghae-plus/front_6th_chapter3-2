import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',

  timeout: 30 * 1000,

  expect: {
    timeout: 5 * 1000,
  },

  fullyParallel: true,

  retries: 0,

  use: {
    baseURL: 'http://localhost:5173',

    trace: 'retain-on-failure',

    video: 'retain-on-failure',
    screenshot: 'only-on-failure',

    viewport: { width: 1280, height: 720 },

    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
