<?php

namespace App\Services;

use App\Models\Book;
use App\Models\Borrow;
use Carbon\Carbon;

class BorrowService
{
    /**
     * Calculate late fee based on days overdue.
     * Rate: Rp 2,000 per day
     */
    public function calculateLateFee(Borrow $borrow): float
    {
        if ($borrow->status === 'RETURNED' && $borrow->return_date) {
            $returnDate = Carbon::parse($borrow->return_date);
        } else {
            $returnDate = Carbon::now();
        }

        $deadline = Carbon::parse($borrow->return_deadline);

        if ($returnDate->lessThanOrEqualTo($deadline)) {
            return 0;
        }

        $daysOverdue = $returnDate->diffInDays($deadline);
        return $daysOverdue * 2000; // Rp 2,000 per day
    }

    /**
     * Check if user has reached borrow limit (max 3 active borrows).
     */
    public function checkBorrowLimit(int $userId): bool
    {
        $activeBorrows = Borrow::where('user_id', $userId)
            ->where('status', 'BORROWED')
            ->count();

        return $activeBorrows < 3;
    }

    /**
     * Process book return.
     */
    public function processReturn(Borrow $borrow): Borrow
    {
        $borrow->return_date = Carbon::now();
        $borrow->status = 'RETURNED';
        $borrow->late_fee = $this->calculateLateFee($borrow);
        $borrow->save();

        // Increase book stock
        $book = $borrow->book;
        $book->stock += 1;
        $book->save();

        return $borrow;
    }

    /**
     * Create a new borrow.
     */
    public function createBorrow(int $userId, int $bookId): Borrow
    {
        $borrowDate = Carbon::now();
        $returnDeadline = $borrowDate->copy()->addDays(7);

        $borrow = Borrow::create([
            'user_id' => $userId,
            'book_id' => $bookId,
            'borrow_date' => $borrowDate,
            'return_deadline' => $returnDeadline,
            'status' => 'BORROWED',
            'late_fee' => 0,
        ]);

        // Decrease book stock
        $book = Book::findOrFail($bookId);
        $book->stock -= 1;
        $book->save();

        return $borrow;
    }
}
