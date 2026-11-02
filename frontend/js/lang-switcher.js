/**
 * LangSwitcher.js - Handles the UI toggle for AR/EN
 */
const LangSwitcher = {
    init() {
        this.btn = document.getElementById('lang-toggle');
        if (!this.btn) return;

        this.updateButtonText();
        
        this.btn.addEventListener('click', async () => {
            const newLang = I18n.currentLang === 'ar' ? 'en' : 'ar';
            await I18n.setLang(newLang);
            this.updateButtonText();
        });

        window.addEventListener('languageChanged', () => {
            this.updateButtonText();
        });
    },

    updateButtonText() {
        if (this.btn) {
            // Show the language it will switch TO
            this.btn.textContent = I18n.currentLang === 'ar' ? 'EN' : 'AR';
        }
    }
};