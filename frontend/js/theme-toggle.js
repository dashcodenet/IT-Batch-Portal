/**
 * ThemeToggle.js - تم إلغاء تفعيل التبديل، الوضع الداكن مفروض دائماً.
 */
const ThemeManager = {
    init() {
        // فرض الوضع الداكن
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        localStorage.setItem('itp_theme', 'dark');
    },
    setTheme() {
        // لا يوجد تبديل
    }
};