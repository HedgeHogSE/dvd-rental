<?php

namespace App\Providers;

use App\Models\Booking;
use App\Models\Rental;
use App\Models\Review;
use App\Policies\BookingPolicy;
use App\Policies\RentalPolicy;
use App\Policies\ReviewPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Booking::class, BookingPolicy::class);
        Gate::policy(Rental::class, RentalPolicy::class);
        Gate::policy(Review::class, ReviewPolicy::class);
    }
}