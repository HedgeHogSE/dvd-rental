<?php

namespace Database\Factories;

use App\Models\Genre;
use Illuminate\Database\Eloquent\Factories\Factory;

class MovieFactory extends Factory
{
    public function definition(): array
    {
        $faker = \Faker\Factory::create('ru_RU');
        
        return [
            'title' => $faker->unique()->sentence(3),
            'description' => $faker->paragraph(3),
            'release_year' => $faker->numberBetween(1980, 2024),
            'duration' => $faker->numberBetween(80, 180),
            'genre_id' => Genre::inRandomOrder()->first()?->id ?? Genre::factory(),
        ];
    }
}