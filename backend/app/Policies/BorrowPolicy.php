<?php

namespace App\Policies;

use App\Models\Borrow;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class BorrowPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view borrows (filtered by their own or all if admin)
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Borrow $borrow): bool
    {
        return $user->isAdmin() || $borrow->user_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true; // Users can borrow, admins can also create (validation in request handles limits)
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Borrow $borrow): bool
    {
        return $user->isAdmin(); // Only admin can update borrow status
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Borrow $borrow): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can return a borrow.
     */
    public function return(User $user, Borrow $borrow): bool
    {
        // User can return their own borrows, admin can return any
        return $user->isAdmin() || $borrow->user_id === $user->id;
    }

    /**
     * Determine whether the user can update borrow status.
     */
    public function updateStatus(User $user, Borrow $borrow): bool
    {
        return $user->isAdmin(); // Only admin can update status
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Borrow $borrow): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Borrow $borrow): bool
    {
        return $user->isAdmin();
    }
}
