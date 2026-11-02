// netlify/functions/download.js
exports.handler = async (event, context) => {
    const { file_id, name, mode } = event.queryStringParameters || {};
    
    if (!file_id) {
        return { statusCode: 400, body: 'Missing file_id' };
    }

    const UPLOAD_BOT_TOKEN = '9168549059:AAGUgbc2E27Tnu2sXx9E8tNB04EXo6d9yxE';

    try {
        // جلب مسار الملف من تيليجرام
        const tgRes = await fetch(`https://api.telegram.org/bot${UPLOAD_BOT_TOKEN}/getFile?file_id=${file_id}`);
        const tgData = await tgRes.json();
        
        if (!tgData.ok) {
            return { statusCode: 404, body: 'File not found on Telegram' };
        }

        // جلب محتوى الملف
        const fileRes = await fetch(`https://api.telegram.org/file/bot${UPLOAD_BOT_TOKEN}/${tgData.result.file_path}`);
        const arrayBuffer = await fileRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // تحديد نوع المحتوى
        const ext = name ? name.split('.').pop().toLowerCase() : 'jpg';
        let contentType = 'application/octet-stream';
        if (['jpg', 'jpeg'].includes(ext)) contentType = 'image/jpeg';
        else if (ext === 'png') contentType = 'image/png';
        else if (ext === 'pdf') contentType = 'application/pdf';
        else if (ext === 'docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (ext === 'pptx') contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

        // تجهيز الهيدرز
        const headers = {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Expose-Headers': 'Content-Disposition',
        };

        const safeName = encodeURIComponent(name || 'file');
        if (mode === 'download') {
            headers['Content-Disposition'] = `attachment; filename*=UTF-8''${safeName}`;
        } else {
            headers['Content-Disposition'] = `inline; filename*=UTF-8''${safeName}`;
        }

        return {
            statusCode: 200,
            headers,
            body: buffer.toString('base64'),
            isBase64Encoded: true,
        };

    } catch (error) {
        return { statusCode: 500, body: 'Error fetching file: ' + error.message };
    }
};