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
    const DIRECT_GAS_URL = 'https://script.google.com/macros/s/AKfycbxHv0P-UIPghtjjUzMiu0Bdi7WqvtNlDmEQmVaOnS1dPQAgdZNZV7piFks72p1GJDz9/exec';

    // Action yang BOLEH masuk antrian offline (semua form lapangan)
    const OFFLINE_QUEUEABLE = [
      'submitDocument',
      'submitSiteReportEntry',
      'saveNFILogEntry',
      'submitCalibration'
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

      // ── Jika offline dan action bisa di-queue ──────────────────
      if (!navigator.onLine && OFFLINE_QUEUEABLE.includes(action)) {
        console.warn('[GAS Adapter] Offline — menambahkan ke antrian:', action);
        if (typeof QC_OFFLINE_QUEUE !== 'undefined') {
          await QC_OFFLINE_QUEUE.enqueue(action, args, sessionToken);
        }
        if (successCb) {
          // Beri tahu UI bahwa form sudah disimpan offline
          successCb.call(userObj, {
            success:  true,
            offline:  true,
            message:  '📶 Anda sedang offline. Form disimpan di antrian offline dan otomatis disinkronkan saat koneksi internet kembali.'
          });
        }
        return;
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
        console.log('[GAS Adapter] Mengirim langsung ke Google Apps Script (Bypass Vercel limit)...', action);
        if (typeof window.showUploadProgress === 'function') {
          window.showUploadProgress(15, jsonStr.length, action, Math.round(jsonStr.length * 0.15));
        }

        let simPct = 15;
        const progressTimer = setInterval(() => {
          if (simPct < 90) {
            simPct += 15;
            if (typeof window.showUploadProgress === 'function') {
              window.showUploadProgress(simPct, jsonStr.length, action, Math.round(jsonStr.length * (simPct / 100)));
            }
          }
        }, 500);

        try {
          const res = await fetch(DIRECT_GAS_URL, {
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
          }, 700);

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

      // ── Kirim ke server ──
      const _doRequest = async (retryCount) => {
        const isUploadAction = action === 'submitDocument' || action === 'submitSiteReportEntry';
        const isPayloadExceedingVercel = jsonStr.length > 2.5 * 1024 * 1024; // > 2.5 MB

        // Jika ukuran file besar atau form upload dokumen, LANGSUNG kirim ke Google Apps Script
        // agar TIDAK dicegat oleh batas 4.5 MB Vercel Serverless Function (HTTP 413)
        if (isUploadAction || isPayloadExceedingVercel) {
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

      try {
        let data;
        try {
          data = await _doRequest(0);
        } catch (firstErr) {
          if (firstErr.message && firstErr.message.includes('413')) {
            console.warn('[GAS Adapter] Auto-recover dari HTTP 413 langsung ke Google Apps Script:', action);
            data = await _sendDirectToGas();
          } else if (firstErr.message.startsWith('HTTP 5') || firstErr.name === 'TypeError') {
            console.warn('[GAS Adapter] Retry 1x untuk:', action);
            await new Promise(r => setTimeout(r, 1500));
            data = await _doRequest(1);
          } else {
            throw firstErr;
          }
        }

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

        if (successCb) successCb.call(userObj, data);

      } catch (err) {
        console.error('[GAS Adapter] Error:', action, err.message);

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
