<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['title', 'description', 'release_year', 'duration', 'genre_id'])]
class Movie extends Model
{
    public function genre(): BelongsTo
    {
        return $this->belongsTo(Genre::class);
    }

    public function dvds(): HasMany
    {
        return $this->hasMany(Dvd::class);
    }
}
