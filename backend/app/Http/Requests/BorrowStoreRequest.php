<?php

namespace App\Http\Requests;

use App\Models\Book;
use App\Models\Borrow;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class BorrowStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'book_id' => ['required', 'exists:books,id'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            $book = Book::find($this->book_id);
            $user = $this->user();

            if (!$book) {
                return;
            }

            // Check if book has stock
            if ($book->stock <= 0) {
                $validator->errors()->add('book_id', 'Buku tidak tersedia. Stok habis.');
            }

            // Check if user has less than 3 active borrows
            $activeBorrows = Borrow::where('user_id', $user->id)
                ->where('status', 'BORROWED')
                ->count();

            if ($activeBorrows >= 3) {
                $validator->errors()->add('book_id', 'Anda sudah meminjam 3 buku. Kembalikan buku terlebih dahulu.');
            }
        });
    }
}
