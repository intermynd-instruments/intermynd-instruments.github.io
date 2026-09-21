import { cpSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Eleventy } from "@11ty/eleventy";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import rumComputedData from "../src/_data/eleventyComputed.js";
import { SRC_DIR, buildSite, countOccurrences, removeDir } from "./helpers/build-site.js";

const PACKAGE_JSON = JSON.parse(
  readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
);

const LOADER_URL = "https://www.datadoghq-browser-agent.com/ap1/v7/datadog-rum.js";
const BUILD_TIMEOUT = 120_000;

/** @type {Array<[string, string, "string" | "raw"]>} */
const EXPECTED_OPTIONS = [
  ["applicationId", "cd729284-471c-4fd6-af2f-ff0c89807b9b", "string"],
  ["clientToken", "pubb2c61f2ffad61c5eefa39b4853a2dcf7", "string"],
  ["site", "ap1.datadoghq.com", "string"],
  ["service", "intermynd-instruments", "string"],
  ["env", "prod", "string"],
  ["sessionSampleRate", "100", "raw"],
  ["sessionReplaySampleRate", "20", "raw"],
  ["trackResources", "true", "raw"],
  ["trackUserInteractions", "true", "raw"],
  ["trackLongTasks", "true", "raw"],
  ["defaultPrivacyLevel", "mask", "string"],
];

const VALID_CONFIG = Object.fromEntries(
  EXPECTED_OPTIONS.map(([key, value, kind]) => [
    key,
    kind === "string" ? value : value === "true" ? true : Number(value),
  ]),
);

/**
 * Matches a minified-or-not `key: value` pair, tolerant of quotes and spacing.
 * html-minifier-terser rewrites `true` to `!0`, so raw booleans allow both.
 * @param {string} key
 * @param {string} value
 * @param {"string" | "raw"} kind
 * @returns {RegExp}
 */
function optionPattern(key, value, kind) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (kind === "string") {
    return new RegExp(`${key}\\s*:\\s*["']${escaped}["']`);
  }
  if (value === "true" || value === "false") {
    return new RegExp(`${key}\\s*:\\s*(?:${escaped}|!${value === "true" ? 0 : 1})\\b`);
  }
  return new RegExp(`${key}\\s*:\\s*${escaped}\\b`);
}

describe("Datadog RUM snippet in production builds", () => {
  /** @type {string} */
  let outputDir;
  /** @type {Map<string, string>} */
  let pages;

  beforeAll(async () => {
    ({ outputDir, pages } = await buildSite("build"));
  }, BUILD_TIMEOUT);

  afterAll(() => {
    removeDir(outputDir);
  });

  test("builds the homepage, the DS-8 page, and every manual page", () => {
    expect(pages.has("index.html")).toBe(true);
    expect(pages.has("ds8.html")).toBe(true);
    const manualPages = [...pages.keys()].filter(
      (name) => name.startsWith("ds8-manual-") || name === "ds8/manual.html",
    );
    expect(manualPages.length).toBeGreaterThanOrEqual(5);
  });

  test("renders exactly one loader and one init on every page", () => {
    for (const [name, html] of pages) {
      expect(countOccurrences(html, "datadog-rum.js"), `${name} loader count`).toBe(1);
      expect(countOccurrences(html, "DD_RUM.init"), `${name} init count`).toBe(1);
      expect(countOccurrences(html, "DD_RUM.onReady"), `${name} onReady count`).toBe(1);
    }
  });

  test("loads the pinned CDN build with a crossorigin attribute", () => {
    for (const [name, html] of pages) {
      const loaderTag = html.match(/<script\b[^>]*datadog-rum\.js[^>]*>/);
      expect(loaderTag, `${name} loader tag`).not.toBeNull();
      expect(loaderTag?.[0]).toContain(`src="${LOADER_URL}"`);
      expect(loaderTag?.[0]).toContain("crossorigin");
    }
  });

  test("initializes with the exact approved configuration values", () => {
    const homepage = pages.get("index.html") ?? "";
    for (const [key, value, kind] of EXPECTED_OPTIONS) {
      expect(homepage, `homepage init sets ${key}`).toMatch(optionPattern(key, value, kind));
    }
  });

  test("never calls startSessionReplayRecording", () => {
    for (const [name, html] of pages) {
      expect(html, name).not.toContain("startSessionReplayRecording");
    }
  });

  test("tags the RUM version from package.json", () => {
    for (const [name, html] of pages) {
      expect(html, `${name} version`).toMatch(
        optionPattern("version", PACKAGE_JSON.version, "string"),
      );
    }
  });
});

describe("Datadog RUM snippet in dev mode", () => {
  /** @type {string} */
  let outputDir;
  /** @type {Map<string, string>} */
  let pages;

  beforeAll(async () => {
    ({ outputDir, pages } = await buildSite("serve"));
  }, BUILD_TIMEOUT);

  afterAll(() => {
    removeDir(outputDir);
  });

  test("omits the snippet from every page", () => {
    expect(pages.size).toBeGreaterThan(0);
    for (const [name, html] of pages) {
      expect(countOccurrences(html, "datadoghq-browser-agent.com"), name).toBe(0);
      expect(countOccurrences(html, "datadog-rum.js"), name).toBe(0);
      expect(countOccurrences(html, "DD_RUM"), name).toBe(0);
    }
  });
});

describe("Datadog RUM production config guard", () => {
  test(
    "fails the build loudly when site.json has no datadog block",
    async () => {
      // appVersion.js reads ../../package.json, so the scratch copy keeps the
      // repo layout: a project dir holding both src/ and package.json.
      const projectDir = mkdtempSync(path.join(tmpdir(), "rum-project-"));
      const outputDir = mkdtempSync(path.join(tmpdir(), "rum-build-"));
      try {
        const inputCopy = path.join(projectDir, "src");
        cpSync(SRC_DIR, inputCopy, { recursive: true });
        cpSync(
          fileURLToPath(new URL("../package.json", import.meta.url)),
          path.join(projectDir, "package.json"),
        );
        const siteJsonPath = path.join(inputCopy, "_data", "site.json");
        const siteConfig = JSON.parse(readFileSync(siteJsonPath, "utf8"));
        delete siteConfig.datadog;
        writeFileSync(siteJsonPath, `${JSON.stringify(siteConfig, null, 2)}\n`);

        const eleventy = new Eleventy(inputCopy, outputDir, {
          runMode: "build",
          quietMode: true,
          source: "cli",
        });

        /** @type {any} */
        let buildError;
        try {
          await eleventy.write();
        } catch (error) {
          buildError = error;
        }

        expect(buildError, "production build must fail").toBeDefined();
        // Eleventy wraps the throw in EleventyMapPagesError; walk the cause
        // chain for the actionable message.
        const messages = [];
        for (
          let current = buildError;
          current && messages.length < 10;
          current = current.originalError ?? current.cause
        ) {
          messages.push(String(current.message ?? current));
        }
        expect(messages.join("\n")).toMatch(/Missing Datadog RUM configuration/);
      } finally {
        removeDir(projectDir);
        removeDir(outputDir);
      }
    },
    BUILD_TIMEOUT,
  );
});

describe("datadogRum computed data", () => {
  /**
   * Calls the computed data key the way Eleventy does, with the data cascade.
   * @param {string | undefined} runMode
   * @param {unknown} config
   */
  function compute(runMode, config) {
    return rumComputedData.datadogRum({
      eleventy: { env: runMode === undefined ? {} : { runMode } },
      site: config === undefined ? {} : { datadog: config },
    });
  }

  test("returns null outside production builds", () => {
    expect(compute("serve", VALID_CONFIG)).toBeNull();
    expect(compute("watch", VALID_CONFIG)).toBeNull();
    expect(compute(undefined, VALID_CONFIG)).toBeNull();
  });

  test("returns the config for production builds", () => {
    expect(compute("build", VALID_CONFIG)).toEqual(VALID_CONFIG);
  });

  test("throws when the config block is missing", () => {
    expect(() => compute("build", undefined)).toThrow(/datadog/i);
    expect(() => compute("build", null)).toThrow(/datadog/i);
    expect(() => compute("build", "nope")).toThrow(/datadog/i);
  });

  test("throws naming every invalid key", () => {
    expect(() =>
      compute("build", {
        ...VALID_CONFIG,
        applicationId: "",
        clientToken: 42,
        trackResources: "yes",
        sessionSampleRate: "100",
      }),
    ).toThrow(/applicationId.*clientToken|clientToken.*applicationId/s);
    expect(() => compute("build", {})).toThrow(/defaultPrivacyLevel/);
  });
});
