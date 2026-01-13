'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { bookAPI, categoryAPI } from '@/lib/api';
import Layout from '@/components/Layout';
import { ArrowLeft, Save, BookOpen, User, Calendar, Package, Tag, Upload, Image, AlertCircle } from 'lucide-react';
import Toast, { useToast } from '@/components/Toast';

interface BookForm {
  title: string;
  author: string;
  year: number;
  stock: number;
  category_id: number;
  cover_image?: FileList;
}

export default function EditBookPage() {
  const params = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingBook, setLoadingBook] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast, showToast, hideToast } = useToast();
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<BookForm>();

  const coverImage = watch('cover_image');

  useEffect(() => {
    loadCategories();
    loadBook();
  }, [params.id]);

  useEffect(() => {
    if (coverImage && coverImage[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(coverImage[0]);
    }
  }, [coverImage]);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.list();
      setCategories(response.data);
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  const loadBook = async () => {
    try {
      const response = await bookAPI.get(Number(params.id));
      const bookData = response.data.book;
      setBook(bookData);
      setValue('title', bookData.title);
      setValue('author', bookData.author);
      setValue('year', bookData.year);
      setValue('stock', bookData.stock);
      setValue('category_id', bookData.category_id);
      if (bookData.cover_image) {
        setPreviewImage(`http://localhost:8000/storage/${bookData.cover_image}`);
      }
    } catch (e) {
      console.error('Failed to load book', e);
      router.push('/admin/books');
    } finally {
      setLoadingBook(false);
    }
  };

  const onSubmit = async (data: BookForm) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('author', data.author);
      formData.append('year', data.year.toString());
      formData.append('stock', data.stock.toString());
      formData.append('category_id', data.category_id.toString());
      if (data.cover_image && data.cover_image[0]) {
        formData.append('cover_image', data.cover_image[0]);
      }
      await bookAPI.update(Number(params.id), formData);
      showToast(`"${data.title}" has been updated successfully!`, 'success');
      setTimeout(() => {
        router.push('/admin/books');
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(', ') : 'Failed to update book');
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingBook) {
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

  return (
    <Layout>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
      <div className="px-4 py-6 max-w-3xl animate-fadeIn">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-600 hover:text-teal-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Books
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Book</h1>
          <p className="text-gray-500">Update the book information</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Cover Image Preview */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">Cover Image</label>
                <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <Image className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No image</p>
                    </div>
                  )}
                </div>
                <label className="block">
                  <span className="inline-flex items-center justify-center w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Change Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    {...register('cover_image')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                    Book Title
                  </div>
                </label>
                <input
                  {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Title must be at least 3 characters' } })}
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-gray-900"
                  placeholder="Enter book title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    Author
                  </div>
                </label>
                <input
                  {...register('author', { required: 'Author is required' })}
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-gray-900"
                  placeholder="Enter author name"
                />
                {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      Year
                    </div>
                  </label>
                  <input
                    type="number"
                    {...register('year', { required: 'Year is required', min: { value: 1900, message: 'Year must be at least 1900' }, max: { value: new Date().getFullYear(), message: `Year cannot exceed ${new Date().getFullYear()}` } })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-gray-900"
                    placeholder="2024"
                  />
                  {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-2 text-gray-400" />
                      Stock
                    </div>
                  </label>
                  <input
                    type="number"
                    {...register('stock', { required: 'Stock is required', min: { value: 0, message: 'Stock cannot be negative' } })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-gray-900"
                    placeholder="0"
                  />
                  {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-gray-400" />
                    Category
                  </div>
                </label>
                <select
                  {...register('category_id', { required: 'Category is required' })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50 text-gray-900 appearance-none cursor-pointer"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Update Book
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
