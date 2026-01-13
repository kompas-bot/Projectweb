'use client';

import { useEffect, useState } from 'react';
import { bookAPI, categoryAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { Search, Filter, BookOpen, Calendar, User, Package, ChevronRight, Library, Grid3X3, List } from 'lucide-react';

interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  stock: number;
  cover_image?: string;
  category: {
    id: number;
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [keyword, setKeyword] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadCategories();
    loadBooks();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.list();
      setCategories(response.data);
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  const loadBooks = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (keyword) params.keyword = keyword;
      const response = await bookAPI.list(params);
      setBooks(response.data.data || response.data);
    } catch (e) {
      console.error('Failed to load books', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [selectedCategory, keyword]);

  return (
    <Layout>
      <div className="px-4 py-6 animate-fadeIn">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Library Collection</h1>
              <p className="text-gray-500">Discover and borrow from our extensive book collection</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm">Total Books</p>
                  <p className="text-2xl font-bold">{books.length}</p>
                </div>
                <Library className="h-8 w-8 text-teal-200" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Categories</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
                <Grid3X3 className="h-8 w-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Available</p>
                  <p className="text-2xl font-bold">{books.filter(b => b.stock > 0).length}</p>
                </div>
                <Package className="h-8 w-8 text-green-200" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Out of Stock</p>
                  <p className="text-2xl font-bold">{books.filter(b => b.stock === 0).length}</p>
                </div>
                <BookOpen className="h-8 w-8 text-orange-200" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or author..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 placeholder:text-gray-400 bg-gray-50"
                />
              </div>
              <div className="relative md:w-56">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : '')}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none bg-gray-50 text-gray-900 cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading books...</p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {books.map((book) => (
              <Link key={book.id} href={`/books/${book.id}`}>
                <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden card-hover cursor-pointer">
                  <div className="aspect-[3/4] relative bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                    {book.cover_image ? (
                      <img
                        src={`http://localhost:8000/storage/${book.cover_image}`}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 shadow-sm">
                        {book.category.name}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${
                        book.stock > 0 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {book.stock > 0 ? `${book.stock} left` : 'Out'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-teal-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{book.year}</span>
                      <span className="flex items-center text-teal-600 font-medium group-hover:translate-x-1 transition-transform">
                        View <ChevronRight className="h-3 w-3 ml-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {books.map((book) => (
                <Link key={book.id} href={`/books/${book.id}`}>
                  <div className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden flex-shrink-0">
                      {book.cover_image ? (
                        <img
                          src={`http://localhost:8000/storage/${book.cover_image}`}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
                      <p className="text-sm text-gray-500">{book.author} • {book.year}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                        {book.category.name}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                        book.stock > 0 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {book.stock > 0 ? `${book.stock} available` : 'Out of stock'}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!loading && books.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No books found</h3>
            <p className="text-gray-500">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
