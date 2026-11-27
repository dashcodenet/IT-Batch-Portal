/**
 * Toast.js - إشعارات لامعة + سحب للإغلاق
 */
(function() {
    'use strict';

const Toast = {
    container: null,

    init() {
        if (this.container) return;
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    },

    show(message, type = 'info', duration = 4000, actionUrl = null, actionText = null) {
        this.init();

        let displayMessage = message;
        if (typeof I18n !== 'undefined' && I18n.t && !message.startsWith('<')) {
            const translated = I18n.t(message);
            if (translated && translated !== message) displayMessage = translated;
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.touchAction = 'pan-y'; // ⭐️ للسحب على الهاتف
        
        let iconName = 'info';
        if (type === 'success') iconName = 'check-circle';
        else if (type === 'error') iconName = 'alert-circle';
        else if (type === 'warning') iconName = 'alert-triangle';

        // ⭐️ بناء الإشعار مع زر "اذهب"
        toast.innerHTML = `
            <i data-lucide="${iconName}" class="toast-icon" style="width:20px;height:20px;flex-shrink:0;"></i>
            <div style="flex:1; font-size:0.9rem; line-height:1.4;">${displayMessage}</div>
            ${actionUrl ? `<a href="${actionUrl}" class="toast-action-btn">${actionText || 'اذهب'}</a>` : ''}
        `;

        this.container.appendChild(toast);
        if (window.lucide) lucide.createIcons();

        requestAnimationFrame(() => toast.classList.add('show'));

        // ⭐️ السحب للإغلاق
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        let isSwiping = false;

        toast.addEventListener('pointerdown', (e) => {
            if (e.target.tagName === 'A' || e.target.closest('a')) return;
            isDragging = true;
            isSwiping = false;
            startX = e.clientX;
            toast.style.transition = 'none';
            toast.setPointerCapture(e.pointerId);
        });

        toast.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            currentX = e.clientX - startX;
            
            if (Math.abs(currentX) > 10) isSwiping = true;
            
            if (isSwiping) {
                toast.style.transform = `translateX(${currentX}px)`;
                toast.style.opacity = 1 - Math.min(Math.abs(currentX) / 150, 1);
            }
        });

        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            toast.style.transition = 'all 0.3s ease';

            if (isSwiping && Math.abs(currentX) > 80) {
                toast.style.transform = `translateX(${currentX > 0 ? '150%' : '-150%'})`;
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            } else {
                toast.style.transform = 'translateX(0)';
                toast.style.opacity = '1';
            }
        };

        toast.addEventListener('pointerup', endDrag);
        toast.addEventListener('pointercancel', endDrag);

        const timeout = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);

        toast.addEventListener('pointerdown', () => clearTimeout(timeout), { once: true });
    }
};

window.Toast = Toast;
})();