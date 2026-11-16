<?php

namespace App\Notifications;

use App\Models\Rental;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class RentalIssued extends Notification
{
    use Queueable;

    public function __construct(public Rental $rental) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'rental_issued',
            'message' => 'Вам выдан DVD. Приятного просмотра!',
            'rental_id' => $this->rental->id,
            'dvd_id' => $this->rental->dvd_id,
        ];
    }
}