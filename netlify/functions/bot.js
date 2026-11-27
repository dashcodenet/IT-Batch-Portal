const NEWS_BOT_TOKEN = '8844991808:AAGUxYZ5hY6UDh-Iubq_QkIumTFdl6djbOg';
const ADMIN_BOT_TOKEN = '8969870263:AAGBtSZ2V3UNz7qLCeveiK54LppvvZZilQE';
const UPLOAD_BOT_TOKEN = '9156609980:AAEPb_sOkRnEptzxBDa_VASCtXwEhc0YPzo'; 
const STORAGE_CHAT_ID = '-1003814134223'; 
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby87NnDPtmA33zKOe7sIAJ3eoWLl1JWaZ3d8vrgfOOSIwATmlgDXnhNAkyisoPMQmZYjA/exec';

// ذاكرة مؤقتة للـ Netlify (ستُفقد بين الطلبات، ولكنها تكفي لمعالجة الطلب الحالي)
const CACHE_STATE = {}; 

function cacheSet(key, val) { CACHE_STATE[key] = val; }
function cacheGet(key) { return CACHE_STATE[key] || null; }
function cacheDelete(key) { delete CACHE_STATE[key]; }

function esc(s) {
  if (s == null) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatYear(y) { return y === 'year-1' ? 'السنة الأولى' : y === 'year-2' ? 'السنة الثانية' : y === 'year-3' ? 'السنة الثالثة' : 'السنة الرابعة'; }
function formatTerm(t) { return t === 'term-1' ? 'الترم الأول' : 'الترم الثاني'; }
function formatType(t) { return t === 'theory' ? 'النظري' : 'العملي'; }

function extractFileMeta(msg) {
  if (msg.photo && msg.photo.length) {
    const photo = msg.photo[msg.photo.length - 1];
    let fileName = msg.caption || ('صورة_' + Date.now());
    if (!fileName.toLowerCase().match(/\.(jpg|jpeg|png)$/)) fileName += '.jpg';
    return { fileId: photo.file_id, fileName: fileName, fileType: 'photo', fileSize: photo.file_size || 0, fileFormat: 'JPG' };
  }
  if (msg.document) {
    const originalName = msg.document.file_name || '';
    const caption = msg.caption || '';
    let fileName = caption || originalName || ('ملف_' + Date.now());
    
    let fileFormat = 'FILE';
    if (originalName.includes('.')) {
        fileFormat = originalName.split('.').pop().toUpperCase();
    } else if (fileName.includes('.')) {
        fileFormat = fileName.split('.').pop().toUpperCase();
    }
    
    if (!fileName.includes('.')) {
        const ext = fileFormat === 'FILE' ? 'bin' : fileFormat.toLowerCase();
        fileName = `${fileName}.${ext}`;
    }
    return { fileId: msg.document.file_id, fileName, fileType: 'document', fileSize: msg.document.file_size || 0, fileFormat };
  }
  return null;
}

async function tg(token, method, payload) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    return { ok: res.ok, body: await res.text() };
  } catch (e) { return { ok: false, body: e.message }; }
}

async function appsScript(payload) {
  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (e) { return { success: false, error: e.message }; }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 200, body: 'OK' };
  
  const path = event.queryStringParameters?.bot || 'upload';
  const TOKEN = path === 'news' ? NEWS_BOT_TOKEN : path === 'admin' ? ADMIN_BOT_TOKEN : UPLOAD_BOT_TOKEN;
  
  let update;
  try { update = JSON.parse(event.body); } catch { return { statusCode: 400, body: 'Bad Request' }; }

  const chatId = update.message?.chat.id ?? update.callback_query?.message?.chat.id;
  if (!chatId) return { statusCode: 200, body: 'OK' };

  try {
    await handleUpdate(update, path, chatId, TOKEN);
  } catch (err) {
    console.error('handleUpdate error:', err);
  }

  return { statusCode: 200, body: 'OK' };
};

async function handleUpdate(update, path, chatId, TOKEN) {
  const getState = () => cacheGet(`state_${path}_${chatId}`);
  const setState = (s) => cacheSet(`state_${path}_${chatId}`, s);
  const clearState = () => cacheDelete(`state_${path}_${chatId}`);

  async function buildKeyboard(rows) {
    if (!rows) return [];
    const out = rows.map(row => row.map(btn => {
      if (btn.nav) {
        const n = btn.nav;
        // ⭐️ السحر: بناء نص مضغوط جداً لا يتجاوز 64 بايت
        let cd = `n|${n.action}|${n.year || ''}|${n.term || ''}|${n.subjectIndex !== undefined && n.subjectIndex !== null ? n.subjectIndex : ''}|${n.type || ''}|${n.category || ''}|${n.fileIndex !== undefined && n.fileIndex !== null ? n.fileIndex : ''}|${n.rowNumber || ''}`;
        cd = cd.replace(/\|+$/, ''); // إزالة الخطوط الزائدة في النهاية
        return { text: btn.text, callback_data: cd };
      }
      return btn;
    }));
    return out;
  }

  async function render(text, rows, opts = {}) {
    const payload = { chat_id: chatId, text: text || ' ', parse_mode: 'HTML', reply_markup: { inline_keyboard: rows || [] } };
    if (!opts.send && opts.messageId) {
      payload.message_id = opts.messageId;
      return tg(TOKEN, 'editMessageText', payload);
    }
    return tg(TOKEN, 'sendMessage', payload);
  }

  async function renderNav(nav, opts) {
    const { send, messageId } = opts;
    const r = async (text, rows) => {
      const builtRows = await buildKeyboard(rows);
      return render(text, builtRows, { send, messageId });
    };
    const A = nav.action;

    // ⭐️ جلب اسم المادة الحقيقي بناءً على الرقم (Index)
    let subjectName = nav.subject || '';
    if (nav.subjectIndex !== null && nav.subjectIndex !== undefined) {
      const subRes = await appsScript({ action: 'get_curriculum_data', level: 'subjects', year: nav.year, term: nav.term });
      if (subRes.success && subRes.data && subRes.data[nav.subjectIndex]) {
         subjectName = subRes.data[nav.subjectIndex];
      }
    }

    if (A === 'main') {
      return r('👋 <b>مرحباً بك في لوحة التحكم الرئيسية</b>\n\nاختر المسار:', [
        [{ text: '📂 تصفح الملفات', nav: { action: 'browse_y', mode: 'browse' } }],
        [{ text: '⚙️ إدارة المواد', nav: { action: 'subj_y', mode: 'manage' } }],
        [{ text: '🗂️ إدارة الفئات', nav: { action: 'cat_y' } }],
        [{ text: '📢 الأخبار والتعميمات', nav: { action: 'news_list' } }]
      ]);
    }

    if (['browse_y', 'subj_y', 'cat_y', 'up_y'].includes(A)) {
      let nextAction = A === 'browse_y' ? 'browse_t' : A === 'subj_y' ? 'subj_t' : A === 'cat_y' ? 'cat_t' : 'up_t';
      const title = A === 'browse_y' ? '📂 <b>تصفح الملفات</b>' : A === 'subj_y' ? '⚙️ <b>إدارة المواد</b>' : A === 'cat_y' ? '🗂️ <b>إدارة الفئات</b>' : '📤 <b>رفع ملف جديد</b>';
      return r(`${title}\n\nالخطوة 1: اختر السنة:`, [
        [{ text: 'السنة الأولى', nav: { action: nextAction, year: 'year-1' } }, { text: 'السنة الثانية', nav: { action: nextAction, year: 'year-2' } }],
        [{ text: 'السنة الثالثة', nav: { action: nextAction, year: 'year-3' } }, { text: 'السنة الرابعة', nav: { action: nextAction, year: 'year-4' } }],
        ...(A === 'up_y' ? [] : [[{ text: '🏠 الرئيسية', nav: { action: 'main' } }]])
      ]);
    }

    if (['browse_t', 'subj_t', 'cat_t', 'up_t'].includes(A)) {
      const res = await appsScript({ action: 'get_curriculum_data', level: 'terms', year: nav.year });
      if (!res.success || !res.data?.length) return r('⚠️ لا توجد ترمات.', [[{ text: '⬅️ رجوع', nav: { action: A.replace('_t', '_y') } }]]);
      
      let nextAction = A.replace('_t', '_s'); 
      if (A === 'subj_t') nextAction = 'subj_list';

      return r(`📍 <b>المسار:</b> ${formatYear(nav.year)}\n\nالخطوة 2: اختر الترم:`, [
        ...res.data.map(t => [{ text: formatTerm(t), nav: { action: nextAction, year: nav.year, term: t } }]),
        [{ text: '⬅️ رجوع', nav: { action: A.replace('_t', '_y') } }]
      ]);
    }

    if (['browse_s', 'subj_list', 'cat_s', 'up_s'].includes(A)) {
      const res = await appsScript({ action: 'get_curriculum_data', level: 'subjects', year: nav.year, term: nav.term });
      
      let nextAction = A === 'browse_s' ? 'browse_ty' : A === 'subj_list' ? 'subj_act' : A === 'cat_s' ? 'cat_ty' : 'up_ty';
      let backAction = A === 'subj_list' ? 'subj_t' : A === 'up_s' ? 'up_t' : 'browse_t';

      return r(`📍 <b>المسار:</b> ${formatYear(nav.year)} > ${formatTerm(nav.term)}\n\nالخطوة 3: اختر المادة:`, [
        ...(res.success && res.data?.length ? res.data.map((s, i) => [{ text: `📚 ${s}`, nav: { action: nextAction, year: nav.year, term: nav.term, subjectIndex: i } }]) : []),
        ...(A === 'subj_list' ? [[{ text: '➕ إضافة مادة جديدة', nav: { action: 'add_subject_prompt', year: nav.year, term: nav.term } }]] : []),
        [{ text: '⬅️ رجوع', nav: { action: backAction, year: nav.year, term: nav.term } }]
      ]);
    }

    if (A === 'subj_act') {
      return r(`⚙️ ماذا تريد بالمادة (<b>${esc(subjectName)}</b>)؟`, [
        [{ text: '✏️ تعديل', nav: { action: 'rename_subject_prompt', year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex } }],
        [{ text: '🗑 حذف', nav: { action: 'delete_subject', year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex } }],
        [{ text: '⬅️ رجوع', nav: { action: 'subj_list', year: nav.year, term: nav.term } }]
      ]);
    }

    if (['browse_ty', 'cat_ty', 'up_ty'].includes(A)) {
      let nextAction = A === 'browse_ty' ? 'browse_c' : A === 'cat_ty' ? 'cat_list' : 'up_c';
      return r(`📍 <b>المسار:</b> ... > ${esc(subjectName)}\n\nاختر القسم:`, [
        [{ text: '📖 النظري', nav: { action: nextAction, year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: 'theory' } }],
        [{ text: '💻 العملي', nav: { action: nextAction, year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: 'practical' } }],
        [{ text: '⬅️ رجوع', nav: { action: A.replace('_ty', '_s'), year: nav.year, term: nav.term } }]
      ]);
    }

    if (['browse_c', 'cat_list', 'up_c'].includes(A)) {
      const res = await appsScript({ action: 'get_categories', year: nav.year, term: nav.term, subject: subjectName, type: nav.type });
      
      let nextAction = A === 'browse_c' ? 'browse_f' : A === 'cat_list' ? 'cat_act' : 'await_upload';
      let backAction = A === 'cat_list' ? 'cat_ty' : A === 'up_c' ? 'up_ty' : 'browse_ty';

      return r(`📍 <b>المسار:</b> ... > ${esc(subjectName)} > ${formatType(nav.type)}\n\nاختر الفئة:`, [
        ...(res.success && res.data?.length ? res.data.map(c => [{ text: `📁 ${c.nameAr}`, nav: { action: nextAction, year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type, category: c.id } }]) : []),
        ...(A === 'cat_list' ? [[{ text: '➕ إضافة فئة', nav: { action: 'add_cat_prompt', year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type } }]] : []),
        [{ text: '⬅️ رجوع', nav: { action: backAction, year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex } }]
      ]);
    }

    if (A === 'cat_act') {
      return r(`⚙️ ماذا تريد بالفئة (<b>${esc(nav.categoryName || nav.category)}</b>)؟`, [
        [{ text: '✏️ تعديل', nav: { action: 'rename_cat_prompt', year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type, category: nav.category } }],
        [{ text: '🗑 حذف', nav: { action: 'delete_cat', year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type, category: nav.category } }],
        [{ text: '⬅️ رجوع', nav: { action: 'cat_list', year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type } }]
      ]);
    }

    if (A === 'browse_f') {
      const res = await appsScript({ action: 'get_admin_data', level: 'files', year: nav.year, term: nav.term, subject: subjectName, type: nav.type, category: nav.category });
      return r(`📍 <b>المسار:</b> ... > ${esc(nav.category)}\n\n📂 الملفات (${res.data?.length || 0}):`, [
        ...(res.success && res.data?.length ? res.data.map((f, i) => [{ text: `📄 ${esc(f.fileName)}`, nav: { action: 'file_manage', fileIndex: i, year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type, category: nav.category } }]) : []),
        [{ text: '⬅️ رجوع', nav: { action: 'browse_c', year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type } }]
      ]);
    }

    if (A === 'file_manage') {
      const res = await appsScript({ action: 'get_admin_data', level: 'files', year: nav.year, term: nav.term, subject: subjectName, type: nav.type, category: nav.category });
      const file = res.data[nav.fileIndex];
      if (!file) return r('⚠️ الملف غير موجود.', [[{ text: '⬅️ رجوع', nav: { action: 'browse_f', year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type, category: nav.category } }]]);
      
      return r(`📄 <b>تفاصيل الملف:</b>\n\n📝 الاسم: ${esc(file.fileName)}\n📦 الحجم: ${esc(file.fileSize)}\n📅 التاريخ: ${esc(file.date)}`, [
        [{ text: '✏️ تعديل الاسم', nav: { action: 'rename_file_prompt', rowNumber: file.rowNumber, oldName: file.fileName, year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type, category: nav.category } }],
        [{ text: '🗑 حذف', nav: { action: 'delete_file', rowNumber: file.rowNumber, year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type, category: nav.category } }],
        [{ text: '⬅️ رجوع', nav: { action: 'browse_f', year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type, category: nav.category } }]
      ]);
    }

    if (A === 'rename_file_prompt') {
      await setState({ action: 'awaiting_file_rename', rowNumber: nav.rowNumber, oldName: nav.oldName, year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type, category: nav.category });
      return r(`📝 <b>تعديل اسم الملف</b>\n\nالاسم الحالي: (<b>${esc(nav.oldName)}</b>)\n\n✍️ أرسل الاسم الجديد الآن.`, [[{ text: '❌ إلغاء', nav: { action: 'file_manage', fileIndex: nav.fileIndex, year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type, category: nav.category } }]]);
    }

    if (A === 'await_upload') {
      await setState({ action: 'awaiting_file', year: nav.year, term: nav.term, subject: subjectName, type: nav.type, category: nav.category });
      return r(`📥 <b>جاهز لاستلام الملف!</b>\n\nأرسل الآن الملف إلى:\n📍 المادة: ${esc(subjectName)}\n📁 الفئة: ${esc(nav.category)}`, [[{ text: '❌ إلغاء', nav: { action: 'up_y' } }]]);
    }

    if (A === 'add_subject_prompt') {
      await setState({ action: 'awaiting_subject', year: nav.year, term: nav.term });
      return r(`📝 <b>إضافة مادة</b>\n\n✍️ أرسل اسم المادة الآن.`, [[{ text: '❌ إلغاء', nav: { action: 'subj_list', year: nav.year, term: nav.term } }]]);
    }

    if (A === 'rename_subject_prompt') {
      await setState({ action: 'awaiting_rename', year: nav.year, term: nav.term, oldSubject: subjectName });
      return r(`📝 <b>تعديل المادة</b> (<b>${esc(subjectName)}</b>)\n\n✍️ أرسل الاسم الجديد.`, [[{ text: '❌ إلغاء', nav: { action: 'subj_act', year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex } }]]);
    }

    if (A === 'add_cat_prompt') {
      await setState({ action: 'awaiting_cat_add_ar', year: nav.year, term: nav.term, subject: subjectName, type: nav.type });
      return r(`📝 <b>إضافة فئة</b>\n\n✍️ أرسل الاسم بالعربية.`, [[{ text: '❌ إلغاء', nav: { action: 'cat_list', year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type } }]]);
    }

    if (A === 'rename_cat_prompt') {
      await setState({ action: 'awaiting_cat_rename', id: nav.category, year: nav.year, term: nav.term, subject: subjectName, type: nav.type });
      return r(`📝 <b>تعديل الفئة</b> (<b>${esc(nav.categoryName || nav.category)}</b>)\n\n✍️ أرسل الاسم الجديد (عربي | إنجليزي).`, [[{ text: '❌ إلغاء', nav: { action: 'cat_list', year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type } }]]);
    }

    if (A === 'delete_subject') {
      const res = await appsScript({ action: 'delete_subject', year: nav.year, term: nav.term, subject: subjectName });
      if (!res.success) return r('⚠️ ' + esc(res.error), [[{ text: '⬅️ رجوع', nav: { action: 'subj_act', year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex } }]]);
      await tg(TOKEN, 'sendMessage', { chat_id: chatId, text: `✅ تم الحذف.`, parse_mode: 'HTML' });
      return renderNav({ action: 'subj_list', year: nav.year, term: nav.term }, { send: false, messageId });
    }

    if (A === 'delete_cat') {
      const res = await appsScript({ action: 'delete_category', id: nav.category });
      if (!res.success) return r('⚠️ ' + esc(res.error), [[{ text: '⬅️ رجوع', nav: { action: 'cat_act', year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type, category: nav.category } }]]);
      await tg(TOKEN, 'sendMessage', { chat_id: chatId, text: '✅ تم الحذف.', parse_mode: 'HTML' });
      return renderNav({ action: 'cat_list', year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type }, { send: false, messageId });
    }

    if (A === 'delete_file') {
      const res = await appsScript({ action: 'delete_academic_file', rowNumber: nav.rowNumber });
      if (!res.success) return r('⚠️ ' + esc(res.error), [[{ text: '⬅️ رجوع', nav: { action: 'file_manage', fileIndex: nav.fileIndex, year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type, category: nav.category } }]]);
      await tg(TOKEN, 'sendMessage', { chat_id: chatId, text: '✅ تم الحذف.', parse_mode: 'HTML' });
      return renderNav({ action: 'browse_f', year: nav.year, term: nav.term, subjectIndex: nav.subjectIndex, type: nav.type, category: nav.category }, { send: false, messageId });
    }

    if (A === 'delete_news') {
      const res = await appsScript({ action: 'delete_file', rowNumber: nav.rowNumber });
      if (!res.success) return r('⚠️ ' + esc(res.error), [[{ text: '⬅️ رجوع', nav: { action: 'news_list' } }]]);
      await tg(TOKEN, 'sendMessage', { chat_id: chatId, text: '✅ تم الحذف.', parse_mode: 'HTML' });
      return renderNav({ action: 'news_list' }, { send: false, messageId });
    }

    if (A === 'news_list') {
      const res = await appsScript({ action: 'get_news_files' });
      return r(res.data?.length ? '📢 <b>الأخبار والتعميمات الحالية</b>' : '⚠️ لا توجد أخبار.', [
        ...(res.success && res.data?.length ? res.data.map(f => [{ text: `📄 ${esc(f.fileName)} (${f.category === 'announcement' ? 'إعلان' : 'تعميم'})`, nav: { action: 'delete_news', rowNumber: f.rowNumber } }]) : []),
        [{ text: '🏠 الرئيسية', nav: { action: 'main' } }]
      ]);
    }
  }

  async function routeCallback(q) {
    const messageId = q.message?.message_id;
    const data = q.data;
    
    if (data.startsWith('n|')) {
      const parts = data.split('|');
      // parts: ['n', 'action', 'year', 'term', 'subjectIndex', 'type', 'category', 'fileIndex', 'rowNumber']
      const nav = {
        action: parts[1],
        year: parts[2] || '',
        term: parts[3] || '',
        subjectIndex: parts[4] !== undefined && parts[4] !== '' ? parseInt(parts[4]) : null,
        type: parts[5] || '',
        category: parts[6] || '',
        fileIndex: parts[7] !== undefined && parts[7] !== '' ? parseInt(parts[7]) : null,
        rowNumber: parts[8] || ''
      };
      
      const promptActions = ['add_subject_prompt', 'rename_subject_prompt', 'add_cat_prompt', 'rename_cat_prompt', 'rename_file_prompt'];
      if (promptActions.includes(nav.action)) {
        await tg(TOKEN, 'answerCallbackQuery', { callback_query_id: q.id, text: '✍️ أرسل النص الآن.', show_alert: true });
      } else {
        await tg(TOKEN, 'answerCallbackQuery', { callback_query_id: q.id });
      }
      return renderNav(nav, { send: false, messageId });
    }

    await tg(TOKEN, 'answerCallbackQuery', { callback_query_id: q.id });

    if (data === 'X') {
      await clearState();
      const homeNav = path === 'upload' ? { action: 'up_y' } : { action: 'main' };
      return renderNav(homeNav, { send: false, messageId });
    }

    if (data.startsWith('cat|')) {
      const parts = data.split('|');
      const category = parts[1];
      const row = parseInt(parts[2], 10);
      if (!(row > 0)) return;
      const res = await appsScript({ action: 'update_category', rowNumber: row, category });
      return tg(TOKEN, 'editMessageText', { chat_id: chatId, message_id: messageId, text: res.success ? '✅ تم الحفظ.' : '⚠️ ' + esc(res.error), parse_mode: 'HTML' });
    }
  }

  async function backupToStorage(msgId) {
    if (!STORAGE_CHAT_ID) return;
    try {
        const res = await tg(TOKEN, 'copyMessage', { chat_id: STORAGE_CHAT_ID, from_chat_id: chatId, message_id: msgId });
        if (!res.ok) console.error("Storage copy failed:", res.body);
    } catch(e) { console.error("Storage Backup Exception:", e); }
  }

  if (path === 'news') {
    if (update.message) {
      const msg = update.message;
      if (msg.text) {
        return tg(TOKEN, 'sendMessage', { chat_id: chatId, parse_mode: 'HTML', text: msg.text === '/start' ? '👋 أهلاً بك في بوت الأخبار.\nأرسل صورة أو ملفاً ليتم حفظه.' : 'ℹ️ أرسل صورة أو ملف.' });
      }

      const meta = extractFileMeta(msg);
      if (!meta) return;
      await backupToStorage(msg.message_id);

      const res = await appsScript({ fileId: meta.fileId, fileName: meta.fileName, fileType: meta.fileType, fileSize: meta.fileSize, chatId, messageId: msg.message_id });
      if (!res.success) return tg(TOKEN, 'sendMessage', { chat_id: chatId, text: '⚠️ ' + esc(res.error), parse_mode: 'HTML' });

      return tg(TOKEN, 'sendMessage', {
        chat_id: chatId, text: `📥 <b>تم الاستلام:</b>\n📄 ${esc(meta.fileName)}\n\nحدد التصنيف:`, parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [[{ text: '📢 إعلان', callback_data: `cat|announcement|${res.rowNumber}` }, { text: '📌 تعميم', callback_data: `cat|circular|${res.rowNumber}` }]] }
      });
    }
    if (update.callback_query) return routeCallback(update.callback_query);
    return;
  }

  if (path === 'upload' || path === 'admin') {
    if (update.message) {
      const msg = update.message;
      
      if (msg.text === '/start' || (path === 'admin' && msg.text === '/admin') || (path === 'upload' && msg.text === '/upload')) {
        await clearState();
        return renderNav({ action: path === 'upload' ? 'up_y' : 'main' }, { send: true });
      }
      if (msg.text === '/cancel') {
        await clearState();
        return tg(TOKEN, 'sendMessage', { chat_id: chatId, text: '✅ تم الإلغاء.', parse_mode: 'HTML' });
      }

      const session = await getState();

      if (session?.action === 'awaiting_file') {
        const meta = extractFileMeta(msg);
        if (!meta) return tg(TOKEN, 'sendMessage', { chat_id: chatId, text: '⚠️ أرسل صورة أو مستند.', parse_mode: 'HTML' });

        await backupToStorage(msg.message_id);
        const res = await appsScript({ action: 'save_academic_file', ...meta, year: session.year, term: session.term, subject: session.subject, type: session.type, category: session.category });
        await clearState();

        if (res.success) {
          await tg(TOKEN, 'sendMessage', { chat_id: chatId, text: `✅ <b>تم الحفظ!</b>\n📍 ${esc(session.subject)}`, parse_mode: 'HTML' });
          return renderNav({ action: 'up_y' }, { send: true });
        }
        return tg(TOKEN, 'sendMessage', { chat_id: chatId, text: '⚠️ خطأ: ' + esc(res.error), parse_mode: 'HTML' });
      }

      if (path === 'admin' && session) {
        if (session.action === 'awaiting_subject') {
          const res = await appsScript({ action: 'add_subject', year: session.year, term: session.term, subject: msg.text.trim() });
          await clearState();
          if (res.success) {
            await tg(TOKEN, 'sendMessage', { chat_id: chatId, text: `✅ تمت الإضافة.`, parse_mode: 'HTML' });
            return renderNav({ action: 'subj_list', year: session.year, term: session.term }, { send: true });
          }
          return tg(TOKEN, 'sendMessage', { chat_id: chatId, text: '⚠️ ' + esc(res.error), parse_mode: 'HTML' });
        }

        if (session.action === 'awaiting_rename') {
          const res = await appsScript({ action: 'rename_subject', year: session.year, term: session.term, oldSubject: session.oldSubject, newSubject: msg.text.trim() });
          await clearState();
          if (res.success) {
            await tg(TOKEN, 'sendMessage', { chat_id: chatId, text: `✅ تم التعديل.`, parse_mode: 'HTML' });
            return renderNav({ action: 'subj_list', year: session.year, term: session.term }, { send: true });
          }
          return tg(TOKEN, 'sendMessage', { chat_id: chatId, text: '⚠️ ' + esc(res.error), parse_mode: 'HTML' });
        }

        if (session.action === 'awaiting_cat_add_ar') {
          await setState({ action: 'awaiting_cat_add_en', nameAr: msg.text.trim(), year: session.year, term: session.term, subject: session.subject, type: session.type });
          return tg(TOKEN, 'sendMessage', { chat_id: chatId, text: `✅ العربي: <b>${esc(msg.text.trim())}</b>\n\nأرسل الإنجليزي (أو "تخطي"):`, parse_mode: 'HTML' });
        }

        if (session.action === 'awaiting_cat_add_en') {
          const nameEn = msg.text.trim() === 'تخطي' ? session.nameAr : msg.text.trim();
          const res = await appsScript({ action: 'add_category', id: 'c_' + Date.now(), nameAr: session.nameAr, nameEn: nameEn, year: session.year, term: session.term, subject: session.subject, type: session.type });
          await clearState();
          if (res.success) {
            await tg(TOKEN, 'sendMessage', { chat_id: chatId, text: `✅ تمت إضافة الفئة.`, parse_mode: 'HTML' });
            return renderNav({ action: 'cat_list', year: session.year, term: session.term, subjectIndex: session.subjectIndex, type: session.type }, { send: true });
          }
          return tg(TOKEN, 'sendMessage', { chat_id: chatId, text: '⚠️ ' + esc(res.error), parse_mode: 'HTML' });
        }

        if (session.action === 'awaiting_cat_rename') {
          const parts = msg.text.split('|');
          const nameAr = parts[0].trim();
          const nameEn = parts.length > 1 ? parts[1].trim() : nameAr;
          const res = await appsScript({ action: 'rename_category', id: session.id, nameAr, nameEn });
          await clearState();
          if (res.success) {
            await tg(TOKEN, 'sendMessage', { chat_id: chatId, text: `✅ تم التعديل.`, parse_mode: 'HTML' });
            return renderNav({ action: 'cat_list', year: session.year, term: session.term, subjectIndex: session.subjectIndex, type: session.type }, { send: true });
          }
          return tg(TOKEN, 'sendMessage', { chat_id: chatId, text: '⚠️ ' + esc(res.error), parse_mode: 'HTML' });
        }

        if (session.action === 'awaiting_file_rename') {
          const res = await appsScript({ action: 'rename_academic_file', rowNumber: session.rowNumber, newName: msg.text.trim() });
          await clearState();
          if (res.success) {
            await tg(TOKEN, 'sendMessage', { chat_id: chatId, text: `✅ تم التعديل.`, parse_mode: 'HTML' });
            return renderNav({ action: 'browse_f', year: session.year, term: session.term, subjectIndex: session.subjectIndex, type: session.type, category: session.category }, { send: true });
          }
          return tg(TOKEN, 'sendMessage', { chat_id: chatId, text: '⚠️ ' + esc(res.error), parse_mode: 'HTML' });
        }
      }

      return tg(TOKEN, 'sendMessage', { chat_id: chatId, text: `ℹ️ استخدم ${path === 'upload' ? '/upload' : '/admin'} للبدء.`, parse_mode: 'HTML' });
    }

    if (update.callback_query) return routeCallback(update.callback_query);
    return;
  }
}