import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Eleventy } from "@11ty/eleventy";

/** Absolute path to the Eleventy input directory. */
export const SRC_DIR = fileURLToPath(new URL("../../src/", import.meta.url));

/**
 * Counts non-overlapping occurrences of a substring.
 * @param {string} haystack
 * @param {string} needle
 * @returns {number}
 */
export function countOccurrences(haystack, needle) {
  return haystack.split(needle).length - 1;
}

/**
 * Recursively reads every generated HTML page under a directory.
 * @param {string} dir
 * @returns {Map<string, string>} HTML page contents keyed by site-relative path
 */
export function readHtmlPages(dir) {
  /** @type {Map<string, string>} */
  const pages = new Map();
  /** @type {string[]} */
  const pending = [dir];
  while (pending.length > 0) {
    const current = /** @type {string} */ (pending.pop());
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(fullPath);
      } else if (entry.name.endsWith(".html")) {
        pages.set(
          path.relative(dir, fullPath).split(path.sep).join("/"),
          readFileSync(fullPath, "utf8"),
        );
      }
    }
  }
  return pages;
}

/**
 * Builds the site programmatically into a temporary output directory.
 * source: "cli" freezes the constructor input/output so the config file's
 * dir block cannot override them in a programmatic run.
 * @param {"build" | "serve"} runMode
 * @param {string} [inputDir]
 * @returns {Promise<{ outputDir: string, pages: Map<string, string> }>}
 */
export async function buildSite(runMode, inputDir = SRC_DIR) {
  const outputDir = mkdtempSync(path.join(tmpdir(), "site-build-"));
  const eleventy = new Eleventy(inputDir, outputDir, { runMode, quietMode: true, source: "cli" });
  await eleventy.write();
  return { outputDir, pages: readHtmlPages(outputDir) };
}

/**
 * Removes a temporary directory, tolerating undefined and missing paths.
 * @param {string | undefined} dir
 */
export function removeDir(dir) {
  if (dir) {
    rmSync(dir, { recursive: true, force: true });
  }
}
