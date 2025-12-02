import { Piece } from 'piecesjs';

/**
 * Share Button Component
 * Native share API with clipboard fallback
 */
class ShareButton extends Piece {
  constructor() {
    super('ShareButton', {
      stylesheets: [],
    });
  }

  mount() {
    this.$shareButton = this.$('button')[0];
    this.$summary = this.$('summary')[0];
    this.$details = this.$('details')[0];
    this.$closeButton = this.$('.share-button__close')[0];
    this.$successMessage = this.$('[id^="ShareMessage"]')[0];
    this.$urlInput = this.$('input')[0];
    this.$copyButton = this.$('.share-button__copy')[0];

    this.urlToShare = this.$urlInput?.value || window.location.href;

    // Use native share API if available
    if (navigator.share) {
      if (this.$details) {
        this.$details.setAttribute('hidden', '');
      }
      if (this.$shareButton) {
        this.$shareButton.classList.remove('hidden');
        this.on('click', this.$shareButton, this.nativeShare);
      }
    } else {
      // Fallback to copy-to-clipboard
      if (this.$details) {
        this.on('toggle', this.$details, this.onToggle);
      }
      if (this.$copyButton) {
        this.on('click', this.$copyButton, this.copyToClipboard);
      }
      if (this.$closeButton) {
        this.on('click', this.$closeButton, this.close);
      }
    }
  }

  unmount() {
    if (navigator.share) {
      if (this.$shareButton) {
        this.off('click', this.$shareButton, this.nativeShare);
      }
    } else {
      if (this.$details) {
        this.off('toggle', this.$details, this.onToggle);
      }
      if (this.$copyButton) {
        this.off('click', this.$copyButton, this.copyToClipboard);
      }
      if (this.$closeButton) {
        this.off('click', this.$closeButton, this.close);
      }
    }
  }

  nativeShare() {
    navigator.share({
      url: this.urlToShare,
      title: document.title,
    });
  }

  onToggle() {
    if (!this.$details?.open) {
      if (this.$successMessage) {
        this.$successMessage.classList.add('hidden');
        this.$successMessage.textContent = '';
      }
      if (this.$closeButton) {
        this.$closeButton.classList.add('hidden');
      }
      this.$summary?.focus();
    }
  }

  copyToClipboard() {
    if (!this.$urlInput) return;

    navigator.clipboard.writeText(this.$urlInput.value).then(() => {
      if (this.$successMessage) {
        this.$successMessage.classList.remove('hidden');
        this.$successMessage.textContent = window.accessibilityStrings?.shareSuccess || 'Link copied!';
      }
      if (this.$closeButton) {
        this.$closeButton.classList.remove('hidden');
        this.$closeButton.focus();
      }
    });
  }

  close() {
    if (this.$details) {
      this.$details.open = false;
    }
    this.onToggle();
  }

  updateUrl(url) {
    this.urlToShare = url;
    if (this.$urlInput) {
      this.$urlInput.value = url;
    }
  }
}

customElements.define('share-button', ShareButton);
export default ShareButton;
