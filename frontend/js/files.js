/**
 * Files.js - Logic for Files page
 */
let currentTypesData = null;
let currentTypeId = null;

document.addEventListener('DOMContentLoaded', async () => {
    ErrorHandler.init();
    await I18n.init();
    ThemeManager.init();
    LangSwitcher.init();

    const urlParams = new URLSearchParams(window.location.search);
    const yearId = urlParams.get('year');
    const termId = urlParams.get('term');
    const subjectId = urlParams.get('subject');

    if (!yearId || !termId || !subjectId) {
        window.location.href = 'materials.html';
        return;
    }

    try {
        const data = await Api.getFiles(yearId, termId, subjectId);
        
        if (data && data.types) {
            currentTypesData = data.types;
            document.getElementById('subject-title').textContent = I18n.currentLang === 'ar' ? data.subject.nameAr : data.subject.nameEn;
            renderTypesTabs(data.types);
        } else {
            document.getElementById('files-list').innerHTML = `<div style="text-align:center;padding:40px;color:var(--color-danger);">
                <i data-lucide="alert-circle" style="width:48px;height:48px;margin-bottom:16px;"></i>
                <p>حدث خطأ في تحميل البيانات. يرجى تحديث الصفحة أو المحاولة لاحقاً.</p>
            </div>`;
            if (window.lucide) lucide.createIcons();
        }
    } catch (error) {
        console.error("Critical error in files.js:", error);
        document.getElementById('files-list').innerHTML = `<div style="text-align:center;padding:40px;color:var(--color-danger);">
            <p>حدث خطأ غير متوقع.</p>
        </div>`;
    }
});

function renderTypesTabs(types) {
    const tabsContainer = document.getElementById('types-tabs');
    if (!tabsContainer) return; 
    
    tabsContainer.innerHTML = '';

    types.forEach((type, index) => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${index === 0 ? 'active' : ''}`;
        btn.textContent = I18n.currentLang === 'ar' ? type.nameAr : type.nameEn;
        btn.dataset.typeId = type.id;
        
        btn.addEventListener('click', () => {
            document.querySelectorAll('#types-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectType(type.id);
        });

        tabsContainer.appendChild(btn);

        if (index === 0) selectType(type.id);
    });
}

function selectType(typeId) {
    currentTypeId = typeId;
    const type = currentTypesData.find(t => t.id === typeId);
    
    if (!type || type.categories.length === 0) {
        document.getElementById('categories-tabs').innerHTML = '';
        document.getElementById('files-list').innerHTML = `<div style="text-align:center;padding:40px;color:var(--color-text-muted);">
            <i data-lucide="inbox" style="width:48px;height:48px;margin-bottom:16px;"></i>
            <p>${I18n.currentLang === 'ar' ? 'لا توجد ملفات في هذا القسم' : 'No files in this section'}</p>
        </div>`;
        if (window.lucide) lucide.createIcons();
        return;
    }

    renderCategoriesTabs(type.categories);
    selectCategory(type.categories[0].id);
}

function renderCategoriesTabs(categories) {
    const tabsContainer = document.getElementById('categories-tabs');
    if (!tabsContainer) return;
    
    tabsContainer.innerHTML = '';

    categories.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${index === 0 ? 'active' : ''}`;
        btn.textContent = `${I18n.currentLang === 'ar' ? cat.nameAr : cat.nameEn} (${cat.files.length})`;
        btn.dataset.catId = cat.id;
        
        btn.addEventListener('click', () => {
            document.querySelectorAll('#categories-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectCategory(cat.id);
        });

        tabsContainer.appendChild(btn);
    });
}

function selectCategory(categoryId) {
    const type = currentTypesData.find(t => t.id === currentTypeId);
    const category = type.categories.find(c => c.id === categoryId);
    renderFiles(category);
}

function renderFiles(category) {
    const listContainer = document.getElementById('files-list');
    listContainer.innerHTML = `<div class="skeleton" style="height:80px;margin-bottom:12px;"></div><div class="skeleton" style="height:80px;"></div>`;

    setTimeout(() => {
        listContainer.innerHTML = '';
        
        if (!category || category.files.length === 0) {
            listContainer.innerHTML = `<div style="text-align:center;padding:40px;color:var(--color-text-muted);">
                <i data-lucide="folder-open" style="width:48px;height:48px;margin-bottom:16px;"></i>
                <p>${I18n.t('common.empty')}</p>
            </div>`;
            if (window.lucide) lucide.createIcons();
            return;
        }

        category.files.forEach(file => {
            const isFav = Favorites.has(file.id);
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            let fileIcon = 'file-text';
            if (file.fileType === 'photo') fileIcon = 'image';
            if (file.name.toLowerCase().endsWith('.zip') || file.name.toLowerCase().endsWith('.rar')) fileIcon = 'archive';
            if (file.name.toLowerCase().endsWith('.doc') || file.name.toLowerCase().endsWith('.docx')) fileIcon = 'file-text';
            if (file.name.toLowerCase().endsWith('.ppt') || file.name.toLowerCase().endsWith('.pptx')) fileIcon = 'presentation';

            const safeName = file.name.replace(/'/g, "\\'");

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
                <div class="file-actions">
                    <button class="btn-action btn-preview" onclick="PreviewManager.open('${file.previewUrl}', '${safeName}', '${file.fileType}', '${safeName}')">
                        <i data-lucide="eye"></i> <span>${I18n.t('common.preview')}</span>
                    </button>
                    
                    <!-- ⭐️ رابط مباشر للتحميل يعمل على جميع الأجهزة -->
                    <a href="${file.downloadUrl}" download="${safeName}" class="btn-action btn-download">
                        <i data-lucide="download"></i> <span>${I18n.t('common.download')}</span>
                    </a>

                    <button class="btn-action btn-fav ${isFav ? 'active' : ''}" onclick="toggleFav(this, '${file.id}')">
                        <i data-lucide="heart"></i>
                    </button>
                </div>
            `;
            listContainer.appendChild(fileItem);
        });

        if (window.lucide) lucide.createIcons();
        SearchManager.init('file-search', 'files-list');
        document.getElementById('file-search').value = '';
    }, 300);
}

window.toggleFav = function(btnElement, fileId) {
    const isNowFav = Favorites.toggle(fileId);
    if (isNowFav) btnElement.classList.add('active');
    else btnElement.classList.remove('active');
    if (window.lucide) lucide.createIcons();
};