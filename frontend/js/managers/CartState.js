import { toast } from '../utils/toast.js';
import { TIMEOUT } from '../utils/constants.js';

/**
 * CartState - Global cart state management
 * Single source of truth for cart data across all components
 */
class CartState {
  constructor() {
    this.cart = null;
    this.listeners = new Set();
    this.isUpdating = false;
    this.requestTimeout = TIMEOUT.cartFetch;
  }

  /**
   * Fetch with timeout and abort controller
   * @param {string} url - URL to fetch
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>}
   */
  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Handle API error responses with appropriate messages
   * @param {Response} response - Fetch response
   * @param {string} defaultMessage - Fallback error message
   */
  async handleErrorResponse(response, defaultMessage) {
    if (response.status === 429) {
      toast.error('Too many requests. Please wait a moment and try again.');
    } else if (response.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      const errorData = await response.json().catch(() => ({}));
      toast.error(errorData.description || defaultMessage);
    }
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
      const response = await this.fetchWithTimeout('/cart.js');
      if (response.ok) {
        this.cart = await response.json();
        this.notify();
        return this.cart;
      }
      return null;
    } catch (error) {
      // Silently handle timeout/abort errors - cart will retry on next interaction
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

    const defaultError = window.cartStrings?.error || 'Could not update cart';

    try {
      const response = await this.fetchWithTimeout('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line, quantity })
      });

      if (response.ok) {
        this.cart = await response.json();
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: this.cart } }));
      } else {
        await this.handleErrorResponse(response, defaultError);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please check your connection.');
      } else {
        toast.error(defaultError + '. Please try again.');
      }
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

    const defaultError = window.cartStrings?.error || 'Could not add to cart';

    try {
      const response = await this.fetchWithTimeout('/cart/add.js', {
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
      } else {
        await this.handleErrorResponse(response, defaultError);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please check your connection.');
      } else {
        toast.error(defaultError + '. Please try again.');
      }
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
    // Handle string input - remove any non-numeric chars except decimal
    if (typeof cents === 'string') {
      cents = cents.replace(/[^\d.-]/g, '');
      if (cents.includes('.')) {
        cents = Math.round(parseFloat(cents) * 100);
      } else {
        cents = parseInt(cents, 10);
      }
    }
    cents = cents || 0;

    const moneyFormat = window.themeSettings?.moneyFormat || '${{amount}}';
    const value = cents / 100;
    const amountNoDecimals = Math.floor(value);

    // Format with thousand separators using locale
    const amountFormatted = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const amountWithComma = value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const amountNoDecimalsWithComma = amountNoDecimals.toLocaleString('de-DE');
    const amountWithApostrophe = value.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const amountWithSpace = value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const amountNoDecimalsWithSpace = amountNoDecimals.toLocaleString('fr-FR');

    return moneyFormat
      .replace('{{amount_with_comma_separator}}', amountWithComma)
      .replace('{{amount_no_decimals_with_comma_separator}}', amountNoDecimalsWithComma)
      .replace('{{amount_with_apostrophe_separator}}', amountWithApostrophe)
      .replace('{{amount_no_decimals_with_space_separator}}', amountNoDecimalsWithSpace)
      .replace('{{amount_with_space_separator}}', amountWithSpace)
      .replace('{{amount_no_decimals}}', amountNoDecimals.toLocaleString('en-US'))
      .replace('{{amount}}', amountFormatted);
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
