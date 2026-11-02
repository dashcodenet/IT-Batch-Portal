/**
 * Favorites.js - LocalStorage management for saved files
 */
const Favorites = {
    getKey() { return APP_CONFIG.STORAGE_KEYS.FAVORITES; },
    
    getAll() {
        try {
            return JSON.parse(localStorage.getItem(this.getKey())) || [];
        } catch { return []; }
    },

    has(id) {
        return this.getAll().includes(id);
    },

    toggle(id) {
        let favs = this.getAll();
        if (favs.includes(id)) {
            favs = favs.filter(favId => favId !== id);
            Toast.show(I18n.currentLang === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from favorites', 'info');
        } else {
            favs.push(id);
            Toast.show(I18n.currentLang === 'ar' ? 'تم الحفظ في المفضلة' : 'Saved to favorites', 'success');
        }
        localStorage.setItem(this.getKey(), JSON.stringify(favs));
        return favs.includes(id);
    }
};