<?php

namespace Database\Factories;

use App\Models\Borrow;
use App\Models\Book;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Borrow>
 */
class BorrowFactory extends Factory
{
    protected $model = Borrow::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $borrowDate = Carbon::now()->subDays(fake()->numberBetween(1, 10));
        $returnDeadline = $borrowDate->copy()->addDays(7);

        return [
            'user_id' => User::factory(),
            'book_id' => Book::factory(),
            'borrow_date' => $borrowDate,
            'return_deadline' => $returnDeadline,
            'return_date' => null,
            'status' => 'BORROWED',
            'late_fee' => 0,
            'admin_notes' => null,
        ];
    }

    /**
     * Indicate that the borrow is returned.
     */
    public function returned(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'RETURNED',
            'return_date' => Carbon::parse($attributes['return_deadline'])->addDays(fake()->numberBetween(-2, 3)),
            'late_fee' => 0,
        ]);
    }
}
