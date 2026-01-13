<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\BorrowController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AdminDashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Book routes
    Route::get('/books', [BookController::class, 'index']);
    Route::get('/books/{book}', [BookController::class, 'show']);
    Route::post('/books', [BookController::class, 'store'])->middleware('can:create,App\Models\Book');
    Route::put('/books/{book}', [BookController::class, 'update'])->middleware('can:update,book');
    Route::delete('/books/{book}', [BookController::class, 'destroy'])->middleware('can:delete,book');

    // Category routes
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    Route::post('/categories', [CategoryController::class, 'store'])->middleware('can:create,App\Models\Category');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->middleware('can:update,category');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->middleware('can:delete,category');

    // Borrow routes
    Route::get('/borrows', [BorrowController::class, 'index']);
    Route::get('/borrows/{borrow}', [BorrowController::class, 'show']);
    Route::post('/borrows', [BorrowController::class, 'store']);
    Route::post('/borrows/{borrow}/return', [BorrowController::class, 'return']);
    Route::put('/borrows/{borrow}/status', [BorrowController::class, 'updateStatus'])->middleware('can:updateStatus,borrow');

    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'dashboard']);
        Route::get('/export', [AdminDashboardController::class, 'exportTransactions']);
    });
});
