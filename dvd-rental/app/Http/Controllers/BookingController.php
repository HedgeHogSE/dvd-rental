<?php

namespace App\Http\Controllers;

use App\Models\Block;
use App\Models\Booking;
use App\Models\Dvd;
use App\Models\Rental;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    /**
     * Получить список бронирований текущего пользователя
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Если пользователь админ/сотрудник — возвращаем все бронирования, если клиент — только его
        $query = Booking::with(['dvd.movie', 'user']);

        if (!$user->roles()->whereIn('name', ['admin', 'employee'])->exists()) {
            $query->where('user_id', $user->id);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get(), 200);
    }

    /**
     * Создать новое бронирование (с проверками, транзакцией и блокировкой)
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // 7.2: Проверка: заблокирован ли пользователь
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

        // Валидация входных данных
        $validated = $request->validate([
            'dvd_id' => 'required|exists:dvds,id',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        try {
            // 7.3: Выполнение в транзакции для предотвращения race conditions
            $booking = DB::transaction(function () use ($user, $validated) {

                // 7.3: Пессимистичная блокировка записи DVD (lockForUpdate)
                $dvd = Dvd::where('id', $validated['dvd_id'])->lockForUpdate()->firstOrFail();

                // 7.2: Проверка статуса DVD
                if ($dvd->status === 'unavailable') {
                    throw ValidationException::withMessages([
                        'dvd_id' => ['Данный DVD недоступен для бронирования (статус: unavailable).'],
                    ]);
                }

                // 7.2 & 7.3: Проверка пересечения с активными бронированиями
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

                // 7.2: Проверка: не находится ли DVD в активной аренде
                $hasRentalConflict = Rental::where('dvd_id', $dvd->id)
                    ->where('status', 'active')
                    ->whereNull('returned_at')
                    ->exists();

                if ($hasRentalConflict) {
                    throw ValidationException::withMessages([
                        'dvd_id' => ['DVD в данный момент находится в аренде.'],
                    ]);
                }

                // 7.4: Создание бронирования со статусом active
                return Booking::create([
                    'user_id' => $user->id,
                    'dvd_id' => $dvd->id,
                    'start_date' => $validated['start_date'],
                    'end_date' => $validated['end_date'],
                    'status' => 'active',
                ]);
            });

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

    /**
     * Получить детальную информацию о бронировании
     */
    public function show(Request $request, Booking $booking)
    {
        $user = $request->user();

        // Проверка прав: клиент может просматривать только свои бронирования
        if (!$user->roles()->whereIn('name', ['admin', 'employee'])->exists() && $booking->user_id !== $user->id) {
            return response()->json(['message' => 'Доступ запрещен'], 403);
        }

        return response()->json($booking->load(['dvd.movie', 'user']), 200);
    }

    /**
     * 7.4: Обновление статуса бронирования (active, cancelled, completed)
     */
    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:active,cancelled,completed',
        ]);

        $booking->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Статус бронирования успешно обновлен',
            'booking' => $booking,
        ], 200);
    }

    /**
     * Отмена бронирования (перевод статуса в cancelled)
     */
    public function destroy(Request $request, Booking $booking)
    {
        $user = $request->user();

        if (!$user->roles()->whereIn('name', ['admin', 'employee'])->exists() && $booking->user_id !== $user->id) {
            return response()->json(['message' => 'Доступ запрещен'], 403);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Бронирование успешно отменено',
            'booking' => $booking,
        ], 200);
    }
}
