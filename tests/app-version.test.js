import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import appVersion from "../src/_data/appVersion.js";

const packageJson = JSON.parse(
  readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
);

describe("appVersion data module", () => {
  test("equals the package.json version", () => {
    expect(appVersion).toBe(packageJson.version);
  });

  test("is a non-empty semver version string", () => {
    expect(typeof appVersion).toBe("string");
    expect(appVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
