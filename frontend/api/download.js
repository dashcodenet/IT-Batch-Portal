const NEWS_BOT_TOKEN = process.env.NEWS_BOT_TOKEN || '8844991808:AAGUxYZ5hY6UDh-Iubq_QkIumTFdl6djbOg';
const UPLOAD_BOT_TOKEN = process.env.UPLOAD_BOT_TOKEN || '9156609980:AAEPb_sOkRnEptzxBDa_VASCtXwEhc0YPzo';
const GH_TOKEN = process.env.GITHUB_TOKEN;

const GITHUB_OWNER = 'itcore010';
const GITHUB_REPO = 'it-portal-files';

function getContentType(fileName) {
  const ext = (fileName || '').split('.').pop().toLowerCase();
  const map = { 
    'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'gif': 'image/gif', 'webp': 'image/webp', 'svg': 'image/svg+xml',
    'pdf': 'application/pdf', 'doc': 'application/msword', 
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'ppt': 'application/vnd.ms-powerpoint', 
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 
    'zip': 'application/zip', 'mp4': 'video/mp4', 'webm': 'video/webm', 'mp3': 'audio/mpeg'
  };
  return map[ext] || 'application/octet-stream';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { file_id, type, asset_id, name = 'download', mode = 'preview', bot = 'upload' } = req.query;

  try {
    if (type === 'github') {
      if (!asset_id) return res.status(400).send('Missing asset_id');
      if (!GH_TOKEN) return res.status(500).send('GITHUB_TOKEN environment variable is missing');

      const githubApiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/assets/${asset_id}`;
      
      const ghRes = await fetch(githubApiUrl, {
        headers: {
          'Authorization': `Bearer ${GH_TOKEN}`,
          'Accept': 'application/octet-stream',
          'User-Agent': 'Vercel-Proxy'
        },
        redirect: 'manual' 
      });

      let fileRes;
      if (ghRes.status === 302) {
        const location = ghRes.headers.get('location');
        fileRes = await fetch(location); 
      } else if (ghRes.ok) {
        fileRes = ghRes;
      } else {
        return res.status(ghRes.status).send(`GitHub API Error: ${ghRes.statusText}`);
      }

      const buffer = await fileRes.arrayBuffer();
      res.setHeader('Content-Type', getContentType(name));
      res.setHeader('Cache-Control', 'no-store');
      const safeName = encodeURIComponent(name);
      res.setHeader('Content-Disposition', mode === 'download' ? `attachment; filename*=UTF-8''${safeName}` : `inline; filename*=UTF-8''${safeName}`);
      
      return res.send(Buffer.from(buffer));
    } 

    if (!file_id) return res.status(400).send('Missing file_id or type parameter');
    
    const token = bot === 'news' ? NEWS_BOT_TOKEN : UPLOAD_BOT_TOKEN;
    
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${file_id}`, { cache: "no-store" });
    const tgData = await tgRes.json();
    
    if (!tgData.ok) return res.status(404).send('File not found on Telegram: ' + (tgData.description || ''));

    const fileRes = await fetch(`https://api.telegram.org/file/bot${token}/${tgData.result.file_path}`, { cache: "no-store" });
    const buffer = await fileRes.arrayBuffer();

    res.setHeader('Content-Type', getContentType(name));
    res.setHeader('Cache-Control', 'no-store');
    const safeName = encodeURIComponent(name);
    res.setHeader('Content-Disposition', mode === 'download' ? `attachment; filename*=UTF-8''${safeName}` : `inline; filename*=UTF-8''${safeName}`);

    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error("Download API Error:", error);
    res.status(500).send('Internal Server Error: ' + error.message);
  }
}