import { minify } from "html-minifier-terser";

/**
 * @typedef {{ page: { outputPath?: string } }} EleventyContext
 * @typedef {{
 *   addPassthroughCopy: (copy: Record<string, string>) => void,
 *   addTransform: (
 *     name: string,
 *     transform: (this: EleventyContext, content: string) => string | Promise<string>
 *   ) => void
 * }} EleventyConfig
 */

/** Face buttons the manuals reference as `<code>CROSS</code>` and friends. */
const VITA_BUTTONS = {
  CROSS: { className: "vita-button-cross", label: "Cross" },
  SQUARE: { className: "vita-button-square", label: "Square" },
  TRIANGLE: { className: "vita-button-triangle", label: "Triangle" },
  CIRCLE: { className: "vita-button-circle", label: "Circle" },
};

/** Files each page needs, kept out of the templates so the list is auditable. */
const ROOT_IMAGES = [
  "ds8.png",
  // The *-white variants are swapped in by the finish switcher in JS, so they
  // never appear in markup and are easy to drop from an allowlist by accident.
  "pd12-top.jpeg",
  "pd12-closeup.jpeg",
  "pd12-top-white.jpg",
  "pd12-closeup-white.jpg",
];

const MEDIA = ["img/ds8-slicer.jpg", "img/psvita-jungle.jpg", "img/vid.mp4", "img/vid.webm"];

const JETBRAINS_MONO =
  "node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2";

/**
 * @this {EleventyContext}
 * @param {string} content
 * @returns {string}
 */
function renderVitaButtons(content) {
  const outputPath = this.page.outputPath || "";
  if (!outputPath.endsWith(".html") || !outputPath.includes("manual")) {
    return content;
  }

  return content.replace(/<code>(CROSS|SQUARE|TRIANGLE|CIRCLE)<\/code>/g, (_match, control) => {
    const button = VITA_BUTTONS[/** @type {keyof typeof VITA_BUTTONS} */ (control)];
    return (
      `<span class="vita-button-icon ${button.className}" role="img" ` +
      `aria-label="${button.label} button" title="${button.label} button" ` +
      `data-control="${control}"></span>`
    );
  });
}

/**
 * @this {EleventyContext}
 * @param {string} content
 * @returns {Promise<string>}
 */
async function minifyHtml(content) {
  if (!(this.page.outputPath || "").endsWith(".html")) {
    return content;
  }

  return minify(content, {
    collapseWhitespace: true,
    // Collapse to a single space rather than removing it: the design leans on
    // whitespace between inline elements, which full collapsing would eat.
    conservativeCollapse: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
  });
}

/**
 * @param {EleventyConfig} eleventyConfig
 */
export default function (eleventyConfig) {
  // --- What gets published --------------------------------------------------
  // GitHub Pages served the entire repository, including .DS_Store, four unused
  // display fonts, and 23 MB of unreferenced 4K wallpapers. Only what is listed
  // here reaches _site.
  eleventyConfig.addPassthroughCopy({ CNAME: "CNAME" });
  eleventyConfig.addPassthroughCopy({ "assets/*.svg": "assets" });
  eleventyConfig.addPassthroughCopy({ "assets/trackspace-logo.png": "assets/trackspace-logo.png" });
  eleventyConfig.addPassthroughCopy({ "assets/fonts/*.ttf": "assets/fonts" });
  eleventyConfig.addPassthroughCopy({
    [JETBRAINS_MONO]: "assets/fonts/jetbrains-mono-latin-wght-normal.woff2",
  });

  for (const file of [...ROOT_IMAGES, ...MEDIA]) {
    eleventyConfig.addPassthroughCopy({ [file]: file });
  }

  // Brand wallpapers are ~23 MB and nothing links to them yet. Uncomment when
  // a download link exists.
  // eleventyConfig.addPassthroughCopy({ "assets/wallpapers/*.png": "assets/wallpapers" });

  // --- Build-time rendering of what used to be client-side work -------------
  // manual-versions.js rewrote these `<code>` elements into CSS-drawn icons on
  // every page load. Doing it here removes the script and the layout shift.
  eleventyConfig.addTransform("vita-buttons", renderVitaButtons);
  eleventyConfig.addTransform("minify-html", minifyHtml);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
