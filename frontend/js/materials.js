/**
 * Materials.js - Logic for Subjects/Archive page (Dynamic Routing)
 */
document.addEventListener('DOMContentLoaded', async () => {
    ErrorHandler.init();
    await I18n.init();
    ThemeManager.init();
    LangSwitcher.init();

    const urlParams = new URLSearchParams(window.location.search);
    const yearId = urlParams.get('year');

    const pageTitle = document.getElementById('page-title');
    const breadcrumb = document.getElementById('current-breadcrumb');
    const yearsGrid = document.getElementById('years-grid');
    const termsTabs = document.getElementById('terms-tabs');
    const subjectsGrid = document.getElementById('subjects-grid');

    // دالة مساعدة لتنسيق اسم السنة
    const formatYear = (y) => {
        if (I18n.currentLang === 'en') {
            return y === 'year-1' ? 'Year 1' : y === 'year-2' ? 'Year 2' : y === 'year-3' ? 'Year 3' : 'Year 4';
        }
        return y === 'year-1' ? 'السنة الأولى' : y === 'year-2' ? 'السنة الثانية' : y === 'year-3' ? 'السنة الثالثة' : 'السنة الرابعة';
    };

    // ==========================================
    // السيناريو الأول: لم يتم تحديد سنة (عرض السنوات الأربعة)
    // ==========================================
    if (!yearId) {
        pageTitle.textContent = I18n.currentLang === 'ar' ? 'الأرشيف' : 'Archive';
        breadcrumb.textContent = I18n.currentLang === 'ar' ? 'الأرشيف' : 'Archive';
        
        yearsGrid.style.display = 'grid';
        termsTabs.style.display = 'none';
        subjectsGrid.style.display = 'none';

        // جلب السنوات من السيرفر
        const yearsData = await Api.getYears();
        
        if (yearsData && yearsData.length > 0) {
            yearsGrid.innerHTML = '';
            // ⭐️ رسم السنوات الأربعة مباشرة هنا (بدون التداخل مع كرت الرئيسية)
            yearsData.forEach(year => {
                const card = document.createElement('div');
                card.className = 'card card-hover year-card';
                card.style.cursor = 'pointer';
                
                card.innerHTML = `
                    <div class="year-icon">
                        <i data-lucide="calendar"></i>
                    </div>
                    <h3>${I18n.currentLang === 'ar' ? year.nameAr : year.nameEn}</h3>
                    <div class="year-stats" style="margin-bottom:var(--space-4);color:var(--color-text-muted);">
                        <span>${I18n.currentLang === 'ar' ? 'اضغط للاستعراض' : 'Click to view'}</span>
                    </div>
                    <button class="btn btn-secondary" style="width:100%;margin-top:auto;">
                        ${I18n.currentLang === 'ar' ? 'ادخل' : 'Enter'}
                        <i data-lucide="${I18n.currentLang === 'ar' ? 'arrow-left' : 'arrow-right'}"></i>
                    </button>
                `;
                
                card.addEventListener('click', () => {
                    window.location.href = `materials.html?year=${year.id}`;
                });

                yearsGrid.appendChild(card);
            });
            if (window.lucide) lucide.createIcons();
        } else {
            yearsGrid.innerHTML = `<p style="color:var(--color-danger);text-align:center;width:100%;grid-column:1/-1;">${I18n.t('common.error')}</p>`;
        }
        return;
    }

    // ==========================================
    // السيناريو الثاني: تم تحديد سنة (عرض المواد)
    // ==========================================
    pageTitle.textContent = I18n.currentLang === 'ar' ? 'المواد الدراسية' : 'Subjects';
    breadcrumb.textContent = formatYear(yearId);

    yearsGrid.style.display = 'none';
    termsTabs.style.display = 'flex';
    subjectsGrid.style.display = 'grid';

    // Fetch Terms
    const termsData = await Api.getTerms(yearId);
    if (termsData && termsData.length > 0) {
        renderTermsTabs(termsData, yearId);
    } else {
        subjectsGrid.innerHTML = `<div style="text-align:center;padding:40px;"><p>${I18n.t('common.empty')}</p></div>`;
    }
});

async function renderTermsTabs(terms, yearId) {
    const tabsContainer = document.getElementById('terms-tabs');
    tabsContainer.innerHTML = '';

    terms.forEach((term, index) => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${index === 0 ? 'active' : ''}`;
        btn.textContent = I18n.currentLang === 'ar' ? term.nameAr : term.nameEn;
        btn.dataset.termId = term.id;
        
        btn.addEventListener('click', () => {
            // Update active state
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Fetch subjects for this term
            loadSubjects(yearId, term.id);
        });

        tabsContainer.appendChild(btn);

        // Load first term's subjects by default
        if (index === 0) {
            loadSubjects(yearId, term.id);
        }
    });
}

async function loadSubjects(yearId, termId) {
    const grid = document.getElementById('subjects-grid');
    grid.innerHTML = `<div class="skeleton" style="height:100px;"></div><div class="skeleton" style="height:100px;"></div>`; // Skeleton

    const subjectsData = await Api.getSubjects(yearId, termId);
    
    if (!subjectsData || subjectsData.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;text-align:center;padding:40px;">
            <i data-lucide="inbox" style="width:48px;height:48px;color:var(--color-text-muted);margin-bottom:16px;"></i>
            <p>${I18n.currentLang === 'ar' ? 'لا توجد مواد في هذا الترم' : 'No subjects in this term'}</p>
        </div>`;
        if (window.lucide) lucide.createIcons();
        return;
    }

    grid.innerHTML = '';
    subjectsData.forEach(subject => {
        const card = document.createElement('div');
        card.className = 'card card-hover subject-card';
        
        // Calculate total files
        let totalFiles = 0;
        if (subject.counts) {
            totalFiles = Object.values(subject.counts).reduce((a, b) => a + b, 0);
        }

        card.innerHTML = `
            <div class="subject-icon" style="background: ${subject.color || '#1E40AF'}15; color: ${subject.color || '#1E40AF'};">
                <i data-lucide="${subject.icon || 'book'}"></i>
            </div>
            <div class="subject-info" style="flex:1;">
                <h3>${I18n.currentLang === 'ar' ? subject.nameAr : subject.nameEn}</h3>
                <p>${totalFiles} ${I18n.currentLang === 'ar' ? 'ملف' : 'Files'}</p>
            </div>
            <i data-lucide="${I18n.currentLang === 'ar' ? 'chevron-left' : 'chevron-right'}" style="color:var(--color-text-muted);"></i>
        `;

        card.addEventListener('click', () => {
            window.location.href = `files.html?year=${yearId}&term=${termId}&subject=${subject.id}`;
        });

        grid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
}