const CACHE_NAME = 'itp-cache-v6'; // ⭐️ رفع الإصدار لإجبار المتصفح على مسح الكاش القديم التالف
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/materials.html',
    '/files.html',
    '/offline.html',
    '/404.html',
    '/css/variables.css',
    '/css/reset.css',
    '/css/main.css',
    '/css/components.css',
    '/css/responsive.css',
    '/css/pages.css',
    '/js/config.js',
    '/js/api.js',
    '/js/cache.js',
    '/js/error-handler.js',
    '/js/toast.js',
    '/js/i18n.js',
    '/js/lang-switcher.js',
    '/js/theme-toggle.js',
    '/js/ui.js',
    '/js/main.js',
    '/js/pwa.js',
    '/manifest.json'
];

// Install Event - Cache the App Shell
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (e) => {
    // ⭐️ استثناء صارم: لا تعترض أي طلب لـ Cloudflare أو Google Apps Script أو Telegram
    if (
        e.request.url.includes('script.google.com') || 
        e.request.url.includes('macros/echo') || 
        e.request.url.includes('api.telegram.org') ||
        e.request.url.includes('workers.dev') // ⭐️ استثناء أوسع (أي worker)
    ) {
        return; 
    }

    // 1. ملفات الواجهة (HTML, CSS, JS, Fonts): نستخدم الكاش أولاً
    if (e.request.destination === 'document' || e.request.destination === 'style' || e.request.destination === 'script' || e.request.destination === 'font') {
        e.respondWith(
            caches.match(e.request).then((cachedResponse) => {
                const fetchPromise = fetch(e.request).then((networkResponse) => {
                    if (networkResponse.ok) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(e.request, networkResponse.clone());
                        });
                    }
                    return networkResponse;
                }).catch(() => {});

                return cachedResponse || fetchPromise;
            })
        );
        return;
    }

    // 2. الصور والملفات الأخرى
    e.respondWith(
        fetch(e.request)
            .then((response) => {
                if (response.ok && e.request.method === 'GET' && e.request.destination === 'image') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(e.request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    if (e.request.headers.get('accept') && e.request.headers.get('accept').includes('text/html')) {
                        return caches.match('/offline.html');
                    }
                });
            })
    );
});