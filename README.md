# ADIK — Asesmen Digital Interaktif Kuliner

Aplikasi asesmen berbasis web (100% statis) untuk pembelajaran kuliner.
Dibuat oleh **Rahmawati Nawir**.

Aplikasi ini tidak memerlukan server, database, atau proses build. Semua
berkas HTML/CSS/JS diunggah apa adanya lalu dijalankan langsung di browser.

---

## Daftar isi

- [Menjalankan di komputer sendiri](#menjalankan-di-komputer-sendiri)
- [Hosting di GitHub Pages](#hosting-di-github-pages)
- [Hosting alternatif (Netlify Drop)](#hosting-alternatif-netlify-drop)
- [Hal penting setelah hosting](#hal-penting-setelah-hosting)
- [Daftar berkas](#daftar-berkas)

---

## Menjalankan di komputer sendiri

Untuk pemakaian pribadi (menguji aplikasi), cukup klik dua kali
`index.html`. Namun cara yang **disarankan** adalah lewat server lokal kecil,
karena beberapa fitur (klip papan, kamera, unduhan, dan pratinjau siswa)
berjalan lebih baik pada alamat `http://` daripada `file://`.

Cara paling mudah bila ada Python:

```bash
python -m http.server 8080
```

Lalu buka `http://localhost:8080` di browser.

---

## Hosting di GitHub Pages

### Langkah 1 — Siapkan akun GitHub

1. Buka <https://github.com> dan buat akun (gratis) bila belum punya.
2. Verifikasi email Anda.

### Langkah 2 — Buat repositori baru

1. Klik tombol **+** di kanan atas, pilih **New repository**.
2. Isi:
   - **Repository name**: `adik` (atau nama lain, huruf kecil semua, tanpa spasi)
   - **Visibility**: **Public** — GitHub Pages gratis hanya untuk repo publik
   - Jangan centang "Add a README file"
3. Klik **Create repository**.

### Langkah 3 — Unggah berkas

Cara termudah (tanpa git):

1. Di halaman repositori, klik **Add file** → **Upload files**.
2. Seret **semua berkas** dari folder ini (kecuali berkas `.gitignore` dan
   `README.md` ini bila tidak ingin ikut):
   - `index.html`
   - `styles.css`
   - `app-core.js`
   - `app-form.js`
   - `app-result.js`
   - `app-pages.js`
   - `app-student.js`
   - `app-profil.js`
   - `app-init.js`
   - folder `pratinjau-hp/` (opsional, hanya contoh tangkapan layar)
3. Di kotak pesan, tulis misalnya `Versi awal ADIK`.
4. Klik **Commit changes**.

> **Penting:** `index.html` harus berada di **paling atas** repositori,
> bukan di dalam subfolder. Kalau tidak, alamat web tidak akan terbuka.

### Langkah 4 — Nyalakan GitHub Pages

1. Di repositori, klik **Settings** (tab paling kanan).
2. Di menu kiri, klik **Pages**.
3. Pada **Source**, pilih **Deploy from a branch**.
4. Pada **Branch**, pilih **main** dan folder **/ (root)**.
5. Klik **Save**.
6. Tunggu 1–3 menit, lalu muat ulang halaman. Akan muncul alamat seperti:

   ```
   https://namapengguna.github.io/adik/
   ```

Itulah alamat aplikasi Anda. Bagikan alamat ini ke murid.

### Langkah 5 — Uji aplikasi

1. Buka alamat GitHub Pages di browser.
2. Masuk ke **Pengaturan API**, isi kunci API Gemini bila ingin memakai
   pembuatan soal otomatis.
3. Isi **Profil Murid**, buat asesmen, lalu bagikan tautan.

---

## Hosting alternatif (Netlify Drop)

Kalau ingin lebih cepat dan tidak mau memakai git:

1. Buka <https://app.netlify.com/drop>
2. Seret **folder** proyek ini ke halaman tersebut.
3. Netlify langsung memberi alamat `https://....netlify.app`.
4. Untuk mengganti nama alamat: **Site settings** → **Change site name**.

Kelebihan: HTTPS otomatis, tidak perlu git.
Kekurangan: setiap revisi harus menyeret folder ulang.

---

## Hal penting setelah hosting

**1. Materi asesmen tidak ikut terunggah.**
Asesmen guru disimpan di `localStorage` browser (di komputer guru), bukan di
berkas aplikasi. Setelah pindah ke hosting, daftar asesmen akan kosong dan
perlu dibuat lagi di sana.

**2. Satu tautan kelas sudah mandiri.**
Tautan yang dibagikan ke murid sudah memuat soal di dalamnya, sehingga murid
tidak perlu akses ke data guru. Aman dibagikan lewat grup kelas.

**3. Rekap Nilai butuh endpoint.**
Agar jawaban masuk ke Google Sheet, atur endpoint Apps Script di menu
**Rekap Nilai**, dan pastikan endpoint itu dibuka untuk publik
(**Deploy** → **Who has access** → **Anyone**).

**4. Perbarui aplikasi = unggah ulang.**
Bila ada revisi berkas, ulangi **Add file → Upload files** lalu commit.
GitHub Pages akan memperbarui otomatis dalam 1–2 menit.
Jangan lupa menekan **Ctrl+Shift+R** di browser agar berkas lama tidak
terpakai dari cache.

**5. Nama berkas huruf kecil.**
Server GitHub berjalan di Linux dan peka huruf besar-kecil. Semua nama
berkas pada proyek ini sudah huruf kecil, jadi jangan diubah menjadi
`App-Core.js` dan sejenisnya.

**6. Jangan simpan kunci API di berkas.**
Kunci API Gemini diisi lewat halaman **Pengaturan API** dan tersimpan di
browser, bukan di dalam kode. Jangan pernah menaruh kunci langsung di
berkas JS yang diunggah ke repositori publik.

---

## Daftar berkas

| Berkas | Isi |
|---|---|
| `index.html` | Kerangka halaman dan pemuatan skrip |
| `styles.css` | Seluruh tampilan aplikasi guru dan murid |
| `app-core.js` | Penyimpanan, status, dan fungsi dasar |
| `app-form.js` | Langkah 1–3 pembuatan asesmen dan panggilan Gemini |
| `app-result.js` | Pratinjau hasil, kisi-kisi, ekspor Word/Excel/PDF |
| `app-pages.js` | Halaman Riwayat, Bank Soal, Rekap, Pengaturan API |
| `app-student.js` | Halaman murid (Pesawat Tempur) dan pembagian tautan |
| `app-profil.js` | Profil Murid, angket, dan pemetaan soal |
| `app-init.js` | Router aksi tombol dan inisialisasi |
| `pratinjau-hp/` | Contoh tangkapan layar tampilan di ponsel |

---

## Catatan teknis

- Tanpa proses build: tidak ada `npm install`, tidak ada `dist/`.
- Pustaka pihak ketiga (jsPDF, html2canvas, mammoth, pdf.js) dimuat dari CDN,
  jadi aplikasi **butuh internet** untuk fitur impor/ekspor berkas.
- Kunci API Gemini disimpan di `localStorage` browser guru.
