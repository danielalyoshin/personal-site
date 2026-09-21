import { defineConfig } from '@playwright/test'

// Two servers, both this project's own: the dev server for the interaction
// suite, and the built, pre-rendered site for e2e/built.spec.ts. Each is
// recognised by a file only this project serves, never by its port alone, so
// another project's server on the same port is refused (the port is strict)
// rather than quietly tested instead. Move a port with E2E_PORT or
// E2E_BUILT_PORT.
const port = Number(process.env.E2E_PORT ?? 5173)
const builtPort = Number(process.env.E2E_BUILT_PORT ?? 4173)
const devURL = `http://127.0.0.1:${port}`
const builtURL = `http://127.0.0.1:${builtPort}`

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  use: {
    channel: 'chrome',
    viewport: { width: 1440, height: 1000 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'dev',
      testIgnore: /built\.spec\.ts$/,
      use: { baseURL: devURL },
    },
    {
      name: 'built',
      testMatch: /built\.spec\.ts$/,
      use: { baseURL: builtURL },
    },
  ],
  webServer: [
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
      url: `${devURL}/src/content/site.ts`,
      reuseExistingServer: true,
    },
    {
      // Always a fresh build: a preview left running would serve an old one.
      command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${builtPort} --strictPort`,
      url: `${builtURL}/robots.txt`,
      reuseExistingServer: false,
      timeout: 180_000,
    },
  ],
})
