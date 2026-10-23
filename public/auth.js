/**
 * QC-CMS EDMS — Authentication Module (auth.js)
 * Handles Login, Register, Forgot Password, Password Toggle, and Form Validation
 */

(function (window) {
  'use strict';

  function showAuthError(msg) {
    var e = document.getElementById('authError');
    var m = document.getElementById('authMsg');
    if (m) { m.style.display = 'none'; m.textContent = ''; }
    if (e) { e.textContent = msg; e.style.display = 'block'; }
  }

  function showAuthMsg(msg) {
    var m = document.getElementById('authMsg');
    var e = document.getElementById('authError');
    if (e) { e.style.display = 'none'; e.textContent = ''; }
    if (m) { m.textContent = msg; m.style.display = 'block'; }
  }

  function togglePassword(inputId, btn) {
    var inp = document.getElementById(inputId);
    if (!inp) return;
    if (inp.type === 'password') {
      inp.type = 'text';
      if (btn) btn.textContent = 'Sembunyikan';
    } else {
      inp.type = 'password';
      if (btn) btn.textContent = 'Lihat';
    }
  }

  function showAuthForm(w) {
    var err = document.getElementById('authError');
    var msg = document.getElementById('authMsg');
    if (err) { err.style.display = 'none'; err.textContent = ''; }
    if (msg) { msg.style.display = 'none'; msg.textContent = ''; }

    var lf = document.getElementById('loginForm');
    var rf = document.getElementById('registerForm');
    var ff = document.getElementById('forgotForm');
    if (lf) lf.style.display = w === 'login' ? 'block' : 'none';
    if (rf) rf.style.display = w === 'register' ? 'block' : 'none';
    if (ff) ff.style.display = w === 'forgot' ? 'block' : 'none';

    var sr = document.getElementById('switchToRegisterWrap');
    var sl = document.getElementById('switchToLoginWrap');
    var sf = document.getElementById('switchToLoginFromForgotWrap');
    if (sr) sr.style.display = w === 'login' ? 'inline' : 'none';
    if (sl) sl.style.display = w === 'register' ? 'inline' : 'none';
    if (sf) sf.style.display = w === 'forgot' ? 'inline' : 'none';
  }

  function handleLogin(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    var emailInput = document.getElementById('loginEmail');
    var passInput  = document.getElementById('loginPassword');
    var email = (emailInput && emailInput.value ? emailInput.value : '').trim();
    var pass  = (passInput && passInput.value ? passInput.value : '');

    if (!email || !pass) {
      showAuthError('Email & password wajib diisi.');
      return false;
    }

    var btn = document.getElementById('loginBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>Memproses...';
    }

    if (typeof google === 'undefined' || !google.script || !google.script.run) {
      if (btn) { btn.disabled = false; btn.textContent = 'Masuk'; }
      showAuthError('Layanan backend GAS belum siap. Silakan muat ulang halaman.');
      return false;
    }

    google.script.run
      .withSuccessHandler(function (res) {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Masuk';
        }
        if (!res || !res.success) {
          showAuthError((res && res.message) || 'Login gagal. Periksa kembali email dan password Anda.');
          return;
        }

        // Simpan state session
        window.sessionToken = res.sessionToken;
        window.currentUser  = res.user;
        if (typeof sessionToken !== 'undefined') sessionToken = res.sessionToken;
        if (typeof currentUser !== 'undefined') currentUser = res.user;

        // Persist session token (plain + encrypted)
        try { localStorage.setItem('qccms_session', res.sessionToken); } catch (err) {}
        try { sessionStorage.removeItem('qccms_welcome_seen'); } catch (err) {}

        if (typeof QC_SECURITY !== 'undefined' && typeof QC_SECURITY.encryptToken === 'function') {
          QC_SECURITY.encryptToken(res.sessionToken).catch(function (encErr) {
            console.warn('[Auth] Token encryption warning:', encErr);
          });
        }

        // Bersihkan form & masuk aplikasi
        var form = document.getElementById('loginForm');
        if (form) form.reset();
        showAuthForm('login');

        if (typeof window.enterApp === 'function') {
          window.enterApp(true);
        } else if (typeof enterApp === 'function') {
          enterApp(true);
        } else {
          location.reload();
        }
      })
      .withFailureHandler(function (err) {
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Masuk';
        }
        showAuthError('Gagal: ' + (err && err.message ? err.message : 'Terjadi gangguan jaringan / server.'));
      })
      .login(email, pass);

    return false;
  }

  function handleRegister(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    var btn = document.getElementById('registerBtn');
    var originalText = btn ? btn.textContent : 'Daftar';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>Mendaftar...';
    }

    var payload = {
      fullName: (document.getElementById('regFullName').value || '').trim(),
      email:    (document.getElementById('regEmail').value || '').trim(),
      password: document.getElementById('regPassword').value || '',
      role:     document.getElementById('regRole').value || 'Inspector'
    };

    if (typeof google === 'undefined' || !google.script || !google.script.run) {
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
      showAuthError('Layanan backend GAS belum siap.');
      return false;
    }

    google.script.run
      .withSuccessHandler(function (res) {
        if (btn) { btn.disabled = false; btn.textContent = originalText; }

        if (res && res.success) {
          if (typeof window.showSuccessOverlay === 'function') {
            window.showSuccessOverlay({
              title: '🎉 Registrasi Berhasil!',
              message: 'Akun Anda telah dibuat:<br><b style="color:#163d78;">' + payload.email + '</b><br><br>' +
                       'Silakan login dengan akun baru Anda.',
              buttonText: '→ Login Sekarang',
              autoClose: 6000,
              onClose: function () {
                showAuthForm('login');
                var regForm = document.getElementById('registerForm');
                if (regForm) regForm.reset();
              }
            });
          } else {
            showAuthMsg('Registrasi berhasil! Silakan login.');
            showAuthForm('login');
          }
        } else {
          var msg = (res && res.message) || 'Terjadi kesalahan saat mendaftar.';
          if (typeof window.showSuccessOverlay === 'function') {
            window.showSuccessOverlay({
              title: '⚠️ Registrasi Gagal',
              message: msg,
              buttonText: 'Coba Lagi',
              isError: true
            });
          } else {
            showAuthError(msg);
          }
        }
      })
      .withFailureHandler(function (err) {
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
        var errMsg = err && err.message ? err.message : 'Terjadi kesalahan sistem';
        if (typeof window.showSuccessOverlay === 'function') {
          window.showSuccessOverlay({
            title: '❌ Error',
            message: 'Terjadi kesalahan: ' + errMsg,
            buttonText: 'Tutup',
            isError: true
          });
        } else {
          showAuthError('Error: ' + errMsg);
        }
      })
      .registerAccount(payload);

    return false;
  }

  function handleForgotPassword(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    var btn = document.getElementById('forgotBtn');
    var originalText = btn ? btn.textContent : 'Kirim Link Reset';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span>Mengirim...';
    }

    var email = (document.getElementById('forgotEmail').value || '').trim();
    if (!email) {
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
      showAuthError('Silakan masukkan email Anda.');
      return false;
    }

    if (typeof google === 'undefined' || !google.script || !google.script.run) {
      if (btn) { btn.disabled = false; btn.textContent = originalText; }
      showAuthError('Layanan backend GAS belum siap.');
      return false;
    }

    google.script.run
      .withSuccessHandler(function (res) {
        if (btn) { btn.disabled = false; btn.textContent = originalText; }

        if (res && res.success) {
          if (typeof window.showSuccessOverlay === 'function') {
            window.showSuccessOverlay({
              title: '📧 Email Terkirim!',
              message: 'Link reset password telah dikirim ke:<br><b style="color:#163d78;">' + email + '</b><br><br>' +
                       'Silakan cek <b>Inbox</b> atau <b>Spam</b> Anda.<br>Link berlaku selama <b>24 jam</b>.',
              buttonText: '← Kembali ke Login',
              autoClose: 8000,
              onClose: function () {
                showAuthForm('login');
                var ff = document.getElementById('forgotForm');
                if (ff) ff.reset();
              }
            });
          } else {
            showAuthMsg('Link reset password telah dikirim ke email Anda.');
            showAuthForm('login');
          }
        } else {
          var msg = (res && res.message) || 'Email tidak ditemukan atau ada masalah pada server.';
          if (typeof window.showSuccessOverlay === 'function') {
            window.showSuccessOverlay({
              title: '⚠️ Gagal Mengirim',
              message: msg,
              buttonText: 'Coba Lagi',
              isError: true,
              onClose: function () {
                var fe = document.getElementById('forgotEmail');
                if (fe) fe.focus();
              }
            });
          } else {
            showAuthError(msg);
          }
        }
      })
      .withFailureHandler(function (err) {
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
        var errMsg = err && err.message ? err.message : 'Gagal mengirim email';
        if (typeof window.showSuccessOverlay === 'function') {
          window.showSuccessOverlay({
            title: '❌ Terjadi Kesalahan',
            message: 'Gagal mengirim email: ' + errMsg,
            buttonText: 'Tutup',
            isError: true
          });
        } else {
          showAuthError('Error: ' + errMsg);
        }
      })
      .requestPasswordReset(email);

    return false;
  }

  // Export ke global window scope
  window.showAuthError = showAuthError;
  window.showAuthMsg = showAuthMsg;
  window.togglePassword = togglePassword;
  window.showAuthForm = showAuthForm;
  window.handleLogin = handleLogin;
  window.handleRegister = handleRegister;
  window.handleForgotPassword = handleForgotPassword;

})(window);
