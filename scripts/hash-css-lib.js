import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const DEVELOPMENT_STYLESHEET = "/css/intermynd.css";

/**
 * @param {Buffer | string} contents
 * @returns {string}
 */
export function createContentHash(contents) {
  return createHash("sha256").update(contents).digest("hex").slice(0, 10);
}

/**
 * @param {string} file
 * @param {Buffer | string} contents
 */
function write(file, contents) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents);
}

/**
 * Publish the compiled stylesheet and update Eleventy's CSS data file.
 *
 * @param {{
 *   dev?: boolean,
 *   source?: string,
 *   dataFile?: string,
 *   outputDir?: string
 * }} [options]
 * @returns {{ href: string, bytes: number | null }}
 */
export function publishStylesheet({
  dev = false,
  source = "_tmp/intermynd.css",
  dataFile = "src/_data/css.json",
  outputDir = "_site",
} = {}) {
  if (dev) {
    write(dataFile, `${JSON.stringify({ href: DEVELOPMENT_STYLESHEET }, null, 2)}\n`);
    return { href: DEVELOPMENT_STYLESHEET, bytes: null };
  }

  const css = readFileSync(source);
  const href = `/css/intermynd.${createContentHash(css)}.css`;

  write(join(outputDir, href.slice(1)), css);
  write(dataFile, `${JSON.stringify({ href }, null, 2)}\n`);

  return { href, bytes: css.length };
}
