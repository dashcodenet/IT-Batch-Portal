exports.handler = async (event, context) => {
  const { file_id, name, mode, bot } = event.queryStringParameters || {};
  if (!file_id) return { statusCode: 400, body: 'Missing file_id' };

  const NEWS_BOT_TOKEN = '8844991808:AAGUxYZ5hY6UDh-Iubq_QkIumTFdl6djbOg';
  const UPLOAD_BOT_TOKEN = '9168549059:AAGUgbc2E27Tnu2sXx9E8tNB04EXo6d9yxE';
  const token = bot === 'news' ? NEWS_BOT_TOKEN : UPLOAD_BOT_TOKEN;

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${file_id}`);
    const tgData = await tgRes.json();
    if (!tgData.ok) return { statusCode: 404, body: 'File not found on Telegram' };

    const fileUrl = `https://api.telegram.org/file/bot${token}/${tgData.result.file_path}`;

    // ⭐️ السحر: إذا كان الطلب معاينة، نوجه المتصفح مباشرة لتيليجرام (فوري وبدون مشاكل)
    if (mode === 'preview') {
        return {
            statusCode: 302,
            headers: { 'Location': fileUrl, 'Access-Control-Allow-Origin': '*' }
        };
    }

    // إذا كان الطلب تحميل، نستخدم Proxy
    const fileRes = await fetch(fileUrl);
    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const safeFileName = encodeURIComponent(name || 'download');
    const ext = safeFileName.split('.').pop().toLowerCase();
    let contentType = 'application/octet-stream';
    if (['jpg', 'jpeg'].includes(ext)) contentType = 'image/jpeg';
    else if (ext === 'png') contentType = 'image/png';
    else if (ext === 'pdf') contentType = 'application/pdf';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename*=UTF-8''${safeFileName}`,
        'Access-Control-Allow-Origin': '*'
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    return { statusCode: 500, body: 'Error: ' + error.message };
  }
};