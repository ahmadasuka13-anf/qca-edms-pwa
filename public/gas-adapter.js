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

    // Action yang BOLEH masuk antrian offline
    const OFFLINE_QUEUEABLE = ['submitDocument'];
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
            message:  '📶 Anda sedang offline. Form disimpan dan akan dikirim otomatis saat koneksi kembali.'
          });
        }
        return;
      }

      // ── Kirim ke server ─────────────────────────────────────────
      const _doFetch = async (retryCount) => {
        const payload = {
          action,
          args,
          sessionToken,
          csrfToken
        };

        const res = await fetch(PROXY_ENDPOINT, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error('HTTP ' + res.status + ': ' + res.statusText);
        }
        return res.json();
      };

      try {
        let data;
        try {
          data = await _doFetch(0);
        } catch (firstErr) {
          // ── Retry 1x setelah 1.5 detik jika network error ──
          if (firstErr.message.startsWith('HTTP 5') || firstErr.name === 'TypeError') {
            console.warn('[GAS Adapter] Retry 1x untuk:', action);
            await new Promise(r => setTimeout(r, 1500));
            data = await _doFetch(1);
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
