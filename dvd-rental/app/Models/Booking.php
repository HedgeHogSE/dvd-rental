<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['user_id', 'dvd_id', 'start_date', 'end_date', 'status'])]
class Booking extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function dvd(): BelongsTo
    {
        return $this->belongsTo(Dvd::class);
    }

    public function rental(): HasOne
    {
        return $this->hasOne(Rental::class);
    }
}
