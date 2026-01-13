<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Database\Factories\BookFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Book extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'author',
        'year',
        'stock',
        'category_id',
        'cover_image',
    ];

    protected $casts = [
        'year' => 'integer',
        'stock' => 'integer',
    ];

    /**
     * Get the category that owns the book.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get all borrows for this book.
     */
    public function borrows()
    {
        return $this->hasMany(Borrow::class);
    }

    /**
     * Scope to filter by category.
     */
    public function scopeByCategory(Builder $query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Scope to search by keyword (title or author).
     */
    public function scopeSearch(Builder $query, $keyword)
    {
        return $query->where(function ($q) use ($keyword) {
            $q->where('title', 'like', "%{$keyword}%")
              ->orWhere('author', 'like', "%{$keyword}%");
        });
    }

    /**
     * Scope to filter available books (stock > 0).
     */
    public function scopeAvailable(Builder $query)
    {
        return $query->where('stock', '>', 0);
    }

    /**
     * Check if book is available.
     */
    public function isAvailable(): bool
    {
        return $this->stock > 0;
    }

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory()
    {
        return BookFactory::new();
    }
}
