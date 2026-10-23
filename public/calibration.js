/**
 * QC-CMS EDMS — Calibration Loader Module (calibration.js)
 */
(function () {
  if (window.__calLoaderInjected) return;
  window.__calLoaderInjected = true;

  function injectSidebar() {
    if (document.getElementById('tabBtnCalibration')) return;
    var sections = document.querySelectorAll('.app-sidebar .sidebar-section');
    if (!sections.length) return;
    var target = null;
    sections.forEach(function (sec) {
      var title = sec.querySelector('.sidebar-section-title');
      if (title && /review|monitoring/i.test(title.textContent)) target = sec;
    });
    if (!target) target = sections[0];

    var btn = document.createElement('button');
    btn.className = 'sidebar-item';
    btn.id = 'tabBtnCalibration';
    btn.setAttribute('onclick', "switchTab('calibration')");
    btn.innerHTML = '<span class="si-icon">📏</span><span class="si-label">Kalibrasi Alat</span>';
    target.appendChild(btn);
  }

  function injectPanel() {
    if (document.getElementById('panelCalibration')) return;
    var wrapper = document.getElementById('panelWrapper');
    if (!wrapper) return;

    var div = document.createElement('div');
    div.className = 'panel';
    div.id = 'panelCalibration';
    div.innerHTML = [
      '<h2 class="panel-title">📏 Kalibrasi & Alat Ukur</h2>',
      '<p class="hint" style="margin:-10px 0 16px;">Monitoring status kalibrasi alat ukur per disiplin.</p>',
      '<div class="filter-row" style="margin-bottom:16px; display:flex; flex-wrap:wrap; gap:8px;">',
      '  <button class="btn btn-secondary" onclick="loadCalibrationData()">↻ Muat Ulang</button>',
      '  <button class="btn btn-primary" onclick="openCalibrationForm()">+ Update Kalibrasi</button>',
      '  <button class="btn btn-primary" onclick="openCalibrationAiScanner()" style="background:linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color:#fff; border:none; box-shadow:0 2px 8px rgba(79,70,229,0.35); font-weight:600;"><span style="font-size:1.1em;">⚡</span> AI Smart Scanner (Vision OCR)</button>',
      '  <button class="btn btn-secondary" onclick="openCalibrationForm(); setTimeout(function(){ openQrScanner(\'calToolId\', \'Scan Label Alat\'); }, 300);" title="Scan Barcode / QR Label Alat">📷 Scan Label Alat</button>',
      '</div>',
      '<div class="card-section" id="calKpiWrap">',
      '  <div class="loading-row"><span class="spinner dark"></span>Memuat ringkasan...</div>',
      '</div>',
      '<div id="calTableContent">',
      '  <div class="loading-row"><span class="spinner dark"></span>Memuat data...</div>',
      '</div>',
      '<div class="modal-overlay" id="calibrationModal">',
      '  <div class="modal-box" style="max-width:560px;">',
      '    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">',
      '      <h3 class="card-title" style="margin:0;">Update Data Kalibrasi</h3>',
      '      <button type="button" class="btn-small" onclick="triggerAiCertScan()" id="btnAiCertScan" style="background:#eef2ff;color:#3730a3;border:1px solid #c7d2fe;font-weight:600;padding:5px 10px;border-radius:6px;cursor:pointer;">⚡ AI Scan Sertifikat</button>',
      '      <input type="file" id="calCertFileInput" accept="image/*,application/pdf" style="display:none;" onchange="handleAiCertScan(this)">',
      '    </div>',
      '    <form id="calibrationForm" onsubmit="saveCalibrationData(event)">',
      '      <div class="form-row">',
      '        <div class="form-group"><label>Tool ID *</label><div style="display:flex;gap:6px;"><input type="text" id="calToolId" required style="flex:1;"><button type="button" class="btn-small" onclick="openQrScanner(\'calToolId\', \'Scan Tool ID Kalibrasi\')" title="Scan QR / Barcode Alat" style="white-space:nowrap;padding:4px 8px;">📷 Scan</button></div></div>',
      '        <div class="form-group"><label>Nama Alat *</label><input type="text" id="calToolName" required></div>',
      '      </div>',
      '      <div class="form-row">',
      '        <div class="form-group"><label>Disiplin *</label><input type="text" id="calDiscipline" required></div>',
      '        <div class="form-group"><label>Status *</label>',
      '          <select id="calStatus" required>',
      '            <option value="Valid">Valid</option>',
      '            <option value="Overdue">Overdue</option>',
      '            <option value="Dalam Proses">Dalam Proses</option>',
      '          </select>',
      '        </div>',
      '      </div>',
      '      <div class="form-row">',
      '        <div class="form-group"><label>Tgl Kalibrasi *</label><input type="date" id="calDate" required></div>',
      '        <div class="form-group"><label>Tgl Berikutnya *</label><input type="date" id="calNextDate" required></div>',
      '      </div>',
      '      <div class="form-row single">',
      '        <div class="form-group"><label>PIC *</label><input type="text" id="calPic" required></div>',
      '      </div>',
      '      <div class="modal-actions">',
      '        <button type="button" class="btn btn-secondary" onclick="closeCalibrationForm()">Batal</button>',
      '        <button type="submit" class="btn btn-primary" id="calSubmitBtn">Simpan</button>',
      '      </div>',
      '    </form>',
      '  </div>',
      '</div>'
    ].join('\n');
    wrapper.appendChild(div);
  }

  function hookSwitchTab() {
    if (typeof window.switchTab !== 'function') return;
    if (window.switchTab.__calHooked) return;
    var orig = window.switchTab;
    var wrapped = function (name) {
      orig.apply(this, arguments);
      if (name === 'calibration') {
        setTimeout(function () {
          if (typeof loadCalibrationData === 'function') loadCalibrationData();
        }, 30);
      }
    };
    wrapped.__calHooked = true;
    window.switchTab = wrapped;
  }

  function escHtml(s) {
    if (typeof esc === 'function') return esc(s);
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var _calLoading = false;
  window.loadCalibrationData = function () {
    if (_calLoading) return;
    _calLoading = true;

    var kpiWrap = document.getElementById('calKpiWrap');
    if (kpiWrap) kpiWrap.innerHTML = '<div class="loading-row"><span class="spinner dark"></span>Memuat...</div>';

    google.script.run
      .withSuccessHandler(function (res) {
        if (!kpiWrap) return;
        if (!res || !res.success) { kpiWrap.innerHTML = '<div class="empty-state"><div class="msg">' + escHtml((res && res.error) || 'Gagal memuat ringkasan.') + '</div></div>'; return; }
        kpiWrap.innerHTML =
          '<div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:0;">' +
            '<div class="stat-card"><div class="stat-value">' + (res.total || 0)   + '</div><div class="stat-label">Total Alat</div></div>' +
            '<div class="stat-card"><div class="stat-value">' + (res.valid || 0)   + '</div><div class="stat-label">Valid</div></div>' +
            '<div class="stat-card warn"><div class="stat-value">' + (res.overdue || 0) + '</div><div class="stat-label">Jatuh Tempo</div></div>' +
          '</div>';
      })
      .withFailureHandler(function (err) {
        if (kpiWrap) kpiWrap.innerHTML = '<div class="empty-state"><div class="msg">Gagal: ' + escHtml(err && err.message ? err.message : String(err)) + '</div></div>';
      })
      .getCalibrationSummary();

    var tblWrap = document.getElementById('calTableContent');
    if (tblWrap) tblWrap.innerHTML = '<div class="loading-row"><span class="spinner dark"></span>Memuat data...</div>';

    google.script.run
      .withSuccessHandler(function (res) {
        _calLoading = false;
        if (!tblWrap) return;
        if (!res || !res.success) { tblWrap.innerHTML = '<div class="empty-state"><div class="msg">' + escHtml((res && res.error) || 'Gagal memuat data alat.') + '</div></div>'; return; }
        var data = res.data;
        if (!data || data.length < 2) { tblWrap.innerHTML = '<div class="empty-state"><div class="msg">Belum ada data alat.</div></div>'; return; }
        var rows = '';
        for (var i = 1; i < data.length; i++) {
          var r = data[i];
          var statusStr = String(r[5] || '').trim();
          var statusCls = statusStr === 'Valid' ? 'badge-approved' : (statusStr === 'Overdue' ? 'badge-rejected' : 'badge-pending');
          rows += '<tr>' +
            '<td class="doc-code">' + escHtml(r[0] || '-') + '</td>' +
            '<td>' + escHtml(r[1] || '-') + '</td>' +
            '<td>' + escHtml(r[2] || '-') + '</td>' +
            '<td>' + escHtml(r[3] || '-') + '</td>' +
            '<td>' + escHtml(r[4] || '-') + '</td>' +
            '<td><span class="badge ' + statusCls + '">' + escHtml(statusStr || '-') + '</span></td>' +
            '<td>' + escHtml(r[6] || '-') + '</td>' +
            '</tr>';
        }
        tblWrap.innerHTML = '<div class="table-scroll"><table><thead><tr>' +
          '<th>Tool ID</th><th>Nama Alat</th><th>Disiplin</th>' +
          '<th>Tgl Kalibrasi</th><th>Tgl Berikutnya</th><th>Status</th><th>PIC</th>' +
          '</tr></thead><tbody>' + rows + '</tbody></table></div>';
      })
      .withFailureHandler(function (err) {
        _calLoading = false;
        if (tblWrap) tblWrap.innerHTML = '<div class="empty-state"><div class="msg">Gagal memuat data: ' + escHtml(err && err.message ? err.message : String(err)) + '</div></div>';
      })
      .getCalibrationTools();
  };

  window.openCalibrationForm = function () {
    var m = document.getElementById('calibrationModal');
    if (m) m.classList.add('show');
    var f = document.getElementById('calibrationForm');
    if (f) f.reset();
  };

  window.closeCalibrationForm = function () {
    var m = document.getElementById('calibrationModal');
    if (m) m.classList.remove('show');
  };

  window.openCalibrationAiScanner = function() {
    window.openCalibrationForm();
    setTimeout(function() {
      window.triggerAiCertScan();
    }, 280);
  };

  window.triggerAiCertScan = function () {
    var inp = document.getElementById('calCertFileInput');
    if (inp) inp.click();
  };

  function compressImageForAi_(file, maxDim, quality, cb) {
    if (!file || !file.type || !file.type.match(/^image\//)) {
      var reader = new FileReader();
      reader.onload = function(e) { cb(e.target.result, file.type || 'application/pdf'); };
      reader.readAsDataURL(file);
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        var w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        var dataUrl = canvas.toDataURL('image/jpeg', quality || 0.82);
        cb(dataUrl, 'image/jpeg');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  window.handleAiCertScan = function (input) {
    if (!input.files || !input.files[0]) return;
    var file = input.files[0];
    var btn = document.getElementById('btnAiCertScan');
    var oldText = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Menganalisis...'; }
    if (typeof showToast === 'function') showToast('Membaca sertifikat via Vision AI...', 'info');

    compressImageForAi_(file, 1280, 0.82, function(base64, mimeType) {
      var token = window.sessionToken || '';

      google.script.run
        .withSuccessHandler(function (res) {
          if (btn) { btn.disabled = false; btn.innerHTML = oldText; }
          if (res && res.success && res.data) {
            var d = res.data;
            if (d.toolId && document.getElementById('calToolId')) document.getElementById('calToolId').value = d.toolId;
            if (d.toolName && document.getElementById('calToolName')) document.getElementById('calToolName').value = d.toolName;
            if (d.discipline && document.getElementById('calDiscipline')) document.getElementById('calDiscipline').value = d.discipline;
            if (d.calDate && document.getElementById('calDate')) document.getElementById('calDate').value = d.calDate;
            if (d.nextCalDate && document.getElementById('calNextDate')) document.getElementById('calNextDate').value = d.nextCalDate;
            if (d.status && document.getElementById('calStatus')) document.getElementById('calStatus').value = d.status;
            if (d.pic && document.getElementById('calPic')) document.getElementById('calPic').value = d.pic;
            if (typeof showToast === 'function') showToast('✅ Data sertifikat berhasil diisi otomatis oleh AI!', 'success');
          } else {
            if (typeof showToast === 'function') showToast('⚠️ ' + ((res && res.message) || 'Gagal membaca sertifikat'), 'warning');
          }
        })
        .withFailureHandler(function (err) {
          if (btn) { btn.disabled = false; btn.innerHTML = oldText; }
          if (typeof showToast === 'function') showToast('Error: ' + err.message, 'error');
        })
        .aiScanCertificate(token, base64, mimeType);
    });
    input.value = '';
  };

  window.saveCalibrationData = function (e) {
    if (e) e.preventDefault();
    var btn = document.getElementById('calSubmitBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>Menyimpan...'; }
    var payload = {
      toolId:      document.getElementById('calToolId').value.trim(),
      toolName:    document.getElementById('calToolName').value.trim(),
      discipline:  document.getElementById('calDiscipline').value.trim(),
      calDate:     document.getElementById('calDate').value,
      nextCalDate: document.getElementById('calNextDate').value,
      status:      document.getElementById('calStatus').value,
      pic:         document.getElementById('calPic').value.trim()
    };
    google.script.run.withSuccessHandler(function (res) {
      if (btn) { btn.disabled = false; btn.textContent = 'Simpan'; }
      if (typeof showToast === 'function')
        showToast(res.message || (res.success ? 'Berhasil' : 'Gagal'), res.success ? 'success' : 'error');
      if (res.success) { closeCalibrationForm(); loadCalibrationData(); }
    }).withFailureHandler(function (err) {
      if (btn) { btn.disabled = false; btn.textContent = 'Simpan'; }
      if (typeof showToast === 'function') showToast('Gagal: ' + err.message, 'error');
    }).submitCalibration(payload);
  };

  function boot() {
    injectSidebar();
    injectPanel();
    hookSwitchTab();
    var tries = 0;
    var interval = setInterval(function () {
      hookSwitchTab();
      if (window.switchTab && window.switchTab.__calHooked) { clearInterval(interval); return; }
      if (++tries > 20) clearInterval(interval);
    }, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 50); });
  } else {
    setTimeout(boot, 50);
  }
})();