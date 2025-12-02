/**
 * Deferred Media Component
 * Lazy-loads videos, iframes, and 3D models
 */
class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia?.();

    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));

      if (focus) deferredElement.focus();

      if (deferredElement.nodeName === 'VIDEO' && deferredElement.getAttribute('autoplay')) {
        // Force autoplay for Safari
        deferredElement.play();
      }

      // Workaround for Safari iframe bug
      const formerStyle = deferredElement.getAttribute('style');
      deferredElement.setAttribute('style', 'display: block;');
      window.setTimeout(() => {
        deferredElement.setAttribute('style', formerStyle);
      }, 0);
    }
  }
}

customElements.define('deferred-media', DeferredMedia);
