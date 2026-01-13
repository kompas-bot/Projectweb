'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { BookOpen, LayoutDashboard, FileText, LogOut, User, Library, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearAuth, isAdmin } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // Ignore errors
    }
    clearAuth();
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div 
                className="flex-shrink-0 flex items-center cursor-pointer" 
                onClick={() => router.push(isAdmin() ? '/admin/dashboard' : '/books')}
              >
                <Library className="h-7 w-7 text-teal-600" />
                <span className="ml-2 text-lg font-bold text-gray-900">Library</span>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
                {isAdmin() ? (
                  <>
                    <a
                      href="/admin/dashboard"
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive('/admin/dashboard')
                          ? 'text-teal-700 bg-teal-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </a>
                    <a
                      href="/admin/books"
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive('/admin/books')
                          ? 'text-teal-700 bg-teal-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Books
                    </a>
                    <a
                      href="/admin/transactions"
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive('/admin/transactions')
                          ? 'text-teal-700 bg-teal-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Transactions
                    </a>
                  </>
                ) : (
                  <>
                    <a
                      href="/books"
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive('/books')
                          ? 'text-teal-700 bg-teal-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Books
                    </a>
                    <a
                      href="/borrows"
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive('/borrows')
                          ? 'text-teal-700 bg-teal-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      My Borrows
                    </a>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="/profile"
                className={`hidden md:flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/profile')
                    ? 'bg-teal-50'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-medium text-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{isAdmin() ? 'Admin' : 'User'}</p>
                </div>
              </a>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
