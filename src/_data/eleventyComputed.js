/**
 * Computed data for the Datadog RUM snippet. The snippet ships only in
 * production builds (`eleventy`, runMode "build"); `eleventy --serve` and
 * `--watch` render nothing. A missing or malformed `datadog` block in
 * site.json fails the production build instead of emitting a broken init.
 *
 * Eleventy only elevates a JS data file's default export when it is the sole
 * export, so the validation helper stays module-private and everything the
 * templates need hangs off the default export.
 */

/**
 * @typedef {object} DatadogRumConfig
 * @property {string} applicationId
 * @property {string} clientToken
 * @property {string} site
 * @property {string} service
 * @property {string} env
 * @property {number} sessionSampleRate
 * @property {number} sessionReplaySampleRate
 * @property {boolean} trackResources
 * @property {boolean} trackUserInteractions
 * @property {boolean} trackLongTasks
 * @property {string} defaultPrivacyLevel
 */

const REQUIRED_STRING_KEYS = [
  "applicationId",
  "clientToken",
  "site",
  "service",
  "env",
  "defaultPrivacyLevel",
];
const REQUIRED_NUMBER_KEYS = ["sessionSampleRate", "sessionReplaySampleRate"];
const REQUIRED_BOOLEAN_KEYS = ["trackResources", "trackUserInteractions", "trackLongTasks"];

/** @type {Array<[string[], (value: unknown) => boolean]>} */
const KEY_CHECKS = [
  [REQUIRED_STRING_KEYS, (value) => typeof value === "string" && value !== ""],
  [REQUIRED_NUMBER_KEYS, (value) => typeof value === "number"],
  [REQUIRED_BOOLEAN_KEYS, (value) => typeof value === "boolean"],
];

/**
 * @param {Record<string, unknown>} candidate
 * @returns {string[]} Names of every missing or wrongly typed key.
 */
function findInvalidKeys(candidate) {
  return KEY_CHECKS.flatMap(([keys, isValid]) => keys.filter((key) => !isValid(candidate[key])));
}

/**
 * @param {string | undefined} runMode Eleventy run mode: "build", "serve", or "watch".
 * @param {unknown} config Value of `site.datadog`.
 * @returns {DatadogRumConfig | null} The config in production builds, otherwise null.
 */
function resolveDatadogRum(runMode, config) {
  if (runMode !== "build") {
    return null;
  }

  if (config === null || typeof config !== "object" || Array.isArray(config)) {
    throw new Error(
      'Missing Datadog RUM configuration: site.json must define a "datadog" object ' +
        "for production builds.",
    );
  }

  const candidate = /** @type {Record<string, unknown>} */ (config);
  const invalidKeys = findInvalidKeys(candidate);
  if (invalidKeys.length > 0) {
    throw new Error(`Invalid Datadog RUM configuration in site.json: ${invalidKeys.join(", ")}`);
  }

  return /** @type {DatadogRumConfig} */ (candidate);
}

export default {
  /**
   * RUM config exposed to templates, or null outside production builds.
   *
   * @param {{
   *   eleventy?: { env?: { runMode?: string } },
   *   site?: { datadog?: unknown },
   * }} data
   * @returns {DatadogRumConfig | null}
   */
  datadogRum(data) {
    return resolveDatadogRum(data?.eleventy?.env?.runMode, data?.site?.datadog);
  },
};
