/**
 * Universal GAS Client Adapter for PWA & Vercel — v2.0
 * ======================================================
 * Fitur baru v2.0:
 *  - Token sesi dibaca via QC_SECURITY (AES-256-GCM encrypted)
 *  - Setiap request menyertakan CSRF token
 *  - Retry otomatis 1x jika gagal karena network error
 *  - Jika offline saat submitDocument → masuk ke QC_OFFLINE_QUEUE
 * ======================================================
 */
(function(window) {
  if (typeof window.google === 'undefined' || !window.google.script || !window.google.script.run) {
    window.google = window.google || {};
    window.google.script = window.google.script || {};

    const PROXY_ENDPOINT = '/api/gas';
    const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbxHv0P-UIPghtjjUzMiu0Bdi7WqvtNlDmEQmVaOnS1dPQAgdZNZV7piFks72p1GJDz9/exec';

    function getDirectGasUrl() {
      return (window.QC_CONFIG && window.QC_CONFIG.GAS_EXEC_URL)
        || localStorage.getItem('qc_gas_exec_url')
        || DEFAULT_GAS_URL;
    }

    // Action yang BOLEH masuk antrian offline (semua form lapangan)
    const OFFLINE_QUEUEABLE = [
      'submitDocument',
      'submitSiteReportEntry',
      'saveNFILogEntry',
      'submitCalibration'
    ];

    // Action pembacaan data yang bisa disimpan di cache offline (IndexedDB)
    const CACHEABLE_READ_ACTIONS = [
      'getDocumentList', 'getInitData', 'getNFILogList', 'getProjectsListForUI',
      'getProjectsSettings', 'getSiteReportEntries', 'getDashboardStats',
      'getCalibrationTools', 'getMyTasks', 'getDisciplinesSettings', 'getDocTypesSettings',
      'getProjectDetailFromMaster', 'getExecutiveDashboard'
    ];

    // Action yang tidak perlu session token
    const AUTH_ACTIONS = ['login', 'registerAccount', 'requestPasswordReset'];

    function Runner() {
      this._success    = null;
      this._failure    = null;
      this._userObject = null;
    }

    Runner.prototype.withSuccessHandler = function(fn) {
      this._success = fn; return this;
    };
    Runner.prototype.withFailureHandler = function(fn) {
      this._failure = fn; return this;
    };
    Runner.prototype.withUserObject = function(obj) {
      this._userObject = obj; return this;
    };

    Runner.prototype._call = async function(action, args) {
      const successCb = this._success;
      const failureCb = this._failure;
      const userObj   = this._userObject;
      const cacheKey  = action + '_' + JSON.stringify(args || []);

      // ── Ambil token sesi (dari encrypted storage via QC_SECURITY) ──
      let sessionToken = '';
      if (!AUTH_ACTIONS.includes(action)) {
        if (typeof QC_SECURITY !== 'undefined') {
          sessionToken = await QC_SECURITY.decryptToken() || '';
        } else {
          // Fallback jika security.js belum load
          sessionToken = window.sessionToken
            || localStorage.getItem('qccms_session')
            || localStorage.getItem('qc_session_token')
            || '';
        }
        // Override jika args[0] adalah UUID (session token explicit)
        if (args.length > 0 && typeof args[0] === 'string' && /^[0-9a-fA-F-]{36}$/.test(args[0])) {
          sessionToken = args[0];
        }
      }

      // ── CSRF Token ──────────────────────────────────────────────
      const csrfToken = typeof QC_SECURITY !== 'undefined'
        ? QC_SECURITY.getCsrfToken()
        : '';

      // ── Jika offline dan action bisa di-queue (FORM LAPANGAN) ────
      if (!navigator.onLine && OFFLINE_QUEUEABLE.includes(action)) {
        console.warn('[GAS Adapter] Offline — menambahkan ke antrian offline:', action);
        if (typeof QC_OFFLINE_QUEUE !== 'undefined') {
          await QC_OFFLINE_QUEUE.enqueue(action, args, sessionToken);
        }
        if (successCb) {
          successCb.call(userObj, {
            success:  true,
            offline:  true,
            message:  '📶 Anda sedang offline. Form disimpan di antrian offline dan otomatis disinkronkan saat koneksi internet kembali.'
          });
        }
        return;
      }

      // ── Jika offline dan action adalah BACA DATA (Cache fallback) ─
      if (!navigator.onLine && CACHEABLE_READ_ACTIONS.includes(action)) {
        if (typeof QC_OFFLINE_QUEUE !== 'undefined' && typeof QC_OFFLINE_QUEUE.getCachedReadData === 'function') {
          const cached = await QC_OFFLINE_QUEUE.getCachedReadData(cacheKey);
          if (cached) {
            console.log('[GAS Adapter] Menggunakan data cache offline untuk:', action);
            if (successCb) successCb.call(userObj, cached);
            return;
          }
        }
      }

      const payload = {
        action,
        args,
        sessionToken,
        csrfToken
      };

      const jsonStr = JSON.stringify(payload);

      // ── Kirim langsung ke Google Apps Script (Bypass batasan 4.5MB Vercel) ──
      const _sendDirectToGas = async () => {
        const gasUrl = getDirectGasUrl();
        console.log('[GAS Adapter] Mengirim langsung ke Google Apps Script (Bypass Vercel limit)...', action);

        if (typeof window.showUploadProgress === 'function') {
          window.showUploadProgress(10, jsonStr.length, action, Math.round(jsonStr.length * 0.1));
        }

        // Coba kirim via XHR terlebih dahulu agar event onprogress akurat
        const _callXhr = () => {
          return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', gasUrl, true);
            xhr.setRequestHeader('Content-Type', 'text/plain;charset=utf-8');

            if (xhr.upload && typeof window.showUploadProgress === 'function') {
              xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                  const pct = Math.min(98, Math.round((e.loaded / e.total) * 100));
                  window.showUploadProgress(pct, e.total, action, e.loaded);
                }
              };
            }

            xhr.onload = () => {
              if (typeof window.showUploadProgress === 'function') {
                window.showUploadProgress(100, jsonStr.length, action, jsonStr.length);
              }
              setTimeout(() => {
                if (typeof window.hideUploadProgress === 'function') window.hideUploadProgress();
              }, 600);

              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  resolve(JSON.parse(xhr.responseText));
                } catch (e) {
                  resolve(xhr.responseText);
                }
              } else {
                reject(new Error('Google Apps Script HTTP ' + xhr.status + ': ' + xhr.statusText));
              }
            };

            xhr.onerror = () => {
              reject(new TypeError('XHR CORS/Network error'));
            };

            xhr.send(jsonStr);
          });
        };

        // Fallback fetch jika browser membatasi XHR redirect
        const _callFetch = async () => {
          let simPct = 25;
          const progressTimer = setInterval(() => {
            if (simPct < 90) {
              simPct += 15;
              if (typeof window.showUploadProgress === 'function') {
                window.showUploadProgress(simPct, jsonStr.length, action, Math.round(jsonStr.length * (simPct / 100)));
              }
            }
          }, 500);

          try {
            const res = await fetch(gasUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: jsonStr,
              redirect: 'follow'
            });
            clearInterval(progressTimer);

            if (typeof window.showUploadProgress === 'function') {
              window.showUploadProgress(100, jsonStr.length, action, jsonStr.length);
            }
            setTimeout(() => {
              if (typeof window.hideUploadProgress === 'function') window.hideUploadProgress();
            }, 600);

            if (!res.ok) {
              throw new Error('Google Apps Script HTTP ' + res.status + ': ' + res.statusText);
            }
            return await res.json();
          } catch (err) {
            clearInterval(progressTimer);
            if (typeof window.hideUploadProgress === 'function') window.hideUploadProgress();
            throw err;
          }
        };

        try {
          return await _callXhr();
        } catch (xhrErr) {
          console.warn('[GAS Adapter] XHR direct GAS gagal, fallback ke Fetch redirect...', xhrErr.message);
          return await _callFetch();
        }
      };

      // ── Kirim ke server ──
      const _doRequest = async (retryCount) => {
        const isUploadAction = action === 'submitDocument' || action === 'submitSiteReportEntry' || action === 'saveNFILogEntry' || action === 'submitCalibration' || action === 'updateDocumentMetadata';
        const isLongRunningSync = action === 'runSyncAll' || action === 'autoSyncAllProjects' || action === 'syncProjectMaster_' || action === 'setupHourlyTrigger';
        const isPayloadExceedingVercel = jsonStr.length > 2.5 * 1024 * 1024; // > 2.5 MB

        // Jika form upload dokumen/foto, payload besar, atau proses sync berdurasi panjang, LANGSUNG kirim ke Google Apps Script (Bypass limit 10-15s Vercel)
        if (isUploadAction || isLongRunningSync || isPayloadExceedingVercel) {
          return await _sendDirectToGas();
        }

        const hasMediumPayload = jsonStr.length > 25000 || OFFLINE_QUEUEABLE.includes(action);

        if (hasMediumPayload && typeof window.showUploadProgress === 'function') {
          window.showUploadProgress(0, jsonStr.length, action, 0);
          return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', PROXY_ENDPOINT, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            if (xhr.upload) {
              xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && typeof window.showUploadProgress === 'function') {
                  const percent = Math.min(99, Math.round((e.loaded / e.total) * 100));
                  window.showUploadProgress(percent, e.total, action, e.loaded);
                }
              };
            }

            xhr.onload = async () => {
              if (xhr.status === 413) {
                console.warn('[GAS Adapter] HTTP 413 dari Vercel terdeteksi! Mengalihkan langsung ke Google Apps Script...');
                try {
                  const fallbackData = await _sendDirectToGas();
                  resolve(fallbackData);
                } catch (fallbackErr) {
                  reject(fallbackErr);
                }
                return;
              }

              if (typeof window.showUploadProgress === 'function') {
                window.showUploadProgress(100, jsonStr.length, action, jsonStr.length);
              }
              setTimeout(() => {
                if (typeof window.hideUploadProgress === 'function') window.hideUploadProgress();
              }, 700);

              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  resolve(JSON.parse(xhr.responseText));
                } catch(e) {
                  reject(new Error('Format balasan server tidak valid'));
                }
              } else {
                reject(new Error('HTTP ' + xhr.status + ': ' + xhr.statusText));
              }
            };

            xhr.onerror = () => {
              if (typeof window.hideUploadProgress === 'function') window.hideUploadProgress();
              reject(new TypeError('Network request failed'));
            };

            xhr.send(jsonStr);
          });
        }

        const res = await fetch(PROXY_ENDPOINT, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    jsonStr
        });

        if (res.status === 413) {
          console.warn('[GAS Adapter] HTTP 413 dari Vercel fetch! Mengalihkan langsung ke Google Apps Script...');
          return await _sendDirectToGas();
        }

        if (!res.ok) {
          throw new Error('HTTP ' + res.status + ': ' + res.statusText);
        }
        return res.json();
      };

      let requestSucceeded = false;
      try {
        let data;
        try {
          data = await _doRequest(0);
        } catch (firstErr) {
          const errMsg = (firstErr && firstErr.message) || '';
          if (errMsg.includes('413')) {
            console.warn('[GAS Adapter] Auto-recover dari HTTP 413 langsung ke Google Apps Script:', action);
            data = await _sendDirectToGas();
          } else if (errMsg.startsWith('HTTP 5') || (firstErr && firstErr.name === 'TypeError')) {
            console.warn('[GAS Adapter] Retry 1x untuk:', action);
            await new Promise(r => setTimeout(r, 1500));
            data = await _doRequest(1);
          } else {
            throw firstErr;
          }
        }

        requestSucceeded = true;

        // ── Login success → enkripsi & simpan token ─────────────
        if (action === 'login' && data && data.success && data.sessionToken) {
          window.sessionToken = data.sessionToken;
          if (typeof QC_SECURITY !== 'undefined') {
            await QC_SECURITY.encryptToken(data.sessionToken);
            QC_SECURITY.rotateCsrfToken();  // rotasi CSRF setelah login
          } else {
            localStorage.setItem('qccms_session', data.sessionToken);
          }
        }

        // ── Logout → hapus semua sesi ────────────────────────────
        if (action === 'logout') {
          window.sessionToken = '';
          if (typeof QC_SECURITY !== 'undefined') {
            QC_SECURITY.clearSession();
          } else {
            localStorage.removeItem('qccms_session');
            localStorage.removeItem('qc_session_token');
          }
        }

        // ── Simpan salinan data pembacaan ke offline cache HANYA jika valid ──
        if (data && data.success !== false && CACHEABLE_READ_ACTIONS.includes(action)) {
          if (typeof QC_OFFLINE_QUEUE !== 'undefined' && typeof QC_OFFLINE_QUEUE.cacheReadData === 'function') {
            QC_OFFLINE_QUEUE.cacheReadData(cacheKey, data);
          }
        }

        if (successCb) {
          try {
            successCb.call(userObj, data);
          } catch (cbErr) {
            console.error('[GAS Adapter] Callback error pada aksi', action, cbErr);
          }
        }

      } catch (err) {
        console.error('[GAS Adapter] Error:', action, (err && err.message) || err);

        // ── Fallback ke cache offline HANYA jika request gagal ke network/server ──
        if (!requestSucceeded && CACHEABLE_READ_ACTIONS.includes(action)) {
          if (typeof QC_OFFLINE_QUEUE !== 'undefined' && typeof QC_OFFLINE_QUEUE.getCachedReadData === 'function') {
            const cachedFallback = await QC_OFFLINE_QUEUE.getCachedReadData(cacheKey);
            if (cachedFallback && cachedFallback.success !== false) {
              console.warn('[GAS Adapter] Network error, menyajikan data fallback dari cache lokal:', action);
              if (successCb) {
                try {
                  successCb.call(userObj, cachedFallback);
                } catch (cbErr) {
                  console.error('[GAS Adapter] Error pada callback fallback:', cbErr);
                }
                return;
              }
            }
          }
        }

        // ── Jika gagal karena offline dan action bisa di-queue ──
        if (!navigator.onLine && OFFLINE_QUEUEABLE.includes(action)) {
          if (typeof QC_OFFLINE_QUEUE !== 'undefined') {
            await QC_OFFLINE_QUEUE.enqueue(action, args, sessionToken);
          }
          if (successCb) {
            successCb.call(userObj, {
              success: true,
              offline: true,
              message: '📶 Anda sedang offline. Form disimpan dan akan dikirim otomatis saat koneksi kembali.'
            });
          }
          return;
        }

        if (failureCb) {
          failureCb.call(userObj, err);
        } else if (typeof showToast === 'function') {
          showToast('Koneksi terputus: ' + (err.message || 'Gagal memanggil server'), 'error');
        }
      }
    };

    // ── Buat proxy google.script.run ──────────────────────────────

    function createRunnerProxy() {
      const runner = new Runner();
      return new Proxy(runner, {
        get: function(target, prop) {
          if (prop === 'withSuccessHandler') return fn => { target.withSuccessHandler(fn); return createRunnerProxyInternal(target); };
          if (prop === 'withFailureHandler') return fn => { target.withFailureHandler(fn); return createRunnerProxyInternal(target); };
          if (prop === 'withUserObject')     return u  => { target.withUserObject(u);     return createRunnerProxyInternal(target); };
          return function() { target._call(prop, Array.prototype.slice.call(arguments)); return target; };
        }
      });
    }

    function createRunnerProxyInternal(existingRunner) {
      return new Proxy(existingRunner, {
        get: function(target, prop) {
          if (prop === 'withSuccessHandler') return fn => { target.withSuccessHandler(fn); return createRunnerProxyInternal(target); };
          if (prop === 'withFailureHandler') return fn => { target.withFailureHandler(fn); return createRunnerProxyInternal(target); };
          if (prop === 'withUserObject')     return u  => { target.withUserObject(u);     return createRunnerProxyInternal(target); };
          return function() { target._call(prop, Array.prototype.slice.call(arguments)); return target; };
        }
      });
    }

    window.google.script.run = createRunnerProxy();
    console.log('[PWA] GAS Adapter v2.0 — Security + CSRF + Offline Queue aktif');
  }
})(window);
