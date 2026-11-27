/**
 * WhatsNew.js - إشعارات "الجديد" (نسخة ديناميكية وذكية - محصنة ضد الفراغ)
 */
if (typeof window.WhatsNew === 'undefined') {
    window.WhatsNew = {
        storageKey: 'itp_last_visit',

        async init() {
            if (typeof I18n !== 'undefined' && !I18n.isLoaded) {
                await new Promise(r => setTimeout(r, 500));
            }

            const lastVisit = parseInt(localStorage.getItem(this.storageKey) || '0');
            const now = Date.now();
            const since = lastVisit > 0 ? lastVisit : 0; 

            try {
                const items = await this.fetchNewItems(since);

                if (items.length > 0) {
                    this.showPopup(items);
                }

                localStorage.setItem(this.storageKey, now);
                
            } catch (e) {
                console.warn('[WhatsNew] Fetch error, not updating lastVisit:', e);
            }
        },

        async fetchNewItems(since) {
            if (typeof Api === 'undefined') return [];
            
            try {
                const data = await Api.getRecentUpdates(since);
                
                if (data === null || typeof data === 'undefined' || !Array.isArray(data)) {
                    throw new Error("API returned invalid data");
                }

                const isAr = (typeof I18n !== 'undefined' && I18n.currentLang) ? I18n.currentLang === 'ar' : true;

                return data.map(item => {
                    // ⭐️ تنظيف النصوص من المسافات الفارغة
                    const rawTitle = item.title ? String(item.title).trim() : '';
                    const rawPathAr = item.pathNameAr ? String(item.pathNameAr).trim() : '';
                    const rawPathEn = item.pathNameEn ? String(item.pathNameEn).trim() : '';

                    return {
                        id: item.id,
                        title: rawTitle !== '' ? rawTitle : (isAr ? 'ملف جديد بدون اسم' : 'New File'),
                        path: item.path,
                        pathName: isAr 
                            ? (rawPathAr !== '' ? rawPathAr : 'مسار غير معروف') 
                            : (rawPathEn !== '' ? rawPathEn : 'Unknown path'),
                        type: item.type
                    };
                });
            } catch (e) {
                throw e; 
            }
        },

        showPopup(items) {
            const isAr = (typeof I18n !== 'undefined' && I18n.currentLang) ? I18n.currentLang === 'ar' : true;
            
            const existingPopup = document.getElementById('whats-new-popup');
            if (existingPopup) existingPopup.remove();

            const popup = document.createElement('div');
            popup.className = 'whats-new-popup';
            popup.id = 'whats-new-popup';

            let itemsHtml = '';
            items.forEach(item => {
                let iconName = 'info';
                let iconColor = 'wn-blue';
                
                if (item.type === 'file') { iconName = 'file-text'; iconColor = 'wn-green'; }
                if (item.type === 'announcement') { iconName = 'megaphone'; iconColor = 'wn-gold'; }
                if (item.type === 'news') { iconName = 'newspaper'; iconColor = 'wn-blue'; }

                itemsHtml += `
                    <div class="wn-item">
                        <div class="wn-icon ${iconColor}">
                            <i data-lucide="${iconName}"></i>
                        </div>
                        <div class="wn-info">
                            <div class="wn-title" title="${this.escape(item.title)}">${this.escape(item.title)}</div>
                            <div class="wn-path">
                                <i data-lucide="folder"></i> ${this.escape(item.pathName)}
                            </div>
                        </div>
                        <a href="${item.path}" class="wn-go" onclick="event.preventDefault(); event.stopPropagation(); window.location.href=this.href;">${isAr ? 'اذهب' : 'Go'}</a>
                    </div>
                `;
            });

            popup.innerHTML = `
                <div class="wn-header">
                    <div class="wn-badge">
                        <i data-lucide="bell"></i>
                    </div>
                    <div class="wn-header-text">
                        <strong>${isAr ? 'جديد منذ آخر زيارة' : 'New Since Last Visit'}</strong>
                        <p>${isAr ? 'إليك آخر ما تمت إضافته للموقع' : 'Here is the latest added to the site'}</p>
                    </div>
                    <button class="wn-close" id="wn-close-btn" title="${isAr ? 'إغلاق' : 'Close'}">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                
                <div class="wn-list">
                    ${itemsHtml}
                </div>

                <div class="wn-footer">
                    <button class="wn-dismiss" id="wn-dismiss-btn">
                        ${isAr ? 'تجاهل' : 'Dismiss'}
                    </button>
                </div>
            `;

            document.body.appendChild(popup);

            if (window.lucide) lucide.createIcons({ root: popup });

            setTimeout(() => popup.classList.add('show'), 100);

            const closePopup = () => {
                popup.classList.remove('show');
                setTimeout(() => popup.remove(), 500);
            };

            document.getElementById('wn-close-btn').addEventListener('click', closePopup);
            document.getElementById('wn-dismiss-btn').addEventListener('click', closePopup);
        },

        escape(str) {
            const div = document.createElement('div');
            div.textContent = str || '';
            return div.innerHTML;
        }
    };

    function startWhatsNew() {
        if (window.WhatsNew && typeof Api !== 'undefined') {
            setTimeout(() => window.WhatsNew.init(), 1000); 
        } else {
            setTimeout(startWhatsNew, 200);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startWhatsNew);
    } else {
        startWhatsNew();
    }

    window.addEventListener('spaNavigate', () => {
        if (window.WhatsNew) {
            setTimeout(() => window.WhatsNew.init(), 500);
        }
    });
}