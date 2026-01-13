<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\Borrow;
use App\Models\Category;
use App\Models\User;
use App\Services\BorrowService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class BorrowTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $book;
    protected $category;
    protected $borrowService;

    protected function setUp(): void
    {
        parent::setUp();

        $this->category = Category::factory()->create([
            'name' => 'Fiction',
            'slug' => 'fiction',
        ]);

        $this->book = Book::factory()->create([
            'title' => 'Test Book',
            'author' => 'Test Author',
            'year' => 2020,
            'stock' => 5,
            'category_id' => $this->category->id,
        ]);

        $this->user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
        ]);

        $this->borrowService = new BorrowService();
    }

    /**
     * Test user can borrow a book.
     */
    public function test_user_can_borrow_book(): void
    {
        $this->actingAs($this->user, 'sanctum');

        $initialStock = $this->book->stock;

        $response = $this->postJson('/api/borrows', [
            'book_id' => $this->book->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'borrow' => [
                    'id',
                    'user_id',
                    'book_id',
                    'borrow_date',
                    'return_deadline',
                    'status',
                ],
            ]);

        // Check that stock decreased
        $this->book->refresh();
        $this->assertEquals($initialStock - 1, $this->book->stock);

        // Check that borrow was created
        $this->assertDatabaseHas('borrows', [
            'user_id' => $this->user->id,
            'book_id' => $this->book->id,
            'status' => 'BORROWED',
        ]);
    }

    /**
     * Test borrow limit (max 3 active borrows).
     */
    public function test_user_cannot_borrow_more_than_3_books(): void
    {
        $this->actingAs($this->user, 'sanctum');

        // Create 3 active borrows
        for ($i = 0; $i < 3; $i++) {
            $book = Book::factory()->create([
                'category_id' => $this->category->id,
                'stock' => 5,
            ]);

            Borrow::factory()->create([
                'user_id' => $this->user->id,
                'book_id' => $book->id,
                'status' => 'BORROWED',
            ]);
        }

        // Try to borrow 4th book
        $response = $this->postJson('/api/borrows', [
            'book_id' => $this->book->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['book_id']);

        // Check that borrow was not created
        $this->assertDatabaseMissing('borrows', [
            'user_id' => $this->user->id,
            'book_id' => $this->book->id,
        ]);
    }

    /**
     * Test cannot borrow when stock = 0.
     */
    public function test_user_cannot_borrow_when_stock_is_zero(): void
    {
        $this->actingAs($this->user, 'sanctum');

        // Set book stock to 0
        $this->book->stock = 0;
        $this->book->save();

        $response = $this->postJson('/api/borrows', [
            'book_id' => $this->book->id,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['book_id']);

        // Check that borrow was not created
        $this->assertDatabaseMissing('borrows', [
            'user_id' => $this->user->id,
            'book_id' => $this->book->id,
        ]);
    }

    /**
     * Test return increases stock.
     */
    public function test_return_increases_book_stock(): void
    {
        $this->actingAs($this->user, 'sanctum');

        // Create a borrow
        $borrow = Borrow::factory()->create([
            'user_id' => $this->user->id,
            'book_id' => $this->book->id,
            'status' => 'BORROWED',
        ]);

        $initialStock = $this->book->stock;

        // Return the book
        $response = $this->postJson("/api/borrows/{$borrow->id}/return");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'borrow' => [
                    'id',
                    'status',
                    'return_date',
                ],
            ]);

        // Check that stock increased
        $this->book->refresh();
        $this->assertEquals($initialStock + 1, $this->book->stock);

        // Check that borrow status is RETURNED
        $borrow->refresh();
        $this->assertEquals('RETURNED', $borrow->status);
        $this->assertNotNull($borrow->return_date);
    }

    /**
     * Test late fee calculation.
     */
    public function test_late_fee_calculation(): void
    {
        $this->actingAs($this->user, 'sanctum');

        // Create a borrow that is overdue
        $borrowDate = Carbon::now()->subDays(10);
        $returnDeadline = $borrowDate->copy()->addDays(7); // 3 days overdue

        $borrow = Borrow::factory()->create([
            'user_id' => $this->user->id,
            'book_id' => $this->book->id,
            'borrow_date' => $borrowDate,
            'return_deadline' => $returnDeadline,
            'status' => 'BORROWED',
            'late_fee' => 0,
        ]);

        // Return the book (should calculate late fee)
        $response = $this->postJson("/api/borrows/{$borrow->id}/return");

        $response->assertStatus(200);

        // Check that late fee was calculated (3 days * Rp 2,000 = Rp 6,000)
        $borrow->refresh();
        $expectedFee = 3 * 2000; // 6000
        $this->assertEquals($expectedFee, $borrow->late_fee);
    }

    /**
     * Test late fee is zero when returned on time.
     */
    public function test_late_fee_is_zero_when_returned_on_time(): void
    {
        $this->actingAs($this->user, 'sanctum');

        // Create a borrow that is not overdue
        $borrowDate = Carbon::now()->subDays(3);
        $returnDeadline = $borrowDate->copy()->addDays(7); // Still 4 days left

        $borrow = Borrow::factory()->create([
            'user_id' => $this->user->id,
            'book_id' => $this->book->id,
            'borrow_date' => $borrowDate,
            'return_deadline' => $returnDeadline,
            'status' => 'BORROWED',
            'late_fee' => 0,
        ]);

        // Return the book
        $response = $this->postJson("/api/borrows/{$borrow->id}/return");

        $response->assertStatus(200);

        // Check that late fee is zero
        $borrow->refresh();
        $this->assertEquals(0, $borrow->late_fee);
    }

    /**
     * Test user cannot access other user's borrow data (Policy).
     */
    public function test_user_cannot_access_other_users_borrow(): void
    {
        // Create another user
        $otherUser = User::factory()->create([
            'name' => 'Other User',
            'email' => 'other@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
        ]);

        // Create a borrow for the other user
        $otherUserBorrow = Borrow::factory()->create([
            'user_id' => $otherUser->id,
            'book_id' => $this->book->id,
            'status' => 'BORROWED',
        ]);

        // Login as the first user
        $this->actingAs($this->user, 'sanctum');

        // Try to view other user's borrow detail
        $response = $this->getJson("/api/borrows/{$otherUserBorrow->id}");

        // Should be forbidden (403)
        $response->assertStatus(403);
    }

    /**
     * Test user cannot return other user's borrowed book (Policy).
     */
    public function test_user_cannot_return_other_users_borrow(): void
    {
        // Create another user
        $otherUser = User::factory()->create([
            'name' => 'Other User',
            'email' => 'other2@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
        ]);

        // Create a borrow for the other user
        $otherUserBorrow = Borrow::factory()->create([
            'user_id' => $otherUser->id,
            'book_id' => $this->book->id,
            'status' => 'BORROWED',
        ]);

        // Login as the first user
        $this->actingAs($this->user, 'sanctum');

        // Try to return other user's borrow
        $response = $this->postJson("/api/borrows/{$otherUserBorrow->id}/return");

        // Should be forbidden (403)
        $response->assertStatus(403);

        // Verify the borrow status is still BORROWED
        $otherUserBorrow->refresh();
        $this->assertEquals('BORROWED', $otherUserBorrow->status);
    }

    /**
     * Test user can only see their own borrows in list.
     */
    public function test_user_can_only_see_own_borrows_in_list(): void
    {
        // Create another user
        $otherUser = User::factory()->create([
            'name' => 'Other User',
            'email' => 'other3@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
        ]);

        // Create borrow for current user
        $myBorrow = Borrow::factory()->create([
            'user_id' => $this->user->id,
            'book_id' => $this->book->id,
            'status' => 'BORROWED',
        ]);

        // Create another book for other user's borrow
        $anotherBook = Book::factory()->create([
            'category_id' => $this->category->id,
            'stock' => 5,
        ]);

        // Create borrow for other user
        $otherBorrow = Borrow::factory()->create([
            'user_id' => $otherUser->id,
            'book_id' => $anotherBook->id,
            'status' => 'BORROWED',
        ]);

        // Login as the first user
        $this->actingAs($this->user, 'sanctum');

        // Get borrows list
        $response = $this->getJson('/api/borrows');

        $response->assertStatus(200);

        // Get the borrow IDs from response
        $borrowIds = collect($response->json('data'))->pluck('id')->toArray();

        // Should contain own borrow
        $this->assertContains($myBorrow->id, $borrowIds);

        // Should NOT contain other user's borrow
        $this->assertNotContains($otherBorrow->id, $borrowIds);
    }
}
