# Liquid Development Standards

## Valid Filters

### Array Filters
- `compact` - removes null values
- `concat` - combines arrays
- `find` - finds first element matching condition
- `find_index` - returns index of first match
- `first` - gets first element
- `has` - checks if array contains value
- `join` - joins array into string
- `last` - gets last element
- `map` - transforms array elements
- `reject` - filters out elements
- `reverse` - reverses array order
- `size` - returns array length
- `sort` - sorts array
- `sort_natural` - natural language sorting
- `sum` - sums array values
- `uniq` - removes duplicates
- `where` - filters array by property

### Cart Filters
- `item_count_for_variant` - counts items of a variant in cart
- `line_items_for` - gets cart line items for object

### Collection Filters
- `link_to_type` - creates link to product type
- `link_to_vendor` - creates link to vendor
- `sort_by` - sorts collection
- `url_for_type` - gets URL for product type
- `url_for_vendor` - gets URL for vendor
- `within` - filters within collection
- `highlight_active_tag` - highlights active tag

### Color Filters
- `brightness_difference` - calculates brightness difference between colors
- `color_brightness` - gets brightness value
- `color_contrast` - calculates contrast ratio
- `color_darken` - darkens color
- `color_desaturate` - removes saturation
- `color_difference` - calculates color difference
- `color_extract` - extracts color component
- `color_lighten` - lightens color
- `color_mix` - mixes two colors
- `color_modify` - modifies color properties
- `color_saturate` - increases saturation
- `color_to_hex` - converts to hex
- `color_to_hsl` - converts to HSL
- `color_to_oklch` - converts to OKLCH
- `color_to_rgb` - converts to RGB
- `hex_to_rgba` - converts hex to RGBA

### Customer Filters
- `customer_login_link` - creates login link
- `customer_logout_link` - creates logout link
- `customer_register_link` - creates register link
- `avatar` - returns customer avatar
- `login_button` - renders login button

### Date Filters
- `date` - formats date

### Default Filters
- `default_errors` - renders form errors
- `default` - provides default value
- `default_pagination` - renders pagination

### Font Filters
- `font_face` - generates @font-face
- `font_modify` - modifies font properties
- `font_url` - gets font URL

### HTML Filters
- `class_list` - generates class string from object
- `time_tag` - creates `<time>` tag
- `inline_asset_content` - inlines asset content
- `highlight` - highlights text
- `link_to` - creates link
- `placeholder_svg_tag` - renders placeholder SVG
- `preload_tag` - creates preload tag
- `script_tag` - creates script tag
- `stylesheet_tag` - creates stylesheet tag

### Localization Filters
- `translate` or `t` - translates string key
- `currency_selector` - renders currency selector
- `format_address` - formats address

### Math Filters
- `abs` - absolute value
- `at_least` - minimum value
- `at_most` - maximum value
- `ceil` - rounds up
- `divided_by` - division
- `floor` - rounds down
- `minus` - subtraction
- `modulo` - modulo operator
- `plus` - addition
- `round` - rounding
- `times` - multiplication

### Media Filters
- `external_video_tag` - renders external video
- `external_video_url` - gets external video URL
- `image_tag` - renders image tag with srcset
- `media_tag` - renders media element
- `model_viewer_tag` - renders 3D model viewer
- `video_tag` - renders video tag
- `image_url` - gets image URL with dimensions
- `img_tag` - renders img tag
- `img_url` - gets image URL
- `product_img_url` - gets product image URL
- `article_img_url` - gets article image URL
- `collection_img_url` - gets collection image URL

### Metafield Filters
- `metafield_tag` - renders metafield value
- `metafield_text` - gets metafield text

### Money Filters
- `money` - formats as money
- `money_with_currency` - formats with currency
- `money_without_currency` - formats without currency
- `money_without_trailing_zeros` - removes trailing zeros

### Payment Filters
- `payment_button` - renders payment button
- `payment_terms` - renders payment terms
- `payment_type_img_url` - gets payment method image
- `payment_type_svg_tag` - gets payment method SVG

### String Filters
- `append` - appends string
- `base64_decode` - decodes base64
- `base64_encode` - encodes base64
- `capitalize` - capitalizes first letter
- `downcase` - converts to lowercase
- `escape` - escapes HTML
- `escape_once` - escapes once
- `lstrip` - removes left whitespace
- `newline_to_br` - converts newlines to `<br>`
- `prepend` - prepends string
- `remove` - removes substring
- `remove_first` - removes first occurrence
- `remove_last` - removes last occurrence
- `replace` - replaces substring
- `replace_first` - replaces first occurrence
- `replace_last` - replaces last occurrence
- `rstrip` - removes right whitespace
- `slice` - slices string
- `split` - splits into array
- `strip` - removes whitespace
- `strip_html` - removes HTML tags
- `strip_newlines` - removes newlines
- `truncate` - truncates with ellipsis
- `truncatewords` - truncates by word count
- `upcase` - converts to uppercase
- `url_decode` - URL decodes
- `url_encode` - URL encodes
- `camelize` - converts to camelCase
- `handleize` - converts to handle format
- `url_escape` - escapes for URL
- `url_param_escape` - escapes for URL params
- `pluralize` - pluralizes word

### Tag Filters
- `link_to_add_tag` - creates add tag link
- `link_to_remove_tag` - creates remove tag link
- `link_to_tag` - creates tag link

---

## Valid Tags

- `content_for` - renders block content
- `form` - creates form
- `layout` - sets layout
- `assign` - assigns variable
- `break` - breaks loop
- `capture` - captures output
- `case` - case statement
- `comment` - comment block
- `continue` - continues loop
- `cycle` - cycles values
- `decrement` - decrements counter
- `doc` - LiquidDoc documentation
- `echo` - outputs expression
- `for` - for loop
- `if` - if statement
- `include` - includes snippet
- `increment` - increments counter
- `raw` - raw code block
- `render` - renders snippet
- `tablerow` - table row loop
- `unless` - unless statement
- `paginate` - pagination
- `javascript` - JavaScript block
- `section` - renders section
- `stylesheet` - CSS block
- `sections` - renders section group
- `style` - inline styles
- `else` - else clause
- `liquid` - liquid block

---

## Valid Objects

### Global Objects
- `collections` - all store collections
- `pages` - all store pages
- `all_products` - all products
- `articles` - all articles
- `blogs` - all blogs
- `cart` - current cart
- `customer` - logged in customer
- `shop` - shop data
- `theme` - theme data
- `settings` - theme settings
- `template` - current template name
- `request` - request data
- `routes` - store routes
- `localization` - localization data
- `metaobjects` - custom metaobjects
- `images` - images from theme settings

### Page-Specific Objects
- `product` - product page
- `collection` - collection page
- `blog` - blog page
- `article` - article page
- `page` - page object
- `cart` - cart page
- `customer` - customer pages
- `order` - order page
- `search` - search results

---

## Syntax Standards

### Delimiters
- `{{ ... }}` - Output
- `{{- ... -}}` - Output with whitespace trim
- `{% ... %}` - Logic/control tag
- `{%- ... -%}` - Logic with whitespace trim

### Operators

**Comparison:**
- `==`, `!=`, `>`, `<`, `>=`, `<=`

**Logical:**
- `and`, `or`, `contains`

### Conditionals
- Use nested `if` for multiple conditions (no parentheses in Liquid)
- Use `elsif` for multiple branches
- Use `unless` for negation
- Use `case/when` for multiple options

---

## Theme Architecture Standards

### Directory Structure
```
theme/
├── sections/        # Full-width customizable sections
├── blocks/          # Nested customizable blocks
├── snippets/        # Reusable code fragments
├── layouts/         # Page wrappers (header/footer)
├── templates/       # Page structures
├── config/          # Theme settings schema
├── assets/          # Static files (CSS, JS, images)
├── locales/         # Translation files
└── templates/customers/  # Customer account pages
```

### Sections
- Full-width modules with `{% content_for 'blocks' %}`
- Include `{% schema %}` with merchant settings
- Examples: hero banners, product grids, testimonials

### Blocks
- Small, nestable components
- Include `{% schema %}` for settings
- Include `{% doc %}` if statically rendered
- Can contain nested blocks
- Examples: testimonial items, carousel slides

### Snippets
- Reusable code, NOT directly customizable
- Must include `{% doc %}` header
- Accept parameters via `render` tag
- Examples: buttons, images, form elements

### Layouts
- Wraps templates with header/footer
- Includes `{{ content_for_header }}` and `{{ content_for_layout }}`
- Contains global elements (nav, cart, footer)

### Config
- `settings_schema.json` - theme settings
- `settings_data.json` - settings values
- Accessible via `settings` object in Liquid

### Assets
- Only critical CSS and static files
- Reference via `asset_url` filter
- Keep compressed and optimized

### Locales
- `en.default.json` - English translations
- Organized by language code
- Use `{{ 'key' | t }}` filter in Liquid

### Templates
- JSON files defining page structure
- Specify sections and ordering
- One per page type (product, collection, etc.)

---

## LiquidDoc Standards

All snippets and statically-rendered blocks must include documentation:

```liquid
{% doc %}
  Brief description of what this renders.

  @param {type} name - Description
  @param {type} [optional] - Optional parameters in brackets

  @example
  {% render 'snippet-name', param: value %}
{% enddoc %}
```

---

## Schema Standards

### Section Schema
- Define merchant-customizable settings
- Include `presets` for theme editor
- Use `visible_if` for conditional settings
- Validate against `schemas/section.json`

### Block Schema
- Define block-specific settings
- Include blocks array for nested blocks
- Validate against `schemas/theme_block.json`

---

## CSS Standards

### Specificity
- Never use IDs for styles
- Avoid element selectors
- Avoid `!important`
- Use single class selectors (0 1 0)
- Max 0 4 0 for parent/child

### Variables
- Use CSS variables to reduce redundancy
- Global variables in `:root`
- Scoped variables for components
- Never hardcode colors (use schemes)

### BEM Naming
- Block: component name
- Element: `block__element`
- Modifier: `block--modifier`
- Use dashes for multi-word names

### Media Queries
- Mobile-first approach (`min-width`)
- Use `screen` media type

### Nesting
- No nesting beyond first level
- No `&` operator
- Keep simple

### Scoping
- Use `{% stylesheet %}` in components
- Reset variables with inline `style` attributes
- Avoid `{% style %}` tags

---

## JavaScript Standards

### General
- Use zero external dependencies
- Use native browser features
- Never use `var`
- Use `const` over `let`
- Use `for (const x of array)` not `.forEach()`

### Modules
- Avoid global scope pollution
- Prefix private methods with `#`
- Keep public APIs minimal
- Use module pattern

### Async/Await
- Use `async/await` not `.then()`
- Use `await` over chaining

### Events
- Use events for custom communication
- Avoid explicit dependencies

### Web Components
- Initialize as custom elements
- Use shadow DOM and slots
- Use proper lifecycle hooks

### Early Returns
- Prefer early returns over nesting
- Use optional chaining sparingly
- Keep conditionals simple

### Simplification
- Use ternaries for simple if/else
- Write simple returns on one line
- Return boolean comparisons directly

---

## HTML Standards

### Structure
- Use semantic HTML
- Prefer `<details>` and `<summary>` over JS
- Use CamelCase for IDs
- Append `-{{ block.id }}` or `-{{ section.id }}`

### Accessibility
- Make interactive elements focusable with `tabindex="0"`
- Never hijack tab flow
- Include proper ARIA labels
- Use semantic HTML elements

---

## Translation Standards

### Key Organization
- Hierarchical structure (3 levels max)
- Use snake_case for keys
- Group related translations

### Usage
- Use `{{ 'key' | t }}` filter for all text
- Use variables for interpolation
- Keep text concise
- Use sentence case

### Files
- Update `locales/en.default.json`
- Add English text only
- Let translators handle other languages

---

## Settings Best Practices

### Naming
- Keep labels simple and clear
- Remove word duplication in groups
- Use common shorthand (Max/Min)
- Minimize help text

### Organization
- List settings in visual order (top-to-bottom, left-to-right)
- Resource pickers first
- Customization settings after
- Group related settings

### Conditional Settings
- Use for progressive disclosure
- Limit to 2 levels deep
- Code defensively (never assume nil)
- Only group closely related concepts

### Input Types
- Checkbox: on/off switch (avoid verbs)
- Select: keep options short
- Text: for string input
- Color: for color selection