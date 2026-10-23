/**
 * QC-CMS EDMS — API Module (api.js)
 * Wraps google.script.run with Promises, session tokens, and UI helpers
 */
(function (window) {
  'use strict';

  function callApi(fnName) {
    var args = Array.prototype.slice.call(arguments, 1);
    return new Promise(function (resolve, reject) {
      if (typeof google === 'undefined' || !google.script || !google.script.run) {
        reject(new Error('google.script.run tidak tersedia.'));
        return;
      }
      var runner = google.script.run
        .withSuccessHandler(resolve)
        .withFailureHandler(reject);
      if (typeof runner[fnName] !== 'function') {
        reject(new Error('Fungsi backend "' + fnName + '" tidak ditemukan.'));
        return;
      }
      runner[fnName].apply(runner, args);
    });
  }

  function callAuthed(fnName) {
    var args = Array.prototype.slice.call(arguments, 1);
    var token = window.sessionToken || (typeof sessionToken !== 'undefined' ? sessionToken : null) || localStorage.getItem('qccms_session');
    if (!token) {
      return Promise.reject(new Error('Session tidak aktif. Silakan login ulang.'));
    }
    return callApi.apply(null, [fnName, token].concat(args));
  }

  async function callWithUI(fnName, payload, btn, originalText) {
    var original = originalText || (btn ? btn.textContent : 'Simpan');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>...';
    }
    try {
      var res = await callAuthed(fnName, payload);
      if (btn) { btn.disabled = false; btn.textContent = original; }
      if (res && typeof res.message === 'string' && typeof showToast === 'function') {
        var isSuccess = res.success !== false;
        var toastType = isSuccess ? ((window.TOAST && window.TOAST.SUCCESS) || 'success') : ((window.TOAST && window.TOAST.ERROR) || 'error');
        showToast(res.message, toastType);
      }
      return res;
    } catch (err) {
      if (btn) { btn.disabled = false; btn.textContent = original; }
      if (typeof showToast === 'function') showToast('Gagal: ' + (err.message || 'Unknown error'), 'error');
      throw err;
    }
  }

  async function callSilent(fnName, payload, btn, originalText) {
    var original = originalText || (btn ? btn.textContent : 'Simpan');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>...';
    }
    try {
      return await callAuthed(fnName, payload);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = original; }
    }
  }

  window.callApi = callApi;
  window.callAuthed = callAuthed;
  window.callWithUI = callWithUI;
  window.callSilent = callSilent;
})(window);
