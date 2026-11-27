/**
 * ============================================================
 * IT-Batch-Portal - router.js
 * قراءة وكتابة معاملات الرابط (?year=&term=&subject=&lang=)
 * ============================================================
 */

const Router = {
  /**
   * قراءة كل معاملات الرابط الحالي
   */
  params() {
    const p = new URLSearchParams(location.search);
    return {
      year: p.get('year') ? parseInt(p.get('year'), 10) : null,
      term: p.get('term') ? parseInt(p.get('term'), 10) : null,
      subject: p.get('subject') || null,
      lang: p.get('lang') || null,
      category: p.get('category') || null,
      search: p.get('q') || null,
      page: p.get('page') ? parseInt(p.get('page'), 10) : 1
    };
  },

  /**
   * بناء رابط مع معاملات جديدة (بدون إعادة تحميل)
   */
  build(path, params = {}) {
    const url = new URL(path, location.origin);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') {
        url.searchParams.set(k, v);
      }
    });
    // احتفظ باللغة الحالية
    if (window.I18N?.current && !url.searchParams.has('lang')) {
      url.searchParams.set('lang', window.I18N.current);
    }
    return url.toString();
  },

  /**
   * الانتقال إلى رابط (مع الحفاظ على اللغة)
   */
  go(path, params = {}) {
    location.href = this.build(path, params);
  },

  /**
   * تحديث الرابط الحالي بدون إعادة تحميل (history API)
   */
  update(params = {}) {
    const url = new URL(location.href);
    Object.entries(params).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '') {
        url.searchParams.delete(k);
      } else {
        url.searchParams.set(k, v);
      }
    });
    history.replaceState({}, '', url.toString());
  },

  /**
   * إنشاء رابط صفحة الملفات
   */
  filesUrl(year, term, subject) {
    return this.build('/files.html', { year, term, subject });
  },

  /**
   * إنشاء رابط صفحة المواد
   */
  materialsUrl(year, term) {
    return this.build('/materials.html', { year, term });
  },

  /**
   * بناء رابط API (للاستخدام الداخلي)
   */
  apiUrl(action, params = {}) {
    const url = new URL(window.APP_CONFIG.API_URL);
    url.searchParams.set('action', action);
    url.searchParams.set('lang', window.I18N?.current || 'ar');
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') url.searchParams.set(k, v);
    });
    return url.toString();
  }
};

window.Router = Router;