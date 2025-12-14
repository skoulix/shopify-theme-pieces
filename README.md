# Pieces - Modern Shopify Theme

A high-performance Shopify theme with SPA-like page transitions, smooth scrolling, and advanced animations. Built for brands that demand exceptional user experiences.

## Core Technologies

| Library                                      | Version | Purpose                 |
| -------------------------------------------- | ------- | ----------------------- |
| [Swup](https://swup.js.org/)                 | 4.6.1   | SPA page transitions    |
| [GSAP](https://gsap.com/)                    | 3.12.4  | Professional animations |
| [Lenis](https://lenis.darkroom.engineering/) | 1.1.1   | Smooth scrolling        |
| [PhotoSwipe](https://photoswipe.com/)        | 5.4.4   | Lightbox gallery        |
| [Phosphor Icons](https://phosphoricons.com/) | 2.1.2   | Icon system             |
| [Tailwind CSS](https://tailwindcss.com/)     | 3.4.0   | Utility-first styling   |
| [Vite](https://vitejs.dev/)                  | 5.0.10  | Build tooling           |

---

## Page Transitions (Swup)

Seamless page navigation without full page reloads. Three transition styles available:

- **Fade** - Simple crossfade between pages
- **Slide** - Horizontal slide animation
- **Curtain** - Overlay curtain effect

### Swup Plugins Used

| Plugin                                                                    | Purpose                       |
| ------------------------------------------------------------------------- | ----------------------------- |
| [@swup/js-plugin](https://swup.js.org/plugins/js-plugin/)                 | Custom JavaScript animations  |
| [@swup/head-plugin](https://swup.js.org/plugins/head-plugin/)             | Meta tag and asset management |
| [@swup/preload-plugin](https://swup.js.org/plugins/preload-plugin/)       | Link preloading on hover      |
| [@swup/body-class-plugin](https://swup.js.org/plugins/body-class-plugin/) | Dynamic body class updates    |
| [@swup/scripts-plugin](https://swup.js.org/plugins/scripts-plugin/)       | Script re-execution           |

### Content Replaced Handler

Use the global helper to register listeners that won't duplicate on navigation:

```javascript
if (window.onSwupContentReplaced) {
  window.onSwupContentReplaced('unique-key', () => {
    // Re-initialize your component
  });
}
```

---

## Animations (GSAP)

Professional-grade animations powered by GSAP with ScrollTrigger.

### GSAP Plugins

| Plugin                                                           | Purpose                            |
| ---------------------------------------------------------------- | ---------------------------------- |
| [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) | Scroll-based animations            |
| [SplitText](https://gsap.com/docs/v3/Plugins/SplitText/)         | Text line/word/character splitting |
| [Flip](https://gsap.com/docs/v3/Plugins/Flip/)                   | Layout animations                  |

### TweenManager Animation System

Add animations declaratively via HTML attributes using the TweenManager:

```html
<!-- Fade up on scroll -->
<div data-tween data-tween-type="fade-up">Content reveals when scrolled into view</div>

<!-- Split text animation -->
<h2 data-tween data-tween-type="split-text">Animated Heading</h2>

<!-- Clip reveal animation -->
<div data-tween data-tween-type="clip-right">Image reveals with clip-path</div>

<!-- Grouped animations with stagger -->
<div data-tween-group="my-group">
  <div data-tween data-tween-type="fade-up">Item 1</div>
  <div data-tween data-tween-type="fade-up">Item 2</div>
</div>
```

Available animation types: `fade-up`, `split-text`, `clip-right`, `clip-left`, `clip-up`, `clip-down`, `scale`

### Available Reveal Types

- `fade`, `fade-up`, `fade-down`, `fade-left`, `fade-right`
- `scale`, `scale-up`, `scale-down`
- `clip-up`, `clip-down`, `clip-left`, `clip-right`

---

## Smooth Scrolling (Lenis)

Buttery smooth scrolling with GSAP ScrollTrigger integration.

### Features

- 1.2s duration with exponential easing
- Automatic GSAP ticker synchronization
- Respects `prefers-reduced-motion`
- Anchor link smooth scrolling
- Pause during modal/drawer interactions

### Prevent Scroll

Add to any element to prevent smooth scroll behavior:

```html
<div data-lenis-prevent>
  <!-- Content with native scrolling -->
</div>
```

---

## Cart System

Three cart types available via theme settings:

| Type             | Behavior                        |
| ---------------- | ------------------------------- |
| **Drawer**       | Slide-out cart drawer (default) |
| **Page**         | Redirect to /cart page          |
| **Notification** | Toast notification on add       |

### Cart State API

```javascript
// Get cart state singleton
const cart = window.pieces.cartState;

// Add item
await cart.addItem(variantId, quantity);

// Update quantity
await cart.updateLine(lineIndex, quantity);

// Subscribe to changes
cart.subscribe((cartData) => {
  console.log('Cart updated:', cartData);
});
```

### Cart Events

```javascript
document.addEventListener('cart:refresh', () => {});
document.addEventListener('cart:open', () => {});
document.addEventListener('cart:notification', (e) => {
  console.log(e.detail.product, e.detail.cart);
});
```

---

## Sections (53 Total)

### Hero & Landing

- `hero` - Full-viewport hero with image/video
- `hero-orbit` - Animated orbiting elements
- `banner` - Smaller promotional banner
- `slideshow` - Image/video slideshow carousel

### Products & Collections

- `product` - Product page with variants, gallery
- `collection` - Collection with filtering
- `collections` - Collection list/grid
- `featured-collection` - Featured product grid
- `related-products` - Related products carousel
- `recently-viewed` - Recently viewed products
- `complementary-products` - Frequently bought together
- `quick-view-product` - Quick view modal content
- `wishlist` - Saved products page
- `compare` - Product comparison table

### Interactive

- `hotspots` - Clickable image hotspots
- `shop-the-look` - Shoppable image overlays
- `before-after` - Image comparison slider
- `shoppable-videos` - Video with product tags
- `pinned-image-reveal` - Scrollytelling layout
- `scroll-panels` - Scroll-driven panel animations

### Content

- `image-with-text` - Split image + text
- `text-reveal` - Animated text on scroll
- `video` - Video player section
- `testimonials` - Customer testimonials
- `faq` - Accordion FAQ
- `team` - Team member grid
- `timeline` - Vertical timeline
- `features-grid` - Feature cards grid
- `trust-badges` - Trust/payment badges
- `floating-images` - Decorative floating images

### Animation Showcase

- `stacking-cards` - Scroll-stacking cards
- `rolling-numbers` - Animated counters
- `horizontal-scroll` - Horizontal gallery
- `marquee` - Scrolling text ticker
- `logo-marquee` - Infinite logo carousel

### Conversion

- `newsletter` - Email signup forms
- `contact-form` - Contact form
- `countdown` - Launch countdown
- `map` - Store locator map

### Structure

- `header` - Navigation header
- `footer` - Site footer
- `announcement-bar` - Top announcement bar
- `page` - Generic page template
- `article` - Blog article template
- `blog` - Blog listing
- `cart` - Cart page
- `search` - Search results
- `password` - Password page
- `404` - Not found page

---

## Product Page Blocks

The product section supports the following blocks that can be reordered in the theme customizer:

| Block | Description |
| ----- | ----------- |
| **Breadcrumbs** | Navigation breadcrumb trail |
| **Vendor** | Product vendor/brand name |
| **Title** | Product title |
| **Price** | Price with sale/compare pricing |
| **Inventory countdown** | Low stock warning with progress bar |
| **Description** | Product description with truncation |
| **Variant picker** | Buttons or dropdown for variants with color swatches |
| **Quantity selector** | Quantity input with +/- buttons |
| **Buy buttons** | Add to cart + dynamic checkout buttons |
| **Pickup availability** | Store pickup information |
| **Delivery estimator** | Estimated delivery date display |
| **Social proof** | Current viewers / recent purchases |
| **Text** | Custom rich text content |
| **Collapsible tab** | Accordion-style content sections |
| **Size chart** | Size guide drawer with customizable content |
| **Back in stock** | Email notification signup for sold out items |
| **Complementary products** | Frequently bought together recommendations |
| **Wishlist button** | Save to wishlist functionality |
| **Compare button** | Add to comparison list |
| **Wishlist & Compare** | Combined 50/50 layout for both buttons |
| **Social actions** | Wishlist, compare, and share buttons in a row |

---

## Styling

### Tailwind CSS First

Use Tailwind utilities with CSS variables:

```html
<div class="bg-[--color-background] text-[--color-text] rounded-[--card-radius]"></div>
```

### CSS Variables

Generated from theme settings:

```css
/* Colors */
--color-background
--color-background-secondary
--color-text
--color-text-secondary
--color-primary
--color-primary-contrast
--color-border
--color-sale

/* Typography */
--font-body
--font-heading
--body-font-scale
--heading-font-scale

/* Layout */
--page-max-width
--page-padding
--section-vertical-padding

/* Components */
--button-radius
--card-radius
--input-radius
```

### Container Classes

```html
<div class="page-container">Centered with max-width</div>
<div class="page-full">Full width with padding</div>
```

---

## Global API

### Window Objects

```javascript
// Theme settings
window.themeSettings = {
  enableSmoothScroll: boolean,
  enableAnimations: boolean,
  enablePageTransitions: boolean,
  pageTransitionStyle: 'slide' | 'fade' | 'curtain',
  cartType: 'drawer' | 'page' | 'notification',
  moneyFormat: string,
};

// Animation check
window.shouldAnimate(); // Returns boolean

// Manager access
window.pieces = {
  lenis,
  swup,
  animation,
  cartState,
  gsap,
  ScrollTrigger,
  SplitText,
};

// Cart drawer controls
window.openCartDrawer();
window.closeCartDrawer();
window.refreshCartDrawer();
```

---

## Development

### Prerequisites

- Node.js 18+
- Shopify CLI
- Theme access credentials

### Scripts

```bash
# Install dependencies
npm install

# Development (Vite + Shopify theme dev)
npm run develop

# Build for production
npm run build

# Watch mode
npm run watch

# Theme commands
npm run theme:dev      # Preview theme
npm run theme:push     # Push to Shopify
npm run theme:pull     # Pull from Shopify
npm run theme:check    # Lint theme
```

### File Structure

```
pieces/
├── assets/                  # Compiled JS/CSS, fonts, images
├── blocks/                  # Theme blocks
├── config/                  # Theme settings schema
├── frontend/
│   ├── css/
│   │   ├── app.css         # CSS entry point
│   │   └── partials/       # CSS modules
│   │       ├── animations.css
│   │       ├── base.css
│   │       ├── buttons.css
│   │       ├── cart.css
│   │       ├── forms.css
│   │       ├── navigation.css
│   │       ├── typography.css
│   │       └── utilities.css
│   └── js/
│       ├── app.js          # JS entry point
│       ├── managers/       # Feature modules
│       │   ├── CartDrawerManager.js
│       │   ├── CartPageManager.js
│       │   ├── CartState.js
│       │   ├── CompareManager.js
│       │   ├── FacetsManager.js
│       │   ├── LenisManager.js
│       │   ├── RecentlyViewedManager.js
│       │   ├── SwupManager.js
│       │   ├── TweenManager.js
│       │   └── WishlistManager.js
│       └── utils/          # Utility functions
│           ├── dom.js
│           ├── storage.js
│           └── toast.js
├── layout/                  # Theme layouts
├── locales/                 # Translation files (16 languages)
├── scripts/                 # Build/utility scripts
├── sections/                # Liquid sections (53)
├── snippets/                # Reusable partials
├── templates/               # Page templates
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js           # Vite build configuration
└── package.json
```

---

## Performance

### Optimizations

- **Lazy Loading** - Native `loading="lazy"` on images
- **Responsive Images** - Srcset with multiple sizes
- **Deferred Scripts** - Non-blocking script loading
- **Font Preloading** - Critical fonts preloaded
- **ScrollTrigger Cleanup** - Proper cleanup between pages
- **Swup Cache** - Intelligent page caching

### Animation Performance

- Hardware-accelerated transforms
- Will-change hints where appropriate
- Respects `prefers-reduced-motion`
- Font loading synchronization

---

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Skip-to-content link
- Focus management in modals
- Keyboard navigation support
- Color contrast compliance
- Screen reader optimizations

---

## Internationalization

All user-facing text uses Shopify's translation system:

```liquid
{{ 'products.product.add_to_cart' | t }}
```

Translation files located in `/locales/`.

---

## Theme Settings

Configurable via Shopify theme customizer:

| Section | Options |
| ------- | ------- |
| **Logo** | Logo image, desktop/mobile width, favicon |
| **Colors** | Background, secondary background, text, secondary text, primary accent, primary contrast, border, sale |
| **Typography** | Body font, heading font, font size scaling, uppercase headings/buttons |
| **Layout** | Page width, vertical padding, section padding, smooth scrolling, page transitions (slide/fade/curtain), View Transitions API, animations, animation trigger timing |
| **Buttons** | Corner radius, border width, shadow style |
| **Inputs** | Corner radius, border width |
| **Cards** | Corner radius, border width, shadow style |
| **Product Card** | Image aspect ratio, secondary image on hover, show vendor, quick view, compare, wishlist, sale/sold out badges |
| **Social Media** | Instagram, Facebook, X (Twitter), TikTok, YouTube, Pinterest links |
| **SEO & Schema** | Local business schema with address, phone, email, hours, price range |
| **Cart** | Cart type (drawer/page/notification), free shipping progress bar, delivery estimator, social proof indicators |
| **Newsletter Popup** | Enable/disable, trigger type (delay/scroll/exit intent), frequency, content, discount code reveal, colors, layout |

---

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

---

## License

**Proprietary License**

Copyright (c) 2025 [SEAPIXEL](https://seapixel.com). All rights reserved.

This software and associated documentation files (the "Software") are the exclusive property of SEAPIXEL. The Software is protected by copyright laws and international treaty provisions.

**You may NOT:**

- Copy, modify, or distribute the Software
- Reverse engineer, decompile, or disassemble the Software
- Sublicense, sell, resell, or transfer the Software
- Use the Software to create derivative works
- Remove or alter any proprietary notices

**Usage:** This Software may only be used with a valid license purchased from SEAPIXEL. Unauthorized reproduction, distribution, or use of this Software is strictly prohibited and may result in severe civil and criminal penalties.

For licensing inquiries, visit [seapixel.com](https://seapixel.com) or contact the owner directly.
