# Age Verifier & Before/After Image Slider — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

---

## Feature 1: Age Verifier

**Goal:** Full-screen age verification modal controlled via theme settings with 3 verification modes.

**Architecture:** `snippets/age-verifier.liquid` (inline CSS + JS), rendered in `layout/theme.liquid`, configured via `config/settings_schema.json`.

**Behavior:**
- Full-screen overlay at z-index 70 (above all other overlays)
- 3 modes: simple confirm buttons, DOB input, year dropdown
- Passes → localStorage + cookie storage, configurable duration
- Fails → show rejection message OR redirect (merchant choice)
- No escape/backdrop dismiss — must interact
- Body scroll locked while open

---

## Feature 2: Before/After Image Slider

**Goal:** A draggable before/after image comparison section.

**Architecture:** `sections/before-after.liquid` with inline CSS + JS. Draggable vertical handle that reveals before vs after images.

**Behavior:**
- Two images side by side, clipped by a draggable divider
- Mouse drag + touch drag support
- Optional labels for "Before" / "After"
- Responsive — works on mobile and desktop

---

### Task 1: Add age verification settings to settings_schema.json

**Files:**
- Edit: `config/settings_schema.json`

**Step 1:** Add a new settings group object to the array in `settings_schema.json` with these settings:

```json
{
  "name": "Age Verification",
  "settings": [
    {
      "type": "checkbox",
      "id": "age_verify_enabled",
      "label": "Enable age verification",
      "default": false
    },
    {
      "type": "range",
      "id": "age_verify_min_age",
      "label": "Minimum age",
      "min": 13,
      "max": 25,
      "step": 1,
      "default": 18
    },
    {
      "type": "select",
      "id": "age_verify_mode",
      "label": "Verification mode",
      "options": [
        { "value": "confirm", "label": "Simple confirm buttons" },
        { "value": "dob", "label": "Date of birth input" },
        { "value": "year", "label": "Year selection dropdown" }
      ],
      "default": "confirm"
    },
    {
      "type": "text",
      "id": "age_verify_heading",
      "label": "Heading",
      "default": "Age Verification"
    },
    {
      "type": "textarea",
      "id": "age_verify_description",
      "label": "Description",
      "default": "You must be {{ age }} or older to enter this site."
    },
    {
      "type": "image_picker",
      "id": "age_verify_bg_image",
      "label": "Background image"
    },
    {
      "type": "select",
      "id": "age_verify_fail_action",
      "label": "If underage",
      "options": [
        { "value": "message", "label": "Show rejection message" },
        { "value": "redirect", "label": "Redirect to URL" }
      ],
      "default": "message"
    },
    {
      "type": "text",
      "id": "age_verify_fail_message",
      "label": "Rejection message",
      "default": "Sorry, you must be of legal age to visit this site."
    },
    {
      "type": "url",
      "id": "age_verify_redirect_url",
      "label": "Redirect URL"
    },
    {
      "type": "range",
      "id": "age_verify_remember_days",
      "label": "Remember verification (days)",
      "min": 1,
      "max": 365,
      "step": 1,
      "default": 30
    }
  ]
}
```

**Step 2: Commit**

```bash
git add config/settings_schema.json
git commit -m "feat: add age verification theme settings"
```

---

### Task 2: Create the age verifier snippet

**Files:**
- Create: `snippets/age-verifier.liquid`

**Step 1:** Create `snippets/age-verifier.liquid` with the following:

```liquid
{%- if settings.age_verify_enabled -%}
{%- style -%}
  .age-verifier {
    position: fixed;
    inset: 0;
    z-index: 70;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    opacity: 1;
    visibility: visible;
    transition: opacity 0.3s ease, visibility 0.3s ease;
  }
  .age-verifier.is-hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }

  .age-verifier__bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    opacity: 0.3;
  }

  .age-verifier__card {
    position: relative;
    background: #fff;
    border-radius: 12px;
    padding: 48px 40px;
    max-width: 460px;
    width: 90%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .age-verifier__heading {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 12px;
    color: var(--color-headings, #161a1d);
  }

  .age-verifier__description {
    font-size: 0.95rem;
    color: var(--color-text, #555);
    margin: 0 0 32px;
    line-height: 1.5;
  }

  .age-verifier__actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .age-verifier__btn {
    padding: 12px 32px;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: opacity 0.2s;
  }
  .age-verifier__btn:hover {
    opacity: 0.85;
  }
  .age-verifier__btn--yes {
    background: var(--btn-primary-bg, #161a1d);
    color: var(--btn-primary-text, #fff);
  }
  .age-verifier__btn--no {
    background: var(--btn-secondary-bg, #f5f3f4);
    color: var(--btn-secondary-text, #161a1d);
  }

  .age-verifier__form {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .age-verifier__dob-fields {
    display: flex;
    gap: 8px;
    justify-content: center;
  }
  .age-verifier__dob-fields input,
  .age-verifier__dob-fields select {
    padding: 10px 12px;
    border: 1px solid var(--color-borders, #ddd);
    border-radius: 6px;
    font-size: 1rem;
    font-family: inherit;
    text-align: center;
    background: #fff;
  }
  .age-verifier__dob-fields input {
    width: 70px;
  }
  .age-verifier__dob-fields select {
    width: 120px;
  }

  .age-verifier__error {
    color: #d00;
    font-size: 0.9rem;
    display: none;
    margin-top: 8px;
  }
  .age-verifier__error.is-visible {
    display: block;
  }

  .age-verifier__rejected {
    display: none;
  }
  .age-verifier__rejected.is-visible {
    display: block;
  }
  .age-verifier__rejected p {
    font-size: 1.1rem;
    font-weight: 600;
    color: #d00;
  }
{%- endstyle -%}

<div class="age-verifier" id="AgeVerifier" data-age-verifier
  data-min-age="{{ settings.age_verify_min_age }}"
  data-mode="{{ settings.age_verify_mode }}"
  data-fail-action="{{ settings.age_verify_fail_action }}"
  data-redirect-url="{{ settings.age_verify_redirect_url }}"
  data-remember-days="{{ settings.age_verify_remember_days }}"
>
  {%- if settings.age_verify_bg_image != blank -%}
    <div class="age-verifier__bg" style="background-image: url('{{ settings.age_verify_bg_image | image_url: width: 1920 }}');"></div>
  {%- endif -%}

  <div class="age-verifier__card">
    <h2 class="age-verifier__heading">{{ settings.age_verify_heading }}</h2>
    <p class="age-verifier__description">
      {{ settings.age_verify_description | replace: '{{ age }}', settings.age_verify_min_age }}
    </p>

    {%- comment -%} Mode: Simple Confirm {%- endcomment -%}
    {%- if settings.age_verify_mode == 'confirm' -%}
      <div class="age-verifier__actions">
        <button class="age-verifier__btn age-verifier__btn--yes" type="button" data-age-verify-yes>
          I am {{ settings.age_verify_min_age }}+
        </button>
        <button class="age-verifier__btn age-verifier__btn--no" type="button" data-age-verify-no>
          I am not
        </button>
      </div>

    {%- comment -%} Mode: Date of Birth {%- endcomment -%}
    {%- elsif settings.age_verify_mode == 'dob' -%}
      <div class="age-verifier__form">
        <div class="age-verifier__dob-fields">
          <input type="number" placeholder="DD" min="1" max="31" data-age-dob-day aria-label="Day">
          <input type="number" placeholder="MM" min="1" max="12" data-age-dob-month aria-label="Month">
          <input type="number" placeholder="YYYY" min="1900" max="2025" data-age-dob-year aria-label="Year" style="width:90px">
        </div>
        <button class="age-verifier__btn age-verifier__btn--yes" type="button" data-age-verify-dob-submit>
          Submit
        </button>
      </div>

    {%- comment -%} Mode: Year Dropdown {%- endcomment -%}
    {%- elsif settings.age_verify_mode == 'year' -%}
      <div class="age-verifier__form">
        <div class="age-verifier__dob-fields">
          <select data-age-verify-year aria-label="Birth year">
            <option value="">Select year...</option>
          </select>
        </div>
        <button class="age-verifier__btn age-verifier__btn--yes" type="button" data-age-verify-year-submit>
          Submit
        </button>
      </div>
    {%- endif -%}

    <p class="age-verifier__error" data-age-error>Please enter a valid date.</p>

    <div class="age-verifier__rejected" data-age-rejected>
      <p>{{ settings.age_verify_fail_message }}</p>
    </div>
  </div>
</div>

<script>
(function() {
  var el = document.getElementById('AgeVerifier');
  if (!el) return;

  var minAge = parseInt(el.dataset.minAge, 10);
  var mode = el.dataset.mode;
  var failAction = el.dataset.failAction;
  var redirectUrl = el.dataset.redirectUrl;
  var rememberDays = parseInt(el.dataset.rememberDays, 10) || 30;
  var STORAGE_KEY = 'age_verified';

  function getCookie(name) {
    var m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return m ? m[2] : null;
  }

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 86400000);
    document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  if (localStorage.getItem(STORAGE_KEY) === 'true' || getCookie(STORAGE_KEY) === '1') {
    el.classList.add('is-hidden');
    return;
  }

  document.body.style.overflow = 'hidden';

  function pass() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setCookie(STORAGE_KEY, '1', rememberDays);
    el.classList.add('is-hidden');
    document.body.style.overflow = '';
  }

  function fail() {
    if (failAction === 'redirect' && redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      var rejected = el.querySelector('[data-age-rejected]');
      var actions = el.querySelector('.age-verifier__actions') || el.querySelector('.age-verifier__form');
      if (actions) actions.style.display = 'none';
      if (rejected) rejected.classList.add('is-visible');
    }
  }

  function showError(msg) {
    var err = el.querySelector('[data-age-error]');
    if (err) { err.textContent = msg; err.classList.add('is-visible'); }
  }
  function hideError() {
    var err = el.querySelector('[data-age-error]');
    if (err) err.classList.remove('is-visible');
  }

  function calcAge(year, month, day) {
    var today = new Date();
    var age = today.getFullYear() - year;
    var m = today.getMonth() + 1 - month;
    if (m < 0 || (m === 0 && today.getDate() < day)) age--;
    return age;
  }

  // Simple confirm
  var yesBtn = el.querySelector('[data-age-verify-yes]');
  var noBtn = el.querySelector('[data-age-verify-no]');
  if (yesBtn) yesBtn.addEventListener('click', pass);
  if (noBtn) noBtn.addEventListener('click', fail);

  // DOB
  var dobSubmit = el.querySelector('[data-age-verify-dob-submit]');
  if (dobSubmit) {
    dobSubmit.addEventListener('click', function() {
      hideError();
      var d = parseInt(el.querySelector('[data-age-dob-day]').value, 10);
      var m = parseInt(el.querySelector('[data-age-dob-month]').value, 10);
      var y = parseInt(el.querySelector('[data-age-dob-year]').value, 10);
      if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900) {
        showError('Please enter a valid date.');
        return;
      }
      calcAge(y, m, d) >= minAge ? pass() : fail();
    });
  }

  // Year dropdown
  var yearSelect = el.querySelector('[data-age-verify-year]');
  if (yearSelect) {
    var currentYear = new Date().getFullYear();
    for (var yr = currentYear; yr >= 1900; yr--) {
      var opt = document.createElement('option');
      opt.value = yr; opt.textContent = yr;
      yearSelect.appendChild(opt);
    }
  }
  var yearSubmit = el.querySelector('[data-age-verify-year-submit]');
  if (yearSubmit) {
    yearSubmit.addEventListener('click', function() {
      hideError();
      var y = parseInt(yearSelect.value, 10);
      if (!y) { showError('Please select your birth year.'); return; }
      (new Date().getFullYear() - y) >= minAge ? pass() : fail();
    });
  }
})();
</script>
{%- endif -%}
```

**Step 2: Commit**

```bash
git add snippets/age-verifier.liquid
git commit -m "feat: add age verifier snippet with 3 verification modes"
```

---

### Task 3: Render age verifier in theme.liquid

**Files:**
- Edit: `layout/theme.liquid`

**Step 1:** Add `{% render 'age-verifier' %}` right before the closing `</body>` tag (after the other snippets like cart-drawer, product-drawer, etc.).

**Step 2: Commit**

```bash
git add layout/theme.liquid
git commit -m "feat: render age verifier in theme layout"
```

---

### Task 4: Create the before/after image slider section

**Files:**
- Create: `sections/before-after.liquid`

**Step 1:** Create `sections/before-after.liquid` with full content:

```liquid
{%- style -%}
  .before-after {
    padding-top: {{ section.settings.padding_top_mobile }}px;
    padding-bottom: {{ section.settings.padding_bottom_mobile }}px;
  }
  @media (min-width: 750px) {
    .before-after {
      padding-top: {{ section.settings.padding_top_desktop }}px;
      padding-bottom: {{ section.settings.padding_bottom_desktop }}px;
    }
  }

  .before-after__slider {
    position: relative;
    overflow: hidden;
    cursor: ew-resize;
    user-select: none;
    -webkit-user-select: none;
    border-radius: 8px;
    max-width: {{ section.settings.max_width }}px;
    margin: 0 auto;
  }

  .before-after__img {
    display: block;
    width: 100%;
    height: auto;
  }

  .before-after__before {
    position: absolute;
    inset: 0;
    overflow: hidden;
    width: 50%;
  }
  .before-after__before img {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--ba-full-width, 100%);
    height: 100%;
    object-fit: cover;
  }

  .before-after__handle {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 4px;
    background: #fff;
    transform: translateX(-50%);
    z-index: 2;
    box-shadow: 0 0 8px rgba(0,0,0,0.3);
  }
  .before-after__handle::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
  .before-after__handle::before {
    content: '\2039\00a0\203a';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
    font-size: 1.2rem;
    font-weight: 700;
    color: #333;
    letter-spacing: 8px;
  }

  .before-after__label {
    position: absolute;
    bottom: 16px;
    padding: 6px 14px;
    background: rgba(0,0,0,0.6);
    color: #fff;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 4px;
    z-index: 1;
    pointer-events: none;
  }
  .before-after__label--before {
    left: 16px;
  }
  .before-after__label--after {
    right: 16px;
  }
{%- endstyle -%}

<div class="before-after color-{{ section.settings.color_scheme }}" {{ section.shopify_attributes }}>
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
      <div style="text-align:center;max-width:720px;margin:0 auto 40px;">
        <div class="rte">{{ section.settings.description }}</div>
      </div>
    {%- endif -%}

    {%- for block in section.blocks -%}
      <div class="before-after__slider" data-before-after data-aos="fade-up" {{ block.shopify_attributes }}>
        {%- if block.settings.after_image != blank -%}
          <img class="before-after__img" src="{{ block.settings.after_image | image_url: width: 1200 }}" alt="{{ block.settings.after_label | default: 'After' }}" loading="lazy" width="1200" height="{{ 1200 | divided_by: block.settings.after_image.aspect_ratio | round }}">
        {%- else -%}
          {{ 'image' | placeholder_svg_tag: 'before-after__img' }}
        {%- endif -%}

        <div class="before-after__before" data-ba-before>
          {%- if block.settings.before_image != blank -%}
            <img src="{{ block.settings.before_image | image_url: width: 1200 }}" alt="{{ block.settings.before_label | default: 'Before' }}" loading="lazy">
          {%- else -%}
            {{ 'image' | placeholder_svg_tag }}
          {%- endif -%}
        </div>

        <div class="before-after__handle" data-ba-handle></div>

        {%- if section.settings.show_labels -%}
          <span class="before-after__label before-after__label--before">{{ block.settings.before_label }}</span>
          <span class="before-after__label before-after__label--after">{{ block.settings.after_label }}</span>
        {%- endif -%}
      </div>
    {%- endfor -%}
  </div>
</div>

<script>
(function() {
  document.querySelectorAll('[data-before-after]').forEach(function(slider) {
    var handle = slider.querySelector('[data-ba-handle]');
    var before = slider.querySelector('[data-ba-before]');
    if (!handle || !before) return;

    var dragging = false;

    function setPosition(x) {
      var rect = slider.getBoundingClientRect();
      var pct = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
      before.style.width = (pct * 100) + '%';
      handle.style.left = (pct * 100) + '%';
      before.style.setProperty('--ba-full-width', (rect.width) + 'px');
    }

    function onStart(e) {
      e.preventDefault();
      dragging = true;
    }
    function onMove(e) {
      if (!dragging) return;
      var x = e.touches ? e.touches[0].clientX : e.clientX;
      setPosition(x);
    }
    function onEnd() { dragging = false; }

    handle.addEventListener('mousedown', onStart);
    handle.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);

    slider.addEventListener('click', function(e) {
      setPosition(e.clientX);
    });

    // Set initial full width
    function initWidth() {
      before.style.setProperty('--ba-full-width', slider.offsetWidth + 'px');
    }
    initWidth();
    window.addEventListener('resize', initWidth);
  });
})();
</script>

{% schema %}
{
  "name": "Before / After",
  "tag": "section",
  "class": "before-after-section",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Title",
      "default": "Before & After"
    },
    {
      "type": "richtext",
      "id": "description",
      "label": "Description"
    },
    {
      "type": "checkbox",
      "id": "show_labels",
      "label": "Show labels",
      "default": true
    },
    {
      "type": "range",
      "id": "max_width",
      "label": "Max width (px)",
      "min": 400,
      "max": 1200,
      "step": 50,
      "unit": "px",
      "default": 800
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
  "blocks": [
    {
      "type": "slide",
      "name": "Slide",
      "settings": [
        {
          "type": "image_picker",
          "id": "before_image",
          "label": "Before image"
        },
        {
          "type": "image_picker",
          "id": "after_image",
          "label": "After image"
        },
        {
          "type": "text",
          "id": "before_label",
          "label": "Before label",
          "default": "Before"
        },
        {
          "type": "text",
          "id": "after_label",
          "label": "After label",
          "default": "After"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Before / After",
      "category": "Image",
      "blocks": [
        {
          "type": "slide"
        }
      ]
    }
  ],
  "max_blocks": 10
}
{% endschema %}
```

**Step 2: Commit**

```bash
git add sections/before-after.liquid
git commit -m "feat: add before/after image comparison slider section"
```
