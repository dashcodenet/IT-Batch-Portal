/**
 * ============================================================
 * IT-Batch-Portal - search.js
 * بحث فوري في أسماء الملفات (client-side)
 * ============================================================
 */

const Search = {
  input: null,
  items: [],

  init(container) {
    this.input = document.getElementById('search-input');
    if (!this.input) return;

    this.input.addEventListener('input', e => this.filter(e.target.value));
    this.input.addEventListener('keydown', e => {
      if (e.key === 'Escape') { this.input.value = ''; this.filter(''); }
    });
  },

  /**
   * تخزين كل البطاقات للبحث فيها
   */
  register(cards) {
    this.items = Array.from(document.querySelectorAll('[data-searchable]'));
  },

  filter(query) {
    const q = (query || '').trim().toLowerCase();
    const cards = document.querySelectorAll('[data-searchable]');
    let visible = 0;
    cards.forEach(card => {
      const text = (card.dataset.searchable || '').toLowerCase();
      const match = !q || text.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });

    const counter = document.getElementById('search-count');
    if (counter) {
      counter.textContent = q
        ? `${visible} ${I18N.t('search.results') || 'نتيجة'}`
        : '';
    }

    const emptyEl = document.getElementById('search-empty');
    if (emptyEl) emptyEl.style.display = visible === 0 ? 'block' : 'none';
  }
};

window.Search = Search;