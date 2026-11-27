/**
 * Ui.js - DOM Manipulation and Component Rendering (Optimized)
 * النسخة النهائية: حل جذري لمشكلة الفراغات والالتفاف اللانهائي (RTL & LTR)
 */
const Ui = {
    animationFrameId: null,
    isAnimating: false,
    sliderObserver: null,

    el(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    },

    initMobileMenu() {
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
    },

    renderYears(containerId, yearsData) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        const fragment = document.createDocumentFragment();

        const card = this.el('div', 'card card-hover year-card');

        card.innerHTML = `
            <div class="year-icon">
                <i data-lucide="archive"></i>
            </div>
            <h3>${I18n.currentLang === 'ar' ? 'الأرشيف' : 'Archive'}</h3>
            <div class="year-stats" style="margin-bottom:var(--space-4);color:var(--color-text-muted);">
                <span>${I18n.currentLang === 'ar' ? 'اضغط للاستعراض' : 'Click to view'}</span>
            </div>
            <button class="btn btn-secondary" style="width:100%;margin-top:auto;">
                ${I18n.currentLang === 'ar' ? 'الدخول للارشيف' : 'Enter Archive'}
                <i data-lucide="${I18n.currentLang === 'ar' ? 'arrow-left' : 'arrow-right'}"></i>
            </button>
        `;

        card.addEventListener('click', () => {
            window.location.href = `materials.html`;
        });

        fragment.appendChild(card);
        container.appendChild(fragment);

        if (window.lucide) lucide.createIcons();
    },

    renderNewsSlider(containerId, imagesData) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.sliderObserver) {
            this.sliderObserver.disconnect();
            this.sliderObserver = null;
        }
        this.isAnimating = false;

        if (!imagesData || imagesData.length === 0) {
            container.innerHTML = `<p style="text-align:center;color:var(--color-text-muted);width:100%;">${I18n.currentLang === 'ar' ? 'لا توجد تعميمات حالياً' : 'No announcements currently'}</p>`;
            return;
        }

        const totalImages = imagesData.length;
        let allImages = [];

        if (totalImages === 1) {
            allImages = [imagesData[0]];
        } else {
            allImages = [
                ...imagesData, ...imagesData, ...imagesData,
                ...imagesData, ...imagesData, ...imagesData
            ];
        }

        let html = `<div class="news-slider ${totalImages === 1 ? 'single-slide' : ''}" dir="ltr">`;
        allImages.forEach(img => {
            const safeName = String(img.name || 'image').replace(/'/g, "\\'");
            const previewUrl = img.previewUrl || img.imageUrl || '';
            const downloadUrl = img.downloadUrl || (previewUrl ? previewUrl.replace('mode=preview', 'mode=download') : '');
            html += `
                <div class="news-slide" data-url="${previewUrl}" data-download="${downloadUrl}" data-name="${safeName}">
                    <img src="${img.imageUrl}" alt="${safeName}" loading="eager" decoding="async" onerror="this.style.opacity='0';">
                </div>
            `;
        });
        html += `</div>`;

        container.innerHTML = html;

        const slider = container.querySelector('.news-slider');
        const slides = slider.querySelectorAll('.news-slide');

        if (totalImages === 1) {
            slider.style.justifyContent = 'center';
            slider.style.pointerEvents = 'auto';
        } else {
            this.init3DSlider(container, totalImages, allImages.length);
        }

        slides.forEach(slide => {
            let pointerStartX = 0;
            let pointerStartY = 0;

            slide.addEventListener('pointerdown', (e) => {
                pointerStartX = e.clientX;
                pointerStartY = e.clientY;
            });

            slide.addEventListener('click', (e) => {
                const distX = Math.abs(e.clientX - pointerStartX);
                const distY = Math.abs(e.clientY - pointerStartY);

                if (distX < 5 && distY < 5) {
                    const url = slide.getAttribute('data-url');
                    const downloadUrl = slide.getAttribute('data-download');
                    const name = slide.getAttribute('data-name');

                    if (typeof PreviewManager !== 'undefined') {
                        PreviewManager.open(url, downloadUrl, name, 'photo', name);
                    }
                }
            });
        });
    },

    init3DSlider(container, totalImages, totalSlides) {
        const slider = container.querySelector('.news-slider');
        if (!slider) return;

        const slides = slider.querySelectorAll('.news-slide');
        if (slides.length === 0) return;

        const getSetWidth = () => {
            const firstSlide = slides[0];
            const rect = firstSlide.getBoundingClientRect();
            const slideWidth = rect.width || firstSlide.offsetWidth || 260;
            const gap = parseFloat(window.getComputedStyle(slider).gap) || 0;
            return (slideWidth + gap) * totalImages;
        };

        let setWidth = getSetWidth();
        let isDragging = false;
        let startX = 0;
        const autoScrollSpeed = 0.5;
        let baseTranslate = -2 * setWidth;

        const onResize = () => {
            const prevSetWidth = setWidth || 1;
            const ratio = baseTranslate / prevSetWidth;
            setWidth = getSetWidth();
            baseTranslate = ratio * setWidth;
        };
        window.addEventListener('resize', onResize);

        slider.addEventListener('pointerdown', (e) => {
            isDragging = true;
            startX = e.clientX - baseTranslate;
            slider.style.cursor = 'grabbing';
        });

        window.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            baseTranslate = e.clientX - startX;
        });

        window.addEventListener('pointerup', () => {
            if (isDragging) {
                isDragging = false;
                slider.style.cursor = 'grab';
            }
        });

        slider.addEventListener('dragstart', (e) => e.preventDefault());
        slider.style.cursor = 'grab';
        slides.forEach(slide => {
            slide.style.transition = 'none';
        });

        const updateAnimation = () => {
            if (!setWidth) setWidth = getSetWidth();

            if (!isDragging && setWidth > 0) {
                const isRTL = document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';
                baseTranslate += isRTL ? autoScrollSpeed : -autoScrollSpeed;
            }

            if (setWidth > 0) {
                while (baseTranslate > -1 * setWidth) {
                    baseTranslate -= setWidth;
                }
                while (baseTranslate < -4 * setWidth) {
                    baseTranslate += setWidth;
                }
            }

            slider.style.transform = `translate3d(${baseTranslate}px, 0, 0)`;

            const containerRect = container.getBoundingClientRect();
            const containerCenter = containerRect.left + containerRect.width / 2;
            const maxDistance = containerRect.width / 2;

            slides.forEach(slide => {
                const rect = slide.getBoundingClientRect();
                const slideCenter = rect.left + rect.width / 2;
                const distance = slideCenter - containerCenter;

                let factor = maxDistance > 0 ? Math.abs(distance) / maxDistance : 0;
                if (factor > 1) factor = 1;

                const opacity = 1 - (factor * 0.7);
                const scale = 1 - (factor * 0.15);
                const rotateDir = distance > 0 ? 1 : -1;
                const rotateY = rotateDir * (factor * 35);

                slide.style.opacity = opacity;
                slide.style.transform = `perspective(1000px) rotateY(${rotateY}deg) scale(${scale})`;
                slide.style.zIndex = Math.round((1 - factor) * 100);
            });

            if (Ui.isAnimating) {
                Ui.animationFrameId = requestAnimationFrame(updateAnimation);
            }
        };

        this.sliderObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setWidth = getSetWidth();
                    if (!Ui.isAnimating) {
                        Ui.isAnimating = true;
                        Ui.animationFrameId = requestAnimationFrame(updateAnimation);
                    }
                } else {
                    Ui.isAnimating = false;
                    if (Ui.animationFrameId) {
                        cancelAnimationFrame(Ui.animationFrameId);
                        Ui.animationFrameId = null;
                    }
                }
            });
        }, { threshold: 0.1 });

        this.sliderObserver.observe(container);
    },

    renderNews(containerId, newsData) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        if (!newsData || newsData.length === 0) {
            container.innerHTML = `<p class="text-muted">${I18n.t('common.empty')}</p>`;
            return;
        }

        const topNews = newsData.slice(0, 3);
        const fragment = document.createDocumentFragment();

        topNews.forEach(news => {
            const isPinned = news.pinned ? `<span class="badge badge-gold"><i data-lucide="pin" style="width:12px;height:12px;"></i> ${I18n.t('common.pinned')}</span>` : '';

            const card = this.el('div', 'card card-hover');
            card.innerHTML = `
                <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                    ${isPinned}
                    <span style="font-size:0.85rem;color:var(--color-text-muted);">${news.date || ''}</span>
                </div>
                <h3 style="margin-bottom:8px;">${I18n.currentLang === 'ar' ? news.titleAr : news.titleEn}</h3>
                <p style="color:var(--color-text-muted);font-size:0.95rem;margin-bottom:16px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                    ${I18n.currentLang === 'ar' ? news.bodyAr : news.bodyEn}
                </p>
                <a href="news.html" class="nav-link" style="color:var(--color-primary);font-size:0.9rem;">
                    ${I18n.currentLang === 'ar' ? 'اقرأ المزيد ←' : 'Read More →'}
                </a>
            `;
            fragment.appendChild(card);
        });

        container.appendChild(fragment);

        if (window.lucide) lucide.createIcons();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Ui.initMobileMenu();
});