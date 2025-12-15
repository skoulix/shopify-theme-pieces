/**
 * Toast notification utility
 * Provides user-friendly error/success notifications
 */

import { DURATION, TIMEOUT } from './constants.js';

class ToastManager {
  constructor() {
    this.container = null;
    this.queue = [];
    this.current = null;
  }

  /**
   * Ensure toast container exists in DOM
   */
  ensureContainer() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.setAttribute('role', 'status');
    this.container.setAttribute('aria-live', 'polite');
    document.body.appendChild(this.container);
  }

  /**
   * Show a toast notification
   * @param {string} message - The message to display
   * @param {Object} options - Toast options
   * @param {string} options.type - 'success', 'error', 'info' (default: 'info')
   * @param {number} options.duration - Duration in ms (default: 4000)
   */
  show(message, options = {}) {
    const { type = 'info', duration = 4000 } = options;

    this.ensureContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__icon">
        <i class="ph ${this.getIcon(type)}"></i>
      </span>
      <span class="toast__message">${message}</span>
      <button class="toast__close" aria-label="Dismiss">
        <i class="ph ph-x"></i>
      </button>
    `;

    // Close button handler
    const closeBtn = toast.querySelector('.toast__close');
    closeBtn.addEventListener('click', () => this.dismiss(toast), { once: true });

    // Add to container
    this.container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.add('toast--visible');
    });

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => this.dismiss(toast), duration);
    }

    return toast;
  }

  /**
   * Get icon class for toast type
   */
  getIcon(type) {
    const icons = {
      success: 'ph-check-circle',
      error: 'ph-warning-circle',
      info: 'ph-info'
    };
    return icons[type] || icons.info;
  }

  /**
   * Dismiss a toast
   */
  dismiss(toast) {
    if (!toast || !toast.parentNode) return;

    toast.classList.remove('toast--visible');
    toast.classList.add('toast--leaving');

    // Remove after animation
    setTimeout(() => {
      toast.remove();
    }, DURATION.normal);
  }

  /**
   * Show success toast
   */
  success(message, duration = 4000) {
    return this.show(message, { type: 'success', duration });
  }

  /**
   * Show error toast
   */
  error(message, duration = 5000) {
    return this.show(message, { type: 'error', duration });
  }

  /**
   * Show info toast
   */
  info(message, duration = 4000) {
    return this.show(message, { type: 'info', duration });
  }
}

// Singleton export
export const toast = new ToastManager();
export default toast;
