<?php

namespace Database\Seeders;

use App\Models\Block;
use App\Models\Booking;
use App\Models\Dvd;
use App\Models\Genre;
use App\Models\Movie;
use App\Models\Rental;
use App\Models\Review;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $employeeRole = Role::firstOrCreate(['name' => 'employee']);
        $clientRole = Role::firstOrCreate(['name' => 'client']);

        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            ['name' => 'Администратор', 'password' => Hash::make('password'), 'phone' => '+79000000001']
        );
        $admin->roles()->sync([$adminRole->id]);

        $employee = User::firstOrCreate(
            ['email' => 'employee@example.com'],
            ['name' => 'Сотрудник', 'password' => Hash::make('password'), 'phone' => '+79000000002']
        );
        $employee->roles()->sync([$employeeRole->id]);

        $client = User::firstOrCreate(
            ['email' => 'client@example.com'],
            ['name' => 'Клиент', 'password' => Hash::make('password'), 'phone' => '+79000000003']
        );
        $client->roles()->sync([$clientRole->id]);

        $clients = User::factory(5)->create();
        foreach ($clients as $c) {
            $c->roles()->sync([$clientRole->id]);
        }

        $genres = ['Боевик', 'Комедия', 'Драма', 'Фантастика', 'Ужасы', 'Триллер', 'Мелодрама', 'Приключения'];
        foreach ($genres as $genreName) {
            Genre::firstOrCreate(['name' => $genreName]);
        }

        $movies = Movie::factory(20)->create();

        $dvds = collect();
        foreach ($movies as $movie) {
            $count = rand(2, 3);
            $movieDvds = Dvd::factory($count)->create(['movie_id' => $movie->id]);
            $dvds = $dvds->merge($movieDvds);
        }

        $returnedDvds = $dvds->where('status', 'available');

        foreach ($returnedDvds->take(10) as $dvd) {
            $randomClient = $clients->random();

            Rental::create([
                'user_id' => $randomClient->id,
                'dvd_id' => $dvd->id,
                'issued_at' => now()->subDays(rand(5, 30)),
                'returned_at' => now()->subDays(rand(1, 4)),
                'status' => 'returned',
                'price' => rand(100, 500),
            ]);

            Review::firstOrCreate(
                ['user_id' => $randomClient->id, 'movie_id' => $dvd->movie_id],
                [
                    'rating' => rand(6, 10),
                    'text' => 'Отличный фильм! Всем рекомендую.',
                    'status' => 'published',
                ]
            );
        }

        foreach ($clients->take(3) as $c) {
            $randomDvd = $dvds->where('status', 'available')->random();
            Booking::create([
                'user_id' => $c->id,
                'dvd_id' => $randomDvd->id,
                'start_date' => now()->addDays(1),
                'end_date' => now()->addDays(5),
                'status' => 'active',
            ]);
        }

        $rentedDvds = $dvds->where('status', 'rented');
        foreach ($rentedDvds->take(5) as $dvd) {
            Rental::create([
                'user_id' => $clients->random()->id,
                'dvd_id' => $dvd->id,
                'issued_at' => now()->subDays(2),
                'status' => 'active',
                'price' => $dvd->price_per_day * 7,
            ]);
        }

        $blockedClient = $clients->last();
        Block::create([
            'user_id' => $blockedClient->id,
            'reason' => 'Просрочка возврата DVD более чем на 14 дней',
            'expires_at' => now()->addDays(30),
        ]);

        $this->command->info('Тестовые данные успешно сгенерированы!');
        $this->command->info('Админ: admin@example.com / password');
        $this->command->info('Сотрудник: employee@example.com / password');
        $this->command->info('Клиент: client@example.com / password');
    }
}
