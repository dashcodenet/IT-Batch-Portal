/**
 * Spa.js - التنقل بين الصفحات دون إعادة تحميل (النسخة الآمنة)
 * ⭐️ تحل مشكلة تكرار تحميل السكربتات (redeclaration of const) نهائياً
 */
const SpaRouter = {
    init() {
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            const href = link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.getAttribute('target') === '_blank') return;

            e.preventDefault();
            this.navigate(href);
        });

        window.addEventListener('popstate', () => {
            this.navigate(location.pathname + location.search, false);
        });
    },

    async navigate(url, pushState = true) {
        try {
            // تأثير تلاشي بسيط
            document.body.style.opacity = '0.5';
            document.body.style.transition = 'opacity 0.2s ease';

            const response = await fetch(url);
            if (!response.ok) throw new Error('Network error');
            const htmlText = await response.text();
            const doc = new DOMParser().parseFromString(htmlText, 'text/html');
            
            const newMain = doc.querySelector('main');
            if (!newMain) { window.location.href = url; return; }

            const currentMain = document.querySelector('main');
            if (currentMain) {
                currentMain.innerHTML = newMain.innerHTML;
                currentMain.className = newMain.className;
            }

            if (doc.title) document.title = doc.title;
            if (pushState) history.pushState({}, '', url);
            this.updateActiveLinks(url);

            // تشغيل الأيقونات والترجمة
            if (window.lucide) lucide.createIcons();
            if (window.I18n) I18n.updateDOM();
            
            // ⭐️ تحميل السكربتات الخاصة بالصفحة الجديدة (بذكاء)
            this.loadPageScripts(doc);

            // إطلاق حدث التنقل لبقية الملفات
            window.dispatchEvent(new CustomEvent('spaNavigate', { detail: { url } }));
            
            window.scrollTo({ top: 0, behavior: 'instant' });
            
            // إعادة إظهار الصفحة
            document.body.style.opacity = '1';
            
        } catch (error) {
            console.error('SPA Navigation failed:', error);
            window.location.href = url; // العودة للطريقة التقليدية عند الفشل
            document.body.style.opacity = '1';
        }
    },

    updateActiveLinks(url) {
        const path = new URL(url, location.origin).pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.classList.remove('active');
            const linkPath = link.getAttribute('href').split('?')[0];
            if (linkPath === path || (path === 'index.html' && linkPath === '/')) {
                link.classList.add('active');
            }
        });
    },

    // ⭐️ الدالة المُصلحة
    loadPageScripts(doc) {
        const scripts = doc.querySelectorAll('script');
        scripts.forEach(script => {
            if (script.src) {
                const scriptSrc = script.getAttribute('src');
                // استخراج اسم الملف فقط بدون الإصدار (مثلاً: js/api.js?v=112 تصبح js/api.js)
                const baseSrc = scriptSrc.split('?')[0];
                
                // التحقق مما إذا كان هذا الملف موجوداً بالفعل في الصفحة
                const isAlreadyLoaded = Array.from(document.querySelectorAll('script[src]')).some(s => {
                    return s.getAttribute('src').split('?')[0] === baseSrc;
                });

                // إذا لم يكن موجوداً، قم بتحميله
                if (!isAlreadyLoaded) {
                    const newScript = document.createElement('script');
                    newScript.src = scriptSrc;
                    newScript.async = false; // لضمان الترتيب
                    document.body.appendChild(newScript);
                }
            } else {
                // ⭐️ تشغيل السكربتات المكتوبة داخل HTML (Inline Scripts)
                const newScript = document.createElement('script');
                newScript.textContent = script.textContent;
                document.body.appendChild(newScript);
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    SpaRouter.init();
});