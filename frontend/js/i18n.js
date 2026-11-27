/**
 * I18n.js - إدارة اللغات والترجمة
 * ⭐️ النسخة النهائية: تدعم المفاتيح المتداخلة مثل "nav.home"
 */
const I18n = {
    currentLang: 'en', // ⭐️ اللغة الافتراضية: الإنجليزية
    translations: {},
    isLoaded: false,

    async init() {
        // 1. تحديد اللغة المحفوظة أو الإنجليزية كافتراضي
        this.currentLang = localStorage.getItem('itp_lang') || 'en';
        
        // 2. تحديث اتجاه الصفحة وكلاساتها
        this.applyDirection();
        
        // 3. تحميل ملف الترجمة
        await this.loadTranslations();
        
        // 4. تحديث النصوص في الصفحة
        this.updateDOM();
        
        this.isLoaded = true;
        return this;
    },

    applyDirection() {
        document.documentElement.lang = this.currentLang;
        document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
        document.body.classList.remove('lang-ar', 'lang-en');
        document.body.classList.add(`lang-${this.currentLang}`);
    },

    async loadTranslations() {
        try {
            const response = await fetch(`locales/${this.currentLang}.json?v=${Date.now()}`);
            if (!response.ok) throw new Error('Translation file not found');
            this.translations = await response.json();
        } catch (error) {
            console.error("[I18n] Failed to load translations:", error);
            this.translations = {};
        }
    },

    /**
     * ⭐️ جلب نص بمفتاح متداخل مثل "nav.home" أو "common.preview"
     */
    t(key) {
        if (!key) return '';
        const parts = key.split('.');
        let value = this.translations;
        
        for (const part of parts) {
            if (value === undefined || value === null) return key;
            value = value[part];
        }
        
        return (value !== undefined && value !== null) ? value : key;
    },

    /**
     * ⭐️ تحديث جميع النصوص في الـ DOM
     */
    updateDOM() {
        // 1. النصوص العادية
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translated = this.t(key);
            if (translated && translated !== key) {
                el.textContent = translated;
            }
        });

        // 2. الـ Placeholder (مثل حقل البحث)
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translated = this.t(key);
            if (translated && translated !== key) {
                el.setAttribute('placeholder', translated);
            }
        });

        // 3. الـ Title (مثل tooltips)
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translated = this.t(key);
            if (translated && translated !== key) {
                el.setAttribute('title', translated);
            }
        });

        // 4. تحديث عنوان الصفحة (Title) إذا كان موجوداً في الترجمة
        const pageTitle = document.querySelector('title[data-i18n]');
        if (pageTitle) {
            const key = pageTitle.getAttribute('data-i18n');
            const translated = this.t(key);
            if (translated && translated !== key) pageTitle.textContent = translated;
        }

        // ⭐️ 5. إعادة رسم أيقونات Lucide بعد تغيير النصوص
        if (window.lucide) lucide.createIcons();
    },

    /**
     * ⭐️ تغيير اللغة وحفظها، ثم إعادة تحديث كل شيء
     */
    async changeLanguage(newLang) {
        if (!['ar', 'en'].includes(newLang)) return;
        
        localStorage.setItem('itp_lang', newLang);
        this.currentLang = newLang;
        
        this.applyDirection();
        await this.loadTranslations();
        this.updateDOM();
        
        // إطلاق حدث لبقية الملفات (مثل ui.js و main.js) لإعادة الرسم
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: newLang } }));
    }
};

window.I18n = I18n;