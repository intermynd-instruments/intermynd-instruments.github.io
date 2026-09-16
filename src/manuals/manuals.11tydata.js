/**
 * Shared front matter for every DS-8 manual page. Lived in five copies of the
 * same markup before the build step.
 */
export default {
  footer: "compact",
  preloadDisplayFont: true,
  ogImage: "/ds8.png",
  panelEyebrow: "Versioned manual",

  navLinks: [
    { href: "/ds8.html", label: "DS-8" },
    { href: "#manual", label: "Manual" },
    { href: "#quick-reference", label: "Quick Reference" },
  ],
  navCta: {
    href: "https://intermynd-instruments.itch.io/ds-8",
    label: "Download on Itch",
    external: true,
  },
  footerLinks: [
    { href: "/ds8.html", label: "DS-8 product page" },
    { href: "#manual", label: "Back to top" },
    { href: "https://intermynd-instruments.itch.io/ds-8", label: "Itch.io", external: true },
    { href: "https://intermynd.redbubble.com", label: "Official merch shop", external: true },
    { href: "https://github.com/intermynd-instruments", label: "GitHub", external: true },
    {
      href: "https://github.com/intermynd-instruments/psvita-usb-audio-midi",
      label: "Open-source USB plugin",
      external: true,
    },
  ],

  eleventyComputed: {
    // "latest" tracks whatever sits at the top of _data/manuals.json.
    displayVersion: (data) =>
      data.manualVersion === "latest" ? data.manuals[0].version : data.manualVersion,
  },
};
