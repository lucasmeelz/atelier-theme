/**
 * Video Player — Web Component
 * Handles: poster click → play, external video lazy-load,
 * Shopify editor events
 */

if (!customElements.get('video-player')) {
  class VideoPlayer extends HTMLElement {
    constructor() {
      super();
      this.poster = this.querySelector('[data-poster]');
      this.video = this.querySelector('video');
      this.playBtn = this.querySelector('.video-section__play-btn');
      this.iframeWrap = this.querySelector('[data-iframe-wrap]');
    }

    connectedCallback() {
      if (this._initialized) return;
      this._initialized = true;

      this._handlePlay = this.handlePlay.bind(this);

      if (this.playBtn) {
        this.playBtn.addEventListener('click', this._handlePlay);
      }

      if (this.poster) {
        this.poster.addEventListener('click', this._handlePlay);
      }

      // Autoplay: no poster needed, video plays on its own
      if (this.dataset.autoplay === 'true' && this.video) {
        this.video.play().catch(() => {});
      }
    }

    handlePlay() {
      if (this.video) {
        // Shopify-hosted video
        this.video.play().catch(() => {});
        this.hidePoster();
      } else if (this.playBtn?.dataset.videoUrl) {
        // External video with poster — lazy-load iframe
        this.loadExternalVideo(this.playBtn.dataset.videoUrl);
        this.hidePoster();
      }
    }

    hidePoster() {
      if (this.poster) {
        this.poster.classList.add('is-hidden');
      }
    }

    loadExternalVideo(url) {
      const mediaEl = this.querySelector('.video-section__media');
      if (!mediaEl) return;

      let iframeSrc = '';

      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('v=')) {
          videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].split('?')[0];
        }
        iframeSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
      } else if (url.includes('vimeo.com')) {
        const videoId = url.split('vimeo.com/')[1].split('?')[0].split('/')[0];
        iframeSrc = `https://player.vimeo.com/video/${videoId}?autoplay=1&playsinline=1`;
      }

      if (iframeSrc) {
        const wrap = document.createElement('div');
        wrap.className = 'video-section__iframe-wrap';
        wrap.innerHTML = `<iframe
          src="${iframeSrc}"
          allow="autoplay; encrypted-media"
          allowfullscreen
          title="Video"
          class="video-section__iframe"
        ></iframe>`;
        mediaEl.appendChild(wrap);
      }
    }

    disconnectedCallback() {
      if (this.playBtn && this._handlePlay) {
        this.playBtn.removeEventListener('click', this._handlePlay);
      }
      if (this.poster && this._handlePlay) {
        this.poster.removeEventListener('click', this._handlePlay);
      }
      this._initialized = false;
    }
  }

  customElements.define('video-player', VideoPlayer);
}

// Shopify section events — web components auto-reconnect via connectedCallback
// No manual re-initialization needed; custom elements handle this natively
