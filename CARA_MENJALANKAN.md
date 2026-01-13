# Cara Menjalankan Sistem Perpustakaan Mini

## Persiapan

Pastikan sudah terinstall:
- PHP >= 8.1
- Composer
- Node.js >= 18.x
- MySQL
- Laragon

## Langkah 1: Setup Database

1. Buka phpMyAdmin atau MySQL client
2. Buat database baru:
   ```sql
   CREATE DATABASE library_db;
   ```

## Langkah 2: Setup Backend (Laravel)

1. Buka terminal/command prompt, masuk ke folder backend:
   ```bash
   cd C:\laragon\www\web\backend
   ```

2. Install dependencies:
   ```bash
   composer install
   ```

3. Copy file .env:
   ```bash
   copy .env.example .env
   ```

4. Edit file `.env` dan sesuaikan konfigurasi database:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=library_db
   DB_USERNAME=root
   DB_PASSWORD=
   ```

5. Generate application key:
   ```bash
   php artisan key:generate
   ```

6. Jalankan migrations dan seeders:
   ```bash
   php artisan migrate --seed
   ```
   
   Atau secara terpisah:
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

7. Buat symbolic link untuk storage (untuk upload cover buku):
   ```bash
   php artisan storage:link
   ```

8. Jalankan server Laravel:
   ```bash
   php artisan serve
   ```
   
   Backend akan berjalan di: **http://localhost:8000**

## Langkah 3: Setup Frontend (Next.js)

1. Buka terminal baru (biarkan backend tetap jalan), masuk ke folder frontend:
   ```bash
   cd C:\laragon\www\web\frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Buat file `.env.local`:
   ```bash
   copy .env.example .env.local
   ```

4. Pastikan file `.env.local` berisi:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

5. Jalankan development server:
   ```bash
   npm run dev
   ```
   
   Frontend akan berjalan di: **http://localhost:3000**

## Langkah 4: Akses Aplikasi

1. Buka browser dan akses: **http://localhost:3000**

2. Login dengan akun demo berikut:

### Akun Demo

| Role  | Email             | Password |
| ----- | ----------------- | -------- |
| Admin | admin@library.com | password |
| User  | user1@library.com | password |
| User  | user2@library.com | password |

## Data Dummy

Setelah menjalankan seeder, database akan berisi:
- **3 Akun**: 1 Admin + 2 User
- **6 Kategori**: Fiction, Non-Fiction, Science, Technology, History, Biography
- **33 Buku**: Termasuk 10 buku terbitan Indonesia (Laskar Pelangi, Bumi Manusia, dll)
- **Beberapa Transaksi Peminjaman** sample

## Troubleshooting

### Backend tidak bisa connect ke database
- Pastikan MySQL service berjalan di Laragon
- Cek username dan password di `.env`
- Pastikan database `library_db` sudah dibuat

### Frontend tidak bisa connect ke API
- Pastikan backend Laravel sudah berjalan di port 8000
- Cek file `.env.local` di frontend, pastikan `NEXT_PUBLIC_API_URL` benar
- Cek CORS di Laravel (sudah dikonfigurasi untuk localhost)

### Error storage link
- Pastikan folder `storage/app/public` ada
- Jalankan: `php artisan storage:link` lagi

### Cover buku tidak muncul
- Pastikan `php artisan storage:link` sudah dijalankan
- Periksa folder `storage/app/public/book-covers` sudah ada

### Port sudah digunakan
- Backend: ubah port dengan `php artisan serve --port=8001`
- Frontend: Next.js akan otomatis menggunakan port lain jika 3000 sudah digunakan

## Testing

### PHPUnit (Backend)

Jalankan semua PHPUnit tests:
```bash
cd backend
php artisan test
```

Jalankan test spesifik (BorrowTest):
```bash
php artisan test --filter BorrowTest
```

### Daftar Test yang Tersedia (9 Test Cases)

| No  | Test Name                                     | Deskripsi                                       |
| --- | --------------------------------------------- | ----------------------------------------------- |
| 1   | `test_user_can_borrow_book`                   | User dapat meminjam buku                        |
| 2   | `test_user_cannot_borrow_more_than_3_books`   | Batas maksimal 3 buku aktif per user            |
| 3   | `test_user_cannot_borrow_when_stock_is_zero`  | ❌ Tidak bisa pinjam jika stock = 0              |
| 4   | `test_return_increases_book_stock`            | Return buku menambah stock                      |
| 5   | `test_late_fee_calculation`                   | Perhitungan denda keterlambatan (Rp 2.000/hari) |
| 6   | `test_late_fee_is_zero_when_returned_on_time` | Tidak ada denda jika tepat waktu                |
| 7   | `test_user_cannot_access_other_users_borrow`  | 🔒 User tidak bisa akses data user lain (Policy) |
| 8   | `test_user_cannot_return_other_users_borrow`  | 🔒 User tidak bisa return pinjaman user lain     |
| 9   | `test_user_can_only_see_own_borrows_in_list`  | 🔒 User hanya melihat daftar pinjaman sendiri    |

### Contoh Output Test:
```
   PASS  Tests\Feature\BorrowTest
  ✓ user can borrow book
  ✓ user cannot borrow more than 3 books
  ✓ user cannot borrow when stock is zero
  ✓ return increases book stock
  ✓ late fee calculation
  ✓ late fee is zero when returned on time
  ✓ user cannot access other users borrow
  ✓ user cannot return other users borrow
  ✓ user can only see own borrows in list

  Tests:    9 passed (38 assertions)
```

### Postman Collection (API Testing)

File Postman tersedia di folder `postman/`:

| File                                               | Deskripsi                          |
| -------------------------------------------------- | ---------------------------------- |
| `Sistem_Perpustakaan_Mini.postman_collection.json` | Collection lengkap semua endpoints |
| `Perpustakaan_Mini.postman_environment.json`       | Environment variables              |
| `README.md`                                        | Panduan penggunaan Postman         |

#### Cara Import ke Postman:
1. Buka Postman → **Import** (Ctrl+O)
2. Import kedua file JSON
3. Pilih environment **"Perpustakaan Mini - Local"**
4. Jalankan **"Login as Admin"** atau **"Login as User"**
5. Token otomatis tersimpan, gunakan request lainnya

#### Struktur Collection:
- **Authentication**: Register, Login, Logout, Profile
- **Books**: CRUD buku (Admin)
- **Categories**: CRUD kategori (Admin)
- **Borrows**: Peminjaman & Pengembalian
- **Admin Dashboard**: Statistik & Export CSV
- **Policy Tests**: Test authorization

## Struktur Command yang Perlu Dijalankan

**Terminal 1 (Backend):**
```bash
cd C:\laragon\www\web\backend
php artisan serve
```

**Terminal 2 (Frontend):**
```bash
cd C:\laragon\www\web\frontend
npm run dev
```

> ⚠️ **Penting**: Kedua terminal harus tetap berjalan agar aplikasi dapat digunakan.

## Reset Database

Jika ingin reset database dan mengisi ulang data dummy:
```bash
cd backend
php artisan migrate:fresh --seed
```
