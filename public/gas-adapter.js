/**
 * Universal GAS Client Adapter for PWA & Vercel
 * Menghubungkan panggilan `google.script.run` langsung ke API Serverless /api/gas
 * sehingga SELURUH kode client-side berjalan 100% tanpa perlu diubah!
 */
(function(window) {
  if (typeof window.google === 'undefined' || !window.google.script || !window.google.script.run) {
    window.google = window.google || {};
    window.google.script = window.google.script || {};

    const PROXY_ENDPOINT = '/api/gas';
    const DIRECT_GAS_URL = 'https://script.google.com/macros/s/AKfycbxHv0P-UIPghtjjUzMiu0Bdi7WqvtNlDmEQmVaOnS1dPQAgdZNZV7piFks72p1GJDz9/exec';

    function callJsonpDirect_(gasUrl, action, args, sessionToken) {
      return new Promise(function(resolve, reject) {
        const callbackName = 'gas_cb_' + Math.random().toString(36).substring(2) + '_' + Date.now();
        const script = document.createElement('script');
        const timeout = setTimeout(function() {
          cleanup();
          reject(new Error('Permintaan ke Google Apps Script timeout (30s)'));
        }, 30000);

        function cleanup() {
          clearTimeout(timeout);
          try { delete window[callbackName]; } catch (e) { window[callbackName] = undefined; }
          if (script.parentNode) script.parentNode.removeChild(script);
        }

        window[callbackName] = function(res) {
          cleanup();
          resolve(res);
        };

        const params = new URLSearchParams({
          api: '1',
          apiAction: action,
          apiArgs: JSON.stringify(args || []),
          sessionToken: sessionToken || '',
          callback: callbackName
        });

        script.src = gasUrl + (gasUrl.includes('?') ? '&' : '?') + params.toString();
        script.onerror = function() {
          cleanup();
          reject(new Error('Gagal memuat respons dari Apps Script'));
        };

        document.head.appendChild(script);
      });
    }

    function Runner() {
      this._success = null;
      this._failure = null;
      this._userObject = null;
    }

    Runner.prototype.withSuccessHandler = function(fn) {
      this._success = fn;
      return this;
    };

    Runner.prototype.withFailureHandler = function(fn) {
      this._failure = fn;
      return this;
    };

    Runner.prototype.withUserObject = function(obj) {
      this._userObject = obj;
      return this;
    };

    Runner.prototype._call = async function(action, args) {
      const successCb = this._success;
      const failureCb = this._failure;
      const userObj = this._userObject;

      try {
        let sessionToken = window.sessionToken || localStorage.getItem('qc_session_token') || '';
        // Cek jika argumen pertama adalah sessionToken (UUID format 36 char)
        if (args.length > 0 && typeof args[0] === 'string' && args[0].length >= 32) {
          sessionToken = args[0];
        }

        const payload = {
          action: action,
          args: args,
          sessionToken: sessionToken
        };

        let data;
        let responseOk = false;

        // 1. Coba lewat proxy /api/gas (Vercel)
        try {
          const res = await fetch(PROXY_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) {
            data = await res.json();
            responseOk = true;
          }
        } catch (fetchErr) {
          // Proxy tidak aktif, lanjut ke fallback JSONP
        }

        // 2. Fallback langsung ke Google Apps Script jika proxy gagal
        if (!responseOk) {
          data = await callJsonpDirect_(DIRECT_GAS_URL, action, args, sessionToken);
        }
        
        // Simpan token otomatis jika ini adalah response login berhasil
        if (action === 'login' && data && data.success && data.sessionToken) {
          localStorage.setItem('qc_session_token', data.sessionToken);
          window.sessionToken = data.sessionToken;
        }
        if (action === 'logout') {
          localStorage.removeItem('qc_session_token');
          window.sessionToken = '';
        }

        if (successCb) {
          successCb.call(userObj, data);
        }
      } catch (err) {
        console.error('[GAS Adapter Call Error]:', action, err);
        if (failureCb) {
          failureCb.call(userObj, err);
        } else if (typeof showToast === 'function') {
          showToast('Koneksi terputus: ' + (err.message || 'Gagal memanggil server'), 'error');
        }
      }
    };

    // Buat proxy objek google.script.run
    function createRunnerProxy() {
      const runner = new Runner();
      return new Proxy(runner, {
        get: function(target, prop) {
          if (prop === 'withSuccessHandler') {
            return function(fn) { target.withSuccessHandler(fn); return createRunnerProxyInternal(target); };
          }
          if (prop === 'withFailureHandler') {
            return function(fn) { target.withFailureHandler(fn); return createRunnerProxyInternal(target); };
          }
          if (prop === 'withUserObject') {
            return function(u) { target.withUserObject(u); return createRunnerProxyInternal(target); };
          }
          return function() {
            const args = Array.prototype.slice.call(arguments);
            target._call(prop, args);
            return target;
          };
        }
      });
    }

    function createRunnerProxyInternal(existingRunner) {
      return new Proxy(existingRunner, {
        get: function(target, prop) {
          if (prop === 'withSuccessHandler') {
            return function(fn) { target.withSuccessHandler(fn); return createRunnerProxyInternal(target); };
          }
          if (prop === 'withFailureHandler') {
            return function(fn) { target.withFailureHandler(fn); return createRunnerProxyInternal(target); };
          }
          if (prop === 'withUserObject') {
            return function(u) { target.withUserObject(u); return createRunnerProxyInternal(target); };
          }
          return function() {
            const args = Array.prototype.slice.call(arguments);
            target._call(prop, args);
            return target;
          };
        }
      });
    }

    window.google.script.run = createRunnerProxy();
    console.log('[PWA] Universal Google Apps Script Client Adapter active.');
  }
})(window);
