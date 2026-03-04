# Nithya Amirtham - Shopify Theme

Custom Shopify theme for Nithya Amirtham, a traditional South Indian sweets and savories store based in Chennai.

## Tech Stack

- **Platform:** Shopify Online Store 2.0
- **Templating:** Liquid
- **Styles:** SCSS (compiled via Gulp + Dart Sass)
- **Scripts:** Vanilla JS (concatenated + minified via Gulp)
- **Fonts:** Aller, Aleo, Instrument Sans
- **Reviews:** Judge.me integration
- **Chatbot:** AI-powered chatbot via proxy app

## Project Structure

```
theme/
├── assets/            # Compiled CSS/JS (base.css, global.js, product-page.js)
├── config/            # Theme settings schema + data
├── dev/
│   ├── scripts/       # Source JS (init.js, product-page.js)
│   └── style/         # Source SCSS (base.scss + partials)
├── layout/            # theme.liquid
├── locales/           # Translation files
├── sections/          # Theme sections
├── snippets/          # Reusable Liquid snippets
├── templates/         # Page templates (JSON + Liquid)
└── gulpfile.js        # Build configuration
```

## Getting Started

```bash
# Install dependencies
npm install

# Build CSS + JS
npm run build

# Watch for changes (build + auto-reload)
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run build` | Compile SCSS and bundle JS |
| `npm run dev` | Build + watch for changes |
| `npm run watch` | Watch only (no initial build) |
| `npm run lint` | Lint JS (ESLint) + SCSS (Stylelint) |
| `npm run lint:js` | Lint JS only |
| `npm run lint:css` | Lint SCSS only |
| `npm run test` | Run Jest tests |
| `npm run test:structure` | Run theme structure tests |
| `npm run test:shopify` | Run Shopify theme check |
| `npm run test:theme` | Run structure + Shopify checks |

## Sections

- **Header** - Mega menu, mobile drawer, search overlay, account links
- **Announcement Bar** - Rotating text announcements with configurable speed
- **Hero Slider** - Full-width Splide.js carousel
- **Icon with Text** - Feature icons in grid or horizontal scroll layout
- **Featured Collection Carousel** - Product slider with Splide.js
- **Exclusive Collections** - Highlighted collection cards
- **Product Features Banner** - Full-width feature highlights
- **Promo Banner** - Promotional banner with background pattern
- **About Strip** - Red banner with 2x2 feature icon grid
- **Testimonials** - Customer testimonials carousel
- **Visit Us / Store Locations** - Store location cards
- **Blog Post Grid** - Blog article cards
- **Related Products** - Product recommendations on PDP
- **Footer** - Multi-column links, social icons, newsletter

## Key Pages

- **Product (PDP)** - Gallery with thumbnails, variant picker, quantity selector, meta badges, accordions (description, ingredients, shipping, dispatch), Judge.me reviews
- **Collection** - Filterable/sortable product grid
- **Collections List** - All collections grid with sort
- **Cart** - Full cart page + AJAX cart drawer
- **About** - Custom about page template
- **Contact** - Contact form page
- **Blog** - Blog listing + article pages

## Theme Settings

Key configurable settings in the theme editor:

- Social media account URLs (Facebook, Instagram, Twitter, YouTube, Pinterest)
- Judge.me reviews toggle
- AI Chatbot toggle
- Announcement bar messages and rotation speed
- Section-level padding and layout controls

## Deployment

Push to the connected GitHub repo. Shopify syncs changes automatically via the GitHub integration.

```bash
git push origin main
```
