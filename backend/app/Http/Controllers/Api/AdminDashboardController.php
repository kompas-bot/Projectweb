<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\Borrow;
use App\Models\Category;
use App\Models\User;
use App\Services\ExportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminDashboardController extends Controller
{
    protected $exportService;

    public function __construct(ExportService $exportService)
    {
        $this->middleware(function ($request, $next) {
            if (!$request->user()->isAdmin()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            return $next($request);
        });

        $this->exportService = $exportService;
    }

    /**
     * Get dashboard statistics.
     */
    public function dashboard()
    {
        $stats = [
            'total_books' => Book::count(),
            'total_categories' => Category::count(),
            'total_users' => User::where('role', 'user')->count(),
            'active_borrows' => Borrow::where('status', 'BORROWED')->count(),
            'returned_borrows' => Borrow::where('status', 'RETURNED')->count(),
            'overdue_borrows' => Borrow::where('status', 'BORROWED')
                ->where('return_deadline', '<', now())
                ->count(),
            'total_late_fees' => Borrow::where('status', 'RETURNED')
                ->sum('late_fee'),
        ];

        // Recent transactions
        $recentTransactions = Borrow::with(['user', 'book.category'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'statistics' => $stats,
            'recent_transactions' => $recentTransactions,
        ]);
    }

    /**
     * Export transactions to CSV.
     */
    public function exportTransactions(Request $request)
    {
        $filters = $request->only(['status', 'category_id', 'keyword']);

        $filepath = $this->exportService->exportTransactionsToCSV($filters);

        $fullPath = storage_path('app/public/' . $filepath);

        if (!file_exists($fullPath)) {
            return response()->json([
                'message' => 'Failed to generate export file',
            ], 500);
        }

        return response()->download($fullPath)->deleteFileAfterSend(true);
    }
}
