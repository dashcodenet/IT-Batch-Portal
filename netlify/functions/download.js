const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const { file_id, name, mode, bot } = event.queryStringParameters;
  
  if (!file_id) return { statusCode: 400, body: 'Missing file_id' };

  const NEWS_BOT_TOKEN = '8844991808:AAGUxYZ5hY6UDh-Iubq_QkIumTFdl6djbOg';
  const UPLOAD_BOT_TOKEN = '9168549059:AAGUgbc2E27Tnu2sXx9E8tNB04EXo6d9yxE';
  const token = bot === 'news' ? NEWS_BOT_TOKEN : UPLOAD_BOT_TOKEN;

  try {
    // 1. جلب مسار الملف من تيليجرام
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${file_id}`);
    const tgData = await tgRes.json();
    if (!tgData.ok) return { statusCode: 404, body: 'File not found' };

    // 2. جلب الملف نفسه
    const fileRes = await fetch(`https://api.telegram.org/file/bot${token}/${tgData.result.file_path}`);
    const buffer = await fileRes.buffer();
    
    // 3. تجهيز الرد
    const safeFileName = encodeURIComponent(name || 'download');
    const disposition = mode === 'download' ? 'attachment' : 'inline';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': fileRes.headers.get('content-type') || 'application/octet-stream',
        'Content-Disposition': `${disposition}; filename*=UTF-8''${safeFileName}`,
        'Access-Control-Allow-Origin': '*'
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    return { statusCode: 500, body: 'Error: ' + error.message };
  }
};