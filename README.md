# Sistem Perpustakaan Mini

Sistem manajemen perpustakaan sederhana dengan fitur pengelolaan buku dan peminjaman. Dibangun dengan Laravel 10 (Backend API) dan Next.js 14+ (Frontend).

## 📚 Tech Stack

### Backend
- **Laravel 10.x** - PHP Framework
- **MySQL** - Database
- **Laravel Sanctum** - API Authentication
- **PHPUnit** - Testing

### Frontend
- **Next.js 14+** - React Framework dengan App Router
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP Client
- **React Hook Form** - Form Management
- **Zustand** - State Management
- **Lucide React** - Icon Library

## ✨ Fitur

### Fitur Utama
1. **Authentication**
   - Login & Register dengan UI modern
   - Role-based access (User & Admin)
   - Edit Profile

2. **Manajemen Buku (Admin)**
   - CRUD Buku (Create, Read, Update, Delete)
   - Upload cover image
   - Validasi: stock >= 0, title min 3 karakter
   - Filter berdasarkan kategori dan keyword

3. **Peminjaman Buku (User)**
   - Lihat daftar buku & detail
   - Peminjaman buku:
     - borrow_date otomatis (hari ini)
     - return_deadline = +7 hari
   - Aturan:
     - Tidak bisa pinjam jika stock = 0
     - Maksimal 3 buku aktif per user

4. **Pengembalian (User/Admin)**
   - Return buku → status menjadi RETURNED
   - Stock buku bertambah otomatis
   - Perhitungan denda otomatis

5. **Admin Dashboard**
   - Statistik perpustakaan
   - List semua transaksi pinjam
   - Filter: status (BORROWED/RETURNED), category, keyword
   - Admin bisa ubah status transaksi

### Fitur Bonus
- **Denda Keterlambatan**: Rp 2.000/hari (otomatis dihitung)
- **Export Transaksi ke CSV**: Admin bisa export data transaksi
- **Toast Notifications**: Notifikasi modern untuk semua aksi
- **Konfirmasi Modal**: Dialog konfirmasi untuk aksi penting

## 📋 Requirements

- PHP >= 8.1
- Composer
- Node.js >= 18.x
- npm
- MySQL >= 5.7
- Laragon (untuk Windows)

## 🚀 Installation

### 1. Clone/Download Project

### 2. Setup Backend (Laravel)

```bash
# Masuk ke direktori backend
cd backend

# Install dependencies
composer install

# Copy file environment
copy .env.example .env    # Windows
cp .env.example .env      # Linux/Mac

# Generate application key
php artisan key:generate

# Konfigurasi database di .env
# DB_DATABASE=library_db
# DB_USERNAME=root
# DB_PASSWORD=

# Jalankan migrations dan seeders
php artisan migrate --seed

# Buat symbolic link untuk storage
php artisan storage:link

# Jalankan server
php artisan serve
```

Backend akan berjalan di `http://localhost:8000`

### 3. Setup Frontend (Next.js)

```bash
# Masuk ke direktori frontend
cd frontend

# Install dependencies
npm install

# Copy file environment
copy .env.example .env.local    # Windows
cp .env.example .env.local      # Linux/Mac

# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## 👤 Akun Demo

Setelah menjalankan seeders, akun berikut tersedia:

| Role  | Email             | Password |
| ----- | ----------------- | -------- |
| Admin | admin@library.com | password |
| User  | user1@library.com | password |
| User  | user2@library.com | password |

## 📖 Data Dummy

Seeder akan mengisi database dengan:
- **3 Akun**: 1 Admin + 2 User
- **6 Kategori**: Fiction, Non-Fiction, Science, Technology, History, Biography
- **33 Buku**: Termasuk 10 buku terbitan Indonesia:
  - Laskar Pelangi (Andrea Hirata)
  - Bumi Manusia (Pramoedya Ananta Toer)
  - Negeri 5 Menara (Ahmad Fuadi)
  - Ayat-Ayat Cinta (Habiburrahman El Shirazy)
  - Perahu Kertas (Dee Lestari)
  - Filosofi Teras (Henry Manampiring)
  - Dan lainnya...
- **Beberapa transaksi peminjaman** sample

## 🧪 Testing

### Jalankan Semua Tests
```bash
cd backend
php artisan test
```

### Jalankan Test Spesifik
```bash
php artisan test --filter BorrowTest
```

### Daftar Test Cases (BorrowTest - 9 Tests)

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

### Contoh Output Test
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

Import Postman collection dari folder `postman/`:

```bash
postman/
├── Sistem_Perpustakaan_Mini.postman_collection.json  # Collection
├── Perpustakaan_Mini.postman_environment.json        # Environment
└── README.md                                          # Panduan
```

**Cara Import:**
1. Buka Postman → Import (Ctrl+O)
2. Import kedua file JSON
3. Pilih environment "Perpustakaan Mini - Local"
4. Jalankan "Login as Admin" atau "Login as User" terlebih dahulu

**Test Cases di Postman:**
- Authentication (Register, Login, Logout, Profile)
- Books CRUD (Create, Read, Update, Delete)
- Categories CRUD
- Borrows (Pinjam, Kembalikan, Status)
- Admin Dashboard (Statistics, Export CSV)
- Policy Tests (Authorization checks)

## 🔌 API Endpoints

### Authentication
| Method | Endpoint        | Deskripsi          |
| ------ | --------------- | ------------------ |
| POST   | `/api/register` | Register user baru |
| POST   | `/api/login`    | Login              |
| POST   | `/api/logout`   | Logout             |
| GET    | `/api/me`       | Get current user   |
| PUT    | `/api/profile`  | Update profile     |

### Books
| Method | Endpoint          | Deskripsi                  |
| ------ | ----------------- | -------------------------- |
| GET    | `/api/books`      | List books (dengan filter) |
| GET    | `/api/books/{id}` | Get book detail            |
| POST   | `/api/books`      | Create book (Admin)        |
| PUT    | `/api/books/{id}` | Update book (Admin)        |
| DELETE | `/api/books/{id}` | Delete book (Admin)        |

### Categories
| Method | Endpoint               | Deskripsi               |
| ------ | ---------------------- | ----------------------- |
| GET    | `/api/categories`      | List categories         |
| POST   | `/api/categories`      | Create category (Admin) |
| PUT    | `/api/categories/{id}` | Update category (Admin) |
| DELETE | `/api/categories/{id}` | Delete category (Admin) |

### Borrows
| Method | Endpoint                   | Deskripsi             |
| ------ | -------------------------- | --------------------- |
| GET    | `/api/borrows`             | List borrows          |
| GET    | `/api/borrows/{id}`        | Get borrow detail     |
| POST   | `/api/borrows`             | Create borrow         |
| POST   | `/api/borrows/{id}/return` | Return book           |
| PUT    | `/api/borrows/{id}/status` | Update status (Admin) |

### Admin
| Method | Endpoint               | Deskripsi               |
| ------ | ---------------------- | ----------------------- |
| GET    | `/api/admin/dashboard` | Dashboard statistics    |
| GET    | `/api/admin/export`    | Export transactions CSV |

## 📁 Project Structure

```
web/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   └── Requests/
│   │   ├── Models/
│   │   ├── Policies/
│   │   └── Services/
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── factories/
│   ├── tests/Feature/
│   └── routes/api.php
│
├── frontend/                   # Next.js App
│   ├── app/
│   │   ├── (auth)/            # Login, Register
│   │   └── (protected)/       # Protected pages
│   │       ├── admin/         # Admin pages
│   │       ├── books/         # Book pages
│   │       ├── borrows/       # Borrow pages
│   │       └── profile/       # Profile page
│   ├── components/
│   │   ├── Layout.tsx
│   │   └── Toast.tsx
│   └── lib/
│       ├── api.ts
│       └── store.ts
│
├── postman/                    # Postman Collection
│   ├── Sistem_Perpustakaan_Mini.postman_collection.json
│   ├── Perpustakaan_Mini.postman_environment.json
│   └── README.md
│
├── README.md
└── CARA_JALANKAN.md
```

## 🔧 Technical Implementation

### Form Request Validation
- `BookStoreRequest` - Validasi create book
- `BookUpdateRequest` - Validasi update book
- `BorrowStoreRequest` - Validasi borrow dengan custom rules
- `ProfileUpdateRequest` - Validasi update profile

### Policy/Gate Authorization
- `BookPolicy` - Authorization untuk book operations
- `BorrowPolicy` - Authorization untuk borrow operations
- `CategoryPolicy` - Authorization untuk category operations

### Eloquent Relationships
- User `hasMany` Borrows
- Category `hasMany` Books
- Book `belongsTo` Category, `hasMany` Borrows
- Borrow `belongsTo` User, `belongsTo` Book

### File Upload
- Book cover images disimpan di `storage/app/public/book-covers`
- Menggunakan Laravel Storage facade

### Services
- `BorrowService` - Business logic untuk peminjaman & denda
- `ExportService` - Export data ke CSV
## 👥 **Tim Pengembang**

- **Nama Amrosi** - NIM: 2402310187
- **Nama Muhammad Ali Ridho** - NIM: 2402310177
- **Nama Hendra Efendi** - NIM: 2402310209
