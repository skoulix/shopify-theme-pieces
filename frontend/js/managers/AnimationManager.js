import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

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
   * Get ScrollTrigger start value based on theme animation trigger offset
   * @param {string} defaultStart - Default start value if offset is 'none'
   * @returns {string} - ScrollTrigger start value
   */
  getScrollTriggerStart(defaultStart = 'top 85%') {
    const offset = window.themeSettings?.animationTriggerOffset || 'md';
    // Map offset to viewport percentage (higher % = triggers earlier)
    const startValues = {
      none: defaultStart,           // Use default (usually 'top 85%')
      sm: 'top 95%',                // Trigger when top hits 95% down viewport
      md: 'top bottom+=150',        // Trigger 150px before element enters
      lg: 'top bottom+=300',        // Trigger 300px before element enters
    };
    return startValues[offset] || startValues.md;
  }

  /**
   * Initialize scroll-triggered reveal animations
   * Call this after page load and after Swup content replace
   */
  initRevealAnimations() {
    // Kill existing ScrollTriggers to prevent duplicates
    this.killScrollTriggers();

    const reveals = document.querySelectorAll('[data-reveal]');
    const defaultStart = this.getScrollTriggerStart();

    reveals.forEach((el) => {
      const type = el.dataset.reveal || 'fade-up';
      const delay = parseFloat(el.dataset.revealDelay) || 0;
      const duration = parseFloat(el.dataset.revealDuration) || 0.8;
      const start = el.dataset.revealStart || defaultStart;

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
    const defaultStart = this.getScrollTriggerStart();

    staggerContainers.forEach((container) => {
      const children = container.children;
      const staggerDelay = parseFloat(container.dataset.stagger) || 0.1;
      const start = container.dataset.staggerStart || defaultStart;

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
    const defaultStart = this.getScrollTriggerStart();

    imageContainers.forEach((container) => {
      const img = container.querySelector('img');
      if (!img) return;

      gsap.set(img, { scale: 1.2, opacity: 0 });

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: defaultStart,
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
   * Get rootMargin based on theme setting for animation trigger offset
   * Positive bottom margin = trigger earlier (before element enters viewport)
   * @returns {string} - CSS rootMargin value
   */
  getAnimationRootMargin() {
    const offset = window.themeSettings?.animationTriggerOffset || 'md';
    const margins = {
      none: '0px 0px 0px 0px',      // Trigger when element enters viewport
      sm: '0px 0px 50px 0px',       // Trigger 50px before entering
      md: '0px 0px 150px 0px',      // Trigger 150px before entering (recommended)
      lg: '0px 0px 300px 0px',      // Trigger 300px before entering
    };
    return margins[offset] || margins.md;
  }

  /**
   * Initialize global intro animations for elements with [data-intro]
   * Uses Intersection Observer for scroll-triggered animations
   * Respects theme setting for enable_animations
   */
  initIntroAnimations() {
    const introElements = document.querySelectorAll('[data-intro]:not(.intro-visible)');

    // If disabled, immediately show all elements
    if (typeof window.shouldAnimate === 'function' && !window.shouldAnimate()) {
      introElements.forEach((el) => {
        el.classList.add('intro-visible');
      });
      return;
    }

    // Fallback for browsers without Intersection Observer support
    if (!('IntersectionObserver' in window)) {
      introElements.forEach((el) => {
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
    const staggerDelay = 100; // ms between each element animation

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

    // Get rootMargin from theme settings
    const rootMargin = this.getAnimationRootMargin();

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
        rootMargin: rootMargin,
        threshold: 0.01, // Trigger as soon as any part is visible within the margin
      }
    );

    // Helper to check if element is already in viewport (accounting for rootMargin)
    const isInViewport = (el) => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      // Parse bottom margin from rootMargin (e.g., "0px 0px 150px 0px" -> 150)
      const bottomMargin = parseInt(rootMargin.split(' ')[2]) || 0;
      // Element is "in viewport" if it's within the extended trigger zone
      return rect.top < windowHeight + bottomMargin && rect.bottom > 0;
    };

    // Observe all intro elements
    introElements.forEach((el) => {
      // For elements already in viewport, add directly to queue
      // This handles dynamically added elements that won't trigger intersection
      if (isInViewport(el)) {
        animationQueue.push(el);
        if (!isAnimating) {
          processQueue();
        }
      } else {
        // For elements not yet visible, use observer
        this.introObserver.observe(el);
      }
    });
  }

  /**
   * Split text into lines and animate with reveal effect
   * @param {HTMLElement} element - The text element to split and animate
   * @param {Object} options - Animation options
   * @param {GSAPTimeline} options.timeline - Optional timeline to add animation to
   * @param {number} options.duration - Animation duration (default: 1.2)
   * @param {number} options.stagger - Stagger delay between lines (default: 0.1)
   * @param {string} options.ease - Easing function (default: 'power4.out')
   * @param {number} options.delay - Initial delay (default: 0)
   * @param {string} options.lineClass - CSS class for split lines (default: 'split-line')
   * @returns {Object} - { split: SplitText instance, animation: GSAP animation }
   */
  splitTextReveal(element, options = {}) {
    if (!element) return null;

    const {
      timeline = null,
      duration = 1.2,
      stagger = 0.1,
      ease = 'power4.out',
      delay = 0,
      lineClass = 'split-line'
    } = options;

    // Create SplitText instance
    const split = new SplitText(element, {
      type: 'lines',
      linesClass: lineClass
    });

    // Wrap each line in an overflow-hidden container for the reveal effect
    split.lines.forEach((line, index) => {
      const wrapper = document.createElement('div');
      wrapper.style.overflow = 'hidden';
      wrapper.style.display = 'block';
      // Apply staggered margin for visual interest (optional, based on nth-child CSS)
      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
    });

    // Set initial state
    gsap.set(split.lines, { yPercent: 100 });

    // Create animation
    const animationConfig = {
      yPercent: 0,
      duration,
      ease,
      stagger
    };

    let animation;
    if (timeline) {
      animation = timeline.to(split.lines, animationConfig, delay);
    } else {
      animationConfig.delay = delay;
      animation = gsap.to(split.lines, animationConfig);
    }

    return { split, animation };
  }

  /**
   * Initialize all elements with [data-split-text] attribute
   * Call this after page load and after Swup content replace
   */
  initSplitTextAnimations() {
    const elements = document.querySelectorAll('[data-split-text]:not([data-split-initialized])');
    const defaultStart = this.getScrollTriggerStart();

    elements.forEach((el) => {
      const lineClass = el.dataset.splitLineClass || 'split-line';
      const duration = parseFloat(el.dataset.splitDuration) || 1.2;
      const stagger = parseFloat(el.dataset.splitStagger) || 0.1;
      const delay = parseFloat(el.dataset.splitDelay) || 0;
      const scrollTrigger = el.dataset.splitScrollTrigger !== 'false';

      // Mark as initialized
      el.dataset.splitInitialized = 'true';

      if (scrollTrigger) {
        // Use ScrollTrigger for scroll-based animation
        const trigger = ScrollTrigger.create({
          trigger: el,
          start: defaultStart,
          once: true,
          onEnter: () => {
            this.splitTextReveal(el, { duration, stagger, delay, lineClass });
          }
        });
        this.scrollTriggers.push(trigger);
      } else {
        // Animate immediately
        this.splitTextReveal(el, { duration, stagger, delay, lineClass });
      }
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
