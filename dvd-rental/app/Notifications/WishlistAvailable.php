<?php

namespace App\Notifications;

use App\Models\Movie;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class WishlistAvailable extends Notification
{
    use Queueable;

    public function __construct(public Movie $movie) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'wishlist_available',
            'message' => "Фильм «{$this->movie->title}» из вашего списка желаемого снова доступен!",
            'movie_id' => $this->movie->id,
        ];
    }
}