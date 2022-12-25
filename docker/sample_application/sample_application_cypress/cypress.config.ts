import { defineConfig } from "cypress";

const micoocypress = require("micoocypress");

const micooption = {
  host: "http://localhost:8123/engine",
  apiKey: "AK8c885d41e1d9f0b53d",
  pid: "PID25e1aff32acb4eee8a7b5c26c7027126",
  buildVersion: process.env.MICOO_BUILD_VERSION
    ? process.env.MICOO_BUILD_VERSION
    : "missing versioning-3",
};

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      micoocypress(on, micooption);
    },
    specPattern: ["cypress/integration/*.spec.ts"],
    supportFile: "cypress/support/index.ts",
  },
  chromeWebSecurity: false,

  screenshotsFolder: "./cypress/snapshots/actual",
  trashAssetsBeforeRuns: true,
  video: false,
});
