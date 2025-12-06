/**
 * FacetsManager - Collection filtering and sorting
 * Handles AJAX-based product filtering with drawer UI
 */

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
    this.sectionId = this.dataset.sectionId;
    this.form = this.querySelector('[data-facets-form]');
    this.drawer = this.querySelector('#FacetsDrawer');
    this.loading = this.querySelector('[data-facets-loading]');

    // Move drawer to body to escape stacking context issues
    if (this.drawer) {
      document.body.appendChild(this.drawer);
    }

    // Bind methods
    this.onFormChange = debounce(this.onFormChange.bind(this), 500);
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.bindEvents();
    this.setupHistoryListener();
  }

  bindEvents() {
    // Form input changes
    if (this.form) {
      this.form.addEventListener('input', this.onFormChange);
    }

    // Open drawer button
    const openBtn = this.querySelector('[data-facets-open]');
    if (openBtn) {
      openBtn.addEventListener('click', () => this.openDrawer());
    }

    // Close drawer buttons (query from drawer since it's moved to body)
    if (this.drawer) {
      this.drawer.querySelectorAll('[data-facets-close]').forEach((btn) => {
        btn.addEventListener('click', () => this.closeDrawer());
      });

      // Apply button
      const applyBtn = this.drawer.querySelector('[data-facets-apply]');
      if (applyBtn) {
        applyBtn.addEventListener('click', () => this.closeDrawer());
      }
    }

    // Active filter removal
    this.querySelectorAll('[data-facet-remove], [data-facet-clear-all]').forEach((link) => {
      link.addEventListener('click', this.onActiveFilterClick);
    });

    // Sort change (desktop)
    const sortSelect = this.querySelector('#SortBy');
    if (sortSelect) {
      sortSelect.addEventListener('change', this.onFormChange);
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
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isDrawerOpen()) {
        this.closeDrawer();
      }
    });

    // Disclosure toggle animation
    this.querySelectorAll('.facets-disclosure').forEach((details) => {
      details.addEventListener('toggle', () => {
        const icon = details.querySelector('.ph-caret-down');
        if (icon) {
          icon.style.transform = details.open ? 'rotate(180deg)' : '';
        }
      });
    });
  }

  setupHistoryListener() {
    // Store initial search params
    FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
    FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);

    // Listen for browser back/forward
    window.addEventListener('popstate', (event) => {
      const searchParams = event.state?.searchParams ?? FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      this.renderPage(searchParams, false);
    });
  }

  isDrawerOpen() {
    return this.drawer && !this.drawer.hasAttribute('inert');
  }

  openDrawer() {
    if (!this.drawer) return;

    // Enable interactions
    this.drawer.removeAttribute('inert');
    this.drawer.classList.add('is-open');

    // Animate in
    const backdrop = this.drawer.querySelector('.facets-drawer__backdrop');
    const panel = this.drawer.querySelector('.facets-drawer__panel');

    if (backdrop) {
      backdrop.style.opacity = '1';
    }
    if (panel) {
      panel.style.transform = 'translateX(0)';
    }

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    // Stop Lenis
    if (window.pieces?.lenis) {
      window.pieces.lenis.stop();
    }

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

    // Animate out
    const backdrop = this.drawer.querySelector('.facets-drawer__backdrop');
    const panel = this.drawer.querySelector('.facets-drawer__panel');

    if (backdrop) {
      backdrop.style.opacity = '0';
    }
    if (panel) {
      panel.style.transform = 'translateX(-100%)';
    }

    // Wait for animation then disable interactions
    setTimeout(() => {
      this.drawer.setAttribute('inert', '');
      this.drawer.classList.remove('is-open');

      // Restore body scroll
      document.body.style.overflow = '';

      // Start Lenis
      if (window.pieces?.lenis) {
        window.pieces.lenis.start();
      }
    }, 300);

    // Update button state
    const openBtn = this.querySelector('[data-facets-open]');
    if (openBtn) {
      openBtn.setAttribute('aria-expanded', 'false');
      openBtn.focus();
    }
  }

  onFormChange(event) {
    const formData = new FormData(this.form);
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

      // Update URL
      if (updateURL) {
        this.updateURL(searchParams);
      }

      // Refresh Lenis scroll bounds
      if (window.pieces?.lenis) {
        window.pieces.lenis.resize();
      }
    } catch (error) {
      console.error('Error filtering products:', error);
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

      // Replace content
      currentContent.innerHTML = newContent.innerHTML;

      // Trigger animation for new items
      requestAnimationFrame(() => {
        if (wrapper) {
          wrapper.classList.remove('is-transitioning');
          // Re-trigger item animations
          this.animateNewItems(currentContent);
        }
      });
    }
  }

  animateNewItems(container) {
    const items = container.querySelectorAll('[data-collection-item], [data-product-card]');

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
    const currentFilters = this.querySelector('.facets-drawer__filters');

    if (newFilters && currentFilters) {
      // Preserve open states
      const openFilters = [...currentFilters.querySelectorAll('details[open]')]
        .map((d) => d.id);

      currentFilters.innerHTML = newFilters.innerHTML;

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
        link.addEventListener('click', this.onActiveFilterClick);
      });
    }

    // Update filter button count
    const openBtn = this.querySelector('[data-facets-open]');
    if (openBtn) {
      const newBtn = doc.querySelector('[data-facets-open]');
      if (newBtn) {
        openBtn.innerHTML = newBtn.innerHTML;
      }
    }
  }

  updateProductCount(doc) {
    const newCount = doc.querySelector('#ProductCount');
    const currentCount = this.querySelector('#ProductCount');

    if (newCount && currentCount) {
      currentCount.innerHTML = newCount.innerHTML;
    }
  }

  updateURL(searchParams) {
    const url = searchParams
      ? `${window.location.pathname}?${searchParams}`
      : window.location.pathname;

    history.pushState({ searchParams }, '', url);
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
