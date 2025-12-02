import { Piece } from 'piecesjs';

/**
 * Show More Component
 * Expands hidden items with a toggle button
 */
class ShowMore extends Piece {
  constructor() {
    super('ShowMore', {
      stylesheets: [],
    });
  }

  mount() {
    this.$button = this.$('button')[0];
    if (!this.$button) return;

    this.on('click', this.$button, this.expand);
  }

  unmount() {
    if (this.$button) {
      this.off('click', this.$button, this.expand);
    }
  }

  expand(event) {
    const parentDisplay = event.target.closest('[id^="Show-More-"]')?.closest('.parent-display');
    if (!parentDisplay) return;

    // Toggle label text visibility
    this.$$('.label-text').forEach((el) => el.classList.toggle('hidden'));

    // Toggle hidden items
    parentDisplay.querySelectorAll('.show-more-item').forEach((item) => {
      item.classList.toggle('hidden');
    });

    // Hide button if no "show less" label exists
    if (!this.$('.label-show-less')[0]) {
      this.classList.add('hidden');
    }

    // Focus first newly visible input
    const nextElement = parentDisplay.querySelector('.show-more-item:not(.hidden)');
    if (nextElement) {
      const input = nextElement.querySelector('input');
      if (input) input.focus();
    }
  }
}

customElements.define('show-more-button', ShowMore);
export default ShowMore;
