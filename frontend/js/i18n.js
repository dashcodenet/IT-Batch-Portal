const I18n = {
    currentLang: APP_CONFIG.DEFAULT_LANG,
    translations: {},

    async init() {
        const savedLang = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.LANG);
        this.currentLang = savedLang || (['ar', 'en'].includes(navigator.language.split('-')[0]) ? navigator.language.split('-')[0] : APP_CONFIG.DEFAULT_LANG);

        await this.loadTranslations();
        this.applyDirection();
        this.updateDOM(); // تحديث النصوص الثابتة عند بدء التشغيل
    },

    async loadTranslations() {
        try {
            const response = await fetch(`locales/${this.currentLang}.json`);
            this.translations = await response.json();
        } catch (error) {
            console.error('Failed to load translations:', error);
        }
    },

    t(key) {
        return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : key, this.translations);
    },

    async setLang(lang) {
        if (lang === this.currentLang) return;
        
        this.currentLang = lang;
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.LANG, lang);
        
        await this.loadTranslations();
        this.applyDirection();
        this.updateDOM(); // تحديث النصوص عند تغيير اللغة
        
        window.dispatchEvent(new Event('languageChanged'));
    },

    applyDirection() {
        const isRtl = this.currentLang === 'ar';
        document.documentElement.lang = this.currentLang;
        document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
        document.body.classList.toggle('lang-ar', isRtl);
        document.body.classList.toggle('lang-en', !isRtl);
    },

    // تحديث النصوص العادية والـ Placeholders
    updateDOM() {
        // 1. للنصوص العادية
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation !== key) {
                el.textContent = translation;
            }
        });
        
        // 2. للـ Placeholders في حقول الإدخال (مثل حقل البحث)
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            if (translation !== key) {
                el.placeholder = translation;
            }
        });
    }
};