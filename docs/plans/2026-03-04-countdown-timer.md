# Countdown Timer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a full-width countdown timer section and a slim countdown banner bar, both with configurable target date/time, expiry behavior, and merchant-friendly settings.

**Architecture:** Two independent section files (`countdown-timer.liquid` and `countdown-banner.liquid`), each self-contained with inline CSS, inline JS, and Liquid schema. Both use the same countdown JS pattern (setInterval, compute days/hours/mins/secs from time delta).

**Tech Stack:** Shopify Liquid, vanilla CSS (inline `{%- style -%}`), vanilla JS (inline `<script>`), no external dependencies.

---

### Task 1: Create the countdown timer full section

**Files:**
- Create: `sections/countdown-timer.liquid`

**Step 1: Create `sections/countdown-timer.liquid` with full content**

```liquid
{%- style -%}
  .countdown-timer {
    background: {{ section.settings.bg_color }};
    padding-top: {{ section.settings.padding_top_mobile }}px;
    padding-bottom: {{ section.settings.padding_bottom_mobile }}px;
    text-align: center;
  }
  @media (min-width: 750px) {
    .countdown-timer {
      padding-top: {{ section.settings.padding_top_desktop }}px;
      padding-bottom: {{ section.settings.padding_bottom_desktop }}px;
    }
  }

  .countdown-timer__description {
    max-width: 720px;
    margin: 0 auto 40px;
    text-align: center;
  }

  .countdown-timer__grid {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 32px;
  }
  @media (min-width: 750px) {
    .countdown-timer__grid {
      gap: 24px;
    }
  }

  .countdown-timer__group {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 64px;
  }
  @media (min-width: 750px) {
    .countdown-timer__group {
      min-width: 100px;
    }
  }

  .countdown-timer__digit {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
    color: var(--color-headings, inherit);
    background: var(--color-background, rgba(0,0,0,0.05));
    border-radius: 8px;
    padding: 16px 12px;
    width: 100%;
    border: 1px solid var(--color-borders, #F5F3F4);
  }
  @media (min-width: 750px) {
    .countdown-timer__digit {
      font-size: 3rem;
      padding: 20px 16px;
    }
  }

  .countdown-timer__label {
    margin-top: 8px;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text, inherit);
    opacity: 0.7;
  }
  @media (min-width: 750px) {
    .countdown-timer__label {
      font-size: 0.875rem;
    }
  }

  .countdown-timer__expired {
    font-size: 1.25rem;
    color: var(--color-text, inherit);
    padding: 32px 0;
  }

  .countdown-timer__cta {
    margin-top: 8px;
  }
{%- endstyle -%}

<div class="countdown-timer color-{{ section.settings.color_scheme }}" data-countdown-section data-end-date="{{ section.settings.end_date }}" data-end-time="{{ section.settings.end_time }}" data-expiry-action="{{ section.settings.expiry_action }}" {{ section.shopify_attributes }}>
  <div class="container">
    {%- if section.settings.title != blank -%}
      <div>
        {%- render 'section-heading',
          title: section.settings.title,
          heading_tag: 'h2',
          show_left_line: true,
          show_left_icon: true,
          show_right_icon: true,
          show_right_line: true
        -%}
      </div>
    {%- endif -%}

    {%- if section.settings.description != blank -%}
      <div class="countdown-timer__description rte">
        {{ section.settings.description }}
      </div>
    {%- endif -%}

    <div class="countdown-timer__grid" data-aos="fade-up" data-countdown-grid>
      <div class="countdown-timer__group">
        <span class="countdown-timer__digit" data-countdown-days>00</span>
        <span class="countdown-timer__label">Days</span>
      </div>
      <div class="countdown-timer__group">
        <span class="countdown-timer__digit" data-countdown-hours>00</span>
        <span class="countdown-timer__label">Hours</span>
      </div>
      <div class="countdown-timer__group">
        <span class="countdown-timer__digit" data-countdown-mins>00</span>
        <span class="countdown-timer__label">Mins</span>
      </div>
      <div class="countdown-timer__group">
        <span class="countdown-timer__digit" data-countdown-secs>00</span>
        <span class="countdown-timer__label">Secs</span>
      </div>
    </div>

    <div class="countdown-timer__expired" data-countdown-expired style="display:none;">
      {{ section.settings.expired_message }}
    </div>

    {%- if section.settings.button_text != blank -%}
      <div class="countdown-timer__cta" data-countdown-cta>
        <a href="{{ section.settings.button_link }}" class="btn btn--primary">
          {{ section.settings.button_text }}
        </a>
      </div>
    {%- endif -%}
  </div>
</div>

<script>
  (function() {
    var section = document.querySelector('[{{ section.shopify_attributes }}]');
    if (!section) return;

    var endDate = section.dataset.endDate;
    var endTime = section.dataset.endTime || '00:00';
    if (!endDate) return;

    var target = new Date(endDate + 'T' + endTime + ':00').getTime();
    var grid = section.querySelector('[data-countdown-grid]');
    var expiredEl = section.querySelector('[data-countdown-expired]');
    var ctaEl = section.querySelector('[data-countdown-cta]');
    var daysEl = section.querySelector('[data-countdown-days]');
    var hoursEl = section.querySelector('[data-countdown-hours]');
    var minsEl = section.querySelector('[data-countdown-mins]');
    var secsEl = section.querySelector('[data-countdown-secs]');
    var expiryAction = section.dataset.expiryAction;

    function pad(n) { return n < 10 ? '0' + n : n; }

    function update() {
      var now = Date.now();
      var diff = target - now;

      if (diff <= 0) {
        clearInterval(timer);
        if (expiryAction === 'hide') {
          section.style.display = 'none';
        } else {
          grid.style.display = 'none';
          if (ctaEl) ctaEl.style.display = 'none';
          expiredEl.style.display = '';
        }
        return;
      }

      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var mins = Math.floor((diff % 3600000) / 60000);
      var secs = Math.floor((diff % 60000) / 1000);

      daysEl.textContent = pad(days);
      hoursEl.textContent = pad(hours);
      minsEl.textContent = pad(mins);
      secsEl.textContent = pad(secs);
    }

    update();
    var timer = setInterval(update, 1000);
  })();
</script>

{% schema %}
{
  "name": "Countdown Timer",
  "tag": "section",
  "class": "countdown-timer-section",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Title",
      "default": "Limited Time Offer"
    },
    {
      "type": "richtext",
      "id": "description",
      "label": "Description"
    },
    {
      "type": "header",
      "content": "Countdown"
    },
    {
      "type": "text",
      "id": "end_date",
      "label": "End date",
      "info": "Format: YYYY-MM-DD (e.g. 2026-12-31)",
      "default": "2026-12-31"
    },
    {
      "type": "text",
      "id": "end_time",
      "label": "End time (24h)",
      "info": "Format: HH:MM (e.g. 18:00)",
      "default": "00:00"
    },
    {
      "type": "select",
      "id": "expiry_action",
      "label": "When countdown ends",
      "options": [
        { "value": "hide", "label": "Hide section" },
        { "value": "show_message", "label": "Show expired message" }
      ],
      "default": "show_message"
    },
    {
      "type": "text",
      "id": "expired_message",
      "label": "Expired message",
      "default": "This offer has ended."
    },
    {
      "type": "header",
      "content": "Button"
    },
    {
      "type": "text",
      "id": "button_text",
      "label": "Button text",
      "default": "Shop Now"
    },
    {
      "type": "url",
      "id": "button_link",
      "label": "Button link",
      "default": "/collections/all"
    },
    {
      "type": "header",
      "content": "Colors"
    },
    {
      "type": "color",
      "id": "bg_color",
      "label": "Background color",
      "default": "#ffffff"
    },
    {
      "type": "color_scheme",
      "id": "color_scheme",
      "label": "Color scheme",
      "default": "scheme-1"
    },
    {
      "type": "header",
      "content": "Section Spacing"
    },
    {
      "type": "range",
      "id": "padding_top_desktop",
      "label": "Padding top — desktop",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "default": 56
    },
    {
      "type": "range",
      "id": "padding_bottom_desktop",
      "label": "Padding bottom — desktop",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "default": 56
    },
    {
      "type": "range",
      "id": "padding_top_mobile",
      "label": "Padding top — mobile",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "default": 20
    },
    {
      "type": "range",
      "id": "padding_bottom_mobile",
      "label": "Padding bottom — mobile",
      "min": 0,
      "max": 100,
      "step": 4,
      "unit": "px",
      "default": 20
    }
  ],
  "presets": [
    {
      "name": "Countdown Timer",
      "category": "Promotional"
    }
  ]
}
{% endschema %}
```

**Step 2: Commit**

```bash
git add sections/countdown-timer.liquid
git commit -m "feat: add countdown timer section with expiry behavior"
```

---

### Task 2: Create the countdown banner section

**Files:**
- Create: `sections/countdown-banner.liquid`

**Step 1: Create `sections/countdown-banner.liquid` with full content**

```liquid
{%- style -%}
  .countdown-banner {
    background: {{ section.settings.bg_color }};
    color: {{ section.settings.text_color }};
    padding: 10px 0;
    font-size: 0.875rem;
  }

  .countdown-banner__inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .countdown-banner__label {
    font-weight: 600;
  }

  .countdown-banner__time {
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
  }

  .countdown-banner__link {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
    font-weight: 600;
    margin-left: 4px;
  }
  .countdown-banner__link:hover {
    opacity: 0.8;
  }

  .countdown-banner__close {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 4px;
    opacity: 0.7;
    line-height: 0;
  }
  .countdown-banner__close:hover {
    opacity: 1;
  }
  .countdown-banner__close svg {
    width: 16px;
    height: 16px;
  }

  .countdown-banner__wrap {
    position: relative;
  }

  .countdown-banner__expired {
    text-align: center;
    font-weight: 600;
  }
{%- endstyle -%}

<div class="countdown-banner" data-countdown-banner data-section-id="{{ section.id }}" data-end-date="{{ section.settings.end_date }}" data-end-time="{{ section.settings.end_time }}" data-expiry-action="{{ section.settings.expiry_action }}" {{ section.shopify_attributes }}>
  <div class="container countdown-banner__wrap">
    <div class="countdown-banner__inner" data-countdown-banner-inner>
      {%- if section.settings.label != blank -%}
        <span class="countdown-banner__label">{{ section.settings.label }}</span>
      {%- endif -%}
      <span class="countdown-banner__time" data-countdown-banner-time></span>
      {%- if section.settings.link_text != blank and section.settings.link_url != blank -%}
        <a href="{{ section.settings.link_url }}" class="countdown-banner__link">{{ section.settings.link_text }} &rarr;</a>
      {%- endif -%}
    </div>
    <div class="countdown-banner__expired" data-countdown-banner-expired style="display:none;">
      {{ section.settings.expired_message }}
    </div>
    <button class="countdown-banner__close" data-countdown-banner-close type="button" aria-label="Close">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>
</div>

<script>
  (function() {
    var banner = document.querySelector('[{{ section.shopify_attributes }}]');
    if (!banner) return;

    var sectionId = banner.dataset.sectionId;
    var storageKey = 'countdown-banner-dismissed-' + sectionId;

    // Check if dismissed this session
    if (sessionStorage.getItem(storageKey)) {
      banner.style.display = 'none';
      return;
    }

    // Dismiss button
    var closeBtn = banner.querySelector('[data-countdown-banner-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        banner.style.display = 'none';
        sessionStorage.setItem(storageKey, '1');
      });
    }

    var endDate = banner.dataset.endDate;
    var endTime = banner.dataset.endTime || '00:00';
    if (!endDate) return;

    var target = new Date(endDate + 'T' + endTime + ':00').getTime();
    var timeEl = banner.querySelector('[data-countdown-banner-time]');
    var innerEl = banner.querySelector('[data-countdown-banner-inner]');
    var expiredEl = banner.querySelector('[data-countdown-banner-expired]');
    var expiryAction = banner.dataset.expiryAction;

    function pad(n) { return n < 10 ? '0' + n : n; }

    function update() {
      var now = Date.now();
      var diff = target - now;

      if (diff <= 0) {
        clearInterval(timer);
        if (expiryAction === 'hide') {
          banner.style.display = 'none';
        } else {
          innerEl.style.display = 'none';
          closeBtn.style.display = 'none';
          expiredEl.style.display = '';
        }
        return;
      }

      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var mins = Math.floor((diff % 3600000) / 60000);
      var secs = Math.floor((diff % 60000) / 1000);

      timeEl.textContent = pad(days) + 'd ' + pad(hours) + 'h ' + pad(mins) + 'm ' + pad(secs) + 's';
    }

    update();
    var timer = setInterval(update, 1000);
  })();
</script>

{% schema %}
{
  "name": "Countdown Banner",
  "tag": "section",
  "class": "countdown-banner-section",
  "settings": [
    {
      "type": "text",
      "id": "label",
      "label": "Label text",
      "default": "🔥 Sale ends in"
    },
    {
      "type": "header",
      "content": "Countdown"
    },
    {
      "type": "text",
      "id": "end_date",
      "label": "End date",
      "info": "Format: YYYY-MM-DD (e.g. 2026-12-31)",
      "default": "2026-12-31"
    },
    {
      "type": "text",
      "id": "end_time",
      "label": "End time (24h)",
      "info": "Format: HH:MM (e.g. 18:00)",
      "default": "00:00"
    },
    {
      "type": "select",
      "id": "expiry_action",
      "label": "When countdown ends",
      "options": [
        { "value": "hide", "label": "Hide banner" },
        { "value": "show_message", "label": "Show expired message" }
      ],
      "default": "hide"
    },
    {
      "type": "text",
      "id": "expired_message",
      "label": "Expired message",
      "default": "This offer has ended."
    },
    {
      "type": "header",
      "content": "Link"
    },
    {
      "type": "text",
      "id": "link_text",
      "label": "Link text",
      "default": "Shop Now"
    },
    {
      "type": "url",
      "id": "link_url",
      "label": "Link URL",
      "default": "/collections/all"
    },
    {
      "type": "header",
      "content": "Colors"
    },
    {
      "type": "color",
      "id": "bg_color",
      "label": "Background color",
      "default": "#C61D23"
    },
    {
      "type": "color",
      "id": "text_color",
      "label": "Text color",
      "default": "#FFFFFF"
    }
  ],
  "presets": [
    {
      "name": "Countdown Banner",
      "category": "Promotional"
    }
  ]
}
{% endschema %}
```

**Step 2: Commit**

```bash
git add sections/countdown-banner.liquid
git commit -m "feat: add countdown banner section with dismiss and expiry"
```
