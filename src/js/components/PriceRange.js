/**
 * PriceRange - Dual range slider for price filtering
 * A custom element that provides a visual slider interface for price range selection
 */

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.boundOnInput = this.onInput.bind(this);
  }

  connectedCallback() {
    this.minSlider = this.querySelector('.price-range-input-min');
    this.maxSlider = this.querySelector('.price-range-input-max');
    this.progress = this.querySelector('.price-range-progress');
    this.displayMin = this.querySelector('.price-range-display-min');
    this.displayMax = this.querySelector('.price-range-display-max');
    this.hiddenMin = this.querySelector('.price-range-hidden-min');
    this.hiddenMax = this.querySelector('.price-range-hidden-max');
    this.currency = this.dataset.currency || '$';

    if (!this.minSlider || !this.maxSlider) return;

    this.minSlider.addEventListener('input', this.boundOnInput);
    this.maxSlider.addEventListener('input', this.boundOnInput);

    // Initial update
    this.updateProgress();
  }

  disconnectedCallback() {
    if (this.minSlider) {
      this.minSlider.removeEventListener('input', this.boundOnInput);
    }
    if (this.maxSlider) {
      this.maxSlider.removeEventListener('input', this.boundOnInput);
    }
  }

  onInput(event) {
    const minVal = parseInt(this.minSlider.value);
    const maxVal = parseInt(this.maxSlider.value);

    // Prevent sliders from crossing
    if (event.target.dataset.type === 'min' && minVal >= maxVal) {
      this.minSlider.value = maxVal - 1;
    } else if (event.target.dataset.type === 'max' && maxVal <= minVal) {
      this.maxSlider.value = minVal + 1;
    }

    this.updateProgress();
    this.updateDisplay();
    this.updateHiddenInputs();
  }

  updateProgress() {
    const min = parseInt(this.minSlider.min);
    const max = parseInt(this.minSlider.max);
    const minVal = parseInt(this.minSlider.value);
    const maxVal = parseInt(this.maxSlider.value);

    const leftPercent = ((minVal - min) / (max - min)) * 100;
    const rightPercent = 100 - ((maxVal - min) / (max - min)) * 100;

    this.progress.style.left = `${leftPercent}%`;
    this.progress.style.right = `${rightPercent}%`;
  }

  updateDisplay() {
    const minVal = parseInt(this.minSlider.value);
    const maxVal = parseInt(this.maxSlider.value);

    // Convert from cents to display value (divide by 100)
    const minDisplay = (minVal / 100).toFixed(2);
    const maxDisplay = (maxVal / 100).toFixed(2);

    // Remove trailing zeros for cleaner display
    const formatPrice = (val) => {
      const num = parseFloat(val);
      return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
    };

    this.displayMin.textContent = `${this.currency}${formatPrice(minDisplay)}`;
    this.displayMax.textContent = `${this.currency}${formatPrice(maxDisplay)}`;
  }

  updateHiddenInputs() {
    const minVal = parseInt(this.minSlider.value);
    const maxVal = parseInt(this.maxSlider.value);
    const maxRange = parseInt(this.minSlider.max);

    // Convert from cents to dollars for form submission
    const minPrice = (minVal / 100).toFixed(2);
    const maxPrice = (maxVal / 100).toFixed(2);

    // Only set value if it's different from the range bounds
    if (minVal > 0) {
      this.hiddenMin.value = minPrice;
    } else {
      this.hiddenMin.value = '';
    }

    if (maxVal < maxRange) {
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
