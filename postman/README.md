# Postman Collection - Sistem Perpustakaan Mini

Folder ini berisi Postman Collection dan Environment untuk testing API Sistem Perpustakaan Mini.

## 📁 Files

| File | Deskripsi |
|------|-----------|
| `Sistem_Perpustakaan_Mini.postman_collection.json` | Collection lengkap semua API endpoints |
| `Perpustakaan_Mini.postman_environment.json` | Environment variables untuk local development |

## 🚀 Cara Import ke Postman

### 1. Import Collection
1. Buka Postman
2. Klik **Import** (atau Ctrl+O)
3. Pilih file `Sistem_Perpustakaan_Mini.postman_collection.json`
4. Klik **Import**

### 2. Import Environment
1. Klik **Import** lagi
2. Pilih file `Perpustakaan_Mini.postman_environment.json`
3. Klik **Import**

### 3. Pilih Environment
1. Di pojok kanan atas Postman, klik dropdown environment
2. Pilih **"Perpustakaan Mini - Local"**

## 📋 Struktur Collection

```
Sistem Perpustakaan Mini
├── Authentication
│   ├── Register User
│   ├── Login as Admin          ⭐ Jalankan ini untuk test admin
│   ├── Login as User           ⭐ Jalankan ini untuk test user
│   ├── Login - Invalid Credentials
│   ├── Get Current User
│   ├── Update Profile
│   └── Logout
│
├── Books
│   ├── Get All Books
│   ├── Get Books with Filter
│   ├── Get Book Detail
│   ├── Create Book (Admin Only)
│   ├── Create Book - Validation Error
│   ├── Update Book (Admin Only)
│   └── Delete Book (Admin Only)
│
├── Categories
│   ├── Get All Categories
│   ├── Create Category (Admin Only)
│   ├── Update Category (Admin Only)
│   └── Delete Category (Admin Only)
│
├── Borrows
│   ├── Get My Borrows
│   ├── Get Borrows with Filter
│   ├── Get Borrow Detail
│   ├── Borrow Book              ⭐ Test peminjaman
│   ├── Borrow Book - Stock Zero (Should Fail)
│   ├── Return Book
│   ├── Return Book - Other User (Should Fail)
│   └── Update Borrow Status (Admin Only)
│
├── Admin Dashboard
│   ├── Get Dashboard Statistics
│   ├── Export Transactions CSV
│   └── Export Transactions CSV with Filter
│
└── Policy Tests                 🔒 Test Authorization
    ├── User Cannot Access Other User Borrow
    ├── User Cannot Create Book (Admin Only)
    ├── User Cannot Delete Book (Admin Only)
    └── User Cannot Access Admin Dashboard
```

## ✅ Cara Testing

### Test sebagai Admin
1. Jalankan **"Login as Admin"** - token otomatis tersimpan
2. Jalankan request apapun di folder Books, Categories, Admin Dashboard

### Test sebagai User
1. Jalankan **"Login as User"** - token otomatis tersimpan
2. Jalankan request di folder Borrows
3. Coba request di folder **Policy Tests** untuk melihat authorization bekerja

### Test Alur Peminjaman
1. Login as User
2. **Get All Books** - lihat daftar buku
3. **Borrow Book** - pinjam buku (ubah `book_id` sesuai kebutuhan)
4. **Get My Borrows** - lihat daftar pinjaman
5. **Return Book** - kembalikan buku

### Test Validasi
1. **Create Book - Validation Error** - test validasi input
2. **Borrow Book - Stock Zero** - test tidak bisa pinjam jika stock habis
3. **Login - Invalid Credentials** - test kredensial salah

### Test Policy/Authorization
1. Login as User (bukan Admin)
2. Jalankan semua request di folder **"Policy Tests"**
3. Semua request harus mengembalikan **403 Forbidden**

## 🔧 Environment Variables

| Variable | Deskripsi |
|----------|-----------|
| `base_url` | URL API backend (default: `http://localhost:8000/api`) |
| `auth_token` | Token autentikasi (otomatis diisi setelah login) |
| `created_book_id` | ID buku yang baru dibuat (untuk delete) |
| `created_category_id` | ID kategori yang baru dibuat (untuk delete) |
| `created_borrow_id` | ID peminjaman yang baru dibuat (untuk return) |

## 📝 Test Scripts

Setiap request sudah dilengkapi dengan test scripts yang akan:
- Memeriksa status code response
- Memvalidasi struktur response
- Menyimpan ID ke environment variable (untuk request berikutnya)
- Menyimpan token otomatis setelah login

## 🎯 Tips

1. **Selalu login terlebih dahulu** sebelum menggunakan request lain
2. **Token otomatis tersimpan** di environment setelah login
3. **Logout akan menghapus token** dari environment
4. **Gunakan filter** di request untuk testing berbagai skenario
5. **Jalankan Policy Tests** sebagai user biasa untuk test authorization

## 📊 Test Results

Setelah menjalankan request, cek tab **"Test Results"** di bagian bawah Postman untuk melihat hasil test otomatis.

## 🔗 Akun Demo

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@library.com | password |
| User | user1@library.com | password |
| User | user2@library.com | password |
