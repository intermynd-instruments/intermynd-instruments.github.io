/**
 * Minimal typings for the programmatic Eleventy API used by the test suite.
 * The package ships no declarations of its own.
 */
declare module "@11ty/eleventy" {
  export interface EleventyOptions {
    runMode?: "build" | "serve" | "watch";
    quietMode?: boolean;
    /** "cli" freezes constructor input/output against config-file overrides. */
    source?: "cli" | "script";
  }

  export class Eleventy {
    constructor(input?: string, output?: string, options?: EleventyOptions);
    write(): Promise<unknown>;
  }
}
