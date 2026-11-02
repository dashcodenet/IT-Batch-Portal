/**
 * Cache.js - Client-side caching using localStorage
 * Provides fast, offline-capable data retrieval with TTL.
 */
const CacheManager = {
    set(key, data, ttlMinutes = APP_CONFIG.CLIENT_CACHE_TTL_MINUTES) {
        try {
            const payload = {
                timestamp: Date.now(),
                expiresAt: Date.now() + (ttlMinutes * 60 * 1000),
                data: data
            };
            localStorage.setItem(`itp_cache_${key}`, JSON.stringify(payload));
        } catch (e) {
            console.warn('Cache write failed (Quota exceeded?):', e);
        }
    },

    get(key) {
        try {
            const raw = localStorage.getItem(`itp_cache_${key}`);
            if (!raw) return null;

            const payload = JSON.parse(raw);
            if (Date.now() > payload.expiresAt) {
                localStorage.removeItem(`itp_cache_${key}`);
                return null; // Expired
            }
            return payload.data;
        } catch (e) {
            return null;
        }
    },

    clearAll() {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('itp_cache_')) {
                localStorage.removeItem(key);
            }
        });
    }
};