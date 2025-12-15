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
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

// Import styles
import '../css/app.css';

// Import managers
import { lenisManager } from './managers/LenisManager.js';
import { swupManager } from './managers/SwupManager.js';
import { tweenManager } from './managers/TweenManager.js';
import { cartState } from './managers/CartState.js';
import { cartDrawerManager } from './managers/CartDrawerManager.js';
import { cartPageManager } from './managers/CartPageManager.js';
import './managers/FacetsManager.js'; // Self-registering custom element

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, Flip, SplitText);

// Expose globally for section scripts
window.gsap = gsap;
window.Flip = Flip;
window.SplitText = SplitText;
window.Lenis = Lenis;

/**
 * Initialize all reveal animations
 */
function initAnimations() {
  // Initialize global tween system (handles data-tween, data-tween-type, data-tween-group)
  tweenManager.init();
}

/**
 * Initialize article progress bar
 * Handles scroll progress indicator on article pages
 * Progress bar lives in theme.liquid (outside swup) and is shown/hidden based on article presence
 */
function initArticleProgressBar() {
  // Cleanup any previous instance first
  if (window._articleProgressCleanup) {
    window._articleProgressCleanup();
    window._articleProgressCleanup = null;
  }

  // Progress bar is in theme.liquid, use IDs
  const progressContainer = document.getElementById('article-progress');
  const progressBar = document.getElementById('article-progress-bar');
  const wrapper = document.querySelector('[data-article-wrapper]');

  // If no progress bar element, exit
  if (!progressContainer || !progressBar) {
    return;
  }

  // If no article on page, hide progress bar and exit
  if (!wrapper) {
    progressContainer.style.display = 'none';
    progressBar.style.width = '0%';
    return;
  }

  // Show progress bar and reset width
  progressContainer.style.display = 'block';
  progressBar.style.width = '0%';

  // Track if we've cleaned up
  let isDestroyed = false;

  // Get current scroll position (Lenis or native)
  function getScrollY() {
    if (window.pieces && window.pieces.lenis && window.pieces.lenis.lenis) {
      return window.pieces.lenis.lenis.scroll;
    }
    return window.scrollY;
  }

  function updateProgress() {
    if (isDestroyed) return;

    const scrollY = getScrollY();
    const wrapperRect = wrapper.getBoundingClientRect();
    const wrapperTop = scrollY + wrapperRect.top;
    const wrapperHeight = wrapper.offsetHeight;
    const windowHeight = window.innerHeight;

    // Calculate progress based on article content
    const start = wrapperTop;
    const end = wrapperTop + wrapperHeight - windowHeight;
    const current = scrollY;

    let progress = 0;
    if (current >= start && current <= end) {
      progress = ((current - start) / (end - start)) * 100;
    } else if (current > end) {
      progress = 100;
    }

    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }

  // Track Lenis scroll handler for cleanup
  let lenisScrollHandler = null;

  // Attach to Lenis scroll event
  function attachToLenis() {
    if (window.pieces && window.pieces.lenis && window.pieces.lenis.lenis) {
      const lenis = window.pieces.lenis.lenis;
      lenisScrollHandler = () => updateProgress();
      lenis.on('scroll', lenisScrollHandler);
      return true;
    }
    return false;
  }

  // Try to attach to Lenis immediately
  if (!attachToLenis()) {
    // Lenis not ready yet, poll for it
    let attempts = 0;
    const maxAttempts = 50;

    function tryAttachLenis() {
      if (isDestroyed) return;

      if (attachToLenis()) {
        updateProgress(); // Update once attached
        return;
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(tryAttachLenis, 100);
      }
    }

    tryAttachLenis();
  }

  // Also listen to native scroll as a fallback (some browsers/situations)
  let ticking = false;
  function onNativeScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onNativeScroll, { passive: true });

  updateProgress(); // Initial update

  // Cleanup function for navigation
  function cleanup() {
    isDestroyed = true;
    window.removeEventListener('scroll', onNativeScroll);

    // Remove Lenis listener if attached
    if (lenisScrollHandler && window.pieces && window.pieces.lenis && window.pieces.lenis.lenis) {
      window.pieces.lenis.lenis.off('scroll', lenisScrollHandler);
    }

    // Hide progress bar and reset
    if (progressContainer) progressContainer.style.display = 'none';
    if (progressBar) progressBar.style.width = '0%';
  }

  // Store cleanup function
  window._articleProgressCleanup = cleanup;
}

/**
 * Handle Swup content replacement
 * Re-initialize animations after page transition
 */
function handleContentReplaced() {
  // Wait for fonts then reinitialize
  const reinit = () => {
    requestAnimationFrame(() => {
      // Only run animations if enabled
      if (typeof window.shouldAnimate === 'function' && window.shouldAnimate()) {
        tweenManager.reinit();
        initAnimations();
        ScrollTrigger.refresh();
      }
      cartDrawerManager.reinit();
      cartPageManager.reinit();
    });
  };

  // Wait for fonts to be ready before reinitializing
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(reinit);
  } else {
    reinit();
  }
}

/**
 * Handle Swup transition end
 * Initialize components that need the page to be fully visible
 */
function handleTransitionEnd() {
  // Use setTimeout to ensure DOM is fully settled and Lenis is running
  setTimeout(() => {
    initArticleProgressBar();
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

    // Listen for transition end (after animations complete)
    window.addEventListener('swup:transitionEnd', handleTransitionEnd);
  }

  // Check theme setting for animations
  const animationsEnabled = window.themeSettings?.enableAnimations !== false;

  // Initialize animations (respect user preference and theme setting)
  if (!prefersReducedMotion && animationsEnabled) {
    // Wait for fonts to load before initializing animations (prevents SplitText measurement issues)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        requestAnimationFrame(() => {
          initAnimations();
          ScrollTrigger.refresh();
        });
      });
    } else {
      // Fallback for browsers without FontFaceSet API
      requestAnimationFrame(() => {
        initAnimations();
      });
    }
  }

  // Initialize article progress bar (works on any page, only activates on articles)
  requestAnimationFrame(() => {
    initArticleProgressBar();
  });

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

  // Handle cart:refresh events from inline scripts (shop-the-look, shoppable-videos)
  // These scripts can't import CartState so they dispatch this event after adding to cart
  document.addEventListener('cart:refresh', () => {
    cartState.fetch();
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
    tween: tweenManager,
    cartState: cartState,
    cartDrawer: cartDrawerManager,
    cartPage: cartPageManager,
    gsap,
    ScrollTrigger,
    Flip,
    SplitText,
    Lenis,
  };

  // Expose cart functions globally for compatibility
  window.openCartDrawer = () => cartDrawerManager.open();
  window.closeCartDrawer = () => cartDrawerManager.close();
  window.refreshCartDrawer = () => cartDrawerManager.refresh();
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
    if (typeof window.shouldAnimate === 'function' && window.shouldAnimate()) {
      tweenManager.reinit();
      initAnimations();
    }
  });

  document.addEventListener('shopify:section:unload', () => {
    tweenManager.destroy();
  });

  document.addEventListener('shopify:section:reorder', () => {
    if (typeof window.shouldAnimate === 'function' && window.shouldAnimate()) {
      tweenManager.refresh();
    }
  });
}
