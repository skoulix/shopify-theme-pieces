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

// Import styles
import '../css/app.css';

// Import managers
import { lenisManager } from './managers/LenisManager.js';
import { swupManager } from './managers/SwupManager.js';
import { animationManager } from './managers/AnimationManager.js';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

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
  };

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
