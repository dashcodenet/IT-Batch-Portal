/**
 * Schedule.js - Logic for Schedule page
 */
document.addEventListener('DOMContentLoaded', async () => {
    ErrorHandler.init();
    await I18n.init();
    ThemeManager.init();
    LangSwitcher.init();

    initScheduleControls();
});

function initScheduleControls() {
    const yearSelect = document.getElementById('schedule-year');
    const termSelect = document.getElementById('schedule-term');
    
    // Populate Years
    for (let i = 1; i <= 4; i++) {
        const option = document.createElement('option');
        option.value = `year-${i}`;
        option.textContent = I18n.currentLang === 'ar' ? `السنة ${i}` : `Year ${i}`;
        yearSelect.appendChild(option);
    }

    // Populate Terms
    for (let i = 1; i <= 2; i++) {
        const option = document.createElement('option');
        option.value = `term-${i}`;
        option.textContent = I18n.currentLang === 'ar' ? `الترم ${i}` : `Term ${i}`;
        termSelect.appendChild(option);
    }

    // Add Event Listeners
    yearSelect.addEventListener('change', loadSchedule);
    termSelect.addEventListener('change', loadSchedule);

    // Load Initial Data
    loadSchedule();
}

async function loadSchedule() {
    const yearId = document.getElementById('schedule-year').value;
    const termId = document.getElementById('schedule-term').value;
    const container = document.getElementById('schedule-container');

    container.innerHTML = `<div class="skeleton" style="height:400px;width:100%;"></div>`;

    const data = await Api.getSchedule(yearId, termId);

    if (!data || !data.days || data.days.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:60px;background:var(--color-surface);border-radius:var(--radius-lg);border:1px solid var(--color-border);">
            <i data-lucide="calendar-x" style="width:64px;height:64px;color:var(--color-text-muted);margin-bottom:16px;"></i>
            <h3 style="color:var(--color-text);">${I18n.currentLang === 'ar' ? 'الجدول غير متوفر' : 'Schedule Not Available'}</h3>
            <p style="color:var(--color-text-muted);">${I18n.currentLang === 'ar' ? 'لم يتم رفع جدول لهذا الترم بعد.' : 'No schedule uploaded for this term yet.'}</p>
        </div>`;
        if (window.lucide) lucide.createIcons();
        return;
    }

    // Render Table
    let html = `
        <div class="table-responsive">
            <table class="schedule-table">
                <thead>
                    <tr>
                        <th style="width:120px;">${I18n.currentLang === 'ar' ? 'اليوم' : 'Day'}</th>
                        <th>${I18n.currentLang === 'ar' ? 'المحاضرات والمختبرات' : 'Lectures & Labs'}</th>
                    </tr>
                </thead>
                <tbody>
    `;

    data.days.forEach(day => {
        html += `<tr>`;
        html += `<td class="day-title">${I18n.currentLang === 'ar' ? day.nameAr : day.nameEn}</td>`;
        html += `<td>`;
        
        if (day.slots && day.slots.length > 0) {
            day.slots.forEach(slot => {
                const typeClass = slot.type === 'lab' ? 'type-lab' : (slot.type === 'exam' ? 'type-exam' : 'type-lecture');
                const typeText = slot.type === 'lab' ? (I18n.currentLang === 'ar' ? 'مختبر' : 'Lab') : 
                                 (slot.type === 'exam' ? (I18n.currentLang === 'ar' ? 'امتحان' : 'Exam') : (I18n.currentLang === 'ar' ? 'محاضرة' : 'Lecture'));
                
                html += `
                    <div class="slot-item">
                        <div class="slot-time"><i data-lucide="clock" style="width:14px;height:14px;"></i> ${slot.time}</div>
                        <div class="slot-subject">${I18n.currentLang === 'ar' ? slot.subjectAr : slot.subjectEn}</div>
                        ${slot.room ? `<div class="slot-room"><i data-lucide="map-pin" style="width:14px;height:14px;"></i> ${slot.room}</div>` : ''}
                        <span class="slot-type ${typeClass}">${typeText}</span>
                    </div>
                `;
            });
        } else {
            html += `<span style="color:var(--color-text-muted);font-size:0.9rem;">${I18n.currentLang === 'ar' ? 'لا توجد محاضرات' : 'No lectures'}</span>`;
        }
        
        html += `</td></tr>`;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
    
    if (window.lucide) lucide.createIcons();
}