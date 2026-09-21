import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.js"],
    isolate: true,
    fileParallelism: true,
    pool: "threads",
    coverage: {
      provider: "v8",
      include: [
        "scripts/hash-css-lib.js",
        "src/_data/appVersion.js",
        "src/_data/eleventyComputed.js",
        "src/manuals/manuals.11tydata.js",
      ],
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "coverage",
      thresholds: {
        branches: 90,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
  },
});
