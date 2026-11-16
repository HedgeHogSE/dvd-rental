<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function view(User $user, Booking $booking): bool
    {
        return $user->id === $booking->user_id || $user->isStaff();
    }

    public function update(User $user, Booking $booking): bool
    {
        if ($user->isStaff()) {
            return true;
        }

        return $user->id === $booking->user_id;
    }

    public function delete(User $user, Booking $booking): bool
    {
        return $user->id === $booking->user_id || $user->isStaff();
    }
}