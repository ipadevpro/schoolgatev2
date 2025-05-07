# SchoolGate - School Permission Management System

SchoolGate adalah sistem manajemen perizinan sekolah yang memudahkan proses pengajuan dan persetujuan izin keluar sekolah, serta pengelolaan poin pelanggaran siswa.

## Fitur

### Role Guru:
- Dashboard dengan statistik siswa yang terlambat
- Manajemen siswa (CRUD)
- Manajemen perizinan (menyetujui/menolak izin keluar siswa)
- Manajemen poin tata tertib siswa

### Role Siswa:
- Dashboard dengan statistik pribadi
- Pengajuan izin keluar sekolah
- Melihat catatan keterlambatan
- Melihat catatan pelanggaran

## Teknologi

- **Frontend**: HTML, JavaScript, CSS dengan Tailwind CSS
- **Backend**: Google Apps Script (GAS)
- **Database**: Google Sheets
- **Hosting**: GitHub Pages

## Struktur File

```
├── code.gs                 # Google Apps Script backend
├── index.html              # Landing page/Login page
├── dashboardguru.html      # Dashboard untuk guru
├── dashboard-siswa.html    # Dashboard untuk siswa
├── perizinan.html          # Halaman manajemen perizinan (guru)
├── izin-siswa.html         # Halaman pengajuan izin (siswa)
├── siswa.html              # Halaman manajemen siswa (guru)
├── poin-pelanggaran.html   # Halaman manajemen poin (guru)
├── poin-siswa.html         # Halaman catatan poin (siswa)
├── js/
│   └── services.js         # Layanan untuk manajemen data dan API
└── README.md               # Dokumentasi
```

## Cara Setup

### 1. Setup Google Apps Script

1. Buka [Google Apps Script](https://script.google.com/)
2. Buat project baru
3. Copy-paste file `code.gs` ke Script Editor
4. Klik menu "Deploy" > "New deployment"
5. Pilih "Web app"
6. Pada "Execute as", pilih "Me"
7. Pada "Who has access", pilih "Anyone"
8. Klik "Deploy"
9. Salin Web App URL yang muncul (akan digunakan di frontend)

### 2. Setup Google Sheets

1. Google Apps Script akan membuat dan menginisialisasi Google Sheets saat pertama kali diakses
2. Spreadsheet akan dibuat dengan struktur berikut:
   - Teachers (data guru)
   - Students (data siswa)
   - Attendance (kehadiran)
   - Permissions (perizinan)
   - DisciplinePoints (poin pelanggaran)
   - ViolationTypes (jenis pelanggaran)
   - Classes (kelas)
   - Settings (pengaturan)

### 3. Setup Frontend

1. Clone repository ini
2. Edit file `js/api.js` dan ganti `YOUR_SCRIPT_ID_HERE` dengan URL Web App Google Apps Script Anda
3. Deploy ke GitHub Pages atau hosting web lainnya

## Panduan Penggunaan

### Login Sebagai Guru
- Username: admin
- Password: admin123

### Login Sebagai Siswa
- Buat siswa terlebih dahulu melalui akun guru
- Gunakan username dan password yang dibuat

## Teknik Bypass CORS

Aplikasi ini menggunakan teknik khusus untuk menghindari masalah CORS saat berkomunikasi dengan Google Apps Script, dengan:

1. Menggunakan fetch POST sederhana dengan body tipe "application/x-www-form-urlencoded"
2. Tidak menggunakan header kustom atau Content-Type JSON yang akan memicu preflight request OPTIONS
3. Mengakses parameter di server melalui `e.parameter` bukan `e.postData.contents`

## Pengembangan Lebih Lanjut

Berikut beberapa ide untuk pengembangan lebih lanjut:
- Implementasi autentikasi yang lebih aman (JWT)
- Fitur upload bukti izin (foto surat dokter, dll)
- Notifikasi email/WhatsApp untuk guru saat ada permintaan izin baru
- Laporan perizinan dan pelanggaran bulanan/semesteran
- Integrasi dengan sistem absensi otomatis

## Kontribusi

Kontribusi selalu diterima. Untuk berkontribusi:
1. Fork repository
2. Buat branch fitur baru (`git checkout -b feature/fitur-baru`)
3. Commit perubahan (`git commit -am 'Menambahkan fitur baru'`)
4. Push ke branch (`git push origin feature/fitur-baru`)
5. Buat Pull Request

## Lisensi

[MIT License](LICENSE) 