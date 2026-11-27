/**
 * Favorites.js - إدارة المفضلة
 * ⭐️ يدعم الترجمة في الإشعارات
 */
const Favorites = {
    storageKey: 'itp_favorites',

    getAll() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || [];
        } catch {
            return [];
        }
    },

    has(id) {
        return this.getAll().some(f => f.id === id);
    },

    toggle(file) {
        let favs = this.getAll();
        const index = favs.findIndex(f => f.id === file.id);
        let isAdded = false;

        if (index > -1) {
            favs.splice(index, 1);
        } else {
            favs.push(file);
            isAdded = true;
        }

        localStorage.setItem(this.storageKey, JSON.stringify(favs));
        return isAdded;
    },

    remove(id) {
        let favs = this.getAll();
        favs = favs.filter(f => f.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(favs));
    }
};

window.Favorites = Favorites;

// ⭐️ دالة تبديل المفضلة مع إشعارات مترجمة
window.toggleFav = function(btnElement, file) {
    const isAdded = Favorites.toggle(file);
    
    if (isAdded) {
        btnElement.classList.add('active');
        if (typeof Toast !== 'undefined') {
            Toast.show('toast.added_fav', 'success');
        }
    } else {
        btnElement.classList.remove('active');
        if (typeof Toast !== 'undefined') {
            Toast.show('toast.removed_fav', 'info');
        }
    }
};