<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class BookingConfirmed extends Notification
{
    use Queueable;

    public function __construct(public Booking $booking) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'booking_confirmed',
            'message' => 'Ваше бронирование DVD успешно создано.',
            'booking_id' => $this->booking->id,
            'dvd_id' => $this->booking->dvd_id,
        ];
    }
}