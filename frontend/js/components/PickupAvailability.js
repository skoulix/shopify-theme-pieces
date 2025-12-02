import { Piece } from 'piecesjs';
import { trapFocus, removeTrapFocus } from '../utils/focus.js';

/**
 * Pickup Availability Component
 * Fetches and displays store pickup availability for variants
 */
class PickupAvailability extends Piece {
  constructor() {
    super('PickupAvailability', {
      stylesheets: [],
    });

    this.errorHtml = null;
  }

  mount() {
    if (!this.hasAttribute('available')) return;

    const template = this.$('template')[0];
    if (template) {
      this.errorHtml = template.content.firstElementChild.cloneNode(true);
    }

    this.fetchAvailability(this.dataset.variantId);
  }

  fetchAvailability(variantId) {
    if (!variantId) return;

    let rootUrl = this.dataset.rootUrl || '';
    if (!rootUrl.endsWith('/')) {
      rootUrl = rootUrl + '/';
    }

    const variantSectionUrl = `${rootUrl}variants/${variantId}/?section_id=pickup-availability`;

    fetch(variantSectionUrl)
      .then((response) => response.text())
      .then((text) => {
        const sectionInnerHTML = new DOMParser()
          .parseFromString(text, 'text/html')
          .querySelector('.shopify-section');
        this.renderPreview(sectionInnerHTML);
      })
      .catch(() => {
        this.renderError();
      });
  }

  update(variant) {
    if (variant?.available) {
      this.fetchAvailability(variant.id);
    } else {
      this.removeAttribute('available');
      this.innerHTML = '';
    }
  }

  renderError() {
    this.innerHTML = '';
    if (this.errorHtml) {
      this.appendChild(this.errorHtml);
      const retryButton = this.$('button')[0];
      if (retryButton) {
        this.on('click', retryButton, () => this.fetchAvailability(this.dataset.variantId));
      }
    }
  }

  renderPreview(sectionInnerHTML) {
    // Remove existing drawer
    const existingDrawer = document.querySelector('pickup-availability-drawer');
    if (existingDrawer) existingDrawer.remove();

    const preview = sectionInnerHTML?.querySelector('pickup-availability-preview');
    if (!preview) {
      this.innerHTML = '';
      this.removeAttribute('available');
      return;
    }

    this.innerHTML = preview.outerHTML;
    this.setAttribute('available', '');

    // Add drawer to body
    const drawer = sectionInnerHTML.querySelector('pickup-availability-drawer');
    if (drawer) {
      // Apply color scheme
      const colorClasses = this.dataset.productPageColorScheme?.split(' ') || [];
      colorClasses.forEach((colorClass) => {
        if (colorClass) drawer.classList.add(colorClass);
      });

      document.body.appendChild(drawer);
    }

    // Bind button to open drawer
    const button = this.$('button')[0];
    if (button) {
      this.on('click', button, (evt) => {
        const drawerEl = document.querySelector('pickup-availability-drawer');
        if (drawerEl) drawerEl.show(evt.target);
      });
    }
  }
}

/**
 * Pickup Availability Drawer Component
 * Slide-out drawer showing pickup locations
 */
class PickupDrawer extends Piece {
  constructor() {
    super('PickupDrawer', {
      stylesheets: [],
    });

    this.focusElement = null;
    this.boundBodyClick = this.handleBodyClick.bind(this);
  }

  mount() {
    this.$closeButton = this.$('button')[0];
    if (this.$closeButton) {
      this.on('click', this.$closeButton, this.hide);
    }

    this.on('keyup', this, this.onKeyUp);
  }

  unmount() {
    if (this.$closeButton) {
      this.off('click', this.$closeButton, this.hide);
    }
    this.off('keyup', this, this.onKeyUp);
    document.body.removeEventListener('click', this.boundBodyClick);
  }

  onKeyUp(event) {
    if (event.code === 'Escape') {
      this.hide();
    }
  }

  handleBodyClick(evt) {
    const target = evt.target;
    if (
      target !== this &&
      !target.closest('pickup-availability-drawer') &&
      target.id !== 'ShowPickupAvailabilityDrawer'
    ) {
      this.hide();
    }
  }

  show(focusElement) {
    this.focusElement = focusElement;
    this.setAttribute('open', '');
    document.body.addEventListener('click', this.boundBodyClick);
    document.body.classList.add('overflow-hidden');
    trapFocus(this);
  }

  hide() {
    this.removeAttribute('open');
    document.body.removeEventListener('click', this.boundBodyClick);
    document.body.classList.remove('overflow-hidden');
    removeTrapFocus(this.focusElement);
  }
}

customElements.define('pickup-availability', PickupAvailability);
customElements.define('pickup-availability-drawer', PickupDrawer);

export { PickupAvailability, PickupDrawer };
export default PickupAvailability;
