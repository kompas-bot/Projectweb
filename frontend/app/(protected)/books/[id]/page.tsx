'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { bookAPI, borrowAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/lib/store';
import { ArrowLeft, Calendar, User, Package, BookOpen, CheckCircle2, XCircle, Clock, Tag, Info } from 'lucide-react';
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

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [error, setError] = useState('');
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadBook();
  }, [params.id]);

  const loadBook = async () => {
    try {
      const response = await bookAPI.get(Number(params.id));
      setBook(response.data.book);
    } catch (e) {
      console.error('Failed to load book', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!book) return;
    
    setBorrowing(true);
    setError('');
    try {
      await borrowAPI.create({ book_id: book.id });
      showToast(`"${book.title}" has been borrowed successfully! Return within 7 days.`, 'success');
      setTimeout(() => {
        router.push('/borrows');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to borrow book';
      showToast(errorMessage, 'error');
      setError(errorMessage);
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading book details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!book) {
    return (
      <Layout>
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200 mx-4">
          <XCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Book not found</h3>
          <p className="text-gray-500 mb-4">The book you're looking for doesn't exist</p>
          <button
            onClick={() => router.push('/books')}
            className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Books
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      <div className="px-4 py-6 animate-fadeIn">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-teal-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Books
        </button>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid md:grid-cols-3 gap-0">
            {/* Book Cover */}
            <div className="md:col-span-1 bg-gradient-to-br from-gray-100 to-gray-50 p-8 flex items-center justify-center">
              {book.cover_image ? (
                <img
                  src={`http://localhost:8000/storage/${book.cover_image}`}
                  alt={book.title}
                  className="max-h-80 w-auto rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-48 h-64 bg-white rounded-lg shadow-lg flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-gray-300" />
                </div>
              )}
            </div>

            {/* Book Details */}
            <div className="md:col-span-2 p-8">
              <div className="flex items-start justify-between mb-4">
                <span className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                  <Tag className="h-3.5 w-3.5 mr-1.5" />
                  {book.category.name}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  book.stock > 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  <Package className="h-3.5 w-3.5 mr-1.5" />
                  {book.stock > 0 ? `${book.stock} available` : 'Out of stock'}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-3">{book.title}</h1>
              
              <div className="flex items-center text-gray-600 mb-6">
                <User className="h-5 w-5 mr-2 text-gray-400" />
                <span className="text-lg">by {book.author}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Publication Year
                  </div>
                  <p className="text-xl font-semibold text-gray-900">{book.year}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-gray-500 text-sm mb-1">
                    <Package className="h-4 w-4 mr-2" />
                    Stock Available
                  </div>
                  <p className={`text-xl font-semibold ${book.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {book.stock} copies
                  </p>
                </div>
              </div>

              {/* Borrowing Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Borrowing Information</p>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• Borrow period: 7 days</li>
                      <li>• Maximum 3 books can be borrowed at once</li>
                      <li>• Late fee: Rp 2,000 per day</li>
                    </ul>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                  <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              {user && user.role === 'user' && (
                <button
                  onClick={handleBorrow}
                  disabled={borrowing || book.stock === 0}
                  className={`w-full md:w-auto inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold transition-colors ${
                    book.stock > 0 && !borrowing
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {borrowing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Borrowing...
                    </>
                  ) : book.stock > 0 ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Borrow This Book
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 mr-2" />
                      Out of Stock
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
