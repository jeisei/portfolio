import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 3,
  use: { baseURL: 'http://127.0.0.1:4173', viewport: { width: 1536, height: 864 } },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'Chrome', use: { channel: 'chrome' } },
    { name: 'WebKit', use: { browserName: 'webkit' } },
    { name: 'Firefox', use: { browserName: 'firefox' } },
    { name: 'Mobile WebKit', use: { ...devices['iPhone 13'], browserName: 'webkit' } },
  ],
});
