import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { buildSite, countOccurrences, removeDir } from "./helpers/build-site.js";

const SITE_JSON = JSON.parse(
  readFileSync(fileURLToPath(new URL("../src/_data/site.json", import.meta.url)), "utf8"),
);

// The Cloudflare Web Analytics token production used before commit 49ff1a7
// (monitoring-datadog-rum) accidentally rotated it. The token is public by
// design — it ships in every page's source — and is pinned here so the
// site.json config cannot silently drift again.
const EXPECTED_BEACON_TOKEN = "0e122fb83a7347d1a81970221720baaf";

const BEACON_LOADER_URL = "https://static.cloudflareinsights.com/beacon.min.js";
const BUILD_TIMEOUT = 120_000;

describe("Cloudflare beacon in production builds", () => {
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

  test("site.json keeps the pre-RUM production token", () => {
    expect(SITE_JSON.cloudflareBeaconToken).toBe(EXPECTED_BEACON_TOKEN);
  });

  test("renders exactly one beacon script on every page", () => {
    expect(pages.size).toBeGreaterThan(0);
    for (const [name, html] of pages) {
      expect(countOccurrences(html, "beacon.min.js"), `${name} beacon count`).toBe(1);
      const beaconTag = html.match(/<script\b[^>]*beacon\.min\.js[^>]*>/);
      expect(beaconTag, `${name} beacon tag`).not.toBeNull();
      expect(beaconTag?.[0]).toContain(`src="${BEACON_LOADER_URL}"`);
    }
  });

  test("renders the site.json token in every page's beacon config", () => {
    const tokenPattern = new RegExp(
      `data-cf-beacon=['"]\\{"token":\\s*"${SITE_JSON.cloudflareBeaconToken}"\\}`,
    );
    for (const [name, html] of pages) {
      expect(html, `${name} beacon token`).toMatch(tokenPattern);
      expect(html, `${name} beacon token value`).toContain(EXPECTED_BEACON_TOKEN);
    }
  });

  test("coexists with the Datadog RUM snippet on every page", () => {
    for (const [name, html] of pages) {
      expect(countOccurrences(html, "beacon.min.js"), `${name} beacon count`).toBe(1);
      expect(countOccurrences(html, "datadog-rum.js"), `${name} RUM loader count`).toBe(1);
    }
  });
});
