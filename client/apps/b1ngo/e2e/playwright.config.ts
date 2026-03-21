import { defineConfig } from '@playwright/test';

const isCI = !!process.env['CI'];

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: 0,
  workers: 4,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:4200',
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  expect: {
    timeout: 5_000,
  },
  timeout: 60_000,
  webServer: [
    {
      command: 'npm start',
      url: 'http://localhost:4200',
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
  ],
});
