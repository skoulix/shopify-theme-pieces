import { toast } from '../utils/toast.js';

/**
 * CartState - Global cart state management
 * Single source of truth for cart data across all components
 */
class CartState {
  constructor() {
    this.cart = null;
    this.listeners = new Set();
    this.isUpdating = false;
  }

  /**
   * Initialize cart state by fetching from Shopify
   */
  async init() {
    await this.fetch();
  }

  /**
   * Fetch cart data from Shopify
   */
  async fetch() {
    try {
      const response = await fetch('/cart.js');
      this.cart = await response.json();
      this.notify();
      return this.cart;
    } catch {
      return null;
    }
  }

  /**
   * Get current cart data
   */
  get() {
    return this.cart;
  }

  /**
   * Get cart item count
   */
  getItemCount() {
    return this.cart?.item_count || 0;
  }

  /**
   * Get cart total price
   */
  getTotalPrice() {
    return this.cart?.total_price || 0;
  }

  /**
   * Update cart line quantity
   */
  async updateLine(line, quantity) {
    this.isUpdating = true;
    this.notify();

    try {
      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line, quantity })
      });

      if (response.ok) {
        this.cart = await response.json();
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: this.cart } }));
      }
    } catch {
      // Cart update failed - state remains unchanged
    } finally {
      this.isUpdating = false;
      this.notify();
    }

    return this.cart;
  }

  /**
   * Add item to cart
   */
  async addItem(variantId, quantity = 1, properties = {}) {
    this.isUpdating = true;
    this.notify();

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: variantId,
          quantity,
          properties
        })
      });

      if (response.ok) {
        // Fetch full cart after adding
        await this.fetch();
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: this.cart } }));
      }
    } catch {
      // Add to cart failed
    } finally {
      this.isUpdating = false;
      this.notify();
    }

    return this.cart;
  }

  /**
   * Update cart note
   */
  async updateNote(note) {
    try {
      await fetch('/cart/update.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });

      if (this.cart) {
        this.cart.note = note;
      }
    } catch {
      // Note update failed
    }
  }

  /**
   * Subscribe to cart state changes
   */
  subscribe(callback) {
    this.listeners.add(callback);
    // Return unsubscribe function
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of state change
   */
  notify() {
    this.listeners.forEach(callback => {
      try {
        callback(this.cart, this.isUpdating);
      } catch {
        // Listener error - continue notifying other listeners
      }
    });
  }

  /**
   * Format money according to shop settings
   * Handles all Shopify money format placeholders
   */
  formatMoney(cents) {
    if (typeof cents === 'string') {
      cents = cents.replace('.', '');
    }
    cents = parseInt(cents, 10) || 0;

    const moneyFormat = window.themeSettings?.moneyFormat || '${{amount}}';

    const value = cents / 100;
    const amount = value.toFixed(2);
    const amountNoDecimals = Math.floor(value);
    const amountWithCommaSeparator = amount.replace('.', ',');
    const amountNoDecimalsWithCommaSeparator = amountNoDecimals.toString();
    const amountWithApostropheSeparator = amount.replace('.', "'");

    const addThousandSeparator = (numStr, sep) => {
      const parts = numStr.split(/[.,]/);
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep);
      return parts.join(numStr.includes(',') ? ',' : '.');
    };

    const amountWithSpaceSeparator = addThousandSeparator(amount, ' ');

    return moneyFormat
      .replace('{{amount_with_comma_separator}}', amountWithCommaSeparator)
      .replace('{{amount_no_decimals_with_comma_separator}}', amountNoDecimalsWithCommaSeparator)
      .replace('{{amount_with_apostrophe_separator}}', amountWithApostropheSeparator)
      .replace('{{amount_no_decimals_with_space_separator}}', addThousandSeparator(amountNoDecimals.toString(), ' '))
      .replace('{{amount_with_space_separator}}', amountWithSpaceSeparator)
      .replace('{{amount_no_decimals}}', amountNoDecimals.toString())
      .replace('{{amount}}', amount);
  }

  /**
   * Get sized image URL from Shopify image
   */
  getSizedImageUrl(url, size) {
    if (!url) return '';
    const match = url.match(/^(.+?)(\.(jpg|jpeg|png|gif|webp))(\?.*)?$/i);
    if (match) {
      return `${match[1]}_${size}${match[2]}${match[4] || ''}`;
    }
    return url;
  }
}

// Singleton export
export const cartState = new CartState();
export default cartState;
