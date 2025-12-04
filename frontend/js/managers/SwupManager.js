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
 */
class SwupManager {
  constructor() {
    this.swup = null;
    this.isInitialized = false;
    this.pageTransitionDuration = 0.6;
    this.skipAnimation = false; // Flag to skip default animations for custom transitions
  }

  init() {
    if (this.isInitialized) return this.swup;

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
    this.swup.hooks.on('visit:start', () => {
      document.documentElement.classList.add('is-changing');

      // Lock scroll and compensate for scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.setProperty('--scrollbar-width', scrollbarWidth + 'px');
      document.documentElement.classList.add('scroll-locked');

      lenisManager.stop();
    });

    // After new content is replaced
    this.swup.hooks.on('content:replace', () => {
      // Kill old ScrollTriggers before content change
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());

      // Scroll to top
      lenisManager.scrollTo(0, { immediate: true });

      // Re-initialize components on new page
      this.reinitializeComponents();

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
      document.body.style.removeProperty('--scrollbar-width');
      lenisManager.start();
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

    const container = document.querySelector('#swup-container');
    const overlay = document.querySelector('.page-transition-overlay');

    const tl = gsap.timeline();

    // Dramatic curtain wipe from bottom
    if (overlay) {
      // Reset overlay to bottom origin
      gsap.set(overlay, { transformOrigin: 'bottom', scaleY: 0 });

      // Curtain slides up to cover the page
      tl.to(overlay, {
        scaleY: 1,
        duration: 0.6,
        ease: 'power3.inOut',
      });
    }

    // Fade out content as curtain covers
    tl.to(
      container,
      {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      },
      0.3
    );

    return tl;
  }

  /**
   * Animate page in (enter animation)
   * @returns {Promise}
   */
  async animateIn() {
    const container = document.querySelector('#swup-container');
    const overlay = document.querySelector('.page-transition-overlay');

    // Skip if custom animation is handling it
    if (this.skipAnimation) {
      // Reset skipAnimation flag for next navigation
      this.skipAnimation = false;
      // Just ensure container is visible
      gsap.set(container, { opacity: 1, y: 0 });
      if (overlay) gsap.set(overlay, { scaleY: 0 });
      return Promise.resolve();
    }

    // Ensure container is ready but hidden
    gsap.set(container, { opacity: 1, y: 0 });

    const tl = gsap.timeline();

    // Curtain slides up to reveal new page
    if (overlay) {
      gsap.set(overlay, { transformOrigin: 'top', scaleY: 1 });

      tl.to(overlay, {
        scaleY: 0,
        duration: 0.6,
        ease: 'power3.inOut',
      });
    }

    // Animate reveal elements after curtain starts moving
    tl.add(() => {
      this.animateRevealElements();
    }, 0.2);

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
