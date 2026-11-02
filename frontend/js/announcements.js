/**
 * Announcements.js - Logic for Announcements page
 */
document.addEventListener('DOMContentLoaded', async () => {
    ErrorHandler.init();
    await I18n.init();
    ThemeManager.init();
    LangSwitcher.init();

    loadAnnouncements();
});

async function loadAnnouncements() {
    const list = document.getElementById('announcements-grid');
    list.innerHTML = `<div class="skeleton" style="height:150px;"></div><div class="skeleton" style="height:150px;"></div>`;

    const data = await Api.getAnnouncements();

    if (!data || data.length === 0) {
        list.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--color-text-muted);">
            <i data-lucide="megaphone" style="width:48px;height:48px;margin-bottom:16px;"></i>
            <p>${I18n.currentLang === 'ar' ? 'لا توجد إعلانات حالياً' : 'No announcements available'}</p>
        </div>`;
        if (window.lucide) lucide.createIcons();
        return;
    }

    list.innerHTML = '';

    data.forEach(ann => {
        const isPinned = ann.pinned ? `<span class="badge badge-gold"><i data-lucide="pin" style="width:12px;height:12px;"></i> ${I18n.t('common.pinned')}</span>` : '';

        const card = document.createElement('div');
        card.className = 'card card-hover';
        // Styling to make it look like an announcement (less image focus)
        card.style.borderLeft = ann.pinned ? '4px solid var(--color-gold)' : '4px solid var(--color-primary)';
        
        card.innerHTML = `
            <div class="news-meta">
                ${isPinned}
                <span><i data-lucide="calendar" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i> ${ann.date || ''}</span>
            </div>
            <h3 class="news-title" style="font-size:1.1rem;">${I18n.currentLang === 'ar' ? ann.titleAr : ann.titleEn}</h3>
            <p class="news-body" style="-webkit-line-clamp: unset;">${I18n.currentLang === 'ar' ? ann.bodyAr : ann.bodyEn}</p>
        `;
        list.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
}