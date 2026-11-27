/**
 * Lang-switcher.js - زر تبديل اللغة
 * ⭐️ النسخة النهائية: مغلفة بـ IIFE لمنع خطأ Redeclaration
 */
(function() {
    'use strict';

    const LangSwitcher = {
        init() {
            const btn = document.getElementById('lang-toggle');
            if (!btn) return;

            // تحديث نص الزر ليعكس اللغة التي سيتم التبديل إليها
            this.updateButtonText(btn);

            // إزالة أي مستمع أحداث قديم لمنع التكرار
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const newLang = I18n.currentLang === 'ar' ? 'en' : 'ar';
                
                // تغيير اللغة من خلال I18n (الذي يقوم بكل شيء: الحفظ، التحديث، إطلاق الحدث)
                await I18n.changeLanguage(newLang);
                
                // تحديث نص الزر
                this.updateButtonText(newBtn);
            });
        },

        updateButtonText(btn) {
            // إذا كنا بالعربية، الزر يعرض "EN"، والعكس
            btn.textContent = I18n.currentLang === 'ar' ? 'EN' : 'AR';
        }
    };

    window.LangSwitcher = LangSwitcher;

    // التشغيل عند اكتمال تحميل الصفحة
    document.addEventListener('DOMContentLoaded', () => {
        // ننتظر قليلاً حتى يكون I18n جاهزاً
        setTimeout(() => {
            if (window.I18n && I18n.isLoaded) {
                LangSwitcher.init();
            } else if (window.I18n) {
                LangSwitcher.init();
            }
        }, 100);
    });
})();