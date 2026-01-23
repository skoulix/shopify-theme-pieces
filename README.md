# Pieces - Modern Shopify Theme

A high-performance Shopify theme with SPA-like page transitions, smooth scrolling, and advanced animations. Built for brands that demand exceptional user experiences.

## Core Technologies

| Library                                      | Version | Purpose                           |
| -------------------------------------------- | ------- | --------------------------------- |
| [Swup](https://swup.js.org/)                 | 4.6.1   | SPA page transitions              |
| [GSAP](https://gsap.com/)                    | 3.12.4  | Professional animations           |
| [Lenis](https://lenis.darkroom.engineering/) | 1.1.1   | Smooth scrolling                  |
| [GLightbox](https://biati-digital.github.io/glightbox/) | 3.3.1 | Product image/video lightbox |
| [Phosphor Icons](https://phosphoricons.com/) | 2.1.2   | Icon system                       |
| [Tailwind CSS](https://tailwindcss.com/)     | 4.1     | Utility-first styling (v4)        |
| [Vite](https://vitejs.dev/)                  | 7.3     | Build tooling                     |

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
| [@swup/fragment-plugin](https://swup.js.org/plugins/fragment-plugin/)     | Partial page updates          |
| [@swup/gtm-plugin](https://swup.js.org/plugins/gtm-plugin/)               | Google Tag Manager integration|

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
document.addEventListener('cart:updated', (e) => {
  console.log(e.detail.cart);
});
document.addEventListener('cart:notification', (e) => {
  console.log(e.detail.product, e.detail.cart);
});
```

---

## Toast Notifications

User-friendly notifications for errors and successes:

```javascript
import { toast } from './utils/toast.js';

// Show notifications
toast.success('Added to cart!');
toast.error('Could not update cart');
toast.info('Processing...', 5000); // Custom duration

// Types: success, error, info
toast.show('Custom message', { type: 'info', duration: 4000 });
```

Toast notifications automatically:
- Position in bottom-right corner
- Auto-dismiss after duration (4-5 seconds)
- Include close button
- Announce to screen readers via aria-live

---

## Sections (57 Total)

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
- `featured-product` - Single product showcase with variant picker
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
- `image` - Single image section
- `text-reveal` - Animated text on scroll
- `text-section` - Rich text content
- `video` - Video player section
- `testimonials` - Customer testimonials
- `faq` - Accordion FAQ
- `team` - Team member grid
- `timeline` - Vertical timeline
- `features-grid` - Feature cards grid
- `trust-badges` - Trust/payment badges
- `floating-images` - Decorative floating images
- `custom-liquid` - Custom Liquid code section
- `featured-blog` - Featured blog posts grid

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
- `cart-drawer` - Slide-out cart drawer
- `search` - Search results
- `password` - Password page
- `404` - Not found page
- `apps` - Third-party app embeds

---

## Product Page

### Gallery Features

The product gallery supports multiple media types with advanced features:

| Feature | Description |
| ------- | ----------- |
| **Image Lightbox** | Click any image to open in full-screen lightbox with zoom |
| **Video Support** | Native Shopify videos play inline with optional lightbox view |
| **External Videos** | YouTube/Vimeo embeds with Plyr player integration |
| **3D Models** | Shopify AR model viewer (not available in lightbox) |
| **Thumbnail Positions** | Bottom, left, or right placement options |
| **Responsive Thumbnails** | Horizontal scroll on mobile with centered alignment |
| **Zoom Button** | Dedicated zoom icon for quick lightbox access |

### Gallery Settings

| Setting | Options |
| ------- | ------- |
| **Enable lightbox** | Toggle image/video lightbox functionality |
| **Thumbnail position** | Bottom, Left, Right |
| **Enable video** | Show/hide video media |
| **Loop videos** | Continuous video playback |
| **Autoplay when visible** | Auto-start videos when scrolled into view |
| **Enable sticky bar** | Floating add-to-cart bar on scroll |

### Product Page Blocks

The product section supports the following blocks that can be reordered in the theme customizer:

| Block | Description |
| ----- | ----------- |
| **Breadcrumbs** | Navigation breadcrumb trail |
| **Vendor** | Product vendor/brand name |
| **Title** | Product title with optional split word lines |
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

### Tailwind CSS v4

This theme uses Tailwind CSS v4, which introduces significant syntax changes from v3.

#### Key v4 Syntax Changes

| v3 Syntax | v4 Syntax |
| --------- | --------- |
| `bg-[var(--color-background)]` | `bg-(--color-background)` |
| `text-[var(--color-text)]` | `text-(--color-text)` |
| `rounded-[var(--card-radius)]` | `rounded-(--card-radius)` |
| `border-[var(--color-border)]` | `border-(--color-border)` |

CSS variables now use parentheses `()` instead of square brackets `[]`:

```html
<div class="bg-(--color-background) text-(--color-text) rounded-(--card-radius)"></div>
```

#### Configuration

Tailwind v4 uses CSS-based configuration instead of `tailwind.config.js`:

```css
/* frontend/css/app.css */
@import "tailwindcss" source(none);
@plugin "@tailwindcss/typography";

@theme {
  --font-body: var(--font-body), ui-sans-serif, system-ui, sans-serif;
  --font-heading: var(--font-heading), ui-sans-serif, system-ui, sans-serif;
}

@source "../../sections/**/*.liquid";
@source "../../snippets/**/*.liquid";
/* ... */
```

#### @layer Components

Custom component classes are defined using `@layer components`:

```css
@layer components {
  .btn {
    @apply relative inline-flex items-center justify-center;
  }
}
```

### CSS Variables

Generated from theme settings in `snippets/css-variables.liquid`:

```css
/* Colors (per color scheme) */
--color-background
--color-background-gradient
--color-background-secondary
--color-text
--color-text-secondary
--color-primary
--color-primary-contrast
--color-border

/* Global Colors */
--color-sale
--color-success
--color-error
--color-warning
--color-info

/* Typography - Fonts */
--font-body
--font-body-weight
--font-body-style
--font-heading
--font-heading-weight
--font-heading-style

/* Typography - Scaling */
--body-font-scale              /* Body text scale multiplier */
--heading-font-scale           /* Heading text scale multiplier */
--body-letter-spacing          /* Body letter spacing adjustment */
--heading-letter-spacing       /* Heading letter spacing adjustment */

/* Typography Scale */
--text-2xs                     /* 11px */
--text-xs                      /* 12px */
--text-sm                      /* 14px */
--text-md                      /* 13px */
--text-base                    /* 16px */
--text-lg                      /* 18px */
--text-xl                      /* 20px */
--text-2xl                     /* 24px */

/* Line Heights */
--leading-none                 /* 1 */
--leading-tight                /* 0.95 */
--leading-snug                 /* 1.1 */
--leading-cozy                 /* 1.2 */
--leading-normal               /* 1.3 */
--leading-comfort              /* 1.4 */
--leading-relaxed              /* 1.5 */
--leading-loose                /* 1.7 */

/* Letter Spacing */
--tracking-tighter             /* -0.04em */
--tracking-tight               /* -0.02em */
--tracking-normal              /* 0 */
--tracking-wide                /* 0.05em */
--tracking-wider               /* 0.1em */
--tracking-extra               /* 0.12em */
--tracking-widest              /* 0.15em */
--tracking-ultra               /* 0.2em */

/* Layout */
--page-max-width
--page-padding
--page-vertical-padding
--section-vertical-padding
--header-height
--logo-width

/* Buttons */
--button-radius
--button-border-width
--button-letter-spacing
--button-shadow
--button-shadow-hover

/* Cards */
--card-radius
--card-border-width
--card-shadow
--badge-radius                 /* Proportional to card-radius */

/* Inputs */
--input-radius
--input-radius-textarea
--input-border-width
--input-shadow
--input-shadow-focus

/* Animation Durations */
--duration-instant             /* 0ms */
--duration-fast                /* 150ms */
--duration-normal              /* 300ms */
--duration-slow                /* 500ms */
--duration-slower              /* 800ms */

/* Easing Functions */
--ease-out
--ease-out-expo
--ease-in-out

/* Transitions */
--transition-fast              /* 0.15s ease */
--transition-sm                /* 0.2s ease */
--transition-base              /* 0.3s ease */
--transition-extended          /* 0.4s ease-out */
--transition-slow              /* 0.5s ease-out */

/* Opacity */
--opacity-muted                /* 0.7 */
--opacity-secondary            /* 0.6 */
--opacity-disabled             /* 0.5 */
--opacity-subtle               /* 0.3 */
--opacity-light                /* 0.15 */
--opacity-faint                /* 0.1 */

/* Max Widths */
--max-w-prose                  /* 65ch */
--max-w-prose-narrow           /* 45ch */
--max-w-prose-wide             /* 80ch */

/* Z-Index Layers */
--z-base                       /* 1 */
--z-content                    /* 10 */
--z-dropdown                   /* 50 */
--z-sticky                     /* 60 */
--z-drawer                     /* 100 */
--z-modal                      /* 9999 */
--z-toast                      /* 10000 */

/* Box Shadows */
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl
--shadow-dropdown
--shadow-drawer
```

### Container Classes

```html
<div class="page-container">Centered with max-width</div>
<div class="page-full">Full width with padding</div>
```

### Typography Classes

Global typography classes defined in `frontend/css/partials/typography.css` for consistent styling. All typography respects theme font scale settings via CSS custom properties.

#### Typography Scaling

All heading classes use `--heading-font-scale` and body text uses `--body-font-scale`:

```css
.section-title {
  font-size: calc(clamp(1.5rem, 4vw, 2.25rem) * var(--heading-font-scale, 1));
  font-weight: var(--font-heading-weight, 700);
  letter-spacing: calc(-0.02em + var(--heading-letter-spacing, 0em));
}
```

#### Available Classes

| Class | Usage |
| ----- | ----- |
| `.page-title` | Large page headers (collection, blog, cart, search) |
| `.section-title` | Section headings with responsive scaling |
| `.hero-title` | Primary hero headline (largest) |
| `.section-label` | Small eyebrow text above titles |
| `.section-description` | Paragraph text below titles |
| `.newsletter-title` | Newsletter section headings |
| `.card-title` | Product/blog/collection card titles |
| `.card-meta` | Vendor, category, date text |
| `.card-price` | Product pricing display |
| `.blog-card-title` | Blog article card titles |
| `.blog-card-title--featured` | Larger featured blog titles |
| `.blog-category` | Category labels on blog cards |
| `.drawer-title` | Slide-out drawer headings |
| `.popup-title` | Modal/popup headings |
| `.footer-brand` | Shop name in footer |
| `.form-label` | Input field labels |
| `.quote-text` | Testimonial/blockquote styling |
| `.faq-question` | FAQ accordion question text |
| `.stat-number` | Large display numbers |
| `.badge` | Sale tags, labels (variants: `--sale`, `--soldout`, `--new`) |
| `.page-header-subtitle` | Subtitle with decorative line |

#### Uppercase Behavior

Label-style classes (`.section-label`, `.form-label`, `.badge`, `.card-meta`, `.blog-category`) conditionally apply `text-transform: uppercase` based on the theme's `buttons_uppercase` setting in `css-variables.liquid`.

---

## Shared Constants

Centralized constants for consistent timing and z-index values across JS and CSS:

### JavaScript (`frontend/js/utils/constants.js`)

```javascript
import { DURATION, Z_INDEX, DEBOUNCE, TIMEOUT, BREAKPOINT, EASING } from './utils/constants.js';

// Animation durations (ms)
DURATION.fast     // 150
DURATION.normal   // 300
DURATION.slow     // 500

// Z-index layers
Z_INDEX.drawer    // 100
Z_INDEX.modal     // 9999
Z_INDEX.toast     // 10000

// Debounce delays (ms)
DEBOUNCE.input    // 300
DEBOUNCE.search   // 500

// Timeouts (ms)
TIMEOUT.cartFetch // 8000
TIMEOUT.toast     // 3000
```

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
  tween,
  cartState,
  cartDrawer,
  cartPage,
  lightbox,
  gsap,
  ScrollTrigger,
  Flip,
  SplitText,
  Lenis,
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
- pnpm (recommended) or npm
- Shopify CLI 3.x
- Theme access credentials

### Quick Start

```bash
# Install dependencies
pnpm install

# Start development server (Vite + Shopify CLI)
pnpm develop
```

This runs Vite in watch mode and Shopify theme dev concurrently, giving you:
- Hot reloading for CSS/JS changes
- Live preview at `https://127.0.0.1:9292`
- Automatic asset compilation

### Available Scripts

| Command | Description |
| ------- | ----------- |
| `pnpm develop` | Start dev server (Vite watch + Shopify theme dev) |
| `pnpm dev` | Run Vite dev server only |
| `pnpm build` | Build assets for production |
| `pnpm watch` | Watch and rebuild assets |
| `pnpm start` | Build then start theme dev |
| `pnpm theme:dev` | Preview theme locally |
| `pnpm theme:push` | Push theme to Shopify |
| `pnpm theme:pull` | Pull theme from Shopify |
| `pnpm theme:check` | Lint theme with Theme Check |
| `pnpm theme:list` | List all themes in store |

### Shopify CLI Commands

Essential commands for theme development:

```bash
# Authenticate with Shopify
shopify auth login

# Preview theme on development store
shopify theme dev --store=your-store.myshopify.com

# Push to specific theme
shopify theme push --theme=123456789

# Push and publish as live theme
shopify theme push --live

# Pull latest changes from Shopify
shopify theme pull --theme=123456789

# Create a new unpublished theme
shopify theme push --unpublished --json

# Open theme in browser
shopify theme open

# Check theme for errors and best practices
shopify theme check

# Package theme into a zip file
shopify theme package

# List all themes with IDs
shopify theme list

# Delete a theme
shopify theme delete --theme=123456789

# Share theme with a preview link
shopify theme share
```

### Development Workflow

1. **Start Development**
   ```bash
   pnpm develop
   ```
   Opens local preview with hot reloading.

2. **Make Changes**
   - Edit Liquid files in `sections/`, `snippets/`, `templates/`
   - Edit source CSS in `frontend/css/`
   - Edit source JS in `frontend/js/`
   - Vite automatically compiles and outputs to `assets/`

3. **Test Changes**
   - Browser auto-refreshes on Liquid changes
   - CSS/JS changes apply via hot module replacement

4. **Push to Shopify**
   ```bash
   pnpm theme:push
   ```

### Environment Configuration

Create `shopify.theme.toml` in project root:

```toml
[environments.development]
store = "your-store.myshopify.com"
theme = "123456789"
ignore = [
  "config/settings_data.json"
]

[environments.production]
store = "your-store.myshopify.com"
theme = "987654321"
```

Then use: `shopify theme dev --environment=development`

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
│   │       ├── glightbox.css
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
│       │   ├── ProductLightboxManager.js
│       │   ├── RecentlyViewedManager.js
│       │   ├── SwupManager.js
│       │   ├── TweenManager.js
│       │   └── WishlistManager.js
│       └── utils/          # Utility functions
│           ├── constants.js
│           ├── dom.js
│           ├── storage.js
│           └── toast.js
├── layout/                  # Theme layouts
├── locales/                 # Translation files (17 languages)
├── scripts/                 # Build/utility scripts
├── sections/                # Liquid sections (57)
├── snippets/                # Reusable partials
├── templates/               # Page templates
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

## SEO & Structured Data

Comprehensive SEO optimization with schema.org structured data for enhanced search visibility.

### Meta Tags

Open Graph and Twitter Card meta tags are automatically generated in `snippets/meta-tags.liquid`:

| Meta Type | Description |
| --------- | ----------- |
| **Open Graph** | `og:title`, `og:description`, `og:url`, `og:type`, `og:image` |
| **Twitter Cards** | `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` |
| **Product-specific** | `og:price:amount`, `og:price:currency` on product pages |

Social sharing images follow a fallback chain: page image → share image setting → logo.

### Structured Data (JSON-LD)

Rich snippets via `snippets/structured-data.liquid` rendered on every page:

| Schema Type | Pages | Description |
| ----------- | ----- | ----------- |
| **Organization** | All | Shop name, logo, social profiles, contact point |
| **WebSite** | All | Site name with SearchAction for sitelinks search box |
| **BreadcrumbList** | All (except home) | Navigation path hierarchy |
| **Product** | Product pages | Name, description, images, SKU, GTIN, brand, offers, ratings |
| **CollectionPage** | Collection pages | Collection title, description, image, item count |
| **Article** | Blog articles | Headline, author, dates, publisher, featured image |
| **LocalBusiness** | All (if enabled) | Physical store info for local SEO |
| **FAQPage** | FAQ sections | Question/answer pairs for rich results |

### Product Schema Features

Product structured data includes:
- Up to 5 product images
- SKU and GTIN/barcode (if available)
- Brand from vendor
- AggregateOffer with price range
- Stock availability status
- Aggregate ratings from Shopify product reviews metafields

### Local Business Schema

Enable in theme settings for physical retail locations:

```liquid
{% comment %} Theme Settings {% endcomment %}
Enable local business schema: checkbox
Business phone: text
Business email: text
Street address: text
City: text
State/Province: text
ZIP/Postal code: text
Country: text
Opening hours: text (e.g., "Mo-Fr 09:00-17:00")
Price range: select ($, $$, $$$, $$$$)
```

### FAQ Schema

Automatically generated for FAQ sections via `snippets/structured-data-faq.liquid`:

```liquid
{% render 'structured-data-faq', faqs: section.blocks %}
```

### Visual Breadcrumbs

Rendered via `snippets/breadcrumbs.liquid` with customizable options:

```liquid
{% render 'breadcrumbs' %}
{% render 'breadcrumbs', separator: '/', show_home_icon: true, alignment: 'center' %}
```

Supports: Products (with collection context), Collections, Blog articles, Pages, Search, Cart.

### Canonical URLs

Shopify's built-in `{{ canonical_url }}` is used throughout for proper URL canonicalization.

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
| **Typography** | Body font, heading font, font size scaling, heading/body letter spacing, uppercase headings/buttons |
| **Layout** | Page width, vertical padding, section padding, smooth scrolling, page transitions (slide/fade/curtain), animations, animation trigger timing |
| **Buttons** | Corner radius, border width, shadow style |
| **Inputs** | Corner radius, border width, shadow style |
| **Cards** | Corner radius, border width, shadow style |
| **Product Card** | Image aspect ratio, secondary image on hover, show vendor, quick view, compare, wishlist, sale/sold out badges |
| **Social Media** | Instagram, Facebook, X (Twitter), TikTok, YouTube, Pinterest links |
| **SEO & Schema** | Local business schema with address, phone, email, hours, price range |
| **Cart** | Cart type (drawer/page/notification), free shipping progress bar, delivery estimator, social proof indicators |
| **Newsletter Popup** | Enable/disable, trigger type (delay/scroll/exit intent), frequency, content, discount code reveal, colors, layout |

### Theme Presets

Five curated design presets available in the theme editor, each targeting specific market niches:

#### Default
**Best for:** General retail, home goods, lifestyle brands, DTC startups
- Clean, modern aesthetic with indigo primary color
- Space Grotesk headings with Inter body for modern readability
- Sharp corners, minimal shadows
- Works well for brands still defining their visual identity

#### Glow
**Best for:** Skincare, cosmetics, wellness products, clean beauty, spa brands
- Soft, warm cream tones with terracotta accent
- Cormorant elegant headings, Questrial body
- Pill-shaped buttons (100px radius), rounded cards
- Soft shadows for an approachable, organic feel

#### Bold
**Best for:** Streetwear, graphic tees, sneakers, skate/surf brands, statement apparel
- High contrast black/white with vibrant orange accent
- Bebas Neue display headings with IBM Plex Mono body text
- Hard offset shadows, thick 3px borders
- Expanded letter spacing for impactful headlines

#### Noir
**Best for:** Fine jewelry, luxury watches, high-end accessories, premium leather goods
- Dark, elegant theme with gold accents
- Bodoni Moda serif headings, Jost body for refined luxury
- Subtle gradient backgrounds, refined 1px borders
- Generous vertical padding for a luxurious feel

#### Edge
**Best for:** Gaming peripherals, PC components, consumer electronics, tech accessories
- Dark futuristic theme with cyan accent
- Rajdhani geometric headings, IBM Plex Mono body
- Sharp angular design, expanded letter spacing
- Optimized for product specs and technical details

Each preset configures color schemes, typography (including letter spacing), border radius, and shadow styles for buttons, inputs, and cards.

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
