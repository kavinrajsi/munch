---
name: shopify-theme-code-generator
description: Generate production-ready Shopify theme code including Liquid templates, sections, blocks, and snippets. Use this skill whenever the user needs to create or refactor Shopify theme assets like product galleries, quick view modals, mini carts, custom sections, reusable blocks, or theme snippets. Also use this skill for integrating libraries (Swiper.js, Alpine.js, etc.), debugging Liquid issues, or optimizing theme performance. Always call learn_shopify_api once at the start.
---

# Shopify Theme Code Generator

A skill for generating production-ready Shopify theme code including Liquid templates, sections, blocks, snippets, and integration with external libraries.

## Documentation & References

This skill includes comprehensive Liquid development standards in `references/liquid-development.md`. Always consult this file for:
- Valid Liquid filters, tags, and objects
- CSS and JavaScript standards
- HTML and accessibility guidelines
- Theme architecture conventions
- Translation and settings best practices

## Workflow

### 1. Learn the Shopify API

**MANDATORY**: Call `learn_shopify_api` once when starting. This ensures you understand the latest Shopify APIs and best practices.

### 2. Understand the Request

Ask clarifying questions to understand:
- **What type of asset**: Section, block, snippet, template, or JavaScript integration?
- **What functionality**: Product display, cart interaction, filtering, modal, carousel, form, etc.?
- **Customization needs**: Schema settings? Merchant-editable options? Dynamic behavior?
- **Integration requirements**: External libraries? API calls? Performance constraints?
- **Translation needs**: Will this need multi-language support?

### 3. Generate Code Following Architecture

Generate code following Shopify's official theme architecture:

#### **Snippets** (`snippets/`)
- Reusable code fragments, NOT directly customizable by merchants
- Used when the same logic appears in multiple sections/blocks
- Must include `{% doc %}` header with parameters
- Accept parameters via `render` tag
- Perfect for: buttons, image wrappers, form elements, utility functions

```liquid
{% render 'snippet-name', param1: value1, param2: value2 %}
```

#### **Blocks** (`blocks/`)
- Small, reusable, nestable components CUSTOMIZABLE in theme editor
- Can include nested blocks and merchant-facing schema settings
- Must include `{% doc %}` tag if statically rendered
- Must include `{% schema %}` with JSON configuration
- Perfect for: testimonials, slides, feature items, product cards in a group

#### **Sections** (`sections/`)
- Full-width modular components with `{% content_for 'blocks' %}`
- Can contain multiple blocks that merchants arrange
- Always include `{% schema %}` with settings
- Perfect for: hero banners, product grids, testimonials grid, featured collections

#### **Key Principles**

1. **Always use `{% doc %}` tags** for snippets and statically-rendered blocks
2. **Always include `{% schema %}`** for sections and blocks with merchant settings
3. **Use CSS variables** for single properties, **CSS classes** for multiple properties
4. **Use `{% stylesheet %}` and `{% javascript %}`** for component-specific styles and behavior
5. **Translate all user-facing text** using `{{ 'key' | t }}` filters
6. **Follow naming conventions**: Use kebab-case for files, BEM for CSS classes
7. **Optimize performance**: Lazy-load images, minimize JavaScript, use asset_url filter
8. **Validate schemas** against Shopify's JSON schema standards

### 4. Integration Best Practices

#### **External Libraries**
When integrating libraries like Swiper.js, Alpine.js, etc.:
- Include via CDN in `layout/theme.liquid` OR inline via `{% javascript %}`
- Wrap initialization in DOM-ready checks
- Namespace event handlers and classes to avoid conflicts
- Document required dependencies in LiquidDoc comments

#### **JavaScript Patterns**
- Use data attributes for configuration: `data-section-id="{{ section.id }}"`
- Leverage Shopify's `window.Shopify` object for store data
- Implement proper error handling for fetch/API calls
- Use event delegation for dynamic content

#### **API Calls**
When calling external APIs (ElevenLabs, WhatsApp Business, etc.):
- Keep API keys in theme settings, never hardcode
- Use async/await with proper error handling
- Document rate limits and fallback behavior
- Add loading states and user feedback

#### **Performance**
- Load images with correct dimensions: `{{ image | image_url: width: 500 }}`
- Use the `image_tag` filter for srcset support
- Defer non-critical JavaScript
- Minimize inline styles; prefer CSS variables

### 5. Code Quality Checklist

Before presenting code, verify:

- [ ] Liquid syntax is valid (no parsing errors)
- [ ] Only valid filters used (see `references/liquid-development.md`)
- [ ] Only valid tags used (see `references/liquid-development.md`)
- [ ] Only valid objects used (see `references/liquid-development.md`)
- [ ] `{% doc %}` present for snippets/static blocks with @param documentation
- [ ] `{% schema %}` present and valid JSON for sections/blocks
- [ ] All user-facing text uses `{{ 'key' | t }}` translation filter
- [ ] BEM CSS naming convention followed (see `references/liquid-development.md`)
- [ ] CSS specificity follows standards (0 1 0 for single selectors)
- [ ] CSS variables used for dynamic single properties
- [ ] Schema settings properly reference CSS classes/variables
- [ ] JavaScript follows module pattern and standards
- [ ] External library dependencies documented
- [ ] Mobile-responsive design considered (mobile-first)
- [ ] Accessibility attributes included (alt text, aria-labels, semantic HTML)

### 6. Output Format

When generating code, present it as:

1. **File name and path**: e.g., `sections/product-gallery.liquid`
2. **Purpose summary**: Brief explanation of what this asset does
3. **Complete code**: Full, ready-to-copy Liquid template
4. **Schema explanation**: What settings appear in the theme editor
5. **Usage example**: How to render it (if snippet) or where to add it
6. **Integration notes**: Any required assets, dependencies, or configuration

### 7. Common Patterns

#### **Quick View Modal**
- Block or section with product data
- Schema settings: product selection, button text, modal styling
- JavaScript for modal open/close
- Translation keys for labels

#### **Mini Cart**
- Snippet or section with cart drawer
- Real-time item count display
- AJAX add-to-cart handling
- Slide-out animation

#### **Product Gallery with Swiper.js**
- Section with multiple product images
- Thumbnail navigation
- Swiper.js initialization with Liquid settings
- Lazy-loading images

#### **Location Display with Google Maps**
- Section showing store locations
- Google Maps integration
- Schema settings for store list
- Responsive grid layout

#### **Multi-language Content**
- Use `locales/en.default.json` for all keys
- Reference keys via `{{ 'path.to.key' | t }}`
- Provide translation file snippets
- Document variable interpolation

## When to Generate Code

✅ **Use this skill for:**
- Creating new sections, blocks, or snippets from scratch
- Refactoring existing code for performance/maintainability
- Integrating external libraries (Swiper.js, Alpine.js, ElevenLabs)
- Adding merchant-customizable schema settings
- Implementing AJAX features (cart, filtering, search)
- Debugging Liquid logic or schema validation issues
- Creating reusable components for multiple themes

❌ **Skip this skill for:**
- Simple one-line Liquid syntax questions (ask directly)
- General Liquid documentation lookup (user should refer to Shopify docs)
- Theme design/UX decisions (use design skills instead)

## File Organization Reference

```
theme/
├── sections/
│   ├── hero-banner.liquid
│   ├── product-grid.liquid
│   └── testimonials-section.liquid
├── blocks/
│   ├── product-card.liquid
│   ├── testimonial-item.liquid
│   └── feature-item.liquid
├── snippets/
│   ├── product-image.liquid
│   ├── price-badge.liquid
│   └── button.liquid
├── assets/
│   ├── critical.css
│   └── (other static files)
├── config/
│   ├── settings_schema.json
│   └── settings_data.json
└── locales/
    ├── en.default.json
    └── en.default.schema.json
```

## Translation File Template

When generating theme code with user-facing text, provide a matching translation file entry:

```json
{
  "sections": {
    "hero_banner": {
      "title": "Hero banner",
      "description": "Full-width hero section with image and text overlay"
    }
  },
  "blocks": {
    "slide": {
      "name": "Slide"
    }
  },
  "labels": {
    "text": "Text",
    "image": "Image",
    "alignment": "Alignment"
  },
  "options": {
    "alignment": {
      "left": "Left",
      "center": "Center",
      "right": "Right"
    }
  }
}
```