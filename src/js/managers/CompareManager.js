import { formatMoney } from '../utils/formatMoney.js';

/**
 * CompareManager - Track and display product comparisons
 * Stores product data in localStorage for persistence
 */
class CompareManager {
  constructor() {
    this.storageKey = 'pieces_compare_products';
    this.maxProducts = 4; // Maximum products to compare
    this.listeners = new Set();
  }

  /**
   * Get products in compare list
   * @returns {Array} Array of product objects
   */
  getProducts() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Check if a product is in the compare list
   * @param {string} productId - Product ID to check
   * @returns {boolean}
   */
  hasProduct(productId) {
    return this.getProducts().some(p => p.id === productId);
  }

  /**
   * Get count of products in compare list
   * @returns {number}
   */
  getCount() {
    return this.getProducts().length;
  }

  /**
   * Check if compare list is full
   * @returns {boolean}
   */
  isFull() {
    return this.getCount() >= this.maxProducts;
  }

  /**
   * Add a product to compare list
   * @param {Object} product - Product data
   * @param {string} product.id - Product ID
   * @param {string} product.handle - Product handle
   * @param {string} product.title - Product title
   * @param {string} product.url - Product URL
   * @param {string} product.image - Featured image URL
   * @param {number} product.price - Product price in cents
   * @param {number} [product.compareAtPrice] - Compare at price in cents
   * @param {string} [product.vendor] - Product vendor
   * @param {string} [product.type] - Product type
   * @param {string} [product.sku] - Product SKU (first variant)
   * @param {boolean} [product.available] - Product availability
   * @param {Array} [product.options] - Product options with values
   * @returns {boolean} True if added successfully
   */
  addProduct(product) {
    if (!product || !product.id || !product.handle) return false;

    const products = this.getProducts();

    // Check if already in list
    if (products.some(p => p.id === product.id)) {
      return false;
    }

    // Check if list is full
    if (products.length >= this.maxProducts) {
      return false;
    }

    // Add product
    const newProduct = {
      id: product.id,
      handle: product.handle,
      title: product.title,
      url: product.url || `/products/${product.handle}`,
      image: product.image,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      vendor: product.vendor,
      type: product.type,
      sku: product.sku,
      available: product.available !== false,
      options: product.options || [],
      addedAt: Date.now()
    };

    products.push(newProduct);

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(products));
      this.notify();
      document.dispatchEvent(new CustomEvent('compare:added', { detail: { product: newProduct } }));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Remove a product from compare list
   * @param {string} productId - Product ID to remove
   * @returns {boolean} True if removed successfully
   */
  removeProduct(productId) {
    const products = this.getProducts();
    const filteredProducts = products.filter(p => p.id !== productId);

    if (filteredProducts.length === products.length) {
      return false; // Product wasn't in list
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(filteredProducts));
      this.notify();
      document.dispatchEvent(new CustomEvent('compare:removed', { detail: { productId } }));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Toggle a product in compare list
   * @param {Object} product - Product data
   * @returns {boolean} True if product is now in list, false if removed
   */
  toggleProduct(product) {
    if (this.hasProduct(product.id)) {
      this.removeProduct(product.id);
      return false;
    } else {
      return this.addProduct(product);
    }
  }

  /**
   * Clear all products from compare list
   */
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      this.notify();
      document.dispatchEvent(new CustomEvent('compare:cleared'));
    } catch {
      // Handle error silently
    }
  }

  /**
   * Subscribe to changes
   * @param {Function} callback - Function to call when products change
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of changes
   */
  notify() {
    const products = this.getProducts();
    this.listeners.forEach(callback => {
      try {
        callback(products);
      } catch {
        // Listener error - continue notifying others
      }
    });
  }

  /**
   * Format money - delegates to shared utility
   */
  formatMoney(cents) {
    return formatMoney(cents);
  }
}

// Singleton export
export const compareManager = new CompareManager();
export default compareManager;
