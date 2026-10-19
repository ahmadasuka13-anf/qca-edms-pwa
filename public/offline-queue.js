/**
 * QCA EDMS — Offline Queue Module (IndexedDB)
 * ==============================================
 * Menyimpan form submission saat offline,
 * lalu otomatis sync saat koneksi kembali.
 * ==============================================
 */

const QC_OFFLINE_QUEUE = (function () {
  'use strict';

  const DB_NAME    = 'qca-edms-offline';
  const DB_VERSION = 1;
  const STORE_NAME = 'pending_actions';

  let _db = null;

  // ─── Init IndexedDB ──────────────────────────────────────────

  function _openDB() {
    return new Promise((resolve, reject) => {
      if (_db) { resolve(_db); return; }

      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = function (e) {
        const db    = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('action',    'action',    { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('status',    'status',    { unique: false });
        }
      };

      req.onsuccess = function (e) {
        _db = e.target.result;
        console.log('[OfflineQueue] IndexedDB terbuka:', DB_NAME);
        resolve(_db);
      };

      req.onerror = function (e) {
        console.error('[OfflineQueue] Gagal buka IndexedDB:', e.target.error);
        reject(e.target.error);
      };
    });
  }

  // ─── Tambah item ke antrian ──────────────────────────────────

  async function enqueue(action, args, sessionToken) {
    try {
      const db = await _openDB();
      return new Promise((resolve, reject) => {
        const tx    = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const item  = {
          action,
          args,
          sessionToken,
          timestamp: Date.now(),
          status:    'pending',
          retries:   0
        };
        const req = store.add(item);
        req.onsuccess = () => {
          console.log('[OfflineQueue] Ditambahkan ke antrian offline:', action);
          _showQueueBanner();
          resolve(req.result);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.error('[OfflineQueue] Gagal enqueue:', err);
    }
  }

  // ─── Ambil semua item pending ────────────────────────────────

  async function getAll() {
    try {
      const db = await _openDB();
      return new Promise((resolve, reject) => {
        const tx    = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req   = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror   = () => reject(req.error);
      });
    } catch (err) {
      return [];
    }
  }

  // ─── Hapus item berhasil ─────────────────────────────────────

  async function remove(id) {
    try {
      const db = await _openDB();
      return new Promise((resolve, reject) => {
        const tx    = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req   = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror   = () => reject(req.error);
      });
    } catch (err) {
      console.error('[OfflineQueue] Gagal hapus item:', err);
    }
  }

  // ─── Update retry count ───────────────────────────────────────

  async function _incrementRetry(id, currentRetries) {
    try {
      const db = await _openDB();
      return new Promise((resolve, reject) => {
        const tx    = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(id);
        getReq.onsuccess = function () {
          const item = getReq.result;
          if (item) {
            item.retries = (currentRetries || 0) + 1;
            item.status  = item.retries >= 3 ? 'failed' : 'pending';
            store.put(item);
          }
          resolve();
        };
        getReq.onerror = () => reject(getReq.error);
      });
    } catch (err) {
      console.error('[OfflineQueue] Gagal update retry:', err);
    }
  }

  // ─── Hitung antrian pending ───────────────────────────────────

  async function getPendingCount() {
    const all = await getAll();
    return all.filter(item => item.status === 'pending').length;
  }

  // ─── Tampilkan banner antrian offline ────────────────────────

  async function _showQueueBanner() {
    const count = await getPendingCount();
    let banner  = document.getElementById('offlineQueueBanner');

    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'offlineQueueBanner';
      banner.style.cssText = [
        'position:fixed', 'bottom:60px', 'left:50%',
        'transform:translateX(-50%)', 'z-index:9999',
        'background:linear-gradient(135deg,#f59e0b,#d97706)',
        'color:#fff', 'padding:10px 20px', 'border-radius:12px',
        'font-size:13px', 'font-weight:600', 'display:flex',
        'align-items:center', 'gap:10px',
        'box-shadow:0 4px 20px rgba(217,119,6,0.4)',
        'cursor:pointer', 'max-width:340px',
        'animation:slideUp 0.3s ease'
      ].join(';');
      banner.onclick = () => _showQueueDetails();
      document.body.appendChild(banner);
    }

    if (count > 0) {
      banner.innerHTML = `
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
        <span>${count} form menunggu sync — Tap untuk detail</span>
      `;
      banner.style.display = 'flex';
    } else {
      banner.style.display = 'none';
    }
  }

  // ─── Label Aksi Indonesia ──────────────────────────────────
  const ACTION_LABELS = {
    submitDocument:        'Unggah Dokumen',
    submitSiteReportEntry: 'Laporan Inspeksi Lapangan',
    saveNFILogEntry:       'Entri NFI Log',
    submitCalibration:     'Kalibrasi Alat'
  };

  // ─── Detail antrian ──────────────────────────────────────────

  async function _showQueueDetails() {
    const items = await getAll();
    const pending = items.filter(i => i.status === 'pending');

    if (typeof showToast === 'function') {
      if (pending.length === 0) {
        showToast('Tidak ada antrian offline', 'success');
      } else {
        const counts = {};
        pending.forEach(item => {
          const lbl = ACTION_LABELS[item.action] || item.action;
          counts[lbl] = (counts[lbl] || 0) + 1;
        });
        const summary = Object.entries(counts).map(([k, v]) => `${v}x ${k}`).join(', ');
        showToast(`Antrian offline (${pending.length}): ${summary}. Otomatis dikirim saat online.`, 'warning');
      }
    }
  }

  // ─── Proses antrian (sync) ────────────────────────────────────

  async function processQueue() {
    if (!navigator.onLine) return;

    const items = await getAll();
    const pending = items.filter(i => i.status === 'pending');

    if (pending.length === 0) return;

    console.log(`[OfflineQueue] Memproses ${pending.length} item antrian offline...`);

    if (typeof showToast === 'function') {
      showToast(`Menyinkronkan ${pending.length} form offline ke server...`, 'info');
    }

    let successCount = 0;
    let failCount    = 0;

    for (const item of pending) {
      try {
        // Kirim langsung ke /api/gas (sama seperti gas-adapter.js)
        const payload = {
          action:       item.action,
          args:         item.args,
          sessionToken: item.sessionToken,
          csrfToken:    typeof QC_SECURITY !== 'undefined' ? QC_SECURITY.getCsrfToken() : ''
        };

        const res = await fetch('/api/gas', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          if (data && (data.success || data.docId)) {
            await remove(item.id);
            successCount++;
            console.log(`[OfflineQueue] Item #${item.id} (${item.action}) berhasil dikirim`);
          } else {
            await _incrementRetry(item.id, item.retries);
            failCount++;
          }
        } else {
          await _incrementRetry(item.id, item.retries);
          failCount++;
        }
      } catch (err) {
        console.error(`[OfflineQueue] Gagal kirim item #${item.id}:`, err.message);
        await _incrementRetry(item.id, item.retries);
        failCount++;
      }
    }

    // Update UI Banner
    await _showQueueBanner();

    if (successCount > 0) {
      if ('vibrate' in navigator) {
        try { navigator.vibrate([40, 30, 40]); } catch (e) {}
      }
      if (typeof showToast === 'function') {
        showToast(`✅ ${successCount} form offline berhasil dikirim ke server!`, 'success');
      }
      // Refresh semua modul yang terpengaruh
      if (typeof loadDocumentList      === 'function') loadDocumentList();
      if (typeof loadDashboard         === 'function') loadDashboard();
      if (typeof loadNFILog            === 'function') loadNFILog();
      if (typeof loadSiteReportEntries === 'function') loadSiteReportEntries();
      if (typeof getCalibrationTools   === 'function') getCalibrationTools();
    }
    if (failCount > 0 && typeof showToast === 'function') {
      showToast(`⚠️ ${failCount} form gagal dikirim — akan dicoba lagi otomatis`, 'error');
    }
  }

  // ─── Event listener online ────────────────────────────────────

  window.addEventListener('online', function () {
    console.log('[OfflineQueue] Koneksi online terdeteksi, memproses antrian...');
    setTimeout(processQueue, 1500);  // delay sedikit untuk pastikan koneksi stabil
  });

  // ─── Cek antrian saat startup ────────────────────────────────

  window.addEventListener('DOMContentLoaded', async function () {
    await _showQueueBanner();
    if (navigator.onLine) {
      const count = await getPendingCount();
      if (count > 0) {
        console.log(`[OfflineQueue] Ditemukan ${count} item di antrian, memproses...`);
        setTimeout(processQueue, 3000);
      }
    }
  });

  return {
    enqueue,
    getAll,
    remove,
    getPendingCount,
    processQueue
  };
})();

console.log('[OfflineQueue] QCA EDMS Offline Queue Module v1.0 loaded');
