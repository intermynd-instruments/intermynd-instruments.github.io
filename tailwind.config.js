/**
 * Mirrors the inline `tailwind.config` that the Play CDN used, so compiled
 * output matches what the browser was generating before the build step.
 */
export default {
  content: ["./src/**/*.njk"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["JetBrains Mono", "ui-monospace", "monospace"],
        display: ["Intermynd", "JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
