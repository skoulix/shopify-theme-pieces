import { cartState } from './CartState.js';

/**
 * CartPageManager - Handles cart page functionality
 * Uses global CartState for data with GSAP animations
 */
class CartPageManager {
  constructor() {
    this.wrapper = null;
    this.noteTimeout = null;
    this.isInitialized = false;
    this.isReady = false;
    this.unsubscribe = null;
  }

  /**
   * Initialize the cart page
   */
  init() {
    this.wrapper = document.querySelector('[data-cart-wrapper]');
    if (!this.wrapper) return;
    if (this.wrapper.dataset.cartPageInitialized) return;
    this.wrapper.dataset.cartPageInitialized = 'true';

    // Subscribe to cart state changes
    this.unsubscribe = cartState.subscribe((cart, isUpdating) => {
      this.onCartStateChange(cart, isUpdating);
    });

    this.bindEvents();
    this.initAnimations();

    this.isInitialized = true;
  }

  /**
   * Handle cart state changes
   */
  onCartStateChange(cart, isUpdating) {
    if (!this.wrapper) return;

    // Update loading state
    if (isUpdating) {
      this.wrapper.classList.add('is-updating');
    } else {
      this.wrapper.classList.remove('is-updating');
      // Only re-render after initial animations are complete
      if (cart && this.isReady) {
        this.render();
      }
    }
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Quantity buttons (delegated)
    this.wrapper.addEventListener('click', async (e) => {
      const minus = e.target.closest('[data-quantity-minus]');
      const plus = e.target.closest('[data-quantity-plus]');
      const remove = e.target.closest('[data-remove-item]');

      if (minus || plus || remove) {
        e.preventDefault();
        const item = e.target.closest('[data-cart-item]');
        const line = parseInt(item?.dataset.line);
        const input = item?.querySelector('[data-quantity-input]');
        let quantity = parseInt(input?.value || 0);

        if (minus && quantity > 0) quantity--;
        if (plus) quantity++;
        if (remove) quantity = 0;

        await cartState.updateLine(line, quantity);
      }
    });

    // Quantity input change
    this.wrapper.addEventListener('change', async (e) => {
      if (e.target.matches('[data-quantity-input]')) {
        const line = parseInt(e.target.dataset.line);
        const quantity = parseInt(e.target.value) || 0;
        await cartState.updateLine(line, quantity);
      }
    });

    // Cart note
    const noteInput = this.wrapper.querySelector('[data-cart-note]');
    if (noteInput) {
      noteInput.addEventListener('input', (e) => {
        clearTimeout(this.noteTimeout);
        this.noteTimeout = setTimeout(() => {
          cartState.updateNote(e.target.value);
        }, 500);
      });
    }
  }

  /**
   * Initialize GSAP animations
   */
  initAnimations() {
    const gsapInstance = window.gsap || (window.pieces && window.pieces.gsap);
    if (!gsapInstance) {
      setTimeout(() => this.initAnimations(), 50);
      return;
    }

    const items = this.wrapper.querySelectorAll('[data-cart-item]');
    const summary = this.wrapper.querySelector('.cart-summary');
    const emptyState = this.wrapper.querySelector('.cart-empty');

    const tl = gsapInstance.timeline({
      onComplete: () => {
        this.wrapper.classList.add('is-ready');
        this.isReady = true;
      }
    });

    // Title reveal
    const titleSpans = this.wrapper.querySelectorAll('.cart-page-title-line > span');
    if (titleSpans.length) {
      tl.fromTo(titleSpans,
        { yPercent: 100 },
        { yPercent: 0, duration: 1.2, ease: 'power4.out', stagger: 0.1, immediateRender: true },
        0
      );
    }

    // Subtitle
    const subtitleLine = this.wrapper.querySelector('[data-subtitle-line]');
    const subtitleText = this.wrapper.querySelector('[data-subtitle-text]');
    if (subtitleLine) {
      tl.fromTo(subtitleLine, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'power3.out', immediateRender: true }, 0.4);
    }
    if (subtitleText) {
      tl.fromTo(subtitleText, { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: 'power4.out', immediateRender: true }, 0.6);
    }

    // Cart items
    if (items.length) {
      items.forEach((item, i) => {
        const img = item.querySelector('.cart-item-image');

        tl.fromTo(item,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
          0.5 + i * 0.1
        );

        if (img) {
          tl.fromTo(img,
            { clipPath: 'inset(0 100% 0 0)' },
            { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'expo.inOut' },
            0.5 + i * 0.1
          );
        }
      });
    }

    // Summary
    if (summary) {
      tl.fromTo(summary,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        0.7
      );
    }

    // Empty state
    if (emptyState) {
      tl.fromTo(emptyState,
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power3.out' },
        0.5
      );
    }

    this.wrapper.classList.remove('is-loading');
  }

  /**
   * Render cart page content from global state
   */
  render() {
    const cart = cartState.get();
    if (!cart || !this.wrapper) return;

    // Update subtitle item count
    const subtitleText = this.wrapper.querySelector('[data-subtitle-text]');
    if (subtitleText) {
      const itemWord = cart.item_count === 1 ? 'Item' : 'Items';
      subtitleText.textContent = `${cart.item_count} ${itemWord}`;
    }

    if (cart.item_count === 0) {
      // Show empty cart state
      this.renderEmptyState();
    } else {
      // Render cart items and summary
      this.renderCartContent(cart);
    }
  }

  /**
   * Render empty cart state
   */
  renderEmptyState() {
    const container = this.wrapper.querySelector('.lg\\:grid') || this.wrapper.querySelector('[data-cart-form]')?.parentElement?.parentElement;
    const emptyTitle = window.themeStrings?.cartEmpty || 'Your cart is empty';
    const emptyDescription = window.themeStrings?.cartEmptyDescription || 'Looks like you haven\'t added anything yet.';
    const startShopping = window.themeStrings?.cartStartShopping || 'Start Shopping';
    const backHome = window.themeStrings?.backHome || 'Back to Home';
    const collectionsUrl = window.routes?.allProductsCollectionUrl || '/collections/all';
    const homeUrl = window.routes?.rootUrl || '/';
    const containerClass = this.wrapper.querySelector('[class*="page-container"]') ? 'page-container' : 'page-full';

    if (container) {
      container.outerHTML = `
        <div class="cart-empty ${containerClass} pb-[--page-vertical-padding]" style="opacity: 1;">
          <h2 class="text-2xl md:text-3xl font-semibold text-[--color-text] font-heading">${emptyTitle}</h2>
          <p class="mt-4 text-[--color-text-secondary] max-w-sm">${emptyDescription}</p>

          <div class="mt-10 flex flex-col sm:flex-row gap-4 max-w-xs sm:max-w-none">
            <a href="${collectionsUrl}" class="btn btn--primary w-full sm:w-auto">
              <i class="ph ph-storefront"></i>
              <span>${startShopping}</span>
            </a>
            <a href="${homeUrl}" class="btn btn--secondary w-full sm:w-auto">
              <i class="ph ph-house"></i>
              <span>${backHome}</span>
            </a>
          </div>
        </div>
      `;
    }
  }

  /**
   * Render cart items and summary
   */
  renderCartContent(cart) {
    // Render items list
    const itemsList = this.wrapper.querySelector('[data-cart-form] ul');
    if (itemsList) {
      itemsList.innerHTML = cart.items.map((item, index) => this.renderCartItem(item, index + 1)).join('');
    }

    // Update summary totals
    this.updateSummary(cart);
  }

  /**
   * Render a single cart item
   */
  renderCartItem(item, lineIndex) {
    const hasVariant = item.variant_title && item.variant_title !== 'Default Title';
    const hasDiscount = item.original_line_price !== item.final_line_price;
    const hasSellingPlan = item.selling_plan_allocation;
    const removeText = window.themeStrings?.cartRemove || 'Remove';

    return `
      <li class="cart-item py-8 first:pt-0" data-cart-item data-line="${lineIndex}" style="opacity: 1; transform: translateY(0);">
        <div class="flex gap-6">
          <div class="cart-item-image w-28 h-36 flex-shrink-0 overflow-hidden bg-[--color-background-secondary]" style="clip-path: inset(0 0% 0 0);">
            ${item.image ? `
              <a href="${item.url}">
                <img
                  src="${cartState.getSizedImageUrl(item.image, '300x')}"
                  alt="${item.title}"
                  class="w-full h-full object-cover"
                  loading="lazy"
                >
              </a>
            ` : ''}
          </div>

          <div class="flex flex-1 flex-col justify-between">
            <div>
              <div class="flex justify-between">
                <div>
                  <h3 class="text-base font-medium text-[--color-text]">
                    <a href="${item.url}" class="hover:text-[--color-primary] transition-colors">
                      ${item.product_title}
                    </a>
                  </h3>
                  ${hasVariant ? `<p class="mt-1 text-sm text-[--color-text-secondary]">${item.variant_title}</p>` : ''}
                  ${hasSellingPlan ? `<p class="mt-1 text-xs text-[--color-text-secondary]">${item.selling_plan_allocation.selling_plan.name}</p>` : ''}
                </div>
                <div class="text-right">
                  <p class="text-base font-medium text-[--color-text]">${cartState.formatMoney(item.final_line_price)}</p>
                  ${hasDiscount ? `<p class="text-sm text-[--color-text-secondary] line-through">${cartState.formatMoney(item.original_line_price)}</p>` : ''}
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <div class="cart-quantity" data-quantity-wrapper>
                <button type="button" class="cart-quantity-btn" data-quantity-minus aria-label="Decrease quantity">
                  <i class="ph ph-minus"></i>
                </button>
                <div class="cart-quantity-value">
                  <input
                    type="number"
                    name="updates[]"
                    value="${item.quantity}"
                    min="0"
                    class="cart-quantity-input"
                    data-quantity-input
                    data-line="${lineIndex}"
                    aria-label="Quantity"
                  >
                </div>
                <button type="button" class="cart-quantity-btn" data-quantity-plus aria-label="Increase quantity">
                  <i class="ph ph-plus"></i>
                </button>
              </div>

              <button
                type="button"
                class="text-xs uppercase tracking-wider font-medium text-[--color-text-secondary] hover:text-[--color-text] transition-colors"
                data-remove-item
                data-line="${lineIndex}"
              >
                ${removeText}
              </button>
            </div>
          </div>
        </div>
      </li>
    `;
  }

  /**
   * Update cart summary section
   */
  updateSummary(cart) {
    // Update subtotal
    const subtotalEl = this.wrapper.querySelector('[data-cart-subtotal]');
    if (subtotalEl) {
      subtotalEl.textContent = cartState.formatMoney(cart.total_price);
    }

    // Update total
    const totalEl = this.wrapper.querySelector('[data-cart-total]');
    if (totalEl) {
      totalEl.textContent = cartState.formatMoney(cart.total_price);
    }

    // Update cart note
    const noteInput = this.wrapper.querySelector('[data-cart-note]');
    if (noteInput && cart.note !== noteInput.value) {
      noteInput.value = cart.note || '';
    }
  }

  /**
   * Re-initialize after page transitions
   */
  reinit() {
    this.destroy();
    this.init();
  }

  /**
   * Clean up
   */
  destroy() {
    // Unsubscribe from cart state
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    clearTimeout(this.noteTimeout);
    this.wrapper = null;
    this.isInitialized = false;
    this.isReady = false;
  }
}

// Singleton export
export const cartPageManager = new CartPageManager();
export default cartPageManager;
