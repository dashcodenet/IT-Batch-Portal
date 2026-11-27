/**
 * ============================================================
 * IT-Batch-Portal - search.js
 * بحث فوري متطور (يدعم تطبيع النص العربي + رسالة "لا توجد نتائج")
 * ============================================================
 */

const SearchManager = {
  init(inputId = 'search-input', listId = null) {
    const input = document.getElementById(inputId);
    if (!input) return;

    // ⭐️ منع تكرار مستمعي الأحداث عند إعادة فتح الفئات
    if (input.dataset.searchInitialized === 'true') return;
    input.dataset.searchInitialized = 'true';

    input.addEventListener('input', (e) => this.filter(e.target.value, listId));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { 
        input.value = ''; 
        this.filter('', listId); 
      }
    });
  },

  // ⭐️ دالة ذكية لتوحيد الحروف العربية (تتجاهل الهمزات والتشكيل)
  normalize(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/[ىي]/g, 'ي')
      .replace(/[\u064B-\u0652]/g, '') // إزالة التشكيل
      .trim();
  },

  filter(query, listId) {
    const q = this.normalize(query);
    const container = listId ? document.getElementById(listId) : document;
    if (!container) return;

    const cards = container.querySelectorAll('[data-searchable]');
    let visibleCount = 0;

    // إخفاء أو إظهار الملفات بناءً على البحث
    cards.forEach(card => {
      const text = this.normalize(card.dataset.searchable);
      const match = !q || text.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });

    // ⭐️ إدارة رسالة "لا توجد نتائج" ديناميكياً
    let emptyState = document.getElementById('search-empty-state');
    
    // إذا لم تكن الرسالة موجودة في الصفحة، نقوم بإنشائها
    if (!emptyState && container.id === 'files-list') {
      emptyState = document.createElement('div');
      emptyState.id = 'search-empty-state';
      // تصميم الرسالة (تأخذ عرض الحاوية بالكامل وتكون في المنتصف)
      emptyState.style.cssText = 'display: none; flex-direction: column; align-items: center; justify-content: center; width: 100%; padding: 40px 20px; text-align: center; color: var(--color-text-muted); background: var(--color-surface); border: 1px dashed var(--color-border); border-radius: var(--radius-md); margin-top: 10px;';
      emptyState.innerHTML = `
        <i data-lucide="search-x" style="width:48px;height:48px;margin-bottom:16px;opacity:0.6;"></i>
        <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 8px; color: var(--color-text);">لا توجد نتائج مطابقة</h3>
        <p style="font-size: 0.95rem;">لم نتمكن من العثور على ملفات تطابق بحثك. جرب استخدام كلمات أخرى.</p>
      `;
      container.appendChild(emptyState);
      if (window.lucide) lucide.createIcons();
    }

    // إظهار أو إخفاء الرسالة بناءً على عدد النتائج
    if (emptyState) {
      if (visibleCount === 0 && q !== '') {
        emptyState.style.display = 'flex';
      } else {
        emptyState.style.display = 'none';
      }
    }
  }
};

// ⭐️ تصدير الدالة بالأسماء التي يستخدمها موقعك
window.SearchManager = SearchManager;
window.Search = SearchManager;