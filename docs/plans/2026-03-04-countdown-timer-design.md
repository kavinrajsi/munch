# Countdown Timer Design

## Summary

Add two countdown timer components: a full-width section and a slim announcement-style banner. Both share the same JS countdown logic and are configurable for any target date/time.

## Components

### 1. `sections/countdown-timer.liquid` — Full Section

**HTML structure:**
- `section.countdown-timer-section` root with inline CSS custom properties
- `.container` > section-heading snippet > optional description > countdown digits grid > optional CTA button
- Digits in `.countdown__group` boxes showing days/hours/minutes/seconds with labels

**Schema settings:**
- `title` (text) — section heading
- `description` (richtext) — optional text below heading
- `end_date` (text) — target date in YYYY-MM-DD format (Shopify doesn't have a native date picker, so text input with info hint)
- `end_time` (text) — target time in HH:MM format (24h), default "00:00"
- `button_text` (text) — optional CTA button label
- `button_link` (url) — CTA button URL
- `bg_color` (color) — section background
- `color_scheme` (color_scheme) — theme color scheme
- `expiry_action` (select) — "hide" or "show_message"
- `expired_message` (text) — message shown when expired, default "This offer has ended"
- 4x padding ranges (desktop/mobile top/bottom)

### 2. `sections/countdown-banner.liquid` — Slim Banner Bar

**HTML structure:**
- `div.countdown-banner` fixed/sticky bar
- Label text + inline countdown digits + optional CTA link + dismiss button (X)
- Dismiss stores in sessionStorage keyed by section ID

**Schema settings:**
- `label` (text) — text before the countdown, e.g. "Sale ends in"
- `end_date` (text) — target date YYYY-MM-DD
- `end_time` (text) — target time HH:MM, default "00:00"
- `link_text` (text) — optional CTA link label
- `link_url` (url) — CTA link URL
- `bg_color` (color) — banner background
- `text_color` (color) — banner text color
- `expiry_action` (select) — "hide" or "show_message"
- `expired_message` (text) — message when expired

## Shared Behavior

- Vanilla JS countdown updates every second using setInterval
- Target datetime constructed from date + time settings
- When expired: hides section/banner OR shows expired message based on setting
- No external dependencies
- AOS animations on full section

## Decisions

- Text input for date (YYYY-MM-DD) since Shopify schema lacks native date picker
- sessionStorage for banner dismiss (resets per session, not permanent)
- Two separate section files (not one section with display modes) for cleaner code and independent placement
- Inline styles and scripts in each section file
