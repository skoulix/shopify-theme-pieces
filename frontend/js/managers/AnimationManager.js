import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * AnimationManager - GSAP animation utilities
 * Provides reusable animation methods for reveal effects, parallax, and more
 */
class AnimationManager {
  constructor() {
    this.animations = [];
    this.scrollTriggers = [];
    this.introObserver = null;
  }

  /**
   * Initialize scroll-triggered reveal animations
   * Call this after page load and after Swup content replace
   */
  initRevealAnimations() {
    // Kill existing ScrollTriggers to prevent duplicates
    this.killScrollTriggers();

    const reveals = document.querySelectorAll('[data-reveal]');

    reveals.forEach((el) => {
      const type = el.dataset.reveal || 'fade-up';
      const delay = parseFloat(el.dataset.revealDelay) || 0;
      const duration = parseFloat(el.dataset.revealDuration) || 0.8;
      const start = el.dataset.revealStart || 'top 85%';

      // Set initial state
      const initialState = this.getInitialState(type);
      gsap.set(el, initialState);

      // Create scroll-triggered animation
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: start,
        once: true,
        onEnter: () => {
          gsap.to(el, {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            clipPath: 'inset(0 0% 0 0)',
            duration: duration,
            delay: delay,
            ease: 'power2.out',
          });
        },
      });

      this.scrollTriggers.push(trigger);
    });
  }

  /**
   * Get initial animation state based on reveal type
   * @param {string} type - Reveal animation type
   * @returns {Object} - GSAP properties
   */
  getInitialState(type) {
    const states = {
      fade: { opacity: 0 },
      'fade-up': { opacity: 0, y: 40 },
      'fade-down': { opacity: 0, y: -40 },
      'fade-left': { opacity: 0, x: 40 },
      'fade-right': { opacity: 0, x: -40 },
      scale: { opacity: 0, scale: 0.9 },
      clip: { clipPath: 'inset(0 100% 0 0)' },
      'clip-up': { clipPath: 'inset(100% 0 0 0)' },
    };

    return states[type] || states.fade;
  }

  /**
   * Initialize stagger animations for lists
   */
  initStaggerAnimations() {
    const staggerContainers = document.querySelectorAll('[data-stagger]');

    staggerContainers.forEach((container) => {
      const children = container.children;
      const staggerDelay = parseFloat(container.dataset.stagger) || 0.1;
      const start = container.dataset.staggerStart || 'top 85%';

      // Set initial state
      gsap.set(children, { opacity: 0, y: 20 });

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: start,
        once: true,
        onEnter: () => {
          gsap.to(children, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: staggerDelay,
            ease: 'power2.out',
          });
        },
      });

      this.scrollTriggers.push(trigger);
    });
  }

  /**
   * Initialize parallax effects
   */
  initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');

    parallaxElements.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.5;

      const trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const yPos = self.progress * 100 * speed - 50 * speed;
          gsap.set(el, { y: yPos });
        },
      });

      this.scrollTriggers.push(trigger);
    });
  }

  /**
   * Initialize image reveal animations
   */
  initImageReveals() {
    const imageContainers = document.querySelectorAll('[data-image-reveal]');

    imageContainers.forEach((container) => {
      const img = container.querySelector('img');
      if (!img) return;

      gsap.set(img, { scale: 1.2, opacity: 0 });

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(img, {
            scale: 1,
            opacity: 1,
            duration: 1.2,
            ease: 'power2.out',
          });
        },
      });

      this.scrollTriggers.push(trigger);
    });
  }

  /**
   * Initialize global intro animations for elements with [data-intro]
   * Uses Intersection Observer for scroll-triggered animations
   * Respects theme setting for enable_scroll_animations
   */
  initIntroAnimations() {
    // Check if scroll animations are enabled
    const scrollAnimationsEnabled = window.themeSettings?.enableScrollAnimations !== false;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If disabled, immediately show all elements
    if (!scrollAnimationsEnabled || prefersReducedMotion) {
      document.querySelectorAll('[data-intro]').forEach((el) => {
        el.classList.add('intro-visible');
      });
      return;
    }

    // Kill existing observer
    if (this.introObserver) {
      this.introObserver.disconnect();
      this.introObserver = null;
    }

    // Track animation queue for sequential staggering
    let animationQueue = [];
    let isAnimating = false;
    const staggerDelay = 80; // ms between each element animation

    const processQueue = () => {
      if (animationQueue.length === 0) {
        isAnimating = false;
        return;
      }

      isAnimating = true;
      const el = animationQueue.shift();

      // Add the visible class to trigger animation
      el.classList.add('intro-visible');

      // Process next element after stagger delay
      setTimeout(processQueue, staggerDelay);
    };

    // Create Intersection Observer
    this.introObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;

            // Unobserve immediately to prevent re-triggering
            this.introObserver.unobserve(el);

            // Add to queue
            animationQueue.push(el);

            // Start processing if not already animating
            if (!isAnimating) {
              processQueue();
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -10% 0px', // Trigger slightly before element is fully visible
        threshold: 0.1,
      }
    );

    // Observe all intro elements
    document.querySelectorAll('[data-intro]:not(.intro-visible)').forEach((el) => {
      this.introObserver.observe(el);
    });
  }

  /**
   * Animate a page header subtitle with line draw effect
   * @param {GSAPTimeline} tl - GSAP timeline to add animations to
   * @param {HTMLElement} container - Container element with data attributes
   * @param {number} startTime - Position in timeline to start (default: 0.4)
   */
  animateHeaderSubtitle(tl, container, startTime = 0.4) {
    const subtitleLine = container.querySelector('[data-subtitle-line]');
    const subtitleText = container.querySelector('[data-subtitle-text]');

    // Set initial states
    if (subtitleLine) {
      gsap.set(subtitleLine, { scaleX: 0 });
    }
    if (subtitleText) {
      gsap.set(subtitleText, { yPercent: 100 });
    }

    // Animate line draw
    if (subtitleLine) {
      tl.to(subtitleLine, {
        scaleX: 1,
        duration: 0.8,
        ease: 'power3.out'
      }, startTime);
    }

    // Animate text reveal
    if (subtitleText) {
      tl.to(subtitleText, {
        yPercent: 0,
        duration: 0.8,
        ease: 'power4.out'
      }, startTime + 0.2);
    }
  }

  /**
   * Create a hero entrance animation
   * @param {HTMLElement} container - Hero container element
   * @returns {GSAPTimeline}
   */
  createHeroAnimation(container) {
    const tl = gsap.timeline();

    const title = container.querySelector('[data-hero-title]');
    const subtitle = container.querySelector('[data-hero-subtitle]');
    const cta = container.querySelector('[data-hero-cta]');
    const image = container.querySelector('[data-hero-image]');

    if (image) {
      tl.from(image, {
        scale: 1.1,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out',
      });
    }

    if (title) {
      tl.from(
        title,
        {
          y: 60,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
        },
        '-=0.8'
      );
    }

    if (subtitle) {
      tl.from(
        subtitle,
        {
          y: 40,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
        },
        '-=0.5'
      );
    }

    if (cta) {
      tl.from(
        cta,
        {
          y: 20,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
        },
        '-=0.3'
      );
    }

    this.animations.push(tl);
    return tl;
  }

  /**
   * Kill all scroll triggers
   */
  killScrollTriggers() {
    this.scrollTriggers.forEach((trigger) => trigger.kill());
    this.scrollTriggers = [];
  }

  /**
   * Kill all animations
   */
  killAnimations() {
    this.animations.forEach((anim) => anim.kill());
    this.animations = [];
  }

  /**
   * Refresh all ScrollTriggers (call after DOM changes)
   */
  refresh() {
    ScrollTrigger.refresh();
  }

  /**
   * Clean up all animations and triggers
   */
  destroy() {
    this.killScrollTriggers();
    this.killAnimations();
    if (this.introObserver) {
      this.introObserver.disconnect();
      this.introObserver = null;
    }
  }
}

// Singleton export
export const animationManager = new AnimationManager();
export default animationManager;
