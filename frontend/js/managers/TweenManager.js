import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * TweenManager - Global declarative animation system
 *
 * Usage:
 * Add data-tween to any element to opt it into the animation system.
 * Use data-tween-type to specify the animation type.
 * Elements within the same data-tween-group will animate in sequence.
 *
 * Attributes:
 * - data-tween: Marks element for animation (required)
 * - data-tween-type: Animation type (default: "fade-up")
 *   - "fade-up": Fade in from below
 *   - "fade-down": Fade in from above
 *   - "fade-left": Fade in from right
 *   - "fade-right": Fade in from left
 *   - "fade": Simple fade in
 *   - "split-text": Split text into lines with reveal effect
 *   - "clip-right": Clip-path reveal from left to right
 *   - "clip-up": Clip-path reveal from bottom to top
 *   - "scale": Scale up with fade
 * - data-tween-group: Group ID for sequenced animations (elements in same group animate together)
 * - data-tween-delay: Additional delay in seconds (default: 0)
 * - data-tween-duration: Animation duration in seconds (default varies by type)
 * - data-tween-stagger: Stagger delay for grouped elements (default: 0.15)
 * - data-tween-ease: GSAP easing (default varies by type)
 * - data-tween-start: ScrollTrigger start position (default: from theme settings)
 *
 * Example:
 * <div data-tween-group="hero">
 *   <span data-tween data-tween-type="fade-up">Label</span>
 *   <h1 data-tween data-tween-type="split-text">Big Title Here</h1>
 *   <p data-tween data-tween-type="fade-up">Description text</p>
 *   <div data-tween data-tween-type="clip-right">
 *     <img src="..." />
 *   </div>
 * </div>
 */
class TweenManager {
  constructor() {
    this.scrollTriggers = [];
    this.splitInstances = [];
    this.initialized = false;
  }

  /**
   * Get ScrollTrigger start value based on theme settings
   */
  getScrollStart(defaultStart = 'top 80%') {
    if (typeof window.getScrollStart === 'function') {
      return window.getScrollStart(defaultStart);
    }
    const offset = window.themeSettings?.animationTriggerOffset || 'md';
    const startValues = {
      none: defaultStart,
      sm: 'top 90%',
      md: 'top 80%',
      lg: 'top 70%',
    };
    return startValues[offset] || startValues.md;
  }

  /**
   * Check if animations should run
   */
  shouldAnimate() {
    if (typeof window.shouldAnimate === 'function') {
      return window.shouldAnimate();
    }
    // Fallback checks
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animationsEnabled = window.themeSettings?.enableAnimations !== false;
    return !prefersReducedMotion && animationsEnabled;
  }

  /**
   * Get animation configuration for a given type
   */
  getAnimationConfig(type) {
    const configs = {
      'fade': {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        duration: 0.6,
        ease: 'power2.out'
      },
      'fade-up': {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        duration: 0.6,
        ease: 'power2.out'
      },
      'fade-down': {
        initial: { opacity: 0, y: -30 },
        animate: { opacity: 1, y: 0 },
        duration: 0.6,
        ease: 'power2.out'
      },
      'fade-left': {
        initial: { opacity: 0, x: 30 },
        animate: { opacity: 1, x: 0 },
        duration: 0.6,
        ease: 'power2.out'
      },
      'fade-right': {
        initial: { opacity: 0, x: -30 },
        animate: { opacity: 1, x: 0 },
        duration: 0.6,
        ease: 'power2.out'
      },
      'split-text': {
        // Handled specially
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.05
      },
      'clip-right': {
        initial: { clipPath: 'inset(0 100% 0 0)' },
        animate: { clipPath: 'inset(0 0% 0 0)' },
        duration: 1.6,
        ease: 'expo.inOut'
      },
      'clip-up': {
        initial: { clipPath: 'inset(100% 0 0 0)' },
        animate: { clipPath: 'inset(0% 0 0 0)' },
        duration: 1.2,
        ease: 'power3.out'
      },
      'clip-down': {
        initial: { clipPath: 'inset(0 0 100% 0)' },
        animate: { clipPath: 'inset(0 0 0% 0)' },
        duration: 1.2,
        ease: 'power3.out'
      },
      'scale': {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        duration: 0.8,
        ease: 'power2.out'
      },
      'scale-up': {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        duration: 0.8,
        ease: 'back.out(1.7)'
      },
      'scale-x': {
        initial: { scaleX: 0, transformOrigin: 'left center' },
        animate: { scaleX: 1 },
        duration: 0.8,
        ease: 'power3.out'
      },
      'text-reveal': {
        initial: { yPercent: 120 },
        animate: { yPercent: 0 },
        duration: 0.8,
        ease: 'power4.out'
      }
    };
    return configs[type] || configs['fade-up'];
  }

  /**
   * Initialize split text animation for an element
   */
  initSplitText(element, timeline, position) {
    const duration = parseFloat(element.dataset.tweenDuration) || 1.2;
    const stagger = parseFloat(element.dataset.tweenStagger) || 0.05;
    const ease = element.dataset.tweenEase || 'power4.out';

    // Create SplitText instance
    const split = new SplitText(element, {
      type: 'lines',
      linesClass: 'tween-split-line'
    });

    // Wrap each line for overflow hidden
    split.lines.forEach(line => {
      const wrapper = document.createElement('div');
      wrapper.style.overflow = 'hidden';
      wrapper.style.display = 'block';
      wrapper.style.paddingBottom = '0.25em';
      wrapper.style.marginBottom = '-0.25em';
      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
    });

    // Set initial state
    gsap.set(split.lines, { yPercent: 120 });

    // Add to timeline - first make element visible, then animate lines
    timeline.add(() => { element.style.opacity = '1'; }, position);
    timeline.to(split.lines, {
      yPercent: 0,
      duration,
      ease,
      stagger
    }, position);

    this.splitInstances.push(split);
    return split;
  }

  /**
   * Initialize a single tween element
   */
  initTweenElement(element, timeline, position) {
    const type = element.dataset.tweenType || 'fade-up';
    const config = this.getAnimationConfig(type);

    // Override with element-specific values
    const duration = parseFloat(element.dataset.tweenDuration) || config.duration;
    const ease = element.dataset.tweenEase || config.ease;

    if (type === 'split-text') {
      this.initSplitText(element, timeline, position);
    } else {
      // Set initial state
      gsap.set(element, config.initial);

      // Add animation to timeline
      timeline.to(element, {
        ...config.animate,
        duration,
        ease
      }, position);
    }
  }

  /**
   * Initialize a group of tween elements (sequenced)
   */
  initTweenGroup(groupElement) {
    const groupId = groupElement.dataset.tweenGroup;
    const tweenElements = groupElement.querySelectorAll('[data-tween]');

    if (tweenElements.length === 0) return;

    const scrollStart = groupElement.dataset.tweenStart || this.getScrollStart();
    const baseStagger = parseFloat(groupElement.dataset.tweenStagger) || 0.08;

    // Check if group is already in viewport
    const rect = groupElement.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

    // Set initial states for all elements first
    tweenElements.forEach(el => {
      const type = el.dataset.tweenType || 'fade-up';
      if (type !== 'split-text') {
        const config = this.getAnimationConfig(type);
        gsap.set(el, config.initial);
      }
    });

    // Create timeline - with or without ScrollTrigger based on viewport position
    const tlConfig = isInViewport
      ? { delay: 0.05 } // Small delay to ensure paint, no ScrollTrigger needed
      : {
          scrollTrigger: {
            trigger: groupElement,
            start: scrollStart,
            once: true
          }
        };

    const tl = gsap.timeline(tlConfig);

    // Track position in timeline
    let currentPosition = 0;

    tweenElements.forEach((el, index) => {
      const type = el.dataset.tweenType || 'fade-up';
      const delay = parseFloat(el.dataset.tweenDelay) || 0;
      const config = this.getAnimationConfig(type);

      // Calculate position: previous position + delay + stagger
      const position = index === 0 ? delay : currentPosition + delay;

      this.initTweenElement(el, tl, position);

      // Update current position for next element
      // For split-text, add more time since it takes longer (lines stagger at 0.1s each)
      const elementDuration = type === 'split-text' ? 0.5 : baseStagger;
      currentPosition = position + elementDuration;
    });

    if (tl.scrollTrigger) {
      this.scrollTriggers.push(tl.scrollTrigger);
    }
  }

  /**
   * Initialize standalone tween elements (not in a group)
   */
  initStandaloneTweens() {
    // Find all tween elements that are NOT inside a tween-group
    const allTweens = document.querySelectorAll('[data-tween]:not([data-tween-initialized])');
    const scrollStart = this.getScrollStart();

    allTweens.forEach(el => {
      // Skip if inside a group
      if (el.closest('[data-tween-group]')) return;

      // Skip if element is not connected to DOM or hidden
      if (!el.isConnected) return;

      // Skip elements that are hidden or have no layout (except fixed/sticky elements)
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') return;

      const type = el.dataset.tweenType || 'fade-up';
      const delay = parseFloat(el.dataset.tweenDelay) || 0;
      const config = this.getAnimationConfig(type);
      const duration = parseFloat(el.dataset.tweenDuration) || config.duration;
      const ease = el.dataset.tweenEase || config.ease;
      const start = el.dataset.tweenStart || scrollStart;

      el.dataset.tweenInitialized = 'true';

      if (type === 'split-text') {
        // Create timeline for split text
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start,
            once: true
          }
        });
        this.initSplitText(el, tl, delay);
        if (tl.scrollTrigger) {
          this.scrollTriggers.push(tl.scrollTrigger);
        }
      } else {
        // Set initial state
        gsap.set(el, config.initial);

        // Check if element is already in viewport (e.g., on page reload while scrolled)
        const rect = el.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

        if (isInViewport) {
          // Element already visible - animate immediately without ScrollTrigger
          gsap.to(el, {
            ...config.animate,
            duration,
            ease,
            delay
          });
        } else {
          // Create scroll-triggered animation
          try {
            const trigger = ScrollTrigger.create({
              trigger: el,
              start,
              once: true,
              onEnter: () => {
                gsap.to(el, {
                  ...config.animate,
                  duration,
                  ease,
                  delay
                });
              }
            });

            if (trigger) {
              this.scrollTriggers.push(trigger);
            }
          } catch (e) {
            // ScrollTrigger not ready, animate immediately as fallback
            gsap.to(el, {
              ...config.animate,
              duration,
              ease,
              delay
            });
          }
        }
      }
    });
  }

  /**
   * Initialize all tween animations
   */
  init() {
    // Early return if animations disabled
    if (!this.shouldAnimate()) {
      this.showAllElements();
      return;
    }

    // Initialize grouped tweens
    const groups = document.querySelectorAll('[data-tween-group]:not([data-tween-group-initialized])');
    groups.forEach(group => {
      group.dataset.tweenGroupInitialized = 'true';
      this.initTweenGroup(group);
    });

    // Initialize standalone tweens
    this.initStandaloneTweens();

    // Initialize Shopify policy pages (no template access)
    this.initPolicyPages();

    this.initialized = true;
  }

  /**
   * Initialize animations for Shopify policy pages
   * These pages use Shopify's built-in templates with no customization
   */
  initPolicyPages() {
    const policyContainer = document.querySelector('.shopify-policy__container');
    if (!policyContainer) return;

    const title = policyContainer.querySelector('.shopify-policy__title');
    const body = policyContainer.querySelector('.shopify-policy__body');

    if (!title && !body) return;

    // Create staggered animation timeline
    const tl = gsap.timeline({ delay: 0.1 });

    // Title uses SplitText for line-by-line reveal (like other page titles)
    if (title) {
      // Create SplitText instance
      const split = new SplitText(title, {
        type: 'lines',
        linesClass: 'tween-split-line'
      });

      // Wrap each line for overflow hidden
      // Add padding to prevent descender letters (y, g, p, q) from being clipped
      split.lines.forEach(line => {
        const wrapper = document.createElement('div');
        wrapper.style.overflow = 'hidden';
        wrapper.style.display = 'block';
        wrapper.style.paddingBottom = '0.25em';
        wrapper.style.marginBottom = '-0.25em';
        line.parentNode.insertBefore(wrapper, line);
        wrapper.appendChild(line);
      });

      // Set initial state - lines hidden below
      gsap.set(split.lines, { yPercent: 120 });

      // Make title visible, then animate lines
      tl.add(() => { title.style.opacity = '1'; title.style.transform = 'none'; }, 0);
      tl.to(split.lines, {
        yPercent: 0,
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.05
      }, 0);

      // Store for cleanup
      this.splitInstances.push(split);
    }

    // Body uses simple fade-up
    if (body) {
      gsap.set(body, { opacity: 0, y: 30 });
      tl.to(body, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out'
      }, title ? 0.3 : 0);
    }
  }

  /**
   * Show all elements immediately (when animations disabled)
   */
  showAllElements() {
    const tweenElements = document.querySelectorAll('[data-tween]');
    tweenElements.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.clipPath = 'none';
    });
  }

  /**
   * Refresh ScrollTriggers
   */
  refresh() {
    ScrollTrigger.refresh();
  }

  /**
   * Kill all ScrollTriggers and clean up
   */
  destroy() {
    this.scrollTriggers.forEach(trigger => {
      if (trigger && trigger.kill) trigger.kill();
    });
    this.scrollTriggers = [];

    // Revert split text instances
    this.splitInstances.forEach(split => {
      if (split && split.revert) split.revert();
    });
    this.splitInstances = [];

    // Remove initialized flags
    document.querySelectorAll('[data-tween-initialized]').forEach(el => {
      delete el.dataset.tweenInitialized;
    });
    document.querySelectorAll('[data-tween-group-initialized]').forEach(el => {
      delete el.dataset.tweenGroupInitialized;
    });

    this.initialized = false;
  }

  /**
   * Reinitialize (for use after Swup page transitions)
   */
  reinit() {
    this.destroy();
    this.init();
  }
}

// Singleton export
export const tweenManager = new TweenManager();
export default tweenManager;
