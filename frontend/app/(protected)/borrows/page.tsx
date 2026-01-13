'use client';

import { useEffect, useState } from 'react';
import { borrowAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import { BookOpen, Calendar, Clock, CheckCircle2, RotateCcw, AlertTriangle, ArrowRight } from 'lucide-react';
import Toast, { useToast } from '@/components/Toast';

interface Borrow {
  id: number;
  borrow_date: string;
  return_deadline: string;
  return_date?: string;
  status: 'BORROWED' | 'RETURNED';
  late_fee: number;
  book: {
    id: number;
    title: string;
    author: string;
    cover_image?: string;
    category: {
      name: string;
    };
  };
}

export default function BorrowsPage() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'returned'>('all');
  const [confirmReturn, setConfirmReturn] = useState<Borrow | null>(null);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadBorrows();
  }, []);

  const loadBorrows = async () => {
    setLoading(true);
    try {
      const response = await borrowAPI.list();
      setBorrows(response.data.data || response.data);
    } catch (e) {
      console.error('Failed to load borrows', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrow: Borrow) => {
    setConfirmReturn(borrow);
  };

  const confirmReturnBook = async () => {
    if (!confirmReturn) return;

    setReturning(confirmReturn.id);
    setConfirmReturn(null);
    try {
      const response = await borrowAPI.return(confirmReturn.id);
      const lateFee = response.data.borrow?.late_fee || 0;
      if (parseFloat(String(lateFee)) > 0) {
        showToast(`"${confirmReturn.book.title}" returned! Late fee: Rp ${parseFloat(String(lateFee)).toLocaleString('id-ID')}`, 'warning');
      } else {
        showToast(`"${confirmReturn.book.title}" has been returned successfully!`, 'success');
      }
      loadBorrows();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to return book', 'error');
    } finally {
      setReturning(null);
    }
  };

  const isOverdue = (deadline: string) => new Date(deadline) < new Date();
  const getDaysUntilDeadline = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const filteredBorrows = borrows.filter(borrow => {
    if (filter === 'active') return borrow.status === 'BORROWED';
    if (filter === 'returned') return borrow.status === 'RETURNED';
    return true;
  });

  const activeBorrows = borrows.filter(b => b.status === 'BORROWED').length;
  const returnedBorrows = borrows.filter(b => b.status === 'RETURNED').length;
  const overdueBorrows = borrows.filter(b => b.status === 'BORROWED' && isOverdue(b.return_deadline)).length;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your borrows...</p>
          </div>
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
      
      {/* Confirm Return Modal */}
      {confirmReturn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-slideUp">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Return Book?</h3>
              <p className="text-gray-600">
                Are you sure you want to return <strong>"{confirmReturn.book.title}"</strong>?
              </p>
              {new Date(confirmReturn.return_deadline) < new Date() && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-700">
                    ⚠️ This book is overdue. Late fee will be calculated.
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmReturn(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReturnBook}
                className="flex-1 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors"
              >
                Yes, Return
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-6 animate-fadeIn">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Borrows</h1>
          <p className="text-gray-500">Track and manage your borrowed books</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-900">{borrows.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-xl font-bold text-blue-600">{activeBorrows}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Returned</p>
                <p className="text-xl font-bold text-green-600">{returnedBorrows}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Overdue</p>
                <p className="text-xl font-bold text-red-600">{overdueBorrows}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'All', count: borrows.length },
            { key: 'active', label: 'Active', count: activeBorrows },
            { key: 'returned', label: 'Returned', count: returnedBorrows },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-teal-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {filteredBorrows.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No borrows found</h3>
            <p className="text-gray-500">Start borrowing books from the library</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBorrows.map((borrow) => {
              const overdue = borrow.status === 'BORROWED' && isOverdue(borrow.return_deadline);
              const daysUntil = getDaysUntilDeadline(borrow.return_deadline);

              return (
                <div
                  key={borrow.id}
                  className={`bg-white rounded-xl border p-5 ${
                    overdue ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          {borrow.book.cover_image ? (
                            <img
                              src={`http://localhost:8000/storage/${borrow.book.cover_image}`}
                              alt={borrow.book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">{borrow.book.title}</h3>
                          <p className="text-sm text-gray-500">{borrow.book.author}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                            {borrow.book.category.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 md:gap-6">
                      <div className="text-sm">
                        <p className="text-gray-400 text-xs mb-1">Borrowed</p>
                        <p className="font-medium text-gray-700">
                          {new Date(borrow.borrow_date).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="text-sm">
                        <p className="text-gray-400 text-xs mb-1">Deadline</p>
                        <p className={`font-medium ${overdue ? 'text-red-600' : 'text-gray-700'}`}>
                          {new Date(borrow.return_deadline).toLocaleDateString()}
                        </p>
                      </div>

                      {borrow.status === 'BORROWED' && (
                        <div className="text-sm">
                          <p className="text-gray-400 text-xs mb-1">Status</p>
                          {overdue ? (
                            <p className="font-medium text-red-600">
                              Overdue by {Math.abs(daysUntil)} days
                            </p>
                          ) : (
                            <p className="font-medium text-green-600">
                              {daysUntil} days left
                            </p>
                          )}
                        </div>
                      )}

                      {borrow.return_date && (
                        <div className="text-sm">
                          <p className="text-gray-400 text-xs mb-1">Returned</p>
                          <p className="font-medium text-green-600">
                            {new Date(borrow.return_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {parseFloat(String(borrow.late_fee)) > 0 && (
                        <div className="text-sm">
                          <p className="text-gray-400 text-xs mb-1">Late Fee</p>
                          <p className="font-medium text-orange-600">
                            Rp {parseFloat(String(borrow.late_fee)).toLocaleString('id-ID')}
                          </p>
                        </div>
                      )}

                      <div>
                        {borrow.status === 'BORROWED' ? (
                          <button
                            onClick={() => handleReturn(borrow)}
                            disabled={returning === borrow.id}
                            className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {returning === borrow.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Returning...
                              </>
                            ) : (
                              <>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Return
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4 mr-1.5" />
                            Returned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {overdue && borrow.status === 'BORROWED' && (
                    <div className="mt-4 p-3 bg-red-100 rounded-lg flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-700">This book is overdue!</p>
                        <p className="text-sm text-red-600">
                          Late fee: Rp {(Math.abs(daysUntil) * 2000).toLocaleString()} (Rp 2,000/day)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
