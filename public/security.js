/**
 * QCA EDMS — Security Module
 * ===========================================
 * 1. Enkripsi token sesi dengan AES-GCM via Web Crypto API
 *    (Token tidak pernah disimpan plain-text di localStorage)
 * 2. CSRF Token: generate & validasi per-session
 * ===========================================
 */

const QC_SECURITY = (function () {
  'use strict';

  // Kunci enkripsi di-derive dari kombinasi user agent + origin (deterministik per device)
  const KEY_MATERIAL_SALT = 'qca-edms-salt-2024';
  const STORAGE_KEY_ENC   = 'qccms_session_enc';   // ganti key lama 'qccms_session'
  const STORAGE_KEY_IV    = 'qccms_session_iv';
  const CSRF_KEY          = 'qccms_csrf_token';

  // ─── Helpers ───────────────────────────────────────────────────

  function str2ab(str) {
    return new TextEncoder().encode(str);
  }
  function ab2str(buf) {
    return new TextDecoder().decode(buf);
  }
  function ab2hex(buf) {
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  function hex2ab(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    return bytes.buffer;
  }

  // ─── Derive enkripsi key dari fingerprint device (tidak hardcoded) ─

  async function _getEncryptionKey() {
    const fingerprint = [
      navigator.userAgent,
      window.location.origin,
      KEY_MATERIAL_SALT
    ].join('|');

    const rawKey = await window.crypto.subtle.importKey(
      'raw',
      str2ab(fingerprint),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: str2ab(KEY_MATERIAL_SALT),
        iterations: 100000,
        hash: 'SHA-256'
      },
      rawKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // ─── Enkripsi token ─────────────────────────────────────────────

  async function encryptToken(plainToken) {
    try {
      const key = await _getEncryptionKey();
      const iv  = window.crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        str2ab(plainToken)
      );
      localStorage.setItem(STORAGE_KEY_ENC, ab2hex(encrypted));
      localStorage.setItem(STORAGE_KEY_IV,  ab2hex(iv.buffer));
      // Hapus key lama plain-text jika masih ada
      localStorage.removeItem('qccms_session');
      localStorage.removeItem('qc_session_token');
      console.log('[Security] Token tersimpan terenkripsi (AES-256-GCM)');
    } catch (err) {
      // Fallback ke localStorage biasa jika Web Crypto tidak tersedia (browser lama)
      console.warn('[Security] Web Crypto tidak tersedia, fallback plain storage:', err.message);
      localStorage.setItem('qccms_session', plainToken);
    }
  }

  // ─── Dekripsi token ─────────────────────────────────────────────

  async function decryptToken() {
    // Coba baca versi terenkripsi dulu
    const encHex = localStorage.getItem(STORAGE_KEY_ENC);
    const ivHex  = localStorage.getItem(STORAGE_KEY_IV);

    if (encHex && ivHex) {
      try {
        const key       = await _getEncryptionKey();
        const decrypted = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: new Uint8Array(hex2ab(ivHex)) },
          key,
          hex2ab(encHex)
        );
        return ab2str(decrypted);
      } catch (err) {
        console.warn('[Security] Gagal dekripsi token, menghapus sesi:', err.message);
        clearSession();
        return null;
      }
    }

    // Fallback: baca dari key lama (migrasi otomatis)
    const plain = localStorage.getItem('qccms_session') || localStorage.getItem('qc_session_token');
    if (plain) {
      console.log('[Security] Migrasi token lama ke enkripsi baru...');
      await encryptToken(plain);  // enkripsi ulang
      localStorage.removeItem('qccms_session');
      localStorage.removeItem('qc_session_token');
      return plain;
    }

    return null;
  }

  // ─── Clear sesi ─────────────────────────────────────────────────

  function clearSession() {
    localStorage.removeItem(STORAGE_KEY_ENC);
    localStorage.removeItem(STORAGE_KEY_IV);
    localStorage.removeItem('qccms_session');
    localStorage.removeItem('qc_session_token');
    console.log('[Security] Sesi dihapus');
  }

  // ─── CSRF Token ─────────────────────────────────────────────────

  function generateCsrfToken() {
    const arr = new Uint8Array(24);
    window.crypto.getRandomValues(arr);
    const token = ab2hex(arr.buffer);
    sessionStorage.setItem(CSRF_KEY, token);  // sessionStorage: hilang saat tab ditutup
    return token;
  }

  function getCsrfToken() {
    let t = sessionStorage.getItem(CSRF_KEY);
    if (!t) t = generateCsrfToken();
    return t;
  }

  // ─── Rotasi CSRF setelah login ────────────────────────────────

  function rotateCsrfToken() {
    sessionStorage.removeItem(CSRF_KEY);
    return generateCsrfToken();
  }

  // Inisialisasi CSRF saat modul dimuat
  getCsrfToken();

  return {
    encryptToken,
    decryptToken,
    clearSession,
    getCsrfToken,
    rotateCsrfToken
  };
})();

console.log('[Security] QCA EDMS Security Module v1.0 loaded');
