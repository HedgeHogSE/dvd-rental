<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Dvd;
use App\Models\Rental;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RentalController extends Controller
{
    /**
     * 9.1: Получить список всех аренд
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Rental::with(['user', 'dvd.movie', 'booking']);

        // Клиент видит только свои аренды, сотрудникам и админам доступны все
        if (!$user->roles()->whereIn('name', ['admin', 'employee'])->exists()) {
            $query->where('user_id', $user->id);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get(), 200);
    }

    /**
     * 9.1 & 9.2: Оформление выдачи DVD
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'dvd_id' => 'required|exists:dvds,id',
            'booking_id' => 'nullable|exists:bookings,id',
            'days' => 'nullable|integer|min:1', // Если выдается без бронирования
        ]);

        try {
            $rental = DB::transaction(function () use ($validated) {
                // Блокируем запись DVD для предотвращения параллельной выдачи
                $dvd = Dvd::where('id', $validated['dvd_id'])->lockForUpdate()->firstOrFail();

                // Проверка доступности диска
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

                // Если оформляется на основе бронирования
                if (!empty($validated['booking_id'])) {
                    $booking = Booking::findOrFail($validated['booking_id']);

                    if ($booking->status !== 'active') {
                        throw ValidationException::withMessages([
                            'booking_id' => ['Бронирование не является активным.'],
                        ]);
                    }

                    // Рассчитываем количество дней из дат бронирования
                    $startDate = Carbon::parse($booking->start_date);
                    $endDate = Carbon::parse($booking->end_date);
                    $rentalDays = max(1, $startDate->diffInDays($endDate));

                    // Завершаем бронирование, так как диск фактически выдан
                    $booking->update(['status' => 'completed']);
                }

                // 9.2: Расчет стоимости (дни × цена за день)
                $totalPrice = $rentalDays * $dvd->price_per_day;

                // 9.2: Создание записи аренды
                $newRental = Rental::create([
                    'user_id' => $validated['user_id'],
                    'dvd_id' => $dvd->id,
                    'booking_id' => $validated['booking_id'] ?? null,
                    'issued_at' => now(),
                    'status' => 'active',
                    'price' => $totalPrice,
                ]);

                // 9.2: Меняем статус DVD на rented
                $dvd->update(['status' => 'rented']);

                return $newRental;
            });

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

    /**
     * 9.1: Детальная информация об аренде
     */
    public function show(Request $request, Rental $rental)
    {
        $user = $request->user();

        if (!$user->roles()->whereIn('name', ['admin', 'employee'])->exists() && $rental->user_id !== $user->id) {
            return response()->json(['message' => 'Доступ запрещен'], 403);
        }

        return response()->json($rental->load(['user', 'dvd.movie', 'booking']), 200);
    }

    /**
     * 9.1 & 9.3: Оформление возврата DVD
     */
    public function update(Request $request, Rental $rental)
    {
        if ($rental->status === 'returned') {
            return response()->json([
                'message' => 'Данный DVD уже был возвращен ранее',
            ], 400);
        }

        DB::transaction(function () use ($rental) {
            $dvd = Dvd::where('id', $rental->dvd_id)->lockForUpdate()->firstOrFail();

            // 9.3: Обновляем статус аренды и фиксируем время возврата
            $rental->update([
                'status' => 'returned',
                'returned_at' => now(),
            ]);

            // 9.3: Возвращаем DVD статус available
            $dvd->update(['status' => 'available']);
        });

        return response()->json([
            'message' => 'Возврат DVD успешно оформлен',
            'rental' => $rental->fresh()->load(['user', 'dvd.movie']),
        ], 200);
    }

    /**
     * Удаление записи об аренде (для администраторов)
     */
    public function destroy(Rental $rental)
    {
        $rental->delete();

        return response()->json([
            'message' => 'Запись аренды удалена',
        ], 200);
    }
}
