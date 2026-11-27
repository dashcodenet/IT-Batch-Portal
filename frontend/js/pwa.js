// تسجيل Service Worker وتحديثه بصمت
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                // التحقق من وجود تحديثات في الخلفية
                registration.update();
            })
            .catch(error => {
                console.log('SW registration failed: ', error);
            });
    });

    // منع إعادة تحميل الصفحة تلقائياً عند تغير الـ Service Worker
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        // لا نقوم بعمل window.location.reload() هنا لتجنب البطء
    });
}