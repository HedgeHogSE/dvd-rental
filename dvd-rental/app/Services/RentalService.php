<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Dvd;
use App\Models\Rental;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RentalService
{
    public function issueDvd(int $userId, int $dvdId, ?int $bookingId = null, ?int $days = null): Rental
    {
        return DB::transaction(function () use ($userId, $dvdId, $bookingId, $days) {
            $dvd = Dvd::where('id', $dvdId)->lockForUpdate()->firstOrFail();

            if ($dvd->status === 'rented') {
                throw ValidationException::withMessages([
                    'dvd_id' => ['Данный DVD уже находится в аренде.'],
                ]);
            }

            if ($dvd->status === 'unavailable') {
                throw ValidationException::withMessages([
                    'dvd_id' => ['Данный DVD недоступен для аренды (статус: unavailable).'],
                ]);
            }

            $rentalDays = $days ?? 1;

            if ($bookingId) {
                $booking = Booking::findOrFail($bookingId);

                if ($booking->status !== 'active') {
                    throw ValidationException::withMessages([
                        'booking_id' => ['Бронирование не является активным.'],
                    ]);
                }

                $startDate = Carbon::parse($booking->start_date);
                $endDate = Carbon::parse($booking->end_date);
                $rentalDays = max(1, $startDate->diffInDays($endDate));

                $booking->update(['status' => 'completed']);
            }

            $totalPrice = $rentalDays * $dvd->price_per_day;

            $rental = Rental::create([
                'user_id' => $userId,
                'dvd_id' => $dvd->id,
                'booking_id' => $bookingId,
                'issued_at' => now(),
                'status' => 'active',
                'price' => $totalPrice,
            ]);

            $dvd->update(['status' => 'rented']);

            return $rental;
        });
    }

    public function returnDvd(Rental $rental): Rental
    {
        if ($rental->status === 'returned') {
            throw ValidationException::withMessages([
                'message' => ['Данный DVD уже был возвращен ранее'],
            ]);
        }

        DB::transaction(function () use ($rental) {
            $dvd = Dvd::where('id', $rental->dvd_id)->lockForUpdate()->firstOrFail();

            $rental->update([
                'status' => 'returned',
                'returned_at' => now(),
            ]);

            $dvd->update(['status' => 'available']);
        });

        return $rental->fresh()->load(['user' => function($query) {
            $query->select('id', 'name', 'email', 'phone');
        }, 'dvd.movie.genre']);
    }

    public function getUsersRentals($user): \Illuminate\Support\Collection
    {
        $query = Rental::with(['user' => function($query) {
            $query->select('id', 'name', 'email', 'phone');
        }, 'dvd.movie.genre', 'booking']);

        if (!$this->isAdminOrEmployee($user)) {
            $query->where('user_id', $user->id);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    private function isAdminOrEmployee($user): bool
    {
        return $user->roles()->whereIn('name', ['admin', 'employee'])->exists();
    }
}