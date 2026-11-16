<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['movie_id', 'inventory_number', 'status', 'price_per_day'])]
class Dvd extends Model
{
    use HasFactory;

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

    public function openRental(): HasOne
    {
        return $this->hasOne(Rental::class)
            ->whereIn('status', ['active', 'overdue'])
            ->whereNull('returned_at');
    }

    public function rentalPeriod(): ?array
    {
        $rental = $this->openRental()->first();
        if ($rental === null && $this->status !== 'rented') {
            return null;
        }

        $today = today()->toDateString();
        return [
            'start_date' => $today,
            'end_date' => $rental?->due_on >= $today && $rental->status !== 'overdue' ? $rental->due_on : null,
        ];
    }

    public function activeBookings(): HasMany
    {
        return $this->bookings()->where('status', 'active');
    }

    public function overlappingBookings(string $start, string $end): HasMany
    {
        return $this->activeBookings()
            ->where('start_date', '<=', $end)
            ->where('end_date', '>=', $start);
    }

    public function scopeAvailableForIssue(Builder $query): Builder
    {
        $today = today()->toDateString();
        return $query->whereIn('status', ['available', 'reserved'])
            ->whereDoesntHave('openRental')
            ->whereDoesntHave('activeBookings', fn ($bookings) => $bookings
                ->where('start_date', '<=', $today)->where('end_date', '>=', $today));
    }

    public function refreshCirculationStatus(): void
    {
        if ($this->status === 'unavailable') {
            return;
        }

        $status = 'available';
        if ($this->openRental()->exists()) {
            $status = 'rented';
        } elseif ($this->activeBookings()->where('end_date', '>=', today()->toDateString())->exists()) {
            $status = 'reserved';
        }

        $this->update(['status' => $status]);
    }
}
