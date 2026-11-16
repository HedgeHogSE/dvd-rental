<?php

namespace App\Providers;

use App\Services\AuthService;
use App\Services\BlockService;
use App\Services\BookingService;
use App\Services\RentalService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(AuthService::class);
        $this->app->singleton(BlockService::class);
        $this->app->singleton(BookingService::class);
        $this->app->singleton(RentalService::class);
    }

    public function boot(): void
    {
        //
    }
}
