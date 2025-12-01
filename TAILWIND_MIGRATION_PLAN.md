# Pieces Theme - Complete Tailwind Migration Plan

## Overview

Migrate the Pieces Shopify theme from **54 scattered CSS files (576KB)** + **82 SVG icons (336KB)** to a unified Tailwind CSS bundle with Phosphor Icons. Target: **74% file size reduction** with modern, minimal SPA-like styling.

### Current State
- CSS Files (assets/): 54 files, 576KB
- CSS Files (frontend/): 31 files, 172KB
- SVG Icons: 82 files, 336KB (45 unused)
- Total: ~900KB

### Target State
- CSS Bundle: 1 file, ~150KB
- Phosphor Fonts: ~150KB
- SVG Icons: 0 (using Phosphor)
- Total: ~300KB (67% reduction)

---

## Phase 1: Cleanup & Foundation

### 1.1 Delete Unused SVG Icons (45 files, ~170KB)

These product-attribute icons are not referenced anywhere:

```bash
cd /Users/evan/Sites/Shopify/themes/pieces/assets

rm -f icon-apple.svg icon-banana.svg icon-bottle.svg icon-box.svg \
  icon-carrot.svg icon-chat-bubble.svg icon-check-mark.svg \
  icon-clipboard.svg icon-dairy-free.svg icon-dairy.svg \
  icon-dryer.svg icon-eye.svg icon-fire.svg icon-gluten-free.svg \
  icon-hamburger.svg icon-heart.svg icon-iron.svg icon-leaf.svg \
  icon-leather.svg icon-lightning-bolt.svg icon-lipstick.svg \
  icon-lock.svg icon-map-pin.svg icon-nut-free.svg icon-pants.svg \
  icon-paw-print.svg icon-pepper.svg icon-perfume.svg icon-plane.svg \
  icon-plant.svg icon-price-tag.svg icon-question-mark.svg \
  icon-recycle.svg icon-return.svg icon-ruler.svg icon-serving-dish.svg \
  icon-shirt.svg icon-shoe.svg icon-silhouette.svg icon-snowflake.svg \
  icon-star.svg icon-stopwatch.svg icon-truck.svg icon-washing.svg
```

### 1.2 Migrate Remaining SVG Icons to Phosphor (37 icons)

Files that need `inline_asset_content` replaced with `{% render 'icon' %}`:

| SVG File | Phosphor Name | Usage Location |
|----------|---------------|----------------|
| icon-3d-model.svg | cube | product-media.liquid |
| icon-account.svg | user | header, account pages |
| icon-arrow.svg | arrow-right | navigation, buttons |
| icon-caret.svg | caret-down | dropdowns, accordions |
| icon-cart.svg | shopping-bag | header |
| icon-cart-empty.svg | shopping-bag | header |
| icon-checkmark.svg | check | forms, success |
| icon-close.svg | x | modals, drawers |
| icon-close-small.svg | x | small close buttons |
| icon-copy.svg | copy | share buttons |
| icon-discount.svg | tag | cart discounts |
| icon-error.svg | x-circle | form errors |
| icon-facebook.svg | facebook-logo | social |
| icon-filter.svg | funnel | collection filters |
| icon-info.svg | info | tooltips |
| icon-instagram.svg | instagram-logo | social |
| icon-inventory-status.svg | package | stock status |
| icon-minus.svg | minus | quantity inputs |
| icon-padlock.svg | lock-simple | checkout |
| icon-pause.svg | pause | video controls |
| icon-pinterest.svg | pinterest-logo | social |
| icon-play.svg | play | video controls |
| icon-plus.svg | plus | quantity inputs |
| icon-remove.svg | trash | cart remove |
| icon-reset.svg | x | search reset |
| icon-search.svg | magnifying-glass | search |
| icon-share.svg | share-network | share buttons |
| icon-shopify.svg | storefront | footer |
| icon-snapchat.svg | snapchat-logo | social |
| icon-success.svg | check-circle | success states |
| icon-tick.svg | check | checkboxes |
| icon-tiktok.svg | tiktok-logo | social |
| icon-tumblr.svg | tumblr-logo | social |
| icon-twitter.svg | x-logo | social |
| icon-unavailable.svg | x-circle | stock status |
| icon-vimeo.svg | vimeo-logo | social |
| icon-youtube.svg | youtube-logo | social |
| icon-zoom.svg | magnifying-glass-plus | image zoom |

---

## Phase 2: Snippets Migration

### Already Migrated
- [x] icon.liquid (Phosphor mapper)
- [x] header-drawer.liquid
- [x] header-search.liquid
- [x] card-product.liquid (partial)
- [x] cart-drawer.liquid

### Priority 1 - Core Commerce Snippets

| Snippet | Icons to Replace | CSS Dependencies |
|---------|------------------|------------------|
| price.liquid | - | component-price.css |
| buy-buttons.liquid | plus, minus | - |
| quantity-input.liquid | plus, minus | quantity-popover.css |
| product-variant-picker.liquid | - | component-product-variant-picker.css |
| product-media-gallery.liquid | zoom, play, 3d-model | - |
| product-media.liquid | play, pause | component-deferred-media.css |

### Priority 2 - Navigation & UI Snippets

| Snippet | Icons to Replace | CSS Dependencies |
|---------|------------------|------------------|
| facets.liquid | filter, close, caret | component-facets.css |
| pagination.liquid | arrow-left, arrow-right | component-pagination.css |
| loading-spinner.liquid | - | - |
| share-button.liquid | share, copy | - |

### Priority 3 - Display Snippets

| Snippet | Icons to Replace | CSS Dependencies |
|---------|------------------|------------------|
| social-icons.liquid | ALL social icons | component-list-social.css |
| article-card.liquid | - | component-article-card.css |
| card-collection.liquid | - | - |
| swatch.liquid | - | component-swatch.css |
| swatch-input.liquid | - | component-swatch-input.css |

---

## Phase 3: Sections Migration

### Priority 1 - Core Pages (High Traffic)

| Section | Size Impact | Key Changes |
|---------|-------------|-------------|
| main-product.liquid | 32KB CSS | Product gallery, variant picker, buy buttons |
| main-collection-product-grid.liquid | 25KB CSS | Product grid, facets/filters |
| featured-collection.liquid | 9KB CSS | Product cards, slider |
| footer.liquid | 9KB CSS | Links, social, newsletter |

### Priority 2 - Cart Flow

| Section | Size Impact | Key Changes |
|---------|-------------|-------------|
| main-cart-items.liquid | 6KB CSS | Cart table, quantity inputs |
| main-cart-footer.liquid | 2KB CSS | Totals, checkout button |
| cart-notification-product.liquid | 3KB CSS | Add to cart notification |

### Priority 3 - Marketing Sections

| Section | Size Impact | Key Changes |
|---------|-------------|-------------|
| image-banner.liquid | 10KB CSS | Hero layout, content positioning |
| image-with-text.liquid | 11KB CSS | Two-column layouts |
| slideshow.liquid | 9KB CSS | Carousel controls |
| video.liquid | 2KB CSS | Video player styling |
| multicolumn.liquid | 2KB CSS | Column layouts |
| rich-text.liquid | 2KB CSS | Typography |
| collage.liquid | 5KB CSS | Grid layouts |

### Priority 4 - Blog

| Section | Size Impact | Key Changes |
|---------|-------------|-------------|
| main-blog.liquid | 2KB CSS | Article grid |
| main-article.liquid | 2KB CSS | Article layout |
| featured-blog.liquid | 2KB CSS | Blog cards |

### Priority 5 - Account Pages

| Section | Size Impact | Key Changes |
|---------|-------------|-------------|
| main-account.liquid | 13KB CSS | Account dashboard |
| main-addresses.liquid | - | Address forms |
| main-order.liquid | - | Order details |
| main-login.liquid | - | Login form |
| main-register.liquid | - | Registration form |

---

## Phase 4: CSS File Consolidation

### Files to Migrate to Tailwind

**High Priority (>5KB each):**
```
section-main-product.css        32KB
component-facets.css            25KB
customer.css                    13KB
quick-order-list.css            12KB
mask-blobs.css                  12KB
component-image-with-text.css   11KB
component-localization-form.css 10KB
component-slider.css             9KB
quick-add.css                    9KB
component-cart-drawer.css        7KB
template-giftcard.css            7KB
component-cart-items.css         6KB
component-predictive-search.css  6KB
collage.css                      5KB
component-product-variant-picker.css 5KB
```

**Medium Priority (2-5KB each):**
```
component-slideshow.css          4KB
component-complementary-products.css 4KB
component-pickup-availability.css 4KB
component-cart.css               3KB
quantity-popover.css             3KB
component-swatch-input.css       3KB
collapsible-content.css          3KB
template-collection.css          3KB
section-featured-product.css     3KB
component-deferred-media.css     3KB
```

**Low Priority (<2KB each):**
All remaining component and section CSS files.

### CSS to DELETE After Migration

After each section is migrated, remove:
1. The CSS file from `/assets/`
2. The `stylesheet_tag` reference from the liquid file

---

## Phase 5: Modern SPA Styling Guidelines

### Design Principles

1. **Generous Whitespace** - `space-y-8`, `py-16`, `gap-6`
2. **Subtle Animations** - Fade reveals, smooth 300ms transitions
3. **Minimal Borders** - Shadows over borders, `border-foreground/10`
4. **Clean Typography** - Clear hierarchy, muted secondary text
5. **Micro-interactions** - Hover states, focus rings

### Tailwind Class Patterns

**Product Card:**
```html
<div class="group relative">
  <div class="aspect-square overflow-hidden rounded-lg bg-foreground/5">
    <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
  </div>
  <div class="mt-4 space-y-1">
    <h3 class="text-sm font-medium truncate">{{ product.title }}</h3>
    <p class="text-sm text-foreground/60">{{ product.price | money }}</p>
  </div>
</div>
```

**Primary Button:**
```html
<button class="w-full py-3 bg-foreground text-background rounded-full text-sm font-medium
               transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2">
  Add to Cart
</button>
```

**Input Field:**
```html
<input class="w-full px-4 py-3 border border-foreground/20 rounded-lg bg-transparent
              placeholder:text-foreground/40 focus:border-foreground focus:outline-none
              transition-colors">
```

**Section Container:**
```html
<section class="py-12 md:py-20">
  <div class="page-width">
    <h2 class="text-2xl md:text-3xl font-medium mb-8">{{ section.settings.heading }}</h2>
    <!-- Content -->
  </div>
</section>
```

---

## Implementation Checklist

### Phase 1: Cleanup
- [ ] Delete 45 unused SVG icons
- [ ] Run build and verify no errors
- [ ] Test site functionality

### Phase 2: Icon Migration
- [ ] Update social-icons.liquid to use Phosphor
- [ ] Update facets.liquid icons
- [ ] Update product page icons (zoom, play, 3d)
- [ ] Update remaining icon references
- [ ] Delete migrated SVG icons
- [ ] Run build and test

### Phase 3: Snippet Migration
- [ ] Migrate price.liquid
- [ ] Migrate buy-buttons.liquid
- [ ] Migrate quantity-input.liquid
- [ ] Migrate product-variant-picker.liquid
- [ ] Migrate facets.liquid
- [ ] Migrate pagination.liquid
- [ ] Remove corresponding CSS files

### Phase 4: Section Migration
- [ ] Migrate main-product.liquid
- [ ] Migrate main-collection-product-grid.liquid
- [ ] Migrate footer.liquid
- [ ] Migrate image-banner.liquid
- [ ] Migrate cart sections
- [ ] Migrate marketing sections
- [ ] Migrate account sections

### Phase 5: Final Cleanup
- [ ] Delete all migrated CSS files from assets/
- [ ] Remove all `stylesheet_tag` references
- [ ] Final build and full regression test
- [ ] Performance audit (Lighthouse)

---

## Success Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| CSS Files | 54 | 1 | 98% fewer files |
| CSS Size | 576KB | ~150KB | 74% smaller |
| SVG Icons | 82 | 0 | 100% removed |
| HTTP Requests | ~55+ | ~3 | 95% fewer |
| Total Assets | ~900KB | ~300KB | 67% smaller |
| Lighthouse CSS | Poor | Good | Major improvement |
