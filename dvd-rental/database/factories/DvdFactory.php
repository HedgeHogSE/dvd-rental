<?php

namespace Database\Factories;

use App\Models\Movie;
use Illuminate\Database\Eloquent\Factories\Factory;

class DvdFactory extends Factory
{
    public function definition(): array
    {
        return [
            'movie_id' => Movie::inRandomOrder()->first()?->id ?? Movie::factory(),
            'inventory_number' => 'DVD-' . strtoupper($this->faker->unique()->bothify('???-####')),
            'status' => $this->faker->randomElement(['available', 'available', 'available', 'rented', 'reserved']),
            'price_per_day' => $this->faker->randomFloat(2, 50, 300),
        ];
    }
}