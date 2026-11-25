/**
 * QC-CMS EDMS — Calibration Module (calibration.js)
 * Standar Anti-AI PT Asuka Engineering Indonesia
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
      if (title && /inspeksi|alat|review|monitoring/i.test(title.textContent)) target = sec;
    });
    if (!target) target = sections[0];

    var btn = document.createElement('button');
    btn.className = 'sidebar-item';
    btn.id = 'tabBtnCalibration';
    btn.setAttribute('onclick', "switchTab('calibration')");
    btn.innerHTML = '<span class="si-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.3 8.7 8.7 21.3a2 2 0 0 1-2.8 0L2.7 18.1a2 2 0 0 1 0-2.8L15.3 2.7a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8Z"/><path d="m14.5 3.5 6 6"/><path d="m7.5 10.5 2 2"/><path d="m10.5 7.5 2 2"/><path d="m4.5 13.5 2 2"/></svg></span><span class="si-label">Kalibrasi Alat</span>';
    target.appendChild(btn);
  }

  function hookSwitchTab() {
    if (typeof window.switchTab !== 'function') return;
    if (window.switchTab.__calHooked) return;
    var orig = window.switchTab;
    var wrapped = function (name) {
      orig.apply(this, arguments);
      if (name === 'calibration') {
        setTimeout(function () {
          if (typeof window.loadCalibrationData === 'function') window.loadCalibrationData();
        }, 30);
      }
    };
    wrapped.__calHooked = true;
    window.switchTab = wrapped;
  }

  window.openCalibrationForm = function () {
    if (typeof window.openCalibrationAddForm === 'function') {
      window.openCalibrationAddForm();
      return;
    }
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
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner dark"></span> Menganalisis...'; }
    if (typeof showToast === 'function') showToast('Membaca sertifikat via Vision OCR...', 'info');

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
            if (typeof showToast === 'function') showToast('Data sertifikat berhasil diisi otomatis.', 'success');
          } else {
            if (typeof showToast === 'function') showToast(((res && res.message) || 'Gagal membaca sertifikat.'), 'warning');
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
      if (res.success) { 
        window.closeCalibrationForm(); 
        if (typeof window.loadCalibrationData === 'function') window.loadCalibrationData(); 
      }
    }).withFailureHandler(function (err) {
      if (btn) { btn.disabled = false; btn.textContent = 'Simpan'; }
      if (typeof showToast === 'function') showToast('Gagal: ' + err.message, 'error');
    }).submitCalibration(payload);
  };

  function boot() {
    injectSidebar();
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
