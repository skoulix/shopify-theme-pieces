import { gsap } from 'gsap';
import { lenisManager } from './LenisManager.js';

/**
 * CartDrawerManager - Handles cart drawer functionality
 * Reactive cart drawer with GSAP animations and Lenis integration
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
  }

  /**
   * Initialize the cart drawer
   */
  init() {
    this.drawer = document.getElementById('cart-drawer');
    if (!this.drawer) return;

    this.backdrop = this.drawer.querySelector('.cart-drawer__backdrop');
    this.panel = this.drawer.querySelector('.cart-drawer__panel');

    this.bindEvents();
    this.bindGlobalEvents();
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

    // Listen for cart:refresh
    this.boundHandlers.refresh = this.refresh.bind(this);
    document.addEventListener('cart:refresh', this.boundHandlers.refresh);
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

      await this.updateCartLine(line, quantity);
    }
  }

  /**
   * Handle input change events
   */
  async handleChange(e) {
    if (e.target.matches('[data-quantity-input]')) {
      const line = parseInt(e.target.dataset.line);
      const quantity = parseInt(e.target.value) || 0;
      await this.updateCartLine(line, quantity);
    }
  }

  /**
   * Handle cart note input
   */
  handleNoteInput(e) {
    clearTimeout(this.noteTimeout);
    this.noteTimeout = setTimeout(() => {
      fetch('/cart/update.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: e.target.value })
      });
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
  open() {
    if (this.isAnimating || this.isOpen || !this.drawer) return;
    this.isAnimating = true;

    // Set initial states
    gsap.set(this.backdrop, { opacity: 0 });
    gsap.set(this.panel, { x: '100%' });

    // Update state
    this.drawer.classList.add('is-open');
    this.drawer.setAttribute('aria-hidden', 'false');
    this.isOpen = true;

    // Stop smooth scrolling
    lenisManager.stop();

    // Dispatch event
    document.dispatchEvent(new CustomEvent('cart:opened'));

    // Animate in
    gsap.timeline({ onComplete: () => { this.isAnimating = false; } })
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
        this.drawer.setAttribute('aria-hidden', 'true');
        this.isOpen = false;
        this.isAnimating = false;

        // Resume smooth scrolling
        lenisManager.start();
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
   * Update cart line quantity
   */
  async updateCartLine(line, quantity) {
    this.drawer.classList.add('is-loading');

    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line, quantity })
      });

      if (response.ok) {
        await this.refresh();
        document.dispatchEvent(new CustomEvent('cart:updated'));
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    } finally {
      this.drawer.classList.remove('is-loading');
    }
  }

  /**
   * Refresh cart drawer content via AJAX
   */
  async refresh() {
    if (!this.drawer) return;

    try {
      const response = await fetch('/?sections=cart-drawer-content');
      const data = await response.json();

      if (data['cart-drawer-content']) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data['cart-drawer-content'], 'text/html');

        // Update content
        const newContent = doc.querySelector('[data-cart-drawer-content]');
        const currentContent = this.drawer.querySelector('[data-cart-drawer-content]');
        if (newContent && currentContent) {
          currentContent.innerHTML = newContent.innerHTML;
        }

        // Update footer
        const newFooter = doc.querySelector('.cart-drawer__footer');
        const currentFooter = this.drawer.querySelector('.cart-drawer__footer');
        if (newFooter && currentFooter) {
          currentFooter.outerHTML = newFooter.outerHTML;
        } else if (newFooter && !currentFooter) {
          this.panel.appendChild(newFooter.cloneNode(true));
        } else if (!newFooter && currentFooter) {
          currentFooter.remove();
        }

        // Update count
        const cart = await fetch('/cart.js').then(r => r.json());
        this.updateCartCount(cart.item_count);
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
      // Fallback: reload page
      window.location.reload();
    }
  }

  /**
   * Update cart count in header and drawer
   */
  updateCartCount(count) {
    document.querySelectorAll('[data-cart-count]').forEach(el => {
      el.textContent = count;
    });
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

    // Remove close button listeners
    this.drawer.querySelectorAll('[data-cart-drawer-close]').forEach(btn => {
      btn.removeEventListener('click', this.boundHandlers.handleClose);
    });

    // Remove delegated listeners
    this.drawer.removeEventListener('click', this.boundHandlers.handleClick);
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
    document.removeEventListener('cart:refresh', this.boundHandlers.refresh);

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
