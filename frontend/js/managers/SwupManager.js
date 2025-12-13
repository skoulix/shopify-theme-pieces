import Swup from 'swup';
import SwupJsPlugin from '@swup/js-plugin';
import SwupHeadPlugin from '@swup/head-plugin';
import SwupPreloadPlugin from '@swup/preload-plugin';
import SwupBodyClassPlugin from '@swup/body-class-plugin';
import SwupScriptsPlugin from '@swup/scripts-plugin';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lenisManager } from './LenisManager.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * SwupManager - Page transition management
 * Handles SPA-like page transitions with GSAP animations
 * Supports View Transition API for enhanced native transitions
 */
class SwupManager {
  constructor() {
    this.swup = null;
    this.isInitialized = false;
    this.pageTransitionDuration = 0.6;
    this.skipAnimation = false; // Flag to skip default animations for custom transitions
    this.transitionStyle = window.themeSettings?.pageTransitionStyle || 'slide';
    // Check for View Transition API support
    this.supportsViewTransitions = typeof document.startViewTransition === 'function';
  }

  /**
   * Check if View Transitions should be used
   * @returns {boolean}
   */
  shouldUseViewTransitions() {
    return this.supportsViewTransitions &&
           window.themeSettings?.enableViewTransitions !== false &&
           !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init() {
    if (this.isInitialized) return this.swup;

    // Disable Swup in Shopify theme customizer - it conflicts with editor navigation
    if (window.Shopify && window.Shopify.designMode) {
      return null;
    }

    // Add global error handler to suppress Shopify protection script errors
    // These occur when SwupScriptsPlugin re-executes Shopify-injected scripts
    // that try to reassign read-only properties (like 'protect')
    window.addEventListener('error', (event) => {
      if (event.message && event.message.includes("Cannot assign to read only property 'protect'")) {
        event.preventDefault();
        return true;
      }
    });

    // Inject View Transition CSS if supported
    if (this.shouldUseViewTransitions()) {
      this.injectViewTransitionStyles();
    }

    // Animation options for the JS plugin
    const animationOptions = [
      {
        from: '(.*)', // From any page
        to: '(.*)', // To any page
        out: async (done) => {
          await this.animateOut();
          done();
        },
        in: async (done) => {
          await this.animateIn();
          done();
        },
      },
    ];

    // Initialize Swup with plugins
    this.swup = new Swup({
      containers: ['#swup-container'],
      cache: true,
      animateHistoryBrowsing: true,
      linkSelector:
        'a[href^="' +
        window.location.origin +
        '"]:not([data-no-swup]), a[href^="/"]:not([data-no-swup]):not([href^="//"]), a[href^="#"]:not([data-no-swup])',
      plugins: [
        new SwupJsPlugin(animationOptions),
        new SwupHeadPlugin({
          persistAssets: true,
          persistTags: 'link[rel="stylesheet"], style, script[src]',
        }),
        new SwupPreloadPlugin({
          preloadVisibleLinks: true,
        }),
        new SwupBodyClassPlugin(),
        new SwupScriptsPlugin({
          head: false,
          body: true,
        }),
      ],
    });

    // Set up event listeners
    this.setupEventListeners();

    this.isInitialized = true;

    return this.swup;
  }

  setupEventListeners() {
    // Before page transition starts
    this.swup.hooks.on('visit:start', (visit) => {
      document.documentElement.classList.add('is-changing');
      document.documentElement.classList.add('scroll-locked');

      lenisManager.stop();

      // Clear cache for cart page to ensure fresh cart data
      if (visit.to.url.includes('/cart')) {
        this.swup.cache.delete(visit.to.url);
      }
    });

    // After new content is replaced
    this.swup.hooks.on('content:replace', () => {
      // Kill old ScrollTriggers before content change
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

      // Re-initialize components on new page
      this.reinitializeComponents();

      // Focus management for accessibility - move focus to main content
      // This helps screen reader and keyboard users after navigation
      const main = document.querySelector('main');
      if (main) {
        // Ensure main is focusable
        main.setAttribute('tabindex', '-1');
        main.focus({ preventScroll: true });

        // Announce page change to screen readers
        this.announcePageChange();
      }

      // Refresh ScrollTrigger and Lenis after DOM updates
      requestAnimationFrame(() => {
        // Recalculate Lenis scroll bounds for new page height
        lenisManager.resize();

        // Refresh ScrollTrigger to recalculate positions
        ScrollTrigger.refresh();
      });
    });

    // After transition is complete
    this.swup.hooks.on('visit:end', () => {
      document.documentElement.classList.remove('is-changing');
      document.documentElement.classList.remove('scroll-locked');
      lenisManager.start();

      // Dispatch event for components that need to initialize after transition completes
      window.dispatchEvent(new CustomEvent('swup:transitionEnd'));
    });

    // Handle page view for analytics
    this.swup.hooks.on('page:view', () => {
      // Dispatch custom event for analytics or other integrations
      window.dispatchEvent(
        new CustomEvent('swup:pageview', {
          detail: { url: window.location.href },
        })
      );
    });
  }

  /**
   * Animate page out (leave animation)
   * @returns {Promise}
   */
  async animateOut() {
    // Skip if custom animation is handling it
    if (this.skipAnimation) {
      return Promise.resolve();
    }

    // If using View Transitions, the browser handles the animation
    if (this.shouldUseViewTransitions() && this._viewTransitionActive) {
      return Promise.resolve();
    }

    const container = document.querySelector('#swup-container');
    const overlay = document.querySelector('.page-transition-overlay');

    const tl = gsap.timeline();

    switch (this.transitionStyle) {
      case 'fade':
        // Simple elegant fade
        tl.to(container, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.inOut',
        });
        break;

      case 'slide':
        // Subtle slide up with fade
        tl.to(container, {
          y: -40,
          opacity: 0,
          duration: 0.25,
          ease: 'power2.in',
        });
        break;

      case 'curtain':
      default:
        // Curtain wipe from bottom with subtle slide up
        if (overlay) {
          gsap.set(overlay, { transformOrigin: 'bottom', scaleY: 0 });
          tl.to(overlay, {
            scaleY: 1,
            duration: 0.4,
            ease: 'power3.inOut',
          });
        }
        tl.to(
          container,
          {
            y: -40,
            opacity: 0,
            duration: 0.25,
            ease: 'power2.in',
          },
          0.1
        );
        break;
    }

    return tl;
  }

  /**
   * Animate page in (enter animation)
   * @returns {Promise}
   */
  async animateIn() {
    // Scroll to top immediately before reveal animation starts
    // This happens after animateOut completes, so user won't see the jump
    lenisManager.scrollTo(0, { immediate: true });

    const container = document.querySelector('#swup-container');
    const overlay = document.querySelector('.page-transition-overlay');

    // Skip if custom animation is handling it
    if (this.skipAnimation) {
      // Reset skipAnimation flag for next navigation
      this.skipAnimation = false;
      // Just ensure container is visible
      gsap.set(container, { opacity: 1, y: 0, x: 0 });
      if (overlay) gsap.set(overlay, { scaleY: 0, scaleX: 0 });
      return Promise.resolve();
    }

    const tl = gsap.timeline();

    switch (this.transitionStyle) {
      case 'fade':
        // Simple elegant fade in
        gsap.set(container, { opacity: 0, x: 0, y: 0 });
        tl.to(container, {
          opacity: 1,
          duration: 0.4,
          ease: 'power2.inOut',
        });
        tl.add(() => {
          this.animateRevealElements();
        }, 0.1);
        break;

      case 'slide':
        // Subtle slide down with fade (complement to slide up out)
        gsap.set(container, { opacity: 0, y: 40, x: 0 });
        tl.to(container, {
          y: 0,
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
        tl.add(() => {
          this.animateRevealElements();
        }, 0.1);
        break;

      case 'curtain':
      default:
        // Curtain slides up to reveal new page with subtle slide down
        gsap.set(container, { opacity: 0, x: 0, y: 40 });
        if (overlay) {
          gsap.set(overlay, { transformOrigin: 'top', scaleY: 1 });
          tl.to(overlay, {
            scaleY: 0,
            duration: 0.5,
            ease: 'power3.inOut',
          });
        }
        tl.to(
          container,
          {
            y: 0,
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
          },
          0.2
        );
        tl.add(() => {
          this.animateRevealElements();
        }, 0.3);
        break;
    }

    return tl;
  }

  /**
   * Animate elements with data-reveal attribute
   */
  animateRevealElements() {
    const reveals = document.querySelectorAll('[data-reveal]');

    reveals.forEach((el, index) => {
      const delay = el.dataset.revealDelay || index * 0.1;
      const type = el.dataset.reveal || 'fade-up';

      gsap.to(el, {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.8,
        delay: delay,
        ease: 'power2.out',
      });
    });
  }

  /**
   * Announce page change to screen readers via live region
   */
  announcePageChange() {
    // Get or create live region for announcements
    let liveRegion = document.getElementById('swup-announce');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'swup-announce';
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }

    // Announce the new page title
    const pageTitle = document.title || 'Page loaded';
    liveRegion.textContent = '';
    // Use setTimeout to ensure screen readers detect the change
    setTimeout(() => {
      liveRegion.textContent = pageTitle;
    }, 100);
  }

  /**
   * Re-initialize piecesjs components after page transition
   */
  reinitializeComponents() {
    // Dispatch event for piecesjs to reload components
    window.dispatchEvent(new CustomEvent('swup:contentReplaced'));

    // Re-initialize Shopify features
    if (window.Shopify && window.Shopify.PaymentButton) {
      window.Shopify.PaymentButton.init();
    }

    // Reinitialize any Dawn components
    document.querySelectorAll('details-disclosure, details-modal').forEach((el) => {
      if (el.connectedCallback) {
        el.connectedCallback();
      }
    });
  }

  /**
   * Navigate to a URL programmatically
   * @param {string} url - URL to navigate to
   * @param {boolean} skipAnimation - If true, skips default Swup animations (for custom transitions)
   */
  navigateTo(url, skipAnimation = false) {
    if (this.swup) {
      this.skipAnimation = skipAnimation;
      this.swup.navigate(url);
    } else {
      window.location.href = url;
    }
  }

  /**
   * Update URL without triggering page navigation
   * Useful for modal/overlay states that should be shareable
   * @param {string} url - URL to show in address bar
   * @param {boolean} replace - If true, replaces current history entry instead of pushing
   */
  updateUrl(url, replace = false) {
    if (replace) {
      window.history.replaceState({ swupPreview: true }, '', url);
    } else {
      window.history.pushState({ swupPreview: true }, '', url);
    }
  }

  /**
   * Go back in history (restore previous URL)
   */
  goBack() {
    window.history.back();
  }

  /**
   * Clear cached pages that may have stale data
   * @param {string|string[]} patterns - URL patterns to clear (e.g., '/cart', '/account')
   */
  clearCache(patterns) {
    if (!this.swup || !this.swup.cache) return;

    const patternsArray = Array.isArray(patterns) ? patterns : [patterns];

    // Get all cached URLs
    this.swup.cache.all.forEach((page, url) => {
      if (patternsArray.some(pattern => url.includes(pattern))) {
        this.swup.cache.delete(url);
      }
    });
  }

  /**
   * Clear all cached pages
   */
  clearAllCache() {
    if (this.swup && this.swup.cache) {
      this.swup.cache.clear();
    }
  }

  /**
   * Inject View Transition API CSS styles
   * These styles enable smooth cross-fade transitions using native browser APIs
   */
  injectViewTransitionStyles() {
    if (document.getElementById('view-transition-styles')) return;

    const style = document.createElement('style');
    style.id = 'view-transition-styles';
    style.textContent = `
      /* View Transition API styles */
      @view-transition {
        navigation: auto;
      }

      /* Root transition - fade */
      ::view-transition-old(root) {
        animation: 0.3s ease-out both fade-out;
      }

      ::view-transition-new(root) {
        animation: 0.3s ease-out both fade-in;
      }

      /* Product card transitions - morph effect */
      .product-card {
        view-transition-name: var(--view-transition-name);
      }

      ::view-transition-old(product-card),
      ::view-transition-new(product-card) {
        animation-duration: 0.4s;
      }

      /* Header stays in place during transition */
      [data-header-wrapper] {
        view-transition-name: header;
      }

      ::view-transition-old(header),
      ::view-transition-new(header) {
        animation: none;
        mix-blend-mode: normal;
      }

      /* Animation keyframes */
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      @keyframes slide-in {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slide-out {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-20px);
        }
      }

      /* Respect reduced motion */
      @media (prefers-reduced-motion: reduce) {
        ::view-transition-group(*),
        ::view-transition-old(*),
        ::view-transition-new(*) {
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Start a View Transition for page navigation
   * @param {Function} updateCallback - Function that updates the DOM
   * @returns {ViewTransition|null}
   */
  async startViewTransition(updateCallback) {
    if (!this.shouldUseViewTransitions()) {
      await updateCallback();
      return null;
    }

    this._viewTransitionActive = true;

    try {
      const transition = document.startViewTransition(async () => {
        await updateCallback();
      });

      await transition.finished;
    } catch (e) {
      // Fallback if View Transition fails
      await updateCallback();
    } finally {
      this._viewTransitionActive = false;
    }
  }

  /**
   * Destroy Swup instance
   */
  destroy() {
    if (this.swup) {
      this.swup.destroy();
      this.swup = null;
      this.isInitialized = false;
    }
  }
}

// Singleton export
export const swupManager = new SwupManager();
export default swupManager;
