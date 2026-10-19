/**
 * QCA EDMS — Security Module v2.0
 * ===========================================
 * 1. Enkripsi token sesi dengan AES-256-GCM via Web Crypto API
 *    - Menggunakan persistent cryptographic device seed (tahan update browser / OS)
 *    - Dilengkapi backward compatibility untuk token lama (legacy userAgent derivation)
 * 2. CSRF Token: generate & validasi per-session
 * ===========================================
 */

const QC_SECURITY = (function () {
  'use strict';

  const SEED_STORAGE_KEY  = 'qccms_device_seed';
  const KEY_MATERIAL_SALT = 'qca-edms-salt-2024';
  const STORAGE_KEY_ENC   = 'qccms_session_enc';
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

  // ─── Persistent Device Seed (Stabil saat browser update) ─────────

  function _getOrCreateDeviceSeed() {
    let seed = localStorage.getItem(SEED_STORAGE_KEY);
    if (!seed || seed.length < 32) {
      const arr = new Uint8Array(32);
      window.crypto.getRandomValues(arr);
      seed = ab2hex(arr.buffer);
      localStorage.setItem(SEED_STORAGE_KEY, seed);
    }
    return seed;
  }

  async function _deriveKeyFromMaterial(materialString) {
    const rawKey = await window.crypto.subtle.importKey(
      'raw',
      str2ab(materialString),
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

  // Kunci baru: stabil, terikat ke origin & device seed acak (tahan update browser)
  async function _getEncryptionKey() {
    const seed = _getOrCreateDeviceSeed();
    const material = [window.location.origin, seed, KEY_MATERIAL_SALT].join('|');
    return await _deriveKeyFromMaterial(material);
  }

  // Kunci legacy: untuk backward-compatibility jika token lama dienkripsi dengan userAgent
  async function _getLegacyEncryptionKey() {
    const legacyFingerprint = [
      navigator.userAgent,
      window.location.origin,
      KEY_MATERIAL_SALT
    ].join('|');
    return await _deriveKeyFromMaterial(legacyFingerprint);
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
      console.log('[Security] Token tersimpan terenkripsi (AES-256-GCM, persistent seed)');
    } catch (err) {
      console.warn('[Security] Web Crypto tidak tersedia, fallback plain storage:', err.message);
      localStorage.setItem('qccms_session', plainToken);
    }
  }

  // ─── Dekripsi token ─────────────────────────────────────────────

  async function decryptToken() {
    const encHex = localStorage.getItem(STORAGE_KEY_ENC);
    const ivHex  = localStorage.getItem(STORAGE_KEY_IV);

    if (encHex && ivHex) {
      // 1. Coba dekripsi dengan kunci stabil baru
      try {
        const key = await _getEncryptionKey();
        const decrypted = await window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: new Uint8Array(hex2ab(ivHex)) },
          key,
          hex2ab(encHex)
        );
        return ab2str(decrypted);
      } catch (errNewKey) {
        // 2. Fallback migrasi jika token lama masih memakai turunan userAgent
        try {
          const legacyKey = await _getLegacyEncryptionKey();
          const decryptedLegacy = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(hex2ab(ivHex)) },
            legacyKey,
            hex2ab(encHex)
          );
          const plain = ab2str(decryptedLegacy);
          console.log('[Security] Migrasi token sesi lama ke kunci persistent berhasil');
          await encryptToken(plain);
          return plain;
        } catch (errLegacy) {
          console.warn('[Security] Gagal dekripsi token, sesi dibersihkan:', errLegacy.message);
          clearSession();
          return null;
        }
      }
    }

    // Fallback: baca dari key lama (migrasi otomatis)
    const plain = localStorage.getItem('qccms_session') || localStorage.getItem('qc_session_token');
    if (plain) {
      console.log('[Security] Migrasi token lama ke enkripsi baru...');
      await encryptToken(plain);
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
    sessionStorage.setItem(CSRF_KEY, token);
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

  getCsrfToken();

  return {
    encryptToken,
    decryptToken,
    clearSession,
    getCsrfToken,
    rotateCsrfToken
  };
})();

console.log('[Security] QCA EDMS Security Module v2.0 loaded (Resilient Device Seed)');
