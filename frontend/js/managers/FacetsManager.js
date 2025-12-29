/**
 * FacetsManager - Collection filtering and sorting
 * Handles AJAX-based product filtering with drawer UI
 */

import { safeLocalStorage } from '../utils/storage.js';
import { DURATION, DEBOUNCE } from '../utils/constants.js';

// Debounce helper
function debounce(fn, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.boundHandlers = {};
  }

  connectedCallback() {
    this.sectionId = this.dataset.sectionId;
    this.form = this.querySelector('[data-facets-form]');
    this.drawer = this.querySelector('#FacetsDrawer');
    this.loading = this.querySelector('[data-facets-loading]');

    // Move drawer to body to escape stacking context issues
    if (this.drawer) {
      document.body.appendChild(this.drawer);
    }

    // Bind methods
    this.boundHandlers.onFormChange = debounce(this.onFormChange.bind(this), DEBOUNCE.search);
    this.boundHandlers.onActiveFilterClick = this.onActiveFilterClick.bind(this);
    this.boundHandlers.onKeydown = this.onKeydown.bind(this);
    this.boundHandlers.onPopState = this.onPopState.bind(this);

    this.bindEvents();
    this.setupHistoryListener();
  }

  disconnectedCallback() {
    // Clean up document-level event listeners
    document.removeEventListener('keydown', this.boundHandlers.onKeydown);
    window.removeEventListener('popstate', this.boundHandlers.onPopState);

    // Remove drawer from body if it was moved there
    if (this.drawer && this.drawer.parentNode === document.body) {
      this.drawer.remove();
    }
  }

  bindEvents() {
    // Form input changes
    if (this.form) {
      this.form.addEventListener('input', this.boundHandlers.onFormChange);
    }

    // Open drawer button
    const openBtn = this.querySelector('[data-facets-open]');
    if (openBtn) {
      openBtn.addEventListener('click', () => this.openDrawer());
    }

    // Close drawer buttons, apply button, and clear all (use event delegation on drawer)
    if (this.drawer) {
      this.drawer.addEventListener('click', (e) => {
        // Close button or apply button - just close drawer
        if (e.target.closest('[data-facets-close]') || e.target.closest('[data-facets-apply]')) {
          this.closeDrawer();
        }
        // Clear all button in drawer footer - clear filters and close drawer
        const clearAllBtn = e.target.closest('[data-facet-clear-all]');
        if (clearAllBtn) {
          e.preventDefault();
          const url = clearAllBtn.href;
          const searchParams = url.includes('?') ? url.slice(url.indexOf('?') + 1) : '';
          this.renderPage(searchParams);
          this.closeDrawer();
        }
      });
    }

    // Active filter removal (for elements outside drawer)
    this.querySelectorAll('[data-facet-remove], [data-facet-clear-all]').forEach((link) => {
      link.addEventListener('click', this.boundHandlers.onActiveFilterClick);
    });

    // Sort change (desktop)
    const sortSelect = this.querySelector('#SortBy');
    if (sortSelect) {
      sortSelect.addEventListener('change', this.boundHandlers.onFormChange);
    }

    // Sort change (mobile - inside drawer)
    const sortSelectMobile = this.querySelector('#SortByMobile');
    if (sortSelectMobile) {
      sortSelectMobile.addEventListener('change', (e) => {
        // Sync with desktop select
        if (sortSelect) {
          sortSelect.value = e.target.value;
        }
      });
    }

    // Close drawer on escape
    document.addEventListener('keydown', this.boundHandlers.onKeydown);

    // View toggle (grid/list)
    this.setupViewToggle();
  }

  setupViewToggle() {
    const viewBtns = this.querySelectorAll('[data-view-toggle]');
    const wrapper = document.querySelector('[data-collection-wrapper]');

    if (!viewBtns.length || !wrapper) return;

    const gridContent = wrapper.querySelector('[data-collection-content]');
    const listContent = wrapper.querySelector('[data-collection-list-content]');

    // Helper to switch containers
    const switchView = (view) => {
      wrapper.dataset.view = view;
      if (listContent) {
        if (view === 'list') {
          gridContent?.classList.add('hidden');
          listContent.classList.remove('hidden');
        } else {
          gridContent?.classList.remove('hidden');
          listContent.classList.add('hidden');
        }
      }
    };

    // Restore saved view preference
    const savedView = safeLocalStorage('collection-view') || 'grid';
    switchView(savedView);
    viewBtns.forEach((btn) => {
      const isActive = btn.dataset.viewToggle === savedView;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive);
    });

    // Handle view toggle clicks
    viewBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.viewToggle;
        const currentView = wrapper.dataset.view;

        // Skip if already in this view
        if (view === currentView) return;

        const activeContent = view === 'list' ? listContent : gridContent;
        const inactiveContent = view === 'list' ? gridContent : listContent;
        const shouldAnimate = typeof window.shouldAnimate === 'function' && window.shouldAnimate();
        const gsap = window.gsap || window.pieces?.gsap;

        // Update buttons immediately
        viewBtns.forEach((b) => {
          const isActive = b.dataset.viewToggle === view;
          b.classList.toggle('is-active', isActive);
          b.setAttribute('aria-pressed', isActive);
        });

        if (shouldAnimate && gsap && activeContent && inactiveContent) {
          // Capture current height from active container
          const startHeight = inactiveContent.offsetHeight;

          // Fade out current content
          gsap.to(inactiveContent, {
            opacity: 0,
            duration: 0.2,
            ease: 'power2.in',
            onComplete: () => {
              // Switch containers
              switchView(view);

              // Set initial state for new content
              gsap.set(activeContent, { opacity: 0 });

              // Animate height wrapper if needed
              const container = wrapper.querySelector('[data-product-grid-container]');
              if (container) {
                container.style.height = `${startHeight}px`;
                container.style.overflow = 'hidden';

                const endHeight = activeContent.offsetHeight;

                gsap.to(container, {
                  height: endHeight,
                  duration: 0.4,
                  ease: 'power3.inOut',
                  onComplete: () => {
                    container.style.height = '';
                    container.style.overflow = '';
                  },
                });
              }

              // Fade in new content
              gsap.to(activeContent, {
                opacity: 1,
                duration: 0.3,
                delay: 0.15,
                ease: 'power2.out',
                onComplete: () => {
                  // Refresh Lenis
                  if (window.pieces?.lenis) {
                    window.pieces.lenis.resize();
                  }
                },
              });
            },
          });
        } else {
          // No animation - just switch view
          switchView(view);

          if (window.pieces?.lenis) {
            window.pieces.lenis.resize();
          }
        }

        // Save preference
        safeLocalStorage('collection-view', view);
      });
    });
  }

  setupHistoryListener() {
    // Store initial search params
    FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
    FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);

    // Listen for browser back/forward
    window.addEventListener('popstate', this.boundHandlers.onPopState);
  }

  /**
   * Handle keydown events (escape to close drawer)
   */
  onKeydown(e) {
    if (e.key === 'Escape' && this.isDrawerOpen()) {
      this.closeDrawer();
    }
  }

  /**
   * Handle browser back/forward navigation
   */
  onPopState(event) {
    const searchParams = event.state?.searchParams ?? FacetFiltersForm.searchParamsInitial;
    if (searchParams === FacetFiltersForm.searchParamsPrev) return;
    this.renderPage(searchParams, false);
  }

  isDrawerOpen() {
    return this.drawer && !this.drawer.hasAttribute('inert');
  }

  openDrawer() {
    if (!this.drawer) return;

    // Store scroll position and lock scroll
    this.scrollPosition = window.scrollY;
    document.body.style.top = `-${this.scrollPosition}px`;
    document.documentElement.classList.add('scroll-locked');

    // Stop Lenis
    if (window.pieces?.lenis) {
      window.pieces.lenis.stop();
    }

    // Enable interactions and show drawer
    this.drawer.removeAttribute('inert');
    this.drawer.classList.add('is-open');

    // Update button state
    const openBtn = this.querySelector('[data-facets-open]');
    if (openBtn) {
      openBtn.setAttribute('aria-expanded', 'true');
    }

    // Focus first focusable element
    requestAnimationFrame(() => {
      const closeBtn = this.drawer.querySelector('[data-facets-close]');
      if (closeBtn) closeBtn.focus();
    });
  }

  closeDrawer() {
    if (!this.drawer) return;

    // Hide drawer
    this.drawer.classList.remove('is-open');

    // Wait for animation then disable interactions
    setTimeout(() => {
      this.drawer.setAttribute('inert', '');

      // Restore scroll
      document.documentElement.classList.remove('scroll-locked');
      document.body.style.top = '';
      window.scrollTo(0, this.scrollPosition || 0);

      // Start Lenis
      if (window.pieces?.lenis) {
        window.pieces.lenis.start();
      }
    }, DURATION.normal);

    // Update button state
    const openBtn = this.querySelector('[data-facets-open]');
    if (openBtn) {
      openBtn.setAttribute('aria-expanded', 'false');
      openBtn.focus();
    }
  }

  onFormChange(event) {
    const formData = new FormData(this.form);

    // Explicitly add sort_by from desktop select (it's outside the form in DOM due to drawer move)
    const sortSelect = document.querySelector('#SortBy');
    if (sortSelect && sortSelect.value) {
      formData.set('sort_by', sortSelect.value);
    }

    const searchParams = new URLSearchParams(formData).toString();
    this.renderPage(searchParams);
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    const url = event.currentTarget.href;
    const searchParams = url.includes('?') ? url.slice(url.indexOf('?') + 1) : '';
    this.renderPage(searchParams);
  }

  async renderPage(searchParams, updateURL = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;

    // Show loading state
    this.showLoading();

    try {
      // Fetch filtered content
      const url = `${window.location.pathname}?section_id=${this.sectionId}&${searchParams}`;
      const response = await fetch(url);
      const html = await response.text();

      // Parse response
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Update product grid
      this.updateProductGrid(doc);

      // Update filters
      this.updateFilters(doc);

      // Update active facets
      this.updateActiveFacets(doc);

      // Update product count
      this.updateProductCount(doc);

      // Update pagination (load more button with new URLs)
      this.updatePagination(doc);

      // Update URL
      if (updateURL) {
        this.updateURL(searchParams);
      }

      // Refresh Lenis scroll bounds
      if (window.pieces?.lenis) {
        window.pieces.lenis.resize();
      }
    } catch {
      // Silently handle filter errors - UI will remain in previous state
    } finally {
      this.hideLoading();
    }
  }

  updateProductGrid(doc) {
    const newContent = doc.querySelector('[data-collection-content]');
    const currentContent = document.querySelector('[data-collection-content]');

    if (newContent && currentContent) {
      // Add transition class
      const wrapper = document.querySelector('[data-collection-wrapper]');
      if (wrapper) {
        wrapper.classList.add('is-transitioning');
      }

      // Replace content safely
      currentContent.replaceChildren(...newContent.cloneNode(true).childNodes);

      // Trigger animation for new items
      requestAnimationFrame(() => {
        if (wrapper) {
          wrapper.classList.remove('is-transitioning');
          // Re-trigger item animations
          this.animateNewItems(currentContent);
        }

        // Dispatch event for wishlist/compare buttons to update their state
        document.dispatchEvent(new CustomEvent('facets:updated'));
      });
    }
  }

  animateNewItems(container) {
    const items = container.querySelectorAll('[data-collection-item], [data-product-card]');

    // Reinitialize tween animations for dynamically loaded items
    if (window.pieces?.tween) {
      window.pieces.tween.reinit();
    }

    if (typeof gsap !== 'undefined') {
      items.forEach((item, index) => {
        const imgWrap = item.querySelector('.product-card-image');
        const titleSpans = item.querySelectorAll('.product-card-title .overflow-hidden span');
        const priceSpans = item.querySelectorAll('.product-card-price .overflow-hidden span');

        // Set initial states
        if (imgWrap) {
          gsap.set(imgWrap, { clipPath: 'inset(0 100% 0 0)' });
        }
        if (titleSpans.length) {
          gsap.set(titleSpans, { yPercent: 100 });
        }
        if (priceSpans.length) {
          gsap.set(priceSpans, { yPercent: 100 });
        }

        // Animate in with stagger
        const delay = (index % 4) * 0.1;
        gsap.delayedCall(delay, () => {
          const tl = gsap.timeline();

          if (imgWrap) {
            tl.to(imgWrap, {
              clipPath: 'inset(0 0% 0 0)',
              duration: 1.2,
              ease: 'expo.inOut',
            }, 0);
          }
          if (titleSpans.length) {
            tl.to(titleSpans, {
              yPercent: 0,
              duration: 0.8,
              ease: 'power4.out',
              stagger: 0.05,
            }, 0.2);
          }
          if (priceSpans.length) {
            tl.to(priceSpans, {
              yPercent: 0,
              duration: 0.6,
              ease: 'power4.out',
              stagger: 0.05,
            }, 0.3);
          }
        });
      });
    }
  }

  updateFilters(doc) {
    const newFilters = doc.querySelector('.facets-drawer__filters');
    // Use this.drawer since it was moved to document.body in connectedCallback
    const currentFilters = this.drawer?.querySelector('.facets-drawer__filters');

    if (newFilters && currentFilters) {
      // Preserve open states
      const openFilters = [...currentFilters.querySelectorAll('details[open]')]
        .map((d) => d.id);

      currentFilters.replaceChildren(...newFilters.cloneNode(true).childNodes);

      // Restore open states
      openFilters.forEach((id) => {
        const details = currentFilters.querySelector(`#${id}`);
        if (details) details.open = true;
      });

      // Re-bind disclosure animations
      currentFilters.querySelectorAll('.facets-disclosure').forEach((details) => {
        details.addEventListener('toggle', () => {
          const icon = details.querySelector('.ph-caret-down');
          if (icon) {
            icon.style.transform = details.open ? 'rotate(180deg)' : '';
          }
        });
      });
    }
  }

  updateActiveFacets(doc) {
    const newActive = doc.querySelector('#ActiveFacets');
    const currentActive = this.querySelector('#ActiveFacets');

    if (newActive && currentActive) {
      currentActive.outerHTML = newActive.outerHTML;

      // Re-bind click handlers
      this.querySelectorAll('[data-facet-remove], [data-facet-clear-all]').forEach((link) => {
        link.addEventListener('click', this.boundHandlers.onActiveFilterClick);
      });
    }

    // Update filter button count
    const openBtn = this.querySelector('[data-facets-open]');
    if (openBtn) {
      const newBtn = doc.querySelector('[data-facets-open]');
      if (newBtn) {
        openBtn.replaceChildren(...newBtn.cloneNode(true).childNodes);
      }
    }
  }

  updateProductCount(doc) {
    // Update the header subtitle counter
    const newSubtitle = doc.querySelector('[data-subtitle-text]');
    const currentSubtitle = document.querySelector('[data-subtitle-text]');

    if (newSubtitle && currentSubtitle) {
      currentSubtitle.textContent = newSubtitle.textContent;
    }
  }

  updatePagination(doc) {
    // Update load more pagination
    const newPagination = doc.querySelector('[data-pagination-load-more]');
    const currentPagination = document.querySelector('[data-pagination-load-more]');

    if (currentPagination) {
      if (newPagination) {
        currentPagination.replaceChildren(...newPagination.cloneNode(true).childNodes);
      } else {
        // No more pagination needed (fewer results than page size)
        currentPagination.replaceChildren();
      }
    }

    // Update prev/next pagination
    const newPrevNext = doc.querySelector('.collection-wrapper nav');
    const currentPrevNext = document.querySelector('.collection-wrapper nav');

    if (currentPrevNext && newPrevNext) {
      currentPrevNext.replaceChildren(...newPrevNext.cloneNode(true).childNodes);
    } else if (currentPrevNext && !newPrevNext) {
      currentPrevNext.remove();
    }
  }

  updateURL(searchParams) {
    // Remove section_id from URL params - it's only needed for fetch, not browser URL
    const params = new URLSearchParams(searchParams);
    params.delete('section_id');

    const cleanParams = params.toString();
    const url = cleanParams
      ? `${window.location.pathname}?${cleanParams}`
      : window.location.pathname;

    history.pushState({ searchParams: cleanParams }, '', url);
  }

  showLoading() {
    if (this.loading) {
      this.loading.style.opacity = '1';
      this.loading.style.pointerEvents = 'auto';
    }
  }

  hideLoading() {
    if (this.loading) {
      this.loading.style.opacity = '0';
      this.loading.style.pointerEvents = 'none';
    }
  }
}

// Define custom element
if (!customElements.get('facet-filters-form')) {
  customElements.define('facet-filters-form', FacetFiltersForm);
}

// Export for use in app.js
export { FacetFiltersForm };
export default FacetFiltersForm;
