<?php

namespace Database\Factories;

use App\Models\Genre;
use App\Models\Movie;
use Illuminate\Database\Eloquent\Factories\Factory;

class MovieFactory extends Factory
{
    public function configure(): static
    {
        return $this->afterCreating(function (Movie $movie) {
            if ($movie->genres()->doesntExist()) {
                $genre = Genre::inRandomOrder()->first() ?? Genre::firstOrCreate(['name' => 'Драма']);
                $movie->genres()->attach($genre);
            }
        });
    }

    public function definition(): array
    {
        $faker = \Faker\Factory::create('ru_RU');
        
        return [
            'title' => $faker->unique()->sentence(3),
            'description' => $faker->paragraph(3),
            'release_year' => $faker->numberBetween(1980, 2024),
            'duration' => $faker->numberBetween(80, 180),
        ];
    }
}
