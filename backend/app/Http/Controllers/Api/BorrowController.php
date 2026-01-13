<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BorrowStoreRequest;
use App\Models\Borrow;
use App\Services\BorrowService;
use Illuminate\Http\Request;

class BorrowController extends Controller
{
    protected $borrowService;

    public function __construct(BorrowService $borrowService)
    {
        $this->borrowService = $borrowService;
    }

    /**
     * Display a listing of the resource with filters.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Borrow::class);

        $query = Borrow::with(['user', 'book.category']);

        // If user is not admin, only show their own borrows
        if (!$request->user()->isAdmin()) {
            $query->where('user_id', $request->user()->id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->byCategory($request->category_id);
        }

        // Search by keyword (book title or author)
        if ($request->has('keyword')) {
            $query->search($request->keyword);
        }

        $borrows = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($borrows);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(BorrowStoreRequest $request)
    {
        $this->authorize('create', Borrow::class);

        $borrow = $this->borrowService->createBorrow(
            $request->user()->id,
            $request->book_id
        );

        $borrow->load(['user', 'book.category']);

        return response()->json([
            'message' => 'Book borrowed successfully',
            'borrow' => $borrow,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Borrow $borrow)
    {
        $this->authorize('view', $borrow);

        $borrow->load(['user', 'book.category']);

        return response()->json([
            'borrow' => $borrow,
        ]);
    }

    /**
     * Return a borrowed book.
     */
    public function return(Request $request, Borrow $borrow)
    {
        $this->authorize('return', $borrow);

        if ($borrow->status === 'RETURNED') {
            return response()->json([
                'message' => 'Book has already been returned',
            ], 400);
        }

        $borrow = $this->borrowService->processReturn($borrow);
        $borrow->load(['user', 'book.category']);

        return response()->json([
            'message' => 'Book returned successfully',
            'borrow' => $borrow,
        ]);
    }

    /**
     * Update the status of a borrow (Admin only).
     */
    public function updateStatus(Request $request, Borrow $borrow)
    {
        $this->authorize('updateStatus', $borrow);

        $request->validate([
            'status' => ['required', 'in:BORROWED,RETURNED'],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $borrow->status = $request->status;
        
        if ($request->has('admin_notes')) {
            $borrow->admin_notes = $request->admin_notes;
        }

        // If updating to RETURNED, process return
        if ($request->status === 'RETURNED' && $borrow->return_date === null) {
            $borrow = $this->borrowService->processReturn($borrow);
        } else {
            $borrow->save();
        }

        $borrow->load(['user', 'book.category']);

        return response()->json([
            'message' => 'Borrow status updated successfully',
            'borrow' => $borrow,
        ]);
    }
}
