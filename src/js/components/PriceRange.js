/**
 * PriceRange - Dual range slider for price filtering
 * Inspired by range-slider-input library approach:
 * Uses custom div thumbs instead of native range input thumbs for better cross-browser control
 */

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.isDragging = false;
    this.activeThumb = null;
  }

  connectedCallback() {
    this.track = this.querySelector('.price-range-track');
    this.range = this.querySelector('.price-range-progress');
    this.thumbMin = this.querySelector('.price-range-thumb-min');
    this.thumbMax = this.querySelector('.price-range-thumb-max');
    this.displayMin = this.querySelector('.price-range-display-min');
    this.displayMax = this.querySelector('.price-range-display-max');
    this.hiddenMin = this.querySelector('.price-range-hidden-min');
    this.hiddenMax = this.querySelector('.price-range-hidden-max');

    this.currency = this.dataset.currency || '$';
    this.min = parseFloat(this.dataset.min) || 0;
    this.max = parseFloat(this.dataset.max) || 100;
    this.valueMin = parseFloat(this.dataset.valueMin) || this.min;
    this.valueMax = parseFloat(this.dataset.valueMax) || this.max;

    if (!this.track || !this.thumbMin || !this.thumbMax) return;

    // Bind event handlers
    this.onPointerDown = this.onPointerDown.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerUp = this.onPointerUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);

    // Attach events to thumbs
    this.thumbMin.addEventListener('pointerdown', this.onPointerDown);
    this.thumbMax.addEventListener('pointerdown', this.onPointerDown);
    this.thumbMin.addEventListener('keydown', this.onKeyDown);
    this.thumbMax.addEventListener('keydown', this.onKeyDown);

    // Initial render
    this.updateUI();
  }

  disconnectedCallback() {
    if (this.thumbMin) {
      this.thumbMin.removeEventListener('pointerdown', this.onPointerDown);
      this.thumbMin.removeEventListener('keydown', this.onKeyDown);
    }
    if (this.thumbMax) {
      this.thumbMax.removeEventListener('pointerdown', this.onPointerDown);
      this.thumbMax.removeEventListener('keydown', this.onKeyDown);
    }
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
  }

  onPointerDown(e) {
    e.preventDefault();
    this.isDragging = true;
    this.activeThumb = e.target.dataset.thumb;
    e.target.dataset.active = '';
    e.target.setPointerCapture(e.pointerId);

    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  onPointerMove(e) {
    if (!this.isDragging || !this.activeThumb) return;

    const rect = this.track.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const value = this.min + percent * (this.max - this.min);

    if (this.activeThumb === 'min') {
      // Don't let min exceed max
      this.valueMin = Math.min(value, this.valueMax - 1);
    } else {
      // Don't let max go below min
      this.valueMax = Math.max(value, this.valueMin + 1);
    }

    this.updateUI();
  }

  onPointerUp() {
    if (!this.isDragging) return;

    this.isDragging = false;
    const thumb = this.activeThumb === 'min' ? this.thumbMin : this.thumbMax;
    delete thumb.dataset.active;
    this.activeThumb = null;

    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);

    // Update hidden inputs and trigger form change
    this.updateHiddenInputs();
  }

  onKeyDown(e) {
    const thumb = e.target.dataset.thumb;
    const step = (this.max - this.min) / 100; // 1% step

    let value = thumb === 'min' ? this.valueMin : this.valueMax;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        value -= step;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        value += step;
        break;
      default:
        return;
    }

    e.preventDefault();

    if (thumb === 'min') {
      this.valueMin = Math.max(this.min, Math.min(value, this.valueMax - 1));
    } else {
      this.valueMax = Math.min(this.max, Math.max(value, this.valueMin + 1));
    }

    this.updateUI();
    this.updateHiddenInputs();
  }

  updateUI() {
    const percentMin = ((this.valueMin - this.min) / (this.max - this.min)) * 100;
    const percentMax = ((this.valueMax - this.min) / (this.max - this.min)) * 100;

    // Position thumbs
    this.thumbMin.style.left = `${percentMin}%`;
    this.thumbMax.style.left = `${percentMax}%`;

    // Update range fill
    this.range.style.left = `${percentMin}%`;
    this.range.style.right = `${100 - percentMax}%`;

    // Update display values
    this.displayMin.textContent = `${this.currency}${this.formatPrice(this.valueMin / 100)}`;
    this.displayMax.textContent = `${this.currency}${this.formatPrice(this.valueMax / 100)}`;
  }

  formatPrice(val) {
    // Always show whole numbers, no decimals
    return Math.round(val).toString();
  }

  updateHiddenInputs() {
    // Convert from cents to dollars for form submission
    const minPrice = (this.valueMin / 100).toFixed(2);
    const maxPrice = (this.valueMax / 100).toFixed(2);

    // Only set value if it's different from the range bounds
    if (this.valueMin > this.min) {
      this.hiddenMin.value = minPrice;
    } else {
      this.hiddenMin.value = '';
    }

    if (this.valueMax < this.max) {
      this.hiddenMax.value = maxPrice;
    } else {
      this.hiddenMax.value = '';
    }

    // Trigger form change event for FacetsManager to pick up
    this.hiddenMin.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

// Define custom element
if (!customElements.get('price-range')) {
  customElements.define('price-range', PriceRange);
}

export { PriceRange };
export default PriceRange;
