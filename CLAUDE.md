# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Custom Shopify Liquid theme ("Munch") for Nithya Amirtham (nilgiritahr.myshopify.com). jQuery-based with Gulp build pipeline compiling SCSS and JS into the `assets/` directory.

## Build Commands

```bash
npm run build    # Compile SCSS + bundle JS (one-time)
npm run dev      # Build then watch for changes
npm run watch    # Watch only (no initial build)
```

All three are Gulp tasks defined in `gulpfile.js`:
- **style**: Compiles `dev/style/**/*.scss` → `assets/base.css` (compressed, autoprefixed, concatenated)
- **scripts**: Concatenates `dev/scripts/init.js` → `assets/global.js`
- **watch**: Watches `dev/style/` and `dev/scripts/` for changes

Shopify CLI is configured in `.shopify/project.json`. Use `shopify theme dev` to preview locally and `shopify theme push` to deploy.

## Architecture

### Source vs Output

- **`dev/`** — Source files. Edit these, never edit compiled assets directly.
  - `dev/style/base.scss` — Main SCSS entry point, uses `@use` to import all partials
  - `dev/style/_reset.scss` — CSS reset
  - `dev/style/common/_*.scss` — Component stylesheets (BEM naming)
  - `dev/scripts/init.js` — All custom JS (cart drawer, product drawer, variant selection, AJAX cart)
- **`assets/`** — Compiled output (`base.css`, `global.js`) plus static assets (fonts, images, vendor JS)

### Shopify Theme Structure

- **`layout/theme.liquid`** — Master template. Defines CSS custom properties from theme settings, loads fonts (Minion Pro, Instrument Sans), jQuery, Slick carousel, PhotoSwipe lightbox.
- **`sections/`** — Liquid sections with schema blocks. Each section defines its own settings for the Shopify editor.
- **`snippets/`** — Reusable partials rendered via `{% render %}`: `product-card`, `blog-card`, `cart-drawer`, `product-drawer`, `testimonial-card`, `video-card`, `social-meta-tags`.
- **`templates/`** — JSON templates that compose sections. `index.json` is the homepage.
- **`config/settings_schema.json`** — Theme-wide settings (colors, typography, layout, card styling) exposed as CSS custom properties.

### JavaScript (`dev/scripts/init.js`)

Single-file jQuery architecture with these modules:
- **CartDrawer** — AJAX cart via `/cart/change.js`, quantity updates, remove items
- **ProductDrawer** — Quick-view with variant selection, price updates, stock status, buy-now
- **AJAX Add to Cart** — Form interception with loading states
- **Variant Selection** — Dynamic option matching, price/availability updates via data attributes

### CSS Conventions

- BEM naming (`block__element--modifier`)
- Mobile-first responsive with 768px breakpoint
- CSS custom properties for theme settings (colors, fonts, spacing)
- SCSS `@use` imports (not `@import`)

### Adding a New Component

1. Create `dev/style/common/_component-name.scss`
2. Add `@use 'common/component-name'` to `dev/style/base.scss`
3. Create `sections/component-name.liquid` with schema
4. Reference the section in the appropriate `templates/*.json`

## Configuration

- **`.editorconfig`** — 2-space indent, UTF-8, trim trailing whitespace
- **`.theme-check.yml`** — Disables TemplateLengthCheck and MatchingTranslations
- **`.shopify/project.json`** — Links to nilgiritahr.myshopify.com store
