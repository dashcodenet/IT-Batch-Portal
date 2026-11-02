/**
 * IT-Batch-Portal - Configuration
 * Central configuration for the frontend.
 */
const APP_CONFIG = {
    // ⭐️ تم تحديث الرابط ليطابق النشر الجديد (AKfycby87...)
    API_URL: 'https://script.google.com/macros/s/AKfycby87NnDPtmA33zKOe7sIAJ3eoWLl1JWaZ3d8vrgfOOSIwATmlgDXnhNAkyisoPMQmZYjA/exec',
    
    REFRESH_TOKEN: 'itp-2026-meqdam-secret',
    
    // ⭐️ مدة الكاش صفر ليكون التحديث لحظياً
    CLIENT_CACHE_TTL_MINUTES: 0, 
    
    DEFAULT_LANG: 'ar',
    STORAGE_KEYS: {
        THEME: 'itp_theme',
        LANG: 'itp_lang',
        FAVORITES: 'itp_favorites'
    }
};