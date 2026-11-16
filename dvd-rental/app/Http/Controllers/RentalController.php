<?php

namespace App\Http\Controllers;

use App\Services\RentalService;
use Illuminate\Http\Request;

class RentalController extends Controller
{
    public function __construct(
        private RentalService $rentalService
    ) {}

    public function index(Request $request)
    {
        $rentals = $this->rentalService->getUsersRentals($request->user());

        return response()->json($rentals, 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'dvd_id' => 'required|exists:dvds,id',
            'booking_id' => 'nullable|exists:bookings,id',
            'days' => 'nullable|integer|min:1',
        ]);

        $rental = $this->rentalService->issueDvd(
            $validated['user_id'],
            $validated['dvd_id'],
            $validated['booking_id'] ?? null,
            $validated['days'] ?? null
        );

        return response()->json([
            'message' => 'Выдача DVD успешно оформлена',
            'rental' => $rental->load(['user', 'dvd.movie', 'booking']),
        ], 201);
    }

    public function show(Rental $rental, Request $request)
    {
        if (!$this->isAdminOrEmployee($request->user()) && $rental->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Доступ запрещен'], 403);
        }

        return response()->json($rental->load(['user', 'dvd.movie', 'booking']), 200);
    }

    public function update(Request $request, Rental $rental)
    {
        $updatedRental = $this->rentalService->returnDvd($rental);

        return response()->json([
            'message' => 'Возврат DVD успешно оформлен',
            'rental' => $updatedRental,
        ], 200);
    }

    public function destroy(Rental $rental)
    {
        $rental->delete();

        return response()->json([
            'message' => 'Запись аренды удалена',
        ], 200);
    }

    private function isAdminOrEmployee($user): bool
    {
        return $user->roles()->whereIn('name', ['admin', 'employee'])->exists();
    }
}
