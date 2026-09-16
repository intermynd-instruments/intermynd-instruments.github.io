/**
 * Publishes the compiled stylesheet under a content-hashed name and records the
 * URL for templates to read via the `css` data file.
 *
 * Replaces the hand-bumped `?v=` query string that had to be edited in every
 * HTML file whenever the design system changed.
 *
 * Usage:
 *   node scripts/hash-css.js         # hashed filename, for production builds
 *   node scripts/hash-css.js --dev   # stable filename, for `tailwindcss --watch`
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const DEV = process.argv.includes("--dev");
const SOURCE = "_tmp/intermynd.css";
const DATA_FILE = "src/_data/css.json";

function write(file, contents) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents);
}

if (DEV) {
  // In dev, Tailwind writes straight into the served directory and keeps a
  // stable name so its --watch rebuilds are picked up without a data change.
  write(DATA_FILE, `${JSON.stringify({ href: "/css/intermynd.css" }, null, 2)}\n`);
  console.log("css: dev mode -> /css/intermynd.css");
} else {
  const css = readFileSync(SOURCE);
  const hash = createHash("sha256").update(css).digest("hex").slice(0, 10);
  const href = `/css/intermynd.${hash}.css`;

  write(`_site${href}`, css);
  write(DATA_FILE, `${JSON.stringify({ href }, null, 2)}\n`);
  console.log(`css: ${(css.length / 1024).toFixed(1)} KiB -> ${href}`);
}
