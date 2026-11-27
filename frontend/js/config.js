/**
 * IT-Batch-Portal - Configuration
 * Central configuration for the frontend.
 */

// ⭐️ تعريف المتغيرات بشكل عام لمنع خطأ not defined في أي ملف
const WORKER_URL = 'https://it-batch-backend.itcore010.workers.dev/';
const CF_WORKER_URL = 'https://it-batch-backend.itcore010.workers.dev/';
const VERCEL_URL = 'https://it-batch-portal-frontend-flax.vercel.app/api/download';

const APP_CONFIG = {
    API_URL: 'https://script.google.com/macros/s/AKfycby87NnDPtmA33zKOe7sIAJ3eoWLl1JWaZ3d8vrgfOOSIwATmlgDXnhNAkyisoPMQmZYjA/exec',
    
    REFRESH_TOKEN: 'itp-2026-meqdam-secret',
    CLIENT_CACHE_TTL_MINUTES: 0, 
    DEFAULT_LANG: 'ar',
    STORAGE_KEYS: {
        THEME: 'itp_theme',
        LANG: 'itp_lang',
        FAVORITES: 'itp_favorites'
    }
};