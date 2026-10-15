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
        if (action === 'login' || action === 'registerAccount' || action === 'requestPasswordReset') {
          sessionToken = '';
        } else if (args.length > 0 && typeof args[0] === 'string' && /^[0-9a-fA-F-]{36}$/.test(args[0])) {
          sessionToken = args[0];
        }

        const payload = {
          action: action,
          args: args,
          sessionToken: sessionToken
        };

        const res = await fetch(PROXY_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error('HTTP ' + res.status + ': ' + res.statusText);
        }

        const data = await res.json();
        
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
