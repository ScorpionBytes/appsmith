import { addMatchImageSnapshotPlugin } from "@simonsmith/cypress-image-snapshot/plugin";
import { defineConfig } from "cypress";
import fs from "fs";

export default defineConfig({
  defaultCommandTimeout: 30000,
  requestTimeout: 60000,
  responseTimeout: 60000,
  pageLoadTimeout: 60000,
  videoCompression: false,
  video: true,
  numTestsKeptInMemory: 5,
  experimentalMemoryManagement: true,
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "results",
    charts: true,
    reportPageTitle: "Cypress-report",
    videoOnFailOnly: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: true,
  },
  chromeWebSecurity: false,
  viewportHeight: 1100,
  viewportWidth: 1400,
  scrollBehavior: "center",
  retries: {
    runMode: 0,
    openMode: 0,
  },
  e2e: {
    baseUrl: "https://ce-37017.dp.appsmith.com/",
    setupNodeEvents(on, config) {
      addMatchImageSnapshotPlugin(on);
      require("cypress-mochawesome-reporter/plugin")(on);
      on(
        "after:spec",
        (spec: Cypress.Spec, results: CypressCommandLine.RunResult) => {
          if (results && results.video) {
            // Do we have failures for any retry attempts?
            const failures = results.tests.some((test) =>
              test.attempts.some((attempt) => attempt.state === "failed"),
            );
            if (!failures) {
              // delete the video if the spec passed and no tests retried
              fs.unlinkSync(results.video);
            }
          }
        },
      );
      require("@cypress/grep/src/plugin")(config);
      return require("./cypress/plugins/index.js")(on, config);
    },
    specPattern: [
      "cypress/e2e/**/*"
    ],
    testIsolation: false,
    excludeSpecPattern: ["cypress/e2e/**/spec_utility.ts"],
  },
});
