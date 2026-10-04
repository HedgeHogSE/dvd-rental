<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['movie_id', 'inventory_number', 'status', 'price_per_day'])]
class Dvd extends Model
{
    public function movie(): BelongsTo
    {
        return $this->belongsTo(Movie::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }
}
