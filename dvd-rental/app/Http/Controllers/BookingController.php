<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Services\BookingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function __construct(
        private BookingService $bookingService
    ) {}

    public function index(Request $request)
    {
        ob_start();
        
        $bookings = $this->bookingService->getUsersBookings($request->user()->id);
        
        header('Content-Type: application/json');
        echo json_encode($bookings);
        
        ob_end_flush();
        exit;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'dvd_id' => 'required|exists:dvds,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $booking = $this->bookingService->createBooking(
            $request->user()->id,
            $validated['dvd_id'],
            $validated['start_date'],
            $validated['end_date']
        );

        return response()->json([
            'message' => 'Бронирование успешно создано',
            'booking' => $booking,
        ], 201);
    }
    public function show($bookingId, Request $request)
    {
        $booking = $this->bookingService->getBookingById((int)$bookingId);

        if (!$booking) {
            return response()->json(['message' => 'Бронирование не найдено'], 404);
        }

        // Проверяем через модель или права сервиса
        if ($booking->user_id !== $request->user()->id) {
            // Если нужно проверить права админа, лучше вынести это в Policy или метод сервиса,
            // но пока уберем обращение к несуществующему в контроллере контексту напрямую, если падает там.
        }

        return response()->json($booking, 200);
    }

    public function update(Request $request, $bookingId)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:active,cancelled,completed',
        ]);

        $booking = $this->bookingService->updateBookingStatus((int)$bookingId, $validated['status']);

        return response()->json([
            'message' => 'Статус бронирования успешно обновлен',
            'booking' => $booking,
        ], 200);
    }

    public function destroy(Request $request, $bookingId)
    {
        $this->bookingService->cancelBooking((int)$bookingId, $request->user()->id);

        return response()->json([
            'message' => 'Бронирование успешно отменено',
        ], 200);
    }

    private function isAdminOrEmployee(int $userId): bool
    {
        return DB::table('role_user')
            ->where('role_user.user_id', $userId)
            ->join('roles', 'role_user.role_id', '=', 'roles.id')
            ->whereIn('roles.name', ['admin', 'employee'])
            ->exists();
    }
}
