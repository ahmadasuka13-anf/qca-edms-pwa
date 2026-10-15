# 🚀 QC-CMS EDMS — Progressive Web App (PWA)

Aplikasi Web Progresif (PWA) resmi untuk **QC-CMS EDMS PT Asuka Engineering Indonesia**.

---

## 📋 Langkah Deploy ke Vercel (Gratis & Cepat)

### Langkah 1: URL Apps Script (Sudah Terpasang Otomatis ✅)
URL backend Apps Script Anda telah terpasang di `api/gas.js` & `public/gas-adapter.js`:
```text
https://script.google.com/macros/s/AKfycbxHv0P-UIPghtjjUzMiu0Bdi7WqvtNlDmEQmVaOnS1dPQAgdZNZV7piFks72p1GJDz9/exec
```
*(Jika suatu saat Anda deploy versi baru dengan URL berbeda, cukup ubah nilai `GAS_EXEC_URL` di Vercel Environment Variables).*

---

### Langkah 2: Deploy ke Vercel
Ada 2 cara yang sangat mudah:

#### Cara A: Upload via GitHub (Paling Disukai)
1. Buat repository baru di [GitHub](https://github.com).
2. Upload seluruh isi folder `pwa-frontend/` ke repository tersebut.
3. Buka [vercel.com](https://vercel.com) > Klik **Add New Project** > Impor repository Anda.
4. Klik **Deploy**! Selesai dalam 30 detik.

#### Cara B: Deploy via Vercel CLI
Jalankan di terminal folder `pwa-frontend`:
```bash
npx vercel
```
Ikuti petunjuk di layar (tekan Enter untuk opsi default).

---

## ✨ Fitur PWA Aktif
- ✅ **Bisa Di-install ke HP & Desktop** (Tombol *Install App* otomatis muncul).
- ✅ **Offline Caching**: Aset dimuat instan dengan Service Worker (`sw.js`).
- ✅ **CORS Proxy**: Menghilangkan batasan redirect 302 Google Apps Script.
- ✅ **Universal Client Adapter**: Menghubungkan seluruh fungsi `google.script.run` secara otomatis.
