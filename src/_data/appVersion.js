import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const packageJson = JSON.parse(
  readFileSync(fileURLToPath(new URL("../../package.json", import.meta.url)), "utf8"),
);

/**
 * Site version sourced from package.json, so the Datadog RUM `version` tag can
 * never drift from the released package.
 *
 * @type {string}
 */
export default packageJson.version;
