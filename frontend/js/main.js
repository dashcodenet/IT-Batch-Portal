/**
 * Main.js - Homepage Entry Point (Optimized for Performance)
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Core Modules (تجهيز الترجمة والألوان فوراً)
    ErrorHandler.init();
    await I18n.init(); 
    ThemeManager.init();
    LangSwitcher.init();

    // 2. Initialize Mobile Menu
    initMobileMenu();

    // 3. Initialize Hero Text Rotator (تبدأ الحركة فوراً دون انتظار السيرفر)
    initHeroTextRotator();

    // 4. Fetch Data (بالتوازي - لا ينتظر أحدهما الآخر)
    loadYears(); // طلب السنوات
    loadImages(); // طلب الصور في نفس الوقت

    // 5. Listen for language changes to re-render from cache
    window.addEventListener('languageChanged', () => {
        loadYears(true);  // true = استخدام الكاش
        loadImages(true); // true = استخدام الكاش
    });
});

// ==========================================
// Mobile Menu Logic (القائمة الجانبية للهواتف)
// ==========================================
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const drawer = document.getElementById('mobile-menu-drawer');
    const overlay = document.getElementById('mobile-menu-overlay');

    if (!menuBtn || !drawer || !overlay) return;

    menuBtn.addEventListener('click', () => {
        drawer.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    const closeMenu = () => {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
}

// ==========================================
// Hero Text Rotator
// ==========================================
function initHeroTextRotator() {
    const heroTitle = document.querySelector('.hero h1');
    if (!heroTitle) return;

    const phrasesAr = [
        "بوابة تكنولوجيا المعلومات",
        "وجهتك الأكاديمية الشاملة",
        "الإصدار الأول 2026",
        "كل ما تحتاجه في مكان واحد",
        "مستقبلك التقني يبدأ هنا"
    ];
    
    const phrasesEn = [
        "IT Batch Portal",
        "Your Academic Destination",
        "First Edition 2026",
        "Everything You Need in One Place",
        "Your Tech Future Starts Here"
    ];

    let currentIndex = 0;

    setInterval(() => {
        heroTitle.classList.add('fade-out-text');
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % phrasesAr.length;
            const isAr = I18n.currentLang === 'ar';
            heroTitle.textContent = isAr ? phrasesAr[currentIndex] : phrasesEn[currentIndex];
            heroTitle.classList.remove('fade-out-text');
            heroTitle.classList.add('fade-in-text');
            setTimeout(() => heroTitle.classList.remove('fade-in-text'), 500);
        }, 500);
    }, 6000);
}

// ==========================================
// 1. Fetch Years (مستقل)
// ==========================================
async function loadYears(useCacheOnly = false) {
    const yearsGrid = document.getElementById('years-grid');
    if (!yearsGrid) return;

    // Show loading state
    yearsGrid.innerHTML = `<p style="text-align:center;width:100%;grid-column:1/-1;">${I18n.t('common.loading')}</p>`;

    try {
        const yearsData = await Api.getYears(!useCacheOnly);
        
        let yearsArray = null;
        if (Array.isArray(yearsData)) {
            yearsArray = yearsData;
        } else if (yearsData && Array.isArray(yearsData.years)) {
            yearsArray = yearsData.years;
        }

        if (yearsArray && yearsArray.length > 0) {
            Ui.renderYears('years-grid', yearsArray);
        } else {
            yearsGrid.innerHTML = `<p style="color:var(--color-danger);text-align:center;width:100%;grid-column:1/-1;">${I18n.t('common.error')}</p>`;
        }
    } catch (error) {
        console.error("Error loading years:", error);
        yearsGrid.innerHTML = `<p style="color:var(--color-danger);text-align:center;width:100%;grid-column:1/-1;">${I18n.t('common.error')}</p>`;
    }
}

// ==========================================
// 2. Fetch Images (مستقل)
// ==========================================
async function loadImages(useCacheOnly = false) {
    const newsSliderContainer = document.getElementById('news-slider-container');
    if (!newsSliderContainer) return;

    // Show loading state
    newsSliderContainer.innerHTML = `<p style="text-align:center;width:100%;">${I18n.t('common.loading')}</p>`;

    try {
        const imagesData = await Api.getNewsImages(!useCacheOnly);
        
        if (imagesData && imagesData.length > 0) {
            const formattedImages = imagesData.map(img => ({
                id: img.id,
                name: img.name,
                imageUrl: img.imageUrl,
                previewUrl: img.imageUrl
            }));
            
            Ui.renderNewsSlider('news-slider-container', formattedImages);
        } else {
            newsSliderContainer.innerHTML = `<p style="text-align:center;width:100%;color:var(--color-text-muted);">${I18n.currentLang === 'ar' ? 'لا توجد تعميمات حالياً' : 'No announcements currently'}</p>`;
        }
    } catch (error) {
        console.error("Error loading news images from API:", error);
        newsSliderContainer.innerHTML = `<p style="color:var(--color-danger);text-align:center;width:100%;">${I18n.t('common.error')}</p>`;
    }
}