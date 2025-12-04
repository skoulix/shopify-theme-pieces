/**
 * Pieces Theme - Main Entry Point
 *
 * SPA-like Shopify theme using:
 * - Swup for page transitions
 * - Lenis for smooth scrolling
 * - GSAP for animations
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';

// Import styles
import '../css/app.css';

// Import managers
import { lenisManager } from './managers/LenisManager.js';
import { swupManager } from './managers/SwupManager.js';
import { animationManager } from './managers/AnimationManager.js';
import { cartState } from './managers/CartState.js';
import { cartDrawerManager } from './managers/CartDrawerManager.js';
import { cartPageManager } from './managers/CartPageManager.js';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, Flip);

// Expose globally for section scripts
window.gsap = gsap;
window.Flip = Flip;
window.Lenis = Lenis;

/**
 * Initialize all reveal animations
 */
function initAnimations() {
  animationManager.initRevealAnimations();
  animationManager.initStaggerAnimations();
  animationManager.initParallax();
  animationManager.initImageReveals();
}

/**
 * Handle Swup content replacement
 * Re-initialize animations after page transition
 */
function handleContentReplaced() {
  // Use requestAnimationFrame for smoother transitions
  requestAnimationFrame(() => {
    animationManager.refresh();
    initAnimations();
    cartDrawerManager.reinit();
    cartPageManager.reinit();
  });
}

/**
 * Handle menu events for Lenis
 */
function handleMenuEvents() {
  document.addEventListener('menu:open', () => {
    lenisManager.stop();
  });

  document.addEventListener('menu:close', () => {
    lenisManager.start();
  });
}

/**
 * Initialize the theme
 */
function init() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Check theme setting for smooth scroll
  const smoothScrollEnabled = window.themeSettings?.enableSmoothScroll !== false;

  // Initialize smooth scroll (respect user preference and theme setting)
  if (!prefersReducedMotion && smoothScrollEnabled) {
    lenisManager.init();
  }

  // Check theme setting for page transitions
  const pageTransitionsEnabled = window.themeSettings?.enablePageTransitions !== false;

  // Initialize page transitions (respect user preference and theme setting)
  if (!prefersReducedMotion && pageTransitionsEnabled) {
    swupManager.init();

    // Listen for content replacement
    window.addEventListener('swup:contentReplaced', handleContentReplaced);
  }

  // Initialize animations
  if (!prefersReducedMotion) {
    // Wait for DOM to be ready
    requestAnimationFrame(() => {
      initAnimations();
    });
  }

  // Handle menu events
  handleMenuEvents();

  // Initialize global cart state
  cartState.init();

  // Subscribe to cart state for header count updates
  cartState.subscribe((cart) => {
    if (cart) {
      document.querySelectorAll('[data-cart-count]').forEach(el => {
        el.textContent = cart.item_count;
        // Toggle visibility based on count
        if (cart.item_count > 0) {
          el.removeAttribute('hidden');
        } else {
          el.setAttribute('hidden', '');
        }
      });
    }
  });

  // Initialize cart drawer and cart page
  cartDrawerManager.init();
  cartPageManager.init();

  // Clear cart page cache when cart is updated
  document.addEventListener('cart:updated', () => {
    swupManager.clearCache('/cart');
  });

  // Handle anchor link clicks for smooth scroll
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor && anchor.getAttribute('href').length > 1) {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        lenisManager.scrollTo(target, {
          offset: -100, // Account for fixed header
        });
      }
    }
  });

  // Expose to window for debugging/external access
  window.pieces = {
    lenis: lenisManager,
    swup: swupManager,
    animation: animationManager,
    cartState: cartState,
    cartDrawer: cartDrawerManager,
    cartPage: cartPageManager,
    gsap,
    ScrollTrigger,
    Flip,
    Lenis,
  };

  // Expose cart functions globally for compatibility
  window.openCartDrawer = () => cartDrawerManager.open();
  window.closeCartDrawer = () => cartDrawerManager.close();
  window.refreshCartDrawer = () => cartDrawerManager.refresh();

  console.log('Pieces theme initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Handle Shopify theme editor
if (window.Shopify && window.Shopify.designMode) {
  document.addEventListener('shopify:section:load', () => {
    animationManager.refresh();
    initAnimations();
  });

  document.addEventListener('shopify:section:unload', () => {
    animationManager.destroy();
  });

  document.addEventListener('shopify:section:reorder', () => {
    animationManager.refresh();
  });
}
