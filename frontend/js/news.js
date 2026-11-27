/**
 * News.js - Logic for News page (Universal & Mobile Friendly)
 */
document.addEventListener('DOMContentLoaded', async () => {
    ErrorHandler.init();
    await I18n.init();
    ThemeManager.init();
    LangSwitcher.init();

    loadNews();
});

async function loadNews() {
    const grid = document.getElementById('news-grid');
    grid.innerHTML = `<div class="skeleton" style="height:300px;"></div><div class="skeleton" style="height:300px;"></div>`;

    const newsData = await Api.getNews();

    if (!newsData || newsData.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--color-text-muted);">
            <i data-lucide="newspaper" style="width:48px;height:48px;margin-bottom:16px;"></i>
            <p>${I18n.currentLang === 'ar' ? 'لا توجد أخبار حالياً' : 'No news available'}</p>
        </div>`;
        if (window.lucide) lucide.createIcons();
        return;
    }

    grid.innerHTML = '';

    newsData.forEach(news => {
        const isPinned = news.pinned ? `<span class="badge badge-gold"><i data-lucide="pin" style="width:12px;height:12px;"></i> ${I18n.t('common.pinned')}</span>` : '';
        
        const card = document.createElement('div');
        card.className = 'card card-hover news-card';
        
        card.innerHTML = `
            <div class="news-image-wrapper" style="cursor: pointer; overflow: hidden; border-radius: var(--radius-md); margin-bottom: var(--space-4);">
                ${news.imageUrl ? `<img src="${news.imageUrl}" alt="${news.titleAr}" class="news-image" style="width: 100%; height: 200px; object-fit: cover; transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" onerror="this.style.display='none'">` : ''}
            </div>
            <div class="news-meta">
                ${isPinned}
                <span><i data-lucide="calendar" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i> ${news.date || ''}</span>
            </div>
            <h3 class="news-title">${I18n.currentLang === 'ar' ? news.titleAr : news.titleEn}</h3>
            <p class="news-body">${I18n.currentLang === 'ar' ? news.bodyAr : news.bodyEn}</p>
        `;

        // ⭐️ إضافة حدث النقر على الصورة لفتح المعاينة برمجياً (يعمل على كل الأجهزة)
        const imgWrapper = card.querySelector('.news-image-wrapper');
        if (imgWrapper && news.imageUrl) {
            imgWrapper.addEventListener('click', () => {
                // تمرير رابط المعاينة، رابط التحميل (نفس الرابط هنا)، العنوان، والنوع
                PreviewManager.open(news.imageUrl, news.imageUrl, news.titleAr, 'photo', 'image.jpg');
            });
        }

        grid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
}