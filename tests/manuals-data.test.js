import { describe, expect, test } from "vitest";

import manualData from "../src/manuals/manuals.11tydata.js";

const displayVersion = manualData.eleventyComputed.displayVersion;

describe("manual display version", () => {
  test("uses the newest configured version for the latest manual", () => {
    expect(
      displayVersion({
        manualVersion: "latest",
        manuals: [{ version: "0.8" }, { version: "0.7" }],
      }),
    ).toBe("0.8");
  });

  test("keeps an explicitly selected historical version", () => {
    expect(
      displayVersion({
        manualVersion: "0.6",
        manuals: [{ version: "0.8" }, { version: "0.7" }],
      }),
    ).toBe("0.6");
  });

  test("fails clearly when the latest manual has no configured versions", () => {
    expect(() => displayVersion({ manualVersion: "latest", manuals: [] })).toThrow(
      "At least one manual version is required.",
    );
  });
});
