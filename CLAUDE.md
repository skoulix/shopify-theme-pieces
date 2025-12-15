# Pieces Theme - Development Guidelines

## Tailwind CSS First

**ALWAYS use Tailwind CSS classes instead of custom CSS rules whenever possible.**

### When to use Tailwind classes:
- Layout (flex, grid, spacing, sizing)
- Typography (font-size, font-weight, line-height, letter-spacing)
- Colors using CSS variables: `text-[--color-text]`, `bg-[--color-background-secondary]`
- Borders and rounded corners: `rounded-[--card-radius]`, `border-[--color-border]`
- Responsive design: `md:`, `lg:`, `xl:` prefixes
- Line clamping: `line-clamp-3`, `line-clamp-6`
- Overflow, display, position, etc.

### When custom CSS is acceptable:
- `clamp()` values (Tailwind doesn't support clamp natively)
- Complex selectors like `:nth-child()`, `::before`, `::after`
- CSS properties without Tailwind equivalents (e.g., `clip-path`, `aspect-ratio: unset`)
- Liquid template values in CSS (e.g., `repeat({{ section.settings.columns }}, 1fr)`)
- Animation keyframes
- Pseudo-element content

### Examples

**DO:**
```liquid
<p class="text-sm leading-relaxed text-[--color-text-secondary] line-clamp-3">
```

**DON'T:**
```css
.blog-item-excerpt {
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--color-text-secondary);
  -webkit-line-clamp: 3;
}
```

### CSS Variable Usage with Tailwind

Use arbitrary value syntax for theme CSS variables:

**Colors:**
- `text-[--color-text]`
- `text-[--color-text-secondary]`
- `bg-[--color-background]`
- `bg-[--color-background-secondary]`
- `border-[--color-border]`
- `text-[--color-primary]`

**Border Radius (from theme settings):**
- `rounded-[--card-radius]`
- `rounded-[--button-radius]`
- `rounded-[--input-radius]`

**Custom sizes:**
- `text-[0.65rem]` (for specific sizes)

### Layout Utility Classes

The theme provides utility classes that respect theme settings:

**Container classes (use these instead of hardcoded max-w/px values):**
```liquid
{%- liquid
  if section.settings.full_width
    assign container_class = 'page-full'
  else
    assign container_class = 'page-container'
  endif
-%}
```

- `.page-container` - Centered container with max-width from theme settings (`--page-max-width`) and page padding (`--page-padding`)
- `.page-full` - Full width with page padding only
- `py-[--page-vertical-padding]` - Vertical padding for templates/pages using theme settings

**DO:**
```liquid
<div class="page-container py-[--page-vertical-padding]">
```

**DON'T:**
```liquid
<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
```

### Input Styling with CSS Variables

For inputs, use Tailwind arbitrary values with inline style for border-width:
```html
<input
  class="w-full py-3 px-4 text-[--color-text] bg-[--color-background] border border-[--color-border] rounded-[--input-radius] focus:border-[--color-primary] focus:outline-none"
  style="border-width: var(--input-border-width);"
>
```

### Responsive Classes

Always use Tailwind responsive prefixes:
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px
- `2xl:` - 1536px

Example:
```liquid
<div class="p-6{% if is_featured %} lg:py-8 lg:pr-8 lg:pl-0 lg:flex lg:flex-col lg:justify-center{% endif %}">
```

## Reusable Patterns

### Text Hover Reveal
```liquid
<a class="text-hover-reveal">
  <span data-hover="Text">Text</span>
  <i class="ph ph-arrow-right"></i>
</a>
```

### Page Header Subtitle (with line draw animation)
```liquid
<p class="page-header-subtitle">
  <span class="page-header-subtitle-line" data-subtitle-line></span>
  <span class="overflow-hidden">
    <span class="inline-block" data-subtitle-text>Text here</span>
  </span>
</p>
```

## Animation Guidelines

### Animation Control System

The theme has a two-tier animation control system:

1. **Theme Setting**: `settings.enable_animations` (Layout > "Enable animations")
2. **User Preference**: `prefers-reduced-motion` media query

**Global helper function** (`window.shouldAnimate()`):
```javascript
// Returns true only if BOTH conditions are met:
// 1. Theme setting enables animations
// 2. User hasn't enabled reduced motion
window.shouldAnimate()
```

**When animations are disabled:**
- The `html` element gets the class `animations-disabled`
- CSS automatically shows hidden elements immediately (no manual overrides needed for data-tween)

### Global Tween System (`data-tween`) - PREFERRED

**Use the declarative `data-tween` system for all scroll-triggered animations.** This is handled by `TweenManager.js` and requires no inline JavaScript.

#### Basic Usage

```liquid
<div data-tween data-tween-type="fade-up">Content animates when scrolled into view</div>
```

#### Available Animation Types

| Type | Description | Initial State |
|------|-------------|---------------|
| `fade-up` | Fade in while moving up | `opacity: 0`, `y: 30` |
| `fade-down` | Fade in while moving down | `opacity: 0`, `y: -30` |
| `fade-left` | Fade in while moving left | `opacity: 0`, `x: 30` |
| `fade-right` | Fade in while moving right | `opacity: 0`, `x: -30` |
| `fade` | Simple fade in | `opacity: 0` |
| `split-text` | Line-by-line text reveal (for titles) | Lines hidden below |
| `clip-right` | Image reveal from left to right | `clip-path: inset(0 100% 0 0)` |
| `clip-up` | Image reveal from bottom to top | `clip-path: inset(100% 0 0 0)` |
| `clip-down` | Image reveal from top to bottom | `clip-path: inset(0 0 100% 0)` |
| `scale` | Scale up from smaller | `opacity: 0`, `scale: 0.95` |
| `scale-up` | Scale up more dramatically | `opacity: 0`, `scale: 0.8` |

#### Sequenced Animations with Groups

Use `data-tween-group` to animate elements in sequence (staggered by DOM order):

```liquid
<div data-tween-group="section-header-{{ section.id }}">
  <span class="section-label" data-tween data-tween-type="fade-up">Label</span>
  <h2 class="section-title" data-tween data-tween-type="split-text">Title</h2>
  <p class="section-description" data-tween data-tween-type="fade-up">Description</p>
</div>
```

**Animation sequence:**
1. Label fades up
2. Title reveals line-by-line
3. Description fades up

#### Standard Section Header Pattern

For consistent header animations across all sections:

```liquid
{% if section.settings.label != blank or section.settings.title != blank %}
  <div class="section-header" data-tween-group="section-header-{{ section.id }}">
    {% if section.settings.label != blank %}
      <span class="section-label" data-tween data-tween-type="fade-up">
        {{ section.settings.label }}
      </span>
    {% endif %}

    {% if section.settings.title != blank %}
      <h2 class="section-title font-heading" data-tween data-tween-type="split-text">
        {{ section.settings.title }}
      </h2>
    {% endif %}

    {% if section.settings.description != blank %}
      <p class="section-description" data-tween data-tween-type="fade-up">
        {{ section.settings.description }}
      </p>
    {% endif %}
  </div>
{% endif %}
```

#### Image Reveal Animation

For images with clip-path reveal effect:

```liquid
<div class="image-wrapper" data-tween data-tween-type="clip-right">
  {{ image | image_url: width: 1200 | image_tag: class: 'w-full h-full object-cover' }}
</div>
```

#### Standalone Elements (No Group)

Elements with `data-tween` outside of a `data-tween-group` animate independently when scrolled into view:

```liquid
<div class="card" data-tween data-tween-type="fade-up">Card content</div>
```

#### CSS Initial States

Initial states are automatically handled in `animations.css`:

```css
/* Elements start hidden */
[data-tween],
[data-tween-type="fade-up"],
[data-tween-type="fade-down"],
/* ... etc */
{
  opacity: 0;
}

[data-tween-type="clip-right"] {
  clip-path: inset(0 100% 0 0);
}

/* Show immediately when animations disabled */
html.animations-disabled [data-tween],
html.animations-disabled [data-tween-type] {
  opacity: 1 !important;
  transform: none !important;
  clip-path: none !important;
}
```

### Section-Specific Animation JavaScript

For sections that need custom scroll-based behavior beyond `data-tween` (e.g., timeline progress, parallax effects):

```javascript
(function() {
  const section = document.querySelector('[data-my-section="{{ section.id }}"]');
  if (!section || section.dataset.myInitialized) return;
  section.dataset.myInitialized = 'true';

  function initSection() {
    const ScrollTrigger = window.ScrollTrigger || (window.pieces && window.pieces.ScrollTrigger);
    if (!ScrollTrigger) {
      setTimeout(initSection, 50);
      return;
    }

    // Custom scroll-based behavior here (NOT header animations - use data-tween for those)
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      onUpdate: (self) => {
        // Custom scroll logic
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSection);
  } else {
    requestAnimationFrame(initSection);
  }
})();
```

**Important:** Use inline JS only for custom scroll behavior. Use `data-tween` attributes for standard enter animations.

## Internationalization (i18n)

**NEVER use hardcoded text strings in sections.** All user-facing text must be translatable.

### Translation System

Shopify uses JSON locale files in `/locales/`. The primary file is `en.default.json`.

**Translation filter syntax:**
```liquid
{{ 'namespace.key' | t }}
```

**With interpolation:**
```liquid
{{ 'sections.shop_the_look.view_product' | t: index: forloop.index }}
```

**Pluralization:**
```json
{
  "items_in_look": {
    "one": "{{ count }} item in this look",
    "other": "{{ count }} items in this look"
  }
}
```
```liquid
{{ 'sections.shop_the_look.items_in_look' | t: count: product_count }}
```

### Where to Add Translation Keys

Organize translations by section in `en.default.json`:

```json
{
  "sections": {
    "shop_the_look": {
      "items_in_look": { "one": "...", "other": "..." },
      "total": "Total",
      "view_product": "View product {{ index }}",
      "add_all": "Add All"
    },
    "hotspots": {
      "view_details": "View details"
    }
  }
}
```

### Common Translation Namespaces

- `accessibility.*` - Screen reader text, aria-labels
- `general.*` - Common UI text (View All, Share, etc.)
- `products.product.*` - Product-related (Add to cart, Sold out)
- `cart.*` - Cart-related (Checkout, Adding..., Added!)
- `sections.<section_name>.*` - Section-specific text

### Handling Default Values with Translations

When a setting has a default but should fall back to a translation:

**DO:**
```liquid
{%- liquid
  if section.settings.button_text != blank
    assign button_text = section.settings.button_text
  else
    assign button_text = 'sections.shop_the_look.add_all' | t
  endif
-%}
<button>{{ button_text }}</button>
```

**DON'T:**
```liquid
{# This doesn't work - default is applied before translation #}
<button>{{ section.settings.button_text | default: 'sections.shop_the_look.add_all' | t }}</button>
```

### JavaScript Strings

For text rendered in JavaScript, use Liquid to inject translations:

```javascript
button.innerHTML = '<span>{{ 'cart.adding' | t }}</span>';
button.innerHTML = '<span>{{ 'cart.added' | t }}</span>';
```

## Accessibility (a11y)

**All interactive elements must be accessible.** Follow WCAG 2.1 AA guidelines.

### Aria Labels

Every interactive element without visible text needs an `aria-label`:

```liquid
<button aria-label="{{ 'accessibility.close' | t }}">
  <i class="ph ph-x"></i>
</button>

<button aria-label="{{ 'sections.shop_the_look.view_product' | t: index: forloop.index }}">
  <span>{{ forloop.index }}</span>
</button>
```

**Use translations for aria-labels** - never hardcode:

**DO:**
```liquid
aria-label="{{ 'accessibility.close' | t }}"
aria-label="{{ 'sections.hotspots.view_details' | t }}"
```

**DON'T:**
```liquid
aria-label="Close"
aria-label="View details"
```

### Dynamic Aria Labels

When aria-labels need dynamic content, use translation interpolation:

```liquid
aria-label="{{ 'accessibility.view_image' | t: index: forloop.index, total: images.size }}"
```

With translation key:
```json
"view_image": "View image {{ index }} of {{ total }}"
```

### Common Accessibility Patterns

**Close buttons:**
```liquid
<button aria-label="{{ 'accessibility.close' | t }}">
  <i class="ph ph-x"></i>
</button>
```

**Navigation arrows:**
```liquid
<button aria-label="{{ 'accessibility.previous_slide' | t }}">
  <i class="ph ph-arrow-left"></i>
</button>
<button aria-label="{{ 'accessibility.next_slide' | t }}">
  <i class="ph ph-arrow-right"></i>
</button>
```

**Image alt text:**
```liquid
{{ image | image_url: width: 800 | image_tag:
  alt: product.title,
  loading: 'lazy'
}}
```

**Form inputs:**
```liquid
<label for="email-{{ section.id }}">{{ 'customers.register.email' | t }}</label>
<input type="email" id="email-{{ section.id }}" name="email">
```

### Focus Management

- Ensure all interactive elements are keyboard accessible
- Use `tabindex="0"` sparingly - prefer native focusable elements
- Manage focus when opening/closing modals and drawers
- Provide visible focus indicators (don't remove outline without replacement)

### Reduced Motion

Always check for reduced motion preference:

```javascript
if (typeof window.shouldAnimate === 'function' && !window.shouldAnimate()) {
  // Skip animations
  return;
}
```

CSS fallback:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}

html.animations-disabled .element {
  opacity: 1;
  transform: none;
}
```

### Checklist for New Sections

When creating a new section, verify:

1. [ ] All buttons/links have `aria-label` if no visible text
2. [ ] All aria-labels use translation keys
3. [ ] Images have meaningful `alt` text
4. [ ] Form inputs have associated labels
5. [ ] No hardcoded user-facing strings
6. [ ] All text uses translation keys
7. [ ] Animations respect `shouldAnimate()` and have CSS fallbacks
8. [ ] Interactive elements are keyboard accessible
9. [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for large text)
10. [ ] Focus states are visible

## Section Schema Settings

**Use consistent setting patterns across all sections.** This ensures a cohesive merchant experience in the theme editor.

### Known IDE Warnings to Ignore

The Shopify theme schema validator may show false warnings for some valid setting types. These are known issues and can be safely ignored:

- **`text_alignment`** - Valid Shopify setting type, but IDE may show "Value is not accepted" warning. This is a false positive.

### Standard Section Header Settings

Most sections with a header should include these settings in this order:

```json
{
  "type": "header",
  "content": "Header"
},
{
  "type": "text",
  "id": "label",
  "label": "Label",
  "default": "Section Label"
},
{
  "type": "text",
  "id": "title",
  "label": "Title",
  "default": "Section Title"
},
{
  "type": "textarea",
  "id": "description",
  "label": "Description"
},
{
  "type": "select",
  "id": "header_alignment",
  "options": [
    { "value": "left", "label": "Left" },
    { "value": "center", "label": "Center" }
  ],
  "default": "left",
  "label": "Header alignment"
}
```

### Standard Layout Settings

```json
{
  "type": "header",
  "content": "Layout"
},
{
  "type": "checkbox",
  "id": "full_width",
  "label": "Full width",
  "default": false
}
```

For sections with image/content layout options:

```json
{
  "type": "select",
  "id": "layout",
  "label": "Layout",
  "options": [
    { "value": "image_left", "label": "Image left" },
    { "value": "image_right", "label": "Image right" }
  ],
  "default": "image_left"
}
```

### Standard Color Settings

**Use the `color_scheme` setting type** for section colors. This provides a consistent, centralized color management system.

```json
{
  "type": "header",
  "content": "Colors"
},
{
  "type": "color_scheme",
  "id": "color_scheme",
  "label": "Color scheme",
  "default": "scheme-1"
}
```

Then add the color scheme class to the section element:

```liquid
<section class="my-section-{{ section.id }} color-{{ section.settings.color_scheme }}">
```

The color scheme provides these CSS variables automatically:
- `--color-background` - Section background
- `--color-text` - Primary text color
- `--color-text-secondary` - Secondary/muted text
- `--color-primary` - Primary accent color (buttons, links)
- `--color-primary-contrast` - Text color on primary background
- `--color-border` - Border color

**For sections with additional accent colors** (e.g., star ratings, timeline dots):

```json
{
  "type": "color_scheme",
  "id": "color_scheme",
  "label": "Color scheme",
  "default": "scheme-1"
},
{
  "type": "color",
  "id": "accent_color",
  "label": "Accent color",
  "default": "#6366f1"
}
```

**When to keep individual color settings:**

Some sections legitimately need individual `background_color` and `text_color` settings:
- Sections with multiple overlay colors (separate from background)
- Sections with gradient masks using the background color
- Sections with per-block or per-panel colors
- Complex scroll-based sections with layered effects

Examples: hero-orbit, video, shoppable-videos, countdown, horizontal-scroll, scroll-panels, stacking-cards, pinned-image-reveal

### Global Theme Settings to Respect

Always use global card settings instead of hardcoded values:

```liquid
{%- liquid
  assign card_radius = settings.card_radius | default: 8
  assign card_border_width = settings.card_border_width | default: 0
  assign card_shadow = settings.card_shadow | default: 'none'
-%}
```

Apply in CSS:

```css
.my-card {
  border-radius: {{ card_radius }}px;
  {% if card_border_width > 0 %}
  border: {{ card_border_width }}px solid var(--color-border);
  {% endif %}
  {% if card_shadow != 'none' %}
  box-shadow: {{ card_shadow }};
  {% endif %}
}
```

### Section Vertical Padding

Use CSS variable for consistent vertical spacing:

```css
.my-section {
  padding: var(--section-vertical-padding) 0;
}
```

### Image Settings Pattern

For sections with images:

```json
{
  "type": "header",
  "content": "Image"
},
{
  "type": "image_picker",
  "id": "image",
  "label": "Image"
},
{
  "type": "text",
  "id": "image_alt",
  "label": "Image alt text",
  "info": "Describe the image for accessibility"
}
```

For sections with separate desktop/mobile images:

```json
{
  "type": "image_picker",
  "id": "desktop_image",
  "label": "Desktop image"
},
{
  "type": "image_picker",
  "id": "mobile_image",
  "label": "Mobile image",
  "info": "Optional: Different image for mobile devices"
}
```

### Image Ratio Settings

```json
{
  "type": "select",
  "id": "image_ratio",
  "options": [
    { "value": "1/1", "label": "Square (1:1)" },
    { "value": "4/5", "label": "Portrait (4:5)" },
    { "value": "3/4", "label": "Portrait (3:4)" },
    { "value": "16/9", "label": "Landscape (16:9)" }
  ],
  "default": "4/5",
  "label": "Image ratio"
}
```

### Button Settings Pattern

```json
{
  "type": "text",
  "id": "button_text",
  "label": "Button text",
  "default": "Learn More"
},
{
  "type": "url",
  "id": "button_link",
  "label": "Button link"
},
{
  "type": "select",
  "id": "button_style",
  "label": "Button style",
  "options": [
    { "value": "primary", "label": "Primary" },
    { "value": "secondary", "label": "Secondary" }
  ],
  "default": "primary"
}
```

### Block Position Settings (for hotspots, etc.)

```json
{
  "type": "header",
  "content": "Position"
},
{
  "type": "range",
  "id": "position_x",
  "label": "Horizontal position (Desktop)",
  "default": 50,
  "min": 0,
  "max": 100,
  "step": 1,
  "unit": "%"
},
{
  "type": "range",
  "id": "position_y",
  "label": "Vertical position (Desktop)",
  "default": 50,
  "min": 0,
  "max": 100,
  "step": 1,
  "unit": "%"
},
{
  "type": "range",
  "id": "position_x_mobile",
  "label": "Horizontal position (Mobile)",
  "default": 50,
  "min": 0,
  "max": 100,
  "step": 1,
  "unit": "%"
},
{
  "type": "range",
  "id": "position_y_mobile",
  "label": "Vertical position (Mobile)",
  "default": 50,
  "min": 0,
  "max": 100,
  "step": 1,
  "unit": "%"
}
```

### Consistent Setting Order

Settings should appear in this order:
1. **Header** - Label, title, description, alignment
2. **Content** - Section-specific content settings
3. **Image** - Image picker, alt text, ratio
4. **Layout** - Full width, image position, columns
5. **Display options** - Show/hide toggles
6. **Colors** - Background, text, accent colors

### Presets

Every section should have at least one preset:

```json
"presets": [
  {
    "name": "Section Name",
    "category": "Category Name",
    "blocks": []
  }
]
```

Common categories:
- `Image & media`
- `Products`
- `Text`
- `Promotional`
- `Collection`

### Section Class Naming

Use consistent class naming with section ID for scoping:

```liquid
<section class="my-section-{{ section.id }}" data-my-section="{{ section.id }}">
```

```css
.my-section-{{ section.id }} { /* styles */ }
```

### CSS Variable Consistency

**Prefer using CSS variables from color schemes** instead of inline Liquid values:

```css
/* DO - Use CSS variables from color scheme */
.my-section-{{ section.id }} .my-element {
  color: var(--color-text);
  background: var(--color-background);
  border-color: var(--color-border);
}

.my-section-{{ section.id }} .my-muted-text {
  color: var(--color-text-secondary);
}

.my-section-{{ section.id }} .my-button {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
}
```

**For button hover states** (sections that keep individual colors):

```css
.my-section-{{ section.id }} .btn {
  color: {{ section.settings.text_color }};
  border-color: {{ section.settings.text_color }};
}

.my-section-{{ section.id }} .btn::before {
  background: {{ section.settings.text_color }};
}

.my-section-{{ section.id }} .btn:hover {
  color: {{ section.settings.background_color }};
}
```

**For accent colors** (when using color_scheme + individual accent):

```css
.my-section-{{ section.id }} .accent-element {
  color: {{ section.settings.accent_color }};
}

.my-section-{{ section.id }} .accent-border {
  border-color: {{ section.settings.accent_color }};
}
```
