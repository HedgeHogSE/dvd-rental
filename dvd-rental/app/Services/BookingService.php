<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Dvd;
use App\Models\Rental;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingService
{
    public function createBooking(int $userId, int $dvdId, string $startDate, string $endDate): array
    {
        $this->validateDates($startDate, $endDate);

        return DB::transaction(function () use ($user, $dvdId, $startDate, $endDate): array {
            $dvd = Dvd::where('id', $dvdId)->lockForUpdate()->firstOrFail();

            if ($dvd->status === 'unavailable') {
                throw ValidationException::withMessages([
                    'dvd_id' => ['Данный DVD недоступен для бронирования (статус: unavailable).'],
                ]);
            }

            $hasBookingConflict = $this->hasBookingConflict($dvdId, $startDate, $endDate);

            if ($hasBookingConflict) {
                throw ValidationException::withMessages([
                    'dvd_id' => ['DVD уже забронирован на выбранный период.'],
                ]);
            }

            $hasRentalConflict = $this->hasRentalConflict($dvdId);

            if ($hasRentalConflict) {
                throw ValidationException::withMessages([
                    'dvd_id' => ['DVD в данный момент находится в аренде.'],
                ]);
            }

            $bookingId = DB::table('bookings')->insertGetId([
                'user_id' => $userId,
                'dvd_id' => $dvd->id,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return $this->getBookingData($bookingId);
        });
    }

    public function cancelBooking(int $bookingId, int $userId): void
    {
        $booking = Booking::findOrFail($bookingId);
        $this->authorizeCancelBooking($booking, $userId);
        $booking->update(['status' => 'cancelled']);
    }

public function getUsersBookings(int $userId): array
    {
        $bindings = [];
        $bindings[] = $userId;

        $query = "
            SELECT 
                bookings.id,
                bookings.user_id,
                bookings.dvd_id,
                bookings.start_date,
                bookings.end_date,
                bookings.status,
                bookings.created_at,
                dvds.inventory_number,
                dvds.price_per_day,
                movies.title as movie_title,
                movies.description as movie_description,
                movies.release_year,
                movies.duration,
                genres.name as genre_name
            FROM bookings
            JOIN dvds ON bookings.dvd_id = dvds.id
            JOIN movies ON dvds.movie_id = movies.id
            JOIN genres ON movies.genre_id = genres.id
            WHERE bookings.user_id = ?
            ORDER BY bookings.created_at DESC
        ";

        if ($this->isAdminOrEmployee($userId)) {
            $bindings = [];
        }

        $results = DB::select($query, $bindings);
        
        $data = [];
        foreach ($results as $item) {
            $data[] = (array) $item;
        }
        
        return $data;
    }

    public function getBookingById(int $id): array
    {
        return $this->getBookingData($id);
    }

    public function updateBookingStatus(int $bookingId, string $status): array
    {
        $this->validateStatus($status);

        $booking = Booking::findOrFail($bookingId);
        $booking->update(['status' => $status]);

        return $this->getBookingData($bookingId);
    }

    private function getBookingData(int $bookingId): array
    {
        $result = DB::table('bookings')
            ->join('dvds', 'bookings.dvd_id', '=', 'dvds.id')
            ->join('movies', 'dvds.movie_id', '=', 'movies.id')
            ->join('genres', 'movies.genre_id', '=', 'genres.id')
            ->select(
                'bookings.id',
                'bookings.user_id',
                'bookings.dvd_id',
                'bookings.start_date',
                'bookings.end_date',
                'bookings.status',
                'bookings.created_at',
                'dvds.inventory_number',
                'dvds.price_per_day',
                'movies.title as movie_title',
                'movies.description as movie_description',
                'movies.release_year',
                'movies.duration',
                'genres.name as genre_name'
            )
            ->where('bookings.id', $bookingId)
            ->first();

        return $result ? (array) $result : [];
    }

    private function validateDates(string $startDate, string $endDate): void
    {
        if ($startDate < now()->toDateString()) {
            throw ValidationException::withMessages([
                'start_date' => ['Дата начала должна быть сегодня или в будущем.'],
            ]);
        }

        if ($endDate < $startDate) {
            throw ValidationException::withMessages([
                'end_date' => ['Дата окончания должна быть после или равна дате начала.'],
            ]);
        }
    }

    private function hasBookingConflict(int $dvdId, string $startDate, string $endDate): bool
    {
        return Booking::where('dvd_id', $dvdId)
            ->where('status', 'active')
            ->where(function ($query) use ($startDate, $endDate) {
                $query->where('start_date', '<=', $endDate)
                    ->where('end_date', '>=', $startDate);
            })
            ->exists();
    }

    private function hasRentalConflict(int $dvdId): bool
    {
        return Rental::where('dvd_id', $dvdId)
            ->where('status', 'active')
            ->whereNull('returned_at')
            ->exists();
    }

    private function isAdminOrEmployee(int $userId): bool
    {
        return DB::table('role_user')
            ->where('role_user.user_id', $userId)
            ->join('roles', 'role_user.role_id', '=', 'roles.id')
            ->whereIn('roles.name', ['admin', 'employee'])
            ->exists();
    }

    private function authorizeCancelBooking(Booking $booking, int $userId): void
    {
        if (!$this->isAdminOrEmployee($userId) && $booking->user_id !== $userId) {
            throw ValidationException::withMessages([
                'message' => ['Доступ запрещен'],
            ]);
        }
    }

    private function validateStatus(string $status): void
    {
        if (!in_array($status, ['active', 'cancelled', 'completed'])) {
            throw ValidationException::withMessages([
                'status' => ['Недопустимый статус бронирования.'],
            ]);
        }
    }
}
