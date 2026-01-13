'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { BookOpen, Users, FileText, TrendingUp, AlertCircle, DollarSign, Clock, CheckCircle2, ArrowUpRight, ArrowRight, BarChart3, Activity } from 'lucide-react';

interface Statistics {
  total_books: number;
  total_categories: number;
  total_users: number;
  active_borrows: number;
  returned_borrows: number;
  overdue_borrows: number;
  total_late_fees: number;
}

interface Transaction {
  id: number;
  borrow_date: string;
  return_deadline: string;
  status: string;
  user: {
    name: string;
    email: string;
  };
  book: {
    title: string;
    category: {
      name: string;
    };
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await adminAPI.dashboard();
      setStats(response.data.statistics);
      setRecentTransactions(response.data.recent_transactions || []);
    } catch (e) {
      console.error('Failed to load dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 animate-fadeIn">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here's what's happening with your library.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100 mb-1">Total Books</p>
                <p className="text-3xl font-bold">{stats?.total_books || 0}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <BookOpen className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="font-medium flex items-center text-blue-100">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                12% vs last month
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 text-white card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-teal-100 mb-1">Active Borrows</p>
                <p className="text-3xl font-bold">{stats?.active_borrows || 0}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-teal-100">Currently borrowed</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-red-100 mb-1">Overdue</p>
                <p className="text-3xl font-bold">{stats?.overdue_borrows || 0}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-100 font-medium">Needs attention</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white card-hover">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-100 mb-1">Late Fees</p>
                <p className="text-2xl font-bold">Rp {parseFloat(String(stats?.total_late_fees || 0)).toLocaleString('id-ID')}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-emerald-100">Total collected</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 rounded-lg">
                  <Activity className="h-5 w-5 text-teal-600" />
                </div>
                <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
              </div>
              <Link href="/admin/transactions" className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentTransactions.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent transactions</p>
                </div>
              ) : (
                recentTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                          {transaction.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.user.name}</p>
                          <p className="text-sm text-gray-500">{transaction.book.title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'BORROWED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {transaction.status === 'BORROWED' ? (
                            <Clock className="h-3 w-3 mr-1" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          )}
                          {transaction.status}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(transaction.borrow_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/admin/books/create" className="flex items-center gap-3 p-3 rounded-lg bg-teal-50 hover:bg-teal-100 transition-colors group">
                  <div className="p-2 bg-teal-600 rounded-lg">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium text-teal-700">Add New Book</span>
                  <ArrowRight className="h-4 w-4 text-teal-600 ml-auto group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/admin/transactions" className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group">
                  <div className="p-2 bg-gray-600 rounded-lg">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-700">View Transactions</span>
                  <ArrowRight className="h-4 w-4 text-gray-600 ml-auto group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/admin/books" className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group">
                  <div className="p-2 bg-gray-600 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium text-gray-700">Manage Books</span>
                  <ArrowRight className="h-4 w-4 text-gray-600 ml-auto group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Library Stats */}
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 text-white">
              <h3 className="font-semibold mb-4">Library Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-teal-100">Total Categories</span>
                  <span className="font-bold">{stats?.total_categories || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-teal-100">Total Users</span>
                  <span className="font-bold">{stats?.total_users || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-teal-100">Returned Books</span>
                  <span className="font-bold">{stats?.returned_borrows || 0}</span>
                </div>
                <div className="w-full bg-teal-400/30 rounded-full h-2 mt-2">
                  <div 
                    className="bg-white rounded-full h-2" 
                    style={{ width: `${stats?.returned_borrows && stats?.active_borrows ? (stats.returned_borrows / (stats.returned_borrows + stats.active_borrows)) * 100 : 0}%` }}
                  ></div>
                </div>
                <p className="text-xs text-teal-200">Return rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
