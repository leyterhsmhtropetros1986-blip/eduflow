import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './app/tests', // Ψάχνει τα τεστ εκεί που το έβαλες
  fullyParallel: false,
  retries: 0,
  reporter: 'list', // Θα σου δείχνει αναλυτικά τι κάνει στο τερματικό
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  /* Αυτό αναλαμβάνει να ξεκινήσει τον Next.js server μόνο του! */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // Δίνουμε 2 λεπτά χρόνο στο Codespaces να κάνει build
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});