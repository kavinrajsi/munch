# Nithya Amirtham Shopify Theme - Design System Rules

## Project Overview

This is a custom Shopify 2.0 theme for Nithya Amirtham, built with Liquid, SCSS, and vanilla JavaScript. No CSS frameworks are used. The build system uses Gulp for SCSS compilation and JS minification.

## Figma-to-Code Integration Rules

When translating Figma designs into this theme, follow these conventions:

### Token Mapping

**Colors** are defined as CSS custom properties via Liquid in `layout/theme.liquid`, scoped per color scheme:
- Background: `--color-background`
- Headings: `--color-headings`
- Body text: `--color-text`
- Links: `--color-links`, `--color-links-hover`
- Icons: `--color-icons`
- Borders/shadows: `--color-borders-and-shadows`
- Primary button: `--btn-primary-bg`, `--btn-primary-text`, `--btn-primary-border`, `--btn-primary-hover-bg`, `--btn-primary-hover-text`, `--btn-primary-hover-border`
- Secondary button: `--btn-secondary-bg`, `--btn-secondary-text`, `--btn-secondary-border`, `--btn-secondary-hover-bg`, `--btn-secondary-hover-text`, `--btn-secondary-hover-border`
- Input fields: `--input-bg`, `--input-text`, `--input-border`
- Variants: `--variant-bg`, `--variant-border`, `--variant-selected-bg`, `--variant-selected-text`, `--variant-selected-border`

Color schemes are applied via `.color-{{ scheme.id }}` class. Always reference CSS variables, never hardcode hex values.

**Typography** uses CSS custom properties with responsive mobile/desktop values:

| Token | Mobile | Desktop | CSS Variable |
|-------|--------|---------|-------------|
| H1 | 36px / 1.3 | 56px / 1.2 | `--font-h1-size`, `--font-h1-line-height` |
| H2 | 28px / 1.3 | 36px / 1.2 | `--font-h2-size`, `--font-h2-line-height` |
| H3 | 22px / 1.4 | 28px / 1.3 | `--font-h3-size`, `--font-h3-line-height` |
| H4 | 18px / 1.4 | 22px / 1.3 | `--font-h4-size`, `--font-h4-line-height` |
| H5 | 16px / 1.4 | 18px / 1.4 | `--font-h5-size`, `--font-h5-line-height` |
| H6 | 14px / 1.4 | 14px / 1.4 | `--font-h6-size`, `--font-h6-line-height` |
| Body 1 | 15px / 1.6 | 16px / 1.6 | `--body-font-size`, `--body-line-height` |
| Body 2 | 13px / 1.5 | 14px / 1.5 | `--body2-font-size`, `--body2-line-height` |
| Caption | 11px / 1.4 | 12px / 1.4 | `--caption-font-size`, `--caption-line-height` |

**Font families:**
- Headings (H1-H3): Aller Bold (custom web font)
- Headings (H4-H6): Aller Regular
- Body 1: Aller Regular (`--font-body-family`)
- Body 2: Assistant system font (`--font-body2-family`)
- Caption: Assistant system font (`--font-caption-family`)
- Google Fonts loaded: Aleo (400, 700), Instrument Sans (400-700)

Desktop typography overrides are applied inside `@media (min-width: 750px)` on `:root`.

**Page width:** `--page-width` CSS variable. Options: Narrow (600-1000px), Normal (900-1600px, default 1200px), Wide (100%).

### CSS Conventions

- **Methodology:** BEM naming (`.block__element--modifier`)
- **Source files:** SCSS in `dev/style/`, compiled to `assets/base.css`
- **New section styles:** Create `_section-name.scss` in `dev/style/` and import in `base.scss`
- **Responsive breakpoints:**
  - Primary: `@media (min-width: 750px)` (mobile to desktop)
  - Secondary: `@media (min-width: 768px)` (Slick carousel responsive)
- **Approach:** Mobile-first
- **Container:** `.container` (max-width from `--page-width`), `.container-fluid` (full width)
- **No utility classes** - use semantic BEM classes

### Component Architecture

**Sections** (`sections/*.liquid`): Self-contained Shopify sections with their own schema, settings, and blocks. Each section has:
- A `{% schema %}` JSON block defining settings, blocks, and presets
- Optional color scheme support via `color_scheme` setting
- Responsive padding via `padding_top` / `padding_bottom` range settings

**Snippets** (`snippets/*.liquid`): Reusable partials included via `{% render 'snippet-name', param: value %}`. Key snippets:
- `product-card.liquid` - Product card (used in grids and carousels)
- `section-heading.liquid` - Consistent section headings
- `card-image.liquid` - Responsive image component
- `card-price.liquid` - Price display with compare-at pricing
- `blog-card.liquid`, `testimonial-card.liquid`, `video-card.liquid`
- `cart-drawer.liquid`, `product-drawer.liquid`, `search-overlay.liquid`
- `breadcrumbs.liquid` - Navigation breadcrumbs

### Icon System

- **All icons are inline SVGs** embedded directly in Liquid templates
- Icons use `currentColor` for fill/stroke to inherit text color from the color scheme
- Default sizes: 20x20px (header), 32x32px (general), 10x9px (chevrons)
- Many sections allow custom SVG code via settings (paste SVG markup)
- No icon font library - always use inline `<svg>` elements
- When adding icons from Figma, export as optimized SVG and embed inline

### Asset Management

- All assets served from Shopify CDN via `{{ 'filename' | asset_url }}`
- CSS: `{{ 'base.css' | asset_url | stylesheet_tag }}`
- JS: `<script src="{{ 'global.js' | asset_url }}" defer></script>`
- Fonts: `url('{{ "font-file.woff2" | asset_url }}')`
- Images: Use Shopify `image_url` filter with width parameter and `image_tag` for responsive output
- Always add `loading: 'lazy'` for below-fold images
- Product image widths: `165, 360, 535, 750, 940, 1100`

### JavaScript Patterns

- **jQuery** for DOM manipulation and AJAX
- **Slick Carousel** for all carousels/sliders
- **PhotoSwipe** for product image lightbox
- Source JS in `dev/scripts/`, compiled to `assets/global.js`
- Cart operations use Shopify AJAX Cart API (`/cart/add.js`, `/cart/change.js`)
- Product data loaded via `/products/{handle}.js`
- Search via Shopify Predictive Search API
- All modals/drawers toggle via body class and overlay

### New Section Checklist

When creating a new section from a Figma design:

1. Create `sections/section-name.liquid` with Liquid markup
2. Add `{% schema %}` with settings, blocks, and presets
3. Include `color_scheme` (type: `color_scheme_group`) setting
4. Include `padding_top` / `padding_bottom` range settings (0-100, step 4, default 40)
5. Add SCSS in `dev/style/_section-name.scss` and import in `base.scss`
6. Use BEM class naming: `.section-name__element`
7. Apply color scheme: `class="color-{{ section.settings.color_scheme }}"`
8. Reference CSS variables for all colors and typography
9. Use `{% render 'snippet-name' %}` for reusable components
10. Support responsive images via Shopify `image_url` / `image_tag`

### Key File Paths

| Purpose | Path |
|---------|------|
| Theme settings/tokens | `config/settings_schema.json` |
| Main layout | `layout/theme.liquid` |
| Compiled CSS | `assets/base.css` |
| SCSS source | `dev/style/` |
| Compiled JS | `assets/global.js` |
| JS source | `dev/scripts/` |
| Sections | `sections/` |
| Snippets | `snippets/` |
| Templates | `templates/` |
| Custom fonts | `assets/*.woff2` |
| Build config | `gulpfile.js` |

### Build Commands

```bash
gulp          # Watch and compile SCSS + JS
gulp styles   # Compile SCSS only
gulp scripts  # Compile JS only
```
