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

1. **Theme Setting**: `settings.enable_scroll_animations` (Layout > "Enable scroll animations")
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
- Use this class for CSS overrides to show hidden elements immediately

### CSS Overrides for Disabled Animations

Elements with initial hidden states (clip-path, opacity, transform) need CSS overrides:

```css
/* Show elements immediately when animations disabled */
html.animations-disabled .my-element { clip-path: none; }
html.animations-disabled .my-hidden-element { opacity: 1; transform: none; }
```

Common elements needing overrides:
- Images with `clip-path: inset(0 100% 0 0)` initial state
- Title lines with `yPercent: 120` initial state
- Elements with `opacity: 0` or `transform` initial state

### JavaScript Animation Pattern

Always check `shouldAnimate()` before running GSAP animations:

```javascript
// At the start of animation init function
if (typeof window.shouldAnimate === 'function' && !window.shouldAnimate()) {
  // Skip animations, show content immediately
  wrapper.classList.remove('is-loading');
  wrapper.classList.add('is-ready');
  return;
}
```

### GSAP Animation Patterns

- Use GSAP for scroll-triggered and intro animations
- Set initial states with `gsap.set()` or `fromTo()`
- Common animation patterns:
  - `yPercent: 120` → `yPercent: 0` for title text reveals (SplitText)
  - `clip-path: inset(0 100% 0 0)` → `clip-path: inset(0 0% 0 0)` for image reveals
  - `opacity: 0, y: 30` → `opacity: 1, y: 0` for fade-up effects

### SplitText Title Animation

For section titles with line-by-line reveal:

```javascript
const split = new SplitText(title, { type: 'lines', linesClass: 'my-title-line' });

// Wrap each line for overflow hidden
split.lines.forEach(line => {
  const wrapper = document.createElement('div');
  wrapper.style.overflow = 'hidden';
  wrapper.style.display = 'block';
  line.parentNode.insertBefore(wrapper, line);
  wrapper.appendChild(line);
});

gsap.set(split.lines, { yPercent: 120 });

gsap.to(split.lines, {
  yPercent: 0,
  duration: 1.2,
  ease: 'power4.out',
  stagger: 0.1,
  scrollTrigger: {
    trigger: section,
    start: 'top 70%',
    once: true
  }
});
```

**CSS for second line offset:**
```css
.my-title-line:nth-child(2) { margin-left: clamp(0.5rem, 4vw, 2rem); }
```

### Global Intro Animation (`data-intro`)

Use `data-intro` attribute for scroll-triggered fade-up animations on any element. This is a global system that can be applied anywhere.

**Usage:**
```liquid
<div data-intro>Content fades up when scrolled into view</div>
```

**How it works:**
- Elements with `data-intro` start with `opacity: 0` and `transform: translateY(20px)`
- Elements animate sequentially as they scroll into view (staggered 80ms apart)
- Controlled by Intersection Observer in `AnimationManager.js`
- Automatically disabled when `shouldAnimate()` returns false
- Respects both theme setting and `prefers-reduced-motion`

**CSS (defined in frontend/css/app.css):**
```css
[data-intro] {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
[data-intro].intro-visible { opacity: 1; transform: translateY(0); }

/* When animations disabled, show immediately */
html.animations-disabled [data-intro] { opacity: 1; transform: none; }
```

**Important for block-based sections:**
- Place `data-intro` directly on each block wrapper
- The order elements appear in the DOM determines animation order
- The JavaScript automatically staggers elements as they become visible

### Section Animation Boilerplate

Standard pattern for section-specific animations:

```javascript
(function() {
  const section = document.querySelector('[data-my-section="{{ section.id }}"]');
  if (!section || section.dataset.myAnimInitialized) return;
  section.dataset.myAnimInitialized = 'true';

  // Skip if animations disabled
  if (typeof window.shouldAnimate === 'function' && !window.shouldAnimate()) return;

  function initAnimation() {
    let gsap = window.gsap;
    if (!gsap && window.pieces && window.pieces.gsap) {
      gsap = window.pieces.gsap;
    }

    let SplitText = window.SplitText;
    if (!SplitText && window.pieces && window.pieces.SplitText) {
      SplitText = window.pieces.SplitText;
    }

    const ScrollTrigger = window.ScrollTrigger || (window.pieces && window.pieces.ScrollTrigger);

    if (!gsap || !SplitText || !ScrollTrigger) {
      setTimeout(initAnimation, 50);
      return;
    }

    // Animation code here...
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimation);
  } else {
    requestAnimationFrame(initAnimation);
  }

  // Reinitialize after Swup page transitions
  window.addEventListener('swup:contentReplaced', () => {
    requestAnimationFrame(initAnimation);
  });
})();
```
