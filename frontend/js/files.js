/**
 * Files.js - Logic for Files page (SPA Compatible & Card Layout)
 * ⭐️ النسخة النهائية: فتح المجلد + التمرير للملف وتظليله
 */
let currentTypesData = null;

const VERCEL_DOWNLOAD_BASE = 'https://it-batch-portal-frontend-flax.vercel.app/api/download';

function normalizeFileProxyUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return rawUrl;

  try {
    const parsed = new URL(rawUrl, window.location.origin);
    if (parsed.hostname.endsWith('.workers.dev')) {
      return `${VERCEL_DOWNLOAD_BASE}${parsed.search}`;
    }
    return rawUrl;
  } catch (e) {
    return rawUrl.replace(
      /^https?:\/\/[^/]+\.workers\.dev\/?/i,
      `${VERCEL_DOWNLOAD_BASE}?`.replace(/\?\?/, '?')
    );
  }
}

async function initFiles() {
    if (typeof ErrorHandler !== 'undefined') ErrorHandler.init();
    if (typeof I18n !== 'undefined') await I18n.init();
    if (typeof LangSwitcher !== 'undefined') LangSwitcher.init();

    const urlParams = new URLSearchParams(window.location.search);
    const yearId = urlParams.get('year');
    const termId = urlParams.get('term');
    const subjectId = urlParams.get('subject');

    if (!yearId || !termId || !subjectId) {
        window.location.href = 'materials.html';
        return;
    }

    const typesGrid = document.getElementById('types-grid');
    const catsGrid = document.getElementById('categories-grid');
    const filesContainer = document.getElementById('files-list-container');

    if (typesGrid) typesGrid.innerHTML = '<div class="skeleton" style="height:150px;"></div><div class="skeleton" style="height:150px;"></div>';
    if (catsGrid) catsGrid.innerHTML = '';
    if (filesContainer) filesContainer.style.display = 'none';

    try {
        const data = await Api.getFiles(yearId, termId, subjectId);

        if (data && data.types) {
            currentTypesData = data.types;
            const titleEl = document.getElementById('subject-title');
            if (titleEl) titleEl.textContent = I18n.currentLang === 'ar' ? data.subject.nameAr : data.subject.nameEn;

            renderTypesCards(data.types);

            // ⭐️ فتح المجلد تلقائياً إذا كان الرابط يحتوي على النوع والفئة
            const typeParam = urlParams.get('type');
            const categoryParam = urlParams.get('category');
            if (typeParam && categoryParam) {
                const targetType = data.types.find(t => t.id === typeParam);
                if (targetType) {
                    const targetCat = targetType.categories.find(c => c.id === categoryParam);
                    if (targetCat) {
                        if (typesGrid) typesGrid.innerHTML = '';
                        if (catsGrid) catsGrid.innerHTML = '';
                        showFilesList(targetCat);
                    }
                }
            }
        } else {
            if (typesGrid) typesGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--color-danger);">
                <i data-lucide="alert-circle" style="width:48px;height:48px;margin-bottom:16px;"></i>
                <p>حدث خطأ في تحميل البيانات.</p>
            </div>`;
            if (window.lucide) lucide.createIcons();
        }
    } catch (error) {
        console.error("Critical error in files.js:", error);
        if (typesGrid) typesGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--color-danger);"><p>حدث خطأ غير متوقع.</p></div>`;
    }
}

function renderTypesCards(types) {
    const grid = document.getElementById('types-grid');
    if (!grid) return;

    grid.innerHTML = '';

    types.forEach((type) => {
        const card = document.createElement('div');
        card.className = 'card card-hover year-card fade-up';
        card.style.cursor = 'pointer';

        const icon = type.id === 'theory' ? 'book-open' : 'monitor';
        const catCount = type.categories ? type.categories.length : 0;

        card.innerHTML = `
            <div class="year-icon" style="background: rgba(30, 64, 175, 0.1); color: var(--color-primary);">
                <i data-lucide="${icon}"></i>
            </div>
            <h3>${I18n.currentLang === 'ar' ? type.nameAr : type.nameEn}</h3>
            <div class="year-stats" style="margin-bottom:var(--space-4);color:var(--color-text-muted);">
                <span>${catCount} ${I18n.currentLang === 'ar' ? 'فئة' : 'Categories'}</span>
            </div>
            <button class="btn btn-secondary" style="width:100%;margin-top:auto;">
                ${I18n.currentLang === 'ar' ? 'استعراض الفئات' : 'View Categories'}
            </button>
        `;

        card.addEventListener('click', () => {
            grid.innerHTML = '';
            renderCategoriesCards(type.categories);
        });

        grid.appendChild(card);
    });
    if (window.lucide) lucide.createIcons();
}

function renderCategoriesCards(categories) {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (!categories || categories.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--color-text-muted);">
            <i data-lucide="inbox" style="width:48px;height:48px;margin-bottom:16px;"></i>
            <p>${I18n.currentLang === 'ar' ? 'لا توجد فئات في هذا القسم' : 'No categories in this section'}</p>
        </div>`;
        if (window.lucide) lucide.createIcons();
        return;
    }

    categories.forEach((cat) => {
        const card = document.createElement('div');
        card.className = 'card card-hover year-card fade-up';
        card.style.cursor = 'pointer';

        card.innerHTML = `
            <div class="year-icon" style="background: rgba(14, 165, 233, 0.1); color: var(--color-secondary);">
                <i data-lucide="folder"></i>
            </div>
            <h3>${I18n.currentLang === 'ar' ? cat.nameAr : cat.nameEn}</h3>
            <div class="year-stats" style="margin-bottom:var(--space-4);color:var(--color-text-muted);">
                <span>${cat.files.length} ${I18n.currentLang === 'ar' ? 'ملف' : 'Files'}</span>
            </div>
            <button class="btn btn-secondary" style="width:100%;margin-top:auto;">
                ${I18n.currentLang === 'ar' ? 'عرض الملفات' : 'View Files'}
            </button>
        `;

        card.addEventListener('click', () => {
            showFilesList(cat);
        });

        grid.appendChild(card);
    });
    if (window.lucide) lucide.createIcons();
}

function showFilesList(category) {
    const catsGrid = document.getElementById('categories-grid');
    if (catsGrid) catsGrid.innerHTML = '';

    const stickyControls = document.getElementById('sticky-controls');
    if (stickyControls) stickyControls.style.display = 'block';

    const container = document.getElementById('files-list-container');
    if (container) container.style.display = 'block';

    const title = document.getElementById('current-category-title');
    if (title) title.textContent = I18n.currentLang === 'ar' ? category.nameAr : category.nameEn;

    renderFiles(category);
}

function renderFiles(category) {
    const listContainer = document.getElementById('files-list');
    if (!listContainer) return;
    listContainer.innerHTML = `<div class="skeleton" style="height:80px;margin-bottom:12px;"></div><div class="skeleton" style="height:80px;"></div>`;

    requestAnimationFrame(() => {
        listContainer.innerHTML = '';

        if (!category || category.files.length === 0) {
            listContainer.innerHTML = `<div style="text-align:center;padding:40px;color:var(--color-text-muted);">
                <i data-lucide="folder-open" style="width:48px;height:48px;margin-bottom:16px;"></i>
                <p>${I18n.t('common.empty')}</p>
            </div>`;
            if (window.lucide) lucide.createIcons();
            return;
        }

        const fragment = document.createDocumentFragment();

        category.files.forEach(file => {
            const isFav = (typeof Favorites !== 'undefined') ? Favorites.has(file.id) : false;
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item fade-up';
            fileItem.id = `file-${file.id}`;
            fileItem.setAttribute('data-searchable', `${file.name || ''} ${file.displayAr || ''} ${file.displayEn || ''}`);

            let fileIcon = 'file-text';
            if (file.fileType === 'photo' || (file.name && file.name.match(/\.(jpg|jpeg|png)$/i))) fileIcon = 'image';
            else if (file.name && file.name.match(/\.(zip|rar)$/i)) fileIcon = 'archive';
            else if (file.name && file.name.match(/\.(ppt|pptx)$/i)) fileIcon = 'presentation';

            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-icon-box">
                        <i data-lucide="${fileIcon}"></i>
                    </div>
                    <div class="file-details">
                        <h4>${I18n.currentLang === 'ar' ? file.displayAr : file.displayEn}</h4>
                        <div class="file-meta">
                            <span><i data-lucide="hard-drive" style="width:14px;height:14px;vertical-align:middle;"></i> ${file.sizeFormatted}</span>
                            <span><i data-lucide="calendar" style="width:14px;height:14px;vertical-align:middle;"></i> ${file.updatedAt}</span>
                        </div>
                    </div>
                </div>
                <div class="file-actions"></div>
            `;

            const actionsContainer = fileItem.querySelector('.file-actions');
            const safeFileName = file.name || 'ملف';
            const safePreviewUrl = normalizeFileProxyUrl(file.previewUrl);
            const safeDownloadUrl = normalizeFileProxyUrl(file.downloadUrl);

            const btnPreview = document.createElement('button');
            btnPreview.className = 'btn-action btn-preview';
            btnPreview.innerHTML = `<i data-lucide="eye"></i> <span>${I18n.t('common.preview')}</span>`;
            btnPreview.addEventListener('click', () => {
                PreviewManager.open(safePreviewUrl, safeDownloadUrl, safeFileName, file.fileType, safeFileName);
            });

            const btnDownload = document.createElement('button');
            btnDownload.className = 'btn-action btn-download';
            btnDownload.innerHTML = `<i data-lucide="download"></i> <span>${I18n.t('common.download')}</span>`;
            btnDownload.addEventListener('click', () => {
                let downloadUrl = safeDownloadUrl;
                if (!downloadUrl && safePreviewUrl) {
                    downloadUrl = safePreviewUrl.replace('mode=preview', 'mode=download');
                }

                if (downloadUrl) {
                    const a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = safeFileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);

                    if (typeof Toast !== 'undefined') {
                        Toast.show('toast.downloading', 'success');
                    }
                } else {
                    if (typeof Toast !== 'undefined') {
                        Toast.show('toast.download_error', 'error');
                    }
                }
            });

            const btnFav = document.createElement('button');
            btnFav.className = `btn-action btn-fav ${isFav ? 'active' : ''}`;
            btnFav.innerHTML = `<i data-lucide="heart"></i>`;
            btnFav.addEventListener('click', () => {
                if (typeof window.toggleFav === 'function') window.toggleFav(btnFav, file);
            });

            actionsContainer.appendChild(btnPreview);
            actionsContainer.appendChild(btnDownload);
            actionsContainer.appendChild(btnFav);

            fragment.appendChild(fileItem);
        });

        listContainer.appendChild(fragment);

        if (window.lucide) lucide.createIcons();

        if (typeof SearchManager !== 'undefined') {
            SearchManager.init('file-search', 'files-list');
            const searchInput = document.getElementById('file-search');
            if (searchInput) searchInput.value = '';
        }

        // ⭐️ السحر: التمرير إلى الملف المحدد وتظليله
        const urlParams = new URLSearchParams(window.location.search);
        const fileParam = urlParams.get('file');
        if (fileParam) {
            const targetFile = document.getElementById(`file-${fileParam}`);
            if (targetFile) {
                setTimeout(() => {
                    targetFile.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    targetFile.style.borderColor = 'var(--color-primary)';
                    targetFile.style.boxShadow = '0 0 20px rgba(56, 189, 248, 0.4)';
                    targetFile.style.backgroundColor = 'rgba(56, 189, 248, 0.05)';
                    targetFile.style.transition = 'all 0.3s ease';

                    setTimeout(() => {
                        targetFile.style.borderColor = '';
                        targetFile.style.boxShadow = '';
                        targetFile.style.backgroundColor = '';
                    }, 4000);
                }, 150);
            }
        }
    });
}

document.addEventListener('click', (e) => {
    if (e.target.closest('#back-to-categories')) {
        const container = document.getElementById('files-list-container');
        if (container) container.style.display = 'none';

        const stickyControls = document.getElementById('sticky-controls');
        if (stickyControls) stickyControls.style.display = 'none';

        if (currentTypesData) renderTypesCards(currentTypesData);

        const params = new URLSearchParams(window.location.search);
        const y = params.get('year') || '';
        const t = params.get('term') || '';
        const s = params.get('subject') || '';
        window.history.pushState({}, '', `files.html?year=${encodeURIComponent(y)}&term=${encodeURIComponent(t)}&subject=${encodeURIComponent(s)}`);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('types-grid')) initFiles();
});

window.addEventListener('spaNavigate', () => {
    if (document.getElementById('types-grid')) initFiles();
});