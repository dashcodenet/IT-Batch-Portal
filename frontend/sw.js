const CACHE_NAME = 'itp-cache-v38'; // ⭐️ تم رفع الإصدار لمسح الكاش المعطل
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
    '/css/whats-new.css', // ⭐️ تمت الإضافة
    '/css/toast.css',     // ⭐️ تمت الإضافة
    '/js/config.js',
    '/js/api.js',
    '/js/cache.js',
    '/js/error-handler.js',
    '/js/toast.js',
    '/js/i18n.js',
    '/js/lang-switcher.js',
    '/js/ui.js',
    '/js/main.js',
    '/js/pwa.js',
    '/js/layout.js',
    '/js/whats-new.js',   // ⭐️ تمت الإضافة
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
    // 1. استثناء صارم: لا تعترض أي طلب لـ Cloudflare أو Google Apps Script أو Telegram
    if (
        e.request.url.includes('script.google.com') || 
        e.request.url.includes('macros/echo') || 
        e.request.url.includes('api.telegram.org') ||
        e.request.url.includes('workers.dev') ||
        e.request.url.includes('vercel.app/api') ||
        e.request.method !== 'GET' // ⭐️ هام: لا تتعامل مع طلبات POST
    ) {
        return; 
    }

    // 2. استراتيجية ملفات HTML (الشبكة أولاً)
    if (e.request.destination === 'document') {
        e.respondWith(
            fetch(e.request)
                .then((networkResponse) => {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, responseClone);
                    });
                    return networkResponse;
                })
                .catch(() => {
                    return caches.match(e.request).then((cachedResponse) => {
                        return cachedResponse || caches.match('/offline.html');
                    });
                })
        );
        return;
    }

    // 3. استراتيجية ملفات التصميم والجافاسكريبت والخطوط (الكاش أولاً)
    if (e.request.destination === 'style' || e.request.destination === 'script' || e.request.destination === 'font') {
        e.respondWith(
            caches.match(e.request).then((cachedResponse) => {
                const fetchPromise = fetch(e.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.ok) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(e.request, networkResponse.clone());
                        });
                    }
                    return networkResponse;
                }).catch(() => {
                    // ⭐️ إصلاح الخطأ الأحمر: إذا فشل الاتصال وكان الملف غير موجود في الكاش، أرجع خطأ 404 بدلاً من الانهيار
                    return cachedResponse || new Response('', { status: 404, statusText: 'Network Error' });
                });

                // إذا وجدت الملف في الكاش، أرجعه فوراً
                return cachedResponse || fetchPromise;
            })
        );
        return;
    }

    // 4. الصور والملفات الأخرى (الشبكة أولاً مع الحفظ في الكاش)
    e.respondWith(
        fetch(e.request)
            .then((response) => {
                if (response.ok && e.request.destination === 'image') {
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
                    // ⭐️ إذا فشلت الصورة، أرجع استجابة فارغة بدلاً من كسر الصفحة
                    return new Response('', { status: 404, statusText: 'Image Not Found' });
                });
            })
    );
});