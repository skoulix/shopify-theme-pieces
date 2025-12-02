import { Piece } from 'piecesjs';

/**
 * Localization Form Component
 * Country/language selector with search and keyboard navigation
 */
class LocalizationForm extends Piece {
  constructor() {
    super('LocalizationForm', {
      stylesheets: [],
    });

    this.mql = window.matchMedia('(min-width: 750px)');
  }

  mount() {
    this.$header = document.querySelector('.header-wrapper');
    this.$input = this.$('input[name="locale_code"], input[name="country_code"]')[0];
    this.$button = this.$('button.localization-form__select')[0];
    this.$panel = this.$('.disclosure__list-wrapper')[0];
    this.$search = this.$('input[name="country_filter"]')[0];
    this.$closeButton = this.$('.country-selector__close-button')[0];
    this.$resetButton = this.$('.country-filter__reset-button')[0];
    this.$searchIcon = this.$('.country-filter__search-icon')[0];
    this.$liveRegion = this.$('#sr-country-search-results')[0];

    // Container events
    this.on('keyup', this, this.onContainerKeyUp);
    this.on('keydown', this, this.onContainerKeyDown);
    this.on('focusout', this, this.closeSelector);

    // Button
    if (this.$button) {
      this.on('click', this.$button, this.openSelector);
    }

    // Search input
    if (this.$search) {
      this.on('keyup', this.$search, this.filterCountries);
      this.on('focus', this.$search, this.onSearchFocus);
      this.on('blur', this.$search, this.onSearchBlur);
      this.on('keydown', this.$search, this.onSearchKeyDown);
    }

    // Close button
    if (this.$closeButton) {
      this.on('click', this.$closeButton, this.hidePanel);
    }

    // Reset button
    if (this.$resetButton) {
      this.on('click', this.$resetButton, this.resetFilter);
      this.on('mousedown', this.$resetButton, (e) => e.preventDefault());
    }

    // Item links
    this.$$('a').forEach((item) => {
      this.on('click', item, this.onItemClick);
    });
  }

  unmount() {
    this.off('keyup', this, this.onContainerKeyUp);
    this.off('keydown', this, this.onContainerKeyDown);
    this.off('focusout', this, this.closeSelector);

    if (this.$button) {
      this.off('click', this.$button, this.openSelector);
    }

    if (this.$search) {
      this.off('keyup', this.$search, this.filterCountries);
      this.off('focus', this.$search, this.onSearchFocus);
      this.off('blur', this.$search, this.onSearchBlur);
      this.off('keydown', this.$search, this.onSearchKeyDown);
    }

    if (this.$closeButton) {
      this.off('click', this.$closeButton, this.hidePanel);
    }

    if (this.$resetButton) {
      this.off('click', this.$resetButton, this.resetFilter);
    }

    this.$$('a').forEach((item) => {
      this.off('click', item, this.onItemClick);
    });
  }

  hidePanel() {
    if (this.$button) {
      this.$button.setAttribute('aria-expanded', 'false');
    }
    if (this.$panel) {
      this.$panel.setAttribute('hidden', true);
    }
    if (this.$search) {
      this.$search.value = '';
      this.filterCountries();
      this.$search.setAttribute('aria-activedescendant', '');
    }

    document.body.classList.remove('overflow-hidden-mobile');
    document.querySelector('.menu-drawer')?.classList.remove('country-selector-open');

    if (this.$header) {
      this.$header.preventHide = false;
    }
  }

  onContainerKeyDown(event) {
    const focusableItems = Array.from(this.querySelectorAll('a')).filter(
      (item) => !item.parentElement.classList.contains('hidden')
    );
    let focusedItemIndex = focusableItems.findIndex((item) => item === document.activeElement);
    let itemToFocus;

    switch (event.code.toUpperCase()) {
      case 'ARROWUP':
        event.preventDefault();
        itemToFocus =
          focusedItemIndex > 0
            ? focusableItems[focusedItemIndex - 1]
            : focusableItems[focusableItems.length - 1];
        itemToFocus?.focus();
        break;
      case 'ARROWDOWN':
        event.preventDefault();
        itemToFocus =
          focusedItemIndex < focusableItems.length - 1
            ? focusableItems[focusedItemIndex + 1]
            : focusableItems[0];
        itemToFocus?.focus();
        break;
    }

    if (!this.$search) return;

    setTimeout(() => {
      focusedItemIndex = focusableItems.findIndex((item) => item === document.activeElement);
      if (focusedItemIndex > -1) {
        this.$search.setAttribute('aria-activedescendant', focusableItems[focusedItemIndex].id);
      } else {
        this.$search.setAttribute('aria-activedescendant', '');
      }
    });
  }

  onContainerKeyUp(event) {
    event.preventDefault();

    switch (event.code.toUpperCase()) {
      case 'ESCAPE':
        if (this.$button?.getAttribute('aria-expanded') === 'false') return;
        this.hidePanel();
        event.stopPropagation();
        this.$button?.focus();
        break;
      case 'SPACE':
        if (this.$button?.getAttribute('aria-expanded') === 'true') return;
        this.openSelector();
        break;
    }
  }

  onItemClick(event) {
    event.preventDefault();
    const form = this.$('form')[0];
    if (this.$input) {
      this.$input.value = event.currentTarget.dataset.value;
    }
    if (form) form.submit();
  }

  openSelector() {
    this.$button?.focus();
    this.$panel?.toggleAttribute('hidden');
    this.$button?.setAttribute(
      'aria-expanded',
      (this.$button?.getAttribute('aria-expanded') === 'false').toString()
    );

    if (!document.body.classList.contains('overflow-hidden-tablet')) {
      document.body.classList.add('overflow-hidden-mobile');
    }

    if (this.$search && this.mql.matches) {
      this.$search.focus();
    }

    if (this.hasAttribute('data-prevent-hide') && this.$header) {
      this.$header.preventHide = true;
    }

    document.querySelector('.menu-drawer')?.classList.add('country-selector-open');
  }

  closeSelector(event) {
    if (
      event.target.classList.contains('country-selector__overlay') ||
      !this.contains(event.target) ||
      !this.contains(event.relatedTarget)
    ) {
      this.hidePanel();
    }
  }

  normalizeString(str) {
    return str
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase();
  }

  filterCountries() {
    const searchValue = this.normalizeString(this.$search?.value || '');
    const popularCountries = this.$('.popular-countries')[0];
    const allCountries = this.$$('a');
    let visibleCountries = allCountries.length;

    this.$resetButton?.classList.toggle('hidden', !searchValue);

    if (popularCountries) {
      popularCountries.classList.toggle('hidden', !!searchValue);
    }

    allCountries.forEach((item) => {
      const countryEl = item.querySelector('.country');
      const countryName = this.normalizeString(countryEl?.textContent || '');
      if (countryName.indexOf(searchValue) > -1) {
        item.parentElement?.classList.remove('hidden');
        visibleCountries++;
      } else {
        item.parentElement?.classList.add('hidden');
        visibleCountries--;
      }
    });

    if (this.$liveRegion && window.accessibilityStrings?.countrySelectorSearchCount) {
      this.$liveRegion.innerHTML = window.accessibilityStrings.countrySelectorSearchCount.replace(
        '[count]',
        visibleCountries
      );
    }

    this.$('.country-selector')[0]?.scrollTo(0, 0);
    this.$('.country-selector__list')[0]?.scrollTo(0, 0);
  }

  resetFilter(event) {
    event.stopPropagation();
    if (this.$search) {
      this.$search.value = '';
    }
    this.filterCountries();
    this.$search?.focus();
  }

  onSearchFocus() {
    this.$searchIcon?.classList.add('country-filter__search-icon--hidden');
  }

  onSearchBlur() {
    if (!this.$search?.value) {
      this.$searchIcon?.classList.remove('country-filter__search-icon--hidden');
    }
  }

  onSearchKeyDown(event) {
    if (event.code.toUpperCase() === 'ENTER') {
      event.preventDefault();
    }
  }
}

customElements.define('localization-form', LocalizationForm);
export default LocalizationForm;
