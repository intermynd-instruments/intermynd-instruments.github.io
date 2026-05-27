# Intermynd Instruments — Design System

A lightweight design system for Intermynd Instruments websites, web editors, and product pages. One CSS file, one base template.

## Preorder Form

`index.html` now includes a static preorder-interest form that prefills a Google Form, then sends the visitor to Google Forms to complete the submission there. This keeps the site backend-free while letting Google handle email collection and response storage.

### Recommended setup

1. Create a Google Form with these short-answer fields:
   - `Country`
   - `Product`
2. In the form settings, enable Google Forms email collection if you want Google to record the respondent email automatically.
3. In Google Forms, open `Get pre-filled link`.
4. Enter dummy values once and generate the link.
5. In the generated URL, copy the form ID from:

```text
https://docs.google.com/forms/d/e/THIS_PART_IS_FORM_ID/viewform?...
```

6. Copy each field's `entry.<number>` ID from the prefilled query string.
7. In [`index.html`](/Users/pierlo/Development/intermynd-instruments/index.html), fill in:

```js
const preorderConfig = {
  formId: '...',
  fields: {
    country: '...',
    product: '...',
  },
};
```

8. In the Google Form `Responses` tab, link the form to a Sheet.

### Runtime behavior

- The site collects `Country` and `Product`.
- On submit, it redirects the visitor to the Google Form `viewform` URL with those fields prefilled.
- The user finishes the submission on Google Forms, where Google can handle email collection and the final response write.

### Why this approach

- No backend to host or maintain
- No exposed Sheets API credentials in the browser
- Google Sheets becomes the lightweight CRM for follow-up and batch planning

If you later want richer validation, spam protection, or automated follow-up emails, switch the form submission target from Google Forms to a small Apps Script or serverless endpoint.

## Quick start

Drop three lines into the `<head>` of any HTML file:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="intermynd.css">
```

Then configure Tailwind and you're ready:

```html
<script>
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          sans:  ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
          pixel: ['Pixel', 'monospace'],
        },
      }
    }
  }
</script>
```

Or start from `base.html` which already includes everything above plus a navbar, footer, and hamburger menu JS.

---

## Files

| File | Purpose |
|------|---------|
| `intermynd.css` | Design tokens, patterns, and reusable classes |
| `base.html` | Starter template — navbar, footer, hamburger menu already wired |
| `NCLGraxebeosa-Demo.otf` | Display font (loaded by `intermynd.css`) |
| `logo.svg` | Intermynd Instruments logo |

---

## Design tokens

All colors and fonts live in CSS custom properties inside `:root`. Edit them in one place to recolor your project.

```css
--color-primary:        #6f26de;
--color-primary-hover:  #5a1eb2;
--color-bg-darkest:     #000000;
--color-bg-dark:        #0a0a0a;
--color-bg-muted:       #050505;
--color-bg-light:       #ffffff;
--color-bg-off:         #f9fafb;
--color-border-dark:    #262626;
--color-border-light:   #e5e5e5;
--color-text-heading:   #171717;
--color-text-body:      #737373;
--color-text-muted:     #a3a3a3;
--font-sans:            'Inter', system-ui, -apple-system, sans-serif;
--font-display:         'Pixel', monospace;
```

### Using tokens in Tailwind arbitrary values

```html
<div class="bg-[var(--color-primary)] text-[var(--color-text-body)]">
  Custom-colored element
</div>
```

### Using tokens in vanilla CSS

```css
.my-button {
  background: var(--color-primary);
  color: var(--color-bg-light);
}
.my-button:hover {
  background: var(--color-primary-hover);
}
```

---

## Typography

### `font-sans` — Inter (body copy)

Available via Tailwind as the default sans-serif. Weights 300–900 are loaded from Google Fonts.

```html
<p class="text-sm text-neutral-500">Body copy in Inter</p>
```

### `font-pixel` — Graxebeosa (display / hero)

Available as the Tailwind utility `font-pixel`. Use it for hero headings or any place you want a pixel/bitmap feel.

```html
<h1 class="font-pixel text-7xl">HEADLINE</h1>
```

Graxebeosa is loaded from `NCLGraxebeosa-Demo.otf` via `@font-face` in `intermynd.css`. Copy the `.otf` file into every project that uses the pixel font.

---

## Utility classes

### Background patterns

| Class | Effect |
|-------|--------|
| `dot-grid` | Subtle dark dot pattern (for light surfaces) |
| `dot-grid-primary` | Primary-tinted dot pattern (for callouts) |

```html
<section class="bg-white">
  <div class="absolute inset-0 dot-grid opacity-40"></div>
  <!-- content over the pattern -->
</section>
```

### Section label — static

The `/ Section Name ■` pattern used across the site.

```html
<p class="section-label">
  <span class="slash">/</span> Products <span>■</span>
</p>
```

### Section label — terminal/typewriter animation

Add `terminal-label` to the `<p>` and wrap each part in `term-slash`, `term-text`, `term-block`. The animation triggers when the element scrolls into view: the `/` blinks, the text rolls out left to right, then the `■` blinks.

```html
<p class="section-label terminal-label">
  <span class="term-slash">/</span>
  <span class="term-text" style="--char-count: 8">Products</span>
  <span class="term-block">■</span>
</p>
```

The `--char-count` custom property tells the typewriter animation how many steps to use. Color classes are applied directly (`text-[#6f26de]`, `text-neutral-300`, etc.). The Intersection Observer class `terminal-active` is added automatically when in view.

### Hamburger menu

Add a mobile hamburger with animation. The markup and JS are in `base.html`.

```html
<button id="menu-btn" aria-label="Toggle menu">
  <span class="hamburger-line hamburger-top block w-6 h-[2px] bg-white rounded-full"></span>
  <span class="hamburger-line hamburger-mid block w-5 h-[2px] bg-white rounded-full"></span>
  <span class="hamburger-line hamburger-bot block w-6 h-[2px] bg-white rounded-full"></span>
</button>
```

### Grids

| Class | Description |
|-------|-------------|
| `products-grid` | 1/2/3-column responsive grid with internal dark borders, zero gaps, no rounded corners |
| `how-grid` | 1/2-column grid with internal dark borders, zero gaps |

Use with Tailwind's `grid` and column utilities:

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 bg-[var(--color-bg-dark)] products-grid w-full">
  <div>...</div>
</div>
```

### Scrollbar

```html
<div class="hide-scrollbar overflow-x-auto">
  <!-- horizontally scrollable content, no visible scrollbar -->
</div>
```

---

## Layout conventions

### Page sections

Every section follows the same structure:

```html
<section class="border-t border-neutral-200">
  <div class="w-full px-6 lg:px-16 py-24">
    <!-- content -->
  </div>
</section>
```

- `border-t border-neutral-200` — thin separator between sections
- `w-full px-6 lg:px-16` — full-width with 24px padding on mobile, 64px on desktop
- `py-24` — generous vertical spacing (96px top and bottom)

For sections with a full-bleed dark grid below the header, split the padding:

```html
<section class="border-t border-neutral-200">
  <!-- padded header -->
  <div class="w-full px-6 lg:px-16 pt-24 pb-14">
    <!-- label + heading + description -->
  </div>
  <!-- full-bleed grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 bg-[var(--color-bg-dark)] products-grid w-full">
    <!-- tiles -->
  </div>
</section>
```

### Navbar

The navbar is fixed, solid primary color, with white text. See `base.html` for the full markup.

### Footer

Multi-column footer with the `[/ II]` logo, `/ Navigate` section labels, and copyright. See `base.html` for the full markup.

---

## Working with Tailwind CDN

The design system uses Tailwind's CDN which compiles styles at runtime. This means:

- **All Tailwind classes work** — no build step required
- **Arbitrary values work** — `bg-[#6f26de]`, `w-[85vw]`, etc.
- **The neutral palette is baked in** — `neutral-50` through `neutral-950`
- **No purge** — the CDN includes every class, so page weight is higher than a production build. Fine for internal tools and small sites.

For larger projects, swap the CDN for a Tailwind CLI or PostCSS build. The tokens and custom CSS in `intermynd.css` remain the same.

---

## Adding to an existing project

1. **Copy** `intermynd.css` and `NCLGraxebeosa-Demo.otf` into your project root
2. **Add** the three `<head>` lines from Quick Start
3. **Pick** the classes you need. The tokens and grid styles work independently of Tailwind if needed.

If you don't want Tailwind, you can still use `intermynd.css` standalone. The CSS custom properties and utility classes have no Tailwind dependency.

---

## Related projects

- **Main site** — `index.html` (https://github.com/your-org/intermynd-instruments)
- **Starter template** — `base.html`
- **Web editors** — see `base.html` for scaffolding
