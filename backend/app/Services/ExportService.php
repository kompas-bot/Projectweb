<?php

namespace App\Services;

use App\Models\Borrow;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ExportService
{
    /**
     * Export transactions to CSV.
     */
    public function exportTransactionsToCSV(array $filters = []): string
    {
        $query = Borrow::with(['user', 'book.category']);

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['category_id'])) {
            $query->byCategory($filters['category_id']);
        }

        if (isset($filters['keyword'])) {
            $query->search($filters['keyword']);
        }

        $borrows = $query->orderBy('created_at', 'desc')->get();

        // Generate CSV content
        $filename = 'transactions_' . date('Y-m-d_His') . '.csv';
        $filepath = 'exports/' . $filename;

        $handle = fopen('php://temp', 'r+');
        
        // CSV Headers
        fputcsv($handle, [
            'ID',
            'User Name',
            'User Email',
            'Book Title',
            'Author',
            'Category',
            'Borrow Date',
            'Return Deadline',
            'Return Date',
            'Status',
            'Late Fee (Rp)',
            'Days Overdue',
            'Admin Notes',
        ]);

        // CSV Data
        foreach ($borrows as $borrow) {
            $daysOverdue = 0;
            if ($borrow->isOverdue()) {
                $daysOverdue = $borrow->days_overdue;
            }

            fputcsv($handle, [
                $borrow->id,
                $borrow->user->name,
                $borrow->user->email,
                $borrow->book->title,
                $borrow->book->author,
                $borrow->book->category->name,
                $borrow->borrow_date->format('Y-m-d'),
                $borrow->return_deadline->format('Y-m-d'),
                $borrow->return_date ? $borrow->return_date->format('Y-m-d') : '-',
                $borrow->status,
                number_format($borrow->late_fee, 2, '.', ''),
                $daysOverdue,
                $borrow->admin_notes ?? '-',
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        // Store file
        Storage::disk('public')->put($filepath, $csv);

        return $filepath;
    }
}
