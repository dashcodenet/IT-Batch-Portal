/**
 * ThemeToggle.js - Dark/Light mode manager
 * Respects system preferences and manual overrides.
 */
const ThemeManager = {
    init() {
        this.btn = document.getElementById('theme-toggle');
        
        // 1. Determine initial theme
        const savedTheme = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.THEME);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            this.setTheme(prefersDark ? 'dark' : 'light');
        }

        // 2. Setup button
        if (this.btn) {
            this.btn.addEventListener('click', () => {
                const isDark = document.documentElement.classList.contains('dark');
                this.setTheme(isDark ? 'light' : 'dark');
            });
        }
    },

    setTheme(theme) {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.THEME, theme);
        const isDark = theme === 'dark';
        
        document.documentElement.classList.toggle('dark', isDark);
        
        // Update icon (Lucide will replace this later)
        if (this.btn) {
            this.btn.innerHTML = isDark 
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>' // Sun
                : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'; // Moon
        }
    }
};