/**
 * Pieces Theme - Main Entry Point
 *
 * SPA-like Shopify theme using:
 * - piecesjs for web components
 * - Swup for page transitions
 * - Lenis for smooth scrolling
 * - GSAP for animations
 */

import { loadDynamically, piecesManager } from 'piecesjs';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import styles
import '../css/app.css';

// Import managers
import { lenisManager } from './managers/LenisManager.js';
import { swupManager } from './managers/SwupManager.js';
import { animationManager } from './managers/AnimationManager.js';

// Import utilities (makes them available globally for backwards compatibility)
import './utils/index.js';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * Load piecesjs components
 * Components are dynamically imported for code splitting
 */
function loadComponents() {
  // Core components
  loadDynamically('c-header', () => import('./components/Header.js'));
  loadDynamically('c-hero', () => import('./components/Hero.js'));
  loadDynamically('c-product-card', () => import('./components/ProductCard.js'));

  // UI components (migrated from global.js)
  loadDynamically('c-quantity-input', () => import('./components/QuantityInput.js'));
  loadDynamically('c-modal', () => import('./components/Modal.js'));
  loadDynamically('c-slider', () => import('./components/Slider.js'));
  loadDynamically('c-slideshow', () => import('./components/Slideshow.js'));

  // Animation components
  loadDynamically('c-scroll-reveal', () => import('./components/ScrollReveal.js'));
  loadDynamically('c-image-reveal', () => import('./components/ImageReveal.js'));
  loadDynamically('c-magnetic', () => import('./components/Magnetic.js'));

  // Utility components (migrated from assets)
  loadDynamically('c-show-more', () => import('./components/ShowMore.js'));
  loadDynamically('c-share-button', () => import('./components/ShareButton.js'));
  loadDynamically('c-pickup-availability', () => import('./components/PickupAvailability.js'));
  loadDynamically('c-pickup-drawer', () => import('./components/PickupAvailability.js'));
  loadDynamically('c-localization-form', () => import('./components/LocalizationForm.js'));
}

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
 * Re-initialize components and animations after page transition
 */
function handleContentReplaced() {
  // Re-load components for new content
  loadComponents();

  // Re-initialize animations
  setTimeout(() => {
    animationManager.refresh();
    initAnimations();
  }, 100);
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

  // Initialize smooth scroll (respect user preference)
  if (!prefersReducedMotion) {
    lenisManager.init();
  }

  // Initialize page transitions (respect user preference)
  if (!prefersReducedMotion) {
    swupManager.init();

    // Listen for content replacement
    window.addEventListener('swup:contentReplaced', handleContentReplaced);
  }

  // Load components
  loadComponents();

  // Initialize animations
  if (!prefersReducedMotion) {
    // Wait for DOM to be ready
    requestAnimationFrame(() => {
      initAnimations();
    });
  }

  // Handle menu events
  handleMenuEvents();

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
    gsap,
    ScrollTrigger,
    piecesManager,
  };

  console.log('🧩 Pieces theme initialized');
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
    loadComponents();
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
