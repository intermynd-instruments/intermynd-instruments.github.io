import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

import {
  DEVELOPMENT_STYLESHEET,
  createContentHash,
  publishStylesheet,
} from "../scripts/hash-css-lib.js";

/** @type {string[]} */
const temporaryDirectories = [];

function createTemporaryDirectory() {
  const directory = mkdtempSync(join(tmpdir(), "intermynd-css-"));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("createContentHash", () => {
  test("returns a stable ten-character SHA-256 prefix", () => {
    expect(createContentHash("abc")).toBe("ba7816bf8f");
  });
});

describe("publishStylesheet", () => {
  test("publishes production CSS under its content hash", () => {
    const directory = createTemporaryDirectory();
    const source = join(directory, "input.css");
    const dataFile = join(directory, "data", "css.json");
    const outputDir = join(directory, "site");
    const css = "body { color: rebeccapurple; }\n";
    writeFileSync(source, css);

    const result = publishStylesheet({ source, dataFile, outputDir });
    const expectedHref = `/css/intermynd.${createContentHash(css)}.css`;

    expect(result).toEqual({ href: expectedHref, bytes: Buffer.byteLength(css) });
    expect(readFileSync(join(outputDir, expectedHref.slice(1)), "utf8")).toBe(css);
    expect(JSON.parse(readFileSync(dataFile, "utf8"))).toEqual({ href: expectedHref });
  });

  test("uses a stable development URL without requiring compiled CSS", () => {
    const directory = createTemporaryDirectory();
    const dataFile = join(directory, "data", "css.json");

    const result = publishStylesheet({ dev: true, dataFile });

    expect(result).toEqual({ href: DEVELOPMENT_STYLESHEET, bytes: null });
    expect(JSON.parse(readFileSync(dataFile, "utf8"))).toEqual({
      href: DEVELOPMENT_STYLESHEET,
    });
  });
});
