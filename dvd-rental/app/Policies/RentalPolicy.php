<?php

namespace App\Policies;

use App\Models\Rental;
use App\Models\User;

class RentalPolicy
{
    public function view(User $user, Rental $rental): bool
    {
        return $user->id === $rental->user_id || $user->isStaff();
    }

    public function update(User $user, Rental $rental): bool
    {
        return $user->isStaff();
    }

    public function delete(User $user, Rental $rental): bool
    {
        return $user->isStaff();
    }
}