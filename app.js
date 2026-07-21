/* ============================================================
   APP.JS — Dashboard Usulan Perbaikan Kualitas
   PT Makmur Bersama Sahabat — Redesigned
   ============================================================ */

// ============================================================
// NAVIGATION
// ============================================================
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.style.animation = 'none';
        targetPage.offsetHeight;
        targetPage.style.animation = '';
    }

    const targetNav = document.querySelector(`.nav-item[data-page="${pageId}"]`);
    if (targetNav) targetNav.classList.add('active');

    closeSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// SIDEBAR TOGGLE (MOBILE)
// ============================================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ============================================================
// TAB SWITCHING (Usulan 3)
// ============================================================
function switchTab(btn, tabId) {
    const tabHeader = btn.closest('.tab-header');
    tabHeader.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const tabContainer = btn.closest('.tab-container');
    tabContainer.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    const targetPanel = document.getElementById(tabId);
    if (targetPanel) targetPanel.classList.add('active');
}

// ============================================================
// USULAN 1 — IQC PREFORM TABLE (50 rows, checkbox per defect type)
// ============================================================
function generateIQCTable() {
    const tbody = document.getElementById('iqcTableBody');
    if (!tbody) return;

    const fragment = document.createDocumentFragment();

    for (let i = 1; i <= 50; i++) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i}</td>
            <td><input type="checkbox" class="defect-cb" data-type="D"></td>
            <td><input type="checkbox" class="defect-cb" data-type="F"></td>
            <td><input type="checkbox" class="defect-cb" data-type="W"></td>
            <td><input type="checkbox" class="defect-cb" data-type="K"></td>
            <td><input type="checkbox" class="defect-cb" data-type="T"></td>
            <td><input type="text" placeholder="..." style="min-width:120px"></td>
        `;
        fragment.appendChild(tr);
    }

    tbody.appendChild(fragment);

    // Listen for changes to update summary
    const table = document.getElementById('iqcTable');
    table.addEventListener('change', updateIQCSummary);
}

function updateIQCSummary() {
    const types = ['D', 'F', 'W', 'K', 'T'];
    const counts = {};
    let total = 0;

    types.forEach(type => {
        const checked = document.querySelectorAll(`#iqcTableBody .defect-cb[data-type="${type}"]:checked`);
        counts[type] = checked.length;
        total += checked.length;
    });

    // Update footer summary counts
    types.forEach(type => {
        const sumEl = document.getElementById('sum' + type);
        if (sumEl) sumEl.textContent = counts[type];
    });

    const sumTotalEl = document.getElementById('sumTotal');
    if (sumTotalEl) sumTotalEl.textContent = 'Total: ' + total;

    // Update recap cards
    types.forEach(type => {
        const recapEl = document.getElementById('recap' + type);
        if (recapEl) recapEl.textContent = counts[type] + ' unit';
    });

    // Update evaluasi pemasok fields
    const evalTotalCacat = document.getElementById('evalTotalCacat');
    if (evalTotalCacat) evalTotalCacat.value = total;

    // Find dominant defect type
    const evalDominan = document.getElementById('evalDominan');
    if (evalDominan) {
        if (total === 0) {
            evalDominan.value = '—';
        } else {
            const typeNames = { D: 'Cacat Dimensi', F: 'Cacat Fisik', W: 'Cacat Warna', K: 'Kontaminasi', T: 'Cacat Ketebalan' };
            let maxType = types[0];
            types.forEach(type => {
                if (counts[type] > counts[maxType]) maxType = type;
            });
            evalDominan.value = typeNames[maxType] + ' (' + counts[maxType] + ' unit)';
        }
    }
}

// ============================================================
// USULAN 2 — CAP INSPECTION TABLE (8 rows, number input per defect)
// ============================================================
function generateCapInspTable() {
    const tbody = document.getElementById('capInspBody');
    if (!tbody) return;

    const fragment = document.createDocumentFragment();

    for (let i = 1; i <= 8; i++) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i}</td>
            <td><input type="time"></td>
            <td><input type="number" class="cap-jml" placeholder="0" min="0"></td>
            <td><input type="number" class="cap-defect" data-type="RG" placeholder="0" min="0"></td>
            <td><input type="number" class="cap-defect" data-type="CC" placeholder="0" min="0"></td>
            <td><input type="number" class="cap-defect" data-type="WN" placeholder="0" min="0"></td>
            <td><input type="number" class="cap-defect" data-type="LG" placeholder="0" min="0"></td>
            <td><input type="number" class="cap-defect" data-type="KT" placeholder="0" min="0"></td>
            <td><input type="number" class="cap-defect" data-type="SR" placeholder="0" min="0"></td>
            <td><input type="text" class="cap-row-total auto-calc" readonly placeholder="0"></td>
            <td><input type="text" class="cap-row-pct auto-calc" readonly placeholder="0%"></td>
            <td><input type="text" placeholder="..." style="min-width:100px"></td>
        `;
        fragment.appendChild(tr);
    }

    tbody.appendChild(fragment);

    // Listen for changes
    const table = document.getElementById('capInspTable');
    table.addEventListener('input', updateCapInspSummary);
}

function updateCapInspSummary() {
    const types = ['RG', 'CC', 'WN', 'LG', 'KT', 'SR'];
    const totals = {};
    types.forEach(t => totals[t] = 0);
    let grandTotalJml = 0;
    let grandTotalCacat = 0;

    // Process each row
    const rows = document.querySelectorAll('#capInspBody tr');
    rows.forEach(row => {
        const jmlInput = row.querySelector('.cap-jml');
        const jml = parseInt(jmlInput?.value) || 0;
        grandTotalJml += jml;

        let rowTotal = 0;
        types.forEach(type => {
            const input = row.querySelector(`.cap-defect[data-type="${type}"]`);
            const val = parseInt(input?.value) || 0;
            totals[type] += val;
            rowTotal += val;
        });

        grandTotalCacat += rowTotal;

        // Update row total and percentage
        const rowTotalEl = row.querySelector('.cap-row-total');
        const rowPctEl = row.querySelector('.cap-row-pct');
        if (rowTotalEl) rowTotalEl.value = rowTotal;
        if (rowPctEl) {
            if (jml > 0) {
                rowPctEl.value = ((rowTotal / jml) * 100).toFixed(1) + '%';
            } else {
                rowPctEl.value = '0%';
            }
        }
    });

    // Update footer totals
    document.getElementById('capSumJml').textContent = grandTotalJml;
    types.forEach(type => {
        const el = document.getElementById('capSum' + type);
        if (el) el.textContent = totals[type];
    });
    document.getElementById('capSumTotal').textContent = grandTotalCacat;
    document.getElementById('capSumPct').textContent = grandTotalJml > 0
        ? ((grandTotalCacat / grandTotalJml) * 100).toFixed(1) + '%'
        : '0%';

    // Update recap cards
    types.forEach(type => {
        const el = document.getElementById('capRecap' + type);
        if (el) el.textContent = totals[type] + ' unit';
    });
}

// ============================================================
// SCROLL ANIMATIONS
// ============================================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.stat-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.1}s`;
        observer.observe(card);
    });

    document.querySelectorAll('.proposal-card').forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.08}s`;
        observer.observe(card);
    });
}

// ============================================================
// ANIMATED COUNTER
// ============================================================
function animateCounters() {
    document.querySelectorAll('.stat-value').forEach(el => {
        const text = el.textContent;
        const numMatch = text.match(/^\d+$/);
        if (numMatch) {
            const target = parseInt(numMatch[0]);
            let current = 0;
            const duration = 1000;
            const stepTime = 16;
            const increment = target / (duration / stepTime);
            el.textContent = '0';
            const counter = setInterval(() => {
                current += increment;
                if (current >= target) { current = target; clearInterval(counter); }
                el.textContent = Math.floor(current);
            }, stepTime);
        }
    });
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const activePage = document.querySelector('.page.active');
            if (activePage && activePage.id !== 'page-home') {
                navigateTo('home');
            } else {
                closeSidebar();
            }
        }
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            window.print();
        }
    });
}

// ============================================================
// FORM VISUAL FEEDBACK
// ============================================================
function initFormFeedback() {
    document.addEventListener('change', function (e) {
        const el = e.target;

        // Status select color coding
        if (el.classList.contains('status-select')) {
            el.style.borderColor = '';
            el.style.background = '';
            switch (el.value) {
                case 'normal':
                    el.style.borderColor = 'rgba(58, 183, 149, 0.35)';
                    el.style.background = 'rgba(58, 183, 149, 0.08)';
                    break;
                case 'warning':
                    el.style.borderColor = 'rgba(230, 162, 60, 0.35)';
                    el.style.background = 'rgba(230, 162, 60, 0.08)';
                    break;
                case 'critical':
                    el.style.borderColor = 'rgba(232, 99, 122, 0.35)';
                    el.style.background = 'rgba(232, 99, 122, 0.08)';
                    break;
            }
        }
    });
}

// ============================================================
// CHECKLIST PROGRESS
// ============================================================
function initChecklistProgress() {
    document.querySelectorAll('.checklist-group').forEach(group => {
        group.addEventListener('change', function (e) {
            if (e.target.type === 'checkbox' && e.target.closest('.check-label')) {
                const checkboxes = group.querySelectorAll('.check-label input[type="checkbox"]');
                const checked = group.querySelectorAll('.check-label input[type="checkbox"]:checked');
                const progress = Math.round((checked.length / checkboxes.length) * 100);

                if (progress === 100) {
                    group.style.borderLeft = '3px solid var(--accent-emerald)';
                    group.style.paddingLeft = '12px';
                    group.style.transition = 'all 0.3s ease';
                } else {
                    group.style.borderLeft = '';
                    group.style.paddingLeft = '';
                }
            }
        });
    });
}

// ============================================================
// PARAF CHECKBOX FEEDBACK
// ============================================================
function initParafChecks() {
    document.querySelectorAll('.paraf-check').forEach(check => {
        check.addEventListener('change', function () {
            const row = this.closest('tr');
            if (row) {
                row.style.background = this.checked ? 'rgba(58, 183, 149, 0.06)' : '';
                row.style.transition = 'background 0.3s ease';
            }
        });
    });
}

// ============================================================
// IQC ROW HIGHLIGHTING
// ============================================================
function initIQCRowHighlight() {
    const table = document.getElementById('iqcTable');
    if (!table) return;

    table.addEventListener('change', function (e) {
        if (e.target.classList.contains('defect-cb')) {
            const row = e.target.closest('tr');
            if (row) {
                const hasAnyChecked = row.querySelectorAll('.defect-cb:checked').length > 0;
                row.style.background = hasAnyChecked ? 'rgba(232, 99, 122, 0.06)' : '';
                row.style.transition = 'background 0.3s ease';
            }
        }
    });
}

// ============================================================
// RIWAYAT PEMERIKSAAN — INSPECTION LOG MANAGEMENT
// ============================================================
let inspectionLogs = JSON.parse(localStorage.getItem('inspectionLogs') || '[]');

const FORM_NAMES = {
    'usulan1': 'Usulan 1 — IQC Preform',
    'usulan2': 'Usulan 2 — Inspeksi Tutup Botol',
    'usulan3': 'Usulan 3 — Checklist Maintenance',
    'usulan4': 'Usulan 4 — SOP Suhu & Kelembapan',
    'usulan5': 'Usulan 5 — Verifikasi Pemanasan',
    'usulan6': 'Usulan 6 — Pembersihan Capping'
};

function saveLogs() {
    localStorage.setItem('inspectionLogs', JSON.stringify(inspectionLogs));
}

function addInspectionLog() {
    const today = new Date().toISOString().split('T')[0];
    const newLog = {
        id: Date.now(),
        tanggal: today,
        formulir: 'usulan1',
        shift: '1',
        petugas: '',
        status: 'selesai',
        catatan: ''
    };
    inspectionLogs.unshift(newLog);
    saveLogs();
    renderLogTable();
    updateRiwayatSummary();
    generateCalendar();
}

function deleteInspectionLog(id) {
    inspectionLogs = inspectionLogs.filter(l => l.id !== id);
    saveLogs();
    renderLogTable();
    updateRiwayatSummary();
    generateCalendar();
}

function updateLogField(id, field, value) {
    const log = inspectionLogs.find(l => l.id === id);
    if (log) {
        log[field] = value;
        saveLogs();
        updateRiwayatSummary();
        generateCalendar();
    }
}

function renderLogTable() {
    const tbody = document.getElementById('logTableBody');
    const empty = document.getElementById('emptyLogState');
    const table = document.getElementById('logTable');
    if (!tbody) return;

    if (inspectionLogs.length === 0) {
        table.style.display = 'none';
        empty.style.display = 'block';
        return;
    }

    table.style.display = '';
    empty.style.display = 'none';

    tbody.innerHTML = inspectionLogs.map((log, i) => {
        const statusClass = log.status === 'selesai' ? 'log-status-selesai' :
            log.status === 'proses' ? 'log-status-proses' : 'log-status-belum';
        const statusText = log.status === 'selesai' ? 'Selesai' :
            log.status === 'proses' ? 'Proses' : 'Belum';

        const formOptions = Object.entries(FORM_NAMES).map(([val, name]) =>
            `<option value="${val}" ${log.formulir === val ? 'selected' : ''}>${name}</option>`
        ).join('');

        return `<tr>
            <td>${i + 1}</td>
            <td><input type="date" value="${log.tanggal}" onchange="updateLogField(${log.id},'tanggal',this.value)" style="min-width:130px"></td>
            <td><select onchange="updateLogField(${log.id},'formulir',this.value)" style="min-width:180px">${formOptions}</select></td>
            <td><select onchange="updateLogField(${log.id},'shift',this.value)" style="min-width:70px">
                <option value="1" ${log.shift === '1' ? 'selected' : ''}>1</option>
                <option value="2" ${log.shift === '2' ? 'selected' : ''}>2</option>
                <option value="3" ${log.shift === '3' ? 'selected' : ''}>3</option>
            </select></td>
            <td><input type="text" value="${log.petugas}" placeholder="Nama..." onchange="updateLogField(${log.id},'petugas',this.value)" style="min-width:120px"></td>
            <td><span class="log-status ${statusClass}">${statusText}</span>
                <select onchange="updateLogField(${log.id},'status',this.value);renderLogTable()" style="min-width:90px;margin-top:4px">
                    <option value="selesai" ${log.status === 'selesai' ? 'selected' : ''}>Selesai</option>
                    <option value="proses" ${log.status === 'proses' ? 'selected' : ''}>Proses</option>
                    <option value="belum" ${log.status === 'belum' ? 'selected' : ''}>Belum</option>
                </select></td>
            <td><input type="text" value="${log.catatan}" placeholder="Catatan..." onchange="updateLogField(${log.id},'catatan',this.value)" style="min-width:150px"></td>
            <td><button class="btn-delete-log" onclick="deleteInspectionLog(${log.id})" title="Hapus">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
            </button></td>
        </tr>`;
    }).join('');
}

function updateRiwayatSummary() {
    const totalEl = document.getElementById('riwayatTotalInspeksi');
    const hariEl = document.getElementById('riwayatHariAktif');
    if (!totalEl) return;

    const bulanInput = document.getElementById('riwayatBulan');
    const filterInput = document.getElementById('riwayatFilter');
    const now = new Date();
    let filterYear = now.getFullYear();
    let filterMonth = now.getMonth();

    if (bulanInput && bulanInput.value) {
        const parts = bulanInput.value.split('-');
        filterYear = parseInt(parts[0]);
        filterMonth = parseInt(parts[1]) - 1;
    }

    const filterForm = filterInput ? filterInput.value : 'semua';

    const filtered = inspectionLogs.filter(log => {
        const d = new Date(log.tanggal);
        const matchMonth = d.getFullYear() === filterYear && d.getMonth() === filterMonth;
        const matchForm = filterForm === 'semua' || log.formulir === filterForm;
        return matchMonth && matchForm;
    });

    totalEl.textContent = filtered.length;

    const uniqueDays = new Set(filtered.map(l => l.tanggal));
    hariEl.textContent = uniqueDays.size;

    for (let i = 1; i <= 6; i++) {
        const formKey = `usulan${i}`;
        const formLogs = inspectionLogs.filter(log => {
            const d = new Date(log.tanggal);
            return d.getFullYear() === filterYear && d.getMonth() === filterMonth && log.formulir === formKey;
        });

        const countEl = document.getElementById(`rfc${i}Count`);
        const dateEl = document.getElementById(`rfc${i}LastDate`);
        const barEl = document.getElementById(`rfc${i}Bar`);

        if (countEl) countEl.textContent = formLogs.length;
        if (dateEl) {
            if (formLogs.length > 0) {
                const sorted = formLogs.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
                const last = new Date(sorted[0].tanggal);
                dateEl.textContent = last.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
            } else {
                dateEl.textContent = '\u2014';
            }
        }
        if (barEl) {
            const maxExpected = 30;
            const pct = Math.min((formLogs.length / maxExpected) * 100, 100);
            barEl.style.width = pct + '%';
        }
    }
}

function generateCalendar() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;

    const bulanInput = document.getElementById('riwayatBulan');
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();

    if (bulanInput && bulanInput.value) {
        const parts = bulanInput.value.split('-');
        year = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
    }

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const today = new Date();

    const dayCounts = {};
    inspectionLogs.forEach(log => {
        const d = new Date(log.tanggal);
        if (d.getFullYear() === year && d.getMonth() === month) {
            const day = d.getDate();
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        }
    });

    const headers = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    let html = headers.map(h => `<div class="cal-day-header">${h}</div>`).join('');

    for (let i = 0; i < startDow; i++) {
        html += '<div class="cal-day cal-empty"></div>';
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const count = dayCounts[d] || 0;
        const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

        let levelClass = '';
        if (count >= 5) levelClass = 'cal-high';
        else if (count >= 3) levelClass = 'cal-med';
        else if (count >= 1) levelClass = 'cal-low';

        const todayClass = isToday ? ' cal-today' : '';
        const tooltip = count > 0 ? ` title="${count} inspeksi"` : '';

        html += `<div class="cal-day${todayClass} ${levelClass}"${tooltip}>${d}</div>`;
    }

    grid.innerHTML = html;
}

function initRiwayat() {
    renderLogTable();
    updateRiwayatSummary();
    generateCalendar();

    const bulanInput = document.getElementById('riwayatBulan');
    if (bulanInput && !bulanInput.value) {
        const now = new Date();
        bulanInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    const bulanEl = document.getElementById('riwayatBulan');
    const filterEl = document.getElementById('riwayatFilter');
    if (bulanEl) bulanEl.addEventListener('change', () => { updateRiwayatSummary(); generateCalendar(); });
    if (filterEl) filterEl.addEventListener('change', () => { updateRiwayatSummary(); });
}

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    // Generate dynamic tables
    generateIQCTable();
    generateCapInspTable();

    // Initialize features
    initScrollAnimations();
    initKeyboardShortcuts();
    initFormFeedback();
    initChecklistProgress();
    initParafChecks();
    initIQCRowHighlight();
    initRiwayat();

    // URL hash navigation
    const hash = window.location.hash.replace('#', '');
    if (hash) navigateTo(hash);

    // Animate counters
    setTimeout(animateCounters, 300);

    console.log('\u2705 Dashboard Usulan Perbaikan Kualitas v2 \u2014 Ready');
});
