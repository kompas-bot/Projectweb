'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bookAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import { BookOpen, Plus, Edit, Trash2, Search, MoreVertical, Package, Eye } from 'lucide-react';
import Toast, { useToast } from '@/components/Toast';

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

export default function AdminBooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Book | null>(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const params: any = {};
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
  }, [keyword]);

  const handleDelete = (book: Book) => {
    setConfirmDelete(book);
    setOpenMenu(null);
  };

  const confirmDeleteBook = async () => {
    if (!confirmDelete) return;
    try {
      await bookAPI.delete(confirmDelete.id);
      showToast(`"${confirmDelete.title}" has been deleted`, 'success');
      loadBooks();
    } catch (e) {
      showToast('Failed to delete book', 'error');
    }
    setConfirmDelete(null);
  };

  return (
    <Layout>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      
      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slideUp">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Book?</h3>
              <p className="text-gray-600">
                Are you sure you want to delete <strong>"{confirmDelete.title}"</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBook}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Books</h1>
            <p className="text-gray-500">Add, edit, and manage your library books</p>
          </div>
          <button
            onClick={() => router.push('/admin/books/create')}
            className="inline-flex items-center px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Book
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Total Books</p>
            <p className="text-2xl font-bold text-gray-900">{books.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Available</p>
            <p className="text-2xl font-bold text-green-600">{books.filter(b => b.stock > 0).length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">{books.filter(b => b.stock === 0).length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Total Stock</p>
            <p className="text-2xl font-bold text-blue-600">{books.reduce((acc, b) => acc + b.stock, 0)}</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search books by title or author..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading books...</p>
            </div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No books found</h3>
            <p className="text-gray-500 mb-4">Start by adding your first book</p>
            <button
              onClick={() => router.push('/admin/books/create')}
              className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Book
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Book</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Year</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                    <th className="text-right px-5 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {books.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            {book.cover_image ? (
                              <img
                                src={`http://localhost:8000/storage/${book.cover_image}`}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{book.title}</p>
                            <p className="text-sm text-gray-500">{book.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-sm text-gray-700">
                          {book.category.name}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{book.year}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Package className={`h-4 w-4 ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`} />
                          <span className={`font-medium ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {book.stock}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/books/${book.id}`)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/admin/books/${book.id}/edit`)}
                            className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(book)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
