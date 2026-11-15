<?php

namespace App\Http\Controllers;

use App\Models\Block;
use App\Models\Booking;
use App\Models\Dvd;
use App\Models\Rental;
use App\Notifications\BookingCancelled;
use App\Notifications\BookingConfirmed;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use App\Models\Movie;
use App\Notifications\WishlistAvailable;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Booking::with(['dvd.movie', 'user']);

        if (!$user->isStaff()) {
            $query->where('user_id', $user->id);
        } else if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('dvd_id')) {
            $query->where('dvd_id', $request->integer('dvd_id'));
        }

        if ($request->filled('from')) {
            $query->where('start_date', '>=', $request->date('from'));
        }
        if ($request->filled('to')) {
            $query->where('end_date', '<=', $request->date('to'));
        }

        $perPage = max(1, min($request->integer('per_page', 15), 100));

        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate($perPage),
            200
        );
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $isBlocked = Block::where('user_id', $user->id)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->exists();

        if ($isBlocked) {
            return response()->json([
                'message' => 'Пользователь заблокирован и не может создавать бронирования',
            ], 403);
        }

        $validated = $request->validate([
            'dvd_id' => 'required|exists:dvds,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        try {
            $booking = DB::transaction(function () use ($user, $validated) {

                $dvd = Dvd::where('id', $validated['dvd_id'])->lockForUpdate()->firstOrFail();

                if ($dvd->status === 'unavailable') {
                    throw ValidationException::withMessages([
                        'dvd_id' => ['Данный DVD недоступен для бронирования (статус: unavailable).'],
                    ]);
                }

                $hasBookingConflict = Booking::where('dvd_id', $dvd->id)
                    ->where('status', 'active')
                    ->where(function ($query) use ($validated) {
                        $query->where('start_date', '<=', $validated['end_date'])
                            ->where('end_date', '>=', $validated['start_date']);
                    })
                    ->exists();

                if ($hasBookingConflict) {
                    throw ValidationException::withMessages([
                        'dvd_id' => ['DVD уже забронирован на выбранный период.'],
                    ]);
                }

                $hasRentalConflict = Rental::where('dvd_id', $dvd->id)
                    ->where('status', 'active')
                    ->whereNull('returned_at')
                    ->exists();

                if ($hasRentalConflict) {
                    throw ValidationException::withMessages([
                        'dvd_id' => ['DVD в данный момент находится в аренде.'],
                    ]);
                }

                $newBooking = Booking::create([
                    'user_id' => $user->id,
                    'dvd_id' => $dvd->id,
                    'start_date' => $validated['start_date'],
                    'end_date' => $validated['end_date'],
                    'status' => 'active',
                ]);

                $dvd->update(['status' => 'reserved']);

                return $newBooking;
            });

            $user->notify(new BookingConfirmed($booking));

            return response()->json([
                'message' => 'Бронирование успешно создано',
                'booking' => $booking->load('dvd.movie'),
            ], 201);

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка при создании бронирования: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(Request $request, Booking $booking)
    {
        $this->authorize('view', $booking);
        return response()->json($booking->load(['dvd.movie', 'user']), 200);
    }

    public function update(Request $request, Booking $booking)
    {
        $this->authorize('update', $booking);

        if (!$request->user()->isStaff() && $request->input('status') !== 'cancelled') {
            return response()->json(['message' => 'Клиент может только отменить бронирование'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:active,cancelled,completed',
        ]);

        DB::transaction(function () use ($booking, $validated) {
            $booking->update(['status' => $validated['status']]);

            if ($validated['status'] === 'cancelled') {
                $hasOtherActiveBookings = Booking::where('dvd_id', $booking->dvd_id)
                    ->where('id', '!=', $booking->id)
                    ->where('status', 'active')
                    ->exists();
                
                if (!$hasOtherActiveBookings) {
                    Dvd::where('id', $booking->dvd_id)->update(['status' => 'available']);
                }

                $movieId = $booking->dvd->movie_id;
                $wishlistedUsers = \App\Models\User::whereHas('wishlist', function ($query) use ($movieId) {
                    $query->where('movie_id', $movieId)
                        ->whereNull('movie_user_wishlist.notified_at');
                })->get();
                
                if ($wishlistedUsers->isNotEmpty()) {
                    $movie = Movie::find($movieId);
                    foreach ($wishlistedUsers as $u) {
                        $u->notify(new WishlistAvailable($movie));
                        $u->wishlist()->updateExistingPivot($movieId, ['notified_at' => now()]);
                    }
                }
            }
        });

        if ($validated['status'] === 'cancelled') {
            $booking->user->notify(new BookingCancelled($booking));
        }

        return response()->json([
            'message' => 'Статус бронирования успешно обновлен',
            'booking' => $booking,
        ], 200);
    }

    public function destroy(Request $request, Booking $booking)
    {
        $this->authorize('delete', $booking);

        DB::transaction(function () use ($booking) {
            $booking->update(['status' => 'cancelled']);

            $hasOtherActiveBookings = Booking::where('dvd_id', $booking->dvd_id)
                ->where('id', '!=', $booking->id)
                ->where('status', 'active')
                ->exists();
            
            if (!$hasOtherActiveBookings) {
                Dvd::where('id', $booking->dvd_id)->update(['status' => 'available']);
            }

            $movieId = $booking->dvd->movie_id;
            $wishlistedUsers = \App\Models\User::whereHas('wishlist', function ($query) use ($movieId) {
                $query->where('movie_id', $movieId)
                    ->whereNull('movie_user_wishlist.notified_at');
            })->get();
            
            if ($wishlistedUsers->isNotEmpty()) {
                $movie = Movie::find($movieId);
                foreach ($wishlistedUsers as $u) {
                    $u->notify(new WishlistAvailable($movie));
                    $u->wishlist()->updateExistingPivot($movieId, ['notified_at' => now()]);
                }
            }
        });

        $booking->user->notify(new BookingCancelled($booking));

        return response()->json([
            'message' => 'Бронирование успешно отменено',
            'booking' => $booking,
        ], 200);
    }
}