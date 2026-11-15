<?php

namespace App\Policies;

use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    public function view(User $user, Review $review): bool
    {
        return $review->status === 'published' || $user->isStaff();
    }

    public function update(User $user, Review $review): bool
    {
        return $user->id === $review->user_id || $user->isStaff();
    }

    public function delete(User $user, Review $review): bool
    {
        return $user->id === $review->user_id || $user->isStaff();
    }

    public function moderate(User $user): bool
    {
        return $user->isStaff();
    }
}