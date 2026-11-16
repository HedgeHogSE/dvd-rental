<?php

namespace App\Http\Controllers;

use App\Models\Block;
use App\Models\Booking;
use App\Models\Dvd;
use App\Models\Movie;
use App\Notifications\BookingCancelled;
use App\Notifications\BookingConfirmed;
use App\Notifications\WishlistAvailable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
            'start_date' => 'required|date_format:Y-m-d|after_or_equal:today',
            'end_date' => 'required|date_format:Y-m-d|after_or_equal:start_date',
        ]);

        try {
            $booking = DB::transaction(function () use ($user, $validated) {

                $dvd = Dvd::where('id', $validated['dvd_id'])->lockForUpdate()->firstOrFail();

                $this->ensurePeriodAvailable($dvd, $validated['start_date'], $validated['end_date']);

                $newBooking = Booking::create([
                    'user_id' => $user->id,
                    'dvd_id' => $dvd->id,
                    'start_date' => $validated['start_date'],
                    'end_date' => $validated['end_date'],
                    'status' => 'active',
                ]);

                $dvd->refreshCirculationStatus();

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

        $this->changeStatus($booking, $validated['status']);

        return response()->json([
            'message' => 'Статус бронирования успешно обновлен',
            'booking' => $booking,
        ], 200);
    }

    public function destroy(Request $request, Booking $booking)
    {
        $this->authorize('delete', $booking);
        $this->changeStatus($booking, 'cancelled');

        return response()->json([
            'message' => 'Бронирование успешно отменено',
            'booking' => $booking,
        ], 200);
    }

    private function changeStatus(Booking $booking, string $status): void
    {
        $cancelled = DB::transaction(function () use ($booking, $status) {
            $dvd = Dvd::query()->lockForUpdate()->findOrFail($booking->dvd_id);
            $booking->refresh();

            if ($booking->status === $status) {
                return false;
            }

            if ($booking->rental()->exists()) {
                throw ValidationException::withMessages([
                    'status' => ['По этому бронированию уже оформлена аренда.'],
                ]);
            }

            if ($status === 'active') {
                if ($booking->end_date < today()->toDateString()) {
                    throw ValidationException::withMessages([
                        'status' => ['Период бронирования уже завершился.'],
                    ]);
                }

                $this->ensurePeriodAvailable($dvd, $booking->start_date, $booking->end_date);
            }

            $booking->update(['status' => $status]);
            $dvd->refreshCirculationStatus();

            if ($status === 'cancelled' && in_array($dvd->status, ['available', 'reserved'], true)
                && !$dvd->overlappingBookings(today()->toDateString(), today()->toDateString())->exists()) {
                $movie = Movie::findOrFail($dvd->movie_id);
                $wishlistedUsers = $movie->wishlistedBy()->wherePivotNull('notified_at')->get();
                foreach ($wishlistedUsers as $user) {
                    $user->notify(new WishlistAvailable($movie));
                    $user->wishlist()->updateExistingPivot($movie->id, ['notified_at' => now()]);
                }
            }

            return $status === 'cancelled';
        });

        if ($cancelled) {
            $booking->user->notify(new BookingCancelled($booking));
        }
    }

    private function ensurePeriodAvailable(Dvd $dvd, string $start, string $end): void
    {
        if ($dvd->status === 'unavailable') {
            throw ValidationException::withMessages(['dvd_id' => ['Этот DVD недоступен для бронирования.']]);
        }

        $conflict = $dvd->overlappingBookings($start, $end)->orderBy('start_date')->first();
        if ($conflict !== null) {
            throw ValidationException::withMessages([
                'start_date' => ["DVD уже забронирован с {$conflict->start_date} по {$conflict->end_date}."],
            ]);
        }

        $rental = $dvd->rentalPeriod();
        if ($rental !== null && ($rental['end_date'] === null || $start <= $rental['end_date'])) {
            $message = $rental['end_date'] === null
                ? 'DVD находится в аренде без подтверждённой даты возврата. Дождитесь возврата.'
                : "DVD в аренде до {$rental['end_date']} включительно.";
            throw ValidationException::withMessages(['start_date' => [$message]]);
        }
    }
}
