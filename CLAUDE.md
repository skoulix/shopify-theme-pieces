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
- `.section-spacing` - Vertical padding using theme's section spacing (`--section-spacing`)
- `.section-spacing-top` - Top padding only
- `.section-spacing-bottom` - Bottom padding only

**DO:**
```liquid
<div class="page-container section-spacing">
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

- Use GSAP for scroll-triggered and intro animations
- Set initial states with `gsap.set()`
- Common animation patterns:
  - `yPercent: 100` → `yPercent: 0` for text reveals
  - `clip-path: inset(0 100% 0 0)` → `clip-path: inset(0 0% 0 0)` for image reveals
  - `opacity: 0, y: 20` → `opacity: 1, y: 0` for fade-up effects
