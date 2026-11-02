/**
 * ErrorHandler.js - Global error management
 */
const ErrorHandler = {
    init() {
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled Promise Rejection:', event.reason);
        });
    },

    handleApiError(error) {
        // طباعة الخطأ الحقيقي في الكونسول
        console.error('API Error Details:', error);
        
        let msgAr = 'تعذر الاتصال بالخادم. يرجى التحقق من الإنترنت.';
        let msgEn = 'Failed to connect to server.';

        // كشف خطأ CORS أو انقطاع الشبكة
        if (error.message && error.message.includes('Failed to fetch')) {
            msgAr = 'المتصفح يمنع الاتصال (حماية CORS). يرجى تجربة رفع الموقع على Netlify لحل المشكلة نهائياً.';
            msgEn = 'CORS Error. Please deploy to Netlify to fix this.';
        } else if (error.message) {
            msgAr = `خطأ: ${error.message}`;
        }

        const lang = document.documentElement.lang || 'ar';
        const finalMsg = lang === 'ar' ? msgAr : msgEn;

        if (window.Toast) {
            Toast.show(finalMsg, 'error', 5000); // إظهار الخطأ لمدة 5 ثوان
        } else {
            alert(finalMsg);
        }
        return null;
    }
};