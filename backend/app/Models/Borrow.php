<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Database\Factories\BorrowFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class Borrow extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'book_id',
        'borrow_date',
        'return_deadline',
        'return_date',
        'status',
        'late_fee',
        'admin_notes',
    ];

    protected $casts = [
        'borrow_date' => 'date',
        'return_deadline' => 'date',
        'return_date' => 'date',
        'late_fee' => 'decimal:2',
    ];

    /**
     * Get the user that made the borrow.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the book that was borrowed.
     */
    public function book()
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * Scope to filter by status.
     */
    public function scopeByStatus(Builder $query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter active borrows.
     */
    public function scopeActive(Builder $query)
    {
        return $query->where('status', 'BORROWED');
    }

    /**
     * Scope to filter by category.
     */
    public function scopeByCategory(Builder $query, $categoryId)
    {
        return $query->whereHas('book', function ($q) use ($categoryId) {
            $q->where('category_id', $categoryId);
        });
    }

    /**
     * Scope to search by book title or author.
     */
    public function scopeSearch(Builder $query, $keyword)
    {
        return $query->whereHas('book', function ($q) use ($keyword) {
            $q->where('title', 'like', "%{$keyword}%")
              ->orWhere('author', 'like', "%{$keyword}%");
        });
    }

    /**
     * Check if borrow is overdue.
     */
    public function isOverdue(): bool
    {
        if ($this->status === 'RETURNED') {
            return false;
        }

        return Carbon::now()->greaterThan($this->return_deadline);
    }

    /**
     * Calculate days overdue.
     */
    public function getDaysOverdueAttribute(): int
    {
        if (!$this->isOverdue()) {
            return 0;
        }

        return max(0, Carbon::now()->diffInDays($this->return_deadline));
    }

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory()
    {
        return BorrowFactory::new();
    }
}
