import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 8000,
  },
  fullyParallel: false,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'off',
    launchOptions: {
      executablePath: 'C:/Users/atlas/AppData/Local/ms-playwright/chromium-1254/chrome-win64/chrome.exe',
    },
  },
  webServer: [
    {
      command: 'npm --prefix ../server start',
      url: 'http://localhost:5000/health',
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: 'npm run preview -- --port 4173',
      url: 'http://localhost:4173',
      reuseExistingServer: true,
      timeout: 30000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
