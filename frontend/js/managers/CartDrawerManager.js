import { gsap } from 'gsap';
import { lenisManager } from './LenisManager.js';
import { cartState } from './CartState.js';

/**
 * CartDrawerManager - Handles cart drawer functionality
 * Uses global CartState for data, GSAP for animations, Lenis for scroll
 */
class CartDrawerManager {
  constructor() {
    this.drawer = null;
    this.backdrop = null;
    this.panel = null;
    this.isOpen = false;
    this.isAnimating = false;
    this.noteTimeout = null;
    this.boundHandlers = {};
    this.unsubscribe = null;
  }

  /**
   * Initialize the cart drawer
   */
  init() {
    this.drawer = document.getElementById('cart-drawer');
    if (!this.drawer) return;

    this.backdrop = this.drawer.querySelector('.cart-drawer__backdrop');
    this.panel = this.drawer.querySelector('.cart-drawer__panel');

    // Subscribe to cart state changes
    this.unsubscribe = cartState.subscribe((cart, isUpdating) => {
      this.onCartStateChange(cart, isUpdating);
    });

    this.bindEvents();
    this.bindGlobalEvents();
  }

  /**
   * Handle cart state changes
   */
  onCartStateChange(cart, isUpdating) {
    if (!this.drawer) return;

    // Update loading state
    if (isUpdating) {
      this.drawer.classList.add('is-loading');
    } else {
      this.drawer.classList.remove('is-loading');
    }

    // Re-render if drawer is open
    if (this.isOpen && cart) {
      this.render();
    }
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Close button clicks
    this.boundHandlers.handleClose = this.handleClose.bind(this);
    this.drawer.querySelectorAll('[data-cart-drawer-close]').forEach(btn => {
      btn.addEventListener('click', this.boundHandlers.handleClose);
    });

    // Quantity controls and remove buttons (delegated)
    this.boundHandlers.handleClick = this.handleClick.bind(this);
    this.drawer.addEventListener('click', this.boundHandlers.handleClick);

    // Quantity input changes
    this.boundHandlers.handleChange = this.handleChange.bind(this);
    this.drawer.addEventListener('change', this.boundHandlers.handleChange);

    // Cart note input
    this.boundHandlers.handleNoteInput = this.handleNoteInput.bind(this);
    const noteInput = this.drawer.querySelector('[data-cart-note]');
    if (noteInput) {
      noteInput.addEventListener('input', this.boundHandlers.handleNoteInput);
    }

    // Escape key
    this.boundHandlers.handleKeydown = this.handleKeydown.bind(this);
    document.addEventListener('keydown', this.boundHandlers.handleKeydown);

    // Close drawer when clicking product links (for Swup navigation)
    this.boundHandlers.handleLinkClick = this.handleLinkClick.bind(this);
    this.drawer.addEventListener('click', this.boundHandlers.handleLinkClick);
  }

  /**
   * Handle link clicks inside drawer to close before navigation
   */
  handleLinkClick(e) {
    const link = e.target.closest('a[href]');
    if (!link) return;

    // Skip links with data-cart-drawer-close (already handled)
    if (link.hasAttribute('data-cart-drawer-close')) return;

    // Skip external links and anchors
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('//')) return;

    // Close drawer for internal navigation
    this.close();
  }

  /**
   * Bind global event listeners
   */
  bindGlobalEvents() {
    // Listen for cart:open events (from add-to-cart)
    this.boundHandlers.open = this.open.bind(this);
    document.addEventListener('cart:open', this.boundHandlers.open);

    // Listen for cart:toggle
    this.boundHandlers.toggle = this.toggle.bind(this);
    document.addEventListener('cart:toggle', this.boundHandlers.toggle);

    // Close drawer when Swup starts navigation
    this.boundHandlers.closeOnNavigation = () => {
      if (this.isOpen) {
        this.close();
      }
    };
    window.addEventListener('swup:contentReplaced', this.boundHandlers.closeOnNavigation);
  }

  /**
   * Handle close button clicks
   */
  handleClose(e) {
    if (e.target.closest('a')) {
      // Delay close for links to allow navigation
      setTimeout(() => this.close(), 100);
    } else {
      this.close();
    }
  }

  /**
   * Handle delegated click events
   */
  async handleClick(e) {
    const minusBtn = e.target.closest('[data-quantity-minus]');
    const plusBtn = e.target.closest('[data-quantity-plus]');
    const removeBtn = e.target.closest('[data-remove-item]');

    if (minusBtn || plusBtn || removeBtn) {
      e.preventDefault();
      const line = parseInt(minusBtn?.dataset.line || plusBtn?.dataset.line || removeBtn?.dataset.line);
      const input = this.drawer.querySelector(`[data-quantity-input][data-line="${line}"]`);
      let quantity = parseInt(input?.value || 0);

      if (minusBtn && quantity > 0) quantity--;
      if (plusBtn) quantity++;
      if (removeBtn) quantity = 0;

      await cartState.updateLine(line, quantity);
    }
  }

  /**
   * Handle input change events
   */
  async handleChange(e) {
    if (e.target.matches('[data-quantity-input]')) {
      const line = parseInt(e.target.dataset.line);
      const quantity = parseInt(e.target.value) || 0;
      await cartState.updateLine(line, quantity);
    }
  }

  /**
   * Handle cart note input
   */
  handleNoteInput(e) {
    clearTimeout(this.noteTimeout);
    this.noteTimeout = setTimeout(() => {
      cartState.updateNote(e.target.value);
    }, 500);
  }

  /**
   * Handle keyboard events
   */
  handleKeydown(e) {
    if (e.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }

  /**
   * Open the cart drawer
   */
  async open() {
    if (this.isAnimating || this.isOpen || !this.drawer) return;
    this.isAnimating = true;

    // Store the element that triggered the open for focus restoration
    this.previouslyFocused = document.activeElement;

    // Fetch fresh cart data and render before opening
    await cartState.fetch();
    this.render();

    // Set initial states
    gsap.set(this.backdrop, { opacity: 0 });
    gsap.set(this.panel, { x: '100%' });

    // Update state - use inert instead of aria-hidden to properly handle focus
    this.drawer.classList.add('is-open');
    this.drawer.removeAttribute('inert');
    this.drawer.removeAttribute('aria-hidden');
    this.isOpen = true;

    // Stop smooth scrolling
    lenisManager.stop();

    // Dispatch event
    document.dispatchEvent(new CustomEvent('cart:opened'));

    // Animate in and focus close button when complete
    gsap.timeline({
      onComplete: () => {
        this.isAnimating = false;
        // Focus the close button for accessibility
        const closeBtn = this.drawer.querySelector('[data-cart-drawer-close]');
        if (closeBtn) closeBtn.focus();
      }
    })
      .to(this.backdrop, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0)
      .to(this.panel, { x: '0%', duration: 0.4, ease: 'power3.out' }, 0);
  }

  /**
   * Close the cart drawer
   */
  close() {
    if (this.isAnimating || !this.isOpen || !this.drawer) return;
    this.isAnimating = true;

    // Dispatch event
    document.dispatchEvent(new CustomEvent('cart:closed'));

    // Animate out
    gsap.timeline({
      onComplete: () => {
        this.drawer.classList.remove('is-open');
        // Use inert instead of aria-hidden to properly handle focus
        this.drawer.setAttribute('inert', '');
        this.isOpen = false;
        this.isAnimating = false;

        // Resume smooth scrolling
        lenisManager.start();

        // Restore focus to the element that opened the drawer
        if (this.previouslyFocused && this.previouslyFocused.focus) {
          this.previouslyFocused.focus();
          this.previouslyFocused = null;
        }
      }
    })
      .to(this.backdrop, { opacity: 0, duration: 0.25, ease: 'power2.in' }, 0)
      .to(this.panel, { x: '100%', duration: 0.3, ease: 'power3.in' }, 0);
  }

  /**
   * Toggle the cart drawer
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Render cart drawer content using Section Rendering API
   * This ensures compare-at prices are properly rendered via Liquid
   */
  async render() {
    if (!this.drawer) return;

    try {
      // Use Section Rendering API for proper Liquid rendering (compare-at prices, etc.)
      const response = await fetch('/?section_id=cart-drawer');
      if (response.ok) {
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract content and footer from the fetched section
        const newContent = doc.querySelector('[data-cart-drawer-content]');
        const newFooter = doc.querySelector('.cart-drawer__footer');

        const content = this.drawer.querySelector('[data-cart-drawer-content]');
        const footer = this.drawer.querySelector('.cart-drawer__footer');

        if (newContent && content) {
          content.innerHTML = newContent.innerHTML;
        }

        if (newFooter) {
          if (footer) {
            footer.outerHTML = newFooter.outerHTML;
          } else {
            this.panel.insertAdjacentHTML('beforeend', newFooter.outerHTML);
          }
        } else if (footer) {
          // No footer in new content (empty cart)
          footer.remove();
        }
      }
    } catch (error) {
      console.error('Error rendering cart drawer:', error);
      // Fallback to JS rendering
      this.renderFallback();
    }
  }

  /**
   * Fallback render using cart.js data (no compare-at prices)
   */
  renderFallback() {
    const cart = cartState.get();
    if (!cart || !this.drawer) return;

    const content = this.drawer.querySelector('[data-cart-drawer-content]');
    const footer = this.drawer.querySelector('.cart-drawer__footer');

    if (cart.item_count === 0) {
      // Render empty cart
      content.innerHTML = this.renderEmptyCart();
      if (footer) footer.remove();
    } else {
      // Render cart items
      content.innerHTML = this.renderCartItems(cart);

      // Render or update footer
      if (footer) {
        footer.outerHTML = this.renderFooter(cart);
      } else {
        this.panel.insertAdjacentHTML('beforeend', this.renderFooter(cart));
      }
    }
  }

  /**
   * Render empty cart state
   */
  renderEmptyCart() {
    const emptyTitle = window.themeStrings?.cartEmpty || 'Your cart is empty';
    const emptyDescription = window.themeStrings?.cartEmptyDescription || 'Add some items to get started';
    const startShopping = window.themeStrings?.cartStartShopping || 'Start shopping';
    const collectionsUrl = window.routes?.allProductsCollectionUrl || '/collections/all';

    return `
      <div class="cart-drawer__empty">
        <h3 class="text-xl font-semibold text-[--color-text] font-heading">${emptyTitle}</h3>
        <p>${emptyDescription}</p>
        <a href="${collectionsUrl}" class="btn btn--primary btn--full" data-cart-drawer-close>
          <i class="ph ph-storefront"></i>
          <span>${startShopping}</span>
        </a>
      </div>
    `;
  }

  /**
   * Render cart items list
   */
  renderCartItems(cart) {
    return `
      <ul class="cart-drawer__items" role="list">
        ${cart.items.map((item, index) => this.renderCartItem(item, index + 1)).join('')}
      </ul>
    `;
  }

  /**
   * Render a single cart item
   */
  renderCartItem(item, lineIndex) {
    const hasVariant = item.variant_title && item.variant_title !== 'Default Title';
    // Check for discounts - cart.js API provides original vs final line prices
    // Note: compare_at_price is only available on initial Liquid render, not cart.js
    const hasDiscount = item.original_line_price !== item.final_line_price;
    const comparePrice = item.original_line_price;

    return `
      <li class="cart-drawer__item" data-cart-item data-line-index="${lineIndex}">
        <div class="cart-drawer__item-image">
          ${item.image ? `
            <a href="${item.url}">
              <img
                src="${cartState.getSizedImageUrl(item.image, '200x')}"
                alt="${item.title}"
                class="w-full h-full object-cover"
                loading="lazy"
              >
            </a>
          ` : ''}
        </div>

        <div class="cart-drawer__item-details">
          <a href="${item.url}" class="cart-drawer__item-title">
            ${item.product_title}
          </a>
          ${hasVariant ? `<p class="cart-drawer__item-variant">${item.variant_title}</p>` : ''}

          <div class="cart-drawer__item-price">
            ${hasDiscount ? `<span class="cart-drawer__item-price--compare">${cartState.formatMoney(comparePrice)}</span>` : ''}
            <span class="${hasDiscount ? 'sale-price' : ''}">${cartState.formatMoney(item.final_line_price)}</span>
          </div>

          <div class="cart-drawer__item-actions">
            <div class="cart-drawer__quantity" data-quantity-wrapper>
              <button
                type="button"
                class="cart-drawer__quantity-btn"
                data-quantity-minus
                data-line="${lineIndex}"
                aria-label="${window.themeStrings?.decreaseQuantity || 'Decrease quantity'}"
              >
                <i class="ph ph-minus"></i>
              </button>
              <div class="cart-drawer__quantity-value">
                <input
                  type="number"
                  class="cart-drawer__quantity-input"
                  value="${item.quantity}"
                  min="0"
                  data-quantity-input
                  data-line="${lineIndex}"
                  aria-label="${window.themeStrings?.quantity || 'Quantity'}"
                >
              </div>
              <button
                type="button"
                class="cart-drawer__quantity-btn"
                data-quantity-plus
                data-line="${lineIndex}"
                aria-label="${window.themeStrings?.increaseQuantity || 'Increase quantity'}"
              >
                <i class="ph ph-plus"></i>
              </button>
            </div>
            <button
              type="button"
              class="cart-drawer__remove"
              data-remove-item
              data-line="${lineIndex}"
              aria-label="${(window.themeStrings?.removeItem || 'Remove {{ title }}').replace('{{ title }}', item.product_title)}"
            >
              <i class="ph ph-trash"></i>
            </button>
          </div>
        </div>
      </li>
    `;
  }

  /**
   * Render cart footer with totals and actions
   */
  renderFooter(cart) {
    const addNote = window.themeStrings?.cartAddNote || 'Add a note';
    const notePlaceholder = window.themeStrings?.cartNotePlaceholder || 'Add special instructions...';
    const subtotal = window.themeStrings?.cartSubtotal || 'Subtotal';
    const taxNote = window.themeStrings?.cartTaxesNote || 'Taxes and shipping calculated at checkout';
    const viewCart = window.themeStrings?.cartViewCart || 'View cart';
    const checkout = window.themeStrings?.cartCheckout || 'Checkout';
    const cartUrl = window.routes?.cartUrl || '/cart';

    return `
      <div class="cart-drawer__footer">
        <details class="cart-drawer__note-wrapper">
          <summary class="cart-drawer__note-toggle">
            <span>${addNote}</span>
            <i class="ph ph-caret-down"></i>
          </summary>
          <div class="cart-drawer__note-content">
            <textarea
              name="note"
              class="cart-drawer__note-input"
              placeholder="${notePlaceholder}"
              data-cart-note
            >${cart.note || ''}</textarea>
          </div>
        </details>

        <div class="cart-drawer__subtotal">
          <span>${subtotal}</span>
          <span data-cart-subtotal>${cartState.formatMoney(cart.total_price)}</span>
        </div>
        <p class="cart-drawer__tax-note">${taxNote}</p>

        <div class="cart-drawer__actions">
          <a href="${cartUrl}" class="btn btn--secondary btn--full" data-cart-drawer-close>
            <span>${viewCart}</span>
          </a>
          <form action="${cartUrl}" method="post">
            <button type="submit" name="checkout" class="btn btn--primary btn--full">
              <i class="ph ph-lock-simple"></i>
              <span>${checkout}</span>
            </button>
          </form>
        </div>
      </div>
    `;
  }

  /**
   * Refresh cart drawer with fresh data from server
   */
  async refresh() {
    await cartState.fetch();
    this.render();
  }

  /**
   * Re-bind events after content refresh (e.g., Swup page transition)
   */
  reinit() {
    this.destroy();
    this.init();
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    if (!this.drawer) return;

    // Unsubscribe from cart state
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    // Remove close button listeners
    this.drawer.querySelectorAll('[data-cart-drawer-close]').forEach(btn => {
      btn.removeEventListener('click', this.boundHandlers.handleClose);
    });

    // Remove delegated listeners
    this.drawer.removeEventListener('click', this.boundHandlers.handleClick);
    this.drawer.removeEventListener('click', this.boundHandlers.handleLinkClick);
    this.drawer.removeEventListener('change', this.boundHandlers.handleChange);

    // Remove note input listener
    const noteInput = this.drawer.querySelector('[data-cart-note]');
    if (noteInput) {
      noteInput.removeEventListener('input', this.boundHandlers.handleNoteInput);
    }

    // Remove keyboard listener
    document.removeEventListener('keydown', this.boundHandlers.handleKeydown);

    // Remove global listeners
    document.removeEventListener('cart:open', this.boundHandlers.open);
    document.removeEventListener('cart:toggle', this.boundHandlers.toggle);
    window.removeEventListener('swup:contentReplaced', this.boundHandlers.closeOnNavigation);

    // Clear timeout
    clearTimeout(this.noteTimeout);

    // Reset state
    this.drawer = null;
    this.backdrop = null;
    this.panel = null;
    this.isOpen = false;
    this.isAnimating = false;
  }
}

// Singleton export
export const cartDrawerManager = new CartDrawerManager();
export default cartDrawerManager;
