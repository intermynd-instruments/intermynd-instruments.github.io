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
import { publishStylesheet } from "./hash-css-lib.js";

const DEV = process.argv.includes("--dev");
const result = publishStylesheet({ dev: DEV });

if (result.bytes === null) {
  console.log("css: dev mode -> /css/intermynd.css");
} else {
  console.log(`css: ${(result.bytes / 1024).toFixed(1)} KiB -> ${result.href}`);
}
