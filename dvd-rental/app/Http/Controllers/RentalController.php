<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Dvd;
use App\Models\Movie;
use App\Models\Rental;
use App\Notifications\RentalIssued;
use App\Notifications\WishlistAvailable;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RentalController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Rental::with(['user', 'dvd.movie', 'booking']);

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
            $query->where('issued_at', '>=', $request->date('from'));
        }
        if ($request->filled('to')) {
            $query->where('issued_at', '<=', $request->date('to'));
        }

        $perPage = max(1, min($request->integer('per_page', 15), 100));

        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate($perPage),
            200
        );
    }

    public function store(Request $request)
    {
        $this->authorize('update', Rental::class);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'dvd_id' => 'required|exists:dvds,id',
            'booking_id' => 'nullable|exists:bookings,id',
            'days' => 'nullable|integer|min:1',
        ]);

        try {
            $rental = DB::transaction(function () use ($validated) {
                $dvd = Dvd::where('id', $validated['dvd_id'])->lockForUpdate()->firstOrFail();

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

                $rentalDays = $validated['days'] ?? 1;

                if (!empty($validated['booking_id'])) {
                    $booking = Booking::findOrFail($validated['booking_id']);

                    if ($booking->status !== 'active') {
                        throw ValidationException::withMessages([
                            'booking_id' => ['Бронирование не является активным.'],
                        ]);
                    }
                    
                    if ($booking->user_id !== (int) $validated['user_id']) {
                        throw ValidationException::withMessages([
                            'booking_id' => ['Бронирование принадлежит другому пользователю.'],
                        ]);
                    }
                    if ($booking->dvd_id !== $dvd->id) {
                        throw ValidationException::withMessages([
                            'booking_id' => ['Бронирование оформлено на другой DVD.'],
                        ]);
                    }

                    $startDate = Carbon::parse($booking->start_date);
                    $endDate = Carbon::parse($booking->end_date);
                    $rentalDays = max(1, $startDate->diffInDays($endDate));

                    $booking->update(['status' => 'completed']);
                }

                $totalPrice = $rentalDays * $dvd->price_per_day;

                $newRental = Rental::create([
                    'user_id' => $validated['user_id'],
                    'dvd_id' => $dvd->id,
                    'booking_id' => $validated['booking_id'] ?? null,
                    'issued_at' => now(),
                    'status' => 'active',
                    'price' => $totalPrice,
                ]);

                $dvd->update(['status' => 'rented']);

                return $newRental;
            });

            $rental->user->notify(new RentalIssued($rental));

            return response()->json([
                'message' => 'Выдача DVD успешно оформлена',
                'rental' => $rental->load(['user', 'dvd.movie', 'booking']),
            ], 201);

        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка при оформлении выдачи: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(Request $request, Rental $rental)
    {
        $this->authorize('view', $rental);
        return response()->json($rental->load(['user', 'dvd.movie', 'booking']), 200);
    }

    public function update(Request $request, Rental $rental)
    {
        $this->authorize('update', $rental);

        if ($rental->status === 'returned') {
            return response()->json([
                'message' => 'Данный DVD уже был возвращен ранее',
            ], 400);
        }

        DB::transaction(function () use ($rental) {
            $dvd = Dvd::where('id', $rental->dvd_id)->lockForUpdate()->firstOrFail();

            $rental->update([
                'status' => 'returned',
                'returned_at' => now(),
            ]);

            $dvd->update(['status' => 'available']);
            
            $movieId = $dvd->movie_id;
            
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

        return response()->json([
            'message' => 'Возврат DVD успешно оформлен',
            'rental' => $rental->fresh()->load(['user', 'dvd.movie']),
        ], 200);
    }

    public function destroy(Request $request, Rental $rental)
    {
        $this->authorize('delete', $rental);

        $rental->delete();

        return response()->json([
            'message' => 'Запись аренды удалена',
        ], 200);
    }
}