<?php

namespace Database\Seeders;

use App\Models\Borrow;
use App\Models\Book;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class BorrowSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::where('role', 'user')->get();
        $books = Book::all();

        if ($users->isEmpty() || $books->isEmpty()) {
            return;
        }

        // Create some active borrows
        for ($i = 0; $i < 5; $i++) {
            $user = $users->random();
            $book = $books->random();

            // Check if user already has 3 active borrows
            $activeBorrows = Borrow::where('user_id', $user->id)
                ->where('status', 'BORROWED')
                ->count();

            if ($activeBorrows < 3 && $book->stock > 0) {
                $borrowDate = Carbon::now()->subDays(rand(1, 5));
                $returnDeadline = $borrowDate->copy()->addDays(7);

                Borrow::create([
                    'user_id' => $user->id,
                    'book_id' => $book->id,
                    'borrow_date' => $borrowDate,
                    'return_deadline' => $returnDeadline,
                    'status' => 'BORROWED',
                    'late_fee' => 0,
                ]);

                // Decrease book stock
                $book->stock -= 1;
                $book->save();
            }
        }

        // Create some returned borrows
        for ($i = 0; $i < 10; $i++) {
            $user = $users->random();
            $book = $books->random();

            $borrowDate = Carbon::now()->subDays(rand(10, 30));
            $returnDeadline = $borrowDate->copy()->addDays(7);
            $returnDate = $borrowDate->copy()->addDays(rand(5, 12));

            $daysOverdue = max(0, $returnDate->diffInDays($returnDeadline, false));
            $lateFee = $daysOverdue > 0 ? $daysOverdue * 2000 : 0;

            Borrow::create([
                'user_id' => $user->id,
                'book_id' => $book->id,
                'borrow_date' => $borrowDate,
                'return_deadline' => $returnDeadline,
                'return_date' => $returnDate,
                'status' => 'RETURNED',
                'late_fee' => $lateFee,
            ]);
        }
    }
}
