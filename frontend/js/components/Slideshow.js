import { Piece } from 'piecesjs';
import { gsap } from 'gsap';

/**
 * Slideshow Component
 * Full-featured slideshow with autoplay, looping, and dot navigation
 * Replaces: slideshow-component from global.js
 */
class Slideshow extends Piece {
  constructor() {
    super('Slideshow', {
      stylesheets: [],
    });

    this.currentPage = 1;
    this.totalPages = 1;
    this.sliderItemOffset = 0;
    this.autoplaySpeed = 5000;
    this.autoplayInterval = null;
    this.isPlaying = false;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  }

  mount() {
    this.$slider = this.$('[data-slider-track]')[0] || this.$('[id^="Slider-"]')[0];
    this.$items = this.$$('[data-slider-item]').length
      ? this.$$('[data-slider-item]')
      : this.$$('[id^="Slide-"]');
    this.$prevButton = this.$('[data-slider-prev]')[0] || this.$('button[name="previous"]')[0];
    this.$nextButton = this.$('[data-slider-next]')[0] || this.$('button[name="next"]')[0];
    this.$dots = this.$$('[data-slider-dot]') || this.$$('.slider-counter__link');
    this.$autoplayButton = this.$('[data-autoplay-toggle]')[0] || this.$('.slideshow__autoplay')[0];
    this.$currentPage = this.$('[data-slider-current]')[0] || this.$('.slider-counter--current')[0];
    this.$totalPages = this.$('[data-slider-total]')[0] || this.$('.slider-counter--total')[0];

    if (!this.$slider || !this.$items.length) return;

    // Get settings from data attributes
    this.autoplaySpeed = (parseInt(this.$slider.dataset.speed) || 5) * 1000;
    this.enableAutoplay = this.$slider.dataset.autoplay === 'true';

    // Initialize
    this.initPages();

    // Observe resize
    this.resizeObserver = new ResizeObserver(() => this.initPages());
    this.resizeObserver.observe(this.$slider);

    // Bind events
    this.on('scroll', this.$slider, this.update);

    if (this.$prevButton) {
      this.on('click', this.$prevButton, this.onPrevClick);
    }
    if (this.$nextButton) {
      this.on('click', this.$nextButton, this.onNextClick);
    }

    // Dot navigation
    this.$dots.forEach((dot, index) => {
      this.on('click', dot, () => this.goToSlide(index + 1));
    });

    // Autoplay toggle
    if (this.$autoplayButton) {
      this.on('click', this.$autoplayButton, this.toggleAutoplay);
    }

    // Pause on hover/focus
    this.on('mouseenter', this, this.pause);
    this.on('mouseleave', this, this.onMouseLeave);
    this.on('focusin', this, this.pause);
    this.on('focusout', this, this.onFocusOut);

    // Set initial slide visibility
    this.setSlideVisibility();

    // Start autoplay if enabled
    if (this.enableAutoplay && !this.reducedMotion.matches) {
      this.play();
    }

    // Listen for reduced motion changes
    this.reducedMotion.addEventListener('change', this.handleReducedMotionChange.bind(this));
  }

  unmount() {
    this.pause();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.off('scroll', this.$slider, this.update);

    if (this.$prevButton) {
      this.off('click', this.$prevButton, this.onPrevClick);
    }
    if (this.$nextButton) {
      this.off('click', this.$nextButton, this.onNextClick);
    }

    this.off('mouseenter', this, this.pause);
    this.off('mouseleave', this, this.onMouseLeave);
    this.off('focusin', this, this.pause);
    this.off('focusout', this, this.onFocusOut);
  }

  initPages() {
    this.visibleItems = Array.from(this.$items).filter((el) => el.clientWidth > 0);

    if (this.visibleItems.length < 2) return;

    this.sliderItemOffset = this.visibleItems[1].offsetLeft - this.visibleItems[0].offsetLeft;
    this.totalPages = this.visibleItems.length;

    // Update counter
    if (this.$totalPages) {
      this.$totalPages.textContent = this.totalPages;
    }

    this.update();
  }

  update() {
    if (!this.$slider) return;

    const previousPage = this.currentPage;
    this.currentPage = Math.round(this.$slider.scrollLeft / this.sliderItemOffset) + 1;

    // Clamp to valid range
    this.currentPage = Math.max(1, Math.min(this.currentPage, this.totalPages));

    // Update counter
    if (this.$currentPage) {
      this.$currentPage.textContent = this.currentPage;
    }

    // Update dots
    this.$dots.forEach((dot, index) => {
      dot.classList.toggle('slider-counter__link--active', index === this.currentPage - 1);
      dot.setAttribute('aria-current', index === this.currentPage - 1 ? 'true' : 'false');
    });

    // Update slide visibility
    this.setSlideVisibility();

    // Dispatch event on page change
    if (this.currentPage !== previousPage) {
      this.emit('slideChanged', this, {
        detail: {
          currentPage: this.currentPage,
          currentElement: this.visibleItems[this.currentPage - 1],
        },
      });
    }
  }

  setSlideVisibility() {
    this.visibleItems.forEach((item, index) => {
      const isActive = index === this.currentPage - 1;
      const links = item.querySelectorAll('a, button');

      item.setAttribute('aria-hidden', isActive ? 'false' : 'true');

      if (isActive) {
        item.removeAttribute('tabindex');
        links.forEach((link) => link.removeAttribute('tabindex'));
      } else {
        item.setAttribute('tabindex', '-1');
        links.forEach((link) => link.setAttribute('tabindex', '-1'));
      }
    });
  }

  onPrevClick(event) {
    event.preventDefault();

    let targetPage = this.currentPage - 1;

    // Loop to last slide if at beginning
    if (targetPage < 1) {
      targetPage = this.totalPages;
    }

    this.goToSlide(targetPage);
  }

  onNextClick(event) {
    event.preventDefault();

    let targetPage = this.currentPage + 1;

    // Loop to first slide if at end
    if (targetPage > this.totalPages) {
      targetPage = 1;
    }

    this.goToSlide(targetPage);
  }

  goToSlide(index) {
    const position = (index - 1) * this.sliderItemOffset;
    this.$slider.scrollTo({
      left: position,
      behavior: this.reducedMotion.matches ? 'auto' : 'smooth',
    });
  }

  play() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.$slider?.setAttribute('aria-live', 'off');

    this.autoplayInterval = setInterval(() => {
      this.autoRotate();
    }, this.autoplaySpeed);

    // Update button state
    if (this.$autoplayButton) {
      this.$autoplayButton.classList.remove('slideshow__autoplay--paused');
      this.$autoplayButton.setAttribute('aria-label', window.accessibilityStrings?.pauseSlideshow || 'Pause slideshow');
    }
  }

  pause() {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    this.$slider?.setAttribute('aria-live', 'polite');

    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }

    // Update button state
    if (this.$autoplayButton) {
      this.$autoplayButton.classList.add('slideshow__autoplay--paused');
      this.$autoplayButton.setAttribute('aria-label', window.accessibilityStrings?.playSlideshow || 'Play slideshow');
    }
  }

  toggleAutoplay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  autoRotate() {
    let targetPage = this.currentPage + 1;

    if (targetPage > this.totalPages) {
      targetPage = 1;
    }

    this.goToSlide(targetPage);
  }

  onMouseLeave() {
    if (this.enableAutoplay && !this.reducedMotion.matches) {
      this.play();
    }
  }

  onFocusOut(event) {
    // Only resume if focus left the slideshow entirely
    if (!this.contains(event.relatedTarget) && this.enableAutoplay && !this.reducedMotion.matches) {
      this.play();
    }
  }

  handleReducedMotionChange() {
    if (this.reducedMotion.matches) {
      this.pause();
    } else if (this.enableAutoplay) {
      this.play();
    }
  }
}

customElements.define('c-slideshow', Slideshow);
export default Slideshow;
