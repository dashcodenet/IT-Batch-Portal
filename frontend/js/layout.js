/**
 * Layout.js - يحقن الهيدر والفوتر والقائمة الجانبية في كل الصفحات
 */
const Layout = {
    inject() {
        // معرفة اسم الصفحة الحالية لتحديد الرابط النشط
        let path = window.location.pathname.split('/').pop();
        if (!path || path === '') path = 'index.html';

        const active = (page) => path === page ? 'active' : '';

        // 1. كود الهيدر
        const headerHTML = `
            <header class="site-header">
                <div class="container">
                    <a href="index.html" class="logo">
                        <i data-lucide="graduation-cap" class="logo-icon"></i>
                        <span>IT Batch Portal</span>
                    </a>
                    <nav class="main-nav">
                        <a href="index.html" class="nav-link ${active('index.html')}" data-i18n="nav.home">الرئيسية</a>
                        <a href="materials.html" class="nav-link ${active('materials.html')} ${active('files.html')}" data-i18n="nav.materials">المواد</a>
                        <a href="news.html" class="nav-link ${active('news.html')}" data-i18n="nav.news">الأخبار</a>
                        <a href="announcements.html" class="nav-link ${active('announcements.html')}" data-i18n="nav.announcements">الإعلانات</a>
                        <a href="services.html" class="nav-link ${active('services.html')}" data-i18n="nav.services">خدماتنا</a>
                        <a href="about.html" class="nav-link ${active('about.html')}" data-i18n="nav.about">عن الموقع</a>
                    </nav>
                    <div class="header-actions">
                        <button id="mobile-menu-btn" class="btn-icon mobile-only">
                            <i data-lucide="menu"></i>
                        </button>
                        <button id="lang-toggle" class="btn-icon">EN</button>
                        <button id="theme-toggle" class="btn-icon">
                            <i data-lucide="moon"></i>
                        </button>
                    </div>
                </div>
            </header>
        `;

        // 2. كود الفوتر والقائمة الجانبية
        const footerHTML = `
            <footer class="site-footer">
                <div class="container">
                    <div class="footer-content">
                        <div>
                            <a href="index.html" class="logo" style="margin-bottom:16px;">
                                <i data-lucide="graduation-cap" class="logo-icon"></i>
                                <span>IT Batch Portal</span>
                            </a>
                            <p data-i18n="footer.desc_main" style="color:var(--color-text-muted);font-size:0.9rem;line-height:1.6;">
                                بوابة ذكية أكاديمية لطلاب تكنولوجيا المعلومات. صُممت لتسهيل الوصول إلى المحتوى العلمي وتنظيم الملفات في مكان واحد.
                            </p>
                        </div>
                        <div>
                            <h4 data-i18n="footer.made_with_love" style="margin-bottom:16px; font-weight:700; font-size:1.1rem;">صُنع بجهد وشغف</h4>
                            <p data-i18n="footer.desc_personal" style="color:var(--color-text-muted);font-size:0.9rem;margin-bottom:12px;line-height:1.6;">
                                تم تطوير هذه المنصة عبر فريق Dash Code بكل حب لخدمة طلابنا. إذا واجهتك أي مشكلة، أو كان لديك اقتراح لتطوير الموقع، فلا تتردد في التواصل معنا.
                            </p>
                            <p data-i18n="footer.suggestions_welcome" style="color:var(--color-primary);font-size:0.85rem;font-weight:600; display:flex; align-items:center; gap:4px;">
                                <i data-lucide="lightbulb" style="width:16px;height:16px;"></i> نرحب بأفكاركم دائماً!
                            </p>
                        </div>
                        <div>
                            <h4 data-i18n="footer.contact_us" style="margin-bottom:16px; font-weight:700; font-size:1.1rem;">تواصل معنا</h4>
                            <div style="display:flex; gap:12px; flex-wrap:wrap;">
                                <a href="https://wa.me/774828273" target="_blank" title="WhatsApp" style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(16, 185, 129, 0.1);color:var(--color-accent);transition:all 0.3s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 4px 12px rgba(16,185,129,0.3)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                </a>
                                <a href="https://t.me/YOUR_USERNAME" target="_blank" title="Telegram" style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(14, 165, 233, 0.1);color:var(--color-secondary);transition:all 0.3s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 4px 12px rgba(14,165,233,0.3)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </a>
                                <a href="https://instagram.com/YOUR_USERNAME" target="_blank" title="Instagram" style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:rgba(220, 38, 38, 0.1);color:var(--color-danger);transition:all 0.3s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 4px 12px rgba(220,38,38,0.3)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                </a>
                                <a href="https://github.com/YOUR_USERNAME" target="_blank" title="GitHub" style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:50%;background:var(--color-surface);color:var(--color-text);border:1px solid var(--color-border);transition:all 0.3s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="footer-bottom" style="display:flex; flex-direction:column; gap:8px; align-items:center; justify-content:center; text-align:center;">
                        <p>&copy; 2026 Dash Code team. <span data-i18n="footer.all_rights_reserved">جميع الحقوق محفوظة.</span></p>
                    </div>
                </div>
            </footer>

            <div id="mobile-menu-overlay" class="mobile-menu-overlay"></div>
            <div id="mobile-menu-drawer" class="mobile-menu-drawer">
                <div class="mobile-drawer-header">
                    <a href="index.html" class="logo">
                        <i data-lucide="graduation-cap" class="logo-icon"></i>
                        <span>IT Batch Portal</span>
                    </a>
                    <button id="close-menu-btn" class="btn-icon">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <nav class="mobile-nav">
                    <a href="index.html" class="mobile-nav-link ${active('index.html')}" data-i18n="nav.home">الرئيسية</a>
                    <a href="materials.html" class="mobile-nav-link ${active('materials.html')} ${active('files.html')}" data-i18n="nav.materials">المواد</a>
                    <a href="news.html" class="mobile-nav-link ${active('news.html')}" data-i18n="nav.news">الأخبار</a>
                    <a href="announcements.html" class="mobile-nav-link ${active('announcements.html')}" data-i18n="nav.announcements">الإعلانات</a>
                    <a href="services.html" class="mobile-nav-link ${active('services.html')}" data-i18n="nav.services">خدماتنا</a>
                    <a href="about.html" class="mobile-nav-link ${active('about.html')}" data-i18n="nav.about">عن الموقع</a>
                </nav>
            </div>
        `;

        // حقن الكود في الصفحة
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
        document.body.insertAdjacentHTML('beforeend', footerHTML);
        document.dispatchEvent(new Event('layoutReady'));
        // تحديث الترجمة فوراً بعد الحقن لضمان عدم بقاء النصوص عربية
        if (window.I18n) I18n.updateDOM();
    }
};

// تشغيل الحقن فور تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    Layout.inject();
    // إعادة تفعيل الأيقونات بعد الحقن
    if (window.lucide) lucide.createIcons();
});