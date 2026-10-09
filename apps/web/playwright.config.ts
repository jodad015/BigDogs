import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // Test files share the local database, so run them one at a time
  workers: 1,
  webServer: {
    command: 'pnpm dev',
    port: 5180,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:5180',
  },
});
