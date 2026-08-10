import { defineConfig } from "cypress";

export default defineConfig({

  e2e: {
    experimentalRunAllSpecs: true,
    allowCypressEnv: false,
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    retries: 1,
  },
});
