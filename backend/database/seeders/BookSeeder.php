<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Category;
use Illuminate\Database\Seeder;

class BookSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::all()->keyBy('name');

        $books = [
            // Fiction
            ['title' => 'The Great Gatsby', 'author' => 'F. Scott Fitzgerald', 'year' => 1925, 'stock' => 5, 'category' => 'Fiction'],
            ['title' => 'To Kill a Mockingbird', 'author' => 'Harper Lee', 'year' => 1960, 'stock' => 3, 'category' => 'Fiction'],
            ['title' => '1984', 'author' => 'George Orwell', 'year' => 1949, 'stock' => 7, 'category' => 'Fiction'],
            ['title' => 'Pride and Prejudice', 'author' => 'Jane Austen', 'year' => 1813, 'stock' => 4, 'category' => 'Fiction'],
            ['title' => 'The Catcher in the Rye', 'author' => 'J.D. Salinger', 'year' => 1951, 'stock' => 2, 'category' => 'Fiction'],

            // Non-Fiction
            ['title' => 'Sapiens', 'author' => 'Yuval Noah Harari', 'year' => 2011, 'stock' => 6, 'category' => 'Non-Fiction'],
            ['title' => 'Educated', 'author' => 'Tara Westover', 'year' => 2018, 'stock' => 4, 'category' => 'Non-Fiction'],
            ['title' => 'The Immortal Life of Henrietta Lacks', 'author' => 'Rebecca Skloot', 'year' => 2010, 'stock' => 3, 'category' => 'Non-Fiction'],

            // Science
            ['title' => 'A Brief History of Time', 'author' => 'Stephen Hawking', 'year' => 1988, 'stock' => 5, 'category' => 'Science'],
            ['title' => 'Cosmos', 'author' => 'Carl Sagan', 'year' => 1980, 'stock' => 4, 'category' => 'Science'],
            ['title' => 'The Selfish Gene', 'author' => 'Richard Dawkins', 'year' => 1976, 'stock' => 6, 'category' => 'Science'],
            ['title' => 'The Double Helix', 'author' => 'James D. Watson', 'year' => 1968, 'stock' => 3, 'category' => 'Science'],

            // Technology
            ['title' => 'Clean Code', 'author' => 'Robert C. Martin', 'year' => 2008, 'stock' => 8, 'category' => 'Technology'],
            ['title' => 'The Pragmatic Programmer', 'author' => 'Andrew Hunt', 'year' => 1999, 'stock' => 5, 'category' => 'Technology'],
            ['title' => 'Design Patterns', 'author' => 'Gang of Four', 'year' => 1994, 'stock' => 4, 'category' => 'Technology'],
            ['title' => 'Introduction to Algorithms', 'author' => 'Thomas H. Cormen', 'year' => 1990, 'stock' => 3, 'category' => 'Technology'],

            // History
            ['title' => 'The Guns of August', 'author' => 'Barbara W. Tuchman', 'year' => 1962, 'stock' => 4, 'category' => 'History'],
            ['title' => 'A People\'s History of the United States', 'author' => 'Howard Zinn', 'year' => 1980, 'stock' => 5, 'category' => 'History'],
            ['title' => 'The Rise and Fall of the Third Reich', 'author' => 'William L. Shirer', 'year' => 1960, 'stock' => 3, 'category' => 'History'],

            // Biography
            ['title' => 'Steve Jobs', 'author' => 'Walter Isaacson', 'year' => 2011, 'stock' => 6, 'category' => 'Biography'],
            ['title' => 'The Diary of a Young Girl', 'author' => 'Anne Frank', 'year' => 1947, 'stock' => 7, 'category' => 'Biography'],
            ['title' => 'Long Walk to Freedom', 'author' => 'Nelson Mandela', 'year' => 1994, 'stock' => 4, 'category' => 'Biography'],
            ['title' => 'I Know Why the Caged Bird Sings', 'author' => 'Maya Angelou', 'year' => 1969, 'stock' => 5, 'category' => 'Biography'],

            // Indonesian Books
            ['title' => 'Laskar Pelangi', 'author' => 'Andrea Hirata', 'year' => 2005, 'stock' => 8, 'category' => 'Fiction'],
            ['title' => 'Bumi Manusia', 'author' => 'Pramoedya Ananta Toer', 'year' => 1980, 'stock' => 6, 'category' => 'Fiction'],
            ['title' => 'Negeri 5 Menara', 'author' => 'Ahmad Fuadi', 'year' => 2009, 'stock' => 5, 'category' => 'Fiction'],
            ['title' => 'Ayat-Ayat Cinta', 'author' => 'Habiburrahman El Shirazy', 'year' => 2004, 'stock' => 7, 'category' => 'Fiction'],
            ['title' => 'Perahu Kertas', 'author' => 'Dee Lestari', 'year' => 2009, 'stock' => 4, 'category' => 'Fiction'],
            ['title' => 'Filosofi Teras', 'author' => 'Henry Manampiring', 'year' => 2018, 'stock' => 10, 'category' => 'Non-Fiction'],
            ['title' => 'Sejarah Indonesia Modern', 'author' => 'M.C. Ricklefs', 'year' => 1981, 'stock' => 3, 'category' => 'History'],
            ['title' => 'Chairul Tanjung Si Anak Singkong', 'author' => 'Tjahja Gunawan Diredja', 'year' => 2012, 'stock' => 5, 'category' => 'Biography'],
            ['title' => 'Habis Gelap Terbitlah Terang', 'author' => 'R.A. Kartini', 'year' => 1911, 'stock' => 6, 'category' => 'Biography'],
            ['title' => 'Atomic Habits (Edisi Indonesia)', 'author' => 'James Clear', 'year' => 2019, 'stock' => 12, 'category' => 'Non-Fiction'],
        ];

        foreach ($books as $bookData) {
            $category = $categories[$bookData['category']] ?? null;
            
            if ($category) {
                Book::firstOrCreate(
                    [
                        'title' => $bookData['title'],
                        'author' => $bookData['author'],
                    ],
                    [
                        'year' => $bookData['year'],
                        'stock' => $bookData['stock'],
                        'category_id' => $category->id,
                    ]
                );
            }
        }
    }
}
