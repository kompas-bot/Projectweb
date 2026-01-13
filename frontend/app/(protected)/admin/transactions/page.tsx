'use client';

import { useEffect, useState } from 'react';
import { borrowAPI, categoryAPI, adminAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import { FileText, Download, Search, Filter, Calendar, Clock, CheckCircle2, RotateCcw, User, BookOpen, DollarSign, AlertCircle } from 'lucide-react';
import Toast, { useToast } from '@/components/Toast';

interface Borrow {
  id: number;
  borrow_date: string;
  return_deadline: string;
  return_date?: string;
  status: 'BORROWED' | 'RETURNED';
  late_fee: number;
  user: {
    name: string;
    email: string;
  };
  book: {
    title: string;
    author: string;
    category: {
      name: string;
    };
  };
}

interface Category {
  id: number;
  name: string;
}

export default function AdminTransactionsPage() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [keyword, setKeyword] = useState('');
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadCategories();
    loadTransactions();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [statusFilter, categoryFilter, keyword]);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.list();
      setCategories(response.data);
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category_id = categoryFilter;
      if (keyword) params.keyword = keyword;
      const response = await borrowAPI.list(params);
      setBorrows(response.data.data || response.data);
    } catch (e) {
      console.error('Failed to load transactions', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category_id = categoryFilter;
      if (keyword) params.keyword = keyword;
      const response = await adminAPI.exportTransactions(params);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('Transactions exported successfully!', 'success');
    } catch (e) {
      showToast('Failed to export transactions', 'error');
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await borrowAPI.updateStatus(id, { status });
      showToast(`Status updated to ${status}`, 'success');
      loadTransactions();
    } catch (e) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleReturn = async (id: number) => {
    try {
      await borrowAPI.return(id);
      showToast('Book returned successfully!', 'success');
      loadTransactions();
    } catch (e) {
      showToast('Failed to return book', 'error');
    }
  };

  const borrowedCount = borrows.filter(b => b.status === 'BORROWED').length;
  const returnedCount = borrows.filter(b => b.status === 'RETURNED').length;
  const totalLateFees = borrows.reduce((acc, b) => acc + (parseFloat(String(b.late_fee)) || 0), 0);

  return (
    <Layout>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      <div className="px-4 py-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
            <p className="text-gray-500">Manage all book borrowing transactions</p>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900">{borrows.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Borrowed</p>
            <p className="text-2xl font-bold text-blue-600">{borrowedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 mb-1">Returned</p>
            <p className="text-2xl font-bold text-green-600">{returnedCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 overflow-hidden">
            <p className="text-sm text-gray-500 mb-1">Late Fees</p>
            <p className="text-xl font-bold text-orange-600 truncate" title={`Rp ${totalLateFees.toLocaleString('id-ID')}`}>
              Rp {totalLateFees.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by book title or user..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-gray-900 appearance-none cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="BORROWED">Borrowed</option>
                <option value="RETURNED">Returned</option>
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : '')}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-gray-900 appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading transactions...</p>
            </div>
          </div>
        ) : borrows.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No transactions found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Book</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Dates</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Late Fee</th>
                    <th className="text-right px-5 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {borrows.map((borrow) => (
                    <tr key={borrow.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                            {borrow.user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{borrow.user.name}</p>
                            <p className="text-sm text-gray-500">{borrow.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{borrow.book.title}</p>
                        <p className="text-sm text-gray-500">{borrow.book.category.name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm">
                          <p className="text-gray-700">
                            <span className="text-gray-400">Borrowed:</span> {new Date(borrow.borrow_date).toLocaleDateString()}
                          </p>
                          <p className="text-gray-700">
                            <span className="text-gray-400">Deadline:</span> {new Date(borrow.return_deadline).toLocaleDateString()}
                          </p>
                          {borrow.return_date && (
                            <p className="text-green-600">
                              <span className="text-gray-400">Returned:</span> {new Date(borrow.return_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={borrow.status}
                          onChange={(e) => handleStatusUpdate(borrow.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer ${
                            borrow.status === 'BORROWED'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          <option value="BORROWED">Borrowed</option>
                          <option value="RETURNED">Returned</option>
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        {parseFloat(String(borrow.late_fee)) > 0 ? (
                          <span className="font-medium text-orange-600">
                            Rp {parseFloat(String(borrow.late_fee)).toLocaleString('id-ID')}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {borrow.status === 'BORROWED' && (
                          <button
                            onClick={() => handleReturn(borrow.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <RotateCcw className="h-4 w-4 mr-1.5" />
                            Return
                          </button>
                        )}
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
