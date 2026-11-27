/**
 * ============================================================
 * IT-Batch-Portal - refresh.js
 * زر "تحديث" — يمسح كاش المتصفح ويجلب من السيرفر
 * ============================================================
 */

const Refresh = {
  init() {
    const btn = document.getElementById('refresh-btn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.classList.add('spinning');
      try {
        await API.refreshAll();
        Toast.success(I18N.t('refresh.success') || 'تم التحديث — جاري إعادة التحميل...');
        setTimeout(() => location.reload(), 800);
      } catch (err) {
        Toast.error(err.message || 'فشل التحديث');
        btn.disabled = false;
        btn.classList.remove('spinning');
      }
    });
  }
};

window.Refresh = Refresh;