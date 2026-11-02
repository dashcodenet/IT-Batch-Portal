/**
 * Preview.js - Handles PDF and Image Modal Preview (Seamless Native Approach)
 */
const PreviewManager = {
    init() {
        if (!document.getElementById('preview-styles')) {
            const style = document.createElement('style');
            style.id = 'preview-styles';
            style.innerHTML = `
                .image-preview-wrapper {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .image-preview-wrapper img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    border-radius: var(--radius-md);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                }
                .pdf-preview-wrapper {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .pdf-preview-wrapper iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                    border-radius: var(--radius-md);
                    background: #fff;
                }
                .preview-download-btn {
                    position: absolute;
                    bottom: 30px;
                    left: 30px;
                    background: rgba(255, 255, 255, 0.15);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    width: 56px;
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    z-index: 10;
                    border: none;
                    outline: none;
                    text-decoration: none;
                }
                .preview-download-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(1.1);
                    box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
                }
                [dir="rtl"] .preview-download-btn {
                    left: auto;
                    right: 30px;
                }
                .no-preview-box {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
            `;
            document.head.appendChild(style);
        }

        if (!document.getElementById('preview-modal')) {
            const modal = document.createElement('div');
            modal.id = 'preview-modal';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 95vw; width: 1200px; height: 90vh;">
                    <div class="modal-header">
                        <h3 id="preview-title">Preview</h3>
                        <button class="modal-close" id="preview-close">
                            <i data-lucide="x"></i>
                        </button>
                    </div>
                    <div class="modal-body" id="preview-body" style="display:flex; align-items:center; justify-content:center; background: rgba(0,0,0,0.9); overflow: hidden; padding: 0;">
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('preview-close').addEventListener('click', () => this.close());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.close(); 
            });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.close();
            });
        }
        if (window.lucide) lucide.createIcons();
    },

    // ⭐️ تم التعديل: نستقبل رابط المعاينة ورابط التحميل
    open(previewUrl, downloadUrl, title, fileType = null, fileName = null) {
        this.init();
        const modal = document.getElementById('preview-modal');
        const previewBody = document.getElementById('preview-body');
        const titleEl = document.getElementById('preview-title');

        const safeTitle = title || 'معاينة الملف';
        titleEl.textContent = safeTitle;

        let ext = '';
        if (fileName) ext = fileName.split('.').pop().toLowerCase();
        else if (title) ext = title.split('.').pop().toLowerCase();

        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) || fileType === 'photo';
        const isPdf = ext === 'pdf';

        if (isImage) {
            previewBody.innerHTML = `
                <div class="image-preview-wrapper">
                    <img src="${previewUrl}" alt="${safeTitle}" onerror="window.handleImageError(this)">
                    <div class="preview-error-box" style="display:none; flex-direction:column; align-items:center; color:white; text-align:center; padding: 20px; position: absolute;">
                        <i data-lucide="alert-circle" style="width: 64px; height: 64px; margin-bottom: 16px; color: #ef4444;"></i>
                        <h3 style="font-size: 1.5rem; margin-bottom: 10px; font-family: var(--font-ar);">فشل تحميل المعاينة</h3>
                        <p style="color: var(--color-text-muted); margin-bottom: 24px; font-family: var(--font-ar);">
                            قد يكون الملف غير متاح حالياً أو حدث خطأ في الاتصال.
                        </p>
                    </div>
                    <!-- ⭐️ رابط تحميل مباشر (Native) -->
                    <a href="${downloadUrl}" class="preview-download-btn" title="${I18n.currentLang === 'ar' ? 'تحميل الصورة' : 'Download Image'}">
                        <i data-lucide="download"></i>
                    </a>
                </div>
            `;
        } else if (isPdf) {
            previewBody.innerHTML = `
                <div class="pdf-preview-wrapper">
                    <iframe src="${previewUrl}" title="${safeTitle}"></iframe>
                    <a href="${downloadUrl}" class="preview-download-btn" title="${I18n.currentLang === 'ar' ? 'تحميل ملف PDF' : 'Download PDF'}">
                        <i data-lucide="download"></i>
                    </a>
                </div>
            `;
        } else {
            previewBody.innerHTML = `
                <div class="no-preview-box">
                    <i data-lucide="file-text" style="width: 80px; height: 80px; margin-bottom: 20px; color: var(--color-primary);"></i>
                    <h3 style="font-size: 1.5rem; margin-bottom: 10px; font-family: var(--font-ar);">لا يمكن معاينة هذا الملف مباشرة</h3>
                    <p style="color: var(--color-text-muted); margin-bottom: 24px; font-family: var(--font-ar);">
                        ${I18n.currentLang === 'ar' 
                            ? 'هذا النوع من الملفات (مثل Word أو ZIP) لا يدعمه المتصفح للمعاينة. يرجى تحميل الملف لعرضه.' 
                            : 'This file type (like Word or ZIP) is not supported by the browser for preview. Please download it.'}
                    </p>
                    <a href="${downloadUrl}" class="btn btn-primary" style="display: inline-flex; text-decoration: none; padding: 12px 24px; border-radius: var(--radius-md); background: var(--color-primary); color: #fff; font-weight: bold; border: none; cursor: pointer;">
                        <i data-lucide="download" style="margin-left: 8px;"></i> <span>${I18n.currentLang === 'ar' ? 'تحميل الملف' : 'Download File'}</span>
                    </a>
                </div>
            `;
        }
        
        if (window.lucide) lucide.createIcons();
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    close() {
        const modal = document.getElementById('preview-modal');
        const previewBody = document.getElementById('preview-body');
        if (!modal) return;
        
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        setTimeout(() => { 
            previewBody.innerHTML = ''; 
        }, 300);
    }
};

window.handleImageError = function(imgElement) {
    imgElement.style.display = 'none';
    const errorDiv = imgElement.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('preview-error-box')) {
        errorDiv.style.display = 'flex';
    }
    if (window.lucide) lucide.createIcons();
};