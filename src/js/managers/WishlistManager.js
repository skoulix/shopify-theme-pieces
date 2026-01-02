import { formatMoney } from '../utils/formatMoney.js';

/**
 * WishlistManager - Track and display wishlist/favorite products
 * Stores product data in localStorage for persistence
 */
class WishlistManager {
  constructor() {
    this.storageKey = 'pieces_wishlist';
    this.maxProducts = 100; // Allow many items in wishlist
    this.listeners = new Set();
  }

  /**
   * Get products in wishlist
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
   * Check if a product is in the wishlist
   * @param {string} productId - Product ID to check
   * @returns {boolean}
   */
  hasProduct(productId) {
    return this.getProducts().some(p => p.id === productId);
  }

  /**
   * Get count of products in wishlist
   * @returns {number}
   */
  getCount() {
    return this.getProducts().length;
  }

  /**
   * Add a product to wishlist
   * @param {Object} product - Product data
   * @returns {boolean} True if added successfully
   */
  addProduct(product) {
    if (!product || !product.id || !product.handle) return false;

    const products = this.getProducts();

    // Check if already in list
    if (products.some(p => p.id === product.id)) {
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
      available: product.available !== false,
      addedAt: Date.now()
    };

    products.unshift(newProduct); // Add to beginning

    // Limit to max products
    const limitedProducts = products.slice(0, this.maxProducts);

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(limitedProducts));
      this.notify();
      document.dispatchEvent(new CustomEvent('wishlist:added', { detail: { product: newProduct } }));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Remove a product from wishlist
   * @param {string} productId - Product ID to remove
   * @returns {boolean} True if removed successfully
   */
  removeProduct(productId) {
    const products = this.getProducts();
    const filteredProducts = products.filter(p => p.id !== productId);

    if (filteredProducts.length === products.length) {
      return false;
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(filteredProducts));
      this.notify();
      document.dispatchEvent(new CustomEvent('wishlist:removed', { detail: { productId } }));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Toggle a product in wishlist
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
   * Clear all products from wishlist
   */
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
      this.notify();
      document.dispatchEvent(new CustomEvent('wishlist:cleared'));
    } catch {}
  }

  /**
   * Subscribe to changes
   * @param {Function} callback
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
      } catch {}
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
export const wishlistManager = new WishlistManager();
export default wishlistManager;
