import Swup from 'swup';
import SwupJsPlugin from '@swup/js-plugin';
import SwupHeadPlugin from '@swup/head-plugin';
import SwupPreloadPlugin from '@swup/preload-plugin';
import SwupBodyClassPlugin from '@swup/body-class-plugin';
import SwupScriptsPlugin from '@swup/scripts-plugin';
import { gsap } from 'gsap';
import { lenisManager } from './LenisManager.js';

/**
 * SwupManager - Page transition management
 * Handles SPA-like page transitions with GSAP animations
 */
class SwupManager {
  constructor() {
    this.swup = null;
    this.isInitialized = false;
    this.pageTransitionDuration = 0.6;
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
      linkSelector: 'a[href^="' + window.location.origin + '"]:not([data-no-swup]), a[href^="/"]:not([data-no-swup]):not([href^="//"]), a[href^="#"]:not([data-no-swup])',
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
      lenisManager.stop();
    });

    // After new content is replaced
    this.swup.hooks.on('content:replace', () => {
      // Scroll to top
      lenisManager.scrollTo(0, { immediate: true });

      // Re-initialize components on new page
      this.reinitializeComponents();
    });

    // After transition is complete
    this.swup.hooks.on('visit:end', () => {
      document.documentElement.classList.remove('is-changing');
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
    const container = document.querySelector('#swup-container');
    const overlay = document.querySelector('.page-transition-overlay');

    const tl = gsap.timeline();

    // Fade out current content
    tl.to(container, {
      opacity: 0,
      y: -20,
      duration: this.pageTransitionDuration * 0.5,
      ease: 'power2.in',
    });

    // Optional: Animate overlay
    if (overlay) {
      tl.to(
        overlay,
        {
          scaleY: 1,
          duration: this.pageTransitionDuration * 0.5,
          ease: 'power2.inOut',
        },
        '<0.2'
      );
    }

    return tl;
  }

  /**
   * Animate page in (enter animation)
   * @returns {Promise}
   */
  async animateIn() {
    const container = document.querySelector('#swup-container');
    const overlay = document.querySelector('.page-transition-overlay');

    // Reset container position
    gsap.set(container, { opacity: 0, y: 20 });

    const tl = gsap.timeline();

    // Hide overlay first if present
    if (overlay) {
      tl.to(overlay, {
        scaleY: 0,
        transformOrigin: 'top',
        duration: this.pageTransitionDuration * 0.4,
        ease: 'power2.inOut',
      });
    }

    // Fade in new content
    tl.to(
      container,
      {
        opacity: 1,
        y: 0,
        duration: this.pageTransitionDuration * 0.6,
        ease: 'power2.out',
      },
      overlay ? '<0.1' : 0
    );

    // Animate reveal elements
    tl.add(() => {
      this.animateRevealElements();
    }, '-=0.3');

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
   */
  navigateTo(url) {
    if (this.swup) {
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
