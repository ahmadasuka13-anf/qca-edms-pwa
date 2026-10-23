/**
 * QC-CMS EDMS Utility Library & Global State Initializer
 */
// 🛡️ ROBUST GLOBAL STATE, TIMERS & CACHE INITIALIZER
var sessionToken = sessionToken || '';
var currentUser = currentUser || null;
var initData = initData || null;
var globalProjectFilter = globalProjectFilter || '';
var approvalView = approvalView || 'pending';
var approvalCache = approvalCache || {};
var selectedApprovalIds = selectedApprovalIds || new Set();
var nfiCache_ = nfiCache_ || {};
var documentsCache = documentsCache || {};

var notifPollTimer = notifPollTimer || null;
var myTasksPollTimer = myTasksPollTimer || null;
var toastTimer = toastTimer || null;
var searchDebounceTimer = searchDebounceTimer || null;
var _mobileLabelTimer = _mobileLabelTimer || null;

var ROLE_OPTIONS = ['Inspector', 'QA/QC Engineer', 'Admin', 'Project Manager', 'Viewer'];

var usersCache = usersCache || {};
var myTasksCache = myTasksCache || {};
var siteReportEntriesCache = siteReportEntriesCache || {};
var recycleBinCache = recycleBinCache || {};
var ccCache_ = ccCache_ || {};
var projectsCache_ = projectsCache_ || {};
var analisisCache_ = analisisCache_ || {};
var historyRevisionsCache_ = historyRevisionsCache_ || {};
var __previewCache = __previewCache || {};

// ============================================================
  // UTILITY MURNI
  // Fungsi helper yang TIDAK menyentuh state global.
  // Semua fungsi di sini bisa ditest secara independen.
  // ============================================================

  /** Escape HTML untuk mencegah XSS. */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  window.escapeHtml = esc;


  /** Potong teks panjang dengan ellipsis. */
  function truncateText_(s, n) {
    s = s || '';
    return s.length > n ? s.slice(0, n) + '…' : s;
  }

  /** Format ISO date → "17 Sep 2026". */
  function fmtDateShort_(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch (e) { return '—'; }
  }

  /** Format ISO date → "17 Sep 2026, 14:30". */
  function fmtDateTime_(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) { return '—'; }
  }

  /** Date object → "YYYY-MM-DD" untuk input[type=date]. */
  function toDateInputValue_(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  /** File → base64 data URL. */
  function fileToBase64(file) {
    return new Promise(function (res, rej) {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  /** Kompres gambar besar sebelum upload. */
  function compressImageIfNeeded_(file) {
    const TH = 1.5 * 1024 * 1024, MAX = 1600, Q = 0.75;
    if (!file.type || file.type.indexOf('image/') !== 0 ||
        file.type === 'image/svg+xml' || file.size <= TH) {
      return Promise.resolve(file);
    }
    return new Promise(function (resolve) {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = function () {
        URL.revokeObjectURL(url);
        let w = img.naturalWidth, h = img.naturalHeight;
        if (!w || !h || (w <= MAX && h <= MAX)) { resolve(file); return; }
        const s = MAX / Math.max(w, h);
        w = Math.round(w * s); h = Math.round(h * s);
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        c.toBlob(function (blob) {
          if (!blob || blob.size >= file.size) { resolve(file); return; }
          resolve(new File(
            [blob],
            file.name.replace(/\.[^.]+$/, '') + '.jpg',
            { type: 'image/jpeg' }
          ));
        }, 'image/jpeg', Q);
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  /** FileList → array payload siap kirim ke backend. */
  function filesToPayload(list) {
    return Promise.all(Array.from(list).map(function (file) {
      return compressImageIfNeeded_(file).then(function (pf) {
        return fileToBase64(pf).then(function (b64) {
          return {
            fileName: pf.name,
            mimeType: pf.type || 'application/octet-stream',
            base64Data: b64
          };
        });
      });
    }));
  }

  /** Download blob dari base64. */
  function downloadBase64File(base64, fileName, mimeType) {
    const bc = atob(base64);
    const bn = new Array(bc.length);
    for (let i = 0; i < bc.length; i++) bn[i] = bc.charCodeAt(i);
    const blob = new Blob([new Uint8Array(bn)], {
      type: mimeType || 'application/octet-stream'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /** Debounce: tunda eksekusi sampai user berhenti memicu. */
  function debounce_(fn, ms) {
    let timer = null;
    return function () {
      const ctx = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(ctx, args), ms);
    };
  }

  /** Mime type untuk format laporan. */
  function mimeForFormat_(f) {
    if (f === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (f === 'xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    return 'application/pdf';
  }

  /** Sanitasi string untuk onclick handler. */
  function escapeJs_(s) {
    return String(s || '')
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\r?\n/g, '\\n')
      .replace(/</g, '\\x3c');
  }

  // ============================================================
  // HAPTIC FEEDBACK (Getaran Responsif di HP)
  // ============================================================
  function triggerHaptic(pattern) {
    if ('vibrate' in navigator) {
      try { navigator.vibrate(pattern || [30, 20, 30]); } catch (e) {}
    }
  }
  window.triggerHaptic = triggerHaptic;

  // ============================================================
  // REAL-TIME UPLOAD PROGRESS BAR (0% - 100%)
  // ============================================================
  window.showUploadProgress = function (percent, totalBytes, action, loadedBytes) {
    const container = document.getElementById('uploadProgressBarContainer');
    const bar = document.getElementById('uploadProgressBar');
    const pctText = document.getElementById('uploadProgressPercent');
    const detailText = document.getElementById('uploadProgressDetail');
    const actionText = document.getElementById('uploadProgressAction');
    const titleText = document.getElementById('uploadProgressTitle');
    if (!container || !bar) return;

    container.style.display = 'block';
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
    bar.style.width = percent + '%';
    if (pctText) pctText.textContent = percent + '%';

    const formatSize = function (bytes) {
      if (!bytes || bytes <= 0) return '0 KB';
      if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const loaded = loadedBytes || (totalBytes ? Math.round((percent / 100) * totalBytes) : 0);
    if (detailText) detailText.textContent = formatSize(loaded) + ' / ' + formatSize(totalBytes);

    const actionMap = {
      submitDocument: 'Dokumen',
      submitSiteReportEntry: 'Laporan Inspeksi',
      saveNFILogEntry: 'NFI Log',
      submitCalibration: 'Kalibrasi Alat'
    };
    if (actionText) actionText.textContent = actionMap[action] || '';

    if (percent >= 100) {
      if (titleText) titleText.innerHTML = '<span>⚡ Menyimpan ke Drive & Spreadsheet...</span>';
    } else {
      if (titleText) titleText.innerHTML = '<span class="spinner" style="width:13px;height:13px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span><span>Mengunggah berkas...</span>';
    }
  };

  window.hideUploadProgress = function () {
    const container = document.getElementById('uploadProgressBarContainer');
    if (!container) return;
    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';
    setTimeout(function () {
      container.style.display = 'none';
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    }, 400);
  };

  // ============================================================
  // SCANNER QR / BARCODE VIA KAMERA HP (Html5Qrcode)
  // ============================================================
  var _html5QrInstance = null;
  var _currentQrInputId = null;
  var _currentFacingMode = 'environment';
  var _isTorchActive = false;

  window.openQrScanner = function (targetInputId, title) {
    _currentQrInputId = targetInputId;
    const modal = document.getElementById('qrScannerModal');
    const titleEl = document.getElementById('qrScannerTitle');
    if (titleEl && title) titleEl.textContent = title;
    if (!modal) return;

    modal.style.display = 'flex';
    modal.classList.add('show');

    if (typeof Html5Qrcode === 'undefined') {
      const s = document.createElement('script');
      s.src = '/html5-qrcode.min.js';
      s.onload = function () { _startQrCamera(); };
      s.onerror = function () {
        if (typeof showToast === 'function') showToast('Gagal memuat pustaka scanner kamera', 'error');
        window.closeQrScanner();
      };
      document.head.appendChild(s);
    } else {
      _startQrCamera();
    }
  };

  async function _startQrCamera() {
    try {
      if (_html5QrInstance) {
        try { await _html5QrInstance.stop(); } catch (e) {}
      }
      _html5QrInstance = new Html5Qrcode('qrScannerReader');
      const config = {
        fps: 15,
        qrbox: { width: 230, height: 230 },
        aspectRatio: 1.0
      };

      await _html5QrInstance.start(
        { facingMode: _currentFacingMode },
        config,
        function (decodedText) {
          triggerHaptic([40, 30, 40]);
          if (_currentQrInputId) {
            const inp = document.getElementById(_currentQrInputId);
            if (inp) {
              inp.value = decodedText;
              inp.dispatchEvent(new Event('input', { bubbles: true }));
              inp.dispatchEvent(new Event('change', { bubbles: true }));
              if (_currentQrInputId === 'filterSearch' && typeof loadDocumentList === 'function') {
                loadDocumentList();
              } else if (_currentQrInputId === 'nfiSearch' && typeof loadNFILog === 'function') {
                loadNFILog();
              }
            }
          }
          if (typeof showToast === 'function') {
            showToast('✅ Berhasil scan: ' + decodedText, 'success');
          }
          window.closeQrScanner();
        },
        function () {}
      );

      setTimeout(function () {
        try {
          const cap = _html5QrInstance.getRunningTrackCapabilities();
          const torchBtn = document.getElementById('qrTorchBtn');
          if (cap && cap.torch && torchBtn) {
            torchBtn.style.display = 'inline-block';
          }
        } catch (e) {}
      }, 1000);

    } catch (err) {
      console.error('[QR Scanner] Gagal akses kamera:', err);
      if (typeof showToast === 'function') {
        showToast('Kamera tidak dapat diakses: ' + (err.message || 'Izin kamera ditolak'), 'error');
      }
      window.closeQrScanner();
    }
  }

  window.closeQrScanner = async function () {
    const modal = document.getElementById('qrScannerModal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('show');
    }
    if (_html5QrInstance) {
      try {
        await _html5QrInstance.stop();
        _html5QrInstance.clear();
      } catch (e) {}
      _html5QrInstance = null;
    }
    _isTorchActive = false;
  };

  window.flipQrCamera = async function () {
    _currentFacingMode = _currentFacingMode === 'environment' ? 'user' : 'environment';
    await _startQrCamera();
  };

  window.toggleQrTorch = async function () {
    if (!_html5QrInstance) return;
    try {
      _isTorchActive = !_isTorchActive;
      await _html5QrInstance.applyVideoConstraints({
        advanced: [{ torch: _isTorchActive }]
      });
      const btn = document.getElementById('qrTorchBtn');
      if (btn) btn.textContent = _isTorchActive ? '🔦 Matikan Flash' : '💡 Flashlight';
    } catch (e) {
      console.warn('Torch error:', e);
    }
  };