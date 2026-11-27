/**
 * Favorites-page.js - عرض الملفات المحفوظة
 * ⭐️ يدعم الترجمة الكاملة
 */
document.addEventListener('DOMContentLoaded', async () => {
    if (typeof I18n !== 'undefined') await I18n.init();
    if (typeof LangSwitcher !== 'undefined') LangSwitcher.init();

    renderFavorites();
});

// ⭐️ إعادة الرسم عند تغيير اللغة
window.addEventListener('languageChanged', () => {
    renderFavorites();
});

function renderFavorites() {
    const container = document.getElementById('favorites-list');
    const emptyState = document.getElementById('favorites-empty');
    const listContainer = document.getElementById('favorites-list-container');
    
    if (!container) return;

    const favs = Favorites.getAll();

    if (favs.length === 0) {
        if (emptyState) emptyState.style.display = 'flex';
        if (listContainer) listContainer.style.display = 'none';
        if (window.lucide) lucide.createIcons();
        // تحديث النصوص في الحالة الفارغة
        if (typeof I18n !== 'undefined') I18n.updateDOM();
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (listContainer) listContainer.style.display = 'block';

    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    favs.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item fade-up';

        let fileIcon = 'file-text';
        if (file.fileType === 'photo' || (file.name && file.name.match(/\.(jpg|jpeg|png)$/i))) fileIcon = 'image';
        else if (file.name && file.name.match(/\.(zip|rar)$/i)) fileIcon = 'archive';
        else if (file.name && file.name.match(/\.(ppt|pptx)$/i)) fileIcon = 'presentation';

        const displayName = I18n.currentLang === 'ar' ? (file.displayAr || file.name) : (file.displayEn || file.name);

        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-icon-box">
                    <i data-lucide="${fileIcon}"></i>
                </div>
                <div class="file-details">
                    <h4>${displayName}</h4>
                    <div class="file-meta">
                        <span><i data-lucide="hard-drive" style="width:14px;height:14px;vertical-align:middle;"></i> ${file.sizeFormatted || ''}</span>
                    </div>
                </div>
            </div>
            <div class="file-actions"></div>
        `;

        const actionsContainer = fileItem.querySelector('.file-actions');
        const safeFileName = file.name || 'file';

        // زر المعاينة
        const btnPreview = document.createElement('button');
        btnPreview.className = 'btn-action btn-preview';
        btnPreview.innerHTML = `<i data-lucide="eye"></i> <span>${I18n.t('common.preview')}</span>`;
        btnPreview.addEventListener('click', () => {
            PreviewManager.open(file.previewUrl, file.downloadUrl, safeFileName, file.fileType, safeFileName);
        });

        // زر التحميل
        const btnDownload = document.createElement('button');
        btnDownload.className = 'btn-action btn-download';
        btnDownload.innerHTML = `<i data-lucide="download"></i> <span>${I18n.t('common.download')}</span>`;
        btnDownload.addEventListener('click', () => {
            let downloadUrl = file.downloadUrl;
            if (!downloadUrl && file.previewUrl) downloadUrl = file.previewUrl.replace('mode=preview', 'mode=download');
            if (downloadUrl) {
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = safeFileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                if (typeof Toast !== 'undefined') Toast.show('toast.downloading', 'success');
            }
        });

        // زر إزالة من المفضلة
        const btnFav = document.createElement('button');
        btnFav.className = `btn-action btn-fav active`;
        btnFav.innerHTML = `<i data-lucide="heart"></i>`;
        btnFav.addEventListener('click', () => {
            Favorites.remove(file.id);
            fileItem.style.display = 'none';
            if (typeof Toast !== 'undefined') Toast.show('toast.removed_fav', 'info');
            
            if (Favorites.getAll().length === 0) {
                setTimeout(() => renderFavorites(), 300);
            }
        });

        actionsContainer.appendChild(btnPreview);
        actionsContainer.appendChild(btnDownload);
        actionsContainer.appendChild(btnFav);

        fragment.appendChild(fileItem);
    });

    container.appendChild(fragment);
    if (window.lucide) lucide.createIcons();
}